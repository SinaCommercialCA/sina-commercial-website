import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MessageSquare, MapPin, CheckCircle2 } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

const INQUIRY_TYPES = [
  "Looking to lease",
  "Looking to buy",
  "Investor inquiry",
  "Selling / leasing my property",
  "Market report request",
  "Off-market opportunity inquiry",
  "General question",
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", company: "", email: "",
    phone: "", inquiryType: "", message: ""
  });

  React.useEffect(() => {
    document.title = "Contact Sina Commercial | GTA Commercial Real Estate";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(false);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_type: "contact",
          payload: form,
        }),
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
      {/* HERO */}
      <section className="pt-20 pb-20 bg-card border-b border-white/10 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-3xl">
            <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-6">
              <div className="h-px w-12 bg-secondary" />
              <span className="text-secondary font-medium tracking-wider uppercase text-sm">Contact</span>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="font-serif text-4xl md:text-5xl text-white mb-6">
              Contact Sina Commercial
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground leading-relaxed">
              For commercial property searches, confidential opportunities, investment advisory, landlord representation, or market intelligence requests, contact Sina Commercial directly.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

            {/* CONTACT INFO */}
            <motion.div
              initial="hidden" animate="visible" variants={staggerContainer}
              className="lg:col-span-5"
            >
              <motion.div variants={fadeInUp} className="bg-card border border-white/5 p-10 mb-8">
                <div className="h-px w-12 bg-secondary mb-8" />
                <h2 className="font-serif text-2xl text-white mb-2">Sina Shahravan</h2>
                <p className="text-secondary font-medium text-sm mb-1">Vice President, Sales Associate</p>
                <p className="text-muted-foreground text-sm mb-8">Nave Real Estate Brokerage Inc.</p>

                <div className="space-y-5">
                  <a
                    href="tel:4167101109"
                    data-testid="link-call-mobile"
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 bg-background border border-white/10 flex items-center justify-center shrink-0 group-hover:border-secondary/50 transition-colors">
                      <Phone className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">Mobile</div>
                      <div className="text-white group-hover:text-secondary transition-colors">416-710-1109</div>
                    </div>
                  </a>
                  <a
                    href="tel:9055563232"
                    data-testid="link-call-office"
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 bg-background border border-white/10 flex items-center justify-center shrink-0 group-hover:border-secondary/50 transition-colors">
                      <Phone className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">Office</div>
                      <div className="text-white group-hover:text-secondary transition-colors">905-556-3232</div>
                    </div>
                  </a>
                  <a
                    href="mailto:sina@sinacommercial.ca"
                    data-testid="link-email"
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 bg-background border border-white/10 flex items-center justify-center shrink-0 group-hover:border-secondary/50 transition-colors">
                      <Mail className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">Email</div>
                      <div className="text-white group-hover:text-secondary transition-colors">sina@sinacommercial.ca</div>
                    </div>
                  </a>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-background border border-white/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">Location</div>
                      <div className="text-white">Greater Toronto Area, Ontario</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* CTA BUTTONS */}
              <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href="tel:4167101109"
                  data-testid="btn-call-sina"
                  className="flex flex-col items-center justify-center gap-2 py-4 px-3 border border-white/20 hover:border-secondary/50 hover:bg-card transition-all text-center"
                >
                  <Phone className="w-5 h-5 text-secondary" />
                  <span className="text-sm text-white font-medium">Call Sina</span>
                </a>
                <a
                  href="https://wa.me/14167101109"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="btn-whatsapp"
                  className="flex flex-col items-center justify-center gap-2 py-4 px-3 bg-primary/90 hover:bg-primary transition-all text-center"
                >
                  <MessageSquare className="w-5 h-5 text-white" />
                  <span className="text-sm text-white font-medium">WhatsApp</span>
                </a>
                <a
                  href="mailto:sina@sinacommercial.ca"
                  data-testid="btn-email-sina"
                  className="flex flex-col items-center justify-center gap-2 py-4 px-3 border border-white/20 hover:border-secondary/50 hover:bg-card transition-all text-center"
                >
                  <Mail className="w-5 h-5 text-secondary" />
                  <span className="text-sm text-white font-medium">Email Sina</span>
                </a>
              </motion.div>
            </motion.div>

            {/* CONTACT FORM */}
            <motion.div
              initial="hidden" animate="visible" variants={staggerContainer}
              className="lg:col-span-7"
            >
              {submitted ? (
                <motion.div variants={fadeInUp} className="text-center py-20">
                  <CheckCircle2 className="w-16 h-16 text-secondary mx-auto mb-6" />
                  <h3 className="font-serif text-2xl text-white mb-4">Inquiry Received</h3>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Thank you for reaching out. Sina Commercial will follow up with you shortly.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  variants={fadeInUp}
                  onSubmit={handleSubmit}
                  data-testid="form-contact"
                  className="space-y-6"
                >
                  {/* Honeypot — hidden from humans, filled by bots */}
                  <div style={{ position: "absolute", left: "-9999px", opacity: 0 }} aria-hidden="true">
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                  </div>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-px w-12 bg-primary" />
                    <h2 className="font-serif text-2xl text-white">Send an Inquiry</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="c-firstName" className="text-white/80">First Name</Label>
                      <Input
                        id="c-firstName"
                        data-testid="input-first-name"
                        placeholder="First name"
                        value={form.firstName}
                        onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                        className="bg-card border-white/20 text-white placeholder:text-muted-foreground"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="c-lastName" className="text-white/80">Last Name</Label>
                      <Input
                        id="c-lastName"
                        data-testid="input-last-name"
                        placeholder="Last name"
                        value={form.lastName}
                        onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                        className="bg-card border-white/20 text-white placeholder:text-muted-foreground"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="c-company" className="text-white/80">Company</Label>
                      <Input
                        id="c-company"
                        data-testid="input-company"
                        placeholder="Company name (optional)"
                        value={form.company}
                        onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                        className="bg-card border-white/20 text-white placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="c-phone" className="text-white/80">Phone</Label>
                      <Input
                        id="c-phone"
                        data-testid="input-phone"
                        placeholder="416-555-0000"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        className="bg-card border-white/20 text-white placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="c-email" className="text-white/80">Email</Label>
                    <Input
                      id="c-email"
                      type="email"
                      data-testid="input-email"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="bg-card border-white/20 text-white placeholder:text-muted-foreground"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80">Inquiry Type</Label>
                    <Select onValueChange={v => setForm(f => ({ ...f, inquiryType: v }))}>
                      <SelectTrigger data-testid="select-inquiry-type" className="bg-card border-white/20 text-white">
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-white/20">
                        {INQUIRY_TYPES.map(t => (
                          <SelectItem key={t} value={t} className="text-white hover:bg-white/5">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="c-message" className="text-white/80">Message</Label>
                    <Textarea
                      id="c-message"
                      data-testid="input-message"
                      placeholder="Please describe your commercial real estate needs, property type, location, size requirements, timeline, or any other relevant details."
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      rows={6}
                      className="bg-card border-white/20 text-white placeholder:text-muted-foreground resize-none"
                      required
                    />
                  </div>

                  {submitError && (
                    <div className="text-red-400 text-sm text-center py-2 border border-red-500/20 bg-red-500/5">
                      Unable to send your inquiry. Please try again or email sina@sinacommercial.ca.
                    </div>
                  )}
                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    data-testid="btn-send-inquiry"
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-sm h-14 text-base font-semibold btn-lift btn-lift-red disabled:opacity-60"
                  >
                    {submitting ? "Sending..." : "Send Inquiry"}
                  </Button>
                </motion.form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
