// export getClientStorageAsync(array) {
// 	return []
// }
export function unique(array, value) {
	return array.length === 0 || !array.some((item) => item.id === value)
}
export async function getPublishedComponents(array) {
	let publishedComponent = []

	if (array && array.length > 0) {
		for (let i = 0; i < array.length; i++) {
			var component = array[i]
			var status = await component.getPublishStatusAsync()

			if (status !== 'UNPUBLISHED') {
				publishedComponent.push(component)
			}
		}
	}

	if (publishedComponent.length > 0) {
		return publishedComponent
	} else {
		return false
	}
}
export function setDocumentData(key, data) {}
export function getDocumentData(key) {}
export function getComponent(id) {}
export function createPage(name) {
	var newPage = figma.createPage()
	newPage.name = name
	figma.currentPage = newPage
	return newPage
}
export function animateNodeIntoView() {}
export function selectAndZoomIntoView(nodes) {
	figma.currentPage.selection = nodes
	figma.viewport.scrollAndZoomIntoView(nodes)
}
export function positionInCenterOfViewport(node) {}
export function genRandomId() {
	var randPassword = Array(10)
		.fill('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
		.map(function (x) {
			return x[Math.floor(Math.random() * x.length)]
		})
		.join('')
	return randPassword
}
