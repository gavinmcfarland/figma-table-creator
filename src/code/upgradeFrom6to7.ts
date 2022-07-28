import { setPluginData, getPageNode, getDocumentData } from '@fignite/helpers'
import { getComponentById, positionInCenterOfViewport, removeChildren } from './helpers'
import { createTable, tableFactory, defaultRelaunchData, Template, setDefaultTemplate, updateTables } from './globals'
import { createTooltip } from './newDefaultTemplate'
import { getPluginData } from './old-helpers'

export function sleep(ms = 0) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

// // 9s for 45k nodes
// let count = 0

// async function traverseNodes() {
// 	console.log('Recursive generator method')

// 	function* processData(nodes) {
// 		const len = nodes.length
// 		if (len === 0) {
// 			return
// 		}

// 		for (var i = 0; i < len; i++) {
// 			var node = nodes[i]

// 			yield node

// 			let children = node.children

// 			if (children) {
// 				yield* processData(children)
// 			}
// 		}
// 	}

// 	var it = processData(figma.root.children)
// 	var res = it.next()

// 	let tables = []

// 	while (!res.done) {
// 		let node = res.value

// 		if (node.getPluginData('isTable') === 'true' && node.type !== 'COMPONENT') {
// 			count++
// 			tables.push(node)
// 		}

// 		res = it.next()
// 	}
// 	await sleep()
// 	figma.notify(`Updating table ${count}`, { timeout: 1 })

// 	console.log(tables)
// }

//TODO: Is it easier to ask the user to import and select their own components?

// 1. Hi, I'm tablo. My creator made me so I could help you upgrade to the shiny new version of Table Creator.
// 2. I notice you don't have a table or row component. Unfortunately you won't be able to continue using this plugin, only kidding. I just need to create some

// 1. The way table creator works is slightly different now. Instead of relying on a single cell component to create tables from. Table Creator now use a table component as a template. As part of this upgrade I'm going to hopefully successfully upgrade your existing components to work with the new version of Table Creator. Unfortunately because of the way plugins work without this making this upgrade you won't be able to continue using the plugin. You can either follow this upgrade, or start from scratch and try and link your old components.

// 2. First I'll look to see if I can find a table component. If you don't have one I'll create one for you. This will be used as the main template that new tables are created from.

// 3. Next I'll look to see if you have a row component. If you don't

// let tableInstance = createTable(getTemplateParts(templateComponent), msg.data, 'COMPONENT')

function cleanupOldPluginData() {
	let notify = figma.notify('Cleaning up old plugin data...')
	let keys = ['cellComponentID', 'cellHeaderComponentID', 'rowComponentID', 'tableComponentID']

	keys.forEach((element) => {
		figma.root.setPluginData(element, '')
	})

	notify.cancel()
}
function cleanUpOldTooltips(componentPage) {
	componentPage.findOne((node) => {
		if (
			node.characters ===
			'Customise the following components to create bespoke tables. Or to link using your own components go to Plugins > Table Creator > Settings. You can move and rename the components as you wish. The only component which must exist for the plugin to work is the Cell component.'
		) {
			node.remove()
		}
	})

	componentPage.findOne((node) => {
		if (
			node.characters ===
			'The Cell component is the only component required for Table Creator to create tables from. You can cutomise this component, or link the plugin to a different Cell component by running Plugins > Table Creator > Settings.'
		) {
			node.remove()
		}
	})

	componentPage.findOne((node) => {
		if (node.characters === 'Only layer styles such as: background, color, border radius etc will be used for rows when creating tables.') {
			node.remove()
		}
	})

	componentPage.findOne((node) => {
		if (
			node.characters ===
			`Only layer styles such as: background, color, border radius etc will be used to create tables. You don't have to create tables using the plugin. You can also create tables by creating an instance of this component and detaching them and their rows. If you change the styles used on the table or row components you can update existing tables by going to Plugins > Table Creator > Settings and select Refresh Tables`
		) {
			node.remove()
		}
	})
}
function createTemplateComponent() {
	let cellComponent = getComponentById(figma.root.getPluginData('cellComponentID'))
	// TODO: Set semantics
	setPluginData(cellComponent, `elementSemantics`, { is: 'td' })

	let headerComponent = getComponentById(figma.root.getPluginData('cellHeaderComponentID'))
	if (headerComponent) setPluginData(headerComponent, `elementSemantics`, { is: 'th' })

	let rowComponent = getComponentById(figma.root.getPluginData('rowComponentID')) || figma.createComponent()
	setPluginData(rowComponent, `elementSemantics`, { is: 'tr' })

	// Apply styling to row
	removeChildren(rowComponent)

	rowComponent.name = getComponentById(figma.root.getPluginData('rowComponentID')).name || '_Row'
	rowComponent.layoutMode = 'HORIZONTAL'
	rowComponent.primaryAxisSizingMode = 'AUTO'
	rowComponent.counterAxisSizingMode = 'AUTO'
	rowComponent.clipsContent = true

	let cellInstance1 = cellComponent.createInstance()
	let cellInstance2 = cellComponent.createInstance()

	rowComponent.appendChild(cellInstance1)
	rowComponent.appendChild(cellInstance2)

	// We need to clone it because we don't want it to affect existing components
	let tableComponent = getComponentById(figma.root.getPluginData('tableComponentID'))
	let templateComponent

	if (tableComponent) {
		templateComponent = tableComponent
	} else {
		templateComponent = figma.createComponent()
		if (getComponentById(figma.root.getPluginData('rowComponentID'))) {
			templateComponent.y = rowComponent.y + rowComponent.height + 120
			templateComponent.x = rowComponent.x
		} else {
			templateComponent.y = cellComponent.parent.y + cellComponent.height + 120
			templateComponent.x = cellComponent.x
		}
	}

	// let templateComponent = tableComponent ? tableComponent.clone() : figma.createComponent()
	setPluginData(templateComponent, `elementSemantics`, { is: 'table' })

	// Apply styling to table
	removeChildren(templateComponent)

	templateComponent.name = getComponentById(figma.root.getPluginData('tableComponentID')).name || 'Table 1'
	templateComponent.layoutMode = 'VERTICAL'
	templateComponent.primaryAxisSizingMode = 'AUTO'
	templateComponent.counterAxisSizingMode = 'AUTO'

	let rowInstance1 = rowComponent.createInstance()
	let rowInstance2 = rowComponent.createInstance()
	let rowInstance3 = rowComponent.createInstance()

	// BUG: isn't copying across layoutAlign, so we have to do it manually
	rowInstance1.layoutAlign = 'STRETCH'
	rowInstance2.layoutAlign = 'STRETCH'
	rowInstance3.layoutAlign = 'STRETCH'

	rowInstance1.primaryAxisSizingMode = 'FIXED'
	rowInstance2.primaryAxisSizingMode = 'FIXED'
	rowInstance3.primaryAxisSizingMode = 'FIXED'

	templateComponent.appendChild(rowInstance1)
	templateComponent.appendChild(rowInstance2)
	templateComponent.appendChild(rowInstance3)

	// Swap header cells
	if (headerComponent) {
		rowInstance1.children[0].swapComponent(headerComponent)
		rowInstance1.children[1].swapComponent(headerComponent)
	}

	// Remove row component if user didn't have them
	if (!getComponentById(figma.root.getPluginData('rowComponentID'))) rowComponent.remove()

	return templateComponent
}

export async function upgradeOldTablesToNewTables(templateData) {
	// figma.skipInvisibleInstanceChildren = true
	// let notify1 = figma.notify(`Updating tables...`)

	let pages = figma.root.children

	// await sleep()

	let handler = {}

	for (let p = 0; p < pages.length; p++) {
		let page = pages[p]

		console.log(`Scanning page ${p + 1} of ${pages.length}`)

		if (handler?.cancel) {
			handler.cancel()
		}

		handler = figma.notify(`Scanning page ${p + 1} of ${pages.length} for tables...`, { timeout: 1 })

		await sleep()

		// // Get all the old tables
		// let tableFrames = page.findAllWithCriteria({ types: ['FRAME'] })

		// let tables = []

		// for (let i = 0; i < tableFrames.length; i++) {
		// 	let tableFrame = tableFrames[i]

		// 	if (tableFrame.getPluginData('isTable')) {
		// 		tables.push(tableFrame)
		// 	}
		// }

		let tables = page.findAll((node) => node.getPluginData('isTable') === 'true' && node.type !== 'COMPONENT')

		for (let i = 0; i < tables.length; i++) {
			let table = tables[i]

			console.log(`Updating table ${i + 1} of ${tables.length} on page ${p + 1}`)

			if (handler?.cancel) {
				handler.cancel()
			}

			// Remove old plugin data from table
			table.setPluginData(`isTable`, '')

			// Add template details to table
			setPluginData(table, `template`, templateData)

			// Add new plugin data to table
			setPluginData(table, `elementSemantics`, { is: 'table' })

			let rows = table.findAll((node) => node.getPluginData('isRow') === 'true')

			for (let r = 0; r < rows.length; r++) {
				let row = rows[r]

				// Should not matter what type of node

				// Remove old plugin data from row
				row.setPluginData(`isRow`, '')

				// Add new plugin data to row
				setPluginData(row, `elementSemantics`, { is: 'tr' })

				let cells = row.findAll((node) => node.getPluginData('isCell') === 'true')
				let headerCells = row.findAll((node) => node.getPluginData('isHeaderCell') === 'true')

				for (let c = 0; c < cells.length; c++) {
					var cell = cells[c]

					cell.setPluginData(`isCell`, '')
					setPluginData(cell, `elementSemantics`, { is: 'td' })
				}

				for (let h = 0; h < headerCells.length; h++) {
					var headerCell = headerCells[h]

					headerCell.setPluginData(`isCellHeader`, '')
					setPluginData(headerCell, `elementSemantics`, { is: 'th' })
				}
			}
		}
	}
}

export async function upgradeOldComponentsToTemplate() {
	if (getComponentById(figma.root.getPluginData('cellComponentID'))) {
		const templateComponent = createTemplateComponent()

		// Add template data and relaunch data to templateComponent
		let templateData = new Template(templateComponent)

		await upgradeOldTablesToNewTables(templateData)

		figma.currentPage = getPageNode(templateComponent)

		setPluginData(templateComponent, 'template', templateData)
		templateComponent.setRelaunchData(defaultRelaunchData)

		setDefaultTemplate(templateData)

		let tooltip = await createTooltip(
			'Your table components have been converted into a template. A template is a single component used by Table Creator to create tables from.',
			figma.currentPage.backgrounds[0].color
		)

		tooltip.x = templateComponent.x + templateComponent.width + 80
		tooltip.y = templateComponent.y - 10

		let componentPage = getPageNode(templateComponent)
		componentPage.appendChild(tooltip)
		figma.currentPage.selection = [templateComponent, tooltip]
		figma.viewport.scrollAndZoomIntoView([templateComponent, tooltip])

		cleanUpOldTooltips(componentPage)

		cleanupOldPluginData()
	}
}
