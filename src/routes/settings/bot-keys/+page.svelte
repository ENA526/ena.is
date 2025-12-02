<script>
    import { onMount } from "svelte";

    let apiKey = "";
    let message = "";
    let boundKey = null;
    let loading = true;

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

<svelte:head><title>Bot API Keys</title></svelte:head>

<section class="max-w-xl mx-auto px-6 py-16 space-y-8">

  <h1 class="text-2xl font-bold">Bot API Key</h1>

    {#if loading}
    <p class="text-slate-500">Loading...</p>

    {:else if boundKey}
    <div class="rounded-xl border bg-green-50 p-4 space-y-2">
        <p class="text-sm text-green-800">
            Your bot is bound to this API key:
        </p>

        <code class="block bg-white border rounded-lg px-3 py-2 text-sm">
            API Key ID: {boundKey.id}
        </code>

        <p class="text-xs text-slate-500">
            Bound on {new Date(boundKey.created_at).toLocaleString()}
        </p>

        <button
            on:click={unbind}
            class="mt-2 text-sm px-3 py-2 rounded-md border border-red-300 text-red-600 hover:bg-red-50">
            Unbind
        </button>
    </div>

    {:else}
    <div class="space-y-3">
        <input
            type="text"
            class="w-full border rounded-lg px-4 py-2"
            placeholder="Paste your API key"
            bind:value={apiKey}
        />

        <button
            on:click={bind}
            class="bg-slate-900 text-white px-4 py-2 rounded-lg">
            Bind API Key
        </button>
    </div>
    {/if}

    {#if message}
    <p class="text-sm mt-2">{message}</p>
    {/if}

</section>
