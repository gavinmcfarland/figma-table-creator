import { getRemoteFilesAsync, getRecentFilesAsync } from '@fignite/helpers'
import _ from 'underscore'
import {
	convertToFrame,
	convertToComponent,
	getPluginData,
	getNodeIndex,
	setPluginData,
	getClientStorageAsync,
	getDocumentData,
	setDocumentData,
	genUID,
	updateClientStorageAsync,
} from '@fignite/helpers'
import {
	removeChildren,
	getTemplateParts,
	genRandomId,
	lookForComponent,
	copyPasteStyle,
	getComponentByIdAndKey,
	isEmpty,
	upsert,
	convertToNumber,
} from './helpers'

export let defaultRelaunchData = {
	detachTable: 'Detaches table and rows',
	toggleColumnResizing: 'Apply or remove component to first row or column',
	switchColumnsOrRows: 'Switch between using columns or rows',
	updateTables: 'Refresh tables already created',
}

export async function applyTableSettings(target, source) {
	if (source.template) {
		await setDefaultTemplate(source.template)
		target.template = source.template
	}

	if (source.matrix) {
		target.matrix = upsert(target.matrix, (item) => _.isEqual(item, source.matrix), source.matrix)
		target.matrix = target.matrix.slice(0, 4)
	}

	if (source.size) {
		target.size = upsert(target.size, (item) => _.isEqual(item, source.size), source.size)
		target.size = target.size.slice(0, 4)
	}

	if (source.cell) {
		target.cell = upsert(target.cell, (item) => _.isEqual(item, source.cell), source.cell)
		target.cell = target.cell.slice(0, 4)
	}

	if (source.alignment) {
		target.alignment = source.alignment
	}

	target.resizing = source.resizing

	if (source.header === false || source.header === true) {
		target.header = source.header
	}

	return target
}

export function isTemplateNode(node) {
	if (node.type === 'COMPONENT' && getPluginData('template')) {
		return node
	}
}

export function isTableNode(node) {
	if (node.type === 'FRAME' || (node.type === 'INSTANCE' && getPluginData('template'))) {
		return node
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
		let [key, value]: any = obj
		let newObj
		// if (value.type !== 'VARIANT') {
		newObj = { [key]: value.value }
		// }
		return { ...acc, ...newObj }
	}, {})
}

async function copyTemplatePart(partParent, node, index, templateSettings: TableSettings, tableSettings?: TableSettings, rowIndex?) {
	// TODO: Copy across overrides like text, and instance swaps

	// Beacuse template will not be as big as table we need to cap the index to the size of the template, therefore copying the last cell
	if (templateSettings.matrix[0] !== '$') {
		if (index > templateSettings.matrix[0] - 1) {
			index = templateSettings.matrix[0] - 1
		}
	}

	let templateCell = partParent.children[index]

	// Copy across width
	if (tableSettings) {
		let cellWidth
		if (tableSettings.cell[0] === '$') {
			cellWidth = templateCell.width
		} else {
			cellWidth = tableSettings.cell[0]
		}

		if (cellWidth && cellWidth !== 'FILL' && cellWidth !== 'HUG') {
			node.resizeWithoutConstraints(cellWidth, node.height)
		}

		// If templateCell === FILL
		if (templateCell.layoutGrow === 1 && tableSettings.cell[0] === '$') {
			node.layoutGrow = 1
		}

		// If templateCell === HUG
		if (templateCell.layoutGrow === 0 && templateCell.counterAxisSizingMode === 'AUTO' && tableSettings.cell[0] === '$') {
			node.layoutGrow = 0
			node.counterAxisSizingMode = 'AUTO'
		}

		// Change size of cells
		if (tableSettings.size[0] && tableSettings.size[0] !== 'HUG' && tableSettings.cell[0] !== '$') {
			node.layoutGrow = 1
		}
	}

	// // Set component properties on instances
	// if (templateCell.componentProperties) {
	// 	node.setProperties(extractValues(templateCell.componentProperties))
	// }

	// // Add table numbering
	// if (rowIndex || rowIndex === 0) {
	// 	let templateText = templateCell.findOne((node) => node.name === 'Text')

	// 	if (templateText) {
	// 		let number = convertToNumber(templateText.characters)

	// 		if (Number(number)) {
	// 			let tableText = node.findOne((node) => node.name === 'Text')
	// 			await figma.loadFontAsync(templateText.fontName)
	// 			if (tableText) {
	// 				tableText.characters = (number + rowIndex).toString()
	// 			}
	// 		}
	// 	}
	// }
}

export async function createTable(templateComponent, settings: TableSettings, type?) {
	// FIXME: Get it to work with parts which are not components as well
	// FIXME: Check for imported components
	// FIXME: Check all conditions are met. Is table, is row, is cell, is instance etc.

	let part = getTemplateParts(templateComponent)
	let tableInstance

	// Santitize data
	settings.matrix[0] = convertToNumber(settings.matrix[0])
	settings.matrix[1] = convertToNumber(settings.matrix[1])
	settings.size[0] = convertToNumber(settings.size[0])
	settings.size[1] = convertToNumber(settings.size[1])
	settings.cell[0] = convertToNumber(settings.cell[0])
	settings.cell[1] = convertToNumber(settings.cell[1])

	// Could be better. Need a way to avoid mutating original object (settings)
	let tableSettings: TableSettings = {
		matrix: [settings.matrix[0], settings.matrix[1]],
		size: [settings.size[0], settings.size[1]],
		cell: [settings.cell[0], settings.cell[1]],
	}

	if (!part.table || !part.tr || !part.td || (!part.th && settings.header)) {
		let array = []
		part.table ? null : array.push('table')
		part.tr ? null : array.push('row')
		!part.th && settings.header ? array.push('header') : null
		part.td ? null : array.push('cell')

		if (array.length > 1) {
			figma.notify(`Template parts "${array.join(', ')}" not configured`)
		} else {
			figma.notify(`Template part "${array.join(', ')}" not configured`)
		}
		tableInstance = false
	} else {
		let templateSettings: TableSettings = getTableSettings(part.table)

		// Get settings from template
		if (settings.matrix[0] === '$') {
			tableSettings.matrix[0] = templateSettings.matrix[0]
		}

		if (settings.matrix[1] === '$') {
			tableSettings.matrix[1] = templateSettings.matrix[1]
		}

		if (settings.size[0] === '$') {
			tableSettings.size[0] = templateSettings.size[0]
		}

		if (settings.size[1] === '$') {
			tableSettings.size[1] = templateSettings.size[1]
		}

		// Can't set this here because needs to happen inside template
		// if (settings.table.cell[0][0] === '$') {
		// 	tableSettings.table.cell[0][0] = templateSettings.table.size[0][0]
		// }

		if (settings.cell[1] === '$') {
			tableSettings.cell[1] = templateSettings.cell[0][1]
		}

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

		if (settings.resizing && type !== 'COMPONENT') {
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
		if (tableSettings.size[1] && tableSettings.size[1] !== 'HUG') {
			firstRow.layoutGrow = 1
		}

		// If Height of cell defined then resize row height
		let cellHeight
		if (tableSettings.cell[1] === '$') {
			cellHeight = templateCell.height
		} else {
			cellHeight = tableSettings.cell[1]
		}

		if (cellHeight && cellHeight !== 'FILL' && cellHeight !== 'HUG') {
			firstRow.resizeWithoutConstraints(firstRow.width, cellHeight)
			firstRow.layoutGrow = 0
			firstRow.counterAxisSizingMode = 'FIXED'
		}

		// MANDATORY PROP as can't guarentee user will or figma will honour this
		firstRow.layoutAlign = 'STRETCH'

		// Create columns in first row

		for (let i = 0; i < tableSettings.matrix[0]; i++) {
			var duplicateCell
			if (part.td.type === 'COMPONENT') {
				duplicateCell = part.td.clone()
			}
			if (part.td.type === 'INSTANCE') {
				duplicateCell = part.td.mainComponent.createInstance()
			}

			setPluginData(duplicateCell, 'elementSemantics', { is: 'td' })

			firstRow.appendChild(duplicateCell)

			copyTemplatePart(part.table.children[1], duplicateCell, i, templateSettings, tableSettings)

			duplicateCell.primaryAxisAlignItems = settings.alignment[0]

			// We want to always force the cells to stretch to height of row regardless of users settings
			duplicateCell.layoutAlign = 'STRETCH'

			// The property below would need to be applied to if I wanted to force this. Normally inherited from cell
			duplicateCell.primaryAxisSizingMode = 'FIXED'
		}

		// Create rest of rows
		for (var r = tableSettings.matrix[1] - 2; r >= 0; r--) {
			var duplicateRow

			if (firstRow.type === 'COMPONENT') {
				duplicateRow = firstRow.createInstance()
				// BUG: isn't copying across layoutAlign, so we have to do it manually
				duplicateRow.layoutAlign = firstRow.layoutAlign
			} else {
				duplicateRow = firstRow.clone()
			}

			if (tableSettings.size[1] && tableSettings.size[1] !== 'HUG') {
				duplicateRow.layoutGrow = 1
			}

			// If using columnResizing and header swap non headers to default cells
			if (settings.resizing && type !== 'COMPONENT' && settings.header) {
				for (let i = 0; i < duplicateRow.children.length; i++) {
					var cell = duplicateRow.children[i]
					// cell.swapComponent(part.th)
					// FIXME: Check if instance or main component

					cell.mainComponent = part.td.mainComponent
					setPluginData(cell, 'elementSemantics', { is: 'td' })

					// Set component properties on instances
					// cell.setProperties(extractValues(part.td.componentProperties))

					copyTemplatePart(part.table.children[1], cell, i, templateSettings, null, r)

					// Needs to be applied here too
					cell.primaryAxisSizingMode = 'FIXED'
					cell.primaryAxisAlignItems = settings.alignment[0]
				}
			}

			rowParent.insertChild(rowIndex + 1, duplicateRow)
		}

		// Swap first row to use header cell
		if (settings.header && part.th) {
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
				copyTemplatePart(part.table.children[0], child, i, templateSettings, null, 0)

				// child.mainComponent = part.th.mainComponent

				cell.primaryAxisAlignItems = settings.cellAlignment
			}
		}

		tableInstance.setRelaunchData(defaultRelaunchData)

		// Set width of table

		if (tableSettings.size[0] && !(typeof tableSettings.size[0] === 'string')) {
			tableInstance.resize(convertToNumber(tableSettings.size[0]), tableInstance.height)
		}
		if (tableSettings.size[1] && !(typeof tableSettings.size[1] === 'string')) {
			tableInstance.resize(tableInstance.width, convertToNumber(tableSettings.size[1]))
		}

		if (tableSettings.size[0] === 'HUG') {
			tableInstance.counterAxisSizingMode = 'AUTO'
		}

		if (tableSettings.size[1] === 'HUG') {
			tableInstance.primaryAxisSizingMode = 'AUTO'
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

export class File {
	id: string
	name: string
	data?: [] | {}
	constructor(data?) {
		// TODO: if fileId doesn't exist then create random ID and set fileId
		this.id = getDocumentData('fileId') || setDocumentData('fileId', genRandomId())
		// this.name = `{figma.getNodeById("0:1").name}`
		this.name = figma.root.name
		if (data) this.data = data
	}
}

export class Template {
	name: string
	component: {
		id: number
		key: number
	}
	file: File

	constructor(node) {
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
}

export function getLocalTemplatesWithoutUpdating(): Template[] {
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

export function getLocalTemplates(): Template[] {
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

export async function setDefaultTemplate(templateData: Template): Promise<void> {
	await getRemoteFilesAsync()
	await getRecentFilesAsync(getLocalTemplates())

	let currentFileId = getDocumentData('fileId')

	await updateClientStorageAsync('recentTables', (recentTables: TableSettings[]) => {
		recentTables = recentTables || []
		recentTables = upsert(recentTables, (item) => item.template.component.key === templateData.component.key && item.file.id === currentFileId, {
			template: templateData,
			file: { id: currentFileId },
		})
		recentTables = recentTables.slice(0, 10)

		let defaultTemplate = recentTables[0].template

		try {
			figma.ui.postMessage({
				type: 'post-default-template',
				defaultTemplate,
				localTemplates: getLocalTemplates(),
			})
		} catch (e) {
			console.log(e)
		}

		return recentTables
	})
}

export async function getDefaultTemplate(): Promise<Template> {
	// let { table } = await getClientStorageAsync('userPreferences')
	let recentTables = (await getClientStorageAsync('recentTables')) || []

	let defaultTemplates = recentTables
	let fileId = getDocumentData('fileId')

	let defaultTemplate

	if (defaultTemplates.length > 0) {
		let lastTemplateUsedWithFile = defaultTemplates.find((item) => item.file.id === fileId)
		defaultTemplate = lastTemplateUsedWithFile.template
	}

	let localTemplates = getLocalTemplatesWithoutUpdating()
	let remoteFiles = getDocumentData('remoteFiles')

	if (defaultTemplate && !isEmpty(defaultTemplate)) {
		if (defaultTemplate.file.id === fileId) {
			let templateComponent = getComponentByIdAndKey(defaultTemplate.component.id, defaultTemplate.component.key)

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
		if (localTemplates?.length > 0) {
			defaultTemplate = localTemplates[0]
		} else if (remoteFiles?.length > 0) {
			defaultTemplate = remoteFiles[0].data[0]
		}
	}

	return defaultTemplate
}

export async function updateTables(template) {
	var templateComponent = await lookForComponent(template)

	// FIXME: Template file name not up to date for some reason

	let pages = figma.root.children

	figma.notify(`Updating tables on page 1 of ${pages.length}...`)

	await sleep()

	let handler = {}

	for (let p = 0; p < pages.length; p++) {
		let page = pages[p]

		if (handler?.cancel) {
			handler.cancel()
		}

		handler = figma.notify(`Updating tables on page ${p + 1} of ${pages.length}...`, { timeout: 1 })

		await sleep()

		var tables = page.findAll((node) => getPluginData(node, 'template')?.id === template.id && node.type === 'FRAME')

		if (templateComponent && tables) {
			var rowTemplate = templateComponent.findOne((node) => getPluginData(node, 'elementSemantics')?.is === 'tr')

			for (let b = 0; b < tables.length; b++) {
				var table = tables[b]

				// Don't apply if an instance
				if (table.type !== 'INSTANCE') {
					console.log(`Updating table ${b + 1} of ${tables.length} on page ${p + 1}`)

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
}

export function getTableSettings(tableNode): TableSettings {
	let rowCount = 0
	let columnCount = 0
	let usingColumnsOrRows = null

	let table: TableSettings = {
		matrix: [0, 0],
		size: [0, 0],
		cell: ['FILL', 'FILL'],
		alignment: ['MIN', 'MIN'],
		resizing: true,
		header: true,
		axis: 'COLUMNS',
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

	table.matrix = [columnCount, rowCount]
	table.alignment = [firstCell.primaryAxisAlignItems, firstCell.counterAxisAlignItems]
	table.size = [
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
	]
	table.axis = usingColumnsOrRows
	table.header = getPluginData(firstCell, 'elementSemantics')?.is === 'th' ? true : false
	table.resizing = firstRow.type === 'COMPONENT' ? true : false

	return { ...table }
}
