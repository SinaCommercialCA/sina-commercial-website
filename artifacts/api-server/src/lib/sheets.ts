/**
 * Google Sheets read + append — minimal JWT-based access token + REST API.
 * Zero additional npm dependencies. Uses Node built-in crypto.
 */

import crypto from "node:crypto";
import { env } from "./env";
import { logger } from "./logger";

export interface SheetRow {
  [column: string]: string | number | null;
}

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

let _cachedSa: ServiceAccount | null = null;
let _cachedToken: { value: string; expiresAt: number } | null = null;

function getServiceAccount(): ServiceAccount {
  if (_cachedSa) return _cachedSa;
  const raw = env.GOOGLE_SERVICE_ACCOUNT_JSON;
  try {
    const parsed = JSON.parse(raw);
    _cachedSa = {
      client_email: parsed.client_email,
      private_key: parsed.private_key,
    };
  } catch {
    // maybe it's a file path
    const fs = await_import_fs();
    const content = fs.readFileSync(raw, "utf-8");
    const parsed = JSON.parse(content);
    _cachedSa = {
      client_email: parsed.client_email,
      private_key: parsed.private_key,
    };
  }
  return _cachedSa;
}

function base64url(buffer: Buffer | string): string {
  const b = typeof buffer === "string" ? Buffer.from(buffer) : buffer;
  return b.toString("base64url");
}

async function getAccessToken(): Promise<string> {
  if (_cachedToken && Date.now() < _cachedToken.expiresAt - 60_000) {
    return _cachedToken.value;
  }

  const sa = getServiceAccount();
  const now = Math.floor(Date.now() / 1000);

  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }),
  );

  const sign = crypto.createSign("RSA-SHA256");
  sign.update(`${header}.${claim}`);
  const signature = sign.sign(sa.private_key, "base64url");

  const jwt = `${header}.${claim}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    const body = await res.text();
    logger.error({ status: res.status, body }, "Failed to get Google access token");
    throw new Error(`Google auth failed: ${res.status}`);
  }

  const data = (await res.json()) as { access_token: string };
  _cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + 3500_000, // 58 min
  };

  return data.access_token;
}

// ── Sheets API ─────────────────────────────────────────────────

/**
 * Append a row to a specific sheet tab.
 * Uses the Sheets v4 REST API directly.
 */
export async function appendRow(
  tabName: string,
  values: Array<string | number | null>,
): Promise<void> {
  const token = await getAccessToken();
  const sheetId = env.GOOGLE_SHEET_ID;
  const range = encodeURIComponent(`'${tabName}'!A:ZZ`);

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;

  const body = JSON.stringify({ values: [values] });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
  });

  if (!res.ok) {
    const errBody = await res.text();
    logger.error({ status: res.status, body: errBody }, "Google Sheets append failed");
    throw new Error(`Sheets API error: ${res.status}`);
  }

  logger.info({ tabName, count: values.length }, "Sheets row appended");
}

/**
 * Read all rows from a sheet tab. First row is used as header.
 * Returns an array of objects keyed by column header.
 */
export async function readSheet(tabName: string): Promise<SheetRow[]> {
  const token = await getAccessToken();
  const sheetId = env.GOOGLE_SHEET_ID;
  const range = encodeURIComponent(`'${tabName}'`);

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errBody = await res.text();
    logger.error({ status: res.status, body: errBody, tabName }, "Google Sheets read failed");
    throw new Error(`Sheets read error: ${res.status}`);
  }

  const data = (await res.json()) as {
    values?: (string | number | null)[][];
  };

  const rows = data.values || [];
  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => String(h ?? "").trim().toLowerCase());
  const result: SheetRow[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row: SheetRow = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = rows[i]?.[j] ?? null;
    }
    result.push(row);
  }

  logger.info({ tabName, rows: result.length }, "Sheets read complete");
  return result;
}

// ── lazy fs import (only used if SA JSON is a file path) ───────

function await_import_fs(): typeof import("node:fs") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("node:fs");
}
