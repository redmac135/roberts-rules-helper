<main>
	<slot />
</main>

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
