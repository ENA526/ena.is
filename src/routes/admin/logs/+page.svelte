<script>
    import LogNode from "./LogNode.svelte";

    export let data;

    let logs = data.logs || [];
    let tree = buildTree(logs);
    let selected = null;

    // -------------------------
    // Build trace tree
    // -------------------------
    function buildTree(rows) {
        const map = {};
        const roots = [];

        for (const row of rows) {
            map[row.span_id] = { ...row, children: [] };
        }

        for (const row of rows) {
            if (row.parent_span_id && map[row.parent_span_id]) {
                map[row.parent_span_id].children.push(map[row.span_id]);
            } else {
                roots.push(map[row.span_id]);
            }
        }

        return roots;
    }

    function select(node) {
        console.log("SELECT:", node.id);

        selected = selected?.id === node.id
            ? null
            : node;
    }

    function pretty(json) {
        return JSON.stringify(json, null, 2);
    }
</script>

<svelte:head>
    <title>ENA · Logs</title>
</svelte:head>

<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">

    <div class="mb-6">
        <h1 class="text-3xl font-bold">API Logs</h1>
        <p class="text-slate-600">Trace hierarchy</p>

        <div class="text-xs text-slate-400 mt-2">
            Loaded: {logs.length} · Roots: {tree.length}
        </div>
    </div>

    <div class="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        {#if tree.length === 0}
            <div class="p-6 text-slate-500">No logs found.</div>
        {/if}

        {#each tree as node (node.span_id)}
            <LogNode
                node={node}
                depth={0}
                selected={selected}
                onSelect={select}
            />
        {/each}

    </div>
</section>
