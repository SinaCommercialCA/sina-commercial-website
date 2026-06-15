/**
 * Category fallback image mapping.
 * Maps property types and use types to professional category images.
 * Used when a listing has no specific image_url.
 */

const FALLBACK_DIR = "/images/fallback";

// Primary mapping: property_type → fallback image
const PROPERTY_TYPE_MAP: Record<string, string> = {
  Industrial: `${FALLBACK_DIR}/industrial-warehouse.jpg`,
  Warehouse: `${FALLBACK_DIR}/industrial-warehouse.jpg`,
  "Small-Bay Industrial": `${FALLBACK_DIR}/small-bay-industrial.jpg`,
  Automotive: `${FALLBACK_DIR}/automotive-mechanic.jpg`,
  "Auto / Mechanic": `${FALLBACK_DIR}/automotive-mechanic.jpg`,
  "Car Wash": `${FALLBACK_DIR}/car-wash.jpg`,
  "Gas Station": `${FALLBACK_DIR}/gas-station.jpg`,
  "Commercial / Retail": `${FALLBACK_DIR}/retail-plaza.jpg`,
  Retail: `${FALLBACK_DIR}/retail-plaza.jpg`,
  "Retail Plaza": `${FALLBACK_DIR}/retail-plaza.jpg`,
  Restaurant: `${FALLBACK_DIR}/retail-plaza.jpg`,
  "Food / Restaurant": `${FALLBACK_DIR}/retail-plaza.jpg`,
  Investment: `${FALLBACK_DIR}/investment-property.jpg`,
  "Investment Property": `${FALLBACK_DIR}/investment-property.jpg`,
  Land: `${FALLBACK_DIR}/land-development.jpg`,
  "Land / Development": `${FALLBACK_DIR}/land-development.jpg`,
  Office: `${FALLBACK_DIR}/office-commercial.jpg`,
  "Office / Commercial": `${FALLBACK_DIR}/office-commercial.jpg`,
  "Business with Property": `${FALLBACK_DIR}/business-with-property.jpg`,
  Business: `${FALLBACK_DIR}/business-with-property.jpg`,
};

// Default fallback when nothing matches
const DEFAULT_FALLBACK = `${FALLBACK_DIR}/industrial-warehouse.jpg`;

export function getListingImage(
  imageUrl: string | null | undefined,
  propertyType?: string | null,
  useType?: string | null,
): string {
  // 1. Approved image from database
  if (imageUrl) return imageUrl;

  // 2. Category fallback based on property type
  const pt = propertyType?.trim();
  if (pt && PROPERTY_TYPE_MAP[pt]) return PROPERTY_TYPE_MAP[pt];

  // 3. Try use type as fallback
  const ut = useType?.trim();
  if (ut && PROPERTY_TYPE_MAP[ut]) return PROPERTY_TYPE_MAP[ut];

  // 4. Default
  return DEFAULT_FALLBACK;
}
