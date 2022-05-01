import { getComponentById } from './helpers'
import { createTable } from './globals'

//TODO: Is it easier to ask the user to import and select their own components?

// 1. Hi, I'm tablo. My creator made me so I could help you upgrade to the shiny new version of Table Creator.
// 2. I notice you don't have a table or row component. Unfortunately you won't be able to continue using this plugin, only kidding. I just need to create some

// 1. The way table creator works is slightly different now. Instead of relying on a single cell component to create tables from. Table Creator now use a table component as a template. As part of this upgrade I'm going to hopefully successfully upgrade your existing components to work with the new version of Table Creator. Unfortunately because of the way plugins work without this making this upgrade you won't be able to continue using the plugin. You can either follow this upgrade, or start from scratch and try and link your old components.

// 2. First I'll look to see if I can find a table component. If you don't have one I'll create one for you. This will be used as the main template that new tables are created from.

// 3. Next I'll look to see if you have a row component. If you don't

// let tableInstance = createTable(getTemplateParts(templateComponent), msg.data, 'COMPONENT')

export function upgradeFrom6to7() {
	function findUsersExisitingComponents() {
		return {
			table: getComponentById(figma.root.getPluginData('tableComponentID')),
			tr: getComponentById(figma.root.getPluginData('rowComponentID')),
			td: getComponentById(figma.root.getPluginData('cellComponentID')),
			th: getComponentById(figma.root.getPluginData('cellHeaderComponentID')),
		}
	}

	const usersExistingComponents = findUsersExisitingComponents()

	let newComponents = Object.assign({}, usersExistingComponents) as any

	console.log(usersExistingComponents)

	if (usersExistingComponents.td) {
		if (!usersExistingComponents.table) {
			console.log('no table')

			let tableComponent = createTable(
				usersExistingComponents,
				{
					columnCount: 2,
					rowCount: 3,
					cellWidth: 100,
					remember: true,
					includeHeader: true,
					columnResizing: true,
					cellAlignment: 'MIN',
				},
				'COMPONENT'
			)

			console.log('tableComponent', tableComponent)
		}
		// if (!usersExistingComponents.table) {
		// 	newComponents.table = figma.createComponent()
		// 	newComponents.table.name = 'Table'

		// 	// Leave a note to let user know how it works now
		// } else {
		// 	newComponents.table = usersExistingComponents.table
		// }

		// if (!usersExistingComponents.tr) {
		// 	newComponents.tr = figma.createComponent()
		// 	newComponents.tr.name = 'Row'
		// 	// Add auto layout

		// 	// Add cells to row component
		// 	newComponents.tr.appendChild(newComponents.td.createInstance())
		// 	newComponents.tr.appendChild(newComponents.td.createInstance())

		// 	var rowInstance = newComponents.tr.createInstance()

		// 	// Add row instance to table component
		// 	newComponents.table.appendChild(rowInstance)
		// } else {
		// 	newComponents.tr = usersExistingComponents.tr
		// }
	}

	// Need to set templateData on the users existing components
	// If they don't have a table template then I need to create one
	// Import user's old template component as a new template
	// Tidy up data on the users template by removing old pluginData
}
