<script>
	import { valueStore } from "./data.js"

	export let grid = [4, 4]
	export let columns = 4
	export let rows = 4

	let origColumns = columns
	let origRows = rows

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

	let selected_end = [columns, rows]

	let hover_end = []

	function select(x, y) {
		columns = y + 1
		rows = x + 1

		// Reset to no state
		set_state("selected", [grid[0], grid[1]], false)

		// Set new state
		set_state("selected", [x, y])
		origColumns = x + 1
		valueStore.set({ columns, rows })
	}

	// TODO: Check rows and columns are right way round
	// TODO: Need to disable onload and active this to subscribe to changes to input
	valueStore.subscribe((value) => {
		// columns = value.columns;
		// rows = value.rows;
		// Reset to no state

		set_state("selected", [grid[0], grid[1]], false)
		set_state("selected", [value.rows - 1, value.columns - 1])
	})

	function on_load(node) {
		// Set default checked radio
		table_state[rows - 1][columns - 1].checked = true

		// Set default state
		set_state("selected", [rows - 1, columns - 1])
	}

	function enter(x, y) {
		hover_end = [x, y]
		set_state("hover", hover_end)
		// valueStore.set({ columns: x + 1, rows: y + 1 })
	}

	function leave(x, y) {
		hover_end = [x, y]
		set_state("hover", hover_end, false)
		// valueStore.set({ columns: origColumns, rows: origRows })
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
	Selected value: {columns}
	{rows}
</p> -->

<table>
	{#each { length: grid[0] } as _, x}
		<tr>
			{#each { length: grid[1] } as _, y}
				<td
					class:hover={table_state[x][y].hover}
					class:selected={table_state[x][y].selected}
					use:on_load
					on:click={() => select(x, y)}
					on:mouseover={() => enter(x, y)}
					on:mouseout={() => leave(x, y)}>
					<label for="{x}of{y}" />
					<input
						id="{x}of{y}"
						type="radio"
						value="{x}of{y}"
						name="selection"
						checked={table_state[x][y].checked} />
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
		margin-right: -6px;
		margin-top: 12px;
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
		border: 1px solid rgba(0, 0, 0, 0.1);
		margin: 0;
		/* 		padding: 1px; */
		/* 		padding-top: 81%; */
		width: 24px;
		height: 24px;

		padding: 1px;
		/* padding-top: calc(76% + 1px); */

		margin-right: 6px;
		margin-bottom: 6px;
		border-radius: 2px;
	}

	@supports (aspect-ratio: 1) {
		table {
			width: calc(100% + 6px);
		}
		label {
			width: auto;
			height: auto;
			aspect-ratio: 1;
		}
	}

	.selected label {
		border-width: 2px;
		padding: 0px;
		/* padding-top: 76%; */
		border-color: rgba(24, 160, 251, 1);
		background: rgba(24, 160, 251, 0.2);
	}

	.hover label {
		background: rgba(0, 0, 0, 0.06);
	}

	.selected.hover label {
		padding: 0px;
		/* padding-top: 76%; */
		background: rgba(24, 160, 251, 0.4);
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
