<script>
  import { authClient } from "$lib/auth/auth-client";
  import { goto } from "$app/navigation";
  import { page } from "$app/state"; // Svelte 5 runes

  // --- state ---
  let name = $state("");
  let email = $state("");
  let password = $state("");
  let loading = $state(false);
  let error = $state(null);

  // --- derive & sanitize redirect target from query ---
  const redirectTarget = $derived.by(() => {
    const raw = page.url.searchParams.get("redirect");
    if (!raw) return null;
    if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
    return null;
  });

  // keep redirect on links like "Already have an account?"
  function targetHref(path) {
    return redirectTarget ? `${path}?redirect=${encodeURIComponent(redirectTarget)}` : path;
  }

  async function signup(event) {
    event.preventDefault();
    if (loading) return;
    loading = true;
    error = null;

    const { error: err } = await authClient.signUp.email(
      { email, password, name },
      {
        onSuccess: async () => {
          await goto(redirectTarget ?? "/login");
        },
        onError: (ctx) => {
          error = ctx?.error?.message ?? "Sign up failed";
        }
      }
    );

    if (err) error = err.message ?? "Sign up failed";
    loading = false;
  }
</script>

<svelte:head>
  <title>Create your account</title>
</svelte:head>

<section class="mx-auto max-w-sm space-y-4 p-6">
  <h1 class="text-3xl font-bold text-gray-900">Create your account</h1>

  <!-- Social sign-up first -->
  <div class="space-y-3">
    <!-- Google -->
    <button
      class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 shadow-sm transition hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-700 font-medium"
      onclick={() =>
        authClient.signIn.social({
          provider: "google",
          callbackURL: redirectTarget ?? "/"
        })
      }
    >
      <svg class="w-5 h-5" viewBox="0 0 533.5 544" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path fill="#4285F4" d="M533.5 278.4c0-18.6-1.5-37.2-4.6-55.3H272v104.8h147c-6.3 34.3-25 63.5-53.6 83v68h86.5c50.6-46.6 81.6-115.2 81.6-200.5z"/>
        <path fill="#34A853" d="M272 544c72.6 0 133.5-24 178-65.1l-86.5-68c-24 16-54.7 25.6-91.5 25.6-70 0-129.2-47.2-150.5-110.6H34v69.7C78.5 485.1 167 544 272 544z"/>
        <path fill="#FBBC05" d="M121.5 325.9c-5.7-16.6-9-34.3-9-52.5s3.3-35.9 9-52.5v-69.7H34C12.3 194.7 0 232.6 0 273.4c0 40.8 12.3 78.7 34 111.7l87.5-69.2z"/>
        <path fill="#EA4335" d="M272 107.5c39.6 0 75.1 13.6 103.2 40.3l77.5-77.5C405.5 24 344.6 0 272 0 167 0 78.5 58.9 34 161.7l87.5 69.2c21.3-63.4 80.5-110.6 150.5-110.6z"/>
      </svg>
      Continue with Google
    </button>

    <!-- GitHub -->
    <button
      class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 shadow-sm transition hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-700 font-medium"
      onclick={() =>
        authClient.signIn.social({
          provider: "github",
          callbackURL: redirectTarget ?? "/"
        })
      }
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.082-.743.082-.729.082-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.835 2.809 1.305 3.493.998.108-.77.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.464-2.381 1.237-3.221-.124-.303-.532-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.046.138 3.003.404 2.292-1.552 3.3-1.23 3.3-1.23.649 1.653.24 2.873.118 3.176.774.84 1.237 1.911 1.237 3.221 0 4.609-2.807 5.624-5.479 5.923.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.797.576C20.564 22.832 24 18.32 24 12c0-6.627-5.373-12-12-12z"/>
      </svg>
      Continue with GitHub
    </button>
  </div>

  <!-- Divider -->
  <div class="flex items-center gap-3 pt-4">
    <div class="h-px flex-1 bg-gray-200"></div>
    <span class="text-xs uppercase tracking-wide text-gray-500">or continue with email</span>
    <div class="h-px flex-1 bg-gray-200"></div>
  </div>

  <!-- Email sign-up form -->
  <form class="space-y-6" onsubmit={signup}>
    <label class="block">
      <span class="text-sm font-medium text-gray-700">Full name</span>
      <input
        class="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        type="text"
        bind:value={name}
        autocomplete="name"
        required
      />
    </label>

    <label class="block">
      <span class="text-sm font-medium text-gray-700">Email address</span>
      <input
        class="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        type="email"
        bind:value={email}
        autocomplete="email"
        required
      />
    </label>

    <label class="block">
      <span class="text-sm font-medium text-gray-700">Password</span>
      <input
        class="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        type="password"
        bind:value={password}
        autocomplete="new-password"
        required
      />
    </label>

    <button
      class="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
      type="submit"
      disabled={loading}
      aria-busy={loading}
    >
      {loading ? "Creating account..." : "Create account"}
    </button>

    {#if error}
      <p class="text-center text-sm font-medium text-red-600 p-2 bg-red-50 rounded-lg border border-red-200">{error}</p>
    {/if}
  </form>

  <!-- Link to login -->
  <div class="pt-4 text-center text-sm">
    <p class="text-gray-600">Already have an account?</p>
    <a href={targetHref("/login")} class="font-medium text-indigo-600 hover:text-indigo-500 transition">
      Sign in
    </a>
  </div>
</section>
