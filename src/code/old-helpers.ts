
import { copyPaste, getPageNode } from '@fignite/helpers'
import { Tween, Queue, Easing } from 'tweeno'

// figma.on('run', () => {
// 	updatePluginData(node, key, () => {
// 		data
// 	})
// })


// Move to helpers
export function genRandomId() {
	var randPassword = Array(10).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz").map(function (x) { return x[Math.floor(Math.random() * x.length)] }).join('');
	return randPassword
}

export function animateIntoView(selection, duration?, easing?) {

	let page = getPageNode(selection[0])

	figma.currentPage = page

	// Get current coordiantes
	let origCoords = {
		...figma.viewport.center,
		z: figma.viewport.zoom
	}

	// Get to be coordiantes
	figma.viewport.scrollAndZoomIntoView(selection)

	let newCoords = {
		...Object.assign({}, figma.viewport.center),
		z: figma.viewport.zoom
	}

	// Reset back to current coordinates
	figma.viewport.center = {
		x: origCoords.x,
		y: origCoords.y
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
	};

	var target = {
		...origCoords,
		update: function () {
			figma.viewport.center = { x: this.x, y: this.y }
			figma.viewport.zoom = this.z
			// console.log(Math.round(this.x), Math.round(this.y))
		}
	};

	var queue = new Queue(),
		tween = new Tween(target, settings);

	// add the tween to the queue
	queue.add(tween);

	// start the queue
	queue.start();


	let loop = setInterval(() => {
		if (queue.tweens.length === 0) {
			clearInterval(loop)
		}
		else {
			queue.update();
			// update the target object state
			target.update();
		}
	}, 1)
}

export function swapAxises(node) {
	let primary = node.primaryAxisSizingMode
	let counter = node.counterAxisSizingMode

	node.primaryAxisSizingMode = counter
	node.counterAxisSizingMode = primary

	return node
}

export function isVariant(node) {
	if (node.type === "INSTANCE") {
		return node.mainComponent.parent?.type === "COMPONENT_SET"
	}

}

export function getVariantName(node) {
	if (isVariant(node)) {
		let type = node.variantProperties?.Type || node.variantProperties?.type

		if (type) {
			return node.name + "/" + type
		}
		else {
			return node.name + "/" + node.mainComponent.name
		}
	}
	else {
		return node.name
	}
}

export function getSelectionName(node) {
	if (node) {
		if (isVariant(node)) {
			return getVariantName(node)
		}
		else {
			return node.name
		}
	}
	else {
		return undefined
	}
}

// Must pass in both the source/target and their matching main components
async function overrideChildrenChars(sourceComponentChildren, targetComponentChildren, sourceChildren, targetChildren) {
	for (let a = 0; a < targetChildren.length; a++) {
		for (let b = 0; b < sourceChildren.length; b++) {

			// If layer has children then run function again
			if (sourceComponentChildren[a].children && targetComponentChildren[a].children && targetChildren[a].children && sourceChildren[a].children) {
				overrideChildrenChars(sourceComponentChildren[a].children, targetComponentChildren[b].children, sourceChildren[b].children, targetChildren[b].children)
			}

			// If layer is a text node then check if the main components share the same name
			else if (sourceChildren[a].type === "TEXT") {
				if (sourceComponentChildren[a].name === targetComponentChildren[b].name) {
					await changeText(targetChildren[a], sourceChildren[a].characters, sourceChildren[a].fontName.style)
					// loadFonts(targetChildren[a]).then(() => {
					// 	targetChildren[a].characters = sourceChildren[a].characters
					// 	targetChildren[a].fontName.style = sourceChildren[a].fontName.style
					// })
				}
			}
		}
	}
}

async function overrideChildrenChars2(sourceChildren, targetChildren, sourceComponentChildren?, targetComponentChildren?) {
	for (let a = 0; a < sourceChildren.length; a++) {
		if (sourceComponentChildren[a].name === targetComponentChildren[a].name) {
			targetChildren[a].name = sourceChildren[a].name
			// targetChildren[a].resize(sourceChildren[a].width, sourceChildren[a].height)
		}
		// If layer has children then run function again
		if (targetChildren[a].children && sourceChildren[a].children) {

			await overrideChildrenChars2(sourceChildren[a].children, targetChildren[a].children, sourceComponentChildren[a].children, targetComponentChildren[a].children)
		}

		// If layer is a text node then check if the main components share the same name
		else if (sourceChildren[a].type === "TEXT") {
			// if (sourceChildren[a].name === targetChildren[b].name) {

			await changeText(targetChildren[a], sourceChildren[a].characters, sourceChildren[a].fontName.style)
		}

	}
}

export async function swapInstance(target, source) {
	// await overrideChildrenChars(source.mainComponent.children, source.mainComponent.children, source.children, target.children)
	// replace(newTableCell, oldTableCell.clone())
	// target.swapComponent(source.mainComponent)
	await overrideChildrenChars2(target.children, source.children, target.mainComponent.children, source.mainComponent.children)
}

export async function lookForComponent(template) {
	// Import component first?
	// If fails, then look for it by id? What if same id is confused with local component?
	// Needs to know if component is remote?

	var component;

	var localComponent = findComponentById(template.component.id)

	try {
		if (localComponent && localComponent.key === template.component.key) {
			component = localComponent
		}
		else {
			throw "error"
		}
	}
	catch {
		console.log("get remote", localComponent)
		component = await figma.importComponentByKeyAsync(template.component.key)
	}

	return component
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
		'clipsContent'
	]

	if (options.include) {
		options.include = options.include.concat(styleProps)
	}
	else {
		options.include = styleProps
	}

	return copyPaste(source, target, options)
}

export function pageNode(node) {
	if (node.parent.type === "PAGE") {
		return node.parent
	}
	else {
		return pageNode(node.parent)
	}
}

export function clone(val) {
	return JSON.parse(JSON.stringify(val))
}

export function removeChildren(node) {

	var length = node.children.length

	if (length > 0) {
		for (let i = 0; i < length; i++) {
			node.children[0].remove()
		}
		// node.children[0].remove()
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
	}
	else {
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
	}
	else {
		return false
	}

}

export function positionInCenter(node) {
	// Position newly created table in center of viewport
	node.x = figma.viewport.center.x - (node.width / 2)
	node.y = figma.viewport.center.y - (node.height / 2)
}

export function compareVersion(v1, v2, options?) {
	var lexicographical = options && options.lexicographical,
		zeroExtend = options && options.zeroExtend,
		v1parts = v1.split('.'),
		v2parts = v2.split('.');

	function isValidPart(x) {
		return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
	}

	if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
		return NaN;
	}

	if (zeroExtend) {
		while (v1parts.length < v2parts.length) v1parts.push("0");
		while (v2parts.length < v1parts.length) v2parts.push("0");
	}

	if (!lexicographical) {
		v1parts = v1parts.map(Number);
		v2parts = v2parts.map(Number);
	}

	for (var i = 0; i < v1parts.length; ++i) {
		if (v2parts.length == i) {
			return 1;
		}

		if (v1parts[i] == v2parts[i]) {
			continue;
		}
		else if (v1parts[i] > v2parts[i]) {
			return 1;
		}
		else {
			return -1;
		}
	}

	if (v1parts.length != v2parts.length) {
		return -1;
	}

	return 0;
}

export async function changeText(node, text, weight?) {

	if (node.fontName === figma.mixed) {
		await figma.loadFontAsync(node.getRangeFontName(0, 1) as FontName)
	} else {
		await figma.loadFontAsync({
			family: node.fontName.family,
			style: weight || node.fontName.style
		})
	}

	if (weight) {
		node.fontName = {
			family: node.fontName.family,
			style: weight
		}
	}


	if (text) {
		node.characters = text
	}

	if (text === "") {
		// Fixes issue where spaces are ignored and node has zero width
		node.resize(10, node.height)
	}

	node.textAutoResize = "HEIGHT"
	node.layoutAlign = "STRETCH"
}

export async function loadFonts(node, style?, family?) {
	await Promise.all([
		figma.loadFontAsync({
			family: family || node.fontName.family,
			style: style || node.fontName.style
		})
	])
	return node
}

export function ungroupNode(node, parent) {
	// Avoid children changing while looping
	let children = node.children
	for (let i = 0; i < children.length; i++) {
		parent.appendChild(children[i])
	}
	if (node.type === "FRAME") {
		node.remove()
	}
}

export function findComponentById(id) {
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
			figma.root.setPluginData("cellComponentState", "exists")
			return false
		}
		else {
			figma.root.setPluginData("cellComponentState", "removed")
			return node
		}
	}
	else {
		figma.root.setPluginData("cellComponentState", "deleted")
		return null
	}

}

export function getPluginData(node, key) {
	var data
	if (node.getPluginData(key)) {
		data = JSON.parse(node.getPluginData(key))
	}
	else {
		data = undefined
	}
	return data
}

export function setPluginData(node, key, data) {
	node.setPluginData(key, JSON.stringify(data))
}

export function updatePluginData(node, key, callback) {
	var data

	if (node.getPluginData(key)) {
		data = JSON.parse(node.getPluginData(key))
	}
	else {
		data = null
	}

	data = callback(data)

	// What should happen if user doesn't return anything in callback?
	if (!data) {
		data = null
	}

	node.setPluginData(key, JSON.stringify(data))

	return data
}

export async function updateClientStorageAsync(key, callback) {

	var data = await figma.clientStorage.getAsync(key)

	data = callback(data)

	await figma.clientStorage.setAsync(key, data)


	// What should happen if user doesn't return anything in callback?
	if (!data) {
		data = null
	}

	// node.setPluginData(key, JSON.stringify(data))

	return data
}

export function bindPluginData(node, key, data) {

    setPluginData(node, key, data)

	updatePluginData(figma.root, 'boundNodeData', (nodes) => {
		nodes = nodes || []

		if (nodes.length === 0) {
			nodes.push({
				id: node.id,
				key,
				data
			})
		}
		else {
			nodes.some(item => {
				if (item.id === node.id) {
					// If node exists then we update the data if changes in source code
					item.data = data
				}
				else {
					// If node doesn't exist then we create a new entry
					nodes.push({
						id: node.id,
						key,
						data
					})
				}
			})
		}

		return nodes
	})

	return data
}

export function syncBoundPluginData() {
	let nodes = getPluginData(figma.root, 'boundNodeData')
	console.log(nodes)

	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i]

		var string = `(() => {
		return ` + node.data + `
		})()`

		var data = typeof node.data === 'string' ? eval(string) : node.data

		setPluginData(figma.getNodeById(node.id), node.key, data)
	}
}

export function detachInstance(instance, parent) {
	if (instance.type === "INSTANCE") {
		var newInstance = figma.createFrame()

		newInstance.resize(instance.width, instance.width)

		copyPasteProps(instance, newInstance, { include: ["name", "x", "y"] })

		var length = instance.children.length

		for (var i = 0; i < length; i++) {
			newInstance.appendChild(instance.children[i].clone())
		}

		parent.appendChild(newInstance)
		// instance.remove()

		return newInstance
	}


}





