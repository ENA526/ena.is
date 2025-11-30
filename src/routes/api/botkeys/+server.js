import { json } from "@sveltejs/kit";
import crypto from "crypto";
import { db } from "$lib/db.js";

/**
 * GET /api/apikeys
 * List API keys for logged-in user
 */
export async function GET({ locals }) {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  const result = await db.query(`
    SELECT id, key, is_active, last_used, created_at
    FROM enabot_api_keys
    WHERE account_id = $1
    ORDER BY created_at DESC
  `, [locals.user.id]);

  return json(result.rows);
}

/**
 * POST /api/apikeys
 * Create a new API key
 */
export async function POST({ locals }) {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = crypto.randomBytes(32).toString("hex");

  const result = await db.query(`
    INSERT INTO enabot_api_keys (key, account_id)
    VALUES ($1, $2)
    RETURNING id, key, created_at
  `, [apiKey, locals.user.id]);

  return json(result.rows[0]);
}

/**
 * DELETE /api/apikeys?id=<keyId>
 * Revoke an API key
 */
export async function DELETE({ url, locals }) {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  const id = url.searchParams.get("id");
  if (!id) return json({ error: "Missing key id" }, { status: 400 });

  const result = await db.query(`
    DELETE FROM enabot_api_keys
    WHERE id = $1 AND account_id = $2
    RETURNING id
  `, [id, locals.user.id]);

  if (!result.rowCount)
    return json({ error: "Key not found" }, { status: 404 });

  return json({ success: true });
}

/**
 * PATCH /api/apikeys
 * Body:
 * { id, action: "enable" | "disable" | "rotate" }
 */
export async function PATCH({ request, locals }) {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  const { id, action } = await request.json();
  if (!id || !action) return json({ error: "Missing fields" }, { status: 400 });

  // ✅ ENABLE
  if (action === "enable") {
    const res = await db.query(`
      UPDATE enabot_api_keys
      SET is_active = TRUE
      WHERE id = $1 AND account_id = $2
      RETURNING id
    `, [id, locals.user.id]);

    return res.rowCount
      ? json({ success: true })
      : json({ error: "Key not found" }, { status: 404 });
  }

  // ✅ DISABLE
  if (action === "disable") {
    const res = await db.query(`
      UPDATE enabot_api_keys
      SET is_active = FALSE
      WHERE id = $1 AND account_id = $2
      RETURNING id
    `, [id, locals.user.id]);

    return res.rowCount
      ? json({ success: true })
      : json({ error: "Key not found" }, { status: 404 });
  }

  // ✅ ROTATE KEY
  if (action === "rotate") {
    const newKey = crypto.randomBytes(32).toString("hex");

    const res = await db.query(`
      UPDATE enabot_api_keys
      SET key = $1,
          last_used = NULL,
          created_at = NOW()
      WHERE id = $2 AND account_id = $3
      RETURNING key
    `, [newKey, id, locals.user.id]);

    return res.rowCount
      ? json({ key: res.rows[0].key })
      : json({ error: "Key not found" }, { status: 404 });
  }

  return json({ error: "Invalid action" }, { status: 400 });
}

// DELETE – hard delete
export async function DELETE({ locals, request }) {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();

  await db.query(`
    DELETE FROM enabot_api_keys
    WHERE id = $1 AND account_id = $2
  `, [id, locals.user.id]);

  return json({ ok: true });
}
