<script context="module">
	const dropdowns = {}

	export function getDropdown(id = '') {
		return dropdowns[id]
	}
</script>

<script>
	import { onDestroy } from 'svelte'

	export let icon
	export let showMenu = false
	export let id = ''
	export let style
	export let fill

	function clickOutside(element, callbackFunction) {
		function onClick(event) {
			if (!element.contains(event.target)) {
				callbackFunction(event, element)
			}
		}

		document.body.addEventListener('click', onClick)

		return {
			update(newCallbackFunction) {
				callbackFunction = newCallbackFunction
			},
			destroy() {
				document.body.removeEventListener('click', onClick)
			},
		}
	}

	function close() {
		showMenu = false
	}

	function open() {
		showMenu = true
	}

	dropdowns[id] = { open, close }

	onDestroy(() => {
		delete dropdowns[id]
	})
</script>

<div
	{style}
	class="Select {showMenu ? 'show' : ''} {fill ? 'fill' : ''}"
	use:clickOutside={(event, element) => {
		close()
	}}>
	{#if $$slots.hitThing}
		<div
			on:click={(event) => {
				if (showMenu === false) {
					open()
				} else {
					close()
				}

				window.addEventListener('blur', () => {
					// parentElement.classList.remove("show")
					close()
				})
			}}>
			<slot name="hitThing" />
		</div>
	{/if}
	{#if $$slots.label}
		<div
			class="label"
			on:click={(event) => {
				if (showMenu === false) {
					open()
				} else {
					close()
				}

				window.addEventListener('blur', () => {
					// parentElement.classList.remove("show")
					close()
				})
			}}>
			<span class="group"
				>{#if icon}<span class="icon" {icon} />{/if}<span><slot name="label" /></span></span
			><span class="icon" icon="chevron-down" style="margin-left: var(--margin-75)" />
		</div>
	{/if}
	<slot name="content" />
</div>

<style global>
	.Select {
		/* display: flex; */
	}

	.Select > .label {
		line-height: 1;
		border: 2px solid transparent;
		place-items: center;
		height: 28px;
		margin-left: calc(var(--fgp-gap_item_column, 0px) + (-1 * var(--margin-100)));
		margin-right: calc((-1 * var(--margin-100)));
		padding-inline: calc(var(--padding-100) - 2px);
		border-radius: var(--border-radius-25);
		position: relative;
		display: flex;
		place-items: center;
		min-height: 30px;
		cursor: default;
		flex-grow: 1;
	}

	.Select:hover > .label {
		/* padding-top: 1px; */
		border-color: var(--figma-color-border, var(--color-black-10));
		border-width: 1px;
		padding-inline: calc(var(--padding-100) - 1px);
	}

	.Select > .label > .icon:first-child {
		margin-left: calc((-1 * var(--margin-50)));
		margin-right: var(--margin-25);
	}

	.Select.show > .label {
		border-color: var(--figma-color-border, var(--color-black-10));
		border-width: 1px;
		padding-inline: calc(var(--padding-100) - 1px);
	}

	.show > .menu {
		display: block;
	}

	.Select:not(.fill) > .label {
		max-width: 120px;
	}

	.Select:not(.fill) > .label > span {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.Select.fill {
		flex-grow: 1;
	}

	.Select.fill > .label {
		margin-right: 0;
	}

	.Select.fill:hover > .label > [icon='chevron-down'] {
		/* margin-left: auto !important; */
		/* padding-left: 8px; */
	}

	.Select > .label > .group > .icon::before {
		margin-left: -4px;
	}

	.Select.fill:hover > .label > .group {
		flex-grow: 1;
	}

	.show > .tooltip {
		display: block;
	}

	.group {
		display: flex;
		align-items: center;
	}

	.Select :global(.menu) {
		margin-left: -4px;
	}
</style>
