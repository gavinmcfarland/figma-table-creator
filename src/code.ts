import { copyPasteProps, pageNode, clone, removeChildren, positionInCenter, compareVersions, loadFonts, changeText, ungroupNode, findComponentById, postMessage, onMessage, onCommand } from './helpers'
import { createDefaultComponents } from './defaultComponents'
import pkg from '../package.json';
import semver from 'semver'


const currentVersion = figma.root.getPluginData("pluginVersion")
const newVersion = pkg.version

if (figma.root.getPluginData("pluginVersion") === "") {
	// If plugin was used before new auto layout tables were supported
	if (figma.root.getPluginData("cellComponentID")) {
		figma.root.setPluginData("pluginVersion", "5.0.0")
		figma.root.setPluginData("upgradedTables", "false")
	}
	// Else if plugin never used
	else {
		figma.root.setPluginData("pluginVersion", pkg.version)
	}

}


// --------


function createNewTable(numberColumns, numberRows, cellWidth, includeHeader, usingLocalComponent, cellAlignment) {

	// Get Cell Templa
	var cell = findComponentById(figma.root.getPluginData("cellComponentID"))
	var cellHeader = findComponentById(figma.root.getPluginData("cellHeaderComponentID"))

	if (!cellHeader && includeHeader) {
		// throw "No Header Cell component found";
		figma.notify("No Header Cell component found")
		return
	}

	var rowTemplate = findComponentById(figma.root.getPluginData("rowComponentID"))
	var row = figma.createFrame()

	copyPasteProps(rowTemplate, row, { include: ['name'] })



	var tableTemplate = findComponentById(figma.root.getPluginData("tableComponentID"))
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
	var tableTemplateID = figma.root.getPluginData("tableComponentID")
	var tableTemplate = findComponentById(tableTemplateID)
	// removeChildren(tableTemplate)



	var rowTemplate = findComponentById(figma.root.getPluginData("rowComponentID"))
	// removeChildren(rowTemplate)

	// If can't find table and row templates use plain frame
	if (!tableTemplate) {
		tableTemplate = figma.createFrame()
	}

	if (!rowTemplate) {
		rowTemplate = figma.createFrame()
	}

	var cellTemplateID = figma.root.getPluginData("cellComponentID")
	var previousCellTemplateID = figma.root.getPluginData("previousCellComponentID")
	var cellTemplate = findComponentById(cellTemplateID)

	var cellHeaderTemplateID = figma.root.getPluginData("cellHeaderComponentID")
	var previousCellHeaderTemplateID = figma.root.getPluginData("previousCellHeaderComponentID")
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

								// Bug where plugin data is lost when instance swapped
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

								// Bug where plugin data is lost when instance swapped
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

function detachInstance(instance, parent) {
	if (instance.type === "INSTANCE") {
		var newInstance = figma.createFrame()

		newInstance.resize(instance.width, instance.width)

		copyPasteProps(instance, newInstance, { include: ["name", "x", "y"] })

		var length = instance.children.length

		for (var i = 0; i < length; i++) {
			newInstance.appendChild(instance.children[i].clone())
		}

		parent.appendChild(newInstance)
		// instance.remove()

		return newInstance
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

			var templateID = template + "ComponentID"

			// Make sure old templates don't have any old data on them
			var oldTemplate = findComponentById(figma.root.getPluginData(template + "ComponentID"))

			// Check if a previous template has been set first
			if (oldTemplate) {
				figma.root.setPluginData("previous" + capitalize(template) + "ComponentID", oldTemplate.id)
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

			figma.root.setPluginData(templateID, selection[0].id)

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

if (compareVersions(figma.root.getPluginData("pluginVersion"), "6.3.0") < 0) {
	var tableTemplate = findComponentById(figma.root.getPluginData("tableComponentID"))
	if (tableTemplate) {
		tableTemplate.setRelaunchData({ detachTable: 'Detaches table and rows' })
	}
}

var message = {
	componentsExist: false,
	cellExists: false,
	columnCount: parseInt(figma.root.getPluginData("columnCount"), 10) || 4,
	rowCount: parseInt(figma.root.getPluginData("rowCount"), 10) || 4,
	cellWidth: parseInt(figma.root.getPluginData("cellWidth"), 10) || 100,
	remember: true,
	includeHeader: true,
	columnResizing: true,
	upgradedTables: figma.root.getPluginData("upgradedTables") || null,
	cellAlignment: figma.root.getPluginData("cellAlignment") || "MIN",
	templates: {
		table: {
			name: figma.root.getPluginData("tableComponentName") || "",
			state: figma.root.getPluginData("tableComponentState") || null
		},
		row: {
			name: figma.root.getPluginData("rowComponentName") || "",
			state: figma.root.getPluginData("rowComponentState") || null
		},
		cell: {
			name: figma.root.getPluginData("cellComponentName") || "",
			state: figma.root.getPluginData("cellComponentState") || null
		},
		cellHeader: {
			name: figma.root.getPluginData("cellHeaderComponentName") || "",
			state: figma.root.getPluginData("cellHeaderComponentState") || null
		}
	}
}

if (figma.root.getPluginData("remember") == "true") message.remember = true
if (figma.root.getPluginData("remember") == "false") message.remember = false
if (figma.root.getPluginData("includeHeader") == "true") message.includeHeader = true
if (figma.root.getPluginData("includeHeader") == "false") message.includeHeader = false
if (figma.root.getPluginData("columnResizing") == "true") message.columnResizing = true
if (figma.root.getPluginData("columnResizing") == "false") message.columnResizing = false

// Upgrades old tables to use new Auto Layout. Could be assumed that it is no longer needed.

function upgradeTables() {

	// TODO: Add check for header cell DONE
	// TODO: Check for when no cellVariantsName can be identified DONE
	// TODO: Set plugin data so you can check if file has been upgraded to new tables DONE
	// TODO: Investigate if layout properties are supposed to be inherited by instances/variants

	// TODO: make rows in table template fill container DONE
	var tableTemplate = figma.getNodeById(figma.root.getPluginData("tableComponentID"))

	if (tableTemplate) {

		for (let i = 0; i < tableTemplate.children.length; i++) {

			var node = tableTemplate.children[i]

			if (node.getPluginData("isRow")) {
				node.layoutAlign = "STRETCH"
				node.primaryAxisSizingMode = "FIXED"
			}
		}
	}

	// Find cell templates
	var cellTemplate = figma.getNodeById(figma.root.getPluginData("cellComponentID"))
	var cellHeaderTemplate = figma.getNodeById(figma.root.getPluginData("cellHeaderComponentID"))
	var x = cellTemplate.x
	var y = cellTemplate.y
	var height = cellTemplate.height

	var array = cellTemplate.name.split("/")

	var cellName
	var cellVariantsName

	if (array.length > 1) {
		cellName = array.pop()
		cellVariantsName = array.join("/")
	}
	else {
		if (cellTemplate.name === "Cell" || cellTemplate.name === "cell") {
			cellName = "Default"
		}
		else {
			cellName = cellTemplate.name
		}

		cellVariantsName = "Table/Cell"
	}

	var nodes = []

	if (cellTemplate) {
		nodes.push(cellTemplate)
	}

	var cellHeaderName = ""
	if (cellHeaderTemplate) {
		cellHeaderName = cellHeaderTemplate.name.split("/").pop()
		nodes.push(cellHeaderTemplate)
	}

	var cellVariants = figma.combineAsVariants(nodes, pageNode(cellTemplate))

	cellVariants.x = x
	cellVariants.y = y
	cellVariants.layoutMode = "HORIZONTAL"
	cellVariants.itemSpacing = 16
	cellVariants.resize(cellVariants.width, height)
	cellVariants.name = cellVariantsName
	cellTemplate.name = "Type=" + cellName

	if (cellHeaderTemplate) {
		cellHeaderTemplate.name = "Type=" + cellHeaderName
	}



	var cells = figma.root.findAll(node => node.getPluginData("isCell") === "true")
	var headerCells = figma.root.findAll(node => node.getPluginData("isCellHeader") === "true")

	for (let i = 0; i < cells.length; i++) {
		var cell = cells[i]

		if (cell.parent?.type === "INSTANCE") {

		}
		else {
			if (cell.parent.getPluginData("isCellHeader") === "true") {
				cell.layoutAlign = "INHERIT"
				cell.primaryAxisSizingMode = "AUTO"
			}
			else {
				cell.layoutAlign = "STRETCH"
				cell.primaryAxisSizingMode = "FIXED"
			}

		}

	}

	for (let i = 0; i < headerCells.length; i++) {
		var cell = headerCells[i]

		if (cell.parent?.type === "INSTANCE") {
		}
		else {
			cell.layoutAlign = "STRETCH"
			cell.primaryAxisSizingMode = "FIXED"
		}
	}

	figma.notify("Table components upgraded")
	figma.root.setPluginData("upgradedTables", "true")
}

// Takes input like rowCount and columnCount to create table and sets plugin data to root.
function createTable(message, msg) {
	if (findComponentById(figma.root.getPluginData("cellComponentID"))) {
		message.componentsExist = true
		message.upgradedTables = figma.root.getPluginData("upgradedTables")

		if (msg.columnCount < 51 && msg.rowCount < 51) {

			var table = createNewTable(msg.columnCount, msg.rowCount, msg.cellWidth, msg.includeHeader, msg.columnResizing, msg.cellAlignment);

			if (table) {
				figma.root.setPluginData("columnCount", msg.columnCount.toString())
				figma.root.setPluginData("rowCount", msg.rowCount.toString())
				figma.root.setPluginData("cellWidth", msg.cellWidth.toString())
				figma.root.setPluginData("remember", msg.remember.toString())
				figma.root.setPluginData("includeHeader", msg.includeHeader.toString())
				figma.root.setPluginData("columnResizing", msg.columnResizing.toString())
				figma.root.setPluginData("cellAlignment", msg.cellAlignment)

				if (figma.root.getPluginData("remember")) {
					message.remember = (figma.root.getPluginData("remember") == "true")
				}

				if (figma.root.getPluginData("includeHeader")) {
					message.includeHeader = (figma.root.getPluginData("includeHeader") == "true")
				}

				if (figma.root.getPluginData("columnResizing")) {
					message.includeHeader = (figma.root.getPluginData("columnResizing") == "true")
				}


				if (figma.root.getPluginData("columnCount")) {
					message.columnCount = parseInt(figma.root.getPluginData("columnCount"), 10)
				}

				if (figma.root.getPluginData("rowCount")) {
					message.rowCount = parseInt(figma.root.getPluginData("rowCount"), 10)
				}

				if (figma.root.getPluginData("cellWidth")) {
					message.rowCount = parseInt(figma.root.getPluginData("cellWidth"), 10)
				}

				if (figma.root.getPluginData("cellAlignment")) {
					message.cellAlignment = figma.root.getPluginData("cellAlignment")
				}


				const nodes: SceneNode[] = [];
				nodes.push(table)

				positionInCenter(table)

				figma.currentPage.selection = nodes;
				// figma.viewport.scrollAndZoomIntoView(nodes);
				figma.closePlugin();


			}


		}
		else {
			figma.notify("Plugin limited to max of 50 columns and rows")
		}
	}
	else {
		message.componentsExist = false
		figma.notify("Cannot find Cell component")
	}
}

function createTableCommands(message, msg) {
	if (msg.type === "update-tables") {
		updateTables()
	}

	if (msg.type === "upgrade-tables") {
		upgradeTables()
	}

	if (msg.type === 'create-components') {

		var components = createDefaultComponents()
		figma.root.setRelaunchData({ createTable: 'Create a new table' })

		figma.root.setPluginData("cellComponentID", components.cell.id)
		figma.root.setPluginData("cellHeaderComponentID", components.cellHeader.id)
		figma.root.setPluginData("rowComponentID", components.row.id)
		figma.root.setPluginData("tableComponentID", components.table.id)

		figma.notify('Default components created')

	}

	if (msg.type === 'create-table') {
		createTable(message, msg)
	}

	if (msg.type === "link-component") {
		linkComponent(msg.template, figma.currentPage.selection)

	}

	if (msg.type === "update") {

		if (findComponentById(figma.root.getPluginData("cellComponentID"))) {

			message.componentsExist = true
			// message.cellWidth = parseInt(figma.root.getPluginData("cellWidth"), 10)
		}
		else {

			message.componentsExist = false
		}
		figma.ui.postMessage(message);
	}

	if (msg.type === "restore-component") {
		restoreComponent(msg.component)
	}
}




// block_1: {
// 	if (figma.command === "createTable") {


// 		if (findComponentById(figma.root.getPluginData("cellComponentID"))) {

// 			message.componentsExist = true

// 		}

// 		try {
// 			checkVersion()
// 		} catch (e) {
// 			figma.showUI(__uiFiles__.versionLog);

// 			figma.ui.resize(268, 504)

// 			console.error(e);
// 			figma.ui.onmessage = msg => {
// 				if (msg.type === "to-create-table") {
// 					figma.showUI(__uiFiles__.main);
// 					figma.ui.postMessage(message);
// 				}
// 				createTableCommands(message, msg)

// 			}
// 			break block_1
// 			// expected output: "Parameter is not a number!"
// 		}




// 		figma.showUI(__uiFiles__.main);

// 		figma.ui.resize(268, 504)

// 		message.type = "create-table"

// 		figma.ui.postMessage(message);

// 		figma.ui.onmessage = msg => {

// 			createTableCommands(message, msg)
// 		};
// 	}

// }


// if (compareVersions(currentVersion, newVersion) > 0) {
// 	throw 'New Version'
// }
// else {
// 	console.log("new Version")
// }

var showVersionLog = false;
var closePluginWhenDone = true;

if (semver.gte(newVersion, currentVersion)) {
	showVersionLog = true
}

function closePlugin(close?) {
	if (closePluginWhenDone || close) {
		figma.closePlugin();
	}
}

onCommand({
	'createTable': () => {
		console.log("Creating table")

		figma.showUI(__uiFiles__.main);
		figma.ui.resize(268, 504)
		postMessage('create-table', {
			showVersionLog
		})
	},
	'selectColumn': () => {
		console.log("Selecting columns")

		selectColumn()
		closePlugin()
	},
	'selectRow': () => {
		console.log("Selecting rows")

		selectRow()
		closePlugin()
	}
})



