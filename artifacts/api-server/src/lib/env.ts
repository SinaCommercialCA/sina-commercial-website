function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required but was not provided.`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const env = {
  PIPEDRIVE_API_TOKEN: required("PIPEDRIVE_API_TOKEN"),
  PIPEDRIVE_BASE_URL: optional("PIPEDRIVE_BASE_URL", "https://sinacommercial.pipedrive.com/api/v1"),

  GOOGLE_SERVICE_ACCOUNT_JSON: required("GOOGLE_SERVICE_ACCOUNT_JSON"),
  GOOGLE_SHEET_ID: required("GOOGLE_SHEET_ID"),

  TELEGRAM_BOT_TOKEN: required("TELEGRAM_BOT_TOKEN"),
  TELEGRAM_CHAT_ID: required("TELEGRAM_CHAT_ID"),

  RATE_LIMIT_PER_IP: Number(optional("RATE_LIMIT_PER_IP", "10")),
  RATE_LIMIT_WINDOW_SEC: Number(optional("RATE_LIMIT_WINDOW_SEC", "3600")),

  NODE_ENV: optional("NODE_ENV", "development"),
};
