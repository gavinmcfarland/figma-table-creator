import { convertToFrame, convertToComponent, getPluginData, getNodeIndex, setPluginData } from '@fignite/helpers'
import { removeChildren } from './old-helpers'

export let defaultRelaunchData = {
	detachTable: 'Detaches table and rows',
	spawnTable: 'Spawn a new table from this table',
	toggleColumnResizing: 'Use a component to resize columns or rows',
	switchColumnsOrRows: 'Switch between using columns or rows',
}

export function createTable(parts, settings, type?) {
	// FIXME: Get it to work with parts which are not components as well
	// FIXME: Check for imported components
	// FIXME: Check all conditions are met. Is table, is row, is cell, is instance etc.

	var tableMissing
	var templateComponent
	let tableContainer
	var table

	// If no table, create template then delete
	if (!parts.table) {
		parts.table = figma.createComponent()
		parts.table.name = 'Table'
		parts.table.layoutMode = 'VERTICAL'
		parts.table.primaryAxisSizingMode = 'AUTO'
		parts.table.counterAxisSizingMode = 'AUTO'
		tableMissing = true
	}

	templateComponent = parts.table
	tableContainer = convertToFrame(templateComponent.clone())

	if (settings.includeHeader && !parts.th) {
		figma.notify('No Header Cell component found')

		// FIXME: Check for header cell sooner so table creation doesn't start
		return
	}

	if (parts.table.id === templateComponent.id) {
		console.log('table and container are the same thing')
		if (type === 'COMPONENT') {
			table = convertToComponent(tableContainer)
			tableContainer = table
		} else {
			table = tableContainer
		}
	} else {
		// Remove table from template
		tableContainer.findAll((node) => {
			if (getPluginData(node, 'elementSemantics')?.is === 'table') {
				node.remove()
			}
		})

		var tableIndex = getNodeIndex(parts.table)

		// Add table back to template
		tableContainer.insertChild(tableIndex, table)
	}

	var firstRow
	var rowIndex

	if (tableMissing) {
		rowIndex = 0
	} else {
		rowIndex = getNodeIndex(parts.tr)
	}

	// Find the parent of the row because might not be the table?
	function getRowParent() {
		var row = table.findOne((node) => getPluginData(node, 'elementSemantics')?.is === 'tr')

		if (!row) {
			return parts.table
		} else {
			return row.parent
		}
	}

	var rowParent = getRowParent()

	// Remove children which are trs
	table.findAll((node) => {
		if (getPluginData(node, 'elementSemantics')?.is === 'tr') {
			node.remove()
		}
	})

	if (settings.columnResizing && type !== 'COMPONENT') {
		// First row should be a component
		firstRow = convertToComponent(parts.tr.clone())
		setPluginData(firstRow, 'elementSemantics', { is: 'tr' })
	} else {
		// First row should be a frame
		firstRow = convertToFrame(parts.tr.clone())
		setPluginData(firstRow, 'elementSemantics', { is: 'tr' })
	}

	rowParent.insertChild(rowIndex, firstRow)

	// Remove children which are tds
	firstRow.findAll((node) => {
		if (node) {
			if (getPluginData(node, 'elementSemantics')?.is === 'td' || getPluginData(node, 'elementSemantics')?.is === 'th') {
				node.remove()
			}
		}
	})

	if (tableMissing) {
		let length = firstRow.children.length
		for (let i = length - 1; i >= 0; i--) {
			firstRow.children[i].remove()
		}
	}

	// Create columns in first row
	for (let i = 0; i < settings.columnCount; i++) {
		var duplicateCell
		if (parts.td.type === 'COMPONENT') {
			duplicateCell = parts.td.createInstance()
		}
		if (parts.td.type === 'INSTANCE') {
			duplicateCell = parts.td.mainComponent.createInstance()
		}
		if (settings.cellWidth) {
			// let origLayoutAlign = duplicateCell.layoutAlign
			duplicateCell.resizeWithoutConstraints(settings.cellWidth, duplicateCell.height)
			// duplicateCell.layoutAlign = origLayoutAlign
		}

		setPluginData(duplicateCell, 'elementSemantics', { is: 'td' })
		// Figma doesn't automatically inherit this property
		duplicateCell.layoutAlign = parts.td.layoutAlign
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
		if (settings.columnResizing && type !== 'COMPONENT' && settings.includeHeader) {
			for (let i = 0; i < duplicateRow.children.length; i++) {
				var cell = duplicateRow.children[i]
				// cell.swapComponent(parts.th)
				// FIXME: Check if instance or main component

				cell.mainComponent = parts.td.mainComponent
				setPluginData(cell, 'elementSemantics', { is: 'td' })
			}
		}

		rowParent.insertChild(rowIndex + 1, duplicateRow)
	}

	// Swap first row to use header cell
	if (settings.includeHeader && parts.th) {
		for (var i = 0; i < firstRow.children.length; i++) {
			var child = firstRow.children[i]
			// FIXME: Check if instance or main component

			if (parts.th === 'INSTANCE') {
				child.swapComponent(parts.th.mainComponent)
			} else {
				child.swapComponent(parts.th)
			}

			// setPluginData(child, 'elementSemantics', { is: 'th' })
			// child.mainComponent = parts.th.mainComponent
		}
	}

	tableContainer.setRelaunchData(defaultRelaunchData)

	if (tableMissing) {
		tableContainer.remove()
	}

	return tableContainer
}
