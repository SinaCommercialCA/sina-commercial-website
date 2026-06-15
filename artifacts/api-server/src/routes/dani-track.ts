import { Router, type IRouter, type Request, type Response } from "express";
import { appendRow } from "../lib/sheets";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// POST /api/track/dani — log Dani Zoning referral clicks
router.post("/track/dani", async (req: Request, res: Response) => {
  try {
    const { source_page } = req.body || {};
    const page = typeof source_page === "string" ? source_page : "unknown";

    // Fire-and-forget to Google Sheets for reporting
    appendRow("website-leads", [
      `dani-${Date.now()}`,                // Submission ID
      new Date().toISOString(),            // Timestamp
      "dani-click",                        // Form Type
      "",                                  // First Name
      "",                                  // Last Name
      "",                                  // Email
      "",                                  // Phone
      "",                                  // Company
      page,                                // Search Purpose → source page
      "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""
    ]).catch((err) => {
      logger.error({ err, page }, "Dani click tracking failed");
    });

    logger.info({ page }, "Dani click tracked");
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Dani click handler error");
    res.status(500).json({ error: "Tracking failed" });
  }
});

export default router;
