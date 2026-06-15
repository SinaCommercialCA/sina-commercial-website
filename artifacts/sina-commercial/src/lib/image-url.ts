/**
 * Safe image URL resolver — pure function, no DOM, no React hooks.
 * Returns a URL string for use in <img src={...}>.
 *
 * Priority:
 *   1. Approved image_url from database
 *   2. Category fallback based on property_type or use_type
 *   3. Default commercial image
 */

const FALLBACK_BASE = "/images/fallback";

// Exact matches first, then substring-based fallback
const TYPE_TO_FALLBACK: Record<string, string> = {
  "small-bay industrial": "small-bay-industrial.jpg",
  industrial: "industrial-warehouse.jpg",
  warehouse: "industrial-warehouse.jpg",
  automotive: "automotive-mechanic.jpg",
  "auto / mechanic": "automotive-mechanic.jpg",
  "car wash": "car-wash.jpg",
  "gas station": "gas-station.jpg",
  retail: "retail-plaza.jpg",
  investment: "investment-property.jpg",
  "land / development": "land-development.jpg",
  "office / commercial": "office-commercial.jpg",
  "business with property": "business-with-property.jpg",
  office: "office-commercial.jpg",
  land: "land-development.jpg",
};

const DEFAULT_FALLBACK = "industrial-warehouse.jpg";

export function imageUrlFor(listing: {
  image_url?: string | null;
  property_type?: string;
  use_type?: string;
}): string {
  // 1. Approved database image
  if (listing.image_url) return listing.image_url;

  // 2. Category fallback
  const raw = listing.property_type || listing.use_type || "";
  const type = raw.toLowerCase().trim();

  for (const [key, file] of Object.entries(TYPE_TO_FALLBACK)) {
    if (type.includes(key)) return `${FALLBACK_BASE}/${file}`;
  }

  // 3. Default
  return `${FALLBACK_BASE}/${DEFAULT_FALLBACK}`;
}
