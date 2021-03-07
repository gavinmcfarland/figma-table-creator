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
	export let name
	export let checked
	export let icon

	const contextHandleInput = getContext("handleInput")

	const dispatch = createEventDispatcher()

	function handleInput(e) {
		contextHandleInput(e)
		dispatch("input", e)
	}
</script>

<style>
	[icon="text-align-top"] label::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M15 1H1V2H15V1ZM8.35355 3.64645L8 3.29289L7.64645 3.64645L4.64645 6.64645L5.35355 7.35355L7.5 5.20711V13H8.5V5.20711L10.6464 7.35355L11.3536 6.64645L8.35355 3.64645Z' fill='black'/%3E%3C/svg%3E%0A");
	}

	[icon="text-align-middle"] label::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M8 6.20711L8.35355 5.85355L10.3536 3.85355L9.64645 3.14645L8.5 4.29289V0H7.5V4.29289L6.35355 3.14645L5.64645 3.85355L7.64645 5.85355L8 6.20711ZM8 9.79289L8.35355 10.1464L10.3536 12.1464L9.64645 12.8536L8.5 11.7071V16H7.5V11.7071L6.35355 12.8536L5.64645 12.1464L7.64645 10.1464L8 9.79289ZM1 8.5H15V7.5H1V8.5Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}

	[icon="text-align-bottom"] label::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M8.35355 12.3536L8 12.7071L7.64645 12.3536L4.64645 9.35355L5.35355 8.64645L7.5 10.7929V3H8.5V10.7929L10.6464 8.64645L11.3536 9.35355L8.35355 12.3536ZM15 14V15H1V14H15Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}

	.RadioButton .icon-button {
		border: 1px solid transparent;
		background-clip: padding-box;
	}

	.RadioButton input[type="radio"]:checked + .icon-button {
		border-color: rgba(0, 0, 0, 0.1);
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
		margin-block: 2px;
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
		background-color: var(--color-black-10);
	}
</style>

<div class="RadioButton {classes}" {icon}>
	<input {id} type="radio" {disabled} bind:value {name} {checked} />
	<label for={id}>{label}</label>
</div>
