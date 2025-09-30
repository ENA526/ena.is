<!-- +page.svelte -->
<script>
	// No JS required for this proof-of-concept. Replace placeholder images as needed.
	const features = [
		{
			title: "Blazing Fast",
			desc: "Fast to build, faster to load.",
			icon: "⚡"
		},
		{
			title: "Adaptive Layouts",
			desc: "Mobile-first.",
			icon: "📱"
		},
		{
			title: "Container-aware",
			desc: "Components reflow.",
			icon: "🧩"
		},
		{
			title: "A11y-minded",
			desc: "Semantic HTML and focus-visible affordances.",
			icon: "♿"
		}
	];
</script>

<!-- Page wrapper -->
<div class="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
	<!-- Top bar / Nav -->
	<header class="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
		<nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
			<a href="/" class="inline-flex items-center gap-2 font-semibold tracking-tight">
				<span class="inline-grid h-8 w-8 place-items-center rounded-xl bg-slate-900 text-white">E</span>
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

	<section class="relative isolate">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 grid gap-10 lg:grid-cols-2 lg:items-center">
			<div class="space-y-6">
				<p class="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-600">Made for all devices.</p>
				<h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
					ENA
					<span class="block text-slate-500 font-semibold">In development.</span>
				</h1>
				<p class="text-base sm:text-lg md:text-xl text-slate-600 max-w-prose">
                    Test page for mobile reactivity.
                </p>

				<div class="flex flex-col sm:flex-row gap-3 pt-2">
					<a href="#cta" class="inline-flex justify-center rounded-2xl px-5 py-3 text-base md:text-lg font-semibold bg-slate-900 text-white hover:bg-slate-800 focus:outline-none focus-visible:ring">Button A</a>
					<a href="#components" class="inline-flex justify-center rounded-2xl px-5 py-3 text-base md:text-lg font-semibold border border-slate-300 hover:bg-slate-50">Button B</a>
				</div>
			</div>

            <!-- Container query demo -->
			<div class="@container rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
				<div class="flex flex-col @md:flex-row">
					<img src="https://plus.unsplash.com/premium_photo-1683309565422-77818a287060?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Modern building" class="h-48 w-full object-cover @md:h-auto @md:w-1/2" />
					<div class="p-6 @md:p-8 @lg:p-10">
						<h2 class="text-xl md:text-2xl font-bold">Container-aware card</h2>
						<p class="mt-2 text-slate-600">This card flips to a side-by-side layout when its <em>container</em> is at least <code>@md</code> wide — regardless of the viewport.</p>
						<ul class="mt-4 grid grid-cols-1 @sm:grid-cols-2 gap-3 text-sm">
							<li class="rounded-xl border border-slate-200 p-3">@sm grid-cols-2</li>
							<li class="rounded-xl border border-slate-200 p-3">@md flex-row</li>
							<li class="rounded-xl border border-slate-200 p-3">@lg larger padding</li>
							<li class="rounded-xl border border-slate-200 p-3">@max-md stacks</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Features -->
	<section id="features" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
		<div class="text-center max-w-2xl mx-auto"> 
			<h2 class="text-2xl sm:text-3xl md:text-4xl font-bold">Scale with screens</h2>
			<p class="mt-3 text-slate-600">Utilities are mobile-first. Add <code>sm:</code>, <code>md:</code>, <code>lg:</code>, <code>xl:</code>, <code>2xl:</code> prefixes to progressively enhance.</p>
		</div>

		<div class="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
			{#each features as f}
				<article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm @container">
					<div class="text-3xl">{f.icon}</div>
					<h3 class="mt-3 text-lg font-semibold">{f.title}</h3>
					<p class="mt-1 text-slate-600">{f.desc}</p>
					<!-- Within this card, switch layout at the card's own width -->
					<div class="mt-4 flex flex-col gap-2 @sm:flex-row @max-sm:text-xs">
						<span class="inline-flex items-center justify-center rounded-xl border px-3 py-1">Base</span>
						<span class="inline-flex items-center justify-center rounded-xl border px-3 py-1">@sm</span>
						<span class="inline-flex items-center justify-center rounded-xl border px-3 py-1">@md</span>
					</div>
				</article>
			{/each}
		</div>
	</section>

	<!-- Components demo (breakpoint range targeting) -->
	<section id="components" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
		<div class="grid gap-6 lg:grid-cols-2 lg:items-start">
			<div class="space-y-4">
				<h2 class="text-2xl md:text-3xl font-bold">Breakpoint ranges</h2>
				<p class="text-slate-600">Use <code>md:max-lg:*</code> to target a single range. The card on the right gets a subtle accent <em>only</em> between <code>md</code> and <code>lg</code>.</p>
			</div>
			<div class="rounded-3xl border border-slate-200 bg-white p-6 md:max-lg:ring-2 md:max-lg:ring-slate-300 md:max-lg:shadow-sm">
				<p class="text-sm text-slate-600">Resize the viewport so its width is within the <strong>md..lg</strong> range to see the accent ring.</p>
			</div>
		</div>
	</section>

	<!-- CTA -->
	<section id="cta" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
		<div class="rounded-3xl border border-slate-200 bg-slate-900 text-white p-8 sm:p-10 lg:p-14 @container">
			<div class="@md:flex @md:items-center @md:justify-between gap-6">
				<div>
					<h2 class="text-2xl sm:text-3xl font-bold tracking-tight">Have a question?</h2>
					<p class="mt-2 text-slate-300">TBA</p>
				</div>
				<div class="mt-6 @md:mt-0 flex gap-3">
					<a class="inline-flex items-center justify-center rounded-2xl bg-white text-slate-900 px-5 py-3 font-semibold hover:bg-slate-100" href="#">Button C</a>
					<a class="inline-flex items-center justify-center rounded-2xl border border-white/30 px-5 py-3 font-semibold hover:bg-white/10" href="#">Button D</a>
				</div>
			</div>
		</div>
	</section>

	<!-- Footer -->
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
