<script>
	import { getContext, createEventDispatcher } from "svelte"
	import { valueStore } from "./data.js"

	export let placeholder = "PLACEHOLDER"
	export let value = ""
	export let label = ""
	export let disabled = false
	export let id
	export let type
	export let min
	export let max
	export let step
	export let classes = ""

	const dispatch = createEventDispatcher()

	const handleInput = (e) => {
		// in here, you can switch on type and implement
		// whatever behaviour you need
		value = type.match(/^(number|range)$/)
			? +e.target.value
			: e.target.value

		//   if (id === "columns") {
		valueStore.update((data) => {
			data[id] = value
			return data
		})

		//   }
	}
</script>

<style>
	div {
		padding-block: 2px;
	}
	.TextField {
		display: flex;
		border: 2px solid transparent;
		place-items: center;
		height: 28px;
		margin-left: calc(
			var(--fgp-gap_item_column, 0px) + (-1 * var(--margin-100))
		);
		margin-right: calc((-1 * var(--margin-100)));
		padding-inline: calc(var(--padding-100) - 2px);
		border-radius: var(--border-radius-25);
	}

	.TextField:hover {
		border-color: var(--color-black-10);
		border-width: 1px;
		padding-inline: calc(var(--padding-100) - 1px);
	}

	.TextField:focus-within {
		border-color: var(--color-blue);
		border-width: 2px;
		padding-inline: calc(var(--padding-100) - 2px);
	}

	.TextField span {
		margin-right: var(--margin-200);
		color: var(--color-black-30);
	}

	.TextField input {
		flex-grow: 1;
		cursor: default;
	}
</style>

<div>
	<label class="TextField {classes}">
		<span>{label}</span>
		<input
			{id}
			{type}
			{disabled}
			{value}
			{min}
			{max}
			{step}
			on:change={handleInput} />
	</label>
</div>
