<script>
	import { getContext, createEventDispatcher } from "svelte"

	export let id
	export let classes = ""
	export let label = ""
	export let icon

	const contextHandleInput = getContext("handleInput")

	const dispatch = createEventDispatcher()

	function handleInput(e) {
		contextHandleInput(e)
		dispatch("input", e)
	}
</script>

<div>
	<button {id} class="Button {classes}">
		{#if icon}<span class="icon" icon={icon} />{/if}<slot />
	</button>
</div>

<style>
	div {
		padding-block: 1px;
	}
	.Button,
	button {
		line-height: 26px;
		padding: var(--padding-0) var(--padding-200);
		border: 2px solid var(--color-blue);
		background-color: var(--color-blue);
		color: white;
		border-radius: var(--border-radius-75);
		font-weight: 500;
		letter-spacing: 0.055px;
	}

	.Button {
		border-radius: var(--border-radius-50);
		background-color: var(--color-blue);
		display: flex;
		place-items: center;
	}

	.icon {
		display: inline-block;
		width: 24px;
		height: 24px;
	}

	.secondary {
		background-color: var(--color-white);
		color: var(--color-black-100);
		border: 1px solid var(--color-black-100);
	}
</style>
