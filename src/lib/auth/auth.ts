import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";

const ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://ena.is",
  "https://www.ena.is",
];

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});

export const auth = betterAuth({
  trustedOrigins: ORIGINS,
  database: pool,

  // ✅ USER PROFILE FIELDS (PERSISTED IN DB)
  user: {
    additionalFields: {
      display_name: { type: "string", required: false },
      full_name:    { type: "string", required: false },
      bio:          { type: "string", required: false },
      timezone:     { type: "string", required: false },
      theme:        { type: "string", required: false, defaultValue: "light" },
      language:     { type: "string", required: false, defaultValue: "en" }
    }
  },

  socialProviders: {
    github:  {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      redirectURI: "https://ena.is/api/auth/callback/github",
    },
    google:  {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: "https://ena.is/api/auth/callback/google",
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      redirectURI: "https://ena.is/api/auth/callback/discord",
    },
  },

  emailAndPassword: {
    enabled: true,
  },

  plugins: [
    // MUST BE LAST
    sveltekitCookies(getRequestEvent),
  ],
});
