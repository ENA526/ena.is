<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
<header class="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
		<nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
			<a href="/" class="inline-flex items-center gap-2 font-semibold tracking-tight">
				<span class="inline-grid h-8 w-8 place-items-center rounded-xl text-white">
					<img src={favicon} alt="Logo" class="h-7 w-7" />
				</span>
				<span class="text-lg">ENA</span>
			</a>


			<!-- Simple responsive menu with <details> (no JS) -->
			<details class="sm:hidden relative">
				<summary class="list-none cursor-pointer rounded-lg px-3 py-2 hover:bg-slate-100 focus:outline-none focus-visible:ring">
					<span class="sr-only">Toggle menu</span>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" /></svg>
				</summary>
				<div class="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-lg p-2">
					<a class="block rounded-lg px-3 py-2 hover:bg-slate-50" href="#features">Link 1</a>
					<a class="block rounded-lg px-3 py-2 hover:bg-slate-50" href="#components">Link 2</a>
					<a class="block rounded-lg px-3 py-2 hover:bg-slate-50" href="#cta">Link 3</a>
				</div>
			</details>

			<ul class="hidden sm:flex items-center gap-1 text-sm">
				<li><a class="rounded-lg px-3 py-2 hover:bg-slate-100" href="#features">Link 1</a></li>
				<li><a class="rounded-lg px-3 py-2 hover:bg-slate-100" href="#components">Link 2</a></li>
				<li><a class="rounded-lg px-3 py-2 hover:bg-slate-100" href="#cta">Link 3</a></li>
			</ul>
		</nav>
	</header>

	{@render children()}

	<footer class="border-t border-slate-200 py-8 text-sm text-slate-600">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
			<p>© 2025 ENA. All rights reserved.</p>
			<ul class="flex gap-4">
				<li><a class="hover:underline" href="#">GitHub</a></li>
				<li><a class="hover:underline" href="#">Discord</a></li>
				<li><a class="hover:underline" href="#">X</a></li>
			</ul>
		</div>
	</footer>
</div>

<style>
	/* Optional: smooth anchor scrolling */
	html { scroll-behavior: smooth; }
</style>
