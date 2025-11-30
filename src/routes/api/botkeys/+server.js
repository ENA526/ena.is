import { json } from "@sveltejs/kit";
import crypto from "crypto";
import { db } from "$lib/db";

export async function GET({ locals }) {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await db.query(`
    SELECT id, is_active, last_used, created_at
    FROM enabot_api_keys
    WHERE account_id = $1
  `, [locals.user.id]);

  return json(result.rows);
}

export async function POST({ locals }) {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = crypto.randomBytes(32).toString("hex");

  await db.query(`
    INSERT INTO enabot_api_keys (key, account_id)
    VALUES ($1, $2)
  `, [apiKey, locals.user.id]);

  return json({ key: apiKey });
}
