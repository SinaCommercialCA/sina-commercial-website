/**
 * Instant Match Engine — Kevin
 * Runs on Advanced Search submission to score the lead against
 * all listings and store results in Pipedrive + Telegram.
 *
 * Follows Kevin's MATCH-WORKFLOW.md scoring model:
 *   use×3 | budget×3 | sqft×3 | area×2 | doors×1 | height×1 | power×1
 */

import { readSheet, type SheetRow } from "./sheets";
import { notifySina } from "./notification";
import { logger } from "./logger";
import { env } from "./env";

// ── types ──────────────────────────────────────────────────────

export interface MatchResult {
  listing_id: string;
  title: string;
  city: string;
  area: string;
  size_sqft: number | null;
  deal_type: string;
  use_type: string;
  price_display: string;
  score: number;
  why: string[];
  gaps: string[];
  public: boolean; // approved_for_web
  next_action: string;
}

interface LeadCriteria {
  name: string;
  deal_type: "lease" | "buy" | "both";
  property_types: string[];
  intended_use: string;
  locations: string[];
  size_min: number | null;
  size_max: number | null;
  budget: number | null;
  budget_type: "monthly" | "purchase" | null;
  clear_height: number | null;
  power_amps: number | null;
  truck_doors: boolean;
  drive_in_doors: boolean;
  timeline: string;
}

interface ScoredListing {
  listing: SheetRow;
  score: number;
  why: string[];
  gaps: string[];
  public: boolean;
}

// ── helpers ────────────────────────────────────────────────────

const safeStr = (v: unknown): string => {
  if (v == null) return "";
  return String(v).trim();
};

const safeNum = (v: unknown): number | null => {
  if (v == null || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
};

const boolFlag = (v: unknown): boolean =>
  String(v).toLowerCase() === "true" || String(v) === "1";

const toLower = (s: string) => s.toLowerCase().trim();

// ── parse advanced search payload → LeadCriteria ───────────────

function parseCriteria(payload: Record<string, unknown>, name: string): LeadCriteria {
  const p = payload;

  // Deal type
  const searchPurpose = toLower(safeStr(p.searchPurpose));
  const dealType = searchPurpose.includes("lease") && searchPurpose.includes("buy")
    ? "both"
    : searchPurpose.includes("lease")
      ? "lease"
      : searchPurpose.includes("buy")
        ? "buy"
        : "both";

  // Property types
  const propertyTypes = Array.isArray(p.propertyTypes)
    ? (p.propertyTypes as string[]).map(toLower)
    : safeStr(p.propertyTypes)
        .split(/[,;]/)
        .map(toLower)
        .filter(Boolean);

  // Budget
  const monthlyGross = safeNum(p.monthlyGross);
  const purchaseBudget = safeNum(p.purchaseBudget);
  const budget = monthlyGross ?? purchaseBudget;
  const budgetType = monthlyGross ? "monthly" : purchaseBudget ? "purchase" : null;

  // Size
  const sizeReq = toLower(safeStr(p.sizeRequirements));
  // Try to parse ranges like "3000-5000", "5,000+", "under 10,000"
  let sizeMin: number | null = null;
  let sizeMax: number | null = null;
  const rangeMatch = sizeReq.match(/(\d[\d,]*)\s*[-–to]+\s*(\d[\d,]*)/i);
  const overMatch = sizeReq.match(/over\s+(\d[\d,]*)/i);
  const underMatch = sizeReq.match(/under\s+(\d[\d,]*)/i);
  const plusMatch = sizeReq.match(/(\d[\d,]*)\s*\+/);
  if (rangeMatch) {
    sizeMin = safeNum(rangeMatch[1].replace(/,/g, ""));
    sizeMax = safeNum(rangeMatch[2].replace(/,/g, ""));
  } else if (overMatch) {
    sizeMin = safeNum(overMatch[1].replace(/,/g, ""));
  } else if (underMatch) {
    sizeMax = safeNum(underMatch[1].replace(/,/g, ""));
  } else if (plusMatch) {
    sizeMin = safeNum(plusMatch[1].replace(/,/g, ""));
  } else {
    sizeMin = safeNum(sizeReq);
  }

  // Height
  const clearHeight = safeNum(p.clearHeight);

  // Power
  const power = safeNum(p.power);

  // Doors
  const shipping = toLower(safeStr(p.shipping));
  const truckDoors = shipping.includes("truck") || shipping.includes("both");
  const driveIn = shipping.includes("drive") || shipping.includes("both");

  // Locations
  const locations = Array.isArray(p.locations)
    ? (p.locations as string[]).map(toLower)
    : safeStr(p.locations)
        .split(/[,;]/)
        .map(toLower)
        .filter(Boolean);

  return {
    name,
    deal_type: dealType,
    property_types: propertyTypes,
    intended_use: toLower(safeStr(p.intendedUse)),
    locations,
    size_min: sizeMin,
    size_max: sizeMax,
    budget,
    budget_type: budgetType,
    clear_height: clearHeight,
    power_amps: power,
    truck_doors: truckDoors,
    drive_in_doors: driveIn,
    timeline: toLower(safeStr(p.timeline)),
  };
}

// ── text matching (use / intended_use) ─────────────────────────

const USE_SYNONYMS: Record<string, string[]> = {
  auto: ["auto", "car", "vehicle", "automotive", "mechanic", "body shop", "repair", "tire", "dealership"],
  warehouse: ["warehouse", "storage", "distribution", "logistics"],
  food: ["food", "restaurant", "kitchen", "bakery", "catering", "ghost kitchen"],
  manufacturing: ["manufacturing", "fabrication", "production", "factory", "assembly"],
  retail: ["retail", "store", "showroom", "shop"],
  office: ["office", "professional", "coworking"],
  flex: ["flex", "industrial condo", "light industrial"],
};

function useMatches(listingUse: string, leadUse: string): boolean {
  if (!leadUse || !listingUse) return false;
  const lUse = toLower(listingUse);
  const lLead = toLower(leadUse);

  // Direct substring match
  if (lUse.includes(lLead) || lLead.includes(lUse)) return true;

  // Synonym group match
  for (const [, synonyms] of Object.entries(USE_SYNONYMS)) {
    const inListing = synonyms.some((s) => lUse.includes(s));
    const inLead = synonyms.some((s) => lLead.includes(s));
    if (inListing && inLead) return true;
  }

  return false;
}

// ── area matching ──────────────────────────────────────────────

const GTA_AREAS: Record<string, string[]> = {
  scarborough: ["scarborough", "east york", "w01", "w02"],
  north_york: ["north york", "york", "downsview", "w03", "w04"],
  etobicoke: ["etobicoke", "rexdale", "w05", "w06"],
  vaughan: ["vaughan", "woodbridge", "maple", "concord", "kleinburg"],
  mississauga: ["mississauga", "malton", "streetsville"],
  brampton: ["brampton"],
  markham: ["markham", "unionville", "thornhill"],
  richmond_hill: ["richmond hill", "richmondhill"],
  toronto: ["toronto", "downtown", "north york", "scarborough", "etobicoke", "east york", "york"],
};

function areaMatches(listingCity: string, listingArea: string, leadLocations: string[]): boolean {
  if (leadLocations.length === 0) return true; // no preference → match all

  const lCity = toLower(listingCity);
  const lArea = toLower(listingArea);

  for (const loc of leadLocations) {
    // Direct match
    if (lCity.includes(loc) || lArea.includes(loc) || loc.includes(lCity) || loc.includes(lArea)) {
      return true;
    }
    // GTA synonym match
    const synonyms = GTA_AREAS[loc] || [loc];
    for (const syn of synonyms) {
      if (lCity.includes(syn) || lArea.includes(syn)) return true;
    }
  }

  return false;
}

// ── main scoring ───────────────────────────────────────────────

const MAX_SCORE = 100;

function scoreListing(listing: SheetRow, criteria: LeadCriteria): ScoredListing | null {
  const why: string[] = [];
  const gaps: string[] = [];

  // ── HARD FILTERS ──────────────────────────────────────────

  const lDealType = toLower(safeStr(listing["intent"] || listing["lease_type"]));
  const approved = boolFlag(listing["approved_for_web"]);

  // Filter: deal type
  if (criteria.deal_type === "lease" && lDealType.includes("sale") && !lDealType.includes("lease")) {
    return null; // lead wants lease, listing is sale-only
  }
  if (criteria.deal_type === "buy" && lDealType.includes("lease") && !lDealType.includes("sale")) {
    return null; // lead wants buy, listing is lease-only
  }

  // Filter: property type (rough)
  const lPropType = toLower(safeStr(listing["property_type"] || listing["sheet"]));
  if (criteria.property_types.length > 0) {
    const anyMatch = criteria.property_types.some(
      (pt) => lPropType.includes(pt) || pt.includes(lPropType),
    );
    if (!anyMatch) {
      // Loosen: check use_type too
      const lUse = toLower(safeStr(listing["use_permitted"] || listing["use_type"]));
      const anyUseMatch = criteria.property_types.some(
        (pt) => lUse.includes(pt) || pt.includes(lUse),
      );
      if (!anyUseMatch) return null;
    }
  }

  // Filter: budget (hard 33% over budget)
  if (criteria.budget) {
    const listingPrice = criteria.budget_type === "monthly"
      ? safeNum(listing["lease_rate"]) ?? safeNum(listing["lease_rate_psf"])
      : safeNum(listing["total_price"]) ?? safeNum(listing["asking_price"]) ?? safeNum(listing["sale_price"]);
    if (listingPrice && listingPrice > criteria.budget * 1.33) return null;
  }

  // Filter: sqft (hard 50% outside range)
  const lSqft = safeNum(listing["total_sqft"] || listing["sqft"]);
  if (lSqft && criteria.size_min && lSqft < criteria.size_min * 0.5) return null;
  if (lSqft && criteria.size_max && lSqft > criteria.size_max * 1.5) return null;

  // ── SCORING ───────────────────────────────────────────────

  // Dimensions that matter for this lead
  const useApplies = !!criteria.intended_use;
  const budgetApplies = !!criteria.budget;
  const sqftApplies = !!(criteria.size_min || criteria.size_max);
  const areaApplies = criteria.locations.length > 0;
  const doorsApplies = criteria.truck_doors || criteria.drive_in_doors;
  const heightApplies = !!criteria.clear_height;
  const powerApplies = !!criteria.power_amps;

  // Calculate total weight (redistribute if dimensions don't apply)
  let totalWeight = 0;
  if (useApplies) totalWeight += 3;
  if (budgetApplies) totalWeight += 3;
  if (sqftApplies) totalWeight += 3;
  if (areaApplies) totalWeight += 2;
  if (doorsApplies) totalWeight += 1;
  if (heightApplies) totalWeight += 1;
  if (powerApplies) totalWeight += 1;

  if (totalWeight === 0) {
    // No criteria to score on — score based on basic fit
    totalWeight = 6; // area(2) + use(3) + budget(1)
  }

  let score = 0;
  const maxPossible = Math.max(totalWeight, 6) * 3; // each dimension scored 0-3

  // 1. Use match (×3)
  const lUse = toLower(safeStr(listing["use_permitted"] || listing["use_type"]));
  if (useApplies) {
    if (useMatches(lUse, criteria.intended_use)) {
      score += 9; // 3 × 3
      why.push(`Use match: ${lUse} fits ${criteria.intended_use}`);
    } else if (lUse && criteria.intended_use) {
      score += 3; // generic match
      why.push(`Use: ${lUse} — broad match to ${criteria.intended_use}`);
    }
  } else {
    score += 6; // neutral
  }

  // 2. Budget match (×3)
  if (budgetApplies && criteria.budget) {
    const listingPrice = criteria.budget_type === "monthly"
      ? safeNum(listing["lease_rate"])
      : safeNum(listing["total_price"]) ?? safeNum(listing["asking_price"]) ?? safeNum(listing["sale_price"]);
    if (listingPrice) {
      const ratio = listingPrice / criteria.budget;
      if (ratio <= 1.0) { score += 9; why.push(`Budget: $${listingPrice.toLocaleString()} — under budget`); }
      else if (ratio <= 1.1) { score += 7; why.push(`Budget: $${listingPrice.toLocaleString()} — within 10%`); }
      else if (ratio <= 1.2) { score += 5; why.push(`Budget: $${listingPrice.toLocaleString()} — within 20%`); }
      else if (ratio <= 1.33) { score += 3; why.push(`Budget: $${listingPrice.toLocaleString()} — within 33%`); }
    } else {
      why.push("Budget: price not listed — needs verification");
    }
  } else {
    score += 6;
  }

  // 3. Sqft match (×3)
  if (sqftApplies && lSqft) {
    if (criteria.size_min && criteria.size_max) {
      // Range match
      if (lSqft >= criteria.size_min && lSqft <= criteria.size_max) {
        score += 9; why.push(`Sqft: ${lSqft.toLocaleString()} in range (${criteria.size_min.toLocaleString()}-${criteria.size_max.toLocaleString()})`);
      } else if (lSqft >= criteria.size_min * 0.85 && lSqft <= criteria.size_max * 1.15) {
        score += 5; why.push(`Sqft: ${lSqft.toLocaleString()} near range`);
      } else {
        score += 2; why.push(`Sqft: ${lSqft.toLocaleString()} — outside range`);
        gaps.push(`Sqft ${lSqft.toLocaleString()} vs requested ${criteria.size_min.toLocaleString()}-${criteria.size_max.toLocaleString()}`);
      }
    } else if (criteria.size_min) {
      if (lSqft >= criteria.size_min && lSqft <= criteria.size_min * 1.3) {
        score += 9; why.push(`Sqft: ${lSqft.toLocaleString()} meets minimum ${criteria.size_min.toLocaleString()}`);
      } else if (lSqft >= criteria.size_min * 0.7) {
        score += 5; why.push(`Sqft: ${lSqft.toLocaleString()} close to minimum ${criteria.size_min.toLocaleString()}`);
      } else {
        score += 2; why.push(`Sqft: ${lSqft.toLocaleString()} — under minimum`);
        gaps.push(`Sqft ${lSqft.toLocaleString()} vs min ${criteria.size_min.toLocaleString()}`);
      }
    } else if (criteria.size_max) {
      if (lSqft <= criteria.size_max) {
        score += 9; why.push(`Sqft: ${lSqft.toLocaleString()} fits maximum ${criteria.size_max.toLocaleString()}`);
      } else {
        score += 3; why.push(`Sqft: ${lSqft.toLocaleString()} — over maximum`);
        gaps.push(`Sqft ${lSqft.toLocaleString()} vs max ${criteria.size_max.toLocaleString()}`);
      }
    }
  } else {
    score += 6;
    if (lSqft) why.push(`Sqft: ${lSqft.toLocaleString()} (no req from lead)`);
  }

  // 4. Area match (×2)
  const lCity = safeStr(listing["municipality"]);
  const lArea = safeStr(listing["area"]);
  if (areaApplies) {
    if (areaMatches(lCity, lArea, criteria.locations)) {
      score += 6; // 3 × 2
      why.push(`Area: ${lCity || lArea} — matches requested`);
    } else {
      score += 2;
      why.push(`Area: ${lCity || lArea} — outside requested locations`);
      gaps.push(`Location ${lCity || lArea} not in requested areas`);
    }
  } else {
    score += 4; // neutral
    if (lCity || lArea) why.push(`Location: ${lCity || lArea}`);
  }

  // 5. Doors (×1)
  if (doorsApplies) {
    if (criteria.truck_doors) {
      const hasTruck = boolFlag(listing["truck_level_doors"]);
      if (hasTruck) { score += 3; why.push("Truck-level door: yes"); }
      else { gaps.push("No truck-level door"); }
    }
    if (criteria.drive_in_doors) {
      const hasDrive = boolFlag(listing["drive_in_doors"]);
      if (hasDrive) { score += 3; why.push("Drive-in door: yes"); }
      else { gaps.push("No drive-in door"); }
    }
  }

  // 6. Clear height (×1)
  if (heightApplies && criteria.clear_height) {
    const lHeight = safeNum(listing["clear_height"]);
    if (lHeight && lHeight >= criteria.clear_height) {
      score += 3; why.push(`Clear height: ${lHeight}ft — meets ${criteria.clear_height}ft`);
    } else if (lHeight) {
      gaps.push(`Clear height ${lHeight}ft vs requested ${criteria.clear_height}ft`);
    } else {
      gaps.push("Clear height unknown");
    }
  }

  // 7. Power (×1)
  if (powerApplies && criteria.power_amps) {
    const lPower = safeNum(listing["power_amps"]);
    if (lPower && lPower >= criteria.power_amps) {
      score += 3; why.push(`Power: ${lPower}A — meets ${criteria.power_amps}A`);
    } else if (lPower) {
      gaps.push(`Power ${lPower}A vs requested ${criteria.power_amps}A`);
    } else {
      gaps.push("Power info unknown");
    }
  }

  // Normalize to 0-100
  const normalized = Math.round((score / maxPossible) * MAX_SCORE);
  const cappedScore = Math.min(normalized, MAX_SCORE);

  return {
    listing,
    score: cappedScore,
    why,
    gaps,
    public: approved,
  };
}

// ── price display helper ───────────────────────────────────────

function formatPrice(listing: SheetRow): string {
  const lDealType = toLower(safeStr(listing["intent"] || listing["lease_type"]));
  if (lDealType.includes("lease")) {
    const rate = safeNum(listing["lease_rate"]);
    const psf = safeNum(listing["lease_rate_psf"]);
    if (rate && psf) return `$${rate.toLocaleString()}/mo ($${psf}/SF Net)`;
    if (rate) return `$${rate.toLocaleString()}/mo`;
    if (psf) return `$${psf}/SF Net`;
    return "Price not listed";
  }
  const total = safeNum(listing["total_price"]) ?? safeNum(listing["asking_price"]) ?? safeNum(listing["sale_price"]);
  if (total) {
    if (total >= 1_000_000) return `$${(total / 1_000_000).toFixed(2)}M`;
    return `$${total.toLocaleString()}`;
  }
  return "Price not listed";
}

// ── next action recommendation ─────────────────────────────────

function recommendAction(topScore: number, publicCount: number, hasUrgentTimeline: boolean): string {
  if (hasUrgentTimeline && topScore >= 75 && publicCount > 0) {
    return "Urgent — push showing on top public match today";
  }
  if (topScore >= 75 && publicCount > 0) {
    return "Send curated matches to lead within 24h";
  }
  if (topScore >= 65 && publicCount > 0) {
    return "Send top match to lead; ask if criteria can expand";
  }
  if (topScore >= 65) {
    return "Review internal matches — may need to source off-market";
  }
  if (topScore >= 50) {
    return "Nurture — ask lead if they can adjust budget, area, or size";
  }
  return "Low match confidence — qualify lead further before spending time";
}

// ── build Pipedrive note ───────────────────────────────────────

function buildMatchNote(
  matches: ScoredListing[],
  leadName: string,
  criteria: LeadCriteria,
): string {
  const lines: string[] = [];
  lines.push("🤖 Kevin Instant Match Results");
  lines.push(`Lead: ${leadName}`);
  lines.push(`Type: ${criteria.deal_type.toUpperCase()} | Timeline: ${criteria.timeline || "Unknown"}`);
  if (criteria.intended_use) lines.push(`Use: ${criteria.intended_use}`);
  if (criteria.locations.length) lines.push(`Areas: ${criteria.locations.join(", ")}`);
  if (criteria.budget) {
    lines.push(`Budget: $${criteria.budget.toLocaleString()}${criteria.budget_type === "monthly" ? "/mo" : ""}`);
  }
  if (criteria.size_min || criteria.size_max) {
    lines.push(`Size: ${criteria.size_min ? criteria.size_min.toLocaleString() : "any"}–${criteria.size_max ? criteria.size_max.toLocaleString() : "any"} SF`);
  }
  lines.push("");

  if (matches.length === 0) {
    lines.push("❌ No matches found in current inventory.");
    lines.push("");
    lines.push("Suggested adjustments:");
    if (criteria.locations.length) lines.push(`→ Expand area beyond ${criteria.locations.join(", ")}`);
    if (criteria.budget) lines.push(`→ Increase budget tolerance`);
    if (criteria.size_min || criteria.size_max) lines.push(`→ Widen size range`);
    lines.push("→ Source off-market for this criteria set");
  } else {
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      const l = m.listing;
      const badge = m.score >= 80 ? "🟢 HIGH" : m.score >= 65 ? "🟡 MEDIUM" : "🟠 LOW";
      const publicBadge = m.public ? "🌐 Public" : "🔒 Internal";
      const listingId = safeStr(l["listing_id"]);
      const title = safeStr(l["title"]);
      const city = safeStr(l["municipality"]);
      const area = safeStr(l["area"]);
      const sqft = safeNum(l["total_sqft"] || l["sqft"]);
      const use = safeStr(l["use_permitted"] || l["use_type"]);

      lines.push(`━━━ #${i + 1}  Score: ${m.score} ${badge} ${publicBadge} ━━━`);
      lines.push(`ID: ${listingId} | ${title || `${use} in ${city}`}`);
      lines.push(`Location: ${area || city} | Sqft: ${sqft ? sqft.toLocaleString() : "?"} | Price: ${formatPrice(l)}`);
      lines.push(`Type: ${use || "N/A"} | Deal: ${toLower(safeStr(l["intent"] || l["lease_type"]))}`);
      if (m.why.length) lines.push(`✅ ${m.why.join(" | ")}`);
      if (m.gaps.length) lines.push(`⚠️ ${m.gaps.join(" | ")}`);
      lines.push("");
    }
  }

  lines.push(`Action: ${recommendAction(matches[0]?.score ?? 0, matches.filter((m) => m.public).length, criteria.timeline.includes("immediately"))}`);

  return lines.join("\n");
}

// ── build Telegram match summary ───────────────────────────────

function buildMatchTelegram(
  matches: ScoredListing[],
  leadName: string,
  submissionId: string,
  criteria: LeadCriteria,
): string {
  const topScore = matches[0]?.score ?? 0;
  const publicMatchCount = matches.filter((m) => m.public).length;

  const lines: string[] = [];
  lines.push(`🔬 *Kevin matched this website lead*`);
  lines.push(`━━━━━━━━━━━━━━━━━━`);
  lines.push(`*${leadName}* | 🆔 \`${submissionId}\``);
  lines.push(`${criteria.deal_type.toUpperCase()} | ${criteria.intended_use || "No use specified"}`);
  if (criteria.locations.length) lines.push(`Areas: ${criteria.locations.join(", ")}`);
  if (criteria.budget) lines.push(`Budget: $${criteria.budget.toLocaleString()}${criteria.budget_type === "monthly" ? "/mo" : ""}`);
  lines.push(`Top score: ${topScore}/100 | Public matches: ${publicMatchCount}`);
  lines.push("");

  if (matches.length === 0) {
    lines.push("❌ No matches found.");
  } else {
    const top3 = matches.slice(0, 3);
    for (let i = 0; i < top3.length; i++) {
      const m = top3[i];
      const l = m.listing;
      const listingId = safeStr(l["listing_id"]);
      const title = safeStr(l["title"]);
      const city = safeStr(l["municipality"]);
      const badge = m.public ? "🌐" : "🔒";
      lines.push(`${badge} *${listingId}* — ${title || city} | ${formatPrice(l)} | Score: ${m.score}`);
      if (m.why.length) lines.push(`   ✅ ${m.why[0]}`);
      if (m.gaps.length) lines.push(`   ⚠️ ${m.gaps[0]}`);
    }
  }

  const action = recommendAction(topScore, publicMatchCount, criteria.timeline.includes("immediately"));
  if (action) {
    lines.push("");
    lines.push(`📋 ${action}`);
  }

  return lines.join("\n");
}

// ── main entry point ───────────────────────────────────────────

export async function runInstantMatch(
  submissionId: string,
  payload: Record<string, unknown>,
  leadName: string,
  leadId: number,
): Promise<void> {
  const startTime = Date.now();

  try {
    const criteria = parseCriteria(payload, leadName);

    // Load all listings from all 3 tabs
    let allRows: SheetRow[] = [];
    try {
      const [industrial, commercial, business] = await Promise.all([
        readSheet("industrial_listings"),
        readSheet("commercial_retail_listings"),
        readSheet("business_listings"),
      ]);
      allRows = [...industrial, ...commercial, ...business];
    } catch (err) {
      logger.error({ err, submissionId }, "Instant match: failed to load listings");
      return;
    }

    logger.info({ submissionId, listingCount: allRows.length, criteria }, "Instant match: loaded listings");

    // Score all listings
    const scored: ScoredListing[] = [];
    for (const row of allRows) {
      const result = scoreListing(row, criteria);
      if (result && result.score >= 40) {
        scored.push(result);
      }
    }

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Top 5
    const top5 = scored.slice(0, 5);

    // If top score < 50, still show top 3 with explanation
    const finalMatches = top5.length > 0
      ? top5
      : scored.filter((s) => s.score >= 30).slice(0, 3);

    logger.info({
      submissionId,
      totalScored: scored.length,
      topScore: finalMatches[0]?.score ?? 0,
      matchCount: finalMatches.length,
      durationMs: Date.now() - startTime,
    }, "Instant match complete");

    // Build Pipedrive note
    const note = buildMatchNote(finalMatches, leadName, criteria);

    // Send Telegram (use notifySina for the match update)
    if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
      try {
        const telegramText = buildMatchTelegram(finalMatches, leadName, submissionId, criteria);
        await fetch(
          `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: env.TELEGRAM_CHAT_ID,
              text: telegramText,
              parse_mode: "Markdown",
              disable_web_page_preview: true,
            }),
          },
        );
        logger.info({ submissionId }, "Instant match Telegram sent");
      } catch (tgErr) {
        logger.error({ err: tgErr, submissionId }, "Instant match Telegram failed");
      }
    }

    // Add note to Pipedrive lead
    const { addLeadNote } = await import("./pipedrive");
    await addLeadNote(leadId, note);

    logger.info({
      submissionId,
      leadId,
      matchCount: finalMatches.length,
      topScore: finalMatches[0]?.score ?? 0,
      durationMs: Date.now() - startTime,
    }, "Instant match saved to Pipedrive");

  } catch (err) {
    logger.error({ err, submissionId, durationMs: Date.now() - startTime }, "Instant match failed");
    // Non-blocking: do not throw
  }
}
