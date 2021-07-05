import { ungroupNode } from "./helpers"
import { setPluginData, updatePluginData } from '@figlets/helpers'

// Load FONTS
async function loadFonts() {
	await Promise.all([
		figma.loadFontAsync({
			family: "Roboto",
			style: "Regular"
		}), figma.loadFontAsync({
			family: "Inter",
			style: "Regular"
		})
	])
}

// Wrap in function
export function createDefaultTemplate() {
	const obj: any = {}

	// Create COMPONENT
	var component_1_5 = figma.createComponent()
	component_1_5.resize(100.0000000000, 34.0099983215)
	component_1_5.name = "Type=Default"
	component_1_5.layoutAlign = "STRETCH"
	component_1_5.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.00009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }]
	component_1_5.primaryAxisSizingMode = "FIXED"
	component_1_5.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.00009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }]
	component_1_5.layoutMode = "VERTICAL"
	component_1_5.description = ""
	component_1_5.documentationLinks = []
	obj.component_1_5 = component_1_5

	// Create FRAME
	var frame_1_6 = figma.createFrame()
	frame_1_6.resizeWithoutConstraints(100.0000000000, 0.01)
	frame_1_6.locked = true
	frame_1_6.layoutAlign = "STRETCH"
	frame_1_6.fills = []
	frame_1_6.backgrounds = []
	frame_1_6.clipsContent = false
	obj.frame_1_6 = frame_1_6
	component_1_5.appendChild(frame_1_6)

	// Create COMPONENT
	var component_28_2393 = figma.createComponent()
	component_28_2393.name = "Table Border"
	component_28_2393.relativeTransform = [[1, 0, 8227], [0, 1, 5078]]
	component_28_2393.x = 8227
	component_28_2393.y = 5078
	component_28_2393.constraints = { "horizontal": "STRETCH", "vertical": "STRETCH" }
	component_28_2393.description = ""
	component_28_2393.documentationLinks = []
	obj.component_28_2393 = component_28_2393

	// Create LINE
	var line_28_2394 = figma.createLine()
	line_28_2394.resizeWithoutConstraints(10000.0000000000, 0.0000000000)
	line_28_2394.strokes = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.7254902124404907, "g": 0.7254902124404907, "b": 0.7254902124404907 } }]
	line_28_2394.constraints = { "horizontal": "STRETCH", "vertical": "STRETCH" }
	obj.line_28_2394 = line_28_2394
	component_28_2393.appendChild(line_28_2394)

	// Create INSTANCE
	var instance_1_9 = component_28_2393.createInstance()
	instance_1_9.relativeTransform = [[0, -1, 0], [1, 0, -5000]]
	instance_1_9.y = -5000
	instance_1_9.rotation = -90
	instance_1_9.expanded = false
	instance_1_9.constraints = { "horizontal": "MIN", "vertical": "MIN" }
	obj.instance_1_9 = instance_1_9
	frame_1_6.appendChild(instance_1_9)

	// Create FRAME
	var frame_1_11 = figma.createFrame()
	frame_1_11.resize(100.0000000000, 34.0000000000)
	frame_1_11.name = "Content"
	frame_1_11.relativeTransform = [[1, 0, 0], [0, 1, 0.0099999998]]
	frame_1_11.y = 0.009999999776482582
	frame_1_11.layoutAlign = "STRETCH"
	frame_1_11.fills = []
	frame_1_11.paddingLeft = 8
	frame_1_11.paddingRight = 8
	frame_1_11.paddingTop = 10
	frame_1_11.paddingBottom = 10
	frame_1_11.backgrounds = []
	frame_1_11.expanded = false
	frame_1_11.layoutMode = "VERTICAL"
	obj.frame_1_11 = frame_1_11
	component_1_5.appendChild(frame_1_11)

	// Create TEXT
	var text_1_12 = figma.createText()
	text_1_12.resize(84.0000000000, 14.0000000000)
	text_1_12.relativeTransform = [[1, 0, 8], [0, 1, 10]]
	text_1_12.x = 8
	text_1_12.y = 10
	text_1_12.layoutAlign = "STRETCH"
	text_1_12.hyperlink = null
	loadFonts().then((res) => {
		text_1_12.fontName = {
			family: "Roboto",
			style: "Regular"
		}
		text_1_12.characters = ""
		text_1_12.textAutoResize = "HEIGHT"

	})
	obj.text_1_12 = text_1_12
	frame_1_11.appendChild(text_1_12)

	// Create COMPONENT
	var component_1_13 = figma.createComponent()
	component_1_13.resize(100.0000000000, 34.0099983215)
	component_1_13.name = "Type=Header"
	component_1_13.relativeTransform = [[1, 0, 100], [0, 1, 8.391e-7]]
	component_1_13.x = 100
	component_1_13.y = 8.391216397285461e-7
	component_1_13.layoutAlign = "STRETCH"
	component_1_13.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.05000000074505806, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }]
	component_1_13.primaryAxisSizingMode = "FIXED"
	component_1_13.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.05000000074505806, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }]
	component_1_13.layoutMode = "VERTICAL"
	component_1_13.description = ""
	component_1_13.documentationLinks = []
	obj.component_1_13 = component_1_13

	// Create INSTANCE
	var instance_1_14 = component_1_5.createInstance()
	instance_1_14.name = "Table/Cell"
	instance_1_14.layoutAlign = "INHERIT"
	instance_1_14.fills = []
	instance_1_14.primaryAxisSizingMode = "AUTO"
	instance_1_14.backgrounds = []
	obj.instance_1_14 = instance_1_14
	component_1_13.appendChild(instance_1_14)

	// Create COMPONENT_SET
	var componentSet_1_20 = figma.combineAsVariants([component_1_5, component_1_13], figma.currentPage)
	componentSet_1_20.resize(200.0000000000, 34.0099983215)
	componentSet_1_20.name = "_Cell"
	componentSet_1_20.visible = true
	componentSet_1_20.locked = false
	componentSet_1_20.opacity = 1
	componentSet_1_20.blendMode = "PASS_THROUGH"
	componentSet_1_20.isMask = false
	componentSet_1_20.effects = []
	componentSet_1_20.relativeTransform = [[1, 0, 8735], [0, 1, 4835]]
	componentSet_1_20.x = 8735
	componentSet_1_20.y = 4835
	componentSet_1_20.rotation = 0
	componentSet_1_20.layoutAlign = "INHERIT"
	componentSet_1_20.constrainProportions = false
	componentSet_1_20.layoutGrow = 0
	componentSet_1_20.exportSettings = []
	componentSet_1_20.fills = []
	componentSet_1_20.strokes = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.48235294222831726, "g": 0.3803921639919281, "b": 1 } }]
	componentSet_1_20.strokeWeight = 1
	componentSet_1_20.strokeAlign = "INSIDE"
	componentSet_1_20.strokeJoin = "MITER"
	componentSet_1_20.dashPattern = [10, 5]
	componentSet_1_20.strokeCap = "NONE"
	componentSet_1_20.strokeMiterLimit = 4
	componentSet_1_20.cornerRadius = 5
	componentSet_1_20.cornerSmoothing = 0
	componentSet_1_20.paddingLeft = 0
	componentSet_1_20.paddingRight = 0
	componentSet_1_20.paddingTop = 0
	componentSet_1_20.paddingBottom = 0
	componentSet_1_20.primaryAxisAlignItems = "MIN"
	componentSet_1_20.counterAxisAlignItems = "MIN"
	componentSet_1_20.primaryAxisSizingMode = "AUTO"
	componentSet_1_20.layoutGrids = []
	componentSet_1_20.backgrounds = []
	componentSet_1_20.clipsContent = true
	componentSet_1_20.guides = []
	componentSet_1_20.expanded = true
	componentSet_1_20.constraints = { "horizontal": "MIN", "vertical": "MIN" }
	componentSet_1_20.layoutMode = "HORIZONTAL"
	componentSet_1_20.counterAxisSizingMode = "AUTO"
	componentSet_1_20.itemSpacing = 0
	componentSet_1_20.description = ""
	componentSet_1_20.documentationLinks = []
	obj.componentSet_1_20 = componentSet_1_20

	// Create COMPONENT
	var component_1_21 = figma.createComponent()
	component_1_21.resize(200.0000000000, 34.0099983215)
	component_1_21.name = "_Row"
	component_1_21.effects = [{ "type": "INNER_SHADOW", "color": { "r": 0.7254902124404907, "g": 0.7254902124404907, "b": 0.7254902124404907, "a": 1 }, "offset": { "x": 0, "y": 1 }, "radius": 0, "spread": 0, "visible": true, "blendMode": "NORMAL" }]
	component_1_21.relativeTransform = [[1, 0, 8735], [0, 1, 4655]]
	component_1_21.x = 8735
	component_1_21.y = 4655
	component_1_21.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.00009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }]
	component_1_21.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.00009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }]
	component_1_21.clipsContent = true
	component_1_21.layoutMode = "HORIZONTAL"
	component_1_21.counterAxisSizingMode = "AUTO"
	component_1_21.description = ""
	component_1_21.documentationLinks = []
	obj.component_1_21 = component_1_21
	figma.currentPage.appendChild(component_1_21)

	// Create INSTANCE
	var instance_1_22 = component_1_5.createInstance()
	instance_1_22.name = "_Cell"
	instance_1_22.layoutAlign = "INHERIT"
	instance_1_22.expanded = false
	obj.instance_1_22 = instance_1_22
	component_1_21.appendChild(instance_1_22)

	// Create INSTANCE
	var instance_1_28 = component_1_5.createInstance()
	instance_1_28.name = "_Cell"
	instance_1_28.relativeTransform = [[1, 0, 100], [0, 1, 8.391e-7]]
	instance_1_28.x = 100
	instance_1_28.y = 8.391216397285461e-7
	instance_1_28.layoutAlign = "INHERIT"
	instance_1_28.expanded = false
	obj.instance_1_28 = instance_1_28
	component_1_21.appendChild(instance_1_28)

	// Create COMPONENT
	var component_1_35 = figma.createComponent()
	component_1_35.resize(200.0000000000, 102.0299987793)
	component_1_35.name = "Template"
	component_1_35.relativeTransform = [[1, 0, 8735], [0, 1, 4447]]
	component_1_35.x = 8735
	component_1_35.y = 4447
	component_1_35.fills = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }]
	component_1_35.strokes = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.7254902124404907, "g": 0.7254902124404907, "b": 0.7254902124404907 } }]
	component_1_35.strokeWeight = 2
	component_1_35.cornerRadius = 2
	component_1_35.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }]
	component_1_35.clipsContent = true
	component_1_35.layoutMode = "VERTICAL"
	component_1_35.counterAxisSizingMode = "AUTO"
	component_1_35.description = ""
	component_1_35.documentationLinks = []
	obj.component_1_35 = component_1_35
	figma.currentPage.appendChild(component_1_35)

	// Create INSTANCE
	var instance_1_36 = component_1_21.createInstance()
	instance_1_36.relativeTransform = [[1, 0, 0], [0, 1, 0]]
	obj.instance_1_36 = instance_1_36
	component_1_35.appendChild(instance_1_36)

	// Create INSTANCE
	var instance_15_3860 = component_1_21.createInstance()
	instance_15_3860.relativeTransform = [[1, 0, 0], [0, 1, 34.0099983215]]
	instance_15_3860.y = 34.0099983215332
	obj.instance_15_3860 = instance_15_3860
	component_1_35.appendChild(instance_15_3860)

	// Create INSTANCE
	var instance_1_49 = component_1_21.createInstance()
	instance_1_49.relativeTransform = [[1, 0, 0], [0, 1, 68.0199966431]]
	instance_1_49.y = 68.0199966430664
	obj.instance_1_49 = instance_1_49
	component_1_35.appendChild(instance_1_49)

	// Create COMPONENT
	var component_15_3841 = figma.createComponent()
	component_15_3841.resize(457.0000000000, 179.0000000000)
	component_15_3841.name = "Tooltip"
	component_15_3841.effects = [{ "type": "DROP_SHADOW", "color": { "r": 0.9666666388511658, "g": 0.15708333253860474, "b": 0.15708333253860474, "a": 0.09000000357627869 }, "offset": { "x": 0, "y": 16 }, "radius": 8, "spread": 0, "visible": false, "blendMode": "NORMAL" }]
	component_15_3841.relativeTransform = [[1, 0, 8991], [0, 1, 4134]]
	component_15_3841.x = 8991
	component_15_3841.y = 4134
	component_15_3841.fills = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }, { "type": "GRADIENT_LINEAR", "visible": true, "opacity": 1, "blendMode": "NORMAL", "gradientStops": [{ "color": { "r": 0, "g": 0, "b": 0, "a": 1 }, "position": 0 }, { "color": { "r": 0.26249998807907104, "g": 0.26249998807907104, "b": 0.26249998807907104, "a": 1 }, "position": 1 }], "gradientTransform": [[0.37368255853652954, 0.4259088337421417, 0.21073251962661743], [-0.0000021187263428146252, 0.0000018692335288506001, 0.5000001788139343]] }]
	component_15_3841.cornerRadius = 8
	component_15_3841.paddingLeft = 20
	component_15_3841.paddingRight = 20
	component_15_3841.paddingTop = 16
	component_15_3841.paddingBottom = 16
	component_15_3841.primaryAxisSizingMode = "FIXED"
	component_15_3841.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }, { "type": "GRADIENT_LINEAR", "visible": true, "opacity": 1, "blendMode": "NORMAL", "gradientStops": [{ "color": { "r": 0, "g": 0, "b": 0, "a": 1 }, "position": 0 }, { "color": { "r": 0.26249998807907104, "g": 0.26249998807907104, "b": 0.26249998807907104, "a": 1 }, "position": 1 }], "gradientTransform": [[0.37368255853652954, 0.4259088337421417, 0.21073251962661743], [-0.0000021187263428146252, 0.0000018692335288506001, 0.5000001788139343]] }]
	component_15_3841.layoutMode = "HORIZONTAL"
	component_15_3841.counterAxisSizingMode = "AUTO"
	component_15_3841.description = ""
	component_15_3841.documentationLinks = []
	obj.component_15_3841 = component_15_3841
	figma.currentPage.appendChild(component_15_3841)

	// Create FRAME
	var frame_15_3838 = figma.createFrame()
	frame_15_3838.resizeWithoutConstraints(0.01, 0.01)
	frame_15_3838.name = "Frame 2"
	frame_15_3838.relativeTransform = [[1, 0, 20], [0, 1, 16]]
	frame_15_3838.x = 20
	frame_15_3838.y = 16
	frame_15_3838.fills = []
	frame_15_3838.backgrounds = []
	frame_15_3838.clipsContent = false
	obj.frame_15_3838 = frame_15_3838
	component_15_3841.appendChild(frame_15_3838)

	// Create RECTANGLE
	var rectangle_15_3839 = figma.createRectangle()
	rectangle_15_3839.resize(15.5563220978, 15.5563220978)
	rectangle_15_3839.name = "Rectangle 1"
	rectangle_15_3839.fills = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.0784313753247261, "g": 0.0784313753247261, "b": 0.0784313753247261 } }]
	rectangle_15_3839.relativeTransform = [[0.7071067691, -0.7071067691, -19.1801757812], [0.7071067691, 0.7071067691, 1.8198242188]]
	rectangle_15_3839.x = -19.18017578125
	rectangle_15_3839.y = 1.81982421875
	rectangle_15_3839.rotation = -45
	rectangle_15_3839.constrainProportions = true
	obj.rectangle_15_3839 = rectangle_15_3839
	frame_15_3838.appendChild(rectangle_15_3839)

	// Create TEXT
	var text_15_3840 = figma.createText()
	text_15_3840.resize(416.9989929199, 147.0000000000)
	text_15_3840.name = "Only layer styles such as: background, color, border radius etc will be used to create tables. You don't have to create tables using the plugin. You can also create tables by creating an instance of this component and detaching them and their rows. If you change the styles used on the table or row components you can update existing tables by going to Plugins > Table Creator > Settings and select Refresh Tables"
	text_15_3840.fills = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }]
	text_15_3840.relativeTransform = [[1, 0, 20.0009994507], [0, 1, 16]]
	text_15_3840.x = 20.000999450683594
	text_15_3840.y = 16
	text_15_3840.layoutGrow = 1
	text_15_3840.hyperlink = null
	text_15_3840.autoRename = false
	loadFonts().then((res) => {
		text_15_3840.fontName = {
			family: "Inter",
			style: "Regular"
		}
		text_15_3840.characters = "Only layer styles such as: background, color, border radius etc will be used to create tables. You don't have to create tables using the plugin. You can also create tables by creating an instance of this component and detaching them and their rows. If you change the styles used on the table or row components you can update existing tables by going to Plugins > Table Creator > Settings and select Refresh Tables"
		text_15_3840.fontSize = 14
		text_15_3840.lineHeight = { "unit": "PERCENT", "value": 150 }
		text_15_3840.fontName = { "family": "Inter", "style": "Regular" }
		text_15_3840.textAutoResize = "HEIGHT"

	})
	obj.text_15_3840 = text_15_3840
	component_15_3841.appendChild(text_15_3840)

	// Create INSTANCE
	var instance_15_3842 = component_15_3841.createInstance()
	instance_15_3842.resize(457.0000000000, 137.0000000000)
	instance_15_3842.name = "Frame 2"
	instance_15_3842.relativeTransform = [[1, 0, 8991], [0, 1, 4435]]
	instance_15_3842.y = 4435
	obj.instance_15_3842 = instance_15_3842
	figma.currentPage.appendChild(instance_15_3842)

	loadFonts().then((res) => {
		instance_15_3842.children[1].characters = "This component is the template used by the plugin to create tables from. You can customise the appearance of your tables by customizing the components below. There are a number of features and ways to the use the plugin. Check out this short video to get started."

	})

	// Create INSTANCE
	var instance_15_3846 = component_15_3841.createInstance()
	instance_15_3846.resize(457.0000000000, 53.0000000000)
	instance_15_3846.name = "Frame 3"
	instance_15_3846.relativeTransform = [[1, 0, 8991], [0, 1, 4823]]
	instance_15_3846.y = 4823
	obj.instance_15_3846 = instance_15_3846
	figma.currentPage.appendChild(instance_15_3846)

	loadFonts().then((res) => {
		instance_15_3846.children[1].characters = "Change the appearance of cells by customising these variants."
	})

	// Create INSTANCE
	var instance_15_3850 = component_15_3841.createInstance()
	instance_15_3850.resize(457.0000000000, 95.0000000000)
	instance_15_3850.name = "Frame 4"
	instance_15_3850.relativeTransform = [[1, 0, 8991], [0, 1, 4643]]
	instance_15_3850.y = 4643
	obj.instance_15_3850 = instance_15_3850
	figma.currentPage.appendChild(instance_15_3850)

	loadFonts().then((res) => {
		instance_15_3850.children[1].characters = "Change the appearance of rows by customising this component. Change the shadow color to customise the horizontal borders."
	})

	// Remove table border component from canvas
	component_28_2393.remove()

	// Remove tooltip component from canvas
	component_15_3841.remove()

	obj.componentSet_1_20.setPluginData("isCell", "true")
	obj.componentSet_1_20.setRelaunchData({ selectColumn: 'Select all cells in column', selectRow: 'Select all cells in row' })
	obj.component_1_13.setPluginData("isCellHeader", "true")
	obj.component_1_13.setRelaunchData({ selectColumn: 'Select all cells in column', selectRow: 'Select all cells in row' })
	obj.component_1_21.setPluginData("isRow", "true")
	obj.component_1_35.setRelaunchData({ detachTable: 'Detaches table and rows' })

	obj.table = component_1_35

	return obj
}
