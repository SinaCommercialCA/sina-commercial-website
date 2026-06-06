import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, MapPin, BarChart2, Lock, CheckCircle2 } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

export default function MarketIntelligence() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", role: "", areas: "", propertyTypes: ""
  });

  React.useEffect(() => {
    document.title = "GTA Commercial Real Estate Market Intelligence | Sina Commercial";
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full overflow-hidden">
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
          </motion.div>
        </div>
      </section>

      {/* SECTION 1: INDUSTRIAL MARKET TRENDS */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start"
          >
            <motion.div variants={fadeInUp} className="lg:col-span-3 flex flex-col items-start">
              <TrendingUp className="w-10 h-10 text-secondary mb-6" />
              <div className="h-px w-12 bg-secondary mb-6" />
              <span className="text-secondary font-medium tracking-wider uppercase text-sm">Section 01</span>
            </motion.div>
            <motion.div variants={fadeInUp} className="lg:col-span-9">
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-8">Industrial Market Trends</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {[
                  {
                    label: "Vacancy & Availability",
                    content: "GTA industrial vacancy remains historically tight in established nodes such as North York, Etobicoke, and east Toronto industrial corridors. Small-bay units under 10,000 SF continue to experience the most acute supply shortages, with qualified tenants frequently competing against multiple offers on quality units."
                  },
                  {
                    label: "Rental Growth",
                    content: "Net rental rates for quality industrial product have appreciated substantially since 2020. Landlords in prime corridors are maintaining firm positions, particularly for units with clear heights above 18 feet, truck-level shipping, and adequate power."
                  },
                  {
                    label: "Logistics & E-commerce Demand",
                    content: "Demand from e-commerce fulfillment, last-mile logistics, and food distribution continues to drive absorption across the Greater Toronto Area. 53-foot trailer access, large shipping courts, and ample truck parking have become non-negotiable for logistics users."
                  },
                  {
                    label: "Specialized Industrial",
                    content: "Automotive, food production, cold storage, and cannabis-approved facilities remain in short supply. Businesses with specialized operational requirements — spray booths, floor drains, crane pads, high power — are advised to engage a specialist early given limited inventory."
                  }
                ].map((item, i) => (
                  <div key={i} className="border-l-2 border-secondary/40 pl-6">
                    <h3 className="font-serif text-lg text-white mb-3">{item.label}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.content}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-8 bg-card border border-white/5">
                {[
                  { stat: "Sub-2%", label: "Vacancy — Prime Industrial Nodes" },
                  { stat: "22'+", label: "Clear Height in Demand" },
                  { stat: "53'", label: "Trailer Access Standard" },
                  { stat: "400A+", label: "Power Demand Increasing" },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-secondary font-bold text-2xl mb-2">{s.stat}</div>
                    <div className="text-xs text-muted-foreground leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* SECTION 2: INVESTMENT CORRIDORS */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start"
          >
            <motion.div variants={fadeInUp} className="lg:col-span-3">
              <MapPin className="w-10 h-10 text-secondary mb-6" />
              <div className="h-px w-12 bg-secondary mb-6" />
              <span className="text-secondary font-medium tracking-wider uppercase text-sm">Section 02</span>
            </motion.div>
            <motion.div variants={fadeInUp} className="lg:col-span-9">
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-8">Investment Corridors</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-10">
                The GTA's major commercial investment corridors continue to attract capital from domestic and international investors. Infrastructure investment, intensification, and employment zone protections are shaping long-term value in key nodes.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    corridor: "Highway 400 / Vaughan",
                    insight: "Strong industrial activity driven by logistics users, automotive trades, and manufacturing. Proximity to major interchanges and the Vaughan Metropolitan Centre creates multi-generational investment appeal."
                  },
                  {
                    corridor: "Highway 401 / Mississauga",
                    insight: "Airport proximity and 401 access continue to attract distribution, logistics, and advanced manufacturing users. Some of the highest per-SF rents in the GTA for Class A industrial product."
                  },
                  {
                    corridor: "Dufferin / North York",
                    insight: "Established industrial strip with dense small-bay product. Owner-users and investors prize the urban infill location, transit proximity, and employment zone protections limiting residential conversion."
                  },
                  {
                    corridor: "Scarborough Industrial Nodes",
                    insight: "Underrated and overlooked by many investors. Strong tenant demand across automotive, food, and contractor sectors. Acquisition opportunities exist at relative value compared to western GTA."
                  },
                  {
                    corridor: "Markham / Stouffville",
                    insight: "Growing tech and light manufacturing corridor. Quality industrial condo product offers owner-user opportunities with long-term appreciation potential tied to York Region growth."
                  },
                  {
                    corridor: "Pickering / Ajax / Whitby",
                    insight: "Durham Region offers relative value on net rental rates and purchase prices versus western GTA, attracting cost-sensitive industrial tenants and value-oriented investors."
                  }
                ].map((c, i) => (
                  <div key={i} className="p-6 bg-background border border-white/5 hover:border-secondary/30 transition-colors">
                    <h3 className="font-serif text-lg text-white mb-3">{c.corridor}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{c.insight}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* SECTION 3: INVESTOR BRIEFS */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start"
          >
            <motion.div variants={fadeInUp} className="lg:col-span-3">
              <Lock className="w-10 h-10 text-secondary mb-6" />
              <div className="h-px w-12 bg-secondary mb-6" />
              <span className="text-secondary font-medium tracking-wider uppercase text-sm">Section 03</span>
            </motion.div>
            <motion.div variants={fadeInUp} className="lg:col-span-9">
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-8">Investor Briefs</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-10">
                Sina Commercial operates a confidential acquisition intelligence network. Private sellers, motivated landlords, and off-market situations are identified through direct broker relationships, private conversations, and market expertise — not through public MLS exposure.
              </p>
              <div className="space-y-6">
                {[
                  {
                    label: "Confidential Buyer Demand",
                    content: "Active demand from qualified owner-users, investors, and business operators is tracked privately. When matched opportunities are identified — on or off market — qualified buyers are contacted directly."
                  },
                  {
                    label: "Private Seller Activity",
                    content: "Many commercial property owners prefer confidential processes. Owners considering their exit or repositioning — without public exposure — work with Sina Commercial to identify qualified buyers quietly before any market exposure."
                  },
                  {
                    label: "Strategic Acquisition Themes",
                    content: "Cap rate compression, industrial intensification, automotive lease turnover, and retail plaza repositioning all create identifiable windows for strategic acquisition. These themes are tracked and communicated to registered buyers."
                  }
                ].map((b, i) => (
                  <div key={i} className="flex gap-6 p-6 border-l-2 border-primary/60 bg-card">
                    <BarChart2 className="w-6 h-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-serif text-lg text-white mb-2">{b.label}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{b.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

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
              <Button
                type="submit"
                size="lg"
                data-testid="btn-request-report"
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-sm h-14 text-base font-semibold"
              >
                Request Latest Market Report
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
