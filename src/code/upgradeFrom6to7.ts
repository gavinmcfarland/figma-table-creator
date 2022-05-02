import { setPluginData } from '@fignite/helpers'
import { getComponentById, positionInCenterOfViewport, removeChildren } from './helpers'
import { createTable, tableFactory } from './globals'

//TODO: Is it easier to ask the user to import and select their own components?

// 1. Hi, I'm tablo. My creator made me so I could help you upgrade to the shiny new version of Table Creator.
// 2. I notice you don't have a table or row component. Unfortunately you won't be able to continue using this plugin, only kidding. I just need to create some

// 1. The way table creator works is slightly different now. Instead of relying on a single cell component to create tables from. Table Creator now use a table component as a template. As part of this upgrade I'm going to hopefully successfully upgrade your existing components to work with the new version of Table Creator. Unfortunately because of the way plugins work without this making this upgrade you won't be able to continue using the plugin. You can either follow this upgrade, or start from scratch and try and link your old components.

// 2. First I'll look to see if I can find a table component. If you don't have one I'll create one for you. This will be used as the main template that new tables are created from.

// 3. Next I'll look to see if you have a row component. If you don't

// let tableInstance = createTable(getTemplateParts(templateComponent), msg.data, 'COMPONENT')

export function upgradeFrom6to7() {
	function cleanupOldPluginData() {
		let keys = ['cellComponentID', 'cellHeaderComponentID', 'rowComponentID', 'tableComponentID']

		keys.forEach((element) => {
			figma.root.setPluginData(element, '')
		})
	}
	function createTemplateComponent() {
		let cellComponent = getComponentById(figma.root.getPluginData('cellComponentID'))
		// TODO: Set semantics
		setPluginData(cellComponent, `elementSemantics`, { is: 'td' })

		let headerComponent = getComponentById(figma.root.getPluginData('cellHeaderComponentID'))
		if (headerComponent) setPluginData(headerComponent, `elementSemantics`, { is: 'th' })

		let rowComponent = getComponentById(figma.root.getPluginData('rowComponentID')) || figma.createComponent()
		setPluginData(rowComponent, `elementSemantics`, { is: 'tr' })

		// Apply styling to row
		removeChildren(rowComponent)

		rowComponent.name = getComponentById(figma.root.getPluginData('rowComponentID')).name || '_Row'
		rowComponent.layoutMode = 'HORIZONTAL'
		rowComponent.primaryAxisSizingMode = 'AUTO'
		rowComponent.counterAxisSizingMode = 'AUTO'
		rowComponent.clipsContent = true

		let cellInstance1 = cellComponent.createInstance()
		let cellInstance2 = cellComponent.createInstance()

		rowComponent.appendChild(cellInstance1)
		rowComponent.appendChild(cellInstance2)

		// We need to clone it because we don't want it to affect existing components
		let tableComponent = getComponentById(figma.root.getPluginData('tableComponentID'))
		let templateComponent = tableComponent ? tableComponent.clone() : figma.createComponent()
		setPluginData(templateComponent, `elementSemantics`, { is: 'table' })

		// Apply styling to table
		removeChildren(templateComponent)

		templateComponent.name = getComponentById(figma.root.getPluginData('tableComponentID')).name || 'Table 1'
		templateComponent.layoutMode = 'VERTICAL'
		templateComponent.primaryAxisSizingMode = 'AUTO'
		templateComponent.counterAxisSizingMode = 'AUTO'

		let rowInstance1 = rowComponent.createInstance()
		let rowInstance2 = rowComponent.createInstance()
		let rowInstance3 = rowComponent.createInstance()

		templateComponent.appendChild(rowInstance1)
		templateComponent.appendChild(rowInstance2)
		templateComponent.appendChild(rowInstance3)

		// Swap header cells
		if (headerComponent) {
			rowInstance1.children[0].swapComponent(headerComponent)
			rowInstance1.children[1].swapComponent(headerComponent)
		}

		// Remove row component if user didn't have them
		if (!getComponentById(figma.root.getPluginData('rowComponentID'))) rowComponent.remove()

		return templateComponent
	}

	if (getComponentById(figma.root.getPluginData('cellComponentID'))) {
		const templateComponent = createTemplateComponent()
		// TODO: Needs to be added to list of templates
		// TODO: Needs to relink previously created tables
		// TODO: Needs to create tooltip

		positionInCenterOfViewport(templateComponent)
		figma.currentPage.selection = [templateComponent]

		cleanupOldPluginData()
	}
}
