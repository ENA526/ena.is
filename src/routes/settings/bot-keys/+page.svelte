<script>
	import { onMount } from "svelte";

	let apiKey = $state("");
	let message = $state("");
	let boundKey = $state(null);
	let loading = $state(true);

	async function load() {
		loading = true;
		const res = await fetch("/api/bot-keys");

		if (res.ok) {
			const data = await res.json();
			boundKey = data.length ? data[0] : null;
		} else {
			boundKey = null;
		}

		loading = false;
	}

	async function bind() {
		message = "";

		const res = await fetch("/api/bot-keys", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ key: apiKey })
		});

		const data = await res.json();

		if (!res.ok) {
			message = data.error;
			return;
		}

		message = "✅ API key bound successfully.";
		apiKey = "";
		await load();
	}

	async function unbind() {
		if (!boundKey) return;

		if (!confirm("Unbind this API key from the bot?")) return;

		const res = await fetch("/api/bot-keys", {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id: boundKey.id })
		});

		if (!res.ok) {
			message = "Failed to unbind key.";
			return;
		}

		boundKey = null;
		message = "✅ API key unbound.";
	}

	onMount(load);
</script>

<svelte:head>
	<title>Bot API Key - ENA</title>
</svelte:head>

<section class="relative isolate">
	<div class="space-y-8">
		<!-- Header -->
		<div>
			<p class="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-600">Access</p>
			<h1 class="mt-2 text-3xl sm:text-4xl font-extrabold leading-tight">
				Bot API Key
			</h1>
			<p class="mt-3 text-base text-slate-600">
				Bind an API key to your Discord bot to enable it to make requests on your behalf.
			</p>
		</div>

		{#if loading}
			<div class="rounded-2xl border border-slate-200 bg-white shadow-sm p-8 text-center">
				<p class="text-slate-500">Loading...</p>
			</div>
		{:else if boundKey}
			<!-- Bound Key Display -->
			<div class="rounded-2xl border border-green-200 bg-green-50 shadow-sm p-6">
				<div class="flex items-start gap-3">
					<svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<div class="flex-1">
						<h3 class="text-sm font-semibold text-green-900 mb-2">Bot API key bound</h3>
						<p class="text-sm text-green-800 mb-3">
							Your bot is currently bound to this API key:
						</p>
						<code class="block bg-white border border-green-200 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-900 mb-3">
							API Key ID: {boundKey.id}
						</code>
						<p class="text-xs text-green-700 mb-4">
							Bound on {new Date(boundKey.created_at).toLocaleString()}
						</p>
						<button
							onclick={unbind}
							class="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition duration-150"
						>
							Unbind API key
						</button>
					</div>
				</div>
			</div>
		{:else}
			<!-- Bind New Key Form -->
			<div class="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
				<h3 class="text-base font-semibold text-slate-900 mb-2">Bind API key</h3>
				<p class="text-sm text-slate-600 mb-4">
					Enter an API key from your <a href="/settings/api-keys" class="text-blue-600 hover:underline">API Keys</a> page to bind it to your bot.
				</p>
				<div class="space-y-3">
					<input
						type="text"
						class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
						placeholder="Paste your API key here"
						bind:value={apiKey}
					/>
					<button
						onclick={bind}
						class="rounded-lg bg-slate-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-800 transition duration-150"
					>
						Bind API key
					</button>
				</div>
			</div>
		{/if}

		<!-- Message Display -->
		{#if message}
			<div class="rounded-2xl border {message.startsWith('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'} shadow-sm p-4">
				<p class="text-sm {message.startsWith('✅') ? 'text-green-800' : 'text-red-800'}">{message}</p>
			</div>
		{/if}

		<!-- Info Section -->
		<div class="rounded-2xl border border-slate-200 bg-slate-50 shadow-sm p-4 sm:p-6">
			<h3 class="text-base font-semibold text-slate-900 mb-3">About bot API keys</h3>
			<ul class="space-y-2 text-sm text-slate-600">
				<li class="flex items-start gap-2">
					<span class="text-slate-400 mt-0.5">•</span>
					<span>Only one API key can be bound to your bot at a time</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-slate-400 mt-0.5">•</span>
					<span>The bot will use this key to authenticate API requests</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-slate-400 mt-0.5">•</span>
					<span>You can unbind and rebind a different key at any time</span>
				</li>
			</ul>
		</div>
	</div>
</section>