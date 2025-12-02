import { db } from "$lib/db.js"

export async function load() {

    const { rows } = await db.query(`
        SELECT
            id,
            trace_id,
            span_id,
            parent_span_id,
            user_id,
            method,
            path,
            status_code,
            duration_ms,
            created_at,
            request_body,
            request_headers,
            response_body,
            response_headers
        FROM api_logs
        ORDER BY created_at ASC
        LIMIT 200
    `)

    return {
        logs: rows || []
    }
}
