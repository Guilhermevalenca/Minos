<script>
	let key;
	let code;

	function handleKeydown(event) {
		key = event.key;
		code = event.code;
	}
</script>

<svelte:window on:keydown={handleKeydown}/>

<div style="text-align: center">
	{#if key}
		<kbd>{key === ' ' ? 'Space' : key}</kbd>
        {#if (code == "ArrowUp")}
		<p>{code}</p>
        {:else}
        <p>nao funciono</p>
        {/if}
	{:else}
		<p>Focus this window and press any key</p>
	{/if}
</div>

