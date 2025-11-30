// +server.js for /api/bot-test
import { json } from "@sveltejs/kit";
import { db } from "$lib/db.js";

export async function POST({ locals }) {
  if (!locals.user)
    return json({ error: "Unauthorized" }, { status: 401 });

  const { rows } = await db.query(`
    SELECT k.encrypted_key
    FROM enabot_api_keys b
    JOIN api_keys k ON k.key_hash = b.key_hash
    WHERE k.user_id = $1
      AND k.is_active = TRUE
    LIMIT 1
  `, [locals.user.id]);

  if (!rows.length)
    return json({ error: "No bound API key" }, { status: 400 });

  const encryptedKey = rows[0].encrypted_key; // BYTEA

  const res = await fetch("https://enabot-production.up.railway.app/test/post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // send encrypted blob as base64
      "x-api-key-encrypted": Buffer.from(encryptedKey).toString("base64")
    },
    body: JSON.stringify({ message: "API is alive" })
  });

  const data = await res.json();
  return json(data, { status: res.status });
}
