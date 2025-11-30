import { json } from "@sveltejs/kit";
import { db } from "$lib/db.js";

export async function POST({ locals }) {
  if (!locals.user)
    return json({ error: "Unauthorized" }, { status: 401 });

  // Fetch encrypted key (do NOT decrypt)
  const { rows } = await db.query(`
    SELECT k.encrypted_key
    FROM enabot_api_keys b
    JOIN api_keys k ON b.api_key_id = k.id
    WHERE k.user_id = $1
      AND k.is_active = TRUE
  `, [locals.user.id]);

  if (!rows.length)
    return json({ error: "No API key bound to bot" }, { status: 400 });

  const encryptedKey = rows[0].encrypted_key;

  // Forward encrypted blob to bot
  const res = await fetch("https://enabot-production.up.railway.app/test/post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",

      // forward encrypted key instead of raw
      "x-api-key-encrypted": encryptedKey.toString("base64")
    },
    body: JSON.stringify({ message: "API is alive" })
  });

  const data = await res.json();

  return json(data, { status: res.status });
}
