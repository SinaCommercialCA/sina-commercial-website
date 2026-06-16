import { Router, type IRouter, type Request, type Response } from "express";
import { appendRow, readSheet } from "../lib/sheets";
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

// GET /api/track/dani/stats — return Dani click stats (7d, 30d, by source)
router.get("/track/dani/stats", async (_req: Request, res: Response) => {
  try {
    const rows = await readSheet("website-leads");
    const daniRows = rows.filter((r) => r["form type"] === "dani-click" || r["form_type"] === "dani-click");

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const parseTimestamp = (r: Record<string, any>): Date | null => {
      const ts = r["timestamp"] || r["created_at"] || r["date"];
      if (!ts) return null;
      const d = new Date(ts);
      return isNaN(d.getTime()) ? null : d;
    };

    const bySource = (since: Date) => {
      const counts: Record<string, number> = { navbar: 0, homepage: 0, "search-properties": 0, other: 0 };
      for (const r of daniRows) {
        const d = parseTimestamp(r);
        if (d && d >= since) {
          const page = (r["search purpose"] || r["search_purpose"] || r["source_page"] || "other").toString().toLowerCase().trim();
          if (page === "navbar") counts.navbar++;
          else if (page === "homepage") counts.homepage++;
          else if (page === "search-properties" || page === "search_properties") counts["search-properties"]++;
          else counts.other++;
        }
      }
      return counts;
    };

    const stats7d = bySource(sevenDaysAgo);
    const stats30d = bySource(thirtyDaysAgo);

    const total7d = Object.values(stats7d).reduce((a, b) => a + b, 0);
    const total30d = Object.values(stats30d).reduce((a, b) => a + b, 0);
    const totalAll = daniRows.length;

    res.json({
      success: true,
      data: {
        total_all_time: totalAll,
        last_7_days: { total: total7d, ...stats7d },
        last_30_days: { total: total30d, ...stats30d },
      },
    });
  } catch (err) {
    logger.error({ err }, "Dani stats fetch failed");
    res.status(500).json({ error: "Failed to fetch Dani stats" });
  }
});

export default router;
