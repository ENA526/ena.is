import { json } from "@sveltejs/kit";
import crypto from "crypto";
import { db } from "$lib/db.js";


export async function GET({ locals }) {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  const { rows } = await db.query(`
    SELECT id, name, is_active, created_at, last_used
    FROM enabot_api_keys
    WHERE user_id = $1
    ORDER BY created_at DESC
  `, [locals.user.id]);

  return json(rows);
}

export async function POST({ locals, request }) {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await request.json();
  const key = crypto.randomBytes(32).toString("hex");

  await db.query(`
    INSERT INTO enabot_api_keys (key, name, user_id)
    VALUES ($1, $2, $3)
  `, [
    key,
    name || "Default",
    locals.user.id
  ]);

  return json({ key });
}

export async function DELETE({ url, locals }) {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  const id = url.searchParams.get("id");
  if (!id) return json({ error: "Missing id" }, { status: 400 });

  const { rowCount } = await db.query(`
    DELETE FROM enabot_api_keys
    WHERE id = $1 AND user_id = $2
  `, [id, locals.user.id]);

  if (!rowCount) {
    return json({ error: "Not found" }, { status: 404 });
  }

  return json({ success: true });
}

export async function PATCH({ request, locals }) {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  const { id, action } = await request.json();
  if (!id || !action) return json({ error: "Bad request" }, { status: 400 });

  if (action === "enable") {
    await db.query(`
      UPDATE enabot_api_keys
      SET is_active = TRUE
      WHERE id = $1 AND user_id = $2
    `, [id, locals.user.id]);
  }

  if (action === "disable") {
    await db.query(`
      UPDATE enabot_api_keys
      SET is_active = FALSE
      WHERE id = $1 AND user_id = $2
    `, [id, locals.user.id]);
  }

  if (action === "rotate") {
    const newKey = crypto.randomBytes(32).toString("hex");

    const { rows } = await db.query(`
      UPDATE enabot_api_keys
      SET key = $1,
          created_at = NOW(),
          last_used = NULL
      WHERE id = $2 AND user_id = $3
      RETURNING key
    `, [newKey, id, locals.user.id]);

    return json({ key: rows[0].key });
  }

  return json({ success: true });
}
