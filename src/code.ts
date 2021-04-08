import { copyPasteProps, pageNode, clone, removeChildren, positionInCenter, compareVersion, loadFonts, changeText, ungroupNode, findComponentById, getPluginData, setPluginData, updatePluginData, detachInstance, updateClientStorageAsync } from './helpers'
import { createDefaultComponents } from './defaultComponents'
import plugma from 'plugma'
// import { nanoid } from 'nanoid'
import { v4 as uuidv4 } from 'uuid';


// figma.clientStorage.setAsync('test2', {
// 	test: "something"
// }).then(res => console.log(res))

// figma.clientStorage.getAsync('test2').then((res) => {
// 	res.test = "something else"
// 	figma.clientStorage.setAsync('test2', res)
// })

// figma.clientStorage.getAsync('test2').then((res) => {
// 	console.log(res)
// })
// let pkg = {
// 	version: "6.1.0"
// }

// if (figma.root.getPluginData("pluginVersion") === "") {
// 	// If plugin was used before new auto layout tables were supported
// 	if (figma.root.getPluginData("cellComponentID")) {
// 		figma.root.setPluginData("pluginVersion", "5.0.0")
// 		figma.root.setPluginData("upgradedTables", "false")
// 	}
// 	// Else if plugin never used
// 	else {
// 		figma.root.setPluginData("pluginVersion", pkg.version)
// 	}

// }


// --------

// TODO: Change preferences to clientStorage
// TODO: Create seperate store for component settings


function createNewTable(numberColumns, numberRows, cellWidth, includeHeader, usingLocalComponent, cellAlignment) {

	// Get Cell Templa
	var cell = findComponentById(getPluginData(figma.root, 'components').current.cell.id)
	var cellHeader = findComponentById(getPluginData(figma.root, 'components').current.cellHeader.id)

	if (!cellHeader && includeHeader) {
		// throw "No Header Cell component found";
		figma.notify("No Header Cell component found")
		return
	}

	var rowTemplate = findComponentById(getPluginData(figma.root, 'components').current.row.id)
	var row = figma.createFrame()

	copyPasteProps(rowTemplate, row, { include: ['name'] })



	var tableTemplate = findComponentById(getPluginData(figma.root, 'components').current.table.id)
	var table = figma.createFrame()

	copyPasteProps(tableTemplate, table, { include: ['name'] })


	// Manually set layout mode
	table.layoutMode = "VERTICAL"
	row.layoutMode = "HORIZONTAL"



	// Duplicated Cells and Rows
	var firstRow

	if (usingLocalComponent) {
		if (rowTemplate) {
			firstRow = rowTemplate.clone()
		}
		else {
			firstRow = figma.createComponent()
			firstRow.layoutMode = "HORIZONTAL"
			firstRow.counterAxisSizingMode = "AUTO"
			firstRow.layoutAlign = "STRETCH"
		}


		// Remove children (we only need the container)
		removeChildren(firstRow)

		firstRow.setPluginData("isRow", "true")

		firstRow.name = row.name
		firstRow.layoutMode = "HORIZONTAL"
		firstRow.primaryAxisSizingMode = "FIXED"
		firstRow.layoutAlign = "STRETCH"
		firstRow.counterAxisAlignItems = cellAlignment
	}
	else {
		firstRow = row
		firstRow.setPluginData("isRow", "true")
		firstRow.layoutAlign = "STRETCH"
		firstRow.primaryAxisSizingMode = "FIXED"
	}


	var rowHeader

	if (includeHeader) {
		rowHeader = firstRow.clone()
		rowHeader.layoutAlign = "STRETCH"
		rowHeader.primaryAxisSizingMode = "FIXED"

		for (var i = 0; i < numberColumns; i++) {

			// Duplicate cell for each column and append to row
			var duplicatedCellHeader = cellHeader.createInstance()


			duplicatedCellHeader.setPluginData("isCellHeader", "true")
			duplicatedCellHeader.layoutAlign = cellHeader.layoutAlign
			duplicatedCellHeader.layoutGrow = cellHeader.layoutGrow

			duplicatedCellHeader.resizeWithoutConstraints(cellWidth, duplicatedCellHeader.height)

			duplicatedCellHeader.primaryAxisAlignItems = cellAlignment


			if (duplicatedCellHeader.children.length === 1) {
				duplicatedCellHeader.children[0].primaryAxisAlignItems = cellAlignment
			}


			rowHeader.appendChild(duplicatedCellHeader)


		}

		table.appendChild(rowHeader)


	}



	for (var i = 0; i < numberColumns; i++) {

		var duplicatedCell = cell.createInstance()

		duplicatedCell.setPluginData("isCell", "true")
		// Bug: layoutAlign is not inherited when creating an instance

		duplicatedCell.layoutAlign = cell.layoutAlign
		duplicatedCell.layoutGrow = cell.layoutGrow



		duplicatedCell.primaryAxisSizingMode = "FIXED"


		duplicatedCell.primaryAxisAlignItems = cellAlignment


		duplicatedCell.resizeWithoutConstraints(cellWidth, duplicatedCell.height)


		if (duplicatedCell.children.length === 1) {
			duplicatedCell.children[0].primaryAxisAlignItems = cellAlignment
		}


		firstRow.appendChild(duplicatedCell)
	}

	// Duplicate row for each row and append to table
	// Easier to append cloned row and then duplicate, than remove later, hence numberRows - 1
	if (!usingLocalComponent || !includeHeader) {
		table.appendChild(firstRow)
	}


	for (let i = 0; i < numberRows - 1; i++) {
		var duplicatedRow
		if (usingLocalComponent) {
			if (includeHeader) {
				duplicatedRow = rowHeader.createInstance()
				duplicatedRow.layoutAlign = "STRETCH"
				duplicatedRow.primaryAxisSizingMode = "FIXED"
				// duplicatedRow.setPluginData("isRowInstance", "true")

				for (let b = 0; b < duplicatedRow.children.length; b++) {
					// Save original layout align of component before it gets swapped




					duplicatedRow.children[b].mainComponent = cell
					// duplicatedRow.children[b].primaryAxisSizingMode = "FIXED"
					duplicatedRow.children[b].setPluginData("isCell", "true") // Check

					// When main component is changed set back to what original component was
					duplicatedRow.children[b].layoutAlign = cell.layoutAlign
					duplicatedRow.children[b].primaryAxisSizingMode = "FIXED"


					duplicatedRow.children[b].primaryAxisAlignItems = cellAlignment

					if (duplicatedRow.children[b].children.length === 1) {
						duplicatedRow.children[b].children[0].primaryAxisAlignItems = cellAlignment
					}
					// }
				}

				firstRow.remove()
			}
			else {

				duplicatedRow = firstRow.createInstance()
				duplicatedRow.layoutAlign = "STRETCH"
				duplicatedRow.primaryAxisSizingMode = "FIXED"

				// Bug: You need to swap the instances because otherwise figma API calculates the height incorrectly
				for (let b = 0; b < duplicatedRow.children.length; b++) {

					duplicatedRow.children[b].mainComponent = cell
					// duplicatedRow.children[b].primaryAxisSizingMode = "FIXED"
					duplicatedRow.children[b].setPluginData("isCell", "true") // Check

					// When main component is changed set back to what original main component was
					// duplicatedRow.children[b].layoutAlign = sizing


					duplicatedRow.children[b].primaryAxisAlignItems = cellAlignment
					if (duplicatedRow.children[b].children.length === 1) {
						duplicatedRow.children[b].children[0].primaryAxisAlignItems = cellAlignment
					}
					// }
				}
			}

		}
		else {
			duplicatedRow = row.clone()
			duplicatedRow.layoutAlign = "STRETCH"
			duplicatedRow.primaryAxisSizingMode = "FIXED"
		}

		table.appendChild(duplicatedRow)

	}


	if (includeHeader || usingLocalComponent) {
		row.remove()
	}

	// Resize table

	var padding = tableTemplate.paddingLeft + tableTemplate.paddingRight + rowTemplate.paddingLeft + rowTemplate.paddingRight + (rowTemplate.itemSpacing * (numberColumns - 1))

	table.resize(cellWidth * numberColumns + padding, table.height)
	table.counterAxisSizingMode = "AUTO"

	// TODO: Needs to be added to components linked by user also
	table.setPluginData("isTable", "true")

	return table
}

// Must pass in both the source/target and their matching main components
function overrideChildrenChars(sourceComponentChildren, targetComponentChildren, sourceChildren, targetChildren) {
	for (let a = 0; a < targetChildren.length; a++) {
		for (let b = 0; b < sourceChildren.length; b++) {

			// If layer has children then run function again
			if (sourceComponentChildren[a].children && targetComponentChildren[a].children && targetChildren[a].children && sourceChildren[a].children) {
				overrideChildrenChars(sourceComponentChildren[a].children, targetComponentChildren[b].children, sourceChildren[b].children, targetChildren[b].children)
			}

			// If layer is a text node then check if the main components share the same name
			else if (sourceChildren[a].type === "TEXT") {
				if (sourceComponentChildren[a].name === targetComponentChildren[b].name) {
					changeText(targetChildren[a], sourceChildren[a].characters, sourceChildren[a].fontName.style)
				}
			}
		}
	}
}

function overrideChildrenChars2(sourceChildren, targetChildren, sourceComponentChildren?, targetComponentChildren?) {
	for (let a = 0; a < sourceChildren.length; a++) {
		if (sourceComponentChildren[a].name === targetComponentChildren[a].name) {
			targetChildren[a].name = sourceChildren[a].name
		}
		// If layer has children then run function again
		if (targetChildren[a].children && sourceChildren[a].children) {

			overrideChildrenChars2(sourceChildren[a].children, targetChildren[a].children, sourceComponentChildren[a].children, targetComponentChildren[a].children)
		}

		// If layer is a text node then check if the main components share the same name
		else if (sourceChildren[a].type === "TEXT") {
			// if (sourceChildren[a].name === targetChildren[b].name) {

			changeText(targetChildren[a], sourceChildren[a].characters, sourceChildren[a].fontName.style)
			// }
		}

	}
}





function updateTables() {

	// Find all tables
	var pages = figma.root.children
	var tables
	var tableTemplateID = getPluginData(figma.root, 'components').current.table.id
	var tableTemplate = findComponentById(tableTemplateID)
	// removeChildren(tableTemplate)



	var rowTemplate = findComponentById(getPluginData(figma.root, 'components').current.row.id)
	// removeChildren(rowTemplate)

	// If can't find table and row templates use plain frame
	if (!tableTemplate) {
		tableTemplate = figma.createFrame()
	}

	if (!rowTemplate) {
		rowTemplate = figma.createFrame()
	}

	var cellTemplateID = getPluginData(figma.root, 'components').current.cell.id
	var previousCellTemplateID = getPluginData(figma.root, 'components').prevous.cell.id
	var cellTemplate = findComponentById(cellTemplateID)

	var cellHeaderTemplateID = getPluginData(figma.root, 'components').current.cellHeader.id
	var previousCellHeaderTemplateID = getPluginData(figma.root, 'components').prevous.cellHeader.id
	var cellHeaderTemplate = findComponentById(cellHeaderTemplateID)
	var discardBucket = figma.createFrame()

	// Look through each page to find tables created with plugin
	for (let i = 0; i < pages.length; i++) {
		tables = pages[i].findAll(node => node.getPluginData("isTable") === "true")


		// Add && node.id !== tableTemplateID ^^ if don't want it to update linked component


		for (let b = 0; b < tables.length; b++) {

			var table = tables[b]

			// Don't apply if an instance
			if (table.type !== "INSTANCE") {

				copyPasteProps(tableTemplate, table, { include: ['name'], exclude: ['layoutMode', 'counterAxisSizingMode', 'primaryAxisSizingMode', 'layoutAlign', 'rotation', 'constrainProportions'] })

				for (let x = 0; x < table.children.length; x++) {
					var row = table.children[x]

					if (row.children && row.getPluginData("isRow") === "true") {

						for (let k = 0; k < row.children.length; k++) {
							var cell = row.children[k]

							var width = cell.width
							var height = cell.height
							var newInstance = cell.clone()
							discardBucket.appendChild(newInstance)

							// Checks that main component has not been swapped by user
							if (cell.mainComponent.id === previousCellTemplateID) {

								overrideChildrenChars(cell.mainComponent.children, cellTemplate.children, cell.children, newInstance.children)

								cell.mainComponent = cellTemplate

								// We should not set width or layout properties of cells inside row instances
								if (row.type === "INSTANCE") {

								}
								else {
									cell.resize(width, height)
									cell.layoutAlign = cellTemplate.layoutAlign
									cell.layoutGrow = cellTemplate.layoutGrow
								}

								// Bug where plugin preferences is lost when instance swapped
								cell.setPluginData("instanceBug", "true")
								cell.setPluginData("isCell", "")
								cell.setPluginData("isCell", "true")

								overrideChildrenChars2(newInstance.children, cell.children, newInstance.mainComponent.children, cell.mainComponent.children)

							}

							if (cell.mainComponent.id === previousCellHeaderTemplateID) {

								overrideChildrenChars(cell.mainComponent.children, cellHeaderTemplate.children, cell.children, newInstance.children)

								cell.mainComponent = cellHeaderTemplate

								// We should not set width or layout properties of cells inside row instances
								if (row.type === "INSTANCE") {

								}
								else {
									cell.resize(width, height)
									cell.layoutAlign = cellHeaderTemplate.layoutAlign
									cell.layoutGrow = cellHeaderTemplate.layoutGrow
								}

								// Bug where plugin preferences is lost when instance swapped
								cell.setPluginData("instanceBug", "true")
								cell.setPluginData("isCellHeader", "")
								cell.setPluginData("isCellHeader", "true")

								overrideChildrenChars2(newInstance.children, cell.children, newInstance.mainComponent.children, cell.mainComponent.children)
							}
						}

						if (row.getPluginData("isRow") === "true" && row.type !== "INSTANCE") {
							copyPasteProps(rowTemplate, row, { include: ['name'], exclude: ['layoutMode', 'counterAxisSizingMode', 'primaryAxisSizingMode', 'layoutAlign', 'rotation', 'constrainProportions'] })
						}
					}
				}

			}
		}
	}
	discardBucket.remove()

}



function addNewNodeToSelection(page, node) {
	page.selection = node
}

function selectParallelCells() {
	// Needs a way to exclude things which aren't rows/columns, or a way to include only rows/columns
	var regex = RegExp(/\[ignore\]/, 'g');
	var selection = figma.currentPage.selection

	var newSelection = []

	for (let i = 0; i < selection.length; i++) {
		var parent = selection[i].parent?.parent
		var children = parent?.children

		var rowIndex = children.findIndex(x => x.id === selection[i].parent.id)

		var columnIndex = children[rowIndex].children.findIndex(x => x.id === selection[i].id)

		for (let i = 0; i < children.length; i++) {
			if (children[i].children) {
				if (children[i].children[columnIndex] && !regex.test(children[i].children[columnIndex].parent.name)) {
					newSelection.push(clone(children[i].children[columnIndex]))
				}
			}

		}

	}

	addNewNodeToSelection(figma.currentPage, newSelection)

}

function selectAdjacentCells() {

	// Needs a way to exclude things which aren't rows/columns, or a way to include only rows/columns
	var regex = RegExp(/\[ignore\]/, 'g');
	var selection = figma.currentPage.selection

	var newSelection = []

	for (let i = 0; i < selection.length; i++) {
		// Table container
		var parent = selection[i].parent?.parent

		// rows or columns
		var children = parent?.children

		var rowIndex = children.findIndex(x => x.id === selection[i].parent.id)

		// var columnIndex = children[rowIndex].children.findIndex(x => x.id === selection[i].id)

		for (let i = 0; i < children.length; i++) {
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

	addNewNodeToSelection(figma.currentPage, newSelection)

}

function selectColumn() {
	if (figma.currentPage.selection.length > 0) {
		if (figma.currentPage.selection[0].parent?.parent.layoutMode === "VERTICAL") {
			selectParallelCells()
		}
		if (figma.currentPage.selection[0].parent?.parent.layoutMode === "HORIZONTAL") {
			selectAdjacentCells()
		}
	}
	else {
		figma.notify("One or more table cells must be selected")
	}
}

function selectRow() {
	if (figma.currentPage.selection.length > 0) {
		if (figma.currentPage.selection[0].parent?.parent.layoutMode === "HORIZONTAL") {
			selectParallelCells()
		}
		if (figma.currentPage.selection[0].parent?.parent.layoutMode === "VERTICAL") {
			selectAdjacentCells()
		}
	}
	else {
		figma.notify("One or more table cells must be selected")
	}
}



function detachTable(selection) {

	let length1 = selection.length
	let discard = []
	let newTable

	if (length1) {
		let newRows = []
		for (let i = 0; i < length1; i++) {
			let table = selection[i]
			discard.push(table)
			newTable = detachInstance(table, table.parent)
			newTable.setPluginData("isTable", "true")

			let length2 = table.children.length
			for (let b = 0; b < length2; b++) {
				let row = newTable.children[b]
				if (row.getPluginData("isRow") === "true") {
					discard.push(row)
					row = detachInstance(row, row.parent)
					row.setPluginData("isRow", "true")
					newRows.push(row)

				}
				else {
					newRows.push(row)
				}

			}

			for (let b = 0; b < newRows.length; b++) {
				newTable.insertChild(b, newRows[b])
			}
		}
	}
	else {
		figma.notify("One or more table must be selected")
	}

	for (let b = 0; b < discard.length; b++) {
		discard[b].remove()
	}
}

function linkComponent(template, selection) {

	console.log(template)

	if (selection.length === 1) {
		if (selection[0].type !== "COMPONENT") {
			figma.notify("Please make sure node is a component")
		}
		else {
			const capitalize = (s) => {
				if (typeof s !== 'string') return ''
				return s.charAt(0).toUpperCase() + s.slice(1)
			}

			// Make sure old templates don't have any old preferences on them
			// TODO: Need to check this works
			var oldTemplate = findComponentById(getPluginData(figma.root, 'components').current[template].id)

			// Check if a previous template has been set first
			if (oldTemplate) {
				updatePluginData(figma.root, 'components', (data) => { data.previous[template] = oldTemplate.id })
				oldTemplate.setPluginData("isTable", "")
				oldTemplate.setPluginData("isRow", "")
				oldTemplate.setPluginData("isCell", "")
				oldTemplate.setPluginData("isCellHeader", "")
			}

			selection[0].setPluginData("is" + capitalize(template), "true") // Check

			// if (template === "cell") {
			// 	figma.root.setPluginData("cellWidth", selection[0].width.toString())
			// }

			if (template === "table") {
				selection[0].setRelaunchData({ detachTable: 'Detaches table and rows' })
			}

			// Save component ids which are used to create tables to preferences
			updateClientStorageAsync('preferences', (data) => {
				data.components[template] = selection[0].id

				return data
			})

			if (template === "cellHeader") template = "Header Cell"
			figma.notify(capitalize(template) + " component succesfully linked")
		}

	}

	if (selection.length > 1) {
		figma.notify("Make sure only one component is selected")
	}

	if (selection.length === 0) {
		figma.notify("No components selected")
	}



}

function restoreComponent(component) {

	var component: any = figma.getNodeById(figma.root.getPluginData(component + "ComponentID"))


	figma.currentPage.appendChild(component)
	if (component) {

		figma.currentPage.selection = [component]
		figma.viewport.scrollAndZoomIntoView(figma.currentPage.selection);
	}
	else {
		figma.notify("Component not found")
	}

}

if (compareVersion(figma.root.getPluginData("pluginVersion"), "6.3.0") < 0) {
	var tableTemplate = findComponentById(figma.root.getPluginData("tableComponentID"))
	if (tableTemplate) {
		tableTemplate.setRelaunchData({ detachTable: 'Detaches table and rows' })
	}
}


function checkVersion() {
	if (compareVersion(figma.root.getPluginData("pluginVersion"), pkg.version) < 0) {
		// TODO: Change to store version on client storage?
		figma.root.setPluginData("pluginVersion", pkg.version)
		console.log(figma.root.getPluginData("pluginVersion"))

		throw 'New Version'
	}
}


// Takes input like rowCount and columnCount to create table and sets plugin preferences to root.
function createTable(msg) {

	// Does a check to only create a table if a table cell component is already defined
	if (findComponentById(getPluginData(figma.root, 'components').current.cell.id)) {

		updatePluginData(figma.root, 'components', (data) => {
			data.componentsExist = true
			data.upgradedTables = figma.root.getPluginData("upgradedTables")

			return data
		})



		// Will only let you create a table if less than 50 columns and rows
		if (msg.columnCount < 51 && msg.rowCount < 51) {

			// Will input from user and create table node
			var table = createNewTable(msg.columnCount, msg.rowCount, msg.cellWidth, msg.includeHeader, msg.columnResizing, msg.cellAlignment);



			// If table successfully created?
			if (table) {

				// Positions the table in the center of the viewport
				positionInCenter(table)

				// Makes table the users current selection
				figma.currentPage.selection = [table];

				// This updates the plugin preferences
				updateClientStorageAsync('preferences', (data) => {
					data.columnCount = msg.columnCount
					data.rowCount = msg.rowCount
					data.cellWidth = msg.cellWidth
					data.remember = msg.remember
					data.includeHeader = msg.includeHeader
					data.cellAlignment = msg.cellAlignment

					return data
				}).then(() => {
					figma.closePlugin();
				})

			}


		}
		else {
			figma.notify("Plugin limited to max of 50 columns and rows")
		}
	}
	else {
		updatePluginData(figma.root, 'components', (data) => {
			data.componentsExist = false

			return data
		})
		figma.notify("Cannot find Cell component")
	}
}

plugma((plugin) => {

	plugin.ui = {
		html: __uiFiles__.main,
		width: 268,
		height: 504
	}

	updatePluginData(figma.root, 'components', (data) => {
		data = data || {
			componentsExist: false,
			current: {},
			previous: {}
		}

		return data
	})

	// Set default preferences
	updateClientStorageAsync('preferences', (data) => {
		data = data || {
			columnCount: 4,
			rowCount: 4,
			cellWidth: 100,
			remember: true,
			includeHeader: true,
			columnResizing: true,
			cellAlignment: "MIN"
		}

		return data
	})

	// Set random id on  document
	updatePluginData(figma.root, 'documentId', (data) => {
		var randPassword = Array(10).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz").map(function (x) { return x[Math.floor(Math.random() * x.length)] }).join('');
		data = data || randPassword
		return data
	})

	function checkComponentsExist() {

		updatePluginData(figma.root, 'components', (components) => {
			if (findComponentById(getPluginData(figma.root, 'components').current?.cell?.id)) {

				// Store any components created by user to local storage
				updateClientStorageAsync('components', (data) => {
					data = data || []

					var newValue = {
						id: getPluginData(figma.root, 'documentId'),
						name: "file",
						components: components.current
					}

					// Only add to array if unique
					if (!data.some((item) => item.id === newValue.id)) {
						data.push(newValue)
					}

					return data
				})

				components.componentsExist = true
			}
			else {
				// If no cell component found then remove from client storage list
				if (getPluginData(figma.root, 'documentId')) {
					updateClientStorageAsync('components', (data) => {
						data = data || []

						data = data.filter(item => item.id === getPluginData(figma.root, 'documentId'))

						return data
					})
				}
				components.componentsExist = false
			}

			return components
		})
	}

	// Look for any components in file and update component settings and add to storage
	checkComponentsExist()


	figma.clientStorage.getAsync('components').then((res) => { console.log(res) })



	plugin.command('createTable', ({ ui, data }) => {

		figma.clientStorage.getAsync('preferences').then((res) => {
			figma.clientStorage.getAsync('components').then((components) => {
				ui.show({ type: "create-table", ...res, componentsExist: getPluginData(figma.root, 'components').componentsExist, components })
			})
		})



		// try {
		// 	checkVersion()
		// } catch (e) {
		// 	figma.showUI(__uiFiles__.versionLog);

		// 	figma.ui.resize(268, 504)

		// 	console.error(e);
		// 	figma.ui.onmessage = msg => {

		// 		createTableCommands(preferences, msg)

		// 	}
		// 	break block_1
		// 	// expected output: "Parameter is not a number!"
		// }

	})

	plugin.command('linkComponents', ({ ui }) => {
		figma.clientStorage.getAsync('components').then((components) => {
			ui.show({ type: "settings", components })
		})
	})

	plugin.command('selectColumn', () => {
		selectColumn()
		figma.closePlugin();
	})

	plugin.command('selectRow', () => {
		selectRow()
		figma.closePlugin();
	})


	// Listen for events from UI

	plugin.on('to-create-table', (msg) => {
		figma.clientStorage.getAsync('preferences').then((res) => {
			plugin.ui.show({ type: "create-table", ...res, componentsExist: getPluginData(figma.root, 'components').componentsExist })
		})
	})

	plugin.on('update-tables', (msg) => {
		updateTables()
	})

	plugin.on('create-components', (msg) => {
		var components = createDefaultComponents()
		figma.root.setRelaunchData({ createTable: 'Create a new table' })

		updatePluginData(figma.root, 'components', (data) => {
			data.current = Object.assign(data.current, components)

			return data
		})

		figma.notify('Default components created')
	})

	plugin.on('create-table', (msg) => {
		createTable(msg)
	})

	plugin.on('link-component', (msg) => {
		linkComponent(msg.template, figma.currentPage.selection)
	})

	// Updates what?
	plugin.on('update', (msg) => {

		components = updatePluginData(figma.root, 'components', (data) => {
			if (findComponentById(getPluginData(figma.root, 'components').current?.cell?.id)) {
				data.componentsExist = true
			}
			else {
				data.componentsExist = false
			}

			return data
		})

		figma.clientStorage.getAsync('preferences').then((res) => {
			figma.ui.postMessage({ ...res, componentsExist: getPluginData(figma.root, 'components').componentsExist });
		})


	})

	plugin.on('restore-component', (msg) => {
		restoreComponent(msg.component)
	})

})
