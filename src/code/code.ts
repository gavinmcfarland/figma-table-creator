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
	removeChildren,
	setClientStorageAsync,
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
	swapAxises,
	clone,
	genRandomId,
	copyPasteStyle,
} from './helpers'
import { createDefaultComponents } from './defaultTemplate'
import { upgradeOldComponentsToTemplate } from './upgradeFrom6to7'
import { defaultRelaunchData, createTable, updatePluginVersion } from './globals'

console.clear()

// setClientStorageAsync('userPreferences', undefined).then(() => {
// 	figma.closePlugin('User preferences reset')
// })

// figma.clientStorage.deleteAsync('pluginVersion')

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
// function getLocalTemplateComponents() {
// 	return figma.root.findAll((node) => getPluginData(node, 'template') && node.type === 'COMPONENT')
// }
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
		let parts = templateNode.findOne((node) => {
			let elementSemantics = getPluginData(node, 'elementSemantics')

			if (elementSemantics?.is === elementName) {
				console.log(elementSemantics)
				return true
			}
		})

		results[elementName] = parts
	}

	if (!results['table']) {
		if (getPluginData(templateNode, 'elementSemantics').is === 'table') {
			results['table'] = templateNode
		}
	}

	// // For instances assign the mainComponent as the parts
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
async function syncRecentFilesAsync(data) {
	// NOTE: Should function add file, when there is no data?
	// const publishedComponents = await getPublishedComponents(data)

	updateClientStorageAsync('recentFiles', (recentFiles) => {
		recentFiles = recentFiles || []
		const newFile = new File(data)

		// We have to check if the array is empty because we can't filter an empty array
		if (recentFiles.length === 0) {
			recentFiles.push(newFile)
		} else {
			recentFiles.filter((item) => {
				if (item.id === newFile.id) {
					item.data = data
				} else {
					recentFiles.push(newFile)
				}
			})
		}

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
async function getRecentFilesAsync() {
	return await getClientStorageAsync('recentFiles')
}

function selectTableCells(direction) {
	// Needs a way to exclude things which aren't rows/columns, or a way to include only rows/columns
	var regex = RegExp(/\[ignore\]/, 'g')
	var selection = figma.currentPage.selection

	var newSelection = []

	for (let i = 0; i < selection.length; i++) {
		// Table container
		var parent = selection[i].parent?.parent

		// rows or columns
		var children = parent?.children

		var rowIndex = children.findIndex((x) => x.id === selection[i].parent.id)

		var columnIndex = children[rowIndex].children.findIndex((x) => x.id === selection[i].id)

		for (let i = 0; i < children.length; i++) {
			if (direction === 'parallel') {
				if (children[i].children) {
					if (children[i].children[columnIndex] && !regex.test(children[i].children[columnIndex].parent.name)) {
						newSelection.push(clone(children[i].children[columnIndex]))
					}
				}
			}
			if (direction === 'adjacent') {
				var cell = children[rowIndex]

				for (let b = 0; b < cell.children.length; b++) {
					if (cell.children) {
						if (cell.children[b] && !regex.test(cell.children[b].parent.name)) {
							newSelection.push(clone(cell.children[b]))
						}
					}
				}
			}
		}
	}

	figma.currentPage.selection = newSelection
}

// Commands

function detachTable(selection) {
	let newSelection = []
	for (let i = 0; i < selection.length; i++) {
		let table = selection[i]

		if (table.type === 'INSTANCE') {
			table = table.detachInstance()
		}

		table.findAll((node) => {
			if (getPluginData(node, 'elementSemantics')?.is === 'tr') {
				if (node.type === 'INSTANCE') {
					// console.log(node.type, node.id)
					node.detachInstance()
				}
				if (node.type === 'COMPONENT') {
					replace(node, convertToFrame)
				}
			}
		})

		newSelection.push(table)
	}

	figma.currentPage.selection = newSelection
}
function spawnTable() {}
function toggleColumnResizing() {}
function switchColumnsOrRows(selection) {
	let vectorType
	function isRow(node) {
		return getPluginData(node, 'elementSemantics')?.is === 'tr'
	}

	// TODO: Fix localise component to take account of rows or columns

	for (let i = 0; i < selection.length; i++) {
		var table = selection[i]

		let firstRow = table.findOne((node) => getPluginData(node, 'elementSemantics')?.is === 'tr')

		if (table.type === 'INSTANCE' || firstRow.type === 'INSTANCE' || firstRow.type === 'COMPONENT') {
			figma.closePlugin('Table and rows must be detached')
		} else {
			let settings = getTableSettings(table)
			console.log(settings)
			vectorType = settings.usingColumnsOrRows

			// let parts: any = findTemplateParts(table)

			function iterateChildren() {
				var origRowlength = firstRow.parent.children.length

				var rowContainer = firstRow.parent

				var rowContainerObject = nodeToObject(rowContainer)

				// Change the table container
				if (settings.usingColumnsOrRows === 'rows') {
					rowContainer.layoutMode = 'HORIZONTAL'
				}

				if (firstRow.type !== 'COMPONENT') {
					function getIndex(node, c) {
						var container = node.parent
						var score = c
						var i = -1
						var x = -1
						while (i < c) {
							i++
							x++
							var item = container.children[x]
							if (item && !isRow(item)) {
								i--
							}
						}

						return x
					}

					for (let i = 0; i < firstRow.parent.children.length; i++) {
						var row = rowContainer.children[i]

						if (isRow(row)) {
							var rowWidth = row.width
							var rowHeight = row.height

							var cells = row.children

							if (settings.usingColumnsOrRows === 'columns') {
								row.name = row.name.replace('Col', 'Row')
								row.layoutMode = 'HORIZONTAL'
								row.layoutGrow = 0
								row.counterAxisSizingMode = 'AUTO'
							}

							if (i < origRowlength) {
								for (let c = 0; c < settings.columnCount; c++) {
									var cell = cells[c]
									var cellWidth = cell.width
									// var cellLocation = [c + 1, r + 1]
									// var columnIndex = getNodeIndex(row) + c

									var oppositeIndex = getIndex(row, c)

									if (cell) {
										cell.primaryAxisSizingMode = 'AUTO'

										// We do this because the first row isn't always the first in the array and also the c value needs to match the index starting from where the first row starts
										if (row.id === firstRow.id && !row.parent.children[oppositeIndex]) {
											// If it's the first row and column doesn't exist then create a new column

											var clonedColumn = row.clone()
											removeChildren(clonedColumn) // Need to remove children because they are clones
											table.appendChild(clonedColumn)
										}

										if (row.parent.children[oppositeIndex]) {
											if (settings.usingColumnsOrRows === 'rows') {
												row.parent.children[oppositeIndex].appendChild(cell)
												row.parent.children[oppositeIndex].resize(
													rowContainerObject.children[i].children[c].width,
													row.height
												)
												row.parent.children[oppositeIndex].layoutGrow = rowContainerObject.children[i].children[c].layoutGrow
												row.parent.children[oppositeIndex].layoutAlign = 'STRETCH'
											} else {
												row.parent.children[oppositeIndex].appendChild(cell)
												cell.resize(row.width, cell.height)

												// cell.primaryAxisSizingMode = rowContainerObject.children[i].children[c].primaryAxisSizingMode

												if (rowContainerObject.children[i].layoutGrow === 1) {
													cell.layoutGrow = 1
													// cell.layoutAlign =  "STRETCH"
													// cell.primaryAxisSizingMode = "AUTO"
												} else {
													cell.layoutGrow = 0
													// cell.layoutAlign =  "INHERIT"
													// cell.primaryAxisSizingMode = "FIXED"
												}
											}
										}
									}
								}
							}
						} else {
							row.resize(rowContainerObject.children[i].height, rowContainerObject.children[i].width)
						}

						if (settings.usingColumnsOrRows === 'rows' && isRow(row)) {
							row.name = row.name.replace('Row', 'Col')
							row.layoutMode = 'VERTICAL'
						}
					}

					if (settings.usingColumnsOrRows === 'columns') {
						rowContainer.layoutMode = 'VERTICAL'
					}

					swapAxises(rowContainer)
					resize(rowContainer, rowContainerObject.width, rowContainerObject.height)

					// Because changing layout mode swaps sizingModes you need to loop children again
					var rowlength = rowContainer.children.length

					// For some reason can't remove nodes while in loop, so workaround is to add to an array.
					let discardBucket = []

					for (let i = 0; i < rowlength; i++) {
						var row = rowContainer.children[i]

						// This is the original object before rows are converted to columns, so may not always match new converted table
						if (rowContainerObject.children[i]?.layoutAlign) row.layoutAlign = rowContainerObject.children[i].layoutAlign

						if (isRow(row)) {
							if (settings.usingColumnsOrRows === 'columns') {
								row.counterAxisSizingMode = 'AUTO'
								row.layoutAlign = 'STRETCH'

								// We have to apply this after appending the cells because for some reason doing it before means that the width of the cells is incorrect

								var cells = row.children
								var length = settings.usingColumnsOrRows === 'columns' ? firstRow.parent.children.length : firstRow.children.length
								for (let c = 0; c < length; c++) {
									var cell = cells[c]

									if (cell) {
										if (row.parent.children[getNodeIndex(firstRow) + c]) {
											cell.primaryAxisSizingMode = 'FIXED'
											cell.layoutAlign = 'STRETCH'
											console.log(cell.layoutAlign)
										}
									}
								}
							}

							// If row ends up being empty, then assume it's not needed
							if (row.children.length === 0) {
								console.log('remove row')
								discardBucket.push(row)
							}
						}
					}

					for (let i = 0; i < discardBucket.length; i++) {
						discardBucket[i].remove()
					}
				}
			}

			iterateChildren()
		}
	}

	return {
		vectorType: vectorType,
	}
}
function selectTableVector(type) {
	if (figma.currentPage.selection.length > 0) {
		if (figma.currentPage.selection[0].parent?.parent.layoutMode === (type === 'column' ? 'VERTICAL' : 'HORIZONTAL')) {
			selectTableCells('parallel')
		}
		if (figma.currentPage.selection[0].parent?.parent.layoutMode === (type === 'column' ? 'HORIZONTAL' : 'VERTICAL')) {
			selectTableCells('adjacent')
		}
	} else {
		figma.notify('One or more table cells must be selected')
	}
}

async function main() {
	// Set default preferences
	await updateClientStorageAsync('userPreferences', (data) => {
		data = data || {
			columnCount: 4,
			rowCount: 4,
			cellWidth: 100,
			remember: true,
			includeHeader: true,
			columnResizing: true,
			cellAlignment: 'MIN',
		}

		return data
	})

	// Sync recent files when plugin is run (checks if current file is new, and if not updates data)
	await syncRecentFilesAsync(getLocalTemplates())

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

			setDefaultTemplate(templateComponent)

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

		function setDefaultTemplate(templateComponent) {
			let templateData = new Template(templateComponent)

			setPluginData(templateComponent, 'template', templateData)
			setDocumentData('defaultTemplate', templateData)
			templateComponent.setRelaunchData(defaultRelaunchData)
			figma.ui.postMessage({ type: 'post-default-component', defaultTemplate: templateData, localTemplates: getLocalTemplates() })
			console.log('setDeafultTemplate', templateData)
		}

		async function updateTables(template) {
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

					table.findAll((node) => {
						if ((getPluginData(node, 'elementSemantics')?.is === 'tr') === true && node.type !== 'INSTANCE') {
							copyPasteStyle(rowTemplate, node, { exclude: ['name'] })
						}
					})
				}
			}
		}

		plugin.command('createTable', async ({ ui }) => {
			// Show create table UI
			let pluginVersion = await getClientStorageAsync('pluginVersion')
			let userPreferences = await getClientStorageAsync('userPreferences')
			let usingRemoteTemplate = await getClientStorageAsync('usingRemoteTemplate')
			let pluginUsingOldComponents = getComponentById(figma.root.getPluginData('cellComponentID')) ? true : false

			const remoteFiles = getDocumentData('remoteFiles')
			const fileId = getDocumentData('fileId')
			const defaultTemplate = getDefaultTemplate()
			const localTemplates = getLocalTemplates()

			figma.showUI(__uiFiles__.main, {
				width: 268,
				height: 504,
				themeColors: true,
			})
			figma.ui.postMessage({
				type: 'show-create-table-ui',
				...userPreferences,
				remoteFiles,
				recentFiles: await getRecentFilesAsync(),
				localTemplates,
				defaultTemplate,
				fileId,
				usingRemoteTemplate,
				pluginVersion,
				pluginUsingOldComponents,
			})

			// We update plugin version after UI opened for the first time so user can see the whats new message
			updatePluginVersion('7.0.0')
		})
		plugin.command('detachTable', () => {
			detachTable(figma.currentPage.selection)
			figma.closePlugin()
		})
		plugin.command('spawnTable', spawnTable)
		plugin.command('toggleColumnResizing', toggleColumnResizing)

		plugin.command('switchColumnsOrRows', () => {
			let { vectorType } = switchColumnsOrRows(figma.currentPage.selection)
			figma.closePlugin(`Switched to ${vectorType === 'rows' ? 'columns' : 'rows'}`)
		})
		plugin.command('selectColumn', () => {
			selectTableVector('column')
			figma.closePlugin()
		})
		plugin.command('selectRow', () => {
			selectTableVector('row')
			figma.closePlugin()
		})

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

			let tableInstance = createTable(templateComponent, msg.data)
			positionInCenterOfViewport(tableInstance)
			figma.currentPage.selection = [tableInstance]

			updateClientStorageAsync('userPreferences', (data) => Object.assign(data, msg.data)).then(() => {
				figma.closePlugin('Table created')
			})
		})

		plugin.on('update-tables', (msg) => {
			updateTables(msg.template).then(() => {
				figma.notify('Tables updated', { timeout: 1500 })
			})
		})

		plugin.on('save-user-preferences', () => {})
		plugin.on('fetch-template-part', () => {})
		plugin.on('fetch-current-selection', () => {})
		plugin.on('upgrade-to-template', () => {
			upgradeOldComponentsToTemplate()
			// TODO: Don't close, instead change UI to create table UI
			figma.closePlugin('Template created')
		})
	})
}

main()
