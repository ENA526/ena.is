import { json } from "@sveltejs/kit";
import crypto from "crypto";
import { db } from "$lib/db.js";

// ----------------------
// Helpers
// ----------------------
function hashKey(k) {
    return crypto.createHash("sha256").update(k).digest("hex");
}

function encryptKey(text) {
    const key = Buffer.from(process.env.MASTER_AES_KEY, "hex"); // 32 bytes
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([
        cipher.update(text, "utf8"),
        cipher.final()
    ]);

    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]); // store as BYTEA
}

// ----------------------
// GET — list keys (NO secrets)
// ----------------------
export async function GET({ locals }) {
    if (!locals.user)
        return json({ error: "Unauthorized" }, { status: 401 });

    const { rows } = await db.query(`
        SELECT id, name, is_active, last_used, created_at
        FROM api_keys
        WHERE user_id = $1
        ORDER BY created_at DESC
    `, [locals.user.id]);

    return json(rows);
}

// ----------------------
// POST — create key
// ----------------------
export async function POST({ locals }) {
    if (!locals.user)
        return json({ error: "Unauthorized" }, { status: 401 });

    const raw = crypto.randomBytes(32).toString("hex");

    const hash = hashKey(raw);
    const encrypted = encryptKey(raw);

    await db.query(`
        INSERT INTO api_keys (user_id, key_hash, encrypted_key)
        VALUES ($1, $2, $3)
    `, [locals.user.id, hash, encrypted]);

    // ✅ return only ONCE
    return json({ key: raw });
}

// ----------------------
// DELETE — remove key
// ----------------------
export async function DELETE({ request, locals }) {
    if (!locals.user)
        return json({ error: "Unauthorized" }, { status: 401 });

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

// ----------------------
// PATCH — enable / disable / rotate
// ----------------------
export async function PATCH({ request, locals }) {
    if (!locals.user)
        return json({ error: "Unauthorized" }, { status: 401 });

    const { id, action } = await request.json();
    if (!id || !action)
        return json({ error: "Bad request" }, { status: 400 });

    // ENABLE / DISABLE
    if (action === "enable" || action === "disable") {
        const value = action === "enable";

        await db.query(`
            UPDATE api_keys
            SET is_active = $1
            WHERE id = $2 AND user_id = $3
        `, [value, id, locals.user.id]);

        return json({ success: true });
    }

    // ROTATE KEY
    if (action === "rotate") {
        const raw = crypto.randomBytes(32).toString("hex");

        const hash = hashKey(raw);
        const encrypted = encryptKey(raw);

        const res = await db.query(`
            UPDATE api_keys
            SET key_hash = $1,
                    encrypted_key = $2,
                    created_at = NOW(),
                    last_used = NULL
            WHERE id = $3 AND user_id = $4
            RETURNING id
        `, [hash, encrypted, id, locals.user.id]);

        if (!res.rowCount)
            return json({ error: "Not found" }, { status: 404 });

        // ✅ rotated secret returned once again
        return json({ key: raw });
    }

    return json({ error: "Invalid action" }, { status: 400 });
}
