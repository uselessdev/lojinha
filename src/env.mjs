import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    CLERK_SECRET_KEY: z.string().min(1),
    DATABASE_URL: z.string().url(),
    SVIX_WEBHOOK_CLERK_SECRET: z.string().min(1),
    SVIX_AUTH_TOKEN: z.string().min(1),
    SVIX_PORTAL_URL: z.string().url(),
    UNKEY_APP_ID: z.string().min(1),
    UNKEY_APP_URL: z.string().url(),
    UNKEY_APP_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    SVIX_WEBHOOK_CLERK_SECRET: process.env.SVIX_WEBHOOK_CLERK_SECRET,
    SVIX_AUTH_TOKEN: process.env.SVIX_AUTH_TOKEN,
    SVIX_PORTAL_URL: process.env.SVIX_PORTAL_URL,
    UNKEY_APP_ID: process.env.UNKEY_APP_ID,
    UNKEY_APP_URL: process.env.UNKEY_APP_URL,
    UNKEY_APP_KEY: process.env.UNKEY_APP_KEY,

    // public variables ------------------------------------------------------------
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
});
