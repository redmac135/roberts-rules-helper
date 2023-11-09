<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { writable } from 'svelte/store';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { SSEvents } from '$lib/schemas';
	import { v4 as uuid } from 'uuid';

	export let form: ActionData;
	export let data;

	import MandatoryModal from '$lib/components/MandatoryModal.svelte';
	import StatusLists from '$lib/components/StatusLists.svelte';
	import StatusOptions from '$lib/components/StatusOptions.svelte';
	import StatusBar from '$lib/components/StatusBar.svelte';

	let uid: string;
	if (browser) {
		const userId = localStorage.getItem('userid');
		if (userId) {
			uid = userId;
		} else {
			uid = 'tmp-' + uuid();
			localStorage.setItem('userid', uid);
		}
	}

	const {
		room: { roomMembers, title, id: roomId }
	} = data;

	const messageStore = writable(roomMembers);
	const user = writable<string>();
	const userStatus = writable('standby');

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
				if (membername === $user?.toString()) {
					selectedValue = message.status;
				}
			}
			if (message.type === 'delete') {
				messageStore.update(($messageStore) => {
					$messageStore.delete(membername);
					return $messageStore;
				});
			}
		});
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

	// Modal and name logic
	let showModal: boolean;
	let dialog: HTMLDialogElement;
	$: user.set(uid);
</script>

<StatusBar name={$user?.toString()} status={$userStatus} bind:showModal />

<MandatoryModal bind:showModal bind:dialog>
	<form
		method="post"
		action="?/changename"
		use:enhance={({ formData }) => {
			let name = formData.get('name')?.toString();
			if (name === undefined) return; // TODO: this function should raise error
			return ({ result, update }) => {
				if (result.type === 'success') {
					uid = name;
					dialog.close();
				} else {
					update();
				}
			};
		}}
	>
		<input type="hidden" name="previous" value={$user} />
		<input type="hidden" name="room" value={data.room.id} />
		<input type="hidden" name="status" value={$userStatus} />
		<input type="text" name="name" />
		{#if form?.error}
			<p class="error" id="error">{form.error}</p>
		{/if}
		<button type="submit">Set Name</button>
	</form>
</MandatoryModal>

<h1>{title.toUpperCase()}</h1>

<form
	method="post"
	action="?/setstatus"
	bind:this={formElem}
	on:submit|preventDefault
	use:enhance={({ formElement, formData }) => {
		formData.set('status', selectedValue);
		userStatus.set(selectedValue);
		return async ({ update }) => {
			// Don't know why but this line just works
			formElement.children[99].setAttribute('checked', 'true');
			await update();
		};
	}}
>
	<StatusOptions {choices} bind:selectedValue {toggleOption} />
	<input type="hidden" name="room" value={data.room.id} />
	<input type="hidden" name="name" value={$user} />
	{#if form?.error}
		<p class="error" id="error">{form.error}</p>
	{/if}
</form>

<StatusLists {messageStore} />

<style>
	.error {
		color: red;
		font-weight: bold;
		font-size: 1rem;
	}

	h1 {
		padding: 1rem;
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
