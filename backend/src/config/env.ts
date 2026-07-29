import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  PORT: z.coerce.number().int().positive(),
  DATABASE_URL: z.string().min(1),
  FRONTEND_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().min(1),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1),
  SESSION_RETENTION_DAYS: z.coerce.number().int().min(1).max(7),
  RATE_LIMIT_WINDOW: z.coerce.number().int().positive(),
  MASK_MAILER_API_URL: z.string().url().default("https://api.axemail.cloud"),
  MASK_MAILER_HEALTHCHECK_URL: z.string().url().default("https://api.axemail.cloud/health"),
  ENCRYPTION_KEY: z.string().regex(/^[0-9a-fA-F]{64}$/u, "Must be exactly 64 hexadecimal characters."),
  GMAIL_COOLDOWN_SECONDS: z.string().min(1),
  DOMAIN_COOLDOWN_SECONDS: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration.");
}

if (parsed.data.NODE_ENV === "production") {
  if (parsed.data.JWT_SECRET.toLowerCase().includes("replace") || parsed.data.JWT_SECRET.toLowerCase().includes("local-development")) {
    throw new Error("JWT_SECRET must be a production secret.");
  }
  if (/^(.)\1{63}$/u.test(parsed.data.ENCRYPTION_KEY)) {
    throw new Error("ENCRYPTION_KEY must be a production encryption key.");
  }
}

export const env = {
  ...parsed.data,
  MASK_MAILER_SEND_URL: resolveMaskMailerSendUrl(parsed.data.MASK_MAILER_API_URL),
  GMAIL_COOLDOWN_SCHEDULE: parsed.data.GMAIL_COOLDOWN_SECONDS.split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0),
  DOMAIN_COOLDOWN_SCHEDULE: parsed.data.DOMAIN_COOLDOWN_SECONDS.split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0),
};
function resolveMaskMailerSendUrl(apiUrl: string) {
  const url = new URL(apiUrl);
  const normalizedPath = url.pathname.replace(/\/+$/u, "");

  if (!normalizedPath) {
    url.pathname = "/send";
  }

  return url.toString();
}

