<script lang="ts">
	import type { IMember } from '$lib/schemas';
	import { colorMap } from '$lib';

	export let uid: string;
	export let name: IMember['name'];
	export let status: IMember['status'];
	export let room: IMember['room'];
	export let clickable: boolean;

	function setStandby() {
		if (clickable) {
			fetch(`/rooms/${room}/speaker/api`, {
				method: 'post',
				body: JSON.stringify({
					uid: uid,
					name: name,
					room: room
				})
			});
		}
	}
</script>

<a href="/" on:click|preventDefault={setStandby}>
	<div class="wrapper" style="background-color: {colorMap.get(status)};">
		{name}
	</div>
</a>

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

	a {
		text-decoration: none;
	}
</style>
