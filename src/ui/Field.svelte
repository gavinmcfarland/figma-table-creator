<script>
	import { getContext, createEventDispatcher } from "svelte"
	import { valueStore } from "./data.js"
	import { onMount } from "svelte"

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
	export let style
	export let opts

	let input

	onMount(() => {
		input.addEventListener("focus", () => {
			input.select();
		});
	})

	export function convertToNumber(data) {
	if (Number(data)) {
		return Number(data)
	} else {
		return data
	}
}


	const dispatch = createEventDispatcher()

	const handleKeypress = (e) => {
		valueStore.update((data) => {
			if ((id === "columnCount" || id === "rowCount") && value.toString().trim() !== "$") {
				if (e.which === 38 && !(value >= 50)) {
					data[id] = value + 1
				}
				if (e.which === 40 && !(value <= 1)) {
					data[id] = value - 1
				}
			}

			return data
		})
	}

	const handleInput = (e) => {

		let origValue = convertToNumber(value)

		// in here, you can switch on type and implement
		// whatever behaviour you need
		value = type.match(/^(number|range)$/)
			? +e.target.value
			: e.target.value



		if (typeof value === 'string' || value instanceof String) {
			value = value.toUpperCase()
		}

		value = convertToNumber(value)


		if (id === "tableWidth") {

			if (value.toString().toUpperCase() === 'HUG') {
				valueStore.update((data) => {
					if (data.prevCellWidth) {
						data.cellWidth = data.prevCellWidth
					}

					return data
				})
			}
			else if (!isNaN(value)) {
				// If table width is a number
				valueStore.update((data) => {

						if (data.cellWidth.toString().trim() !== "$") {
							if (data.cellWidth.toString().toUpperCase() !== 'FILL') {
								data.prevCellWidth = data.cellWidth
							}

							data.cellWidth = "FILL"

						}

						return data
				})

			}
			else if (value.trim() === "$") {

			}
			else {
				// Anything else entered, reset to orig value
				value = origValue
				valueStore.update((data) => {
					data.tableWidth = value
					return data
				})
			}

		}

		if (id === "tableHeight") {
			if (value.toString().toUpperCase() === 'HUG') {
				valueStore.update((data) => {
					data.prevCellHeight = data.cellHeight || 120
					return data

				})
			}
			else if (!isNaN(value) || value.trim() === "$") {
				// valueStore.update((data) => {
				// 	data.prevCellHeight = data.cellHeight
				// 	data.cellHeight = "FILL"
				// 	return data
				// })
			}
			else {
				value = origValue
				valueStore.update((data) => {
					data.tableHeight = value
					return data
				})
			}

		}

		if (id === "cellWidth") {
			if (value.toString().toUpperCase() === 'FILL') {
				valueStore.update((data) => {
					if (origValue.toString().toUpperCase() !== 'FILL') {
						data.prevCellWidth = origValue
					}

					if (opts.prevTableWidth) {
						data.tableWidth = opts.prevTableWidth
					}

					return data
				})
			}
			else if (!isNaN(value)) {
				valueStore.update((data) => {
					data.tableWidth = "HUG"
					return data
				})
			}
			else if (value.trim() === "$") {

			}
			else {
				value = origValue
				valueStore.update((data) => {
					data.cellWidth = value
					return data
				})
			}
		}

		// if (opts) {



		// 	if (id === "columnCount" && opts.cellHeight) {
		// 		valueStore.update((data) => {
		// 			data.tableHeight = value * opts.cellHeight
		// 			return data
		// 		})
		// 	}

		// 	if (id === "cellWidth" && opts.columnCount) {
		// 		valueStore.update((data) => {
		// 			data.tableWidth = value * opts.columnCount
		// 			return data
		// 		})
		// 	}
		// }

		//   if (id === "columns") {
		valueStore.update((data) => {

			if (id === "columnCount" || id === "rowCount") {

				if (value.toString().trim() === "$" || (Number.isInteger(value) && value <= 50)) {
					data[id] = value
				}
				else {
					// This updates value in UI
					value = origValue
					// This updates value in store
					data[id] = origValue
				}
			}
			else {
				data[id] = value
			}


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
		border-color: var(--figma-color-border, var(--color-black-10));
		border-width: 1px;
		padding-inline: calc(var(--padding-100) - 1px);
	}

	.TextField:focus-within {
		border-color: var(--figma-color-border-selected, var(--color-blue));
		border-width: 2px;
		padding-inline: calc(var(--padding-100) - 2px);
	}

	.TextField span {
		/* margin-right: var(--margin-200); */
		color: var(--figma-color-text-tertiary, var(--color-black-30));
		min-width: 32px;
		text-align: center;
		margin-left: -8px;
	}

	.TextField input {
		flex-grow: 1;
		cursor: default;
		width: 50px;
	}
</style>

<div style={style}>
	<label class="TextField {classes}">
		<span>{label}</span>
		<input bind:this={input} autocomplete="false"
			{id}
			{type}
			{disabled}
			{value}
			{min}
			{max}
			{step}
			on:change={handleInput} on:keydown={handleKeypress} />
	</label>
</div>
