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
	getNodeLocation,
	replace,
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
	sleep,
	daysToMilliseconds,
} from './helpers'

export let defaultRelaunchData = {
	detachTable: 'Detaches table and rows',
	toggleColumnResizing: 'Apply or remove component to first row or column',
	switchColumnsOrRows: 'Switch between using columns or rows',
	updateTables: 'Refresh tables already created',
}

export let selectTableCellsRelaunchData = {
	selectColumn: 'Select all cells in column',
	selectRow: 'Select all cells in row',
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
	if (node.type === 'COMPONENT' && getPluginData(node, 'template')) {
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
		let [key, value] = obj
		let thing
		// if (value.type !== 'VARIANT') {
		thing = { [key]: value.value }
		// }
		return { ...acc, ...thing }
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

	if (tableSettings) {
		if (templateCell) {
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

				// If specific table width specified
				if (tableSettings.size[0] && tableSettings.size[0] !== 'HUG' && tableSettings.cell[0] !== '$') {
					node.layoutGrow = 1
					node.counterAxisSizingMode = 'AUTO'
				}
			}

			// // Set component properties on instances
			// if (templateCell.componentProperties) {
			// 	node.setProperties(extractValues(templateCell.componentProperties))
			// }

			// Swap main component
			if (templateCell.mainComponent) {
				node.swapComponent(templateCell.mainComponent)
			}

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
	}
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

		// Create a copy and convert the table container to a frame
		tableInstance = convertToFrame(templateComponent.clone())

		var table
		var tableIsContainer = part.table.id === templateComponent.id

		// If the table is the container
		if (tableIsContainer) {
			if (type === 'COMPONENT') {
				table = convertToComponent(tableInstance)
				tableInstance = table
			} else {
				table = tableInstance
			}
		} else {
			table = part.table.clone()

			// Because table could be inside several children we need to find its location in the template, then loop through the table instance and replace it
			let nodeLocation = getNodeLocation(part.table, part.container)
			nodeLocation.shift()

			let nodeToReplace = tableInstance
			for (let i = 0; i < nodeLocation.length; i++) {
				let l = nodeLocation[i]

				if (nodeToReplace.children) {
					nodeToReplace = nodeToReplace.children[l]
				}
			}

			// // If not, remove the table from the container
			// tableInstance.findAll((node) => {
			// 	if (getPluginData(node, 'elementSemantics')?.is === 'table') {
			// 		node.remove()
			// 	}
			// })

			replace(nodeToReplace, table)
		}

		if (table.type === 'INSTANCE') {
			// table = table.detachInstance()
		}

		table.layoutMode = 'VERTICAL'

		var firstRow
		function getRowParent() {
			var row = table.findOne((node) => getPluginData(node, 'elementSemantics')?.is === 'tr')

			return row.parent
		}

		var rowParent = getRowParent()

		// Remove all children of table
		removeChildren(table)

		// // Remove children which are trs
		// table.findAll((node) => {
		// 	if (getPluginData(node, 'elementSemantics')?.is === 'tr') {
		// 		node.remove()
		// 	}
		// })

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

		rowParent.appendChild(firstRow)

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
			if (settings.resizing && settings.header) {
				for (let i = 0; i < duplicateRow.children.length; i++) {
					var cell = duplicateRow.children[i]
					// cell.swapComponent(part.th)
					// FIXME: Check if instance or main component

					cell.mainComponent = part.td.mainComponent
					setPluginData(cell, 'elementSemantics', { is: 'td' })

					// Set component properties on instances
					// cell.setProperties(extractValues(part.td.componentProperties))
					copyTemplatePart(part.table.children[1], cell, i, templateSettings, tableSettings, r)

					// Needs to be applied here too
					cell.primaryAxisSizingMode = 'FIXED'

					cell.primaryAxisAlignItems = settings.alignment[0]
				}
			}
			rowParent.appendChild(duplicateRow)
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
				copyTemplatePart(part.table.children[0], child, i, templateSettings, tableSettings, 0)

				// child.mainComponent = part.th.mainComponent
				child.primaryAxisAlignItems = settings.alignment[0]
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

		if (tableSettings.size[0] === '$') {
			tableInstance.resize(convertToNumber(templateSettings.size[0]), tableInstance.height)
		}

		if (tableSettings.size[1] === '$') {
			tableInstance.resize(tableInstance.width, convertToNumber(templateSettings.size[1]))
		}

		if (tableSettings.size[0] === 'HUG') {
			tableInstance.counterAxisSizingMode = 'AUTO'
		}

		if (tableSettings.size[1] === 'HUG') {
			tableInstance.primaryAxisSizingMode = 'AUTO'
		}

		if (!tableIsContainer) {
			if (tableSettings.size[0] === 'HUG') {
				// table.layoutAlign = 'INHERIT'
				table.counterAxisSizingMode = 'AUTO'
			} else {
				table.layoutAlign = 'STRETCH'
				table.primaryAxisSizingMode = 'FIXED'
			}

			if (tableSettings.size[1] === 'HUG') {
				table.layoutGrow = 0
				table.primaryAxisSizingMode = 'AUTO'
			} else {
				table.layoutGrow = 1
				table.counterAxisSizingMode = 'FIXED'
			}
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
	created: string

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
		this.created = new Date().toISOString()
	}
}

export function updateTemplateData(node, data) {
	data.id = node.id
	data.name = node.name
	data.component.id = node.id
	// KEY needs updating if template duplicated
	data.component.key = node.key
	// Update file id incase component moved to another file. Is this needed? Maybe when passed around as an instance
	// We need to generate the fileId here because it's needed for the UI to check if template is local or not and we can't rely on the recentFiles to do it, because it's too late at that point.
	let fileId = getDocumentData('fileId') || genUID()
	data.file.id = fileId

	return data
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
			updateTemplateData(node, templateData)
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
			// if the component id has changed then save previous data so that it can be references if component is moved
			if (templateData.id !== node.id) {
				setPluginData(node, 'prevTemplate', templateData)

				// If new file, then set new creation date
				templateData.created = new Date().toISOString()
			}

			templateData = updateTemplateData(node, templateData)
			setPluginData(node, 'template', templateData)
			templates.push(templateData)

			// Remove any template data and relaunch data that exists on nodes inside this template
			node.findAll((node) => {
				if (getPluginData(node, 'template')) {
					node.setPluginData('template', '')
					node.setRelaunchData({})
					return true
				}
			})

			// Check age of template and if over 35 days then remove prevTemplate data

			let componentTimestamp = new Date(templateData.created).valueOf()
			let currentTimestamp = new Date().valueOf()
			if (componentTimestamp < currentTimestamp - daysToMilliseconds(35)) {
				setPluginData(node, 'prevTemplate', '')
			}
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

	if (templateData) {
		await updateClientStorageAsync('recentTables', (recentTables: TableSettings[]) => {
			recentTables = recentTables || []
			recentTables = upsert(
				recentTables,
				(item) => item.template?.component.key === templateData.component.key && item.file.id === currentFileId,
				{
					template: templateData,
					file: { id: currentFileId },
				}
			)
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
}

export async function getDefaultTemplate(): Promise<Template> {
	// let { table } = await getClientStorageAsync('userPreferences')
	let recentTables = (await getClientStorageAsync('recentTables')) || []

	let defaultTemplates = recentTables
	let fileId = getDocumentData('fileId')

	let defaultTemplate

	if (defaultTemplates?.length > 0) {
		let lastTemplateUsedWithFile = defaultTemplates.find((item) => item.file.id === fileId)
		if (lastTemplateUsedWithFile) {
			defaultTemplate = lastTemplateUsedWithFile.template
		}
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
			} else {
				defaultTemplate = updateTemplateData(templateComponent, defaultTemplate)
			}
		} else {
			let templateComponent = await lookForComponent(defaultTemplate)
			if (!templateComponent) {
				// Component is remote and can't be found
				if (remoteFiles?.length > 0) {
					defaultTemplate = remoteFiles[0].data[0]
				} else if (localTemplates?.length > 0) {
					defaultTemplate = localTemplates[0]
				} else {
					defaultTemplate = null
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
	// let prevTemplate = getPluginData(templateComponent, 'prevTemplate')
	let templateParts = getTemplateParts(templateComponent)
	let tablesUpdated
	let tablesRelinked

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

		var allTableInstances = []

		var tableInstances = page.findAll((node) => getPluginData(node, 'template')?.component.id === template.component.id && node.type === 'FRAME')

		if (tableInstances?.length > 0) {
			tablesUpdated = true
		}

		allTableInstances = tableInstances

		// if (prevTemplate) {
		// 	var oldTableInstances = page.findAll(
		// 		(node) => getPluginData(node, 'template')?.component.id === prevTemplate.component.id && node.type === 'FRAME'
		// 	)
		// 	if (oldTableInstances?.length > 0) {
		// 		tablesRelinked = true
		// 	}
		// 	allTableInstances = [...tableInstances, ...oldTableInstances]
		// }

		if (templateComponent && allTableInstances) {
			var rowTemplate = templateComponent.findOne((node) => getPluginData(node, 'elementSemantics')?.is === 'tr')

			for (let b = 0; b < allTableInstances.length; b++) {
				let tableInstance = allTableInstances[b]
				let tableParts = getTemplateParts(tableInstance)

				// Update template incase it has changed
				setPluginData(tableInstance, 'template', template)

				let container = tableParts.container
				var table = tableParts.table

				// Don't apply if an instance
				if (table.type !== 'INSTANCE') {
					if (templateParts.table) {
						copyPasteStyle(templateParts.table, table, { exclude: ['name', 'layoutMode'] })
					}

					if (templateParts.container) {
						copyPasteStyle(templateParts.container, container, { exclude: ['name', 'layoutMode'] })
					}

					table.findAll((node) => {
						if ((getPluginData(node, 'elementSemantics')?.is === 'tr') === true && node.type !== 'INSTANCE') {
							copyPasteStyle(rowTemplate, node, { exclude: ['name', 'layoutMode'] })
						}
					})
				}
			}
		}
	}

	return {
		tablesUpdated,
		tablesRelinked,
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

	let templateParts = getTemplateParts(tableNode)

	let tablePart = templateParts.table

	for (let i = 0; i < tablePart.children.length; i++) {
		var node = tablePart.children[i]
		if (getPluginData(node, 'elementSemantics')?.is === 'tr') {
			rowCount++
		}
	}

	let firstRow = tablePart.findOne((node) => getPluginData(node, 'elementSemantics')?.is === 'tr')

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

	// This option avoids relying on counting nodes inside row which have semantic data because difficult to guarentee that all elements will be marked

	// columnCount = firstRow.children.length - 1

	table.matrix = [columnCount, rowCount]
	table.alignment = [firstCell.primaryAxisAlignItems, firstCell.counterAxisAlignItems]
	table.size = [
		(() => {
			if (tablePart.counterAxisSizingMode === 'AUTO') {
				return 'HUG'
			} else {
				return tablePart.width
			}
		})(),
		(() => {
			if (tablePart.primaryAxisSizingMode === 'AUTO') {
				return 'HUG'
			} else {
				return tablePart.height
			}
		})(),
	]
	table.axis = usingColumnsOrRows
	table.header = getPluginData(firstCell, 'elementSemantics')?.is === 'th' ? true : false
	table.resizing = firstRow.type === 'COMPONENT' ? true : false

	return { ...table }
}
