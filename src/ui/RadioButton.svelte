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
	export let name
	export let checked
	export let icon

	export let group = "MIN"

	function handleInput() {
		valueStore.update((data) => {
			data[name] = group
			return data
		})
	}
</script>

<style>


	.RadioButton .icon-button {
		border: 1px solid transparent;
		background-clip: padding-box;
	}

	.RadioButton input[type="radio"]:checked + .icon-button {
		border-color: var(--figma-color-border, var(--color-black-10));
	}

	.RadioButton:hover input[type="radio"] + .icon-button {
		border-top-color: transparent;
		border-bottom-color: transparent;
	}

	.RadioButton:hover :first-child input[type="radio"] + .icon-button {
		border-left-color: transparent;
	}

	.RadioButton:hover :last-child input[type="radio"] + .icon-button {
		border-right-color: transparent;
	}

	.RadioButton input[type="radio"] ~ label {
		border-radius: 2px;
		display: block;
		/* width: 100%; */
		height: 24px;
		min-width: 24px;
	}

	.RadioButton input {
		position: absolute;
		opacity: 0;
		cursor: pointer;
		height: 0;
		width: 0;
	}

	.RadioButton .icon-button:hover {
		background-color: transparent;
	}

	.RadioButton {
		height: 28px;
		display: flex;
		place-items: center;
		/* margin-block: 2px; */
		flex-grow: 1;
	}

	/* input[type="radio"] {
		opacity: 0;
		width: 0px;
		height: 0px;
		margin: 0;
		padding: 0;
	} */

	.RadioButton input + label::before {
		content: "";
		height: 100%;
		display: block;
		width: 100%;
		background-repeat: no-repeat;
		background-position: center;
	}

	.RadioButton input:checked + label {
		background-color: var(--figma-color-border, var(--color-black-10));
	}
</style>

<div class="RadioButton {classes}" {icon}>
	<input
		{id}
		type="radio"
		{disabled}
		{value}
		{checked}
		{name}
		bind:group
		on:change={handleInput} />
	<label for={id}>{label}</label>
</div>
