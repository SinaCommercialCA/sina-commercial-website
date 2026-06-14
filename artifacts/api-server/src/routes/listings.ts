/**
 * Public listing endpoints — read-only, approved_for_web=true only.
 * No internal/private fields are ever exposed through these routes.
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { readSheet, type SheetRow } from "../lib/sheets";
import { cacheGet, cacheSet } from "../lib/cache";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// ── Constants ──────────────────────────────────────────────────

const LISTING_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const LISTING_CACHE_KEY = "all_approved_listings";

const SHEET_TABS = [
  "industrial_listings",
  "commercial_retail_listings",
  "business_listings",
] as const;

// ── Safe field normalization ───────────────────────────────────

function safeStr(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function safeNum(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function boolFlag(v: unknown): boolean {
  const s = safeStr(v).toLowerCase();
  return s === "true" || s === "yes" || s === "1" || s === "y";
}

/**
 * Derive a property_type label from the sheet name.
 */
function derivePropertyType(sheetName: string): string {
  if (sheetName === "industrial_listings") return "Industrial";
  if (sheetName === "commercial_retail_listings") return "Commercial / Retail";
  if (sheetName === "business_listings") return "Business with Property";
  return "Other";
}

/**
 * Derive a clean deal_type from the intent field.
 */
function deriveDealType(intent: string): string {
  const s = intent.toLowerCase();
  if (s.includes("lease")) return "Lease";
  if (s.includes("sale") || s.includes("sold")) return "Sale";
  return "Lease / Sale";
}

/**
 * Build a public display title.
 */
function deriveTitle(row: SheetRow, propertyType: string, dealType: string): string {
  const customTitle = safeStr(row["title"]);
  if (customTitle) return customTitle;

  const use = safeStr(row["use_permitted"]);
  const area = safeStr(row["area"] || row["municipality"]);
  const sqft = safeStr(row["total_sqft"] || row["sqft"]);

  if (propertyType === "Business with Property") {
    const bizType = safeStr(row["business_type"]);
    const bizName = safeStr(row["business_name"]);
    const base = bizName || bizType || "Business";
    return `${base} — ${area}${sqft ? ` — ${sqft} SF` : ""}`;
  }

  const parts: string[] = [];
  if (use) parts.push(use);
  parts.push(propertyType);
  if (dealType) parts.push(`for ${dealType}`);
  if (sqft) parts.push(`— ${sqft} SF`);
  if (area) parts.push(`in ${area}`);
  return parts.join(" ");
}

/**
 * Format price for public display (ranges only, no exact prices).
 */
function formatDisplayPrice(row: SheetRow, dealType: string): string | null {
  if (dealType === "Lease") {
    const psf = safeNum(row["price_psf"]);
    if (psf) return `From $${psf}/SF Net`;
    return null;
  }
  // For sale: use range brackets, never exact
  const totalPrice = safeNum(row["total_price"]);
  const askingPrice = safeNum(row["asking_price"]);
  const price = totalPrice || askingPrice;
  if (!price) return null;
  if (price < 500000) return "Under $500K";
  if (price < 1000000) return "$500K–$1M";
  if (price < 2000000) return "$1M–$2M";
  if (price < 5000000) return "$2M–$5M";
  if (price < 10000000) return "$5M–$10M";
  return "$10M+";
}

function formatSizeRange(sqft: number | null): string | null {
  if (!sqft) return null;
  return `${sqft.toLocaleString()} SF`;
}

/**
 * Transform a raw sheet row into the public API shape.
 * Only safe/approved fields are included.
 */
function toPublicListing(row: SheetRow, sheetName: string): Record<string, unknown> | null {
  // Gate: must be approved
  if (!boolFlag(row["approved_for_web"])) return null;

  const propertyType = derivePropertyType(sheetName);
  const dealType = deriveDealType(safeStr(row["intent"] || row["lease_type"]));

  const sqft = safeNum(row["total_sqft"] || row["sqft"]);

  return {
    listing_id: safeStr(row["listing_id"]),
    title: deriveTitle(row, propertyType, dealType),
    property_type: propertyType,
    deal_type: dealType,
    city: safeStr(row["municipality"]),
    area_or_corridor: safeStr(row["area"]),
    size_sqft: sqft,
    size_range: formatSizeRange(sqft),
    price_or_rent_display: formatDisplayPrice(row, dealType),
    use_type: safeStr(row["use_permitted"]),
    zoning: safeStr(row["zoning"]),
    key_features: safeStr(row["key_features"]),
    public_remarks: safeStr(row["remarks_short"]),
    image_url: safeStr(row["image_url"]) || null,
    status: safeStr(row["status"]) || "Active",
    source_type: safeStr(row["source"]) || "Internal",
    display_priority: safeNum(row["display_priority"]) || 0,
    last_updated: safeStr(row["date_added"]),
  };
}

// ── Load all approved listings (with cache) ────────────────────

async function loadApprovedListings(): Promise<Record<string, unknown>[]> {
  const cached = cacheGet<Record<string, unknown>[]>(LISTING_CACHE_KEY);
  if (cached) return cached;

  logger.info("Cache miss — loading listings from Google Sheets");

  const allListings: Record<string, unknown>[] = [];

  for (const tab of SHEET_TABS) {
    try {
      const rows = await readSheet(tab);
      for (const row of rows) {
        const listing = toPublicListing(row, tab);
        if (listing) allListings.push(listing);
      }
    } catch (err) {
      logger.error({ err, tab }, "Failed to read sheet tab — skipping");
      // Continue with other tabs rather than failing entirely
    }
  }

  // Sort by display_priority desc, then date_added desc
  allListings.sort((a, b) => {
    const pa = (a.display_priority as number) || 0;
    const pb = (b.display_priority as number) || 0;
    if (pa !== pb) return pb - pa;
    return String(b.last_updated || "").localeCompare(String(a.last_updated || ""));
  });

  cacheSet(LISTING_CACHE_KEY, allListings, LISTING_CACHE_TTL_MS);
  logger.info({ count: allListings.length }, "Listings loaded and cached");

  return allListings;
}

// ── GET /api/listings ─────────────────────────────────────────

router.get("/listings", async (_req: Request, res: Response) => {
  try {
    const all = await loadApprovedListings();

    // ── Apply filters from query params ──
    const filters: Record<string, string> = {};
    for (const key of ["property_type", "deal_type", "city", "use_type", "status", "keyword"]) {
      const v = (_req.query as Record<string, string>)[key];
      if (v) filters[key] = v.toLowerCase().trim();
    }

    const sizeMin = safeNum((_req.query as Record<string, string>)["size_min"]);
    const sizeMax = safeNum((_req.query as Record<string, string>)["size_max"]);
    const priceMax = safeNum((_req.query as Record<string, string>)["price_max"]);

    let results = all;

    if (filters["property_type"]) {
      results = results.filter(
        (l) => String(l.property_type).toLowerCase() === filters["property_type"],
      );
    }
    if (filters["deal_type"]) {
      results = results.filter(
        (l) => String(l.deal_type).toLowerCase() === filters["deal_type"],
      );
    }
    if (filters["city"]) {
      results = results.filter((l) =>
        String(l.city).toLowerCase().includes(filters["city"]),
      );
    }
    if (filters["use_type"]) {
      results = results.filter((l) =>
        String(l.use_type).toLowerCase().includes(filters["use_type"]),
      );
    }
    if (filters["status"]) {
      results = results.filter(
        (l) => String(l.status).toLowerCase() === filters["status"],
      );
    }
    if (filters["keyword"]) {
      const kw = filters["keyword"];
      results = results.filter(
        (l) =>
          String(l.title).toLowerCase().includes(kw) ||
          String(l.public_remarks).toLowerCase().includes(kw) ||
          String(l.city).toLowerCase().includes(kw) ||
          String(l.use_type).toLowerCase().includes(kw),
      );
    }
    if (sizeMin !== null) {
      results = results.filter((l) => {
        const sz = l.size_sqft as number | null;
        return sz !== null && sz >= sizeMin;
      });
    }
    if (sizeMax !== null) {
      results = results.filter((l) => {
        const sz = l.size_sqft as number | null;
        return sz !== null && sz <= sizeMax;
      });
    }
    if (priceMax !== null) {
      results = results.filter((l) => {
        const price = safeNum(l.total_price || l.asking_price);
        return price !== null && price <= priceMax;
      });
    }

    res.json({ count: results.length, listings: results });
  } catch (err) {
    logger.error({ err }, "Error serving /api/listings");
    res.status(500).json({ error: "Unable to load listings at this time." });
  }
});

// ── GET /api/listings/featured ─────────────────────────────────

router.get("/listings/featured", async (_req: Request, res: Response) => {
  try {
    const all = await loadApprovedListings();

    // Featured = highest display_priority, most recent
    const featured = all
      .filter((l) => {
        const priority = (l.display_priority as number) || 0;
        return priority > 0;
      })
      .slice(0, 12);

    // If fewer than 6 featured, top up with recent ones
    if (featured.length < 6) {
      const existingIds = new Set(featured.map((l) => l.listing_id));
      const recentTopUps = all
        .filter((l) => !existingIds.has(l.listing_id))
        .slice(0, 6 - featured.length);
      featured.push(...recentTopUps);
    }

    res.json({ count: featured.length, listings: featured });
  } catch (err) {
    logger.error({ err }, "Error serving /api/listings/featured");
    res.status(500).json({ error: "Unable to load featured listings." });
  }
});

// ── GET /api/listings/match ────────────────────────────────────
// Simple matching endpoint for the Search page:
// Takes basic criteria and returns 3–6 approved matches.
// MUST come before /:id to avoid "match" being caught as an id param.

router.get("/listings/match", async (req: Request, res: Response) => {
  try {
    const all = await loadApprovedListings();

    const q = req.query as Record<string, string>;
    const dealType = (q["deal_type"] || "").toLowerCase();
    const propertyType = (q["property_type"] || "").toLowerCase();
    const city = (q["city"] || "").toLowerCase();
    const useType = (q["use_type"] || "").toLowerCase();
    const sizeMin = safeNum(q["size_min"]);
    const sizeMax = safeNum(q["size_max"]);

    // Score each listing against criteria
    const scored = all
      .map((l) => {
        let score = 0;
        const lDeal = String(l.deal_type).toLowerCase();
        const lProp = String(l.property_type).toLowerCase();
        const lCity = String(l.city).toLowerCase();
        const lUse = String(l.use_type).toLowerCase();
        const lSize = (l.size_sqft as number) || 0;

        if (dealType && lDeal.includes(dealType)) score += 3;
        if (propertyType && lProp.includes(propertyType)) score += 3;
        if (city && lCity.includes(city)) score += 3;
        if (useType && lUse.includes(useType)) score += 2;
        if (sizeMin && lSize >= sizeMin) score += 2;
        if (sizeMax && lSize <= sizeMax) score += 2;

        return { listing: l, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    res.json({
      count: scored.length,
      matches: scored.map((s) => ({ ...s.listing, _match_score: s.score })),
    });
  } catch (err) {
    logger.error({ err }, "Error serving /api/listings/match");
    res.status(500).json({ error: "Unable to match listings at this time." });
  }
});

// ── GET /api/listings/:id ─────────────────────────────────────

router.get("/listings/:id", async (req: Request, res: Response) => {
  try {
    const all = await loadApprovedListings();
    const listing = all.find((l) => l.listing_id === req.params["id"]);

    if (!listing) {
      res.status(404).json({ error: "Listing not found or not approved for public display." });
      return;
    }

    res.json({ listing });
  } catch (err) {
    logger.error({ err }, "Error serving /api/listings/:id");
    res.status(500).json({ error: "Unable to load listing details." });
  }
});

// ── Manual cache clear (for future admin use) ─────────────────

router.post("/listings/refresh-cache", (_req: Request, res: Response) => {
  // This clears the cache so the next request re-fetches from Google Sheets.
  // In production, this should be protected by auth.
  const { cacheClear } = require("../lib/cache");
  cacheClear(LISTING_CACHE_KEY);
  logger.info("Listing cache manually cleared");
  res.json({ success: true, message: "Cache cleared. Next request will reload from Google Sheets." });
});

export default router;
