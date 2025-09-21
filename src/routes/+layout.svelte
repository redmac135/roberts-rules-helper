<script lang="ts">
	import favicon from '$lib/assets/favicon.png';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		font-family: system-ui, sans-serif;
	}

	:global(html, body) {
		background-color: rgb(39, 39, 39);
		color: rgb(0, 15, 49);
	}

	:global(a:visited) {
		color: inherit;
	}
</style>
