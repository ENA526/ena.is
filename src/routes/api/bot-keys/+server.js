import { json } from "@sveltejs/kit";
import { db } from "$lib/db.js";
import crypto from "crypto";

/**
 * POST /api/bot-keys
 * Body: { key }
 */

function hashKey(k) {
    return crypto.createHash("sha256").update(k).digest("hex");
}

export async function POST({ request, locals }) {
    if (!locals.user)
        return json({ error: "Unauthorized" }, { status: 401 });

    const { key } = await request.json();
    if (!key)
        return json({ error: "Missing key" }, { status: 400 });

    const keyHash = hashKey(key);

    // 1. Check that this key exists, is active, and belongs to the user
    const { rows } = await db.query(`
        SELECT id
        FROM api_keys
        WHERE key_hash = $1
            AND user_id = $2
            AND is_active = TRUE
    `, [keyHash, locals.user.id]);

    if (!rows.length)
        return json({ error: "Invalid or unowned key" }, { status: 403 });

    // 2. Bind by hash
    await db.query(`
        INSERT INTO enabot_api_keys (key_hash)
        VALUES ($1)
        ON CONFLICT (key_hash) DO NOTHING
    `, [keyHash]);

    return json({ success: true });
}

export async function GET({ locals }) {
    if (!locals.user)
        return json({ error: "Unauthorized" }, { status: 401 });

    const { rows } = await db.query(`
        SELECT k.id, k.created_at
        FROM enabot_api_keys b
        JOIN api_keys k ON k.key_hash = b.key_hash
        WHERE k.user_id = $1
    `, [locals.user.id]);

    return json(rows);
}

export async function DELETE({ request, locals }) {
    if (!locals.user)
        return json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await request.json(); // id from api_keys

    // translate id -> hash, then delete by hash
    const { rows } = await db.query(`
        DELETE FROM enabot_api_keys b
        USING api_keys k
        WHERE k.id = $1
            AND k.user_id = $2
            AND b.key_hash = k.key_hash
        RETURNING b.id
    `, [id, locals.user.id]);

    if (!rows.length)
        return json({ error: "Not found" }, { status: 404 });

    return json({ success: true });
}

