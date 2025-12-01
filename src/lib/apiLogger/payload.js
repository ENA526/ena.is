export async function extractPayload(message) {

    const type = message.headers.get("content-type") || "unknown"

    if (type.includes("application/json")) {
        return {
            kind: "json",
            data: await safeJson(message)
        }
    }

    if (type.startsWith("image") || type.startsWith("audio") || type.includes("octet-stream")) {
        const buffer = await message.arrayBuffer()
        return {
            kind: "binary",
            mime: type,
            size: buffer.byteLength
        }
    }

    return {
        kind: "text",
        data: await safeText(message)
    }
}

async function safeJson(msg) {
    try {
        return await msg.json()
    } catch {
        return "[invalid json]"
    }
}

async function safeText(msg) {
    try {
        return await msg.text()
    } catch {
        return "[binary / unreadable]"
    }
}
