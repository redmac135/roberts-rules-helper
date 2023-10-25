<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { SSEvents } from '$lib/schemas';
	import { v4 as uuid } from 'uuid';

	export let form: ActionData;
	export let data;

	import MandatoryModal from '$lib/components/MandatoryModal.svelte';

	const {
		room: { roomMembers, title, id: roomId }
	} = data;

	const messageStore = writable(roomMembers);
	const user = writable<string>();
	const userStatus = writable('standby');

	onMount(() => {
		showModal = true;
		uid = 'tmp-' + uuid();
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

	let formElem: HTMLFormElement;
	function handleSubmit(e: Event) {
		console.log('submitted');
	}

	// make this better
	let optionsMap = new Map<string, number>([
		['point', 0],
		['response', 1],
		['poi', 2],
		['standby', 99]
	]);

	let choices = [
		{ label: 'Point', value: 'point' },
		{ label: 'Response', value: 'response' },
		{ label: 'POI', value: 'poi' }
	];

	let selectedValue = 'standby';

	function toggleOption(value) {
		if (selectedValue === value) {
			selectedValue = 'standby';
		} else {
			selectedValue = value;
		}
		formElem.requestSubmit();
	}

	// Modal and name logic
	let uid: string;
	let showModal: Boolean;
	let dialog: HTMLDialogElement;
	$: user.set(uid);
</script>

<header class="header">
	<p>Posting as: <span>{$user?.toString() ?? ''}</span></p>
	<button
		on:click={() => {
			showModal = true;
		}}>change name</button
	>
	<a href="/">Home</a>
</header>

<MandatoryModal bind:showModal bind:dialog>
	<form
		method="post"
		action="?/changename"
		use:enhance={({ formData }) => {
			let name = formData.get('name')?.toString();
			if (name === undefined) return;
			return async () => {
				uid = name;
				dialog.close();
			};
		}}
	>
		<input type="hidden" name="previous" value={$user} />
		<input type="hidden" name="room" value={data.room.id} />
		<input type="hidden" name="status" value={$userStatus} />
		<input type="text" name="name" />
		<button type="submit">Set Name</button>
	</form>
</MandatoryModal>

<h1>{title}</h1>

<form
	method="post"
	action="?/setstatus"
	bind:this={formElem}
	on:submit|preventDefault={handleSubmit}
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
	{#each choices as choice}
		<label>
			<input
				type="radio"
				bind:group={selectedValue}
				value={choice.value}
				on:click={() => toggleOption(choice.value)}
			/>
			{choice.label}
		</label>
	{/each}
	<input type="hidden" name="room" value={data.room.id} />
	<input type="hidden" name="name" value={$user} />
	{#if form?.error}
		<p class="error" id="error">{form.error}</p>
	{/if}
</form>

<div class="msg_box">
	{#if $messageStore.size > 0}
		<ul>
			{#each [...$messageStore].sort((a, b) => {
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
		</ul>
	{:else}
		<p>No messages.</p>
	{/if}
</div>

<style>
	.msg_box {
		margin-top: 8px;
		padding: 1rem;
		background-color: rgba(157, 210, 235, 0.25);
		border-radius: 4px;
		width: 90%;
	}

	.msg_box ul {
		display: grid;
		gap: 4px;
	}

	.msg_box li {
		list-style: none;
	}
	.msg {
		background-color: rgba(255, 255, 255, 0.5);
		border-radius: 4px;
		padding: 0.5rem;
	}
	.msg span {
		font-size: 1rem;
	}

	.error {
		color: red;
		font-weight: bold;
		font-size: 1rem;
	}

	small {
		font-size: 0.75rem;
	}

	h1 {
		padding: 1rem;
	}

	form {
		display: grid;
		place-items: center;
		gap: 1rem;
		width: 100%;
	}

	@media screen and (min-width: 640px) {
		.msg_box {
			width: 75%;
		}
	}
</style>
