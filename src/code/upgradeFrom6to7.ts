import { setPluginData, updatePluginData, getNodeIndex, convertToFrame, convertToComponent } from '@fignite/helpers'
import { getComponentById } from './helpers'

//TODO: Is it easier to ask the user to import and select their own components?

// 1. Hi, I'm tablo. My creator made me so I could help you upgrade to the shiny new version of Table Creator.
// 2. I notice you don't have a table or row component. Unfortunately you won't be able to continue using this plugin, only kidding. I just need to create some

// 1. The way table creator works is slightly different now. Instead of relying on a single cell component to create tables from. Table Creator now use a table component as a template. As part of this upgrade I'm going to hopefully successfully upgrade your existing components to work with the new version of Table Creator. Unfortunately because of the way plugins work without this making this upgrade you won't be able to continue using the plugin. You can either follow this upgrade, or start from scratch and try and link your old components.

// 2. First I'll look to see if I can find a table component. If you don't have one I'll create one for you. This will be used as the main template that new tables are created from.

// 3. Next I'll look to see if you have a row component. If you don't

let defaultRelaunchData = {
	detachTable: 'Detaches table and rows',
	spawnTable: 'Spawn a new table from this table',
	toggleColumnResizing: 'Use a component to resize columns or rows',
	switchColumnsOrRows: 'Switch between using columns or rows',
}

function createTableInstance(type, templateComponent, settings) {
	// FIXME: Get it to work with parts which are not components as well
	// FIXME: Check for imported components
	// FIXME: Check all conditions are met. Is table, is row, is cell, is instance etc.

	let tableInstance = convertToFrame(templateComponent.clone())
	let part = getTemplateParts(templateComponent)
	var table

	if (settings.includeHeader && !part.th) {
		figma.notify('No Header Cell component found')

		// FIXME: Check for header cell sooner so table creation doesn't start
		return
	}

	if (part.table.id === templateComponent.id) {
		console.log('table and container are the same thing')
		if (type === 'COMPONENT') {
			table = convertToComponent(tableInstance)
		} else {
			table = tableInstance
		}
	} else {
		// Remove table from template
		tableInstance.findAll((node) => {
			if (getPluginData(node, 'elementSemantics')?.is === 'table') {
				node.remove()
			}
		})

		var tableIndex = getNodeIndex(part.table)

		// Add table back to template
		tableInstance.insertChild(tableIndex, table)
	}

	var firstRow
	var rowIndex = getNodeIndex(part.tr)
	function getRowParent() {
		var row = table.findOne((node) => getPluginData(node, 'elementSemantics')?.is === 'tr')

		return row.parent
	}

	var rowParent = getRowParent()

	// Remove children which are trs
	table.findAll((node) => {
		if (getPluginData(node, 'elementSemantics')?.is === 'tr') {
			node.remove()
		}
	})

	if (settings.columnResizing) {
		// First row should be a component
		firstRow = convertToComponent(part.tr.clone())
		setPluginData(firstRow, 'elementSemantics', { is: 'tr' })
	} else {
		// First row should be a frame
		firstRow = convertToFrame(part.tr.clone())
		setPluginData(firstRow, 'elementSemantics', { is: 'tr' })
	}

	rowParent.insertChild(rowIndex, firstRow)

	// Remove children which are tds
	firstRow.findAll((node) => {
		console.log('children', node)
		if (node) {
			if (getPluginData(node, 'elementSemantics')?.is === 'td' || getPluginData(node, 'elementSemantics')?.is === 'th') {
				node.remove()
			}
		}
	})

	// Create columns in first row

	for (let i = 0; i < settings.columnCount; i++) {
		var duplicateCell
		if (part.td.type === 'COMPONENT') {
			duplicateCell = part.td.clone()
		}
		if (part.td.type === 'INSTANCE') {
			duplicateCell = part.td.mainComponent.createInstance()
		}
		if (settings.cellWidth) {
			// let origLayoutAlign = duplicateCell.layoutAlign
			duplicateCell.resizeWithoutConstraints(settings.cellWidth, duplicateCell.height)
			// duplicateCell.layoutAlign = origLayoutAlign
		}

		setPluginData(duplicateCell, 'elementSemantics', { is: 'td' })
		// Figma doesn't automatically inherit this property
		duplicateCell.layoutAlign = part.td.layoutAlign
		duplicateCell.primaryAxisAlignItems = settings.cellAlignment
		firstRow.appendChild(duplicateCell)
	}

	// Create rest of rows
	for (var i = 1; i < settings.rowCount; i++) {
		var duplicateRow

		if (firstRow.type === 'COMPONENT') {
			duplicateRow = firstRow.createInstance()
		} else {
			duplicateRow = firstRow.clone()
		}

		// If using columnResizing and header swap non headers to default cells
		if (settings.columnResizing && settings.includeHeader) {
			for (let i = 0; i < duplicateRow.children.length; i++) {
				var cell = duplicateRow.children[i]
				// cell.swapComponent(part.th)
				// FIXME: Check if instance or main component

				cell.mainComponent = part.td.mainComponent
				setPluginData(cell, 'elementSemantics', { is: 'td' })
			}
		}

		rowParent.insertChild(rowIndex + 1, duplicateRow)
	}

	// Swap first row to use header cell
	if (settings.includeHeader && part.th) {
		for (var i = 0; i < firstRow.children.length; i++) {
			var child = firstRow.children[i]
			// FIXME: Check if instance or main component

			child.swapComponent(part.th.mainComponent)
			setPluginData(child, 'elementSemantics', { is: 'th' })
			// child.mainComponent = part.th.mainComponent
		}
	}

	tableInstance.setRelaunchData(defaultRelaunchData)

	return tableInstance
}

export function upgradeFrom6to7() {
	function findUsersExisitingComponents() {
		return {
			table: getComponentById(figma.root.getPluginData('tableComponentID')),
			tr: getComponentById(figma.root.getPluginData('rowComponentID')),
			td: getComponentById(figma.root.getPluginData('cellComponentID')),
			th: getComponentById(figma.root.getPluginData('cellHeaderComponentID')),
		}
	}

	const usersExistingComponents = findUsersExisitingComponents()

	let newComponents = Object.assign({}, usersExistingComponents) as any

	console.log(usersExistingComponents)

	if (usersExistingComponents.td) {
		if (!usersExistingComponents.table) {
			console.log('no table')
			newTemplateComponent({
				components: {
					td: usersExistingComponents.td,
					th: usersExistingComponents.th,
				},
			})
		}
		// if (!usersExistingComponents.table) {
		// 	newComponents.table = figma.createComponent()
		// 	newComponents.table.name = 'Table'

		// 	// Leave a note to let user know how it works now
		// } else {
		// 	newComponents.table = usersExistingComponents.table
		// }

		// if (!usersExistingComponents.tr) {
		// 	newComponents.tr = figma.createComponent()
		// 	newComponents.tr.name = 'Row'
		// 	// Add auto layout

		// 	// Add cells to row component
		// 	newComponents.tr.appendChild(newComponents.td.createInstance())
		// 	newComponents.tr.appendChild(newComponents.td.createInstance())

		// 	var rowInstance = newComponents.tr.createInstance()

		// 	// Add row instance to table component
		// 	newComponents.table.appendChild(rowInstance)
		// } else {
		// 	newComponents.tr = usersExistingComponents.tr
		// }
	}

	// Need to set templateData on the users existing components
	// If they don't have a table template then I need to create one
	// Import user's old template component as a new template
	// Tidy up data on the users template by removing old pluginData
}
