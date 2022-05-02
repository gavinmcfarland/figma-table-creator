import {
	convertToFrame,
	convertToComponent,
	getPluginData,
	getNodeIndex,
	setPluginData,
	setClientStorageAsync,
	getClientStorageAsync,
} from '@fignite/helpers'
import { removeChildren, getTemplateParts } from './helpers'
import { updateClientStorageAsync } from './old-helpers'

export let defaultRelaunchData = {
	detachTable: 'Detaches table and rows',
	spawnTable: 'Spawn a new table from this table',
	toggleColumnResizing: 'Use a component to resize columns or rows',
	switchColumnsOrRows: 'Switch between using columns or rows',
}

export async function updatePluginVersion(semver) {
	return updateClientStorageAsync('pluginVersion', (pluginVersion) => {
		// Remove plugin version from document for now
		if (figma.root.getPluginData('pluginVersion')) figma.root.setPluginData('pluginVersion', '')
		return semver || pluginVersion
	})
}

export function createTable(templateComponent, settings, type?) {
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
			tableInstance = table
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

	if (settings.columnResizing && type !== 'COMPONENT') {
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
		if (settings.columnResizing && type !== 'COMPONENT' && settings.includeHeader) {
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

let defaultParts = {
	table: () => {
		let node = figma.createComponent()
		let obj = {
			layoutMode: 'VERTICAL',
			counterAxisSizingMode: 'AUTO',
			primaryAxisSizingMode: 'AUTO',
		}
		return Object.assign(node, obj)
	},
	tr: () => {
		let node = figma.createComponent()
		let obj = {
			layoutMode: 'VERTICAL',
			counterAxisSizingMode: 'AUTO',
			primaryAxisSizingMode: 'AUTO',
		}
		return Object.assign(node, obj)
	},
}

export function tableFactory(templateComponent) {
	let parts = getTemplateParts(templateComponent)

	// Find the parent of the row because row might be in another frame inside table
	let rowParent = !parts.tr ? parts.table : parts.tr.parent

	function checkForHeaderComponent() {
		if (opts.settings.includeHeader && !opts.parts.th) {
			figma.notify('No Header Cell component found')

			// FIXME: Check for header cell sooner so table creation doesn't start
			return
		}
	}
	function checkIfTableSameAsContainer() {
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
	}
	function createFirstRow() {
		let firstRow

		if (opts.settings.columnResizing && opts.type !== 'COMPONENT') {
			firstRow = convertToComponent(parts.tr.clone())
		} else {
			firstRow = convertToFrame(parts.tr.clone())
		}

		setPluginData(firstRow, 'elementSemantics', { is: 'tr' })

		// Remove table cells from row so that they can prepopulated
		firstRow.findAll((node) => {
			if (node) {
				if (getPluginData(node, 'elementSemantics')?.is === 'td' || getPluginData(node, 'elementSemantics')?.is === 'th') {
					node.remove()
				}
			}
		})

		if (tableMissing) {
			removeChildren(firstRow)
		}

		return firstRow
	}
	function createColumnCells() {
		let firstRow = createFirstRow()

		// Only remove the rows
		rowParent.findAll((node) => {
			if (getPluginData(node, 'elementSemantics')?.is === 'tr') {
				node.remove()
			}
		})

		// If a row part can't be found then this needs to inserted at 0
		rowParent.insertChild(!parts.tr ? 0 : getNodeIndex(parts.tr), firstRow)

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
	}

	// !parts.table ? (parts.table = defaultParts.table()) : null
	// !parts.tr ? (parts.tr = defaultParts.tr()) : null

	checkForHeaderComponent()
	// checkIfTableSameAsContainer()
	createColumnCells()
}
