<script lang="ts">
	export let name: string;
	export let status: string;
	export let showModal: boolean = false;
</script>

<header>
	<div class="wrapper">
		<a
			href="/"
			on:click|preventDefault={() => {
				showModal = true;
			}}>{name}</a
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

	a {
		text-decoration: none;
	}
</style>
