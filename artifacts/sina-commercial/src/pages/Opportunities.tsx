import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, ArrowRight, Building2, Loader2 } from "lucide-react";
import type { PublicListing } from "@/lib/api-types";
import { imageUrlFor } from "@/lib/image-url";
import ListingRequestModal from "@/components/ListingRequestModal";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const FILTER_CATEGORIES = [
  "All",
  "Industrial",
  "Commercial / Retail",
  "Investment",
  "Automotive",
  "Business with Property",
  "Off-Market",
];

export default function Opportunities() {
  const [modalListing, setModalListing] = useState<PublicListing | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [listings, setListings] = useState<PublicListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    document.title = "Commercial Real Estate Opportunities GTA | Sina Commercial";
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch("/api/listings");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setListings((data as { listings: PublicListing[] }).listings || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = activeCategory === "All"
    ? listings
    : listings.filter(l => l.property_type.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="w-full overflow-hidden">
      {/* HERO */}
      <section className="pt-20 pb-20 bg-card border-b border-white/10 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-3xl">
            <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-6">
              <div className="h-px w-12 bg-secondary" />
              <span className="text-secondary font-medium tracking-wider uppercase text-sm">GTA Commercial Opportunities</span>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="font-serif text-4xl md:text-5xl text-white mb-6">
              Commercial Opportunities Across the GTA
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground leading-relaxed">
              Explore curated commercial real estate opportunities including industrial, retail, investment, off-market, and business-with-property assets.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="py-10 bg-background border-b border-white/5 sticky top-20 z-30 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            {FILTER_CATEGORIES.map(cat => (
              <button
                key={cat}
                data-testid={`filter-${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 text-sm font-medium rounded-sm border transition-all ${
                  activeCategory === cat
                    ? "bg-secondary text-background border-secondary"
                    : "border-white/20 text-white/70 hover:border-secondary/50 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* OPPORTUNITY CARDS */}
      <section className="py-20 bg-background min-h-[50vh]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[0, 1, 2].map(i => (
                <Card key={i} className="bg-card border-white/5 animate-pulse">
                  <div className="h-56 bg-white/5" />
                  <CardContent className="p-6">
                    <div className="h-6 bg-white/10 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-white/5 rounded w-1/2 mb-4" />
                    <div className="h-10 bg-white/5 rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Unable to load opportunities. Please try again or contact Sina directly.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground" data-testid="empty-state">
              {listings.length === 0 ? (
                <>
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-white/10" />
                  <p className="text-lg">No approved listings yet.</p>
                  <p className="text-sm mt-2">Contact Sina for off-market and pre-market opportunities.</p>
                </>
              ) : (
                <p className="text-lg">No opportunities currently listed in this category. Contact Sina for private access.</p>
              )}
            </div>
          ) : (
            <motion.div
              key={activeCategory}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filtered.map((listing) => (
                <motion.div key={listing.listing_id} variants={fadeInUp}>
                  <Card className="bg-card border-white/5 overflow-hidden group hover:border-secondary/50 transition-all duration-300 h-full sc-card-lift">
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                      <img
                        src={imageUrlFor(listing)}
                        alt={listing.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-secondary rounded-sm">
                        {listing.deal_type}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    </div>
                    <CardContent className="p-6 -mt-6 relative z-10 flex flex-col h-full">
                      <h3 className="font-serif text-xl text-white mb-3 line-clamp-2">{listing.title}</h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 flex-1">
                        <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-secondary" /> {listing.city}</span>
                        <span className="font-medium text-white">{listing.size_range || `${listing.size_sqft?.toLocaleString() ?? "—"} SF`}</span>
                      </div>
                      {listing.price_or_rent_display && (
                        <p className="text-xs text-secondary mb-4">{listing.price_or_rent_display}</p>
                      )}
                      {listing.key_features && (
                        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{listing.key_features}</p>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        data-testid={`btn-request-info-${listing.listing_id}`}
                        className="w-full border-primary/40 text-white hover:bg-primary hover:border-primary rounded-sm transition-all mt-auto relative z-20 cursor-pointer pointer-events-auto"
                        onClick={(e) => { e.stopPropagation(); console.log('CLICK Opportunities card', listing.listing_id); (window as any).__lastClick = { page: 'Opportunities', id: listing.listing_id, time: Date.now() }; setModalListing(listing); }}
                      >
                        Request Details
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* OFF-MARKET CTA */}
      <section className="py-24 bg-card border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="h-px w-24 bg-secondary mx-auto mb-10" />
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">
            Want access to confidential and off-market opportunities?
          </h2>
          <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
            Many of the most valuable commercial real estate transactions in the GTA never appear on public listings. Submit your criteria and we will match you confidentially.
          </p>
          <Button
            asChild
            size="lg"
            data-testid="btn-request-confidential"
            className="bg-primary hover:bg-primary/90 text-white rounded-sm px-10 h-14 text-base btn-lift btn-lift-red"
          >
            <Link href="/contact">Request Confidential Opportunities <ArrowRight className="ml-2 w-5 h-5" /></Link>
          </Button>
        </div>
      </section>
      {/* Listing Request Modal */}
      {modalListing && (
        <ListingRequestModal
          listing={modalListing}
          onClose={() => setModalListing(null)}
        />
      )}
    </div>
  );
}
