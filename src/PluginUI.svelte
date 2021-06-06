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

	function setComponents(components) {

		// If no components passed tell main code to use selected
		if(!components){
			components = 'selected'
		}

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

	function setDefaultTemplate(template) {

		// If no components passed tell main code to use selected

		parent.postMessage(
			{
				pluginMessage: {
					type: "set-default-template",
					template: template,
				},
			},
			"*"
		)
	}

	function addTemplate() {

		parent.postMessage(
			{
				pluginMessage: {
					type: "add-template"
				},
			},
			"*"
		)
	}
</script>

<svelte:window on:message={onLoad} />

{#if createTablePageActive}
	<div class="container" style="padding: var(--size-100) var(--size-200)">
		<div>
			<div class="SelectWrapper">
				<div class="Select" on:click={(event) => {
					event.currentTarget.classList.toggle("show")
				}}>
					<div class="label">
						<span class="icon" icon="template" /><span class="text-bold">Table</span><span class="icon" icon="chevron-down" style="margin-left: var(--margin-75)" />
					</div>
					<div class="menu">
						<div class="Title">
							<p>Choose template</p>
						</div>
						<div>
							<ul class="list">
						{#each data.files as file}
							<!-- <li on:click={() => setComponents(component.set)}>{file.name}</li> -->
							<li><span>{file.name}</span>
								<ul>
									{#each file.templates as template}
									<li on:click={() => setDefaultTemplate(template)}>{template.name}</li>
									{/each}
								</ul>
							</li>
						{/each}
							</ul>
						</div>
					</div>
				</div>
				<span style="margin-left: auto;" class="ButtonIcon icon" icon="plus" on:click={() => addTemplate()}></span>
			</div>


		</div>
		<div class="field-group">
			<Field id="columnCount" label="Columns" type="number" step="1" min="1" max="50" value={columnCount} />
			<Field id="rowCount" label="Rows" type="number" step="1" min="1" max="50" value={rowCount} />
		</div>

		<Checkbox id="includeHeader" label="Include table header" checked={includeHeader} />

		<Matrix {columnCount} {rowCount} grid={[8, 8]} />

		<div class="text-bold SectionTitle">Cell</div>
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
			<span on:click={() => setComponents(component.set)}><p>{component.name}</p></span>
		{/each}

		<div><span on:click={() => setComponents()}><Button>Use Selected</Button></span></div>
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
		line-height: var(--size-400);
	}

	.text-bold {
		font-weight: 600;
		color: rgb(51, 51, 51);
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

	.SelectWrapper {
		padding-top: 2px;
    	padding-bottom: 2px;
		display: flex;
	}



	.Select {
		line-height: 1;
		/* display: flex; */
		border: 2px solid transparent;
		place-items: center;
		height: 28px;
		margin-left: calc(
			var(--fgp-gap_item_column, 0px) + (-1 * var(--margin-100))
		);
		margin-right: calc((-1 * var(--margin-100)));
		padding-inline: calc(var(--padding-100) - 2px);
		border-radius: var(--border-radius-25);
		position: relative;
	}

	.Select:hover {
		border-color: var(--color-black-10);
		border-width: 1px;
		padding-inline: calc(var(--padding-100) - 1px);
	}

	.Select .label {
		display: flex; place-items: center;
	}

	.Select:hover .label {
		padding-top: 1px;
	}

	.icon {
		display: inline-block;
		width: 24px;
		height: 24px;
		/* background-color: pink; */
	}

	.icon::before {
		content: "";
		height: 100%;
		display: block;
		width: 100%;
		background-repeat: no-repeat;
		background-position: center;
	}

	.Select .icon:first-child {
		margin-left: calc((-1 * var(--margin-50)));
		margin-right: var(--margin-25);
	}

	.Select.show {
		border-color: var(--color-black-10);
		border-width: 1px;
		padding-inline: calc(var(--padding-100) - 1px);
	}

	.Select.show .label {
		padding-top: 1px;
	}

	[icon="template"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M1.82812 7.99988L2.164 7.664L3.539 6.289L3.87488 5.95312L4.54663 6.62488L4.21075 6.96075L3.17163 7.99988L4.21075 9.039L4.54663 9.37488L3.87488 10.0466L3.539 9.71075L2.164 8.33575L1.82812 7.99988ZM6.62488 11.4531L6.96075 11.789L7.99988 12.8281L9.039 11.789L9.37488 11.4531L10.0466 12.1249L9.71075 12.4608L8.33575 13.8358L7.99988 14.1716L7.664 13.8358L6.289 12.4608L5.95312 12.1249L6.62488 11.4531ZM5.95312 3.87488L6.289 3.539L7.664 2.164L7.99988 1.82812L8.33575 2.164L9.71075 3.539L10.0466 3.87488L9.37488 4.54663L9.039 4.21075L7.99988 3.17163L6.96075 4.21075L6.62488 4.54663L5.95312 3.87488ZM11.4531 9.37488L11.789 9.039L12.8281 7.99988L11.789 6.96075L11.4531 6.62488L12.1249 5.95312L12.4608 6.289L13.8358 7.664L14.1716 7.99988L13.8358 8.33575L12.4608 9.71075L12.1249 10.0466L11.4531 9.37488Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}

	[icon="chevron-down"] {
		width: 8px;
		height: 8px;
	}

	[icon="chevron-down"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M3.64648 6.35359L0.646484 3.35359L1.35359 2.64648L4.00004 5.29293L6.64648 2.64648L7.35359 3.35359L4.35359 6.35359L4.00004 6.70714L3.64648 6.35359Z' fill='black' fill-opacity='0.3'/%3E%3C/svg%3E%0A");
	}

	[icon="plus"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M7.5 7.5V2.5H8.5V7.5H13.5V8.5H8.5V13.5H7.5V8.5H2.5V7.5H7.5Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}

	.Select:hover .label :last-child {
		margin-left: auto !important;
	}

	.menu {
		display: none;
		position: absolute;

		background: #FFFFFF;
		/* border: 0.5px solid rgba(0, 0, 0, 0.1); */
		/* box-shadow: 0px 3px 14px rgba(0, 0, 0, 0.1); */
		box-shadow: 0 2px 14px rgba(0,0,0,.15), 0 0 0 0.5px rgba(0,0,0,.2);
		border-radius: 2px;
		/* top: 0; */
		padding: var(--size-200);
		left: 4px;
		right: 4px;
		width: auto;
		margin-top: 2px;
	}

	.menu > * {
		display: block;
		padding: var(--margin-100) var(--margin-200);
		margin-inline: calc(-1 * var(--margin-200));

		place-items: center;
	}

	.menu > :first-child {
		margin-top: calc(-1 * var(--margin-200));
	}

	.menu > :last-child {
		margin-bottom: calc(-1 * var(--margin-200));
	}

	.menu ul {
		padding: 0;
		/* margin: 0; */
		max-height: calc(4.5 * var(--size-400));
		overflow: scroll;
	}

	.menu ul > * {
		display: flex;
		padding: var(--margin-100) var(--margin-200);
		min-height: 32px;
		place-items: center;
		flex-wrap: wrap;
	}

	.menu ul > * > * {
		flex-basis: 100%;
	}

	.show .menu {
		display: block;
	}

	.Title {
		padding: var(--margin-100) var(--margin-200);
		border-bottom: 1px solid var(--color-black-10);
		min-height: 40px;
		display: flex;
		place-items: center;
	}

	.Title > p {
		margin: 0;
	}

	.ButtonIcon {
		width: 30px;
		height: 30px;
		margin-right: calc(-1 * var(--size-75));
		border-radius: var(--border-radius-25);
	}

	.ButtonIcon:hover {
		background-color: var(--color-black-10);
	}


</style>
