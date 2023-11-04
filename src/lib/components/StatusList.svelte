<script lang="ts">
	export let title: string;
</script>

<ol>
	<h2>{title.toUpperCase()}</h2>
	<slot />
</ol>

<style>
	ol {
		background-color: lightgray;
		border-radius: 0.3rem;
		list-style: none;
		text-align: center;
		width: 10rem;
		padding: 1rem;
		margin: 0.5rem;
	}
</style>
