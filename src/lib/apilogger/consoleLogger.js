import { extractPayload } from "./payload.js"
import { indexFields } from "./indexer.js"

export async function logApiRequest(request, response, opts) {

    const duration = Date.now() - opts.trace.startedAt

    const [reqBody, resBody] = await Promise.all([
        extractPayload(request),
        extractPayload(response)
    ])

    const log = {
        trace: opts.trace.traceId,
        span: opts.trace.spanId,
        parent: opts.trace.parentSpanId,
        time_ms: duration,
        user: opts.user?.id ?? null,

        request: {
            method: request.method,
            url: request.url,
            headers: Object.fromEntries(request.headers),
            body: reqBody
        },

        response: {
            status: response.status,
            headers: Object.fromEntries(response.headers),
            body: resBody
        },

        indexed: indexFields(reqBody, resBody, opts.config),

        error: opts.error ? {
            name: opts.error.name,
            message: opts.error.message,
            stack: opts.error.stack
        } : null
    }

    console.log("\n📡 API TRACE")
    console.dir(log, { depth: null })
}
