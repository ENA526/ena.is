import { json } from "@sveltejs/kit";
import { db } from "$lib/db.js";
import crypto from "crypto";

/**
 * POST /api/bot-keys
 * Body: { key }
 */
export async function POST({ request, locals }) {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await request.json();
  if (!key) return json({ error: "Missing key" }, { status: 400 });

  // Hash the provided key
  const keyHash = crypto
    .createHash("sha256")
    .update(key)
    .digest("hex");

  // Find API key owned by user
  const res = await db.query(`
    SELECT id FROM api_keys
    WHERE key_hash = $1
      AND user_id = $2
      AND revoked = FALSE
  `, [keyHash, locals.user.id]);

  if (!res.rows.length) {
    return json({ error: "Invalid or unowned key" }, { status: 403 });
  }

  const apiKeyId = res.rows[0].id;

  // Insert into bot permission table
  await db.query(`
    INSERT INTO enabot_api_keys (api_key_id)
    VALUES ($1)
    ON CONFLICT (api_key_id) DO NOTHING
  `, [apiKeyId]);

  return json({ success: true });
}
