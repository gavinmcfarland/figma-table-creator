
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

const capitalize = (s) => {
	if (typeof s !== 'string') return ''
	return s.charAt(0).toUpperCase() + s.slice(1)
}

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

	var localComponent = findComponentById(template.component.id)

	try {
		if (localComponent && localComponent.key === template.component.key) {
			component = localComponent
		}
	}
	catch {
		component = await figma.importComponentByKeyAsync(template.component.key)
	}

	return component
}

async function toggleColumnResizing(selection) {
	function getTableSettings(table) {
		let rowCount = 0
		let columnCount = 0

		for (let i = 0; i < table.children.length; i++) {
			var node = table.children[i]
			console.log
			if (getPluginData(node, "elementSemantics")?.is === "tr") {
				rowCount++
			}
		}

		let firstRow = table.findOne((node) => getPluginData(node, "elementSemantics")?.is === "tr")

		let firstCell = firstRow.findOne((node) => getPluginData(node, "elementSemantics")?.is === "td" || getPluginData(node, "elementSemantics")?.is === "th")


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
			cellAlignment: "MIN"
		}
	}

	for (let i = 0; i < selection.length; i++) {
		var oldTable = selection[i]

		let settings = getTableSettings(oldTable)

		settings.columnResizing = !settings.columnResizing

		// FIXME: Should use current node as the template
		let newTable = await createTableInstance(oldTable, settings)

		// copyPaste(oldTable, newTable, { include: ['x', 'y', 'name'] })

		// Loop new table and replace with cells from old table

		oldTable.remove()
	}
}

async function createTableInstance(templateNode, preferences?) {

	// FIXME: Get it to work with parts which are not components as well

	let part = findTemplateParts(templateNode)

	console.log(part)

	// FIXME: Check for imported components
	// FIXME: Check all conditions are met. Is table, is row, is cell, is instance etc.

	// Let user know if a cell header can't be found
	if (preferences.includeHeader && !part.th ) {
		figma.notify("No Header Cell component found")

		// FIXME: Check for header cell sooner so table creation doesn't start
		return
	}

	var tableInstance = part.table.createInstance().detachInstance()

	// Remove children which are trs
	tableInstance.findAll((node) => {
		if (getPluginData(node, "elementSemantics")?.is === "tr") {
			node.remove()
		}
	})

	// Create first row
	var firstRow;

	if (preferences.columnResizing) {
		firstRow = part.tr.clone()
	}
	else {
		firstRow = part.tr.createInstance().detachInstance()
	}

	tableInstance.appendChild(firstRow)

	// Remove children which are tds
	firstRow.findAll((node) => {
		if (getPluginData(node, "elementSemantics")?.is === "td") {
			node.remove()
		}
	})

	// Create columns in first row

	for (let i = 0; i < preferences.columnCount; i++) {
		var duplicateCell = part.td.createInstance()
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

		tableInstance.appendChild(duplicateRow)
	}

	// Swap first row to use header cell
	if (preferences.includeHeader && part.th) {
		for (var i = 0; i < firstRow.children.length; i++) {
			var child = firstRow.children[i]
			child.swapComponent(part.th)
		}
	}

	// If using columnResizing and header swap non headers to default cells

	if (preferences.columnResizing && preferences.includeHeader) {
		for (let i = 0; i < tableInstance.children.length; i++) {
			var row = tableInstance.children[i]

			// Don't swap the first one
			if (i > 0) {
				for (let i = 0; i < row.children.length; i++) {
					var cell = row.children[i]
					// cell.swapComponent(part.th)
					cell.mainComponent = part.td
				}
			}
		}
	}

	return tableInstance
}

async function updateTableInstances(template) {

	// FIXME: Template file name not up to date for some reason

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

			var template = getPluginData(figma.root, 'defaultTemplate')

			lookForComponent(template).then((templateNode) => {
				// Will input from user and create table node
				createTableInstance(templateNode, msg).then((table) => {
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
			}).catch((error) => {
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
	return updateClientStorageAsync("recentFiles", (recentFiles) => {
		recentFiles = recentFiles || []

		var localTemplates = getPluginData(figma.root, "localTemplates")
		// console.log("localTemplates", localTemplates)
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

	// console.log("recentFiles", recentFiles)

	updatePluginData(figma.root, 'remoteFiles', (remoteFiles) => {

		remoteFiles = remoteFiles || undefined

		// Merge recentFiles into remoteFiles
		if (recentFiles) {
			if (!remoteFiles) remoteFiles = []
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
		"th"
	]
	let results = {}

	if (getPluginData(templateNode, 'elementSemantics').is === "table") {
		results["table"] = templateNode
	}

	// Loop though element definitions and find them in the template
	for (let i = 0; i < elements.length; i++) {
		let elementName = elements[i]
		let part = templateNode.findOne(node => {

			let elementSemantics = getPluginData(node, 'elementSemantics')

			if (elementSemantics?.is === elementName) {
				return true
			}
		})

		results[elementName] = part
	}

	// For instances assign the mainComponent as the part
	for (let [key, value] of Object.entries(results)) {
		if (value.type === "INSTANCE") {
			results[key] = value.mainComponent
		}
	}

	return results
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
		setPluginData(figma.root, "usingRemoteTemplate", false)
		syncRecentFiles().then(() => {
			figma.closePlugin('New template created')
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

	plugin.command('toggleColumnResizing', () => {
		toggleColumnResizing(figma.currentPage.selection).then(() => {
			figma.closePlugin()
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
		// Shouldn't be set, but lets do it just for good measure
		setPluginData(figma.root, "usingRemoteTemplate", false)
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

})

// console.log('fileId ->', getPluginData(figma.root, 'fileId'))
// console.log('remoteFiles ->', getPluginData(figma.root, 'remoteFiles'))
// console.log('localTemplates ->', getPluginData(figma.root, 'localTemplates'))
console.log('defaultTemplate ->', getPluginData(figma.root, 'defaultTemplate'))


// getClientStorageAsync('userPreferences').then(res => {
// 	console.log(res)
// })


