import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";

const ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://ena.is",
  "https://www.ena.is",      // if you serve on www too
  // add preview domains if you have them, e.g. Vercel/Render/Netlify:
  // "https://ena-preview-*.vercel.app"  // only if Better Auth supports wildcards; otherwise list each
];

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export const auth = betterAuth({
  trustedOrigins: ORIGINS,
  database: pool,
  socialProviders: {
        github: { 
            clientId: process.env.GITHUB_CLIENT_ID as string, 
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
        },
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    sveltekitCookies(getRequestEvent), // must be last
  ],
});
