<script>
  import { authClient } from "$lib/auth/auth-client";

  async function handleSignout() {
    await authClient.signOut();
  }
</script>

<button on:click={handleSignout}>Sign Out</button>
