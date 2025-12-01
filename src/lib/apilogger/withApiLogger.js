import { createTraceContext } from "./trace.js"
import { extractPayload } from "$lib/apiLogger/payload.js"
import { randomUUID } from "crypto"
import { enqueue } from "$lib/apiLogger/queue.js"
import { db } from "$lib/db.js"

// ----------------------------------------------------
// Utility
// ----------------------------------------------------

function getClientIP(request) {
    return (
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown"
    )
}

function sanitizeHeaders(headers) {
    const SENSITIVE = ["authorization", "api-key", "cookie"]
    const clean = {}

    for (const [k, v] of Object.entries(headers)) {
        if (SENSITIVE.some(s => k.toLowerCase().includes(s))) {
            clean[k] = "[REDACTED]"
        } else {
            clean[k] = v
        }
    }

    return clean
}

// ----------------------------------------------------
// Logger to DB
// ----------------------------------------------------

async function persistApiLog({
    trace,
    user,
    request,
    response,
    durationMs,
    error,
    meta = {}
}) {

    const clientIp = getClientIP(request)

    const reqHeaders = sanitizeHeaders(Object.fromEntries(request.headers))
    const resHeaders = response
        ? sanitizeHeaders(Object.fromEntries(response.headers))
        : null

    const reqPayload = await extractPayload(request)
    const resPayload = response ? await extractPayload(response) : null

    await db.query(`
        INSERT INTO api_logs (
            trace_id,
            span_id,
            parent_span_id,
            user_id,
            method,
            path,
            full_url,
            client_ip,
            duration_ms,
            request_headers,
            request_body,
            status_code,
            response_headers,
            response_body,
            success,
            error,
            meta
        )
        VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
        )
    `, [
        trace.traceId,
        trace.spanId,
        trace.parentSpanId,
        user?.id ?? null,
        request.method,
        new URL(request.url).pathname,
        request.url,
        clientIp,
        durationMs,
        reqHeaders,
        reqPayload,
        response?.status ?? null,
        resHeaders,
        resPayload,
        response ? response.ok : false,
        error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
        } : null,
        meta
    ])
}

// ----------------------------------------------------
// Decorator
// ----------------------------------------------------

export function withApiLogger(configOrHandler, maybeHandler) {

    let config = {}
    let handler

    if (typeof configOrHandler === "function") {
        handler = configOrHandler
    } else {
        config = configOrHandler
        handler = maybeHandler
    }

    return async function wrapped(event) {

        const trace = createTraceContext(event.request)

        // ✅ Clone request BEFORE body is touched
        const requestClone = event.request.clone()

        const originalFetch = event.fetch

        // ------------------------------------------------
        // Traced fetch (queued)
        // ------------------------------------------------

        const tracedFetch = async (url, options = {}) => {

            const fetchSpanId = randomUUID()

            options.headers ||= {}
            options.headers["x-trace-id"] = trace.traceId
            options.headers["x-span-id"] = fetchSpanId
            options.headers["x-parent-span-id"] = trace.spanId

            const start = Date.now()

            const outbound = {
                method: options.method || "GET",
                url,
                headers: structuredClone(options.headers),
                body: options.body
            }

            let res, err

            try {
                res = await originalFetch(url, options)
                return res

            } catch (e) {
                err = e
                throw e

            } finally {

                const resClone = res ? res.clone() : null

                enqueue(async () => {

                    let reqBody, resBody

                    if (outbound.body) {
                        reqBody = await extractPayload({
                            headers: new Headers({
                                "content-type":
                                    outbound.headers["Content-Type"] ||
                                    outbound.headers["content-type"] ||
                                    "unknown"
                            }),
                            text: async () =>
                                typeof outbound.body === "string"
                                    ? outbound.body
                                    : "[binary body]",
                            json: async () => JSON.parse(outbound.body),
                            arrayBuffer: async () => outbound.body
                        })
                    }

                    if (resClone) {
                        resBody = await extractPayload(resClone)
                    }

                    // ✅ Save nested fetch to DB as a SPAN
                    await db.query(`
                        INSERT INTO api_logs (
                            trace_id,
                            span_id,
                            parent_span_id,
                            user_id,
                            method,
                            path,
                            full_url,
                            duration_ms,
                            request_headers,
                            request_body,
                            status_code,
                            response_headers,
                            response_body,
                            success,
                            meta
                        )
                        VALUES (
                            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
                        )
                    `, [
                        trace.traceId,
                        fetchSpanId,
                        trace.spanId,
                        event.locals?.user?.id ?? null,
                        outbound.method,
                        new URL(outbound.url).pathname,
                        outbound.url,
                        Date.now() - start,
                        sanitizeHeaders(outbound.headers),
                        reqBody || null,
                        res?.status ?? null,
                        res ? sanitizeHeaders(Object.fromEntries(res.headers)) : null,
                        resBody || null,
                        !!res?.ok,
                        { type: "fetch" }
                    ])
                })
            }
        }

        // ------------------------------------------------
        // Main handler execution
        // ------------------------------------------------

        let response
        let error = null
        const started = Date.now()

        try {
            response = await handler({
                ...event,
                fetch: tracedFetch,
                trace
            })

            return response

        } catch (err) {
            error = err
            throw err

        } finally {

            if (response instanceof Response) {

                const responseClone = response.clone()

                // ✅ Queue DB write (outer request)
                enqueue(() => persistApiLog({
                    trace,
                    user: event.locals?.user,
                    request: requestClone,
                    response: responseClone,
                    durationMs: Date.now() - started,
                    error,
                    meta: { type: "api" }
                }))
            }
        }
    }
}
