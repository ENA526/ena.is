import { json } from "@sveltejs/kit";
import crypto from "crypto";
import { db } from "$lib/db.js";

export async function GET({ locals }) {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  const { rows } = await db.query(`
    SELECT id, name, is_active, created_at, last_used
    FROM api_keys
    WHERE user_id = $1
    ORDER BY created_at DESC
  `, [locals.user.id]);

  return json(rows);
}

import { hashKey } from "$lib/crypto.js";

export async function POST({ locals, request }) {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  let name = "Default";

  try {
    const body = await request.json();
    name = body?.name || "Default";
  } catch {
    // no body — keep default name
  }


  const rawKey = crypto.randomBytes(32).toString("hex");
  const keyHash = hashKey(rawKey);

  await db.query(`
    INSERT INTO api_keys (key_hash, name, user_id)
    VALUES ($1, $2, $3)
  `, [
    keyHash,
    name || "Default",
    locals.user.id
  ]);

  return json({ key: rawKey });   // show ONCE
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

