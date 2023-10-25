<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { SSEvents } from '$lib/schemas';

	export let data;
	const {
		room: { roomMembers, title, id: roomId }
	} = data;
	const messageStore = writable(roomMembers);

	onMount(() => {
		const source = new EventSource(`/rooms/${roomId}/activity`, {
			withCredentials: false
		});
		const event = SSEvents[roomId as keyof typeof SSEvents];
		source.addEventListener(event, (e) => {
			const message = JSON.parse(e.data);
			const membername: string = message.name;
			delete message.name;
			if (message.type === 'set') {
				messageStore.update(($messageStore) => $messageStore.set(membername, message));
			}
			if (message.type === 'delete') {
				messageStore.update(($messageStore) => {
					$messageStore.delete(membername);
					return $messageStore;
				});
				console.log($messageStore);
			}
		});
		return () => {
			source.close();
		};
	});
</script>

<div class="list-container">
	<div class="list-item poi">
		<h2>POI</h2>
		{#if [...$messageStore].filter((member) => member[1].status == 'poi').length > 0}
			{#each [...$messageStore]
				.filter((member) => member[1].status == 'poi')
				.sort((a, b) => {
					return b[1].set_at - a[1].set_at;
				}) as msg}
				<li>
					<div class="msg">
						<span
							><span style="font-weight: bold;"
								>{msg[0].toString()}
								<p>{msg[1].status}</p>
								<small
									>{new Intl.DateTimeFormat('en-US', {
										timeStyle: 'short',
										dateStyle: 'short'
									}).format(new Date(msg[1].set_at))}</small
								>
							</span></span
						>
					</div>
				</li>
			{/each}
		{:else}
			<p>No POIs</p>
		{/if}
	</div>
	<div class="list-item response">
		<h2>Response</h2>
		{#if [...$messageStore].filter((member) => member[1].status == 'response').length > 0}
			{#each [...$messageStore]
				.filter((member) => member[1].status == 'response')
				.sort((a, b) => {
					return b[1].set_at - a[1].set_at;
				}) as msg}
				<li>
					<div class="msg">
						<span
							><span style="font-weight: bold;"
								>{msg[0].toString()}
								<p>{msg[1].status}</p>
								<small
									>{new Intl.DateTimeFormat('en-US', {
										timeStyle: 'short',
										dateStyle: 'short'
									}).format(new Date(msg[1].set_at))}</small
								>
							</span></span
						>
					</div>
				</li>
			{/each}
		{:else}
			<p>No Response</p>
		{/if}
	</div>
	<div class="list-item point">
		<h2>Point</h2>
		{#if [...$messageStore].filter((member) => member[1].status == 'point').length > 0}
			{#each [...$messageStore]
				.filter((member) => member[1].status == 'point')
				.sort((a, b) => {
					return b[1].set_at - a[1].set_at;
				}) as msg}
				<li>
					<div class="msg">
						<span
							><span style="font-weight: bold;"
								>{msg[0].toString()}
								<p>{msg[1].status}</p>
								<small
									>{new Intl.DateTimeFormat('en-US', {
										timeStyle: 'short',
										dateStyle: 'short'
									}).format(new Date(msg[1].set_at))}</small
								>
							</span></span
						>
					</div>
				</li>
			{/each}
		{:else}
			<p>No Points</p>
		{/if}
	</div>
</div>

<style>
	.list-container {
		display: flex;
	}
</style>
