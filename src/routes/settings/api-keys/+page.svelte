<script>
	import { onMount } from "svelte";

	let keys = $state([]);
	let newKey = $state(null);
	let loading = $state(true);
	let error = $state("");

	async function load() {
		loading = true;
		const res = await fetch("/api/api-keys");
		if (!res.ok) {
			error = "Failed to load";
			loading = false;
			return;
		}
		keys = await res.json();
		loading = false;
	}

	async function createKey() {
		const res = await fetch("/api/api-keys", { method: "POST" });
		const data = await res.json();
		newKey = data.key;
		await load();
	}

	async function toggle(id, is_active) {
		await fetch("/api/api-keys", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id, is_active })
		});
		await load();
	}

	async function remove(id) {
		if (!confirm("Delete this API key permanently?")) return;
		await fetch("/api/api-keys", {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id })
		});
		await load();
	}

	function copy() {
		navigator.clipboard.writeText(newKey);
		alert("Copied. This key will never be shown again.");
		newKey = null;
	}

	onMount(load);
</script>

<svelte:head>
	<title>API Keys - ENA</title>
</svelte:head>

<section class="relative isolate">
	<div class="space-y-8">
		<!-- Header -->
		<div>
			<p class="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-600">Access</p>
			<div class="flex items-center justify-between flex-wrap gap-3 mt-2">
				<h1 class="text-3xl sm:text-4xl font-extrabold leading-tight">
					API Keys
				</h1>
				<button
					onclick={createKey}
					class="rounded-lg bg-slate-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-800 transition duration-150"
				>
					Generate new key
				</button>
			</div>
			<p class="mt-3 text-base text-slate-600 max-w-prose">
				API keys allow you to authenticate requests to the ENA API. Keep your keys secure and never share them publicly.
			</p>
		</div>

		<!-- New Key Alert -->
		{#if newKey}
			<div class="rounded-2xl border border-blue-200 bg-blue-50 shadow-sm p-6">
				<div class="flex items-start gap-3">
					<svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<div class="flex-1">
						<h3 class="text-sm font-semibold text-blue-900 mb-1">Copy your new API key</h3>
						<p class="text-sm text-blue-800 mb-3">
							Make sure to copy your API key now. You won't be able to see it again!
						</p>
						<div class="flex flex-col sm:flex-row gap-3">
							<code class="flex-1 bg-white px-4 py-2.5 rounded-lg border border-blue-200 text-sm break-all font-mono text-slate-900">
								{newKey}
							</code>
							<button
								onclick={copy}
								class="rounded-lg bg-blue-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition duration-150 whitespace-nowrap sm:w-auto w-full"
							>
								Copy key
							</button>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Loading State -->
		{#if loading}
			<div class="rounded-2xl border border-slate-200 bg-white shadow-sm p-8 text-center">
				<p class="text-slate-500">Loading API keys...</p>
			</div>
		{/if}

		<!-- Error State -->
		{#if error}
			<div class="rounded-2xl border border-red-200 bg-red-50 shadow-sm p-6">
				<p class="text-sm text-red-800">{error}</p>
			</div>
		{/if}

		<!-- API Keys List -->
		{#if !loading && keys.length === 0}
			<div class="rounded-2xl border border-slate-200 bg-white shadow-sm p-8 text-center">
				<svg class="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
				</svg>
				<p class="text-slate-600 font-medium mb-1">No API keys yet</p>
				<p class="text-sm text-slate-500">Create your first API key to get started</p>
			</div>
		{/if}

		{#if !loading && keys.length > 0}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{#each keys as k}
					<article class="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
						<div class="flex items-start justify-between mb-4">
							<div class="flex items-center gap-3">
								<div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
									<svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
									</svg>
								</div>
								<div>
									<h3 class="text-base font-semibold text-slate-900">API Key #{k.id}</h3>
									<p class="text-xs text-slate-500">Created {new Date(k.created_at).toLocaleDateString()}</p>
								</div>
							</div>
							<span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium {k.is_active ? 'text-green-700 border border-green-300 bg-white' : 'text-red-700 border border-red-300 bg-white'}">
								{k.is_active ? 'Active' : 'Disabled'}
							</span>
						</div>

						<div class="space-y-2 mb-4">
							<div class="flex items-center justify-between text-sm">
								<span class="text-slate-600">Last used</span>
								<span class="text-slate-900 font-medium">
									{k.last_used ? new Date(k.last_used).toLocaleDateString() : 'Never'}
								</span>
							</div>
						</div>

						<div class="flex gap-2 pt-4 border-t border-slate-100">
							<button
								onclick={() => toggle(k.id, !k.is_active)}
								class="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 transition duration-150"
							>
								{k.is_active ? 'Disable' : 'Enable'}
							</button>
							<button
								onclick={() => remove(k.id)}
								class="flex-1 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition duration-150"
							>
								Delete
							</button>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</div>
</section>