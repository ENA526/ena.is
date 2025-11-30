import { json } from "@sveltejs/kit";
import crypto from "crypto";
import { db } from "$lib/db.js";

export async function GET({ locals }) {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  const data = await db.query(`
    SELECT ek.id, ek.is_active, ek.created_at
    FROM enabot_api_keys ek
    JOIN api_keys k ON ek.api_key_id = k.id
    WHERE k.user_id = $1
    ORDER BY ek.created_at DESC
  `, [locals.user.id]);

  return json(data.rows);
}


export async function POST({ request, locals }) {
  if (!locals.user)
    return json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { key } = body;
  if (!key)
    return json({ error: "Missing API key" }, { status: 400 });

  // Hash before storing
  const hash = crypto.createHash("sha256").update(key).digest("hex");

  // Check ownership in main api_keys table
  const owner = await db.query(`
    SELECT id FROM api_keys
    WHERE key_hash = $1
  `, [hash]);

  if (!owner.rowCount)
    return json({ error: "Invalid API key" }, { status: 403 });

  const apiKeyId = owner.rows[0].id;

  // Link to bot table
  await db.query(`
    INSERT INTO enabot_api_keys (api_key_id)
    VALUES ($1)
    ON CONFLICT DO NOTHING
  `, [apiKeyId]);

  return json({ success: true });
}



export async function DELETE({ request, locals }) {
  if (!locals.user)
    return json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.id)
    return json({ error: "Missing key id" }, { status: 400 });

  const result = await db.query(`
    DELETE FROM api_keys
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `, [body.id, locals.user.id]);

  if (!result.rowCount)
    return json({ error: "Key not found" }, { status: 404 });

  return json({ success: true });
}


export async function PATCH({ request, locals }) {
  if (!locals.user)
    return json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const { id, action } = body ?? {};

  if (!id || !action)
    return json({ error: "Invalid request" }, { status: 400 });

  // ✅ ENABLE
  if (action === "enable") {
    const res = await db.query(`
      UPDATE api_keys
      SET is_active = TRUE
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `, [id, locals.user.id]);

    return res.rowCount
      ? json({ success: true })
      : json({ error: "Key not found" }, { status: 404 });
  }

  // ✅ DISABLE
  if (action === "disable") {
    const res = await db.query(`
      UPDATE api_keys
      SET is_active = FALSE
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `, [id, locals.user.id]);

    return res.rowCount
      ? json({ success: true })
      : json({ error: "Key not found" }, { status: 404 });
  }

  // ✅ ROTATE
  if (action === "rotate") {
    const rawKey = crypto.randomBytes(32).toString("hex");
    const keyHash = hashKey(rawKey);

    const res = await db.query(`
      UPDATE api_keys
      SET key_hash = $1,
          created_at = NOW(),
          last_used = NULL
      WHERE id = $2 AND user_id = $3
      RETURNING id
    `, [keyHash, id, locals.user.id]);

    if (!res.rowCount) {
      return json({ error: "Key not found" }, { status: 404 });
    }

    // Only return if DB write succeeded
    return json({ key: rawKey });
  }

  // ❌ Invalid action
  return json({ error: "Invalid action" }, { status: 400 });
}

