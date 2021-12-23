
import { copyPaste } from '@figlets/helpers'

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





