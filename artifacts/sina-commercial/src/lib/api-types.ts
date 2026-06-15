/**
 * Client-side types matching the public API response shapes.
 * Kept simple — no generated client dependency needed.
 */

export interface PublicListing {
  listing_id: string;
  title: string;
  property_type: string;
  deal_type: string;
  city: string;
  area_or_corridor: string;
  size_sqft: number | null;
  size_range: string | null;
  price_or_rent_display: string | null;
  use_type: string;
  zoning: string;
  key_features: string;
  public_remarks: string;
  image_url: string | null;
  status: string;
  source_type: string;
  display_priority: number;
  last_updated: string;
}

export interface ListingMatch extends PublicListing {
  _match_score: number;
}

export interface ListingsResponse {
  count: number;
  listings: PublicListing[];
}

export interface FeaturedResponse {
  count: number;
  listings: PublicListing[];
}

export interface MatchResponse {
  count: number;
  matches: ListingMatch[];
}

export interface MarketIntelItem {
  label: string;
  content: string;
}

export interface MarketIntelStat {
  value: string;
  label: string;
}

export interface MarketIntelSection {
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

export interface MarketIntelNotes {
  title: string;
  content: string;
  approved_for_web?: boolean;
}

export interface MarketIntelResponse {
  last_updated: string | null;
  sections: MarketIntelSection[];
  weekly_notes: MarketIntelNotes | null;
  message?: string;
}
