import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, MapPin, BarChart2, Lock, CheckCircle2, Loader2 } from "lucide-react";
import type { MarketIntelSection, MarketIntelNotes } from "@/lib/api-types";
import PageMeta from "@/components/PageMeta";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

// ─── Static fallback (shown if API data is unavailable) ─────────

const STATIC_SECTIONS: MarketIntelSection[] = [
  {
    id: "industrial-trends",
    title: "Industrial Market Trends",
    summary: "GTA industrial vacancy remains historically tight. Small-bay units under 10,000 SF continue to experience acute supply shortages.",
    market_area: "GTA",
    property_type: "Industrial",
    confidence_level: "High",
    source_note: "Based on active transactions and broker intelligence.",
    approved_for_web: true,
    items: [
      { label: "Vacancy & Availability", content: "GTA industrial vacancy remains historically tight in established nodes such as North York, Etobicoke, and east Toronto industrial corridors. Small-bay units under 10,000 SF continue to experience the most acute supply shortages, with qualified tenants frequently competing against multiple offers on quality units." },
      { label: "Rental Growth", content: "Net rental rates for quality industrial product have appreciated substantially since 2020. Landlords in prime corridors are maintaining firm positions, particularly for units with clear heights above 18 feet, truck-level shipping, and adequate power." },
      { label: "Logistics & E-commerce Demand", content: "Demand from e-commerce fulfillment, last-mile logistics, and food distribution continues to drive absorption across the Greater Toronto Area. 53-foot trailer access, large shipping courts, and ample truck parking have become non-negotiable for logistics users." },
      { label: "Specialized Industrial", content: "Automotive, food production, cold storage, and cannabis-approved facilities remain in short supply. Businesses with specialized operational requirements — spray booths, floor drains, crane pads, high power — are advised to engage a specialist early given limited inventory." },
    ],
    stats: [
      { value: "Sub-2%", label: "Vacancy — Prime Industrial Nodes" },
      { value: "22'+", label: "Clear Height in Demand" },
      { value: "53'", label: "Trailer Access Standard" },
      { value: "400A+", label: "Power Demand Increasing" },
    ],
  },
  {
    id: "investment-corridors",
    title: "Investment Corridors",
    summary: "The GTA's major commercial investment corridors continue to attract capital from domestic and international investors. Infrastructure investment, intensification, and employment zone protections are shaping long-term value in key nodes.",
    market_area: "GTA",
    property_type: "Multi-Type",
    confidence_level: "Medium–High",
    source_note: "Based on corridor analysis and recent transaction patterns.",
    approved_for_web: true,
    items: [
      { label: "Highway 400 / Vaughan", content: "Strong industrial activity driven by logistics users, automotive trades, and manufacturing. Proximity to major interchanges and the Vaughan Metropolitan Centre creates multi-generational investment appeal." },
      { label: "Highway 401 / Mississauga", content: "Airport proximity and 401 access continue to attract distribution, logistics, and advanced manufacturing users. Some of the highest per-SF rents in the GTA for Class A industrial product." },
      { label: "Dufferin / North York", content: "Established industrial strip with dense small-bay product. Owner-users and investors prize the urban infill location, transit proximity, and employment zone protections limiting residential conversion." },
      { label: "Scarborough Industrial Nodes", content: "Underrated and overlooked by many investors. Strong tenant demand across automotive, food, and contractor sectors. Acquisition opportunities exist at relative value compared to western GTA." },
      { label: "Markham / Stouffville", content: "Growing tech and light manufacturing corridor. Quality industrial condo product offers owner-user opportunities with long-term appreciation potential tied to York Region growth." },
      { label: "Pickering / Ajax / Whitby", content: "Durham Region offers relative value on net rental rates and purchase prices versus western GTA, attracting cost-sensitive industrial tenants and value-oriented investors." },
    ],
  },
  {
    id: "investor-briefs",
    title: "Investor Briefs",
    summary: "Sina Commercial operates a confidential acquisition intelligence network. Private sellers, motivated landlords, and off-market situations are identified through direct broker relationships, private conversations, and market expertise — not through public MLS exposure.",
    market_area: "GTA",
    property_type: "Investment",
    confidence_level: "Medium",
    source_note: "Based on private buyer intelligence and transaction pipeline.",
    approved_for_web: true,
    items: [
      { label: "Confidential Buyer Demand", content: "Active demand from qualified owner-users, investors, and business operators is tracked privately. When matched opportunities are identified — on or off market — qualified buyers are contacted directly." },
      { label: "Private Seller Activity", content: "Many commercial property owners prefer confidential processes. Owners considering their exit or repositioning — without public exposure — work with Sina Commercial to identify qualified buyers quietly before any market exposure." },
      { label: "Strategic Acquisition Themes", content: "Cap rate compression, industrial intensification, automotive lease turnover, and retail plaza repositioning all create identifiable windows for strategic acquisition. These themes are tracked and communicated to registered buyers." },
    ],
  },
];

const SECTION_ICONS = [TrendingUp, MapPin, Lock];
const SECTION_NUMBERS = ["01", "02", "03"];

function IntelSection({
  section, icon: Icon, number, index,
}: { section: MarketIntelSection; icon: React.ComponentType<{ className?: string }>; number: string; index: number }) {
  return (
    <>
      {index > 0 && <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />}
      <section className={`py-24 ${index % 2 === 0 ? "bg-background" : "bg-card"}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start"
          >
            <motion.div variants={fadeInUp} className="lg:col-span-3 flex flex-col items-start">
              <Icon className="w-10 h-10 text-secondary mb-6" />
              <div className="h-px w-12 bg-secondary mb-6" />
              <span className="text-secondary font-medium tracking-wider uppercase text-sm">Section {number}</span>
              <p className="text-xs text-muted-foreground mt-2">{section.confidence_level} confidence</p>
            </motion.div>
            <motion.div variants={fadeInUp} className="lg:col-span-9">
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-8">{section.title}</h2>
              {section.summary && (
                <p className="text-muted-foreground text-lg leading-relaxed mb-10">{section.summary}</p>
              )}

              {/* Items grid */}
              {section.items && section.items.length > 0 && (
                <div className={`grid grid-cols-1 ${section.items.length > 4 ? "sm:grid-cols-2" : "md:grid-cols-2"} gap-8 mb-10`}>
                  {section.items.map((item, i) => (
                    <div key={i} className="border-l-2 border-secondary/40 pl-6">
                      <h3 className="font-serif text-lg text-white mb-3">{item.label}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Stats bar */}
              {section.stats && section.stats.length > 0 && (
                <div className={`grid grid-cols-2 sm:grid-cols-${Math.min(section.stats.length, 4)} gap-6 p-8 bg-card border border-white/5`}>
                  {section.stats.map((s, i) => (
                    <div key={i} className="text-center">
                      <div className="text-secondary font-bold text-2xl mb-2">{s.value}</div>
                      <div className="text-xs text-muted-foreground leading-tight">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground/50 mt-4">{section.source_note}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

export default function MarketIntelligence() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", role: "", areas: "", propertyTypes: ""
  });
  const [sections, setSections] = useState<MarketIntelSection[]>([]);
  const [weeklyNotes, setWeeklyNotes] = useState<MarketIntelNotes | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/market-intelligence");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (data.sections && data.sections.length > 0) {
          setSections(data.sections as MarketIntelSection[]);
          setWeeklyNotes(data.weekly_notes as MarketIntelNotes | null);
        }
      } catch {
        // Use static fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const displaySections = sections.length > 0 ? sections : (loading ? [] : STATIC_SECTIONS);
  const hasWeeklyNote = weeklyNotes && weeklyNotes.approved_for_web !== false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(false);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_type: "market-report", payload: form }),
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      setSubmitted(true);
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <PageMeta
        title="GTA Commercial Real Estate Market Intelligence — Trends & Data | Sina Commercial"
        description="Market intelligence for GTA commercial real estate — industrial vacancy rates, investment corridors, rental trends, and broker insights for investors, landlords, tenants, and business owners."
        path="/market-intelligence"
      />
      {/* HERO */}
      <section className="pt-20 pb-20 bg-card border-b border-white/10 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-3xl">
            <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-6">
              <div className="h-px w-12 bg-secondary" />
              <span className="text-secondary font-medium tracking-wider uppercase text-sm">Market Intelligence</span>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="font-serif text-4xl md:text-5xl text-white mb-6">
              GTA Commercial Market Intelligence
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground leading-relaxed">
              Insights for investors, business owners, landlords, tenants, and owner-users navigating the Greater Toronto Area commercial real estate market.
            </motion.p>
            {/* Weekly Notes Banner */}
            {hasWeeklyNote && (
              <motion.div variants={fadeInUp} className="mt-6 p-4 border border-secondary/20 bg-secondary/5 rounded-sm">
                <p className="text-secondary text-xs font-medium uppercase tracking-wider mb-1">Weekly Commercial Notes</p>
                <p className="text-muted-foreground text-sm">{weeklyNotes?.content}</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* DYNAMIC SECTIONS */}
      {loading ? (
        <div className="py-32 text-center">
          <Loader2 className="w-10 h-10 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading market intelligence...</p>
        </div>
      ) : displaySections.length > 0 ? (
        displaySections.map((section, i) => (
          <IntelSection
            key={section.id}
            section={section}
            icon={SECTION_ICONS[i] || TrendingUp}
            number={SECTION_NUMBERS[i] || `0${i + 1}`}
            index={i}
          />
        ))
      ) : (
        <div className="py-20 text-center text-muted-foreground">
          <p>Market intelligence is being prepared. Check back soon or request a report below.</p>
        </div>
      )}

      {/* MARKET REPORT FORM */}
      <section className="py-24 bg-card border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">Request Latest Market Report</h2>
            <div className="h-px w-24 bg-secondary mx-auto mt-6" />
          </div>

          {submitted ? (
            <div className="text-center py-16">
              <CheckCircle2 className="w-16 h-16 text-secondary mx-auto mb-6" />
              <h3 className="font-serif text-2xl text-white mb-4">Request Received</h3>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Thank you. Sina Commercial will follow up with the latest GTA commercial market intelligence.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-market-report">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mr-name" className="text-white/80">Name</Label>
                  <Input
                    id="mr-name"
                    data-testid="input-mr-name"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="bg-background border-white/20 text-white placeholder:text-muted-foreground"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mr-email" className="text-white/80">Email</Label>
                  <Input
                    id="mr-email"
                    type="email"
                    data-testid="input-mr-email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="bg-background border-white/20 text-white placeholder:text-muted-foreground"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mr-phone" className="text-white/80">Phone</Label>
                  <Input
                    id="mr-phone"
                    data-testid="input-mr-phone"
                    placeholder="416-555-0000"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="bg-background border-white/20 text-white placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mr-role" className="text-white/80">I am a</Label>
                  <Select onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                    <SelectTrigger data-testid="select-mr-role" className="bg-background border-white/20 text-white">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/20">
                      {["Investor", "Business Owner", "Landlord", "Tenant", "Broker", "Other"].map(r => (
                        <SelectItem key={r} value={r} className="text-white hover:bg-white/5">{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mr-areas" className="text-white/80">Areas of Interest</Label>
                <Input
                  id="mr-areas"
                  data-testid="input-mr-areas"
                  placeholder="e.g. Vaughan, Mississauga, North York, Scarborough"
                  value={form.areas}
                  onChange={e => setForm(f => ({ ...f, areas: e.target.value }))}
                  className="bg-background border-white/20 text-white placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mr-types" className="text-white/80">Property Types of Interest</Label>
                <Input
                  id="mr-types"
                  data-testid="input-mr-types"
                  placeholder="e.g. Industrial, Retail Plaza, Investment Property"
                  value={form.propertyTypes}
                  onChange={e => setForm(f => ({ ...f, propertyTypes: e.target.value }))}
                  className="bg-background border-white/20 text-white placeholder:text-muted-foreground"
                />
              </div>
              {submitError && (
                <div className="text-red-400 text-sm text-center py-2 border border-red-500/20 bg-red-500/5">
                  Unable to submit. Please try again or email sina@sinacommercial.ca.
                </div>
              )}
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                data-testid="btn-request-report"
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-sm h-14 text-base font-semibold btn-lift btn-lift-red disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Request Latest Market Report"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
