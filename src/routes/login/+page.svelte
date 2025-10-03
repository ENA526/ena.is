<script>
   import { authClient } from "$lib/auth/auth-client";
   import { goto } from "$app/navigation";
   import { page } from "$app/state"; // in Svelte 5 use $app/state if using runes

   // --- state (runes) ---
   let email = $state("");
   let password = $state("");
   let rememberMe = $state(true);
   let loading = $state(false);
   let error = $state(null);

   // --- derive & sanitize redirect target from query ---
   const redirectTarget = $derived.by(() => {
      const raw = page.url.searchParams.get("redirect");
      if (!raw) return null;
      if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
      return null;
   });

   function targetHref(path) {
      return redirectTarget ? `${path}?redirect=${encodeURIComponent(redirectTarget)}` : path;
   }

   async function login(event) {
      event.preventDefault();
      if (loading) return;
      loading = true;
      error = null;

      const { error: err } = await authClient.signIn.email(
         { email, password, rememberMe },
         {
            onSuccess: async () => {
               await goto(redirectTarget ?? "/");
            },
            onError: (ctx) => {
               error = ctx?.error?.message ?? "Login failed";
            }
         }
      );

      if (err) error = err.message ?? "Login failed";
      loading = false;
   }
</script>

<svelte:head>
   <title>Log in</title>
</svelte:head>

<section class="mx-auto max-w-sm space-y-4 p-6">
   <h1 class="text-3xl font-bold text-gray-900">Sign in to your account</h1>

   <form class="space-y-6" onsubmit={login}>
      <!-- Email -->
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

      <!-- Password -->
      <label class="block">
         <span class="text-sm font-medium text-gray-700">Password</span>
         <input
            class="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            type="password"
            bind:value={password}
            autocomplete="current-password"
            required
         />
      </label>

      <!-- Remember me -->
      <label class="flex items-center gap-2 text-sm text-gray-700">
         <input type="checkbox" bind:checked={rememberMe} class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
         Keep me logged in
      </label>

      <!-- Submit -->
      <button
         class="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition duration-150 ease-in-out hover:bg-indigo-700 disabled:opacity-50"
         type="submit"
         disabled={loading}
         aria-busy={loading}
      >
         {loading ? "Signing in..." : "Sign in"}
      </button>

      {#if error}
         <p class="text-center text-sm font-medium text-red-600 p-2 bg-red-50 rounded-lg border border-red-200">{error}</p>
      {/if}
   </form>

   <!-- Footer links -->
   <div class="pt-4 text-center text-sm">
      <p class="text-gray-600">Don't have an account?</p>
      <a href={targetHref("/register")} class="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150">
         Create an account
      </a>
   </div>

   <!-- Social login -->
   <div class="pt-6 space-y-3 border-t border-gray-200 mt-6">
      <!-- Google -->
      <button
         class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-700 font-medium"
         onclick={() =>
            authClient.signIn.social({
               provider: "google",
               callbackURL: redirectTarget ?? "/"
            })
         }
      >
         <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
         Continue with Google
      </button>

      <!-- GitHub -->
      <button
         class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-700 font-medium"
         onclick={() =>
            authClient.signIn.social({
               provider: "github",
               callbackURL: redirectTarget ?? "/"
            })
         }
      >
         <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.082-.743.082-.729.082-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.835 2.809 1.305 3.493.998.108-.77.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.464-2.381 1.237-3.221-.124-.303-.532-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.046.138 3.003.404 2.292-1.552 3.3-1.23 3.3-1.23.649 1.653.24 2.873.118 3.176.774.84 1.237 1.911 1.237 3.221 0 4.609-2.807 5.624-5.479 5.923.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.797.576C20.564 22.832 24 18.32 24 12c0-6.627-5.373-12-12-12z"/>
         </svg>
         Continue with GitHub
      </button>
   </div>
</section>
