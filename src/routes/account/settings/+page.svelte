<script>
	import { authClient } from '$lib/auth-client';

	let accounts = $state([]);
	let loading = $state(true);

	$effect(() => {
		authClient.user.listAccounts().then((result) => {
			accounts = result.data || [];
			loading = false;
		});
	});

	const isLinked = (providerId) => {
		for (let i = 0; i < accounts.length; i++) {
			if (accounts[i].providerId === providerId) {
				return true;
			}
		}
		return false;
	};

	const linkAccount = async (provider) => {
		await authClient.linkSocial({
			provider,
			callbackURL: "/account/settings"
		});
	};

	const unlinkAccount = async (providerId) => {
		if (confirm(`Are you sure you want to unlink your ${providerId} account?`)) {
			try {
				await authClient.unlinkAccount({ providerId });
				// Refresh accounts list
				const result = await authClient.user.listAccounts();
				accounts = result.data || [];
			} catch (error) {
				alert(`Failed to unlink account: ${error.message}`);
			}
		}
	};

	const providers = [
		{
			id: 'google',
			name: 'Google',
			svg: `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>`
		},
		{
			id: 'github',
			name: 'GitHub',
			svg: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.082-.743.082-.729.082-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.835 2.809 1.305 3.493.998.108-.77.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.464-2.381 1.237-3.221-.124-.303-.532-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.046.138 3.003.404 2.292-1.552 3.3-1.23 3.3-1.23.649 1.653.24 2.873.118 3.176.774.84 1.237 1.911 1.237 3.221 0 4.609-2.807 5.624-5.479 5.923.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.797.576C20.564 22.832 24 18.32 24 12c0-6.627-5.373-12-12-12z"/></svg>`
		},
		{
			id: 'discord',
			name: 'Discord',
			svg: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 -28.5 256 256" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" fill="#5865F2" fill-rule="nonzero"/></svg>`
		}
	];
</script>

<svelte:head>
	<title>Link Accounts - ENA</title>
</svelte:head>

<section class="relative isolate">
	<div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
		<div class="space-y-6">
			<div>
				<p class="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-600">Account Settings</p>
				<h1 class="mt-2 text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
					Linked Accounts
				</h1>
				<p class="mt-3 text-base sm:text-lg text-slate-600 max-w-prose">
					Connect your social accounts to enable additional features and simplify sign-in.
				</p>
			</div>

			{#if loading}
				<div class="rounded-2xl border border-slate-200 bg-white p-8 text-center">
					<p class="text-slate-600">Loading accounts...</p>
				</div>
			{:else}
				<div class="space-y-3">
					{#each providers as provider}
						{@const linked = isLinked(provider.id)}
						<div class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
							<div class="p-6 flex items-center justify-between">
								<div class="flex items-center gap-4">
									<div class="relative">
										<div class="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center bg-white">
											{@html provider.svg}
										</div>
										{#if linked}
											<div class="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
												<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
												</svg>
											</div>
										{/if}
									</div>
									<div>
										<h3 class="text-lg font-semibold">{provider.name}</h3>
										{#if linked}
											<p class="text-sm text-green-600 font-medium">Linked</p>
										{:else}
											<p class="text-sm text-slate-500">Not connected</p>
										{/if}
									</div>
								</div>

								<div>
									{#if linked}
										<button
											class="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition duration-150"
											onclick={() => unlinkAccount(provider.id)}
										>
											Unlink
										</button>
									{:else}
										<button
											class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition duration-150"
											onclick={() => linkAccount(provider.id)}
										>
											Link Account
										</button>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</section>

<!-- Info Section -->
<section class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-16">
	<div class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
		<h3 class="text-lg font-semibold">Why link accounts?</h3>
		<ul class="mt-3 space-y-2 text-sm text-slate-600">
			<li class="flex items-start gap-2">
				<span class="text-slate-400 mt-0.5">•</span>
				<span>Sign in with any of your linked accounts</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="text-slate-400 mt-0.5">•</span>
				<span>Access additional features (Discord bot management requires Discord linked)</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="text-slate-400 mt-0.5">•</span>
				<span>Keep your account secure with multiple authentication methods</span>
			</li>
		</ul>
	</div>
</section>