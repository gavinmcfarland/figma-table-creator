
import { setPluginData, updatePluginData, updateClientStorageAsync, copyPaste, removeChildren, getClientStorageAsync, ungroup, setClientStorageAsync, convertToFrame, convertToComponent, makeComponent, getNodeIndex, replace, getOverrides, nodeToObject} from '@fignite/helpers'
import { clone, positionInCenter, compareVersion, changeText, findComponentById, detachInstance, copyPasteStyle, getPluginData, loadFonts, isInsideComponent, getParentComponent } from './helpers'
import { upgradeFrom6to7 } from './upgradeFrom6to7'
import { createDefaultTemplate } from './defaultTemplate'
import plugma from 'plugma'

import { Tween, Queue, Easing } from 'tweeno'

console.clear()

function isVariant(node) {
	if (node.type === "INSTANCE") {
		return node.mainComponent.parent?.type === "COMPONENT_SET"
	}

}

function getVariantName(node) {
	if (isVariant(node)) {
		let type = node.variantProperties?.Type || node.variantProperties?.type

		if (type) {
			return node.name + "/" + type
		}
		else {
			return node.name + "/" + node.mainComponent.name
		}
	}
	else {
		return node.name
	}
}

function getSelectionName(node) {
	if (node) {
		if (isVariant(node)) {
			return getVariantName(node)
		}
		else {
			return node.name
		}
	}
	else {
		return undefined
	}
}

function animateIntoView(selection, duration?, easing?) {
	// Get current coordiantes
	let origCoords = {
		...figma.viewport.center,
		z: figma.viewport.zoom
	}

	// Get to be coordiantes
	figma.viewport.scrollAndZoomIntoView(selection)

	let newCoords = {
		...Object.assign({}, figma.viewport.center),
		z: figma.viewport.zoom
	}

	// Reset back to current coordinates
	figma.viewport.center = {
		x: origCoords.x,
		y: origCoords.y
	}
	figma.viewport.zoom = origCoords.z

	var settings = {
		// set when starting tween
		from: origCoords,
		// state to tween to
		to: newCoords,
		// 2 seconds
		duration: duration || 1000,
		// repeat 2 times
		repeat: 0,
		// do it smoothly
		easing: easing || Easing.Cubic.Out,
	};

	var target = {
		...origCoords,
		update: function () {
			figma.viewport.center = { x: this.x, y: this.y }
			figma.viewport.zoom = this.z
			// console.log(Math.round(this.x), Math.round(this.y))
		}
	};

	var queue = new Queue(),
		tween = new Tween(target, settings);

	// add the tween to the queue
	queue.add(tween);

	// start the queue
	queue.start();


	let loop = setInterval(() => {
		if (queue.tweens.length === 0) {
			clearInterval(loop)
		}
		else {
			queue.update();
			// update the target object state
			target.update();
		}
	}, 1)
}








// start the update loop
// animate();
// reset
// setPluginData(figma.root, "usingRemoteTemplate", "")

// setPluginData(figma.root, "pluginVersion", "")

// setClientStorageAsync("pluginAlreadyRun", false)

// async function pluginAlreadyRun() {


// 	var oldPluginVersion = getPluginData(figma.root, "pluginVersion")
// 	var newPluginVersion = "7.0.0"
// 	if (parseFloat(oldPluginVersion) < parseFloat(newPluginVersion)) {
// 		// setPluginData(figma.root, "pluginVersion", "7.0.0")
// 		return true
// 	}

// 	if (pluginAlreadyRun) {
// 		return false
// 	}

// }

upgradeFrom6to7()


// Must pass in both the source/target and their matching main components
async function overrideChildrenChars(sourceComponentChildren, targetComponentChildren, sourceChildren, targetChildren) {
	for (let a = 0; a < targetChildren.length; a++) {
		for (let b = 0; b < sourceChildren.length; b++) {

			// If layer has children then run function again
			if (sourceComponentChildren[a].children && targetComponentChildren[a].children && targetChildren[a].children && sourceChildren[a].children) {
				overrideChildrenChars(sourceComponentChildren[a].children, targetComponentChildren[b].children, sourceChildren[b].children, targetChildren[b].children)
			}

			// If layer is a text node then check if the main components share the same name
			else if (sourceChildren[a].type === "TEXT") {
				if (sourceComponentChildren[a].name === targetComponentChildren[b].name) {
					await changeText(targetChildren[a], sourceChildren[a].characters, sourceChildren[a].fontName.style)
					// loadFonts(targetChildren[a]).then(() => {
					// 	targetChildren[a].characters = sourceChildren[a].characters
					// 	targetChildren[a].fontName.style = sourceChildren[a].fontName.style
					// })
				}
			}
		}
	}
}

async function overrideChildrenChars2(sourceChildren, targetChildren, sourceComponentChildren?, targetComponentChildren?) {
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

			await changeText(targetChildren[a], sourceChildren[a].characters, sourceChildren[a].fontName.style)
			// loadFonts(targetChildren[a]).then(() => {
			// 	targetChildren[a].characters = sourceChildren[a].characters
			// 	targetChildren[a].fontName.style = sourceChildren[a].fontName.style
			// })
			// }
		}

	}
}

async function swapInstance(target, source) {
	// await overrideChildrenChars(source.mainComponent.children, source.mainComponent.children, source.children, target.children)
	// replace(newTableCell, oldTableCell.clone())
	target.swapComponent(source.mainComponent)
	await overrideChildrenChars2(target.children, source.children, target.mainComponent.children, source.mainComponent.children)
}



let defaultRelaunchData = { detachTable: 'Detaches table and rows', spawnTable: 'Spawn a new table from this table', toggleColumnResizing: 'Use a component to resize columns or rows', toggleColumnsOrRows: 'Toggle between using columns or rows' }

// Move to helpers

const capitalize = (s) => {
	if (typeof s !== 'string') return ''
	return s.charAt(0).toUpperCase() + s.slice(1)
}

// Move to helpers
function genRandomId() {
	var randPassword = Array(10).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz").map(function (x) { return x[Math.floor(Math.random() * x.length)] }).join('');
	return randPassword
}

async function lookForComponent(template) {
	// Import component first?
	// If fails, then look for it by id? What if same id is confused with local component?
	// Needs to know if component is remote?

	var component;

	var localComponent = findComponentById(template.component.id)

	try {
		if (localComponent && localComponent.key === template.component.key) {
			component = localComponent
		}
		else {
			throw "error"
		}
	}
	catch {
		console.log("get remote", localComponent)
		component = await figma.importComponentByKeyAsync(template.component.key)
	}

	return component
}

function getTableSettings(table) {
	let rowCount = 0
	let columnCount = 0
	let usingColumnsOrRows = "rows"

	for (let i = 0; i < table.children.length; i++) {
		var node = table.children[i]
		console.log
		if (getPluginData(node, "elementSemantics")?.is === "tr") {
			rowCount++
		}
	}

	let firstRow = table.findOne((node) => getPluginData(node, "elementSemantics")?.is === "tr")
	let firstCell = firstRow.findOne((node) => getPluginData(node, "elementSemantics")?.is === "td" || getPluginData(node, "elementSemantics")?.is === "th")

	console.log("layoutDirection", firstRow.parent.layoutMode)

	if (firstRow.parent.layoutMode === "VERTICAL") {
		usingColumnsOrRows = "rows"
	}

	if (firstRow.parent.layoutMode === "HORIZONTAL") {
		usingColumnsOrRows = "columns"
	}




	for (let i = 0; i < firstRow.children.length; i++) {
		var node = firstRow.children[i]
		var cellType = getPluginData(node, "elementSemantics")?.is
		if (cellType === "td" || cellType === "th") {
			columnCount++
		}
	}

	return {
		columnCount,
		rowCount,
		columnResizing: firstRow.type === "COMPONENT" ? true : false,
		includeHeader: getPluginData(firstCell, "elementSemantics")?.is === "th" ? true : false,
		cellAlignment: "MIN",
		usingColumnsOrRows,
		cellWidth: firstCell.width
	}
}

async function toggleColumnsOrRows(selection) {

	// TODO: Change name of row to column
	// TODO: Change cell to hug height
	// TODO: Fix localise component to take account of rows or columns

	for (let i = 0; i < selection.length; i++) {
		var table = selection[i]

		let settings = getTableSettings(table)

		let firstRow = table.findOne((node) => getPluginData(node, "elementSemantics")?.is === "tr")

		// let part: any = findTemplateParts(table)

		if (settings.usingColumnsOrRows === "rows") {
			if (table.type === "COMPONENT") {
				// Change main component row
				firstRow.mainComponent.layoutMode = "VERTICAL"
			}
			else {
				// Change the table container
				firstRow.parent.layoutMode = "HORIZONTAL"

				// Change every row in table
				var r = 0
				table.findAll((node) => {
					// For each row
					if (getPluginData(node, "elementSemantics")?.is === "tr") {

						var cells = node.findAll((node) => getPluginData(node, "elementSemantics")?.is === "td" || getPluginData(node, "elementSemantics")?.is === "th")
						for (let c = 0; c < settings.columnCount; c++) {

							var cell = cells[c]
							var cellLocation = [c + 1, r + 1]

							cell.primaryAxisSizingMode = "AUTO"

							node.parent.children[c].appendChild(cell)
							node.parent.children[c].resize(cell.width, node.height)
							node.parent.children[c].layoutAlign = "STRETCH"

						}
						r = r + 1

						node.layoutMode = "VERTICAL"
						node.name = node.name.replace("Row", "Col")

						if (node.children.length === 0) {
							node.remove()
						}

					}
				})
			}
		}

		if (settings.usingColumnsOrRows === "columns") {
			var rowWidth = firstRow.parent.width

			if (table.type === "COMPONENT") {
				// Change main component row
				firstRow.mainComponent.layoutMode = "HORIZONTAL"
			}
			else {


				// Change every row in table
				var r = 0
				table.findAll((node) => {
					// For each row
					if (getPluginData(node, "elementSemantics")?.is === "tr") {


						var cells = node.findAll((node) => getPluginData(node, "elementSemantics")?.is === "td" || getPluginData(node, "elementSemantics")?.is === "th")
						for (let c = 0; c < settings.columnCount; c++) {

							var cell = cells[c]
							var cellLocation = [c + 1, r + 1]
							var colWidth;

							if (c === 0) {
								colWidth = cell.width
								console.log("columnWidth", colWidth)
							}


							// cell.primaryAxisSizingMode = "AUTO"

							if (node.parent.children[c]) {
								node.parent.children[c].appendChild(cell)
							}
							else {
								// Create row
							}







							cell.resize(colWidth, cell.height)
							cell.primaryAxisSizingMode = "FIXED"
							// cell.layoutAlign = "STRETCH"




						}

						r = r + 1

						node.layoutMode = "HORIZONTAL"
						node.counterAxisSizingMode = "AUTO"
						node.layoutGrow = 0
						node.name = node.name.replace("Col", "Row")

					}
				})

				// Change the table container
				firstRow.parent.layoutMode = "VERTICAL"

				table.findAll((node) => {
					// For each row
					if (getPluginData(node, "elementSemantics")?.is === "tr") {

						r = r + 1

						node.counterAxisSizingMode = "AUTO"
						// node.layoutGrow = 0

						var cells = node.findAll((node) => getPluginData(node, "elementSemantics")?.is === "td" || getPluginData(node, "elementSemantics")?.is === "th")

						for (let c = 0; c < settings.columnCount; c++) {

							var cell = cells[c]
							cell.layoutAlign = "STRETCH"
						}

					}
				})
			}
		}
	}

}

async function toggleColumnResizing(selection) {


	for (let i = 0; i < selection.length; i++) {
		var oldTable = selection[i]

		let settings = getTableSettings(oldTable)

		console.log("settings", settings)

		if (settings.columnResizing) {
			detachTable(selection)
		}
		else {
			settings.columnResizing = !settings.columnResizing

			let newTable = await createTableInstance(oldTable, settings)

			// copyPaste(oldTable, newTable, { include: ['x', 'y', 'name'] })

			// Loop new table and replace with cells from old table

			let rowLength = oldTable.children.length

			for (let a = 0; a < rowLength; a++) {
				let nodeA = oldTable.children[a]
				if (getPluginData(nodeA, "elementSemantics")?.is === "tr") {

					let columnLength = nodeA.children.length

					for (let b = 0; b < columnLength; b++) {
						let nodeB = nodeA.children[b]

						if (getPluginData(nodeB, "elementSemantics")?.is === "td" || getPluginData(nodeB, "elementSemantics")?.is === "th") {
							let newTableCell = newTable.children[a].children[b]
							let oldTableCell = nodeB
							await swapInstance(oldTableCell, newTableCell)
							newTableCell.resize(oldTableCell.width, oldTableCell.height)
						}
					}


				}
			}

			figma.currentPage.selection = [newTable]

			oldTable.remove()
		}

	}
}

async function spawnTable(selection, userSettings?) {

	let newSelection = []

	for (let i = 0; i < selection.length; i++) {
		var oldTable = selection[i]

		let settings = Object.assign(getTableSettings(oldTable), userSettings)


		let newTable = await createTableInstance(oldTable, settings)

		newSelection.push(newTable)

		// copyPaste(oldTable, newTable, { include: ['x', 'y', 'name'] })

		// Loop new table and replace with cells from old table

		// oldTable.remove()
	}

	let tempGroupArray = []

	for (let i = 0; i < figma.currentPage.selection.length; i++) {
		let tempClone = figma.currentPage.selection[i].clone()
		tempGroupArray.push(tempClone)
	}

	let tempGroup = figma.group(tempGroupArray, figma.currentPage.selection[0].parent)



	for (let i = 0; i < newSelection.length; i++) {
		let node = newSelection[i]
		node.x = node.x + tempGroup.width + 80
	}

	figma.currentPage.selection = newSelection

	tempGroup.remove()
}

async function createTableInstance(templateNode, preferences?) {

	// FIXME: Get it to work with parts which are not components as well

	var tableInstance = convertToFrame(templateNode.clone())

	let part = findTemplateParts(templateNode)
	// let template = () => {
	// 	if (templateNode)
	// }()



	// FIXME: Check for imported components
	// FIXME: Check all conditions are met. Is table, is row, is cell, is instance etc.

	// Let user know if a cell header can't be found
	if (preferences.includeHeader && !part.th ) {
		figma.notify("No Header Cell component found")

		// FIXME: Check for header cell sooner so table creation doesn't start
		return
	}

	var table

	if (part.table.id === templateNode.id) {
		console.log("table and container are the same thing")
		table = tableInstance

	}
	else {

		// Remove table from template
		tableInstance.findAll((node) => {
			if (getPluginData(node, "elementSemantics")?.is === "table") {
				node.remove()
			}
		})

		var tableIndex = getNodeIndex(part.table)

		// Add table back to template
		tableInstance.insertChild(tableIndex, table)

	}


	// Create first row
	var firstRow;
	var rowIndex = getNodeIndex(part.tr)
	function getRowParent() {
		var row = table.findOne((node) => getPluginData(node, "elementSemantics")?.is === "tr")

		return row.parent
	}

	var rowParent = getRowParent()

	console.log("rowParent", rowParent)


	// Remove children which are trs
	table.findAll((node) => {
		if (getPluginData(node, "elementSemantics")?.is === "tr") {
			node.remove()
		}
	})





	if (preferences.columnResizing) {
		// First row should be a component
		firstRow = convertToComponent(part.tr.clone())
		setPluginData(firstRow, "elementSemantics", {is: "tr"})
	}
	else {
		// First row should be a frame
		firstRow = convertToFrame(part.tr.clone())
		setPluginData(firstRow, "elementSemantics", { is: "tr" })
	}

	rowParent.insertChild(rowIndex, firstRow)

	// Remove children which are tds
	firstRow.findAll((node) => {
		console.log(node)
		if (getPluginData(node, "elementSemantics")?.is === "td" || getPluginData(node, "elementSemantics")?.is === "th") {

			node.remove()
		}
	})

	// Create columns in first row

	for (let i = 0; i < preferences.columnCount; i++) {
		var duplicateCell
		if (part.td.type === "COMPONENT") {
			duplicateCell = part.td.clone()
		}
		if (part.td.type === "INSTANCE") {
			duplicateCell = part.td.mainComponent.createInstance()
		}


		if (preferences.cellWidth) {
			// let origLayoutAlign = duplicateCell.layoutAlign
			duplicateCell.resizeWithoutConstraints(preferences.cellWidth, duplicateCell.height)
			// duplicateCell.layoutAlign = origLayoutAlign
		}




		setPluginData(duplicateCell, "elementSemantics", { is: "td" })
		// Figma doesn't automatically inherit this property
		duplicateCell.layoutAlign = part.td.layoutAlign
		duplicateCell.primaryAxisAlignItems = preferences.cellAlignment
		firstRow.appendChild(duplicateCell)
	}

	// Create rest of rows

	for (var i = 1; i < preferences.rowCount; i++) {
		var duplicateRow;

		if (firstRow.type === "COMPONENT") {
			duplicateRow = firstRow.createInstance()
		}
		else {
			duplicateRow = firstRow.clone()
		}

		// If using columnResizing and header swap non headers to default cells

		if (preferences.columnResizing && preferences.includeHeader) {
			for (let i = 0; i < duplicateRow.children.length; i++) {
				var cell = duplicateRow.children[i]
				// cell.swapComponent(part.th)
				// FIXME: Check if instance or main component

				cell.mainComponent = part.td.mainComponent
				setPluginData(cell, "elementSemantics", { is: "td" })
			}
		}

		rowParent.insertChild(rowIndex + 1, duplicateRow)
	}

	// Swap first row to use header cell
	if (preferences.includeHeader && part.th) {
		for (var i = 0; i < firstRow.children.length; i++) {
			var child = firstRow.children[i]
			// FIXME: Check if instance or main component

			child.swapComponent(part.th.mainComponent)
			setPluginData(child, "elementSemantics", { is: "th" })
			// child.mainComponent = part.th.mainComponent
		}
	}

	tableInstance.setRelaunchData(defaultRelaunchData)

	return tableInstance
}

async function updateTableInstances(template) {

	// FIXME: Template file name not up to date for some reason

	var tables = figma.root.findAll((node) => getPluginData(node, 'template')?.id === template.id)



	var tableTemplate = await lookForComponent(template)

	var rowTemplate = tableTemplate.findOne(node => getPluginData(node, 'elementSemantics')?.is === "tr")

	for (let b = 0; b < tables.length; b++) {

		var table = tables[b]

		// Don't apply if an instance
		if (table.type !== "INSTANCE") {
			console.log("tableTemplate", tableTemplate)
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

			table.findAll(node => {
				if (getPluginData(node, 'elementSemantics')?.is === "tr" === true && node.type !== "INSTANCE") {
					copyPasteStyle(rowTemplate, node, { exclude: ['name'] })
				}
			})

		}
	}

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

	figma.currentPage.selection = newSelection

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
	figma.currentPage.selection = newSelection

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
	let newSelection = []
	for (let i = 0; i < selection.length; i++) {
		let table = selection[i]

		if (table.type === "INSTANCE") {
			table = table.detachInstance()
		}

		table.findAll((node) => {
			if (getPluginData(node, "elementSemantics")?.is === "tr") {

				if (node.type === "INSTANCE") {
					// console.log(node.type, node.id)
					node.detachInstance()
				}
				if (node.type === "COMPONENT") {
					replace(node, convertToFrame)
				}
			}
		})

		newSelection.push(table)
	}

	figma.currentPage.selection = newSelection
}

function linkComponent(template, selection) {

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
				// updatePluginData(figma.root, 'components', (data) => { data.previous[template] = oldTemplate.id })
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
			updateClientStorageAsync('userPreferences', (data) => {
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


// Takes input like rowCount and columnCount to create table and sets plugin preferences to root.
function createTable(msg) {

	getClientStorageAsync('userPreferences').then((res) => {

		// Will only let you create a table if less than 50 columns and rows
		if (msg.columnCount < 51 && msg.rowCount < 51) {

			var template = getPluginData(figma.root, 'defaultTemplate')

			lookForComponent(template).then((templateNode) => {

				// Will input from user and create table node
				createTableInstance(templateNode, msg).then((table) => {
					// If table successfully created?
					if (table) {
						// table.setRelaunchData({})

						// Positions the table in the center of the viewport
						positionInCenter(table)

						// Makes table the users current selection
						figma.currentPage.selection = [table];

						// This updates the plugin preferences
						updateClientStorageAsync('userPreferences', (data) => {
							data.columnResizing = msg.columnResizing
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
				});
			}).catch((error) => {
				console.log("error", error)
				figma.notify("Check template component is published")
			})






			}
			else {
				figma.notify("Plugin limited to max of 50 columns and rows")
			}
	})
}

// Merge document localTemplate and merge to clientStorage as recentFiles
async function syncRecentFiles() {

	var localTemplates = getPluginData(figma.root, "localTemplates")
	console.log("localTemplates", localTemplates)

	async function findPublishedTemplates() {
		let publishedTemplates = []

		if (localTemplates && localTemplates.length > 0) {
			for (let i = 0; i < localTemplates.length; i++) {
				var template = localTemplates[i]
				var templateComponent = await lookForComponent(template)
				var status = await templateComponent.getPublishStatusAsync()

				if (status !== "UNPUBLISHED") {
					publishedTemplates.push(template)
				}

			}
		}

		if (publishedTemplates.length > 0) {
			return publishedTemplates
		}
		else {
			return false
		}

	}

	let publishedTemplates = await findPublishedTemplates()

	return updateClientStorageAsync("recentFiles", (recentFiles) => {
		recentFiles = recentFiles || []
		if (publishedTemplates) {
			if ((Array.isArray(localTemplates) && localTemplates.length > 0) && recentFiles) {

				var newFile = {
					id: getPluginData(figma.root, 'fileId'),
					name: figma.root.name,
					// TODO: I could check if template component has been published. If so then add it
					templates: publishedTemplates
				}

				// Only add file to array if unique AND contains publishedTemplates
				if ((!recentFiles.some((item) => item.id === newFile.id)) && publishedTemplates) {
					recentFiles.push(newFile)
				}
				else {
					if (publishedTemplates) {
						// Update file data
						recentFiles.map((file, i) => {
							if (file.id === getPluginData(figma.root, 'fileId')) {
								recentFiles[i] = newFile
							}
						})
					}
					else {
						// remove file from list
						recentFiles.map((file, i) => {
							if (file.id === getPluginData(figma.root, 'fileId')) {
								recentFiles.splice(i, 1);
							}
						})

					}
				}
			}

			console.log("updatedRecentFiles", recentFiles)

			return recentFiles
		}

	})
}

// This makes sure the node data
function syncTemplateData() {
	var templateNodes = figma.root.findAll((node) => getPluginData(node, 'template') && node.type === "COMPONENT")

	for (let templateNode of templateNodes) {
		updateTemplate(templateNode)
	}
}

// This makes sure the default/chosen template is up to date
async function syncDefaultTemplate() {
	var defaultTemplate = getPluginData(figma.root, 'defaultTemplate')

	// Default template doesn't exist until user creates a new template or chooses a remote one
	if (defaultTemplate) {
		var defaultComponent = await lookForComponent(defaultTemplate)

		updatePluginData(figma.root, 'defaultTemplate', (data) => {

			if (defaultComponent) {
				// data.defaultTemplate.file.name = figma.root.name
				data.name = defaultComponent.name
			}

			return data
		})
	}
}

// This makes sure the list of local and remote templates are up to date
async function syncRemoteFiles() {

	// First update file names by looking up first component of each file
	// TODO: Get remoteFiles from client storage
	// TODO: Add each file to list of document remoteFiles

	var recentFiles = await getClientStorageAsync("recentFiles")

	// console.log("recentFiles", recentFiles)

	updatePluginData(figma.root, 'remoteFiles', (remoteFiles) => {

		remoteFiles = remoteFiles || undefined

		// Update remoteFiles to match recentFiles

		// Exclude current file
		recentFiles = recentFiles.filter(d => {
			return !(d.id === getPluginData(figma.root, "fileId"))
		})

		remoteFiles = recentFiles
		// // Merge recentFiles into remoteFiles
		// if (recentFiles) {
		// 	if (!remoteFiles) remoteFiles = []
		// 	var ids = new Set(remoteFiles.map(d => d.id));
		// 	var merged = [...remoteFiles, ...recentFiles.filter(d => !ids.has(d.id))];

		// 	// Exclude current file
		// 	merged = merged.filter(d => {
		// 		return !(d.id === getPluginData(figma.root, "fileId"))
		// 	})

		// 	remoteFiles = merged
		// }


		if (remoteFiles) {


			for (var i = 0; i < remoteFiles.length; i++) {
				var file = remoteFiles[i]

				figma.importComponentByKeyAsync(file.templates[0].component.key).then((component) => {

					var remoteTemplate = getPluginData(component, 'template')

					updatePluginData(figma.root, 'remoteFiles', (remoteFiles) => {
						remoteFiles.map((file) => {
							if (file.id === remoteTemplate.file.id) {
								file.name = remoteTemplate.file.name
							}
						})
						return remoteFiles
					})

				}).catch((error) => {
					console.log(error)
					// FIXME: Do I need to do something here if component is deleted?
					// FIXME: Is this the wrong time to check if component is published?
					// figma.notify("Please check component is published")
				})

			}


		}
		return remoteFiles
	})

}

function syncLocalTemplates() {
	// Doesn't set templates, only updates them
	updatePluginData(figma.root, 'localTemplates', (templates) => {
		templates = templates || undefined
		if (templates) {
			// console.log(templates)
			for (var i = 0; i < templates.length; i++) {
				// FIXME: What happens if template can't be found? TODO: Template should be removed from list
				var componentId = templates[i].component.id
				var component = findComponentById(componentId)
				if (component) {
					templates[i] = getPluginData(component, 'template')
				}
				else {
					templates.splice(i, 1);
				}

			}
		}
		// FIXME: Fix helper. Only needed because helper will cause plugin data to be undefined if doesn't return value
		return templates
	})
}

async function importComponents(components, page?) {

	// // Loop through each component and import them
	// var frame = figma.createFrame()
	// setPluginData(frame, 'isMainComponents', true)
	// page.appendChild(frame)
	for (let [key, value] of Object.entries(components)) {
		var component = components[key]


		await figma.importComponentByKeyAsync(component.key).then((component) => {
			// console.log(component)
			var instance = component.createInstance()
			frame.appendChild(instance)
		}).catch(() => {
			console.log("Connot find component")
		})
	}
}

function updateNodeComponentsData(node, components) {
	updatePluginData(node, 'components', (data) => {
		data = data || {
			...components
		}
	})
}

function addNewTemplate(node, templates) {
	// Add template to file in list
	var newTemplateEntry = {
		id: getPluginData(node, 'template').id,
		name: getPluginData(node, 'template').name,
		component: getPluginData(node, 'template').component,
		file: getPluginData(node, 'template').file
	}

	// Only add new template if unique
	if (!templates.some((template) => template.id === newTemplateEntry.id)) {

		templates.push(newTemplateEntry)
	}

	return templates
}

function findTemplateParts(templateNode) {
	// find nodes with certain pluginData
	let elements = [
		"tr",
		"td",
		"th",
		"table"
	]
	let results = {}

	// Loop though element definitions and find them in the template
	for (let i = 0; i < elements.length; i++) {
		let elementName = elements[i]
		let part = templateNode.findOne(node => {

			let elementSemantics = getPluginData(node, 'elementSemantics')

			if (elementSemantics?.is === elementName) {
				console.log(elementSemantics)
				return true
			}
		})

		results[elementName] = part
	}

	if (!results["table"]) {
		if (getPluginData(templateNode, 'elementSemantics').is === "table") {
			results["table"] = templateNode
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

function removeElement(nodeId, element) {
	let node = figma.getNodeById(nodeId)
	let templateContainer = node.type === "COMPONENT" ? node : getParentComponent(node)

	templateContainer.findAll(node => {
		if (getPluginData(node, "elementSemantics")?.is === element) {

			if (node.type === "INSTANCE") {
				setPluginData(node.mainComponent, "elementSemantics", "")
			}
			else {
				setPluginData(node, "elementSemantics", "")
			}
		}
	})

	if (element === "table") {
		setPluginData(templateContainer, "elementSemantics", "")
	}

}

function addElement(element) {
	let node = figma.currentPage.selection[0]
	if (node.type === "INSTANCE") {
		setPluginData(node.mainComponent, "elementSemantics", {is: element})
	}
	else {
		setPluginData(node, "elementSemantics", { is: element })
	}

}

function importTemplate(nodes) {

	// TODO: Needs to work more inteligently so that it corretly adds template if actually imported from file. Try to import first, if doesn't work then it must be local. Check to see if component published also.
	// TODO: Check if already imported by checking id in list?


	// Add file to list of files used by the document

	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i]

		var isLocalButNotComponent = getPluginData(node, 'template')?.file?.id === getPluginData(figma.root, 'fileId') && node.type !== "COMPONENT"

		if (node.type === "COMPONENT" || isLocalButNotComponent) {

			if (isLocalButNotComponent) {
				node = convertToComponent(node)
			}

			markNode(node, 'table')

			node.setRelaunchData(defaultRelaunchData)

			updatePluginData(figma.root, 'localTemplates', (data) => {

				data = data || []

				data = addNewTemplate(node, data)

				return data
			})

			// figma.notify(`Imported ${node.name}`)
		}
		else {

			updatePluginData(figma.root, 'remoteFiles', (data) => {

				data = data || []

				// First get a list of files currently stored on the document

				// If new file then add to the list
				// Use when adding from same file
				// var newValue = {
				// 	id: getPluginData(figma.root, 'fileId'),
				// 	name: figma.root.name,
				// 	templates: []
				// }

				// Use when importing from another file
				var newValue = {
					id: getPluginData(figma.currentPage.selection[0], 'template').file.id,
					name: getPluginData(figma.currentPage.selection[0], 'template').file.name,
					templates: []
				}

				// Only add file to array if unique
				if (!data.some((item) => item.id === newValue.id)) {
					data.push(newValue)
				}

				for (var i = 0; i < data.length; i++) {
					var file = data[i]

					if (file.id === getPluginData(figma.currentPage.selection[0], 'template').file.id) {
						file.templates = addNewTemplate(figma.currentPage.selection[0], file.templates)
					}

				}

				return data
			})

			figma.notify(`Imported ${node.name}`)
		}

		setDefaultTemplate(getPluginData(node, 'template'))
	}
}

function markNode(node, element) {

	// Should this be split into markNode and setTemplate?

	setPluginData(node, `elementSemantics`, {
		is: element
	})

	if (element === 'table') {
		setTemplate(node)
	}
}

function setTemplate(node) {

	if (node.type === "COMPONENT") {
		setPluginData(node, "template", {
			file: {
				id: getPluginData(figma.root, 'fileId'),
				name: figma.root.name
			},
			name: node.name,
			id: genRandomId(),
			component: {
				key: node.key,
				id: node.id
			}
		})
	}
}

// Updates file name and component name for template data (currently only works with local template data)
function updateTemplate(node) {

	if (node.type === "COMPONENT") {
		updatePluginData(node, "template", (data) => {
			if (data) {
				data.file.name = figma.root.name
				data.name = node.name
			}
			return data
		})
	}
}

function setDefaultTemplate(template) {
	setPluginData(figma.root, 'defaultTemplate', template)

	// TODO: If template is remote then set flag to say user is using remote/existing template
	// setPluginData(figma.root, "usingRemoteTemplate", true)

	// await updateClientStorageAsync('userPreferences', (data) => {
	// 	console.log(template)
	// 	data.defaultTemplate = template
	// 	return data
	// })

	// FIXME: Investigate why template is undefined sometimes
	if (template?.name) {
		figma.notify(`${template.name} set as default`)
	}

	// FIXME: Consider combining into it's own function?
	figma.clientStorage.getAsync('userPreferences').then((res) => {
		figma.ui.postMessage({ ...res, defaultTemplate: getPluginData(figma.root, 'defaultTemplate'), remoteFiles: getPluginData(figma.root, 'remoteFiles'), localTemplates: getPluginData(figma.root, 'localTemplates'), fileId: getPluginData(figma.root, 'fileId') })
	})

}

async function createNewTemplate(opts) {
	let {shouldCreateNewPage} = opts

	if (shouldCreateNewPage) {
		var newPage = figma.createPage()
		newPage.name = "Table Creator"

		figma.currentPage = newPage
	}

	var components = createDefaultTemplate()

	// figma.currentPage.selection = figma.currentPage.children
	figma.viewport.scrollAndZoomIntoView(figma.currentPage.children)

	// Find templates locally
	var localTemplates = figma.root.findAll((node) => getPluginData(node, "template") && node.type === "COMPONENT")


	if (localTemplates.length > 0) {

		localTemplates.sort((a, b) => a.name - b.name)

		localTemplates.map(node => {
			console.log(node.name)
		})

		if (localTemplates[localTemplates.length - 1].name.startsWith("Table")) {
			let matches = localTemplates[localTemplates.length - 1].name.match(/\d+$/);

			console.log(matches)

			if (matches) {
				components.table.name = `Table ${parseInt(matches[0], 10) + 1}`
			}

		}
	}

	importTemplate([components.table])

	getClientStorageAsync("recentFiles").then((recentFiles) => {

		if (recentFiles) {
			// Exclude current file
			recentFiles = recentFiles.filter(d => {
				return !(d.id === getPluginData(figma.root, "fileId"))
			})
			recentFiles = (Array.isArray(recentFiles) && recentFiles.length > 0)
		}


		getClientStorageAsync("pluginAlreadyRun").then((pluginAlreadyRun) => {
			figma.clientStorage.getAsync('userPreferences').then((res) => {
				figma.ui.postMessage(
					{
						type: "create-table",
						...res,
						usingRemoteTemplate: getPluginData(figma.root, "usingRemoteTemplate"),
						defaultTemplate: getPluginData(figma.root, 'defaultTemplate'),
						remoteFiles: getPluginData(figma.root, 'remoteFiles'),
						localTemplates: getPluginData(figma.root, 'localTemplates'),
						fileId: getPluginData(figma.root, 'fileId'),
						pluginAlreadyRun: pluginAlreadyRun,
						recentFiles: recentFiles
					})

				// Shouldn't be set, but lets do it just for good measure
				setPluginData(figma.root, "usingRemoteTemplate", false)
				setClientStorageAsync("pluginAlreadyRun", true)
				syncRecentFiles()
			})
		})
	})

	return components
}

function postCurrentSelection(templateNodeId) {

	let selection



	function isInsideTemplate(node) {
		let parentComponent = node.type === "COMPONENT" ? node : getParentComponent(node)
		if ((isInsideComponent(node) || node.type === "COMPONENT") && parentComponent) {
			if (getPluginData(parentComponent, 'template') && parentComponent.id === templateNodeId) {
				return true
			}
		}
	}

	if (figma.currentPage.selection.length === 1 && isInsideTemplate(figma.currentPage.selection[0])) {
		selection = {
			element: getPluginData(figma.currentPage.selection[0], 'elementSemantics')?.is,
			name: getSelectionName(figma.currentPage.selection[0])
		}

		figma.ui.postMessage({ type: 'current-selection', selection: selection })
	}

	figma.on('selectionchange', () => {

		if (figma.currentPage.selection.length === 1 && isInsideTemplate(figma.currentPage.selection[0])) {
			console.log("selection changed")
			selection = {
				element: getPluginData(figma.currentPage.selection[0], 'elementSemantics')?.is,
				name: getSelectionName(figma.currentPage.selection[0])
			}

			figma.ui.postMessage({ type: 'current-selection', selection: selection })

		}
		else {
			figma.ui.postMessage({ type: 'current-selection', selection: undefined })
		}

	})
}

// setTimeout(() => {
syncLocalTemplates()

syncRecentFiles().then(() => {
	syncTemplateData()
	syncDefaultTemplate()

	// TODO: Sync default template: find default template and pull in latest name
	syncRemoteFiles()
})




// }, 1)

plugma((plugin) => {

	plugin.ui = {
		html: __uiFiles__.main,
		width: 268,
		height: 504
	}

	// Set default preferences
	updateClientStorageAsync('userPreferences', (data) => {
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
	updatePluginData(figma.root, 'fileId', (data) => {
		data = data || genRandomId()
		return data
	})

	plugin.command('createTable', ({ ui, data }) => {
		getClientStorageAsync("recentFiles").then((recentFiles) => {

			if (recentFiles) {
				// Exclude current file
				recentFiles = recentFiles.filter(d => {
					return !(d.id === getPluginData(figma.root, "fileId"))
				})
				recentFiles = (Array.isArray(recentFiles) && recentFiles.length > 0)
			}


			getClientStorageAsync("pluginAlreadyRun").then((pluginAlreadyRun) => {
				figma.clientStorage.getAsync('userPreferences').then((res) => {
					ui.show(
						{
							type: "create-table",
							...res,
							usingRemoteTemplate: getPluginData(figma.root, "usingRemoteTemplate"),
							defaultTemplate: getPluginData(figma.root, 'defaultTemplate'),
							remoteFiles: getPluginData(figma.root, 'remoteFiles'),
							localTemplates: getPluginData(figma.root, 'localTemplates'),
							fileId: getPluginData(figma.root, 'fileId'),
							pluginAlreadyRun: pluginAlreadyRun,
							recentFiles: recentFiles
						})
				})
			})
		})


	})

	// plugin.command('createTableInstance', () => {
	// 	var selection = figma.currentPage.selection

	// 	createTableInstance(getPluginData(selection[0], 'template'), preferences).then(() => {
	// 		figma.closePlugin("Table created")
	// 	})

	// })

	plugin.command('detachTable', () => {
		detachTable(figma.currentPage.selection)
		figma.closePlugin()
	})

	plugin.command('spawnTable', () => {
		spawnTable(figma.currentPage.selection).then(() => {
			figma.closePlugin()
		})
	})

	plugin.command('toggleColumnResizing', () => {
		toggleColumnResizing(figma.currentPage.selection).then(() => {
			figma.closePlugin()
		})
	})

	plugin.command('toggleColumnsOrRows', () => {
		toggleColumnsOrRows(figma.currentPage.selection).then(() => {
			figma.closePlugin()
		})
	})

	plugin.command('importTemplate', () => {
		var selection = figma.currentPage.selection

		if (selection.length === 1) {
			if (getPluginData(selection[0], 'isTable')) {
				importTemplate(selection)
			}
		}

		figma.closePlugin()
	})

	plugin.command('markTable', () => {
		markNode(figma.currentPage.selection[0], 'table')
		figma.closePlugin()
	})

	plugin.command('markTableData', () => {
		var selection = figma.currentPage.selection

		if (selection.length === 1) {
			setPluginData(selection[0], "isCell", true)
		}

		figma.closePlugin()
	})

	plugin.command('markTableRow', () => {

		var selection = figma.currentPage.selection

		if (selection.length === 1) {
			setPluginData(selection[0], "isRow", true)
		}

		figma.closePlugin()
	})

	plugin.command('viewNodeData', () => {
		console.log('nodeData ->', getPluginData(figma.currentPage.selection[0], 'template'))
		figma.closePlugin()
	})

	plugin.command('linkComponents', ({ ui }) => {
		figma.clientStorage.getAsync('templates').then((components) => {
			ui.show({ type: "settings", components })
		})
	})

	plugin.command('newTemplate', () => {
		createNewTemplate().then((components) => {

			components.cellSet.remove()
			components.row.remove()
			components.baseCell.remove()
			components.instances.map(instance => instance.remove())
			delete components.instances

			var tempGroup = figma.group(Object.values(components), figma.currentPage)
			positionInCenter(tempGroup)

			figma.currentPage.selection = ungroup(tempGroup, figma.currentPage)
			figma.closePlugin()
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

	plugin.command('resetRemoteData', () => {
		setPluginData(figma.root, "usingRemoteTemplate", "")
		setPluginData(figma.root, "remoteFiles", "")
		updateClientStorageAsync("recentFiles", (recentFiles) => {
			console.log("Recent files removed", recentFiles)
			setPluginData(figma.root, "remoteFiles", "")
			return undefined
		}).then(() => {
			figma.closePlugin("Remote files reset");
		})
	})

	plugin.command('resetUserPreferences', () => {
		setClientStorageAsync("userPreferences", undefined).then(() => {
			figma.closePlugin("User preferences reset");
		})
	})

	plugin.command('resetOnboarding', () => {
		setClientStorageAsync("pluginAlreadyRun", false).then(() => {
			figma.closePlugin("Onboarding flow reset");
		})
	})


	// Listen for events from UI

	plugin.on('to-create-table', (msg) => {
		figma.clientStorage.getAsync('userPreferences').then((res) => {
			plugin.ui.show({ type: "create-table", ...res, defaultTemplate: getPluginData(figma.root, 'defaultTemplate'), remoteFiles: getPluginData(figma.root, 'remoteFiles'), localTemplates: getPluginData(figma.root, 'localTemplates'), fileId: getPluginData(figma.root, 'fileId') })
		})
	})

	plugin.on('update-table-instances', (msg) => {
		updateTableInstances(msg.template).then(() => {
			figma.notify('Tables updated', { timeout: 1500})
		})
	})

	plugin.on('new-template', (msg) => {
		createNewTemplate({shouldCreateNewPage: true})
	})

	plugin.on('existing-template', (msg) => {
		figma.notify('Using remote template')
	})

	plugin.on('using-remote-template', (msg) => {
		setPluginData(figma.root, "usingRemoteTemplate", msg.usingRemoteTemplate)
	})

	plugin.on('create-table', createTable)

	plugin.on('link-component', (msg) => {
		linkComponent(msg.template, figma.currentPage.selection)
	})

	// Updates what?
	plugin.on('update', (msg) => {

		// updatePluginData(figma.root, 'components', (data) => {
		// 	if (findComponentById(getPluginData(figma.root, 'components').current?.cell?.id)) {
		// 		data.componentsExist = true
		// 	}
		// 	else {
		// 		data.componentsExist = false
		// 	}

		// 	return data
		// })

		figma.clientStorage.getAsync('preferences').then((res) => {
			figma.ui.postMessage({ ...res, componentsExist: getPluginData(figma.root, 'components').componentsExist });
		})


	})

	plugin.on('restore-component', (msg) => {
		restoreComponent(msg.component)
	})

	plugin.on('set-default-template', (msg) => {

		setDefaultTemplate(msg.template)

	})

	plugin.on('import-template', (msg) => {
		if (figma.currentPage.selection.length === 1) {
			if (getPluginData(figma.currentPage.selection[0], 'isTable')) {
				importTemplate(figma.currentPage.selection)
			}
		}

		figma.notify(`Template added`)
	})

	plugin.on('remove-element', (msg) => {
		removeElement(msg.id, msg.element)
	})

	plugin.on('add-element', (msg) => {
		addElement(msg.element)
	})

	plugin.on('edit-template', (msg) => {
		lookForComponent(msg.template).then((templateNode) => {
			// figma.viewport.scrollAndZoomIntoView([templateNode])
			animateIntoView([templateNode])
			figma.currentPage.selection = [templateNode]
			let parts = findTemplateParts(templateNode)
			let partsAsObject = {
				table: {
					name: getSelectionName(parts?.table),
					element: "table",
					id: parts?.table?.id
				},
				tr: {
					name: getSelectionName(parts?.tr),
					element: "tr",
					id: parts?.tr?.id
				},
				td: {
					name: getSelectionName(parts?.td),
					element: "td",
					id: parts?.td?.id
				},
				th: {
					name: getSelectionName(parts?.th),
					element: "th",
					id: parts?.th?.id
				}
			}

			postCurrentSelection(templateNode.id)

			figma.ui.postMessage({ type: 'template-parts', parts: partsAsObject })

		})

	})

	plugin.on('fetch-current-selection', (msg) => {
		lookForComponent(msg.template).then((templateNode) => {
			postCurrentSelection(templateNode.id)
		})


	})

	plugin.on('find-template-parts', (msg) => {
		lookForComponent(msg.template).then((templateNode) => {
			// figma.viewport.scrollAndZoomIntoView([templateNode])
			// figma.currentPage.selection = [templateNode]
			let parts = findTemplateParts(templateNode)
			let partsAsObject = {
				table: {
					name: getSelectionName(parts?.table),
					element: "table",
					id: parts?.table?.id
				},
				tr: {
					name: getSelectionName(parts?.tr),
					element: "tr",
					id: parts?.tr?.id
				},
				td: {
					name: getSelectionName(parts?.td),
					element: "td",
					id: parts?.td?.id
				},
				th: {
					name: getSelectionName(parts?.th),
					element: "th",
					id: parts?.th?.id
				}
			}
			// let selection

			// function isInsideTemplate(node) {
			// 	let parentComponent = node.type === "COMPONENT" ? node : getParentComponent(node)
			// 	console.log(parentComponent)
			// 	if ((isInsideComponent(node) || node.type === "COMPONENT") && parentComponent) {
			// 		if (getPluginData(parentComponent, 'elementSemantics')?.is === 'table') {
			// 			return true
			// 		}

			// 	}
			// }

			// if (figma.currentPage.selection.length === 1 && isInsideTemplate(figma.currentPage.selection[0])) {
			// 	selection = {
			// 		element: getPluginData(figma.currentPage.selection[0], 'elementSemantics')?.is,
			// 		name: figma.currentPage.selection[0].name
			// 	}

			// 	figma.ui.postMessage({ type: 'current-selection', selection: selection })
			// }

			// figma.on('selectionchange', () => {



			// 	if (figma.currentPage.selection.length === 1 && isInsideTemplate(figma.currentPage.selection[0])) {
			// 		console.log("selection changed")
			// 		selection = {
			// 			element: getPluginData(figma.currentPage.selection[0], 'elementSemantics')?.is,
			// 			name: figma.currentPage.selection[0].name
			// 		}

			// 		figma.ui.postMessage({ type: 'current-selection', selection: selection })

			// 	}
			// 	else {
			// 		figma.ui.postMessage({ type: 'current-selection', selection: undefined })
			// 	}

			// })


			figma.ui.postMessage({ type: 'template-parts', parts: partsAsObject })

		})

	})

})

// console.log('fileId ->', getPluginData(figma.root, 'fileId'))
// console.log('remoteFiles ->', getPluginData(figma.root, 'remoteFiles'))
// console.log('localTemplates ->', getPluginData(figma.root, 'localTemplates'))
// console.log('defaultTemplate ->', getPluginData(figma.root, 'defaultTemplate'))
// console.log('remoteFiles ->', getPluginData(figma.root, 'remoteFiles'))

getClientStorageAsync("recentFiles").then(recentFiles => {
	console.log(recentFiles)
})


// getClientStorageAsync('userPreferences').then(res => {
// 	console.log(res)
// })

// figma.on('run', ({ command, parameters }: RunEvent) => {
// 	switch (command) {
// 		case "spawnTable":
// 			spawnTable(figma.currentPage.selection, { columnCount: parameters.numCols, rowCount: parameters.numRows }).then(() => {
// 				figma.closePlugin()
// 			})
// 			break
// 	}
// })
