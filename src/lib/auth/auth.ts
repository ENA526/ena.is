import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
import { customSession } from "better-auth/plugins"; // ✅ ADD THIS

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
      avatar_url:   { type: "string", required: false },
      bio:          { type: "string", required: false },
      timezone:     { type: "string", required: false },
      theme:        { type: "string", required: false, defaultValue: "light" },
      language:     { type: "string", required: false, defaultValue: "en" }
    }
  },

  session: {
        additionalFields: {
            display_name: { type: "string" },
            avatar_url:   { type: "string" },
            theme:        { type: "string", defaultValue: "light" },
            language:     { type: "string", defaultValue: "en" }
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

    // ✅ SESSION ENRICHMENT (NO DB MUTATION)
    customSession(async ({ user, session }) => {
      return {
        user: {
          ...user,
          display_name: "display_name",
          avatar_url: "avatar_url",
          theme: "theme",
          language: "language",
        },
        session,
      };
    }),

    // MUST BE LAST
    sveltekitCookies(getRequestEvent),
  ],
});
