/**
 * Validation schemas for all 4 website form types.
 * Uses Zod for runtime validation. Schemas are intentionally permissive
 * on the payload (accept all form shapes) but strict on the contact envelope.
 */

import * as zod from "zod";

// ── Contact ────────────────────────────────────────────────────

const contactEnvelope = zod.object({
  firstName: zod.string().max(100).optional().default(""),
  lastName: zod.string().max(100).optional().default(""),
  name: zod.string().max(200).optional().default(""),
  company: zod.string().max(200).optional().default(""),
  email: zod.string().email().max(255).optional().default(""),
  phone: zod.string().max(30).optional().default(""),
});

// ── Form-specific schemas ──────────────────────────────────────

const contactFormSchema = contactEnvelope.extend({
  inquiryType: zod.string().max(200).optional().default(""),
  message: zod.string().max(5000).optional().default(""),
});

const advancedSearchSchema = contactEnvelope.extend({
  // Step 1 — Search Purpose
  searchPurpose: zod.array(zod.string()).optional().default([]),
  searchingAs: zod.string().optional().default(""),
  urgency: zod.string().optional().default(""),

  // Step 2 — Property Type
  propertyTypes: zod.array(zod.string()).optional().default([]),

  // Step 3 — Intended Use
  intendedUse: zod.array(zod.string()).optional().default([]),
  useDescription: zod.string().max(5000).optional().default(""),

  // Step 4 — Location
  locations: zod.array(zod.string()).optional().default([]),
  preferredCorridor: zod.string().max(500).optional().default(""),
  maxTravelDistance: zod.string().max(200).optional().default(""),

  // Step 5 — Size
  sizeRequirements: zod
    .object({
      min: zod.number().optional(),
      max: zod.number().optional(),
      office: zod.number().optional(),
    })
    .optional()
    .default({}),

  // Step 6 — Budget
  monthlyGross: zod.string().optional().default(""),
  leaseRate: zod.string().optional().default(""),
  purchaseBudget: zod.string().optional().default(""),
  downPayment: zod.string().optional().default(""),
  targetReturn: zod.string().optional().default(""),

  // Step 7 — Industrial
  clearHeight: zod.string().optional().default(""),
  power: zod.string().optional().default(""),
  shipping: zod.string().optional().default(""),
  special: zod.array(zod.string()).optional().default([]),

  // Step 8 — Retail
  retailRequirements: zod.array(zod.string()).optional().default([]),

  // Step 9 — Investment
  investmentProfile: zod
    .object({
      strategy: zod.array(zod.string()).optional(),
      tenantProfile: zod.array(zod.string()).optional(),
      riskProfile: zod.string().optional(),
      financing: zod.string().optional(),
    })
    .optional()
    .default({}),

  // Step 10 — Timeline
  timeline: zod.string().optional().default(""),

  // Step 11 — Contact extras
  whatsapp: zod.string().max(30).optional().default(""),
  preferredContact: zod.string().optional().default(""),
  bestTime: zod.string().optional().default(""),
  notifications: zod.array(zod.string()).optional().default([]),
  notes: zod.string().max(5000).optional().default(""),
});

const quickSearchSchema = contactEnvelope.extend({
  mode: zod.string().optional().default(""),
  type: zod.string().optional().default(""),
  area: zod.string().max(500).optional().default(""),
  size: zod.string().max(500).optional().default(""),
});

const marketReportSchema = contactEnvelope.extend({
  role: zod.string().optional().default(""),
  areas: zod.string().max(500).optional().default(""),
  propertyTypes: zod.string().max(500).optional().default(""),
});

// ── Submission wrapper ─────────────────────────────────────────

const formTypeEnum = zod.enum([
  "contact",
  "advanced-search",
  "quick-search",
  "market-report",
]);

export type FormType = zod.infer<typeof formTypeEnum>;

export interface ValidatedSubmission {
  formType: FormType;
  contact: {
    firstName: string;
    lastName: string;
    company: string;
    email: string;
    phone: string;
  };
  payload: Record<string, unknown>;
}

export function validateSubmission(body: {
  form_type?: string;
  payload?: unknown;
}): { success: true; data: ValidatedSubmission } | { success: false; error: string[] } {
  // Validate form_type
  const formTypeResult = formTypeEnum.safeParse(body.form_type);
  if (!formTypeResult.success) {
    return {
      success: false,
      error: [`Invalid form_type: ${body.form_type}. Must be one of: contact, advanced-search, quick-search, market-report`],
    };
  }

  const formType = formTypeResult.data;
  const raw = body.payload;

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { success: false, error: ["payload must be a JSON object"] };
  }

  // Basic anti-spam: reject payloads containing URLs in name fields
  const hasInjection = checkInjection(raw as Record<string, unknown>);
  if (hasInjection) {
    return { success: false, error: [hasInjection] };
  }

  // Parse with appropriate schema (lenient — just extract what's there)
  let parsed: zod.SafeParseReturnType<unknown, Record<string, unknown>>;

  switch (formType) {
    case "contact":
      parsed = contactFormSchema.safeParse(raw);
      break;
    case "advanced-search":
      parsed = advancedSearchSchema.safeParse(raw);
      break;
    case "quick-search":
      parsed = quickSearchSchema.safeParse(raw);
      break;
    case "market-report":
      parsed = marketReportSchema.safeParse(raw);
      break;
  }

  if (!parsed.success) {
    const errors = parsed.error.issues.map(
      (i) => `${i.path.join(".")}: ${i.message}`,
    );
    return { success: false, error: errors };
  }

  const data = parsed.data as Record<string, unknown>;

  return {
    success: true,
    data: {
      formType,
      contact: resolveContact(data),
      payload: data,
    },
  };
}

function resolveContact(data: Record<string, unknown>): {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
} {
  let firstName = String(data.firstName || "");
  let lastName = String(data.lastName || "");
  const name = String(data.name || "");

  // If firstName/lastName are empty but name is provided, split name
  if (!firstName && !lastName && name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      firstName = parts[0];
    } else if (parts.length >= 2) {
      firstName = parts[0];
      lastName = parts.slice(1).join(" ");
    }
  }

  return {
    firstName,
    lastName,
    company: String(data.company || ""),
    email: String(data.email || ""),
    phone: String(data.phone || ""),
  };
}

function checkInjection(data: Record<string, unknown>): string | null {
  const nameFields = ["firstName", "lastName", "company"];
  for (const field of nameFields) {
    const value = String(data[field] || "");
    if (/https?:\/\/|\[url|<script|<iframe/i.test(value)) {
      return `${field} contains suspicious content`;
    }
  }
  return null;
}
