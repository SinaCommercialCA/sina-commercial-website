import React from "react";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, Loader2 } from "lucide-react";
import type { PublicListing } from "@/lib/api-types";

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface Props {
  listing: PublicListing;
  onClose: () => void;
}

type Status = "idle" | "submitting" | "success" | "error";

export default function ListingRequestModal({ listing, onClose }: Props) {
  const [form, setForm] = React.useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = React.useState<Status>("idle");
  const [errorMsg, setErrorMsg] = React.useState("");

  const update = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const isValid = form.name.trim() && form.email.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/listings/request-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listing.listing_id,
          listing_title: listing.title,
          page_url: window.location.href,
          source_detail: "Listing Request",
          ...form,
        }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(
          (data as { error?: string }).error ||
            "Something went wrong. Please try again."
        );
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={status !== "submitting" ? onClose : undefined}
      />

      {/* card */}
      <div className="relative w-full max-w-md bg-card border border-white/10 rounded-sm p-6 shadow-2xl">
        {status === "success" ? (
          /* ── Success state ── */
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="font-serif text-xl text-white mb-2">
              Request Sent
            </h3>
            <p className="text-muted-foreground text-sm mb-1">
              We've received your request for:
            </p>
            <p className="text-secondary font-medium text-sm mb-4">
              {listing.title}
            </p>
            <p className="text-muted-foreground text-xs mb-6">
              Sina will review your request and get back to you shortly,
              typically within a few hours during business days.
            </p>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-primary/40 text-white hover:bg-primary hover:border-primary rounded-sm w-full"
            >
              Close
            </Button>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            {/* header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-serif text-lg text-white">
                  Request Details
                </h3>
                <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                  {listing.title}
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={status === "submitting"}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* listing preview */}
            <div className="flex gap-3 mb-5 p-3 bg-background border border-white/5 rounded-sm">
              <div className="w-16 h-12 shrink-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-sm overflow-hidden">
                <img
                  src={listing.image_url || "/images/fallback/industrial-warehouse.jpg"}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">
                  {listing.title}
                </p>
                <p className="text-muted-foreground text-[10px]">
                  {listing.city} · {listing.deal_type} ·{" "}
                  {listing.size_range || `${listing.size_sqft?.toLocaleString() ?? "—"} SF`}
                </p>
              </div>
            </div>

            {/* form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="name"
                placeholder="Your Name *"
                required
                value={form.name}
                onChange={update("name")}
                disabled={status === "submitting"}
                className="w-full px-3 py-2 bg-background border border-white/10 rounded-sm text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-secondary disabled:opacity-50"
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address *"
                required
                value={form.email}
                onChange={update("email")}
                disabled={status === "submitting"}
                className="w-full px-3 py-2 bg-background border border-white/10 rounded-sm text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-secondary disabled:opacity-50"
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={update("phone")}
                disabled={status === "submitting"}
                className="w-full px-3 py-2 bg-background border border-white/10 rounded-sm text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-secondary disabled:opacity-50"
              />

              <textarea
                name="message"
                placeholder="Message (optional)"
                rows={2}
                value={form.message}
                onChange={update("message")}
                disabled={status === "submitting"}
                className="w-full px-3 py-2 bg-background border border-white/10 rounded-sm text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-secondary resize-none disabled:opacity-50"
              />

              {status === "error" && (
                <p className="text-red-400 text-xs">{errorMsg}</p>
              )}

              <Button
                type="submit"
                disabled={!isValid || status === "submitting"}
                className="w-full bg-secondary text-background hover:bg-secondary/90 rounded-sm h-10 text-sm font-medium disabled:opacity-50"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Request"
                )}
              </Button>

              <p className="text-muted-foreground text-[10px] text-center">
                Your information is never shared. Sina will respond personally.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
