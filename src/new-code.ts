import plugma from 'plugma'

function setDocumentData(key, data) {}
function getDocumentData(key) {}
function getComponent(id) {}
function createPage(name) {
	var newPage = figma.createPage()
	newPage.name = name
	figma.currentPage = newPage
	return newPage
}
function animateNodeIntoView() {}
function selectAndZoomIntoView(nodes) {}
function positionInCenterOfViewport(node) {}

function newFile() {}
function addTemplateToFile() {
	newFile()
	addTemplate()
}
function removeTemplateFromFile() {}

function createDefaultComponents() {
	return {
		templateComponent
	}
}
function incrementNameNumerically(node) {}
function fetchTemplateParts() {}
function setTemplateData(node) {}
function importTemplate(node) {
	// If (isLocalNonComponent OR component)
	// If not component then convert to component
	// If remote then add to remote files
	// If file component is from doesn't exist in remote files then create new file
	addTemplateToFile()
	setDefaultTemplate(templateData)
	setSemantics()
	node.setRelaunchData()
	figma.notify(`Imported ${node.name}`)
	return templateData
}
function createTableInstance(templateComponent, userPreferences) {}

function getUserPreferencesAsync() {
	getRecentFilesAsync()
}
function syncRecentFiles() {}
function getRecentFilesAsync() {}

// Commands

function detachTable() {}
function spawnTable() {}
function toggleColumnResizing() {}
function switchColumnsOrRows() {}
function selectColumns() {}
function selectRows() {}

plugma((plugin) => {

	plugin.ui = {
		html: __uiFiles__.main,
		width: 268,
		height: 504
	}

	// Received messages
	function newTemplateComponent(opts?) {

		let { shouldCreatePage } = opts

		if (shouldCreatePage) createPage('Table Creator')

		const { templateComponent } = createDefaultComponents()

		importTemplate(templateComponent)

		incrementNameNumerically(templateComponent)
		selectAndZoomIntoView([templateComponent])

	}

	function editTemplateComponent() {
		getComponent()
		animateNodeIntoView()
		fetchTemplateParts()
		plugin.post('current-selection')
	}

	function setDefaultTemplate(templateData) {
		plugin.post('default-template', () => { defaultTemplate: templateData })
		figma.notify(`${templateData.name} set as default`)
	}

	function refreshTables() {
		getAllTableInstances()
	}

	async function createTable(msg) {
		const defaultTemplate = getDocumentData('defaultTemplate')
		const userPreferences = await getUserPreferencesAsync()
		const templateComponent = await getComponent(defaultTemplate.id)

		createTableInstance(templateComponent, userPreferences).then((tableInstance) => {

			positionInCenterOfViewport(tableInstance)

			updateClientStorageAsync('userPreferences', (data) => Object.assign(data, msg)).then(
				figma.closePlugin('Table created')
			)

		}).catch()
	}

	plugin.command('createTable', () => {
		// Show table UI
	})
	plugin.command('detachTable', detachTable)
	plugin.command('spawnTable', spawnTable)
	plugin.command('toggleColumnResizing', toggleColumnResizing)
	plugin.command('switchColumnsOrRows', switchColumnsOrRows)
	plugin.command('selectColumns', selectColumns)
	plugin.command('selectRows', selectRows)

	plugin.command('newTemplate', newTemplateComponent)
	plugin.command('importTemplate', importTemplate)

	plugin.on('new-template', newTemplateComponent)
	plugin.on('edit-template', editTemplateComponent)
	plugin.on('set-default-template', setDefaultTemplate)
	plugin.on('set-semantics', () => {})

	plugin.on('create-table', createTable)
	plugin.on('refresh-tables', refreshTables)

	plugin.on('save-user-preferences', () => {})
	plugin.on('fetch-template-part', () => {})
	plugin.on('fetch-current-selection', () => {})
})
