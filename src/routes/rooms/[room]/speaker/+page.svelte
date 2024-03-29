<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { HeartBeat, SSEvents, type ConnectionStatus } from '$lib/schemas';
	import StatusLists from '$lib/components/StatusLists.svelte';
	import StatusBar from '$lib/components/StatusBar.svelte';
	import { enhance } from '$app/forms';

	export let data;
	let connectionStatus: ConnectionStatus = 'reconnecting';
	const {
		room: { roomMembers, title, id: roomId, roomActive, heartbeatInterval }
	} = data;
	const messageStore = writable(roomMembers);
	let active = writable<boolean>(roomActive);

	onMount(() => {
		let source: EventSource;
		let keepAliveTimer: ReturnType<typeof setTimeout> | null = null;
		function gotActivity() {
			if (keepAliveTimer != null) {
				clearTimeout(keepAliveTimer);
			}
			keepAliveTimer = setTimeout(() => {
				connectionStatus = 'reconnecting';
				connect();
			}, 1.5 * heartbeatInterval);
		}

		function connect() {
			source = new EventSource(`/rooms/${roomId}/activity`, {
				withCredentials: false
			});
			const event = SSEvents[roomId as keyof typeof SSEvents];
			source.addEventListener(event, (e) => {
				let message = JSON.parse(e.data);
				if (message.beat == HeartBeat.beat) {
					connectionStatus = 'connected';
					gotActivity();
					return;
				}
				if (message[1].type === 'set') {
					messageStore.update(($messageStore) => $messageStore.set(message[0], message[1]));
				}
				if (message[1].type === 'changename') {
					messageStore.update(($messageStore) => {
						let obj = $messageStore.get(message[0]);
						if (obj === undefined) {
							return $messageStore;
						}
						obj.name = message[1].name;
						return $messageStore.set(message[0], obj);
					});
				}
			});
		}

		connect();

		return () => {
			source.close();
		};
	});
</script>

<StatusBar name={'SPEAKER'} status={''} />
<h1>{title.toUpperCase()}</h1>
<p class="connectionstatus">{connectionStatus}</p>
<StatusLists {messageStore} clickable={true} />

<form
	method="post"
	action="?/start"
	use:enhance={() => {
		return ({ result }) => {
			if (result.type === 'success') {
				active.set(true);
			}
		};
	}}
>
	<input type="hidden" name="room" value="council" />
	<button type="submit" class:active={$active}
		>{#if $active}Room Active{:else}Start Room{/if}</button
	>
</form>

<style>
	h1 {
		padding: 1rem;
		text-align: center;
		color: white;
	}

	.connectionstatus {
		color: white;
		text-align: center;
		padding-bottom: 1rem;
	}

	form {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 2rem;
	}

	button {
		background-color: grey;
		border: none;
		color: white;
		padding: 15px 32px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-size: 16px;
		border-radius: 0.25rem;
	}

	button.active {
		background-color: lightgreen;
		color: black;
	}
</style>
