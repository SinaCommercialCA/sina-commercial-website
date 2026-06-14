/**
 * Pipedrive API client — minimal fetch-based integration.
 * Uses v1 API with query-param token auth.
 */

import { env } from "./env";
import { logger } from "./logger";

const BASE = env.PIPEDRIVE_BASE_URL.replace(/\/+$/, "");
const TOKEN = env.PIPEDRIVE_API_TOKEN;

// ── types ──────────────────────────────────────────────────────

export interface PipedrivePerson {
  id: number;
  name: string;
  email: Array<{ value: string; primary: boolean }>;
  phone: Array<{ value: string; primary: boolean }>;
}

export interface PipedriveDeal {
  id: number;
  title: string;
  person_id: { value: number };
  stage_id: number;
  [key: string]: unknown;
}

export interface PipedriveLead {
  id: string;
  title: string;
  person_id: number | null;
  source_name: string;
  [key: string]: unknown;
}

// ── helpers ────────────────────────────────────────────────────

function url(path: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${BASE}${path}${sep}api_token=${TOKEN}`;
}

async function pipedriveFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = await res.json();

  if (!res.ok) {
    logger.error({ status: res.status, body, path }, "Pipedrive API error");
    throw new Error(`Pipedrive API error: ${res.status} — ${JSON.stringify(body)}`);
  }

  return body as T;
}

// ── person ops ─────────────────────────────────────────────────

interface PersonSearchResponse {
  success: boolean;
  data: {
    items: Array<{ item: PipedrivePerson }>;
  };
}

export async function searchPersonByEmail(email: string): Promise<PipedrivePerson | null> {
  const encoded = encodeURIComponent(email);
  const result = await pipedriveFetch<PersonSearchResponse>(
    `/persons/search?term=${encoded}&search_by_email=1`,
  );
  if (result.data?.items?.length > 0) {
    return result.data.items[0].item;
  }
  return null;
}

interface PersonCreateResponse {
  success: boolean;
  data: PipedrivePerson;
}

export async function createPerson(data: {
  name: string;
  email: string;
  phone?: string;
}): Promise<PipedrivePerson> {
  const result = await pipedriveFetch<PersonCreateResponse>("/persons", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return result.data;
}

export async function updatePerson(
  id: number,
  data: { name?: string; email?: string; phone?: string },
): Promise<PipedrivePerson> {
  const result = await pipedriveFetch<PersonCreateResponse>(`/persons/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return result.data;
}

// ── deal ops ───────────────────────────────────────────────────

interface DealCreateResponse {
  success: boolean;
  data: PipedriveDeal;
}

const PIPELINE_ID = 2; // Real Estate pipeline
const STAGE_CONTACT_MADE = 7;

export async function createDeal(params: {
  title: string;
  person_id: number;
  custom_fields: Record<string, unknown>;
}): Promise<PipedriveDeal> {
  const result = await pipedriveFetch<DealCreateResponse>("/deals", {
    method: "POST",
    body: JSON.stringify({
      title: params.title,
      person_id: params.person_id,
      pipeline_id: PIPELINE_ID,
      stage_id: STAGE_CONTACT_MADE,
      ...params.custom_fields,
    }),
  });
  return result.data;
}

export async function getPersonDeals(personId: number): Promise<PipedriveDeal[]> {
  const result = await pipedriveFetch<{ success: boolean; data: PipedriveDeal[] }>(
    `/persons/${personId}/deals`,
  );
  return result.data || [];
}

// ── notes ──────────────────────────────────────────────────────

interface NoteCreateResponse {
  success: boolean;
  data: { id: number };
}

export async function addDealNote(dealId: number, content: string): Promise<number> {
  const result = await pipedriveFetch<NoteCreateResponse>("/notes", {
    method: "POST",
    body: JSON.stringify({
      deal_id: dealId,
      content,
      pinned_to_deal_flag: 0,
    }),
  });
  return result.data.id;
}

// ── lead ops ───────────────────────────────────────────────────

interface LeadCreateResponse {
  success: boolean;
  data: PipedriveLead;
}

export async function createLead(data: {
  title: string;
  person_id: number;
  label_ids?: string[];
  value?: { amount: number; currency: string };
}): Promise<PipedriveLead> {
  const result = await pipedriveFetch<LeadCreateResponse>("/leads", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return result.data;
}

export async function addLeadNote(leadId: string, content: string): Promise<number> {
  const result = await pipedriveFetch<NoteCreateResponse>("/notes", {
    method: "POST",
    body: JSON.stringify({
      lead_id: leadId,
      content,
    }),
  });
  return result.data.id;
}
