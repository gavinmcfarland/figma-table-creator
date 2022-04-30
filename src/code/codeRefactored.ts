import { getPluginData, setPluginData, updatePluginData, updateClientStorageAsync, copyPaste, removeChildren, getClientStorageAsync, ungroup, setClientStorageAsync, convertToFrame, convertToComponent, makeComponent, getNodeIndex, replace, getOverrides, nodeToObject, getPageNode, resize} from '@fignite/helpers'


function updateDocumentData(key, callback) {
	return updatePluginData(figma.root, key, callback)
}


async function getRecentFilesAsync() {
	let recentFiles = await getClientStorageAsync("recentFiles")

	// Esclude current file from list
	recentFiles = recentFiles.filter(file => {
		return !(file.id === getPluginData(figma.root, "fileId"))
	})

	return recentFiles
}

function updateDefaultTemplateData(data) {
	const defaultTemplateComponent = await lookForComponent(data)

	if (defaultTemplateComponent) {
		data.name = defaultComponent.name
	}

	return data
}

function updateRemoteFilesData(remoteFiles) {

	let recentFiles = remoteFiles ? await getRecentFilesAsync() : undefined

	remoteFiles = recentFiles

	if (remoteFiles) {

		for (var i = 0; i < remoteFiles.length; i++) {
			var file = remoteFiles[i]

			// We import the first template because all we're trying to do is update the file name in the documentData
			figma.importComponentByKeyAsync(file.templates[0].component.key).then((templateComponent) => {

				var remoteTemplateData = getPluginData(templateComponent, 'template')

				// We use updatePluginData again because it's easier than converting the outer function into an async function, otherwise we wouldn't need to do this
				updatePluginData(figma.root, 'remoteFiles', (remoteFiles) => {
					remoteFiles.map((file) => {
						if (file.id === remoteTemplateData.file.id) {
							file.name = remoteTemplateData.file.name
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
}

async function updateRemoteFilesDataAsync(remoteFiles) {

	let recentFiles = remoteFiles ? await getRecentFilesAsync() : undefined

	remoteFiles = recentFiles

	if (remoteFiles) {

		for (var i = 0; i < remoteFiles.length; i++) {
			var file = remoteFiles[i]

			// We import the first template because all we're trying to do is update the file name in the documentData
			let templateComponent = await figma.importComponentByKeyAsync(file.templates[0].component.key)

			var remoteTemplateData = getPluginData(templateComponent, 'template')

			if (file.id === remoteTemplateData.file.id) {
				file.name = remoteTemplateData.file.name
			}

		}


	}

	return remoteFiles
}

updateDocumentData('defaultTemplate', updateDefaultTemplateData)
updateDocumentData('remotefiles', updateRemoteFilesData)
