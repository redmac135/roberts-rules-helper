<script lang="ts">
	export let messageStore;
	export let clickable: boolean = false;

	import StatusList from './StatusList.svelte';
	import StatusListItem from './StatusListItem.svelte';
</script>

<div class="list-container">
	<StatusList title="poi">
		{#if [...$messageStore].filter((member) => member[1].status == 'poi').length > 0}
			<p>count: {[...$messageStore].filter((member) => member[1].status == 'poi').length}</p>
			{#each [...$messageStore]
				.filter((member) => member[1].status == 'poi')
				.sort((a, b) => a[1].set_at - b[1].set_at) as msg (msg[0])}
				<li>
					<StatusListItem
						status="poi"
						uid={msg[0]}
						name={msg[1].name}
						room={msg[1].room}
						{clickable}
					/>
				</li>
			{/each}
		{:else}
			<p>none</p>
		{/if}
	</StatusList>
	<StatusList title="response">
		{#if [...$messageStore].filter((member) => member[1].status == 'response').length > 0}
			<p>count: {[...$messageStore].filter((member) => member[1].status == 'response').length}</p>
			{#each [...$messageStore]
				.filter((member) => member[1].status == 'response')
				.sort((a, b) => a[1].set_at - b[1].set_at) as msg (msg[0])}
				<li>
					<StatusListItem
						status="response"
						uid={msg[0]}
						name={msg[1].name}
						room={msg[1].room}
						{clickable}
					/>
				</li>
			{/each}
		{:else}
			<p>none</p>
		{/if}
	</StatusList>
	<StatusList title="point">
		{#if [...$messageStore].filter((member) => member[1].status == 'point').length > 0}
			<p>count: {[...$messageStore].filter((member) => member[1].status == 'point').length}</p>
			{#each [...$messageStore]
				.filter((member) => member[1].status == 'point')
				.sort((a, b) => a[1].set_at - b[1].set_at) as msg (msg[0])}
				<li>
					<StatusListItem
						status="point"
						uid={msg[0]}
						name={msg[1].name}
						room={msg[1].room}
						{clickable}
					/>
				</li>
			{/each}
		{:else}
			<p>none</p>
		{/if}
	</StatusList>
</div>

<style>
	.list-container {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}

	@media (max-width: 600px) {
		.list-container {
			flex-direction: column;
			align-items: center;
		}
	}
</style>
