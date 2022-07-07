<script>
	import { valueStore } from "./data.js"
	import { onMount } from "svelte"
	import Field from "./Field.svelte"
	import Button from "./Button.svelte"
	import Dropdown, {getDropdown} from "./Dropdown.svelte"
	import Checkbox from "./Checkbox.svelte"
	import RadioButton from "./RadioButton.svelte"
	import Matrix from "./Matrix.svelte"
	import TemplateSettings from "./TemplateSettings.svelte"
	import "./reset.css"

	// TODO: Reset value to original if input left empty

	let data
	let columnResizing = true
	let rememberSettings = true
	let columnCount
	let rowCount
	let includeHeader
	let cellWidth = 100
	let cellHeight
	let cellAlignment
	let selectedFile
	let editingTemplate
	let defaultTemplate
	let remoteFiles
	let localTemplates
	let showToggles
	let tableWidth
	let tableHeight
	let columnCountField
	let rowCountField
	let prevCellWidth = 120
	let prevCellHeight = 40

	let welcomeSlides = [
		true,
		false,
		false,
		false,
		false
	]

	let pageState = {
		welcomePageActive: false,
		createTablePageActive: false,
		templateSettingsPageActive: false,
		chooseRemoteTemplate: false,
		chooseTemplate: false
	}

	function setActiveSlide(number) {
		// Reset slides
		welcomeSlides = welcomeSlides.map(x => x = false)

		if (number => 0) {
			welcomeSlides[number] = true
		}


	}

	function setActivePage(name, number) {
		// Reset page state
		Object.keys(pageState).map(function(key, index) {
  			pageState[key] = false;
		});

		pageState[name] = true

		if (name === "welcomePageActive") {
			if (number) {
				setActiveSlide(number)
			}
			else {
				setActiveSlide(0)
			}

		}

		return pageState
	}


	function updateSelectedTemplate(data, template) {
		// Look for selected table in local templates
		// If template not provided use defaultTemplate
		template = template || data.defaultTemplate

		for (var i in data.localTemplates) {
			if (template.component.key === data.localTemplates[i].component.key) {
				data.localTemplates[i].selected = true
			}
		}

		// for (let i = 0; i < data.remoteFiles.length; i++) {

		// }
		for (let i in data.remoteFiles) {
			let file = data.remoteFiles[i]
			for (let b in data.remoteFiles[i].data) {
				if (template.component.key === file.data[b].component.key) {
					file.data[b].selected = true
				}
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
		parent.postMessage(
			{
				pluginMessage: {
					type: "create-table-instance",
					data: {
						remember: rememberSettings,
						columnResizing: columnResizing,
						columnCount: columnCount,
						rowCount: rowCount,
						includeHeader: includeHeader,
						cellWidth: cellWidth,
						cellAlignment: cellAlignment,
						tableWidth: tableWidth,
						tableHeight: tableHeight,
						cellHeight: cellHeight,
					}
				},
			},
			"*"
		)
	}

	function saveUserPreferences(preferences) {
		parent.postMessage(
			{
				pluginMessage: {
					type: "save-user-preferences",
					...preferences
				},
			},
			"*"
		)
	}

	function newTemplate(options) {
		setActivePage("createTablePageActive")

		parent.postMessage(
			{
				pluginMessage: {
					type: "new-template",
					options
				},
			},
			"*"
		)
	}

	function removeTemplate(template, file) {
		parent.postMessage(
			{
				pluginMessage: {
					type: "remove-template",
					template,
					file
				},
			},
			"*"
		)
	}

	function upgradeToTemplate() {
		parent.postMessage(
			{
				pluginMessage: {
					type: "upgrade-to-template"
				},
			},
			"*"
		)
	}

	function usingRemoteTemplate(boolean) {
		parent.postMessage(
			{
				pluginMessage: {
					type: "using-remote-template",
					usingRemoteTemplate: boolean
				},
			},
			"*"
		)
	}

	function existingTemplate() {

		setActivePage("createTablePageActive")

		usingRemoteTemplate(true)

		parent.postMessage(
			{
				pluginMessage: {
					type: "existing-template"
				},
			},
			"*"
		)
	}

	function chooseRemoteTemplate(opts) {

		opts = opts || {}
		let {entry} = opts

		if (entry === "MANAGE_LIBRARIES") {
			showToggles = true
		}
		setActivePage("chooseRemoteTemplate")
	}

	function setDefaultTemplate(template, data) {

		if (data) {
			// Not sure how to get it to update UI
			data = updateSelectedTemplate(data, template)
		}

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

	function addRemoteFile(file) {

		parent.postMessage(
			{
				pluginMessage: {
					type: "add-remote-file",
					file: file,
				},
			},
			"*"
		)
	}

	function removeRemoteFile(file) {

		parent.postMessage(
			{
				pluginMessage: {
					type: "remove-remote-file",
					file: file,
				},
			},
			"*"
		)
	}

	function updateSelectedFile(data, file) {

		// file = file || data.defaultTemplate.file

		if (!data && !file) {
			selectedFile = data.defaultTemplate.file
		}
		else {
			if (file) {
			selectedFile = file
		}
		else {
			if (data.defaultTemplate?.file.id === data.fileId) {
				selectedFile = data.defaultTemplate.file
				selectedFile.name = "Local templates"

				valueStore.update((data) => {
					data.selectedFile = selectedFile
					return data
				})
			}
			else {
				for (var i in data.remoteFiles) {
					if (data.remoteFiles[i].id === data.defaultTemplate.file.id) {
						// data.remoteFiles[i].selected = true
						selectedFile = data.remoteFiles[i]

						valueStore.update((data) => {
							data.selectedFile = selectedFile
							return data
						})
					}
				}
			}
		}
		}



		return data
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

	function updateTables(template) {
		parent.postMessage(
			{
				pluginMessage: {
					type: "update-tables",
					template: template
				}
			},
			"*"
		)
	}

	function editTemplate(template) {
		editingTemplate = template
		setActivePage("templateSettingsPageActive")
	}

	function handleInput(id, checked) {
		valueStore.update((data) => {
			data[id] = checked
			return data
		})
	}

	function postUiDetails(data) {
		parent.postMessage(
			{
				pluginMessage: {
					type: "post-ui-details",
					data: template
				}
			},
			"*"
		)
	}

	async function onLoad(event) {
		var message = await event.data.pluginMessage

		if (message.type === "show-create-table-ui") {
			data = message

			let store = {
				pageState,
				selectedFile,
				data,
				...data
			}
			valueStore.set(store)

			valueStore.subscribe((value) => {
				selectedFile = value.selectedFile
				pageState = value.pageState
				columnCount = value.columnCount
				rowCount = value.rowCount
				cellWidth = value.cellWidth
				cellHeight = value.cellHeight
				includeHeader = value.includeHeader
				cellAlignment = value.cellAlignment
				columnResizing = value.columnResizing
				tableWidth = value.tableWidth
				tableHeight = value.tableHeight
				data = value.data
				prevCellWidth = value.prevCellWidth
				prevCellHeight = value.prevCellHeight
			})


			if (data.pluginVersion === "7.0.0") {

				// If localTemplates or remoteFiles exist then show create table page
				if (data.pluginUsingOldComponents) {
					// Shows page to either convert old components to template, or create new template
					setActivePage("welcomePageActive", 4)
				}
				else if (data.localTemplates.length > 0 || data.remoteFiles.length > 0) {
					setActivePage("createTablePageActive")
					updateSelectedTemplate(data)
					updateSelectedFile(data)
				}
				else {
					// Shows page to either convert old components to template, or create new template
					setActivePage("welcomePageActive", 4)
				}

			}
			else {
				setActivePage("welcomePageActive", 0)
			}
		}

		if (message.type === "post-default-template") {
			data = Object.assign(data, message)
			if (data.defaultTemplate) {
				updateSelectedTemplate(data)
				updateSelectedFile(data)
			}
			else {
				// FIXME: Need a solution for when no deafult template
				setActivePage("welcomePageActive", 4)
			}
		}

		if (message.type === "remote-files") {
			data = Object.assign(data, message)
			// if (data.defaultTemplate) {
			// 	updateSelectedTemplate(data)
			// 	updateSelectedFile(data)
			// }
		}

		if (message.type === "local-templates") {
			data = Object.assign(data, message)

			if (data.defaultTemplate) {
				updateSelectedTemplate(data)
				updateSelectedFile(data)
			}
		}

		if (message.type === "show-create-table-page") {
			setActivePage("createTablePageActive")
		}

	}


</script>

<svelte:window on:message={onLoad} />

{#if pageState.chooseRemoteTemplate}
	<div class="container" style="padding: var(--size-100) var(--size-200)">

		{#if data.recentFiles.length > 0}
		<p>Choose a library</p>
		<div class="List">
			{#each data.recentFiles as file}
				{#if showToggles}
				<div class="ListItem" on:click={(event) => {
					updateSelectedFile(data, file)
					usingRemoteTemplate(true)
					setDefaultTemplate(file.data[0], data)
					addRemoteFile(file)
					setActivePage("createTablePageActive")
				}}><span>{file.name}</span></div>
				{:else}
					<div class="ListItem" on:click={(event) => {
						updateSelectedFile(data, file)
						usingRemoteTemplate(true)
						setDefaultTemplate(file.data[0], data)
						addRemoteFile(file)
						setActivePage("createTablePageActive")
					}}><span>{file.name}</span></div>
				{/if}

			{/each}
		</div>
		{:else}
		<p>To use a library create a template in another file and publish the components.</p>
		{/if}

		{#if showToggles}
		<div class="BottomBar">
			<span on:click={() => setActivePage("createTablePageActive")}><Button id="create-table">Done</Button></span>
		</div>
		{/if}
	</div>
{/if}

{#if pageState.chooseTemplate}
	<div class="container" style="padding: var(--size-100) var(--size-200)">
		<p>Choose a template</p>

		{#if data.recentFiles.length > 0}

			{#each data.recentFiles as file}

				{#if selectedFile?.id === file.id}
					<div class="List">
						{#each file.data as template}
						<div class="ListItem" on:click={(event) => {
							// Only trigger if clicking on the element itself
							if(event.target !== event.currentTarget) return;
							usingRemoteTemplate(true)
							setDefaultTemplate(template, data)
							addRemoteFile(file)
							setActivePage("createTablePageActive")
							}}>{template.name}</div>
						{/each}
					</div>
				{/if}
			{/each}
		{/if}
	</div>
{/if}

{#if pageState.welcomePageActive}
	{#if welcomeSlides[0]}

	<!-- <div class="container" style="padding: var(--size-200)">
		<span class="table-creator-icon" width="172" height="148" />
		<div class="svg1" style="margin: 0 -16px"></div>
		<h6>Welcome</h6>
		<p>
			Table Creator lets you create custom-styled tables from templates that are easy to resize, edit and use with your design system.<br />
		</p>
		<span on:click={() => setActiveSlide(1)}><Button classes="secondary">Next</Button></span>
	</div> -->

	<!-- if existing user -->
	<div class="container welcomePage" style="padding: var(--size-200)">
		<div class="artwork">
			<div class="svg1"></div>
		</div>
		<div class="dots">
			<span class="active"></span>
			<span></span>
			<span></span>
			<span></span>
		</div>
		<div class="content">
			<h6>What's new</h6>
			<p>
				Table Creator has been rebuilt from the ground up with some new features.
			</p>
			<div class="buttons">

			<span class="next" on:click={() => setActiveSlide(1)}><Button classes="secondary" iconRight="arrow-right">Next</Button></span>
			</div>
		</div>
	</div>


	{/if}
	{#if welcomeSlides[1]}
	<div class="container welcomePage" style="padding: var(--size-200)">
		<div class="artwork">
		<div class="svg2"></div>
		</div>
		<div class="dots">
			<span></span>
			<span class="active"></span>
			<span></span>
			<span></span>
		</div>
		<div class="content">
		<h6>Templates</h6>
		<p>
			Tables are now created from a single component called a template. They offer more flexibility. Easily update already created tables from the plugin or template.
		</p>
		<div class="buttons">
			<span class="prev" on:click={() => setActiveSlide(0)}><Button classes="tertiary" iconRight="arrow-left"></Button></span>
		<span class="next" on:click={() => setActiveSlide(2)}><Button classes="secondary" iconRight="arrow-right">Next</Button></span>
		</div>
		</div>
	</div>
	{/if}
	{#if welcomeSlides[2]}
	<div class="container welcomePage" style="padding: var(--size-200)">
		<div class="artwork">
		<div class="svg3"></div>
		</div>
		<div class="dots">
			<span></span>
			<span></span>
			<span class="active"></span>
			<span></span>
		</div>
		<div class="content">
		<h6>Multiple templates</h6>
		<p>
			Manage more than one table design by creating multiple templates. Choose the template you want by selecting it from the dropdown when creating a table.<br />
		</p>
		<div class="buttons">
			<span class="prev" on:click={() => setActiveSlide(1)}><Button classes="tertiary" iconRight="arrow-left"></Button></span>
			<span class="next" on:click={() => setActiveSlide(3)}><Button classes="secondary" iconRight="arrow-right">Next</Button></span>
		</div>
		</div>
	</div>
	{/if}
	{#if welcomeSlides[3]}
	<div class="container welcomePage" style="padding: var(--size-200)">
		<div class="artwork">
		<div class="svg4"></div>
		</div>
		<div class="dots">
			<span></span>
			<span></span>
			<span></span>
			<span class="active"></span>
		</div>
		<div class="content">
		<h6>Libraries</h6>
		<p>
			To use templates with libraries, first publish the template and then run the plugin in another file.
		</p>
		<div class="buttons">
			<span class="prev" on:click={() => setActiveSlide(2)}><Button classes="tertiary" iconRight="arrow-left"></Button></span>
			<span class="next" on:click={() => {

				if (data?.localTemplates?.length > 0 || data?.remoteTemplates?.length > 0) {
					setActivePage("createTablePageActive")
				}
				else {
					setActiveSlide(4)
				}

				}}><Button classes="secondary" iconRight="arrow-right">Next</Button></span>
		</div>
		</div>
	</div>
	{/if}
	{#if welcomeSlides[4]}
	<div class="container welcomePage" style="padding: var(--size-200)">
		{#if data.pluginUsingOldComponents}
		<div class="artwork">
			<div class="svg7"></div>
			</div>
			<div class="dots"></div>
			<div class="content">
				<h6>Update components</h6>
				<p>The table components in this file need updating. This will convert your existing table components into a single component to use as a template.</p>
			<div class="buttons">
				<span class="next" on:click={() => upgradeToTemplate()}><Button classes="secondary">Update Components</Button></span>
			</div>
		</div>
		{:else}
			<div class="artwork">
				<div class="svg6"></div>
			</div>
			<div class="dots"></div>
			<div class="content">
			<h6>Get started</h6>

			{#if data.recentFiles.length > 0}
				<p>Create a new template or use an existing template from a library.</p>
			{:else}
				<p>Begin by creating a new template to create tables from.</p>
			{/if}


			<div class="buttons new-template">
				<span on:click={() => newTemplate({ newPage: true })}><Button classes="secondary">New Template</Button></span>
				{#if data.recentFiles.length > 0}
					<span on:click={() => {
						chooseRemoteTemplate()
						}}><Button classes="secondary">Existing Template</Button></span>
				{/if}
			</div>
		</div>
		{/if}
	</div>

	{/if}
{/if}

{#if pageState.createTablePageActive}
	<div class="container" style="padding: var(--size-100) var(--size-200)">
		<div class=section-title>
			<div class="SelectWrapper">
				<Dropdown fill icon="component" id="menu">
					<slot slot="label">{data.defaultTemplate?.name}</slot>

					<slot slot="content">
						<div class="menu">
							<div class="Title">

								<p style="font-weight: 600">Templates</p>

								<Dropdown id="tooltip">
									<slot slot="label">
										{selectedFile?.name}
										<!-- {#if data.defaultTemplate?.file?.id === data.fileId}
											Local templates
										{:else}
											{data.defaultTemplate?.file?.name}
										{/if} -->
									</slot>
									<slot slot="content">
										<div class="tooltip">
												<!-- {#if data.localTemplates.length > 0} -->
													<div>
														<input checked="{selectedFile?.id === data.fileId ? true : false}" type="radio" id="localTemplates" name="files">
														<label on:click={(event) => {
															updateSelectedFile(data, {name: 'Local templates', id: data.fileId})
															// event.currentTarget.parentElement.closest(".Select").classList.remove("show")
															getDropdown('tooltip').close()
														}} for="localTemplates">Local templates</label>
													</div>
												<!-- {/if} -->
												{#if data.remoteFiles.length > 0}
													<span class="tooltip-divider"></span>
												{/if}
												{#if data.remoteFiles.length > 0}
													{#each data.remoteFiles as file}
															<div>
																<input checked="{selectedFile?.id === file.id ? true : false}" type="radio" id={file.id} name="files">
																<label on:click={(event) => {
																	updateSelectedFile(data, file)
																	getDropdown('tooltip').close()
																	// event.currentTarget.parentElement.closest(".Select").classList.remove("show")
																	}} for={file.id}>{file.name}</label>
															</div>
													{/each}
												{/if}
												<span class="tooltip-divider"></span>
												<div>
													<input checked="{false}" type="radio" id="linkLibrary" name="linkLibrary">
													<label on:click={(event) => {
														getDropdown('tooltip').close()
														// event.currentTarget.parentElement.closest(".Select").classList.remove("show")
														chooseRemoteTemplate({entry: "MANAGE_LIBRARIES"})
														}} for="linkLibrary">Choose Library</label>
												</div>


										</div>
									</slot>
								</Dropdown>


							</div>
							<div class="menu__content">
								{#if selectedFile?.id === data.fileId}
									{#if data.localTemplates.length > 0}
										<ul class="local-templates">
										{#each data.localTemplates as template}
											<li class="item {template.selected ? 'selected' : ''}" on:click={(event) => {

												// Only trigger if clicking on the element itself
												if(event.target !== event.currentTarget) return;

												usingRemoteTemplate(false)
												setDefaultTemplate(template, data)
												// Hide menu when template set
												// event.currentTarget.parentElement.closest(".Select").classList.remove("show")

												getDropdown('menu').close()


												}}>{template.name} <div style="margin-left: auto; margin-right: calc(-1 * var(--size-100))"> <a title="Edit Template"  class="refresh icon" icon="pencil" on:click={() => {
													editTemplate(template)
													}}></a> <a title="Refresh Tables" class="refresh icon" icon="swap" on:click={() => updateTables(template)}></a></div></li>
										{/each}
										</ul>
									{/if}
									<div class="toolbar"><a title="New Template"  class="refresh icon" icon="plus" on:click={() => newTemplate({ subComponents: false, tooltips: false})}></a></div>
								{:else}
									{#if data.remoteFiles.length > 0}
										<!-- <div> -->
											{#each data.remoteFiles as file}
												{#if selectedFile?.id === file.id}
													<ul class="remote-file">
															{#each file.data as template}
															<li class="item {template.selected ? 'selected' : ''}" on:click={(event) => {

																// Only trigger if clicking on the element itself
																if(event.target !== event.currentTarget) return;
																usingRemoteTemplate(true)
																setDefaultTemplate(template, data)
																// Hide menu when template set
																// event.currentTarget.parentElement.closest(".Select").classList.remove("show")
																getDropdown('menu').close()
																}}>{template.name} <div style="margin-left: auto; margin-right: calc(-1 * var(--size-100))"> <a title="Refresh Tables" class="refresh icon" icon="swap" on:click={() => updateTables(template)}></a></div></li>
															{/each}
													</ul>
													<div class="toolbar"><a title="Remove Library" style="margin-left: auto" class="refresh icon" icon="break" on:click={() => {
														removeRemoteFile(file)
														updateSelectedFile()
														}}></a></div>
												{/if}
											{/each}
										<!-- </div> -->
									{/if}
								{/if}
							</div>
						</div>
					</slot>
				</Dropdown>
				<!-- <span style="margin-left: auto;" class="ButtonIcon icon" icon="plus" on:click={() => importTemplate()}></span> -->
				<Dropdown>
					<slot slot="hitThing"><span style="margin-left: auto;" class="ButtonIcon icon" icon="ellipses"></span></slot>
					<slot slot="content">
						<div class="tooltip wTriangle">
							<!-- <Checkbox id="columnResizing" label="Column Resizing" checked={columnResizing} on:click={(event) => {
									console.log("columnResizing", columnResizing)
									getDropdown('tooltip').close()
									}}/> -->
							<div>
								<input bind:checked={columnResizing} type="checkbox" id="columnResizing" name="columnResizing">
								<label on:click={(event) => {
									saveUserPreferences({columnResizing: !columnResizing})
									}} for="columnResizing">Column Resizing</label>
							</div>
						</div>
					</slot>
				</Dropdown>
			</div>
		</div>
		<!-- <form autocomplete="off"> -->
			<div class="field-group">
				<Field id="columnCount" label="C" type="number" step="1" min="1" max="50" value={columnCount} opts={{columnCount, cellWidth}} />
				<Field id="rowCount" label="R" type="number" step="1" min="1" max="50" value={rowCount} />
			</div>
			<div class="field-group">
				<Field id="tableWidth" label="W" type="text" step="1" min="1" max="2000" value={tableWidth} opts={{prevCellWidth}} />
				<Field id="tableHeight" label="H" type="text" step="1" min="1" max="2000" value={tableHeight} opts={{prevCellHeight}} />
			</div>

			<Checkbox id="includeHeader" label="Include table header" checked={includeHeader} />

			<Matrix {columnCount} {rowCount} grid={[8, 8]} />

			<div class="text-bold SectionTitle">Cell</div>
			<div style="display: flex; gap: var(--size-200);">
				<Field style="width: 106px" id="cellWidth" label="W" type="text" step="1" min="1" max="1000" value={cellWidth} opts={{columnCount, cellWidth, tableWidth: columnCount * cellWidth}} />

				<div class="RadioButtons">
					<RadioButton id="min" icon="text-align-top" value="MIN" name="cellAlignment" group={cellAlignment} />
					<RadioButton id="center" icon="text-align-middle" value="CENTER" name="cellAlignment" group={cellAlignment} />
					<RadioButton id="max" icon="text-align-bottom" value="MAX" name="cellAlignment" group={cellAlignment} />
				</div>
			</div>

			<div class="BottomBar">
				<span on:click={createTable}><Button id="create-table">Create Table</Button></span>
			</div>
		<!-- </form> -->
	</div>
{/if}

{#if pageState.templateSettingsPageActive}
	<div class="container" style="padding: var(--size-200)">
		<TemplateSettings template={editingTemplate} pageState/>
	</div>
{/if}

<style global>

	.welcomePage .buttons .button {
		margin-top: var(--margin-150);
	}

	.wrapper {
		padding: var(--padding-200);
	}

	.container {
		overflow: scroll;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.content .Button {
		margin-left: auto;

	}

	.buttons {
		display: flex;
		width: 100%;
		/* margin-top: var(--size-300); */
	}

	.buttons > .prev {
		margin-left: -2px;
	}

	.buttons > .prev .button {
		width: 30px;
		padding: 0;
	}

	.buttons > .prev .button > div > span:first-child {
		width: 0;
	}

	.buttons > .prev .button > div > span:nth-child(2) {
		margin-left: 2px;
	}

	.buttons > .next {
		margin-left: auto;
	}

	.buttons.new-template {
		display: block;
		margin-left: auto;
	}

	.dots {
		display: flex;
		gap: 8px;
		align-self: center;
		margin-bottom: 16px;
		min-height: 21px;
	}
	.dots > * {

		background-color: var(--figma-color-border);
		width: 5px;
		height: 5px;
		border-radius: 9999px;
	}

	.dots .active {
		background-color: var(--figma-color-border-disabled-strong);
	}
	.artwork {
		display: flex;
    	flex-grow: 1;
    	justify-content: center;
		align-items: center;
		margin: 0 -16px;
		height: 284px;
		max-height: 284px;
	}
	.content {
		flex-grow: 1;
		position: relative;
	}

	.buttons {
		position: absolute;
		bottom: 0;
		right: 0;
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
		border-color: var(--figma-color-border, var(--color-black-10));
		user-select: none;
		pointer-events: none;
	}

	.RadioButtons:focus-within::before {
		border-color: var(--figma-color-brand, var(--color-blue));
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
		border-top: 1px solid var(--figma-color-border, var(--color-black-10));
		padding: var(--size-100);
		background-color: var(--figma-color-bg);
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
		flex-grow: 0;
		/* flex-basis: 0; */
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

	.figma-light [icon="text-align-top"] label::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M15 1H1V2H15V1ZM8.35355 3.64645L8 3.29289L7.64645 3.64645L4.64645 6.64645L5.35355 7.35355L7.5 5.20711V13H8.5V5.20711L10.6464 7.35355L11.3536 6.64645L8.35355 3.64645Z' fill='black'/%3E%3C/svg%3E%0A");
	}

	.figma-dark [icon="text-align-top"] label::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M15 1H1V2H15V1ZM8.35355 3.64645L8 3.29289L7.64645 3.64645L4.64645 6.64645L5.35355 7.35355L7.5 5.20711V13H8.5V5.20711L10.6464 7.35355L11.3536 6.64645L8.35355 3.64645Z' fill='white'/%3E%3C/svg%3E%0A");
	}

	.figma-light [icon="text-align-middle"] label::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M8 6.20711L8.35355 5.85355L10.3536 3.85355L9.64645 3.14645L8.5 4.29289V0H7.5V4.29289L6.35355 3.14645L5.64645 3.85355L7.64645 5.85355L8 6.20711ZM8 9.79289L8.35355 10.1464L10.3536 12.1464L9.64645 12.8536L8.5 11.7071V16H7.5V11.7071L6.35355 12.8536L5.64645 12.1464L7.64645 10.1464L8 9.79289ZM1 8.5H15V7.5H1V8.5Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}

	.figma-dark [icon="text-align-middle"] label::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M8 6.20711L8.35355 5.85355L10.3536 3.85355L9.64645 3.14645L8.5 4.29289V0H7.5V4.29289L6.35355 3.14645L5.64645 3.85355L7.64645 5.85355L8 6.20711ZM8 9.79289L8.35355 10.1464L10.3536 12.1464L9.64645 12.8536L8.5 11.7071V16H7.5V11.7071L6.35355 12.8536L5.64645 12.1464L7.64645 10.1464L8 9.79289ZM1 8.5H15V7.5H1V8.5Z' fill='white' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}

	.figma-light [icon="text-align-bottom"] label::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M8.35355 12.3536L8 12.7071L7.64645 12.3536L4.64645 9.35355L5.35355 8.64645L7.5 10.7929V3H8.5V10.7929L10.6464 8.64645L11.3536 9.35355L8.35355 12.3536ZM15 14V15H1V14H15Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}

	.figma-dark [icon="text-align-bottom"] label::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M8.35355 12.3536L8 12.7071L7.64645 12.3536L4.64645 9.35355L5.35355 8.64645L7.5 10.7929V3H8.5V10.7929L10.6464 8.64645L11.3536 9.35355L8.35355 12.3536ZM15 14V15H1V14H15Z' fill='white' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}

	.figma-light [icon="template"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M1.82812 7.99988L2.164 7.664L3.539 6.289L3.87488 5.95312L4.54663 6.62488L4.21075 6.96075L3.17163 7.99988L4.21075 9.039L4.54663 9.37488L3.87488 10.0466L3.539 9.71075L2.164 8.33575L1.82812 7.99988ZM6.62488 11.4531L6.96075 11.789L7.99988 12.8281L9.039 11.789L9.37488 11.4531L10.0466 12.1249L9.71075 12.4608L8.33575 13.8358L7.99988 14.1716L7.664 13.8358L6.289 12.4608L5.95312 12.1249L6.62488 11.4531ZM5.95312 3.87488L6.289 3.539L7.664 2.164L7.99988 1.82812L8.33575 2.164L9.71075 3.539L10.0466 3.87488L9.37488 4.54663L9.039 4.21075L7.99988 3.17163L6.96075 4.21075L6.62488 4.54663L5.95312 3.87488ZM11.4531 9.37488L11.789 9.039L12.8281 7.99988L11.789 6.96075L11.4531 6.62488L12.1249 5.95312L12.4608 6.289L13.8358 7.664L14.1716 7.99988L13.8358 8.33575L12.4608 9.71075L12.1249 10.0466L11.4531 9.37488Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}
	.figma-dark [icon="template"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M1.82812 7.99988L2.164 7.664L3.539 6.289L3.87488 5.95312L4.54663 6.62488L4.21075 6.96075L3.17163 7.99988L4.21075 9.039L4.54663 9.37488L3.87488 10.0466L3.539 9.71075L2.164 8.33575L1.82812 7.99988ZM6.62488 11.4531L6.96075 11.789L7.99988 12.8281L9.039 11.789L9.37488 11.4531L10.0466 12.1249L9.71075 12.4608L8.33575 13.8358L7.99988 14.1716L7.664 13.8358L6.289 12.4608L5.95312 12.1249L6.62488 11.4531ZM5.95312 3.87488L6.289 3.539L7.664 2.164L7.99988 1.82812L8.33575 2.164L9.71075 3.539L10.0466 3.87488L9.37488 4.54663L9.039 4.21075L7.99988 3.17163L6.96075 4.21075L6.62488 4.54663L5.95312 3.87488ZM11.4531 9.37488L11.789 9.039L12.8281 7.99988L11.789 6.96075L11.4531 6.62488L12.1249 5.95312L12.4608 6.289L13.8358 7.664L14.1716 7.99988L13.8358 8.33575L12.4608 9.71075L12.1249 10.0466L11.4531 9.37488Z' fill='white' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}

	.figma-light [icon="component"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M5.74254 4.74795L7.99981 2.5L10.2571 4.74795L7.99981 6.9959L5.74254 4.74795ZM4.74795 10.2571L2.5 7.9998L4.74795 5.74253L6.9959 7.9998L4.74795 10.2571ZM10.2571 11.2517L7.9998 13.4996L5.74253 11.2517L7.9998 9.00371L10.2571 11.2517ZM13.4996 7.99981L11.2517 5.74254L9.00371 7.99981L11.2517 10.2571L13.4996 7.99981Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}
	.figma-dark [icon="component"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M5.74254 4.74795L7.99981 2.5L10.2571 4.74795L7.99981 6.9959L5.74254 4.74795ZM4.74795 10.2571L2.5 7.9998L4.74795 5.74253L6.9959 7.9998L4.74795 10.2571ZM10.2571 11.2517L7.9998 13.4996L5.74253 11.2517L7.9998 9.00371L10.2571 11.2517ZM13.4996 7.99981L11.2517 5.74254L9.00371 7.99981L11.2517 10.2571L13.4996 7.99981Z' fill='white' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}

	[icon="chevron-down"] {
		width: 8px;
		height: 8px;
	}

	.figma-light [icon="chevron-down"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M3.64648 6.35359L0.646484 3.35359L1.35359 2.64648L4.00004 5.29293L6.64648 2.64648L7.35359 3.35359L4.35359 6.35359L4.00004 6.70714L3.64648 6.35359Z' fill='black' fill-opacity='0.3'/%3E%3C/svg%3E%0A");
	}
	.figma-dark [icon="chevron-down"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M3.64648 6.35359L0.646484 3.35359L1.35359 2.64648L4.00004 5.29293L6.64648 2.64648L7.35359 3.35359L4.35359 6.35359L4.00004 6.70714L3.64648 6.35359Z' fill='white' fill-opacity='0.3'/%3E%3C/svg%3E%0A");
	}

	.figma-light [icon="plus"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M7.5 7.5V2.5H8.5V7.5H13.5V8.5H8.5V13.5H7.5V8.5H2.5V7.5H7.5Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}
	.figma-dark [icon="plus"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M7.5 7.5V2.5H8.5V7.5H13.5V8.5H8.5V13.5H7.5V8.5H2.5V7.5H7.5Z' fill='white' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}

	.figma-light [icon="minus"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M22 16.5H10V15.5H22V16.5Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}
	.figma-dark [icon="minus"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M22 16.5H10V15.5H22V16.5Z' fill='white' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}

	.figma-light [icon="break"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M4.00024 0V3H5.00024V0H4.00024ZM13.1033 0.896443C11.9416 -0.265323 10.058 -0.265315 8.8962 0.896458L6.14629 3.64641L6.8534 4.35351L9.60331 1.60356C10.3745 0.832315 11.625 0.83231 12.3962 1.60355C13.1674 2.37478 13.1675 3.6252 12.3962 4.39643L9.64629 7.14641L10.3534 7.85351L13.1033 5.10354C14.2651 3.94177 14.2651 2.0582 13.1033 0.896443ZM0.896386 13.1035C-0.265375 11.9418 -0.265377 10.0582 0.896384 8.89643L3.64639 6.14642L4.35349 6.85353L1.60349 9.60353C0.832255 10.3748 0.832256 11.6252 1.60349 12.3964C2.37473 13.1677 3.62515 13.1677 4.39639 12.3964L7.14639 9.64642L7.85349 10.3535L5.10349 13.1035C3.94173 14.2653 2.05815 14.2653 0.896386 13.1035ZM13.9998 10H10.9998V9H13.9998V10ZM10.0004 11V14H9.00037V11H10.0004ZM2.99976 4H-0.000244141V5H2.99976V4Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}
	.figma-dark [icon="break"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M4.00024 0V3H5.00024V0H4.00024ZM13.1033 0.896443C11.9416 -0.265323 10.058 -0.265315 8.8962 0.896458L6.14629 3.64641L6.8534 4.35351L9.60331 1.60356C10.3745 0.832315 11.625 0.83231 12.3962 1.60355C13.1674 2.37478 13.1675 3.6252 12.3962 4.39643L9.64629 7.14641L10.3534 7.85351L13.1033 5.10354C14.2651 3.94177 14.2651 2.0582 13.1033 0.896443ZM0.896386 13.1035C-0.265375 11.9418 -0.265377 10.0582 0.896384 8.89643L3.64639 6.14642L4.35349 6.85353L1.60349 9.60353C0.832255 10.3748 0.832256 11.6252 1.60349 12.3964C2.37473 13.1677 3.62515 13.1677 4.39639 12.3964L7.14639 9.64642L7.85349 10.3535L5.10349 13.1035C3.94173 14.2653 2.05815 14.2653 0.896386 13.1035ZM13.9998 10H10.9998V9H13.9998V10ZM10.0004 11V14H9.00037V11H10.0004ZM2.99976 4H-0.000244141V5H2.99976V4Z' fill='white' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}

	.figma-light [icon="swap"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M14.6096 5.68765L13.4349 7.15603C13.4268 7.10387 13.418 7.05185 13.4084 7C13.2569 6.18064 12.9203 5.40189 12.419 4.72539C11.7169 3.77797 10.7289 3.08128 9.60075 2.73808C8.47259 2.39489 7.264 2.42337 6.15326 2.81933C5.36015 3.10206 4.64691 3.56145 4.06479 4.15764C3.83166 4.3964 3.61956 4.6571 3.43178 4.93718L3.43192 4.93728L4.26237 5.49406L4.26252 5.49416C4.79977 4.69282 5.58035 4.08538 6.4891 3.76143C7.39785 3.43748 8.38666 3.41418 9.30967 3.69496C10.2327 3.97574 11.041 4.54574 11.6154 5.32088C12.1002 5.97502 12.3966 6.74603 12.4774 7.55063L10.2774 6.08398L9.7227 6.91603L12.7227 8.91603L13.1041 9.1703L13.3905 8.81235L15.3905 6.31235L14.6096 5.68765ZM2.60962 7.18765L0.609619 9.68765L1.39049 10.3123L2.56519 8.84397C2.57329 8.89614 2.58213 8.94815 2.59172 9C2.74323 9.81936 3.07981 10.5981 3.58113 11.2746C4.2832 12.222 5.27119 12.9187 6.39935 13.2619C7.52751 13.6051 8.7361 13.5766 9.84684 13.1807C10.64 12.8979 11.3532 12.4386 11.9353 11.8424C12.168 11.6041 12.3797 11.344 12.5672 11.0646L12.5683 11.0628L12.5682 11.0627L11.7377 10.5059L11.7376 10.5058L11.7365 10.5074C11.1993 11.308 10.4192 11.9148 9.51101 12.2386C8.60225 12.5625 7.61344 12.5858 6.69044 12.305C5.76744 12.0243 4.95911 11.4543 4.38471 10.6791C3.89996 10.025 3.60346 9.25397 3.52271 8.44937L5.7227 9.91603L6.2774 9.08398L3.2774 7.08398L2.89598 6.8297L2.60962 7.18765Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}
	.figma-dark [icon="swap"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M14.6096 5.68765L13.4349 7.15603C13.4268 7.10387 13.418 7.05185 13.4084 7C13.2569 6.18064 12.9203 5.40189 12.419 4.72539C11.7169 3.77797 10.7289 3.08128 9.60075 2.73808C8.47259 2.39489 7.264 2.42337 6.15326 2.81933C5.36015 3.10206 4.64691 3.56145 4.06479 4.15764C3.83166 4.3964 3.61956 4.6571 3.43178 4.93718L3.43192 4.93728L4.26237 5.49406L4.26252 5.49416C4.79977 4.69282 5.58035 4.08538 6.4891 3.76143C7.39785 3.43748 8.38666 3.41418 9.30967 3.69496C10.2327 3.97574 11.041 4.54574 11.6154 5.32088C12.1002 5.97502 12.3966 6.74603 12.4774 7.55063L10.2774 6.08398L9.7227 6.91603L12.7227 8.91603L13.1041 9.1703L13.3905 8.81235L15.3905 6.31235L14.6096 5.68765ZM2.60962 7.18765L0.609619 9.68765L1.39049 10.3123L2.56519 8.84397C2.57329 8.89614 2.58213 8.94815 2.59172 9C2.74323 9.81936 3.07981 10.5981 3.58113 11.2746C4.2832 12.222 5.27119 12.9187 6.39935 13.2619C7.52751 13.6051 8.7361 13.5766 9.84684 13.1807C10.64 12.8979 11.3532 12.4386 11.9353 11.8424C12.168 11.6041 12.3797 11.344 12.5672 11.0646L12.5683 11.0628L12.5682 11.0627L11.7377 10.5059L11.7376 10.5058L11.7365 10.5074C11.1993 11.308 10.4192 11.9148 9.51101 12.2386C8.60225 12.5625 7.61344 12.5858 6.69044 12.305C5.76744 12.0243 4.95911 11.4543 4.38471 10.6791C3.89996 10.025 3.60346 9.25397 3.52271 8.44937L5.7227 9.91603L6.2774 9.08398L3.2774 7.08398L2.89598 6.8297L2.60962 7.18765Z' fill='white' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}

	.figma-light [icon="pencil"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M14.2561 5.71957L6.79292 13.1827L6.08763 13.888L6.08536 13.8903L6.0853 13.8904L6.08539 13.8904L6.08518 13.8905L4.87536 14.1324L3.0623 14.4951L2 14.7075L2.21246 13.6452L2.81708 10.6221L2.81699 10.622L3.52409 9.91494L10.9878 2.45126C11.5894 1.84958 12.565 1.84958 13.1666 2.45126L14.2561 3.5407C14.8578 4.14238 14.8578 5.11789 14.2561 5.71957ZM11.8336 6.72784L5.59216 12.9693L3.27476 13.4328L3.73832 11.1149L9.97951 4.87374L11.8336 6.72784ZM12.5407 6.02073L13.549 5.01247C13.7601 4.80131 13.7601 4.45896 13.549 4.2478L12.4595 3.15837C12.2484 2.94721 11.906 2.94721 11.6949 3.15837L10.6866 4.16663L12.5407 6.02073Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}
	.figma-dark [icon="pencil"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M14.2561 5.71957L6.79292 13.1827L6.08763 13.888L6.08536 13.8903L6.0853 13.8904L6.08539 13.8904L6.08518 13.8905L4.87536 14.1324L3.0623 14.4951L2 14.7075L2.21246 13.6452L2.81708 10.6221L2.81699 10.622L3.52409 9.91494L10.9878 2.45126C11.5894 1.84958 12.565 1.84958 13.1666 2.45126L14.2561 3.5407C14.8578 4.14238 14.8578 5.11789 14.2561 5.71957ZM11.8336 6.72784L5.59216 12.9693L3.27476 13.4328L3.73832 11.1149L9.97951 4.87374L11.8336 6.72784ZM12.5407 6.02073L13.549 5.01247C13.7601 4.80131 13.7601 4.45896 13.549 4.2478L12.4595 3.15837C12.2484 2.94721 11.906 2.94721 11.6949 3.15837L10.6866 4.16663L12.5407 6.02073Z' fill='white' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}

	.figma-light [icon="ellipses"]::before {
		background-image: url("data:image/svg+xml;charset=utf8,%3Csvg fill='none' height='32' width='32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath clip-rule='evenodd' d='M11.5 16a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm4.5 1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z' fill='%23000' fill-rule='evenodd'/%3E%3C/svg%3E")
	}
	.figma-dark [icon="ellipses"]::before {
		background-image: url("data:image/svg+xml;charset=utf8,%3Csvg fill='none' height='32' width='32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath clip-rule='evenodd' d='M11.5 16a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm4.5 1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z' fill='white' fill-opacity='0.8' fill-rule='evenodd'/%3E%3C/svg%3E")
	}

	.figma-light [icon="arrow-right"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12.7071 8.00004L12.3536 7.64648L9.35355 4.64648L8.64645 5.35359L10.7929 7.50004H5L5 8.50004H10.7929L8.64645 10.6465L9.35355 11.3536L12.3536 8.35359L12.7071 8.00004Z' fill='black'/%3E%3C/svg%3E%0A");
	}
	.figma-dark [icon="arrow-right"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12.7071 8.00004L12.3536 7.64648L9.35355 4.64648L8.64645 5.35359L10.7929 7.50004H5L5 8.50004H10.7929L8.64645 10.6465L9.35355 11.3536L12.3536 8.35359L12.7071 8.00004Z' fill='white'/%3E%3C/svg%3E%0A");
	}

	.figma-light [icon="arrow-left"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M2.29297 8.00004L2.64652 7.64648L5.64652 4.64648L6.35363 5.35359L4.20718 7.50004L12.5001 7.50004V8.50004L4.20718 8.50004L6.35363 10.6465L5.64652 11.3536L2.64652 8.35359L2.29297 8.00004Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}
	.figma-dark [icon="arrow-left"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M2.29297 8.00004L2.64652 7.64648L5.64652 4.64648L6.35363 5.35359L4.20718 7.50004L12.5001 7.50004V8.50004L4.20718 8.50004L6.35363 10.6465L5.64652 11.3536L2.64652 8.35359L2.29297 8.00004Z' fill='white' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}

	/* .Select:hover > .label :last-child {
		margin-left: auto !important;
	} */

	.menu {
		display: none;
		position: absolute;
		background: var(--figma-color-bg, white);
		/* border: 0.5px solid rgba(0, 0, 0, 0.1); */
		/* box-shadow: 0px 3px 14px rgba(0, 0, 0, 0.1); */
		box-shadow: var(--modal-box-shadow);
		border-radius: 2px;
		/* top: 0; */
		padding: var(--size-200);
		left: 12px;
		right: 12px;
		width: auto;
		min-width: 218px;
		margin-top: 1px;
	}

	.menu__content {
		min-height: calc(8 * var(--size-400));
		max-height: calc(8 * var(--size-400));
		overflow-y: auto;
	}

	.local-templates {
		margin-bottom: calc(6 * var(--size-100));
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
		padding-inline: var(--margin-200);
		min-height: 32px;
		place-items: center;
		/* flex-wrap: wrap; */
	}

	.menu ul > * > * {
		/* flex-basis: 100%; */
	}

	.menu li {
		margin-left: calc(-1 * var(--margin-200));
    	margin-right: calc(-1 * var(--margin-200));
	}
	.menu li:hover {
		background-color: var(--figma-color-bg-hover, var(--color-hover-fill));
	}

	.menu li.selected {
		background-color: var(--figma-color-bg-selected, var(--color-selection-a));
	}

	.menu__content .toolbar {
		display: flex;
		position: absolute;
		bottom: 0;
		border-top: 1px solid var(--figma-color-border);
		left: 0;
		width: 100%;
		padding: 8px;
		background-color: var(--figma-color-bg);
	}



	.Title {
		padding: var(--margin-100) var(--margin-200);
		border-bottom: 1px solid var(--figma-color-border, var(--color-black-10));
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
		border-radius: var(--border-radius-25);
	}

	.ButtonIcon:last-child {
		margin-right: calc(-1 * var(--size-100));
	}

	.ButtonIcon:hover {
		background-color: var(--figma-color-bg-hover, var(--color-black-10));
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

	.tooltip input[type="radio"]:checked+label::before,
	.tooltip input[type="checkbox"]:checked+label::before {
		display: block;
		content: "";
		top: 4px;
		position: absolute;
		left: 8px;
		width: 16px;
		height: 16px;
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M13.2072 5.20718L7.70718 10.7072L7.00008 11.4143L6.29297 10.7072L3.29297 7.70718L4.70718 6.29297L7.00008 8.58586L11.793 3.79297L13.2072 5.20718Z' fill='white'/%3E%3C/svg%3E%0A");
	}

	.tooltip.wTriangle {
		top: unset;
		margin-top: 4px;
		right: 8px;
		left: unset;
	}

	.tooltip.wTriangle::before {
		display: block;
		content: "";
		width: 12px;
		height: 12px;
		background-color: #222222;
		transform: rotate(45deg);
		position: absolute;
		top: -3px;
		right: 9px;
		z-index: -100;
	}

	.tooltop input[type="radio"]:checked+label::before,
	.tooltop input[type="checkbox"]:checked+label::before {
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

	.iconB {}


	.refresh {
		height: 32px;
		width: 32px;
		border-radius: 2px;
	}

	.refresh:hover {
		background-color: var(--figma-color-bg-tertiary, var(--color-selection-a));
	}

	.selected .refresh:hover {
		background-color: var(--figma-color-bg-selected-hover, var(--color-selection-a));
	}

	.item > div {
		display: none;
	}

	.item:hover > div {
		display: flex;
	}

	h6 {
		font-size: 1em;
		margin-bottom: var(--size-100);
	}

	.List {
		margin-top: 8px;
		margin-bottom: 48px;
	}

	.ListItem {
		display: flex;
		place-items: center;
		min-height: 34px;
		margin: 0 -16px;
		padding: 0 16px;
	}

	.ListItem p {
		margin: 0;
	}

	.ListItem .element {
		font-weight: bold;
		min-width: 50px;
	}

	.ListItem > .buttons {
		margin-left: auto;
		display: none;
		margin-right: -8px;
	}

	.ListItem:hover {
		background-color: var(--figma-color-bg-hover, var(--color-selection-a));
	}

	.ListItem:hover > .buttons {
		display: block;
	}

	.figma-light .svg1 {
    width: 188px;
    height: 188px;
    background-image: url("data:image/svg+xml,%3Csvg width='188' height='188' viewBox='0 0 188 188' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_135_3515)'%3E%3Cg clip-path='url(%23clip0_135_3515)'%3E%3Crect x='14' y='40' width='160' height='108' rx='1.44444' fill='white'/%3E%3Crect width='40' height='36' transform='translate(14 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='40' width='40' height='36' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(54 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='54' y='40' width='40' height='36' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(94 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='40' width='40' height='36' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(134 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='134' y='40' width='40' height='36' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(14 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='76' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(54 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='54' y='76' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(94 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='76' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(134 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='134' y='76' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(14 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='112' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(54 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='54' y='112' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(94 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='112' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(134 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='134' y='112' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='40' width='160' height='108' rx='1.44444' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='4' y='30' width='180' height='128' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='181' y='27' width='6' height='6' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='181' y='155' width='6' height='6' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='1' y='155' width='6' height='6' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='1' y='27' width='6' height='6' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Cpath d='M0.477273 11.598V10.2727H7.44034V11.598H4.7429V19H3.17472V11.598H0.477273ZM9.76739 19.1321C9.35261 19.1321 8.97903 19.0582 8.64665 18.9105C8.3171 18.7599 8.05574 18.5384 7.86256 18.2457C7.67222 17.9531 7.57705 17.5923 7.57705 17.1634C7.57705 16.794 7.64523 16.4886 7.78159 16.2472C7.91795 16.0057 8.10403 15.8125 8.33983 15.6676C8.57563 15.5227 8.84125 15.4134 9.1367 15.3395C9.435 15.2628 9.74324 15.2074 10.0614 15.1733C10.4449 15.1335 10.756 15.098 10.9947 15.0668C11.2333 15.0327 11.4066 14.9815 11.5145 14.9134C11.6253 14.8423 11.6807 14.733 11.6807 14.5852V14.5597C11.6807 14.2386 11.5856 13.9901 11.3952 13.8139C11.2049 13.6378 10.9307 13.5497 10.5728 13.5497C10.1949 13.5497 9.89523 13.6321 9.67364 13.7969C9.45489 13.9616 9.30716 14.1562 9.23045 14.3807L7.79011 14.1761C7.90375 13.7784 8.09125 13.446 8.35261 13.179C8.61398 12.9091 8.93358 12.7074 9.31142 12.5739C9.68926 12.4375 10.1069 12.3693 10.5643 12.3693C10.8796 12.3693 11.1935 12.4062 11.506 12.4801C11.8185 12.554 12.104 12.6761 12.3626 12.8466C12.6211 13.0142 12.8285 13.2429 12.9847 13.5327C13.1438 13.8224 13.2234 14.1847 13.2234 14.6193V19H11.7404V18.1009H11.6893C11.5955 18.2827 11.4634 18.4531 11.293 18.6122C11.1253 18.7685 10.9137 18.8949 10.658 18.9915C10.4052 19.0852 10.1083 19.1321 9.76739 19.1321ZM10.168 17.9986C10.4776 17.9986 10.7461 17.9375 10.9734 17.8153C11.2006 17.6903 11.3753 17.5256 11.4975 17.321C11.6225 17.1165 11.685 16.8935 11.685 16.652V15.8807C11.6367 15.9205 11.5543 15.9574 11.4378 15.9915C11.3242 16.0256 11.1964 16.0554 11.0543 16.081C10.9123 16.1065 10.7716 16.1293 10.6324 16.1491C10.4932 16.169 10.3725 16.1861 10.2702 16.2003C10.0401 16.2315 9.83415 16.2827 9.65233 16.3537C9.47051 16.4247 9.32705 16.5241 9.22193 16.652C9.11682 16.777 9.06426 16.9389 9.06426 17.1378C9.06426 17.4219 9.16795 17.6364 9.37534 17.7812C9.58273 17.9261 9.84693 17.9986 10.168 17.9986ZM14.9027 19V10.2727H16.4453V13.5369H16.5092C16.5887 13.3778 16.701 13.2088 16.8459 13.0298C16.9907 12.848 17.1868 12.6932 17.4339 12.5653C17.6811 12.4347 17.9964 12.3693 18.3799 12.3693C18.8856 12.3693 19.3416 12.4986 19.7478 12.7571C20.1569 13.0128 20.4808 13.392 20.7194 13.8949C20.9609 14.3949 21.0816 15.0085 21.0816 15.7358C21.0816 16.4545 20.9638 17.0653 20.728 17.5682C20.4922 18.071 20.1711 18.4545 19.7649 18.7188C19.3586 18.983 18.8984 19.1151 18.3842 19.1151C18.0092 19.1151 17.6981 19.0526 17.451 18.9276C17.2038 18.8026 17.0049 18.652 16.8544 18.4759C16.7066 18.2969 16.5916 18.1278 16.5092 17.9688H16.4197V19H14.9027ZM16.4155 15.7273C16.4155 16.1506 16.4751 16.5213 16.5944 16.8395C16.7166 17.1577 16.8913 17.4062 17.1186 17.5852C17.3487 17.7614 17.6271 17.8494 17.9538 17.8494C18.2947 17.8494 18.5802 17.7585 18.8103 17.5767C19.0405 17.392 19.2138 17.1406 19.3302 16.8224C19.4495 16.5014 19.5092 16.1364 19.5092 15.7273C19.5092 15.321 19.451 14.9602 19.3345 14.6449C19.218 14.3295 19.0447 14.0824 18.8146 13.9034C18.5845 13.7244 18.2976 13.6349 17.9538 13.6349C17.6243 13.6349 17.3444 13.7216 17.1143 13.8949C16.8842 14.0682 16.7095 14.3111 16.5902 14.6236C16.4737 14.9361 16.4155 15.304 16.4155 15.7273ZM23.9957 10.2727V19H22.4531V10.2727H23.9957ZM28.5397 19.1278C27.8835 19.1278 27.3167 18.9915 26.8394 18.7188C26.365 18.4432 25.9999 18.054 25.7443 17.5511C25.4886 17.0455 25.3607 16.4503 25.3607 15.7656C25.3607 15.0923 25.4886 14.5014 25.7443 13.9929C26.0028 13.4815 26.3636 13.0838 26.8266 12.7997C27.2897 12.5128 27.8337 12.3693 28.4587 12.3693C28.8622 12.3693 29.2428 12.4347 29.6008 12.5653C29.9616 12.6932 30.2798 12.892 30.5553 13.1619C30.8338 13.4318 31.0525 13.7756 31.2116 14.1932C31.3707 14.608 31.4502 15.1023 31.4502 15.6761V16.1491H26.0852V15.1094H29.9715C29.9687 14.8139 29.9048 14.5511 29.7798 14.321C29.6548 14.0881 29.4801 13.9048 29.2556 13.7713C29.034 13.6378 28.7755 13.571 28.4801 13.571C28.1647 13.571 27.8877 13.6477 27.6491 13.8011C27.4105 13.9517 27.2244 14.1506 27.0909 14.3977C26.9602 14.642 26.8934 14.9105 26.8906 15.2031V16.1108C26.8906 16.4915 26.9602 16.8182 27.0994 17.0909C27.2386 17.3608 27.4332 17.5682 27.6832 17.7131C27.9332 17.8551 28.2258 17.9261 28.561 17.9261C28.7855 17.9261 28.9886 17.8949 29.1704 17.8324C29.3522 17.767 29.5099 17.6719 29.6434 17.5469C29.7769 17.4219 29.8778 17.267 29.946 17.0824L31.3863 17.2443C31.2954 17.625 31.1221 17.9574 30.8664 18.2415C30.6136 18.5227 30.2897 18.7415 29.8948 18.8977C29.4999 19.0511 29.0482 19.1278 28.5397 19.1278Z' fill='%232F80ED'/%3E%3Crect x='54' y='40' width='40' height='36' stroke='%23A54EEA' stroke-width='2'/%3E%3Cg filter='url(%23filter1_d_135_3515)'%3E%3Cpath d='M92.7091 86.0833L90 72L101.92 79.0417L95.9601 80.6667L92.7091 86.0833Z' fill='%23010101'/%3E%3Cpath d='M90.2755 71.5336L89.2411 70.9226L89.4681 72.1023L92.1772 86.1857L92.4447 87.5764L93.1736 86.3621L96.3125 81.132L102.063 79.5643L103.299 79.2271L102.196 78.5753L90.2755 71.5336Z' stroke='white' stroke-width='1.08333' stroke-linecap='square'/%3E%3C/g%3E%3Cpath d='M30.6444 88.3362C31.0042 88.4452 31.2724 88.747 31.3386 89.1171L33.0156 98.4951C33.2121 99.5938 34.7879 99.5938 34.9844 98.4951L36.6614 89.1171C36.7276 88.747 36.9958 88.4452 37.3556 88.3362L42.8432 86.6726C43.7897 86.3856 43.7897 85.0455 42.8432 84.7586L37.3587 83.0959C36.9973 82.9863 36.7284 82.6825 36.6636 82.3103L34.9852 72.6628C34.793 71.558 33.207 71.558 33.0148 72.6628L31.3364 82.3103C31.2716 82.6825 31.0027 82.9863 30.6413 83.0959L25.1568 84.7586C24.2103 85.0455 24.2103 86.3856 25.1568 86.6726L30.6444 88.3362Z' fill='%23FF678C'/%3E%3Cpath d='M82.0259 180.292C82.3875 180.399 82.6583 180.7 82.7265 181.071L83.0165 182.649C83.2172 183.741 84.7828 183.741 84.9835 182.649L85.2735 181.071C85.3417 180.7 85.6125 180.399 85.9741 180.292L86.7482 180.064C87.7044 179.782 87.7044 178.428 86.7482 178.146L85.9773 177.918C85.6141 177.811 85.3425 177.508 85.2758 177.135L84.9844 175.505C84.7879 174.407 83.2121 174.407 83.0156 175.505L82.7242 177.135C82.6575 177.508 82.3859 177.811 82.0227 177.918L81.2518 178.146C80.2956 178.428 80.2956 179.782 81.2518 180.064L82.0259 180.292Z' fill='%23FF678C'/%3E%3Cpath d='M151.795 131.037C152.157 131.143 152.428 131.444 152.496 131.815L153.016 134.649C153.217 135.741 154.783 135.741 154.984 134.649L155.504 131.815C155.572 131.444 155.843 131.143 156.205 131.037L157.748 130.581C158.704 130.299 158.704 128.945 157.748 128.663L156.208 128.209C155.845 128.102 155.573 127.799 155.507 127.426L154.984 124.505C154.788 123.407 153.212 123.407 153.016 124.505L152.493 127.426C152.427 127.799 152.155 128.102 151.792 128.209L150.252 128.663C149.296 128.945 149.296 130.299 150.252 130.581L151.795 131.037Z' fill='%23FF678C'/%3E%3Cpath d='M119.338 16.1018C119.697 16.2117 119.964 16.5136 120.03 16.8835L121.015 22.444C121.21 23.5447 122.79 23.5447 122.985 22.444L123.97 16.8835C124.036 16.5136 124.303 16.2117 124.662 16.1018L127.874 15.1194C128.817 14.8308 128.817 13.4954 127.874 13.2069L124.665 12.2254C124.304 12.1151 124.036 11.811 123.972 11.4391L122.985 5.71533C122.795 4.60855 121.205 4.60855 121.015 5.71533L120.028 11.4391C119.964 11.811 119.696 12.1151 119.335 12.2254L116.126 13.2069C115.183 13.4954 115.183 14.8308 116.126 15.1194L119.338 16.1018Z' fill='%23FF678C'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_135_3515' x='1' y='39' width='186' height='138' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_135_3515'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_135_3515' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_135_3515' x='85.4823' y='67.8452' width='22.1957' height='25.2241' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='1'/%3E%3CfeGaussianBlur stdDeviation='1.5'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_135_3515'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_135_3515' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_135_3515'%3E%3Crect x='14' y='40' width='160' height='108' rx='1.44444' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");}

.figma-dark .svg1 {
    width: 188px;
    height: 188px;
	background-image: url("data:image/svg+xml,%3Csvg width='188' height='188' viewBox='0 0 188 188' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_135_6049)'%3E%3Cg clip-path='url(%23clip0_135_6049)'%3E%3Crect x='14' y='40' width='160' height='108' rx='1.44444' fill='%232D2D2C'/%3E%3Crect width='40' height='36' transform='translate(14 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='40' width='40' height='36' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(54 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='54' y='40' width='40' height='36' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(94 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='40' width='40' height='36' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(134 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='134' y='40' width='40' height='36' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(14 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='76' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(54 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='54' y='76' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(94 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='76' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(134 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='134' y='76' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(14 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='112' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(54 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='54' y='112' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(94 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='112' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(134 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='134' y='112' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='40' width='160' height='108' rx='1.44444' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='4' y='30' width='180' height='128' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='181' y='27' width='6' height='6' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='181' y='155' width='6' height='6' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='1' y='155' width='6' height='6' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='1' y='27' width='6' height='6' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Cpath d='M0.477273 11.598V10.2727H7.44034V11.598H4.7429V19H3.17472V11.598H0.477273ZM9.76739 19.1321C9.35261 19.1321 8.97903 19.0582 8.64665 18.9105C8.3171 18.7599 8.05574 18.5384 7.86256 18.2457C7.67222 17.9531 7.57705 17.5923 7.57705 17.1634C7.57705 16.794 7.64523 16.4886 7.78159 16.2472C7.91795 16.0057 8.10403 15.8125 8.33983 15.6676C8.57563 15.5227 8.84125 15.4134 9.1367 15.3395C9.435 15.2628 9.74324 15.2074 10.0614 15.1733C10.4449 15.1335 10.756 15.098 10.9947 15.0668C11.2333 15.0327 11.4066 14.9815 11.5145 14.9134C11.6253 14.8423 11.6807 14.733 11.6807 14.5852V14.5597C11.6807 14.2386 11.5856 13.9901 11.3952 13.8139C11.2049 13.6378 10.9307 13.5497 10.5728 13.5497C10.1949 13.5497 9.89523 13.6321 9.67364 13.7969C9.45489 13.9616 9.30716 14.1562 9.23045 14.3807L7.79011 14.1761C7.90375 13.7784 8.09125 13.446 8.35261 13.179C8.61398 12.9091 8.93358 12.7074 9.31142 12.5739C9.68926 12.4375 10.1069 12.3693 10.5643 12.3693C10.8796 12.3693 11.1935 12.4062 11.506 12.4801C11.8185 12.554 12.104 12.6761 12.3626 12.8466C12.6211 13.0142 12.8285 13.2429 12.9847 13.5327C13.1438 13.8224 13.2234 14.1847 13.2234 14.6193V19H11.7404V18.1009H11.6893C11.5955 18.2827 11.4634 18.4531 11.293 18.6122C11.1253 18.7685 10.9137 18.8949 10.658 18.9915C10.4052 19.0852 10.1083 19.1321 9.76739 19.1321ZM10.168 17.9986C10.4776 17.9986 10.7461 17.9375 10.9734 17.8153C11.2006 17.6903 11.3753 17.5256 11.4975 17.321C11.6225 17.1165 11.685 16.8935 11.685 16.652V15.8807C11.6367 15.9205 11.5543 15.9574 11.4378 15.9915C11.3242 16.0256 11.1964 16.0554 11.0543 16.081C10.9123 16.1065 10.7716 16.1293 10.6324 16.1491C10.4932 16.169 10.3725 16.1861 10.2702 16.2003C10.0401 16.2315 9.83415 16.2827 9.65233 16.3537C9.47051 16.4247 9.32705 16.5241 9.22193 16.652C9.11682 16.777 9.06426 16.9389 9.06426 17.1378C9.06426 17.4219 9.16795 17.6364 9.37534 17.7812C9.58273 17.9261 9.84693 17.9986 10.168 17.9986ZM14.9027 19V10.2727H16.4453V13.5369H16.5092C16.5887 13.3778 16.701 13.2088 16.8459 13.0298C16.9907 12.848 17.1868 12.6932 17.4339 12.5653C17.6811 12.4347 17.9964 12.3693 18.3799 12.3693C18.8856 12.3693 19.3416 12.4986 19.7478 12.7571C20.1569 13.0128 20.4808 13.392 20.7194 13.8949C20.9609 14.3949 21.0816 15.0085 21.0816 15.7358C21.0816 16.4545 20.9638 17.0653 20.728 17.5682C20.4922 18.071 20.1711 18.4545 19.7649 18.7188C19.3586 18.983 18.8984 19.1151 18.3842 19.1151C18.0092 19.1151 17.6981 19.0526 17.451 18.9276C17.2038 18.8026 17.0049 18.652 16.8544 18.4759C16.7066 18.2969 16.5916 18.1278 16.5092 17.9688H16.4197V19H14.9027ZM16.4155 15.7273C16.4155 16.1506 16.4751 16.5213 16.5944 16.8395C16.7166 17.1577 16.8913 17.4062 17.1186 17.5852C17.3487 17.7614 17.6271 17.8494 17.9538 17.8494C18.2947 17.8494 18.5802 17.7585 18.8103 17.5767C19.0405 17.392 19.2138 17.1406 19.3302 16.8224C19.4495 16.5014 19.5092 16.1364 19.5092 15.7273C19.5092 15.321 19.451 14.9602 19.3345 14.6449C19.218 14.3295 19.0447 14.0824 18.8146 13.9034C18.5845 13.7244 18.2976 13.6349 17.9538 13.6349C17.6243 13.6349 17.3444 13.7216 17.1143 13.8949C16.8842 14.0682 16.7095 14.3111 16.5902 14.6236C16.4737 14.9361 16.4155 15.304 16.4155 15.7273ZM23.9957 10.2727V19H22.4531V10.2727H23.9957ZM28.5397 19.1278C27.8835 19.1278 27.3167 18.9915 26.8394 18.7188C26.365 18.4432 25.9999 18.054 25.7443 17.5511C25.4886 17.0455 25.3607 16.4503 25.3607 15.7656C25.3607 15.0923 25.4886 14.5014 25.7443 13.9929C26.0028 13.4815 26.3636 13.0838 26.8266 12.7997C27.2897 12.5128 27.8337 12.3693 28.4587 12.3693C28.8622 12.3693 29.2428 12.4347 29.6008 12.5653C29.9616 12.6932 30.2798 12.892 30.5553 13.1619C30.8338 13.4318 31.0525 13.7756 31.2116 14.1932C31.3707 14.608 31.4502 15.1023 31.4502 15.6761V16.1491H26.0852V15.1094H29.9715C29.9687 14.8139 29.9048 14.5511 29.7798 14.321C29.6548 14.0881 29.4801 13.9048 29.2556 13.7713C29.034 13.6378 28.7755 13.571 28.4801 13.571C28.1647 13.571 27.8877 13.6477 27.6491 13.8011C27.4105 13.9517 27.2244 14.1506 27.0909 14.3977C26.9602 14.642 26.8934 14.9105 26.8906 15.2031V16.1108C26.8906 16.4915 26.9602 16.8182 27.0994 17.0909C27.2386 17.3608 27.4332 17.5682 27.6832 17.7131C27.9332 17.8551 28.2258 17.9261 28.561 17.9261C28.7855 17.9261 28.9886 17.8949 29.1704 17.8324C29.3522 17.767 29.5099 17.6719 29.6434 17.5469C29.7769 17.4219 29.8778 17.267 29.946 17.0824L31.3863 17.2443C31.2954 17.625 31.1221 17.9574 30.8664 18.2415C30.6136 18.5227 30.2897 18.7415 29.8948 18.8977C29.4999 19.0511 29.0482 19.1278 28.5397 19.1278Z' fill='%232F80ED'/%3E%3Crect x='54' y='40' width='40' height='36' stroke='%23A54EEA' stroke-width='2'/%3E%3Cg filter='url(%23filter1_d_135_6049)'%3E%3Cpath d='M92.7091 86.0833L90 72L101.92 79.0417L95.9601 80.6667L92.7091 86.0833Z' fill='%23010101'/%3E%3Cpath d='M90.2755 71.5336L89.2411 70.9226L89.4681 72.1023L92.1772 86.1857L92.4447 87.5764L93.1736 86.3621L96.3125 81.132L102.063 79.5643L103.299 79.2271L102.196 78.5753L90.2755 71.5336Z' stroke='white' stroke-width='1.08333' stroke-linecap='square'/%3E%3C/g%3E%3Cpath d='M30.6444 88.3362C31.0042 88.4452 31.2724 88.747 31.3386 89.1171L33.0156 98.4951C33.2121 99.5938 34.7879 99.5938 34.9844 98.4951L36.6614 89.1171C36.7276 88.747 36.9958 88.4452 37.3556 88.3362L42.8432 86.6726C43.7897 86.3856 43.7897 85.0455 42.8432 84.7586L37.3587 83.0959C36.9973 82.9863 36.7284 82.6825 36.6636 82.3103L34.9852 72.6628C34.793 71.558 33.207 71.558 33.0148 72.6628L31.3364 82.3103C31.2716 82.6825 31.0027 82.9863 30.6413 83.0959L25.1568 84.7586C24.2103 85.0455 24.2103 86.3856 25.1568 86.6726L30.6444 88.3362Z' fill='%23FF678C'/%3E%3Cpath d='M82.0259 180.292C82.3875 180.399 82.6583 180.7 82.7265 181.071L83.0165 182.649C83.2172 183.741 84.7828 183.741 84.9835 182.649L85.2735 181.071C85.3417 180.7 85.6125 180.399 85.9741 180.292L86.7482 180.064C87.7044 179.782 87.7044 178.428 86.7482 178.146L85.9773 177.918C85.6141 177.811 85.3425 177.508 85.2758 177.135L84.9844 175.505C84.7879 174.407 83.2121 174.407 83.0156 175.505L82.7242 177.135C82.6575 177.508 82.3859 177.811 82.0227 177.918L81.2518 178.146C80.2956 178.428 80.2956 179.782 81.2518 180.064L82.0259 180.292Z' fill='%23FF678C'/%3E%3Cpath d='M151.795 131.037C152.157 131.143 152.428 131.444 152.496 131.815L153.016 134.649C153.217 135.741 154.783 135.741 154.984 134.649L155.504 131.815C155.572 131.444 155.843 131.143 156.205 131.037L157.748 130.581C158.704 130.299 158.704 128.945 157.748 128.663L156.208 128.209C155.845 128.102 155.573 127.799 155.507 127.426L154.984 124.505C154.788 123.407 153.212 123.407 153.016 124.505L152.493 127.426C152.427 127.799 152.155 128.102 151.792 128.209L150.252 128.663C149.296 128.945 149.296 130.299 150.252 130.581L151.795 131.037Z' fill='%23FF678C'/%3E%3Cpath d='M119.338 16.1018C119.697 16.2117 119.964 16.5136 120.03 16.8835L121.015 22.444C121.21 23.5447 122.79 23.5447 122.985 22.444L123.97 16.8835C124.036 16.5136 124.303 16.2117 124.662 16.1018L127.874 15.1194C128.817 14.8308 128.817 13.4954 127.874 13.2069L124.665 12.2254C124.304 12.1151 124.036 11.811 123.972 11.4391L122.985 5.71533C122.795 4.60855 121.205 4.60855 121.015 5.71533L120.028 11.4391C119.964 11.811 119.696 12.1151 119.335 12.2254L116.126 13.2069C115.183 13.4954 115.183 14.8308 116.126 15.1194L119.338 16.1018Z' fill='%23FF678C'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_135_6049' x='1' y='39' width='186' height='138' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_135_6049'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_135_6049' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_135_6049' x='85.4823' y='67.8452' width='22.1957' height='25.2244' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='1'/%3E%3CfeGaussianBlur stdDeviation='1.5'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_135_6049'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_135_6049' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_135_6049'%3E%3Crect x='14' y='40' width='160' height='108' rx='1.44444' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
}

.figma-light .svg2 {
	margin: 0 -76px -2px 0;
	width: 276px;
    height: 196px;
    background-image: url("data:image/svg+xml,%3Csvg width='276' height='196' viewBox='0 0 276 196' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_135_6841)'%3E%3Cg clip-path='url(%23clip0_135_6841)'%3E%3Crect x='70' y='31.5' width='190' height='128' rx='2' fill='white'/%3E%3Crect width='95' height='43' transform='translate(70 31.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='70' y='31.5' width='95' height='43' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='95' height='43' transform='translate(165 31.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='165' y='31.5' width='95' height='43' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='95' height='43' transform='translate(70 74.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='70' y='74.5' width='95' height='43' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='95' height='43' transform='translate(165 74.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='165' y='74.5' width='95' height='43' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='95' height='42' transform='translate(70 117.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='70' y='117.5' width='95' height='42' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='95' height='42' transform='translate(165 117.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='165' y='117.5' width='95' height='42' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='70' y='31.5' width='190' height='128' rx='2' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='60' y='21.5' width='210' height='148' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='267' y='18.5' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='267' y='166.5' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='57' y='166.5' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='57' y='18.5' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M62 0.5L59.375 3.125L62 5.75L64.625 3.125L62 0.5ZM62 7.25L59.375 9.875L62 12.5L64.625 9.875L62 7.25ZM56 6.5L58.625 3.875L61.25 6.5L58.625 9.125L56 6.5ZM65.375 3.875L62.75 6.5L65.375 9.125L68 6.5L65.375 3.875Z' fill='%23A54EEA'/%3E%3Cpath d='M71.4773 3.09801V1.77273H78.4403V3.09801H75.7429V10.5H74.1747V3.09801H71.4773ZM80.7674 10.6321C80.3526 10.6321 79.979 10.5582 79.6466 10.4105C79.3171 10.2599 79.0557 10.0384 78.8626 9.74574C78.6722 9.45312 78.577 9.09233 78.577 8.66335C78.577 8.29403 78.6452 7.98864 78.7816 7.74716C78.918 7.50568 79.104 7.3125 79.3398 7.16761C79.5756 7.02273 79.8413 6.91335 80.1367 6.83949C80.435 6.76278 80.7432 6.70739 81.0614 6.6733C81.4449 6.63352 81.756 6.59801 81.9947 6.56676C82.2333 6.53267 82.4066 6.48153 82.5145 6.41335C82.6253 6.34233 82.6807 6.23295 82.6807 6.08523V6.05966C82.6807 5.73864 82.5856 5.49006 82.3952 5.31392C82.2049 5.13778 81.9307 5.04972 81.5728 5.04972C81.1949 5.04972 80.8952 5.1321 80.6736 5.29688C80.4549 5.46165 80.3072 5.65625 80.2305 5.88068L78.7901 5.67614C78.9037 5.27841 79.0913 4.94602 79.3526 4.67898C79.614 4.40909 79.9336 4.20739 80.3114 4.07386C80.6893 3.9375 81.1069 3.86932 81.5643 3.86932C81.8796 3.86932 82.1935 3.90625 82.506 3.98011C82.8185 4.05398 83.104 4.17614 83.3626 4.34659C83.6211 4.5142 83.8285 4.7429 83.9847 5.03267C84.1438 5.32244 84.2234 5.68466 84.2234 6.11932V10.5H82.7404V9.60085H82.6893C82.5955 9.78267 82.4634 9.95312 82.293 10.1122C82.1253 10.2685 81.9137 10.3949 81.658 10.4915C81.4052 10.5852 81.1083 10.6321 80.7674 10.6321ZM81.168 9.49858C81.4776 9.49858 81.7461 9.4375 81.9734 9.31534C82.2006 9.19034 82.3753 9.02557 82.4975 8.82102C82.6225 8.61648 82.685 8.39347 82.685 8.15199V7.38068C82.6367 7.42045 82.5543 7.45739 82.4378 7.49148C82.3242 7.52557 82.1964 7.5554 82.0543 7.58097C81.9123 7.60653 81.7716 7.62926 81.6324 7.64915C81.4932 7.66903 81.3725 7.68608 81.2702 7.70028C81.0401 7.73153 80.8341 7.78267 80.6523 7.85369C80.4705 7.92472 80.327 8.02415 80.2219 8.15199C80.1168 8.27699 80.0643 8.43892 80.0643 8.63778C80.0643 8.92188 80.168 9.13636 80.3753 9.28125C80.5827 9.42614 80.8469 9.49858 81.168 9.49858ZM85.9027 10.5V1.77273H87.4453V5.03693H87.5092C87.5887 4.87784 87.701 4.70881 87.8459 4.52983C87.9907 4.34801 88.1868 4.19318 88.4339 4.06534C88.6811 3.93466 88.9964 3.86932 89.3799 3.86932C89.8856 3.86932 90.3416 3.99858 90.7478 4.2571C91.1569 4.51278 91.4808 4.89205 91.7194 5.39489C91.9609 5.89489 92.0816 6.50852 92.0816 7.2358C92.0816 7.95455 91.9638 8.56534 91.728 9.06818C91.4922 9.57102 91.1711 9.95455 90.7649 10.2188C90.3586 10.483 89.8984 10.6151 89.3842 10.6151C89.0092 10.6151 88.6981 10.5526 88.451 10.4276C88.2038 10.3026 88.0049 10.152 87.8544 9.97585C87.7066 9.79687 87.5916 9.62784 87.5092 9.46875H87.4197V10.5H85.9027ZM87.4155 7.22727C87.4155 7.65057 87.4751 8.02131 87.5944 8.33949C87.7166 8.65767 87.8913 8.90625 88.1186 9.08523C88.3487 9.26136 88.6271 9.34943 88.9538 9.34943C89.2947 9.34943 89.5802 9.25852 89.8103 9.0767C90.0405 8.89205 90.2138 8.64062 90.3302 8.32244C90.4495 8.00142 90.5092 7.63636 90.5092 7.22727C90.5092 6.82102 90.451 6.46023 90.3345 6.14489C90.218 5.82955 90.0447 5.58239 89.8146 5.40341C89.5845 5.22443 89.2976 5.13494 88.9538 5.13494C88.6243 5.13494 88.3444 5.22159 88.1143 5.39489C87.8842 5.56818 87.7095 5.81108 87.5902 6.12358C87.4737 6.43608 87.4155 6.80398 87.4155 7.22727ZM94.9957 1.77273V10.5H93.4531V1.77273H94.9957ZM99.5397 10.6278C98.8835 10.6278 98.3167 10.4915 97.8394 10.2188C97.365 9.94318 96.9999 9.55398 96.7443 9.05114C96.4886 8.54545 96.3607 7.95028 96.3607 7.26562C96.3607 6.59233 96.4886 6.00142 96.7443 5.4929C97.0028 4.98153 97.3636 4.58381 97.8266 4.29972C98.2897 4.01278 98.8337 3.86932 99.4587 3.86932C99.8622 3.86932 100.243 3.93466 100.601 4.06534C100.962 4.19318 101.28 4.39205 101.555 4.66193C101.834 4.93182 102.053 5.27557 102.212 5.69318C102.371 6.10795 102.45 6.60227 102.45 7.17614V7.64915H97.0852V6.60938H100.972C100.969 6.31392 100.905 6.05114 100.78 5.82102C100.655 5.58807 100.48 5.40483 100.256 5.27131C100.034 5.13778 99.7755 5.07102 99.4801 5.07102C99.1647 5.07102 98.8877 5.14773 98.6491 5.30114C98.4105 5.4517 98.2244 5.65057 98.0909 5.89773C97.9602 6.14205 97.8934 6.41051 97.8906 6.70312V7.6108C97.8906 7.99148 97.9602 8.31818 98.0994 8.59091C98.2386 8.8608 98.4332 9.06818 98.6832 9.21307C98.9332 9.35511 99.2258 9.42614 99.561 9.42614C99.7855 9.42614 99.9886 9.39489 100.17 9.33239C100.352 9.26705 100.51 9.17188 100.643 9.04688C100.777 8.92188 100.878 8.76705 100.946 8.58239L102.386 8.74432C102.295 9.125 102.122 9.45739 101.866 9.74148C101.614 10.0227 101.29 10.2415 100.895 10.3977C100.5 10.5511 100.048 10.6278 99.5397 10.6278ZM110.385 1.77273V10.5H108.804V3.31108H108.752L106.711 4.61506V3.16619L108.88 1.77273H110.385Z' fill='%23A54EEA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M11.9706 75.6967C14.3941 74.8328 17.031 74.7707 19.4924 75.5195C21.9539 76.2682 24.1095 77.7883 25.6413 79.8554C26.6665 81.2389 27.376 82.8184 27.7331 84.4832L30.2195 81.3753L31.7812 82.6247L27.7812 87.6247L27.2085 88.3406L26.4456 87.8321L20.4456 83.8321L21.555 82.1679L25.7972 84.996C25.5064 83.5744 24.9079 82.2249 24.0344 81.0462C22.7579 79.3236 20.9616 78.0569 18.9104 77.4329C16.8592 76.8089 14.6617 76.8607 12.6422 77.5806C10.6227 78.3005 8.88798 79.6504 7.69404 81.4312L6.03284 80.3175C7.46558 78.1805 9.5472 76.5606 11.9706 75.6967ZM4.21896 86.3753L0.218964 91.3753L1.7807 92.6247L4.26691 89.5169C4.62404 91.1817 5.33349 92.7611 6.3587 94.1446C7.89051 96.2117 10.0461 97.7318 12.5076 98.4805C14.969 99.2293 17.6059 99.1672 20.0294 98.3033C22.4528 97.4394 24.5344 95.8195 25.9671 93.6825L24.306 92.5688C23.112 94.3496 21.3773 95.6995 19.3578 96.4194C17.3383 97.1393 15.1408 97.1911 13.0896 96.5671C11.0384 95.9431 9.24209 94.6764 7.96558 92.9538C7.09205 91.775 6.4936 90.4255 6.20281 89.0038L10.4451 91.832L11.5545 90.1679L5.55453 86.1679L4.79169 85.6594L4.21896 86.3753Z' fill='%23CFCFCF'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_135_6841' x='54' y='30.5' width='222' height='165' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='20'/%3E%3CfeGaussianBlur stdDeviation='7.5'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_135_6841'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_135_6841' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_135_6841'%3E%3Crect x='70' y='31.5' width='190' height='128' rx='2' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
}

.figma-dark .svg2 {
	margin: 0 -76px -2px 0;
    width: 276px;
    height: 196px;
	background-image: url("data:image/svg+xml,%3Csvg width='276' height='196' viewBox='0 0 276 196' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_135_6004)'%3E%3Cg clip-path='url(%23clip0_135_6004)'%3E%3Crect x='70' y='31.5' width='190' height='128' rx='2' fill='%232D2D2C'/%3E%3Crect width='95' height='43' transform='translate(70 31.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='70' y='31.5' width='95' height='43' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='95' height='43' transform='translate(165 31.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='165' y='31.5' width='95' height='43' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='95' height='43' transform='translate(70 74.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='70' y='74.5' width='95' height='43' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='95' height='43' transform='translate(165 74.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='165' y='74.5' width='95' height='43' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='95' height='42' transform='translate(70 117.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='70' y='117.5' width='95' height='42' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='95' height='42' transform='translate(165 117.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='165' y='117.5' width='95' height='42' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='70' y='31.5' width='190' height='128' rx='2' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='60' y='21.5' width='210' height='148' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='267' y='18.5' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='267' y='166.5' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='57' y='166.5' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='57' y='18.5' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M62 0.5L59.375 3.125L62 5.75L64.625 3.125L62 0.5ZM62 7.25L59.375 9.875L62 12.5L64.625 9.875L62 7.25ZM56 6.5L58.625 3.875L61.25 6.5L58.625 9.125L56 6.5ZM65.375 3.875L62.75 6.5L65.375 9.125L68 6.5L65.375 3.875Z' fill='%23A54EEA'/%3E%3Cpath d='M71.4773 3.09801V1.77273H78.4403V3.09801H75.7429V10.5H74.1747V3.09801H71.4773ZM80.7674 10.6321C80.3526 10.6321 79.979 10.5582 79.6466 10.4105C79.3171 10.2599 79.0557 10.0384 78.8626 9.74574C78.6722 9.45312 78.577 9.09233 78.577 8.66335C78.577 8.29403 78.6452 7.98864 78.7816 7.74716C78.918 7.50568 79.104 7.3125 79.3398 7.16761C79.5756 7.02273 79.8413 6.91335 80.1367 6.83949C80.435 6.76278 80.7432 6.70739 81.0614 6.6733C81.4449 6.63352 81.756 6.59801 81.9947 6.56676C82.2333 6.53267 82.4066 6.48153 82.5145 6.41335C82.6253 6.34233 82.6807 6.23295 82.6807 6.08523V6.05966C82.6807 5.73864 82.5856 5.49006 82.3952 5.31392C82.2049 5.13778 81.9307 5.04972 81.5728 5.04972C81.1949 5.04972 80.8952 5.1321 80.6736 5.29688C80.4549 5.46165 80.3072 5.65625 80.2305 5.88068L78.7901 5.67614C78.9037 5.27841 79.0913 4.94602 79.3526 4.67898C79.614 4.40909 79.9336 4.20739 80.3114 4.07386C80.6893 3.9375 81.1069 3.86932 81.5643 3.86932C81.8796 3.86932 82.1935 3.90625 82.506 3.98011C82.8185 4.05398 83.104 4.17614 83.3626 4.34659C83.6211 4.5142 83.8285 4.7429 83.9847 5.03267C84.1438 5.32244 84.2234 5.68466 84.2234 6.11932V10.5H82.7404V9.60085H82.6893C82.5955 9.78267 82.4634 9.95312 82.293 10.1122C82.1253 10.2685 81.9137 10.3949 81.658 10.4915C81.4052 10.5852 81.1083 10.6321 80.7674 10.6321ZM81.168 9.49858C81.4776 9.49858 81.7461 9.4375 81.9734 9.31534C82.2006 9.19034 82.3753 9.02557 82.4975 8.82102C82.6225 8.61648 82.685 8.39347 82.685 8.15199V7.38068C82.6367 7.42045 82.5543 7.45739 82.4378 7.49148C82.3242 7.52557 82.1964 7.5554 82.0543 7.58097C81.9123 7.60653 81.7716 7.62926 81.6324 7.64915C81.4932 7.66903 81.3725 7.68608 81.2702 7.70028C81.0401 7.73153 80.8341 7.78267 80.6523 7.85369C80.4705 7.92472 80.327 8.02415 80.2219 8.15199C80.1168 8.27699 80.0643 8.43892 80.0643 8.63778C80.0643 8.92188 80.168 9.13636 80.3753 9.28125C80.5827 9.42614 80.8469 9.49858 81.168 9.49858ZM85.9027 10.5V1.77273H87.4453V5.03693H87.5092C87.5887 4.87784 87.701 4.70881 87.8459 4.52983C87.9907 4.34801 88.1868 4.19318 88.4339 4.06534C88.6811 3.93466 88.9964 3.86932 89.3799 3.86932C89.8856 3.86932 90.3416 3.99858 90.7478 4.2571C91.1569 4.51278 91.4808 4.89205 91.7194 5.39489C91.9609 5.89489 92.0816 6.50852 92.0816 7.2358C92.0816 7.95455 91.9638 8.56534 91.728 9.06818C91.4922 9.57102 91.1711 9.95455 90.7649 10.2188C90.3586 10.483 89.8984 10.6151 89.3842 10.6151C89.0092 10.6151 88.6981 10.5526 88.451 10.4276C88.2038 10.3026 88.0049 10.152 87.8544 9.97585C87.7066 9.79687 87.5916 9.62784 87.5092 9.46875H87.4197V10.5H85.9027ZM87.4155 7.22727C87.4155 7.65057 87.4751 8.02131 87.5944 8.33949C87.7166 8.65767 87.8913 8.90625 88.1186 9.08523C88.3487 9.26136 88.6271 9.34943 88.9538 9.34943C89.2947 9.34943 89.5802 9.25852 89.8103 9.0767C90.0405 8.89205 90.2138 8.64062 90.3302 8.32244C90.4495 8.00142 90.5092 7.63636 90.5092 7.22727C90.5092 6.82102 90.451 6.46023 90.3345 6.14489C90.218 5.82955 90.0447 5.58239 89.8146 5.40341C89.5845 5.22443 89.2976 5.13494 88.9538 5.13494C88.6243 5.13494 88.3444 5.22159 88.1143 5.39489C87.8842 5.56818 87.7095 5.81108 87.5902 6.12358C87.4737 6.43608 87.4155 6.80398 87.4155 7.22727ZM94.9957 1.77273V10.5H93.4531V1.77273H94.9957ZM99.5397 10.6278C98.8835 10.6278 98.3167 10.4915 97.8394 10.2188C97.365 9.94318 96.9999 9.55398 96.7443 9.05114C96.4886 8.54545 96.3607 7.95028 96.3607 7.26562C96.3607 6.59233 96.4886 6.00142 96.7443 5.4929C97.0028 4.98153 97.3636 4.58381 97.8266 4.29972C98.2897 4.01278 98.8337 3.86932 99.4587 3.86932C99.8622 3.86932 100.243 3.93466 100.601 4.06534C100.962 4.19318 101.28 4.39205 101.555 4.66193C101.834 4.93182 102.053 5.27557 102.212 5.69318C102.371 6.10795 102.45 6.60227 102.45 7.17614V7.64915H97.0852V6.60938H100.972C100.969 6.31392 100.905 6.05114 100.78 5.82102C100.655 5.58807 100.48 5.40483 100.256 5.27131C100.034 5.13778 99.7755 5.07102 99.4801 5.07102C99.1647 5.07102 98.8877 5.14773 98.6491 5.30114C98.4105 5.4517 98.2244 5.65057 98.0909 5.89773C97.9602 6.14205 97.8934 6.41051 97.8906 6.70312V7.6108C97.8906 7.99148 97.9602 8.31818 98.0994 8.59091C98.2386 8.8608 98.4332 9.06818 98.6832 9.21307C98.9332 9.35511 99.2258 9.42614 99.561 9.42614C99.7855 9.42614 99.9886 9.39489 100.17 9.33239C100.352 9.26705 100.51 9.17188 100.643 9.04688C100.777 8.92188 100.878 8.76705 100.946 8.58239L102.386 8.74432C102.295 9.125 102.122 9.45739 101.866 9.74148C101.614 10.0227 101.29 10.2415 100.895 10.3977C100.5 10.5511 100.048 10.6278 99.5397 10.6278ZM110.385 1.77273V10.5H108.804V3.31108H108.752L106.711 4.61506V3.16619L108.88 1.77273H110.385Z' fill='%23A54EEA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M11.9706 75.6967C14.3941 74.8328 17.031 74.7707 19.4924 75.5195C21.9539 76.2682 24.1095 77.7883 25.6413 79.8554C26.6665 81.2389 27.376 82.8184 27.7331 84.4832L30.2195 81.3753L31.7812 82.6247L27.7812 87.6247L27.2085 88.3406L26.4456 87.8321L20.4456 83.8321L21.555 82.1679L25.7972 84.996C25.5064 83.5744 24.9079 82.2249 24.0344 81.0462C22.7579 79.3236 20.9616 78.0569 18.9104 77.4329C16.8592 76.8089 14.6617 76.8607 12.6422 77.5806C10.6227 78.3005 8.88798 79.6504 7.69404 81.4312L6.03284 80.3175C7.46558 78.1805 9.5472 76.5606 11.9706 75.6967ZM4.21896 86.3753L0.218964 91.3753L1.7807 92.6247L4.26691 89.5169C4.62404 91.1817 5.33349 92.7611 6.3587 94.1446C7.89051 96.2117 10.0461 97.7318 12.5076 98.4805C14.969 99.2293 17.6059 99.1672 20.0294 98.3033C22.4528 97.4394 24.5344 95.8195 25.9671 93.6825L24.306 92.5688C23.112 94.3496 21.3773 95.6995 19.3578 96.4194C17.3383 97.1393 15.1408 97.1911 13.0896 96.5671C11.0384 95.9431 9.24209 94.6764 7.96558 92.9538C7.09205 91.775 6.4936 90.4255 6.20281 89.0038L10.4451 91.832L11.5545 90.1679L5.55453 86.1679L4.79169 85.6594L4.21896 86.3753Z' fill='%235C5C5C'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_135_6004' x='54' y='30.5' width='222' height='165' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='20'/%3E%3CfeGaussianBlur stdDeviation='7.5'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_135_6004'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_135_6004' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_135_6004'%3E%3Crect x='70' y='31.5' width='190' height='128' rx='2' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
}

.figma-light .svg3 {
	margin-top: -6px;
	margin-left: -95px;
    width: 431px;
    height: 223px;
   background-image: url("data:image/svg+xml,%3Csvg width='431' height='223' viewBox='0 0 431 223' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='4' y='21' width='180' height='129' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 0L3.375 2.625L6 5.25L8.625 2.625L6 0ZM6 6.75L3.375 9.375L6 12L8.625 9.375L6 6.75ZM0 6L2.625 3.375L5.25 6L2.625 8.625L0 6ZM9.375 3.375L6.75 6L9.375 8.625L12 6L9.375 3.375Z' fill='%23A54EEA'/%3E%3Cpath d='M15.4773 2.59801V1.27273H22.4403V2.59801H19.7429V10H18.1747V2.59801H15.4773ZM24.7674 10.1321C24.3526 10.1321 23.979 10.0582 23.6466 9.91051C23.3171 9.75994 23.0557 9.53835 22.8626 9.24574C22.6722 8.95312 22.577 8.59233 22.577 8.16335C22.577 7.79403 22.6452 7.48864 22.7816 7.24716C22.918 7.00568 23.104 6.8125 23.3398 6.66761C23.5756 6.52273 23.8413 6.41335 24.1367 6.33949C24.435 6.26278 24.7432 6.20739 25.0614 6.1733C25.4449 6.13352 25.756 6.09801 25.9947 6.06676C26.2333 6.03267 26.4066 5.98153 26.5145 5.91335C26.6253 5.84233 26.6807 5.73295 26.6807 5.58523V5.55966C26.6807 5.23864 26.5856 4.99006 26.3952 4.81392C26.2049 4.63778 25.9307 4.54972 25.5728 4.54972C25.1949 4.54972 24.8952 4.6321 24.6736 4.79688C24.4549 4.96165 24.3072 5.15625 24.2305 5.38068L22.7901 5.17614C22.9037 4.77841 23.0913 4.44602 23.3526 4.17898C23.614 3.90909 23.9336 3.70739 24.3114 3.57386C24.6893 3.4375 25.1069 3.36932 25.5643 3.36932C25.8796 3.36932 26.1935 3.40625 26.506 3.48011C26.8185 3.55398 27.104 3.67614 27.3626 3.84659C27.6211 4.0142 27.8285 4.2429 27.9847 4.53267C28.1438 4.82244 28.2234 5.18466 28.2234 5.61932V10H26.7404V9.10085H26.6893C26.5955 9.28267 26.4634 9.45312 26.293 9.61222C26.1253 9.76847 25.9137 9.89489 25.658 9.99148C25.4052 10.0852 25.1083 10.1321 24.7674 10.1321ZM25.168 8.99858C25.4776 8.99858 25.7461 8.9375 25.9734 8.81534C26.2006 8.69034 26.3753 8.52557 26.4975 8.32102C26.6225 8.11648 26.685 7.89347 26.685 7.65199V6.88068C26.6367 6.92045 26.5543 6.95739 26.4378 6.99148C26.3242 7.02557 26.1964 7.0554 26.0543 7.08097C25.9123 7.10653 25.7716 7.12926 25.6324 7.14915C25.4932 7.16903 25.3725 7.18608 25.2702 7.20028C25.0401 7.23153 24.8341 7.28267 24.6523 7.35369C24.4705 7.42472 24.327 7.52415 24.2219 7.65199C24.1168 7.77699 24.0643 7.93892 24.0643 8.13778C24.0643 8.42188 24.168 8.63636 24.3753 8.78125C24.5827 8.92614 24.8469 8.99858 25.168 8.99858ZM29.9027 10V1.27273H31.4453V4.53693H31.5092C31.5887 4.37784 31.701 4.20881 31.8459 4.02983C31.9907 3.84801 32.1868 3.69318 32.4339 3.56534C32.6811 3.43466 32.9964 3.36932 33.3799 3.36932C33.8856 3.36932 34.3416 3.49858 34.7478 3.7571C35.1569 4.01278 35.4808 4.39205 35.7194 4.89489C35.9609 5.39489 36.0816 6.00852 36.0816 6.7358C36.0816 7.45455 35.9638 8.06534 35.728 8.56818C35.4922 9.07102 35.1711 9.45455 34.7649 9.71875C34.3586 9.98295 33.8984 10.1151 33.3842 10.1151C33.0092 10.1151 32.6981 10.0526 32.451 9.92756C32.2038 9.80256 32.0049 9.65199 31.8544 9.47585C31.7066 9.29687 31.5916 9.12784 31.5092 8.96875H31.4197V10H29.9027ZM31.4155 6.72727C31.4155 7.15057 31.4751 7.52131 31.5944 7.83949C31.7166 8.15767 31.8913 8.40625 32.1186 8.58523C32.3487 8.76136 32.6271 8.84943 32.9538 8.84943C33.2947 8.84943 33.5802 8.75852 33.8103 8.5767C34.0405 8.39205 34.2138 8.14062 34.3302 7.82244C34.4495 7.50142 34.5092 7.13636 34.5092 6.72727C34.5092 6.32102 34.451 5.96023 34.3345 5.64489C34.218 5.32955 34.0447 5.08239 33.8146 4.90341C33.5845 4.72443 33.2976 4.63494 32.9538 4.63494C32.6243 4.63494 32.3444 4.72159 32.1143 4.89489C31.8842 5.06818 31.7095 5.31108 31.5902 5.62358C31.4737 5.93608 31.4155 6.30398 31.4155 6.72727ZM38.9957 1.27273V10H37.4531V1.27273H38.9957ZM43.5397 10.1278C42.8835 10.1278 42.3167 9.99148 41.8394 9.71875C41.365 9.44318 40.9999 9.05398 40.7443 8.55114C40.4886 8.04545 40.3607 7.45028 40.3607 6.76562C40.3607 6.09233 40.4886 5.50142 40.7443 4.9929C41.0028 4.48153 41.3636 4.08381 41.8266 3.79972C42.2897 3.51278 42.8337 3.36932 43.4587 3.36932C43.8622 3.36932 44.2428 3.43466 44.6008 3.56534C44.9616 3.69318 45.2798 3.89205 45.5553 4.16193C45.8338 4.43182 46.0525 4.77557 46.2116 5.19318C46.3707 5.60795 46.4502 6.10227 46.4502 6.67614V7.14915H41.0852V6.10938H44.9715C44.9687 5.81392 44.9048 5.55114 44.7798 5.32102C44.6548 5.08807 44.4801 4.90483 44.2556 4.77131C44.034 4.63778 43.7755 4.57102 43.4801 4.57102C43.1647 4.57102 42.8877 4.64773 42.6491 4.80114C42.4105 4.9517 42.2244 5.15057 42.0909 5.39773C41.9602 5.64205 41.8934 5.91051 41.8906 6.20312V7.1108C41.8906 7.49148 41.9602 7.81818 42.0994 8.09091C42.2386 8.3608 42.4332 8.56818 42.6832 8.71307C42.9332 8.85511 43.2258 8.92614 43.561 8.92614C43.7855 8.92614 43.9886 8.89489 44.1704 8.83239C44.3522 8.76705 44.5099 8.67188 44.6434 8.54688C44.7769 8.42188 44.8778 8.26705 44.946 8.08239L46.3863 8.24432C46.2954 8.625 46.1221 8.95739 45.8664 9.24148C45.6136 9.52273 45.2897 9.74148 44.8948 9.89773C44.4999 10.0511 44.0482 10.1278 43.5397 10.1278ZM54.3845 1.27273V10H52.8035V2.81108H52.7524L50.7112 4.11506V2.66619L52.8802 1.27273H54.3845Z' fill='%23A54EEA'/%3E%3Cg filter='url(%23filter0_d_135_6566)'%3E%3Cg clip-path='url(%23clip0_135_6566)'%3E%3Crect x='14' y='31.1667' width='160' height='109' rx='2' fill='white'/%3E%3Crect width='80' height='36.3333' transform='translate(14 31.1667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='31.1667' width='80' height='36.3333' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 31.1667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='31.1667' width='80' height='36.3333' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 67.5001)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='67.5001' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 67.5001)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='67.5001' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 103.833)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='103.833' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 103.833)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='103.833' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='31.1667' width='160' height='109' rx='2' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Cg filter='url(%23filter1_d_135_6566)'%3E%3Cg clip-path='url(%23clip1_135_6566)'%3E%3Crect x='257' y='85' width='160' height='109' rx='8' fill='%23FFF4F4'/%3E%3Crect width='80' height='36.3333' transform='translate(257 85)' fill='white' fill-opacity='0.01'/%3E%3Crect x='257' y='85' width='80' height='36.3333' fill='%23FFDDDD' stroke='%23FF678C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(337 85)' fill='white' fill-opacity='0.01'/%3E%3Crect x='337' y='85' width='80' height='36.3333' fill='%23FFDDDD' stroke='%23FF678C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(257 121.333)' fill='white' fill-opacity='0.01'/%3E%3Crect x='257' y='121.333' width='80' height='36.3333' stroke='%23FF678C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(337 121.333)' fill='white' fill-opacity='0.01'/%3E%3Crect x='337' y='121.333' width='80' height='36.3333' stroke='%23FF678C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(257 157.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='257' y='157.667' width='80' height='36.3333' stroke='%23FF678C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(337 157.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='337' y='157.667' width='80' height='36.3333' stroke='%23FF678C' stroke-width='2'/%3E%3C/g%3E%3Crect x='257' y='85' width='160' height='109' rx='8' stroke='%23FF678C' stroke-width='2'/%3E%3C/g%3E%3Crect x='247' y='75' width='180' height='129' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M249 54L246.375 56.625L249 59.25L251.625 56.625L249 54ZM249 60.75L246.375 63.375L249 66L251.625 63.375L249 60.75ZM243 60L245.625 57.375L248.25 60L245.625 62.625L243 60ZM252.375 57.375L249.75 60L252.375 62.625L255 60L252.375 57.375Z' fill='%23A54EEA'/%3E%3Cpath d='M258.477 56.598V55.2727H265.44V56.598H262.743V64H261.175V56.598H258.477ZM267.767 64.1321C267.353 64.1321 266.979 64.0582 266.647 63.9105C266.317 63.7599 266.056 63.5384 265.863 63.2457C265.672 62.9531 265.577 62.5923 265.577 62.1634C265.577 61.794 265.645 61.4886 265.782 61.2472C265.918 61.0057 266.104 60.8125 266.34 60.6676C266.576 60.5227 266.841 60.4134 267.137 60.3395C267.435 60.2628 267.743 60.2074 268.061 60.1733C268.445 60.1335 268.756 60.098 268.995 60.0668C269.233 60.0327 269.407 59.9815 269.515 59.9134C269.625 59.8423 269.681 59.733 269.681 59.5852V59.5597C269.681 59.2386 269.586 58.9901 269.395 58.8139C269.205 58.6378 268.931 58.5497 268.573 58.5497C268.195 58.5497 267.895 58.6321 267.674 58.7969C267.455 58.9616 267.307 59.1562 267.23 59.3807L265.79 59.1761C265.904 58.7784 266.091 58.446 266.353 58.179C266.614 57.9091 266.934 57.7074 267.311 57.5739C267.689 57.4375 268.107 57.3693 268.564 57.3693C268.88 57.3693 269.194 57.4062 269.506 57.4801C269.819 57.554 270.104 57.6761 270.363 57.8466C270.621 58.0142 270.828 58.2429 270.985 58.5327C271.144 58.8224 271.223 59.1847 271.223 59.6193V64H269.74V63.1009H269.689C269.596 63.2827 269.463 63.4531 269.293 63.6122C269.125 63.7685 268.914 63.8949 268.658 63.9915C268.405 64.0852 268.108 64.1321 267.767 64.1321ZM268.168 62.9986C268.478 62.9986 268.746 62.9375 268.973 62.8153C269.201 62.6903 269.375 62.5256 269.497 62.321C269.622 62.1165 269.685 61.8935 269.685 61.652V60.8807C269.637 60.9205 269.554 60.9574 269.438 60.9915C269.324 61.0256 269.196 61.0554 269.054 61.081C268.912 61.1065 268.772 61.1293 268.632 61.1491C268.493 61.169 268.373 61.1861 268.27 61.2003C268.04 61.2315 267.834 61.2827 267.652 61.3537C267.471 61.4247 267.327 61.5241 267.222 61.652C267.117 61.777 267.064 61.9389 267.064 62.1378C267.064 62.4219 267.168 62.6364 267.375 62.7812C267.583 62.9261 267.847 62.9986 268.168 62.9986ZM272.903 64V55.2727H274.445V58.5369H274.509C274.589 58.3778 274.701 58.2088 274.846 58.0298C274.991 57.848 275.187 57.6932 275.434 57.5653C275.681 57.4347 275.996 57.3693 276.38 57.3693C276.886 57.3693 277.342 57.4986 277.748 57.7571C278.157 58.0128 278.481 58.392 278.719 58.8949C278.961 59.3949 279.082 60.0085 279.082 60.7358C279.082 61.4545 278.964 62.0653 278.728 62.5682C278.492 63.071 278.171 63.4545 277.765 63.7188C277.359 63.983 276.898 64.1151 276.384 64.1151C276.009 64.1151 275.698 64.0526 275.451 63.9276C275.204 63.8026 275.005 63.652 274.854 63.4759C274.707 63.2969 274.592 63.1278 274.509 62.9688H274.42V64H272.903ZM274.415 60.7273C274.415 61.1506 274.475 61.5213 274.594 61.8395C274.717 62.1577 274.891 62.4062 275.119 62.5852C275.349 62.7614 275.627 62.8494 275.954 62.8494C276.295 62.8494 276.58 62.7585 276.81 62.5767C277.04 62.392 277.214 62.1406 277.33 61.8224C277.45 61.5014 277.509 61.1364 277.509 60.7273C277.509 60.321 277.451 59.9602 277.334 59.6449C277.218 59.3295 277.045 59.0824 276.815 58.9034C276.584 58.7244 276.298 58.6349 275.954 58.6349C275.624 58.6349 275.344 58.7216 275.114 58.8949C274.884 59.0682 274.709 59.3111 274.59 59.6236C274.474 59.9361 274.415 60.304 274.415 60.7273ZM281.996 55.2727V64H280.453V55.2727H281.996ZM286.54 64.1278C285.883 64.1278 285.317 63.9915 284.839 63.7188C284.365 63.4432 284 63.054 283.744 62.5511C283.489 62.0455 283.361 61.4503 283.361 60.7656C283.361 60.0923 283.489 59.5014 283.744 58.9929C284.003 58.4815 284.364 58.0838 284.827 57.7997C285.29 57.5128 285.834 57.3693 286.459 57.3693C286.862 57.3693 287.243 57.4347 287.601 57.5653C287.962 57.6932 288.28 57.892 288.555 58.1619C288.834 58.4318 289.053 58.7756 289.212 59.1932C289.371 59.608 289.45 60.1023 289.45 60.6761V61.1491H284.085V60.1094H287.972C287.969 59.8139 287.905 59.5511 287.78 59.321C287.655 59.0881 287.48 58.9048 287.256 58.7713C287.034 58.6378 286.776 58.571 286.48 58.571C286.165 58.571 285.888 58.6477 285.649 58.8011C285.41 58.9517 285.224 59.1506 285.091 59.3977C284.96 59.642 284.893 59.9105 284.891 60.2031V61.1108C284.891 61.4915 284.96 61.8182 285.099 62.0909C285.239 62.3608 285.433 62.5682 285.683 62.7131C285.933 62.8551 286.226 62.9261 286.561 62.9261C286.785 62.9261 286.989 62.8949 287.17 62.8324C287.352 62.767 287.51 62.6719 287.643 62.5469C287.777 62.4219 287.878 62.267 287.946 62.0824L289.386 62.2443C289.295 62.625 289.122 62.9574 288.866 63.2415C288.614 63.5227 288.29 63.7415 287.895 63.8977C287.5 64.0511 287.048 64.1278 286.54 64.1278ZM293.835 64V62.858L296.865 59.8878C297.154 59.5952 297.396 59.3352 297.589 59.108C297.782 58.8807 297.927 58.6605 298.024 58.4474C298.12 58.2344 298.169 58.0071 298.169 57.7656C298.169 57.4901 298.106 57.2543 297.981 57.0582C297.856 56.8594 297.684 56.706 297.465 56.598C297.247 56.4901 296.998 56.4361 296.72 56.4361C296.433 56.4361 296.181 56.4957 295.965 56.6151C295.75 56.7315 295.582 56.8977 295.463 57.1136C295.346 57.3295 295.288 57.5866 295.288 57.8849H293.784C293.784 57.331 293.91 56.8494 294.163 56.4403C294.416 56.0312 294.764 55.7145 295.207 55.4901C295.653 55.2656 296.164 55.1534 296.741 55.1534C297.326 55.1534 297.84 55.2628 298.284 55.4815C298.727 55.7003 299.071 56 299.315 56.3807C299.562 56.7614 299.686 57.196 299.686 57.6847C299.686 58.0114 299.623 58.3324 299.498 58.6477C299.373 58.9631 299.153 59.3125 298.838 59.696C298.525 60.0795 298.086 60.544 297.521 61.0895L296.017 62.6193V62.679H299.818V64H293.835Z' fill='%23A54EEA'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_135_6566' x='1' y='30.1667' width='186' height='139' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_135_6566'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_135_6566' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_135_6566' x='244' y='84' width='186' height='139' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_135_6566'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_135_6566' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_135_6566'%3E%3Crect x='14' y='31.1667' width='160' height='109' rx='2' fill='white'/%3E%3C/clipPath%3E%3CclipPath id='clip1_135_6566'%3E%3Crect x='257' y='85' width='160' height='109' rx='8' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
}

.figma-dark .svg3 {
	margin-top: -6px;
	margin-left: -95px;
    width: 431px;
    height: 223px;
	background-image: url("data:image/svg+xml,%3Csvg width='429' height='223' viewBox='0 0 429 223' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='4' y='21' width='180' height='129' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 0L3.375 2.625L6 5.25L8.625 2.625L6 0ZM6 6.75L3.375 9.375L6 12L8.625 9.375L6 6.75ZM0 6L2.625 3.375L5.25 6L2.625 8.625L0 6ZM9.375 3.375L6.75 6L9.375 8.625L12 6L9.375 3.375Z' fill='%23A54EEA'/%3E%3Cpath d='M15.4773 2.59801V1.27273H22.4403V2.59801H19.7429V10H18.1747V2.59801H15.4773ZM24.7674 10.1321C24.3526 10.1321 23.979 10.0582 23.6466 9.91051C23.3171 9.75994 23.0557 9.53835 22.8626 9.24574C22.6722 8.95312 22.577 8.59233 22.577 8.16335C22.577 7.79403 22.6452 7.48864 22.7816 7.24716C22.918 7.00568 23.104 6.8125 23.3398 6.66761C23.5756 6.52273 23.8413 6.41335 24.1367 6.33949C24.435 6.26278 24.7432 6.20739 25.0614 6.1733C25.4449 6.13352 25.756 6.09801 25.9947 6.06676C26.2333 6.03267 26.4066 5.98153 26.5145 5.91335C26.6253 5.84233 26.6807 5.73295 26.6807 5.58523V5.55966C26.6807 5.23864 26.5856 4.99006 26.3952 4.81392C26.2049 4.63778 25.9307 4.54972 25.5728 4.54972C25.1949 4.54972 24.8952 4.6321 24.6736 4.79688C24.4549 4.96165 24.3072 5.15625 24.2305 5.38068L22.7901 5.17614C22.9037 4.77841 23.0913 4.44602 23.3526 4.17898C23.614 3.90909 23.9336 3.70739 24.3114 3.57386C24.6893 3.4375 25.1069 3.36932 25.5643 3.36932C25.8796 3.36932 26.1935 3.40625 26.506 3.48011C26.8185 3.55398 27.104 3.67614 27.3626 3.84659C27.6211 4.0142 27.8285 4.2429 27.9847 4.53267C28.1438 4.82244 28.2234 5.18466 28.2234 5.61932V10H26.7404V9.10085H26.6893C26.5955 9.28267 26.4634 9.45312 26.293 9.61222C26.1253 9.76847 25.9137 9.89489 25.658 9.99148C25.4052 10.0852 25.1083 10.1321 24.7674 10.1321ZM25.168 8.99858C25.4776 8.99858 25.7461 8.9375 25.9734 8.81534C26.2006 8.69034 26.3753 8.52557 26.4975 8.32102C26.6225 8.11648 26.685 7.89347 26.685 7.65199V6.88068C26.6367 6.92045 26.5543 6.95739 26.4378 6.99148C26.3242 7.02557 26.1964 7.0554 26.0543 7.08097C25.9123 7.10653 25.7716 7.12926 25.6324 7.14915C25.4932 7.16903 25.3725 7.18608 25.2702 7.20028C25.0401 7.23153 24.8341 7.28267 24.6523 7.35369C24.4705 7.42472 24.327 7.52415 24.2219 7.65199C24.1168 7.77699 24.0643 7.93892 24.0643 8.13778C24.0643 8.42188 24.168 8.63636 24.3753 8.78125C24.5827 8.92614 24.8469 8.99858 25.168 8.99858ZM29.9027 10V1.27273H31.4453V4.53693H31.5092C31.5887 4.37784 31.701 4.20881 31.8459 4.02983C31.9907 3.84801 32.1868 3.69318 32.4339 3.56534C32.6811 3.43466 32.9964 3.36932 33.3799 3.36932C33.8856 3.36932 34.3416 3.49858 34.7478 3.7571C35.1569 4.01278 35.4808 4.39205 35.7194 4.89489C35.9609 5.39489 36.0816 6.00852 36.0816 6.7358C36.0816 7.45455 35.9638 8.06534 35.728 8.56818C35.4922 9.07102 35.1711 9.45455 34.7649 9.71875C34.3586 9.98295 33.8984 10.1151 33.3842 10.1151C33.0092 10.1151 32.6981 10.0526 32.451 9.92756C32.2038 9.80256 32.0049 9.65199 31.8544 9.47585C31.7066 9.29687 31.5916 9.12784 31.5092 8.96875H31.4197V10H29.9027ZM31.4155 6.72727C31.4155 7.15057 31.4751 7.52131 31.5944 7.83949C31.7166 8.15767 31.8913 8.40625 32.1186 8.58523C32.3487 8.76136 32.6271 8.84943 32.9538 8.84943C33.2947 8.84943 33.5802 8.75852 33.8103 8.5767C34.0405 8.39205 34.2138 8.14062 34.3302 7.82244C34.4495 7.50142 34.5092 7.13636 34.5092 6.72727C34.5092 6.32102 34.451 5.96023 34.3345 5.64489C34.218 5.32955 34.0447 5.08239 33.8146 4.90341C33.5845 4.72443 33.2976 4.63494 32.9538 4.63494C32.6243 4.63494 32.3444 4.72159 32.1143 4.89489C31.8842 5.06818 31.7095 5.31108 31.5902 5.62358C31.4737 5.93608 31.4155 6.30398 31.4155 6.72727ZM38.9957 1.27273V10H37.4531V1.27273H38.9957ZM43.5397 10.1278C42.8835 10.1278 42.3167 9.99148 41.8394 9.71875C41.365 9.44318 40.9999 9.05398 40.7443 8.55114C40.4886 8.04545 40.3607 7.45028 40.3607 6.76562C40.3607 6.09233 40.4886 5.50142 40.7443 4.9929C41.0028 4.48153 41.3636 4.08381 41.8266 3.79972C42.2897 3.51278 42.8337 3.36932 43.4587 3.36932C43.8622 3.36932 44.2428 3.43466 44.6008 3.56534C44.9616 3.69318 45.2798 3.89205 45.5553 4.16193C45.8338 4.43182 46.0525 4.77557 46.2116 5.19318C46.3707 5.60795 46.4502 6.10227 46.4502 6.67614V7.14915H41.0852V6.10938H44.9715C44.9687 5.81392 44.9048 5.55114 44.7798 5.32102C44.6548 5.08807 44.4801 4.90483 44.2556 4.77131C44.034 4.63778 43.7755 4.57102 43.4801 4.57102C43.1647 4.57102 42.8877 4.64773 42.6491 4.80114C42.4105 4.9517 42.2244 5.15057 42.0909 5.39773C41.9602 5.64205 41.8934 5.91051 41.8906 6.20312V7.1108C41.8906 7.49148 41.9602 7.81818 42.0994 8.09091C42.2386 8.3608 42.4332 8.56818 42.6832 8.71307C42.9332 8.85511 43.2258 8.92614 43.561 8.92614C43.7855 8.92614 43.9886 8.89489 44.1704 8.83239C44.3522 8.76705 44.5099 8.67188 44.6434 8.54688C44.7769 8.42188 44.8778 8.26705 44.946 8.08239L46.3863 8.24432C46.2954 8.625 46.1221 8.95739 45.8664 9.24148C45.6136 9.52273 45.2897 9.74148 44.8948 9.89773C44.4999 10.0511 44.0482 10.1278 43.5397 10.1278ZM54.3845 1.27273V10H52.8035V2.81108H52.7524L50.7112 4.11506V2.66619L52.8802 1.27273H54.3845Z' fill='%23A54EEA'/%3E%3Cg filter='url(%23filter0_d_30_313)'%3E%3Cg clip-path='url(%23clip0_30_313)'%3E%3Crect x='14' y='31.1667' width='160' height='109' rx='2' fill='%232D2D2C'/%3E%3Crect width='80' height='36.3333' transform='translate(14 31.1667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='31.1667' width='80' height='36.3333' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 31.1667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='31.1667' width='80' height='36.3333' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 67.5001)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='67.5001' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 67.5001)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='67.5001' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 103.833)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='103.833' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 103.833)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='103.833' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='31.1667' width='160' height='109' rx='2' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Cg filter='url(%23filter1_d_30_313)'%3E%3Cg clip-path='url(%23clip1_30_313)'%3E%3Crect x='255' y='85' width='160' height='109' rx='8' fill='%23322222'/%3E%3Crect width='80' height='36.3333' transform='translate(255 85)' fill='white' fill-opacity='0.01'/%3E%3Crect x='255' y='85' width='80' height='36.3333' fill='%236F3737' stroke='%23FF678C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(335 85)' fill='white' fill-opacity='0.01'/%3E%3Crect x='335' y='85' width='80' height='36.3333' fill='%236F3737' stroke='%23FF678C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(255 121.333)' fill='white' fill-opacity='0.01'/%3E%3Crect x='255' y='121.333' width='80' height='36.3333' stroke='%23FF678C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(335 121.333)' fill='white' fill-opacity='0.01'/%3E%3Crect x='335' y='121.333' width='80' height='36.3333' stroke='%23FF678C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(255 157.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='255' y='157.667' width='80' height='36.3333' stroke='%23FF678C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(335 157.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='335' y='157.667' width='80' height='36.3333' stroke='%23FF678C' stroke-width='2'/%3E%3C/g%3E%3Crect x='255' y='85' width='160' height='109' rx='8' stroke='%23FF678C' stroke-width='2'/%3E%3C/g%3E%3Crect x='245' y='75' width='180' height='129' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M247 54L244.375 56.625L247 59.25L249.625 56.625L247 54ZM247 60.75L244.375 63.375L247 66L249.625 63.375L247 60.75ZM241 60L243.625 57.375L246.25 60L243.625 62.625L241 60ZM250.375 57.375L247.75 60L250.375 62.625L253 60L250.375 57.375Z' fill='%23A54EEA'/%3E%3Cpath d='M256.477 56.598V55.2727H263.44V56.598H260.743V64H259.175V56.598H256.477ZM265.767 64.1321C265.353 64.1321 264.979 64.0582 264.647 63.9105C264.317 63.7599 264.056 63.5384 263.863 63.2457C263.672 62.9531 263.577 62.5923 263.577 62.1634C263.577 61.794 263.645 61.4886 263.782 61.2472C263.918 61.0057 264.104 60.8125 264.34 60.6676C264.576 60.5227 264.841 60.4134 265.137 60.3395C265.435 60.2628 265.743 60.2074 266.061 60.1733C266.445 60.1335 266.756 60.098 266.995 60.0668C267.233 60.0327 267.407 59.9815 267.515 59.9134C267.625 59.8423 267.681 59.733 267.681 59.5852V59.5597C267.681 59.2386 267.586 58.9901 267.395 58.8139C267.205 58.6378 266.931 58.5497 266.573 58.5497C266.195 58.5497 265.895 58.6321 265.674 58.7969C265.455 58.9616 265.307 59.1562 265.23 59.3807L263.79 59.1761C263.904 58.7784 264.091 58.446 264.353 58.179C264.614 57.9091 264.934 57.7074 265.311 57.5739C265.689 57.4375 266.107 57.3693 266.564 57.3693C266.88 57.3693 267.194 57.4062 267.506 57.4801C267.819 57.554 268.104 57.6761 268.363 57.8466C268.621 58.0142 268.828 58.2429 268.985 58.5327C269.144 58.8224 269.223 59.1847 269.223 59.6193V64H267.74V63.1009H267.689C267.596 63.2827 267.463 63.4531 267.293 63.6122C267.125 63.7685 266.914 63.8949 266.658 63.9915C266.405 64.0852 266.108 64.1321 265.767 64.1321ZM266.168 62.9986C266.478 62.9986 266.746 62.9375 266.973 62.8153C267.201 62.6903 267.375 62.5256 267.497 62.321C267.622 62.1165 267.685 61.8935 267.685 61.652V60.8807C267.637 60.9205 267.554 60.9574 267.438 60.9915C267.324 61.0256 267.196 61.0554 267.054 61.081C266.912 61.1065 266.772 61.1293 266.632 61.1491C266.493 61.169 266.373 61.1861 266.27 61.2003C266.04 61.2315 265.834 61.2827 265.652 61.3537C265.471 61.4247 265.327 61.5241 265.222 61.652C265.117 61.777 265.064 61.9389 265.064 62.1378C265.064 62.4219 265.168 62.6364 265.375 62.7812C265.583 62.9261 265.847 62.9986 266.168 62.9986ZM270.903 64V55.2727H272.445V58.5369H272.509C272.589 58.3778 272.701 58.2088 272.846 58.0298C272.991 57.848 273.187 57.6932 273.434 57.5653C273.681 57.4347 273.996 57.3693 274.38 57.3693C274.886 57.3693 275.342 57.4986 275.748 57.7571C276.157 58.0128 276.481 58.392 276.719 58.8949C276.961 59.3949 277.082 60.0085 277.082 60.7358C277.082 61.4545 276.964 62.0653 276.728 62.5682C276.492 63.071 276.171 63.4545 275.765 63.7188C275.359 63.983 274.898 64.1151 274.384 64.1151C274.009 64.1151 273.698 64.0526 273.451 63.9276C273.204 63.8026 273.005 63.652 272.854 63.4759C272.707 63.2969 272.592 63.1278 272.509 62.9688H272.42V64H270.903ZM272.415 60.7273C272.415 61.1506 272.475 61.5213 272.594 61.8395C272.717 62.1577 272.891 62.4062 273.119 62.5852C273.349 62.7614 273.627 62.8494 273.954 62.8494C274.295 62.8494 274.58 62.7585 274.81 62.5767C275.04 62.392 275.214 62.1406 275.33 61.8224C275.45 61.5014 275.509 61.1364 275.509 60.7273C275.509 60.321 275.451 59.9602 275.334 59.6449C275.218 59.3295 275.045 59.0824 274.815 58.9034C274.584 58.7244 274.298 58.6349 273.954 58.6349C273.624 58.6349 273.344 58.7216 273.114 58.8949C272.884 59.0682 272.709 59.3111 272.59 59.6236C272.474 59.9361 272.415 60.304 272.415 60.7273ZM279.996 55.2727V64H278.453V55.2727H279.996ZM284.54 64.1278C283.883 64.1278 283.317 63.9915 282.839 63.7188C282.365 63.4432 282 63.054 281.744 62.5511C281.489 62.0455 281.361 61.4503 281.361 60.7656C281.361 60.0923 281.489 59.5014 281.744 58.9929C282.003 58.4815 282.364 58.0838 282.827 57.7997C283.29 57.5128 283.834 57.3693 284.459 57.3693C284.862 57.3693 285.243 57.4347 285.601 57.5653C285.962 57.6932 286.28 57.892 286.555 58.1619C286.834 58.4318 287.053 58.7756 287.212 59.1932C287.371 59.608 287.45 60.1023 287.45 60.6761V61.1491H282.085V60.1094H285.972C285.969 59.8139 285.905 59.5511 285.78 59.321C285.655 59.0881 285.48 58.9048 285.256 58.7713C285.034 58.6378 284.776 58.571 284.48 58.571C284.165 58.571 283.888 58.6477 283.649 58.8011C283.41 58.9517 283.224 59.1506 283.091 59.3977C282.96 59.642 282.893 59.9105 282.891 60.2031V61.1108C282.891 61.4915 282.96 61.8182 283.099 62.0909C283.239 62.3608 283.433 62.5682 283.683 62.7131C283.933 62.8551 284.226 62.9261 284.561 62.9261C284.785 62.9261 284.989 62.8949 285.17 62.8324C285.352 62.767 285.51 62.6719 285.643 62.5469C285.777 62.4219 285.878 62.267 285.946 62.0824L287.386 62.2443C287.295 62.625 287.122 62.9574 286.866 63.2415C286.614 63.5227 286.29 63.7415 285.895 63.8977C285.5 64.0511 285.048 64.1278 284.54 64.1278ZM291.835 64V62.858L294.865 59.8878C295.154 59.5952 295.396 59.3352 295.589 59.108C295.782 58.8807 295.927 58.6605 296.024 58.4474C296.12 58.2344 296.169 58.0071 296.169 57.7656C296.169 57.4901 296.106 57.2543 295.981 57.0582C295.856 56.8594 295.684 56.706 295.465 56.598C295.247 56.4901 294.998 56.4361 294.72 56.4361C294.433 56.4361 294.181 56.4957 293.965 56.6151C293.75 56.7315 293.582 56.8977 293.463 57.1136C293.346 57.3295 293.288 57.5866 293.288 57.8849H291.784C291.784 57.331 291.91 56.8494 292.163 56.4403C292.416 56.0312 292.764 55.7145 293.207 55.4901C293.653 55.2656 294.164 55.1534 294.741 55.1534C295.326 55.1534 295.84 55.2628 296.284 55.4815C296.727 55.7003 297.071 56 297.315 56.3807C297.562 56.7614 297.686 57.196 297.686 57.6847C297.686 58.0114 297.623 58.3324 297.498 58.6477C297.373 58.9631 297.153 59.3125 296.838 59.696C296.525 60.0795 296.086 60.544 295.521 61.0895L294.017 62.6193V62.679H297.818V64H291.835Z' fill='%23A54EEA'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_30_313' x='1' y='30.1667' width='186' height='139' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_30_313'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_30_313' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_30_313' x='242' y='84' width='186' height='139' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_30_313'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_30_313' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_30_313'%3E%3Crect x='14' y='31.1667' width='160' height='109' rx='2' fill='white'/%3E%3C/clipPath%3E%3CclipPath id='clip1_30_313'%3E%3Crect x='255' y='85' width='160' height='109' rx='8' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
}

.figma-light .svg4 {
    width: 197px;
    height: 102px;
	margin-bottom: -16px;
    background-image: url("data:image/svg+xml,%3Csvg width='197' height='102' viewBox='0 0 197 102' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_2_3141)'%3E%3Crect x='122' width='67' height='86' rx='5' fill='white'/%3E%3Crect x='123' y='1' width='65' height='84' rx='4' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='143.1' y='36.1494' width='26' height='20' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='147.1' y='40.1494' width='18' height='12' rx='1' fill='white' stroke='%23CFCFCF' stroke-width='2'/%3E%3Cline x1='156.1' y1='41.1494' x2='156.1' y2='51.1494' stroke='%23CFCFCF'/%3E%3Cline x1='164.1' y1='44.3994' x2='148.1' y2='44.3994' stroke='%23CFCFCF'/%3E%3Cline x1='164.1' y1='47.8994' x2='148.1' y2='47.8994' stroke='%23CFCFCF'/%3E%3Cpath d='M142.342 30.342L142.347 28.1125L140.117 28.1171L140.112 30.3466L142.342 30.342Z' fill='%232F80ED'/%3E%3Crect x='144.656' y='28.1494' width='8' height='2' fill='%232F80ED'/%3E%3Crect x='141.1' y='34.1494' width='4' height='4' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='167.1' y='34.1494' width='4' height='4' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='167.1' y='54.1494' width='4' height='4' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='141.1' y='54.1494' width='4' height='4' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Cg filter='url(%23filter1_d_2_3141)'%3E%3Crect x='8' width='67' height='86' rx='5' fill='white'/%3E%3Crect x='9' y='1' width='65' height='84' rx='4' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='29' y='36' width='26' height='20' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath d='M31 31L29 29L27 31L29 33L31 31Z' fill='%23A54EEA'/%3E%3Crect x='33' y='30' width='8' height='2' fill='%23A54EEA'/%3E%3Crect x='33' y='40' width='18' height='12' rx='1' fill='white' stroke='%23CFCFCF' stroke-width='2'/%3E%3Cline x1='42' y1='41' x2='42' y2='51' stroke='%23CFCFCF'/%3E%3Cline x1='50' y1='44.25' x2='34' y2='44.25' stroke='%23CFCFCF'/%3E%3Cline x1='50' y1='47.75' x2='34' y2='47.75' stroke='%23CFCFCF'/%3E%3Cg filter='url(%23filter2_d_2_3141)'%3E%3Cpath d='M167.709 64.0833L165 50L176.92 57.0417L170.96 58.6667L167.709 64.0833Z' fill='%23010101'/%3E%3Cpath d='M165.276 49.5336L164.241 48.9226L164.468 50.1023L167.177 64.1857L167.445 65.5764L168.174 64.3621L171.313 59.132L177.063 57.5643L178.299 57.2271L177.196 56.5753L165.276 49.5336Z' stroke='white' stroke-width='1.08333' stroke-linecap='square'/%3E%3C/g%3E%3Cg opacity='0.6'%3E%3Cpath d='M110.092 43.3181C103.238 36.4639 92.1255 36.4639 85.2713 43.3181' stroke='%23CFCFCF' stroke-width='3'/%3E%3Cpath d='M107.441 34.057L110.092 43.3181L100.831 45.9697' stroke='%23CFCFCF' stroke-width='3'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_2_3141' x='114' y='0' width='83' height='102' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='8'/%3E%3CfeGaussianBlur stdDeviation='4'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_3141'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_3141' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_2_3141' x='0' y='0' width='83' height='102' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='8'/%3E%3CfeGaussianBlur stdDeviation='4'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_3141'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_3141' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter2_d_2_3141' x='160.232' y='45.6785' width='22.6958' height='25.7242' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='1.08333'/%3E%3CfeGaussianBlur stdDeviation='1.625'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_3141'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_3141' result='shape'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E%0A");
}

.figma-dark .svg4 {
    width: 197px;
    height: 102px;
	margin-bottom: -16px;
    background-image: url("data:image/svg+xml,%3Csvg width='197' height='102' viewBox='0 0 197 102' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_135_5967)'%3E%3Crect x='122' width='67' height='86' rx='5' fill='%232D2D2C'/%3E%3Crect x='123' y='1' width='65' height='84' rx='4' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='143.1' y='36.1494' width='26' height='20' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='147.1' y='40.1494' width='18' height='12' rx='1' fill='%232E2E2D' stroke='%23696969' stroke-width='2'/%3E%3Cline x1='156.1' y1='41.1494' x2='156.1' y2='51.1494' stroke='%23696969'/%3E%3Cline x1='164.1' y1='44.3994' x2='148.1' y2='44.3994' stroke='%23696969'/%3E%3Cline x1='164.1' y1='47.8994' x2='148.1' y2='47.8994' stroke='%23696969'/%3E%3Cpath d='M142.342 30.342L142.347 28.1125L140.117 28.1171L140.112 30.3466L142.342 30.342Z' fill='%232F80ED'/%3E%3Crect x='144.656' y='28.1494' width='8' height='2' fill='%232F80ED'/%3E%3Crect x='141.1' y='34.1494' width='4' height='4' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='167.1' y='34.1494' width='4' height='4' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='167.1' y='54.1494' width='4' height='4' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='141.1' y='54.1494' width='4' height='4' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Cg filter='url(%23filter1_d_135_5967)'%3E%3Crect x='8' width='67' height='86' rx='5' fill='%232D2D2C'/%3E%3Crect x='9' y='1' width='65' height='84' rx='4' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='29' y='36' width='26' height='20' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath d='M31 31L29 29L27 31L29 33L31 31Z' fill='%23A54EEA'/%3E%3Crect x='33' y='30' width='8' height='2' fill='%23A54EEA'/%3E%3Crect x='33' y='40' width='18' height='12' rx='1' fill='%232D2D2C' stroke='%23696969' stroke-width='2'/%3E%3Cline x1='42' y1='41' x2='42' y2='51' stroke='%23696969'/%3E%3Cline x1='50' y1='44.25' x2='34' y2='44.25' stroke='%23696969'/%3E%3Cline x1='50' y1='47.75' x2='34' y2='47.75' stroke='%23696969'/%3E%3Cg filter='url(%23filter2_d_135_5967)'%3E%3Cpath d='M167.709 64.0833L165 50L176.92 57.0417L170.96 58.6667L167.709 64.0833Z' fill='%23010101'/%3E%3Cpath d='M165.276 49.5336L164.241 48.9226L164.468 50.1023L167.177 64.1857L167.445 65.5764L168.174 64.3621L171.313 59.132L177.063 57.5643L178.299 57.2271L177.196 56.5753L165.276 49.5336Z' stroke='white' stroke-width='1.08333' stroke-linecap='square'/%3E%3C/g%3E%3Cg opacity='0.6'%3E%3Cpath d='M110.092 43.3183C103.238 36.4641 92.1255 36.4641 85.2713 43.3183' stroke='%235C5C5C' stroke-width='3'/%3E%3Cpath d='M107.441 34.0571L110.092 43.3182L100.831 45.9698' stroke='%235C5C5C' stroke-width='3'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_135_5967' x='114' y='0' width='83' height='102' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='8'/%3E%3CfeGaussianBlur stdDeviation='4'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_135_5967'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_135_5967' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_135_5967' x='0' y='0' width='83' height='102' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='8'/%3E%3CfeGaussianBlur stdDeviation='4'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_135_5967'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_135_5967' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter2_d_135_5967' x='160.232' y='45.6785' width='22.6957' height='25.7244' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='1.08333'/%3E%3CfeGaussianBlur stdDeviation='1.625'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_135_5967'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_135_5967' result='shape'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E%0A");
}

.figma-light .svg6 {
    width: 188px;
    height: 168px;
    background-image: url("data:image/svg+xml,%3Csvg width='188' height='168' viewBox='0 0 188 168' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_135_3347)'%3E%3Cg clip-path='url(%23clip0_135_3347)'%3E%3Crect x='14' y='31' width='160' height='108' rx='2' fill='white'/%3E%3Crect width='80' height='36' transform='translate(14 31)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='31' width='80' height='36' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(94 31)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='31' width='80' height='36' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(14 67)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='67' width='80' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(94 67)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='67' width='80' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(14 103)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='103' width='80' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(94 103)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='103' width='80' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='31' width='160' height='108' rx='2' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='4' y='21' width='180' height='127' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='18' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='145' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='145' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='18' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 0L3.375 2.625L6 5.25L8.625 2.625L6 0ZM6 6.75L3.375 9.375L6 12L8.625 9.375L6 6.75ZM0 6L2.625 3.375L5.25 6L2.625 8.625L0 6ZM9.375 3.375L6.75 6L9.375 8.625L12 6L9.375 3.375Z' fill='%23A54EEA'/%3E%3Cpath d='M15.4773 2.59801V1.27273H22.4403V2.59801H19.7429V10H18.1747V2.59801H15.4773ZM24.7674 10.1321C24.3526 10.1321 23.979 10.0582 23.6466 9.91051C23.3171 9.75994 23.0557 9.53835 22.8626 9.24574C22.6722 8.95312 22.577 8.59233 22.577 8.16335C22.577 7.79403 22.6452 7.48864 22.7816 7.24716C22.918 7.00568 23.104 6.8125 23.3398 6.66761C23.5756 6.52273 23.8413 6.41335 24.1367 6.33949C24.435 6.26278 24.7432 6.20739 25.0614 6.1733C25.4449 6.13352 25.756 6.09801 25.9947 6.06676C26.2333 6.03267 26.4066 5.98153 26.5145 5.91335C26.6253 5.84233 26.6807 5.73295 26.6807 5.58523V5.55966C26.6807 5.23864 26.5856 4.99006 26.3952 4.81392C26.2049 4.63778 25.9307 4.54972 25.5728 4.54972C25.1949 4.54972 24.8952 4.6321 24.6736 4.79688C24.4549 4.96165 24.3072 5.15625 24.2305 5.38068L22.7901 5.17614C22.9037 4.77841 23.0913 4.44602 23.3526 4.17898C23.614 3.90909 23.9336 3.70739 24.3114 3.57386C24.6893 3.4375 25.1069 3.36932 25.5643 3.36932C25.8796 3.36932 26.1935 3.40625 26.506 3.48011C26.8185 3.55398 27.104 3.67614 27.3626 3.84659C27.6211 4.0142 27.8285 4.2429 27.9847 4.53267C28.1438 4.82244 28.2234 5.18466 28.2234 5.61932V10H26.7404V9.10085H26.6893C26.5955 9.28267 26.4634 9.45312 26.293 9.61222C26.1253 9.76847 25.9137 9.89489 25.658 9.99148C25.4052 10.0852 25.1083 10.1321 24.7674 10.1321ZM25.168 8.99858C25.4776 8.99858 25.7461 8.9375 25.9734 8.81534C26.2006 8.69034 26.3753 8.52557 26.4975 8.32102C26.6225 8.11648 26.685 7.89347 26.685 7.65199V6.88068C26.6367 6.92045 26.5543 6.95739 26.4378 6.99148C26.3242 7.02557 26.1964 7.0554 26.0543 7.08097C25.9123 7.10653 25.7716 7.12926 25.6324 7.14915C25.4932 7.16903 25.3725 7.18608 25.2702 7.20028C25.0401 7.23153 24.8341 7.28267 24.6523 7.35369C24.4705 7.42472 24.327 7.52415 24.2219 7.65199C24.1168 7.77699 24.0643 7.93892 24.0643 8.13778C24.0643 8.42188 24.168 8.63636 24.3753 8.78125C24.5827 8.92614 24.8469 8.99858 25.168 8.99858ZM29.9027 10V1.27273H31.4453V4.53693H31.5092C31.5887 4.37784 31.701 4.20881 31.8459 4.02983C31.9907 3.84801 32.1868 3.69318 32.4339 3.56534C32.6811 3.43466 32.9964 3.36932 33.3799 3.36932C33.8856 3.36932 34.3416 3.49858 34.7478 3.7571C35.1569 4.01278 35.4808 4.39205 35.7194 4.89489C35.9609 5.39489 36.0816 6.00852 36.0816 6.7358C36.0816 7.45455 35.9638 8.06534 35.728 8.56818C35.4922 9.07102 35.1711 9.45455 34.7649 9.71875C34.3586 9.98295 33.8984 10.1151 33.3842 10.1151C33.0092 10.1151 32.6981 10.0526 32.451 9.92756C32.2038 9.80256 32.0049 9.65199 31.8544 9.47585C31.7066 9.29687 31.5916 9.12784 31.5092 8.96875H31.4197V10H29.9027ZM31.4155 6.72727C31.4155 7.15057 31.4751 7.52131 31.5944 7.83949C31.7166 8.15767 31.8913 8.40625 32.1186 8.58523C32.3487 8.76136 32.6271 8.84943 32.9538 8.84943C33.2947 8.84943 33.5802 8.75852 33.8103 8.5767C34.0405 8.39205 34.2138 8.14062 34.3302 7.82244C34.4495 7.50142 34.5092 7.13636 34.5092 6.72727C34.5092 6.32102 34.451 5.96023 34.3345 5.64489C34.218 5.32955 34.0447 5.08239 33.8146 4.90341C33.5845 4.72443 33.2976 4.63494 32.9538 4.63494C32.6243 4.63494 32.3444 4.72159 32.1143 4.89489C31.8842 5.06818 31.7095 5.31108 31.5902 5.62358C31.4737 5.93608 31.4155 6.30398 31.4155 6.72727ZM38.9957 1.27273V10H37.4531V1.27273H38.9957ZM43.5397 10.1278C42.8835 10.1278 42.3167 9.99148 41.8394 9.71875C41.365 9.44318 40.9999 9.05398 40.7443 8.55114C40.4886 8.04545 40.3607 7.45028 40.3607 6.76562C40.3607 6.09233 40.4886 5.50142 40.7443 4.9929C41.0028 4.48153 41.3636 4.08381 41.8266 3.79972C42.2897 3.51278 42.8337 3.36932 43.4587 3.36932C43.8622 3.36932 44.2428 3.43466 44.6008 3.56534C44.9616 3.69318 45.2798 3.89205 45.5553 4.16193C45.8338 4.43182 46.0525 4.77557 46.2116 5.19318C46.3707 5.60795 46.4502 6.10227 46.4502 6.67614V7.14915H41.0852V6.10938H44.9715C44.9687 5.81392 44.9048 5.55114 44.7798 5.32102C44.6548 5.08807 44.4801 4.90483 44.2556 4.77131C44.034 4.63778 43.7755 4.57102 43.4801 4.57102C43.1647 4.57102 42.8877 4.64773 42.6491 4.80114C42.4105 4.9517 42.2244 5.15057 42.0909 5.39773C41.9602 5.64205 41.8934 5.91051 41.8906 6.20312V7.1108C41.8906 7.49148 41.9602 7.81818 42.0994 8.09091C42.2386 8.3608 42.4332 8.56818 42.6832 8.71307C42.9332 8.85511 43.2258 8.92614 43.561 8.92614C43.7855 8.92614 43.9886 8.89489 44.1704 8.83239C44.3522 8.76705 44.5099 8.67188 44.6434 8.54688C44.7769 8.42188 44.8778 8.26705 44.946 8.08239L46.3863 8.24432C46.2954 8.625 46.1221 8.95739 45.8664 9.24148C45.6136 9.52273 45.2897 9.74148 44.8948 9.89773C44.4999 10.0511 44.0482 10.1278 43.5397 10.1278ZM54.3845 1.27273V10H52.8035V2.81108H52.7524L50.7112 4.11506V2.66619L52.8802 1.27273H54.3845Z' fill='%23A54EEA'/%3E%3Cg filter='url(%23filter1_d_135_3347)'%3E%3Cpath d='M127.709 110.459L125 98L136.92 104.229L130.96 105.667L127.709 110.459Z' fill='%23010101'/%3E%3Cpath d='M125.251 97.5199L124.225 96.9836L124.471 98.1151L127.18 110.574L127.448 111.808L128.157 110.763L131.291 106.144L137.047 104.756L138.45 104.418L137.171 103.749L125.251 97.5199Z' stroke='white' stroke-width='1.08333' stroke-linecap='square'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_135_3347' x='1' y='30' width='186' height='138' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_135_3347'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_135_3347' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_135_3347' x='120.199' y='93.8006' width='23.0303' height='23.6902' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='1.08333'/%3E%3CfeGaussianBlur stdDeviation='1.625'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_135_3347'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_135_3347' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_135_3347'%3E%3Crect x='14' y='31' width='160' height='108' rx='2' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
}
.figma-dark .svg6 {
    width: 188px;
    height: 169px;
    background-image: url("data:image/svg+xml,%3Csvg width='188' height='168' viewBox='0 0 188 168' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_135_4080)'%3E%3Cg clip-path='url(%23clip0_135_4080)'%3E%3Crect x='14' y='31' width='160' height='108' rx='2' fill='%232D2D2C'/%3E%3Crect width='80' height='36' transform='translate(14 31)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='31' width='80' height='36' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(94 31)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='31' width='80' height='36' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(14 67)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='67' width='80' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(94 67)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='67' width='80' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(14 103)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='103' width='80' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(94 103)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='103' width='80' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='31' width='160' height='108' rx='2' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='4' y='21' width='180' height='127' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='18' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='145' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='145' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='18' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 0L3.375 2.625L6 5.25L8.625 2.625L6 0ZM6 6.75L3.375 9.375L6 12L8.625 9.375L6 6.75ZM0 6L2.625 3.375L5.25 6L2.625 8.625L0 6ZM9.375 3.375L6.75 6L9.375 8.625L12 6L9.375 3.375Z' fill='%23A54EEA'/%3E%3Cpath d='M15.4773 2.59801V1.27273H22.4403V2.59801H19.7429V10H18.1747V2.59801H15.4773ZM24.7674 10.1321C24.3526 10.1321 23.979 10.0582 23.6466 9.91051C23.3171 9.75994 23.0557 9.53835 22.8626 9.24574C22.6722 8.95312 22.577 8.59233 22.577 8.16335C22.577 7.79403 22.6452 7.48864 22.7816 7.24716C22.918 7.00568 23.104 6.8125 23.3398 6.66761C23.5756 6.52273 23.8413 6.41335 24.1367 6.33949C24.435 6.26278 24.7432 6.20739 25.0614 6.1733C25.4449 6.13352 25.756 6.09801 25.9947 6.06676C26.2333 6.03267 26.4066 5.98153 26.5145 5.91335C26.6253 5.84233 26.6807 5.73295 26.6807 5.58523V5.55966C26.6807 5.23864 26.5856 4.99006 26.3952 4.81392C26.2049 4.63778 25.9307 4.54972 25.5728 4.54972C25.1949 4.54972 24.8952 4.6321 24.6736 4.79688C24.4549 4.96165 24.3072 5.15625 24.2305 5.38068L22.7901 5.17614C22.9037 4.77841 23.0913 4.44602 23.3526 4.17898C23.614 3.90909 23.9336 3.70739 24.3114 3.57386C24.6893 3.4375 25.1069 3.36932 25.5643 3.36932C25.8796 3.36932 26.1935 3.40625 26.506 3.48011C26.8185 3.55398 27.104 3.67614 27.3626 3.84659C27.6211 4.0142 27.8285 4.2429 27.9847 4.53267C28.1438 4.82244 28.2234 5.18466 28.2234 5.61932V10H26.7404V9.10085H26.6893C26.5955 9.28267 26.4634 9.45312 26.293 9.61222C26.1253 9.76847 25.9137 9.89489 25.658 9.99148C25.4052 10.0852 25.1083 10.1321 24.7674 10.1321ZM25.168 8.99858C25.4776 8.99858 25.7461 8.9375 25.9734 8.81534C26.2006 8.69034 26.3753 8.52557 26.4975 8.32102C26.6225 8.11648 26.685 7.89347 26.685 7.65199V6.88068C26.6367 6.92045 26.5543 6.95739 26.4378 6.99148C26.3242 7.02557 26.1964 7.0554 26.0543 7.08097C25.9123 7.10653 25.7716 7.12926 25.6324 7.14915C25.4932 7.16903 25.3725 7.18608 25.2702 7.20028C25.0401 7.23153 24.8341 7.28267 24.6523 7.35369C24.4705 7.42472 24.327 7.52415 24.2219 7.65199C24.1168 7.77699 24.0643 7.93892 24.0643 8.13778C24.0643 8.42188 24.168 8.63636 24.3753 8.78125C24.5827 8.92614 24.8469 8.99858 25.168 8.99858ZM29.9027 10V1.27273H31.4453V4.53693H31.5092C31.5887 4.37784 31.701 4.20881 31.8459 4.02983C31.9907 3.84801 32.1868 3.69318 32.4339 3.56534C32.6811 3.43466 32.9964 3.36932 33.3799 3.36932C33.8856 3.36932 34.3416 3.49858 34.7478 3.7571C35.1569 4.01278 35.4808 4.39205 35.7194 4.89489C35.9609 5.39489 36.0816 6.00852 36.0816 6.7358C36.0816 7.45455 35.9638 8.06534 35.728 8.56818C35.4922 9.07102 35.1711 9.45455 34.7649 9.71875C34.3586 9.98295 33.8984 10.1151 33.3842 10.1151C33.0092 10.1151 32.6981 10.0526 32.451 9.92756C32.2038 9.80256 32.0049 9.65199 31.8544 9.47585C31.7066 9.29687 31.5916 9.12784 31.5092 8.96875H31.4197V10H29.9027ZM31.4155 6.72727C31.4155 7.15057 31.4751 7.52131 31.5944 7.83949C31.7166 8.15767 31.8913 8.40625 32.1186 8.58523C32.3487 8.76136 32.6271 8.84943 32.9538 8.84943C33.2947 8.84943 33.5802 8.75852 33.8103 8.5767C34.0405 8.39205 34.2138 8.14062 34.3302 7.82244C34.4495 7.50142 34.5092 7.13636 34.5092 6.72727C34.5092 6.32102 34.451 5.96023 34.3345 5.64489C34.218 5.32955 34.0447 5.08239 33.8146 4.90341C33.5845 4.72443 33.2976 4.63494 32.9538 4.63494C32.6243 4.63494 32.3444 4.72159 32.1143 4.89489C31.8842 5.06818 31.7095 5.31108 31.5902 5.62358C31.4737 5.93608 31.4155 6.30398 31.4155 6.72727ZM38.9957 1.27273V10H37.4531V1.27273H38.9957ZM43.5397 10.1278C42.8835 10.1278 42.3167 9.99148 41.8394 9.71875C41.365 9.44318 40.9999 9.05398 40.7443 8.55114C40.4886 8.04545 40.3607 7.45028 40.3607 6.76562C40.3607 6.09233 40.4886 5.50142 40.7443 4.9929C41.0028 4.48153 41.3636 4.08381 41.8266 3.79972C42.2897 3.51278 42.8337 3.36932 43.4587 3.36932C43.8622 3.36932 44.2428 3.43466 44.6008 3.56534C44.9616 3.69318 45.2798 3.89205 45.5553 4.16193C45.8338 4.43182 46.0525 4.77557 46.2116 5.19318C46.3707 5.60795 46.4502 6.10227 46.4502 6.67614V7.14915H41.0852V6.10938H44.9715C44.9687 5.81392 44.9048 5.55114 44.7798 5.32102C44.6548 5.08807 44.4801 4.90483 44.2556 4.77131C44.034 4.63778 43.7755 4.57102 43.4801 4.57102C43.1647 4.57102 42.8877 4.64773 42.6491 4.80114C42.4105 4.9517 42.2244 5.15057 42.0909 5.39773C41.9602 5.64205 41.8934 5.91051 41.8906 6.20312V7.1108C41.8906 7.49148 41.9602 7.81818 42.0994 8.09091C42.2386 8.3608 42.4332 8.56818 42.6832 8.71307C42.9332 8.85511 43.2258 8.92614 43.561 8.92614C43.7855 8.92614 43.9886 8.89489 44.1704 8.83239C44.3522 8.76705 44.5099 8.67188 44.6434 8.54688C44.7769 8.42188 44.8778 8.26705 44.946 8.08239L46.3863 8.24432C46.2954 8.625 46.1221 8.95739 45.8664 9.24148C45.6136 9.52273 45.2897 9.74148 44.8948 9.89773C44.4999 10.0511 44.0482 10.1278 43.5397 10.1278ZM54.3845 1.27273V10H52.8035V2.81108H52.7524L50.7112 4.11506V2.66619L52.8802 1.27273H54.3845Z' fill='%23A54EEA'/%3E%3Cg filter='url(%23filter1_d_135_4080)'%3E%3Cpath d='M127.709 110.459L125 98L136.92 104.229L130.96 105.667L127.709 110.459Z' fill='%23010101'/%3E%3Cpath d='M125.251 97.5199L124.225 96.9836L124.471 98.1151L127.18 110.574L127.448 111.808L128.157 110.763L131.291 106.144L137.047 104.756L138.45 104.418L137.171 103.749L125.251 97.5199Z' stroke='white' stroke-width='1.08333' stroke-linecap='square'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_135_4080' x='1' y='30' width='186' height='138' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_135_4080'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_135_4080' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_135_4080' x='120.199' y='93.8006' width='23.0303' height='23.6902' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='1.08333'/%3E%3CfeGaussianBlur stdDeviation='1.625'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_135_4080'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_135_4080' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_135_4080'%3E%3Crect x='14' y='31' width='160' height='108' rx='2' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
}

.figma-light .svg7 {
	width: 188px;
    height: 190px;
	margin-bottom: -9px;
	background-image: url("data:image/svg+xml,%3Csvg width='188' height='190' viewBox='0 0 188 190' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='4' y='24.8333' width='180' height='129' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='21.8333' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='150.833' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='150.833' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='21.8333' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 3.83325L3.375 6.45825L6 9.08325L8.625 6.45825L6 3.83325ZM6 10.5833L3.375 13.2083L6 15.8333L8.625 13.2083L6 10.5833ZM0 9.83325L2.625 7.20825L5.25 9.83325L2.625 12.4583L0 9.83325ZM9.375 7.20825L6.75 9.83325L9.375 12.4583L12 9.83325L9.375 7.20825Z' fill='%23A54EEA'/%3E%3Cpath d='M15.4773 6.43126V5.10598H22.4403V6.43126H19.7429V13.8333H18.1747V6.43126H15.4773ZM24.7674 13.9654C24.3526 13.9654 23.979 13.8915 23.6466 13.7438C23.3171 13.5932 23.0557 13.3716 22.8626 13.079C22.6722 12.7864 22.577 12.4256 22.577 11.9966C22.577 11.6273 22.6452 11.3219 22.7816 11.0804C22.918 10.8389 23.104 10.6458 23.3398 10.5009C23.5756 10.356 23.8413 10.2466 24.1367 10.1727C24.435 10.096 24.7432 10.0406 25.0614 10.0065C25.4449 9.96677 25.756 9.93126 25.9947 9.90001C26.2333 9.86592 26.4066 9.81479 26.5145 9.7466C26.6253 9.67558 26.6807 9.56621 26.6807 9.41848V9.39291C26.6807 9.07189 26.5856 8.82331 26.3952 8.64717C26.2049 8.47104 25.9307 8.38297 25.5728 8.38297C25.1949 8.38297 24.8952 8.46535 24.6736 8.63013C24.4549 8.7949 24.3072 8.9895 24.2305 9.21393L22.7901 9.00939C22.9037 8.61166 23.0913 8.27927 23.3526 8.01223C23.614 7.74234 23.9336 7.54064 24.3114 7.40712C24.6893 7.27075 25.1069 7.20257 25.5643 7.20257C25.8796 7.20257 26.1935 7.2395 26.506 7.31337C26.8185 7.38723 27.104 7.50939 27.3626 7.67984C27.6211 7.84746 27.8285 8.07615 27.9847 8.36592C28.1438 8.65569 28.2234 9.01791 28.2234 9.45257V13.8333H26.7404V12.9341H26.6893C26.5955 13.1159 26.4634 13.2864 26.293 13.4455C26.1253 13.6017 25.9137 13.7281 25.658 13.8247C25.4052 13.9185 25.1083 13.9654 24.7674 13.9654ZM25.168 12.8318C25.4776 12.8318 25.7461 12.7708 25.9734 12.6486C26.2006 12.5236 26.3753 12.3588 26.4975 12.1543C26.6225 11.9497 26.685 11.7267 26.685 11.4852V10.7139C26.6367 10.7537 26.5543 10.7906 26.4378 10.8247C26.3242 10.8588 26.1964 10.8886 26.0543 10.9142C25.9123 10.9398 25.7716 10.9625 25.6324 10.9824C25.4932 11.0023 25.3725 11.0193 25.2702 11.0335C25.0401 11.0648 24.8341 11.1159 24.6523 11.1869C24.4705 11.258 24.327 11.3574 24.2219 11.4852C24.1168 11.6102 24.0643 11.7722 24.0643 11.971C24.0643 12.2551 24.168 12.4696 24.3753 12.6145C24.5827 12.7594 24.8469 12.8318 25.168 12.8318ZM29.9027 13.8333V5.10598H31.4453V8.37018H31.5092C31.5887 8.21109 31.701 8.04206 31.8459 7.86308C31.9907 7.68126 32.1868 7.52643 32.4339 7.39859C32.6811 7.26791 32.9964 7.20257 33.3799 7.20257C33.8856 7.20257 34.3416 7.33183 34.7478 7.59035C35.1569 7.84604 35.4808 8.2253 35.7194 8.72814C35.9609 9.22814 36.0816 9.84177 36.0816 10.569C36.0816 11.2878 35.9638 11.8986 35.728 12.4014C35.4922 12.9043 35.1711 13.2878 34.7649 13.552C34.3586 13.8162 33.8984 13.9483 33.3842 13.9483C33.0092 13.9483 32.6981 13.8858 32.451 13.7608C32.2038 13.6358 32.0049 13.4852 31.8544 13.3091C31.7066 13.1301 31.5916 12.9611 31.5092 12.802H31.4197V13.8333H29.9027ZM31.4155 10.5605C31.4155 10.9838 31.4751 11.3546 31.5944 11.6727C31.7166 11.9909 31.8913 12.2395 32.1186 12.4185C32.3487 12.5946 32.6271 12.6827 32.9538 12.6827C33.2947 12.6827 33.5802 12.5918 33.8103 12.41C34.0405 12.2253 34.2138 11.9739 34.3302 11.6557C34.4495 11.3347 34.5092 10.9696 34.5092 10.5605C34.5092 10.1543 34.451 9.79348 34.3345 9.47814C34.218 9.1628 34.0447 8.91564 33.8146 8.73666C33.5845 8.55768 33.2976 8.46819 32.9538 8.46819C32.6243 8.46819 32.3444 8.55484 32.1143 8.72814C31.8842 8.90143 31.7095 9.14433 31.5902 9.45683C31.4737 9.76933 31.4155 10.1372 31.4155 10.5605ZM38.9957 5.10598V13.8333H37.4531V5.10598H38.9957ZM43.5397 13.9611C42.8835 13.9611 42.3167 13.8247 41.8394 13.552C41.365 13.2764 40.9999 12.8872 40.7443 12.3844C40.4886 11.8787 40.3607 11.2835 40.3607 10.5989C40.3607 9.92558 40.4886 9.33467 40.7443 8.82615C41.0028 8.31479 41.3636 7.91706 41.8266 7.63297C42.2897 7.34604 42.8337 7.20257 43.4587 7.20257C43.8622 7.20257 44.2428 7.26791 44.6008 7.39859C44.9616 7.52643 45.2798 7.7253 45.5553 7.99518C45.8338 8.26507 46.0525 8.60882 46.2116 9.02643C46.3707 9.44121 46.4502 9.93552 46.4502 10.5094V10.9824H41.0852V9.94263H44.9715C44.9687 9.64717 44.9048 9.38439 44.7798 9.15427C44.6548 8.92132 44.4801 8.73808 44.2556 8.60456C44.034 8.47104 43.7755 8.40427 43.4801 8.40427C43.1647 8.40427 42.8877 8.48098 42.6491 8.63439C42.4105 8.78496 42.2244 8.98382 42.0909 9.23098C41.9602 9.4753 41.8934 9.74376 41.8906 10.0364V10.944C41.8906 11.3247 41.9602 11.6514 42.0994 11.9242C42.2386 12.194 42.4332 12.4014 42.6832 12.5463C42.9332 12.6884 43.2258 12.7594 43.561 12.7594C43.7855 12.7594 43.9886 12.7281 44.1704 12.6656C44.3522 12.6003 44.5099 12.5051 44.6434 12.3801C44.7769 12.2551 44.8778 12.1003 44.946 11.9156L46.3863 12.0776C46.2954 12.4583 46.1221 12.7906 45.8664 13.0747C45.6136 13.356 45.2897 13.5747 44.8948 13.731C44.4999 13.8844 44.0482 13.9611 43.5397 13.9611ZM54.3845 5.10598V13.8333H52.8035V6.64433H52.7524L50.7112 7.94831V6.49945L52.8802 5.10598H54.3845Z' fill='%23A54EEA'/%3E%3Cg filter='url(%23filter0_d_113_3127)'%3E%3Cg clip-path='url(%23clip0_113_3127)'%3E%3Crect x='14' y='35' width='160' height='109' rx='2' fill='white'/%3E%3Crect width='80' height='36.3333' transform='translate(14 35)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='35' width='80' height='36.3333' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 35)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='35' width='80' height='36.3333' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 71.3334)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='71.3334' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 71.3334)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='71.3334' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 107.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='107.667' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 107.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='107.667' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='35' width='160' height='109' rx='2' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Cpath d='M119.62 4.76062C119.3 4.36794 118.7 4.36794 118.38 4.76062L114.584 9.41656C113.981 10.1572 114.949 11.1418 115.699 10.5505L116.563 9.87014C117.065 9.47457 117.806 9.79863 117.856 10.4359L118.203 14.8496C118.28 15.8327 119.72 15.8327 119.798 14.8496L120.144 10.4361C120.194 9.79878 120.935 9.47472 121.437 9.87028L122.301 10.5506C123.051 11.1418 124.019 10.1572 123.416 9.41664L119.62 4.76062Z' fill='%23FF678C'/%3E%3Cpath d='M154.269 118.924C153.869 118.443 153.131 118.443 152.731 118.924L148.804 123.642C148.04 124.56 149.238 125.803 150.184 125.074L150.568 124.777C151.197 124.292 152.112 124.698 152.176 125.489L152.503 129.572C152.602 130.799 154.398 130.799 154.497 129.572L154.824 125.489C154.888 124.698 155.804 124.293 156.432 124.778L156.816 125.074C157.762 125.803 158.96 124.561 158.196 123.642L154.269 118.924Z' fill='%23FF678C'/%3E%3Cpath d='M39.4316 67.1475C38.9514 66.5559 38.0486 66.556 37.5684 67.1475L27.8593 79.106C26.9559 80.2187 28.4112 81.6927 29.5353 80.8036L34.282 77.0492C35.035 76.4536 36.1478 76.9396 36.2227 77.8968L37.3038 91.7118C37.4192 93.187 39.5811 93.187 39.6965 91.7118L40.7775 77.8971C40.8524 76.9399 41.9653 76.4539 42.7183 77.0495L47.4648 80.8037C48.5889 81.6928 50.0442 80.2188 49.1408 79.1061L39.4316 67.1475Z' fill='%23FF678C'/%3E%3Cpath d='M81.2679 164.92C80.8681 164.441 80.1319 164.441 79.7321 164.92L73.8136 172.015C73.0484 172.932 74.2449 174.176 75.1914 173.448L77.2888 171.833C77.9174 171.349 78.832 171.755 78.8956 172.545L79.5033 180.104C79.6019 181.33 81.3983 181.33 81.4969 180.104L82.1046 172.546C82.1682 171.755 83.0828 171.35 83.7114 171.833L85.8086 173.448C86.7552 174.176 87.9516 172.932 87.1864 172.015L81.2679 164.92Z' fill='%23FF678C'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_113_3127' x='1' y='34' width='186' height='139' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_113_3127'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_113_3127' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_113_3127'%3E%3Crect x='14' y='35' width='160' height='109' rx='2' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
}

.figma-dark .svg7 {
	width: 188px;
    height: 190px;
	margin-bottom: -9px;
	background-image: url("data:image/svg+xml,%3Csvg width='188' height='190' viewBox='0 0 188 190' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='4' y='24.8333' width='180' height='129' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='21.8333' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='150.833' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='150.833' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='21.8333' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 3.83325L3.375 6.45825L6 9.08325L8.625 6.45825L6 3.83325ZM6 10.5833L3.375 13.2083L6 15.8333L8.625 13.2083L6 10.5833ZM0 9.83325L2.625 7.20825L5.25 9.83325L2.625 12.4583L0 9.83325ZM9.375 7.20825L6.75 9.83325L9.375 12.4583L12 9.83325L9.375 7.20825Z' fill='%23A54EEA'/%3E%3Cpath d='M15.4773 6.43126V5.10598H22.4403V6.43126H19.7429V13.8333H18.1747V6.43126H15.4773ZM24.7674 13.9654C24.3526 13.9654 23.979 13.8915 23.6466 13.7438C23.3171 13.5932 23.0557 13.3716 22.8626 13.079C22.6722 12.7864 22.577 12.4256 22.577 11.9966C22.577 11.6273 22.6452 11.3219 22.7816 11.0804C22.918 10.8389 23.104 10.6458 23.3398 10.5009C23.5756 10.356 23.8413 10.2466 24.1367 10.1727C24.435 10.096 24.7432 10.0406 25.0614 10.0065C25.4449 9.96677 25.756 9.93126 25.9947 9.90001C26.2333 9.86592 26.4066 9.81479 26.5145 9.7466C26.6253 9.67558 26.6807 9.56621 26.6807 9.41848V9.39291C26.6807 9.07189 26.5856 8.82331 26.3952 8.64717C26.2049 8.47104 25.9307 8.38297 25.5728 8.38297C25.1949 8.38297 24.8952 8.46535 24.6736 8.63013C24.4549 8.7949 24.3072 8.9895 24.2305 9.21393L22.7901 9.00939C22.9037 8.61166 23.0913 8.27927 23.3526 8.01223C23.614 7.74234 23.9336 7.54064 24.3114 7.40712C24.6893 7.27075 25.1069 7.20257 25.5643 7.20257C25.8796 7.20257 26.1935 7.2395 26.506 7.31337C26.8185 7.38723 27.104 7.50939 27.3626 7.67984C27.6211 7.84746 27.8285 8.07615 27.9847 8.36592C28.1438 8.65569 28.2234 9.01791 28.2234 9.45257V13.8333H26.7404V12.9341H26.6893C26.5955 13.1159 26.4634 13.2864 26.293 13.4455C26.1253 13.6017 25.9137 13.7281 25.658 13.8247C25.4052 13.9185 25.1083 13.9654 24.7674 13.9654ZM25.168 12.8318C25.4776 12.8318 25.7461 12.7708 25.9734 12.6486C26.2006 12.5236 26.3753 12.3588 26.4975 12.1543C26.6225 11.9497 26.685 11.7267 26.685 11.4852V10.7139C26.6367 10.7537 26.5543 10.7906 26.4378 10.8247C26.3242 10.8588 26.1964 10.8886 26.0543 10.9142C25.9123 10.9398 25.7716 10.9625 25.6324 10.9824C25.4932 11.0023 25.3725 11.0193 25.2702 11.0335C25.0401 11.0648 24.8341 11.1159 24.6523 11.1869C24.4705 11.258 24.327 11.3574 24.2219 11.4852C24.1168 11.6102 24.0643 11.7722 24.0643 11.971C24.0643 12.2551 24.168 12.4696 24.3753 12.6145C24.5827 12.7594 24.8469 12.8318 25.168 12.8318ZM29.9027 13.8333V5.10598H31.4453V8.37018H31.5092C31.5887 8.21109 31.701 8.04206 31.8459 7.86308C31.9907 7.68126 32.1868 7.52643 32.4339 7.39859C32.6811 7.26791 32.9964 7.20257 33.3799 7.20257C33.8856 7.20257 34.3416 7.33183 34.7478 7.59035C35.1569 7.84604 35.4808 8.2253 35.7194 8.72814C35.9609 9.22814 36.0816 9.84177 36.0816 10.569C36.0816 11.2878 35.9638 11.8986 35.728 12.4014C35.4922 12.9043 35.1711 13.2878 34.7649 13.552C34.3586 13.8162 33.8984 13.9483 33.3842 13.9483C33.0092 13.9483 32.6981 13.8858 32.451 13.7608C32.2038 13.6358 32.0049 13.4852 31.8544 13.3091C31.7066 13.1301 31.5916 12.9611 31.5092 12.802H31.4197V13.8333H29.9027ZM31.4155 10.5605C31.4155 10.9838 31.4751 11.3546 31.5944 11.6727C31.7166 11.9909 31.8913 12.2395 32.1186 12.4185C32.3487 12.5946 32.6271 12.6827 32.9538 12.6827C33.2947 12.6827 33.5802 12.5918 33.8103 12.41C34.0405 12.2253 34.2138 11.9739 34.3302 11.6557C34.4495 11.3347 34.5092 10.9696 34.5092 10.5605C34.5092 10.1543 34.451 9.79348 34.3345 9.47814C34.218 9.1628 34.0447 8.91564 33.8146 8.73666C33.5845 8.55768 33.2976 8.46819 32.9538 8.46819C32.6243 8.46819 32.3444 8.55484 32.1143 8.72814C31.8842 8.90143 31.7095 9.14433 31.5902 9.45683C31.4737 9.76933 31.4155 10.1372 31.4155 10.5605ZM38.9957 5.10598V13.8333H37.4531V5.10598H38.9957ZM43.5397 13.9611C42.8835 13.9611 42.3167 13.8247 41.8394 13.552C41.365 13.2764 40.9999 12.8872 40.7443 12.3844C40.4886 11.8787 40.3607 11.2835 40.3607 10.5989C40.3607 9.92558 40.4886 9.33467 40.7443 8.82615C41.0028 8.31479 41.3636 7.91706 41.8266 7.63297C42.2897 7.34604 42.8337 7.20257 43.4587 7.20257C43.8622 7.20257 44.2428 7.26791 44.6008 7.39859C44.9616 7.52643 45.2798 7.7253 45.5553 7.99518C45.8338 8.26507 46.0525 8.60882 46.2116 9.02643C46.3707 9.44121 46.4502 9.93552 46.4502 10.5094V10.9824H41.0852V9.94263H44.9715C44.9687 9.64717 44.9048 9.38439 44.7798 9.15427C44.6548 8.92132 44.4801 8.73808 44.2556 8.60456C44.034 8.47104 43.7755 8.40427 43.4801 8.40427C43.1647 8.40427 42.8877 8.48098 42.6491 8.63439C42.4105 8.78496 42.2244 8.98382 42.0909 9.23098C41.9602 9.4753 41.8934 9.74376 41.8906 10.0364V10.944C41.8906 11.3247 41.9602 11.6514 42.0994 11.9242C42.2386 12.194 42.4332 12.4014 42.6832 12.5463C42.9332 12.6884 43.2258 12.7594 43.561 12.7594C43.7855 12.7594 43.9886 12.7281 44.1704 12.6656C44.3522 12.6003 44.5099 12.5051 44.6434 12.3801C44.7769 12.2551 44.8778 12.1003 44.946 11.9156L46.3863 12.0776C46.2954 12.4583 46.1221 12.7906 45.8664 13.0747C45.6136 13.356 45.2897 13.5747 44.8948 13.731C44.4999 13.8844 44.0482 13.9611 43.5397 13.9611ZM54.3845 5.10598V13.8333H52.8035V6.64433H52.7524L50.7112 7.94831V6.49945L52.8802 5.10598H54.3845Z' fill='%23A54EEA'/%3E%3Cg filter='url(%23filter0_d_113_3542)'%3E%3Cg clip-path='url(%23clip0_113_3542)'%3E%3Crect x='14' y='35' width='160' height='109' rx='2' fill='%232D2D2C'/%3E%3Crect width='80' height='36.3333' transform='translate(14 35)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='35' width='80' height='36.3333' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 35)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='35' width='80' height='36.3333' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 71.3334)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='71.3334' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 71.3334)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='71.3334' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 107.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='107.667' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 107.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='107.667' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='35' width='160' height='109' rx='2' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Cpath d='M119.62 4.76062C119.3 4.36794 118.7 4.36794 118.38 4.76062L114.584 9.41656C113.981 10.1572 114.949 11.1418 115.699 10.5505L116.563 9.87014C117.065 9.47457 117.806 9.79863 117.856 10.4359L118.203 14.8496C118.28 15.8327 119.72 15.8327 119.798 14.8496L120.144 10.4361C120.194 9.79878 120.935 9.47472 121.437 9.87028L122.301 10.5506C123.051 11.1418 124.019 10.1572 123.416 9.41664L119.62 4.76062Z' fill='%23FF678C'/%3E%3Cpath d='M154.269 118.924C153.869 118.443 153.131 118.443 152.731 118.924L148.804 123.642C148.04 124.56 149.238 125.803 150.184 125.074L150.568 124.777C151.197 124.292 152.112 124.698 152.176 125.489L152.503 129.572C152.602 130.799 154.398 130.799 154.497 129.572L154.824 125.489C154.888 124.698 155.804 124.293 156.432 124.778L156.816 125.074C157.762 125.803 158.96 124.561 158.196 123.642L154.269 118.924Z' fill='%23FF678C'/%3E%3Cpath d='M39.4316 67.1475C38.9514 66.5559 38.0486 66.556 37.5684 67.1475L27.8593 79.106C26.9559 80.2187 28.4112 81.6927 29.5353 80.8036L34.282 77.0492C35.035 76.4536 36.1478 76.9396 36.2227 77.8968L37.3038 91.7118C37.4192 93.187 39.5811 93.187 39.6965 91.7118L40.7775 77.8971C40.8524 76.9399 41.9653 76.4539 42.7183 77.0495L47.4648 80.8037C48.5889 81.6928 50.0442 80.2188 49.1408 79.1061L39.4316 67.1475Z' fill='%23FF678C'/%3E%3Cpath d='M81.2679 164.92C80.8681 164.441 80.1319 164.441 79.7321 164.92L73.8136 172.015C73.0484 172.932 74.2449 174.176 75.1914 173.448L77.2888 171.833C77.9174 171.349 78.832 171.755 78.8956 172.545L79.5033 180.104C79.6019 181.33 81.3983 181.33 81.4969 180.104L82.1046 172.546C82.1682 171.755 83.0828 171.35 83.7114 171.833L85.8086 173.448C86.7552 174.176 87.9516 172.932 87.1864 172.015L81.2679 164.92Z' fill='%23FF678C'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_113_3542' x='1' y='34' width='186' height='139' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_113_3542'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_113_3542' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_113_3542'%3E%3Crect x='14' y='35' width='160' height='109' rx='2' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
}





</style>
