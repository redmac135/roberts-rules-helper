<script lang="ts">
	import { onMount } from 'svelte';
	import { SSEvents, type IMember } from '$lib/schemas';
	import { writable } from 'svelte/store';

	const recentMsg = writable<IMember>();

	onMount(() => {
		const source = new EventSource('/rooms/activity');

		source.addEventListener(SSEvents.general, (event) => {
			const message = JSON.parse(event.data);
			recentMsg.update(() => message);
		});

		return () => {
			source.close();
		};
	});
</script>

<h1>Robert's Rule Helper</h1>
<ul>
	<li><a href="/rooms/council">Council</a></li>
</ul>

<style>
	h1 {
		font-size: 3rem;
		padding: 1.5rem;
		text-align: center;
		color: white;
	}

	ul {
		list-style: none;
		min-width: 75%;
		display: grid;
		place-items: center;
		gap: 0.5em;
		margin-bottom: 1rem;
	}

	ul li {
		padding: 0.5rem;
	}

	ul a {
		text-decoration: none;
		font-size: 3rem;
		background-color: rgb(164, 219, 244);
		padding: 0.25rem 1rem;
		border-radius: 4px;
		transition: all 150ms ease;
	}

	ul a:hover {
		background-color: rgb(52, 110, 218);
		color: white;
	}
</style>
