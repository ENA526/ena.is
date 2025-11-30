import { json } from "@sveltejs/kit";
import { db } from "$lib/db.js";
import crypto from "crypto";

/**
 * POST /api/bot-keys
 * Body: { key }
 */
export async function POST({ request, locals }) {
  if (!locals.user)
    return json({ error: "Unauthorized" }, { status: 401 });

  const { key } = await request.json();
  if (!key)
    return json({ error: "Missing key" }, { status: 400 });

  const keyHash = crypto.createHash("sha256").update(key).digest("hex");

  const res = await db.query(`
    SELECT id FROM api_keys
    WHERE key_hash = $1
      AND user_id = $2
      AND is_active = TRUE
  `, [keyHash, locals.user.id]);

  if (!res.rows.length)
    return json({ error: "Invalid or inactive key" }, { status: 403 });

  const apiKeyId = res.rows[0].id;

  await db.query(`
    INSERT INTO enabot_api_keys (api_key_id)
    VALUES ($1)
    ON CONFLICT (api_key_id) DO NOTHING
  `, [apiKeyId]);

  return json({ success: true });
}

export async function GET({ locals }) {
  if (!locals.user)
    return json({ error: "Unauthorized" }, { status: 401 });

  const { rows } = await db.query(`
    SELECT ak.id, ak.created_at
    FROM enabot_api_keys e
    JOIN api_keys ak ON e.api_key_id = ak.id
    WHERE ak.user_id = $1
  `, [locals.user.id]);

  return json(rows);
}

export async function DELETE({ request, locals }) {
  if (!locals.user)
    return json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();

  await db.query(`
    DELETE FROM enabot_api_keys e
    USING api_keys k
    WHERE e.api_key_id = k.id
      AND e.api_key_id = $1
      AND k.user_id = $2
  `, [id, locals.user.id]);

  return json({ success: true });
}
