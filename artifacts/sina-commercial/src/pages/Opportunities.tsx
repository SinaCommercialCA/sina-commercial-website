import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, ArrowRight } from "lucide-react";

import propInd1 from "@/assets/property-industrial-1.png";
import propRet1 from "@/assets/property-retail-1.png";
import propInd2 from "@/assets/property-industrial-2.png";
import propAuto from "@/assets/property-auto.png";
import propLog from "@/assets/property-logistics.png";
import propInv from "@/assets/property-investment.png";
import marketIntel from "@/assets/market-intel.png";
import offMarket from "@/assets/off-market.png";
import businessProp from "@/assets/business-property.png";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const ALL_OPPORTUNITIES = [
  { title: "Industrial Warehouse Opportunity", location: "North York", type: "Industrial Lease", size: "7,700 SF", category: "Industrial", image: propInd1 },
  { title: "Retail Plaza Acquisition", location: "Scarborough", type: "Investment / Retail", size: "22,000 SF", category: "Retail", image: propRet1 },
  { title: "Small-Bay Industrial Condo", location: "Vaughan", type: "Industrial Sale", size: "3,500 SF", category: "Industrial", image: propInd2 },
  { title: "Auto-Related Commercial Facility", location: "Toronto", type: "Automotive / Industrial", size: "3,000 SF", category: "Automotive", image: propAuto },
  { title: "Logistics / Distribution Facility", location: "Mississauga", type: "Industrial Lease", size: "18,000 SF", category: "Industrial", image: propLog },
  { title: "Investment Property Advisory", location: "Richmond Hill", type: "Commercial Investment", size: "$9.2M", category: "Investment", image: propInv },
  { title: "GTA Investment Corridor Opportunity", location: "Markham", type: "Investment / Office", size: "12,000 SF", category: "Investment", image: marketIntel },
  { title: "Off-Market Acquisition — Retail Strip", location: "Etobicoke", type: "Off-Market Retail", size: "8,500 SF", category: "Off-Market", image: offMarket },
  { title: "Business With Property — Food Service", location: "Brampton", type: "Business With Property", size: "3,200 SF", category: "Business With Property", image: businessProp },
];

const FILTER_CATEGORIES = [
  "All",
  "Industrial",
  "Retail",
  "Office",
  "Investment",
  "Automotive",
  "Land / Redevelopment",
  "Business With Property",
  "Off-Market",
];

export default function Opportunities() {
  const [activeCategory, setActiveCategory] = useState("All");

  React.useEffect(() => {
    document.title = "Commercial Real Estate Opportunities GTA | Sina Commercial";
  }, []);

  const filtered = activeCategory === "All"
    ? ALL_OPPORTUNITIES
    : ALL_OPPORTUNITIES.filter(o => o.category === activeCategory);

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
                data-testid={`filter-${cat.toLowerCase().replace(/\s/g, "-")}`}
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
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            key={activeCategory}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filtered.length === 0 ? (
              <div className="col-span-3 text-center py-20 text-muted-foreground">
                No opportunities currently listed in this category. Contact Sina for private access.
              </div>
            ) : filtered.map((opp, idx) => (
              <motion.div key={idx} variants={fadeInUp}>
                <Card className="bg-card border-white/5 overflow-hidden group hover:border-secondary/50 transition-all duration-300 h-full sc-card-lift">
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-secondary rounded-sm">
                      {opp.type}
                    </div>
                    <img
                      src={opp.image}
                      alt={opp.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  </div>
                  <CardContent className="p-6 -mt-6 relative z-10 flex flex-col h-full">
                    <h3 className="font-serif text-xl text-white mb-3 line-clamp-2">{opp.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-6 flex-1">
                      <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-secondary" /> {opp.location}</span>
                      <span className="font-medium text-white">{opp.size}</span>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      data-testid={`btn-request-info-${idx}`}
                      className="w-full border-primary/40 text-white hover:bg-primary hover:border-primary rounded-sm transition-all"
                    >
                      <Link href="/contact">Request Info</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
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
    </div>
  );
}
