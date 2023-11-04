<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { SSEvents } from '$lib/schemas';
	import StatusLists from '$lib/components/StatusLists.svelte';
	import StatusBar from '$lib/components/StatusBar.svelte';

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
			}
		});
		return () => {
			source.close();
		};
	});
</script>

<StatusBar name={'SPEAKER'} status={''} />
<StatusLists {messageStore} clickable={true} />
