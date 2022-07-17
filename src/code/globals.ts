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
	genUID,
	getRemoteFiles,
} from '@fignite/helpers'
import { removeChildren, getTemplateParts, genRandomId, lookForComponent, copyPasteStyle, getComponentById, isEmpty } from './helpers'
import { updateClientStorageAsync } from './old-helpers'

export let defaultRelaunchData = {
	detachTable: 'Detaches table and rows',
	toggleColumnResizing: 'Apply or remove column resizing',
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

function extractValues(objectArray) {
	return Object.entries(objectArray).reduce(function (acc, obj) {
		let [key, value] = obj
		let thing
		// if (value.type !== 'VARIANT') {
		thing = { [key]: value.value }
		// }
		return { ...acc, ...thing }
	}, {})
}

function copyTemplatePart(partParent, node, index, templateSettings, tableSettings?) {
	// TODO: Copy across overrides like text, and instance swaps

	// Beacuse template will not be as big as table we need to cap the index to the size of the template, therefore copying the last cell
	if (index > templateSettings.table.matrix[0][0] - 1) {
		index = templateSettings.table.matrix[0][0] - 1
	}

	let templateCell = partParent.children[index]

	// Copy across width
	if (tableSettings) {
		console.log('cellWidth', tableSettings.table.cell[0][0])
		let cellWidth
		if (tableSettings.table.cell[0][0] === '$') {
			cellWidth = templateCell.width
		} else {
			cellWidth = tableSettings.table.cell[0][0]
		}
		if (cellWidth && cellWidth !== 'FILL' && cellWidth !== 'HUG') {
			node.resizeWithoutConstraints(cellWidth, node.height)
		}
	}

	// Set component properties on instances
	if (templateCell.componentProperties) {
		node.setProperties(extractValues(templateCell.componentProperties))
	}
}

export function createTable(templateComponent, settings, type?) {
	// FIXME: Get it to work with parts which are not components as well
	// FIXME: Check for imported components
	// FIXME: Check all conditions are met. Is table, is row, is cell, is instance etc.

	let part = getTemplateParts(templateComponent)
	let tableInstance

	let templateSettings = getTableSettings(part.table)

	// Santitize data
	settings.table.matrix[0][0] = convertToNumber(settings.table.matrix[0][0])
	settings.table.matrix[0][1] = convertToNumber(settings.table.matrix[0][1])
	settings.table.size[0][0] = convertToNumber(settings.table.size[0][0])
	settings.table.size[0][1] = convertToNumber(settings.table.size[0][1])
	settings.table.cell[0][0] = convertToNumber(settings.table.cell[0][0])
	settings.table.cell[0][1] = convertToNumber(settings.table.cell[0][1])

	// Could be better. Need a way to avoid mutating original object (settings)
	let tableSettings = {
		table: {
			matrix: [[settings.table.matrix[0][0], settings.table.matrix[0][1]]],
			size: [[settings.table.size[0][0], settings.table.size[0][1]]],
			cell: [[settings.table.cell[0][0], settings.table.cell[0][1]]],
		},
	}

	// Get settings from template
	if (settings.table.matrix[0][0] === '$') {
		tableSettings.table.matrix[0][0] = templateSettings.table.matrix[0][0]
	}

	if (settings.table.matrix[0][1] === '$') {
		tableSettings.table.matrix[0][1] = templateSettings.table.matrix[0][1]
	}

	if (settings.table.size[0][0] === '$') {
		tableSettings.table.size[0][0] = templateSettings.table.size[0][0]
	}

	if (settings.table.size[0][1] === '$') {
		tableSettings.table.size[0][1] = templateSettings.table.size[0][1]
	}

	// Can't set this here because needs to happen inside template
	// if (settings.table.cell[0][0] === '$') {
	// 	tableSettings.table.cell[0][0] = templateSettings.table.size[0][0]
	// }

	console.log(templateSettings.table.cell[0][0], tableSettings.table.cell[0][0])

	if (settings.table.cell[0][1] === '$') {
		tableSettings.table.cell[0][1] = templateSettings.table.cell[0][1]
	}

	if (!part.table || !part.tr || !part.td || (!part.th && settings.table.options.header)) {
		let array = []
		part.table ? null : array.push('table')
		part.tr ? null : array.push('row')
		!part.th && settings.table.options.header ? array.push('header') : null
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

		if (settings.table.options.resizing && type !== 'COMPONENT') {
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

		removeChildren(firstRow)

		// If height specified then make rows grow to height
		// Change size of cells
		if (tableSettings.table.size[0][1] && tableSettings.table.size[0][1] !== 'HUG') {
			firstRow.layoutGrow = 1
		}

		// MANDATORY PROP as can't guarentee user will or figma will honour this
		firstRow.layoutAlign = 'STRETCH'

		// Create columns in first row

		for (let i = 0; i < tableSettings.table.matrix[0][0]; i++) {
			var duplicateCell
			if (part.td.type === 'COMPONENT') {
				duplicateCell = part.td.clone()
			}
			if (part.td.type === 'INSTANCE') {
				duplicateCell = part.td.mainComponent.createInstance()
			}

			// Change size of cells
			if (tableSettings.table.size[0][0] && tableSettings.table.size[0][0] !== 'HUG') {
				duplicateCell.layoutGrow = 1
			}

			setPluginData(duplicateCell, 'elementSemantics', { is: 'td' })

			firstRow.appendChild(duplicateCell)

			copyTemplatePart(part.table.children[1], duplicateCell, i, templateSettings, tableSettings)

			duplicateCell.primaryAxisAlignItems = settings.table.alignment[0]

			// We want to always force the cells to stretch to height of row regardless of users settings
			duplicateCell.layoutAlign = 'STRETCH'

			// The property below would need to be applied to if I wanted to force this. Normally inherited from cell
			duplicateCell.primaryAxisSizingMode = 'FIXED'
		}

		// Create rest of rows
		for (var i = 1; i < tableSettings.table.matrix[0][1]; i++) {
			var duplicateRow

			if (firstRow.type === 'COMPONENT') {
				duplicateRow = firstRow.createInstance()
				// BUG: isn't copying across layoutAlign, so we have to do it manually
				duplicateRow.layoutAlign = firstRow.layoutAlign
			} else {
				duplicateRow = firstRow.clone()
			}

			if (tableSettings.table.size[0][1] && tableSettings.table.size[0][1] !== 'HUG') {
				duplicateRow.layoutGrow = 1
			}

			// If using columnResizing and header swap non headers to default cells
			if (settings.table.options.resizing && type !== 'COMPONENT' && settings.table.options.header) {
				for (let i = 0; i < duplicateRow.children.length; i++) {
					var cell = duplicateRow.children[i]
					// cell.swapComponent(part.th)
					// FIXME: Check if instance or main component

					cell.mainComponent = part.td.mainComponent
					setPluginData(cell, 'elementSemantics', { is: 'td' })

					// Set component properties on instances
					// cell.setProperties(extractValues(part.td.componentProperties))

					copyTemplatePart(part.table.children[1], cell, i, templateSettings)

					// Needs to be applied here too
					cell.primaryAxisSizingMode = 'FIXED'
					cell.primaryAxisAlignItems = settings.table.alignment[0]
				}
			}

			rowParent.insertChild(rowIndex + 1, duplicateRow)
		}

		// Swap first row to use header cell
		if (settings.table.options.header && part.th) {
			for (var i = 0; i < firstRow.children.length; i++) {
				var child = firstRow.children[i]
				// FIXME: Check if instance or main component

				child.swapComponent(part.th.mainComponent)
				setPluginData(child, 'elementSemantics', { is: 'th' })

				// // Set component properties on instances
				// if (part.th.componentProperties) {
				// 	child.setProperties(extractValues(part.th.componentProperties))
				// }

				// Need first row which is the header
				copyTemplatePart(part.table.children[0], child, i, templateSettings)

				// child.mainComponent = part.th.mainComponent
			}
		}

		tableInstance.setRelaunchData(defaultRelaunchData)

		// Set width of table

		if (tableSettings.table.size[0][0] && !(typeof tableSettings.table.size[0][0] === 'string')) {
			tableInstance.resize(convertToNumber(tableSettings.table.size[0][0]), tableInstance.height)
		}
		if (tableSettings.table.size[0][1] && !(typeof tableSettings.table.size[0][1] === 'string')) {
			tableInstance.resize(tableInstance.width, convertToNumber(tableSettings.table.size[0][1]))
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

export function getLocalTemplatesWithoutUpdating() {
	figma.skipInvisibleInstanceChildren = true
	var templates = []
	var components = figma.root.findAllWithCriteria({
		types: ['COMPONENT'],
	})
	for (let i = 0; i < components.length; i++) {
		let node = components[i]
		var templateData = getPluginData(node, 'template')
		if (templateData && node.type === 'COMPONENT') {
			templateData.id = node.id
			templateData.name = node.name
			templateData.name = node.name
			templateData.component.id = node.id
			// KEY needs updating if template duplicated
			templateData.component.key = node.key
			// Update file id incase component moved to another file. Is this needed? Maybe when passed around as an instance
			// We need to generate the fileId here because it's needed for the UI to check if template is local or not and we can't rely on the recentFiles to do it, because it's too late at that point.
			let fileId = getDocumentData('fileId') || genUID()
			templateData.file.id = fileId
			templates.push(templateData)
		}
	}

	return templates
}

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
			// Update file id incase component moved to another file. Is this needed? Maybe when passed around as an instance
			// We need to generate the fileId here because it's needed for the UI to check if template is local or not and we can't rely on the recentFiles to do it, because it's too late at that point.
			let fileId = getDocumentData('fileId') || genUID()
			templateData.file.id = fileId

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

export function getDefaultTemplate() {
	var usingRemoteTemplate = getDocumentData('usingRemoteTemplate')
	var defaultTemplate = getDocumentData('defaultTemplate')

	// FIXME: Should I be doing more, like checking if the component has been published at this point?
	if (usingRemoteTemplate) {
		return defaultTemplate
	} else {
		return getComponentById(defaultTemplate?.component?.id) ? defaultTemplate : undefined
	}
}

export async function determineDefaultTemplate() {
	let { table } = await getClientStorageAsync('userPreferences')
	let defaultTemplate = table.template
	let localTemplates = getLocalTemplatesWithoutUpdating()
	let remoteFiles = getDocumentData('remoteFiles')

	let fileId = getDocumentData('fileId')

	if (defaultTemplate && !isEmpty(defaultTemplate)) {
		if (defaultTemplate.file.id === fileId) {
			let templateComponent = getComponentById(defaultTemplate.id)
			if (!templateComponent) {
				if (localTemplates.length > 0) {
					defaultTemplate = localTemplates[0]
				} else if (remoteFiles.length > 0) {
					defaultTemplate = remoteFiles[0].data[0]
				}
			}
		} else {
			let templateComponent = await lookForComponent(defaultTemplate)
			if (!templateComponent) {
				if (remoteFiles.length > 0) {
					defaultTemplate = remoteFiles[0].data[0]
				} else if (localTemplates.length > 0) {
					defaultTemplate = localTemplates[0]
				}
			}
		}
	} else {
		// In the event defaultTemplate not set, but there are templates

		if (localTemplates.length > 0) {
			defaultTemplate = localTemplates[0]
		} else if (remoteFiles.length > 0) {
			defaultTemplate = remoteFiles[0].data[0]
		}
	}

	return defaultTemplate
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
				copyPasteStyle(templateComponent, table, { exclude: ['name', 'layoutMode'] })

				table.findAll((node) => {
					if ((getPluginData(node, 'elementSemantics')?.is === 'tr') === true && node.type !== 'INSTANCE') {
						copyPasteStyle(rowTemplate, node, { exclude: ['name', 'layoutMode'] })
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

	let table = {
		matrix: [[0, 0]],
		size: [[0, 0]],
		cell: [[0, 0]],
		alignment: [],
		options: {
			resizing: true,
			header: true,
			axis: 'COLUMNS',
		},
	}

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
		usingColumnsOrRows = 'ROWS'
	}

	if (firstRow.parent.layoutMode === 'HORIZONTAL') {
		usingColumnsOrRows = 'COLUMNS'
	}

	for (let i = 0; i < firstRow.children.length; i++) {
		var node = firstRow.children[i]
		var cellType = getPluginData(node, 'elementSemantics')?.is
		if (cellType === 'td' || cellType === 'th') {
			columnCount++
		}
	}

	table.matrix = [[columnCount, rowCount]]
	table.alignment = [firstCell.primaryAxisAlignItems, firstCell.counterAxisAlignItems]
	table.size = [
		[
			(() => {
				if (tableNode.counterAxisSizingMode === 'AUTO') {
					return 'HUG'
				} else {
					return tableNode.width
				}
			})(),
			(() => {
				if (tableNode.primaryAxisSizingMode === 'AUTO') {
					return 'HUG'
				} else {
					return tableNode.height
				}
			})(),
		],
	]
	table.options.axis = usingColumnsOrRows
	table.options.header = getPluginData(firstCell, 'elementSemantics')?.is === 'th' ? true : false

	return { table }
}
