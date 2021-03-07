<script>
	import { getContext, createEventDispatcher } from "svelte"

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

	const contextHandleInput = getContext("handleInput")

	const dispatch = createEventDispatcher()

	function handleInput(e) {
		contextHandleInput(e)
		dispatch("input", e)
	}
</script>

<style>
	.Checkbox {
		height: 28px;
		display: flex;
		place-items: center;
		padding-block: 2px;
	}

	input[type="checkbox"] {
		opacity: 0;
		width: 0px;
		height: 0px;
		margin: 0;
		padding: 0;
	}
	input[type="checkbox"] + label {
		/* display: flex; */
		vertical-align: middle;
		margin-top: 6px;
	}
	input[type="checkbox"] + label::before {
		width: var(--size-150);
		height: var(--size-150);
		display: inline-block;
		content: "";
		border-radius: var(--border-radius-25);
		background-repeat: no-repeat;
		background-position: 1px 2px;
		border: 1px solid var(--color-black-80);
		margin-left: 2px;
		margin-right: var(--margin-125);
		margin-bottom: 2px;
		vertical-align: middle;
		box-sizing: border-box;
	}
	input[type="checkbox"]:checked + label::before {
		border-color: var(--color-blue);
		background-color: var(--color-blue);
		background-image: url(data:image/svg+xml;utf8,%3Csvg%20fill%3D%22none%22%20height%3D%227%22%20viewBox%3D%220%200%208%207%22%20width%3D%228%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20clip-rule%3D%22evenodd%22%20d%3D%22m1.17647%201.88236%201.88235%201.88236%203.76471-3.76472%201.17647%201.17648-4.94118%204.9412-3.05882-3.05884z%22%20fill%3D%22%23fff%22%20fill-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E);
	}
</style>

<div class="Checkbox {classes}">
	<input {id} type="checkbox" {disabled} bind:value />
	<label for={id}>{label}</label>
</div>
