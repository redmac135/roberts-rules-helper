<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { writable } from 'svelte/store';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { HeartBeat, SSEvents, type ConnectionStatus } from '$lib/schemas';
	import { v4 as uuid } from 'uuid';

	export let form: ActionData;
	export let data;

	import Modal from '$lib/components/Modal.svelte';
	import StatusLists from '$lib/components/StatusLists.svelte';
	import StatusOptions from '$lib/components/StatusOptions.svelte';
	import StatusBar from '$lib/components/StatusBar.svelte';

	let uid: string;
	let name: string;
	let connectionStatus: ConnectionStatus = 'reconnecting';
	if (browser) {
		const userPreferedName = localStorage.getItem('user-name');
		const userPrevuid = localStorage.getItem('useruid');
		if (userPrevuid) {
			uid = userPrevuid;
		} else {
			uid = uuid();
			// TODO: set an expiry on this local storage and make sure that it's room specific
			localStorage.setItem('useruid', uid);
		}
		if (userPreferedName) {
			name = userPreferedName;
		} else {
			name = 'tmp-' + uid;
			localStorage.setItem('user-name', name);
		}
	}

	const {
		room: { roomMembers, title, heartbeatInterval, id: roomId }
	} = data;

	type UserInfo = {
		uid: string;
		name: string;
		status: string;
	};

	const messageStore = writable(roomMembers);
	const user = writable<UserInfo>({ uid: uid, name: name, status: 'standby' });

	onMount(() => {
		showModal = true;
		let source: EventSource;
		// constant refreshing of Event Source
		let keepAliveTimer: NodeJS.Timeout | null = null;

		function gotActivity() {
			if (keepAliveTimer != null) {
				clearTimeout(keepAliveTimer);
			}
			keepAliveTimer = setTimeout(() => {
				gotActivity();
				connectionStatus = 'reconnecting';
			}, 1.5 * heartbeatInterval);
		}

		function connect() {
			gotActivity();
			source = new EventSource(`/rooms/${roomId}/activity`, {
				withCredentials: false
			});
			const event = SSEvents[roomId as keyof typeof SSEvents];
			source.addEventListener(event, (e) => {
				let message = JSON.parse(e.data);
				if (message.beat == HeartBeat.beat) {
					gotActivity();
					connectionStatus = 'connected';
					return;
				}
				if (message[1].type === 'set') {
					messageStore.update(($messageStore) => $messageStore.set(message[0], message[1]));
					// if it's ourselves -> update self status
					if (message[0] === $user.uid) {
						selectedValue = message[1].status;
						user.update(($user) => {
							$user.name = message[1].name;
							return $user;
						});
					}
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

	let formElem: HTMLFormElement;

	let choices = [
		{ label: 'POI', value: 'poi' },
		{ label: 'Response', value: 'response' },
		{ label: 'Point', value: 'point' }
	];

	let selectedValue = 'standby';

	function toggleOption(value: 'poi' | 'point' | 'response' | 'standby') {
		if (selectedValue === value) {
			selectedValue = 'standby';
		} else {
			selectedValue = value;
		}
		formElem.requestSubmit();
	}

	function resetUid() {
		uid = uuid();
		localStorage.setItem('useruid', uid);
	}

	// Modal and name logic
	let showModal: boolean;
	let dialog: HTMLDialogElement;
	$: user.update((obj) => ({ uid: uid, name: name, status: obj.status }));

	// hacky solution to show status errors
	let statusFormError: string = '';
</script>

<StatusBar name={$user?.name} status={$user.status} bind:showModal />

<div class="right"><button class="reset" on:click={resetUid}>Change User</button></div>

<Modal bind:showModal bind:dialog>
	<form
		method="post"
		action="?/changename"
		use:enhance={({ formData }) => {
			let newname = formData.get('name')?.toString();
			if (newname === undefined) return; // TODO: this function should raise error from zod
			return ({ result, update }) => {
				if (result.type === 'success') {
					//@ts-ignore
					name = newname;
					localStorage.setItem('user-name', name);
					dialog.close();
				} else {
					update();
				}
			};
		}}
	>
		<input type="hidden" name="useruid" value={$user.uid} />
		<input type="hidden" name="room" value={data.room.id} />
		<input type="hidden" name="status" value={$user.status} />
		<input
			type="text"
			on:focus={(event) => event.target?.select()}
			name="name"
			value={$user.name}
		/>
		{#if form?.error && form?.formName === 'changename'}
			<p class="error" id="error">{form.error}</p>
		{/if}
		<button type="submit">Set Name</button>
	</form>
</Modal>

<h1>{title.toUpperCase()}</h1>

<p class="connectionstatus">{connectionStatus}</p>

<form
	method="post"
	action="?/setstatus"
	bind:this={formElem}
	on:submit|preventDefault
	use:enhance={({ formData }) => {
		formData.set('status', selectedValue);
		user.update((obj) => ({ uid: obj.uid, name: name, status: selectedValue }));
		return async () => {
			return;
		};
	}}
>
	<StatusOptions {choices} bind:selectedValue {toggleOption} />
	<input type="hidden" name="room" value={data.room.id} />
	<input type="hidden" name="useruid" value={$user.uid} />
	<input type="hidden" name="name" value={$user.name} />
	{#if statusFormError !== ''}
		<p class="error" id="error">{statusFormError}</p>
	{/if}
</form>

<StatusLists {messageStore} />

<style>
	.error {
		color: red;
		font-weight: bold;
		font-size: 1rem;
	}

	.connectionstatus {
		color: white;
		text-align: center;
		padding-bottom: 1rem;
	}

	.right {
		margin: 1rem;
		display: flex;
		justify-content: right;
	}

	button.reset {
		border: none;
		background-color: orange;
		padding-right: 0.5rem;
		padding-left: 0.5rem;
		padding-top: 0.25rem;
		padding-bottom: 0.25rem;
		border-radius: 0.25rem;
	}

	h1 {
		text-align: center;
		color: white;
	}

	form {
		display: grid;
		place-items: center;
		gap: 1rem;
		width: 100%;
	}
</style>
