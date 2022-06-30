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
	getRecentFilesAsync,
	getRemoteFilesAsync,
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
import { createTemplateComponents, createTooltip } from './newDefaultTemplate'
import { createDefaultComponents } from './defaultTemplate'
import { upgradeOldComponentsToTemplate } from './upgradeFrom6to7'
import { defaultRelaunchData, createTable, updatePluginVersion, Template, getLocalTemplates, File, updateTables, setDefaultTemplate } from './globals'

// FIXME: Recent files not adding unique files only

console.clear()

// createTooltip(
// 	'Your table components have been upgraded into a template. A template is single component used by Table Creator to create tables from. You may discard the other components previously used by the plugin.'
// ).then((tooltip) => {
// 	positionInCenterOfViewport(tooltip)
// })

// createTemplateComponents().then((array) => {
// 	let group = figma.group(array, figma.currentPage)
// 	positionInCenterOfViewport(group)
// 	figma.ungroup(group)
// })

// setClientStorageAsync('userPreferences', undefined).then(() => {
// 	figma.closePlugin('User preferences reset')
// })

// figma.clientStorage.deleteAsync('recentFiles')
// figma.clientStorage.deleteAsync('pluginVersion')
// figma.root.setPluginData('remoteFiles', '')
// figma.root.setPluginData('fileId', '')

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

function addElement(element) {
	let node = figma.currentPage.selection[0]
	if (node.type === 'INSTANCE') {
		setPluginData(node.mainComponent, 'elementSemantics', { is: element })
		// TODO: Add relaunch data for selecting row or column if td
	} else {
		setPluginData(node, 'elementSemantics', { is: element })
	}
}

function removeElement(nodeId, element) {
	let node = figma.getNodeById(nodeId)
	let templateContainer = node.type === 'COMPONENT' ? node : getParentComponent(node)

	templateContainer.findAll((node) => {
		if (getPluginData(node, 'elementSemantics')?.is === element) {
			if (node.type === 'INSTANCE') {
				setPluginData(node.mainComponent, 'elementSemantics', '')
			} else {
				setPluginData(node, 'elementSemantics', '')
			}
		}
	})

	// TODO: Remove relaunch data for selecting row or column if td

	if (element === 'table') {
		setPluginData(templateContainer, 'elementSemantics', '')
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
	var usingRemoteTemplate = getDocumentData('usingRemoteTemplate')
	var defaultTemplate = getDocumentData('defaultTemplate')

	// FIXME: Should I be doing more, like checking if the component has been published at this point?
	if (usingRemoteTemplate) {
		return defaultTemplate
	} else {
		return getComponentById(defaultTemplate?.component.id) ? defaultTemplate : undefined
	}
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

// /**
//  * Adds new files to recentFiles in localStorage if they don't exist and updates them if they do
//  * @param {String} key A key to store data under
//  * @param {any} data Data to be stored
//  */
// async function syncRecentFilesAsync(data) {
// 	// NOTE: Should function add file, when there is no data?
// 	// const publishedComponents = await getPublishedComponents(data)

// 	return updateClientStorageAsync('recentFiles', (recentFiles) => {
// 		recentFiles = recentFiles || []
// 		const newFile = new File(data)

// 		// We have to check if the array is empty because we can't filter an empty array
// 		if (recentFiles.length === 0) {
// 			if (data.length > 0) recentFiles.push(newFile)
// 		} else {
// 			recentFiles.filter((item) => {
// 				if (item.id === newFile.id) {
// 					item.data = data
// 				} else {
// 					if (data.length > 0) recentFiles.push(newFile)
// 				}
// 			})
// 		}

// 		return recentFiles
// 	})
// }
// async function getRecentFilesAsync() {
// 	return await getClientStorageAsync('recentFiles')
// }

// // This makes sure the list of local and remote templates are up to date
// async function syncRemoteFilesAsync() {
// 	var recentFiles = await getClientStorageAsync('recentFiles')

// 	return updatePluginData(figma.root, 'remoteFiles', (remoteFiles) => {
// 		remoteFiles = remoteFiles || []

// 		// Merge recentFiles into remoteFiles (because we need to add them if they don't exist, and update them if they do)
// 		if (recentFiles.length > 0) {
// 			// if (!remoteFiles) remoteFiles = []

// 			// I think this is a method of merging files, maybe removing duplicates?
// 			var ids = new Set(remoteFiles.map((file) => file.id))
// 			var merged = [...remoteFiles, ...recentFiles.filter((file) => !ids.has(file.id))]

// 			// Exclude current file (because we want remote files to this file only)
// 			merged = merged.filter((file) => {
// 				return !(file.id === getPluginData(figma.root, 'fileId'))
// 			})

// 			remoteFiles = merged
// 		}

// 		// Then I check to see if the file name has changed and make sure it's up to date
// 		// For now I've decided to include unpublished components in remote files, to act as a reminder to people to publish them
// 		if (remoteFiles.length > 0) {
// 			for (var i = 0; i < remoteFiles.length; i++) {
// 				var file = remoteFiles[i]
// 				figma
// 					.importComponentByKeyAsync(file.data[0].component.key)
// 					.then((component) => {
// 						var remoteTemplate = getPluginData(component, 'template')
// 						updatePluginData(figma.root, 'remoteFiles', (remoteFiles) => {
// 							remoteFiles.map((file) => {
// 								if (file.id === remoteTemplate.file.id) {
// 									file.name = remoteTemplate.file.name
// 								}
// 							})
// 							return remoteFiles
// 						})
// 					})
// 					.catch((error) => {
// 						console.log(error)
// 						// FIXME: Do I need to do something here if component is deleted?
// 						// FIXME: Is this the wrong time to check if component is published?
// 						// figma.notify("Please check component is published")
// 					})
// 			}
// 		}
// 		return remoteFiles
// 	})
// }

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

					rowContainer.primaryAxisSizingMode = 'AUTO'

					// Because changing layout mode swaps sizingModes you need to loop children again
					var rowlength = rowContainer.children.length

					// For some reason can't remove nodes while in loop, so workaround is to add to an array.
					let discardBucket = []

					for (let i = 0; i < rowlength; i++) {
						var row = rowContainer.children[i]

						// This is the original object before rows are converted to columns, so may not always match new converted table
						if (rowContainerObject.children[i]?.layoutAlign) row.layoutAlign = rowContainerObject.children[i].layoutAlign

						if (isRow(row)) {
							// Settings is original settings, not new settings
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
							} else {
								row.layoutAlign = 'STRETCH'
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

			let components = await createTemplateComponents()

			let { templateComponent, rowComponent, cellComponentSet } = components

			// Add template data and relaunch data to templateComponent
			let templateData = new Template(templateComponent)
			setPluginData(templateComponent, 'template', templateData)
			templateComponent.setRelaunchData(defaultRelaunchData)

			setDefaultTemplate(templateData)

			let tooltip1 = await createTooltip(
				'This component is the template used by Table Creator to create tables from. You can customise the appearance of your tables by customising this template. It’s made up of the components below.'
			)
			tooltip1.x = templateComponent.x + templateComponent.width + 80
			tooltip1.y = templateComponent.y - 10

			let tooltip2 = await createTooltip('Customise rows by changing this component.')
			tooltip2.x = rowComponent.x + rowComponent.width + 80
			tooltip2.y = rowComponent.y - 10

			let tooltip3 = await createTooltip(
				'Change the appearance of each cell type by customising these variants. Create more variants to add to your design system.'
			)
			tooltip3.x = cellComponentSet.x + cellComponentSet.width + 80 - 16
			tooltip3.y = cellComponentSet.y - 10 + 16

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

		plugin.command('createTable', async ({ ui }) => {
			// Sync recent files when plugin is run (checks if current file is new, and if not updates data)
			var recentFiles = await getRecentFilesAsync(getLocalTemplates())
			var remoteFiles = await getRemoteFilesAsync()
			console.log('recentFiles', recentFiles)
			console.log('remoteFiles', remoteFiles)

			// Show create table UI
			let pluginVersion = await getClientStorageAsync('pluginVersion')
			let userPreferences = await getClientStorageAsync('userPreferences')
			let usingRemoteTemplate = await getClientStorageAsync('usingRemoteTemplate')
			let pluginUsingOldComponents = getComponentById(figma.root.getPluginData('cellComponentID')) ? true : false

			// const remoteFiles = getDocumentData('remoteFiles')
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
				recentFiles: await getRecentFilesAsync(localTemplates),
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
		plugin.on('set-default-template', (msg) => {
			setDefaultTemplate(msg.template)
		})

		plugin.on('remove-element', (msg) => {
			removeElement(msg.id, msg.element)
		})

		plugin.on('add-element', (msg) => {
			addElement(msg.element)
		})

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
		plugin.on('fetch-current-selection', (msg) => {
			lookForComponent(msg.template).then((templateNode) => {
				postCurrentSelection(templateNode.id)
			})
		})
		plugin.on('fetch-template-parts', (msg) => {
			lookForComponent(msg.template).then((templateNode) => {
				// figma.viewport.scrollAndZoomIntoView([templateNode])
				// figma.currentPage.selection = [templateNode]
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

				figma.ui.postMessage({ type: 'template-parts', parts: partsAsObject })
			})
		})
		plugin.on('upgrade-to-template', () => {
			upgradeOldComponentsToTemplate()

			figma.notify('Template created')
			figma.ui.postMessage({ type: 'show-create-table-page' })
			figma.ui.postMessage({ type: 'post-default-template', defaultTemplate: getDefaultTemplate(), localTemplates: getLocalTemplates() })
		})

		// plugin.on('existing-template', (msg) => {
		// 	figma.notify('Using remote template')
		// })

		plugin.on('using-remote-template', (msg) => {
			setDocumentData('usingRemoteTemplate', msg.usingRemoteTemplate)
		})
	})
}

main()