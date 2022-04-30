import plugma from 'plugma'
import {
	replace,
	getOverrides,
	nodeToObject,
	getPageNode,
	resize,
	getPluginData,
	setDocumentData,
	getDocumentData,
	convertToComponent,
	convertToFrame,
	getNodeIndex,
	setPluginData,
	updatePluginData,
	getClientStorageAsync,
	updateClientStorageAsync,
} from '@fignite/helpers'
import {
	getComponentById,
	createPage,
	animateNodeIntoView,
	selectAndZoomIntoView,
	positionInCenterOfViewport,
	unique,
	getPublishedComponents,
	lookForComponent,
	getSelectionName,
	isInsideComponent,
	getParentComponent,
} from './new-helpers'
import { genRandomId } from './helpers'
import { createDefaultComponents } from './defaultTemplate'

console.clear()

let defaultRelaunchData = {
	detachTable: 'Detaches table and rows',
	spawnTable: 'Spawn a new table from this table',
	toggleColumnResizing: 'Use a component to resize columns or rows',
	toggleColumnsOrRows: 'Toggle between using columns or rows',
}

function File(data?) {
	// TODO: if fileId doesn't exist then create random ID and set fileId
	this.id = getDocumentData('fileId') || setDocumentData('fileId', genRandomId())
	// this.name = `{figma.getNodeById("0:1").name}`
	this.name = figma.root.name
	if (data) this.data = data
}
function Template(node) {
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
function addUniqueToArray(object, array) {
	// // Only add new template if unique
	var index = array.findIndex((x) => x.id === object.id)
	index === -1 ? array.push(object) : console.log('object already exists')

	return array
}
function addTemplateToRemoteFiles(node) {
	updatePluginData(figma.root, 'remoteFiles', (remoteFiles) => {
		remoteFiles = remoteFiles || []

		// Only add file to array if unique
		addUniqueToArray(new File(), remoteFiles)

		for (var i = 0; i < remoteFiles.length; i++) {
			var file = remoteFiles[i]

			if (file.id === getPluginData(figma.currentPage.selection[0], 'template').file.id) {
				file.templates = addUniqueToArray(new Template(node), file.templates)
			}
		}

		return remoteFiles
	})

	figma.notify(`Imported ${node.name}`)
}
function removeTemplateFromFile() {}
function incrementNameNumerically(node) {
	// TODO: Update to support any type of node

	var nodeType = node.type

	if (nodeType === 'COMPONENT' && getPluginData(node, 'template')) nodeType === 'TEMPLATE_COMPONENT'

	// Find templates locally
	if (nodeType === 'TEMPLATE_COMPONENT') {
		var localTemplates = figma.root.findAll((node) => getPluginData(node, 'template') && node.type === 'COMPONENT')

		if (localTemplates && localTemplates.length > 0) {
			localTemplates.sort((a, b) => a.name - b.name)

			localTemplates.map((node) => {
				console.log(node.name)
			})

			if (localTemplates[localTemplates.length - 1].name.startsWith('Table')) {
				let matches = localTemplates[localTemplates.length - 1].name.match(/\d+$/)

				console.log(matches)

				if (matches) {
					node.name = `Table ${parseInt(matches[0], 10) + 1}`
				}
			}
		}
	}
}
function fetchTemplateParts() {}
function setTemplateData(node) {
	if (node.type === 'COMPONENT') {
		setPluginData(node, 'template', {
			file: {
				id: getPluginData(figma.root, 'fileId'),
				name: figma.root.name,
			},
			name: node.name,
			id: genRandomId(),
			component: {
				key: node.key,
				id: node.id,
			},
		})
	}
}
function setSemantics(node, element) {
	// Should this be split into markNode and setTemplate?

	setPluginData(node, `elementSemantics`, {
		is: element,
	})

	if (element === 'table') {
		setTemplateData(node)
	}
}
function setDefaultTemplate(template) {}
function geTemplateParts() {}

function importTemplate(node) {
	// TODO: Needs to work more inteligently so that it corretly adds template if actually imported from file. Try to import first, if doesn't work then it must be local. Check to see if component published also.
	// TODO: Check if already imported by checking id in list?

	var templateData = getPluginData(node, 'template')
	var isTemplateNode = templateData
	var isLocal = templateData?.file?.id === getDocumentData('fileId')

	if (isTemplateNode) {
		if (node.type === 'COMPONENT') {
			if (isLocal) {
				figma.notify('Template already imported')
			} else {
				addTemplateToRemoteFiles(node)
				figma.notify('Imported remote template')
			}
		} else {
			node = convertToComponent(node)
			figma.notify('Imported template')
			// (add to local templates)
		}
		setDocumentData('defaultTemplate', getPluginData(node, 'template'))
	} else {
		figma.notify('No template found')
	}
}
function getLocalTemplateComponents() {
	return figma.root.findAll((node) => getPluginData(node, 'template') && node.type === 'COMPONENT')
}
function getLocalTemplates() {
	var templates = []
	figma.root.findAll((node) => {
		var templateData = getPluginData(node, 'template')
		if (templateData && node.type === 'COMPONENT') {
			templates.push(templateData)
		}
	})

	return templates
}
function createTableInstance(templateComponent, settings) {
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
		table = tableInstance
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
function getTableSettings(tableNode) {
	let rowCount = 0
	let columnCount = 0
	let usingColumnsOrRows = 'rows'

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
		columnCount,
		rowCount,
		columnResizing: firstRow.type === 'COMPONENT' ? true : false,
		includeHeader: getPluginData(firstCell, 'elementSemantics')?.is === 'th' ? true : false,
		cellAlignment: 'MIN',
		usingColumnsOrRows,
		cellWidth: firstCell.width,
	}
}

// function getUserPreferencesAsync() {
// 	return getRecentFilesAsync()
// }

function getDefaultTemplate() {
	var defaultTemplate = getDocumentData('defaultTemplate')
	return getComponentById(defaultTemplate?.component.id) ? defaultTemplate : undefined
}

function getTemplateParts(templateNode) {
	// find nodes with certain pluginData
	let elements = ['tr', 'td', 'th', 'table']
	let results = {}

	// Loop though element definitions and find them in the template
	for (let i = 0; i < elements.length; i++) {
		let elementName = elements[i]
		let part = templateNode.findOne((node) => {
			let elementSemantics = getPluginData(node, 'elementSemantics')

			if (elementSemantics?.is === elementName) {
				console.log(elementSemantics)
				return true
			}
		})

		results[elementName] = part
	}

	if (!results['table']) {
		if (getPluginData(templateNode, 'elementSemantics').is === 'table') {
			results['table'] = templateNode
		}
	}

	// // For instances assign the mainComponent as the part
	// for (let [key, value] of Object.entries(results)) {
	// 	if (value.type === "INSTANCE") {
	// 		results[key] = value.mainComponent
	// 	}
	// }

	return results
}

function postCurrentSelection(templateNodeId) {
	let selection

	function isInsideTemplate(node) {
		let parentComponent = node.type === 'COMPONENT' ? node : getParentComponent(node)
		if ((isInsideComponent(node) || node.type === 'COMPONENT') && parentComponent) {
			if (getPluginData(parentComponent, 'template') && parentComponent.id === templateNodeId) {
				return true
			}
		}
	}

	if (figma.currentPage.selection.length === 1 && isInsideTemplate(figma.currentPage.selection[0])) {
		selection = {
			element: getPluginData(figma.currentPage.selection[0], 'elementSemantics')?.is,
			name: getSelectionName(figma.currentPage.selection[0]),
		}

		figma.ui.postMessage({ type: 'current-selection', selection: selection })
	}

	figma.on('selectionchange', () => {
		if (figma.currentPage.selection.length === 1 && isInsideTemplate(figma.currentPage.selection[0])) {
			console.log('selection changed')
			selection = {
				element: getPluginData(figma.currentPage.selection[0], 'elementSemantics')?.is,
				name: getSelectionName(figma.currentPage.selection[0]),
			}

			figma.ui.postMessage({ type: 'current-selection', selection: selection })
		} else {
			figma.ui.postMessage({ type: 'current-selection', selection: undefined })
		}
	})
}

/**
 * Adds new files to recentFiles in localStorage if they don't exist and updates them if they do
 * @param {String} key A key to store data under
 * @param {any} data Data to be stored
 */
async function syncRecentFiles(data) {
	const publishedComponents = await getPublishedComponents(data)

	updateClientStorageAsync('recentFiles', (recentFiles) => {
		recentFiles = recentFiles || []
		const newFile = new File(data)

		recentFiles.filter((item) => {
			if (item.id === newFile.id) {
				recentFiles.push(newFile)
			} else {
				item.data = data
			}
		})

		return recentFiles
	})
	// Needs to know what data set
	// Then will check if any of the set has been published
	// Check if current file matches any in recents list
	// If it doesn't, add to list of recent files
	// If it does and no published things in set then remove from list
	// getLocalTemplates()
	// getPublishedLocalTemplates()
	// if local templates and recent files
	// If file has published templates
	// createNewFile
	// addFileToRecentFiles()
	// Else if not
	// Remove file
}
function getRecentFilesAsync() {}

// Commands

function detachTable() {}
function spawnTable() {}
function toggleColumnResizing() {}
function switchColumnsOrRows() {}
function selectColumns() {}
function selectRows() {}

plugma((plugin) => {
	plugin.ui = {
		html: __uiFiles__.main,
		width: 268,
		height: 504,
	}

	// Received messages
	async function newTemplateComponent(opts?) {
		let { shouldCreatePage } = opts

		if (shouldCreatePage) {
			let newPage = createPage('Table Creator')
		}

		let components = await createDefaultComponents()

		let { templateComponent } = components

		// Set template data on component
		let templateData = new Template(templateComponent)

		setPluginData(templateComponent, 'template', templateData)
		setDocumentData('defaultTemplate', templateData)
		templateComponent.setRelaunchData(defaultRelaunchData)
		figma.ui.postMessage({ type: 'post-default-component', defaultTemplate: templateData, localTemplates: getLocalTemplates() })

		incrementNameNumerically(templateComponent)
		selectAndZoomIntoView(figma.currentPage.children)
	}

	async function editTemplateComponent(msg) {
		lookForComponent(msg.template).then((templateNode) => {
			// figma.viewport.scrollAndZoomIntoView([templateNode])
			animateNodeIntoView([templateNode])
			figma.currentPage.selection = [templateNode]
			let parts = getTemplateParts(templateNode)
			let partsAsObject = {
				table: {
					name: getSelectionName(parts?.table),
					element: 'table',
					id: parts?.table?.id,
				},
				tr: {
					name: getSelectionName(parts?.tr),
					element: 'tr',
					id: parts?.tr?.id,
				},
				td: {
					name: getSelectionName(parts?.td),
					element: 'td',
					id: parts?.td?.id,
				},
				th: {
					name: getSelectionName(parts?.th),
					element: 'th',
					id: parts?.th?.id,
				},
			}

			postCurrentSelection(templateNode.id)

			figma.ui.postMessage({ type: 'template-parts', parts: partsAsObject })
		})
	}

	function setDefaultTemplate(templateData) {
		plugin.post('default-template', () => {
			defaultTemplate: templateData
		})
		figma.notify(`${templateData.name} set as default`)
	}

	async function refreshTables() {
		// FIXME: Template file name not up to date for some reason

		var tables = figma.root.findAll((node) => getPluginData(node, 'template')?.id === template.id)
		// getAllTableInstances()

		var tableTemplate = await lookForComponent(template)

		var rowTemplate = tableTemplate.findOne((node) => getPluginData(node, 'elementSemantics')?.is === 'tr')

		for (let b = 0; b < tables.length; b++) {
			var table = tables[b]

			// Don't apply if an instance
			if (table.type !== 'INSTANCE') {
				console.log('tableTemplate', tableTemplate)
				copyPasteStyle(tableTemplate, table, { exclude: ['name'] })

				// for (let x = 0; x < table.children.length; x++) {
				// 	var row = table.children[x]

				// 	if (getPluginData(row, 'elementSemantics')?.is === "tr" === true && row.type !== "INSTANCE") {
				// 		copyPasteStyle(rowTemplate, row, { exclude: ['name'] })
				// 	}

				// 	// // Only need to loop through cells if has been changed by user
				// 	// if (row.children && getPluginData(row, "isRow") === true) {
				// 	// 	for (let k = 0; k < row.children.length; k++) {
				// 	// 		var cell = row.children[k]
				// 	// 	}
				// 	// }
				// }

				table.findAll((node) => {
					if ((getPluginData(node, 'elementSemantics')?.is === 'tr') === true && node.type !== 'INSTANCE') {
						copyPasteStyle(rowTemplate, node, { exclude: ['name'] })
					}
				})
			}
		}
	}

	async function createTable(msg) {}

	plugin.command('createTable', async ({ ui }) => {
		// Show create table UI
		let pluginAlreadyRun = await getClientStorageAsync('pluginAlreadyRun')
		let userPreferences = await getClientStorageAsync('userPreferences')
		let usingRemoteTemplate = await getClientStorageAsync('usingRemoteTemplate')

		const recentFiles = await getRecentFilesAsync()
		const remoteFiles = getDocumentData('remoteFiles')
		const fileId = getDocumentData('fileId')
		const defaultTemplate = getDefaultTemplate()
		const localTemplates = getLocalTemplates()

		ui.show({
			type: 'show-create-table-ui',
			...userPreferences,
			remoteFiles,
			recentFiles,
			localTemplates,
			defaultTemplate,
			fileId,
			usingRemoteTemplate,
			pluginAlreadyRun,
		})
	})
	plugin.command('detachTable', detachTable)
	plugin.command('spawnTable', spawnTable)
	plugin.command('toggleColumnResizing', toggleColumnResizing)
	plugin.command('switchColumnsOrRows', switchColumnsOrRows)
	plugin.command('selectColumns', selectColumns)
	plugin.command('selectRows', selectRows)

	plugin.command('newTemplate', newTemplateComponent)
	plugin.command('importTemplate', importTemplate)

	plugin.on('new-template', () => {
		newTemplateComponent({ shouldCreatePage: true })
	})
	plugin.on('edit-template', (msg) => {
		editTemplateComponent(msg)
	})
	plugin.on('set-default-template', setDefaultTemplate)
	plugin.on('set-semantics', () => {})

	plugin.on('create-table-instance', async (msg) => {
		const templateComponent = await getComponentById(getDocumentData('defaultTemplate').id)
		const userPreferences = await getClientStorageAsync('userPreferences')

		// createTableInstance(templateComponent, userPreferences)
		// 	.then((tableInstance) => {
		// 		positionInCenterOfViewport(tableInstance)

		// 		updateClientStorageAsync('userPreferences', (data) => Object.assign(data, msg)).then(figma.closePlugin('Table created'))
		// 	})
		// 	.catch()

		let tableInstance = createTableInstance(templateComponent, userPreferences)
		positionInCenterOfViewport(tableInstance)
		figma.currentPage.selection = [tableInstance]
		updateClientStorageAsync('userPreferences', (data) => Object.assign(data, msg)).then(figma.closePlugin('Table created'))
	})
	plugin.on('refresh-tables', refreshTables)

	plugin.on('save-user-preferences', () => {})
	plugin.on('fetch-template-part', () => {})
	plugin.on('fetch-current-selection', () => {})
})
