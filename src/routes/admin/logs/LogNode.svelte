<script>
    import LogNode from './LogNode.svelte'; // Import yourself for recursion
    
    // Svelte 5 uses $props() instead of export let
    let { node, depth = 0, onSelect, selected } = $props();

    const statusClass = (code) => {
        if (code >= 500) return "text-red-600";
        if (code >= 400) return "text-orange-500";
        if (code >= 300) return "text-yellow-500";
        return "text-green-600";
    };

    const durationClass = (ms) => {
        if (ms > 1500) return "text-red-600 font-semibold";
        if (ms > 800) return "text-orange-500";
        return "text-slate-500";
    };

    function fmtTime(ts) {
        const d = new Date(ts);
        return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    function fmtTimeShort(ts) {
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    function pretty(v) {
        return JSON.stringify(v, null, 2);
    }

    const indent = (d) => Math.min(d * 20, 60);
</script>

<!-- ================= ROW ================= -->

<div
    role="button"
    tabindex="0"
    class="grid items-center cursor-pointer hover:bg-slate-50 transition text-sm select-none gap-x-2 sm:gap-x-4 py-2 px-3 sm:px-4 border-b border-slate-100"
    onclick={() => onSelect?.(node)}
    onkeydown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
            e.preventDefault();
            onSelect?.(node);
        }
    }}
    aria-pressed={selected?.id === node.id}
>

    <!-- ENDPOINT with tree structure -->
    <div class="flex items-center gap-1 font-medium text-slate-900 truncate leading-tight min-w-0" style="padding-left: {indent(depth)}px;">
        {#if depth > 0}
            <span class="text-slate-400 mr-1 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 sm:w-5 sm:h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.49 12 3.75 3.75m0 0-3.75 3.75m3.75-3.75H3.74V4.499" />
                </svg>
            </span>
        {/if}
        <span class="truncate">{node.path || "(fetch)"}</span>
    </div>

    <!-- USER - hide on very small, truncate on medium, full on large -->
    <div class="text-slate-500 truncate hidden sm:block min-w-0">
        {node.user_id || "anon"}
    </div>

    <!-- TIME - short on small/medium, full on large -->
    <div class="text-slate-400 whitespace-nowrap hidden lg:block">
        {fmtTime(node.created_at)}
    </div>

    <div class="text-slate-400 whitespace-nowrap text-xs sm:text-sm lg:hidden">
        {fmtTimeShort(node.created_at)}
    </div>

    <!-- STATUS - always visible -->
    <div class="font-mono text-xs text-right flex-shrink-0 {statusClass(node.status_code)}">
        {node.status_code}
    </div>

    <!-- LATENCY - hide on medium and below -->
    <div class="font-mono text-xs text-right hidden lg:block flex-shrink-0 {durationClass(node.duration_ms)}">
        {node.duration_ms}ms
    </div>

</div>

<style>
    /* Extra small: endpoint, time (short), status */
    div[role="button"] {
        grid-template-columns: minmax(0, 1fr) minmax(45px, 70px) 45px;
    }

    /* Small+: endpoint, user, time (short), status */
    @media (min-width: 640px) {
        div[role="button"] {
            grid-template-columns: minmax(0, 1fr) minmax(60px, 120px) minmax(50px, 80px) 50px;
        }
    }

    /* Large+: endpoint, user, time (full), status, latency */
    @media (min-width: 1024px) {
        div[role="button"] {
            grid-template-columns: minmax(0, 1fr) minmax(80px, 150px) minmax(100px, 180px) 60px 100px;
        }
    }
</style>


<!-- ================= EXPANDED PANEL ================= -->

{#if selected?.id === node.id}
<div
    class="mt-3 mb-3 mx-4 rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden"
>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">

        <section>
            <h4 class="font-semibold text-slate-700 mb-3 text-xs uppercase tracking-wide">Meta</h4>
            <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                <div class="flex"><span class="text-slate-500 w-20 shrink-0">ID:</span><span class="text-slate-900 font-mono text-xs break-all">{node.id}</span></div>
                <div class="flex"><span class="text-slate-500 w-20 shrink-0">User:</span><span class="text-slate-900">{node.user_id || "anon"}</span></div>
                <div class="flex"><span class="text-slate-500 w-20 shrink-0">Trace:</span><span class="text-slate-900 font-mono text-xs break-all">{node.trace_id}</span></div>
                <div class="flex"><span class="text-slate-500 w-20 shrink-0">Span:</span><span class="text-slate-900 font-mono text-xs break-all">{node.span_id}</span></div>
                <div class="flex"><span class="text-slate-500 w-20 shrink-0">Parent:</span><span class="text-slate-900 font-mono text-xs break-all">{node.parent_span_id || "—"}</span></div>
                <div class="flex"><span class="text-slate-500 w-20 shrink-0">Method:</span><span class="text-slate-900 font-semibold">{node.method}</span></div>
                <div class="flex"><span class="text-slate-500 w-20 shrink-0">Path:</span><span class="text-slate-900 font-mono text-xs">{node.path}</span></div>
                <div class="flex"><span class="text-slate-500 w-20 shrink-0">Status:</span><span class="font-mono font-semibold {statusClass(node.status_code)}">{node.status_code}</span></div>
                <div class="flex"><span class="text-slate-500 w-20 shrink-0">Time:</span><span class="text-slate-900">{fmtTime(node.created_at)}</span></div>
                <div class="flex"><span class="text-slate-500 w-20 shrink-0">Duration:</span><span class="font-mono {durationClass(node.duration_ms)}">{node.duration_ms}ms</span></div>
            </div>
        </section>

        <section>
            <h4 class="font-semibold text-slate-700 mb-3 text-xs uppercase tracking-wide">Headers</h4>
            <div class="space-y-3">
                <div>
                    <div class="text-slate-600 font-medium text-xs mb-1.5">Request:</div>
                    <pre class="bg-slate-50 p-3 rounded-lg border border-slate-200 overflow-auto max-h-40 text-xs font-mono whitespace-pre-wrap break-all">{pretty(node.request_headers)}</pre>
                </div>
                <div>
                    <div class="text-slate-600 font-medium text-xs mb-1.5">Response:</div>
                    <pre class="bg-slate-50 p-3 rounded-lg border border-slate-200 overflow-auto max-h-40 text-xs font-mono whitespace-pre-wrap break-all">{pretty(node.response_headers)}</pre>
                </div>
            </div>
        </section>

    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 pb-6">

        <section>
            <h4 class="font-semibold text-slate-700 mb-3 text-xs uppercase tracking-wide">Request Body</h4>
            <pre class="bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-auto max-h-80 text-xs font-mono whitespace-pre-wrap break-all">{pretty(node.request_body)}</pre>
        </section>

        <section>
            <h4 class="font-semibold text-slate-700 mb-3 text-xs uppercase tracking-wide">Response Body</h4>
            <pre class="bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-auto max-h-80 text-xs font-mono whitespace-pre-wrap break-all">{pretty(node.response_body)}</pre>
        </section>

    </div>
</div>
{/if}

<!-- ================= CHILDREN ================= -->

{#if node.children?.length}
    {#each node.children as child (child.span_id)}
        <LogNode
            {child}
            node={child}
            depth={depth + 1}
            {selected}
            {onSelect}
        />
    {/each}
{/if}