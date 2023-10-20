<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { ActionData } from './$types';
	import { SSEvents } from '$lib/schemas';

	export let form: ActionData;
	export let data;

	const {
		room: { roomMembers, title, id: roomId }
	} = data;

	const messageStore = writable(roomMembers);
	const user = getContext<Writable<string>>('user');
	const userStatus = writable('');

	onMount(() => {
		const source = new EventSource(`${$page.url}/activity`, {
			withCredentials: false
		});
		const event = SSEvents[roomId as keyof typeof SSEvents];
		source.addEventListener(event, (e) => {
			const message = JSON.parse(e.data);
			const membername = message.name;
			delete message.name;
			messageStore.update(($messageStore) => $messageStore.set(membername, message));
		});
		return () => {
			source.close();
		};
	});

	let formElem;
	function handleSubmit(e) {
		console.log('submitted');
	}

	function handleChange() {
		formElem.requestSubmit();
	}

	// make this better
	let optionsMap = new Map<string, number>([
		['point', 0],
		['response', 1],
		['poi', 2]
	]);
</script>

<h1>{title}</h1>

<form
	method="post"
	bind:this={formElem}
	on:submit|preventDefault={handleSubmit}
	use:enhance={({ formElement }) => {
		return async ({ update }) => {
			//@ts-ignore
			formElement.children[optionsMap.get($userStatus)].setAttribute('checked', 'true');
			await update();
		};
	}}
>
	<!-- must be on top for child index -->
	<input type="checkbox" on:change={handleChange} value="point" name="status" />
	<input type="checkbox" on:change={handleChange} value="response" name="status" />
	<input type="checkbox" on:change={handleChange} value="poi" name="status" />
	<input type="hidden" name="room" value={data.room.id} />
	<input type="hidden" name="name" value={$user} />
	<input type="text" name="status" value="response" />
	{#if form?.error}
		<p class="error" id="error">{form.error}</p>
	{/if}
</form>

<button
	on:click={() => {
		userStatus.set('poi');
	}}>Set POI</button
>

<button
	on:click={() => {
		userStatus.set('point');
	}}>Set point</button
>

<div class="msg_box">
	{#if $messageStore.size > 0}
		<ul>
			{#each [...$messageStore] as msg}
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
