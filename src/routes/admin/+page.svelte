<script>
   import { authClient } from '$lib/auth/auth-client'; // Adjust path to your auth client
   import { onMount } from 'svelte';
   
   let accounts = $state([]);
   let loading = $state(true);
   
   onMount(async () => {
      const result = await authClient.listAccounts();
      accounts = result || [];
      console.log('Linked accounts:', accounts);
      loading = false;
   });
</script>

{#if loading}
   <p>Loading accounts...</p>
{:else}
   <div>
      <h2>Linked Accounts</h2>
      <pre>{JSON.stringify(accounts, null, 2)}</pre>
   </div>
{/if}