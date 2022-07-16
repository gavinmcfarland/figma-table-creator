import plugma from 'plugma'
import _ from 'underscore'
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
	ungroup,
	incrementName,
	removeRemoteFile,
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
import { upgradeOldComponentsToTemplate } from './upgradeFrom6to7'
import {
	defaultRelaunchData,
	createTable,
	updatePluginVersion,
	Template,
	getLocalTemplates,
	File,
	updateTables,
	setDefaultTemplate,
	setPreviousTemplate,
	getTableSettings,
	convertToNumber,
	getLocalTemplatesWithoutUpdating,
	determineDefaultTemplate,
	getDefaultTemplate,
	getLocalTemplatesWithoutUpdating2,
} from './globals'
import { swapInstance, convertToNumber, isEmpty } from './helpers'

// FIXME: Recent files not adding unique files only DONE
// FIXME: Duplicated file default template not selected by default in UI (undefined, instead of local components)
// FIXME: Column resizing doesn't work on table without headers
// FIXME: When turning column resizing off component does not resize with table DONE
// TODO: Consider removing number when creating table
// TODO: When template renamed, default data no updated
// TODO: Should default template be stored in usersPreferences? different for each file

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
// figma.root.setPluginData('defaultTemplate', '')
// figma.clientStorage.deleteAsync('userPreferences')

function move(array, from, to) {
	let element = array.splice(from, 1)[0]
	array.splice(to, 0, element)
}

function daysToMilliseconds(days) {
	// 👇️        hour  min  sec  ms
	return days * 24 * 60 * 60 * 1000
}

function addUniqueToArray(object, array) {
	// // Only add new template if unique
	var index = array.findIndex((x) => x.id === object.id)
	index === -1 ? array.push(object) : false

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
// function incrementName(name, array?) {
// 	let nameToMatch = name

// 	if (array && array.length > 1) {
// 		array.sort((a, b) => {
// 			if (a.name === b.name) return 0

// 			return a.name > b.name ? -1 : 1
// 		})

// 		nameToMatch = array[0].name
// 	}

// 	let matches = nameToMatch.match(/^(.*\S)(\s*)(\d+)$/)

// 	// And increment by 1
// 	// Ignores if array is empty
// 	if (matches && !(array && array.length === 0)) {
// 		name = `${matches[1]}${matches[2]}${parseInt(matches[3], 10) + 1}`
// 	}

// 	return name
// }
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

// function getUserPreferencesAsync() {
// 	return getRecentFilesAsync()
// }

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

	function postSelection() {
		let sel = figma.currentPage.selection[0]
		// console.log('sel', sel.type)
		if (
			figma.currentPage.selection.length === 1 &&
			isInsideTemplate(figma.currentPage.selection[0]) &&
			(sel.type === 'COMPONENT' || sel.type === 'FRAME' || sel.type === 'INSTANCE')
		) {
			let semanticName = getPluginData(figma.currentPage.selection[0], 'elementSemantics')?.is
			selection = {
				element: semanticName,
				name: getSelectionName(figma.currentPage.selection[0]),
				longName: (() => {
					if (semanticName === 'table') {
						return 'Table'
					}
					if (semanticName === 'tr') {
						return 'Row'
					}
					if (semanticName === 'td') {
						return 'Cell'
					}
					if (semanticName === 'th') {
						return 'Header Cell'
					}
				})(),
			}

			figma.ui.postMessage({ type: 'current-selection', selection: selection })
		} else {
			figma.ui.postMessage({ type: 'current-selection', selection: undefined })
		}
	}

	postSelection()

	figma.on('selectionchange', () => {
		postSelection()
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
			newSelection.push(table)
		}

		if (table.type !== 'COMPONENT') {
			table.findAll((node) => {
				if (getPluginData(node, 'elementSemantics')?.is === 'tr') {
					if (node.type === 'INSTANCE') {
						// console.log(node.type, node.id)
						node.detachInstance()
					}
					if (node.type === 'COMPONENT') {
						let oldLayout = node.layoutAlign
						// FIXME: Replace function, or convertToFrame not copying layoutAlign?
						node = replace(node, convertToFrame)
						node.layoutAlign = oldLayout
					}
				}
			})

			newSelection.push(table)
		}

		// Remove dot from nodes used as column resizing
		table.findAll((node) => {
			if (getPluginData(node, 'elementSemantics')?.is === 'tr') {
				node.name = node.name.replace(/^./, '')
			}
		})
	}

	figma.currentPage.selection = newSelection

	return newSelection
}
function spawnTable() {}
async function toggleColumnResizing(selection) {
	// FIXME: Something weird happening with resizing of cell/text
	// FIXME: check width fill, fixed, fill when applied

	let newSelection = []
	let discardBucket = []
	let firstTableColumnResizing
	let result: any = false
	for (let i = 0; i < selection.length; i++) {
		var oldTable = selection[i]

		if (oldTable.type !== 'COMPONENT') {
			let settings = getTableSettings(oldTable)

			if (i === 0) {
				firstTableColumnResizing = settings.table.options.axes
			}

			if (firstTableColumnResizing) {
				let [newTable] = detachTable([oldTable])
				result = 'removed'
				newSelection.push(newTable)
			} else {
				result = 'applied'
				settings.table.options.axes = !firstTableColumnResizing

				// BUG: Apply fixed width to get around a bug in Figma API that causes table to go wild
				let oldTablePrimaryAxisSizingMode = oldTable.primaryAxisSizingMode
				oldTable.primaryAxisSizingMode = 'FIXED'

				let newTable = await createTable(oldTable, settings)

				// copyPaste(oldTable, newTable, { include: ['x', 'y', 'name'] })

				// Loop new table and replace with cells from old table

				let rowLength = oldTable.children.length

				for (let a = 0; a < rowLength; a++) {
					let nodeA = oldTable.children[a]
					if (getPluginData(nodeA, 'elementSemantics')?.is === 'tr') {
						let columnLength = nodeA.children.length

						for (let b = 0; b < columnLength; b++) {
							let nodeB = nodeA.children[b]

							if (getPluginData(nodeB, 'elementSemantics')?.is === 'td' || getPluginData(nodeB, 'elementSemantics')?.is === 'th') {
								let newTableCell = newTable.children[a].children[b]

								let oldTableCell = nodeB

								newTableCell.swapComponent(oldTableCell.mainComponent)

								// console.log('vp', oldTableCell.variantProperties, newTableCell.variantProperties)

								await swapInstance(oldTableCell, newTableCell)
								// console.log('tableCell', oldTableCell.width, newTableCell)
								// replace(newTableCell, oldTableCell)
								// newTableCell.swapComponent(oldTableCell.mainComponent)
								resize(newTableCell, oldTableCell.width, oldTableCell.height)
								// Old layoutAlign not being preserved
								newTableCell.layoutAlign = oldTableCell.layoutAlign
							}
						}
					}
				}

				// BUG: Apply fixed width to get around a bug in Figma API that causes table to go wild
				newTable.primaryAxisSizingMode = oldTablePrimaryAxisSizingMode

				newSelection.push(newTable)

				discardBucket.push(oldTable)
			}
		}
	}

	figma.currentPage.selection = newSelection

	for (let i = 0; i < discardBucket.length; i++) {
		discardBucket[i].remove()
	}

	return result
}
function switchColumnsOrRows(selection) {
	let vectorType
	function isRow(node) {
		return getPluginData(node, 'elementSemantics')?.is === 'tr'
	}

	// TODO: Fix localise component to take account of rows or columns
	// FIXME: Change cell to

	let settings
	let firstTableLayoutMode

	for (let i = 0; i < selection.length; i++) {
		var table = selection[i]

		if (getPluginData(table, 'template')) {
			if (table.type !== 'COMPONENT') {
				let firstRow = table.findOne((node) => getPluginData(node, 'elementSemantics')?.is === 'tr')

				if (table.type === 'INSTANCE' || firstRow.type === 'INSTANCE' || firstRow.type === 'COMPONENT') {
					table = detachTable(figma.currentPage.selection)[0]
					// As it's a new table, we need to find the first row again
					firstRow = table.findOne((node) => getPluginData(node, 'elementSemantics')?.is === 'tr')
				}
				// else {

				settings = getTableSettings(table)

				if (i === 0) {
					vectorType = settings.table.options.axes

					if (vectorType === 'rows') {
						firstTableLayoutMode = 'VERTICAL'
					}
					if (vectorType === 'columns') {
						firstTableLayoutMode = 'HORIZONTAL'
					}
				}

				// let parts: any = findTemplateParts(table)

				function iterateChildren() {
					var origRowlength = firstRow.parent.children.length

					var rowContainer = firstRow.parent

					var rowContainerObject = nodeToObject(rowContainer)

					// Change the table container
					if (settings.table.options.axes === 'ROWS') {
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

								if (settings.table.options.axes === 'COLUMNS') {
									row.name = row.name.replace('Col', 'Row')
									row.layoutMode = 'HORIZONTAL'
									row.layoutGrow = 0
									row.counterAxisSizingMode = 'AUTO'
								}

								if (i < origRowlength) {
									for (let c = 0; c < settings.table.matrix[0][0]; c++) {
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
												if (settings.table.options.axes === 'ROWS') {
													row.parent.children[oppositeIndex].appendChild(cell)
													row.parent.children[oppositeIndex].resize(
														rowContainerObject.children[i].children[c].width,
														row.height
													)
													row.parent.children[oppositeIndex].layoutGrow =
														rowContainerObject.children[i].children[c].layoutGrow
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

							if (settings.table.options.axes === 'ROWS' && isRow(row)) {
								row.name = row.name.replace('Row', 'Col')
								row.layoutMode = 'VERTICAL'
							}
						}

						if (settings.table.options.axes === 'COLUMNS') {
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
								if (settings.table.options.axes === 'COLUMNS') {
									row.counterAxisSizingMode = 'AUTO'
									row.layoutAlign = 'STRETCH'

									// We have to apply this after appending the cells because for some reason doing it before means that the width of the cells is incorrect

									var cells = row.children
									var length =
										settings.table.options.axes === 'COLUMNS' ? firstRow.parent.children.length : firstRow.children.length
									for (let c = 0; c < length; c++) {
										var cell = cells[c]

										if (cell) {
											if (row.parent.children[getNodeIndex(firstRow) + c]) {
												cell.primaryAxisSizingMode = 'FIXED'
												cell.layoutAlign = 'STRETCH'
											}
										}
									}
								} else {
									var cells = row.children
									var length = settings.table.options.axes === 'ROWS' ? firstRow.parent.children.length : firstRow.children.length

									for (let c = 0; c < length; c++) {
										var cell = cells[c]

										if (cell) {
											if (row.parent.children[getNodeIndex(firstRow) + c]) {
												// NOTE: temporary fix. Could be better
												if (settings.table.size[0][0] === 'HUG') {
													cell.layoutGrow = 0
													cell.primaryAxisSizingMode = 'AUTO'
												} else {
													cell.layoutGrow = 1
													cell.primaryAxisSizingMode = 'FIXED'
												}
											}
										}
									}

									row.layoutAlign = 'STRETCH'
								}

								// If row ends up being empty, then assume it's not needed
								if (row.children.length === 0) {
									discardBucket.push(row)
								}
							}
						}

						for (let i = 0; i < discardBucket.length; i++) {
							discardBucket[i].remove()
						}
					}
				}

				if (vectorType === table.layoutMode) {
				}

				if (firstTableLayoutMode === table.layoutMode) {
					iterateChildren()
				}
			}
		} else {
			figma.closePlugin('Please select a table')
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

async function createTableUI() {
	figma.root.setRelaunchData({
		createTable: '',
	})

	// Whenever plugin run
	const localTemplates = getLocalTemplates()

	// Sync recent files when plugin is run (checks if current file is new, and if not updates data)
	var recentFiles = await getRecentFilesAsync(localTemplates, { expire: daysToMilliseconds(7) })
	var remoteFiles = await getRemoteFilesAsync()

	// Show create table UI
	let pluginVersion = await getClientStorageAsync('pluginVersion')
	let userPreferences = await getClientStorageAsync('userPreferences')
	let usingRemoteTemplate = await getDocumentData('usingRemoteTemplate')
	let pluginUsingOldComponents = getComponentById(figma.root.getPluginData('cellComponentID')) ? true : false

	// const remoteFiles = getDocumentData('remoteFiles')
	const fileId = getDocumentData('fileId')

	let defaultTemplate = await determineDefaultTemplate()
	setDocumentData('defaultTemplate', defaultTemplate)

	console.log({ defaultTemplate })

	figma.showUI(__uiFiles__.main, {
		width: 240,
		height: 474 + 8 + 8,
		themeColors: true,
	})
	figma.ui.postMessage({
		type: 'show-create-table-ui',
		...userPreferences,
		remoteFiles,
		recentFiles,
		localTemplates,
		defaultTemplate,
		fileId,
		usingRemoteTemplate,
		pluginVersion,
		pluginUsingOldComponents,
	})

	// We update plugin version after UI opened for the first time so user can see the whats new message
	updatePluginVersion('7.0.0')
}

async function createTableInstance(opts) {
	// TODO: Modify to support custom template being passed in
	const remoteFiles = await getRemoteFilesAsync()
	const templateComponent = await lookForComponent(opts.template || getDocumentData('defaultTemplate'))
	// const templateComponent = await getComponentById(getDocumentData('defaultTemplate').id)

	if (templateComponent) {
		if (typeof opts.data.tableWidth === 'string' || opts.data.tableWidth instanceof String) {
			opts.data.tableWidth = opts.data.tableWidth.toUpperCase()
			opts.data.tableWidth = convertToNumber(opts.data.tableWidth)
		}

		if (typeof opts.data.tableHeight === 'string' || opts.data.tableHeight instanceof String) {
			opts.data.tableHeight = opts.data.tableHeight.toUpperCase()
			opts.data.tableHeight = convertToNumber(opts.data.tableHeight)
		}

		if (typeof opts.data.cellWidth === 'string' || opts.data.cellWidth instanceof String) {
			opts.data.cellWidth = opts.data.cellWidth.toUpperCase()
			opts.data.cellWidth = convertToNumber(opts.data.cellWidth)
		}

		if (typeof opts.data.cellHeight === 'string' || opts.data.cellHeight instanceof String) {
			opts.data.cellHeight = opts.data.cellHeight.toUpperCase()
			opts.data.cellHeight = convertToNumber(opts.data.cellHeight)
		}

		let tableInstance = createTable(templateComponent, opts.data)

		if (tableInstance) {
			positionInCenterOfViewport(tableInstance)
			figma.currentPage.selection = [tableInstance]

			updateClientStorageAsync('userPreferences', (data) => Object.assign(data, opts.data)).then(() => {
				figma.closePlugin('Table created')
			})
		}
	}
}

async function main() {
	// Set default preferences
	await updateClientStorageAsync('userPreferences', (data) => {
		let defaultData = {
			table: {
				template: null,
				matrix: [[data?.columnCount || 4, data?.rowCount || 4]],
				size: [[data?.tableWidth || 'HUG', data?.tableHeight || 'HUG']],
				cell: [[data?.cellWidth || 120, data?.cellHeight || 'FILL']],
				alignment: [data?.cellAlignment || 'MIN', 'MIN'],
				options: {
					header: data?.includeHeader || true,
					resizing: data?.columnResizing || true,
				},
			},
		}

		// If the property table deosn't exist, then declare new defaultData
		if (!data?.table) {
			data = defaultData
		}

		// Merge user's data with deafult
		data = Object.assign(defaultData, data || {})

		return data
	})

	plugma((plugin) => {
		plugin.ui = {
			html: __uiFiles__.main,
			width: 240,
			height: 504,
		}

		// Received messages
		async function newTemplateComponent(opts?) {
			let { newPage, tooltips, subComponents } = opts

			if (newPage) {
				createPage('Table Creator')
			}

			let newSelection = []

			let components = await createTemplateComponents()

			let { templateComponent, rowComponent, cellComponentSet } = components

			// Add template data and relaunch data to templateComponent
			let templateData = new Template(templateComponent)

			// Increment name
			// Before first template data set
			let localTemplates = getLocalTemplates()
			localTemplates = localTemplates.filter((item) => item.name.startsWith('Table'))
			templateComponent.name = incrementName(templateComponent.name, localTemplates)
			templateData.name = templateComponent.name
			setPluginData(templateComponent, 'template', templateData)
			templateComponent.setRelaunchData(defaultRelaunchData)

			setDefaultTemplate(templateData)

			if (tooltips !== false) {
				let tooltip1 = await createTooltip(
					'This component is a template used by Table Creator to create tables from. You can customise the appearance of your tables by customising this template. It’s made up of the components below.'
				)
				tooltip1.x = templateComponent.x + templateComponent.width + 80
				tooltip1.y = templateComponent.y - 10

				let tooltip2 = await createTooltip('Customise rows by changing this component.')
				tooltip2.x = rowComponent.x + rowComponent.width + 80
				tooltip2.y = rowComponent.y - 10

				let tooltip3 = await createTooltip(
					'Customise cell borders by changing these components. Create variants for different types of cells, icons, dropdowns, ratings etc.'
				)
				tooltip3.x = cellComponentSet.x + cellComponentSet.width + 80 - 16
				tooltip3.y = cellComponentSet.y - 10 + 16

				newSelection.push(tooltip1, tooltip2, tooltip3)
			}

			if (subComponents === false) {
				rowComponent.remove()
				cellComponentSet.remove()
			} else {
				newSelection.push(rowComponent, cellComponentSet)
			}

			newSelection.push(templateComponent)

			let tempGroup = figma.group(newSelection, figma.currentPage)
			positionInCenterOfViewport(tempGroup)
			ungroup(tempGroup, figma.currentPage)

			// animateNodeIntoView(newSelection)
			figma.currentPage.selection = newSelection

			figma.notify('Template created')

			return templateComponent
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
						longName: 'Table',
					},
					tr: {
						name: getSelectionName(parts?.tr),
						element: 'tr',
						id: parts?.tr?.id,
						longName: 'Row',
					},
					td: {
						name: getSelectionName(parts?.td),
						element: 'td',
						id: parts?.td?.id,
						longName: 'Cell',
					},
					th: {
						name: getSelectionName(parts?.th),
						element: 'th',
						id: parts?.th?.id,
						longName: 'Cell Header',
					},
				}

				postCurrentSelection(templateNode.id)

				figma.ui.postMessage({ type: 'template-parts', parts: partsAsObject })
			})
		}

		plugin.command('createTable', async ({ ui }) => {
			let userPreferences = await getClientStorageAsync('userPreferences')
			// let userPreferences = {
			// 	cellAlignment: 'CENTER',
			// 	cellHeight: undefined,
			// 	cellWidth: 120,
			// 	columnCount: 2,
			// 	columnResizing: false,
			// 	includeHeader: true,
			// 	prevCellWidth: 120,
			// 	remember: true,
			// 	rowCount: 2,
			// 	tableHeight: 500,
			// 	tableWidth: 600,
			// }
			let localTemplates = getLocalTemplatesWithoutUpdating2()
			let remoteFiles = getDocumentData('remoteFiles')
			let remoteTemplates = []
			let defaultTemplate = await determineDefaultTemplate()

			console.log('defaultTemplate', defaultTemplate)

			for (let i = 0; i < remoteFiles.length; i++) {
				let file = remoteFiles[i]

				for (let x = 0; x < file.data.length; x++) {
					let template = file.data[x]
					remoteTemplates.push({
						name: template.name,
						data: template,
						icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M1.92228 7.04535L7.42826 1.53783L6.72106 0.830822L1.21508 6.33834C0.678207 6.87536 0.678299 7.74591 1.21529 8.28282L6.1029 13.1697C6.63989 13.7066 7.51044 13.7066 8.04738 13.1696L13.5528 7.66416L12.8457 6.95706L7.34027 12.4625C7.19383 12.609 6.9564 12.609 6.80995 12.4625L1.92234 7.57566C1.77589 7.42923 1.77586 7.19181 1.92228 7.04535ZM11.8885 1.99731H8.82605V2.99731H10.6814L7.16 6.51875L7.8671 7.22586L11.3885 3.70441V5.55981H12.3885V2.49731V1.99731H11.8885Z" fill="black" fill-opacity="0.5"/>
						</svg>`,
					})
				}
			}

			localTemplates = localTemplates.map((item) => {
				return {
					name: item.name,
					data: item,
				}
			})

			figma.parameters.on('input', ({ query, result, key }) => {
				function genSuggestions(key, query) {
					let suggestions = []

					if (query) {
						let [item1, item2] = query.split('x')

						item1 = item1 || userPreferences.table[key][0][0]
						item2 = item2 || userPreferences.table[key][0][1]

						item1 = convertToNumber(item1)
						item2 = convertToNumber(item2)

						suggestions.push({ name: `${item1} x ${item2}`, data: [item1, item2] })
					}

					for (let i = 0; i < userPreferences.table[key].length; i++) {
						let item = userPreferences.table[key][i]
						let obj = {
							name: `${item[0].toString().toUpperCase()} x ${item[1].toString().toUpperCase()}`,
							data: item,
						}
						suggestions.push(obj)
					}

					return suggestions
				}

				if (key === 'matrix') {
					result.setSuggestions(genSuggestions('matrix', query))
				}
				if (key === 'size') {
					result.setSuggestions(genSuggestions('size', query))
				}
				if (key === 'template') {
					// TODO: Add remote templates if they exist
					// TODO: Add icon for remote templates
					// TODO: reorder so that defaultTemplate is first in array
					localTemplates = localTemplates.filter((s) => s.name.toUpperCase().includes(query.toUpperCase()))
					let suggestions = [...localTemplates, ...remoteTemplates]
					// Reorder array so that default template is at the top

					let indexOfDefaultTemplate = suggestions.findIndex((item) => item.data.component.key === defaultTemplate.component.key)
					let element = suggestions.splice(indexOfDefaultTemplate, 1)[0]
					suggestions.splice(0, 0, element)
					result.setSuggestions(suggestions)
				}
				if (key === 'cell') {
					result.setSuggestions(genSuggestions('cell', query))
				}
				if (key === 'alignment') {
					let suggestions = [
						{ name: 'Top', data: ['MIN', 'MIN'] },
						{ name: 'Center', data: ['CENTER', 'MIN'] },
						{ name: 'Bottom', data: ['MAX', 'MIN'] },
					]

					// Reorder array so that default template is at the top
					let indexFrom = suggestions.findIndex((item) => item.data === userPreferences.table.alignment[0])
					let element = suggestions.splice(indexFrom, 1)[0]
					suggestions.splice(0, 0, element)
					result.setSuggestions(suggestions.filter((s) => s.name.toUpperCase().includes(query.toUpperCase())))
				}
				if (key === 'header') {
					let first
					let second
					if (userPreferences.table.options.header) {
						first = { name: 'True', data: true }
						second = { name: 'False', data: false }
					} else {
						first = { name: 'False', data: false }
						second = { name: 'True', data: true }
					}
					result.setSuggestions([first, second].filter((s) => s.name.toUpperCase().includes(query.toUpperCase())))
				}
			})

			figma.on('run', async ({ parameters }) => {
				let settings = userPreferences
				let template

				function updateEntryInArray(array, entry) {
					// Add to recents
					// If it doesn't exist add it to top of array
					// else if it does, move it to top of array

					array.some((item, index) => {
						let result = false
						if (_.isEqual(item, entry)) {
							result = true
							// move to top
							console.log('move to top')
							move(array, index, 0)
						}

						return result
					})

					let matchFound = false
					array.map((item, index) => {
						if (_.isEqual(item, entry)) {
							matchFound = true
						}
					})

					if (!matchFound) {
						console.log('add to array')
						array.unshift(entry)
					}

					if (array.length > 4) {
						array = array.slice(0, 4)
					}
				}

				if (parameters) {
					console.log(parameters)
					if (parameters.matrix) {
						updateEntryInArray(settings.table.matrix, parameters.matrix)
					}

					if (parameters.size) {
						updateEntryInArray(settings.table.size, parameters.size)
					}

					if (parameters.template) {
						template = parameters.template
					}

					if (parameters.cell) {
						updateEntryInArray(settings.table.cell, parameters.cell)
					}

					if (parameters.alignment) {
						settings.table.alignment = parameters.alignment
					}

					if (parameters.header === false || parameters.header === true) {
						settings.table.options.header = parameters.header
					}

					if (parameters.template) {
						settings.table.template = parameters.template
					}

					createTableInstance({ data: settings })

					setClientStorageAsync('userPreferences', settings)
				} else {
					createTableUI()
				}
			})
		})
		plugin.command('detachTable', () => {
			let tables = detachTable(figma.currentPage.selection)
			if (tables.length > 0) {
				figma.closePlugin(`Table and rows detached`)
			} else {
				figma.closePlugin(`Can't detach template`)
			}
		})
		plugin.command('spawnTable', spawnTable)
		plugin.command('toggleColumnResizing', () => {
			toggleColumnResizing(figma.currentPage.selection).then((result) => {
				if (result) {
					figma.closePlugin(`Column resizing ${result}`)
				} else {
					figma.closePlugin(`Can't apply to templates`)
				}
			})
		})

		plugin.command('switchColumnsOrRows', () => {
			let { vectorType } = switchColumnsOrRows(figma.currentPage.selection)

			if (vectorType) {
				figma.closePlugin(`Switched to ${vectorType === 'rows' ? 'columns' : 'rows'}`)
			} else if (figma.currentPage.selection.length === 0) {
				figma.closePlugin('Please select a table')
			} else {
				figma.closePlugin(`Can't apply to templates`)
			}
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

		plugin.on('new-template', async (msg) => {
			let templateComponent = await newTemplateComponent(msg.options)
			let templateData = getPluginData(templateComponent, 'template')
			setDefaultTemplate(templateData)
		})
		plugin.on('remove-template', (msg) => {
			let currentTemplate = getDefaultTemplate()
			let previousTemplate = getDocumentData('previousTemplate')

			if (msg.file) {
				let remoteFiles = getDocumentData('remoteFiles')
				let currentFileIndex = remoteFiles.findIndex((file) => file.id === msg.file.id)
				let currentFile = remoteFiles[currentFileIndex]

				let templateIndex = currentFile.data.findIndex((template) => template.id === msg.template.id)

				currentFile.data.splice(templateIndex, 1)

				// If no data, then remove file from list
				if (currentFile.data.length === 0) {
					remoteFiles.splice(currentFileIndex, 1)
				}

				setDocumentData('remoteFiles', remoteFiles)

				figma.ui.postMessage({
					type: 'remote-files',
					remoteFiles: remoteFiles,
				})
			} else {
				let templateComponent = getComponentById(msg.template.id)

				templateComponent.remove()

				let localTemplates = getLocalTemplates()

				figma.ui.postMessage({
					type: 'local-templates',
					localTemplates: localTemplates,
				})
			}

			if (currentTemplate.id === msg.template.id) {
				let localTemplates = getLocalTemplates()
				setDefaultTemplate(localTemplates[localTemplates.length - 1])
			}
		})
		plugin.on('edit-template', (msg) => {
			editTemplateComponent(msg)
		})
		plugin.on('set-default-template', (msg) => {
			setDefaultTemplate(msg.template)
		})
		plugin.on('add-remote-file', async (msg) => {
			const remoteFiles = await getRemoteFilesAsync(msg.file.id)
			figma.ui.postMessage({ type: 'remote-files', remoteFiles })
		})

		plugin.on('remove-remote-file', async (msg) => {
			removeRemoteFile(msg.file.id)
			const remoteFiles = await getRemoteFilesAsync()
			const localTemplates = getLocalTemplates()

			if (remoteFiles.length > 0) {
				setDefaultTemplate(remoteFiles[0].data[0])
			} else {
				if (localTemplates.length > 0) {
					setDefaultTemplate(localTemplates[0])
				} else {
					setDefaultTemplate(null)
					figma.ui.postMessage({ type: 'post-default-template', defaultTemplate: null })
				}
			}

			figma.ui.postMessage({ type: 'remote-files', remoteFiles })
		})

		plugin.on('remove-element', (msg) => {
			removeElement(msg.id, msg.element)
		})

		plugin.on('add-element', (msg) => {
			addElement(msg.element)
		})

		plugin.on('create-table-instance', async (msg) => {
			createTableInstance(msg)
		})

		plugin.command('updateTables', () => {
			let templateData = getPluginData(figma.currentPage.selection[0], 'template')
			updateTables(templateData).then(() => {
				figma.notify('Tables updated', { timeout: 1500 })
				figma.closePlugin()
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
			if (msg.template) {
				lookForComponent(msg.template).then((templateNode) => {
					postCurrentSelection(templateNode.id)
				})
			}
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
			createTableUI()
			figma.ui.postMessage({ type: 'post-default-template', defaultTemplate: getDefaultTemplate(), localTemplates: getLocalTemplates() })
		})

		// plugin.on('existing-template', (msg) => {
		// 	figma.notify('Using remote template')
		// })

		plugin.on('using-remote-template', async (msg) => {
			const remoteFiles = await getRemoteFilesAsync()
			setDocumentData('usingRemoteTemplate', msg.usingRemoteTemplate)
			figma.ui.postMessage({ type: 'remote-files', remoteFiles })
		})
	})
}

main()

// figma.clientStorage.deleteAsync('pluginVersion')
