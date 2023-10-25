<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { SSEvents } from '$lib/schemas';
	import StatusList from '$lib/components/StatusList.svelte';
	import StatusListItem from '$lib/components/StatusListItem.svelte';

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
	<StatusList title="poi">
		{#if [...$messageStore].filter((member) => member[1].status == 'poi').length > 0}
			{#each [...$messageStore]
				.filter((member) => member[1].status == 'poi')
				.sort((a, b) => {
					return b[1].set_at - a[1].set_at;
				}) as msg}
				<li>
					<StatusListItem status="poi">{msg[0]}</StatusListItem>
				</li>
			{/each}
		{:else}
			<p>none</p>
		{/if}
	</StatusList>
	<StatusList title="response">
		{#if [...$messageStore].filter((member) => member[1].status == 'response').length > 0}
			{#each [...$messageStore]
				.filter((member) => member[1].status == 'response')
				.sort((a, b) => {
					return b[1].set_at - a[1].set_at;
				}) as msg}
				<li>
					<StatusListItem status="response">{msg[0]}</StatusListItem>
				</li>
			{/each}
		{:else}
			<p>none</p>
		{/if}
	</StatusList>
	<StatusList title="point">
		{#if [...$messageStore].filter((member) => member[1].status == 'point').length > 0}
			{#each [...$messageStore]
				.filter((member) => member[1].status == 'point')
				.sort((a, b) => {
					return b[1].set_at - a[1].set_at;
				}) as msg}
				<button>
					<StatusListItem status="point">{msg[0]}</StatusListItem>
				</button>
			{/each}
		{:else}
			<p>none</p>
		{/if}
	</StatusList>
</div>

<style>
	button {
		outline: none;
		border: none;
	}

	.list-container {
		display: flex;
	}
</style>
