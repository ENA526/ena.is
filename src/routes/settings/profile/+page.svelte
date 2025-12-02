<script>
	let form = $state({
		name: 'Local Dev',
		displayName: '',
		email: 'select',
		bio: 'ENA',
		url: 'https://ena.is',
		socialLink1: '',
		socialLink2: '',
		socialLink3: '',
		socialLink4: '',
		company: '',
		location: '',
		showLocalTime: false
	});

	let profilePicture = $state('https://avatars.githubusercontent.com/u/61644589?v=4&size=64'); // Replace with actual image path
	let isEditingImage = $state(false);

	const handleImageEdit = () => {
		// Add visual feedback
		isEditingImage = true;
		setTimeout(() => {
			isEditingImage = false;
		}, 150);
		// Add image upload logic here
	};
</script>

<svelte:head>
	<title>Public Profile - ENA</title>
</svelte:head>

<section class="relative isolate">
	<div class="space-y-8">
		<!-- Header -->
		<div>
			<p class="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-600">Personal</p>
			<div class="flex items-center justify-between flex-wrap gap-3 mt-2">
				<h1 class="text-3xl sm:text-4xl font-extrabold leading-tight">
					Public profile
				</h1>
				<a
					href="/profile"
					class="hidden sm:inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 transition duration-150"
				>
					Go to your personal profile
				</a>
			</div>
			<p class="mt-3 text-base text-slate-600 max-w-prose">
				Manage your public profile information. This information will be visible to other users.
			</p>
			<a
				href="/profile"
				class="sm:hidden mt-4 inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 transition duration-150"
			>
				Go to your personal profile
			</a>
		</div>

		<form method="POST" action="?/updateProfile" class="space-y-6">
			<!-- Profile Picture - Mobile Top -->
			<div class="lg:hidden">
				<label for="profile-picture-mobile" class="block text-sm font-semibold text-slate-900 mb-2">
					Profile picture
				</label>
				<div class="relative w-48">
					<button
						id="profile-picture-mobile"
						type="button"
						onclick={() => {
							handleImageEdit();
						}}
						class="w-48 h-48 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg hover:opacity-90 transition-opacity cursor-pointer"
					>
						<img
							src={profilePicture}
							alt="Profile"
							class="w-full h-full object-cover"
						/>
					</button>
					<div
						class="absolute bottom-2 right-2 rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-900 shadow-sm flex items-center gap-1.5 pointer-events-none transition-all duration-150 {isEditingImage ? 'scale-95 bg-slate-50' : ''}"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
						</svg>
						Edit
					</div>
				</div>
			</div>

			<!-- Name, Display Name, Email, and Desktop Profile Picture Section -->
			<div class="flex flex-col lg:flex-row gap-6 lg:gap-8">
				<!-- Left Column - Text Inputs -->
				<div class="flex-1 space-y-6">
					<!-- Name -->
					<div>
						<label for="name" class="block text-sm font-semibold text-slate-900 mb-2">
							Name
						</label>
						<input
							id="name"
							name="name"
							type="text"
							bind:value={form.name}
							class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
						/>
						<p class="mt-2 text-xs text-slate-600">
							Your name may appear around ENA where you contribute or are mentioned. You can remove it at any time.
						</p>
					</div>

					<!-- Display Name -->
					<div>
						<label for="display-name" class="block text-sm font-semibold text-slate-900 mb-2">
							Display name
						</label>
						<input
							id="display-name"
							name="displayName"
							type="text"
							bind:value={form.displayName}
							placeholder="Enter a display name"
							class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
						/>
						<p class="mt-2 text-xs text-slate-600">
							This will be shown instead of your username on your profile.
						</p>
					</div>

					<!-- Public Email -->
					<div>
						<label for="public-email" class="block text-sm font-semibold text-slate-900 mb-2">
							Public email
						</label>
						<select
							id="public-email"
							name="email"
							bind:value={form.email}
							class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
						>
							<option value="select">Select a verified email to display</option>
							<option value="user@example.com">user@example.com</option>
							<option value="secondary@example.com">secondary@example.com</option>
						</select>
						<p class="mt-2 text-xs text-slate-600">
							You can manage verified email addresses in your <a href="/settings/emails" class="text-blue-600 hover:underline">email settings</a>.
						</p>
					</div>
				</div>

				<!-- Right Column - Profile Picture (Desktop Only) -->
				<div class="hidden lg:block flex-shrink-0">
					<div class="block text-sm font-semibold text-slate-900 mb-2">
						Profile picture
					</div>
					<div class="relative w-48">
						<button
							type="button"
							onclick={() => {
								handleImageEdit();
							}}
							class="w-48 h-48 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg hover:opacity-90 transition-opacity cursor-pointer"
						>
							<img
								src={profilePicture}
								alt="Profile"
								class="w-full h-full object-cover"
							/>
						</button>
						<div
							class="absolute bottom-2 right-2 rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-900 shadow-sm flex items-center gap-1.5 pointer-events-none transition-all duration-150 {isEditingImage ? 'scale-95 bg-slate-50' : ''}"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
							</svg>
							Edit
						</div>
					</div>
				</div>
			</div>

			<!-- Bio -->
			<div>
				<label for="bio" class="block text-sm font-semibold text-slate-900 mb-2">
					Bio
				</label>
				<textarea
					id="bio"
					name="bio"
					bind:value={form.bio}
					rows="4"
					class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
				></textarea>
				<p class="mt-2 text-xs text-slate-600">
					You can <span class="font-mono text-slate-800">@mention</span> other users and organizations to link to them.
				</p>
			</div>

			<!-- URL -->
			<div>
				<label for="url" class="block text-sm font-semibold text-slate-900 mb-2">
					URL
				</label>
				<input
					id="url"
					name="url"
					type="url"
					bind:value={form.url}
					placeholder="https://example.com"
					class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
				/>
			</div>

			<!-- Social Accounts -->
			<fieldset>
				<legend class="block text-sm font-semibold text-slate-900 mb-2">
					Social accounts
				</legend>
				<div class="space-y-3">
					<div class="flex items-center gap-3">
						<svg class="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
						</svg>
						<input
							type="url"
							name="socialLink1"
							bind:value={form.socialLink1}
							placeholder="Link to social profile 1"
							aria-label="Social profile link 1"
							class="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
						/>
					</div>
					<div class="flex items-center gap-3">
						<svg class="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
						</svg>
						<input
							type="url"
							name="socialLink2"
							bind:value={form.socialLink2}
							placeholder="Link to social profile 2"
							aria-label="Social profile link 2"
							class="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
						/>
					</div>
					<div class="flex items-center gap-3">
						<svg class="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
						</svg>
						<input
							type="url"
							name="socialLink3"
							bind:value={form.socialLink3}
							placeholder="Link to social profile 3"
							aria-label="Social profile link 3"
							class="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
						/>
					</div>
					<div class="flex items-center gap-3">
						<svg class="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
						</svg>
						<input
							type="url"
							name="socialLink4"
							bind:value={form.socialLink4}
							placeholder="Link to social profile 4"
							aria-label="Social profile link 4"
							class="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
						/>
					</div>
				</div>
			</fieldset>

			<!-- Company -->
			<div>
				<label for="company" class="block text-sm font-semibold text-slate-900 mb-2">
					Company
				</label>
				<input
					id="company"
					name="company"
					type="text"
					bind:value={form.company}
					placeholder="Your company name"
					class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
				/>
				<p class="mt-2 text-xs text-slate-600">
					You can <span class="font-mono text-slate-800">@mention</span> your company's GitHub organization to link it.
				</p>
			</div>

			<!-- Location -->
			<div>
				<label for="location" class="block text-sm font-semibold text-slate-900 mb-2">
					Location
				</label>
				<input
					id="location"
					name="location"
					type="text"
					bind:value={form.location}
					placeholder="Your location"
					class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
				/>
			</div>

			<!-- Display Local Time -->
			<div class="flex items-start gap-3">
				<input
					id="show-local-time"
					name="showLocalTime"
					type="checkbox"
					bind:checked={form.showLocalTime}
					value="true"
					class="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-0"
				/>
				<div>
					<label for="show-local-time" class="block text-sm font-semibold text-slate-900 cursor-pointer">
						Display current local time
					</label>
					<p class="mt-1 text-xs text-slate-600">
						Other users will see the time difference from their local time.
					</p>
				</div>
			</div>

			<!-- Update Button -->
			<div class="pt-4 border-t border-slate-200">
				<button
					type="submit"
					class="rounded-lg bg-slate-900 text-white px-6 py-2.5 text-sm font-semibold hover:bg-slate-800 transition duration-150"
				>
					Update profile
				</button>
			</div>
		</form>
	</div>
</section>

<style>
	/* Custom scrollbar for textarea */
	textarea::-webkit-scrollbar {
		width: 8px;
	}
	
	textarea::-webkit-scrollbar-track {
		background: #f1f5f9;
		border-radius: 4px;
	}
	
	textarea::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 4px;
	}
	
	textarea::-webkit-scrollbar-thumb:hover {
		background: #94a3b8;
	}
</style>