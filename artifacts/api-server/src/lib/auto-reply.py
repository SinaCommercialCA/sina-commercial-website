#!/usr/bin/env python3
"""
Website lead auto-acknowledgment — sends a receipt email to every valid
form submission via Kevin (CRE Analyst), using the existing Gmail layer.

Usage:
    python3 auto_reply.py --form contact --email jane@example.com --name "Jane Doe" --id SUB-20260614-x8k2 --dry-run
    python3 auto_reply.py --form advanced-search --email bob@site.com --name "Bob Lee" --id SUB-20260614-a1b2

Template rules:
    - Confirmation / receipt only — no promises about specific properties, prices, or availability.
    - No legal, financial, or zoning conclusions.
    - No claim that Sina has personally reviewed it yet.
    - Always includes the submission reference ID.
"""

import sys
import json
import argparse
from datetime import datetime, timezone

# Allow running from repo-root or the gmail_send directory
try:
    from gmail_send import send_agent_email
except ModuleNotFoundError:
    from gmail_send.sender import send_agent_email  # fallback if running as script

AGENT = "kevin"
PURPOSE = "lead_acknowledgment"
FROM_DISPLAY = "Kevin (Sina Commercial RE)"
FROM_EMAIL = "kevin@sinacommercial.ca"


# ── Templates ─────────────────────────────────────────────────────
# Format keys: {name}, {submission_id}, {form_label}
# DO NOT: mention specific properties, prices, or claim human review.

TEMPLATES = {
    "contact": {
        "subject": "We received your inquiry — {submission_id}",
        "body": """Hi {name},

Thank you for reaching out to Sina Commercial Real Estate. We've received your inquiry and it's been logged in our system.

Reference: {submission_id}

Your message will be reviewed by our team. If your inquiry falls within our focus areas — industrial, commercial, automotive, or investment properties in the GTA — someone will follow up with you shortly.

If you have urgent questions in the meantime, you can reply to this email or reach Sina directly at sina@sinacommercial.ca.

Best regards,
Kevin
Sina Commercial Real Estate
sinacommercial.ca""",
    },

    "quick-search": {
        "subject": "We received your property search — {submission_id}",
        "body": """Hi {name},

Thank you for using the Quick Search. Your request has been received and logged.

Reference: {submission_id}

Our system will compare your criteria against current opportunities. If matching properties are found, a member of our team will follow up with relevant options — typically within 1–2 business days.

In the meantime, you can browse our full inventory anytime at sinacommercial.ca/opportunities.

Best regards,
Kevin
Sina Commercial Real Estate
sinacommercial.ca""",
    },

    "advanced-search": {
        "subject": "We received your detailed search — {submission_id}",
        "body": """Hi {name},

Thank you for submitting your detailed property search. Your criteria have been received and logged in our system.

Reference: {submission_id}

Our team will review your requirements and compare them against our database of GTA commercial opportunities. If there's a strong match, someone will follow up with curated options — typically within 1–2 business days.

You can also browse live opportunities at sinacommercial.ca/opportunities at any time.

Best regards,
Kevin
Sina Commercial Real Estate
sinacommercial.ca""",
    },

    "market-report": {
        "subject": "We received your market report request — {submission_id}",
        "body": """Hi {name},

Thank you for your interest in GTA commercial real estate market intelligence. Your report request has been received.

Reference: {submission_id}

Our team will prepare a market overview for the areas and property types you selected. We'll send it to this email address once it's compiled.

In the meantime, you can view our current market intelligence at sinacommercial.ca/market-intelligence.

Best regards,
Kevin
Sina Commercial Real Estate
sinacommercial.ca""",
    },
}


# ── Helpers ───────────────────────────────────────────────────────

def build_email(form_type: str, name: str, submission_id: str) -> dict:
    """Return {subject, body} for the given form type, or raises KeyError."""
    tpl = TEMPLATES.get(form_type)
    if not tpl:
        raise KeyError(
            f"Unknown form type '{form_type}'. Valid: {sorted(TEMPLATES.keys())}"
        )

    safe_name = name.strip() or "there"
    safe_id = submission_id.strip() or "N/A"

    return {
        "subject": tpl["subject"].format(name=safe_name, submission_id=safe_id),
        "body": tpl["body"].format(name=safe_name, submission_id=safe_id),
    }


def main():
    parser = argparse.ArgumentParser(
        description="Send lead acknowledgment email via Kevin (Gmail Sending Layer)"
    )
    parser.add_argument("--form", required=True,
                        choices=["contact", "quick-search", "advanced-search", "market-report"])
    parser.add_argument("--email", required=True)
    parser.add_argument("--name", default="there")
    parser.add_argument("--id", dest="submission_id", default="N/A",
                        help="Submission reference ID")
    parser.add_argument("--dry-run", action="store_true",
                        help="Validate and log without sending")
    args = parser.parse_args()

    # Build message
    try:
        msg = build_email(args.form, args.name, args.submission_id)
    except KeyError as e:
        print(json.dumps({"status": "error", "reason": str(e)}))
        sys.exit(1)

    # Send
    result = send_agent_email(
        agent=AGENT,
        to=args.email,
        subject=msg["subject"],
        body=msg["body"],
        purpose=PURPOSE,
        dry_run=args.dry_run,
    )

    # Always output JSON result
    print(json.dumps(result, default=str))

    # Exit non-zero on failures so the caller can detect them
    if result.get("status") not in ("sent", "dry_run"):
        sys.exit(1)


if __name__ == "__main__":
    main()
