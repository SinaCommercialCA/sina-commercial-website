import { env } from "./env";
import { logger } from "./logger";

const BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = env.TELEGRAM_CHAT_ID;

interface LeadSummary {
  submissionId: string;
  formType: string;
  name: string;
  email: string;
  phone?: string;
  dealType?: string;
  useType?: string;
  area?: string;
  timeline?: string;
  score?: number;
  summary: string;
}

export async function notifySina(lead: LeadSummary): Promise<void> {
  const scoreLabel = lead.score != null ? ` [Score: ${lead.score}]` : "";
  const formLabel = formTypeLabel(lead.formType);

  const text = [
    `📥 *New Website Lead${scoreLabel}*`,
    `━━━━━━━━━━━━━━━━━━`,
    `*${lead.name}*`,
    `${lead.email}${lead.phone ? ` | ${lead.phone}` : ""}`,
    ``,
    `${formLabel}`,
    lead.summary,
    ``,
    `🆔 \`${lead.submissionId}\``,
  ].join("\n");

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      logger.error({ status: res.status, body }, "Telegram notification failed");
      return;
    }

    logger.info({ submissionId: lead.submissionId }, "Telegram notification sent");
  } catch (err) {
    logger.error({ err }, "Telegram notification error");
  }
}

function formTypeLabel(formType: string): string {
  switch (formType) {
    case "contact":
      return "📝 Contact Form";
    case "advanced-search":
      return "🔍 Advanced Property Search";
    case "quick-search":
      return "⚡ Quick Search";
    case "market-report":
      return "📊 Market Report Request";
    default:
      return `📋 ${formType}`;
  }
}
