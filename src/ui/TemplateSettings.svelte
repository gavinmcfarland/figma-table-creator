<script>
	import Button from "./Button.svelte"
	import { valueStore } from "./data.js"

	export let template
	export let pageState

	let parts = {}
	let message
	let artworkTarget
	let currentSelection = {}
	let previousSelection = {}
	let currentlyHovering = false

	function updateTables() {
		parent.postMessage({ pluginMessage: { type: "update-tables" } }, "*")
	}

	function linkComponent(component) {
		parent.postMessage({ pluginMessage: { type: "link-component", template: component } }, "*")
	}

	function editTemplate(template) {
		// Todo: Needs to be seperated into two
		parent.postMessage({ pluginMessage: { type: "edit-template", template } }, "*")
	}

	function fetchTemplateParts(template) {
		// Todo: Needs to be seperated into two
		parent.postMessage({ pluginMessage: { type: "fetch-template-parts", template } }, "*")
	}

	function fetchCurrentSelection(template) {
		// Todo: Needs to be seperated into two
		parent.postMessage({ pluginMessage: { type: "fetch-current-selection"}, template}, "*")
	}

	fetchTemplateParts(template)
	editTemplate(template)



	function doneEditing() {
		console.log("done editing")
		pageState = {
			welcomePageActive: false,
			createTablePageActive: true,
			templateSettingsPageActive: false
		}

		valueStore.update((data) => {
			data.pageState = pageState
			return data
		})

	}

	function addRemoveElement(event, part, i) {
		let {name, element, id} = part
		let button = event.target
		console.log(button)
		if (typeof name === "undefined") {
			parts[i].name = currentSelection.name
			artworkTarget.classList.add('taken')
			artworkTarget.classList.remove('not-taken')
			// artworkTarget.classList.remove('add')
			parent.postMessage({ pluginMessage: { type: "add-element", element } }, "*")

		}
		else {
			parts[i].name = undefined
			artworkTarget.classList.remove('remove')
			artworkTarget.classList.remove('taken')
			artworkTarget.classList.add('not-taken')

			parent.postMessage({ pluginMessage: { type: "remove-element", element, id } }, "*")
		}

		fetchCurrentSelection(template)
		fetchTemplateParts(template)
	}

	async function onMessage(event) {
		message = await event.data.pluginMessage

		if (message.type === "template-parts") {
			parts = Object.values(message.parts)
			console.log("template-parts-updated")
		}

		if (message.type === "current-selection") {
			currentSelection = message.selection

			if (currentSelection) {
				console.log("currentSelection", currentSelection)
				if (currentSelection.element) {

					if (previousSelection && previousSelection.element) {
						artworkTarget.classList.remove(previousSelection.element)
						artworkTarget.classList.remove('current-' + previousSelection.element)
					}
					artworkTarget.classList.add(currentSelection.element)
					artworkTarget.classList.add('current')
					artworkTarget.classList.add('current-' + currentSelection.element)
					previousSelection = message.selection
				}
				else {
					if(!currentlyHovering) {
						artworkTarget.classList.remove(previousSelection.element)
					}
					artworkTarget.classList.remove('current')
					artworkTarget.classList.remove('current-' + previousSelection.element)

					previousSelection = undefined
				}
			}
			else {
				if (previousSelection) {
					artworkTarget.classList.remove('current')
					artworkTarget.classList.remove('current-' + previousSelection.element)

					artworkTarget.classList.remove(previousSelection.element)
				}
				previousSelection = undefined
			}

		}
	}

	function hover(node, i) {

		const addRemoveButton = node.querySelector(".addRemoveButton")

		if (addRemoveButton) {
			addRemoveButton.addEventListener('mouseenter', () => {
				// if (previousSelection) {
				// artworkTarget.classList.remove(previousSelection.element)
				// }
				// artworkTarget.classList.add(parts[i].element)
				// artworkTarget.classList.add('hover')
				if (typeof parts[i].name !== "undefined") {
					artworkTarget.classList.add('remove')
				}
				else {

					artworkTarget.classList.add('add')
				}

			});

			addRemoveButton.addEventListener('mouseleave', () => {
				// artworkTarget.classList.remove(parts[i].element)
				// if (previousSelection) {
				// 	artworkTarget.classList.add(previousSelection.element)
				// 	artworkTarget.classList.remove('hover')
				// }

				artworkTarget.classList.remove('remove')
				artworkTarget.classList.remove('add')
			});
		}

		node.addEventListener('mouseenter', () => {
			currentlyHovering = true
			if (previousSelection) {
			artworkTarget.classList.remove(previousSelection.element)
			}
			artworkTarget.classList.add(parts[i].element)
			artworkTarget.classList.add('hover')

			if (parts[i].name) {
				artworkTarget.classList.add('taken')
			}
			else {
				artworkTarget.classList.add('not-taken')
			}

		});

		node.addEventListener('mouseleave', () => {
			currentlyHovering = false
			artworkTarget.classList.remove(parts[i].element)
			if (previousSelection) {
				artworkTarget.classList.add(previousSelection.element)
				artworkTarget.classList.remove('hover')
			}


			artworkTarget.classList.remove('taken')
			artworkTarget.classList.remove('not-taken')
		});
	}
</script>

<svelte:window on:message={onMessage} />

<div class="EditTemplate">
	<div class="SectionTitle">
		<span class="Label">
			<span class="icon" icon="component" />
			<span class="text text-bold">
				{template.name}
			</span>
		</span>
	</div>

	<p class="type m-xxsmall description">
		Configure which parts of your template represent the following elements below.
	</p>

	<div class="templateArtwork">
		<div class="target" bind:this={artworkTarget} ></div>
		<div class="image"></div>
	</div>

	<!-- <p class="currentlySelected">&nbsp;{#if currentSelection}{currentSelection.name}{/if}</p> -->

	<!-- {#if currentSelection} -->
		{#if parts}

		<div class="List">
			{#each parts as part, i}

				<div class={currentSelection?.element === part.element ? "ListItem currentlySelected" : "ListItem"} use:hover={i}>
					<p title="{part.longName}" class="element">&lt;{part.element}&gt;</p>
					{#if part.name}
					<span>{part.name}</span>
					{:else}
					<span class="currentSelectionName">{currentSelection ? currentSelection.name : ""}</span>
					{/if}
					<span class="templateButtons" style={part.name || currentSelection ? "" : "display: none;"}>
						<span class="refresh icon addRemoveButton" icon={part.name ? "minus" : "plus"} on:click={(event) => addRemoveElement(event, part, i)}></span>
					</span>
				</div>

			{/each}
		</div>
		{/if}
	<!-- {/if} -->

	<div class="BottomBar">
		<span on:click={() => doneEditing()}><Button id="create-table">Done</Button></span>
	</div>

</div>

<style global>

	.EditTemplate {
		margin-top: -8px;
	}

	.description {
		color: var(--figma-color-text-secondary, var(--color-black-30))
	}

	.SectionTitle {
		min-height: 34px;
		display: flex;
		place-items: center;
	}

	.SectionTitle .Label {
		display: flex;
		align-items: center;
		line-height: 1;
	}

	.SectionTitle .Label .icon {
		margin-right: 2px;
		margin-left: -4px;
	}

	.SectionTitle .Label .text {
		margin-top: 1px;
	}



	.text-bold {
		font-weight: 600;
	}

	.EditTemplate .target {
		border: 2px solid var(--color-purple);
		position: absolute;
		display: none;
		transition: all 0.25s ease-out;
	}

	.EditTemplate .templateArtwork {
		position: relative;
		margin-top: 24px;
		margin-bottom: 8px;
	}

	.EditTemplate .target.currentlySelected {
		margin-bottom: 24px; text-align: center;
		margin-left: -4px;
		color: var(--figma-color-text-tertiary, var(--color-black-30));
	}

	.ListItem.currentlySelected {
		outline: 1px solid var(--color-purple);
		outline-offset: -1px;
	}

	.figma-dark .EditTemplate .hover {
		border: 2px solid rgba(255,255,255,0.3);
	}
	.figma-light .EditTemplate .hover {
		border: 2px solid rgba(0,0,0,0.3);
	}

	.ListItem .currentSelectionName {
		display: none;
		color: var(--figma-color-text-tertiary, var(--color-black-30));
	}

	.ListItem:hover .currentSelectionName {
		display: block;
	}

	/* .EditTemplate .current {
		border: 2px solid #18A0FB;
	} */

	/* .EditTemplate .hover {
		border: 2px dashed red;
	}

	.EditTemplate .current {
		border: 2px dashed green;
	} */

	.EditTemplate .current-table.table, .EditTemplate .current-tr.tr, .EditTemplate .current-td.td, .EditTemplate .current-th.th {
		border: 2px solid var(--color-purple);
	}

	.EditTemplate .taken.taken {
		border-color: var(--color-purple) !important;
	}

	.EditTemplate .remove.remove {
		border-color: #FF4D4D !important;
	}

	.EditTemplate .add {
		border-color: var(--color-purple) !important;
	}

	.EditTemplate .not-taken {
		border-style: dashed !important;
	}

	.EditTemplate .target.table {
		display: block;
		left: 51px;
		top: -6px;
		width: 106px;
		height: 76px;
	}

	.EditTemplate .target.tr {
		display: block;
		left: 51px;
		top: 15px;
		width: 106px;
		height: 35px;
	}

	.EditTemplate .target.td {
		display: block;
		left: 51px;
		top: 35px;
		width: 60px;
		height: 35px;
	}

	.EditTemplate .target.th {
		display: block;
		left: 96px;
		top: -6px;
		width: 61px;
		height: 35px;
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

	.ListItem > .templateButtons {
		margin-left: auto;
		display: none;
		margin-right: -8px;
	}

	.ListItem:hover {
		background-color: var(--figma-color-bg-hover, var(--color-hover-fill));
	}

	.ListItem:hover > .templateButtons {
		display: block;
	}

		.figma-light .EditTemplate .image {
		margin: 0 auto;
    width: 110px;
    height: 81px;
	background-size: contain;
    background-image: url("data:image/svg+xml,%3Csvg width='110' height='81' viewBox='0 0 110 81' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_116_1790)'%3E%3Cg clip-path='url(%23clip0_116_1790)'%3E%3Crect x='9' y='1' width='92' height='62.1' rx='1.15' fill='white'/%3E%3Crect width='46' height='20.7' transform='translate(9 1)' fill='white' fill-opacity='0.01'/%3E%3Crect x='9' y='1' width='46' height='20.7' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='46' height='20.7' transform='translate(55 1)' fill='white' fill-opacity='0.01'/%3E%3Crect x='55' y='1' width='46' height='20.7' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='46' height='20.7' transform='translate(9 21.7)' fill='white' fill-opacity='0.01'/%3E%3Crect x='9' y='21.7' width='46' height='20.7' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='46' height='20.7' transform='translate(55 21.7)' fill='white' fill-opacity='0.01'/%3E%3Crect x='55' y='21.7' width='46' height='20.7' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='46' height='20.7' transform='translate(9 42.4)' fill='white' fill-opacity='0.01'/%3E%3Crect x='9' y='42.4' width='46' height='20.7' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='46' height='20.7' transform='translate(55 42.4)' fill='white' fill-opacity='0.01'/%3E%3Crect x='55' y='42.4' width='46' height='20.7' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='9' y='1' width='92' height='62.1' rx='1.15' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_116_1790' x='0' y='0' width='110' height='80.1' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='8'/%3E%3CfeGaussianBlur stdDeviation='4'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_116_1790'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_116_1790' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_116_1790'%3E%3Crect x='9' y='1' width='92' height='62.1' rx='1.15' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
}
.figma-dark .EditTemplate .image {
		margin: 0 auto;
    width: 110px;
    height: 81px;
	background-size: contain;
    background-image: url("data:image/svg+xml,%3Csvg width='110' height='81' viewBox='0 0 110 81' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_117_1791)'%3E%3Cg clip-path='url(%23clip0_117_1791)'%3E%3Crect x='9' y='1' width='92' height='62.1' rx='1.15' fill='%232D2D2C'/%3E%3Crect width='46' height='20.7' transform='translate(9 1)' fill='white' fill-opacity='0.01'/%3E%3Crect x='9' y='1' width='46' height='20.7' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='46' height='20.7' transform='translate(55 1)' fill='white' fill-opacity='0.01'/%3E%3Crect x='55' y='1' width='46' height='20.7' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='46' height='20.7' transform='translate(9 21.7)' fill='white' fill-opacity='0.01'/%3E%3Crect x='9' y='21.7' width='46' height='20.7' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='46' height='20.7' transform='translate(55 21.7)' fill='white' fill-opacity='0.01'/%3E%3Crect x='55' y='21.7' width='46' height='20.7' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='46' height='20.7' transform='translate(9 42.4)' fill='white' fill-opacity='0.01'/%3E%3Crect x='9' y='42.4' width='46' height='20.7' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='46' height='20.7' transform='translate(55 42.4)' fill='white' fill-opacity='0.01'/%3E%3Crect x='55' y='42.4' width='46' height='20.7' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='9' y='1' width='92' height='62.1' rx='1.15' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_117_1791' x='0' y='0' width='110' height='80.1' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='8'/%3E%3CfeGaussianBlur stdDeviation='4'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_117_1791'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_117_1791' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_117_1791'%3E%3Crect x='9' y='1' width='92' height='62.1' rx='1.15' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
}
</style>
