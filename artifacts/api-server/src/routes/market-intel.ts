/**
 * Market Intelligence endpoint — serves approved content from a JSON file.
 * Can be migrated to Google Sheets later if needed.
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { cacheGet, cacheSet } from "../lib/cache";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const CACHE_KEY = "market_intelligence";

// ── Types ──────────────────────────────────────────────────────

interface MarketIntelItem {
  label: string;
  content: string;
}

interface MarketIntelStat {
  value: string;
  label: string;
}

interface MarketIntelSection {
  id: string;
  title: string;
  summary: string;
  market_area: string;
  property_type: string;
  confidence_level: string;
  source_note: string;
  approved_for_web: boolean;
  items?: MarketIntelItem[];
  stats?: MarketIntelStat[];
}

interface WeeklyNotes {
  title: string;
  content: string;
  approved_for_web: boolean;
}

interface MarketIntelData {
  last_updated: string;
  sections: MarketIntelSection[];
  weekly_notes: WeeklyNotes;
}

// ── File resolution ───────────────────────────────────────────

function resolveIntelPath(): string {
  // In production (bundled esbuild output), the banner sets globalThis.__dirname
  // and data/ is copied to dist/data/ by build.mjs
  const bundled = (globalThis as Record<string, unknown>)["__dirname"];
  if (typeof bundled === "string") {
    const p = resolve(bundled, "data", "market-intelligence.json");
    if (existsSync(p)) return p;
  }
  // Fallback: relative to cwd
  const p = resolve(process.cwd(), "data", "market-intelligence.json");
  if (existsSync(p)) return p;
  // Last resort: relative to source tree (dev mode)
  return resolve(process.cwd(), "artifacts", "api-server", "dist", "data", "market-intelligence.json");
}

function loadMarketIntel(): MarketIntelData | null {
  try {
    const path = resolveIntelPath();
    const raw = readFileSync(path, "utf-8");
    return JSON.parse(raw) as MarketIntelData;
  } catch (err) {
    logger.error({ err }, "Failed to load market-intelligence.json");
    return null;
  }
}

function getMarketIntel(): MarketIntelData | null {
  const cached = cacheGet<MarketIntelData>(CACHE_KEY);
  if (cached) return cached;

  const data = loadMarketIntel();
  if (data) {
    cacheSet(CACHE_KEY, data, CACHE_TTL_MS);
  }
  return data;
}

// ── GET /api/market-intelligence ───────────────────────────────

router.get("/market-intelligence", (_req: Request, res: Response) => {
  try {
    const data = getMarketIntel();

    if (!data) {
      res.json({
        last_updated: null,
        sections: [],
        weekly_notes: null,
        message: "Market intelligence content is being prepared. Check back soon.",
      });
      return;
    }

    // Filter to only approved sections
    const approvedSections = data.sections.filter((s) => s.approved_for_web);
    const approvedNotes =
      data.weekly_notes && data.weekly_notes.approved_for_web
        ? data.weekly_notes
        : null;

    res.json({
      last_updated: data.last_updated,
      sections: approvedSections,
      weekly_notes: approvedNotes,
    });
  } catch (err) {
    logger.error({ err }, "Error serving /api/market-intelligence");
    res.status(500).json({ error: "Unable to load market intelligence." });
  }
});

export default router;
