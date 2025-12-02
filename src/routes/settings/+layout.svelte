<script>
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import { slide } from 'svelte/transition';

	let mobileMenuOpen = false;

	// Close mobile menu after navigation
	afterNavigate(() => {
		mobileMenuOpen = false;
	});

	const navItems = [
		{
			section: 'Personal',
			items: [
				{ href: '/settings/profile', label: 'Public profile', icon: '👤' },
				{ href: '/settings/appearance', label: 'Appearance', icon: '🎨' },
				{ href: '/settings/notifications', label: 'Notifications', icon: '🔔' }
			]
		},
		{
			section: 'Access',
			items: [
				{ href: '/settings/emails', label: 'Emails', icon: '✉️' },
				{ href: '/settings/password', label: 'Password and authentication', icon: '🔒' },
				{ href: '/settings/sessions', label: 'Sessions', icon: '📱' },
				{ href: '/settings/api-keys', label: 'API keys', icon: '🔑' }
			]
		}
	];

	// Get current active item
	$: currentItem = navItems
		.flatMap(section => section.items)
		.find(item => $page.url.pathname === item.href);

	$: currentLabel = currentItem?.label || 'Settings';

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
</script>

<svelte:head>
	<title>Settings - ENA</title>
</svelte:head>

<div class="min-h-screen bg-slate-50">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
		<div class="flex flex-col lg:flex-row gap-6 lg:gap-8">
			<!-- Mobile Menu Toggle -->
			<div class="lg:hidden">
				<button
					on:click={toggleMobileMenu}
					class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm flex items-center justify-between hover:bg-slate-50 focus:outline-none focus-visible:ring"
				>
					<span class="flex items-center gap-3">
						<span class="text-lg">{currentItem?.icon || '⚙️'}</span>
						<span class="font-semibold">{currentLabel}</span>
					</span>
					<svg
						class="w-5 h-5 transition-transform {mobileMenuOpen ? 'rotate-180' : ''}"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>

				{#if mobileMenuOpen}
					<nav
						transition:slide={{ duration: 200 }}
						class="mt-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
					>
						{#each navItems as section}
							<div class="border-b border-slate-100 last:border-b-0">
								<div class="px-4 py-2 bg-slate-50">
									<h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500">
										{section.section}
									</h3>
								</div>
								<ul class="py-1">
									{#each section.items as item}
										<li>
											<a
												href={item.href}
												class="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 {$page.url.pathname === item.href
													? 'bg-slate-100 font-semibold text-slate-900'
													: 'text-slate-700'}"
											>
												<span class="text-base">{item.icon}</span>
												<span>{item.label}</span>
											</a>
										</li>
									{/each}
								</ul>
							</div>
						{/each}
					</nav>
				{/if}
			</div>

			<!-- Desktop Sidebar -->
			<aside class="hidden lg:block lg:w-64 flex-shrink-0">
				<nav class="sticky top-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
					{#each navItems as section, i}
						<div class="border-b border-slate-100 last:border-b-0">
							<div class="px-4 py-3 bg-slate-50">
								<h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500">
									{section.section}
								</h3>
							</div>
							<ul class="py-1">
								{#each section.items as item}
									<li>
										<a
											href={item.href}
											class="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors {$page.url.pathname === item.href
												? 'bg-slate-100 font-semibold text-slate-900 border-l-4 border-slate-900'
												: 'text-slate-700 border-l-4 border-transparent'}"
										>
											<span class="text-base">{item.icon}</span>
											<span>{item.label}</span>
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</nav>
			</aside>

			<!-- Main Content -->
			<main class="flex-1 min-w-0">
				<div class="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8 lg:p-10">
					<slot />
				</div>
			</main>
		</div>
	</div>
</div>

<style>
	/* Smooth scrolling */
	:global(html) {
		scroll-behavior: smooth;
	}
</style>