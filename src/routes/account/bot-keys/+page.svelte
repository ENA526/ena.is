<script>
  let apiKey = "";
  let message = "";

  async function bind() {
    const res = await fetch("/api/bot-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: apiKey })
    });

    const data = await res.json();

    if (!res.ok) {
      message = data.error;
    } else {
      message = "✅ Key successfully linked to bot.";
      apiKey = "";
    }
  }
</script>

<svelte:head><title>Bot API Keys</title></svelte:head>

<section class="max-w-xl mx-auto px-6 py-16 space-y-6">
  <h1 class="text-2xl font-bold">Bind API Key to Bot</h1>

  <input
    type="text"
    class="w-full border rounded-lg px-4 py-2"
    placeholder="Paste your API key"
    bind:value={apiKey}
  />

  <button
    on:click={bind}
    class="bg-slate-900 text-white px-4 py-2 rounded-lg"
  >
    Bind Key
  </button>

  {#if message}
    <p class="text-sm mt-2">{message}</p>
  {/if}
</section>
