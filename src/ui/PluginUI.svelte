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

	let data
	let columnResizing = true
	let rememberSettings = true
	let columnCount
	let rowCount
	let includeHeader
	let cellWidth = 100
	let cellAlignment
	let selectedFile
	let editingTemplate
	let defaultTemplate
	let remoteFiles
	let localTemplates
	let showToggles

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

		console.log("UI", "defaultT3", message.defaultT)

		if (message.type === "show-create-table-ui") {
			console.log("UI", "defaultT3", message.defaultTemplate)
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
				includeHeader = value.includeHeader
				cellAlignment = value.cellAlignment
				columnResizing = value.columnResizing
				data = value.data
			})

			if (data.pluginVersion === "7.0.0") {

				// If localTemplates or remoteFiles exist then show create table page
				if (data.localTemplates.length > 0 || data.remoteFiles.length > 0) {
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
			Tables are now created from a single component called a template. They offer more flexibility and existing tables can be updated from them.
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
			<span class="next" on:click={() => setActiveSlide(4)}><Button classes="secondary" iconRight="arrow-right">Next</Button></span>
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
				<h6>Update to template</h6>
				<p>The table components in this file need updating. This will convert your existing table component into a template or create one if one doesn't exist.</p>
			<div class="buttons">
				<span class="next" on:click={() => upgradeToTemplate()}><Button classes="secondary">Create Template</Button></span>
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

								<p style="font-weight: 600">Choose template</p>

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
		<div class="field-group">
			<Field id="columnCount" label="C" type="number" step="1" min="1" max="50" value={columnCount} />
			<Field id="rowCount" label="R" type="number" step="1" min="1" max="50" value={rowCount} />
		</div>

		<Checkbox id="includeHeader" label="Include table header" checked={includeHeader} />

		<Matrix {columnCount} {rowCount} grid={[8, 8]} />

		<div class="text-bold SectionTitle">Cell</div>
		<div style="display: flex; gap: var(--size-200);">
			<Field style="width: 106px" id="cellWidth" label="W" type="number" step="1" min="1" max="1000" value={cellWidth} />

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

{#if pageState.templateSettingsPageActive}
	<div class="container" style="padding: var(--size-200)">
		<TemplateSettings template={editingTemplate} pageState/>
	</div>
{/if}

<style global>

	.welcomePage .buttons .button {
		margin-top: var(--margin-200);
	}

	.wrapper {
		padding: var(--padding-200);
	}

	.container {
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
		height: 300px;
		max-height: 300px;
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
		min-width: 242px;
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
	margin: -9px 0 -26px 0;
    width: 188px;
    height: 188px;
	background-size: contain;
    background-image: url("data:image/svg+xml,%3Csvg width='188' height='188' viewBox='0 0 188 188' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_113_2989)'%3E%3Cg clip-path='url(%23clip0_113_2989)'%3E%3Crect x='14' y='40' width='160' height='108' rx='1.44444' fill='white'/%3E%3Crect width='40' height='36' transform='translate(14 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='40' width='40' height='36' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(54 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='54' y='40' width='40' height='36' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(94 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='40' width='40' height='36' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(134 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='134' y='40' width='40' height='36' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(14 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='76' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(54 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='54' y='76' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(94 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='76' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(134 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='134' y='76' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(14 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='112' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(54 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='54' y='112' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(94 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='112' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(134 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='134' y='112' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='40' width='160' height='108' rx='1.44444' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='4' y='30' width='180' height='128' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='181' y='27' width='6' height='6' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='181' y='155' width='6' height='6' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='1' y='155' width='6' height='6' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='1' y='27' width='6' height='6' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Cpath d='M0.477273 11.598V10.2727H7.44034V11.598H4.7429V19H3.17472V11.598H0.477273ZM9.76739 19.1321C9.35261 19.1321 8.97903 19.0582 8.64665 18.9105C8.3171 18.7599 8.05574 18.5384 7.86256 18.2457C7.67222 17.9531 7.57705 17.5923 7.57705 17.1634C7.57705 16.794 7.64523 16.4886 7.78159 16.2472C7.91795 16.0057 8.10403 15.8125 8.33983 15.6676C8.57563 15.5227 8.84125 15.4134 9.1367 15.3395C9.435 15.2628 9.74324 15.2074 10.0614 15.1733C10.4449 15.1335 10.756 15.098 10.9947 15.0668C11.2333 15.0327 11.4066 14.9815 11.5145 14.9134C11.6253 14.8423 11.6807 14.733 11.6807 14.5852V14.5597C11.6807 14.2386 11.5856 13.9901 11.3952 13.8139C11.2049 13.6378 10.9307 13.5497 10.5728 13.5497C10.1949 13.5497 9.89523 13.6321 9.67364 13.7969C9.45489 13.9616 9.30716 14.1562 9.23045 14.3807L7.79011 14.1761C7.90375 13.7784 8.09125 13.446 8.35261 13.179C8.61398 12.9091 8.93358 12.7074 9.31142 12.5739C9.68926 12.4375 10.1069 12.3693 10.5643 12.3693C10.8796 12.3693 11.1935 12.4062 11.506 12.4801C11.8185 12.554 12.104 12.6761 12.3626 12.8466C12.6211 13.0142 12.8285 13.2429 12.9847 13.5327C13.1438 13.8224 13.2234 14.1847 13.2234 14.6193V19H11.7404V18.1009H11.6893C11.5955 18.2827 11.4634 18.4531 11.293 18.6122C11.1253 18.7685 10.9137 18.8949 10.658 18.9915C10.4052 19.0852 10.1083 19.1321 9.76739 19.1321ZM10.168 17.9986C10.4776 17.9986 10.7461 17.9375 10.9734 17.8153C11.2006 17.6903 11.3753 17.5256 11.4975 17.321C11.6225 17.1165 11.685 16.8935 11.685 16.652V15.8807C11.6367 15.9205 11.5543 15.9574 11.4378 15.9915C11.3242 16.0256 11.1964 16.0554 11.0543 16.081C10.9123 16.1065 10.7716 16.1293 10.6324 16.1491C10.4932 16.169 10.3725 16.1861 10.2702 16.2003C10.0401 16.2315 9.83415 16.2827 9.65233 16.3537C9.47051 16.4247 9.32705 16.5241 9.22193 16.652C9.11682 16.777 9.06426 16.9389 9.06426 17.1378C9.06426 17.4219 9.16795 17.6364 9.37534 17.7812C9.58273 17.9261 9.84693 17.9986 10.168 17.9986ZM14.9027 19V10.2727H16.4453V13.5369H16.5092C16.5887 13.3778 16.701 13.2088 16.8459 13.0298C16.9907 12.848 17.1868 12.6932 17.4339 12.5653C17.6811 12.4347 17.9964 12.3693 18.3799 12.3693C18.8856 12.3693 19.3416 12.4986 19.7478 12.7571C20.1569 13.0128 20.4808 13.392 20.7194 13.8949C20.9609 14.3949 21.0816 15.0085 21.0816 15.7358C21.0816 16.4545 20.9638 17.0653 20.728 17.5682C20.4922 18.071 20.1711 18.4545 19.7649 18.7188C19.3586 18.983 18.8984 19.1151 18.3842 19.1151C18.0092 19.1151 17.6981 19.0526 17.451 18.9276C17.2038 18.8026 17.0049 18.652 16.8544 18.4759C16.7066 18.2969 16.5916 18.1278 16.5092 17.9688H16.4197V19H14.9027ZM16.4155 15.7273C16.4155 16.1506 16.4751 16.5213 16.5944 16.8395C16.7166 17.1577 16.8913 17.4062 17.1186 17.5852C17.3487 17.7614 17.6271 17.8494 17.9538 17.8494C18.2947 17.8494 18.5802 17.7585 18.8103 17.5767C19.0405 17.392 19.2138 17.1406 19.3302 16.8224C19.4495 16.5014 19.5092 16.1364 19.5092 15.7273C19.5092 15.321 19.451 14.9602 19.3345 14.6449C19.218 14.3295 19.0447 14.0824 18.8146 13.9034C18.5845 13.7244 18.2976 13.6349 17.9538 13.6349C17.6243 13.6349 17.3444 13.7216 17.1143 13.8949C16.8842 14.0682 16.7095 14.3111 16.5902 14.6236C16.4737 14.9361 16.4155 15.304 16.4155 15.7273ZM23.9957 10.2727V19H22.4531V10.2727H23.9957ZM28.5397 19.1278C27.8835 19.1278 27.3167 18.9915 26.8394 18.7188C26.365 18.4432 25.9999 18.054 25.7443 17.5511C25.4886 17.0455 25.3607 16.4503 25.3607 15.7656C25.3607 15.0923 25.4886 14.5014 25.7443 13.9929C26.0028 13.4815 26.3636 13.0838 26.8266 12.7997C27.2897 12.5128 27.8337 12.3693 28.4587 12.3693C28.8622 12.3693 29.2428 12.4347 29.6008 12.5653C29.9616 12.6932 30.2798 12.892 30.5553 13.1619C30.8338 13.4318 31.0525 13.7756 31.2116 14.1932C31.3707 14.608 31.4502 15.1023 31.4502 15.6761V16.1491H26.0852V15.1094H29.9715C29.9687 14.8139 29.9048 14.5511 29.7798 14.321C29.6548 14.0881 29.4801 13.9048 29.2556 13.7713C29.034 13.6378 28.7755 13.571 28.4801 13.571C28.1647 13.571 27.8877 13.6477 27.6491 13.8011C27.4105 13.9517 27.2244 14.1506 27.0909 14.3977C26.9602 14.642 26.8934 14.9105 26.8906 15.2031V16.1108C26.8906 16.4915 26.9602 16.8182 27.0994 17.0909C27.2386 17.3608 27.4332 17.5682 27.6832 17.7131C27.9332 17.8551 28.2258 17.9261 28.561 17.9261C28.7855 17.9261 28.9886 17.8949 29.1704 17.8324C29.3522 17.767 29.5099 17.6719 29.6434 17.5469C29.7769 17.4219 29.8778 17.267 29.946 17.0824L31.3863 17.2443C31.2954 17.625 31.1221 17.9574 30.8664 18.2415C30.6136 18.5227 30.2897 18.7415 29.8948 18.8977C29.4999 19.0511 29.0482 19.1278 28.5397 19.1278Z' fill='%232F80ED'/%3E%3Crect x='54' y='40' width='40' height='36' stroke='%23A54EEA' stroke-width='2'/%3E%3Cg filter='url(%23filter1_d_113_2989)'%3E%3Cpath d='M92.7091 86.0833L90 72L101.92 79.0417L95.9601 80.6667L92.7091 86.0833Z' fill='%23010101'/%3E%3Cpath d='M90.2755 71.5336L89.2411 70.9226L89.4681 72.1023L92.1772 86.1857L92.4447 87.5764L93.1736 86.3621L96.3125 81.132L102.063 79.5643L103.299 79.2271L102.196 78.5753L90.2755 71.5336Z' stroke='white' stroke-width='1.08333' stroke-linecap='square'/%3E%3C/g%3E%3Cpath d='M34.6444 88.3362C35.0042 88.4452 35.2724 88.747 35.3386 89.1171L37.0156 98.4951C37.2121 99.5938 38.7879 99.5938 38.9844 98.4951L40.6614 89.1171C40.7276 88.747 40.9958 88.4452 41.3556 88.3362L46.8432 86.6726C47.7897 86.3856 47.7897 85.0455 46.8432 84.7586L41.3587 83.0959C40.9973 82.9863 40.7284 82.6825 40.6636 82.3103L38.9852 72.6628C38.793 71.558 37.207 71.558 37.0148 72.6628L35.3364 82.3103C35.2716 82.6825 35.0027 82.9863 34.6413 83.0959L29.1568 84.7586C28.2103 85.0455 28.2103 86.3856 29.1568 86.6726L34.6444 88.3362Z' fill='%23F26E6E'/%3E%3Cpath d='M90.0259 180.292C90.3875 180.399 90.6583 180.7 90.7265 181.071L91.0165 182.649C91.2172 183.741 92.7828 183.741 92.9835 182.649L93.2735 181.071C93.3417 180.7 93.6125 180.399 93.9741 180.292L94.7482 180.064C95.7044 179.782 95.7044 178.428 94.7482 178.146L93.9773 177.918C93.6141 177.811 93.3425 177.508 93.2758 177.135L92.9844 175.505C92.7879 174.407 91.2121 174.407 91.0156 175.505L90.7242 177.135C90.6575 177.508 90.3859 177.811 90.0227 177.918L89.2518 178.146C88.2956 178.428 88.2956 179.782 89.2518 180.064L90.0259 180.292Z' fill='%23F26E6E'/%3E%3Cpath d='M149.795 131.037C150.157 131.143 150.428 131.444 150.496 131.815L151.016 134.649C151.217 135.741 152.783 135.741 152.984 134.649L153.504 131.815C153.572 131.444 153.843 131.143 154.205 131.037L155.748 130.581C156.704 130.299 156.704 128.945 155.748 128.663L154.208 128.209C153.845 128.102 153.573 127.799 153.507 127.426L152.984 124.505C152.788 123.407 151.212 123.407 151.016 124.505L150.493 127.426C150.427 127.799 150.155 128.102 149.792 128.209L148.252 128.663C147.296 128.945 147.296 130.299 148.252 130.581L149.795 131.037Z' fill='%23F26E6E'/%3E%3Cpath d='M119.338 16.1018C119.697 16.2117 119.964 16.5136 120.03 16.8835L121.015 22.444C121.21 23.5447 122.79 23.5447 122.985 22.444L123.97 16.8835C124.036 16.5136 124.303 16.2117 124.662 16.1018L127.874 15.1194C128.817 14.8308 128.817 13.4954 127.874 13.2069L124.665 12.2254C124.304 12.1151 124.036 11.811 123.972 11.4391L122.985 5.71533C122.795 4.60855 121.205 4.60855 121.015 5.71533L120.028 11.4391C119.964 11.811 119.696 12.1151 119.335 12.2254L116.126 13.2069C115.183 13.4954 115.183 14.8308 116.126 15.1194L119.338 16.1018Z' fill='%23F26E6E'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_113_2989' x='1' y='39' width='186' height='138' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_113_2989'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_113_2989' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_113_2989' x='85.2322' y='67.6785' width='22.6958' height='25.7243' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='1.08333'/%3E%3CfeGaussianBlur stdDeviation='1.625'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_113_2989'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_113_2989' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_113_2989'%3E%3Crect x='14' y='40' width='160' height='108' rx='1.44444' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
}

.figma-dark .svg1 {
	margin: -9px 0 -26px 0;
    width: 188px;
    height: 188px;
	background-size: contain;
	background-image: url("data:image/svg+xml,%3Csvg width='188' height='188' viewBox='0 0 188 188' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_113_3061)'%3E%3Cg clip-path='url(%23clip0_113_3061)'%3E%3Crect x='14' y='40' width='160' height='108' rx='1.44444' fill='%232D2D2C'/%3E%3Crect width='40' height='36' transform='translate(14 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='40' width='40' height='36' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(54 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='54' y='40' width='40' height='36' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(94 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='40' width='40' height='36' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(134 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='134' y='40' width='40' height='36' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(14 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='76' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(54 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='54' y='76' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(94 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='76' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(134 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='134' y='76' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(14 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='112' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(54 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='54' y='112' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(94 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='112' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(134 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='134' y='112' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='40' width='160' height='108' rx='1.44444' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='4' y='30' width='180' height='128' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='181' y='27' width='6' height='6' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='181' y='155' width='6' height='6' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='1' y='155' width='6' height='6' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='1' y='27' width='6' height='6' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Cpath d='M0.477273 11.598V10.2727H7.44034V11.598H4.7429V19H3.17472V11.598H0.477273ZM9.76739 19.1321C9.35261 19.1321 8.97903 19.0582 8.64665 18.9105C8.3171 18.7599 8.05574 18.5384 7.86256 18.2457C7.67222 17.9531 7.57705 17.5923 7.57705 17.1634C7.57705 16.794 7.64523 16.4886 7.78159 16.2472C7.91795 16.0057 8.10403 15.8125 8.33983 15.6676C8.57563 15.5227 8.84125 15.4134 9.1367 15.3395C9.435 15.2628 9.74324 15.2074 10.0614 15.1733C10.4449 15.1335 10.756 15.098 10.9947 15.0668C11.2333 15.0327 11.4066 14.9815 11.5145 14.9134C11.6253 14.8423 11.6807 14.733 11.6807 14.5852V14.5597C11.6807 14.2386 11.5856 13.9901 11.3952 13.8139C11.2049 13.6378 10.9307 13.5497 10.5728 13.5497C10.1949 13.5497 9.89523 13.6321 9.67364 13.7969C9.45489 13.9616 9.30716 14.1562 9.23045 14.3807L7.79011 14.1761C7.90375 13.7784 8.09125 13.446 8.35261 13.179C8.61398 12.9091 8.93358 12.7074 9.31142 12.5739C9.68926 12.4375 10.1069 12.3693 10.5643 12.3693C10.8796 12.3693 11.1935 12.4062 11.506 12.4801C11.8185 12.554 12.104 12.6761 12.3626 12.8466C12.6211 13.0142 12.8285 13.2429 12.9847 13.5327C13.1438 13.8224 13.2234 14.1847 13.2234 14.6193V19H11.7404V18.1009H11.6893C11.5955 18.2827 11.4634 18.4531 11.293 18.6122C11.1253 18.7685 10.9137 18.8949 10.658 18.9915C10.4052 19.0852 10.1083 19.1321 9.76739 19.1321ZM10.168 17.9986C10.4776 17.9986 10.7461 17.9375 10.9734 17.8153C11.2006 17.6903 11.3753 17.5256 11.4975 17.321C11.6225 17.1165 11.685 16.8935 11.685 16.652V15.8807C11.6367 15.9205 11.5543 15.9574 11.4378 15.9915C11.3242 16.0256 11.1964 16.0554 11.0543 16.081C10.9123 16.1065 10.7716 16.1293 10.6324 16.1491C10.4932 16.169 10.3725 16.1861 10.2702 16.2003C10.0401 16.2315 9.83415 16.2827 9.65233 16.3537C9.47051 16.4247 9.32705 16.5241 9.22193 16.652C9.11682 16.777 9.06426 16.9389 9.06426 17.1378C9.06426 17.4219 9.16795 17.6364 9.37534 17.7812C9.58273 17.9261 9.84693 17.9986 10.168 17.9986ZM14.9027 19V10.2727H16.4453V13.5369H16.5092C16.5887 13.3778 16.701 13.2088 16.8459 13.0298C16.9907 12.848 17.1868 12.6932 17.4339 12.5653C17.6811 12.4347 17.9964 12.3693 18.3799 12.3693C18.8856 12.3693 19.3416 12.4986 19.7478 12.7571C20.1569 13.0128 20.4808 13.392 20.7194 13.8949C20.9609 14.3949 21.0816 15.0085 21.0816 15.7358C21.0816 16.4545 20.9638 17.0653 20.728 17.5682C20.4922 18.071 20.1711 18.4545 19.7649 18.7188C19.3586 18.983 18.8984 19.1151 18.3842 19.1151C18.0092 19.1151 17.6981 19.0526 17.451 18.9276C17.2038 18.8026 17.0049 18.652 16.8544 18.4759C16.7066 18.2969 16.5916 18.1278 16.5092 17.9688H16.4197V19H14.9027ZM16.4155 15.7273C16.4155 16.1506 16.4751 16.5213 16.5944 16.8395C16.7166 17.1577 16.8913 17.4062 17.1186 17.5852C17.3487 17.7614 17.6271 17.8494 17.9538 17.8494C18.2947 17.8494 18.5802 17.7585 18.8103 17.5767C19.0405 17.392 19.2138 17.1406 19.3302 16.8224C19.4495 16.5014 19.5092 16.1364 19.5092 15.7273C19.5092 15.321 19.451 14.9602 19.3345 14.6449C19.218 14.3295 19.0447 14.0824 18.8146 13.9034C18.5845 13.7244 18.2976 13.6349 17.9538 13.6349C17.6243 13.6349 17.3444 13.7216 17.1143 13.8949C16.8842 14.0682 16.7095 14.3111 16.5902 14.6236C16.4737 14.9361 16.4155 15.304 16.4155 15.7273ZM23.9957 10.2727V19H22.4531V10.2727H23.9957ZM28.5397 19.1278C27.8835 19.1278 27.3167 18.9915 26.8394 18.7188C26.365 18.4432 25.9999 18.054 25.7443 17.5511C25.4886 17.0455 25.3607 16.4503 25.3607 15.7656C25.3607 15.0923 25.4886 14.5014 25.7443 13.9929C26.0028 13.4815 26.3636 13.0838 26.8266 12.7997C27.2897 12.5128 27.8337 12.3693 28.4587 12.3693C28.8622 12.3693 29.2428 12.4347 29.6008 12.5653C29.9616 12.6932 30.2798 12.892 30.5553 13.1619C30.8338 13.4318 31.0525 13.7756 31.2116 14.1932C31.3707 14.608 31.4502 15.1023 31.4502 15.6761V16.1491H26.0852V15.1094H29.9715C29.9687 14.8139 29.9048 14.5511 29.7798 14.321C29.6548 14.0881 29.4801 13.9048 29.2556 13.7713C29.034 13.6378 28.7755 13.571 28.4801 13.571C28.1647 13.571 27.8877 13.6477 27.6491 13.8011C27.4105 13.9517 27.2244 14.1506 27.0909 14.3977C26.9602 14.642 26.8934 14.9105 26.8906 15.2031V16.1108C26.8906 16.4915 26.9602 16.8182 27.0994 17.0909C27.2386 17.3608 27.4332 17.5682 27.6832 17.7131C27.9332 17.8551 28.2258 17.9261 28.561 17.9261C28.7855 17.9261 28.9886 17.8949 29.1704 17.8324C29.3522 17.767 29.5099 17.6719 29.6434 17.5469C29.7769 17.4219 29.8778 17.267 29.946 17.0824L31.3863 17.2443C31.2954 17.625 31.1221 17.9574 30.8664 18.2415C30.6136 18.5227 30.2897 18.7415 29.8948 18.8977C29.4999 19.0511 29.0482 19.1278 28.5397 19.1278Z' fill='%232F80ED'/%3E%3Crect x='54' y='40' width='40' height='36' stroke='%23A54EEA' stroke-width='2'/%3E%3Cg filter='url(%23filter1_d_113_3061)'%3E%3Cpath d='M92.7091 86.0833L90 72L101.92 79.0417L95.9601 80.6667L92.7091 86.0833Z' fill='%23010101'/%3E%3Cpath d='M90.2755 71.5336L89.2411 70.9226L89.4681 72.1023L92.1772 86.1857L92.4447 87.5764L93.1736 86.3621L96.3125 81.132L102.063 79.5643L103.299 79.2271L102.196 78.5753L90.2755 71.5336Z' stroke='white' stroke-width='1.08333' stroke-linecap='square'/%3E%3C/g%3E%3Cpath d='M34.6444 88.3362C35.0042 88.4452 35.2724 88.747 35.3386 89.1171L37.0156 98.4951C37.2121 99.5938 38.7879 99.5938 38.9844 98.4951L40.6614 89.1171C40.7276 88.747 40.9958 88.4452 41.3556 88.3362L46.8432 86.6726C47.7897 86.3856 47.7897 85.0455 46.8432 84.7586L41.3587 83.0959C40.9973 82.9863 40.7284 82.6825 40.6636 82.3103L38.9852 72.6628C38.793 71.558 37.207 71.558 37.0148 72.6628L35.3364 82.3103C35.2716 82.6825 35.0027 82.9863 34.6413 83.0959L29.1568 84.7586C28.2103 85.0455 28.2103 86.3856 29.1568 86.6726L34.6444 88.3362Z' fill='%23F26E6E'/%3E%3Cpath d='M90.0259 180.292C90.3875 180.399 90.6583 180.7 90.7265 181.071L91.0165 182.649C91.2172 183.741 92.7828 183.741 92.9835 182.649L93.2735 181.071C93.3417 180.7 93.6125 180.399 93.9741 180.292L94.7482 180.064C95.7044 179.782 95.7044 178.428 94.7482 178.146L93.9773 177.918C93.6141 177.811 93.3425 177.508 93.2758 177.135L92.9844 175.505C92.7879 174.407 91.2121 174.407 91.0156 175.505L90.7242 177.135C90.6575 177.508 90.3859 177.811 90.0227 177.918L89.2518 178.146C88.2956 178.428 88.2956 179.782 89.2518 180.064L90.0259 180.292Z' fill='%23F26E6E'/%3E%3Cpath d='M149.795 131.037C150.157 131.143 150.428 131.444 150.496 131.815L151.016 134.649C151.217 135.741 152.783 135.741 152.984 134.649L153.504 131.815C153.572 131.444 153.843 131.143 154.205 131.037L155.748 130.581C156.704 130.299 156.704 128.945 155.748 128.663L154.208 128.209C153.845 128.102 153.573 127.799 153.507 127.426L152.984 124.505C152.788 123.407 151.212 123.407 151.016 124.505L150.493 127.426C150.427 127.799 150.155 128.102 149.792 128.209L148.252 128.663C147.296 128.945 147.296 130.299 148.252 130.581L149.795 131.037Z' fill='%23F26E6E'/%3E%3Cpath d='M119.338 16.1018C119.697 16.2117 119.964 16.5136 120.03 16.8835L121.015 22.444C121.21 23.5447 122.79 23.5447 122.985 22.444L123.97 16.8835C124.036 16.5136 124.303 16.2117 124.662 16.1018L127.874 15.1194C128.817 14.8308 128.817 13.4954 127.874 13.2069L124.665 12.2254C124.304 12.1151 124.036 11.811 123.972 11.4391L122.985 5.71533C122.795 4.60855 121.205 4.60855 121.015 5.71533L120.028 11.4391C119.964 11.811 119.696 12.1151 119.335 12.2254L116.126 13.2069C115.183 13.4954 115.183 14.8308 116.126 15.1194L119.338 16.1018Z' fill='%23F26E6E'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_113_3061' x='1' y='39' width='186' height='138' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_113_3061'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_113_3061' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_113_3061' x='85.2322' y='67.6785' width='22.6958' height='25.7243' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='1.08333'/%3E%3CfeGaussianBlur stdDeviation='1.625'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_113_3061'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_113_3061' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_113_3061'%3E%3Crect x='14' y='40' width='160' height='108' rx='1.44444' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
}

.figma-light .svg2 {
	margin-right: -96px !important;
    width: 315px;
    height: 202px;
	background-size: contain;
    background-image: url("data:image/svg+xml,%3Csvg width='292' height='196' viewBox='0 0 292 196' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_108_4278)'%3E%3Cg clip-path='url(%23clip0_108_4278)'%3E%3Crect x='86' y='31.5' width='190' height='128' rx='2' fill='white'/%3E%3Crect width='95' height='43' transform='translate(86 31.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='86' y='31.5' width='95' height='43' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='95' height='43' transform='translate(181 31.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='181' y='31.5' width='95' height='43' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='95' height='43' transform='translate(86 74.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='86' y='74.5' width='95' height='43' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='95' height='43' transform='translate(181 74.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='181' y='74.5' width='95' height='43' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='95' height='42' transform='translate(86 117.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='86' y='117.5' width='95' height='42' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='95' height='42' transform='translate(181 117.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='181' y='117.5' width='95' height='42' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='86' y='31.5' width='190' height='128' rx='2' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='76' y='21.5' width='210' height='148' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='283' y='18.5' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='283' y='166.5' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='73' y='166.5' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='73' y='18.5' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M78 0.5L75.375 3.125L78 5.75L80.625 3.125L78 0.5ZM78 7.25L75.375 9.875L78 12.5L80.625 9.875L78 7.25ZM72 6.5L74.625 3.875L77.25 6.5L74.625 9.125L72 6.5ZM81.375 3.875L78.75 6.5L81.375 9.125L84 6.5L81.375 3.875Z' fill='%23A54EEA'/%3E%3Cpath d='M87.4773 3.09801V1.77273H94.4403V3.09801H91.7429V10.5H90.1747V3.09801H87.4773ZM96.7674 10.6321C96.3526 10.6321 95.979 10.5582 95.6466 10.4105C95.3171 10.2599 95.0557 10.0384 94.8626 9.74574C94.6722 9.45312 94.577 9.09233 94.577 8.66335C94.577 8.29403 94.6452 7.98864 94.7816 7.74716C94.918 7.50568 95.104 7.3125 95.3398 7.16761C95.5756 7.02273 95.8413 6.91335 96.1367 6.83949C96.435 6.76278 96.7432 6.70739 97.0614 6.6733C97.4449 6.63352 97.756 6.59801 97.9947 6.56676C98.2333 6.53267 98.4066 6.48153 98.5145 6.41335C98.6253 6.34233 98.6807 6.23295 98.6807 6.08523V6.05966C98.6807 5.73864 98.5856 5.49006 98.3952 5.31392C98.2049 5.13778 97.9307 5.04972 97.5728 5.04972C97.1949 5.04972 96.8952 5.1321 96.6736 5.29688C96.4549 5.46165 96.3072 5.65625 96.2305 5.88068L94.7901 5.67614C94.9037 5.27841 95.0913 4.94602 95.3526 4.67898C95.614 4.40909 95.9336 4.20739 96.3114 4.07386C96.6893 3.9375 97.1069 3.86932 97.5643 3.86932C97.8796 3.86932 98.1935 3.90625 98.506 3.98011C98.8185 4.05398 99.104 4.17614 99.3626 4.34659C99.6211 4.5142 99.8285 4.7429 99.9847 5.03267C100.144 5.32244 100.223 5.68466 100.223 6.11932V10.5H98.7404V9.60085H98.6893C98.5955 9.78267 98.4634 9.95312 98.293 10.1122C98.1253 10.2685 97.9137 10.3949 97.658 10.4915C97.4052 10.5852 97.1083 10.6321 96.7674 10.6321ZM97.168 9.49858C97.4776 9.49858 97.7461 9.4375 97.9734 9.31534C98.2006 9.19034 98.3753 9.02557 98.4975 8.82102C98.6225 8.61648 98.685 8.39347 98.685 8.15199V7.38068C98.6367 7.42045 98.5543 7.45739 98.4378 7.49148C98.3242 7.52557 98.1964 7.5554 98.0543 7.58097C97.9123 7.60653 97.7716 7.62926 97.6324 7.64915C97.4932 7.66903 97.3725 7.68608 97.2702 7.70028C97.0401 7.73153 96.8341 7.78267 96.6523 7.85369C96.4705 7.92472 96.327 8.02415 96.2219 8.15199C96.1168 8.27699 96.0643 8.43892 96.0643 8.63778C96.0643 8.92188 96.168 9.13636 96.3753 9.28125C96.5827 9.42614 96.8469 9.49858 97.168 9.49858ZM101.903 10.5V1.77273H103.445V5.03693H103.509C103.589 4.87784 103.701 4.70881 103.846 4.52983C103.991 4.34801 104.187 4.19318 104.434 4.06534C104.681 3.93466 104.996 3.86932 105.38 3.86932C105.886 3.86932 106.342 3.99858 106.748 4.2571C107.157 4.51278 107.481 4.89205 107.719 5.39489C107.961 5.89489 108.082 6.50852 108.082 7.2358C108.082 7.95455 107.964 8.56534 107.728 9.06818C107.492 9.57102 107.171 9.95455 106.765 10.2188C106.359 10.483 105.898 10.6151 105.384 10.6151C105.009 10.6151 104.698 10.5526 104.451 10.4276C104.204 10.3026 104.005 10.152 103.854 9.97585C103.707 9.79687 103.592 9.62784 103.509 9.46875H103.42V10.5H101.903ZM103.415 7.22727C103.415 7.65057 103.475 8.02131 103.594 8.33949C103.717 8.65767 103.891 8.90625 104.119 9.08523C104.349 9.26136 104.627 9.34943 104.954 9.34943C105.295 9.34943 105.58 9.25852 105.81 9.0767C106.04 8.89205 106.214 8.64062 106.33 8.32244C106.45 8.00142 106.509 7.63636 106.509 7.22727C106.509 6.82102 106.451 6.46023 106.334 6.14489C106.218 5.82955 106.045 5.58239 105.815 5.40341C105.584 5.22443 105.298 5.13494 104.954 5.13494C104.624 5.13494 104.344 5.22159 104.114 5.39489C103.884 5.56818 103.709 5.81108 103.59 6.12358C103.474 6.43608 103.415 6.80398 103.415 7.22727ZM110.996 1.77273V10.5H109.453V1.77273H110.996ZM115.54 10.6278C114.883 10.6278 114.317 10.4915 113.839 10.2188C113.365 9.94318 113 9.55398 112.744 9.05114C112.489 8.54545 112.361 7.95028 112.361 7.26562C112.361 6.59233 112.489 6.00142 112.744 5.4929C113.003 4.98153 113.364 4.58381 113.827 4.29972C114.29 4.01278 114.834 3.86932 115.459 3.86932C115.862 3.86932 116.243 3.93466 116.601 4.06534C116.962 4.19318 117.28 4.39205 117.555 4.66193C117.834 4.93182 118.053 5.27557 118.212 5.69318C118.371 6.10795 118.45 6.60227 118.45 7.17614V7.64915H113.085V6.60938H116.972C116.969 6.31392 116.905 6.05114 116.78 5.82102C116.655 5.58807 116.48 5.40483 116.256 5.27131C116.034 5.13778 115.776 5.07102 115.48 5.07102C115.165 5.07102 114.888 5.14773 114.649 5.30114C114.41 5.4517 114.224 5.65057 114.091 5.89773C113.96 6.14205 113.893 6.41051 113.891 6.70312V7.6108C113.891 7.99148 113.96 8.31818 114.099 8.59091C114.239 8.8608 114.433 9.06818 114.683 9.21307C114.933 9.35511 115.226 9.42614 115.561 9.42614C115.785 9.42614 115.989 9.39489 116.17 9.33239C116.352 9.26705 116.51 9.17188 116.643 9.04688C116.777 8.92188 116.878 8.76705 116.946 8.58239L118.386 8.74432C118.295 9.125 118.122 9.45739 117.866 9.74148C117.614 10.0227 117.29 10.2415 116.895 10.3977C116.5 10.5511 116.048 10.6278 115.54 10.6278ZM126.385 1.77273V10.5H124.804V3.31108H124.752L122.711 4.61506V3.16619L124.88 1.77273H126.385Z' fill='%23A54EEA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M18.4123 76.8982C21.9985 75.6198 25.9007 75.5278 29.5432 76.6359C33.1857 77.7439 36.3756 79.9934 38.6424 83.0523C40.3868 85.4063 41.5135 88.1439 41.9401 91.0157L46.4462 85.3831L48.0079 86.6325L41.9142 94.2497L41.3415 94.9656L40.5786 94.4571L31.438 88.3633L32.5474 86.6992L40.0118 91.6755C39.6775 88.994 38.6574 86.4317 37.0355 84.2431C35.024 81.5286 32.1934 79.5326 28.9611 78.5493C25.7289 77.566 22.2662 77.6477 19.0839 78.7821C15.9015 79.9165 13.168 82.0437 11.2866 84.8499L9.62545 83.7361C11.7456 80.5738 14.8261 78.1766 18.4123 76.8982ZM6.83609 93.0003L0.74234 100.617L2.30408 101.867L6.80997 96.2345C7.23661 99.1063 8.36326 101.844 10.1077 104.198C12.3745 107.257 15.5644 109.506 19.2069 110.614C22.8493 111.722 26.7515 111.63 30.3377 110.352C33.924 109.073 37.0044 106.676 39.1246 103.514L37.4634 102.4C35.582 105.206 32.8485 107.333 29.6662 108.468C26.4838 109.602 23.0212 109.684 19.7889 108.701C16.5567 107.717 13.726 105.721 11.7145 103.007C10.0926 100.818 9.07252 98.2559 8.73823 95.5744L16.2029 100.551L17.3123 98.8867L8.17166 92.7929L7.40882 92.2844L6.83609 93.0003Z' fill='%23CFCFCF'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_108_4278' x='70' y='30.5' width='222' height='165' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='20'/%3E%3CfeGaussianBlur stdDeviation='7.5'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_108_4278'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_108_4278' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_108_4278'%3E%3Crect x='86' y='31.5' width='190' height='128' rx='2' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
}

.figma-dark .svg2 {
	margin-right: -96px !important;
    width: 320px;
    height: 211px;
	background-size: contain;
	background-image: url("data:image/svg+xml,%3Csvg width='292' height='196' viewBox='0 0 292 196' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_108_4327)'%3E%3Cg clip-path='url(%23clip0_108_4327)'%3E%3Crect x='86' y='31.5' width='190' height='128' rx='2' fill='%232D2D2C'/%3E%3Crect width='95' height='43' transform='translate(86 31.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='86' y='31.5' width='95' height='43' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='95' height='43' transform='translate(181 31.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='181' y='31.5' width='95' height='43' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='95' height='43' transform='translate(86 74.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='86' y='74.5' width='95' height='43' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='95' height='43' transform='translate(181 74.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='181' y='74.5' width='95' height='43' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='95' height='42' transform='translate(86 117.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='86' y='117.5' width='95' height='42' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='95' height='42' transform='translate(181 117.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='181' y='117.5' width='95' height='42' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='86' y='31.5' width='190' height='128' rx='2' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='76' y='21.5' width='210' height='148' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='283' y='18.5' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='283' y='166.5' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='73' y='166.5' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='73' y='18.5' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M78 0.5L75.375 3.125L78 5.75L80.625 3.125L78 0.5ZM78 7.25L75.375 9.875L78 12.5L80.625 9.875L78 7.25ZM72 6.5L74.625 3.875L77.25 6.5L74.625 9.125L72 6.5ZM81.375 3.875L78.75 6.5L81.375 9.125L84 6.5L81.375 3.875Z' fill='%23A54EEA'/%3E%3Cpath d='M87.4773 3.09801V1.77273H94.4403V3.09801H91.7429V10.5H90.1747V3.09801H87.4773ZM96.7674 10.6321C96.3526 10.6321 95.979 10.5582 95.6466 10.4105C95.3171 10.2599 95.0557 10.0384 94.8626 9.74574C94.6722 9.45312 94.577 9.09233 94.577 8.66335C94.577 8.29403 94.6452 7.98864 94.7816 7.74716C94.918 7.50568 95.104 7.3125 95.3398 7.16761C95.5756 7.02273 95.8413 6.91335 96.1367 6.83949C96.435 6.76278 96.7432 6.70739 97.0614 6.6733C97.4449 6.63352 97.756 6.59801 97.9947 6.56676C98.2333 6.53267 98.4066 6.48153 98.5145 6.41335C98.6253 6.34233 98.6807 6.23295 98.6807 6.08523V6.05966C98.6807 5.73864 98.5856 5.49006 98.3952 5.31392C98.2049 5.13778 97.9307 5.04972 97.5728 5.04972C97.1949 5.04972 96.8952 5.1321 96.6736 5.29688C96.4549 5.46165 96.3072 5.65625 96.2305 5.88068L94.7901 5.67614C94.9037 5.27841 95.0913 4.94602 95.3526 4.67898C95.614 4.40909 95.9336 4.20739 96.3114 4.07386C96.6893 3.9375 97.1069 3.86932 97.5643 3.86932C97.8796 3.86932 98.1935 3.90625 98.506 3.98011C98.8185 4.05398 99.104 4.17614 99.3626 4.34659C99.6211 4.5142 99.8285 4.7429 99.9847 5.03267C100.144 5.32244 100.223 5.68466 100.223 6.11932V10.5H98.7404V9.60085H98.6893C98.5955 9.78267 98.4634 9.95312 98.293 10.1122C98.1253 10.2685 97.9137 10.3949 97.658 10.4915C97.4052 10.5852 97.1083 10.6321 96.7674 10.6321ZM97.168 9.49858C97.4776 9.49858 97.7461 9.4375 97.9734 9.31534C98.2006 9.19034 98.3753 9.02557 98.4975 8.82102C98.6225 8.61648 98.685 8.39347 98.685 8.15199V7.38068C98.6367 7.42045 98.5543 7.45739 98.4378 7.49148C98.3242 7.52557 98.1964 7.5554 98.0543 7.58097C97.9123 7.60653 97.7716 7.62926 97.6324 7.64915C97.4932 7.66903 97.3725 7.68608 97.2702 7.70028C97.0401 7.73153 96.8341 7.78267 96.6523 7.85369C96.4705 7.92472 96.327 8.02415 96.2219 8.15199C96.1168 8.27699 96.0643 8.43892 96.0643 8.63778C96.0643 8.92188 96.168 9.13636 96.3753 9.28125C96.5827 9.42614 96.8469 9.49858 97.168 9.49858ZM101.903 10.5V1.77273H103.445V5.03693H103.509C103.589 4.87784 103.701 4.70881 103.846 4.52983C103.991 4.34801 104.187 4.19318 104.434 4.06534C104.681 3.93466 104.996 3.86932 105.38 3.86932C105.886 3.86932 106.342 3.99858 106.748 4.2571C107.157 4.51278 107.481 4.89205 107.719 5.39489C107.961 5.89489 108.082 6.50852 108.082 7.2358C108.082 7.95455 107.964 8.56534 107.728 9.06818C107.492 9.57102 107.171 9.95455 106.765 10.2188C106.359 10.483 105.898 10.6151 105.384 10.6151C105.009 10.6151 104.698 10.5526 104.451 10.4276C104.204 10.3026 104.005 10.152 103.854 9.97585C103.707 9.79687 103.592 9.62784 103.509 9.46875H103.42V10.5H101.903ZM103.415 7.22727C103.415 7.65057 103.475 8.02131 103.594 8.33949C103.717 8.65767 103.891 8.90625 104.119 9.08523C104.349 9.26136 104.627 9.34943 104.954 9.34943C105.295 9.34943 105.58 9.25852 105.81 9.0767C106.04 8.89205 106.214 8.64062 106.33 8.32244C106.45 8.00142 106.509 7.63636 106.509 7.22727C106.509 6.82102 106.451 6.46023 106.334 6.14489C106.218 5.82955 106.045 5.58239 105.815 5.40341C105.584 5.22443 105.298 5.13494 104.954 5.13494C104.624 5.13494 104.344 5.22159 104.114 5.39489C103.884 5.56818 103.709 5.81108 103.59 6.12358C103.474 6.43608 103.415 6.80398 103.415 7.22727ZM110.996 1.77273V10.5H109.453V1.77273H110.996ZM115.54 10.6278C114.883 10.6278 114.317 10.4915 113.839 10.2188C113.365 9.94318 113 9.55398 112.744 9.05114C112.489 8.54545 112.361 7.95028 112.361 7.26562C112.361 6.59233 112.489 6.00142 112.744 5.4929C113.003 4.98153 113.364 4.58381 113.827 4.29972C114.29 4.01278 114.834 3.86932 115.459 3.86932C115.862 3.86932 116.243 3.93466 116.601 4.06534C116.962 4.19318 117.28 4.39205 117.555 4.66193C117.834 4.93182 118.053 5.27557 118.212 5.69318C118.371 6.10795 118.45 6.60227 118.45 7.17614V7.64915H113.085V6.60938H116.972C116.969 6.31392 116.905 6.05114 116.78 5.82102C116.655 5.58807 116.48 5.40483 116.256 5.27131C116.034 5.13778 115.776 5.07102 115.48 5.07102C115.165 5.07102 114.888 5.14773 114.649 5.30114C114.41 5.4517 114.224 5.65057 114.091 5.89773C113.96 6.14205 113.893 6.41051 113.891 6.70312V7.6108C113.891 7.99148 113.96 8.31818 114.099 8.59091C114.239 8.8608 114.433 9.06818 114.683 9.21307C114.933 9.35511 115.226 9.42614 115.561 9.42614C115.785 9.42614 115.989 9.39489 116.17 9.33239C116.352 9.26705 116.51 9.17188 116.643 9.04688C116.777 8.92188 116.878 8.76705 116.946 8.58239L118.386 8.74432C118.295 9.125 118.122 9.45739 117.866 9.74148C117.614 10.0227 117.29 10.2415 116.895 10.3977C116.5 10.5511 116.048 10.6278 115.54 10.6278ZM126.385 1.77273V10.5H124.804V3.31108H124.752L122.711 4.61506V3.16619L124.88 1.77273H126.385Z' fill='%23A54EEA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M18.4123 76.8982C21.9985 75.6198 25.9007 75.5278 29.5432 76.6359C33.1857 77.7439 36.3756 79.9934 38.6424 83.0523C40.3868 85.4063 41.5135 88.1439 41.9401 91.0157L46.4462 85.3831L48.0079 86.6325L41.9142 94.2497L41.3415 94.9656L40.5786 94.4571L31.438 88.3633L32.5474 86.6992L40.0118 91.6755C39.6775 88.994 38.6574 86.4317 37.0355 84.2431C35.024 81.5286 32.1934 79.5326 28.9611 78.5493C25.7289 77.566 22.2662 77.6477 19.0839 78.7821C15.9015 79.9165 13.168 82.0437 11.2866 84.8499L9.62545 83.7361C11.7456 80.5738 14.8261 78.1766 18.4123 76.8982ZM6.83609 93.0003L0.74234 100.617L2.30408 101.867L6.80997 96.2345C7.23661 99.1063 8.36326 101.844 10.1077 104.198C12.3745 107.257 15.5644 109.506 19.2069 110.614C22.8493 111.722 26.7515 111.63 30.3377 110.352C33.924 109.073 37.0044 106.676 39.1246 103.514L37.4634 102.4C35.582 105.206 32.8485 107.333 29.6662 108.468C26.4838 109.602 23.0212 109.684 19.7889 108.701C16.5567 107.717 13.726 105.721 11.7145 103.007C10.0926 100.818 9.07252 98.2559 8.73823 95.5744L16.2029 100.551L17.3123 98.8867L8.17166 92.7929L7.40882 92.2844L6.83609 93.0003Z' fill='%235C5C5C'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_108_4327' x='70' y='30.5' width='222' height='165' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='20'/%3E%3CfeGaussianBlur stdDeviation='7.5'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_108_4327'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_108_4327' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_108_4327'%3E%3Crect x='86' y='31.5' width='190' height='128' rx='2' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
}

.figma-light .svg3 {
	margin-left: -96px !important;
    width: 441px;
    height: 223px;
	/* background-size: contain; */
    background-image: url("data:image/svg+xml,%3Csvg width='441' height='223' viewBox='0 0 441 223' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='4' y='21' width='180' height='129' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 0L3.375 2.625L6 5.25L8.625 2.625L6 0ZM6 6.75L3.375 9.375L6 12L8.625 9.375L6 6.75ZM0 6L2.625 3.375L5.25 6L2.625 8.625L0 6ZM9.375 3.375L6.75 6L9.375 8.625L12 6L9.375 3.375Z' fill='%23A54EEA'/%3E%3Cpath d='M15.4773 2.59801V1.27273H22.4403V2.59801H19.7429V10H18.1747V2.59801H15.4773ZM24.7674 10.1321C24.3526 10.1321 23.979 10.0582 23.6466 9.91051C23.3171 9.75994 23.0557 9.53835 22.8626 9.24574C22.6722 8.95312 22.577 8.59233 22.577 8.16335C22.577 7.79403 22.6452 7.48864 22.7816 7.24716C22.918 7.00568 23.104 6.8125 23.3398 6.66761C23.5756 6.52273 23.8413 6.41335 24.1367 6.33949C24.435 6.26278 24.7432 6.20739 25.0614 6.1733C25.4449 6.13352 25.756 6.09801 25.9947 6.06676C26.2333 6.03267 26.4066 5.98153 26.5145 5.91335C26.6253 5.84233 26.6807 5.73295 26.6807 5.58523V5.55966C26.6807 5.23864 26.5856 4.99006 26.3952 4.81392C26.2049 4.63778 25.9307 4.54972 25.5728 4.54972C25.1949 4.54972 24.8952 4.6321 24.6736 4.79688C24.4549 4.96165 24.3072 5.15625 24.2305 5.38068L22.7901 5.17614C22.9037 4.77841 23.0913 4.44602 23.3526 4.17898C23.614 3.90909 23.9336 3.70739 24.3114 3.57386C24.6893 3.4375 25.1069 3.36932 25.5643 3.36932C25.8796 3.36932 26.1935 3.40625 26.506 3.48011C26.8185 3.55398 27.104 3.67614 27.3626 3.84659C27.6211 4.0142 27.8285 4.2429 27.9847 4.53267C28.1438 4.82244 28.2234 5.18466 28.2234 5.61932V10H26.7404V9.10085H26.6893C26.5955 9.28267 26.4634 9.45312 26.293 9.61222C26.1253 9.76847 25.9137 9.89489 25.658 9.99148C25.4052 10.0852 25.1083 10.1321 24.7674 10.1321ZM25.168 8.99858C25.4776 8.99858 25.7461 8.9375 25.9734 8.81534C26.2006 8.69034 26.3753 8.52557 26.4975 8.32102C26.6225 8.11648 26.685 7.89347 26.685 7.65199V6.88068C26.6367 6.92045 26.5543 6.95739 26.4378 6.99148C26.3242 7.02557 26.1964 7.0554 26.0543 7.08097C25.9123 7.10653 25.7716 7.12926 25.6324 7.14915C25.4932 7.16903 25.3725 7.18608 25.2702 7.20028C25.0401 7.23153 24.8341 7.28267 24.6523 7.35369C24.4705 7.42472 24.327 7.52415 24.2219 7.65199C24.1168 7.77699 24.0643 7.93892 24.0643 8.13778C24.0643 8.42188 24.168 8.63636 24.3753 8.78125C24.5827 8.92614 24.8469 8.99858 25.168 8.99858ZM29.9027 10V1.27273H31.4453V4.53693H31.5092C31.5887 4.37784 31.701 4.20881 31.8459 4.02983C31.9907 3.84801 32.1868 3.69318 32.4339 3.56534C32.6811 3.43466 32.9964 3.36932 33.3799 3.36932C33.8856 3.36932 34.3416 3.49858 34.7478 3.7571C35.1569 4.01278 35.4808 4.39205 35.7194 4.89489C35.9609 5.39489 36.0816 6.00852 36.0816 6.7358C36.0816 7.45455 35.9638 8.06534 35.728 8.56818C35.4922 9.07102 35.1711 9.45455 34.7649 9.71875C34.3586 9.98295 33.8984 10.1151 33.3842 10.1151C33.0092 10.1151 32.6981 10.0526 32.451 9.92756C32.2038 9.80256 32.0049 9.65199 31.8544 9.47585C31.7066 9.29687 31.5916 9.12784 31.5092 8.96875H31.4197V10H29.9027ZM31.4155 6.72727C31.4155 7.15057 31.4751 7.52131 31.5944 7.83949C31.7166 8.15767 31.8913 8.40625 32.1186 8.58523C32.3487 8.76136 32.6271 8.84943 32.9538 8.84943C33.2947 8.84943 33.5802 8.75852 33.8103 8.5767C34.0405 8.39205 34.2138 8.14062 34.3302 7.82244C34.4495 7.50142 34.5092 7.13636 34.5092 6.72727C34.5092 6.32102 34.451 5.96023 34.3345 5.64489C34.218 5.32955 34.0447 5.08239 33.8146 4.90341C33.5845 4.72443 33.2976 4.63494 32.9538 4.63494C32.6243 4.63494 32.3444 4.72159 32.1143 4.89489C31.8842 5.06818 31.7095 5.31108 31.5902 5.62358C31.4737 5.93608 31.4155 6.30398 31.4155 6.72727ZM38.9957 1.27273V10H37.4531V1.27273H38.9957ZM43.5397 10.1278C42.8835 10.1278 42.3167 9.99148 41.8394 9.71875C41.365 9.44318 40.9999 9.05398 40.7443 8.55114C40.4886 8.04545 40.3607 7.45028 40.3607 6.76562C40.3607 6.09233 40.4886 5.50142 40.7443 4.9929C41.0028 4.48153 41.3636 4.08381 41.8266 3.79972C42.2897 3.51278 42.8337 3.36932 43.4587 3.36932C43.8622 3.36932 44.2428 3.43466 44.6008 3.56534C44.9616 3.69318 45.2798 3.89205 45.5553 4.16193C45.8338 4.43182 46.0525 4.77557 46.2116 5.19318C46.3707 5.60795 46.4502 6.10227 46.4502 6.67614V7.14915H41.0852V6.10938H44.9715C44.9687 5.81392 44.9048 5.55114 44.7798 5.32102C44.6548 5.08807 44.4801 4.90483 44.2556 4.77131C44.034 4.63778 43.7755 4.57102 43.4801 4.57102C43.1647 4.57102 42.8877 4.64773 42.6491 4.80114C42.4105 4.9517 42.2244 5.15057 42.0909 5.39773C41.9602 5.64205 41.8934 5.91051 41.8906 6.20312V7.1108C41.8906 7.49148 41.9602 7.81818 42.0994 8.09091C42.2386 8.3608 42.4332 8.56818 42.6832 8.71307C42.9332 8.85511 43.2258 8.92614 43.561 8.92614C43.7855 8.92614 43.9886 8.89489 44.1704 8.83239C44.3522 8.76705 44.5099 8.67188 44.6434 8.54688C44.7769 8.42188 44.8778 8.26705 44.946 8.08239L46.3863 8.24432C46.2954 8.625 46.1221 8.95739 45.8664 9.24148C45.6136 9.52273 45.2897 9.74148 44.8948 9.89773C44.4999 10.0511 44.0482 10.1278 43.5397 10.1278ZM54.3845 1.27273V10H52.8035V2.81108H52.7524L50.7112 4.11506V2.66619L52.8802 1.27273H54.3845Z' fill='%23A54EEA'/%3E%3Cg filter='url(%23filter0_d_30_315)'%3E%3Cg clip-path='url(%23clip0_30_315)'%3E%3Crect x='14' y='31.1667' width='160' height='109' rx='2' fill='white'/%3E%3Crect width='80' height='36.3333' transform='translate(14 31.1667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='31.1667' width='80' height='36.3333' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 31.1667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='31.1667' width='80' height='36.3333' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 67.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='67.5' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 67.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='67.5' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 103.833)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='103.833' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 103.833)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='103.833' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='31.1667' width='160' height='109' rx='2' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Cg filter='url(%23filter1_d_30_315)'%3E%3Cg clip-path='url(%23clip1_30_315)'%3E%3Crect x='267' y='85' width='160' height='109' rx='8' fill='%23FFF4F4'/%3E%3Crect width='80' height='36.3333' transform='translate(267 85)' fill='white' fill-opacity='0.01'/%3E%3Crect x='267' y='85' width='80' height='36.3333' fill='%23FFDDDD' stroke='%23F26E6E' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(347 85)' fill='white' fill-opacity='0.01'/%3E%3Crect x='347' y='85' width='80' height='36.3333' fill='%23FFDDDD' stroke='%23F26E6E' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(267 121.333)' fill='white' fill-opacity='0.01'/%3E%3Crect x='267' y='121.333' width='80' height='36.3333' stroke='%23F26E6E' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(347 121.333)' fill='white' fill-opacity='0.01'/%3E%3Crect x='347' y='121.333' width='80' height='36.3333' stroke='%23F26E6E' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(267 157.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='267' y='157.667' width='80' height='36.3333' stroke='%23F26E6E' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(347 157.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='347' y='157.667' width='80' height='36.3333' stroke='%23F26E6E' stroke-width='2'/%3E%3C/g%3E%3Crect x='267' y='85' width='160' height='109' rx='8' stroke='%23F26E6E' stroke-width='2'/%3E%3C/g%3E%3Crect x='257' y='75' width='180' height='129' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M259 54L256.375 56.625L259 59.25L261.625 56.625L259 54ZM259 60.75L256.375 63.375L259 66L261.625 63.375L259 60.75ZM253 60L255.625 57.375L258.25 60L255.625 62.625L253 60ZM262.375 57.375L259.75 60L262.375 62.625L265 60L262.375 57.375Z' fill='%23A54EEA'/%3E%3Cpath d='M268.477 56.598V55.2727H275.44V56.598H272.743V64H271.175V56.598H268.477ZM277.767 64.1321C277.353 64.1321 276.979 64.0582 276.647 63.9105C276.317 63.7599 276.056 63.5384 275.863 63.2457C275.672 62.9531 275.577 62.5923 275.577 62.1634C275.577 61.794 275.645 61.4886 275.782 61.2472C275.918 61.0057 276.104 60.8125 276.34 60.6676C276.576 60.5227 276.841 60.4134 277.137 60.3395C277.435 60.2628 277.743 60.2074 278.061 60.1733C278.445 60.1335 278.756 60.098 278.995 60.0668C279.233 60.0327 279.407 59.9815 279.515 59.9134C279.625 59.8423 279.681 59.733 279.681 59.5852V59.5597C279.681 59.2386 279.586 58.9901 279.395 58.8139C279.205 58.6378 278.931 58.5497 278.573 58.5497C278.195 58.5497 277.895 58.6321 277.674 58.7969C277.455 58.9616 277.307 59.1562 277.23 59.3807L275.79 59.1761C275.904 58.7784 276.091 58.446 276.353 58.179C276.614 57.9091 276.934 57.7074 277.311 57.5739C277.689 57.4375 278.107 57.3693 278.564 57.3693C278.88 57.3693 279.194 57.4062 279.506 57.4801C279.819 57.554 280.104 57.6761 280.363 57.8466C280.621 58.0142 280.828 58.2429 280.985 58.5327C281.144 58.8224 281.223 59.1847 281.223 59.6193V64H279.74V63.1009H279.689C279.596 63.2827 279.463 63.4531 279.293 63.6122C279.125 63.7685 278.914 63.8949 278.658 63.9915C278.405 64.0852 278.108 64.1321 277.767 64.1321ZM278.168 62.9986C278.478 62.9986 278.746 62.9375 278.973 62.8153C279.201 62.6903 279.375 62.5256 279.497 62.321C279.622 62.1165 279.685 61.8935 279.685 61.652V60.8807C279.637 60.9205 279.554 60.9574 279.438 60.9915C279.324 61.0256 279.196 61.0554 279.054 61.081C278.912 61.1065 278.772 61.1293 278.632 61.1491C278.493 61.169 278.373 61.1861 278.27 61.2003C278.04 61.2315 277.834 61.2827 277.652 61.3537C277.471 61.4247 277.327 61.5241 277.222 61.652C277.117 61.777 277.064 61.9389 277.064 62.1378C277.064 62.4219 277.168 62.6364 277.375 62.7812C277.583 62.9261 277.847 62.9986 278.168 62.9986ZM282.903 64V55.2727H284.445V58.5369H284.509C284.589 58.3778 284.701 58.2088 284.846 58.0298C284.991 57.848 285.187 57.6932 285.434 57.5653C285.681 57.4347 285.996 57.3693 286.38 57.3693C286.886 57.3693 287.342 57.4986 287.748 57.7571C288.157 58.0128 288.481 58.392 288.719 58.8949C288.961 59.3949 289.082 60.0085 289.082 60.7358C289.082 61.4545 288.964 62.0653 288.728 62.5682C288.492 63.071 288.171 63.4545 287.765 63.7188C287.359 63.983 286.898 64.1151 286.384 64.1151C286.009 64.1151 285.698 64.0526 285.451 63.9276C285.204 63.8026 285.005 63.652 284.854 63.4759C284.707 63.2969 284.592 63.1278 284.509 62.9688H284.42V64H282.903ZM284.415 60.7273C284.415 61.1506 284.475 61.5213 284.594 61.8395C284.717 62.1577 284.891 62.4062 285.119 62.5852C285.349 62.7614 285.627 62.8494 285.954 62.8494C286.295 62.8494 286.58 62.7585 286.81 62.5767C287.04 62.392 287.214 62.1406 287.33 61.8224C287.45 61.5014 287.509 61.1364 287.509 60.7273C287.509 60.321 287.451 59.9602 287.334 59.6449C287.218 59.3295 287.045 59.0824 286.815 58.9034C286.584 58.7244 286.298 58.6349 285.954 58.6349C285.624 58.6349 285.344 58.7216 285.114 58.8949C284.884 59.0682 284.709 59.3111 284.59 59.6236C284.474 59.9361 284.415 60.304 284.415 60.7273ZM291.996 55.2727V64H290.453V55.2727H291.996ZM296.54 64.1278C295.883 64.1278 295.317 63.9915 294.839 63.7188C294.365 63.4432 294 63.054 293.744 62.5511C293.489 62.0455 293.361 61.4503 293.361 60.7656C293.361 60.0923 293.489 59.5014 293.744 58.9929C294.003 58.4815 294.364 58.0838 294.827 57.7997C295.29 57.5128 295.834 57.3693 296.459 57.3693C296.862 57.3693 297.243 57.4347 297.601 57.5653C297.962 57.6932 298.28 57.892 298.555 58.1619C298.834 58.4318 299.053 58.7756 299.212 59.1932C299.371 59.608 299.45 60.1023 299.45 60.6761V61.1491H294.085V60.1094H297.972C297.969 59.8139 297.905 59.5511 297.78 59.321C297.655 59.0881 297.48 58.9048 297.256 58.7713C297.034 58.6378 296.776 58.571 296.48 58.571C296.165 58.571 295.888 58.6477 295.649 58.8011C295.41 58.9517 295.224 59.1506 295.091 59.3977C294.96 59.642 294.893 59.9105 294.891 60.2031V61.1108C294.891 61.4915 294.96 61.8182 295.099 62.0909C295.239 62.3608 295.433 62.5682 295.683 62.7131C295.933 62.8551 296.226 62.9261 296.561 62.9261C296.785 62.9261 296.989 62.8949 297.17 62.8324C297.352 62.767 297.51 62.6719 297.643 62.5469C297.777 62.4219 297.878 62.267 297.946 62.0824L299.386 62.2443C299.295 62.625 299.122 62.9574 298.866 63.2415C298.614 63.5227 298.29 63.7415 297.895 63.8977C297.5 64.0511 297.048 64.1278 296.54 64.1278ZM303.835 64V62.858L306.865 59.8878C307.154 59.5952 307.396 59.3352 307.589 59.108C307.782 58.8807 307.927 58.6605 308.024 58.4474C308.12 58.2344 308.169 58.0071 308.169 57.7656C308.169 57.4901 308.106 57.2543 307.981 57.0582C307.856 56.8594 307.684 56.706 307.465 56.598C307.247 56.4901 306.998 56.4361 306.72 56.4361C306.433 56.4361 306.181 56.4957 305.965 56.6151C305.75 56.7315 305.582 56.8977 305.463 57.1136C305.346 57.3295 305.288 57.5866 305.288 57.8849H303.784C303.784 57.331 303.91 56.8494 304.163 56.4403C304.416 56.0312 304.764 55.7145 305.207 55.4901C305.653 55.2656 306.164 55.1534 306.741 55.1534C307.326 55.1534 307.84 55.2628 308.284 55.4815C308.727 55.7003 309.071 56 309.315 56.3807C309.562 56.7614 309.686 57.196 309.686 57.6847C309.686 58.0114 309.623 58.3324 309.498 58.6477C309.373 58.9631 309.153 59.3125 308.838 59.696C308.525 60.0795 308.086 60.544 307.521 61.0895L306.017 62.6193V62.679H309.818V64H303.835Z' fill='%23A54EEA'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_30_315' x='1' y='30.1667' width='186' height='139' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_30_315'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_30_315' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_30_315' x='254' y='84' width='186' height='139' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_30_315'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_30_315' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_30_315'%3E%3Crect x='14' y='31.1667' width='160' height='109' rx='2' fill='white'/%3E%3C/clipPath%3E%3CclipPath id='clip1_30_315'%3E%3Crect x='267' y='85' width='160' height='109' rx='8' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
}

.figma-dark .svg3 {
    width: 441px;
    height: 223px;
	margin-left: -96px !important;
	background-image: url("data:image/svg+xml,%3Csvg width='441' height='223' viewBox='0 0 441 223' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='4' y='21' width='180' height='129' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 0L3.375 2.625L6 5.25L8.625 2.625L6 0ZM6 6.75L3.375 9.375L6 12L8.625 9.375L6 6.75ZM0 6L2.625 3.375L5.25 6L2.625 8.625L0 6ZM9.375 3.375L6.75 6L9.375 8.625L12 6L9.375 3.375Z' fill='%23A54EEA'/%3E%3Cpath d='M15.4773 2.59801V1.27273H22.4403V2.59801H19.7429V10H18.1747V2.59801H15.4773ZM24.7674 10.1321C24.3526 10.1321 23.979 10.0582 23.6466 9.91051C23.3171 9.75994 23.0557 9.53835 22.8626 9.24574C22.6722 8.95312 22.577 8.59233 22.577 8.16335C22.577 7.79403 22.6452 7.48864 22.7816 7.24716C22.918 7.00568 23.104 6.8125 23.3398 6.66761C23.5756 6.52273 23.8413 6.41335 24.1367 6.33949C24.435 6.26278 24.7432 6.20739 25.0614 6.1733C25.4449 6.13352 25.756 6.09801 25.9947 6.06676C26.2333 6.03267 26.4066 5.98153 26.5145 5.91335C26.6253 5.84233 26.6807 5.73295 26.6807 5.58523V5.55966C26.6807 5.23864 26.5856 4.99006 26.3952 4.81392C26.2049 4.63778 25.9307 4.54972 25.5728 4.54972C25.1949 4.54972 24.8952 4.6321 24.6736 4.79688C24.4549 4.96165 24.3072 5.15625 24.2305 5.38068L22.7901 5.17614C22.9037 4.77841 23.0913 4.44602 23.3526 4.17898C23.614 3.90909 23.9336 3.70739 24.3114 3.57386C24.6893 3.4375 25.1069 3.36932 25.5643 3.36932C25.8796 3.36932 26.1935 3.40625 26.506 3.48011C26.8185 3.55398 27.104 3.67614 27.3626 3.84659C27.6211 4.0142 27.8285 4.2429 27.9847 4.53267C28.1438 4.82244 28.2234 5.18466 28.2234 5.61932V10H26.7404V9.10085H26.6893C26.5955 9.28267 26.4634 9.45312 26.293 9.61222C26.1253 9.76847 25.9137 9.89489 25.658 9.99148C25.4052 10.0852 25.1083 10.1321 24.7674 10.1321ZM25.168 8.99858C25.4776 8.99858 25.7461 8.9375 25.9734 8.81534C26.2006 8.69034 26.3753 8.52557 26.4975 8.32102C26.6225 8.11648 26.685 7.89347 26.685 7.65199V6.88068C26.6367 6.92045 26.5543 6.95739 26.4378 6.99148C26.3242 7.02557 26.1964 7.0554 26.0543 7.08097C25.9123 7.10653 25.7716 7.12926 25.6324 7.14915C25.4932 7.16903 25.3725 7.18608 25.2702 7.20028C25.0401 7.23153 24.8341 7.28267 24.6523 7.35369C24.4705 7.42472 24.327 7.52415 24.2219 7.65199C24.1168 7.77699 24.0643 7.93892 24.0643 8.13778C24.0643 8.42188 24.168 8.63636 24.3753 8.78125C24.5827 8.92614 24.8469 8.99858 25.168 8.99858ZM29.9027 10V1.27273H31.4453V4.53693H31.5092C31.5887 4.37784 31.701 4.20881 31.8459 4.02983C31.9907 3.84801 32.1868 3.69318 32.4339 3.56534C32.6811 3.43466 32.9964 3.36932 33.3799 3.36932C33.8856 3.36932 34.3416 3.49858 34.7478 3.7571C35.1569 4.01278 35.4808 4.39205 35.7194 4.89489C35.9609 5.39489 36.0816 6.00852 36.0816 6.7358C36.0816 7.45455 35.9638 8.06534 35.728 8.56818C35.4922 9.07102 35.1711 9.45455 34.7649 9.71875C34.3586 9.98295 33.8984 10.1151 33.3842 10.1151C33.0092 10.1151 32.6981 10.0526 32.451 9.92756C32.2038 9.80256 32.0049 9.65199 31.8544 9.47585C31.7066 9.29687 31.5916 9.12784 31.5092 8.96875H31.4197V10H29.9027ZM31.4155 6.72727C31.4155 7.15057 31.4751 7.52131 31.5944 7.83949C31.7166 8.15767 31.8913 8.40625 32.1186 8.58523C32.3487 8.76136 32.6271 8.84943 32.9538 8.84943C33.2947 8.84943 33.5802 8.75852 33.8103 8.5767C34.0405 8.39205 34.2138 8.14062 34.3302 7.82244C34.4495 7.50142 34.5092 7.13636 34.5092 6.72727C34.5092 6.32102 34.451 5.96023 34.3345 5.64489C34.218 5.32955 34.0447 5.08239 33.8146 4.90341C33.5845 4.72443 33.2976 4.63494 32.9538 4.63494C32.6243 4.63494 32.3444 4.72159 32.1143 4.89489C31.8842 5.06818 31.7095 5.31108 31.5902 5.62358C31.4737 5.93608 31.4155 6.30398 31.4155 6.72727ZM38.9957 1.27273V10H37.4531V1.27273H38.9957ZM43.5397 10.1278C42.8835 10.1278 42.3167 9.99148 41.8394 9.71875C41.365 9.44318 40.9999 9.05398 40.7443 8.55114C40.4886 8.04545 40.3607 7.45028 40.3607 6.76562C40.3607 6.09233 40.4886 5.50142 40.7443 4.9929C41.0028 4.48153 41.3636 4.08381 41.8266 3.79972C42.2897 3.51278 42.8337 3.36932 43.4587 3.36932C43.8622 3.36932 44.2428 3.43466 44.6008 3.56534C44.9616 3.69318 45.2798 3.89205 45.5553 4.16193C45.8338 4.43182 46.0525 4.77557 46.2116 5.19318C46.3707 5.60795 46.4502 6.10227 46.4502 6.67614V7.14915H41.0852V6.10938H44.9715C44.9687 5.81392 44.9048 5.55114 44.7798 5.32102C44.6548 5.08807 44.4801 4.90483 44.2556 4.77131C44.034 4.63778 43.7755 4.57102 43.4801 4.57102C43.1647 4.57102 42.8877 4.64773 42.6491 4.80114C42.4105 4.9517 42.2244 5.15057 42.0909 5.39773C41.9602 5.64205 41.8934 5.91051 41.8906 6.20312V7.1108C41.8906 7.49148 41.9602 7.81818 42.0994 8.09091C42.2386 8.3608 42.4332 8.56818 42.6832 8.71307C42.9332 8.85511 43.2258 8.92614 43.561 8.92614C43.7855 8.92614 43.9886 8.89489 44.1704 8.83239C44.3522 8.76705 44.5099 8.67188 44.6434 8.54688C44.7769 8.42188 44.8778 8.26705 44.946 8.08239L46.3863 8.24432C46.2954 8.625 46.1221 8.95739 45.8664 9.24148C45.6136 9.52273 45.2897 9.74148 44.8948 9.89773C44.4999 10.0511 44.0482 10.1278 43.5397 10.1278ZM54.3845 1.27273V10H52.8035V2.81108H52.7524L50.7112 4.11506V2.66619L52.8802 1.27273H54.3845Z' fill='%23A54EEA'/%3E%3Cg filter='url(%23filter0_d_30_313)'%3E%3Cg clip-path='url(%23clip0_30_313)'%3E%3Crect x='14' y='31.1667' width='160' height='109' rx='2' fill='%232D2D2C'/%3E%3Crect width='80' height='36.3333' transform='translate(14 31.1667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='31.1667' width='80' height='36.3333' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 31.1667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='31.1667' width='80' height='36.3333' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 67.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='67.5' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 67.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='67.5' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 103.833)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='103.833' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 103.833)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='103.833' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='31.1667' width='160' height='109' rx='2' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Cg filter='url(%23filter1_d_30_313)'%3E%3Cg clip-path='url(%23clip1_30_313)'%3E%3Crect x='267' y='85' width='160' height='109' rx='8' fill='%23322222'/%3E%3Crect width='80' height='36.3333' transform='translate(267 85)' fill='white' fill-opacity='0.01'/%3E%3Crect x='267' y='85' width='80' height='36.3333' fill='%236F3737' stroke='%23F26E6E' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(347 85)' fill='white' fill-opacity='0.01'/%3E%3Crect x='347' y='85' width='80' height='36.3333' fill='%236F3737' stroke='%23F26E6E' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(267 121.333)' fill='white' fill-opacity='0.01'/%3E%3Crect x='267' y='121.333' width='80' height='36.3333' stroke='%23F26E6E' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(347 121.333)' fill='white' fill-opacity='0.01'/%3E%3Crect x='347' y='121.333' width='80' height='36.3333' stroke='%23F26E6E' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(267 157.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='267' y='157.667' width='80' height='36.3333' stroke='%23F26E6E' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(347 157.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='347' y='157.667' width='80' height='36.3333' stroke='%23F26E6E' stroke-width='2'/%3E%3C/g%3E%3Crect x='267' y='85' width='160' height='109' rx='8' stroke='%23F26E6E' stroke-width='2'/%3E%3C/g%3E%3Crect x='257' y='75' width='180' height='129' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M259 54L256.375 56.625L259 59.25L261.625 56.625L259 54ZM259 60.75L256.375 63.375L259 66L261.625 63.375L259 60.75ZM253 60L255.625 57.375L258.25 60L255.625 62.625L253 60ZM262.375 57.375L259.75 60L262.375 62.625L265 60L262.375 57.375Z' fill='%23A54EEA'/%3E%3Cpath d='M268.477 56.598V55.2727H275.44V56.598H272.743V64H271.175V56.598H268.477ZM277.767 64.1321C277.353 64.1321 276.979 64.0582 276.647 63.9105C276.317 63.7599 276.056 63.5384 275.863 63.2457C275.672 62.9531 275.577 62.5923 275.577 62.1634C275.577 61.794 275.645 61.4886 275.782 61.2472C275.918 61.0057 276.104 60.8125 276.34 60.6676C276.576 60.5227 276.841 60.4134 277.137 60.3395C277.435 60.2628 277.743 60.2074 278.061 60.1733C278.445 60.1335 278.756 60.098 278.995 60.0668C279.233 60.0327 279.407 59.9815 279.515 59.9134C279.625 59.8423 279.681 59.733 279.681 59.5852V59.5597C279.681 59.2386 279.586 58.9901 279.395 58.8139C279.205 58.6378 278.931 58.5497 278.573 58.5497C278.195 58.5497 277.895 58.6321 277.674 58.7969C277.455 58.9616 277.307 59.1562 277.23 59.3807L275.79 59.1761C275.904 58.7784 276.091 58.446 276.353 58.179C276.614 57.9091 276.934 57.7074 277.311 57.5739C277.689 57.4375 278.107 57.3693 278.564 57.3693C278.88 57.3693 279.194 57.4062 279.506 57.4801C279.819 57.554 280.104 57.6761 280.363 57.8466C280.621 58.0142 280.828 58.2429 280.985 58.5327C281.144 58.8224 281.223 59.1847 281.223 59.6193V64H279.74V63.1009H279.689C279.596 63.2827 279.463 63.4531 279.293 63.6122C279.125 63.7685 278.914 63.8949 278.658 63.9915C278.405 64.0852 278.108 64.1321 277.767 64.1321ZM278.168 62.9986C278.478 62.9986 278.746 62.9375 278.973 62.8153C279.201 62.6903 279.375 62.5256 279.497 62.321C279.622 62.1165 279.685 61.8935 279.685 61.652V60.8807C279.637 60.9205 279.554 60.9574 279.438 60.9915C279.324 61.0256 279.196 61.0554 279.054 61.081C278.912 61.1065 278.772 61.1293 278.632 61.1491C278.493 61.169 278.373 61.1861 278.27 61.2003C278.04 61.2315 277.834 61.2827 277.652 61.3537C277.471 61.4247 277.327 61.5241 277.222 61.652C277.117 61.777 277.064 61.9389 277.064 62.1378C277.064 62.4219 277.168 62.6364 277.375 62.7812C277.583 62.9261 277.847 62.9986 278.168 62.9986ZM282.903 64V55.2727H284.445V58.5369H284.509C284.589 58.3778 284.701 58.2088 284.846 58.0298C284.991 57.848 285.187 57.6932 285.434 57.5653C285.681 57.4347 285.996 57.3693 286.38 57.3693C286.886 57.3693 287.342 57.4986 287.748 57.7571C288.157 58.0128 288.481 58.392 288.719 58.8949C288.961 59.3949 289.082 60.0085 289.082 60.7358C289.082 61.4545 288.964 62.0653 288.728 62.5682C288.492 63.071 288.171 63.4545 287.765 63.7188C287.359 63.983 286.898 64.1151 286.384 64.1151C286.009 64.1151 285.698 64.0526 285.451 63.9276C285.204 63.8026 285.005 63.652 284.854 63.4759C284.707 63.2969 284.592 63.1278 284.509 62.9688H284.42V64H282.903ZM284.415 60.7273C284.415 61.1506 284.475 61.5213 284.594 61.8395C284.717 62.1577 284.891 62.4062 285.119 62.5852C285.349 62.7614 285.627 62.8494 285.954 62.8494C286.295 62.8494 286.58 62.7585 286.81 62.5767C287.04 62.392 287.214 62.1406 287.33 61.8224C287.45 61.5014 287.509 61.1364 287.509 60.7273C287.509 60.321 287.451 59.9602 287.334 59.6449C287.218 59.3295 287.045 59.0824 286.815 58.9034C286.584 58.7244 286.298 58.6349 285.954 58.6349C285.624 58.6349 285.344 58.7216 285.114 58.8949C284.884 59.0682 284.709 59.3111 284.59 59.6236C284.474 59.9361 284.415 60.304 284.415 60.7273ZM291.996 55.2727V64H290.453V55.2727H291.996ZM296.54 64.1278C295.883 64.1278 295.317 63.9915 294.839 63.7188C294.365 63.4432 294 63.054 293.744 62.5511C293.489 62.0455 293.361 61.4503 293.361 60.7656C293.361 60.0923 293.489 59.5014 293.744 58.9929C294.003 58.4815 294.364 58.0838 294.827 57.7997C295.29 57.5128 295.834 57.3693 296.459 57.3693C296.862 57.3693 297.243 57.4347 297.601 57.5653C297.962 57.6932 298.28 57.892 298.555 58.1619C298.834 58.4318 299.053 58.7756 299.212 59.1932C299.371 59.608 299.45 60.1023 299.45 60.6761V61.1491H294.085V60.1094H297.972C297.969 59.8139 297.905 59.5511 297.78 59.321C297.655 59.0881 297.48 58.9048 297.256 58.7713C297.034 58.6378 296.776 58.571 296.48 58.571C296.165 58.571 295.888 58.6477 295.649 58.8011C295.41 58.9517 295.224 59.1506 295.091 59.3977C294.96 59.642 294.893 59.9105 294.891 60.2031V61.1108C294.891 61.4915 294.96 61.8182 295.099 62.0909C295.239 62.3608 295.433 62.5682 295.683 62.7131C295.933 62.8551 296.226 62.9261 296.561 62.9261C296.785 62.9261 296.989 62.8949 297.17 62.8324C297.352 62.767 297.51 62.6719 297.643 62.5469C297.777 62.4219 297.878 62.267 297.946 62.0824L299.386 62.2443C299.295 62.625 299.122 62.9574 298.866 63.2415C298.614 63.5227 298.29 63.7415 297.895 63.8977C297.5 64.0511 297.048 64.1278 296.54 64.1278ZM303.835 64V62.858L306.865 59.8878C307.154 59.5952 307.396 59.3352 307.589 59.108C307.782 58.8807 307.927 58.6605 308.024 58.4474C308.12 58.2344 308.169 58.0071 308.169 57.7656C308.169 57.4901 308.106 57.2543 307.981 57.0582C307.856 56.8594 307.684 56.706 307.465 56.598C307.247 56.4901 306.998 56.4361 306.72 56.4361C306.433 56.4361 306.181 56.4957 305.965 56.6151C305.75 56.7315 305.582 56.8977 305.463 57.1136C305.346 57.3295 305.288 57.5866 305.288 57.8849H303.784C303.784 57.331 303.91 56.8494 304.163 56.4403C304.416 56.0312 304.764 55.7145 305.207 55.4901C305.653 55.2656 306.164 55.1534 306.741 55.1534C307.326 55.1534 307.84 55.2628 308.284 55.4815C308.727 55.7003 309.071 56 309.315 56.3807C309.562 56.7614 309.686 57.196 309.686 57.6847C309.686 58.0114 309.623 58.3324 309.498 58.6477C309.373 58.9631 309.153 59.3125 308.838 59.696C308.525 60.0795 308.086 60.544 307.521 61.0895L306.017 62.6193V62.679H309.818V64H303.835Z' fill='%23A54EEA'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_30_313' x='1' y='30.1667' width='186' height='139' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_30_313'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_30_313' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_30_313' x='254' y='84' width='186' height='139' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_30_313'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_30_313' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_30_313'%3E%3Crect x='14' y='31.1667' width='160' height='109' rx='2' fill='white'/%3E%3C/clipPath%3E%3CclipPath id='clip1_30_313'%3E%3Crect x='267' y='85' width='160' height='109' rx='8' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
}

.figma-light .svg4 {
    width: 220px;
    height: 110px;
	background-size: contain;
    background-image: url("data:image/svg+xml,%3Csvg width='220' height='110' viewBox='0 0 220 110' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_2_3141)'%3E%3Crect x='138' width='74' height='94' rx='5' fill='white'/%3E%3Crect x='139' y='1' width='72' height='92' rx='4' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='162' y='38' width='26' height='20' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='166' y='42' width='18' height='12' rx='1' fill='white' stroke='%23CFCFCF' stroke-width='2'/%3E%3Cline x1='175' y1='43' x2='175' y2='53' stroke='%23CFCFCF'/%3E%3Cline x1='183' y1='46.25' x2='167' y2='46.25' stroke='%23CFCFCF'/%3E%3Cline x1='183' y1='49.75' x2='167' y2='49.75' stroke='%23CFCFCF'/%3E%3Cpath d='M161.242 32.1925L161.247 29.963L159.017 29.9676L159.013 32.1972L161.242 32.1925Z' fill='%232F80ED'/%3E%3Crect x='163.556' y='30' width='8' height='2' fill='%232F80ED'/%3E%3Crect x='160' y='36' width='4' height='4' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='186' y='36' width='4' height='4' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='186' y='56' width='4' height='4' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='160' y='56' width='4' height='4' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Cg filter='url(%23filter1_d_2_3141)'%3E%3Crect x='8' width='74' height='94' rx='5' fill='white'/%3E%3Crect x='9' y='1' width='72' height='92' rx='4' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='32' y='38' width='26' height='20' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath d='M34 33L32 31L30 33L32 35L34 33Z' fill='%23A54EEA'/%3E%3Crect x='36' y='32' width='8' height='2' fill='%23A54EEA'/%3E%3Crect x='36' y='42' width='18' height='12' rx='1' fill='white' stroke='%23CFCFCF' stroke-width='2'/%3E%3Cline x1='45' y1='43' x2='45' y2='53' stroke='%23CFCFCF'/%3E%3Cline x1='53' y1='46.25' x2='37' y2='46.25' stroke='%23CFCFCF'/%3E%3Cline x1='53' y1='49.75' x2='37' y2='49.75' stroke='%23CFCFCF'/%3E%3Cg filter='url(%23filter2_d_2_3141)'%3E%3Cpath d='M179.751 71.5L176 52L192.505 61.75L184.252 64L179.751 71.5Z' fill='%23010101'/%3E%3Cpath d='M179.015 71.6417L179.385 73.5674L180.394 71.886L184.74 64.6443L192.702 62.4736L194.414 62.0068L192.886 61.1043L176.381 51.3543L174.949 50.5082L175.264 52.1417L179.015 71.6417Z' stroke='white' stroke-width='1.5' stroke-linecap='square'/%3E%3C/g%3E%3Cg opacity='0.6'%3E%3Cpath d='M121.4 49.3181C114.546 42.4639 103.433 42.4639 96.5787 49.3181' stroke='%23CFCFCF' stroke-width='3'/%3E%3Cpath d='M118.748 40.0571L121.4 49.3181L112.139 51.9698' stroke='%23CFCFCF' stroke-width='3'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_2_3141' x='130' y='0' width='90' height='110' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='8'/%3E%3CfeGaussianBlur stdDeviation='4'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_3141'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_3141' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_2_3141' x='0' y='0' width='90' height='110' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='8'/%3E%3CfeGaussianBlur stdDeviation='4'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_3141'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_3141' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter2_d_2_3141' x='170.899' y='47.0164' width='28.4249' height='32.6183' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='1'/%3E%3CfeGaussianBlur stdDeviation='1.5'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_3141'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_3141' result='shape'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E%0A");
}

.figma-dark .svg4 {
    width: 220px;
    height: 110px;
	background-size: contain;
    background-image: url("data:image/svg+xml,%3Csvg width='220' height='110' viewBox='0 0 220 110' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_2_3033)'%3E%3Crect x='138' width='74' height='94' rx='5' fill='%232D2D2C'/%3E%3Crect x='139' y='1' width='72' height='92' rx='4' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='162' y='38' width='26' height='20' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='166' y='42' width='18' height='12' rx='1' fill='%232E2E2D' stroke='%23696969' stroke-width='2'/%3E%3Cline x1='175' y1='43' x2='175' y2='53' stroke='%23696969'/%3E%3Cline x1='183' y1='46.25' x2='167' y2='46.25' stroke='%23696969'/%3E%3Cline x1='183' y1='49.75' x2='167' y2='49.75' stroke='%23696969'/%3E%3Cpath d='M161.242 32.1925L161.247 29.963L159.017 29.9676L159.013 32.1972L161.242 32.1925Z' fill='%232F80ED'/%3E%3Crect x='163.556' y='30' width='8' height='2' fill='%232F80ED'/%3E%3Crect x='160' y='36' width='4' height='4' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='186' y='36' width='4' height='4' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='186' y='56' width='4' height='4' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='160' y='56' width='4' height='4' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Cg filter='url(%23filter1_d_2_3033)'%3E%3Crect x='8' width='74' height='94' rx='5' fill='%232D2D2C'/%3E%3Crect x='9' y='1' width='72' height='92' rx='4' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='32' y='38' width='26' height='20' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath d='M34 33L32 31L30 33L32 35L34 33Z' fill='%23A54EEA'/%3E%3Crect x='36' y='32' width='8' height='2' fill='%23A54EEA'/%3E%3Crect x='36' y='42' width='18' height='12' rx='1' fill='%232D2D2C' stroke='%23696969' stroke-width='2'/%3E%3Cline x1='45' y1='43' x2='45' y2='53' stroke='%23696969'/%3E%3Cline x1='53' y1='46.25' x2='37' y2='46.25' stroke='%23696969'/%3E%3Cline x1='53' y1='49.75' x2='37' y2='49.75' stroke='%23696969'/%3E%3Cg filter='url(%23filter2_d_2_3033)'%3E%3Cpath d='M179.751 71.5L176 52L192.505 61.75L184.252 64L179.751 71.5Z' fill='%23010101'/%3E%3Cpath d='M179.015 71.6417L179.385 73.5674L180.394 71.886L184.74 64.6443L192.702 62.4736L194.414 62.0068L192.886 61.1043L176.381 51.3543L174.949 50.5082L175.264 52.1417L179.015 71.6417Z' stroke='white' stroke-width='1.5' stroke-linecap='square'/%3E%3C/g%3E%3Cg opacity='0.6'%3E%3Cpath d='M121.4 49.3181C114.546 42.4639 103.433 42.4639 96.5787 49.3181' stroke='%235C5C5C' stroke-width='3'/%3E%3Cpath d='M118.748 40.0571L121.4 49.3181L112.139 51.9698' stroke='%235C5C5C' stroke-width='3'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_2_3033' x='130' y='0' width='90' height='110' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='8'/%3E%3CfeGaussianBlur stdDeviation='4'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_3033'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_3033' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_2_3033' x='0' y='0' width='90' height='110' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='8'/%3E%3CfeGaussianBlur stdDeviation='4'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_3033'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_3033' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter2_d_2_3033' x='170.899' y='47.0164' width='28.4249' height='32.6183' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='1'/%3E%3CfeGaussianBlur stdDeviation='1.5'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_3033'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_3033' result='shape'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E%0A");
}

.figma-light .svg6 {
    width: 188px;
    height: 168px;
	background-size: contain;
    background-image: url("data:image/svg+xml,%3Csvg width='188' height='168' viewBox='0 0 188 168' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_2_3088)'%3E%3Cg clip-path='url(%23clip0_2_3088)'%3E%3Crect x='14' y='31' width='160' height='108' rx='2' fill='white'/%3E%3Crect width='80' height='36' transform='translate(14 31)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='31' width='80' height='36' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(94 31)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='31' width='80' height='36' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(14 67)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='67' width='80' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(94 67)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='67' width='80' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(14 103)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='103' width='80' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(94 103)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='103' width='80' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='31' width='160' height='108' rx='2' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='4' y='21' width='180' height='127' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='18' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='145' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='145' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='18' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 0L3.375 2.625L6 5.25L8.625 2.625L6 0ZM6 6.75L3.375 9.375L6 12L8.625 9.375L6 6.75ZM0 6L2.625 3.375L5.25 6L2.625 8.625L0 6ZM9.375 3.375L6.75 6L9.375 8.625L12 6L9.375 3.375Z' fill='%23A54EEA'/%3E%3Cpath d='M15.4773 2.59801V1.27273H22.4403V2.59801H19.7429V10H18.1747V2.59801H15.4773ZM24.7674 10.1321C24.3526 10.1321 23.979 10.0582 23.6466 9.91051C23.3171 9.75994 23.0557 9.53835 22.8626 9.24574C22.6722 8.95312 22.577 8.59233 22.577 8.16335C22.577 7.79403 22.6452 7.48864 22.7816 7.24716C22.918 7.00568 23.104 6.8125 23.3398 6.66761C23.5756 6.52273 23.8413 6.41335 24.1367 6.33949C24.435 6.26278 24.7432 6.20739 25.0614 6.1733C25.4449 6.13352 25.756 6.09801 25.9947 6.06676C26.2333 6.03267 26.4066 5.98153 26.5145 5.91335C26.6253 5.84233 26.6807 5.73295 26.6807 5.58523V5.55966C26.6807 5.23864 26.5856 4.99006 26.3952 4.81392C26.2049 4.63778 25.9307 4.54972 25.5728 4.54972C25.1949 4.54972 24.8952 4.6321 24.6736 4.79688C24.4549 4.96165 24.3072 5.15625 24.2305 5.38068L22.7901 5.17614C22.9037 4.77841 23.0913 4.44602 23.3526 4.17898C23.614 3.90909 23.9336 3.70739 24.3114 3.57386C24.6893 3.4375 25.1069 3.36932 25.5643 3.36932C25.8796 3.36932 26.1935 3.40625 26.506 3.48011C26.8185 3.55398 27.104 3.67614 27.3626 3.84659C27.6211 4.0142 27.8285 4.2429 27.9847 4.53267C28.1438 4.82244 28.2234 5.18466 28.2234 5.61932V10H26.7404V9.10085H26.6893C26.5955 9.28267 26.4634 9.45312 26.293 9.61222C26.1253 9.76847 25.9137 9.89489 25.658 9.99148C25.4052 10.0852 25.1083 10.1321 24.7674 10.1321ZM25.168 8.99858C25.4776 8.99858 25.7461 8.9375 25.9734 8.81534C26.2006 8.69034 26.3753 8.52557 26.4975 8.32102C26.6225 8.11648 26.685 7.89347 26.685 7.65199V6.88068C26.6367 6.92045 26.5543 6.95739 26.4378 6.99148C26.3242 7.02557 26.1964 7.0554 26.0543 7.08097C25.9123 7.10653 25.7716 7.12926 25.6324 7.14915C25.4932 7.16903 25.3725 7.18608 25.2702 7.20028C25.0401 7.23153 24.8341 7.28267 24.6523 7.35369C24.4705 7.42472 24.327 7.52415 24.2219 7.65199C24.1168 7.77699 24.0643 7.93892 24.0643 8.13778C24.0643 8.42188 24.168 8.63636 24.3753 8.78125C24.5827 8.92614 24.8469 8.99858 25.168 8.99858ZM29.9027 10V1.27273H31.4453V4.53693H31.5092C31.5887 4.37784 31.701 4.20881 31.8459 4.02983C31.9907 3.84801 32.1868 3.69318 32.4339 3.56534C32.6811 3.43466 32.9964 3.36932 33.3799 3.36932C33.8856 3.36932 34.3416 3.49858 34.7478 3.7571C35.1569 4.01278 35.4808 4.39205 35.7194 4.89489C35.9609 5.39489 36.0816 6.00852 36.0816 6.7358C36.0816 7.45455 35.9638 8.06534 35.728 8.56818C35.4922 9.07102 35.1711 9.45455 34.7649 9.71875C34.3586 9.98295 33.8984 10.1151 33.3842 10.1151C33.0092 10.1151 32.6981 10.0526 32.451 9.92756C32.2038 9.80256 32.0049 9.65199 31.8544 9.47585C31.7066 9.29687 31.5916 9.12784 31.5092 8.96875H31.4197V10H29.9027ZM31.4155 6.72727C31.4155 7.15057 31.4751 7.52131 31.5944 7.83949C31.7166 8.15767 31.8913 8.40625 32.1186 8.58523C32.3487 8.76136 32.6271 8.84943 32.9538 8.84943C33.2947 8.84943 33.5802 8.75852 33.8103 8.5767C34.0405 8.39205 34.2138 8.14062 34.3302 7.82244C34.4495 7.50142 34.5092 7.13636 34.5092 6.72727C34.5092 6.32102 34.451 5.96023 34.3345 5.64489C34.218 5.32955 34.0447 5.08239 33.8146 4.90341C33.5845 4.72443 33.2976 4.63494 32.9538 4.63494C32.6243 4.63494 32.3444 4.72159 32.1143 4.89489C31.8842 5.06818 31.7095 5.31108 31.5902 5.62358C31.4737 5.93608 31.4155 6.30398 31.4155 6.72727ZM38.9957 1.27273V10H37.4531V1.27273H38.9957ZM43.5397 10.1278C42.8835 10.1278 42.3167 9.99148 41.8394 9.71875C41.365 9.44318 40.9999 9.05398 40.7443 8.55114C40.4886 8.04545 40.3607 7.45028 40.3607 6.76562C40.3607 6.09233 40.4886 5.50142 40.7443 4.9929C41.0028 4.48153 41.3636 4.08381 41.8266 3.79972C42.2897 3.51278 42.8337 3.36932 43.4587 3.36932C43.8622 3.36932 44.2428 3.43466 44.6008 3.56534C44.9616 3.69318 45.2798 3.89205 45.5553 4.16193C45.8338 4.43182 46.0525 4.77557 46.2116 5.19318C46.3707 5.60795 46.4502 6.10227 46.4502 6.67614V7.14915H41.0852V6.10938H44.9715C44.9687 5.81392 44.9048 5.55114 44.7798 5.32102C44.6548 5.08807 44.4801 4.90483 44.2556 4.77131C44.034 4.63778 43.7755 4.57102 43.4801 4.57102C43.1647 4.57102 42.8877 4.64773 42.6491 4.80114C42.4105 4.9517 42.2244 5.15057 42.0909 5.39773C41.9602 5.64205 41.8934 5.91051 41.8906 6.20312V7.1108C41.8906 7.49148 41.9602 7.81818 42.0994 8.09091C42.2386 8.3608 42.4332 8.56818 42.6832 8.71307C42.9332 8.85511 43.2258 8.92614 43.561 8.92614C43.7855 8.92614 43.9886 8.89489 44.1704 8.83239C44.3522 8.76705 44.5099 8.67188 44.6434 8.54688C44.7769 8.42188 44.8778 8.26705 44.946 8.08239L46.3863 8.24432C46.2954 8.625 46.1221 8.95739 45.8664 9.24148C45.6136 9.52273 45.2897 9.74148 44.8948 9.89773C44.4999 10.0511 44.0482 10.1278 43.5397 10.1278ZM54.3845 1.27273V10H52.8035V2.81108H52.7524L50.7112 4.11506V2.66619L52.8802 1.27273H54.3845Z' fill='%23A54EEA'/%3E%3Cg filter='url(%23filter1_d_2_3088)'%3E%3Cpath d='M129.246 117.5L125.495 98L142 107.75L133.748 110L129.246 117.5Z' fill='%23010101'/%3E%3Cpath d='M125.877 97.3543L124.444 96.5082L124.759 98.1417L128.51 117.642L128.88 119.567L129.889 117.886L134.236 110.644L142.197 108.474L143.909 108.007L142.381 107.104L125.877 97.3543Z' stroke='white' stroke-width='1.5' stroke-linecap='square'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_2_3088' x='1' y='30' width='186' height='138' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_3088'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_3088' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_2_3088' x='120.394' y='93.0164' width='28.4249' height='32.6183' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='1'/%3E%3CfeGaussianBlur stdDeviation='1.5'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_3088'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_3088' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_2_3088'%3E%3Crect x='14' y='31' width='160' height='108' rx='2' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
}
.figma-dark .svg6 {
    width: 188px;
    height: 169px;
	background-size: contain;
    background-image: url("data:image/svg+xml,%3Csvg width='188' height='169' viewBox='0 0 188 169' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_2_2575)'%3E%3Cg clip-path='url(%23clip0_2_2575)'%3E%3Crect x='14' y='31.5' width='160' height='108' rx='2' fill='%232D2D2C'/%3E%3Crect width='80' height='36' transform='translate(14 31.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='31.5' width='80' height='36' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(94 31.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='31.5' width='80' height='36' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(14 67.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='67.5' width='80' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(94 67.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='67.5' width='80' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(14 103.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='103.5' width='80' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(94 103.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='103.5' width='80' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='31.5' width='160' height='108' rx='2' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='4' y='21.5' width='180' height='127' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='18.5' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='145.5' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='145.5' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='18.5' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 0.5L3.375 3.125L6 5.75L8.625 3.125L6 0.5ZM6 7.25L3.375 9.875L6 12.5L8.625 9.875L6 7.25ZM0 6.5L2.625 3.875L5.25 6.5L2.625 9.125L0 6.5ZM9.375 3.875L6.75 6.5L9.375 9.125L12 6.5L9.375 3.875Z' fill='%23A54EEA'/%3E%3Cpath d='M15.4773 3.09801V1.77273H22.4403V3.09801H19.7429V10.5H18.1747V3.09801H15.4773ZM24.7674 10.6321C24.3526 10.6321 23.979 10.5582 23.6466 10.4105C23.3171 10.2599 23.0557 10.0384 22.8626 9.74574C22.6722 9.45312 22.577 9.09233 22.577 8.66335C22.577 8.29403 22.6452 7.98864 22.7816 7.74716C22.918 7.50568 23.104 7.3125 23.3398 7.16761C23.5756 7.02273 23.8413 6.91335 24.1367 6.83949C24.435 6.76278 24.7432 6.70739 25.0614 6.6733C25.4449 6.63352 25.756 6.59801 25.9947 6.56676C26.2333 6.53267 26.4066 6.48153 26.5145 6.41335C26.6253 6.34233 26.6807 6.23295 26.6807 6.08523V6.05966C26.6807 5.73864 26.5856 5.49006 26.3952 5.31392C26.2049 5.13778 25.9307 5.04972 25.5728 5.04972C25.1949 5.04972 24.8952 5.1321 24.6736 5.29688C24.4549 5.46165 24.3072 5.65625 24.2305 5.88068L22.7901 5.67614C22.9037 5.27841 23.0913 4.94602 23.3526 4.67898C23.614 4.40909 23.9336 4.20739 24.3114 4.07386C24.6893 3.9375 25.1069 3.86932 25.5643 3.86932C25.8796 3.86932 26.1935 3.90625 26.506 3.98011C26.8185 4.05398 27.104 4.17614 27.3626 4.34659C27.6211 4.5142 27.8285 4.7429 27.9847 5.03267C28.1438 5.32244 28.2234 5.68466 28.2234 6.11932V10.5H26.7404V9.60085H26.6893C26.5955 9.78267 26.4634 9.95312 26.293 10.1122C26.1253 10.2685 25.9137 10.3949 25.658 10.4915C25.4052 10.5852 25.1083 10.6321 24.7674 10.6321ZM25.168 9.49858C25.4776 9.49858 25.7461 9.4375 25.9734 9.31534C26.2006 9.19034 26.3753 9.02557 26.4975 8.82102C26.6225 8.61648 26.685 8.39347 26.685 8.15199V7.38068C26.6367 7.42045 26.5543 7.45739 26.4378 7.49148C26.3242 7.52557 26.1964 7.5554 26.0543 7.58097C25.9123 7.60653 25.7716 7.62926 25.6324 7.64915C25.4932 7.66903 25.3725 7.68608 25.2702 7.70028C25.0401 7.73153 24.8341 7.78267 24.6523 7.85369C24.4705 7.92472 24.327 8.02415 24.2219 8.15199C24.1168 8.27699 24.0643 8.43892 24.0643 8.63778C24.0643 8.92188 24.168 9.13636 24.3753 9.28125C24.5827 9.42614 24.8469 9.49858 25.168 9.49858ZM29.9027 10.5V1.77273H31.4453V5.03693H31.5092C31.5887 4.87784 31.701 4.70881 31.8459 4.52983C31.9907 4.34801 32.1868 4.19318 32.4339 4.06534C32.6811 3.93466 32.9964 3.86932 33.3799 3.86932C33.8856 3.86932 34.3416 3.99858 34.7478 4.2571C35.1569 4.51278 35.4808 4.89205 35.7194 5.39489C35.9609 5.89489 36.0816 6.50852 36.0816 7.2358C36.0816 7.95455 35.9638 8.56534 35.728 9.06818C35.4922 9.57102 35.1711 9.95455 34.7649 10.2188C34.3586 10.483 33.8984 10.6151 33.3842 10.6151C33.0092 10.6151 32.6981 10.5526 32.451 10.4276C32.2038 10.3026 32.0049 10.152 31.8544 9.97585C31.7066 9.79687 31.5916 9.62784 31.5092 9.46875H31.4197V10.5H29.9027ZM31.4155 7.22727C31.4155 7.65057 31.4751 8.02131 31.5944 8.33949C31.7166 8.65767 31.8913 8.90625 32.1186 9.08523C32.3487 9.26136 32.6271 9.34943 32.9538 9.34943C33.2947 9.34943 33.5802 9.25852 33.8103 9.0767C34.0405 8.89205 34.2138 8.64062 34.3302 8.32244C34.4495 8.00142 34.5092 7.63636 34.5092 7.22727C34.5092 6.82102 34.451 6.46023 34.3345 6.14489C34.218 5.82955 34.0447 5.58239 33.8146 5.40341C33.5845 5.22443 33.2976 5.13494 32.9538 5.13494C32.6243 5.13494 32.3444 5.22159 32.1143 5.39489C31.8842 5.56818 31.7095 5.81108 31.5902 6.12358C31.4737 6.43608 31.4155 6.80398 31.4155 7.22727ZM38.9957 1.77273V10.5H37.4531V1.77273H38.9957ZM43.5397 10.6278C42.8835 10.6278 42.3167 10.4915 41.8394 10.2188C41.365 9.94318 40.9999 9.55398 40.7443 9.05114C40.4886 8.54545 40.3607 7.95028 40.3607 7.26562C40.3607 6.59233 40.4886 6.00142 40.7443 5.4929C41.0028 4.98153 41.3636 4.58381 41.8266 4.29972C42.2897 4.01278 42.8337 3.86932 43.4587 3.86932C43.8622 3.86932 44.2428 3.93466 44.6008 4.06534C44.9616 4.19318 45.2798 4.39205 45.5553 4.66193C45.8338 4.93182 46.0525 5.27557 46.2116 5.69318C46.3707 6.10795 46.4502 6.60227 46.4502 7.17614V7.64915H41.0852V6.60938H44.9715C44.9687 6.31392 44.9048 6.05114 44.7798 5.82102C44.6548 5.58807 44.4801 5.40483 44.2556 5.27131C44.034 5.13778 43.7755 5.07102 43.4801 5.07102C43.1647 5.07102 42.8877 5.14773 42.6491 5.30114C42.4105 5.4517 42.2244 5.65057 42.0909 5.89773C41.9602 6.14205 41.8934 6.41051 41.8906 6.70312V7.6108C41.8906 7.99148 41.9602 8.31818 42.0994 8.59091C42.2386 8.8608 42.4332 9.06818 42.6832 9.21307C42.9332 9.35511 43.2258 9.42614 43.561 9.42614C43.7855 9.42614 43.9886 9.39489 44.1704 9.33239C44.3522 9.26705 44.5099 9.17188 44.6434 9.04688C44.7769 8.92188 44.8778 8.76705 44.946 8.58239L46.3863 8.74432C46.2954 9.125 46.1221 9.45739 45.8664 9.74148C45.6136 10.0227 45.2897 10.2415 44.8948 10.3977C44.4999 10.5511 44.0482 10.6278 43.5397 10.6278ZM54.3845 1.77273V10.5H52.8035V3.31108H52.7524L50.7112 4.61506V3.16619L52.8802 1.77273H54.3845Z' fill='%23A54EEA'/%3E%3Cg filter='url(%23filter1_d_2_2575)'%3E%3Cpath d='M129.246 118L125.495 98.5L142 108.25L133.748 110.5L129.246 118Z' fill='%23010101'/%3E%3Cpath d='M125.877 97.8543L124.444 97.0082L124.759 98.6417L128.51 118.142L128.88 120.067L129.889 118.386L134.236 111.144L142.197 108.974L143.909 108.507L142.381 107.604L125.877 97.8543Z' stroke='white' stroke-width='1.5' stroke-linecap='square'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_2_2575' x='1' y='30.5' width='186' height='138' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_2575'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_2575' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_2_2575' x='120.394' y='93.5164' width='28.4249' height='32.6183' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='1'/%3E%3CfeGaussianBlur stdDeviation='1.5'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_2575'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_2575' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_2_2575'%3E%3Crect x='14' y='31.5' width='160' height='108' rx='2' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
}

.figma-light .svg7 {
	margin: -4px 0 -32px 0;
	width: 188px;
    height: 190px;
	background-size: contain;
	background-image: url("data:image/svg+xml,%3Csvg width='188' height='190' viewBox='0 0 188 190' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='4' y='24.8333' width='180' height='129' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='21.8333' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='150.833' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='150.833' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='21.8333' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 3.83325L3.375 6.45825L6 9.08325L8.625 6.45825L6 3.83325ZM6 10.5833L3.375 13.2083L6 15.8333L8.625 13.2083L6 10.5833ZM0 9.83325L2.625 7.20825L5.25 9.83325L2.625 12.4583L0 9.83325ZM9.375 7.20825L6.75 9.83325L9.375 12.4583L12 9.83325L9.375 7.20825Z' fill='%23A54EEA'/%3E%3Cpath d='M15.4773 6.43126V5.10598H22.4403V6.43126H19.7429V13.8333H18.1747V6.43126H15.4773ZM24.7674 13.9654C24.3526 13.9654 23.979 13.8915 23.6466 13.7438C23.3171 13.5932 23.0557 13.3716 22.8626 13.079C22.6722 12.7864 22.577 12.4256 22.577 11.9966C22.577 11.6273 22.6452 11.3219 22.7816 11.0804C22.918 10.8389 23.104 10.6458 23.3398 10.5009C23.5756 10.356 23.8413 10.2466 24.1367 10.1727C24.435 10.096 24.7432 10.0406 25.0614 10.0065C25.4449 9.96677 25.756 9.93126 25.9947 9.90001C26.2333 9.86592 26.4066 9.81479 26.5145 9.7466C26.6253 9.67558 26.6807 9.56621 26.6807 9.41848V9.39291C26.6807 9.07189 26.5856 8.82331 26.3952 8.64717C26.2049 8.47104 25.9307 8.38297 25.5728 8.38297C25.1949 8.38297 24.8952 8.46535 24.6736 8.63013C24.4549 8.7949 24.3072 8.9895 24.2305 9.21393L22.7901 9.00939C22.9037 8.61166 23.0913 8.27927 23.3526 8.01223C23.614 7.74234 23.9336 7.54064 24.3114 7.40712C24.6893 7.27075 25.1069 7.20257 25.5643 7.20257C25.8796 7.20257 26.1935 7.2395 26.506 7.31337C26.8185 7.38723 27.104 7.50939 27.3626 7.67984C27.6211 7.84746 27.8285 8.07615 27.9847 8.36592C28.1438 8.65569 28.2234 9.01791 28.2234 9.45257V13.8333H26.7404V12.9341H26.6893C26.5955 13.1159 26.4634 13.2864 26.293 13.4455C26.1253 13.6017 25.9137 13.7281 25.658 13.8247C25.4052 13.9185 25.1083 13.9654 24.7674 13.9654ZM25.168 12.8318C25.4776 12.8318 25.7461 12.7708 25.9734 12.6486C26.2006 12.5236 26.3753 12.3588 26.4975 12.1543C26.6225 11.9497 26.685 11.7267 26.685 11.4852V10.7139C26.6367 10.7537 26.5543 10.7906 26.4378 10.8247C26.3242 10.8588 26.1964 10.8886 26.0543 10.9142C25.9123 10.9398 25.7716 10.9625 25.6324 10.9824C25.4932 11.0023 25.3725 11.0193 25.2702 11.0335C25.0401 11.0648 24.8341 11.1159 24.6523 11.1869C24.4705 11.258 24.327 11.3574 24.2219 11.4852C24.1168 11.6102 24.0643 11.7722 24.0643 11.971C24.0643 12.2551 24.168 12.4696 24.3753 12.6145C24.5827 12.7594 24.8469 12.8318 25.168 12.8318ZM29.9027 13.8333V5.10598H31.4453V8.37018H31.5092C31.5887 8.21109 31.701 8.04206 31.8459 7.86308C31.9907 7.68126 32.1868 7.52643 32.4339 7.39859C32.6811 7.26791 32.9964 7.20257 33.3799 7.20257C33.8856 7.20257 34.3416 7.33183 34.7478 7.59035C35.1569 7.84604 35.4808 8.2253 35.7194 8.72814C35.9609 9.22814 36.0816 9.84177 36.0816 10.569C36.0816 11.2878 35.9638 11.8986 35.728 12.4014C35.4922 12.9043 35.1711 13.2878 34.7649 13.552C34.3586 13.8162 33.8984 13.9483 33.3842 13.9483C33.0092 13.9483 32.6981 13.8858 32.451 13.7608C32.2038 13.6358 32.0049 13.4852 31.8544 13.3091C31.7066 13.1301 31.5916 12.9611 31.5092 12.802H31.4197V13.8333H29.9027ZM31.4155 10.5605C31.4155 10.9838 31.4751 11.3546 31.5944 11.6727C31.7166 11.9909 31.8913 12.2395 32.1186 12.4185C32.3487 12.5946 32.6271 12.6827 32.9538 12.6827C33.2947 12.6827 33.5802 12.5918 33.8103 12.41C34.0405 12.2253 34.2138 11.9739 34.3302 11.6557C34.4495 11.3347 34.5092 10.9696 34.5092 10.5605C34.5092 10.1543 34.451 9.79348 34.3345 9.47814C34.218 9.1628 34.0447 8.91564 33.8146 8.73666C33.5845 8.55768 33.2976 8.46819 32.9538 8.46819C32.6243 8.46819 32.3444 8.55484 32.1143 8.72814C31.8842 8.90143 31.7095 9.14433 31.5902 9.45683C31.4737 9.76933 31.4155 10.1372 31.4155 10.5605ZM38.9957 5.10598V13.8333H37.4531V5.10598H38.9957ZM43.5397 13.9611C42.8835 13.9611 42.3167 13.8247 41.8394 13.552C41.365 13.2764 40.9999 12.8872 40.7443 12.3844C40.4886 11.8787 40.3607 11.2835 40.3607 10.5989C40.3607 9.92558 40.4886 9.33467 40.7443 8.82615C41.0028 8.31479 41.3636 7.91706 41.8266 7.63297C42.2897 7.34604 42.8337 7.20257 43.4587 7.20257C43.8622 7.20257 44.2428 7.26791 44.6008 7.39859C44.9616 7.52643 45.2798 7.7253 45.5553 7.99518C45.8338 8.26507 46.0525 8.60882 46.2116 9.02643C46.3707 9.44121 46.4502 9.93552 46.4502 10.5094V10.9824H41.0852V9.94263H44.9715C44.9687 9.64717 44.9048 9.38439 44.7798 9.15427C44.6548 8.92132 44.4801 8.73808 44.2556 8.60456C44.034 8.47104 43.7755 8.40427 43.4801 8.40427C43.1647 8.40427 42.8877 8.48098 42.6491 8.63439C42.4105 8.78496 42.2244 8.98382 42.0909 9.23098C41.9602 9.4753 41.8934 9.74376 41.8906 10.0364V10.944C41.8906 11.3247 41.9602 11.6514 42.0994 11.9242C42.2386 12.194 42.4332 12.4014 42.6832 12.5463C42.9332 12.6884 43.2258 12.7594 43.561 12.7594C43.7855 12.7594 43.9886 12.7281 44.1704 12.6656C44.3522 12.6003 44.5099 12.5051 44.6434 12.3801C44.7769 12.2551 44.8778 12.1003 44.946 11.9156L46.3863 12.0776C46.2954 12.4583 46.1221 12.7906 45.8664 13.0747C45.6136 13.356 45.2897 13.5747 44.8948 13.731C44.4999 13.8844 44.0482 13.9611 43.5397 13.9611ZM54.3845 5.10598V13.8333H52.8035V6.64433H52.7524L50.7112 7.94831V6.49945L52.8802 5.10598H54.3845Z' fill='%23A54EEA'/%3E%3Cg filter='url(%23filter0_d_113_3127)'%3E%3Cg clip-path='url(%23clip0_113_3127)'%3E%3Crect x='14' y='35' width='160' height='109' rx='2' fill='white'/%3E%3Crect width='80' height='36.3333' transform='translate(14 35)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='35' width='80' height='36.3333' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 35)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='35' width='80' height='36.3333' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 71.3334)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='71.3334' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 71.3334)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='71.3334' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 107.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='107.667' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 107.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='107.667' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='35' width='160' height='109' rx='2' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Cpath d='M119.268 0.920393C118.868 0.44121 118.132 0.44121 117.732 0.920393L111.814 8.01455C111.048 8.93175 112.245 10.1762 113.191 9.4476L115.289 7.83321C115.917 7.34942 116.832 7.75489 116.896 8.5455L117.503 16.1038C117.602 17.3302 119.398 17.3302 119.497 16.1038L120.105 8.54569C120.168 7.75508 121.083 7.34961 121.711 7.8334L123.809 9.44769C124.755 10.1763 125.952 8.93184 125.186 8.01464L119.268 0.920393Z' fill='%23F26E6E'/%3E%3Cpath d='M154.269 118.924C153.869 118.443 153.131 118.443 152.731 118.924L148.804 123.642C148.04 124.56 149.238 125.803 150.184 125.074L150.568 124.777C151.197 124.292 152.112 124.698 152.176 125.489L152.503 129.572C152.602 130.799 154.398 130.799 154.497 129.572L154.824 125.489C154.888 124.698 155.804 124.293 156.432 124.778L156.816 125.074C157.762 125.803 158.96 124.561 158.196 123.642L154.269 118.924Z' fill='%23F26E6E'/%3E%3Cpath d='M81.7751 169.951C81.3749 169.46 80.6251 169.46 80.2249 169.951L77.1603 173.71C76.4807 174.544 77.5706 175.652 78.4155 174.986V174.986C78.9807 174.541 79.8141 174.906 79.8705 175.623L80.0031 177.312C80.0997 178.541 81.9004 178.541 81.997 177.312L82.1297 175.623C82.186 174.906 83.0194 174.541 83.5846 174.987V174.987C84.4295 175.652 85.5194 174.544 84.8398 173.71L81.7751 169.951Z' fill='%23F26E6E'/%3E%3Cpath d='M44.2763 66.9562C43.8761 66.4633 43.1239 66.4633 42.7237 66.9562L31.7161 80.5141C30.9632 81.4413 32.176 82.6697 33.1128 81.9287L39.5762 76.8165C40.2037 76.3202 41.1311 76.7252 41.1935 77.5229L42.5032 94.2598C42.5994 95.4892 44.4009 95.4892 44.4971 94.2598L45.8068 77.5231C45.8692 76.7255 46.7966 76.3205 47.4241 76.8168L53.8873 81.9288C54.8241 82.6697 56.0368 81.4414 55.284 80.5142L44.2763 66.9562Z' fill='%23F26E6E'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_113_3127' x='1' y='34' width='186' height='139' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_113_3127'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_113_3127' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_113_3127'%3E%3Crect x='14' y='35' width='160' height='109' rx='2' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
}

.figma-dark .svg7 {
	margin: -4px 0 -32px 0;
	width: 188px;
    height: 190px;
	background-size: contain;
	background-image: url("data:image/svg+xml,%3Csvg width='188' height='190' viewBox='0 0 188 190' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='4' y='24.8333' width='180' height='129' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='21.8333' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='150.833' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='150.833' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='21.8333' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 3.83325L3.375 6.45825L6 9.08325L8.625 6.45825L6 3.83325ZM6 10.5833L3.375 13.2083L6 15.8333L8.625 13.2083L6 10.5833ZM0 9.83325L2.625 7.20825L5.25 9.83325L2.625 12.4583L0 9.83325ZM9.375 7.20825L6.75 9.83325L9.375 12.4583L12 9.83325L9.375 7.20825Z' fill='%23A54EEA'/%3E%3Cpath d='M15.4773 6.43126V5.10598H22.4403V6.43126H19.7429V13.8333H18.1747V6.43126H15.4773ZM24.7674 13.9654C24.3526 13.9654 23.979 13.8915 23.6466 13.7438C23.3171 13.5932 23.0557 13.3716 22.8626 13.079C22.6722 12.7864 22.577 12.4256 22.577 11.9966C22.577 11.6273 22.6452 11.3219 22.7816 11.0804C22.918 10.8389 23.104 10.6458 23.3398 10.5009C23.5756 10.356 23.8413 10.2466 24.1367 10.1727C24.435 10.096 24.7432 10.0406 25.0614 10.0065C25.4449 9.96677 25.756 9.93126 25.9947 9.90001C26.2333 9.86592 26.4066 9.81479 26.5145 9.7466C26.6253 9.67558 26.6807 9.56621 26.6807 9.41848V9.39291C26.6807 9.07189 26.5856 8.82331 26.3952 8.64717C26.2049 8.47104 25.9307 8.38297 25.5728 8.38297C25.1949 8.38297 24.8952 8.46535 24.6736 8.63013C24.4549 8.7949 24.3072 8.9895 24.2305 9.21393L22.7901 9.00939C22.9037 8.61166 23.0913 8.27927 23.3526 8.01223C23.614 7.74234 23.9336 7.54064 24.3114 7.40712C24.6893 7.27075 25.1069 7.20257 25.5643 7.20257C25.8796 7.20257 26.1935 7.2395 26.506 7.31337C26.8185 7.38723 27.104 7.50939 27.3626 7.67984C27.6211 7.84746 27.8285 8.07615 27.9847 8.36592C28.1438 8.65569 28.2234 9.01791 28.2234 9.45257V13.8333H26.7404V12.9341H26.6893C26.5955 13.1159 26.4634 13.2864 26.293 13.4455C26.1253 13.6017 25.9137 13.7281 25.658 13.8247C25.4052 13.9185 25.1083 13.9654 24.7674 13.9654ZM25.168 12.8318C25.4776 12.8318 25.7461 12.7708 25.9734 12.6486C26.2006 12.5236 26.3753 12.3588 26.4975 12.1543C26.6225 11.9497 26.685 11.7267 26.685 11.4852V10.7139C26.6367 10.7537 26.5543 10.7906 26.4378 10.8247C26.3242 10.8588 26.1964 10.8886 26.0543 10.9142C25.9123 10.9398 25.7716 10.9625 25.6324 10.9824C25.4932 11.0023 25.3725 11.0193 25.2702 11.0335C25.0401 11.0648 24.8341 11.1159 24.6523 11.1869C24.4705 11.258 24.327 11.3574 24.2219 11.4852C24.1168 11.6102 24.0643 11.7722 24.0643 11.971C24.0643 12.2551 24.168 12.4696 24.3753 12.6145C24.5827 12.7594 24.8469 12.8318 25.168 12.8318ZM29.9027 13.8333V5.10598H31.4453V8.37018H31.5092C31.5887 8.21109 31.701 8.04206 31.8459 7.86308C31.9907 7.68126 32.1868 7.52643 32.4339 7.39859C32.6811 7.26791 32.9964 7.20257 33.3799 7.20257C33.8856 7.20257 34.3416 7.33183 34.7478 7.59035C35.1569 7.84604 35.4808 8.2253 35.7194 8.72814C35.9609 9.22814 36.0816 9.84177 36.0816 10.569C36.0816 11.2878 35.9638 11.8986 35.728 12.4014C35.4922 12.9043 35.1711 13.2878 34.7649 13.552C34.3586 13.8162 33.8984 13.9483 33.3842 13.9483C33.0092 13.9483 32.6981 13.8858 32.451 13.7608C32.2038 13.6358 32.0049 13.4852 31.8544 13.3091C31.7066 13.1301 31.5916 12.9611 31.5092 12.802H31.4197V13.8333H29.9027ZM31.4155 10.5605C31.4155 10.9838 31.4751 11.3546 31.5944 11.6727C31.7166 11.9909 31.8913 12.2395 32.1186 12.4185C32.3487 12.5946 32.6271 12.6827 32.9538 12.6827C33.2947 12.6827 33.5802 12.5918 33.8103 12.41C34.0405 12.2253 34.2138 11.9739 34.3302 11.6557C34.4495 11.3347 34.5092 10.9696 34.5092 10.5605C34.5092 10.1543 34.451 9.79348 34.3345 9.47814C34.218 9.1628 34.0447 8.91564 33.8146 8.73666C33.5845 8.55768 33.2976 8.46819 32.9538 8.46819C32.6243 8.46819 32.3444 8.55484 32.1143 8.72814C31.8842 8.90143 31.7095 9.14433 31.5902 9.45683C31.4737 9.76933 31.4155 10.1372 31.4155 10.5605ZM38.9957 5.10598V13.8333H37.4531V5.10598H38.9957ZM43.5397 13.9611C42.8835 13.9611 42.3167 13.8247 41.8394 13.552C41.365 13.2764 40.9999 12.8872 40.7443 12.3844C40.4886 11.8787 40.3607 11.2835 40.3607 10.5989C40.3607 9.92558 40.4886 9.33467 40.7443 8.82615C41.0028 8.31479 41.3636 7.91706 41.8266 7.63297C42.2897 7.34604 42.8337 7.20257 43.4587 7.20257C43.8622 7.20257 44.2428 7.26791 44.6008 7.39859C44.9616 7.52643 45.2798 7.7253 45.5553 7.99518C45.8338 8.26507 46.0525 8.60882 46.2116 9.02643C46.3707 9.44121 46.4502 9.93552 46.4502 10.5094V10.9824H41.0852V9.94263H44.9715C44.9687 9.64717 44.9048 9.38439 44.7798 9.15427C44.6548 8.92132 44.4801 8.73808 44.2556 8.60456C44.034 8.47104 43.7755 8.40427 43.4801 8.40427C43.1647 8.40427 42.8877 8.48098 42.6491 8.63439C42.4105 8.78496 42.2244 8.98382 42.0909 9.23098C41.9602 9.4753 41.8934 9.74376 41.8906 10.0364V10.944C41.8906 11.3247 41.9602 11.6514 42.0994 11.9242C42.2386 12.194 42.4332 12.4014 42.6832 12.5463C42.9332 12.6884 43.2258 12.7594 43.561 12.7594C43.7855 12.7594 43.9886 12.7281 44.1704 12.6656C44.3522 12.6003 44.5099 12.5051 44.6434 12.3801C44.7769 12.2551 44.8778 12.1003 44.946 11.9156L46.3863 12.0776C46.2954 12.4583 46.1221 12.7906 45.8664 13.0747C45.6136 13.356 45.2897 13.5747 44.8948 13.731C44.4999 13.8844 44.0482 13.9611 43.5397 13.9611ZM54.3845 5.10598V13.8333H52.8035V6.64433H52.7524L50.7112 7.94831V6.49945L52.8802 5.10598H54.3845Z' fill='%23A54EEA'/%3E%3Cg filter='url(%23filter0_d_113_3542)'%3E%3Cg clip-path='url(%23clip0_113_3542)'%3E%3Crect x='14' y='35' width='160' height='109' rx='2' fill='%232D2D2C'/%3E%3Crect width='80' height='36.3333' transform='translate(14 35)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='35' width='80' height='36.3333' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 35)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='35' width='80' height='36.3333' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 71.3334)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='71.3334' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 71.3334)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='71.3334' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 107.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='107.667' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 107.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='107.667' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='35' width='160' height='109' rx='2' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Cpath d='M119.268 0.920393C118.868 0.44121 118.132 0.44121 117.732 0.920393L111.814 8.01455C111.048 8.93175 112.245 10.1762 113.191 9.4476L115.289 7.83321C115.917 7.34942 116.832 7.75489 116.896 8.5455L117.503 16.1038C117.602 17.3302 119.398 17.3302 119.497 16.1038L120.105 8.54569C120.168 7.75508 121.083 7.34961 121.711 7.8334L123.809 9.44769C124.755 10.1763 125.952 8.93184 125.186 8.01464L119.268 0.920393Z' fill='%23F26E6E'/%3E%3Cpath d='M154.269 118.924C153.869 118.443 153.131 118.443 152.731 118.924L148.804 123.642C148.04 124.56 149.238 125.803 150.184 125.074L150.568 124.777C151.197 124.292 152.112 124.698 152.176 125.489L152.503 129.572C152.602 130.799 154.398 130.799 154.497 129.572L154.824 125.489C154.888 124.698 155.804 124.293 156.432 124.778L156.816 125.074C157.762 125.803 158.96 124.561 158.196 123.642L154.269 118.924Z' fill='%23F26E6E'/%3E%3Cpath d='M81.7751 169.951C81.3749 169.46 80.6251 169.46 80.2249 169.951L77.1603 173.71C76.4807 174.544 77.5706 175.652 78.4155 174.986V174.986C78.9807 174.541 79.8141 174.906 79.8705 175.623L80.0031 177.312C80.0997 178.541 81.9004 178.541 81.997 177.312L82.1297 175.623C82.186 174.906 83.0194 174.541 83.5846 174.987V174.987C84.4295 175.652 85.5194 174.544 84.8398 173.71L81.7751 169.951Z' fill='%23F26E6E'/%3E%3Cpath d='M44.2763 66.9562C43.8761 66.4633 43.1239 66.4633 42.7237 66.9562L31.7161 80.5141C30.9632 81.4413 32.176 82.6697 33.1128 81.9287L39.5762 76.8165C40.2037 76.3202 41.1311 76.7252 41.1935 77.5229L42.5032 94.2598C42.5994 95.4892 44.4009 95.4892 44.4971 94.2598L45.8068 77.5231C45.8692 76.7255 46.7966 76.3205 47.4241 76.8168L53.8873 81.9288C54.8241 82.6697 56.0368 81.4414 55.284 80.5142L44.2763 66.9562Z' fill='%23F26E6E'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_113_3542' x='1' y='34' width='186' height='139' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_113_3542'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_113_3542' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_113_3542'%3E%3Crect x='14' y='35' width='160' height='109' rx='2' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
}





</style>
