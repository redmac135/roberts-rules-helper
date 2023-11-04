<script lang="ts">
	import { colorMap } from '$lib';

	type choiceType = {
		label: string;
		value: string;
	};

	export let choices: choiceType[];
	export let selectedValue: string;
	export let toggleOption: Function;
</script>

<div class="wrapper">
	{#each choices as choice}
		<label>
			<input
				type="radio"
				bind:group={selectedValue}
				value={choice.value}
				on:click={() => toggleOption(choice.value)}
			/>
			<div style="background-color: {colorMap.get(choice.value)};">{choice.label}</div>
		</label>
	{/each}
</div>

<style>
	.wrapper {
		display: flex;
	}

	label > div {
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0.5rem;
		width: 6rem;
		height: 6rem;
		border-radius: 0.5rem;
		opacity: 1;
		transition: scale 200ms, opacity 200ms;
	}

	:checked + div {
		scale: 0.9;
		opacity: 0.7;
	}

	input {
		display: none;
	}

	@media (min-width: 600px) {
		label > div {
			width: 8rem;
			height: 8rem;
		}
	}
</style>
