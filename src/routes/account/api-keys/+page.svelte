<script>
  import { onMount } from "svelte";

  let keys = [];
  let newKey = null;
  let loading = true;
  let error = "";

  async function load() {
    loading = true;
    const res = await fetch("/api/keys");
    if (!res.ok) {
      error = "Failed to load";
      loading = false;
      return;
    }
    keys = await res.json();
    loading = false;
  }

  async function createKey() {
    const res = await fetch("/api/keys", { method: "POST" });
    const data = await res.json();
    newKey = data.key;
    await load();
  }

  async function toggle(id, is_active) {
    await fetch("/api/keys", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active })
    });
    await load();
  }

  async function remove(id) {
    if (!confirm("Delete this API key permanently?")) return;
    await fetch("/api/keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    await load();
  }

  function copy() {
    navigator.clipboard.writeText(newKey);
    alert("Copied. This key will never be shown again.");
  }

  onMount(load);
</script>


<svelte:head><title>API Keys</title></svelte:head>

<section class="max-w-5xl mx-auto px-4 py-16 space-y-8">

  <header class="flex items-center justify-between">
    <h1 class="text-3xl font-bold">API Keys</h1>
    <button
      on:click={createKey}
      class="rounded-xl bg-slate-900 text-white px-5 py-2 font-semibold hover:bg-slate-800">
      New Key
    </button>
  </header>

  {#if newKey}
    <div class="rounded-2xl bg-slate-100 border p-4">
      <p class="text-sm text-slate-600">Copy this key now. It won’t be shown again:</p>
      <div class="mt-2 flex items-center gap-2">
        <code class="bg-white px-3 py-2 rounded-lg border break-all">{newKey}</code>
        <button on:click={copy} class="px-3 py-2 rounded-lg border hover:bg-slate-50">Copy</button>
      </div>
    </div>
  {/if}

  {#if loading}
    <p class="text-slate-500">Loading...</p>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    {#each keys as k}
      <article class="rounded-2xl border bg-white p-4 space-y-2">
        <header class="flex justify-between items-center">
          <span class="text-sm text-slate-500">Key #{k.id}</span>
          <span class={"text-xs px-2 py-1 rounded-full " + (k.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
            {k.is_active ? "Active" : "Disabled"}
          </span>
        </header>

        <p class="text-xs text-slate-600">Created: {new Date(k.created_at).toLocaleString()}</p>
        <p class="text-xs text-slate-600">
          Last used: {k.last_used ? new Date(k.last_used).toLocaleString() : "Never"}
        </p>

        <div class="pt-2 flex gap-2">
          <button
            class="px-3 py-2 rounded-lg border hover:bg-slate-50"
            on:click={() => toggle(k.id, !k.is_active)}>
            {k.is_active ? "Disable" : "Enable"}
          </button>

          <button
            class="px-3 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
            on:click={() => remove(k.id)}>
            Delete
          </button>
        </div>
      </article>
    {/each}
  </div>

</section>
