import { Router, type IRouter, type Request, type Response } from "express";
import { generateSubmissionId, formatSubmissionId } from "../lib/id";
import {
  searchPersonByEmail,
  createPerson,
  updatePerson,
  createDeal,
  addDealNote,
  getPersonDeals,
} from "../lib/pipedrive";
import { appendRow } from "../lib/sheets";
import { notifySina } from "../lib/notification";
import { logger } from "../lib/logger";
import { validateSubmission, type ValidatedSubmission } from "../lib/validation";
import { env } from "../lib/env";

const router: IRouter = Router();

// ── simple in-memory rate limiter ──────────────────────────────

const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + env.RATE_LIMIT_WINDOW_SEC * 1000 });
    return true;
  }
  if (entry.count >= env.RATE_LIMIT_PER_IP) {
    return false;
  }
  entry.count++;
  return true;
}

// ── Pipedrive custom field keys (from field_keys.json) ─────────

const CF = {
  LEAD_SOURCE: "596982bef32d93cbb3fafd878c3f41a7514772f3",
  POST_TITLE: "14e4d6fccd9cc6852be68c6bd8d6d4447a4eede5",
  USE_TYPE: "aad1458a348bec5e13109849ee9361db66259ea3",
  SUB_USE: "b362a2f12da5d8a15ccf2892bed01e5c61e443db",
  AREA: "9812291f3a05c208c2291bbdb61e4bb3526a47e6",
  SIZE_REQ: "2a7deb1c57d3140a2e8a6c74979dc004318b8c34",
  BUDGET: "f0bef92259333c8d42e62da1ff6cfc8741100094",
  TIMELINE: "55f36919d2f61cf2f351ea66ed05f05ae59747ff",
  CLEAR_HEIGHT: "3e23d10c7fd9ae304a1bf3b68157a1e4d20676ac",
  POWER: "d96d3eeaf9eb8bf01ac1140db48197f0cc823fdc",
  SHIPPING: "7f82947b8eaa042dbaca8566cf00556d0d09e1fd",
  SPECIAL_REQS: "56c5c88a47da71c18f19a9e44311515bc453e650",
  DEAL_TYPE: "de621e093e7d0cb5d071e5503b001b55df37c96b",
  EST_COMMISSION: "e43c543bd54858bd626cb80fad1e88006db6e58c",
  MOTIVATION: "e8f55bb23555c7c27a18e56caa9502557c5cebab",
  URGENCY: "e5a43c7138573edd1c446f9d691d0bbe35483c9f",
  VERIFICATION: "419b8451ecb927d23e3f4aa94f68bc805b6e958b",
  STRATEGY: "a9c5b94d39ac473dd77f743f01d4c47694b10302",
} as const;

// Option ID → value label maps
const LEAD_SOURCE_WEBSITE = "201";

const DEAL_TYPE_MAP: Record<string, string> = {
  lease: "242", purchase: "243", invest: "244", both: "244",
};

const USE_TYPE_MAP: Record<string, string> = {
  industrial: "203", warehouse: "204", auto: "205", automotive: "205",
  "restaurant/food": "206", restaurant: "206", food: "206",
  retail: "207", office: "208", storage: "209", other: "210",
};

const AREA_MAP: Record<string, string> = {
  scarborough: "220", "north york": "221", vaughan: "222",
  mississauga: "223", markham: "224", etobicoke: "225",
};

const TIMELINE_MAP: Record<string, string> = {
  immediately: "227", "1-3 months": "228", "1-3mo": "228",
  "3-6 months": "229", "3-6mo": "229", "just exploring": "230",
};

const SHIPPING_MAP: Record<string, string> = {
  "drive-in": "231", "truck-level": "232", both: "233", none: "234",
};

const SPECIAL_MAP: Record<string, string> = {
  crane: "235", "freezer/cooler": "236", freezer: "236", cooler: "236",
  "heavy power": "237", "outdoor storage": "238",
  ventilation: "239", "grease trap": "240", "office buildout": "241",
};

const SUB_USE_MAP: Record<string, string> = {
  "auto repair": "211", mechanic: "211", "car wash": "212",
  "tire shop": "213", woodworking: "214", "metal fabrication": "215",
  "metal fab": "215", "ghost kitchen": "216", distribution: "217",
  showroom: "218", other: "219",
};

const VERIFICATION_UNVERIFIED = "252";
const STRATEGY_QUALIFY = "255";
const URGENCY_LOW = "249";
const URGENCY_MEDIUM = "250";
const URGENCY_HIGH = "251";

// ── helpers ────────────────────────────────────────────────────

function safeString(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (Array.isArray(v)) return v.filter(Boolean).join(", ");
  return String(v);
}

function firstOf<T>(v: T | T[] | undefined | null, fallback: string = ""): string {
  if (v == null) return fallback;
  if (Array.isArray(v)) return safeString(v[0]) || fallback;
  return safeString(v) || fallback;
}

function lookupMap<T extends Record<string, string>>(
  map: T,
  key: string | undefined | null,
): string | undefined {
  if (!key) return undefined;
  const normalized = key.toLowerCase().trim();
  return map[normalized];
}

function scoreLead(s: ValidatedSubmission): { score: number; priority: string } {
  let score = 0;

  if (s.formType === "advanced-search") {
    const p = s.payload as Record<string, unknown>;

    // Timeline scoring
    const timeline = safeString(p.timeline).toLowerCase();
    if (timeline === "immediately") score += 25;
    else if (timeline === "within 30 days") score += 20;
    else if (timeline.includes("1-3")) score += 15;
    else if (timeline.includes("3-6")) score += 10;

    // Role scoring
    const role = safeString((p as Record<string, unknown>).searchingAs || (p as Record<string, unknown>).role).toLowerCase();
    if (role.includes("investor") || role.includes("business owner") || role.includes("developer")) score += 15;
    else if (role.includes("franchise")) score += 10;
    else if (role.includes("tenant")) score += 5;

    // Budget scoring
    const budgetStr = (safeString((p as Record<string, unknown>).purchaseBudget || (p as Record<string, unknown>).monthlyGross)).toLowerCase();
    if (budgetStr.includes("5m") || budgetStr.includes("5,000,000") || budgetStr.includes("20,000")) score += 25;
    else if (budgetStr.includes("2m") || budgetStr.includes("10,000")) score += 20;
    else if (budgetStr.includes("1m") || budgetStr.includes("5,000")) score += 15;
    else if (budgetStr.includes("500k") || budgetStr.includes("2,500")) score += 10;

    // Contact completeness
    if (safeString(s.contact.email)) score += 5;
    if (safeString(s.contact.phone)) score += 10;
    if (safeString((p as Record<string, unknown>).whatsapp)) score += 10;

    // Criteria completeness
    if ((p as Record<string, unknown>).notes && safeString((p as Record<string, unknown>).notes).length > 30) score += 10;
    if ((p as Record<string, unknown>).locations && Array.isArray((p as Record<string, unknown>).locations) && ((p as Record<string, unknown>).locations as unknown[]).length > 0) score += 10;
    if ((p as Record<string, unknown>).propertyTypes && Array.isArray((p as Record<string, unknown>).propertyTypes) && ((p as Record<string, unknown>).propertyTypes as unknown[]).length > 0) score += 10;
    if ((p as Record<string, unknown>).sizeRequirements) score += 10;
    if ((p as Record<string, unknown>).special && Array.isArray((p as Record<string, unknown>).special) && ((p as Record<string, unknown>).special as unknown[]).length > 0) score += 10;
  }

  return {
    score,
    priority: score >= 75 ? "High" : score >= 50 ? "Medium" : "Standard",
  };
}

function buildSummary(s: ValidatedSubmission, score: number): string {
  const p = s.payload as Record<string, unknown>;

  const name = `${s.contact.firstName} ${s.contact.lastName}`;

  switch (s.formType) {
    case "contact": {
      const inquiry = safeString(p.inquiryType) || "General inquiry";
      const company = safeString(s.contact.company);
      return company ? `${name} | ${company} | ${inquiry}` : `${name} | ${inquiry}`;
    }
    case "advanced-search": {
      const dealType = firstOf(p.searchPurpose, "Lease/Buy");
      const propType = firstOf(p.propertyTypes, "Property");
      const area = firstOf(p.locations, "GTA");
      const timeline = safeString(p.timeline) || "Unknown";
      return `${name} | ${dealType}: ${propType} in ${area} | Timeline: ${timeline} | Score: ${score}`;
    }
    case "quick-search": {
      const mode = safeString(p.mode) || "Lease/Buy";
      const type = safeString(p.type) || "Property";
      const area = safeString(p.area) || "GTA";
      return `${name} | ${mode}: ${type} in ${area}`;
    }
    case "market-report": {
      const areas = safeString(p.areas) || "GTA";
      const role = safeString(p.role) || "Investor";
      return `${name} | ${role} | Areas: ${areas}`;
    }
    default:
      return `${name}`;
  }
}

function buildDealTitle(s: ValidatedSubmission): string {
  const name = `${s.contact.firstName} ${s.contact.lastName}`;
  const p = s.payload as Record<string, unknown>;

  if (s.formType === "advanced-search") {
    const dealType = firstOf(p.searchPurpose, "Lease/Buy");
    const propType = firstOf(p.propertyTypes, "");
    const area = firstOf(p.locations, "");
    const parts = [dealType];
    if (propType) parts.push(propType);
    parts.push(`— ${name}`);
    if (area) parts.push(`(${area})`);
    return parts.join(" ");
  }

  if (s.formType === "quick-search") {
    const mode = safeString(p.mode);
    const type = safeString(p.type);
    const area = safeString(p.area);
    const parts: string[] = [];
    if (mode) parts.push(mode);
    if (type) parts.push(type);
    parts.push(`— ${name}`);
    if (area) parts.push(`(${area})`);
    return parts.join(" ");
  }

  if (s.formType === "contact") {
    const inquiry = safeString(p.inquiryType);
    return `${inquiry || "Inquiry"} — ${name}`;
  }

  return `Website Lead — ${name}`;
}

function buildDealNote(s: ValidatedSubmission, submissionId: string, score: number, priority: string): string {
  const p = s.payload as Record<string, unknown>;
  const lines: string[] = [];

  lines.push(`📥 Website Lead — ${s.formType.replace(/-/g, " ")}`);
  lines.push(`Submitted: ${new Date().toISOString()}`);
  lines.push(`Submission ID: ${submissionId}`);

  if (s.formType === "advanced-search") {
    lines.push(`Client Score: ${score} (${priority})`);
  }

  lines.push("");
  lines.push("─── Contact ───");
  lines.push(`Name: ${s.contact.firstName} ${s.contact.lastName}`);
  if (s.contact.company) lines.push(`Company: ${s.contact.company}`);
  lines.push(`Email: ${s.contact.email}`);
  if (s.contact.phone) lines.push(`Phone: ${s.contact.phone}`);

  // Log any additional fields from the payload as notes
  const skip = new Set(["firstName", "lastName", "company", "email", "phone"]);
  const extras = Object.entries(p).filter(([k]) => !skip.has(k));
  if (extras.length > 0) {
    lines.push("");
    lines.push("─── Details ───");
    for (const [k, v] of extras) {
      if (v != null && v !== "" && !(Array.isArray(v) && v.length === 0)) {
        const label = k.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());
        lines.push(`${label}: ${safeString(v)}`);
      }
    }
  }

  lines.push("");
  lines.push(`⏰ Status: New → Qualify`);

  return lines.join("\n");
}

function buildCustomFields(s: ValidatedSubmission): Record<string, string> {
  const fields: Record<string, string> = {
    [CF.LEAD_SOURCE]: LEAD_SOURCE_WEBSITE,
    [CF.VERIFICATION]: VERIFICATION_UNVERIFIED,
    [CF.STRATEGY]: STRATEGY_QUALIFY,
  };

  const p = s.payload as Record<string, unknown>;

  if (s.formType === "advanced-search") {
    // Deal type
    const dt = firstOf(p.searchPurpose).toLowerCase();
    fields[CF.DEAL_TYPE] = lookupMap(DEAL_TYPE_MAP, dt) || "242";

    // Use type
    const ut = firstOf(p.propertyTypes).toLowerCase();
    fields[CF.USE_TYPE] = lookupMap(USE_TYPE_MAP, ut) || "210";

    // Sub-use
    const su = firstOf(p.intendedUse).toLowerCase();
    if (su) {
      const subVal = lookupMap(SUB_USE_MAP, su);
      if (subVal) fields[CF.SUB_USE] = subVal;
    }

    // Area
    const ar = firstOf(p.locations).toLowerCase();
    const areaVal = lookupMap(AREA_MAP, ar);
    if (areaVal) fields[CF.AREA] = areaVal;

    // Size
    const size = p.sizeRequirements as Record<string, number> | undefined;
    if (size) {
      const min = size.min ? `${size.min.toLocaleString()}` : "";
      const max = size.max ? `${size.max.toLocaleString()}` : "";
      if (min || max) fields[CF.SIZE_REQ] = `${min}–${max} SF`.replace(/^–/, "").replace(/–$/, "");
    }

    // Budget
    const monthlyGross = safeString(p.monthlyGross);
    const leaseRate = safeString(p.leaseRate);
    const purchaseBudget = safeString(p.purchaseBudget);
    if (purchaseBudget) {
      fields[CF.BUDGET] = purchaseBudget;
    } else if (monthlyGross) {
      fields[CF.BUDGET] = `${monthlyGross}/mo${leaseRate ? ` (${leaseRate}/SF)` : ""}`;
    }

    // Timeline
    const tl = safeString(p.timeline).toLowerCase();
    const tlVal = lookupMap(TIMELINE_MAP, tl);
    if (tlVal) fields[CF.TIMELINE] = tlVal;

    // Industrial
    if (p.clearHeight) fields[CF.CLEAR_HEIGHT] = safeString(p.clearHeight);
    if (p.power) fields[CF.POWER] = safeString(p.power);
    const sh = safeString(p.shipping).toLowerCase();
    const shVal = lookupMap(SHIPPING_MAP, sh);
    if (shVal) fields[CF.SHIPPING] = shVal;

    // Special requirements
    const specials = Array.isArray(p.special) ? p.special : [];
    const specialVals = specials
      .map((s: unknown) => lookupMap(SPECIAL_MAP, safeString(s)))
      .filter(Boolean);
    if (specialVals.length > 0) fields[CF.SPECIAL_REQS] = specialVals.join(",");

    // Urgency
    if (tl === "immediately" || safeString(p.urgency).includes("urgent")) {
      fields[CF.URGENCY] = URGENCY_HIGH;
    } else if (tl.includes("1-3") || tl.includes("30 days")) {
      fields[CF.URGENCY] = URGENCY_MEDIUM;
    } else {
      fields[CF.URGENCY] = URGENCY_LOW;
    }
  }

  if (s.formType === "quick-search") {
    const mode = safeString(p.mode).toLowerCase();
    if (mode) fields[CF.DEAL_TYPE] = lookupMap(DEAL_TYPE_MAP, mode) || "242";

    const type = safeString(p.type);
    if (type) fields[CF.USE_TYPE] = lookupMap(USE_TYPE_MAP, type) || "210";

    const area = safeString(p.area);
    if (area) {
      const areaVal = lookupMap(AREA_MAP, area);
      if (areaVal) fields[CF.AREA] = areaVal;
    }

    if (p.size) fields[CF.SIZE_REQ] = safeString(p.size);
  }

  if (s.formType === "contact") {
    const inquiry = safeString(p.inquiryType).toLowerCase();
    if (inquiry.includes("lease")) fields[CF.DEAL_TYPE] = "242";
    else if (inquiry.includes("buy") || inquiry.includes("invest")) fields[CF.DEAL_TYPE] = "243";
  }

  return fields;
}

function buildSheetRow(s: ValidatedSubmission, submissionId: string, pipedrivePersonId: number, pipedriveDealId: number, score: number, priority: string): Array<string | number | null> {
  const p = s.payload as Record<string, unknown>;

  return [
    submissionId,
    new Date().toISOString(),
    s.formType,
    s.contact.firstName || "",
    s.contact.lastName || "",
    s.contact.email || "",
    s.contact.phone || "",
    s.contact.company || "",
    // Search criteria (advanced-search fields)
    s.formType === "advanced-search" ? safeString(p.searchPurpose) : null,
    s.formType === "advanced-search" ? safeString(p.propertyTypes) : null,
    s.formType === "advanced-search" ? safeString(p.intendedUse) : null,
    s.formType === "advanced-search" ? safeString(p.locations) : null,
    s.formType === "advanced-search" ? (p.sizeRequirements ? safeString(p.sizeRequirements) : null) : null,
    s.formType === "advanced-search" ? safeString(p.monthlyGross || p.purchaseBudget || "") : null,
    s.formType === "advanced-search" ? safeString(p.timeline) : null,
    s.formType === "advanced-search" ? safeString(p.clearHeight) : null,
    s.formType === "advanced-search" ? safeString(p.power) : null,
    s.formType === "advanced-search" ? safeString(p.shipping) : null,
    s.formType === "advanced-search" ? safeString(p.special) : null,
    // Quick search fields
    s.formType === "quick-search" ? safeString(p.mode) : null,
    s.formType === "quick-search" ? safeString(p.type) : null,
    s.formType === "quick-search" ? safeString(p.area) : null,
    s.formType === "quick-search" ? safeString(p.size) : null,
    // Contact form fields
    s.formType === "contact" ? safeString(p.inquiryType) : null,
    s.formType === "contact" ? safeString(p.message) : null,
    // Market report fields
    s.formType === "market-report" ? safeString(p.role) : null,
    s.formType === "market-report" ? safeString(p.areas) : null,
    s.formType === "market-report" ? safeString(p.propertyTypes) : null,
    // Pipeline metadata
    pipedrivePersonId,
    pipedriveDealId,
    score || null,
    priority || null,
    "new",
  ];
}

// ── POST /api/submissions ──────────────────────────────────────

router.post("/submissions", async (req: Request, res: Response) => {
  const startTime = Date.now();
  const submissionId = generateSubmissionId();

  try {
    // 1. Rate limiting
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    if (!checkRateLimit(ip)) {
      logger.warn({ ip }, "Rate limit exceeded");
      res.status(429).json({ error: "Too many requests. Please try again later." });
      return;
    }

    // 2. Validate
    const body = req.body as { form_type?: string; payload?: unknown };
    if (!body || typeof body !== "object") {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const validation = validateSubmission(body);
    if (!validation.success) {
      logger.warn({ errors: validation.error }, "Validation failed");
      res.status(400).json({
        error: "Validation failed",
        details: validation.error,
      });
      return;
    }

    const sub = validation.data;

    // 3. Honeypot check
    const p = sub.payload as Record<string, unknown>;
    if (p.website && p.website !== "") {
      logger.info({ submissionId, formType: sub.formType }, "Honeypot triggered — silent discard");
      res.json({ success: true, submission_id: formatSubmissionId(submissionId) });
      return;
    }

    // 4. Person — find or create in Pipedrive
    let personId: number;
    const existingPerson = await searchPersonByEmail(sub.contact.email);

    if (existingPerson) {
      personId = existingPerson.id;
      // Merge missing fields
      const updates: Record<string, string> = {};
      const existingPhone = existingPerson.phone?.[0]?.value;
      if (sub.contact.phone && !existingPhone) updates.phone = sub.contact.phone;
      if (sub.contact.firstName && !existingPerson.name?.includes(sub.contact.firstName)) {
        updates.name = `${sub.contact.firstName} ${sub.contact.lastName}`.trim();
      }
      if (sub.contact.company && !existingPerson.org_name) updates.org_name = sub.contact.company;
      if (Object.keys(updates).length > 0) {
        await updatePerson(personId, updates);
      }
      logger.info({ submissionId, personId, existing: true }, "Person matched");
    } else {
      const person = await createPerson({
        name: `${sub.contact.firstName} ${sub.contact.lastName}`.trim(),
        email: sub.contact.email,
        phone: sub.contact.phone,
        org_name: sub.contact.company,
      });
      personId = person.id;
      logger.info({ submissionId, personId, existing: false }, "Person created");
    }

    // 5. Check for existing active deals (avoid duplicates)
    const existingDeals = await getPersonDeals(personId);
    const activeDeals = existingDeals.filter(
      (d) =>
        d.stage_id !== 13 && // not Firmed
        d.stage_id !== 14,   // not Firmed
    );

    let dealId: number;
    const dealTitle = buildDealTitle(sub);

    if (activeDeals.length > 0 && sub.formType !== "market-report") {
      // Re-use existing active deal — just add a note
      dealId = activeDeals[0].id as number;
      const note = buildDealNote(sub, submissionId, 0, "Standard");
      await addDealNote(dealId, `🌐 Returned via website (${sub.formType})\n\n${note}`);
      logger.info({ submissionId, dealId, reused: true }, "Reused existing deal");
    } else {
      // Create new deal
      const customFields = buildCustomFields(sub);
      const deal = await createDeal({
        title: dealTitle,
        person_id: personId,
        custom_fields: customFields,
      });
      dealId = deal.id;

      // Add detail note
      const { score, priority } = scoreLead(sub);
      const note = buildDealNote(sub, submissionId, score, priority);
      await addDealNote(dealId, note);

      logger.info({ submissionId, dealId, score, priority }, "Deal created");
    }

    // 6. Score
    const { score, priority } = scoreLead(sub);

    // 7. Google Sheet backup
    const sheetRow = buildSheetRow(sub, submissionId, personId, dealId, score, priority);
    try {
      await appendRow("website-leads", sheetRow);
    } catch (sheetErr) {
      logger.error({ err: sheetErr, submissionId }, "Sheet append failed — lead in Pipedrive");
      // Don't fail the request — lead is in Pipedrive
    }

    // 8. Telegram notification
    const summary = buildSummary(sub, score);
    notifySina({
      submissionId: formatSubmissionId(submissionId),
      formType: sub.formType,
      name: `${sub.contact.firstName} ${sub.contact.lastName}`.trim(),
      email: sub.contact.email,
      phone: sub.contact.phone,
      score: s.formType === "advanced-search" ? score : undefined,
      summary,
    }).catch((err) => {
      logger.error({ err, submissionId }, "Notification failed");
    });

    // 9. Log success
    const durationMs = Date.now() - startTime;
    logger.info({
      submissionId,
      formType: sub.formType,
      personId,
      dealId,
      score,
      priority,
      durationMs,
    }, "Submission completed");

    res.json({
      success: true,
      submission_id: formatSubmissionId(submissionId),
      score: sub.formType === "advanced-search" ? score : undefined,
      priority: sub.formType === "advanced-search" ? priority : undefined,
    });

  } catch (err) {
    const durationMs = Date.now() - startTime;
    logger.error({
      submissionId,
      err,
      durationMs,
      formType: (req.body as Record<string, unknown>)?.form_type,
    }, "Submission failed");

    res.status(500).json({
      error: "We encountered an issue processing your submission. Please try again or email sina@sinacommercial.ca.",
    });
  }
});

export default router;
