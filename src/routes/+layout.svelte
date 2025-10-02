<script>
	import '../app.css'
	import favicon from '$lib/assets/favicon.svg'
	import { authClient } from "$lib/auth/auth-client";
	import { afterNavigate } from '$app/navigation';

	const session = authClient.useSession();
	let { children } = $props();

	// Reactive state for the mobile menu
	let menuOpen = $state(false);
	let menuButton = $state(null);

	// Close menu whenever navigation happens
	afterNavigate(() => (menuOpen = false));

	// Close menu on Escape key
	function handleKeydown(e) {
		if (e.key === 'Escape') menuOpen = false;
	}

	/**
	 * Click-outside action that ignores clicks on:
	 * - the menu node itself
	 * - the toggle button (anchor)
	 */
	function clickOutside(node, anchor) {
		const handler = (e) => {
			const path = e.composedPath ? e.composedPath() : [];
			const clickedInsideMenu = node.contains(e.target) || path.includes(node);
			const clickedAnchor = anchor && (anchor.contains(e.target) || path.includes(anchor));
			if (clickedInsideMenu || clickedAnchor) return;
			menuOpen = false;
		};
		// pointerdown avoids the open-then-instant-close race
		document.addEventListener('pointerdown', handler, { capture: true });
		return {
			destroy() {
				document.removeEventListener('pointerdown', handler, { capture: true });
			}
		};
	}

	// Remove focus ring when menu closes
	$effect(() => {
		if (!menuOpen && menuButton) menuButton.blur();
	});

	// Debugging session state
	// $effect(() => {
	// 	if ($session.data) {
	// 		console.log("CLIENT SESSION", $session.data.user, $session.data.session);
	// 	} else {
	// 		console.log("CLIENT SESSION: not logged in");
	// 	}
	// });
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Global Escape key listener -->
<svelte:window onkeydown={handleKeydown} />

<div class="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
	<header class="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
		<nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
			<a href="/" class="inline-flex items-center gap-2 font-semibold tracking-tight">
				<span class="inline-grid h-8 w-8 place-items-center rounded-xl text-white">
					<img src={favicon} alt="Logo" class="h-7 w-7" />
				</span>
				<span class="text-lg">ENA</span>
			</a>

			<!-- Mobile menu -->
			<div class="sm:hidden relative">
				<button
					bind:this={menuButton}
					aria-expanded={menuOpen}
					aria-haspopup="menu"
					aria-controls="mobile-menu"
					class="rounded-lg px-3 py-2 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring"
					onclick={() => (menuOpen = !menuOpen)}
				>
					<span class="sr-only">Toggle menu</span>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" /></svg>
				</button>

				{#if menuOpen}
					<div
						id="mobile-menu"
						role="menu"
						use:clickOutside={menuButton}
						class="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-lg p-2"
					>
						<a class="block rounded-lg px-3 py-2 hover:bg-slate-50" href="/minesweeper" role="menuitem" onclick={() => (menuOpen = false)}>Minesweeper</a>
						<a class="block rounded-lg px-3 py-2 hover:bg-slate-50" href="/blog" role="menuitem" onclick={() => (menuOpen = false)}>Blog</a>
						<a class="block rounded-lg px-3 py-2 hover:bg-slate-50" href="/about" role="menuitem" onclick={() => (menuOpen = false)}>About</a>
						{#if $session.data}
							<a class="block rounded-lg px-3 py-2 hover:bg-slate-50" href="/signout" role="menuitem" onclick={() => (menuOpen = false)}>Logout</a>
						{:else}
							<a class="block rounded-lg px-3 py-2 hover:bg-slate-50" href="/signup" role="menuitem" onclick={() => (menuOpen = false)}>Signup</a>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Desktop menu -->
			<ul class="hidden sm:flex items-center gap-1 text-sm">
				<li><a class="rounded-lg px-3 py-2 hover:bg-slate-100" href="/minesweeper">Minesweeper</a></li>
				<li><a class="rounded-lg px-3 py-2 hover:bg-slate-100" href="/blog">Blog</a></li>
				<li><a class="rounded-lg px-3 py-2 hover:bg-slate-100" href="/about">About</a></li>
				<li><a class="rounded-lg px-3 py-2 hover:bg-slate-100" href="/blog">Blog</a></li>
				<li><a class="rounded-lg px-3 py-2 hover:bg-slate-100" href="/about">About</a></li>
				{#if $session.data}
					<li><a class="rounded-lg px-3 py-2 hover:bg-slate-100" href="/signout">Logout</a></li>
				{:else}
					<li><a class="rounded-lg px-3 py-2 hover:bg-slate-100" href="/signup">Signup</a></li>
				{/if}
			</ul>
		</nav>
	</header>

	{@render children()}

	<footer class="border-t border-slate-200 py-8 text-sm text-slate-600">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
			<p>© 2025 ENA. All rights reserved.</p>
			<ul class="flex gap-4">
				<li><a class="hover:underline" href="https://github.com/ENA526">GitHub</a></li>
				<li><a class="hover:underline" href="https://discord.gg/jEUu7Btg">Discord</a></li>
				<li><a class="hover:underline" href="https://twitter.com/ENA526">X</a></li>
			</ul>
		</div>
	</footer>
</div>

<style>
</style>
