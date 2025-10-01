<script lang="ts">
  import { authClient } from "$lib/auth/auth-client";

  async function handleSignout() {
    await authClient.signOut();
  }
</script>

<h1>Sign Out</h1>
<button on:click={handleSignout}>Sign Out</button>
