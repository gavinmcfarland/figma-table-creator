function clone(val) {
	return JSON.parse(JSON.stringify(val))
}

async function changeText(node, text) {
	await figma.loadFontAsync({ family: "Roboto", style: "Regular" })
	node.characters = text
	node.textAutoResize = "HEIGHT"
	node.layoutAlign = "STRETCH"
}

function createBorder() {
	var frame1 = figma.createComponent()
	var line1 = figma.createLine()
	frame1.resizeWithoutConstraints(0.01, 0.01)

	frame1.name = "Table Border"
	line1.constraints = {
		horizontal: "STRETCH",
		vertical: "STRETCH"
	}

	frame1.constraints = {
		horizontal: "STRETCH",
		vertical: "STRETCH"
	}

	frame1.clipsContent = false

	line1.resizeWithoutConstraints(10000, 0)

	frame1.appendChild(line1)

	return frame1
}


function createCell(topBorder, leftBorder) {

	var cell = figma.createComponent()
	var frame1 = figma.createFrame()
	var frame2 = figma.createFrame()
	var line1 = topBorder
	var line2 = leftBorder
	var text = figma.createText()

	frame2.name = "Content"

	text.layoutAlign = "STRETCH"

	changeText(text, "text")


	cell.name = "Cell"
	frame2.layoutMode = "VERTICAL"

	frame1.appendChild(line1)
	frame1.appendChild(line2)

	frame1.fills = []
	frame2.fills = []
	line1.rotation = -90
	line2.rotation = 180
	line2.x = 100

	line2.constraints = {
		horizontal: "STRETCH",
		vertical: "STRETCH"
	}

	frame1.resizeWithoutConstraints(100, 0.01)
	frame1.clipsContent = false
	frame1.layoutAlign = "STRETCH"
	frame2.layoutAlign = "STRETCH"

	frame2.horizontalPadding = 16
	frame2.verticalPadding = 16
	cell.layoutMode = "VERTICAL"

	cell.appendChild(frame1)
	cell.appendChild(frame2)
	frame2.appendChild(text)

	return cell
}

function createTable(numberColumns, numberRows) {


	var tableBorder = createBorder()
	var container = figma.createFrame()
	var cell = createCell(tableBorder.createInstance(), tableBorder.createInstance())
	var row = figma.createFrame()
	var frame1 = figma.createFrame()
	frame1.name = "[ignore]"

	var bottomBorder = tableBorder.createInstance()
	var rightBorder = tableBorder.createInstance()

	container.name = "Table"

	row.name = "Row"
	row.fills = []
	container.fills = []


	container.layoutMode = "VERTICAL"
	container.counterAxisSizingMode = "AUTO"
	row.counterAxisSizingMode = "AUTO"
	row.layoutMode = "HORIZONTAL"

	// var duplicatedCell = cell.createInstance()
	// changeText(duplicatedCell.children[1].children[0], "")
	// row.appendChild(duplicatedCell)


	// container.appendChild(row)

	for (var i = 0; i < numberColumns; i++) {
		var duplicatedCell = cell.createInstance()
		row.appendChild(duplicatedCell)
	}



	for (let i = 0; i < numberRows; i++) {
		var duplicatedRow = row.clone()
		for (let b = 0; b < numberColumns; b++) {
			changeText(duplicatedRow.children[b].children[1].children[0], "")
		}

		container.appendChild(duplicatedRow)
	}

	row.remove()


	frame1.clipsContent = false


	frame1.appendChild(bottomBorder)
	frame1.appendChild(rightBorder)

	frame1.resizeWithoutConstraints(0.01, 0.01)
	frame1.layoutAlign = "STRETCH"

	bottomBorder.constraints = { horizontal: "STRETCH", vertical: "STRETCH" }
	rightBorder.constraints = { horizontal: "MAX", vertical: "STRETCH" }

	rightBorder.rotation = 90


	container.appendChild(frame1)


	tableBorder.remove()
	cell.remove()

	return container
}

function addNewNodeToSelection(page, node) {
	page.selection = node
}

function selectColumn() {
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


var message = {
	columnCount: parseInt(figma.currentPage.getPluginData("columnCount"), 10) || 2,
	rowCount: parseInt(figma.currentPage.getPluginData("rowCount"), 10) || 2,
	remember: true
}

if (figma.currentPage.getPluginData("remember") == "true") message.remember = true
if (figma.currentPage.getPluginData("remember") == "false") message.remember = false

if (figma.command === "createTable") {
	figma.showUI(__html__);

	figma.ui.resize(282, 425)

	figma.ui.postMessage(message);

	figma.ui.onmessage = msg => {


		if (msg.type === 'create-table') {
			var table = createTable(msg.columnCount, msg.rowCount);
			figma.currentPage.setPluginData("columnCount", msg.columnCount.toString())
			figma.currentPage.setPluginData("rowCount", msg.rowCount.toString())
			figma.currentPage.setPluginData("remember", msg.remember.toString())



			if (figma.currentPage.getPluginData("remember")) {
				message.remember = (figma.currentPage.getPluginData("remember") == "true")
			}
			if (figma.currentPage.getPluginData("columnCount")) {
				message.columnCount = parseInt(figma.currentPage.getPluginData("columnCount"), 10)
			}

			if (figma.currentPage.getPluginData("rowCount")) {
				message.rowCount = parseInt(figma.currentPage.getPluginData("rowCount"), 10)
			}


			const nodes: SceneNode[] = [];
			nodes.push(table)

			figma.currentPage.selection = nodes;
			figma.viewport.scrollAndZoomIntoView(nodes);
		} else if (msg.type === 'select-columns') {

			selectColumn()
		}

		figma.closePlugin();
	};
}


if (figma.command === "selectColumn") {
	selectColumn()
	figma.closePlugin();
}
