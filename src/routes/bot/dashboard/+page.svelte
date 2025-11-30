<script>
  let apiKey = "";
  let status = "";
  let loading = false;

  async function sendTest() {
    if (!apiKey) {
      status = "❌ Please enter an API key.";
      return;
    }

    status = "";
    loading = true;

    try {
      const res = await fetch("https://enabot-production.up.railway.app/test/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({ message: "API is alive" })
      });

      const data = await res.json();

      if (!res.ok) {
        status = "❌ " + (data.error || "Request failed");
      } else {
        status = "✅ Message delivered. Bot is alive.";
      }
    } catch (err) {
      status = "❌ Network error or API offline.";
    } finally {
      apiKey = "";   // wipe after use
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Bot Dashboard</title>
</svelte:head>

<section class="max-w-xl mx-auto px-6 py-16 space-y-6">

  <h1 class="text-2xl font-bold">Bot Dashboard</h1>

  <p class="text-sm text-slate-600">
    Send a test request to verify your bot is connected and able to post messages.
  </p>

  <input
    type="password"
    class="w-full border rounded-lg px-4 py-2"
    placeholder="Paste your API key"
    bind:value={apiKey}
  />

  <button
    on:click={sendTest}
    disabled={loading}
    class="bg-slate-900 text-white px-4 py-2 rounded-lg disabled:opacity-50">
    {loading ? "Sending..." : "Send Test Message"}
  </button>

  {#if status}
    <p class="text-sm mt-4">{status}</p>
  {/if}

</section>
