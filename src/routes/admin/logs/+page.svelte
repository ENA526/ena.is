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
        selected = selected?.id === node.id
            ? null
            : node;
    }
</script>

<svelte:head>
    <title>API Logs - ENA</title>
</svelte:head>

<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">

    <div class="mb-6">
        <div>
			<p class="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-600">Admin</p>
			<h1 class="mt-2 text-3xl sm:text-4xl font-extrabold leading-tight">
				API Logs
			</h1>
			<p class="mt-3 text-base text-slate-600">
				Trace hierarchy of API requests.
			</p>
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
