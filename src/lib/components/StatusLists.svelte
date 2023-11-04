<script lang="ts">
	export let messageStore;

	import StatusList from './StatusList.svelte';
	import StatusListItem from './StatusListItem.svelte';
</script>

<div class="list-container">
	<StatusList title="poi">
		{#if [...$messageStore].filter((member) => member[1].status == 'poi').length > 0}
			{#each [...$messageStore]
				.filter((member) => member[1].status == 'poi')
				.sort((a, b) => {
					return a[1].set_at - b[1].set_at;
				}) as msg}
				<li>
					<StatusListItem status="poi" name={msg[0]} room={msg[1].room} />
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
					return a[1].set_at - b[1].set_at;
				}) as msg}
				<li>
					<StatusListItem status="response" name={msg[0]} room={msg[1].room} />
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
					return a[1].set_at - b[1].set_at;
				}) as msg}
				<li>
					<StatusListItem status="point" name={msg[0]} room={msg[1].room} />
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
	}
</style>
