<script>
  import { authClient } from "$lib/auth/auth-client";
  import { goto } from "$app/navigation";

  let email = "";
  let password = "";
  let rememberMe = true;
  let loading = false;
  let error = null;

  async function login() {
    loading = true;
    error = null;

    const { error: err } = await authClient.signIn.email(
      {
        email,
        password,
        rememberMe,
        // where to land after login (optional)
        callbackURL: "/"
      },
      {
        onSuccess: async () => {
          await goto("/"); // or wherever
        },
        onError: (ctx) => {
          error = ctx.error.message ?? "Login failed";
        }
      }
    );

    if (err) error = err.message;
    loading = false;
  }
</script>

<svelte:head>
  <title>Log in</title>
</svelte:head>

<section class="mx-auto max-w-sm space-y-4 p-6">
  <h1 class="text-xl font-semibold">Log in</h1>

  <label class="block">
    <span class="text-sm">Email</span>
    <input
      class="mt-1 w-full rounded-lg border px-3 py-2"
      type="email"
      bind:value={email}
      autocomplete="email"
      required
    />
  </label>

  <label class="block">
    <span class="text-sm">Password</span>
    <input
      class="mt-1 w-full rounded-lg border px-3 py-2"
      type="password"
      bind:value={password}
      autocomplete="current-password"
      required
    />
  </label>

  <label class="flex items-center gap-2 text-sm">
    <input type="checkbox" bind:checked={rememberMe} />
    Remember me
  </label>

  <button
    class="w-full rounded-lg border bg-black px-3 py-2 text-white disabled:opacity-60"
    on:click|preventDefault={login}
    disabled={loading}
  >
    {loading ? "Signing in..." : "Sign in"}
  </button>

  {#if error}
    <p class="text-sm text-red-600">{error}</p>
  {/if}

  <div class="pt-2 text-sm">
    <a href="/signup" class="underline">Create an account</a>
  </div>

  <!-- Optional: Social login -->
  <div class="pt-4 space-y-2">
    <button
      class="w-full rounded-lg border px-3 py-2"
      on:click={() =>
        authClient.signIn.social({
          provider: "github",
          callbackURL: "/"
        })
      }
    >
      Continue with GitHub
    </button>
  </div>
</section>
