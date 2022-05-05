<script>
	import { valueStore } from "./data.js"

	export let grid = [4, 4]
	export let columnCount = 4
	export let rowCount = 4

	let origColumnCount = columnCount
	let origRowCount = rowCount

	let table_state = []

	for (let k = 0; k < grid[0]; k++) {
		table_state[k] = []
		for (let i = 0; i < grid[1]; i++) {
			table_state[k][i] = {
				selected: false,
				hover: false,
				checked: false,
			}
		}
	}

	let selected_end = [columnCount, rowCount]

	let hover_end = []

	function select(x, y) {
		columnCount = y + 1
		rowCount = x + 1

		// Reset to no state
		set_state("selected", [grid[0], grid[1]], false)

		// Set new state
		set_state("selected", [x, y])
		origColumnCount = x + 1
		valueStore.update((data) => {
			data.columnCount = columnCount
			data.rowCount = rowCount
			return data
		})
	}

	// TODO: Check rows and columns are right way round
	// TODO: Need to disable onload and active this to subscribe to changes to input
	valueStore.subscribe((value) => {
		// columnCount = value.columnCount;
		// rowCount = value.rowCount;
		// Reset to no state

		set_state("selected", [grid[0], grid[1]], false)
		set_state("selected", [value.rowCount - 1, value.columnCount - 1])
	})

	function on_load(node) {
		// Set default checked radio
		table_state[rowCount - 1][columnCount - 1].checked = true

		// Set default state
		set_state("selected", [rowCount - 1, columnCount - 1])
	}

	function enter(x, y) {
		hover_end = [x, y]
		set_state("hover", hover_end)
		// valueStore.set({ columnCount: x + 1, rowCount: y + 1 })
	}

	function leave(x, y) {
		hover_end = [x, y]
		set_state("hover", hover_end, false)
		// valueStore.set({ columnCount: origColumnCount, rowCount: origRowCount })
	}

	function set_state(type, end, value = true) {
		let [x2, y2] = end

		table_state = table_state.map((a, x) =>
			a.map((obj, y) => {
				if (type === "selected") {
					if (x <= x2 && y <= y2) {
						obj.selected = value
					}
				}

				if (type === "hover") {
					if (x <= x2 && y <= y2) {
						obj.hover = value
					}
				}

				return obj
			})
		)
	}
</script>

<!-- <p>
	Selected value: {columnCount}
	{rowCount}
</p> -->

<table>
	{#each { length: grid[0] } as _, x}
		<tr>
			{#each { length: grid[1] } as _, y}
				<td class:hover={table_state[x][y].hover} class:selected={table_state[x][y].selected} use:on_load on:click={() => select(x, y)} on:mouseover={() => enter(x, y)} on:mouseout={() => leave(x, y)}>
					<label for="{x}of{y}" tabindex="-1" />
					<input id="{x}of{y}" type="radio" value="{x}of{y}" name="selection" checked={table_state[x][y].checked} />
				</td>
			{/each}
		</tr>
	{/each}
</table>

<style>
	* {
		box-sizing: border-box;
	}
	table {
		border: 0 solid transparent;
		border-spacing: 0;
		border-collapse: collapse;
		margin-top: 8px;
		margin-bottom: 8px;
	}

	/* tr > *:last-child label {
		margin-right: 0;
	} */

	td {
		/* 		border: 1px solid silver; */
		padding: 0;
	}

	label {
		display: block;
		width: auto;
		border: 1px solid var(--figma-color-border, var(--color-black-10));
		margin: 0;
		/* 		padding: 1px; */
		/* 		padding-top: 81%; */
		width: 24px;
		height: 24px;

		padding: 1px;
		/* padding-top: calc(76% + 1px); */

		margin-right: 5px;
		margin-bottom: 5px;
		border-radius: 2px;
	}

	table {
		width: calc(100% + 6px);
	}

	@supports (aspect-ratio: 1) {
		table {
			width: calc(100% + 5px);
		}
		label {
			width: auto;
			height: auto;
			aspect-ratio: 1;
		}
	}

	.selected label {
		border-width: 1.5px;
		padding: 0px;
		/* padding-top: 76%; */
		border-color: var(--figma-color-bg-brand, --color-blue);
		background: var(--figma-color-bg-brand-tertiary, rgba(24, 160, 251, 0.2));
	}

	.hover label {
		background: var(--figma-color-bg-hover, var(--color-black-10));
	}

	.selected.hover label {
		padding: 0px;
		/* padding-top: 76%; */
		/* background: rgba(24, 160, 251, 0.4); */
		background-color: rgba(13, 153, 255, 0.4);
	}

	input {
		width: 0px;
		height: 0px;
		opacity: 0;
		margin: 0;
		padding: 0;
		position: absolute;
	}
</style>
