import { z } from "zod";

const envSchema = z.object({
  GATEWAY_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  MOCK_GATEWAY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
