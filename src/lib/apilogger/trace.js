import crypto from "crypto"

export function createTraceContext(request) {
    return {
        traceId: request.headers.get("x-trace-id") || crypto.randomUUID(),
        spanId: crypto.randomUUID(),
        parentSpanId: request.headers.get("x-span-id") || null,
        startedAt: Date.now()
    }
}
