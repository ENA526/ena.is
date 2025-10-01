<script lang="ts">
  import { authClient } from "$lib/auth/auth-client";
  let email = "";
  let password = "";
  let name = "";
  let error: string | null = null;

  async function handleSignup() {
    const { error: err } = await authClient.signUp.email({
      email,
      password,
      name,
    });
    if (err) error = err.message;
  }
</script>

<h1>Sign Up</h1>
<input placeholder="Name" bind:value={name} />
<input type="email" placeholder="Email" bind:value={email} />
<input type="password" placeholder="Password" bind:value={password} />
<button on:click={handleSignup}>Sign Up</button>
{#if error}<p style="color:red">{error}</p>{/if}
