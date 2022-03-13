import { getPageNode } from '@fignite/helpers'
import { Tween, Queue, Easing } from 'tweeno'

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
export async function lookForComponent(template) {
	// Import component first?
	// If fails, then look for it by id? What if same id is confused with local component?
	// Needs to know if component is remote?

	var component

	var localComponent = getComponentById(template.component.id)

	try {
		if (localComponent && localComponent.key === template.component.key) {
			component = localComponent
		} else {
			throw 'error'
		}
	} catch {
		console.log('get remote', localComponent)
		component = await figma.importComponentByKeyAsync(template.component.key)
	}

	return component
}
export function getComponentById(id) {
	// var pages = figma.root.children
	// var component

	// // Look through each page to see if matches node id
	// for (let i = 0; i < pages.length; i++) {

	// 	if (pages[i].findOne(node => node.id === id && node.type === "COMPONENT")) {
	// 		component = pages[i].findOne(node => node.id === id && node.type === "COMPONENT")
	// 	}

	// }

	// return component || false

	var node = figma.getNodeById(id)

	if (node) {
		if (node.parent === null || node.parent.parent === null) {
			figma.root.setPluginData('cellComponentState', 'exists')
			return false
		} else {
			figma.root.setPluginData('cellComponentState', 'removed')
			return node
		}
	} else {
		figma.root.setPluginData('cellComponentState', 'deleted')
		return null
	}
}
export function createPage(name) {
	var newPage = figma.createPage()
	newPage.name = name
	figma.currentPage = newPage
	return newPage
}
export function isVariant(node) {
	if (node.type === 'INSTANCE') {
		return node.mainComponent.parent?.type === 'COMPONENT_SET'
	}
}
export function getVariantName(node) {
	if (isVariant(node)) {
		let type = node.variantProperties?.Type || node.variantProperties?.type

		if (type) {
			return node.name + '/' + type
		} else {
			return node.name + '/' + node.mainComponent.name
		}
	} else {
		return node.name
	}
}
export function getSelectionName(node) {
	if (node) {
		if (isVariant(node)) {
			return getVariantName(node)
		} else {
			return node.name
		}
	} else {
		return undefined
	}
}
export function isInsideComponent(node: SceneNode): boolean {
	const parent = node.parent

	// Sometimes parent is null
	if (parent) {
		if (parent && parent.type === 'COMPONENT') {
			return true
		} else if (parent && parent.type === 'PAGE') {
			return false
		} else {
			return isInsideComponent(parent as SceneNode)
		}
	} else {
		return false
	}
}
export function getParentComponent(node: SceneNode) {
	const parent = node.parent

	// Sometimes parent is null
	if (parent) {
		if (parent && parent.type === 'COMPONENT') {
			return parent
		} else if (parent && parent.type === 'PAGE') {
			return false
		} else {
			return getParentComponent(parent as SceneNode)
		}
	} else {
		return false
	}
}
export function animateNodeIntoView(selection, duration?, easing?) {
	let page = getPageNode(selection[0])

	figma.currentPage = page

	// Get current coordiantes
	let origCoords = {
		...figma.viewport.center,
		z: figma.viewport.zoom,
	}

	// Get to be coordiantes
	figma.viewport.scrollAndZoomIntoView(selection)

	let newCoords = {
		...Object.assign({}, figma.viewport.center),
		z: figma.viewport.zoom,
	}

	// Reset back to current coordinates
	figma.viewport.center = {
		x: origCoords.x,
		y: origCoords.y,
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
	}

	var target = {
		...origCoords,
		update: function () {
			figma.viewport.center = { x: this.x, y: this.y }
			figma.viewport.zoom = this.z
			// console.log(Math.round(this.x), Math.round(this.y))
		},
	}

	var queue = new Queue(),
		tween = new Tween(target, settings)

	// add the tween to the queue
	queue.add(tween)

	// start the queue
	queue.start()

	let loop = setInterval(() => {
		if (queue.tweens.length === 0) {
			clearInterval(loop)
		} else {
			queue.update()
			// update the target object state
			target.update()
		}
	}, 1)
}
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
