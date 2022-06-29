import { setPluginData, updatePluginData } from '@fignite/helpers'

function isTheme(color) {
	/*
	From this W3C document: http://www.webmasterworld.com/r.cgi?f=88&d=9769&url=http://www.w3.org/TR/AERT#color-contrast
	Color brightness is determined by the following formula:
	((Red value X 299) + (Green value X 587) + (Blue value X 114)) / 1000
	*/
	var threshold = 160 /* about half of 256. Lower threshold equals more dark text on dark background  */
	var cBrightness = (color.r * 255 * 299 + color.g * 255 * 587 + color.b * 255 * 114) / 1000

	if (cBrightness > threshold || figma.editorType === 'figjam') {
		return 'light'
	} else {
		return 'dark'
	}
}

export async function createTooltip(text, color?) {
	let theme = 'light'

	if (isTheme(color || figma.currentPage.backgrounds[0].color) === 'dark') {
		theme = 'dark'
	}

	// Load FONTS
	async function loadFonts() {
		await Promise.all([
			figma.loadFontAsync({
				family: 'Inter',
				style: 'Regular',
			}),
		])
	}

	await loadFonts()

	// Create COMPONENT
	var component_305_199 = figma.createComponent()
	component_305_199.resize(457.0, 53.0)
	component_305_199.counterAxisSizingMode = 'AUTO'
	component_305_199.name = '.Tooltip'
	component_305_199.relativeTransform = [
		[1, 0, 13222],
		[0, 1, 7008],
	]
	component_305_199.x = 13222
	component_305_199.y = 7008
	component_305_199.fills = []
	component_305_199.cornerRadius = 8
	component_305_199.primaryAxisSizingMode = 'FIXED'
	component_305_199.strokeTopWeight = 1
	component_305_199.strokeBottomWeight = 1
	component_305_199.strokeLeftWeight = 1
	component_305_199.strokeRightWeight = 1
	component_305_199.backgrounds = []
	component_305_199.expanded = false
	component_305_199.layoutMode = 'HORIZONTAL'
	component_305_199.counterAxisSizingMode = 'AUTO'

	// Create FRAME
	var frame_305_200 = figma.createFrame()
	component_305_199.appendChild(frame_305_200)
	frame_305_200.resize(457.0, 53.0)
	frame_305_200.primaryAxisSizingMode = 'AUTO'
	frame_305_200.name = 'Artwork'
	frame_305_200.layoutPositioning = 'ABSOLUTE'
	frame_305_200.fills = []
	frame_305_200.strokeTopWeight = 1
	frame_305_200.strokeBottomWeight = 1
	frame_305_200.strokeLeftWeight = 1
	frame_305_200.strokeRightWeight = 1
	frame_305_200.backgrounds = []
	frame_305_200.clipsContent = false
	frame_305_200.expanded = false
	frame_305_200.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' }

	// Create RECTANGLE
	var rectangle_305_201 = figma.createRectangle()
	frame_305_200.appendChild(rectangle_305_201)
	rectangle_305_201.resize(15.5563220978, 15.5563220978)
	rectangle_305_201.name = 'Rectangle 1'
	rectangle_305_201.fills = [{ type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }]
	rectangle_305_201.fills = [{ type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }]
	rectangle_305_201.relativeTransform = [
		[0.7071068287, -0.7071068287, 0],
		[0.7071068287, 0.7071068287, 16],
	]
	rectangle_305_201.y = 16
	rectangle_305_201.rotation = -45
	rectangle_305_201.constrainProportions = true
	rectangle_305_201.strokeTopWeight = 1
	rectangle_305_201.strokeBottomWeight = 1
	rectangle_305_201.strokeLeftWeight = 1
	rectangle_305_201.strokeRightWeight = 1

	// Create RECTANGLE
	var rectangle_305_280 = figma.createRectangle()
	frame_305_200.appendChild(rectangle_305_280)
	rectangle_305_280.resize(457.0, 53.0)
	rectangle_305_280.name = 'Rectangle 2'
	rectangle_305_280.fills = [{ type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }]

	rectangle_305_280.constraints = { horizontal: 'MIN', vertical: 'STRETCH' }
	rectangle_305_280.cornerRadius = 8
	rectangle_305_280.strokeTopWeight = 1
	rectangle_305_280.strokeBottomWeight = 1
	rectangle_305_280.strokeLeftWeight = 1
	rectangle_305_280.strokeRightWeight = 1

	// Create BOOLEAN_OPERATION
	var booleanOperation_305_620 = figma.union([rectangle_305_201, rectangle_305_280], frame_305_200)
	booleanOperation_305_620.name = 'Union'
	booleanOperation_305_620.visible = true
	booleanOperation_305_620.locked = false
	booleanOperation_305_620.opacity = 1
	booleanOperation_305_620.blendMode = 'PASS_THROUGH'
	booleanOperation_305_620.isMask = false
	booleanOperation_305_620.effects = [
		{
			type: 'DROP_SHADOW',
			color: { r: 0, g: 0, b: 0, a: 0.07000000029802322 },
			offset: { x: 0, y: 4 },
			radius: 12,
			spread: 0,
			visible: true,
			blendMode: 'NORMAL',
			showShadowBehindNode: false,
		},
	]
	booleanOperation_305_620.fills = [{ type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }]
	booleanOperation_305_620.strokes = [
		{ type: 'SOLID', visible: true, opacity: 0.10000000149011612, blendMode: 'NORMAL', color: { r: 0, g: 0, b: 0 } },
	]
	booleanOperation_305_620.strokeWeight = 1
	booleanOperation_305_620.strokeAlign = 'INSIDE'
	booleanOperation_305_620.strokeJoin = 'MITER'
	booleanOperation_305_620.dashPattern = []
	booleanOperation_305_620.strokeCap = 'NONE'
	booleanOperation_305_620.strokeMiterLimit = 4
	booleanOperation_305_620.layoutAlign = 'INHERIT'
	booleanOperation_305_620.constrainProportions = false
	booleanOperation_305_620.layoutGrow = 0
	booleanOperation_305_620.layoutPositioning = 'AUTO'
	booleanOperation_305_620.exportSettings = []
	booleanOperation_305_620.cornerRadius = 0
	booleanOperation_305_620.cornerSmoothing = 0
	booleanOperation_305_620.expanded = false
	booleanOperation_305_620.reactions = []

	// Create TEXT
	var text_305_202 = figma.createText()
	component_305_199.appendChild(text_305_202)
	text_305_202.resize(417.0, 21.0)
	text_305_202.name =
		"Only layer styles such as: background, color, border radius etc will be used to create tables. You don't have to create tables using the plugin. You can also create tables by creating an instance of this component and detaching them and their rows. If you change the styles used on the table or row components you can update existing tables by going to Plugins > Table Creator > Settings and select Refresh Tables"
	text_305_202.relativeTransform = [
		[1, 0, 20],
		[0, 1, 16],
	]
	text_305_202.x = 20
	text_305_202.y = 16
	text_305_202.layoutGrow = 1
	text_305_202.autoRename = false

	// Font properties
	text_305_202.listSpacing = 0
	text_305_202.characters = 'Text'
	text_305_202.fontSize = 14
	text_305_202.lineHeight = { unit: 'PERCENT', value: 150 }
	text_305_202.fontName = { family: 'Inter', style: 'Regular' }
	text_305_202.textAutoResize = 'HEIGHT'

	component_305_199.remove()

	// Create INSTANCE
	var instance_305_196 = component_305_199.createInstance()
	figma.currentPage.appendChild(instance_305_196)
	instance_305_196.relativeTransform = [
		[1, 0, 13222],
		[0, 1, 7163],
	]
	instance_305_196.y = 7163

	// Swap COMPONENT
	instance_305_196.swapComponent(component_305_199)

	// Ref to SUB NODE
	var frame_I305_196_305_200 = figma.getNodeById('I' + instance_305_196.id + ';' + frame_305_200.id)
	frame_I305_196_305_200.resize(457.0, 116.0)
	frame_I305_196_305_200.primaryAxisSizingMode = 'AUTO'

	// Ref to SUB NODE
	var booleanOperation_I305_196_305_620 = figma.getNodeById('I' + instance_305_196.id + ';' + booleanOperation_305_620.id)

	// Ref to SUB NODE
	var rectangle_I305_196_305_201 = figma.getNodeById('I' + instance_305_196.id + ';' + rectangle_305_201.id)

	// Ref to SUB NODE
	var rectangle_I305_196_305_280 = figma.getNodeById('I' + instance_305_196.id + ';' + rectangle_305_280.id)
	rectangle_I305_196_305_280.resize(457.0, 116.0)

	// Ref to SUB NODE
	var text_I305_196_305_202 = figma.getNodeById('I' + instance_305_196.id + ';' + text_305_202.id)
	text_I305_196_305_202.resize(417.0, 84.0)

	text_I305_196_305_202.characters = text

	// Add padding at the end
	component_305_199.paddingLeft = 20
	component_305_199.paddingRight = 20
	component_305_199.paddingTop = 16
	component_305_199.paddingBottom = 16

	if (theme === 'dark') {
		text_I305_196_305_202.fills = [{ type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }]
		booleanOperation_I305_196_305_620.fills = [
			{
				type: 'SOLID',
				visible: true,
				opacity: 1,
				blendMode: 'NORMAL',
				color: { r: 0.21250000596046448, g: 0.21250000596046448, b: 0.21250000596046448 },
			},
		]
		booleanOperation_I305_196_305_620.strokes = [
			{ type: 'SOLID', visible: true, opacity: 0.10000000149011612, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } },
		]
		booleanOperation_I305_196_305_620.effects = [
			{
				type: 'DROP_SHADOW',
				color: { r: 0, g: 0, b: 0, a: 0.10000000149011612 },
				offset: { x: 0, y: 4 },
				radius: 12,
				spread: 0,
				visible: true,
				blendMode: 'NORMAL',
				showShadowBehindNode: false,
			},
		]
	}

	return instance_305_196
}

export async function createTemplateComponents() {
	let theme = 'light'

	if (isTheme(figma.currentPage.backgrounds[0].color) === 'dark') {
		theme = 'dark'
	}

	// Load FONTS
	async function loadFonts() {
		await Promise.all([
			figma.loadFontAsync({
				family: 'Inter',
				style: 'Regular',
			}),
			figma.loadFontAsync({
				family: 'Inter',
				style: 'Semi Bold',
			}),
		])
	}

	await loadFonts()

	// Create COMPONENT
	var component_305_178 = figma.createComponent()
	component_305_178.resize(120.0, 35.0)
	component_305_178.name = 'Type=Default'
	component_305_178.relativeTransform = [
		[1, 0, 16],
		[0, 1, 16],
	]
	component_305_178.x = 16
	component_305_178.y = 16
	component_305_178.layoutAlign = 'STRETCH'
	component_305_178.fills = [{ type: 'SOLID', visible: true, opacity: 0.0020000000949949026, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }]
	if (theme === 'dark') {
		component_305_178.strokes = [
			{
				type: 'SOLID',
				visible: true,
				opacity: 1,
				blendMode: 'NORMAL',
				color: { r: 0.3583333194255829, g: 0.3583333194255829, b: 0.3583333194255829 },
			},
		]
	} else {
		component_305_178.strokes = [
			{
				type: 'SOLID',
				visible: true,
				opacity: 1,
				blendMode: 'NORMAL',
				color: { r: 0.7254902124404907, g: 0.7254902124404907, b: 0.7254902124404907 },
			},
		]
	}

	component_305_178.primaryAxisSizingMode = 'FIXED'
	component_305_178.strokeTopWeight = 1
	component_305_178.strokeBottomWeight = 0
	component_305_178.strokeLeftWeight = 1
	component_305_178.strokeRightWeight = 0
	component_305_178.backgrounds = [
		{ type: 'SOLID', visible: true, opacity: 0.0020000000949949026, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } },
	]
	component_305_178.expanded = false
	component_305_178.layoutMode = 'VERTICAL'

	// Create FRAME
	var frame_305_179 = figma.createFrame()
	component_305_178.appendChild(frame_305_179)
	frame_305_179.resize(120.0, 35.0)
	frame_305_179.primaryAxisSizingMode = 'AUTO'
	frame_305_179.name = 'Content'
	frame_305_179.layoutAlign = 'STRETCH'
	frame_305_179.fills = []
	frame_305_179.paddingLeft = 12
	frame_305_179.paddingRight = 12
	frame_305_179.paddingTop = 10
	frame_305_179.paddingBottom = 10
	frame_305_179.strokeTopWeight = 1
	frame_305_179.strokeBottomWeight = 1
	frame_305_179.strokeLeftWeight = 1
	frame_305_179.strokeRightWeight = 1
	frame_305_179.backgrounds = []
	frame_305_179.expanded = false
	frame_305_179.layoutMode = 'VERTICAL'

	// Create TEXT
	var text_305_180 = figma.createText()
	frame_305_179.appendChild(text_305_180)
	text_305_180.resize(96.0, 15.0)
	text_305_180.relativeTransform = [
		[1, 0, 12],
		[0, 1, 10],
	]
	text_305_180.x = 12
	text_305_180.y = 10
	text_305_180.layoutAlign = 'STRETCH'

	// Font properties
	text_305_180.fontName = {
		family: 'Inter',
		style: 'Regular',
	}
	text_305_180.listSpacing = 0
	text_305_180.characters = ''
	text_305_180.lineHeight = { unit: 'PERCENT', value: 125 }
	text_305_180.fontName = { family: 'Inter', style: 'Regular' }
	text_305_180.textAutoResize = 'HEIGHT'

	if (theme === 'dark') {
		text_305_180.fills = [{ type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }]
	} else {
	}

	// Create COMPONENT
	var component_305_181 = figma.createComponent()
	component_305_181.resize(120.0, 35.0)
	component_305_181.name = 'Type=Header'
	component_305_181.relativeTransform = [
		[1, 0, 136],
		[0, 1, 16],
	]
	component_305_181.x = 136
	component_305_181.y = 16
	component_305_181.layoutAlign = 'STRETCH'
	if (theme === 'dark') {
		component_305_181.fills = [{ type: 'SOLID', visible: true, opacity: 0.05, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }]
		component_305_181.strokes = [
			{
				type: 'SOLID',
				visible: true,
				opacity: 1,
				blendMode: 'NORMAL',
				color: { r: 0.3583333194255829, g: 0.3583333194255829, b: 0.3583333194255829 },
			},
		]
	} else {
		component_305_181.fills = [{ type: 'SOLID', visible: true, opacity: 0.05999999865889549, blendMode: 'NORMAL', color: { r: 0, g: 0, b: 0 } }]
		component_305_181.strokes = [
			{
				type: 'SOLID',
				visible: true,
				opacity: 1,
				blendMode: 'NORMAL',
				color: { r: 0.7254902124404907, g: 0.7254902124404907, b: 0.7254902124404907 },
			},
		]
	}

	component_305_181.primaryAxisSizingMode = 'FIXED'
	component_305_181.strokeTopWeight = 1
	component_305_181.strokeBottomWeight = 0
	component_305_181.strokeLeftWeight = 1
	component_305_181.strokeRightWeight = 0
	component_305_181.expanded = false
	component_305_181.layoutMode = 'VERTICAL'

	// Create FRAME
	var frame_305_182 = figma.createFrame()
	component_305_181.appendChild(frame_305_182)
	frame_305_182.resize(120.0, 35.0)
	frame_305_182.primaryAxisSizingMode = 'AUTO'
	frame_305_182.name = 'Content'
	frame_305_182.layoutAlign = 'STRETCH'
	frame_305_182.fills = []
	frame_305_182.paddingLeft = 12
	frame_305_182.paddingRight = 12
	frame_305_182.paddingTop = 10
	frame_305_182.paddingBottom = 10
	frame_305_182.strokeTopWeight = 1
	frame_305_182.strokeBottomWeight = 1
	frame_305_182.strokeLeftWeight = 1
	frame_305_182.strokeRightWeight = 1
	frame_305_182.backgrounds = []
	frame_305_182.expanded = false
	frame_305_182.layoutMode = 'VERTICAL'

	// Create TEXT
	var text_305_183 = figma.createText()
	frame_305_182.appendChild(text_305_183)
	text_305_183.resize(96.0, 15.0)
	text_305_183.relativeTransform = [
		[1, 0, 12],
		[0, 1, 10],
	]
	text_305_183.x = 12
	text_305_183.y = 10
	text_305_183.layoutAlign = 'STRETCH'

	// Font properties
	text_305_183.fontName = {
		family: 'Inter',
		style: 'Semi Bold',
	}
	text_305_183.listSpacing = 0
	text_305_183.characters = ''
	text_305_183.lineHeight = { unit: 'PERCENT', value: 125 }
	text_305_183.fontName = { family: 'Inter', style: 'Semi Bold' }
	text_305_183.textAutoResize = 'HEIGHT'

	if (theme === 'dark') {
		text_305_183.fills = [{ type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }]
	} else {
	}

	// >>>>>>>>>>>>>>>>> Cells

	// Create COMPONENT_SET
	var componentSet_305_177 = figma.combineAsVariants([component_305_178, component_305_181], figma.currentPage)
	componentSet_305_177.resize(272.0, 67.0)
	componentSet_305_177.primaryAxisSizingMode = 'AUTO'
	componentSet_305_177.counterAxisSizingMode = 'AUTO'
	componentSet_305_177.name = '.Cell'
	componentSet_305_177.visible = true
	componentSet_305_177.locked = false
	componentSet_305_177.opacity = 1
	componentSet_305_177.blendMode = 'PASS_THROUGH'
	componentSet_305_177.isMask = false
	componentSet_305_177.effects = []
	componentSet_305_177.relativeTransform = [
		[1, 0, 11673],
		[0, 1, 7538],
	]
	componentSet_305_177.x = 11673
	componentSet_305_177.y = 7538
	componentSet_305_177.rotation = 0
	componentSet_305_177.layoutAlign = 'INHERIT'
	componentSet_305_177.constrainProportions = false
	componentSet_305_177.layoutGrow = 0
	componentSet_305_177.layoutPositioning = 'AUTO'
	componentSet_305_177.exportSettings = []
	componentSet_305_177.fills = []
	componentSet_305_177.strokes = [
		{ type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 0.48235294222831726, g: 0.3803921639919281, b: 1 } },
	]
	componentSet_305_177.strokeWeight = 1
	componentSet_305_177.strokeAlign = 'INSIDE'
	componentSet_305_177.strokeJoin = 'MITER'
	componentSet_305_177.dashPattern = [10, 5]
	componentSet_305_177.strokeCap = 'NONE'
	componentSet_305_177.strokeMiterLimit = 4
	componentSet_305_177.cornerRadius = 5
	componentSet_305_177.cornerSmoothing = 0
	componentSet_305_177.paddingLeft = 16
	componentSet_305_177.paddingRight = 16
	componentSet_305_177.paddingTop = 16
	componentSet_305_177.paddingBottom = 16
	componentSet_305_177.primaryAxisAlignItems = 'MIN'
	componentSet_305_177.counterAxisAlignItems = 'MIN'
	componentSet_305_177.primaryAxisSizingMode = 'AUTO'
	componentSet_305_177.strokeTopWeight = 1
	componentSet_305_177.strokeBottomWeight = 1
	componentSet_305_177.strokeLeftWeight = 1
	componentSet_305_177.strokeRightWeight = 1
	componentSet_305_177.layoutGrids = []
	componentSet_305_177.backgrounds = []
	componentSet_305_177.clipsContent = true
	componentSet_305_177.guides = []
	componentSet_305_177.expanded = false
	componentSet_305_177.constraints = { horizontal: 'MIN', vertical: 'MIN' }
	componentSet_305_177.layoutMode = 'HORIZONTAL'
	componentSet_305_177.counterAxisSizingMode = 'AUTO'
	componentSet_305_177.itemSpacing = 0
	componentSet_305_177.overflowDirection = 'NONE'
	componentSet_305_177.numberOfFixedChildren = 0
	componentSet_305_177.itemReverseZIndex = false
	componentSet_305_177.strokesIncludedInLayout = false
	componentSet_305_177.description = ''
	componentSet_305_177.documentationLinks = []

	// >>>>>>>>>>>>>>>>> Row

	// Create COMPONENT
	var component_305_184 = figma.createComponent()
	figma.currentPage.appendChild(component_305_184)
	component_305_184.resize(240.0, 35.0)
	component_305_184.primaryAxisSizingMode = 'AUTO'
	component_305_184.counterAxisSizingMode = 'AUTO'
	component_305_184.name = '.Row'
	component_305_184.relativeTransform = [
		[1, 0, 11689],
		[0, 1, 7399],
	]
	component_305_184.x = 11689
	component_305_184.y = 7399
	component_305_184.fills = [{ type: 'SOLID', visible: true, opacity: 0.00009999999747378752, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }]
	component_305_184.strokeTopWeight = 1
	component_305_184.strokeBottomWeight = 1
	component_305_184.strokeLeftWeight = 1
	component_305_184.strokeRightWeight = 1
	component_305_184.backgrounds = [
		{ type: 'SOLID', visible: true, opacity: 0.00009999999747378752, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } },
	]
	component_305_184.clipsContent = true
	component_305_184.expanded = false
	component_305_184.layoutMode = 'HORIZONTAL'
	component_305_184.counterAxisSizingMode = 'AUTO'

	// Create INSTANCE
	var instance_305_185 = component_305_178.createInstance()
	component_305_184.appendChild(instance_305_185)
	instance_305_185.name = '.Cell'
	instance_305_185.relativeTransform = [
		[1, 0, 0],
		[0, 1, 0],
	]
	instance_305_185.layoutAlign = 'STRETCH'

	// Swap COMPONENT
	instance_305_185.swapComponent(component_305_178)

	// Ref to SUB NODE
	var frame_I305_185_305_179 = figma.getNodeById('I' + instance_305_185.id + ';' + frame_305_179.id)

	// Ref to SUB NODE
	var text_I305_185_305_180 = figma.getNodeById('I' + instance_305_185.id + ';' + text_305_180.id)

	// Create INSTANCE
	var instance_305_186 = component_305_178.createInstance()
	component_305_184.appendChild(instance_305_186)
	instance_305_186.name = '.Cell'
	instance_305_186.relativeTransform = [
		[1, 0, 120],
		[0, 1, 0],
	]
	instance_305_186.x = 120
	instance_305_186.layoutAlign = 'STRETCH'

	// Swap COMPONENT
	instance_305_186.swapComponent(component_305_178)

	// Ref to SUB NODE
	var frame_I305_186_305_179 = figma.getNodeById('I' + instance_305_186.id + ';' + frame_305_179.id)

	// Ref to SUB NODE
	var text_I305_186_305_180 = figma.getNodeById('I' + instance_305_186.id + ';' + text_305_180.id)

	// >>>>>>>>>>>>>>>>> Template

	// Create COMPONENT
	var component_305_187 = figma.createComponent()
	figma.currentPage.appendChild(component_305_187)
	component_305_187.resize(240.0, 105.0)
	component_305_187.primaryAxisSizingMode = 'AUTO'
	component_305_187.counterAxisSizingMode = 'AUTO'
	component_305_187.name = 'Table 1'
	component_305_187.effects = [
		{
			type: 'DROP_SHADOW',
			color: { r: 0, g: 0, b: 0, a: 0.10000000149011612 },
			offset: { x: 0, y: 2 },
			radius: 6,
			spread: 0,
			visible: true,
			blendMode: 'NORMAL',
			showShadowBehindNode: false,
		},
	]
	component_305_187.relativeTransform = [
		[1, 0, 11689],
		[0, 1, 7174],
	]
	component_305_187.x = 11689
	component_305_187.y = 7174

	if (theme === 'dark') {
		component_305_187.fills = [
			{
				type: 'SOLID',
				visible: true,
				opacity: 1,
				blendMode: 'NORMAL',
				color: { r: 0.21250000596046448, g: 0.21250000596046448, b: 0.21250000596046448 },
			},
		]
		component_305_187.strokes = [
			{
				type: 'SOLID',
				visible: true,
				opacity: 1,
				blendMode: 'NORMAL',
				color: { r: 0.3583333194255829, g: 0.3583333194255829, b: 0.3583333194255829 },
			},
		]
	} else {
		component_305_187.fills = [{ type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }]
		component_305_187.strokes = [
			{
				type: 'SOLID',
				visible: true,
				opacity: 1,
				blendMode: 'NORMAL',
				color: { r: 0.7254902124404907, g: 0.7254902124404907, b: 0.7254902124404907 },
			},
		]
	}

	component_305_187.cornerRadius = 4
	component_305_187.strokeTopWeight = 1
	component_305_187.strokeBottomWeight = 1
	component_305_187.strokeLeftWeight = 1
	component_305_187.strokeRightWeight = 1
	component_305_187.clipsContent = true
	component_305_187.expanded = false
	component_305_187.layoutMode = 'VERTICAL'
	component_305_187.counterAxisSizingMode = 'AUTO'

	// Create INSTANCE
	var instance_305_188 = component_305_184.createInstance()
	component_305_187.appendChild(instance_305_188)
	instance_305_188.relativeTransform = [
		[1, 0, 0],
		[0, 1, 0],
	]

	// Swap COMPONENT
	instance_305_188.swapComponent(component_305_184)

	// Ref to SUB NODE
	var instance_I305_188_305_185 = figma.getNodeById('I' + instance_305_188.id + ';' + instance_305_185.id)
	instance_I305_188_305_185.fills = [
		{ type: 'SOLID', visible: true, opacity: 0.05999999865889549, blendMode: 'NORMAL', color: { r: 0, g: 0, b: 0 } },
	]
	instance_I305_188_305_185.backgrounds = [
		{ type: 'SOLID', visible: true, opacity: 0.05999999865889549, blendMode: 'NORMAL', color: { r: 0, g: 0, b: 0 } },
	]

	// Swap COMPONENT
	instance_I305_188_305_185.swapComponent(component_305_181)

	// Ref to SUB NODE
	var frame_I305_188_305_185_305_182 = figma.getNodeById(instance_I305_188_305_185.id + ';' + frame_305_182.id)

	// Ref to SUB NODE
	var text_I305_188_305_185_305_183 = figma.getNodeById(instance_I305_188_305_185.id + ';' + text_305_183.id)

	// Ref to SUB NODE
	var instance_I305_188_305_186 = figma.getNodeById('I' + instance_305_188.id + ';' + instance_305_186.id)
	instance_I305_188_305_186.fills = [
		{ type: 'SOLID', visible: true, opacity: 0.05999999865889549, blendMode: 'NORMAL', color: { r: 0, g: 0, b: 0 } },
	]
	instance_I305_188_305_186.backgrounds = [
		{ type: 'SOLID', visible: true, opacity: 0.05999999865889549, blendMode: 'NORMAL', color: { r: 0, g: 0, b: 0 } },
	]

	// Swap COMPONENT
	instance_I305_188_305_186.swapComponent(component_305_181)

	// Ref to SUB NODE
	var frame_I305_188_305_186_305_182 = figma.getNodeById(instance_I305_188_305_186.id + ';' + frame_305_182.id)

	// Ref to SUB NODE
	var text_I305_188_305_186_305_183 = figma.getNodeById(instance_I305_188_305_186.id + ';' + text_305_183.id)

	// Create INSTANCE
	var instance_305_189 = component_305_184.createInstance()
	component_305_187.appendChild(instance_305_189)
	instance_305_189.relativeTransform = [
		[1, 0, 0],
		[0, 1, 35],
	]
	instance_305_189.y = 35

	// Swap COMPONENT
	instance_305_189.swapComponent(component_305_184)

	// Ref to SUB NODE
	var instance_I305_189_305_185 = figma.getNodeById('I' + instance_305_189.id + ';' + instance_305_185.id)

	// Swap COMPONENT
	instance_I305_189_305_185.swapComponent(component_305_178)

	// Ref to SUB NODE
	var frame_I305_189_305_185_305_179 = figma.getNodeById(instance_I305_189_305_185.id + ';' + frame_305_179.id)

	// Ref to SUB NODE
	var text_I305_189_305_185_305_180 = figma.getNodeById(instance_I305_189_305_185.id + ';' + text_305_180.id)

	// Ref to SUB NODE
	var instance_I305_189_305_186 = figma.getNodeById('I' + instance_305_189.id + ';' + instance_305_186.id)

	// Swap COMPONENT
	instance_I305_189_305_186.swapComponent(component_305_178)

	// Ref to SUB NODE
	var frame_I305_189_305_186_305_179 = figma.getNodeById(instance_I305_189_305_186.id + ';' + frame_305_179.id)

	// Ref to SUB NODE
	var text_I305_189_305_186_305_180 = figma.getNodeById(instance_I305_189_305_186.id + ';' + text_305_180.id)

	// Create INSTANCE
	var instance_305_190 = component_305_184.createInstance()
	component_305_187.appendChild(instance_305_190)
	instance_305_190.relativeTransform = [
		[1, 0, 0],
		[0, 1, 70],
	]
	instance_305_190.y = 70

	// Swap COMPONENT
	instance_305_190.swapComponent(component_305_184)

	// Ref to SUB NODE
	var instance_I305_190_305_185 = figma.getNodeById('I' + instance_305_190.id + ';' + instance_305_185.id)

	// Swap COMPONENT
	instance_I305_190_305_185.swapComponent(component_305_178)

	// Ref to SUB NODE
	var frame_I305_190_305_185_305_179 = figma.getNodeById(instance_I305_190_305_185.id + ';' + frame_305_179.id)

	// Ref to SUB NODE
	var text_I305_190_305_185_305_180 = figma.getNodeById(instance_I305_190_305_185.id + ';' + text_305_180.id)

	// Ref to SUB NODE
	var instance_I305_190_305_186 = figma.getNodeById('I' + instance_305_190.id + ';' + instance_305_186.id)

	// Swap COMPONENT
	instance_I305_190_305_186.swapComponent(component_305_178)

	// Ref to SUB NODE
	var frame_I305_190_305_186_305_179 = figma.getNodeById(instance_I305_190_305_186.id + ';' + frame_305_179.id)

	// Ref to SUB NODE
	var text_I305_190_305_186_305_180 = figma.getNodeById(instance_I305_190_305_186.id + ';' + text_305_180.id)

	setPluginData(component_305_187, 'elementSemantics', { is: 'table' })
	setPluginData(component_305_184, 'elementSemantics', { is: 'tr' })
	setPluginData(component_305_178, 'elementSemantics', { is: 'td' })
	setPluginData(component_305_181, 'elementSemantics', { is: 'th' })

	component_305_178.setRelaunchData({ selectColumn: 'Select all cells in column', selectRow: 'Select all cells in row' })
	component_305_181.setRelaunchData({ selectColumn: 'Select all cells in column', selectRow: 'Select all cells in row' })

	return {
		templateComponent: component_305_187,
		rowComponent: component_305_184,
		cellComponentSet: componentSet_305_177,
	}
}
