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
			let message = JSON.parse(e.data);
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
		return () => {
			source.close();
		};
	});
</script>

<StatusBar name={'SPEAKER'} status={''} />
<StatusLists {messageStore} clickable={true} />
