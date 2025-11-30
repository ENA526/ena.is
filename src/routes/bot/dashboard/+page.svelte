<script>
  let status = "";
  let loading = false;

  async function sendTest() {
    status = "";
    loading = true;

    try {
      // Call YOUR backend (which proxies using decrypted key)
      const res = await fetch("/api/bot-test", {
        method: "POST"
      });

      const data = await res.json();

      if (!res.ok) {
        status = "❌ " + (data.error || "Request failed");
      } else {
        status = "✅ Bot is alive and responded successfully.";
      }
    } catch (err) {
      status = "❌ Network error or internal failure.";
    } finally {
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
    Send a test signal to your bot using your bound API key.
  </p>

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
