<script>
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import { afterNavigate } from '$app/navigation';

  // SSR data
  let { children, data } = $props();

  // Mobile menu state
  let menuOpen = $state(false);
  let menuButton = $state(null);

  // Avatar menu state
  let avatarMenuOpen = $state(false);
  let avatarButton = $state(null);

  // Session helpers
  const user = $derived(data?.user ?? null);

  const isLoggedIn = $derived(Boolean(user));
  const avatar = $derived(user?.avatar_url || user?.image || "https://avatars.githubusercontent.com/u/61644589?v=4&size=64");
  const displayName = $derived(user?.display_name || user?.name || "User");

  // Close all menus on navigation
  afterNavigate(() => {
    menuOpen = false;
    avatarMenuOpen = false;
  });

  // Close menus on Escape
  function handleKeydown(e) {
    if (e.key === 'Escape') {
      menuOpen = false;
      avatarMenuOpen = false;
    }
  }

  // Click-outside handler
function clickOutside(node, anchor) {
    const handler = (e) => {
        const path = e.composedPath ? e.composedPath() : [];

        const inside = node.contains(e.target) || path.includes(node);
        const anchorClicked = anchor && (anchor.contains(e.target) || path.includes(anchor));

        if (!inside && !anchorClicked) {
            menuOpen = false;
            avatarMenuOpen = false;
        }
    };

    // Delay attachment so the same click that opened the menu doesn't close it
    const timer = setTimeout(() => {
        document.addEventListener('click', handler);
    });

    return {
        destroy() {
            clearTimeout(timer);
            document.removeEventListener('click', handler);
        }
    };
}

  // Remove focus ring when avatar closes
  $effect(() => {
    if (!avatarMenuOpen && avatarButton) avatarButton.blur();
    if (!menuOpen && menuButton) menuButton.blur();
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
  <header class="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
    <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

      <!-- Logo -->
      <a href="/" class="inline-flex items-center gap-2 font-semibold tracking-tight">
        <span class="inline-grid h-8 w-8 place-items-center rounded-xl text-white">
          <img src={favicon} alt="Logo" class="h-7 w-7" />
        </span>
        <span class="text-lg">ENA</span>
      </a>


      <!-- MOBILE -->
      <div class="sm:hidden relative">

        {#if isLoggedIn}
          <!-- Avatar -->
          <button
            bind:this={avatarButton}
            class="h-9 w-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-slate-300"
            onclick={() => avatarMenuOpen = !avatarMenuOpen}
            aria-label="User menu"
            aria-expanded={avatarMenuOpen}
          >
            <img src={avatar} alt={displayName} class="h-full w-full object-cover" />
          </button>

          {#if avatarMenuOpen}
            <div
              use:clickOutside={avatarButton}
              class="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-lg p-2 text-sm"
            >

              <div class="px-3 py-2 text-slate-600 font-medium">
                {displayName}
              </div>

              <hr class="my-1" />

              <!-- Navigation -->
              <a href="/minesweeper" class="block px-3 py-2 rounded-lg hover:bg-slate-50">
                Minesweeper
              </a>
              <a href="/blog" class="block px-3 py-2 rounded-lg hover:bg-slate-50">
                Blog
              </a>
              <a href="/about" class="block px-3 py-2 rounded-lg hover:bg-slate-50">
                About
              </a>
              <a href="/settings/account/api-keys" class="block px-3 py-2 rounded-lg hover:bg-slate-50">
                API Keys
              </a>
              <a href="/settings/account/bot-keys" class="block px-3 py-2 rounded-lg hover:bg-slate-50">
                Bot Keys
              </a>
              <a href="/bot/dashboard" class="block px-3 py-2 rounded-lg hover:bg-slate-50">
                Bot Dashboard
              </a>


              <hr class="my-1" />

              <!-- User Actions -->
              <a href="/logout" class="block px-3 py-2 rounded-lg hover:bg-slate-50 text-red-600">
                Logout
              </a>

            </div>
          {/if}
        {:else}

          <button
            bind:this={menuButton}
            class="rounded-lg px-3 py-2 hover:bg-slate-100"
            onclick={() => menuOpen = !menuOpen}
            aria-label="Main menu"
            aria-expanded={menuOpen}
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          </button>
        {/if}


        {#if menuOpen && !isLoggedIn}
          <div
            use:clickOutside={menuButton}
            class="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-lg p-2 text-sm"
          >
            <a href="/minesweeper" class="block px-3 py-2 rounded-lg hover:bg-slate-50">Minesweeper</a>
            <a href="/blog" class="block px-3 py-2 rounded-lg hover:bg-slate-50">Blog</a>
            <a href="/about" class="block px-3 py-2 rounded-lg hover:bg-slate-50">About</a>
            <a href="/settings/account/api-keys" class="block px-3 py-2 rounded-lg hover:bg-slate-50">API Keys</a>
            <a href="/settings/account/bot-keys" class="block px-3 py-2 rounded-lg hover:bg-slate-50">Bot Keys</a>
            <a href="/bot/dashboard" class="block px-3 py-2 rounded-lg hover:bg-slate-50">Bot Dashboard</a>
            <a href="/login" class="block px-3 py-2 rounded-lg hover:bg-slate-50">Login</a>
            <a href="/register" class="block px-3 py-2 rounded-lg hover:bg-slate-50">Register</a>
          </div>
        {/if}
      </div>

      <!-- DESKTOP -->
      <ul class="hidden sm:flex items-center gap-1 text-sm">

        <li><a class="rounded-lg px-3 py-2 hover:bg-slate-100" href="/minesweeper">Minesweeper</a></li>
        <li><a class="rounded-lg px-3 py-2 hover:bg-slate-100" href="/blog">Blog</a></li>
        <li><a class="rounded-lg px-3 py-2 hover:bg-slate-100" href="/about">About</a></li>

        {#if isLoggedIn}
          <li class="relative">

            <button
              bind:this={avatarButton}
              class="h-9 w-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-slate-300"
              onclick={() => avatarMenuOpen = !avatarMenuOpen}
              aria-label="User menu"
              aria-expanded={avatarMenuOpen}
            >
              <img src={avatar} alt={displayName} class="h-full w-full object-cover" />
            </button>

            {#if avatarMenuOpen}
              <div
                use:clickOutside={avatarButton}
                class="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white shadow-lg p-2 text-sm"
              >
                <div class="px-3 py-2 text-slate-600">{displayName}</div>
                <hr class="my-1" />
                <a href="/settings/account/api-keys" class="block px-3 py-2 rounded-lg hover:bg-slate-50">API Keys</a>
                <a href="/settings/account/bot-keys" class="block px-3 py-2 rounded-lg hover:bg-slate-50">Bot Keys</a>
                <a href="/bot/dashboard" class="block px-3 py-2 rounded-lg hover:bg-slate-50">Bot Dashboard</a>
                <hr class="my-1" />
                <a href="/logout" class="block px-3 py-2 rounded-lg hover:bg-slate-50">Logout</a>
              </div>
            {/if}

          </li>

        {:else}
          <li><a href="/login" class="rounded-lg px-3 py-2 hover:bg-slate-100">Login</a></li>
          <li><a href="/register" class="rounded-lg px-3 py-2 hover:bg-slate-100">Register</a></li>
        {/if}

      </ul>

    </nav>
  </header>

  {@render children()}

  <footer class="border-t border-slate-200 py-8 text-sm text-slate-600">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between gap-4">
      <p>© 2025 ENA. All rights reserved.</p>
      <ul class="flex gap-4">
        <li><a href="https://github.com/ENA526" class="hover:underline">GitHub</a></li>
        <li><a href="https://discord.gg/jEUu7Btg" class="hover:underline">Discord</a></li>
        <li><a href="https://twitter.com/ENA526" class="hover:underline">X</a></li>
      </ul>
    </div>
  </footer>
</div>
