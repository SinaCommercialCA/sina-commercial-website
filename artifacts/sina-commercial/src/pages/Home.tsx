import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, TrendingUp, Search, ShieldCheck, MapPin, Briefcase, ChevronRight, ArrowRight } from "lucide-react";
import headshot from "@assets/photo_2026-06-05_01-52-08_1780720012134.jpg";

import heroBg from "@/assets/hero-bg.png";
import type { PublicListing, MarketIntelSection } from "@/lib/api-types";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function Home() {
  React.useEffect(() => {
    document.title = "Sina Commercial | GTA Commercial Real Estate Advisory";
  }, []);

  const [featured, setFeatured] = React.useState<PublicListing[]>([]);
  const [intelSections, setIntelSections] = React.useState<MarketIntelSection[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const [fRes, iRes] = await Promise.all([
          fetch("/api/listings/featured"),
          fetch("/api/market-intelligence"),
        ]);
        if (fRes.ok) {
          const data = await fRes.json();
          setFeatured((data as { listings: PublicListing[] }).listings || []);
        }
        if (iRes.ok) {
          const data = await iRes.json();
          setIntelSections((data as { sections: MarketIntelSection[] }).sections?.slice(0, 3) || []);
        }
      } catch {
        // Graceful fallback — show static content below
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const hasDynamicFeatured = featured.length > 0;
  const hasDynamicIntel = intelSections.length > 0;

  return (
    <div className="w-full overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-[80vh] flex items-center py-20 sm:py-24">
        <div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt="GTA Industrial Commercial Real Estate"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-background/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/30" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden" animate="visible" variants={staggerContainer}
            className="max-w-4xl"
          >
            <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-6">
              <div className="h-px w-10 bg-secondary" />
              <span className="text-secondary font-medium tracking-wider uppercase text-xs sm:text-sm">GTA Commercial Advisory</span>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
                COMMERCIAL REAL ESTATE INTELLIGENCE FOR INVESTORS, OWNER-USERS &amp; BUSINESS OWNERS
              </h1>
            </motion.div>

            <motion.p variants={fadeInUp} className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-3xl">
              Off-market opportunities, acquisition advisory, tenant representation and strategic commercial real estate guidance across the Greater Toronto Area.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-sm px-8 h-12 sm:h-14 text-sm sm:text-base btn-lift btn-lift-red">
                <Link href="/contact">Request Confidential Opportunities</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-secondary text-secondary hover:bg-secondary/10 rounded-sm px-8 h-12 sm:h-14 text-sm sm:text-base btn-lift btn-lift-gold">
                <Link href="/contact">Book Consultation</Link>
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} className="pt-6 border-t border-white/10 flex flex-wrap gap-x-6 gap-y-3 text-xs sm:text-sm font-medium text-white/60">
              <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-secondary shrink-0" /> Industrial</span>
              <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-secondary shrink-0" /> Retail</span>
              <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-secondary shrink-0" /> Investment</span>
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-secondary shrink-0" /> Owner-User</span>
              <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-secondary shrink-0" /> Business With Property</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ADVISOR PROFILE — premium bio card */}
      <section className="py-20 bg-card border-y border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-10 items-start sm:items-center">
              {/* PORTRAIT — constrained to advisory card size */}
              <div className="shrink-0">
                <div className="relative">
                  <div className="absolute -inset-2 border border-secondary/25 rounded-full" />
                  <img
                    src={headshot}
                    alt="Sina Shahravan"
                    className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover object-top ring-2 ring-secondary/30"
                  />
                </div>
              </div>

              {/* BIO */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-px w-10 bg-secondary" />
                  <span className="text-secondary font-medium tracking-wider uppercase text-xs">GTA Commercial Advisory</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl text-white mb-1">Sina Shahravan</h2>
                <p className="text-primary text-sm font-medium mb-4">Vice President, Sales Associate | Nave Real Estate Brokerage Inc.</p>
                <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl">
                  Sina Shahravan is a GTA commercial real estate advisor focused on industrial, retail, investment, and off-market commercial opportunities. Since 2009, Sina has advised investors, business owners, landlords, tenants, and owner-users across the Greater Toronto Area with a practical, opportunity-driven approach.
                </p>

                {/* CREDIBILITY BADGES */}
                <div className="flex flex-wrap gap-3">
                  {[
                    "Licensed Since 2009",
                    "GTA Commercial Specialist",
                    "Industrial | Retail | Investment",
                    "Investor & Owner-User Advisory",
                  ].map(badge => (
                    <span
                      key={badge}
                      className="px-3 py-1.5 bg-background border border-secondary/30 text-secondary text-xs font-medium rounded-sm"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOOKING FOR SPECIFIC PROPERTY */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <Search className="w-10 h-10 text-secondary mx-auto mb-5" />
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white mb-5">Looking for a Specific Commercial Property?</h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed">
            Submit your exact criteria and Sina Commercial will search public listings, off-market opportunities, broker-network properties, and private commercial opportunities across the GTA.
          </p>
          <Button asChild size="lg" className="bg-secondary text-background hover:bg-secondary/90 rounded-sm px-8 h-12 sm:h-14 text-sm sm:text-base font-semibold btn-lift btn-lift-gold">
            <Link href="/search-properties">Search Commercial Properties</Link>
          </Button>
        </div>
      </section>

      {/* FEATURED OPPORTUNITIES */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-3">
                <div className="h-px w-10 bg-primary" />
                <span className="text-primary font-medium tracking-wider uppercase text-xs">Curated Selection</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white mb-3">Featured Commercial Opportunities</h2>
              <p className="text-muted-foreground text-sm sm:text-base">A curated view of commercial real estate opportunities across the Greater Toronto Area, including industrial, retail, investment and off-market property types.</p>
            </div>
            <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/5 rounded-sm shrink-0 text-sm">
              <Link href="/opportunities">View All Opportunities <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {[0, 1, 2].map(i => (
                <Card key={i} className="bg-background border-white/5 animate-pulse">
                  <div className="h-52 bg-white/5" />
                  <CardContent className="p-5">
                    <div className="h-5 bg-white/10 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-white/5 rounded w-1/2 mb-4" />
                    <div className="h-8 bg-white/5 rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : hasDynamicFeatured ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {featured.map((listing) => (
                <Card key={listing.listing_id} className="bg-background border-white/5 overflow-hidden group hover:border-secondary/50 transition-colors sc-card-lift">
                  <div className="relative h-52 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <div className="absolute top-3 left-3 z-10 bg-background/90 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-secondary rounded-sm">
                      {listing.deal_type}
                    </div>
                    <Building2 className="w-16 h-16 text-white/10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  </div>
                  <CardContent className="p-5 relative z-10 -mt-6">
                    <h3 className="font-serif text-lg text-white mb-3 line-clamp-2">{listing.title}</h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-secondary shrink-0" /> {listing.city}</span>
                      <span className="font-medium text-white">{listing.size_range || `${listing.size_sqft?.toLocaleString() ?? "—"} SF`}</span>
                    </div>
                    <Button asChild variant="outline" size="sm" className="w-full border-primary/40 text-white hover:bg-primary hover:border-primary rounded-sm transition-all text-xs">
                      <Link href="/contact">Request Info</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Static fallback — shown when no approved listings exist yet */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {[
                { title: "Industrial Warehouse Opportunity", location: "North York", type: "Industrial Lease", size: "7,700 SF" },
                { title: "Retail Plaza Acquisition", location: "Scarborough", type: "Investment / Retail", size: "22,000 SF" },
                { title: "Small-Bay Industrial Condo", location: "Vaughan", type: "Industrial Sale", size: "3,500 SF" },
              ].map((opp, idx) => (
                <Card key={idx} className="bg-background border-white/5 overflow-hidden group hover:border-secondary/50 transition-colors sc-card-lift">
                  <div className="relative h-52 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <div className="absolute top-3 left-3 z-10 bg-background/90 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-secondary rounded-sm">
                      {opp.type}
                    </div>
                    <Building2 className="w-16 h-16 text-white/10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  </div>
                  <CardContent className="p-5 relative z-10 -mt-6">
                    <h3 className="font-serif text-lg text-white mb-3 line-clamp-2">{opp.title}</h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-secondary shrink-0" /> {opp.location}</span>
                      <span className="font-medium text-white">{opp.size}</span>
                    </div>
                    <Button asChild variant="outline" size="sm" className="w-full border-primary/40 text-white hover:bg-primary hover:border-primary rounded-sm transition-all text-xs">
                      <Link href="/contact">Request Info</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground border-t border-white/10 pt-6">
            Some opportunities may be confidential or off-market. Submit your criteria to receive suitable matches.
          </div>
        </div>
      </section>

      {/* RECENT TRANSACTIONS */}
      <section className="py-20 bg-background border-y border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white mb-5">Recent Transactions &amp; Advisory Experience</h2>
            <div className="h-px w-20 bg-secondary mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {[
              { type: "Industrial Lease", loc: "North York", size: "7,700 SF" },
              { type: "Industrial Acquisition", loc: "Vaughan", size: "38,500 SF" },
              { type: "Retail Plaza Acquisition", loc: "Scarborough", size: "22,000 SF" },
              { type: "Auto-Related Commercial Lease", loc: "Toronto", size: "3,000 SF" },
              { type: "Industrial Sale", loc: "Mississauga", size: "18,000 SF" },
              { type: "Investment Property Advisory", loc: "Richmond Hill", size: "$9.2M" },
            ].map((tx, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-5 border border-white/5 rounded-sm bg-card hover:bg-card/80 transition-colors">
                <span className="text-secondary text-xs font-medium tracking-wide uppercase mb-2">{tx.type}</span>
                <span className="text-lg text-white font-serif mb-1">{tx.loc}</span>
                <span className="text-muted-foreground text-sm">{tx.size}</span>
              </div>
            ))}
          </div>
          <div className="text-center text-xs text-muted-foreground/50">
            Representative examples. Past performance does not guarantee future results.
          </div>
        </div>
      </section>

      {/* MARKET INTELLIGENCE PREVIEW */}
      <section className="py-20 bg-card relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-3">
                <div className="h-px w-10 bg-secondary" />
                <span className="text-secondary font-medium tracking-wider uppercase text-xs">Intelligence</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white">GTA Commercial Market Intelligence</h2>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90 text-white rounded-sm shrink-0 text-sm btn-lift btn-lift-red">
              <Link href="/market-intelligence">Request Latest Market Report</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hasDynamicIntel ? (
              intelSections.map((section) => (
                <div key={section.id} className="p-6 border-l-2 border-secondary bg-background hover:bg-background/80 transition-colors">
                  <h3 className="font-serif text-lg text-white mb-3">{section.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">{section.summary}</p>
                  <Link href="/market-intelligence" className="text-secondary text-xs font-medium flex items-center hover:text-white transition-colors">
                    Read Brief <ChevronRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
              ))
            ) : (
              [
                { title: "Industrial Market Trends", desc: "Vacancy, rental growth, logistics demand, and small-bay industrial activity." },
                { title: "Emerging Investment Corridors", desc: "Infrastructure, zoning, redevelopment, and commercial growth patterns across the GTA." },
                { title: "Off-Market Opportunity Brief", desc: "Confidential buyer demand, private seller activity, and strategic acquisition themes." }
              ].map((card, i) => (
                <div key={i} className="p-6 border-l-2 border-secondary bg-background hover:bg-background/80 transition-colors">
                  <h3 className="font-serif text-lg text-white mb-3">{card.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">{card.desc}</p>
                  <Link href="/market-intelligence" className="text-secondary text-xs font-medium flex items-center hover:text-white transition-colors">
                    Read Brief <ChevronRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="py-20 bg-background border-y border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="h-px w-10 bg-secondary" />
                <span className="text-secondary font-medium tracking-wider uppercase text-xs">Advisory</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white">Commercial Advisory Services</h2>
            </div>
            <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/5 rounded-sm shrink-0 text-sm">
              <Link href="/services">Explore Services <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: "Tenant Representation", desc: "Industrial, retail, office, automotive and service commercial." },
              { title: "Buyer Representation", desc: "Owner-users, business operators and commercial investors." },
              { title: "Investment Advisory", desc: "Income-producing, value-add, and off-market acquisitions." },
              { title: "Off-Market Strategy", desc: "Access to opportunities that never reach public listings." },
              { title: "Landlord & Seller Advisory", desc: "Leasing, disposition, repositioning, and private testing." },
              { title: "Business With Property", desc: "Operating businesses with commercial real estate included." },
            ].map((svc, i) => (
              <div key={i} className="p-5 border border-white/5 bg-card hover:border-secondary/30 transition-colors">
                <h3 className="font-serif text-base text-white mb-2">{svc.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white">Client Perspectives</h2>
            <div className="h-px w-20 bg-secondary mx-auto mt-5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {[
              { quote: "Sina identified an opportunity that never reached the public market. His negotiation strategy helped us move with confidence.", author: "Industrial Investor" },
              { quote: "Sina understood our operational requirements and sourced options that matched our growth plan.", author: "Business Owner" },
              { quote: "The level of market intelligence and advisory exceeded our expectations.", author: "Commercial Property Investor" }
            ].map((t, i) => (
              <div key={i} className="flex flex-col">
                <div className="text-primary text-5xl font-serif leading-none opacity-40 mb-3">&ldquo;</div>
                <p className="text-base text-white/85 italic leading-relaxed mb-6 flex-1">{t.quote}</p>
                <div className="text-xs font-medium text-secondary uppercase tracking-wider">— {t.author}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
