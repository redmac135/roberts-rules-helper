<script lang="ts">
	import type { IMember } from '$lib/schemas';

	export let status: IMember['status'];

	const colorMap = new Map([
		['poi', 'red'],
		['response', 'lightgreen'],
		['point', 'lightblue'],
		['standby', 'gray']
	]);
</script>

<div class="wrapper" style="background-color: {colorMap.get(status)};">
	<slot />
</div>

<style>
	.wrapper {
		display: block;
		font-size: large;
		font-weight: bolder;
		text-align: center;
		width: 8rem;
		border-radius: 0.25rem;
		padding: 0.5rem;
		margin-top: 0.25rem;
		margin-bottom: 0.25rem;
	}
</style>
