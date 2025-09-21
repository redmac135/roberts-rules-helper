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

<button type="button" class="status-btn" on:click={setStandby}>
	<div class="wrapper" style="background-color: {colorMap.get(status)};" title={name}>
		<span class="clamp multiline">{name}</span>
	</div>
</button>

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

	.clamp {
		display: block;
		max-width: 100%;
	}

	.multiline {
		white-space: normal;
		word-break: break-word;
		overflow-wrap: anywhere;
		overflow: hidden;
	}

	.status-btn {
		all: unset;
		cursor: pointer;
	}

	.status-btn:focus {
		outline: 2px solid white;
		outline-offset: 2px;
	}
</style>
