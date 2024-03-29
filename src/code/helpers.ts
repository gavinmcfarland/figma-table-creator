import { getPageNode, copyPaste } from '@fignite/helpers'
import { Tween, Queue, Easing } from 'tweeno'

// export function getOverriddenProps(node) {
// 	let overriddenProps = {}
// 	let overrides = node.overrides
// 	for (let i = 0; i < overrides.length; i++) {
// 		let nodeEntry = overrides[i]

// 		if (nodeEntry.id === node.id) {
// 			for (let i = 0; nodeEntry.overriddenFields.length; i++) {
// 				let field = nodeEntry.overriddenFields[i]

// 				if (node[field]) {
// 					overriddenProps[field] = node[field]
// 				}
// 			}
// 		}
// 	}
// 	return overriddenProps
// }

// FIXME: Tempory fix
export function getPluginData(node, key) {
	let result = node.getPluginData(key)
	if (result) {
		return JSON.parse(result)
	} else {
		return ''
	}
}

export function getOverriddenKeys(node) {
	let overriddenKeys = []
	let overrides = node.overrides

	if (overrides) {
		for (let i = 0; i < overrides.length; i++) {
			let nodeEntry = overrides[i]

			if (nodeEntry.id === node.id) {
				for (let a = 0; a < nodeEntry.overriddenFields.length; a++) {
					let field = nodeEntry.overriddenFields[a]
					overriddenKeys.push(field)
				}
			}
		}
	}

	return overriddenKeys
}

export function convertToNumber(data) {
	if (Number(data)) {
		return Number(data)
	} else {
		return data
	}
}

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
	// FIXME: Need to take notify out because causes error in params
	// Import component first?
	// If fails, then look for it by id? What if same id is confused with local component?
	// Needs to know if component is remote?

	var component

	// We pass in the key, to be doubly sure it's the correct component
	var localComponent = getComponentByIdAndKey(template.component.id, template.component.key)
	// var localComponent = getComponentByKey(template.component.key)

	try {
		// If can find the component, and it's key is the same as the templates this assumes the node is in the file it originated from?

		// TRY: Another way could be to just check that the component is a template component? Maybe still not reliable. Maybe need to check file details with the file it's in.
		// if (localComponent && localComponent.key === template.component.key) {

		if (localComponent) {
			component = localComponent
		} else {
			throw 'error'
		}
	} catch {
		try {
			component = await figma.importComponentByKeyAsync(template.component.key)
		} catch (e) {
			if (e.startsWith('Could not find a published component with the key')) {
				console.log('Template: ', template)

				try {
					figma.notify('Check component is published', { error: true })
				} catch (e) {
					console.log(e)
				}
			}
		}
	}

	return component
}

export function isEmpty(obj) {
	for (var prop in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, prop)) {
			return false
		}
	}

	return JSON.stringify(obj) === JSON.stringify({})
}

export function getComponentByIdAndKey(id, key) {
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
	if (node && node.type === 'COMPONENT') {
		if (node) {
			if (node.parent === null || node.parent.parent === null) {
				return false
			} else if (node.key === key) {
				return node
			}
		} else {
			return null
		}
	}
}

export function getComponentById(id) {
	var node = figma.getNodeById(id)

	if (node) {
		if (node.type === 'COMPONENT') {
			if (node.parent === null || node.parent.parent === null) {
				return false
			} else {
				return node
			}
		}
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
export function move(array, from, to, replaceWith?) {
	// Remove from array
	let element = array.splice(from, 1)[0]

	// Add to array
	if (replaceWith) {
		array.splice(to, 0, replaceWith)
	} else {
		array.splice(to, 0, element)
	}

	return array
}
export function daysToMilliseconds(days) {
	// 👇️        hour  min  sec  ms
	return days * 24 * 60 * 60 * 1000
}
export function onlySpaces(str) {
	if (typeof str === 'string') {
		return str.trim().length === 0
	} else {
		return false
	}
}

export function upsert(array, cb, entry?) {
	if (array.length > 0) {
		array.some((item, index) => {
			let result = false
			if (true === cb(array[index])) {
				result = true
				// move to top
				if (entry) {
					move(array, index, 0, entry)
				} else {
					move(array, index, 0)
				}
			}

			return result
		})
	}

	let matchFound = false
	array.map((item, index) => {
		if (true === cb(array[index])) {
			matchFound = true
		}
	})

	if (!matchFound) {
		array.unshift(entry)
	}

	return array
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
export function positionInCenterOfViewport(node) {
	node.x = figma.viewport.center.x - node.width / 2
	node.y = figma.viewport.center.y - node.height / 2
}

// Swaps auto layout axis
export function swapAxises(node) {
	let primary = node.primaryAxisSizingMode
	let counter = node.counterAxisSizingMode

	node.primaryAxisSizingMode = counter
	node.counterAxisSizingMode = primary

	return node
}

export function groupBy(list, keyGetter) {
	const map = new Map()
	list.forEach((item) => {
		const key = keyGetter(item)
		const collection = map.get(key)
		if (!collection) {
			map.set(key, [item])
		} else {
			collection.push(item)
		}
	})
	return Array.from(map)
}

export function genRandomId() {
	var randPassword = Array(10)
		.fill('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
		.map(function (x) {
			return x[Math.floor(Math.random() * x.length)]
		})
		.join('')
	return randPassword
}

// TODO: Replace with more rebost clone function
export function clone(val) {
	return JSON.parse(JSON.stringify(val))
}

export function getTableParts(templateNode) {
	// find nodes with certain pluginData
	let elements = ['tr', 'td', 'th', 'table']
	let results = {}

	// Loop though element definitions and find them in the template or table
	for (let i = 0; i < elements.length; i++) {
		let elementName = elements[i]
		let part = templateNode.findOne((node) => {
			let elementSemantics = getPluginData(node, 'elementSemantics')

			if (elementSemantics?.is === elementName) {
				return true
			}
		})

		results[elementName] = part
	}

	if (!results['table']) {
		if (getPluginData(templateNode, 'elementSemantics').is === 'table') {
			results['table'] = templateNode
		}
	}

	results['container'] = templateNode

	// // For instances assign the mainComponent as the part
	// for (let [key, value] of Object.entries(results)) {
	// 	if (value.type === "INSTANCE") {
	// 		results[key] = value.mainComponent
	// 	}
	// }

	return results
}

export function getTemplateParts(templateNode) {
	// find nodes with certain pluginData

	let elements = ['tr', 'td', 'th', 'table']
	let results = {}

	// Loop though element definitions and find them in the template or table
	for (let i = 0; i < elements.length; i++) {
		let elementName = elements[i]
		let part = templateNode.findOne((node) => {
			let elementSemantics = getPluginData(node, 'elementSemantics')

			if (elementSemantics?.is === elementName) {
				return true
			}
		})

		results[elementName] = part
	}

	if (!results['table']) {
		if (getPluginData(templateNode, 'elementSemantics').is === 'table') {
			results['table'] = templateNode
		}
	}

	results['container'] = templateNode

	// TODO: Need to decide if there is a way to move away from asking user to configure header cell. If so, could we base it off the first cell in the first row in the template?
	// // We assume the first cell in the first row of the table inside the template is the header cell
	// results['th'] = results.table.children[0].children[0]

	return results
}

export function removeChildren(node) {
	let length = node.children.length
	for (let i = length - 1; i >= 0; i--) {
		node.children[i].remove()
	}
}

export function copyPasteStyle(source, target, options: any = {}) {
	// exclude: ['layoutMode', 'counterAxisSizingMode', 'primaryAxisSizingMode', 'layoutAlign', 'rotation', 'constrainProportions']

	const styleProps = [
		'opacity',
		'blendMode',
		'effects',
		'effectStyleId',
		'backgrounds',
		'backgroundStyleId',
		'fills',
		'strokes',
		'strokeWeight',
		'strokeMiterLimit',
		'strokeAlign',
		'strokeCap',
		'strokeJoin',
		'dashPattern',
		'fillStyleId',
		'strokeStyleId',
		'cornerRadius',
		'cornerSmoothing',
		'topLeftRadius',
		'topRightRadius',
		'bottomLeftRadius',
		'bottomRightRadius',
		'paddingLeft',
		'paddingRight',
		'paddingTop',
		'paddingBottom',
		'itemSpacing',
		'clipsContent',
		// --
		'layoutMode',
		'strokeTopWeight',
		'strokeBottomWeight',
		'strokeRightWeight',
		'strokeLeftWeight',
	]

	if (options.include) {
		options.include = options.include.concat(styleProps)
	} else {
		options.include = styleProps
	}

	return copyPaste(source, target, options)
}

export function extractValues(objectArray) {
	return Object.entries(objectArray).reduce(function (acc, obj) {
		let [key, value] = obj
		let thing
		// if (value.type !== 'VARIANT') {
		thing = { [key]: value.value }
		// }
		return { ...acc, ...thing }
	}, {})
}

export async function changeText(node, text, weight?) {
	// if (node.characters) {
	if (node.fontName === figma.mixed) {
		await figma.loadFontAsync(node.getRangeFontName(0, 1) as FontName)
	} else {
		await figma.loadFontAsync({
			family: node.fontName.family,
			style: weight || node.fontName.style,
		})
	}

	// if (weight) {
	// 	node.fontName = {
	// 		family: node.fontName.family,
	// 		style: weight,
	// 	}
	// }

	if (text) {
		node.characters = text
	}

	if (text === '') {
		// Fixes issue where spaces are ignored and node has zero width
		// node.resize(10, node.height)
	}

	// node.textAutoResize = 'HEIGHT'
	// node.layoutAlign = 'STRETCH'

	// // Reapply because of bug
	// node.textAutoResize = 'origTextAutoResize'
	// }
}

// Must pass in both the source/target and their matching main components
// async function overrideChildrenChars(sourceComponentChildren, targetComponentChildren, sourceChildren, targetChildren) {
// 	for (let a = 0; a < targetChildren.length; a++) {
// 		for (let b = 0; b < sourceChildren.length; b++) {
// 			// If layer has children then run function again
// 			if (
// 				sourceComponentChildren[a].children &&
// 				targetComponentChildren[a].children &&
// 				targetChildren[a].children &&
// 				sourceChildren[a].children
// 			) {
// 				overrideChildrenChars(
// 					sourceComponentChildren[a].children,
// 					targetComponentChildren[b].children,
// 					sourceChildren[b].children,
// 					targetChildren[b].children
// 				)
// 			}

// 			// If layer is a text node then check if the main components share the same name
// 			else if (sourceChildren[a].type === 'TEXT') {
// 				if (sourceComponentChildren[a].name === targetComponentChildren[b].name) {
// 					await changeText(targetChildren[a], sourceChildren[a].characters, sourceChildren[a].fontName.style)
// 					// loadFonts(targetChildren[a]).then(() => {
// 					// 	targetChildren[a].characters = sourceChildren[a].characters
// 					// 	targetChildren[a].fontName.style = sourceChildren[a].fontName.style
// 					// })
// 				}
// 			}
// 		}
// 	}
// }

export function getNodeName(node) {
	// To be sure that the name uses props we check to see if the component is a variant by checking if it belongs to a component set. However this isn't foolproof because
	// Important components won't have a parent
	if (node.parent?.type === 'COMPONENT_SET') {
		let variableString = node.name
			.split(',')
			.map((e) => e.split('=')[1])
			.join(', ')
		return `${node.parent?.name}/${variableString}`
	} else {
		// Checking without knowing if part of a component set. Does it contain commas?
		if (node.name.indexOf(',') > -1) {
			let variableString = node.name
				.split(',')
				.map((e) => e.split('=')[1])
				.join(', ')
			return `${variableString}`
		} else {
			return node.name
		}
	}
}

async function overrideChildrenChars2(sourceChildren, targetChildren, sourceComponentChildren?, targetComponentChildren?) {
	for (let a = 0; a < sourceChildren.length; a++) {
		if (sourceComponentChildren[a] && targetComponentChildren[a]) {
			if (sourceComponentChildren[a].name === targetComponentChildren[a].name) {
				targetChildren[a].name = sourceChildren[a].name
				targetChildren[a].visible = sourceChildren[a].visible
				if (targetChildren[a].type === 'INSTANCE') {
					targetChildren[a].swapComponent(sourceChildren[a].mainComponent)
				}

				// targetChildren[a].resize(sourceChildren[a].width, sourceChildren[a].height)
			}
			// If layer has children then run function again
			if (targetChildren[a].children && sourceChildren[a].children) {
				await overrideChildrenChars2(
					sourceChildren[a].children,
					targetChildren[a].children,
					sourceComponentChildren[a].children,
					targetComponentChildren[a].children
				)
			}

			// If layer is a text node then check if the main components share the same name
			else if (sourceChildren[a].type === 'TEXT') {
				// if (sourceChildren[a].name === targetChildren[b].name) {

				await changeText(targetChildren[a], sourceChildren[a].characters, sourceChildren[a].fontName.style)
			}
		}
	}
}

export async function swapInstance(target, source) {
	// await overrideChildrenChars(source.mainComponent.children, source.mainComponent.children, source.children, target.children)
	// replace(newTableCell, oldTableCell.clone())
	// target.swapComponent(source.mainComponent)
	if (target && source) {
		await overrideChildrenChars2(target.children, source.children, target.mainComponent.children, source.mainComponent.children)
	}
}

export function sleep(ms = 0) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}
