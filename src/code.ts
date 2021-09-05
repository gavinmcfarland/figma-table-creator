
import { setPluginData, updatePluginData, updateClientStorageAsync, copyPaste, removeChildren, getClientStorageAsync, ungroup, setClientStorageAsync} from '@figlets/helpers'
import { clone, positionInCenter, compareVersion, changeText, findComponentById, detachInstance, copyPasteStyle, getPluginData } from './helpers'
import { createDefaultTemplate } from './defaultTemplate'
import plugma from 'plugma'

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

// Move to helpers
function convertToComponent(node) {
	const component = figma.createComponent()
	if (node.type === "INSTANCE") {
		node = node.detachInstance()
	}
	component.resizeWithoutConstraints(node.width, node.height)
	for (const child of node.children) {
		component.appendChild(child)
	}
	copyPaste(node, component)

	node.remove()

	return component
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
	try {
		component = await figma.importComponentByKeyAsync(template.component.key)
	}
	catch {
		component = findComponentById(template.component.id)
	}

	return component
}

async function createTableInstance(template, preferences) {

	// FIXME: Check for imported components
	// FIXME: Check all conditions are met. Is table, is row, is cell, is instance etc.

	// Find table component

	var component = await lookForComponent(template)
	console.log(component)
	console.log(component.findOne(node => node.getPluginData('isCell')))
		// findComponentById(template.component.id)

	var headerCellComponent = component.findOne(node => node.getPluginData('isCell')).mainComponent.parent.findOne(node => node.getPluginData('isCellHeader'));

	if (preferences.includeHeader && !headerCellComponent) {
		figma.notify("No Header Cell component found")

		// FIXME: Check for header cell sooner so table creation doesn't start
		return
	}


	var table = component.createInstance().detachInstance()


	// Find templates and hoist them so that don't get deleted when removing other children of table
	var rowTemplate = table.findOne(node => node.getPluginData('isRow'))

	if (rowTemplate.type === "INSTANCE") {
		rowTemplate = rowTemplate.detachInstance();
	}


	figma.currentPage.appendChild(rowTemplate)
	var cellTemplate = rowTemplate.findOne(node => node.getPluginData('isCell'));


	// FIXME: Add check to see if cell node is instance?

	var cellComponent = rowTemplate.findOne(node => node.getPluginData('isCell'));

	if (cellComponent.type === "INSTANCE") {
		cellComponent = cellComponent.mainComponent
	}


	figma.currentPage.appendChild(cellTemplate)

	// if (headerCellTemplate) figma.currentPage.appendChild(headerCellTemplate)

	table.findAll(node => {
		if (node.getPluginData('isRow')) node.remove()
	});

	rowTemplate.findAll(node => {
		if (node.getPluginData('isCell')) node.remove()
	});

	// Adds children back to template
	table.insertChild(0, rowTemplate)
	rowTemplate.insertChild(0, cellTemplate)

	if (preferences.columnResizing) {
		// Turn first row (rowTemplate) into component
		var rowTemplateComponent = figma.createComponent()
		copyPaste(rowTemplate, rowTemplateComponent)
		rowTemplateComponent.insertChild(0, cellTemplate)
		var oldRowTemplate = rowTemplate
		rowTemplate = rowTemplateComponent
		table.appendChild(rowTemplate)
		oldRowTemplate.remove()
	}

	for (var i = 1; i < preferences.columnCount; i++) {
		var duplicateCell = cellTemplate.clone()
		duplicateCell.primaryAxisAlignItems = preferences.cellAlignment
		rowTemplate.appendChild(duplicateCell)
	}

	for (var i = 1; i < preferences.rowCount; i++) {
		var duplicateRow;

		if (rowTemplate.type === "COMPONENT") {
			duplicateRow = rowTemplate.createInstance()
		}
		else {
			duplicateRow = rowTemplate.clone()
		}

		table.appendChild(duplicateRow)
	}

	if (preferences.includeHeader && headerCellComponent) {
		for (var i = 0; i < rowTemplate.children.length; i++) {
			var child = rowTemplate.children[i]
			child.swapComponent(headerCellComponent)
		}
	}


	if (preferences.columnResizing) {
		for (let i = 0; i < table.children.length; i++) {
			var row = table.children[i]

			if (i > 0) {
				for (let i = 0; i < row.children.length; i++) {
					var cell = row.children[i]

					cell.mainComponent = cellComponent
				}
			}
		}
	}

	return table
}

async function createNewTable(numberColumns, numberRows, cellWidth, includeHeader, usingLocalComponent, cellAlignment) {

	var cell, cellHeader, rowTemplate, tableTemplate;

	if (getPluginData(figma.root, 'components').componentsRemote == true) {
		var components = getPluginData(figma.root, 'components').current

		cell = await figma.importComponentByKeyAsync(components.cell.key)
		cellHeader = await figma.importComponentByKeyAsync(components.cellHeader.key)
		rowTemplate = await figma.importComponentByKeyAsync(components.row.key)
		tableTemplate = await figma.importComponentByKeyAsync(components.table.key)
	}
	else {
		cell = findComponentById(getPluginData(figma.root, 'components').current.cell.id)
		cellHeader = findComponentById(getPluginData(figma.root, 'components').current.cellHeader.id)
		rowTemplate = findComponentById(getPluginData(figma.root, 'components').current.row.id)
		tableTemplate = findComponentById(getPluginData(figma.root, 'components').current.table.id)
	}


	if (!cellHeader && includeHeader) {
		// throw "No Header Cell component found";
		figma.notify("No Header Cell component found")
		return
	}

	var table = figma.createFrame()
	var row = figma.createFrame()

	copyPasteStyle(rowTemplate, row, { include: [ 'name' ] })
	copyPasteStyle(tableTemplate, table, { include: ['name'] })


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





async function updateTableInstances(template) {

	// Template file name not up to date for some reason

	var tables = figma.root.findAll((node) => getPluginData(node, 'template')?.id === template.id)



	var tableTemplate = await lookForComponent(template)

	var rowTemplate = tableTemplate.findOne(node => node.getPluginData('isRow'))

	for (let b = 0; b < tables.length; b++) {

		var table = tables[b]

		// Don't apply if an instance
		if (table.type !== "INSTANCE") {
			console.log("tableTemplate", tableTemplate)
			copyPasteStyle(tableTemplate, table, { include: ['name'] })

			for (let x = 0; x < table.children.length; x++) {
				var row = table.children[x]

				if (getPluginData(row, "isRow") === true && row.type !== "INSTANCE") {
					copyPasteStyle(rowTemplate, row, { include: ['name'] })
				}

				// // Only need to loop through cells if has been changed by user
				// if (row.children && getPluginData(row, "isRow") === true) {
				// 	for (let k = 0; k < row.children.length; k++) {
				// 		var cell = row.children[k]
				// 	}
				// }
			}

		}
	}

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

				// Will input from user and create table node
				createTableInstance(getPluginData(figma.root, 'defaultTemplate'), msg).then((table) => {
					// If table successfully created?
					if (table) {
						table.setRelaunchData({})

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






			}
			else {
				figma.notify("Plugin limited to max of 50 columns and rows")
			}
	})
}



// function addTemplateToFiles(template, files) {

// 	var newFile = {
// 		id: template.file.id,
// 		name: template.file.name,
// 		templates: [template]
// 	}

// 	// Only add file to array if unique
// 	if (!files.some((item) => item.id === newFile.id)) {
// 		files.push(newFile)
// 	}

// 	// for (var i = 0; i < recentFiles.length; i++) {
// 	// 	var file = recentFiles[i]

// 	// 	if (file.id === getPluginData(template.file.id) {
// 	// 		file.templates = addNewTemplate(figma.currentPage.selection[0], file.templates)
// 	// 	}

// 	// }

// 	return files
// }

// setClientStorageAsync("recentFiles", undefined)

// Merge document localTemplate and merge to clientStorage as recentFiles
async function syncRecentFiles() {
	return updateClientStorageAsync("recentFiles", (recentFiles) => {
		recentFiles = recentFiles || []

		var localTemplates = getPluginData(figma.root, "localTemplates")
		console.log("localTemplates", localTemplates)
		if ((Array.isArray(localTemplates) && localTemplates.length > 0) && recentFiles) {
			var newFile = {
				id: getPluginData(figma.root, 'fileId'),
				name: figma.root.name,
				templates: localTemplates
			}

			// Only add file to array if unique
			if (!recentFiles.some((item) => item.id === newFile.id)) {
				recentFiles.push(newFile)
			}
		}

		return recentFiles
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

	var defaultComponent = await lookForComponent(defaultTemplate)

	updatePluginData(figma.root, 'defaultTemplate', (data) => {

		if (defaultComponent) {
			// data.defaultTemplate.file.name = figma.root.name
			data.name = defaultComponent.name
		}

		return data
	})
}

// This makes sure the list of local and remote templates are up to date
async function syncRemoteFiles() {

	// First update file names by looking up first component of each file
	// TODO: Get remoteFiles from client storage
	// TODO: Add each file to list of document remoteFiles

	var recentFiles = await getClientStorageAsync("recentFiles")

	console.log("recentFiles", recentFiles)

	updatePluginData(figma.root, 'remoteFiles', (remoteFiles) => {

		remoteFiles = remoteFiles || []

		// Merge recentFiles into remoteFiles
		if (remoteFiles && recentFiles) {
			var ids = new Set(remoteFiles.map(d => d.id));
			var merged = [...remoteFiles, ...recentFiles.filter(d => !ids.has(d.id))];

			// Exclude current file
			merged = merged.filter(d => {
				return !(d.id === getPluginData(figma.root, "fileId"))
			})

			remoteFiles = merged
		}


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

				}).catch(() => {
					// FIXME: Do I need to do something here if component is deleted?
					// FIXME: Is this the wrong time to check if component is published?
					// figma.notify("Please check component is published")
				})

			}

			// FIXME: Fix helper. Only needed because helper will cause plugin data to be undefined if doesn't return value
			return remoteFiles
		}
	})

}

function syncLocalTemplates() {
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

async function syncComponentsToStorage() {

	// TODO: Find a way to check the files these components link to exist and if not remove them from storage

	return updateClientStorageAsync('templates', (data) => {
		data = data || []


		if (findComponentById(getPluginData(figma.root, 'components').current?.cell?.id)) {

			updatePluginData(figma.root, 'components', (components) => {
				components.componentsExist = true
				return components
			})

			var newValue = {
				id: getPluginData(figma.root, 'documentId'),
				name: figma.root.name,
				set: getPluginData(figma.root, 'components').current,
				published: 'false'
			}

			// Only add to array if unique
			if (!data.some((item) => item.id === newValue.id)) {
				data.push(newValue)
			}
		}
		else {
			updatePluginData(figma.root, 'components', (components) => {
				components.componentsExist = false
				return components
			})

			// Remove any entries which no longer exist
			if (getPluginData(figma.root, 'documentId')) {
				data = data.filter(item => item.id !== getPluginData(figma.root, 'documentId'))
			}
		}

		return data
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

			updatePluginData(figma.root, 'localTemplates', (data) => {
				data = data || []

				data = addNewTemplate(node, data)

				return data
			})

			figma.notify(`Imported ${node.name}`)
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

	const capitalize = (s) => {
		if (typeof s !== 'string') return ''
		return s.charAt(0).toUpperCase() + s.slice(1)
	}

	setPluginData(node, `is${capitalize(element)}`, true)

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

	updatePluginData(figma.root, 'components', (data) => {
		data = data || {
			componentsExist: false,
			current: {},
			previous: {}
		}

		return data
	})

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

	// Look for any components in file and update component settings and add to storage
	// syncComponentsToStorage().then((res) => {
	// 	console.log(res)
	// })

	plugin.command('createTable', ({ ui, data }) => {
		getClientStorageAsync("pluginAlreadyRun").then((pluginAlreadyRun) => {
			figma.clientStorage.getAsync('userPreferences').then((res) => {
				ui.show({ type: "create-table", ...res, usingRemoteTemplate: getPluginData(figma.root, "usingRemoteTemplate"), defaultTemplate: getPluginData(figma.root, 'defaultTemplate'), remoteFiles: getPluginData(figma.root, 'remoteFiles'), localTemplates: getPluginData(figma.root, 'localTemplates'), fileId: getPluginData(figma.root, 'fileId'), pluginAlreadyRun: pluginAlreadyRun })
			})
		})

	})

	// plugin.command('createTableInstance', () => {
	// 	var selection = figma.currentPage.selection

	// 	createTableInstance(getPluginData(selection[0], 'template'), preferences).then(() => {
	// 		figma.closePlugin("Table created")
	// 	})

	// })

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
		var components = createDefaultTemplate()

		// markNode(components.table, 'table')

		importTemplate([components.table])

		var tempGroup = figma.group(Object.values(components), figma.currentPage)
		positionInCenter(tempGroup)

		figma.currentPage.selection = ungroup(tempGroup, figma.currentPage)

		figma.closePlugin('New template created')
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
			figma.closePlugin("Remote files removed");
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
		var components = createDefaultTemplate()

		// markNode(components.table, 'table')

		importTemplate([components.table])

		// setDefaultTemplate(getPluginData(components.table, 'template'))

		figma.notify('New template created')

		setClientStorageAsync("pluginAlreadyRun", true)
		syncRecentFiles()

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

		updatePluginData(figma.root, 'components', (data) => {
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

	plugin.on('set-components', (msg) => {

		// Update components used by this file
		updatePluginData(figma.root, 'components', (data) => {

			if (msg.components === 'selected') {
				data.current = getPluginData(figma.currentPage.selection[0], 'components')
			}
			else {
				data.current = msg.components
			}

			data.componentsExist = true
			data.componentsRemote = true

			return data
		})

		figma.notify('Components set')
	})

	plugin.on('set-default-template', (msg) => {

		setDefaultTemplate(msg.template)

		// // FIXME: Consider combining into it's own function?
		// figma.clientStorage.getAsync('userPreferences').then((res) => {
		// 	figma.ui.postMessage({ ...res, defaultTemplate: getPluginData(figma.root, 'defaultTemplate'), remoteFiles: getPluginData(figma.root, 'remoteFiles'), localTemplates: getPluginData(figma.root, 'localTemplates'), fileId: getPluginData(figma.root, 'fileId') })
		// })

	})

	plugin.on('import-template', (msg) => {
		if (figma.currentPage.selection.length === 1) {
			if (getPluginData(figma.currentPage.selection[0], 'isTable')) {
				importTemplate(figma.currentPage.selection)
			}
		}

		figma.notify(`Template added`)
	})

})

// console.log('fileId ->', getPluginData(figma.root, 'fileId'))
// console.log('remoteFiles ->', getPluginData(figma.root, 'remoteFiles'))
// console.log('localTemplates ->', getPluginData(figma.root, 'localTemplates'))


// getClientStorageAsync('userPreferences').then(res => {
// 	console.log(res)
// })


