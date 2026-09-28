import 'dotenv/config';

function parsePort(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? '', 10);

  return Number.isNaN(parsed) ? fallback : parsed;
}

export const port = parsePort(process.env.PORT, 8000);

export const redisUsername = process.env.REDIS_USERNAME ?? 'default';
export const redisPassword = process.env.REDIS_PASSWORD;
export const redisHost = process.env.REDIS_HOST ?? 'hyperstable-wing-change-84301.db.redis.io';
export const redisPort = parsePort(process.env.REDIS_PORT, 10074);

export const databaseUrl = process.env.DATABASE_URL ?? '';
export const DATABASE_URL = databaseUrl;

export const whatsappAccessToken = process.env.WHATSAPP_ACCESS_TOKEN ?? '';
export const whatsappPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID ?? '';
export const whatsappApiVersion = process.env.WHATSAPP_API_VERSION ?? 'v23.0';
