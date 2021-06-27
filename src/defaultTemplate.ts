import { ungroupNode } from "./helpers"
import { setPluginData, updatePluginData } from '@figlets/helpers'

// Load FONTS
async function loadFonts() {
	await Promise.all([
		figma.loadFontAsync({
			family: "Roboto",
			style: "Regular"
		})
	])
}

export function createDefaultTemplate() {
	const obj: any = {}

	var tempContainer = figma.createFrame()
	tempContainer.fills = []
	tempContainer.clipsContent = false

	// Create TEXT
	var text_4_43 = figma.createText()
	text_4_43.resize(250.0000000000, 98.0000000000)
	text_4_43.name = "Customise the following components to create bespoke tables. Or to link using your own components go to Plugins > Table Creator > Settings. You can move and rename the components as you wish. The only component which must exist for the plugin to work is the Cell component."
	text_4_43.layoutAlign = "STRETCH"
	loadFonts().then((res) => {
		text_4_43.fontName = {
			family: "Roboto",
			style: "Regular"
		}
		text_4_43.characters = "Customise the following components to create bespoke tables. Or to link using your own components go to Plugins > Table Creator > Settings. You can move and rename the components as you wish. The only component which must exist for the plugin to work is the Cell component."
		text_4_43.textAutoResize = "HEIGHT"

	})
	tempContainer.appendChild(text_4_43)

	// Create TEXT
	var text_4_52 = figma.createText()
	text_4_52.resize(250.0000000000, 70.0000000000)
	text_4_52.name = "The Cell component is the only component required for Table Creator to create tables from. You can cutomise this component, or link the plugin to a different Cell component by running Plugins > Table Creator > Settings."
	text_4_52.relativeTransform = [[1, 0, 300], [0, 1, 200]]
	text_4_52.x = 300
	text_4_52.y = 200
	text_4_52.layoutAlign = "STRETCH"
	loadFonts().then((res) => {
		text_4_52.fontName = {
			family: "Roboto",
			style: "Regular"
		}
		text_4_52.characters = "The Cell component is the only component required for Table Creator to create tables from. You can cutomise this component, or link the plugin to a different Cell component by running Plugins > Table Creator > Settings."
		text_4_52.textAutoResize = "HEIGHT"

	})
	tempContainer.appendChild(text_4_52)

	// Create COMPONENT
	var component_4_48 = figma.createComponent()
	component_4_48.resize(100.0000000000, 34.0099983215)
	component_4_48.name = "Type=Default"
	component_4_48.layoutAlign = "STRETCH"
	component_4_48.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.00009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }]
	component_4_48.primaryAxisSizingMode = "FIXED"
	component_4_48.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.00009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }]
	component_4_48.layoutMode = "VERTICAL"
	component_4_48.description = ""

	component_4_48.setPluginData("isCell", "true")

	obj.cell = component_4_48
	obj.cell.setRelaunchData({ selectColumn: 'Select all cells in column', selectRow: 'Select all cells in row' })

	// Create FRAME
	var frame_4_49 = figma.createFrame()
	frame_4_49.resizeWithoutConstraints(100.0000000000, 0.01)
	frame_4_49.locked = true
	frame_4_49.layoutAlign = "STRETCH"
	frame_4_49.fills = []
	frame_4_49.backgrounds = []
	frame_4_49.clipsContent = false
	component_4_48.appendChild(frame_4_49)

	// Create COMPONENT
	var component_6_0 = figma.createComponent()
	component_6_0.name = "Table Border"
	component_6_0.constraints = { "horizontal": "STRETCH", "vertical": "STRETCH" }
	component_6_0.description = ""

	// Create LINE
	var line_6_1 = figma.createLine()
	line_6_1.resizeWithoutConstraints(10000.0000000000, 0.0000000000)
	line_6_1.strokes = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.7254902124404907, "g": 0.7254902124404907, "b": 0.7254902124404907 } }]
	line_6_1.constraints = { "horizontal": "STRETCH", "vertical": "STRETCH" }
	component_6_0.appendChild(line_6_1)

	// Create INSTANCE
	var instance_4_46 = component_6_0.createInstance()
	instance_4_46.relativeTransform = [[0, -1, 0], [1, 0, -5000]]
	instance_4_46.y = -5000
	instance_4_46.rotation = -90
	instance_4_46.expanded = false
	instance_4_46.constraints = { "horizontal": "MIN", "vertical": "MIN" }
	frame_4_49.appendChild(instance_4_46)

	// Create FRAME
	var frame_4_50 = figma.createFrame()
	frame_4_50.resize(100.0000000000, 34.0000000000)
	frame_4_50.name = "Content"
	frame_4_50.relativeTransform = [[1, 0, 0], [0, 1, 0.0099999998]]
	frame_4_50.y = 0.009999999776482582
	frame_4_50.layoutAlign = "STRETCH"
	frame_4_50.fills = []
	frame_4_50.paddingLeft = 8
	frame_4_50.paddingRight = 8
	frame_4_50.paddingTop = 10
	frame_4_50.paddingBottom = 10
	frame_4_50.backgrounds = []
	frame_4_50.layoutMode = "VERTICAL"
	component_4_48.appendChild(frame_4_50)

	// Create TEXT
	var text_4_51 = figma.createText()
	text_4_51.resize(84.0000000000, 14.0000000000)
	text_4_51.relativeTransform = [[1, 0, 8], [0, 1, 10]]
	text_4_51.x = 8
	text_4_51.y = 10
	text_4_51.layoutAlign = "STRETCH"
	loadFonts().then((res) => {
		text_4_51.fontName = {
			family: "Roboto",
			style: "Regular"
		}
		text_4_51.characters = ""
		text_4_51.textAutoResize = "HEIGHT"

	})
	frame_4_50.appendChild(text_4_51)

	// Create COMPONENT
	var component_4_53 = figma.createComponent()
	component_4_53.resize(100.0000000000, 34.0099983215)
	component_4_53.name = "Type=Header"
	component_4_53.relativeTransform = [[1, 0, 116], [0, 1, 8.391e-7]]
	component_4_53.x = 116
	component_4_53.y = 8.391216397285461e-7
	component_4_53.layoutAlign = "STRETCH"
	component_4_53.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.05000000074505806, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }]
	component_4_53.primaryAxisSizingMode = "FIXED"
	component_4_53.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.05000000074505806, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }]
	component_4_53.layoutMode = "VERTICAL"
	component_4_53.description = ""

	component_4_53.setPluginData("isCellHeader", "true")

	obj.cellHeader = component_4_53
	obj.cellHeader.setRelaunchData({ selectColumn: 'Select all cells in column', selectRow: 'Select all cells in row' })

	// Create INSTANCE
	var instance_4_54 = component_4_48.createInstance()
	instance_4_54.name = "Table/Cell"
	instance_4_54.fills = []
	instance_4_54.primaryAxisSizingMode = "AUTO"
	instance_4_54.backgrounds = []
	component_4_53.appendChild(instance_4_54)

	// Create COMPONENT_SET
	var componentSet_4_60 = figma.combineAsVariants([component_4_48, component_4_53], tempContainer)
	componentSet_4_60.resize(216.0000000000, 34.0099983215)
	componentSet_4_60.name = "Table/Cell"
	componentSet_4_60.visible = true
	componentSet_4_60.locked = false
	componentSet_4_60.opacity = 1
	componentSet_4_60.blendMode = "PASS_THROUGH"
	componentSet_4_60.isMask = false
	componentSet_4_60.effects = []
	componentSet_4_60.relativeTransform = [[1, 0, 0], [0, 1, 200]]
	componentSet_4_60.x = 0
	componentSet_4_60.y = 200
	componentSet_4_60.rotation = 0
	componentSet_4_60.layoutAlign = "INHERIT"
	componentSet_4_60.constrainProportions = false
	componentSet_4_60.layoutGrow = 0
	componentSet_4_60.exportSettings = []
	componentSet_4_60.fills = []
	componentSet_4_60.strokes = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.48235294222831726, "g": 0.3803921639919281, "b": 1 } }]
	componentSet_4_60.strokeWeight = 1
	componentSet_4_60.strokeAlign = "INSIDE"
	componentSet_4_60.strokeCap = "NONE"
	componentSet_4_60.strokeJoin = "MITER"
	componentSet_4_60.strokeMiterLimit = 4
	componentSet_4_60.dashPattern = [10, 5]
	componentSet_4_60.cornerRadius = 5
	componentSet_4_60.cornerSmoothing = 0
	componentSet_4_60.paddingLeft = 0
	componentSet_4_60.paddingRight = 0
	componentSet_4_60.paddingTop = 0
	componentSet_4_60.paddingBottom = 0
	componentSet_4_60.primaryAxisAlignItems = "MIN"
	componentSet_4_60.counterAxisAlignItems = "MIN"
	componentSet_4_60.primaryAxisSizingMode = "AUTO"
	componentSet_4_60.layoutGrids = []
	componentSet_4_60.backgrounds = []
	componentSet_4_60.clipsContent = true
	componentSet_4_60.guides = []
	componentSet_4_60.expanded = true
	componentSet_4_60.constraints = { "horizontal": "MIN", "vertical": "MIN" }
	componentSet_4_60.layoutMode = "HORIZONTAL"
	componentSet_4_60.counterAxisSizingMode = "AUTO"
	componentSet_4_60.itemSpacing = 16
	componentSet_4_60.description = ""

	// Create COMPONENT
	var component_4_61 = figma.createComponent()
	component_4_61.resize(200.0000000000, 34.0099983215)
	component_4_61.name = "Table/Row"
	component_4_61.effects = [{ "type": "INNER_SHADOW", "color": { "r": 0.7254902124404907, "g": 0.7254902124404907, "b": 0.7254902124404907, "a": 1 }, "offset": { "x": 0, "y": 1 }, "radius": 0, "spread": 0, "visible": true, "blendMode": "NORMAL" }]
	component_4_61.relativeTransform = [[1, 0, 0], [0, 1, 400]]
	component_4_61.y = 400
	component_4_61.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.00009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }]
	component_4_61.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.00009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }]
	component_4_61.clipsContent = true
	component_4_61.layoutMode = "HORIZONTAL"
	component_4_61.counterAxisSizingMode = "AUTO"
	component_4_61.description = ""

	component_4_61.setPluginData("isRow", "true")

	tempContainer.appendChild(component_4_61)
	obj.row = component_4_61


	// Create INSTANCE
	var instance_4_62 = component_4_48.createInstance()
	instance_4_62.name = "Table/Cell"
	instance_4_62.expanded = false
	component_4_61.appendChild(instance_4_62)

	// Create INSTANCE
	var instance_4_68 = component_4_48.createInstance()
	instance_4_68.name = "Table/Cell"
	instance_4_68.relativeTransform = [[1, 0, 100], [0, 1, 8.391e-7]]
	instance_4_68.x = 100
	instance_4_68.y = 8.391216397285461e-7
	instance_4_68.expanded = false
	component_4_61.appendChild(instance_4_68)

	// Create TEXT
	var text_4_74 = figma.createText()
	text_4_74.resize(250.0000000000, 42.0000000000)
	text_4_74.name = "Only layer styles such as: background, color, border radius etc will be used for rows when creating tables."
	text_4_74.relativeTransform = [[1, 0, 300], [0, 1, 400]]
	text_4_74.x = 300
	text_4_74.y = 400
	text_4_74.layoutAlign = "STRETCH"
	loadFonts().then((res) => {
		text_4_74.fontName = {
			family: "Roboto",
			style: "Regular"
		}
		text_4_74.characters = "Only layer styles such as: background, color, border radius etc will be used for rows when creating tables."
		text_4_74.textAutoResize = "HEIGHT"

	})
	tempContainer.appendChild(text_4_74)

	// Create COMPONENT
	var component_4_75 = figma.createComponent()
	component_4_75.resize(200.0000000000, 68.0199966431)
	component_4_75.name = "Table"
	component_4_75.relativeTransform = [[1, 0, 0], [0, 1, 600]]
	component_4_75.y = 600
	component_4_75.fills = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }]
	component_4_75.strokes = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.7254902124404907, "g": 0.7254902124404907, "b": 0.7254902124404907 } }]
	component_4_75.cornerRadius = 2
	component_4_75.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }]
	component_4_75.clipsContent = true
	component_4_75.layoutMode = "VERTICAL"
	component_4_75.counterAxisSizingMode = "AUTO"
	component_4_75.description = ""

	// component_4_75.setPluginData("isTable", "true")
	// setPluginData(component_4_75, "template", {
	// 	name: component_4_75.name,
	// 	component: {
	// 		key: component_4_75.key,
	// 		id: component_4_75.id
	// 	}
	// })

	tempContainer.appendChild(component_4_75)
	obj.table = component_4_75
	obj.table.setRelaunchData({ detachTable: 'Detaches table and rows' })

	// Create INSTANCE
	var instance_4_76 = component_4_61.createInstance()
	instance_4_76.relativeTransform = [[1, 0, 0], [0, 1, 0]]
	instance_4_76.expanded = false
	component_4_75.appendChild(instance_4_76)

	// Create INSTANCE
	var instance_4_89 = component_4_61.createInstance()
	instance_4_89.relativeTransform = [[1, 0, 0], [0, 1, 34.0099983215]]
	instance_4_89.y = 34.0099983215332
	instance_4_89.expanded = false
	component_4_75.appendChild(instance_4_89)

	// Create TEXT
	var text_4_102 = figma.createText()
	text_4_102.resize(250.0000000000, 140.0000000000)
	text_4_102.name = "Only layer styles such as: background, color, border radius etc will be used to create tables. You don't have to create tables using the plugin. You can also create tables by creating an instance of this component and detaching them and their rows. If you change the styles used on the table or row components you can update existing tables by going to Plugins > Table Creator > Settings and select Refresh Tables"
	text_4_102.relativeTransform = [[1, 0, 300], [0, 1, 600]]
	text_4_102.x = 300
	text_4_102.y = 600
	text_4_102.layoutAlign = "STRETCH"
	loadFonts().then((res) => {
		text_4_102.fontName = {
			family: "Roboto",
			style: "Regular"
		}
		text_4_102.characters = "Only layer styles such as: background, color, border radius etc will be used to create tables. You don't have to create tables using the plugin. You can also create tables by creating an instance of this component and detaching them and their rows. If you change the styles used on the table or row components you can update existing tables by going to Plugins > Table Creator > Settings and select Refresh Tables"
		text_4_102.textAutoResize = "HEIGHT"

	})
	tempContainer.appendChild(text_4_102)

	// Remove table border component from canvas
	component_6_0.remove()

	ungroupNode(tempContainer, figma.currentPage)

	return obj
}
