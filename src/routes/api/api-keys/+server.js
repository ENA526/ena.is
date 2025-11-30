import { json } from "@sveltejs/kit";
import crypto from "crypto";
import { db } from "$lib/db.js";

export async function GET({ locals }) {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  const { rows } = await db.query(`
    SELECT id, name, is_active, last_used, created_at
    FROM api_keys
    WHERE user_id = $1
    ORDER BY created_at DESC
  `, [locals.user.id]);

  return json(rows);
}

function hashKey(k) {
  return crypto.createHash("sha256").update(k).digest("hex");
}

export async function POST({ locals }) {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  const raw = crypto.randomBytes(32).toString("hex");
  const hash = hashKey(raw);

  await db.query(`
    INSERT INTO api_keys (user_id, key_hash)
    VALUES ($1, $2)
  `, [locals.user.id, hash]);

  return json({ key: raw });
}


export async function DELETE({ request, locals }) {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();

  const res = await db.query(`
    DELETE FROM api_keys
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `, [id, locals.user.id]);

  if (!res.rowCount)
    return json({ error: "Not found" }, { status: 404 });

  return json({ success: true });
}


export async function PATCH({ request, locals }) {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  const { id, action } = await request.json();

  if (!id || !action)
    return json({ error: "Bad request" }, { status: 400 });

  // enable / disable
  if (action === "enable" || action === "disable") {
    const value = action === "enable";

    await db.query(`
      UPDATE api_keys
      SET is_active = $1
      WHERE id = $2 AND user_id = $3
    `, [value, id, locals.user.id]);

    return json({ success: true });
  }

  // rotate
  if (action === "rotate") {
    const raw = crypto.randomBytes(32).toString("hex");
    const hash = hashKey(raw);

    const res = await db.query(`
      UPDATE api_keys
      SET key_hash = $1,
          created_at = NOW(),
          last_used = NULL
      WHERE id = $2 AND user_id = $3
      RETURNING id
    `, [hash, id, locals.user.id]);

    if (!res.rowCount)
      return json({ error: "Not found" }, { status: 404 });

    return json({ key: raw });
  }

  return json({ error: "Invalid action" }, { status: 400 });
}


