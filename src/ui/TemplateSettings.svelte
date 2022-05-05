<script>
	import Button from "./Button.svelte"
	import { valueStore } from "./data.js"

	export let template
	export let pageState

	let parts = {}
	let message
	let artworkTarget
	let currentSelection
	let previousSelection
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

	function findTemplateParts(template) {
		// Todo: Needs to be seperated into two
		parent.postMessage({ pluginMessage: { type: "find-template-parts", template } }, "*")
	}

	function fetchCurrentSelection(template) {
		// Todo: Needs to be seperated into two
		parent.postMessage({ pluginMessage: { type: "fetch-current-selection"}, template}, "*")
	}

	findTemplateParts(template)
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
		findTemplateParts(template)
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
		Configure which layers of your template represent the following elements below.
	</p>

	<div class="artwork">
		<div class="target" bind:this={artworkTarget} ></div>
		<div class="image"></div>
	</div>

	<!-- <p class="currentlySelected">&nbsp;{#if currentSelection}{currentSelection.name}{/if}</p> -->

	<!-- {#if currentSelection} -->
		{#if parts}

		<div class="List">
			{#each parts as part, i}

				<div class={currentSelection?.element === part.element ? "ListItem currentlySelected" : "ListItem"} use:hover={i}>
					<p class="element">&lt;{part.element}&gt;</p>
					{#if part.name}
					<span>{part.name}</span>
					{:else}
					<span class="currentSelectionName">{currentSelection ? currentSelection.name : ""}</span>
					{/if}
					<span class="buttons" style={part.name || currentSelection ? "" : "display: none;"}>
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

	.description {
		color: var(--figma-color-text-secondary, var(--color-black-30))
	}

	.SectionTitle {
		margin-top: -8px;
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

	.EditTemplate .artwork {
		position: relative;
		margin-bottom: 8px;
	}

	.EditTemplate .target.currentlySelected {
		margin-bottom: 24px; text-align: center;
		margin-left: -4px;
		color: var(--color-black-30)
	}

	.ListItem.currentlySelected {
		outline: 1px solid var(--color-purple);
		outline-offset: -1px;
	}

	.EditTemplate .hover {
		border: 2px solid var(--color-black-30);
	}

	.ListItem .currentSelectionName {
		display: none;
		color: var(--color-black-30)
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
		left: 65px;
		top: 14px;
		width: 106px;
		height: 74px;
	}

	.EditTemplate .target.tr {
		display: block;
		left: 65px;
		top: 33px;
		width: 106px;
		height: 36px;
	}

	.EditTemplate .target.td {
		display: block;
		left: 65px;
		top: 53px;
		width: 61px;
		height: 36px;
	}

	.EditTemplate .target.th {
		display: block;
		left: 110px;
		top: 13px;
		width: 61px;
		height: 36px;
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
		background-color: var(--color-hover-fill)
	}

	.ListItem:hover > .buttons {
		display: block;
	}

		.EditTemplate .image {
		margin: 0 auto;
    width: 160px;
    height: 102px;
	background-size: contain;
    background-image: url(data:image/jpeg;base64,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cYHQBh3oAaLBT/DycgcAEcdBwOmc89Mdc0AKLEY5HGcenPYnJxnrnGO3pyAKLBcjoBgckknjkjrwewOCPrigBv2FepHc4GPoQDnp0AOOnBJBwSAL9hXk4GR7euevHOD165J6EYoAPsA9OvJGDnGQSATjAGT0Of8Ax4gAUWK4AHY4JIGOmTgEjgHtkjr04BAE+wAg8D1PPU847kjtyT1zznqAH2Fc4xx34J4weh6kevXOSPTIAfYRxwvIAzz8uMZyMEEcZIGRjGMYwQANiMcde3Q498L/ACxjJ56LQAv2AbunLZ/iPAOc+/TjsccdWwABDYjkY7H8ME8EdCQDjPPbjIoADYj0HY4yD69skZ57YPA564AFFgm4k8jjAAHBGB0OPU5x1z1znAAfYBgdeh+v546ZOBgDHTnPAA37COuB3x0PA6Dgdc454zgd+oAosF57g4IJ6jkDk4Bz0J+715zwCAL9hUgdM5/IDHXkdOufT/vlQBwsgOo6eg4+7785OSAOgz6GgCzHBt7DH06dOcdzjHOOePc0AWlGB+X+f8k0AOoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKADA9KACgAoAKADFABigAwPT/AD0/lxQAUAFABQAYHp/nr/PmgAoAKADHfvQAYoAKAEwPQetAC0AFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAD/2Q==);
}
</style>
