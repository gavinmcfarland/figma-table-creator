<script>
	import { valueStore } from "./data.js"
	import { onMount } from "svelte"
	import Field from "./Field.svelte"
	import Button from "./Button.svelte"
	import Dropdown, {getDropdown} from "./Dropdown.svelte"
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
	let selectedFile

	let welcomeSlides = [
		false,
		false,
		false,
		false,
		false
	]

	function setActiveSlide(number) {
		// Reset slides
		welcomeSlides = welcomeSlides.map(x => x = false)

		if (number => 0) {
			welcomeSlides[number] = true
		}


	}


	function updateSelectedTemplate(data, template) {
		// Look for selected table in local templates
		template = template || data.defaultTemplate

		for (var i in data.localTemplates) {
			if (template.component.key === data.localTemplates[i].component.key) {
				data.localTemplates[i].selected = true
			}
		}

		// for (let i = 0; i < data.remoteFiles.length; i++) {

		// }
		for (let i in data.remoteFiles) {
			var file = data.remoteFiles[i]
			for (let b in file.templates) {
				if (template.component.key === file.templates[b].component.key) {
					file.templates[b].selected = true
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

	function updateSelectedFile(data, file) {

		// file = file || data.defaultTemplate.file

		if (file) {
			selectedFile = file
		}
		else {
			if (data.defaultTemplate?.file.id === data.fileId) {
				selectedFile = data.defaultTemplate.file
				selectedFile.name = "Local templates"
			}
			else {
				for (var i in data.remoteFiles) {
					if (data.remoteFiles[i].id === data.defaultTemplate.file.id) {
						// data.remoteFiles[i].selected = true
						selectedFile = data.remoteFiles[i]
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

	function updateTableInstances(template) {
		parent.postMessage(
			{
				pluginMessage: {
					type: "update-table-instances",
					template: template
				}
			},
			"*"
		)
	}

	function handleInput(id, checked) {
		valueStore.update((data) => {
			data[id] = checked
			return data
		})
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
			columnResizing = value.columnResizing
		})

		if (data.pluginAlreadyRun) {
			setActiveSlide(4)
		}
		else {
			setActiveSlide(0)
		}

		console.log(welcomeSlides)

		if (data.type === "create-table") {
			welcomePageActive = false
			createTablePageActive = true
			settingsPageActive = false
		}


		if ((!Array.isArray(data.remoteFiles) || !data.remoteFiles.length ) || (!Array.isArray(data.localTemplates) || !data.localTemplates.length)) {
			welcomePageActive = true
			createTablePageActive = false
		}

		if ((Array.isArray(data.remoteFiles) && data.remoteFiles.length ) || (Array.isArray(data.localTemplates) && data.localTemplates.length)) {
			welcomePageActive = false
			createTablePageActive = true
		}

		if (data.type === "settings") {
			welcomePageActive = false
			createTablePageActive = false
			settingsPageActive = true
		}

		console.log(welcomeSlides)

		updateSelectedTemplate(data)

		updateSelectedFile(data)

		return data
	}

</script>

<svelte:window on:message={onLoad} />

<!-- {console.log(data)} -->

{#if createTablePageActive && data.defaultTemplate}
	<div class="container" style="padding: var(--size-100) var(--size-200)">
		<div class=section-title>
			<div class="SelectWrapper">
				<Dropdown fill icon="template" id="menu">
					<slot slot="label">{data.defaultTemplate?.name}</slot>

					<slot slot="content">
						<div class="menu">
							<div class="Title">

								<p style="font-weight: 600">Choose template</p>

								<Dropdown id="tooltip">
									<slot slot="label">
										{selectedFile.name}
										<!-- {#if data.defaultTemplate?.file?.id === data.fileId}
											Local templates
										{:else}
											{data.defaultTemplate?.file?.name}
										{/if} -->
									</slot>
									<slot slot="content">
										<div class="tooltip">
												{#if data.localTemplates}
													<div>
														<input checked="{selectedFile?.id === data.fileId ? true : false}" type="radio" id="localTemplates" name="files">
														<label on:click={(event) => {
															updateSelectedFile(data, {name: 'Local templates', id: data.fileId})
															// event.currentTarget.parentElement.closest(".Select").classList.remove("show")
															getDropdown('tooltip').close()
														}} for="localTemplates">Local templates</label>
													</div>
												{/if}
												{#if data.localTemplates && data.remoteFiles}
													<span class="tooltip-divider"></span>
												{/if}
												{#if data.remoteFiles}
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

										</div>
									</slot>
								</Dropdown>

							</div>
							<div class="menu__content">
								{#if selectedFile?.id === data.fileId}
									{#if data.localTemplates}
										<ul class="local-templates">
										{#each data.localTemplates as template}
											<li class="item {template.selected ? 'selected' : ''}" on:click={(event) => {

												// Only trigger if clicking on the element itself
												if(event.target !== event.currentTarget) return;

												setDefaultTemplate(template, data)
												// Hide menu when template set
												// event.currentTarget.parentElement.closest(".Select").classList.remove("show")
												getDropdown('menu').close()


												}}>{template.name} <span style="margin-left: auto; margin-right: calc(-1 * var(--size-100))" class="refresh icon" icon="swap" on:click={() => updateTableInstances(template)}></span></li>
										{/each}
										</ul>
									{/if}
								{:else}
									{#if data.remoteFiles}
										<div>
											{#each data.remoteFiles as file}
												{#if selectedFile?.id === file.id}
													<ul class="remote-file">
															{#each file.templates as template}
															<li class="item {template.selected ? 'selected' : ''}" on:click={(event) => {

																// Only trigger if clicking on the element itself
																if(event.target !== event.currentTarget) return;

																setDefaultTemplate(template, data)
																// Hide menu when template set
																// event.currentTarget.parentElement.closest(".Select").classList.remove("show")
																getDropdown('menu').close()
																}}>{template.name} <span style="margin-left: auto; margin-right: calc(-1 * var(--size-100))" class="refresh icon" icon="swap" on:click={() => updateTableInstances(template)}></span></li>
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
									}} for="columnResizing">Column Resizing</label>
							</div>
						</div>
					</slot>
				</Dropdown>
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
	{#if welcomeSlides[0]}

	<!-- <div class="container" style="padding: var(--size-200)">
		<span class="table-creator-icon" width="172" height="148" />
		<div class="svg1" style="margin: 0 auto"></div>
		<h6>Welcome</h6>
		<p>
			Table Creator lets you create custom-styled tables from templates that are easy to resize, edit and use with your design system.<br />
		</p>
		<span on:click={() => setActiveSlide(1)}><Button classes="secondary">Next</Button></span>
	</div> -->

	<!-- if existing user -->
	<div class="container" style="padding: var(--size-200)">
		<span class="table-creator-icon" width="172" height="148" />
		<div class="svg1" style="margin: 0 auto"></div>
		<h6>What's new</h6>
		<p>
			Table Creator has been rebuilt from the ground up with some new features.
		</p>
		<span on:click={() => setActiveSlide(1)}><Button classes="secondary">Next</Button></span>
	</div>


	{/if}
	{#if welcomeSlides[1]}
	<div class="container" style="padding: var(--size-200)">
		<span class="table-creator-icon" width="172" height="148" />
		<div class="svg1" style="margin: 0 auto"></div>
		<h6>Templates</h6>
		<p>
			A template is a component which the plugin uses to create tables from. Once a table is created, it's appearance can be updated from the plugin.
		</p>
		<span on:click={() => setActiveSlide(2)}><Button classes="secondary">Next</Button></span>
	</div>
	{/if}
	{#if welcomeSlides[2]}
	<div class="container" style="padding: var(--size-200)">
		<span class="table-creator-icon" width="172" height="148" />
		<div class="svg1" style="margin: 0 auto"></div>
		<h6>Multiple templates</h6>
		<p>
			Manage multiple table designs by using different templates. Create as many templates as you need.<br />
		</p>
		<span on:click={() => setActiveSlide(3)}><Button classes="secondary">Next</Button></span>
	</div>
	{/if}
	{#if welcomeSlides[3]}
	<div class="container" style="padding: var(--size-200)">
		<span class="table-creator-icon" width="172" height="148" />
		<div class="svg1" style="margin: 0 auto"></div>
		<h6>Importing templates</h6>
		<p>
			You can use templates across different files. First publish the template. Copy an instance to the file you want, and import it from the plugin menu. The plugin will now reference the template in the remote file.
		</p>
		<span on:click={() => setActiveSlide(4)}><Button classes="secondary">Next</Button></span>
	</div>
	{/if}
	{#if welcomeSlides[4]}
	<div class="container" style="padding: var(--size-200)">
		<span class="table-creator-icon" width="172" height="148" />
		<div class="svg1" style="margin: 0 auto"></div>
		<h6>Get started</h6>
		<p>
			Begin by creating a new template which you can customise, or import an existing one from the plugin menu.<br />
		</p>
		<span on:click={newTemplate}><Button classes="secondary">New Template</Button></span>
		<!-- <span on:click={chooseComponents}><Button classes="secondary">Import Template</Button></span> -->
	</div>
	{/if}
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

	[icon="swap"]::before {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M14.6096 5.68765L13.4349 7.15603C13.4268 7.10387 13.418 7.05185 13.4084 7C13.2569 6.18064 12.9203 5.40189 12.419 4.72539C11.7169 3.77797 10.7289 3.08128 9.60075 2.73808C8.47259 2.39489 7.264 2.42337 6.15326 2.81933C5.36015 3.10206 4.64691 3.56145 4.06479 4.15764C3.83166 4.3964 3.61956 4.6571 3.43178 4.93718L3.43192 4.93728L4.26237 5.49406L4.26252 5.49416C4.79977 4.69282 5.58035 4.08538 6.4891 3.76143C7.39785 3.43748 8.38666 3.41418 9.30967 3.69496C10.2327 3.97574 11.041 4.54574 11.6154 5.32088C12.1002 5.97502 12.3966 6.74603 12.4774 7.55063L10.2774 6.08398L9.7227 6.91603L12.7227 8.91603L13.1041 9.1703L13.3905 8.81235L15.3905 6.31235L14.6096 5.68765ZM2.60962 7.18765L0.609619 9.68765L1.39049 10.3123L2.56519 8.84397C2.57329 8.89614 2.58213 8.94815 2.59172 9C2.74323 9.81936 3.07981 10.5981 3.58113 11.2746C4.2832 12.222 5.27119 12.9187 6.39935 13.2619C7.52751 13.6051 8.7361 13.5766 9.84684 13.1807C10.64 12.8979 11.3532 12.4386 11.9353 11.8424C12.168 11.6041 12.3797 11.344 12.5672 11.0646L12.5683 11.0628L12.5682 11.0627L11.7377 10.5059L11.7376 10.5058L11.7365 10.5074C11.1993 11.308 10.4192 11.9148 9.51101 12.2386C8.60225 12.5625 7.61344 12.5858 6.69044 12.305C5.76744 12.0243 4.95911 11.4543 4.38471 10.6791C3.89996 10.025 3.60346 9.25397 3.52271 8.44937L5.7227 9.91603L6.2774 9.08398L3.2774 7.08398L2.89598 6.8297L2.60962 7.18765Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
	}

	[icon="ellipses"]::before {
		background-image: url("data:image/svg+xml;charset=utf8,%3Csvg fill='none' height='32' width='32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath clip-rule='evenodd' d='M11.5 16a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm4.5 1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z' fill='%23000' fill-rule='evenodd'/%3E%3C/svg%3E")
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
		margin-top: 1px;

	}

	.menu__content {
		min-height: calc(4.5 * var(--size-400));
		max-height: calc(4.5 * var(--size-400));
		overflow-y: auto;
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
		border-radius: var(--border-radius-25);
	}

	.ButtonIcon:last-child {
		margin-right: calc(-1 * var(--size-100));
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


	.refresh {
		display: none;
		height: 32px;
		width: 32px;
	}

	.refresh:hover {
		background-color: var(--color-hover-fill);
		border-radius: 2px;
	}

	.item:hover > .refresh {
		display: block;
	}

	h6 {
		font-size: 1em;
		margin-bottom: var(--size-100);
	}

	.svg1 {
    width: 223px;
    height: 226px;
	background-size: contain;
    background-image: url(data:image/jpeg;base64,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);
}


</style>
