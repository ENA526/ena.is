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
				{ 
					href: '/settings/profile', 
					label: 'Public profile', 
					icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>'
				},
				{ 
					href: '/settings/appearance', 
					label: 'Appearance', 
					icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>'
				},
				{ 
					href: '/settings/notifications', 
					label: 'Notifications', 
					icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>'
				}
			]
		},
		{
			section: 'Access',
			items: [
				{ 
					href: '/settings/emails', 
					label: 'Emails', 
					icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>'
				},
				{ 
					href: '/settings/password', 
					label: 'Password and authentication', 
					icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>'
				},
				{ 
					href: '/settings/sessions', 
					label: 'Sessions', 
					icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>'
				},
				{ 
					href: '/settings/api-keys', 
					label: 'API keys', 
					icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>'
				},
				{ 
					href: '/settings/bot-keys', 
					label: 'Bot keys', 
					icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/></svg>'
				}
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
						<span class="text-slate-600">{@html currentItem?.icon || '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>'}</span>
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
												<span class="text-slate-600">{@html item.icon}</span>
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
											<span class="text-slate-600">{@html item.icon}</span>
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