<script>
	import { valueStore } from "./data.js"
	import { onMount } from "svelte"
	import Field from "./Field.svelte"
	import Button from "./Button.svelte"
	import Dropdown from "./Dropdown.svelte"
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


	function updateSelectedTemplate(data, template) {
		// Look for selected table in local templates
		template = template || data.defaultTemplate

		console.log("selectedTemplate", template)
		for (var i in data.localTemplates) {
			if (template.component.key === data.localTemplates[i].component.key) {
				data.localTemplates[i].selected = true
			}
		}

		// TODO: Look for selected table in remote files

		return data
	}

	// function isSelected(data, template) {
	// 	for (var i in data.localTemplates) {
	// 		if (data.defaultTemplate.component.key === template.component.key) {
	// 			return true
	// 		}
	// 	}
	// }

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

	function newTemplate() {
		welcomePageActive = false
		createTablePageActive = true
		console.log("Template created")
		parent.postMessage(
			{
				pluginMessage: {
					type: "new-template",
				},
			},
			"*"
		)
	}

	function chooseComponents() {
		welcomePageActive = false
		chooseComponentsPageActive = true
	}

	function setDefaultTemplate(template, data) {

		// Not sure how to get it to update UI
		data = updateSelectedTemplate(template, data)

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

	function updateSelectedFile(file, data) {

		// Look for selected table in local templates
		// for (var i in data.localTemplates) {
		// 	if (data.defaultTemplate.component.key === data.localTemplates[i].component.key) {
		// 		data.localTemplates[i].selected = true
		// 	}
		// }

		for (var i in data.remoteFiles) {
			if (data.remoteFiles[i].id === file.id) {
				data.remoteFiles[i].selected = true
			}
		}


		// TODO: Look for selected table in remote files

	}

	function importTemplate() {

		parent.postMessage(
			{
				pluginMessage: {
					type: "import-template"
				},
			},
			"*"
		)
	}

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

		if (!data.remoteFiles || !data.localTemplates) {
			welcomePageActive = true
			createTablePageActive = false
		}

		if (data.remoteFiles || data.localTemplates) {
			welcomePageActive = false
			createTablePageActive = true
		}

		if (data.type === "settings") {
			welcomePageActive = false
			createTablePageActive = false
			settingsPageActive = true
		}

		updateSelectedTemplate(data)

		return data
	}

</script>

<svelte:window on:message={onLoad} />

<!-- {console.log(data)} -->

{#if createTablePageActive}
	<div class="container" style="padding: var(--size-100) var(--size-200)">
		<div class=section-title>
			<div class="SelectWrapper">
				<Dropdown icon="template">
				<slot slot="label">{data.defaultTemplate?.name}</slot>

				<slot slot="content">
					<div class="menu">
						<div class="Title">

							<p style="font-weight: 600">Choose template</p>

							<Dropdown>
								<slot slot="label">
									{#if data.defaultTemplate?.file?.id === data.fileId}
										Local templates
									{:else}
										{data.defaultTemplate?.file?.name}
									{/if}
								</slot>
								<slot slot="content">
									<div class="tooltip">
											{#if data.localTemplates}
												<div>
													<input checked type="radio" id="localTemplates" name="files">
													<label on:click={(event) => {
														// updateSelectedFile(data.localTemplates, data)
														event.currentTarget.parentElement.closest(".Select").classList.remove("show")
													}} for="localTemplates">Local templates</label>
												</div>
											{/if}
											{#if data.localTemplates && data.remoteFiles}
												<span class="tooltip-divider"></span>
											{/if}
											{#if data.remoteFiles}
												{#each data.remoteFiles as file}
														<div>
															<input type="radio" id={file.id} name="files">
															<label on:click={(event) => {
																// updateSelectedFile(file, data)
																event.currentTarget.parentElement.closest(".Select").classList.remove("show")
																}} for={file.id}>{file.name}</label>
														</div>
												{/each}
											{/if}

									</div>
								</slot>
							</Dropdown>

						</div>
						<div>
							{#if data.defaultTemplate?.file?.id === data.fileId}
								{#if data.localTemplates}
									<ul class="local-templates">
									{#each data.localTemplates as template}
										<li class="{template.selected ? 'selected' : ''}" on:click={(event) => {
											setDefaultTemplate(template, data)

											// Hide menu when template set
											event.currentTarget.parentElement.closest(".Select").classList.remove("show")

											}}>{template.name}</li>
									{/each}
									</ul>
								{/if}
							{:else}
								{#if data.remoteFiles}
									<div>
										{#each data.remoteFiles as file}
											{#if data.defaultTemplate?.file?.id === file.id}
												<ul class="remote-file">
														{#each file.templates as template}
														<li on:click={() => setDefaultTemplate(template, data)}>{template.name}</li>
														{/each}
												</ul>
											{/if}
										{/each}
									</div>
								{/if}
							{/if}
						</div>
					</div>
				</slot>
			</Dropdown>
				<span style="margin-left: auto;" class="ButtonIcon icon" icon="plus" on:click={() => importTemplate()}></span>
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
		<h2>Welcome</h2>
		<p>
			Table Creator uses components to create tables from. These components are refered to as a templates. Templates allow you to create custom-styled tables which can be edited and resized, while still being able to manage as part of your design system. To get started create a new default template, or import an existing template from another file.<br />
		</p>
		<span on:click={newTemplate}><Button>New Template</Button></span>
		<span on:click={chooseComponents}><Button>Import Template</Button></span>
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

	.section-title > .SelectWrapper > .Select > .label {
		font-weight: 600;
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

	/* .Select:hover > .label :last-child {
		margin-left: auto !important;
	} */

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
		left: 12px;
		right: 12px;
		width: auto;
		min-width: 242px;
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
		/* max-height: calc(4.5 * var(--size-400)); */
		/* overflow: scroll; */
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

	.menu li {
		margin-left: calc(-1 * var(--margin-200));
    	margin-right: calc(-1 * var(--margin-200));
	}


	.menu li:hover {
		background-color: var(--color-hover-fill)
	}

	.menu li.selected {
		background-color: var(--color-selection-a);
	}



	.Title {
		padding: var(--margin-100) var(--margin-200);
		border-bottom: 1px solid var(--color-black-10);
		min-height: 40px;
		display: flex;
		place-items: center;
	}

	.Title > * {
		flex-grow: 1;
	}

	.Title > :last-child {
		margin-left: auto;
		flex-grow: 0;
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



	.tooltip {
		display: none;
		color: #FFF;
		padding: 8px 0;
		position: absolute;
		top: 3px;
		right: -2px;
		z-index: 100;
		width: 160px;
		background: #222222;
		box-shadow: 0px 2px 7px rgba(0, 0, 0, 0.15), 0px 5px 17px rgba(0, 0, 0, 0.2);
		border-radius: 2px;
	}

	.tooltip input[type="checkbox"] {
		position: absolute;
		opacity: 0;
		cursor: pointer;
		height: 0;
		width: 0;
	}

	.tooltip label {
		line-height: 24px;
		padding-left: 32px;
		padding-right: 16px;
		position: relative;
		display: block;
	}

	.tooltip label:hover {
		background-color: var(--blue);
	}

	.tooltip input[type="radio"]:checked+label::before {
		display: block;
		content: "";
		top: 4px;
		position: absolute;
		left: 8px;
		width: 16px;
		height: 16px;
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M13.2072 5.20718L7.70718 10.7072L7.00008 11.4143L6.29297 10.7072L3.29297 7.70718L4.70718 6.29297L7.00008 8.58586L11.793 3.79297L13.2072 5.20718Z' fill='white'/%3E%3C/svg%3E%0A");
	}

	.tooltip .triangle {
		width: 12px;
		height: 12px;
		background-color: #222222;
		transform: rotate(45deg);
		position: absolute;
		top: -3px;
		right: 10px;
	}

	.tooltop input[type="radio"]:checked+label::before {
		display: block;
		content: "";
		top: 4px;
		position: absolute;
		left: 8px;
		width: 16px;
		height: 16px;
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M13.2072 5.20718L7.70718 10.7072L7.00008 11.4143L6.29297 10.7072L3.29297 7.70718L4.70718 6.29297L7.00008 8.58586L11.793 3.79297L13.2072 5.20718Z' fill='white'/%3E%3C/svg%3E%0A");
	}

	.tooltip .selected {
		background-color: var(--color-blue);
	}

	.tooltip div:hover {
		background-color: var(--color-blue);
	}

	.tooltip-divider {
		display: block;
		margin-block: 8px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}


</style>
