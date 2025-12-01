<script>
    let status = "";
    let loading = false;
    let message = "";

    async function sendTest() {
        if (!message.trim()) {
            status = "❌ Message cannot be empty.";
            return;
        }

        status = "";
        loading = true;

        try {
            const res = await fetch("/api/bot-test", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
            });

            const data = await res.json();

            if (!res.ok) {
            status = "❌ " + (data.error || "Request failed");
            } else {
            status = "✅ Message sent successfully.";
            message = ""; // clear input after sending
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
    Send a message through your bound API key to the bot.
    </p>

    <textarea
    rows="4"
    class="w-full border rounded-lg px-4 py-2"
    placeholder="Type your message..."
    bind:value={message}
    ></textarea>

    <button
    on:click={sendTest}
    disabled={loading}
    class="bg-slate-900 text-white px-4 py-2 rounded-lg disabled:opacity-50">
    {loading ? "Sending..." : "Send Message"}
    </button>

    {#if status}
    <p class="text-sm mt-4">{status}</p>
    {/if}

</section>

