import { getRemoteFilesAsync, getRecentFilesAsync } from '@fignite/helpers'
import {
	convertToFrame,
	convertToComponent,
	getPluginData,
	getNodeIndex,
	setPluginData,
	setClientStorageAsync,
	getClientStorageAsync,
	getDocumentData,
	setDocumentData,
} from '@fignite/helpers'
import { removeChildren, getTemplateParts, genRandomId, lookForComponent, copyPasteStyle } from './helpers'
import { updateClientStorageAsync } from './old-helpers'

export let defaultRelaunchData = {
	detachTable: 'Detaches table and rows',
	toggleColumnResizing: 'Turn column resizing on or off',
	switchColumnsOrRows: 'Switch between using columns or rows',
	updateTables: 'Refresh tables already created',
}

export function convertToNumber(data) {
	if (Number(data)) {
		return Number(data)
	} else {
		return data
	}
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

	let part = getTemplateParts(templateComponent)
	let tableInstance

	if (!part.table || !part.tr || !part.td || (!part.th && settings.includeHeader)) {
		let array = []
		part.table ? null : array.push('table')
		part.tr ? null : array.push('row')
		!part.th && settings.includeHeader ? array.push('header') : null
		part.td ? null : array.push('cell')

		if (array.length > 1) {
			figma.notify(`Template parts "${array.join(', ')}" not configured`)
		} else {
			figma.notify(`Template part "${array.join(', ')}" not configured`)
		}
		tableInstance = false
	} else {
		tableInstance = convertToFrame(templateComponent.clone())

		var table

		if (part.table.id === templateComponent.id) {
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
			firstRow.layoutAlign = part.tr.layoutAlign
			firstRow.primaryAxisSizingMode = part.tr.primaryAxisSizingMode

			// Don't apply if layer already ignored
			if (!firstRow.name.startsWith('.') && !firstRow.name.startsWith('_')) {
				// Add dot to name do that component is not published
				firstRow.name = '.' + firstRow.name
			}
			setPluginData(firstRow, 'elementSemantics', { is: 'tr' })
		} else {
			// First row should be a frame
			firstRow = convertToFrame(part.tr.clone())
			setPluginData(firstRow, 'elementSemantics', { is: 'tr' })
		}

		rowParent.insertChild(rowIndex, firstRow)

		// Remove children which are tds and ths
		// firstRow.findAll((node) => {
		// 	if (node) {
		// 		if (getPluginData(node, 'elementSemantics')?.is === 'td' || getPluginData(node, 'elementSemantics')?.is === 'th') {
		// 			node.remove()
		// 		}
		// 	}
		// })

		removeChildren(firstRow)

		// If height specified then make rows grow to height
		// Change size of cells
		if (settings.tableHeight && settings.tableHeight !== 'HUG') {
			firstRow.layoutGrow = 1
		}

		// MANDATORY PROP
		firstRow.layoutAlign = 'STRETCH'

		// Create columns in first row

		for (let i = 0; i < settings.columnCount; i++) {
			var duplicateCell
			if (part.td.type === 'COMPONENT') {
				duplicateCell = part.td.clone()
			}
			if (part.td.type === 'INSTANCE') {
				duplicateCell = part.td.mainComponent.createInstance()
			}
			if (settings.cellWidth && settings.cellWidth !== 'FILL') {
				// if (settings.cellWidth === 'FILL') {
				// 	duplicateCell.layoutGrow = 1
				// } else {
				// let origLayoutAlign = duplicateCell.layoutAlign
				duplicateCell.resizeWithoutConstraints(settings.cellWidth, duplicateCell.height)
				// duplicateCell.layoutAlign = origLayoutAlign
				// }
			}

			// Change size of cells
			if (settings.tableWidth && settings.tableWidth !== 'HUG') {
				duplicateCell.layoutGrow = 1
			}

			setPluginData(duplicateCell, 'elementSemantics', { is: 'td' })

			duplicateCell.primaryAxisAlignItems = settings.cellAlignment

			firstRow.appendChild(duplicateCell)

			// We want to always force the cells to stretch to height of row regardless of users settings
			duplicateCell.layoutAlign = 'STRETCH'

			// The property below would need to be applied to if I wanted to force this. Normally inherited from cell
			duplicateCell.primaryAxisSizingMode = 'FIXED'
		}

		// Create rest of rows
		for (var i = 1; i < settings.rowCount; i++) {
			var duplicateRow

			if (firstRow.type === 'COMPONENT') {
				duplicateRow = firstRow.createInstance()
				// BUG: isn't copying across layoutAlign, so we have to do it manually
				duplicateRow.layoutAlign = firstRow.layoutAlign
			} else {
				duplicateRow = firstRow.clone()
			}

			if (settings.tableHeight && settings.tableHeight !== 'HUG') {
				duplicateRow.layoutGrow = 1
			}

			// If using columnResizing and header swap non headers to default cells
			if (settings.columnResizing && type !== 'COMPONENT' && settings.includeHeader) {
				for (let i = 0; i < duplicateRow.children.length; i++) {
					var cell = duplicateRow.children[i]
					// cell.swapComponent(part.th)
					// FIXME: Check if instance or main component

					cell.mainComponent = part.td.mainComponent
					setPluginData(cell, 'elementSemantics', { is: 'td' })

					// Needs to be applied here too
					cell.primaryAxisSizingMode = 'FIXED'
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

		// Set width of table

		if (settings.tableWidth && settings.tableWidth !== 'HUG') {
			tableInstance.resize(convertToNumber(settings.tableWidth), tableInstance.height)
		}
		if (settings.tableHeight && settings.tableHeight !== 'HUG') {
			tableInstance.resize(tableInstance.width, convertToNumber(settings.tableHeight))
		}

		return tableInstance
	}
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

export function File(data?) {
	// TODO: if fileId doesn't exist then create random ID and set fileId

	this.id = getDocumentData('fileId') || setDocumentData('fileId', genRandomId())
	// this.name = `{figma.getNodeById("0:1").name}`
	this.name = figma.root.name
	if (data) this.data = data
}

export function Template(node) {
	this.id = node.id
	this.name = node.name
	this.component = {
		id: node.id,
		key: node.key,
	}
	this.file = {
		id: getDocumentData('fileId') || setDocumentData('fileId', genRandomId()),
		name: figma.root.name,
	}
}

// function getLocalTemplateComponents() {
// 	return figma.root.findAll((node) => getPluginData(node, 'template') && node.type === 'COMPONENT')
// }
export function getLocalTemplates() {
	figma.skipInvisibleInstanceChildren = true
	var templates = []
	var components = figma.root.findAllWithCriteria({
		types: ['COMPONENT'],
	})
	for (let i = 0; i < components.length; i++) {
		let node = components[i]
		var templateData = getPluginData(node, 'template')
		if (templateData && node.type === 'COMPONENT') {
			// ID could update if copied to another file
			templateData.id = node.id
			templateData.name = node.name
			templateData.component.id = node.id
			// KEY needs updating if template duplicated
			templateData.component.key = node.key
			// Update file id incase component moved to another file
			templateData.file.id = getDocumentData('fileId')
			setPluginData(node, 'template', templateData)
			templates.push(templateData)
		}
	}
	// figma.root.findAll((node) => {
	// 	var templateData = getPluginData(node, 'template')
	// 	if (templateData && node.type === 'COMPONENT') {
	// 		// ID could update if copied to another file
	// 		templateData.id = node.id
	// 		templateData.name = node.name
	// 		templateData.component.id = node.id
	// 		// KEY needs updating if template duplicated
	// 		templateData.component.key = node.key
	// 		// Update file id incase component moved to another file
	// 		templateData.file.id = getDocumentData('fileId')
	// 		setPluginData(node, 'template', templateData)
	// 		templates.push(templateData)
	// 	}
	// })

	return templates
}

export async function setDefaultTemplate(templateData) {
	// Only set prevoious template if default template has been set once
	// let previousTemplate = getDocumentData('defaultTemplate') ? getDocumentData('defaultTemplate') : null

	await getRemoteFilesAsync()
	await getRecentFilesAsync(getLocalTemplates())
	setDocumentData('defaultTemplate', templateData)

	figma.ui.postMessage({
		type: 'post-default-template',
		defaultTemplate: templateData,
		localTemplates: getLocalTemplates(),
	})

	// if (previousTemplate) {
	// 	setPreviousTemplate(previousTemplate)
	// }
}

export async function setPreviousTemplate(templateData) {
	// await getRemoteFilesAsync()
	// await getRecentFilesAsync(getLocalTemplates())
	setDocumentData('previousTemplate', templateData)
	return templateData
}

export async function updateTables(template) {
	// FIXME: Template file name not up to date for some reason

	var tables = figma.root.findAll((node) => getPluginData(node, 'template')?.id === template.id)
	// getAllTableInstances()

	var templateComponent = await lookForComponent(template)

	if (templateComponent && tables) {
		var rowTemplate = templateComponent.findOne((node) => getPluginData(node, 'elementSemantics')?.is === 'tr')

		for (let b = 0; b < tables.length; b++) {
			var table = tables[b]

			// Don't apply if an instance
			if (table.type !== 'INSTANCE') {
				copyPasteStyle(templateComponent, table, { exclude: ['name'] })

				table.findAll((node) => {
					if ((getPluginData(node, 'elementSemantics')?.is === 'tr') === true && node.type !== 'INSTANCE') {
						copyPasteStyle(rowTemplate, node, { exclude: ['name'] })
					}
				})
			}
		}
	}
}

export function getTableSettings(tableNode) {
	let rowCount = 0
	let columnCount = 0
	let usingColumnsOrRows = 'rows'
	let tableWidth
	let tableHeight

	for (let i = 0; i < tableNode.children.length; i++) {
		var node = tableNode.children[i]
		if (getPluginData(node, 'elementSemantics')?.is === 'tr') {
			rowCount++
		}
	}

	let firstRow = tableNode.findOne((node) => getPluginData(node, 'elementSemantics')?.is === 'tr')
	let firstCell = firstRow.findOne(
		(node) => getPluginData(node, 'elementSemantics')?.is === 'td' || getPluginData(node, 'elementSemantics')?.is === 'th'
	)

	if (firstRow.parent.layoutMode === 'VERTICAL') {
		usingColumnsOrRows = 'rows'
	}

	if (firstRow.parent.layoutMode === 'HORIZONTAL') {
		usingColumnsOrRows = 'columns'
	}

	for (let i = 0; i < firstRow.children.length; i++) {
		var node = firstRow.children[i]
		var cellType = getPluginData(node, 'elementSemantics')?.is
		if (cellType === 'td' || cellType === 'th') {
			columnCount++
		}
	}

	return {
		tableWidth: (() => {
			if (tableNode.counterAxisSizingMode === 'AUTO') {
				return 'HUG'
			} else {
				return tableNode.width
			}
		})(),
		tableHeight: (() => {
			if (tableNode.primaryAxisSizingMode === 'AUTO') {
				return 'HUG'
			} else {
				return tableNode.height
			}
		})(),
		columnCount,
		rowCount,
		columnResizing: firstRow.type === 'COMPONENT' ? true : false,
		includeHeader: getPluginData(firstCell, 'elementSemantics')?.is === 'th' ? true : false,
		cellAlignment: 'MIN',
		usingColumnsOrRows,
		cellWidth: firstCell.width,
	}
}
