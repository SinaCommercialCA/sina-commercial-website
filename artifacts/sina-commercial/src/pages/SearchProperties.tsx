import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, ChevronRight, ChevronLeft, MessageSquare, Info } from "lucide-react";

/* ─── helpers ──────────────────────────────────────────────────────────────── */
function CB({
  label, checked, onChange, testId,
}: { label: string; checked: boolean; onChange: (v: boolean) => void; testId?: string }) {
  return (
    <label
      data-testid={testId}
      onClick={() => onChange(!checked)}
      className={`flex items-start gap-2.5 px-3 py-2.5 border cursor-pointer transition-all rounded-sm text-sm select-none
        ${checked ? "border-secondary bg-secondary/10 text-white" : "border-white/12 text-white/65 hover:border-white/25 hover:text-white/85"}`}
    >
      <span
        className={`mt-0.5 w-4 h-4 shrink-0 border flex items-center justify-center transition-colors
          ${checked ? "border-secondary bg-secondary" : "border-white/25"}`}
      >
        {checked && <span className="text-background text-[10px] font-bold leading-none">✓</span>}
      </span>
      <span className="leading-snug">{label}</span>
    </label>
  );
}

function RB({
  label, checked, onChange, testId,
}: { label: string; checked: boolean; onChange: () => void; testId?: string }) {
  return (
    <label
      data-testid={testId}
      onClick={onChange}
      className={`flex items-center gap-2.5 px-3 py-2.5 border cursor-pointer transition-all rounded-sm text-sm select-none
        ${checked ? "border-secondary bg-secondary/10 text-white" : "border-white/12 text-white/65 hover:border-white/25 hover:text-white/85"}`}
    >
      <span
        className={`w-4 h-4 shrink-0 border rounded-full flex items-center justify-center
          ${checked ? "border-secondary" : "border-white/25"}`}
      >
        {checked && <span className="w-2 h-2 rounded-full bg-secondary block" />}
      </span>
      {label}
    </label>
  );
}

function SH({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-serif text-base text-secondary mt-7 mb-3 first:mt-0 pb-2 border-b border-white/8">
      {children}
    </h3>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{children}</div>;
}
function Grid3({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">{children}</div>;
}

/* ─── types ─────────────────────────────────────────────────────────────────── */
interface LeadData {
  searchPurpose: string[];
  searchingAs: string;
  urgency: string;
  propertyTypes: string[];
  intendedUse: string[];
  useDescription: string;
  locations: string[];
  preferredCorridor: string;
  maxTravelDistance: string;
  sizeRequirements: { min: string; max: string; office: string };
  budget: {
    monthlyGross: string; leaseRate: string;
    purchaseBudget: string; downPayment: string; targetReturn: string;
  };
  industrialRequirements: {
    clearHeight: string; power: string; shipping: string; special: string[];
  };
  retailRequirements: string[];
  investmentProfile: {
    strategy: string[]; tenantProfile: string[]; riskProfile: string; financing: string;
  };
  timeline: string;
  contactInfo: {
    firstName: string; lastName: string; company: string;
    email: string; phone: string; whatsapp: string;
    preferredContact: string; bestTime: string;
  };
  notifications: {
    matchingAlerts: boolean; marketUpdates: boolean; offMarket: boolean; consultation: boolean;
  };
  notes: string;
}

const INIT: LeadData = {
  searchPurpose: [], searchingAs: "", urgency: "",
  propertyTypes: [], intendedUse: [], useDescription: "",
  locations: [], preferredCorridor: "", maxTravelDistance: "",
  sizeRequirements: { min: "", max: "", office: "" },
  budget: { monthlyGross: "", leaseRate: "", purchaseBudget: "", downPayment: "", targetReturn: "" },
  industrialRequirements: { clearHeight: "", power: "", shipping: "", special: [] },
  retailRequirements: [],
  investmentProfile: { strategy: [], tenantProfile: [], riskProfile: "", financing: "" },
  timeline: "",
  contactInfo: {
    firstName: "", lastName: "", company: "",
    email: "", phone: "", whatsapp: "",
    preferredContact: "", bestTime: "",
  },
  notifications: { matchingAlerts: false, marketUpdates: false, offMarket: false, consultation: false },
  notes: "",
};

function toggleArr(arr: string[], v: string): string[] {
  return arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
}

function scoreLeads(d: LeadData): { score: number; priority: string } {
  let s = 0;
  const tl: Record<string, number> = { "Immediately": 25, "Within 30 days": 20, "1–3 months": 15, "3–6 months": 10 };
  s += tl[d.timeline] ?? 0;
  if (["Investor", "Business owner / operator", "Developer"].some(t => d.searchingAs === t)) s += 15;
  if (d.searchingAs === "Franchise buyer") s += 10;
  const hiBuy = ["$5M–$10M", "$10M–$25M", "$25M+"].includes(d.budget.purchaseBudget);
  if (hiBuy) s += 25; else if (d.budget.purchaseBudget === "$2M–$5M") s += 20;
  if (["$20,000–$50,000/month", "$50,000+/month"].includes(d.budget.monthlyGross)) s += 20;
  else if (d.budget.monthlyGross === "$10,000–$20,000/month") s += 15;
  if (["$2M–$5M", "$5M+"].includes(d.budget.downPayment)) s += 20;
  else if (d.budget.downPayment === "$1M–$2M") s += 20;
  else if (d.budget.downPayment === "$500K–$1M") s += 15;
  if (d.contactInfo.phone) s += 10;
  if (d.contactInfo.whatsapp) s += 10;
  if (d.contactInfo.email) s += 5;
  if (d.notes.trim().length > 30) s += 10;
  if (d.locations.length > 0) s += 10;
  if (d.sizeRequirements.min || d.sizeRequirements.max) s += 10;
  if (d.propertyTypes.length > 0) s += 10;
  if (d.industrialRequirements.special.length > 0 || d.retailRequirements.length > 0) s += 10;
  const priority = s >= 75 ? "High Priority" : s >= 50 ? "Medium Priority" : "Standard Priority";
  return { score: s, priority };
}

const TOTAL_STEPS = 11;

const STEP_LABELS = [
  "Search Purpose",
  "Property Type",
  "Intended Use",
  "Location",
  "Size Requirements",
  "Budget / Price",
  "Industrial Requirements",
  "Retail & Business",
  "Investment Profile",
  "Timeline",
  "Contact Details",
];

/* ─── Quick Search ──────────────────────────────────────────────────────────── */
function QuickSearch() {
  const [qs, setQs] = useState({ name: "", phone: "", email: "", mode: "", type: "", area: "", size: "" });
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_type: "quick-search", payload: qs }),
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      setDone(true);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return (
    <div className="text-center py-8">
      <CheckCircle2 className="w-10 h-10 text-secondary mx-auto mb-3" />
      <p className="text-white font-serif">Thank you. We will follow up with matching opportunities.</p>
    </div>
  );

  return (
    <form data-testid="form-quick-search" onSubmit={handleQuickSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-white/75 text-sm">Name</Label>
          <Input data-testid="qs-name" placeholder="Your name"
            value={qs.name} onChange={e => setQs(q => ({ ...q, name: e.target.value }))}
            className="bg-background border-white/20 text-white placeholder:text-muted-foreground h-10" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-white/75 text-sm">Phone</Label>
          <Input data-testid="qs-phone" placeholder="416-555-0000"
            value={qs.phone} onChange={e => setQs(q => ({ ...q, phone: e.target.value }))}
            className="bg-background border-white/20 text-white placeholder:text-muted-foreground h-10" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-white/75 text-sm">Email</Label>
          <Input data-testid="qs-email" type="email" placeholder="your@email.com"
            value={qs.email} onChange={e => setQs(q => ({ ...q, email: e.target.value }))}
            className="bg-background border-white/20 text-white placeholder:text-muted-foreground h-10" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-white/75 text-sm">Lease / Buy / Invest</Label>
          <Select onValueChange={v => setQs(q => ({ ...q, mode: v }))}>
            <SelectTrigger data-testid="qs-mode" className="bg-background border-white/20 text-white h-10">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="bg-card border-white/20">
              {["Lease", "Buy", "Invest"].map(o => <SelectItem key={o} value={o} className="text-white">{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-white/75 text-sm">Property Type</Label>
          <Select onValueChange={v => setQs(q => ({ ...q, type: v }))}>
            <SelectTrigger data-testid="qs-type" className="bg-background border-white/20 text-white h-10">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-card border-white/20">
              {["Industrial", "Retail", "Office", "Investment", "Automotive", "Business With Property"].map(o =>
                <SelectItem key={o} value={o} className="text-white">{o}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-white/75 text-sm">Preferred Area</Label>
          <Input data-testid="qs-area" placeholder="e.g. Vaughan, Mississauga"
            value={qs.area} onChange={e => setQs(q => ({ ...q, area: e.target.value }))}
            className="bg-background border-white/20 text-white placeholder:text-muted-foreground h-10" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-white/75 text-sm">Size Range</Label>
        <Input data-testid="qs-size" placeholder="e.g. 3,000–10,000 SF"
          value={qs.size} onChange={e => setQs(q => ({ ...q, size: e.target.value }))}
          className="bg-background border-white/20 text-white placeholder:text-muted-foreground h-10" />
      </div>
      {error && (
        <div className="text-red-400 text-xs text-center py-2 border border-red-500/20 bg-red-500/5">
          Unable to submit. Please try again or email sina@sinacommercial.ca.
        </div>
      )}
      <Button type="submit" disabled={submitting} data-testid="btn-quick-search"
        className="w-full bg-secondary text-background hover:bg-secondary/90 rounded-sm h-11 font-semibold text-sm disabled:opacity-60">
        {submitting ? "Submitting..." : "GET MATCHING OPPORTUNITIES"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">For detailed requirements, use the full Advanced Search below.</p>
    </form>
  );
}

/* ─── Main component ────────────────────────────────────────────────────────── */
export default function SearchProperties() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<LeadData>(INIT);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");
  const wizardRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    document.title = "Search Commercial Properties GTA | Sina Commercial";
  }, []);

  const scrollToWizard = useCallback(() => {
    if (wizardRef.current) {
      const top = wizardRef.current.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  }, []);

  const goNext = () => {
    setValidationMsg("");
    setStep(s => Math.min(TOTAL_STEPS, s + 1));
    setTimeout(scrollToWizard, 80);
  };

  const goBack = () => {
    setValidationMsg("");
    setStep(s => Math.max(1, s - 1));
    setTimeout(scrollToWizard, 80);
  };

  const set = <K extends keyof LeadData>(key: K, val: LeadData[K]) =>
    setData(d => ({ ...d, [key]: val }));

  const toggleMulti = (key: "searchPurpose" | "propertyTypes" | "intendedUse" | "locations" | "retailRequirements", val: string) =>
    setData(d => ({ ...d, [key]: toggleArr(d[key] as string[], val) }));

  const handleSubmit = async () => {
    const { firstName, lastName, email, phone } = data.contactInfo;
    if (!firstName.trim() || !lastName.trim()) {
      setValidationMsg("Please enter your first and last name.");
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setValidationMsg("Please provide at least an email address or phone number.");
      return;
    }
    if (data.searchPurpose.length === 0) {
      setValidationMsg("Please indicate your search purpose in Step 1.");
      return;
    }
    setValidationMsg("");
    setSubmitting(true);

    const { score, priority } = scoreLeads(data);

    try {
      // Flatten nested structures to match API validation schema
      const { budget, industrialRequirements, investmentProfile, contactInfo, sizeRequirements, notifications, ...rest } = data;
      const flatNotifications = Object.entries(notifications)
        .filter(([, v]) => v)
        .map(([k]) => k);
      const payload = {
        ...rest,
        // flatten budget
        ...budget,
        // flatten industrial
        ...industrialRequirements,
        // flatten investment profile
        investmentProfile,
        // flatten contact
        ...contactInfo,
        // convert size strings to numbers
        sizeRequirements: {
          min: sizeRequirements.min ? Number(sizeRequirements.min.replace(/[^0-9]/g, "")) : undefined,
          max: sizeRequirements.max ? Number(sizeRequirements.max.replace(/[^0-9]/g, "")) : undefined,
          office: sizeRequirements.office ? Number(sizeRequirements.office.replace(/[^0-9]/g, "")) : undefined,
        },
        notifications: flatNotifications,
        leadScore: score,
        leadPriority: priority,
        source: "/search-properties",
      };

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_type: "advanced-search", payload }),
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setValidationMsg("Unable to submit. Please try again or email sina@sinacommercial.ca.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-2xl mx-auto">
        <CheckCircle2 className="w-16 h-16 text-secondary mx-auto mb-6" />
        <h2 className="font-serif text-3xl text-white mb-5">Thank You.</h2>
        <p className="text-muted-foreground text-lg leading-relaxed mb-4">
          Your criteria have been received. Sina Commercial will review your requirements and follow up with suitable opportunities.
        </p>
        <p className="text-white/60 text-sm mb-8">
          For urgent requests, contact Sina directly on WhatsApp: <span className="text-secondary">416-710-1109</span>
        </p>
        <a href="https://wa.me/14167101109" target="_blank" rel="noopener noreferrer"
          data-testid="btn-whatsapp-submit"
          className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-white px-8 py-3.5 rounded-sm font-medium transition-colors text-sm">
          <MessageSquare className="w-4 h-4" />
          Message Sina on WhatsApp
        </a>
      </div>
    </div>
  );

  return (
    <div className="w-full overflow-hidden">
      {/* HERO */}
      <section className="pt-16 pb-14 bg-card border-b border-white/10 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="flex items-center gap-4 mb-5">
            <div className="h-px w-10 bg-secondary" />
            <span className="text-secondary font-medium tracking-wider uppercase text-xs">Property Search</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-5">
            Search Commercial Properties Across the GTA
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-5 max-w-3xl">
            Tell us exactly what you are looking for. Sina Commercial will match your criteria with public listings, off-market opportunities, broker-network properties, and private commercial real estate opportunities across the Greater Toronto Area.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-medium text-white/50">
            {["Industrial", "Retail", "Office", "Investment", "Owner-User", "Business With Property"].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK SEARCH */}
      <section className="py-14 bg-background border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="bg-card border border-white/5 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-1.5">
              <div className="h-px w-8 bg-secondary" />
              <h2 className="font-serif text-xl text-white">Quick Commercial Search</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-6">Know what you need? Submit the basics and we will follow up with matching opportunities.</p>
            <QuickSearch />
          </div>
        </div>
      </section>

      {/* ADVANCED SEARCH WIZARD */}
      <section className="py-14 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* section heading anchor */}
          <div ref={wizardRef} style={{ scrollMarginTop: "88px" }}>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="h-px w-8 bg-primary" />
              <h2 className="font-serif text-xl text-white">Advanced Property Search</h2>
            </div>
            <div className="flex items-start gap-2 mb-8 p-3 bg-secondary/5 border border-secondary/15 rounded-sm">
              <Info className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
              <p className="text-muted-foreground text-xs leading-relaxed">
                Complete as much as you can. You may leave sections blank if they do not apply. Only your name and email or phone are required to submit.
              </p>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-secondary text-sm font-medium">Step {step} of {TOTAL_STEPS}</span>
              <span className="text-muted-foreground text-xs">{STEP_LABELS[step - 1]}</span>
            </div>
            <div className="h-1 bg-white/8 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-secondary rounded-full"
                animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between mt-2 px-0.5">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i + 1 <= step ? "bg-secondary" : "bg-white/15"}`} />
              ))}
            </div>
          </div>

          {/* STEP CARD */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="bg-card border border-white/5 p-6 sm:p-8"
            >

              {/* STEP 1 — Search Purpose */}
              {step === 1 && (
                <div>
                  <h2 className="font-serif text-xl text-white mb-1.5">Search Purpose</h2>
                  <p className="text-muted-foreground text-sm mb-6">Select all that apply to your situation.</p>
                  <SH>What are you looking for?</SH>
                  <Grid2>
                    {[
                      "Lease a commercial property", "Buy a commercial property",
                      "Invest in income-producing property", "Buy a business with property",
                      "Sell a commercial property", "Lease out my property",
                      "Explore off-market opportunities", "Not sure yet — need advisory",
                    ].map(opt => (
                      <CB key={opt} label={opt}
                        checked={data.searchPurpose.includes(opt)}
                        onChange={() => toggleMulti("searchPurpose", opt)} />
                    ))}
                  </Grid2>

                  <SH>I am searching as:</SH>
                  <Grid2>
                    {["Business owner / operator", "Investor", "Landlord", "Developer",
                      "Franchise buyer", "Broker / agent", "Family office / private capital", "Other"].map(opt => (
                      <RB key={opt} label={opt} checked={data.searchingAs === opt} onChange={() => set("searchingAs", opt)} />
                    ))}
                  </Grid2>
                </div>
              )}

              {/* STEP 2 — Property Type */}
              {step === 2 && (
                <div>
                  <h2 className="font-serif text-xl text-white mb-1.5">Property Type</h2>
                  <p className="text-muted-foreground text-sm mb-6">Select all property types that match your requirement.</p>

                  <SH>Industrial</SH>
                  <Grid3>
                    {["Industrial warehouse", "Small-bay industrial", "Flex industrial", "Manufacturing facility",
                      "Logistics / distribution", "Truck terminal", "Contractor yard", "Outside storage",
                      "Cold storage / freezer / cooler", "Crane building", "Heavy power facility",
                      "Automotive building", "Body shop", "Mechanic shop", "Tire shop",
                      "Car dealership property", "Car wash", "Self-storage", "Industrial condo", "Industrial land",
                    ].map(opt => (
                      <CB key={opt} label={opt} checked={data.propertyTypes.includes(opt)} onChange={() => toggleMulti("propertyTypes", opt)} />
                    ))}
                  </Grid3>

                  <SH>Retail / Commercial</SH>
                  <Grid3>
                    {["Retail plaza", "Street-front retail", "Restaurant / takeout", "QSR / franchise location",
                      "Medical / dental", "Pharmacy", "Convenience store", "Grocery / supermarket",
                      "Fitness / gym", "Daycare", "Banquet hall / event venue", "Showroom",
                      "Service commercial", "Automotive retail", "Gas station", "Mixed-use commercial",
                    ].map(opt => (
                      <CB key={opt} label={opt} checked={data.propertyTypes.includes(opt)} onChange={() => toggleMulti("propertyTypes", opt)} />
                    ))}
                  </Grid3>

                  <SH>Office</SH>
                  <Grid3>
                    {["Professional office", "Medical office", "Small office condo", "Office building", "Creative office", "Flex office / showroom"].map(opt => (
                      <CB key={opt} label={opt} checked={data.propertyTypes.includes(opt)} onChange={() => toggleMulti("propertyTypes", opt)} />
                    ))}
                  </Grid3>

                  <SH>Investment</SH>
                  <Grid3>
                    {["Multi-tenant industrial", "Multi-tenant retail plaza", "Mixed-use investment property",
                      "Office investment property", "Development land", "Redevelopment site",
                      "User-investor property", "Sale-leaseback opportunity", "Value-add property",
                      "Stabilized income property", "Distressed / underperforming asset",
                    ].map(opt => (
                      <CB key={opt} label={opt} checked={data.propertyTypes.includes(opt)} onChange={() => toggleMulti("propertyTypes", opt)} />
                    ))}
                  </Grid3>

                  <SH>Business With Property</SH>
                  <Grid3>
                    {["Restaurant with property", "Gas station with property", "Car wash with property",
                      "Auto business with property", "Retail business with property",
                      "Industrial business with property", "Plaza business opportunity", "Other business with real estate",
                    ].map(opt => (
                      <CB key={opt} label={opt} checked={data.propertyTypes.includes(opt)} onChange={() => toggleMulti("propertyTypes", opt)} />
                    ))}
                  </Grid3>
                </div>
              )}

              {/* STEP 3 — Intended Use */}
              {step === 3 && (
                <div>
                  <h2 className="font-serif text-xl text-white mb-1.5">Intended Use</h2>
                  <p className="text-muted-foreground text-sm mb-6">Optional. Select how you intend to use the property.</p>
                  <Grid3>
                    {["Warehousing", "Light manufacturing", "Heavy manufacturing", "Distribution",
                      "E-commerce fulfillment", "Contractor storage", "Construction business",
                      "Moving company", "Trucking / logistics", "Food production", "Commercial kitchen",
                      "Cold storage", "Automotive repair", "Auto body", "Car detailing", "Tire shop",
                      "Car sales / dealership", "Car wash", "Restaurant", "Takeout / QSR",
                      "Retail store", "Medical clinic", "Dental clinic", "Pharmacy", "Daycare",
                      "Gym / fitness", "Event venue", "Office use", "Showroom", "Storage",
                      "Investment income", "Redevelopment", "Land banking", "Franchise expansion", "Other",
                    ].map(opt => (
                      <CB key={opt} label={opt} checked={data.intendedUse.includes(opt)} onChange={() => toggleMulti("intendedUse", opt)} />
                    ))}
                  </Grid3>
                  <div className="space-y-1.5 mt-6">
                    <Label className="text-white/75 text-sm">Describe your business or investment use (optional)</Label>
                    <Textarea
                      data-testid="input-use-description"
                      placeholder="Example: mechanic shop with 3 bays, e-commerce warehouse, daycare location, retail plaza investment, etc."
                      value={data.useDescription}
                      onChange={e => set("useDescription", e.target.value)}
                      rows={3}
                      className="bg-background border-white/20 text-white placeholder:text-muted-foreground resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4 — Location */}
              {step === 4 && (
                <div>
                  <h2 className="font-serif text-xl text-white mb-1.5">Location</h2>
                  <p className="text-muted-foreground text-sm mb-6">Select preferred GTA municipalities. You may select multiple.</p>

                  {[
                    { label: "Toronto", opts: ["Toronto", "North York", "Scarborough", "Etobicoke", "Downtown Toronto", "East York", "York"] },
                    { label: "York Region", opts: ["Vaughan", "Richmond Hill", "Markham", "Newmarket", "Aurora", "Stouffville", "King", "Georgina"] },
                    { label: "Peel", opts: ["Mississauga", "Brampton", "Caledon"] },
                    { label: "Durham", opts: ["Pickering", "Ajax", "Whitby", "Oshawa", "Clarington", "Uxbridge"] },
                    { label: "Halton / West GTA", opts: ["Oakville", "Burlington", "Milton", "Halton Hills"] },
                    { label: "Other", opts: ["Hamilton", "Guelph", "Kitchener-Waterloo", "Cambridge", "Barrie", "Other Ontario market"] },
                  ].map(group => (
                    <div key={group.label}>
                      <SH>{group.label}</SH>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {group.opts.map(opt => (
                          <CB key={opt} label={opt}
                            checked={data.locations.includes(opt)}
                            onChange={() => toggleMulti("locations", opt)} />
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="space-y-1.5">
                      <Label className="text-white/75 text-sm">Preferred Intersection / Corridor</Label>
                      <Input
                        data-testid="input-corridor"
                        placeholder="e.g. Highway 400, Dufferin & Finch, 401 access"
                        value={data.preferredCorridor}
                        onChange={e => set("preferredCorridor", e.target.value)}
                        className="bg-background border-white/20 text-white placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/75 text-sm">Maximum Travel Distance</Label>
                      <Select onValueChange={v => set("maxTravelDistance", v)}>
                        <SelectTrigger data-testid="select-travel" className="bg-background border-white/20 text-white">
                          <SelectValue placeholder="Select distance" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-white/20">
                          {["Within 5 km", "Within 10 km", "Within 20 km", "Anywhere in GTA", "Open to surrounding markets"].map(o =>
                            <SelectItem key={o} value={o} className="text-white">{o}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5 — Size */}
              {step === 5 && (
                <div>
                  <h2 className="font-serif text-xl text-white mb-1.5">Size Requirements</h2>
                  <p className="text-muted-foreground text-sm mb-6">Optional. Select your preferred size range.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <SH>Minimum Size</SH>
                      <div className="space-y-2">
                        {["Under 1,000 SF", "1,000–2,000 SF", "2,000–5,000 SF", "5,000–10,000 SF",
                          "10,000–20,000 SF", "20,000–50,000 SF", "50,000+ SF"].map(opt => (
                          <RB key={opt} label={opt}
                            checked={data.sizeRequirements.min === opt}
                            onChange={() => set("sizeRequirements", { ...data.sizeRequirements, min: opt })} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <SH>Maximum Size</SH>
                      <div className="space-y-2">
                        {["Under 1,000 SF", "1,000–2,000 SF", "2,000–5,000 SF", "5,000–10,000 SF",
                          "10,000–20,000 SF", "20,000–50,000 SF", "50,000+ SF", "Flexible"].map(opt => (
                          <RB key={opt} label={opt}
                            checked={data.sizeRequirements.max === opt}
                            onChange={() => set("sizeRequirements", { ...data.sizeRequirements, max: opt })} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <SH>Office Component</SH>
                  <Grid3>
                    {["No office needed", "Small office", "5–10% office", "10–25% office", "25–50% office", "Mostly office", "Flexible"].map(opt => (
                      <RB key={opt} label={opt}
                        checked={data.sizeRequirements.office === opt}
                        onChange={() => set("sizeRequirements", { ...data.sizeRequirements, office: opt })} />
                    ))}
                  </Grid3>
                </div>
              )}

              {/* STEP 6 — Budget */}
              {step === 6 && (
                <div>
                  <h2 className="font-serif text-xl text-white mb-1.5">Budget / Price Range</h2>
                  <p className="text-muted-foreground text-sm mb-6">Optional. Select the ranges that best represent your parameters.</p>

                  <SH>Monthly Gross Lease Budget</SH>
                  <Grid3>
                    {["Under $3,000/month", "$3,000–$5,000/month", "$5,000–$10,000/month",
                      "$10,000–$20,000/month", "$20,000–$50,000/month", "$50,000+/month", "Flexible"].map(opt => (
                      <RB key={opt} label={opt}
                        checked={data.budget.monthlyGross === opt}
                        onChange={() => set("budget", { ...data.budget, monthlyGross: opt })} />
                    ))}
                  </Grid3>

                  <SH>Lease Rate Comfort</SH>
                  <Grid3>
                    {["Under $10/SF net", "$10–$15/SF net", "$15–$20/SF net", "$20–$30/SF net", "$30+/SF net", "Depends on property"].map(opt => (
                      <RB key={opt} label={opt}
                        checked={data.budget.leaseRate === opt}
                        onChange={() => set("budget", { ...data.budget, leaseRate: opt })} />
                    ))}
                  </Grid3>

                  <SH>Purchase Budget</SH>
                  <Grid3>
                    {["Under $1M", "$1M–$2M", "$2M–$5M", "$5M–$10M", "$10M–$25M", "$25M+", "Flexible"].map(opt => (
                      <RB key={opt} label={opt}
                        checked={data.budget.purchaseBudget === opt}
                        onChange={() => set("budget", { ...data.budget, purchaseBudget: opt })} />
                    ))}
                  </Grid3>

                  <SH>Down Payment / Equity Available</SH>
                  <Grid3>
                    {["Under $250K", "$250K–$500K", "$500K–$1M", "$1M–$2M", "$2M–$5M", "$5M+", "Prefer not to say yet"].map(opt => (
                      <RB key={opt} label={opt}
                        checked={data.budget.downPayment === opt}
                        onChange={() => set("budget", { ...data.budget, downPayment: opt })} />
                    ))}
                  </Grid3>

                  <SH>Target Return / Cap Rate</SH>
                  <Grid3>
                    {["4–5%", "5–6%", "6–7%", "7%+", "Value-add upside more important", "Not sure yet"].map(opt => (
                      <RB key={opt} label={opt}
                        checked={data.budget.targetReturn === opt}
                        onChange={() => set("budget", { ...data.budget, targetReturn: opt })} />
                    ))}
                  </Grid3>
                </div>
              )}

              {/* STEP 7 — Industrial Requirements */}
              {step === 7 && (
                <div>
                  <h2 className="font-serif text-xl text-white mb-1.5">Industrial Requirements</h2>
                  <p className="text-muted-foreground text-sm mb-6">Optional. Select if applicable to your property search.</p>

                  <SH>Clear Height</SH>
                  <Grid3>
                    {["Under 12'", "12'–14'", "14'–18'", "18'–22'", "22'–28'", "28'+", "Not important"].map(opt => (
                      <RB key={opt} label={opt}
                        checked={data.industrialRequirements.clearHeight === opt}
                        onChange={() => set("industrialRequirements", { ...data.industrialRequirements, clearHeight: opt })} />
                    ))}
                  </Grid3>

                  <SH>Power Requirement</SH>
                  <Grid3>
                    {["Standard power", "100A", "200A", "400A", "600A", "800A+", "Heavy power required", "Not sure"].map(opt => (
                      <RB key={opt} label={opt}
                        checked={data.industrialRequirements.power === opt}
                        onChange={() => set("industrialRequirements", { ...data.industrialRequirements, power: opt })} />
                    ))}
                  </Grid3>

                  <SH>Shipping Access</SH>
                  <Grid2>
                    {["Drive-in door required", "Truck-level door required",
                      "Multiple truck-level doors", "53' trailer access required",
                      "Shipping court required", "No shipping requirement"].map(opt => (
                      <RB key={opt} label={opt}
                        checked={data.industrialRequirements.shipping === opt}
                        onChange={() => set("industrialRequirements", { ...data.industrialRequirements, shipping: opt })} />
                    ))}
                  </Grid2>

                  <SH>Special Requirements</SH>
                  <Grid3>
                    {["Crane", "Spray booth", "Floor drains", "Outside storage", "Fenced yard",
                      "Trailer parking", "Overnight parking", "Truck repair permitted",
                      "Automotive use permitted", "Food production permitted", "Cooler/freezer",
                      "Venting", "Gas service", "High ceiling", "Heavy floor load",
                      "Multiple units side by side"].map(opt => (
                      <CB key={opt} label={opt}
                        checked={data.industrialRequirements.special.includes(opt)}
                        onChange={() => set("industrialRequirements", {
                          ...data.industrialRequirements,
                          special: toggleArr(data.industrialRequirements.special, opt)
                        })} />
                    ))}
                  </Grid3>
                </div>
              )}

              {/* STEP 8 — Retail & Business */}
              {step === 8 && (
                <div>
                  <h2 className="font-serif text-xl text-white mb-1.5">Retail &amp; Business Requirements</h2>
                  <p className="text-muted-foreground text-sm mb-6">Optional. Select any requirements that apply to your search.</p>
                  <Grid3>
                    {["Street exposure", "Plaza location", "Corner unit", "Pylon signage",
                      "High traffic location", "Parking required", "Patio potential",
                      "Restaurant venting", "Liquor license potential", "Drive-thru potential",
                      "Franchise approved site", "Medical use permitted", "Daycare permitted",
                      "Automotive retail permitted", "Separate entrance", "Loading access",
                      "Public transit nearby", "Close to residential density", "Close to highway",
                      "Close to schools", "Close to employment area"].map(opt => (
                      <CB key={opt} label={opt}
                        checked={data.retailRequirements.includes(opt)}
                        onChange={() => toggleMulti("retailRequirements", opt)} />
                    ))}
                  </Grid3>
                </div>
              )}

              {/* STEP 9 — Investment Profile */}
              {step === 9 && (
                <div>
                  <h2 className="font-serif text-xl text-white mb-1.5">Investment Profile</h2>
                  <p className="text-muted-foreground text-sm mb-6">Optional. For investment-focused searches.</p>

                  <SH>Investment Strategy</SH>
                  <Grid3>
                    {["Stable income", "Value-add", "Owner-user with investment upside",
                      "Redevelopment", "Land assembly", "Long-term hold",
                      "Short-term repositioning", "Sale-leaseback", "Distressed asset", "Off-market only"].map(opt => (
                      <CB key={opt} label={opt}
                        checked={data.investmentProfile.strategy.includes(opt)}
                        onChange={() => set("investmentProfile", {
                          ...data.investmentProfile,
                          strategy: toggleArr(data.investmentProfile.strategy, opt)
                        })} />
                    ))}
                  </Grid3>

                  <SH>Tenant Profile</SH>
                  <Grid3>
                    {["Single tenant", "Multi-tenant", "National tenant", "Local tenants",
                      "Vacant possession", "Existing income", "Lease rollover opportunity", "Flexible"].map(opt => (
                      <CB key={opt} label={opt}
                        checked={data.investmentProfile.tenantProfile.includes(opt)}
                        onChange={() => set("investmentProfile", {
                          ...data.investmentProfile,
                          tenantProfile: toggleArr(data.investmentProfile.tenantProfile, opt)
                        })} />
                    ))}
                  </Grid3>

                  <SH>Risk Profile</SH>
                  <Grid2>
                    {["Conservative", "Balanced", "Value-add", "Opportunistic", "Not sure"].map(opt => (
                      <RB key={opt} label={opt}
                        checked={data.investmentProfile.riskProfile === opt}
                        onChange={() => set("investmentProfile", { ...data.investmentProfile, riskProfile: opt })} />
                    ))}
                  </Grid2>

                  <SH>Financing</SH>
                  <Grid2>
                    {["Cash buyer", "Financing required", "Pre-approved",
                      "Need financing guidance", "Seller financing interest", "Private capital / JV interest"].map(opt => (
                      <RB key={opt} label={opt}
                        checked={data.investmentProfile.financing === opt}
                        onChange={() => set("investmentProfile", { ...data.investmentProfile, financing: opt })} />
                    ))}
                  </Grid2>
                </div>
              )}

              {/* STEP 10 — Timeline */}
              {step === 10 && (
                <div>
                  <h2 className="font-serif text-xl text-white mb-1.5">Timeline</h2>
                  <p className="text-muted-foreground text-sm mb-6">Optional. Helps us prioritize matching opportunities.</p>

                  <SH>When do you want to be in your property?</SH>
                  <Grid2>
                    {["Immediately", "Within 30 days", "1–3 months", "3–6 months",
                      "6–12 months", "12+ months", "Just researching"].map(opt => (
                      <RB key={opt} label={opt}
                        checked={data.timeline === opt}
                        onChange={() => set("timeline", opt)} />
                    ))}
                  </Grid2>

                  <SH>Search Urgency</SH>
                  <Grid2>
                    {["Very urgent", "Active search", "Exploring options", "Long-term planning"].map(opt => (
                      <RB key={opt} label={opt}
                        checked={data.urgency === opt}
                        onChange={() => set("urgency", opt)} />
                    ))}
                  </Grid2>
                </div>
              )}

              {/* STEP 11 — Contact */}
              {step === 11 && (
                <div>
                  <h2 className="font-serif text-xl text-white mb-1.5">Contact Details</h2>
                  <p className="text-muted-foreground text-sm mb-6">First name, last name, and email or phone are required. Everything else is optional.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1.5">
                      <Label className="text-white/75 text-sm">First Name <span className="text-primary">*</span></Label>
                      <Input data-testid="w-first-name" placeholder="First name"
                        value={data.contactInfo.firstName}
                        onChange={e => set("contactInfo", { ...data.contactInfo, firstName: e.target.value })}
                        className="bg-background border-white/20 text-white placeholder:text-muted-foreground" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/75 text-sm">Last Name <span className="text-primary">*</span></Label>
                      <Input data-testid="w-last-name" placeholder="Last name"
                        value={data.contactInfo.lastName}
                        onChange={e => set("contactInfo", { ...data.contactInfo, lastName: e.target.value })}
                        className="bg-background border-white/20 text-white placeholder:text-muted-foreground" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/75 text-sm">Email <span className="text-primary">*</span></Label>
                      <Input data-testid="w-email" type="email" placeholder="your@email.com"
                        value={data.contactInfo.email}
                        onChange={e => set("contactInfo", { ...data.contactInfo, email: e.target.value })}
                        className="bg-background border-white/20 text-white placeholder:text-muted-foreground" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/75 text-sm">Phone <span className="text-primary">*</span> <span className="text-muted-foreground text-xs">(or email)</span></Label>
                      <Input data-testid="w-phone" placeholder="416-555-0000"
                        value={data.contactInfo.phone}
                        onChange={e => set("contactInfo", { ...data.contactInfo, phone: e.target.value })}
                        className="bg-background border-white/20 text-white placeholder:text-muted-foreground" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/75 text-sm">Company Name</Label>
                      <Input data-testid="w-company" placeholder="Company (optional)"
                        value={data.contactInfo.company}
                        onChange={e => set("contactInfo", { ...data.contactInfo, company: e.target.value })}
                        className="bg-background border-white/20 text-white placeholder:text-muted-foreground" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/75 text-sm">WhatsApp Number</Label>
                      <Input data-testid="w-whatsapp" placeholder="WhatsApp (if different)"
                        value={data.contactInfo.whatsapp}
                        onChange={e => set("contactInfo", { ...data.contactInfo, whatsapp: e.target.value })}
                        className="bg-background border-white/20 text-white placeholder:text-muted-foreground" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1.5">
                      <Label className="text-white/75 text-sm">Preferred Contact Method</Label>
                      <Select onValueChange={v => set("contactInfo", { ...data.contactInfo, preferredContact: v })}>
                        <SelectTrigger className="bg-background border-white/20 text-white">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-white/20">
                          {["Phone", "WhatsApp", "Email", "Text message"].map(o =>
                            <SelectItem key={o} value={o} className="text-white">{o}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/75 text-sm">Best Time to Contact</Label>
                      <Select onValueChange={v => set("contactInfo", { ...data.contactInfo, bestTime: v })}>
                        <SelectTrigger className="bg-background border-white/20 text-white">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-white/20">
                          {["Morning", "Afternoon", "Evening", "Anytime"].map(o =>
                            <SelectItem key={o} value={o} className="text-white">{o}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {[
                      { key: "matchingAlerts" as const, label: "Notify me when matching opportunities become available." },
                      { key: "marketUpdates" as const, label: "I am interested in receiving GTA commercial market intelligence and updates." },
                      { key: "offMarket" as const, label: "I am open to off-market and confidential opportunities." },
                      { key: "consultation" as const, label: "I would like Sina Commercial to contact me for a consultation." },
                    ].map(item => (
                      <CB key={item.key} label={item.label}
                        checked={data.notifications[item.key]}
                        onChange={v => set("notifications", { ...data.notifications, [item.key]: v })} />
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-white/75 text-sm">Additional Notes</Label>
                    <Textarea
                      data-testid="w-notes"
                      placeholder="Tell us anything important: zoning requirements, equipment, parking needs, loading, franchise requirements, investment goals, etc."
                      value={data.notes}
                      onChange={e => set("notes", e.target.value)}
                      rows={4}
                      className="bg-background border-white/20 text-white placeholder:text-muted-foreground resize-none"
                    />
                  </div>

                  {/* VALIDATION MESSAGE */}
                  {validationMsg && (
                    <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-sm text-sm text-white">
                      {validationMsg}
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* NAV BUTTONS */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              data-testid="btn-back"
              onClick={goBack}
              disabled={step === 1}
              className="border-white/20 text-white hover:bg-white/5 rounded-sm px-6 h-11 disabled:opacity-30 text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1.5" />
              Back
            </Button>

            <span className="text-xs text-muted-foreground hidden sm:block">
              {step < TOTAL_STEPS ? "You can skip sections that don't apply" : ""}
            </span>

            {step < TOTAL_STEPS ? (
              <Button
                data-testid="btn-next"
                onClick={goNext}
                className="bg-secondary text-background hover:bg-secondary/90 rounded-sm px-6 h-11 font-semibold text-sm"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                data-testid="btn-submit-search"
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-primary hover:bg-primary/90 text-white rounded-sm px-6 h-11 font-semibold text-sm disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Search Matching Opportunities"}
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
