<script lang="ts">
	export let name: string;
	export let status: string;
	export let showModal: boolean = false;
</script>

<header>
	<div class="wrapper">
		<button
			class="name-btn"
			on:click={() => {
				showModal = true;
			}}>{name}</button
		>
		<p>{status}</p>
	</div>
</header>

<style>
	header {
		padding-left: auto;
		padding-right: auto;
		margin: 1rem;
		background: lightblue;
		border-radius: 0.5rem;
	}

	.wrapper {
		display: flex;
		justify-content: space-between;
		padding: 1rem;
	}

	.name-btn {
		all: unset;
		cursor: pointer;
	}

	.name-btn:focus {
		outline: 2px solid white;
		outline-offset: 2px;
	}
</style>
