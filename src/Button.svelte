<script>
	import { getContext, createEventDispatcher } from "svelte"

	export let id
	export let classes = ""
	export let label = ""

	const contextHandleInput = getContext("handleInput")

	const dispatch = createEventDispatcher()

	function handleInput(e) {
		contextHandleInput(e)
		dispatch("input", e)
	}
</script>

<style>
	.Button {
		border-radius: var(--border-radius-50);
		background-color: var(--color-blue);
	}
</style>

<button {id} class="Button {classes}"><slot /></button>
