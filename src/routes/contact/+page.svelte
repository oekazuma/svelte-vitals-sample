<script>
	let name = $state('');
	let email = $state('');
	let message = $state('');
	let sent = $state(false);

	function handleSubmit(event) {
		event.preventDefault();
		sent = true;
	}
</script>

<h1>Contact us</h1>

{#if sent}
	<p>Thanks, {name} — we'll get back to you at {email}.</p>
{:else}
	<form onsubmit={handleSubmit}>
		<label>
			Name
			<input type="text" bind:value={name} required />
		</label>
		<label>
			Email
			<input type="email" bind:value={email} required />
		</label>
		<label>
			Message
			<textarea bind:value={message} required></textarea>
		</label>
		<button type="submit">Send</button>
	</form>
{/if}

<p><a href="javascript:void(0)" onclick={() => window.scrollTo(0, 0)}>Back to top</a></p>
