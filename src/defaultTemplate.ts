import { ungroupNode } from "./helpers"
import { setPluginData, updatePluginData } from '@figlets/helpers'

// Load FONTS
async function loadFonts() {
	await Promise.all([
		figma.loadFontAsync({
			family: "Inter",
			style: "Regular"
		})
	])
}

// Wrap in function
export function createDefaultTemplate() {
	const obj: any = {}

	// Create COMPONENT
	var component_101_204 = figma.createComponent()
	component_101_204.resize(120.0000000000, 35.0000000000)
	component_101_204.name = "Type=Default"
	component_101_204.widgetEvents = []
	component_101_204.layoutAlign = "STRETCH"
	component_101_204.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.000009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }]
	component_101_204.primaryAxisSizingMode = "FIXED"
	component_101_204.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.000009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }]
	component_101_204.layoutMode = "VERTICAL"
	component_101_204.description = ""
	component_101_204.documentationLinks = []

	// Create COMPONENT
	var component_101_119 = figma.createComponent()
	component_101_119.resize(120.0000000000, 35.0000000000)
	component_101_119.name = "_BaseCell"
	component_101_119.widgetEvents = []
	component_101_119.relativeTransform = [[1, 0, 8760], [0, 1, 5164]]
	component_101_119.x = 8760
	component_101_119.y = 5164
	component_101_119.layoutAlign = "STRETCH"
	component_101_119.fills = []
	component_101_119.primaryAxisSizingMode = "FIXED"
	component_101_119.backgrounds = []
	component_101_119.expanded = false
	component_101_119.layoutMode = "VERTICAL"
	component_101_119.description = ""
	component_101_119.documentationLinks = []

	// Create FRAME
	var frame_101_114 = figma.createFrame()
	frame_101_114.resizeWithoutConstraints(120.0000000000, 0.01)
	frame_101_114.primaryAxisSizingMode = "AUTO"
	frame_101_114.widgetEvents = []
	frame_101_114.locked = true
	frame_101_114.layoutAlign = "STRETCH"
	frame_101_114.fills = []
	frame_101_114.backgrounds = []
	frame_101_114.clipsContent = false
	frame_101_114.expanded = false
	component_101_119.appendChild(frame_101_114)

	// Create COMPONENT
	var component_1_351 = figma.createComponent()
	component_1_351.name = "_TableBorder"
	component_1_351.widgetEvents = []
	component_1_351.relativeTransform = [[1, 0, 8476], [0, 1, 5168]]
	component_1_351.x = 8476
	component_1_351.y = 5168
	component_1_351.expanded = false
	component_1_351.constraints = { "horizontal": "STRETCH", "vertical": "STRETCH" }
	component_1_351.description = ""
	component_1_351.documentationLinks = []

	// Create LINE
	var line_1_352 = figma.createLine()
	line_1_352.resizeWithoutConstraints(500.0000000000, 0.0000000000)
	line_1_352.widgetEvents = []
	line_1_352.strokes = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.7254902124404907, "g": 0.7254902124404907, "b": 0.7254902124404907 } }]
	line_1_352.relativeTransform = [[-4.37e-8, -1, 0], [1, -4.37e-8, 0]]
	line_1_352.rotation = -90.00000250447827
	line_1_352.constraints = { "horizontal": "STRETCH", "vertical": "STRETCH" }
	component_1_351.appendChild(line_1_352)

	// Create INSTANCE
	var instance_102_493 = component_1_351.createInstance()
	instance_102_493.relativeTransform = [[1, 0, 0], [0, 1, -250]]
	instance_102_493.y = -250
	frame_101_114.appendChild(instance_102_493)

	// Swap COMPONENT
	instance_102_493.swapComponent(component_1_351)

	// Ref to SUB NODE
	var line_I102_493_1_352 = figma.getNodeById("I" + instance_102_493.id + ";" + line_1_352.id)

	// Create FRAME
	var frame_101_116 = figma.createFrame()
	frame_101_116.resize(120.0000000000, 35.0000000000)
	frame_101_116.primaryAxisSizingMode = "AUTO"
	frame_101_116.name = "Content"
	frame_101_116.widgetEvents = []
	frame_101_116.relativeTransform = [[1, 0, 0], [0, 1, 0.001]]
	frame_101_116.y = 0.0010000000474974513
	frame_101_116.layoutAlign = "STRETCH"
	frame_101_116.fills = []
	frame_101_116.paddingLeft = 12
	frame_101_116.paddingRight = 12
	frame_101_116.paddingTop = 10
	frame_101_116.paddingBottom = 10
	frame_101_116.backgrounds = []
	frame_101_116.expanded = false
	frame_101_116.layoutMode = "VERTICAL"
	component_101_119.appendChild(frame_101_116)

	// Create TEXT
	var text_101_117 = figma.createText()
	text_101_117.resize(96.0000000000, 15.0000000000)
	text_101_117.widgetEvents = []
	text_101_117.relativeTransform = [[1, 0, 12], [0, 1, 10]]
	text_101_117.x = 12
	text_101_117.y = 10
	text_101_117.layoutAlign = "STRETCH"
	text_101_117.hyperlink = null
	loadFonts().then((res) => {
		text_101_117.fontName = {
			family: "Inter",
			style: "Regular"
		}
		text_101_117.listSpacing = 0
		text_101_117.characters = ""
		text_101_117.lineHeight = { "unit": "PERCENT", "value": 125 }
		text_101_117.fontName = { "family": "Inter", "style": "Regular" }
		text_101_117.textAutoResize = "HEIGHT"

	})
	frame_101_116.appendChild(text_101_117)

	// Create INSTANCE
	var instance_101_198 = component_101_119.createInstance()
	instance_101_198.resize(120.0000000000, 35.0009994507)
	instance_101_198.primaryAxisSizingMode = "AUTO"
	instance_101_198.relativeTransform = [[1, 0, 0], [0, 1, 0]]
	instance_101_198.primaryAxisSizingMode = "AUTO"
	instance_101_198.constraints = { "horizontal": "SCALE", "vertical": "CENTER" }
	component_101_204.appendChild(instance_101_198)

	// Swap COMPONENT
	instance_101_198.swapComponent(component_101_119)

	// Ref to SUB NODE
	var frame_I101_198_101_114 = figma.getNodeById("I" + instance_101_198.id + ";" + frame_101_114.id)

	// Ref to SUB NODE
	var instance_I101_198_102_493 = figma.getNodeById("I" + instance_101_198.id + ";" + instance_102_493.id)

	// Swap COMPONENT
	instance_I101_198_102_493.swapComponent(component_1_351)

	// Ref to SUB NODE
	var line_I101_198_102_493_1_352 = figma.getNodeById(instance_I101_198_102_493.id + ";" + line_1_352.id)

	// Ref to SUB NODE
	var frame_I101_198_101_116 = figma.getNodeById("I" + instance_101_198.id + ";" + frame_101_116.id)

	// Ref to SUB NODE
	var text_I101_198_101_117 = figma.getNodeById("I" + instance_101_198.id + ";" + text_101_117.id)

	// Create COMPONENT
	var component_101_265 = figma.createComponent()
	component_101_265.resize(120.0000000000, 35.0000000000)
	component_101_265.name = "Type=Header"
	component_101_265.widgetEvents = []
	component_101_265.relativeTransform = [[1, 0, 120], [0, 1, 0]]
	component_101_265.x = 120
	component_101_265.layoutAlign = "STRETCH"
	component_101_265.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.05999999865889549, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }]
	component_101_265.primaryAxisSizingMode = "FIXED"
	component_101_265.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.05999999865889549, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }]
	component_101_265.layoutMode = "VERTICAL"
	component_101_265.description = ""
	component_101_265.documentationLinks = []

	// Create INSTANCE
	var instance_101_266 = component_101_119.createInstance()
	instance_101_266.resize(120.0000000000, 35.0009994507)
	instance_101_266.primaryAxisSizingMode = "AUTO"
	instance_101_266.relativeTransform = [[1, 0, 0], [0, 1, 0]]
	instance_101_266.primaryAxisSizingMode = "AUTO"
	instance_101_266.constraints = { "horizontal": "SCALE", "vertical": "CENTER" }
	component_101_265.appendChild(instance_101_266)

	// Swap COMPONENT
	instance_101_266.swapComponent(component_101_119)

	// Ref to SUB NODE
	var frame_I101_266_101_114 = figma.getNodeById("I" + instance_101_266.id + ";" + frame_101_114.id)

	// Ref to SUB NODE
	var instance_I101_266_102_493 = figma.getNodeById("I" + instance_101_266.id + ";" + instance_102_493.id)

	// Swap COMPONENT
	instance_I101_266_102_493.swapComponent(component_1_351)

	// Ref to SUB NODE
	var line_I101_266_102_493_1_352 = figma.getNodeById(instance_I101_266_102_493.id + ";" + line_1_352.id)

	// Ref to SUB NODE
	var frame_I101_266_101_116 = figma.getNodeById("I" + instance_101_266.id + ";" + frame_101_116.id)

	// Ref to SUB NODE
	var text_I101_266_101_117 = figma.getNodeById("I" + instance_101_266.id + ";" + text_101_117.id)

	// Create COMPONENT_SET
	var componentSet_1_364 = figma.combineAsVariants([component_101_204, component_101_265], figma.currentPage)
	componentSet_1_364.resize(240.0000000000, 35.0000000000)
	componentSet_1_364.primaryAxisSizingMode = "AUTO"
	componentSet_1_364.name = "_Cell"
	componentSet_1_364.widgetEvents = []
	componentSet_1_364.visible = true
	componentSet_1_364.locked = false
	componentSet_1_364.opacity = 1
	componentSet_1_364.blendMode = "PASS_THROUGH"
	componentSet_1_364.isMask = false
	componentSet_1_364.effects = []
	componentSet_1_364.relativeTransform = [[1, 0, 8760], [0, 1, 5009]]
	componentSet_1_364.x = 8760
	componentSet_1_364.y = 5009
	componentSet_1_364.rotation = 0
	componentSet_1_364.layoutAlign = "INHERIT"
	componentSet_1_364.constrainProportions = false
	componentSet_1_364.layoutGrow = 0
	componentSet_1_364.fills = []
	componentSet_1_364.strokes = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.48235294222831726, "g": 0.3803921639919281, "b": 1 } }]
	componentSet_1_364.strokeWeight = 1
	componentSet_1_364.strokeAlign = "INSIDE"
	componentSet_1_364.strokeJoin = "MITER"
	componentSet_1_364.dashPattern = [10, 5]
	componentSet_1_364.strokeCap = "NONE"
	componentSet_1_364.strokeMiterLimit = 4
	componentSet_1_364.cornerRadius = 5
	componentSet_1_364.cornerSmoothing = 0
	componentSet_1_364.paddingLeft = 0
	componentSet_1_364.paddingRight = 0
	componentSet_1_364.paddingTop = 0
	componentSet_1_364.paddingBottom = 0
	componentSet_1_364.primaryAxisAlignItems = "MIN"
	componentSet_1_364.counterAxisAlignItems = "MIN"
	componentSet_1_364.primaryAxisSizingMode = "AUTO"
	componentSet_1_364.layoutGrids = []
	componentSet_1_364.backgrounds = []
	componentSet_1_364.clipsContent = true
	componentSet_1_364.guides = []
	componentSet_1_364.expanded = true
	componentSet_1_364.constraints = { "horizontal": "MIN", "vertical": "MIN" }
	componentSet_1_364.layoutMode = "HORIZONTAL"
	componentSet_1_364.counterAxisSizingMode = "FIXED"
	componentSet_1_364.itemSpacing = 0
	componentSet_1_364.description = ""
	componentSet_1_364.documentationLinks = []

	// Create COMPONENT
	var component_1_365 = figma.createComponent()
	component_1_365.resize(240.0000000000, 35.0009994507)
	component_1_365.primaryAxisSizingMode = "AUTO"
	component_1_365.counterAxisSizingMode = "AUTO"
	component_1_365.name = "_Row"
	component_1_365.widgetEvents = []
	component_1_365.effects = [{ "type": "INNER_SHADOW", "color": { "r": 0.7254902124404907, "g": 0.7254902124404907, "b": 0.7254902124404907, "a": 1 }, "offset": { "x": 0, "y": 1 }, "radius": 0, "spread": 0, "visible": true, "blendMode": "NORMAL" }]
	component_1_365.relativeTransform = [[1, 0, 8760], [0, 1, 4854]]
	component_1_365.x = 8760
	component_1_365.y = 4854
	component_1_365.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.00009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }]
	component_1_365.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.00009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }]
	component_1_365.clipsContent = true
	component_1_365.layoutMode = "HORIZONTAL"
	component_1_365.counterAxisSizingMode = "AUTO"
	component_1_365.description = ""
	component_1_365.documentationLinks = []
	figma.currentPage.appendChild(component_1_365)

	// Create INSTANCE
	var instance_1_366 = component_101_204.createInstance()
	instance_1_366.resize(120.0000000000, 35.0009994507)
	instance_1_366.name = "_Cell"
	instance_1_366.expanded = false
	component_1_365.appendChild(instance_1_366)

	// Swap COMPONENT
	instance_1_366.swapComponent(component_101_204)

	// Ref to SUB NODE
	var instance_I1_366_101_198 = figma.getNodeById("I" + instance_1_366.id + ";" + instance_101_198.id)

	// Swap COMPONENT
	instance_I1_366_101_198.swapComponent(component_101_119)

	// Ref to SUB NODE
	var frame_I1_366_101_198_101_114 = figma.getNodeById(instance_I1_366_101_198.id + ";" + frame_101_114.id)

	// Ref to SUB NODE
	var instance_I1_366_101_198_102_493 = figma.getNodeById(instance_I1_366_101_198.id + ";" + instance_102_493.id)

	// Swap COMPONENT
	instance_I1_366_101_198_102_493.swapComponent(component_1_351)

	// Ref to SUB NODE
	var line_I1_366_101_198_102_493_1_352 = figma.getNodeById(instance_I1_366_101_198_102_493.id + ";" + line_1_352.id)

	// Ref to SUB NODE
	var frame_I1_366_101_198_101_116 = figma.getNodeById(instance_I1_366_101_198.id + ";" + frame_101_116.id)

	// Ref to SUB NODE
	var text_I1_366_101_198_101_117 = figma.getNodeById(instance_I1_366_101_198.id + ";" + text_101_117.id)

	// Create INSTANCE
	var instance_1_372 = component_101_204.createInstance()
	instance_1_372.resize(120.0000000000, 35.0009994507)
	instance_1_372.name = "_Cell"
	instance_1_372.relativeTransform = [[1, 0, 120], [0, 1, 0]]
	instance_1_372.x = 120
	component_1_365.appendChild(instance_1_372)

	// Swap COMPONENT
	instance_1_372.swapComponent(component_101_204)

	// Ref to SUB NODE
	var instance_I1_372_101_198 = figma.getNodeById("I" + instance_1_372.id + ";" + instance_101_198.id)

	// Swap COMPONENT
	instance_I1_372_101_198.swapComponent(component_101_119)

	// Ref to SUB NODE
	var frame_I1_372_101_198_101_114 = figma.getNodeById(instance_I1_372_101_198.id + ";" + frame_101_114.id)

	// Ref to SUB NODE
	var instance_I1_372_101_198_102_493 = figma.getNodeById(instance_I1_372_101_198.id + ";" + instance_102_493.id)

	// Swap COMPONENT
	instance_I1_372_101_198_102_493.swapComponent(component_1_351)

	// Ref to SUB NODE
	var line_I1_372_101_198_102_493_1_352 = figma.getNodeById(instance_I1_372_101_198_102_493.id + ";" + line_1_352.id)

	// Ref to SUB NODE
	var frame_I1_372_101_198_101_116 = figma.getNodeById(instance_I1_372_101_198.id + ";" + frame_101_116.id)

	// Ref to SUB NODE
	var text_I1_372_101_198_101_117 = figma.getNodeById(instance_I1_372_101_198.id + ";" + text_101_117.id)

	// Create COMPONENT
	var component_1_378 = figma.createComponent()
	component_1_378.resize(240.0000000000, 105.0029983521)
	component_1_378.primaryAxisSizingMode = "AUTO"
	component_1_378.counterAxisSizingMode = "AUTO"
	component_1_378.name = "Table 1"
	component_1_378.widgetEvents = []
	component_1_378.effects = [{ "type": "DROP_SHADOW", "color": { "r": 0, "g": 0, "b": 0, "a": 0.10000000149011612 }, "offset": { "x": 0, "y": 2 }, "radius": 6, "spread": 0, "visible": true, "blendMode": "NORMAL", "showShadowBehindNode": false }]
	component_1_378.relativeTransform = [[1, 0, 8760], [0, 1, 4629]]
	component_1_378.x = 8760
	component_1_378.y = 4629
	component_1_378.fills = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }]
	component_1_378.strokes = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.7254902124404907, "g": 0.7254902124404907, "b": 0.7254902124404907 } }]
	component_1_378.cornerRadius = 4
	component_1_378.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }]
	component_1_378.clipsContent = true
	component_1_378.layoutMode = "VERTICAL"
	component_1_378.counterAxisSizingMode = "AUTO"
	component_1_378.description = ""
	component_1_378.documentationLinks = []
	figma.currentPage.appendChild(component_1_378)

	// Create INSTANCE
	var instance_1_379 = component_1_365.createInstance()
	instance_1_379.relativeTransform = [[1, 0, 0], [0, 1, 0]]
	component_1_378.appendChild(instance_1_379)

	// Swap COMPONENT
	instance_1_379.swapComponent(component_1_365)

	// Ref to SUB NODE
	var instance_I1_379_1_366 = figma.getNodeById("I" + instance_1_379.id + ";" + instance_1_366.id)
	instance_I1_379_1_366.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.05999999865889549, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }]
	instance_I1_379_1_366.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.05999999865889549, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }]

	// Swap COMPONENT
	instance_I1_379_1_366.swapComponent(component_101_265)

	// Ref to SUB NODE
	var instance_I1_379_1_366_101_266 = figma.getNodeById(instance_I1_379_1_366.id + ";" + instance_101_266.id)

	// Swap COMPONENT
	instance_I1_379_1_366_101_266.swapComponent(component_101_119)

	// Ref to SUB NODE
	var frame_I1_379_1_366_101_266_101_114 = figma.getNodeById(instance_I1_379_1_366_101_266.id + ";" + frame_101_114.id)

	// Ref to SUB NODE
	var instance_I1_379_1_366_101_266_102_493 = figma.getNodeById(instance_I1_379_1_366_101_266.id + ";" + instance_102_493.id)

	// Swap COMPONENT
	instance_I1_379_1_366_101_266_102_493.swapComponent(component_1_351)

	// Ref to SUB NODE
	var line_I1_379_1_366_101_266_102_493_1_352 = figma.getNodeById(instance_I1_379_1_366_101_266_102_493.id + ";" + line_1_352.id)

	// Ref to SUB NODE
	var frame_I1_379_1_366_101_266_101_116 = figma.getNodeById(instance_I1_379_1_366_101_266.id + ";" + frame_101_116.id)

	// Ref to SUB NODE
	var text_I1_379_1_366_101_266_101_117 = figma.getNodeById(instance_I1_379_1_366_101_266.id + ";" + text_101_117.id)

	// Ref to SUB NODE
	var instance_I1_379_1_372 = figma.getNodeById("I" + instance_1_379.id + ";" + instance_1_372.id)
	instance_I1_379_1_372.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.05999999865889549, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }]
	instance_I1_379_1_372.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.05999999865889549, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }]

	// Swap COMPONENT
	instance_I1_379_1_372.swapComponent(component_101_265)

	// Ref to SUB NODE
	var instance_I1_379_1_372_101_266 = figma.getNodeById(instance_I1_379_1_372.id + ";" + instance_101_266.id)

	// Swap COMPONENT
	instance_I1_379_1_372_101_266.swapComponent(component_101_119)

	// Ref to SUB NODE
	var frame_I1_379_1_372_101_266_101_114 = figma.getNodeById(instance_I1_379_1_372_101_266.id + ";" + frame_101_114.id)

	// Ref to SUB NODE
	var instance_I1_379_1_372_101_266_102_493 = figma.getNodeById(instance_I1_379_1_372_101_266.id + ";" + instance_102_493.id)

	// Swap COMPONENT
	instance_I1_379_1_372_101_266_102_493.swapComponent(component_1_351)

	// Ref to SUB NODE
	var line_I1_379_1_372_101_266_102_493_1_352 = figma.getNodeById(instance_I1_379_1_372_101_266_102_493.id + ";" + line_1_352.id)

	// Ref to SUB NODE
	var frame_I1_379_1_372_101_266_101_116 = figma.getNodeById(instance_I1_379_1_372_101_266.id + ";" + frame_101_116.id)

	// Ref to SUB NODE
	var text_I1_379_1_372_101_266_101_117 = figma.getNodeById(instance_I1_379_1_372_101_266.id + ";" + text_101_117.id)

	// Create INSTANCE
	var instance_1_398 = component_1_365.createInstance()
	instance_1_398.relativeTransform = [[1, 0, 0], [0, 1, 35.0009994507]]
	instance_1_398.y = 35.000999450683594
	instance_1_398.expanded = false
	component_1_378.appendChild(instance_1_398)

	// Swap COMPONENT
	instance_1_398.swapComponent(component_1_365)

	// Ref to SUB NODE
	var instance_I1_398_1_366 = figma.getNodeById("I" + instance_1_398.id + ";" + instance_1_366.id)

	// Swap COMPONENT
	instance_I1_398_1_366.swapComponent(component_101_204)

	// Ref to SUB NODE
	var instance_I1_398_1_366_101_198 = figma.getNodeById(instance_I1_398_1_366.id + ";" + instance_101_198.id)

	// Swap COMPONENT
	instance_I1_398_1_366_101_198.swapComponent(component_101_119)

	// Ref to SUB NODE
	var frame_I1_398_1_366_101_198_101_114 = figma.getNodeById(instance_I1_398_1_366_101_198.id + ";" + frame_101_114.id)

	// Ref to SUB NODE
	var instance_I1_398_1_366_101_198_102_493 = figma.getNodeById(instance_I1_398_1_366_101_198.id + ";" + instance_102_493.id)

	// Swap COMPONENT
	instance_I1_398_1_366_101_198_102_493.swapComponent(component_1_351)

	// Ref to SUB NODE
	var line_I1_398_1_366_101_198_102_493_1_352 = figma.getNodeById(instance_I1_398_1_366_101_198_102_493.id + ";" + line_1_352.id)

	// Ref to SUB NODE
	var frame_I1_398_1_366_101_198_101_116 = figma.getNodeById(instance_I1_398_1_366_101_198.id + ";" + frame_101_116.id)

	// Ref to SUB NODE
	var text_I1_398_1_366_101_198_101_117 = figma.getNodeById(instance_I1_398_1_366_101_198.id + ";" + text_101_117.id)

	// Ref to SUB NODE
	var instance_I1_398_1_372 = figma.getNodeById("I" + instance_1_398.id + ";" + instance_1_372.id)
	instance_I1_398_1_372.expanded = false

	// Swap COMPONENT
	instance_I1_398_1_372.swapComponent(component_101_204)

	// Ref to SUB NODE
	var instance_I1_398_1_372_101_198 = figma.getNodeById(instance_I1_398_1_372.id + ";" + instance_101_198.id)

	// Swap COMPONENT
	instance_I1_398_1_372_101_198.swapComponent(component_101_119)

	// Ref to SUB NODE
	var frame_I1_398_1_372_101_198_101_114 = figma.getNodeById(instance_I1_398_1_372_101_198.id + ";" + frame_101_114.id)

	// Ref to SUB NODE
	var instance_I1_398_1_372_101_198_102_493 = figma.getNodeById(instance_I1_398_1_372_101_198.id + ";" + instance_102_493.id)

	// Swap COMPONENT
	instance_I1_398_1_372_101_198_102_493.swapComponent(component_1_351)

	// Ref to SUB NODE
	var line_I1_398_1_372_101_198_102_493_1_352 = figma.getNodeById(instance_I1_398_1_372_101_198_102_493.id + ";" + line_1_352.id)

	// Ref to SUB NODE
	var frame_I1_398_1_372_101_198_101_116 = figma.getNodeById(instance_I1_398_1_372_101_198.id + ";" + frame_101_116.id)

	// Ref to SUB NODE
	var text_I1_398_1_372_101_198_101_117 = figma.getNodeById(instance_I1_398_1_372_101_198.id + ";" + text_101_117.id)

	// Create INSTANCE
	var instance_1_417 = component_1_365.createInstance()
	instance_1_417.relativeTransform = [[1, 0, 0], [0, 1, 70.0019989014]]
	instance_1_417.y = 70.00199890136719
	instance_1_417.expanded = false
	component_1_378.appendChild(instance_1_417)

	// Swap COMPONENT
	instance_1_417.swapComponent(component_1_365)

	// Ref to SUB NODE
	var instance_I1_417_1_366 = figma.getNodeById("I" + instance_1_417.id + ";" + instance_1_366.id)

	// Swap COMPONENT
	instance_I1_417_1_366.swapComponent(component_101_204)

	// Ref to SUB NODE
	var instance_I1_417_1_366_101_198 = figma.getNodeById(instance_I1_417_1_366.id + ";" + instance_101_198.id)

	// Swap COMPONENT
	instance_I1_417_1_366_101_198.swapComponent(component_101_119)

	// Ref to SUB NODE
	var frame_I1_417_1_366_101_198_101_114 = figma.getNodeById(instance_I1_417_1_366_101_198.id + ";" + frame_101_114.id)

	// Ref to SUB NODE
	var instance_I1_417_1_366_101_198_102_493 = figma.getNodeById(instance_I1_417_1_366_101_198.id + ";" + instance_102_493.id)

	// Swap COMPONENT
	instance_I1_417_1_366_101_198_102_493.swapComponent(component_1_351)

	// Ref to SUB NODE
	var line_I1_417_1_366_101_198_102_493_1_352 = figma.getNodeById(instance_I1_417_1_366_101_198_102_493.id + ";" + line_1_352.id)

	// Ref to SUB NODE
	var frame_I1_417_1_366_101_198_101_116 = figma.getNodeById(instance_I1_417_1_366_101_198.id + ";" + frame_101_116.id)

	// Ref to SUB NODE
	var text_I1_417_1_366_101_198_101_117 = figma.getNodeById(instance_I1_417_1_366_101_198.id + ";" + text_101_117.id)

	// Ref to SUB NODE
	var instance_I1_417_1_372 = figma.getNodeById("I" + instance_1_417.id + ";" + instance_1_372.id)
	instance_I1_417_1_372.expanded = false

	// Swap COMPONENT
	instance_I1_417_1_372.swapComponent(component_101_204)

	// Ref to SUB NODE
	var instance_I1_417_1_372_101_198 = figma.getNodeById(instance_I1_417_1_372.id + ";" + instance_101_198.id)

	// Swap COMPONENT
	instance_I1_417_1_372_101_198.swapComponent(component_101_119)

	// Ref to SUB NODE
	var frame_I1_417_1_372_101_198_101_114 = figma.getNodeById(instance_I1_417_1_372_101_198.id + ";" + frame_101_114.id)

	// Ref to SUB NODE
	var instance_I1_417_1_372_101_198_102_493 = figma.getNodeById(instance_I1_417_1_372_101_198.id + ";" + instance_102_493.id)

	// Swap COMPONENT
	instance_I1_417_1_372_101_198_102_493.swapComponent(component_1_351)

	// Ref to SUB NODE
	var line_I1_417_1_372_101_198_102_493_1_352 = figma.getNodeById(instance_I1_417_1_372_101_198_102_493.id + ";" + line_1_352.id)

	// Ref to SUB NODE
	var frame_I1_417_1_372_101_198_101_116 = figma.getNodeById(instance_I1_417_1_372_101_198.id + ";" + frame_101_116.id)

	// Ref to SUB NODE
	var text_I1_417_1_372_101_198_101_117 = figma.getNodeById(instance_I1_417_1_372_101_198.id + ";" + text_101_117.id)

	// Create COMPONENT
	var component_1_430 = figma.createComponent()
	component_1_430.resize(457.0000000000, 179.0000000000)
	component_1_430.counterAxisSizingMode = "AUTO"
	component_1_430.name = "_Tooltip"
	component_1_430.widgetEvents = []
	component_1_430.effects = [{ "type": "DROP_SHADOW", "color": { "r": 0.9666666388511658, "g": 0.15708333253860474, "b": 0.15708333253860474, "a": 0.09000000357627869 }, "offset": { "x": 0, "y": 16 }, "radius": 8, "spread": 0, "visible": false, "blendMode": "NORMAL", "showShadowBehindNode": true }]
	component_1_430.relativeTransform = [[1, 0, 9080], [0, 1, 4316]]
	component_1_430.x = 9080
	component_1_430.y = 4316
	component_1_430.fills = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }, { "type": "GRADIENT_LINEAR", "visible": true, "opacity": 1, "blendMode": "NORMAL", "gradientStops": [{ "color": { "r": 0, "g": 0, "b": 0, "a": 1 }, "position": 0 }, { "color": { "r": 0.26249998807907104, "g": 0.26249998807907104, "b": 0.26249998807907104, "a": 1 }, "position": 1 }], "gradientTransform": [[0.37368255853652954, 0.4259088337421417, 0.21073251962661743], [-0.0000021187263428146252, 0.0000018692335288506001, 0.5000001788139343]] }]
	component_1_430.cornerRadius = 8
	component_1_430.paddingLeft = 20
	component_1_430.paddingRight = 20
	component_1_430.paddingTop = 16
	component_1_430.paddingBottom = 16
	component_1_430.primaryAxisSizingMode = "FIXED"
	component_1_430.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }, { "type": "GRADIENT_LINEAR", "visible": true, "opacity": 1, "blendMode": "NORMAL", "gradientStops": [{ "color": { "r": 0, "g": 0, "b": 0, "a": 1 }, "position": 0 }, { "color": { "r": 0.26249998807907104, "g": 0.26249998807907104, "b": 0.26249998807907104, "a": 1 }, "position": 1 }], "gradientTransform": [[0.37368255853652954, 0.4259088337421417, 0.21073251962661743], [-0.0000021187263428146252, 0.0000018692335288506001, 0.5000001788139343]] }]
	component_1_430.expanded = false
	component_1_430.layoutMode = "HORIZONTAL"
	component_1_430.counterAxisSizingMode = "AUTO"
	component_1_430.description = ""
	component_1_430.documentationLinks = []

	// Create FRAME
	var frame_1_431 = figma.createFrame()
	frame_1_431.resizeWithoutConstraints(0.01, 0.01)
	frame_1_431.primaryAxisSizingMode = "AUTO"
	frame_1_431.name = "Frame 2"
	frame_1_431.widgetEvents = []
	frame_1_431.relativeTransform = [[1, 0, 20], [0, 1, 16]]
	frame_1_431.x = 20
	frame_1_431.y = 16
	frame_1_431.fills = []
	frame_1_431.backgrounds = []
	frame_1_431.clipsContent = false
	frame_1_431.expanded = false
	component_1_430.appendChild(frame_1_431)

	// Create RECTANGLE
	var rectangle_1_432 = figma.createRectangle()
	rectangle_1_432.resize(15.5563220978, 15.5563220978)
	rectangle_1_432.name = "Rectangle 1"
	rectangle_1_432.widgetEvents = []
	rectangle_1_432.fills = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.0784313753247261, "g": 0.0784313753247261, "b": 0.0784313753247261 } }]
	rectangle_1_432.relativeTransform = [[0.7071068287, -0.7071068287, -19.1801757812], [0.7071068287, 0.7071068287, 1.8198242188]]
	rectangle_1_432.x = -19.18017578125
	rectangle_1_432.y = 1.81982421875
	rectangle_1_432.rotation = -45
	rectangle_1_432.constrainProportions = true
	frame_1_431.appendChild(rectangle_1_432)

	// Create TEXT
	var text_1_433 = figma.createText()
	text_1_433.resize(416.9899902344, 147.0000000000)
	text_1_433.name = "Only layer styles such as: background, color, border radius etc will be used to create tables. You don't have to create tables using the plugin. You can also create tables by creating an instance of this component and detaching them and their rows. If you change the styles used on the table or row components you can update existing tables by going to Plugins > Table Creator > Settings and select Refresh Tables"
	text_1_433.widgetEvents = []
	text_1_433.fills = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }]
	text_1_433.relativeTransform = [[1, 0, 20.0100002289], [0, 1, 16]]
	text_1_433.x = 20.010000228881836
	text_1_433.y = 16
	text_1_433.layoutGrow = 1
	text_1_433.hyperlink = null
	text_1_433.autoRename = false
	loadFonts().then((res) => {
		text_1_433.fontName = {
			family: "Inter",
			style: "Regular"
		}
		text_1_433.listSpacing = 0
		text_1_433.characters = "Only layer styles such as: background, color, border radius etc will be used to create tables. You don't have to create tables using the plugin. You can also create tables by creating an instance of this component and detaching them and their rows. If you change the styles used on the table or row components you can update existing tables by going to Plugins > Table Creator > Settings and select Refresh Tables"
		text_1_433.fontSize = 14
		text_1_433.lineHeight = { "unit": "PERCENT", "value": 150 }
		text_1_433.fontName = { "family": "Inter", "style": "Regular" }
		text_1_433.textAutoResize = "HEIGHT"

	})
	component_1_430.appendChild(text_1_433)

	// Create INSTANCE
	var instance_1_434 = component_1_430.createInstance()
	instance_1_434.relativeTransform = [[1, 0, 9080], [0, 1, 4618]]
	instance_1_434.y = 4618
	figma.currentPage.appendChild(instance_1_434)

	// Swap COMPONENT
	instance_1_434.swapComponent(component_1_430)

	// Ref to SUB NODE
	var frame_I1_434_1_431 = figma.getNodeById("I" + instance_1_434.id + ";" + frame_1_431.id)

	// Ref to SUB NODE
	var rectangle_I1_434_1_432 = figma.getNodeById("I" + instance_1_434.id + ";" + rectangle_1_432.id)

	// Ref to SUB NODE
	var text_I1_434_1_433 = figma.getNodeById("I" + instance_1_434.id + ";" + text_1_433.id)
	text_I1_434_1_433.resize(416.9899902344, 63.0000000000)
	loadFonts().then((res) => {
		text_I1_434_1_433.fontName = {
			family: "Inter",
			style: "Regular"
		}
		text_I1_434_1_433.characters = "This component is the template used by the plugin to create tables from. You can customise the appearance of your tables by customising these components."

	})

	// Create INSTANCE
	var instance_1_438 = component_1_430.createInstance()
	instance_1_438.relativeTransform = [[1, 0, 9080], [0, 1, 4843]]
	instance_1_438.y = 4843
	figma.currentPage.appendChild(instance_1_438)

	// Swap COMPONENT
	instance_1_438.swapComponent(component_1_430)

	// Ref to SUB NODE
	var frame_I1_438_1_431 = figma.getNodeById("I" + instance_1_438.id + ";" + frame_1_431.id)

	// Ref to SUB NODE
	var rectangle_I1_438_1_432 = figma.getNodeById("I" + instance_1_438.id + ";" + rectangle_1_432.id)

	// Ref to SUB NODE
	var text_I1_438_1_433 = figma.getNodeById("I" + instance_1_438.id + ";" + text_1_433.id)
	text_I1_438_1_433.resize(416.9899902344, 42.0000000000)
	loadFonts().then((res) => {
		text_I1_438_1_433.fontName = {
			family: "Inter",
			style: "Regular"
		}
		text_I1_438_1_433.characters = " To customise the horizontal borders change the shadow colour."

	})

	// Create INSTANCE
	var instance_1_442 = component_1_430.createInstance()
	instance_1_442.relativeTransform = [[1, 0, 9080], [0, 1, 4998]]
	instance_1_442.y = 4998
	figma.currentPage.appendChild(instance_1_442)

	// Swap COMPONENT
	instance_1_442.swapComponent(component_1_430)

	// Ref to SUB NODE
	var frame_I1_442_1_431 = figma.getNodeById("I" + instance_1_442.id + ";" + frame_1_431.id)

	// Ref to SUB NODE
	var rectangle_I1_442_1_432 = figma.getNodeById("I" + instance_1_442.id + ";" + rectangle_1_432.id)

	// Ref to SUB NODE
	var text_I1_442_1_433 = figma.getNodeById("I" + instance_1_442.id + ";" + text_1_433.id)
	text_I1_442_1_433.resize(416.9899902344, 42.0000000000)
	loadFonts().then((res) => {
		text_I1_442_1_433.fontName = {
			family: "Inter",
			style: "Regular"
		}
		text_I1_442_1_433.characters = "Change the appearance of each cell type by customising these variants."

	})

	// Create INSTANCE
	var instance_102_121 = component_1_430.createInstance()
	instance_102_121.relativeTransform = [[1, 0, 9080], [0, 1, 5152]]
	instance_102_121.y = 5152
	figma.currentPage.appendChild(instance_102_121)

	// Swap COMPONENT
	instance_102_121.swapComponent(component_1_430)

	// Ref to SUB NODE
	var frame_I102_121_1_431 = figma.getNodeById("I" + instance_102_121.id + ";" + frame_1_431.id)

	// Ref to SUB NODE
	var rectangle_I102_121_1_432 = figma.getNodeById("I" + instance_102_121.id + ";" + rectangle_1_432.id)

	// Ref to SUB NODE
	var text_I102_121_1_433 = figma.getNodeById("I" + instance_102_121.id + ";" + text_1_433.id)
	text_I102_121_1_433.resize(416.9899902344, 42.0000000000)
	loadFonts().then((res) => {
		text_I102_121_1_433.fontName = {
			family: "Inter",
			style: "Regular"
		}
		text_I102_121_1_433.characters = "Change the deafult appearance of all cells by customising this base component."

	})

	// Remove table border component from canvas
	component_1_351.remove()

	// Remove tooltip component from canvas
	component_1_430.remove()

	setPluginData(component_1_378, "elementSemantics", { is: "table" })
	setPluginData(component_1_365, "elementSemantics", { is: "tr" })
	setPluginData(component_101_204, "elementSemantics", { is: "td" })
	setPluginData(component_101_265, "elementSemantics", { is: "th" })

	// Manually add properties so cells will fill row height
	instance_1_372.layoutAlign = "STRETCH"
	instance_1_366.layoutAlign = "STRETCH"
	instance_101_198.layoutAlign = "STRETCH"
	instance_101_266.layoutAlign = "STRETCH"

	obj.table = component_1_378
	obj.row = component_1_365
	obj.cell = component_101_204
	obj.headerCell = component_101_265
	obj.cellSet = componentSet_1_364
	obj.baseCell = component_101_119
	obj.instances = [
		instance_1_442,
		instance_102_121,
		instance_1_438,
		instance_1_434
	]
	// component_1_5.setRelaunchData({ selectColumn: 'Select all cells in column', selectRow: 'Select all cells in row' })
	// component_1_13.setPluginData("isCellHeader", "true")
	// component_1_13.setRelaunchData({ selectColumn: 'Select all cells in column', selectRow: 'Select all cells in row' })
	// component_1_21.setPluginData("isRow", "true")
	// component_1_35.setRelaunchData({ detachTable: 'Detaches table and rows' })

	return obj
}
