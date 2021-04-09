<script>
	import { valueStore } from "./data.js"
	import { onMount } from "svelte"
	import Field from "./Field.svelte"
	import Button from "./Button.svelte"
	import Checkbox from "./Checkbox.svelte"
	import RadioButton from "./RadioButton.svelte"
	import Matrix from "./Matrix.svelte"
	import Settings from "./Settings.svelte"
	import "./reset.css"

	let data
	let columnResizing = true
	let rememberSettings = true
	let columnCount
	let rowCount
	let includeHeader
	let cellWidth = 100
	let cellAlignment
	let welcomePageActive = false
	let createTablePageActive = false
	let settingsPageActive = false
	let chooseComponentsPageActive = false

	async function onLoad(event) {
		data = await event.data.pluginMessage
		valueStore.set(data)
		valueStore.subscribe((value) => {
			columnCount = value.columnCount
			rowCount = value.rowCount
			cellWidth = value.cellWidth
			includeHeader = value.includeHeader
			cellAlignment = value.cellAlignment
		})

		if (data.type === "create-table") {
			welcomePageActive = false
			createTablePageActive = true
			settingsPageActive = false
		}

		if (data.componentsExist === false) {
			welcomePageActive = true
			createTablePageActive = false
		}

		if (data.componentsRemote === true) {
			welcomePageActive = false
			createTablePageActive = true
		}

		if (data.type === "settings") {
			welcomePageActive = false
			createTablePageActive = false
			settingsPageActive = true
		}
		return data
	}

	function createTable() {
		console.log("table created")
		parent.postMessage(
			{
				pluginMessage: {
					type: "create-table",
					remember: rememberSettings,
					columnResizing: columnResizing,
					columnCount: columnCount,
					rowCount: rowCount,
					includeHeader: includeHeader,
					cellWidth: cellWidth,
					cellAlignment: cellAlignment,
				},
			},
			"*"
		)
	}

	function createComponents() {
		welcomePageActive = false
		createTablePageActive = true
		console.log("components created")
		parent.postMessage(
			{
				pluginMessage: {
					type: "create-components",
				},
			},
			"*"
		)
	}

	function chooseComponents() {
		welcomePageActive = false
		chooseComponentsPageActive = true
	}

	function setComponent(components) {
		parent.postMessage(
			{
				pluginMessage: {
					type: "set-components",
					components: components,
				},
			},
			"*"
		)
	}
</script>

<svelte:window on:message={onLoad} />

{#if createTablePageActive}
	<div class="container" style="padding: var(--size-200)">
		<div class="SectionTitle">Table</div>
		<div class="field-group">
			<Field id="columnCount" label="Columns" type="number" step="1" min="1" max="50" value={columnCount} />
			<Field id="rowCount" label="Rows" type="number" step="1" min="1" max="50" value={rowCount} />
		</div>

		<Checkbox id="includeHeader" label="Include table header" checked={includeHeader} />

		<Matrix {columnCount} {rowCount} grid={[8, 8]} />

		<div class="SectionTitle">Cell</div>
		<div style="display: flex; gap: var(--size-200);">
			<Field id="cellWidth" label="Width" type="number" step="1" min="1" max="1000" value={cellWidth} />

			<div class="RadioButtons">
				<RadioButton id="min" icon="text-align-top" value="MIN" name="cellAlignment" group={cellAlignment} />
				<RadioButton id="center" icon="text-align-middle" value="CENTER" name="cellAlignment" group={cellAlignment} />
				<RadioButton id="max" icon="text-align-bottom" value="MAX" name="cellAlignment" group={cellAlignment} />
			</div>
		</div>

		<div class="BottomBar">
			<span on:click={createTable}><Button id="create-table">Create table</Button></span>
		</div>
	</div>
{/if}

{#if settingsPageActive}
	<div class="container" style="padding: var(--size-200)">
		<Settings />
	</div>
{/if}

{#if welcomePageActive}
	<div class="container" style="padding: var(--size-200)">
		<span class="table-creator-icon" width="172" height="148" />
		<h2>Get Started</h2>
		<p>
			This plugin uses components to create tables from. This allows you to style and integrate them with your design system. These components will be created in a page called<br />
			Table Creator.
		</p>
		<span on:click={createComponents}><Button>Create Components</Button></span>
		<span on:click={chooseComponents}><Button>Link Existing Components</Button></span>
	</div>
{/if}

{#if chooseComponentsPageActive}
	<div class="container" style="padding: var(--size-200)">
		<p>Choose components</p>
		{#each data.components as component}
			<span on:click={() => setComponent(component.set)}><p>{component.name}</p></span>
		{/each}
	</div>
{/if}

<style global>
	.wrapper {
		padding: var(--padding-200);
	}

	/* Table Radio */

	td {
		padding-right: var(--padding-75);
		padding-bottom: var(--padding-75);
	}

	input[type="radio"] {
		opacity: 0;
		width: 0px;
		height: 0px;
		margin: 0;
		padding: 0;
		position: absolute;
	}

	.SectionTitle {
		font-weight: 600;
		line-height: var(--size-400);
	}

	.RadioButtons {
		display: flex;
		flex-grow: 0 !important;
		padding-block: 2px;
		flex-grow: 0;
		flex-basis: auto;
		/* margin-left: 11px; */
		position: relative;
		margin-left: calc(var(--fgp-gap_item_column, 0px) + 8px) !important;
	}

	.RadioButtons:hover::before,
	.RadioButtons:focus-within::before {
		content: "";
		display: block;
		position: absolute;
		top: 4px;
		left: 0px;
		bottom: 4px;
		right: 0px;
		border-radius: 2px;
		border: 1px solid transparent;
		border-color: #e5e5e5;
		user-select: none;
		pointer-events: none;
	}

	.RadioButtons:focus-within::before {
		border-color: var(--color-blue);
	}

	.RadioButtons:hover label {
		border-radius: 0 !important;
	}

	.RadioButtons:hover :first-child label {
		border-top-left-radius: 2px !important;
		border-bottom-left-radius: 2px !important;
	}

	.RadioButtons:hover :last-child label {
		border-top-right-radius: 2px !important;
		border-bottom-right-radius: 2px !important;
	}

	.RadioButtons > * {
		flex-grow: 0;
	}

	/* .RadioButtons:hover::before {
		content: "";
		width: calc(100% - 4px);
		height: calc(100% - 4px);
		position: absolute;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 2px;
		user-select: none;
	} */

	.RadioButtons:hover .icon-button {
		border-radius: 0;
	}

	.BottomBar {
		display: flex;
		place-content: flex-end;
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		border-top: 1px solid var(--color-black-10);
		padding: var(--size-100);
	}
</style>
