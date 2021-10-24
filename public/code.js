'use strict';

/**
 * Helpers which make it easier to update client storage
 */
async function getClientStorageAsync(key) {
    return await figma.clientStorage.getAsync(key);
}
function setClientStorageAsync(key, data) {
    return figma.clientStorage.setAsync(key, data);
}
async function updateClientStorageAsync(key, callback) {
    var data = await figma.clientStorage.getAsync(key);
    data = callback(data);
    await figma.clientStorage.setAsync(key, data);
    // What should happen if user doesn't return anything in callback?
    if (!data) {
        data = null;
    }
    // node.setPluginData(key, JSON.stringify(data))
    return data;
}

const eventListeners = [];
figma.ui.onmessage = message => {
    for (let eventListener of eventListeners) {
        if (message.action === eventListener.action)
            eventListener.callback(message.data);
    }
};

const nodeProps = [
    'id',
    'parent',
    'name',
    'removed',
    'visible',
    'locked',
    'children',
    'constraints',
    'absoluteTransform',
    'relativeTransform',
    'x',
    'y',
    'rotation',
    'width',
    'height',
    'constrainProportions',
    'layoutAlign',
    'layoutGrow',
    'opacity',
    'blendMode',
    'isMask',
    'effects',
    'effectStyleId',
    'expanded',
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
    'exportSettings',
    'overflowDirection',
    'numberOfFixedChildren',
    'overlayPositionType',
    'overlayBackground',
    'overlayBackgroundInteraction',
    'reactions',
    'description',
    'remote',
    'key',
    'layoutMode',
    'primaryAxisSizingMode',
    'counterAxisSizingMode',
    'primaryAxisAlignItems',
    'counterAxisAlignItems',
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    'paddingBottom',
    'itemSpacing',
    // 'horizontalPadding',
    // 'verticalPadding',
    'layoutGrids',
    'gridStyleId',
    'clipsContent',
    'guides',
    'type'
];
const readOnly = [
    'id',
    'parent',
    'removed',
    'children',
    'absoluteTransform',
    'width',
    'height',
    'overlayPositionType',
    'overlayBackground',
    'overlayBackgroundInteraction',
    'reactions',
    'remote',
    'key',
    'type',
    'masterComponent',
    'mainComponent'
];
// export function copyPaste(source: {} | BaseNode, target: {} | BaseNode)
// export function copyPaste(source: {} | BaseNode, target: {} | BaseNode, options: Options)
// export function copyPaste(source: {} | BaseNode, target: {} | BaseNode, callback: Callback)
// export function copyPaste(source: {} | BaseNode, target: {} | BaseNode, options: Options, callback: Callback)
// export function copyPaste(source: {} | BaseNode, target: {} | BaseNode, callback: Callback, options: Options)
/**
* Allows you to copy and paste props between nodes.
*
* @param source - The node you want to copy from
* @param target - The node or object you want to paste to
* @param args - Either options or a callback.
* @returns A node or object with the properties copied over
*/
function copyPaste(source, target, ...args) {
    var targetIsEmpty;
    if (target && Object.keys(target).length === 0 && target.constructor === Object) {
        targetIsEmpty = true;
    }
    var options;
    if (typeof args[0] === 'function')
        ;
    if (typeof args[1] === 'function')
        ;
    if (typeof args[0] === 'object' && typeof args[0] !== 'function')
        options = args[0];
    if (typeof args[0] === 'object' && typeof args[0] !== 'function')
        options = args[0];
    if (!options)
        options = {};
    const { include, exclude, withoutRelations, removeConflicts } = options;
    // const props = Object.entries(Object.getOwnPropertyDescriptors(source.__proto__))
    let allowlist = nodeProps.filter(function (el) {
        return !readOnly.includes(el);
    });
    if (include) {
        // If include supplied, include copy across these properties and their values if they exist
        allowlist = include.filter(function (el) {
            return !readOnly.includes(el);
        });
    }
    if (exclude) {
        // If exclude supplied then don't copy over the values of these properties
        allowlist = allowlist.filter(function (el) {
            return !exclude.concat(readOnly).includes(el);
        });
    }
    // target supplied, don't copy over the values of these properties
    if (target && !targetIsEmpty) {
        allowlist = allowlist.filter(function (el) {
            return !['id', 'type'].includes(el);
        });
    }
    var obj = {};
    if (targetIsEmpty) {
        if (obj.id === undefined) {
            obj.id = source.id;
        }
        if (obj.type === undefined) {
            obj.type = source.type;
        }
        if (source.key)
            obj.key = source.key;
    }
    const props = Object.entries(Object.getOwnPropertyDescriptors(source.__proto__));
    for (const [key, value] of props) {
        if (allowlist.includes(key)) {
            try {
                if (typeof obj[key] === 'symbol') {
                    obj[key] = 'Mixed';
                }
                else {
                    obj[key] = value.get.call(source);
                }
            }
            catch (err) {
                obj[key] = undefined;
            }
        }
        // Needs building in
        // if (callback) {
        //     callback(obj)
        // }
        // else {
        // }
    }
    if (!removeConflicts) {
        !obj.fillStyleId && obj.fills ? delete obj.fillStyleId : delete obj.fills;
        !obj.strokeStyleId && obj.strokes ? delete obj.strokeStyleId : delete obj.strokes;
        !obj.backgroundStyleId && obj.backgrounds ? delete obj.backgroundStyleId : delete obj.backgrounds;
        !obj.effectStyleId && obj.effects ? delete obj.effectStyleId : delete obj.effects;
        !obj.gridStyleId && obj.layoutGrids ? delete obj.gridStyleId : delete obj.layoutGrids;
        if (obj.textStyleId) {
            delete obj.fontName;
            delete obj.fontSize;
            delete obj.letterSpacing;
            delete obj.lineHeight;
            delete obj.paragraphIndent;
            delete obj.paragraphSpacing;
            delete obj.textCase;
            delete obj.textDecoration;
        }
        else {
            delete obj.textStyleId;
        }
        if (obj.cornerRadius !== figma.mixed) {
            delete obj.topLeftRadius;
            delete obj.topRightRadius;
            delete obj.bottomLeftRadius;
            delete obj.bottomRightRadius;
        }
        else {
            delete obj.cornerRadius;
        }
    }
    // Only applicable to objects because these properties cannot be set on nodes
    if (targetIsEmpty) {
        if (source.parent && !withoutRelations) {
            obj.parent = { id: source.parent.id, type: source.parent.type };
        }
    }
    // Only applicable to objects because these properties cannot be set on nodes
    if (targetIsEmpty) {
        if (source.type === "FRAME" || source.type === "COMPONENT" || source.type === "COMPONENT_SET" || source.type === "PAGE" || source.type === 'GROUP' || source.type === 'INSTANCE' || source.type === 'DOCUMENT' || source.type === 'BOOLEAN_OPERATION') {
            if (source.children && !withoutRelations) {
                obj.children = source.children.map((child) => copyPaste(child, {}, { withoutRelations }));
            }
        }
        if (source.type === "INSTANCE") {
            if (source.mainComponent && !withoutRelations) {
                obj.masterComponent = copyPaste(source.mainComponent, {}, { withoutRelations });
            }
        }
    }
    Object.assign(target, obj);
    return obj;
}

/**
 * Returns the index of a node
 * @param {SceneNode} node A node
 * @returns The index of the node
 */
function getNodeIndex(node) {
    return node.parent.children.indexOf(node);
}

/**
 * Converts an instance, component, or rectangle to a frame
 * @param {SceneNode} node The node you want to convert to a frame
 * @returns Returns the new node as a frame
 */
function convertToFrame(node) {
    let nodeIndex = getNodeIndex(node);
    let parent = node.parent;
    if (node.type === "INSTANCE") {
        return node.detachInstance();
    }
    if (node.type === "COMPONENT") {
        let parent = node.parent;
        // This method preserves plugin data and relaunch data
        let frame = node.createInstance().detachInstance();
        parent.appendChild(frame);
        copyPaste(node, frame, { include: ['x', 'y'] });
        parent.insertChild(nodeIndex, frame);
        node.remove();
        return frame;
    }
    if (node.type === "RECTANGLE") {
        let frame = figma.createFrame();
        // FIXME: Add this into copyPaste helper
        frame.resizeWithoutConstraints(node.width, node.height);
        copyPaste(node, frame);
        parent.insertChild(nodeIndex, frame);
        node.remove();
        return frame;
    }
}

/**
 * Moves children from one node to another
 * @param {SceneNode} source The node you want to move children from
 * @param {SceneNode} target The node you want to move children to
 * @returns Returns the new target with its children
 */
function moveChildren(source, target) {
    let children = source.children;
    let length = children.length;
    for (let i = 0; i < length; i++) {
        let child = children[i];
        target.appendChild(child);
    }
    return target;
}

/**
 * Converts an instance, frame, or rectangle to a component
 * @param {SceneNode} node The node you want to convert to a component
 * @returns Returns the new node as a component
 */
// FIXME: Typescript says detachInstance() doesn't exist on SceneNode & ChildrenMixin 
function convertToComponent(node) {
    const component = figma.createComponent();
    let parent = node.parent;
    let nodeIndex = getNodeIndex(node);
    node = convertToFrame(node);
    // FIXME: Add this into copyPaste helper
    component.resizeWithoutConstraints(node.width, node.height);
    copyPaste(node, component);
    moveChildren(node, component);
    parent.insertChild(nodeIndex, component);
    node.remove();
    return component;
}
/**
 *
 * @param {BaseNode} node  A figma node to set data on
 * @param {String} key A key to store data under
 * @param {any} data Data to be stoed
 */
function setPluginData(node, key, data) {
    node.setPluginData(key, JSON.stringify(data));
}
function updatePluginData(node, key, callback) {
    var data;
    if (node.getPluginData(key)) {
        data = JSON.parse(node.getPluginData(key));
    }
    else {
        data = null;
    }
    data = callback(data);
    // What should happen if user doesn't return anything in callback?
    if (!data) {
        data = null;
    }
    node.setPluginData(key, JSON.stringify(data));
    return data;
}

/**
 * Mimics similar behaviour to ungrouping nodes in editor.
 * @param {SceneNode & ChildrenMixin } node A node with children
 * @param parent Target container to append ungrouped nodes to
 * @returns Selection of node's children
 */
function ungroup(node, parent) {
    let selection = [];
    let children = node.children;
    for (let i = 0; i < children.length; i++) {
        parent.appendChild(children[i]);
        selection.push(children[i]);
    }
    // Doesn't need removing if it's a group node
    if (node.type !== "GROUP") {
        node.remove();
    }
    return selection;
}

var convertToComponent_1 = convertToComponent;
var convertToFrame_1 = convertToFrame;
var copyPaste_1 = copyPaste;
var getClientStorageAsync_1 = getClientStorageAsync;
var getNodeIndex_1 = getNodeIndex;
var setClientStorageAsync_1 = setClientStorageAsync;
var setPluginData_1 = setPluginData;
var ungroup_1 = ungroup;
var updateClientStorageAsync_1 = updateClientStorageAsync;
var updatePluginData_1 = updatePluginData;

function copyPasteStyle(source, target, options = {}) {
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
    ];
    if (options.include) {
        options.include = options.include.concat(styleProps);
    }
    else {
        options.include = styleProps;
    }
    return copyPaste_1(source, target, options);
}
function clone(val) {
    return JSON.parse(JSON.stringify(val));
}
function positionInCenter(node) {
    // Position newly created table in center of viewport
    node.x = figma.viewport.center.x - (node.width / 2);
    node.y = figma.viewport.center.y - (node.height / 2);
}
function findComponentById(id) {
    // var pages = figma.root.children
    // var component
    // // Look through each page to see if matches node id
    // for (let i = 0; i < pages.length; i++) {
    // 	if (pages[i].findOne(node => node.id === id && node.type === "COMPONENT")) {
    // 		component = pages[i].findOne(node => node.id === id && node.type === "COMPONENT")
    // 	}
    // }
    // return component || false
    var node = figma.getNodeById(id);
    if (node) {
        if (node.parent === null || node.parent.parent === null) {
            figma.root.setPluginData("cellComponentState", "exists");
            return false;
        }
        else {
            figma.root.setPluginData("cellComponentState", "removed");
            return node;
        }
    }
    else {
        figma.root.setPluginData("cellComponentState", "deleted");
        return null;
    }
}
function getPluginData(node, key) {
    var data;
    if (node.getPluginData(key)) {
        data = JSON.parse(node.getPluginData(key));
    }
    else {
        data = undefined;
    }
    return data;
}

// Load FONTS
async function loadFonts() {
    await Promise.all([
        figma.loadFontAsync({
            family: "Inter",
            style: "Regular"
        })
    ]);
}
// Wrap in function
function createDefaultTemplate() {
    const obj = {};
    // Create COMPONENT
    var component_101_204 = figma.createComponent();
    component_101_204.resize(120.0000000000, 35.0000000000);
    component_101_204.name = "Type=Default";
    component_101_204.widgetEvents = [];
    component_101_204.layoutAlign = "STRETCH";
    component_101_204.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.000009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }];
    component_101_204.primaryAxisSizingMode = "FIXED";
    component_101_204.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.000009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }];
    component_101_204.expanded = false;
    component_101_204.layoutMode = "VERTICAL";
    component_101_204.description = "";
    component_101_204.documentationLinks = [];
    // Create COMPONENT
    var component_101_119 = figma.createComponent();
    component_101_119.resize(120.0000000000, 35.0000000000);
    component_101_119.name = "_BaseCell";
    component_101_119.widgetEvents = [];
    component_101_119.relativeTransform = [[1, 0, 8760], [0, 1, 5164]];
    component_101_119.x = 8760;
    component_101_119.y = 5164;
    component_101_119.layoutAlign = "STRETCH";
    component_101_119.fills = [];
    component_101_119.primaryAxisSizingMode = "FIXED";
    component_101_119.backgrounds = [];
    component_101_119.layoutMode = "VERTICAL";
    component_101_119.description = "";
    component_101_119.documentationLinks = [];
    // Create FRAME
    var frame_101_114 = figma.createFrame();
    frame_101_114.resizeWithoutConstraints(120.0000000000, 0.01);
    frame_101_114.primaryAxisSizingMode = "AUTO";
    frame_101_114.widgetEvents = [];
    frame_101_114.locked = true;
    frame_101_114.layoutAlign = "STRETCH";
    frame_101_114.fills = [];
    frame_101_114.backgrounds = [];
    frame_101_114.clipsContent = false;
    component_101_119.appendChild(frame_101_114);
    // Create COMPONENT
    var component_1_351 = figma.createComponent();
    component_1_351.name = "_TableBorder";
    component_1_351.widgetEvents = [];
    component_1_351.relativeTransform = [[1, 0, 8476], [0, 1, 5168]];
    component_1_351.x = 8476;
    component_1_351.y = 5168;
    component_1_351.expanded = false;
    component_1_351.constraints = { "horizontal": "STRETCH", "vertical": "STRETCH" };
    component_1_351.description = "";
    component_1_351.documentationLinks = [];
    // Create LINE
    var line_1_352 = figma.createLine();
    line_1_352.resizeWithoutConstraints(500.0000000000, 0.0000000000);
    line_1_352.widgetEvents = [];
    line_1_352.strokes = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.7254902124404907, "g": 0.7254902124404907, "b": 0.7254902124404907 } }];
    line_1_352.relativeTransform = [[-4.37e-8, -1, 0], [1, -4.37e-8, 0]];
    line_1_352.rotation = -90.00000250447827;
    line_1_352.constraints = { "horizontal": "STRETCH", "vertical": "STRETCH" };
    component_1_351.appendChild(line_1_352);
    // Create INSTANCE
    var instance_102_493 = component_1_351.createInstance();
    instance_102_493.relativeTransform = [[1, 0, 0], [0, 1, 0]];
    instance_102_493.expanded = true;
    instance_102_493.y = -250;
    frame_101_114.appendChild(instance_102_493);
    // Swap COMPONENT
    instance_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    var line_I102_493_1_352 = figma.getNodeById("I" + instance_102_493.id + ";" + line_1_352.id);
    // Create FRAME
    var frame_101_116 = figma.createFrame();
    frame_101_116.resize(120.0000000000, 35.0000000000);
    frame_101_116.primaryAxisSizingMode = "AUTO";
    frame_101_116.name = "Content";
    frame_101_116.widgetEvents = [];
    frame_101_116.relativeTransform = [[1, 0, 0], [0, 1, 0.001]];
    frame_101_116.y = 0.0010000000474974513;
    frame_101_116.layoutAlign = "STRETCH";
    frame_101_116.fills = [];
    frame_101_116.paddingLeft = 12;
    frame_101_116.paddingRight = 12;
    frame_101_116.paddingTop = 10;
    frame_101_116.paddingBottom = 10;
    frame_101_116.backgrounds = [];
    frame_101_116.expanded = false;
    frame_101_116.layoutMode = "VERTICAL";
    component_101_119.appendChild(frame_101_116);
    // Create TEXT
    var text_101_117 = figma.createText();
    text_101_117.resize(96.0000000000, 15.0000000000);
    text_101_117.widgetEvents = [];
    text_101_117.relativeTransform = [[1, 0, 12], [0, 1, 10]];
    text_101_117.x = 12;
    text_101_117.y = 10;
    text_101_117.layoutAlign = "STRETCH";
    text_101_117.hyperlink = null;
    loadFonts().then((res) => {
        text_101_117.fontName = {
            family: "Inter",
            style: "Regular"
        };
        text_101_117.listSpacing = 0;
        text_101_117.characters = "";
        text_101_117.lineHeight = { "unit": "PERCENT", "value": 125 };
        text_101_117.fontName = { "family": "Inter", "style": "Regular" };
        text_101_117.textAutoResize = "HEIGHT";
    });
    frame_101_116.appendChild(text_101_117);
    // Create INSTANCE
    var instance_101_198 = component_101_119.createInstance();
    instance_101_198.resize(120.0000000000, 35.0009994507);
    instance_101_198.primaryAxisSizingMode = "AUTO";
    instance_101_198.relativeTransform = [[1, 0, 0], [0, 1, 0]];
    instance_101_198.primaryAxisSizingMode = "AUTO";
    instance_101_198.expanded = false;
    instance_101_198.constraints = { "horizontal": "SCALE", "vertical": "CENTER" };
    component_101_204.appendChild(instance_101_198);
    // Swap COMPONENT
    instance_101_198.swapComponent(component_101_119);
    // Ref to SUB NODE
    var frame_I101_198_101_114 = figma.getNodeById("I" + instance_101_198.id + ";" + frame_101_114.id);
    frame_I101_198_101_114.expanded = false;
    // Ref to SUB NODE
    var instance_I101_198_102_493 = figma.getNodeById("I" + instance_101_198.id + ";" + instance_102_493.id);
    instance_I101_198_102_493.expanded = false;
    // Swap COMPONENT
    instance_I101_198_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    var line_I101_198_102_493_1_352 = figma.getNodeById(instance_I101_198_102_493.id + ";" + line_1_352.id);
    // Ref to SUB NODE
    var frame_I101_198_101_116 = figma.getNodeById("I" + instance_101_198.id + ";" + frame_101_116.id);
    // Ref to SUB NODE
    var text_I101_198_101_117 = figma.getNodeById("I" + instance_101_198.id + ";" + text_101_117.id);
    // Create COMPONENT
    var component_101_265 = figma.createComponent();
    component_101_265.resize(120.0000000000, 35.0000000000);
    component_101_265.name = "Type=Header";
    component_101_265.widgetEvents = [];
    component_101_265.relativeTransform = [[1, 0, 120], [0, 1, 0]];
    component_101_265.x = 120;
    component_101_265.layoutAlign = "STRETCH";
    component_101_265.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.05999999865889549, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }];
    component_101_265.primaryAxisSizingMode = "FIXED";
    component_101_265.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.05999999865889549, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }];
    component_101_265.expanded = false;
    component_101_265.layoutMode = "VERTICAL";
    component_101_265.description = "";
    component_101_265.documentationLinks = [];
    // Create INSTANCE
    var instance_101_266 = component_101_119.createInstance();
    instance_101_266.resize(120.0000000000, 35.0009994507);
    instance_101_266.primaryAxisSizingMode = "AUTO";
    instance_101_266.relativeTransform = [[1, 0, 0], [0, 1, 0]];
    instance_101_266.primaryAxisSizingMode = "AUTO";
    instance_101_266.expanded = false;
    instance_101_266.constraints = { "horizontal": "SCALE", "vertical": "CENTER" };
    component_101_265.appendChild(instance_101_266);
    // Swap COMPONENT
    instance_101_266.swapComponent(component_101_119);
    // Ref to SUB NODE
    var frame_I101_266_101_114 = figma.getNodeById("I" + instance_101_266.id + ";" + frame_101_114.id);
    frame_I101_266_101_114.expanded = false;
    // Ref to SUB NODE
    var instance_I101_266_102_493 = figma.getNodeById("I" + instance_101_266.id + ";" + instance_102_493.id);
    instance_I101_266_102_493.expanded = false;
    // Swap COMPONENT
    instance_I101_266_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    var line_I101_266_102_493_1_352 = figma.getNodeById(instance_I101_266_102_493.id + ";" + line_1_352.id);
    // Ref to SUB NODE
    var frame_I101_266_101_116 = figma.getNodeById("I" + instance_101_266.id + ";" + frame_101_116.id);
    // Ref to SUB NODE
    var text_I101_266_101_117 = figma.getNodeById("I" + instance_101_266.id + ";" + text_101_117.id);
    // Create COMPONENT_SET
    var componentSet_1_364 = figma.combineAsVariants([component_101_204, component_101_265], figma.currentPage);
    componentSet_1_364.resize(240.0000000000, 35.0000000000);
    componentSet_1_364.primaryAxisSizingMode = "AUTO";
    componentSet_1_364.name = "_Cell";
    componentSet_1_364.widgetEvents = [];
    componentSet_1_364.visible = true;
    componentSet_1_364.locked = false;
    componentSet_1_364.opacity = 1;
    componentSet_1_364.blendMode = "PASS_THROUGH";
    componentSet_1_364.isMask = false;
    componentSet_1_364.effects = [];
    componentSet_1_364.relativeTransform = [[1, 0, 8760], [0, 1, 5009]];
    componentSet_1_364.x = 8760;
    componentSet_1_364.y = 5009;
    componentSet_1_364.rotation = 0;
    componentSet_1_364.layoutAlign = "INHERIT";
    componentSet_1_364.constrainProportions = false;
    componentSet_1_364.layoutGrow = 0;
    componentSet_1_364.fills = [];
    componentSet_1_364.strokes = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.48235294222831726, "g": 0.3803921639919281, "b": 1 } }];
    componentSet_1_364.strokeWeight = 1;
    componentSet_1_364.strokeAlign = "INSIDE";
    componentSet_1_364.strokeJoin = "MITER";
    componentSet_1_364.dashPattern = [10, 5];
    componentSet_1_364.strokeCap = "NONE";
    componentSet_1_364.strokeMiterLimit = 4;
    componentSet_1_364.cornerRadius = 5;
    componentSet_1_364.cornerSmoothing = 0;
    componentSet_1_364.paddingLeft = 0;
    componentSet_1_364.paddingRight = 0;
    componentSet_1_364.paddingTop = 0;
    componentSet_1_364.paddingBottom = 0;
    componentSet_1_364.primaryAxisAlignItems = "MIN";
    componentSet_1_364.counterAxisAlignItems = "MIN";
    componentSet_1_364.primaryAxisSizingMode = "AUTO";
    componentSet_1_364.layoutGrids = [];
    componentSet_1_364.backgrounds = [];
    componentSet_1_364.clipsContent = true;
    componentSet_1_364.guides = [];
    componentSet_1_364.expanded = true;
    componentSet_1_364.constraints = { "horizontal": "MIN", "vertical": "MIN" };
    componentSet_1_364.layoutMode = "HORIZONTAL";
    componentSet_1_364.counterAxisSizingMode = "FIXED";
    componentSet_1_364.itemSpacing = 0;
    componentSet_1_364.description = "";
    componentSet_1_364.documentationLinks = [];
    // Create COMPONENT
    var component_1_365 = figma.createComponent();
    component_1_365.resize(240.0000000000, 35.0009994507);
    component_1_365.primaryAxisSizingMode = "AUTO";
    component_1_365.counterAxisSizingMode = "AUTO";
    component_1_365.name = "_Row";
    component_1_365.widgetEvents = [];
    component_1_365.effects = [{ "type": "INNER_SHADOW", "color": { "r": 0.7254902124404907, "g": 0.7254902124404907, "b": 0.7254902124404907, "a": 1 }, "offset": { "x": 0, "y": 1 }, "radius": 0, "spread": 0, "visible": true, "blendMode": "NORMAL" }];
    component_1_365.relativeTransform = [[1, 0, 8760], [0, 1, 4854]];
    component_1_365.x = 8760;
    component_1_365.y = 4854;
    component_1_365.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.00009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }];
    component_1_365.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.00009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }];
    component_1_365.clipsContent = true;
    component_1_365.layoutMode = "HORIZONTAL";
    component_1_365.counterAxisSizingMode = "AUTO";
    component_1_365.description = "";
    component_1_365.documentationLinks = [];
    figma.currentPage.appendChild(component_1_365);
    // Create INSTANCE
    var instance_1_366 = component_101_204.createInstance();
    instance_1_366.resize(120.0000000000, 35.0009994507);
    instance_1_366.name = "_Cell";
    component_1_365.appendChild(instance_1_366);
    // Swap COMPONENT
    instance_1_366.swapComponent(component_101_204);
    // Ref to SUB NODE
    var instance_I1_366_101_198 = figma.getNodeById("I" + instance_1_366.id + ";" + instance_101_198.id);
    // Swap COMPONENT
    instance_I1_366_101_198.swapComponent(component_101_119);
    // Ref to SUB NODE
    var frame_I1_366_101_198_101_114 = figma.getNodeById(instance_I1_366_101_198.id + ";" + frame_101_114.id);
    frame_I1_366_101_198_101_114.expanded = false;
    // Ref to SUB NODE
    var instance_I1_366_101_198_102_493 = figma.getNodeById(instance_I1_366_101_198.id + ";" + instance_102_493.id);
    instance_I1_366_101_198_102_493.expanded = false;
    // Swap COMPONENT
    instance_I1_366_101_198_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    var line_I1_366_101_198_102_493_1_352 = figma.getNodeById(instance_I1_366_101_198_102_493.id + ";" + line_1_352.id);
    // Ref to SUB NODE
    var frame_I1_366_101_198_101_116 = figma.getNodeById(instance_I1_366_101_198.id + ";" + frame_101_116.id);
    // Ref to SUB NODE
    var text_I1_366_101_198_101_117 = figma.getNodeById(instance_I1_366_101_198.id + ";" + text_101_117.id);
    // Create INSTANCE
    var instance_1_372 = component_101_204.createInstance();
    instance_1_372.resize(120.0000000000, 35.0009994507);
    instance_1_372.name = "_Cell";
    instance_1_372.relativeTransform = [[1, 0, 120], [0, 1, 0]];
    instance_1_372.x = 120;
    component_1_365.appendChild(instance_1_372);
    // Swap COMPONENT
    instance_1_372.swapComponent(component_101_204);
    // Ref to SUB NODE
    var instance_I1_372_101_198 = figma.getNodeById("I" + instance_1_372.id + ";" + instance_101_198.id);
    // Swap COMPONENT
    instance_I1_372_101_198.swapComponent(component_101_119);
    // Ref to SUB NODE
    var frame_I1_372_101_198_101_114 = figma.getNodeById(instance_I1_372_101_198.id + ";" + frame_101_114.id);
    frame_I1_372_101_198_101_114.expanded = false;
    // Ref to SUB NODE
    var instance_I1_372_101_198_102_493 = figma.getNodeById(instance_I1_372_101_198.id + ";" + instance_102_493.id);
    instance_I1_372_101_198_102_493.expanded = false;
    // Swap COMPONENT
    instance_I1_372_101_198_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    var line_I1_372_101_198_102_493_1_352 = figma.getNodeById(instance_I1_372_101_198_102_493.id + ";" + line_1_352.id);
    // Ref to SUB NODE
    var frame_I1_372_101_198_101_116 = figma.getNodeById(instance_I1_372_101_198.id + ";" + frame_101_116.id);
    // Ref to SUB NODE
    var text_I1_372_101_198_101_117 = figma.getNodeById(instance_I1_372_101_198.id + ";" + text_101_117.id);
    // Create COMPONENT
    var component_1_378 = figma.createComponent();
    component_1_378.resize(240.0000000000, 105.0029983521);
    component_1_378.primaryAxisSizingMode = "AUTO";
    component_1_378.counterAxisSizingMode = "AUTO";
    component_1_378.name = "Table 1";
    component_1_378.widgetEvents = [];
    component_1_378.effects = [{ "type": "DROP_SHADOW", "color": { "r": 0, "g": 0, "b": 0, "a": 0.10000000149011612 }, "offset": { "x": 0, "y": 2 }, "radius": 6, "spread": 0, "visible": true, "blendMode": "NORMAL", "showShadowBehindNode": false }];
    component_1_378.relativeTransform = [[1, 0, 8760], [0, 1, 4629]];
    component_1_378.x = 8760;
    component_1_378.y = 4629;
    component_1_378.fills = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }];
    component_1_378.strokes = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.7254902124404907, "g": 0.7254902124404907, "b": 0.7254902124404907 } }];
    component_1_378.cornerRadius = 4;
    component_1_378.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }];
    component_1_378.clipsContent = true;
    component_1_378.layoutMode = "VERTICAL";
    component_1_378.counterAxisSizingMode = "AUTO";
    component_1_378.description = "";
    component_1_378.documentationLinks = [];
    figma.currentPage.appendChild(component_1_378);
    // Create INSTANCE
    var instance_1_379 = component_1_365.createInstance();
    instance_1_379.relativeTransform = [[1, 0, 0], [0, 1, 0]];
    component_1_378.appendChild(instance_1_379);
    // Swap COMPONENT
    instance_1_379.swapComponent(component_1_365);
    // Ref to SUB NODE
    var instance_I1_379_1_366 = figma.getNodeById("I" + instance_1_379.id + ";" + instance_1_366.id);
    instance_I1_379_1_366.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.05999999865889549, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }];
    instance_I1_379_1_366.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.05999999865889549, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }];
    // Swap COMPONENT
    instance_I1_379_1_366.swapComponent(component_101_265);
    // Ref to SUB NODE
    var instance_I1_379_1_366_101_266 = figma.getNodeById(instance_I1_379_1_366.id + ";" + instance_101_266.id);
    // Swap COMPONENT
    instance_I1_379_1_366_101_266.swapComponent(component_101_119);
    // Ref to SUB NODE
    var frame_I1_379_1_366_101_266_101_114 = figma.getNodeById(instance_I1_379_1_366_101_266.id + ";" + frame_101_114.id);
    frame_I1_379_1_366_101_266_101_114.expanded = false;
    // Ref to SUB NODE
    var instance_I1_379_1_366_101_266_102_493 = figma.getNodeById(instance_I1_379_1_366_101_266.id + ";" + instance_102_493.id);
    instance_I1_379_1_366_101_266_102_493.expanded = false;
    // Swap COMPONENT
    instance_I1_379_1_366_101_266_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    var line_I1_379_1_366_101_266_102_493_1_352 = figma.getNodeById(instance_I1_379_1_366_101_266_102_493.id + ";" + line_1_352.id);
    // Ref to SUB NODE
    var frame_I1_379_1_366_101_266_101_116 = figma.getNodeById(instance_I1_379_1_366_101_266.id + ";" + frame_101_116.id);
    // Ref to SUB NODE
    var text_I1_379_1_366_101_266_101_117 = figma.getNodeById(instance_I1_379_1_366_101_266.id + ";" + text_101_117.id);
    // Ref to SUB NODE
    var instance_I1_379_1_372 = figma.getNodeById("I" + instance_1_379.id + ";" + instance_1_372.id);
    instance_I1_379_1_372.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.05999999865889549, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }];
    instance_I1_379_1_372.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.05999999865889549, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }];
    // Swap COMPONENT
    instance_I1_379_1_372.swapComponent(component_101_265);
    // Ref to SUB NODE
    var instance_I1_379_1_372_101_266 = figma.getNodeById(instance_I1_379_1_372.id + ";" + instance_101_266.id);
    // Swap COMPONENT
    instance_I1_379_1_372_101_266.swapComponent(component_101_119);
    // Ref to SUB NODE
    var frame_I1_379_1_372_101_266_101_114 = figma.getNodeById(instance_I1_379_1_372_101_266.id + ";" + frame_101_114.id);
    frame_I1_379_1_372_101_266_101_114.expanded = false;
    // Ref to SUB NODE
    var instance_I1_379_1_372_101_266_102_493 = figma.getNodeById(instance_I1_379_1_372_101_266.id + ";" + instance_102_493.id);
    instance_I1_379_1_372_101_266_102_493.expanded = false;
    // Swap COMPONENT
    instance_I1_379_1_372_101_266_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    var line_I1_379_1_372_101_266_102_493_1_352 = figma.getNodeById(instance_I1_379_1_372_101_266_102_493.id + ";" + line_1_352.id);
    // Ref to SUB NODE
    var frame_I1_379_1_372_101_266_101_116 = figma.getNodeById(instance_I1_379_1_372_101_266.id + ";" + frame_101_116.id);
    // Ref to SUB NODE
    var text_I1_379_1_372_101_266_101_117 = figma.getNodeById(instance_I1_379_1_372_101_266.id + ";" + text_101_117.id);
    // Create INSTANCE
    var instance_1_398 = component_1_365.createInstance();
    instance_1_398.relativeTransform = [[1, 0, 0], [0, 1, 35.0009994507]];
    instance_1_398.y = 35.000999450683594;
    instance_1_398.expanded = false;
    component_1_378.appendChild(instance_1_398);
    // Swap COMPONENT
    instance_1_398.swapComponent(component_1_365);
    // Ref to SUB NODE
    var instance_I1_398_1_366 = figma.getNodeById("I" + instance_1_398.id + ";" + instance_1_366.id);
    // Swap COMPONENT
    instance_I1_398_1_366.swapComponent(component_101_204);
    // Ref to SUB NODE
    var instance_I1_398_1_366_101_198 = figma.getNodeById(instance_I1_398_1_366.id + ";" + instance_101_198.id);
    // Swap COMPONENT
    instance_I1_398_1_366_101_198.swapComponent(component_101_119);
    // Ref to SUB NODE
    var frame_I1_398_1_366_101_198_101_114 = figma.getNodeById(instance_I1_398_1_366_101_198.id + ";" + frame_101_114.id);
    frame_I1_398_1_366_101_198_101_114.expanded = false;
    // Ref to SUB NODE
    var instance_I1_398_1_366_101_198_102_493 = figma.getNodeById(instance_I1_398_1_366_101_198.id + ";" + instance_102_493.id);
    instance_I1_398_1_366_101_198_102_493.expanded = false;
    // Swap COMPONENT
    instance_I1_398_1_366_101_198_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    var line_I1_398_1_366_101_198_102_493_1_352 = figma.getNodeById(instance_I1_398_1_366_101_198_102_493.id + ";" + line_1_352.id);
    // Ref to SUB NODE
    var frame_I1_398_1_366_101_198_101_116 = figma.getNodeById(instance_I1_398_1_366_101_198.id + ";" + frame_101_116.id);
    // Ref to SUB NODE
    var text_I1_398_1_366_101_198_101_117 = figma.getNodeById(instance_I1_398_1_366_101_198.id + ";" + text_101_117.id);
    // Ref to SUB NODE
    var instance_I1_398_1_372 = figma.getNodeById("I" + instance_1_398.id + ";" + instance_1_372.id);
    // Swap COMPONENT
    instance_I1_398_1_372.swapComponent(component_101_204);
    // Ref to SUB NODE
    var instance_I1_398_1_372_101_198 = figma.getNodeById(instance_I1_398_1_372.id + ";" + instance_101_198.id);
    // Swap COMPONENT
    instance_I1_398_1_372_101_198.swapComponent(component_101_119);
    // Ref to SUB NODE
    var frame_I1_398_1_372_101_198_101_114 = figma.getNodeById(instance_I1_398_1_372_101_198.id + ";" + frame_101_114.id);
    frame_I1_398_1_372_101_198_101_114.expanded = false;
    // Ref to SUB NODE
    var instance_I1_398_1_372_101_198_102_493 = figma.getNodeById(instance_I1_398_1_372_101_198.id + ";" + instance_102_493.id);
    instance_I1_398_1_372_101_198_102_493.expanded = false;
    // Swap COMPONENT
    instance_I1_398_1_372_101_198_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    var line_I1_398_1_372_101_198_102_493_1_352 = figma.getNodeById(instance_I1_398_1_372_101_198_102_493.id + ";" + line_1_352.id);
    // Ref to SUB NODE
    var frame_I1_398_1_372_101_198_101_116 = figma.getNodeById(instance_I1_398_1_372_101_198.id + ";" + frame_101_116.id);
    // Ref to SUB NODE
    var text_I1_398_1_372_101_198_101_117 = figma.getNodeById(instance_I1_398_1_372_101_198.id + ";" + text_101_117.id);
    // Create INSTANCE
    var instance_1_417 = component_1_365.createInstance();
    instance_1_417.relativeTransform = [[1, 0, 0], [0, 1, 70.0019989014]];
    instance_1_417.y = 70.00199890136719;
    instance_1_417.expanded = false;
    component_1_378.appendChild(instance_1_417);
    // Swap COMPONENT
    instance_1_417.swapComponent(component_1_365);
    // Ref to SUB NODE
    var instance_I1_417_1_366 = figma.getNodeById("I" + instance_1_417.id + ";" + instance_1_366.id);
    // Swap COMPONENT
    instance_I1_417_1_366.swapComponent(component_101_204);
    // Ref to SUB NODE
    var instance_I1_417_1_366_101_198 = figma.getNodeById(instance_I1_417_1_366.id + ";" + instance_101_198.id);
    // Swap COMPONENT
    instance_I1_417_1_366_101_198.swapComponent(component_101_119);
    // Ref to SUB NODE
    var frame_I1_417_1_366_101_198_101_114 = figma.getNodeById(instance_I1_417_1_366_101_198.id + ";" + frame_101_114.id);
    frame_I1_417_1_366_101_198_101_114.expanded = false;
    // Ref to SUB NODE
    var instance_I1_417_1_366_101_198_102_493 = figma.getNodeById(instance_I1_417_1_366_101_198.id + ";" + instance_102_493.id);
    instance_I1_417_1_366_101_198_102_493.expanded = false;
    // Swap COMPONENT
    instance_I1_417_1_366_101_198_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    var line_I1_417_1_366_101_198_102_493_1_352 = figma.getNodeById(instance_I1_417_1_366_101_198_102_493.id + ";" + line_1_352.id);
    // Ref to SUB NODE
    var frame_I1_417_1_366_101_198_101_116 = figma.getNodeById(instance_I1_417_1_366_101_198.id + ";" + frame_101_116.id);
    // Ref to SUB NODE
    var text_I1_417_1_366_101_198_101_117 = figma.getNodeById(instance_I1_417_1_366_101_198.id + ";" + text_101_117.id);
    // Ref to SUB NODE
    var instance_I1_417_1_372 = figma.getNodeById("I" + instance_1_417.id + ";" + instance_1_372.id);
    // Swap COMPONENT
    instance_I1_417_1_372.swapComponent(component_101_204);
    // Ref to SUB NODE
    var instance_I1_417_1_372_101_198 = figma.getNodeById(instance_I1_417_1_372.id + ";" + instance_101_198.id);
    // Swap COMPONENT
    instance_I1_417_1_372_101_198.swapComponent(component_101_119);
    // Ref to SUB NODE
    var frame_I1_417_1_372_101_198_101_114 = figma.getNodeById(instance_I1_417_1_372_101_198.id + ";" + frame_101_114.id);
    frame_I1_417_1_372_101_198_101_114.expanded = false;
    // Ref to SUB NODE
    var instance_I1_417_1_372_101_198_102_493 = figma.getNodeById(instance_I1_417_1_372_101_198.id + ";" + instance_102_493.id);
    instance_I1_417_1_372_101_198_102_493.expanded = false;
    // Swap COMPONENT
    instance_I1_417_1_372_101_198_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    var line_I1_417_1_372_101_198_102_493_1_352 = figma.getNodeById(instance_I1_417_1_372_101_198_102_493.id + ";" + line_1_352.id);
    // Ref to SUB NODE
    var frame_I1_417_1_372_101_198_101_116 = figma.getNodeById(instance_I1_417_1_372_101_198.id + ";" + frame_101_116.id);
    // Ref to SUB NODE
    var text_I1_417_1_372_101_198_101_117 = figma.getNodeById(instance_I1_417_1_372_101_198.id + ";" + text_101_117.id);
    // Create COMPONENT
    var component_1_430 = figma.createComponent();
    component_1_430.resize(457.0000000000, 179.0000000000);
    component_1_430.counterAxisSizingMode = "AUTO";
    component_1_430.name = "_Tooltip";
    component_1_430.widgetEvents = [];
    component_1_430.effects = [{ "type": "DROP_SHADOW", "color": { "r": 0.9666666388511658, "g": 0.15708333253860474, "b": 0.15708333253860474, "a": 0.09000000357627869 }, "offset": { "x": 0, "y": 16 }, "radius": 8, "spread": 0, "visible": false, "blendMode": "NORMAL", "showShadowBehindNode": true }];
    component_1_430.relativeTransform = [[1, 0, 9080], [0, 1, 4316]];
    component_1_430.x = 9080;
    component_1_430.y = 4316;
    component_1_430.fills = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }, { "type": "GRADIENT_LINEAR", "visible": true, "opacity": 1, "blendMode": "NORMAL", "gradientStops": [{ "color": { "r": 0, "g": 0, "b": 0, "a": 1 }, "position": 0 }, { "color": { "r": 0.26249998807907104, "g": 0.26249998807907104, "b": 0.26249998807907104, "a": 1 }, "position": 1 }], "gradientTransform": [[0.37368255853652954, 0.4259088337421417, 0.21073251962661743], [-0.0000021187263428146252, 0.0000018692335288506001, 0.5000001788139343]] }];
    component_1_430.cornerRadius = 8;
    component_1_430.paddingLeft = 20;
    component_1_430.paddingRight = 20;
    component_1_430.paddingTop = 16;
    component_1_430.paddingBottom = 16;
    component_1_430.primaryAxisSizingMode = "FIXED";
    component_1_430.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }, { "type": "GRADIENT_LINEAR", "visible": true, "opacity": 1, "blendMode": "NORMAL", "gradientStops": [{ "color": { "r": 0, "g": 0, "b": 0, "a": 1 }, "position": 0 }, { "color": { "r": 0.26249998807907104, "g": 0.26249998807907104, "b": 0.26249998807907104, "a": 1 }, "position": 1 }], "gradientTransform": [[0.37368255853652954, 0.4259088337421417, 0.21073251962661743], [-0.0000021187263428146252, 0.0000018692335288506001, 0.5000001788139343]] }];
    component_1_430.expanded = false;
    component_1_430.layoutMode = "HORIZONTAL";
    component_1_430.counterAxisSizingMode = "AUTO";
    component_1_430.description = "";
    component_1_430.documentationLinks = [];
    // Create FRAME
    var frame_1_431 = figma.createFrame();
    frame_1_431.resizeWithoutConstraints(0.01, 0.01);
    frame_1_431.primaryAxisSizingMode = "AUTO";
    frame_1_431.name = "Frame 2";
    frame_1_431.widgetEvents = [];
    frame_1_431.relativeTransform = [[1, 0, 20], [0, 1, 16]];
    frame_1_431.x = 20;
    frame_1_431.y = 16;
    frame_1_431.fills = [];
    frame_1_431.backgrounds = [];
    frame_1_431.clipsContent = false;
    frame_1_431.expanded = false;
    component_1_430.appendChild(frame_1_431);
    // Create RECTANGLE
    var rectangle_1_432 = figma.createRectangle();
    rectangle_1_432.resize(15.5563220978, 15.5563220978);
    rectangle_1_432.name = "Rectangle 1";
    rectangle_1_432.widgetEvents = [];
    rectangle_1_432.fills = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.0784313753247261, "g": 0.0784313753247261, "b": 0.0784313753247261 } }];
    rectangle_1_432.relativeTransform = [[0.7071068287, -0.7071068287, -19.1801757812], [0.7071068287, 0.7071068287, 1.8198242188]];
    rectangle_1_432.x = -19.18017578125;
    rectangle_1_432.y = 1.81982421875;
    rectangle_1_432.rotation = -45;
    rectangle_1_432.constrainProportions = true;
    frame_1_431.appendChild(rectangle_1_432);
    // Create TEXT
    var text_1_433 = figma.createText();
    text_1_433.resize(416.9899902344, 147.0000000000);
    text_1_433.name = "Only layer styles such as: background, color, border radius etc will be used to create tables. You don't have to create tables using the plugin. You can also create tables by creating an instance of this component and detaching them and their rows. If you change the styles used on the table or row components you can update existing tables by going to Plugins > Table Creator > Settings and select Refresh Tables";
    text_1_433.widgetEvents = [];
    text_1_433.fills = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }];
    text_1_433.relativeTransform = [[1, 0, 20.0100002289], [0, 1, 16]];
    text_1_433.x = 20.010000228881836;
    text_1_433.y = 16;
    text_1_433.layoutGrow = 1;
    text_1_433.hyperlink = null;
    text_1_433.autoRename = false;
    loadFonts().then((res) => {
        text_1_433.fontName = {
            family: "Inter",
            style: "Regular"
        };
        text_1_433.listSpacing = 0;
        text_1_433.characters = "Only layer styles such as: background, color, border radius etc will be used to create tables. You don't have to create tables using the plugin. You can also create tables by creating an instance of this component and detaching them and their rows. If you change the styles used on the table or row components you can update existing tables by going to Plugins > Table Creator > Settings and select Refresh Tables";
        text_1_433.fontSize = 14;
        text_1_433.lineHeight = { "unit": "PERCENT", "value": 150 };
        text_1_433.fontName = { "family": "Inter", "style": "Regular" };
        text_1_433.textAutoResize = "HEIGHT";
    });
    component_1_430.appendChild(text_1_433);
    // Create INSTANCE
    var instance_1_434 = component_1_430.createInstance();
    instance_1_434.relativeTransform = [[1, 0, 9080], [0, 1, 4618]];
    instance_1_434.y = 4618;
    figma.currentPage.appendChild(instance_1_434);
    // Swap COMPONENT
    instance_1_434.swapComponent(component_1_430);
    // Ref to SUB NODE
    var frame_I1_434_1_431 = figma.getNodeById("I" + instance_1_434.id + ";" + frame_1_431.id);
    // Ref to SUB NODE
    var rectangle_I1_434_1_432 = figma.getNodeById("I" + instance_1_434.id + ";" + rectangle_1_432.id);
    // Ref to SUB NODE
    var text_I1_434_1_433 = figma.getNodeById("I" + instance_1_434.id + ";" + text_1_433.id);
    text_I1_434_1_433.resize(416.9899902344, 63.0000000000);
    loadFonts().then((res) => {
        text_I1_434_1_433.fontName = {
            family: "Inter",
            style: "Regular"
        };
        text_I1_434_1_433.characters = "This component is the template used by the plugin to create tables from. You can customise the appearance of your tables by customising these components.";
    });
    // Create INSTANCE
    var instance_1_438 = component_1_430.createInstance();
    instance_1_438.relativeTransform = [[1, 0, 9080], [0, 1, 4843]];
    instance_1_438.y = 4843;
    figma.currentPage.appendChild(instance_1_438);
    // Swap COMPONENT
    instance_1_438.swapComponent(component_1_430);
    // Ref to SUB NODE
    var frame_I1_438_1_431 = figma.getNodeById("I" + instance_1_438.id + ";" + frame_1_431.id);
    // Ref to SUB NODE
    var rectangle_I1_438_1_432 = figma.getNodeById("I" + instance_1_438.id + ";" + rectangle_1_432.id);
    // Ref to SUB NODE
    var text_I1_438_1_433 = figma.getNodeById("I" + instance_1_438.id + ";" + text_1_433.id);
    text_I1_438_1_433.resize(416.9899902344, 42.0000000000);
    loadFonts().then((res) => {
        text_I1_438_1_433.fontName = {
            family: "Inter",
            style: "Regular"
        };
        text_I1_438_1_433.characters = " To customise the horizontal borders change the shadow colour.";
    });
    // Create INSTANCE
    var instance_1_442 = component_1_430.createInstance();
    instance_1_442.relativeTransform = [[1, 0, 9080], [0, 1, 4998]];
    instance_1_442.y = 4998;
    figma.currentPage.appendChild(instance_1_442);
    // Swap COMPONENT
    instance_1_442.swapComponent(component_1_430);
    // Ref to SUB NODE
    var frame_I1_442_1_431 = figma.getNodeById("I" + instance_1_442.id + ";" + frame_1_431.id);
    // Ref to SUB NODE
    var rectangle_I1_442_1_432 = figma.getNodeById("I" + instance_1_442.id + ";" + rectangle_1_432.id);
    // Ref to SUB NODE
    var text_I1_442_1_433 = figma.getNodeById("I" + instance_1_442.id + ";" + text_1_433.id);
    text_I1_442_1_433.resize(416.9899902344, 42.0000000000);
    loadFonts().then((res) => {
        text_I1_442_1_433.fontName = {
            family: "Inter",
            style: "Regular"
        };
        text_I1_442_1_433.characters = "Change the appearance of each cell type by customising these variants.";
    });
    // Create INSTANCE
    var instance_102_121 = component_1_430.createInstance();
    instance_102_121.relativeTransform = [[1, 0, 9080], [0, 1, 5152]];
    instance_102_121.y = 5152;
    figma.currentPage.appendChild(instance_102_121);
    // Swap COMPONENT
    instance_102_121.swapComponent(component_1_430);
    // Ref to SUB NODE
    var frame_I102_121_1_431 = figma.getNodeById("I" + instance_102_121.id + ";" + frame_1_431.id);
    // Ref to SUB NODE
    var rectangle_I102_121_1_432 = figma.getNodeById("I" + instance_102_121.id + ";" + rectangle_1_432.id);
    // Ref to SUB NODE
    var text_I102_121_1_433 = figma.getNodeById("I" + instance_102_121.id + ";" + text_1_433.id);
    text_I102_121_1_433.resize(416.9899902344, 42.0000000000);
    loadFonts().then((res) => {
        text_I102_121_1_433.fontName = {
            family: "Inter",
            style: "Regular"
        };
        text_I102_121_1_433.characters = "Change the deafult appearance of all cells by customising this base component.";
    });
    // Create INSTANCE
    var instance_102_121 = component_1_430.createInstance();
    instance_102_121.relativeTransform = [[1, 0, 9080], [0, 1, 5152]];
    instance_102_121.y = 5152;
    figma.currentPage.appendChild(instance_102_121);
    // Swap COMPONENT
    instance_102_121.swapComponent(component_1_430);
    // Ref to SUB NODE
    var frame_I102_121_1_431 = figma.getNodeById("I" + instance_102_121.id + ";" + frame_1_431.id);
    // Ref to SUB NODE
    var rectangle_I102_121_1_432 = figma.getNodeById("I" + instance_102_121.id + ";" + rectangle_1_432.id);
    // Ref to SUB NODE
    var text_I102_121_1_433 = figma.getNodeById("I" + instance_102_121.id + ";" + text_1_433.id);
    text_I102_121_1_433.resize(416.9899902344, 42.0000000000);
    loadFonts().then((res) => {
        text_I102_121_1_433.fontName = {
            family: "Inter",
            style: "Regular"
        };
        text_I102_121_1_433.characters = "Change the deafult appearance of all cells by customising this base component.";
    });
    // Remove table border component from canvas
    component_1_351.remove();
    // Remove tooltip component from canvas
    component_1_430.remove();
    setPluginData_1(component_1_378, "elementSemantics", { is: "table" });
    setPluginData_1(component_1_365, "elementSemantics", { is: "tr" });
    setPluginData_1(component_101_204, "elementSemantics", { is: "td" });
    setPluginData_1(component_101_265, "elementSemantics", { is: "th" });
    // Manually add properties so cells will fill row height
    instance_1_372.layoutAlign = "STRETCH";
    instance_1_366.layoutAlign = "STRETCH";
    obj.table = component_1_378;
    obj.row = component_1_365;
    obj.cell = component_101_204;
    obj.headerCell = component_101_265;
    // component_1_5.setRelaunchData({ selectColumn: 'Select all cells in column', selectRow: 'Select all cells in row' })
    // component_1_13.setPluginData("isCellHeader", "true")
    // component_1_13.setRelaunchData({ selectColumn: 'Select all cells in column', selectRow: 'Select all cells in row' })
    // component_1_21.setPluginData("isRow", "true")
    // component_1_35.setRelaunchData({ detachTable: 'Detaches table and rows' })
    return obj;
}

var name = "svelte-app";
var version = "1.0.2";
var scripts = {
	build: "rollup -c",
	dev: "rollup -c -w",
	start: "sirv public"
};
var devDependencies = {
	"@figlets/helpers": "^0.0.0-alpha.9",
	"@rollup/plugin-commonjs": "^17.0.0",
	"@rollup/plugin-image": "^2.0.6",
	"@rollup/plugin-json": "^4.1.0",
	"@rollup/plugin-node-resolve": "^11.2.1",
	"@rollup/plugin-replace": "^2.4.2",
	cssnano: "^4.1.10",
	"figma-plugin-ds-svelte": "^1.0.7",
	"flex-gap-polyfill": "^2.2.1",
	nanoid: "^3.1.22",
	plugma: "0.0.0-alpha0.7",
	postcss: "^8.2.4",
	"postcss-nested": "^4.2.3",
	rollup: "^2.36.2",
	"rollup-plugin-html-bundle": "0.0.3",
	"rollup-plugin-livereload": "^2.0.0",
	"rollup-plugin-node-polyfills": "^0.2.1",
	"rollup-plugin-postcss": "^4.0.0",
	"rollup-plugin-svelte": "^7.0.0",
	"rollup-plugin-svg": "^2.0.0",
	"rollup-plugin-terser": "^7.0.2",
	"rollup-plugin-typescript": "^1.0.1",
	svelte: "^3.31.2",
	"svelte-preprocess": "^4.6.9",
	tslib: "^2.1.0",
	typescript: "^4.1.3"
};
var dependencies = {
	autoprefixer: "^10.2.1",
	"common-tags": "^1.8.0",
	"fs-extra": "^9.1.0",
	"postcss-logical": "^4.0.2",
	"sirv-cli": "^1.0.10",
	stylup: "0.0.0-alpha.3",
	uniqid: "^5.3.0",
	uuid: "^8.3.2"
};
var require$$0 = {
	name: name,
	version: version,
	scripts: scripts,
	devDependencies: devDependencies,
	dependencies: dependencies
};

// TODO: Check package from working directory
// TODO: Check versions from working directory
// TODO: How to fix issue of referenceing file when used as depency
// import pkg from '../package.json';
// import versionHistory from './versions.json';
// import semver from 'semver';
// import fs from 'fs';
// import path from 'path';
var pkg;

{
    pkg = require$$0;
}
// try {
// 	versionHistory = require("./package.json");
// }
// catch {
// 	versionHistory = {}
// }
// pkg = require(process.cwd() + "/package.json");
// }
// console.log(process.cwd() + "/package.json");
// fs.readFile("../package.json", (err, data) => {
// 	console.log(err, data)
// })
// const file = require("package.json")
// console.log(file)
// function updateAvailable() {
// 	var currentVersion = figma.root.getPluginData("pluginVersion") || pkg.version;
// 	var newVersion = pkg.version;
// 	if (semver.gt(newVersion, currentVersion)) {
// 		return true
// 	}
// 	else {
// 		false
// 	}
// }
function plugma(plugin) {
    var pluginState = {
        updateAvailable: false,
        ui: {}
    };
    // console.log(pkg)
    if (pkg === null || pkg === void 0 ? void 0 : pkg.version) {
        pluginState.version = pkg.version;
    }
    // pluginState.updateAvailable = updateAvailable()
    var eventListeners = [];
    var menuCommands = [];
    pluginState.on = (type, callback) => {
        eventListeners.push({ type, callback });
    };
    pluginState.command = (type, callback) => {
        menuCommands.push({ type, callback });
    };
    // Override default page name if set
    var pageMannuallySet = false;
    pluginState.setStartPage = (name) => {
        pluginState.ui.page = name;
        pageMannuallySet = true;
    };
    // pluginState.update = (callback) => {
    // 	for (let [version, changes] of Object.entries(versionHistory)) {
    // 		if (version === pkg.version) {
    // 			// for (let i = 0; i < changes.length; i++) {
    // 			// 	var change = changes[i]
    // 			// }
    // 			callback({ version, changes })
    // 		}
    // 	}
    // }
    var pluginCommands = plugin(pluginState);
    // // Override default page name if set
    // if (pageName[0]) {
    // 	pluginState.ui.page = pageName[0]
    // }
    // console.log("pageName", pluginState.ui.page)
    Object.assign({}, pluginState, { commands: pluginCommands });
    if (pluginCommands) {
        for (let [key, value] of Object.entries(pluginCommands)) {
            // If command exists in manifest
            if (figma.command === key) {
                // Pass default page for ui
                if (!pageMannuallySet) {
                    pluginState.ui.page = key;
                }
                // Override default page name if set
                // if (pageName[0]) {
                // 	pluginState.ui.page = pageName[0]
                // }
                // Call function for that command
                value(pluginState);
                // Show UI?
                if (pluginState.ui.open) {
                    console.log("open?");
                    figma.showUI(pluginState.ui.html);
                }
            }
        }
    }
    figma.ui.onmessage = message => {
        for (let eventListener of eventListeners) {
            // console.log(message)
            if (message.type === eventListener.type)
                eventListener.callback(message);
        }
    };
    pluginState.ui.show = (data) => {
        figma.showUI(pluginState.ui.html, { width: pluginState.ui.width, height: pluginState.ui.height });
        figma.ui.postMessage(data);
    };
    for (let command of menuCommands) {
        if (figma.command === command.type) {
            command.callback(pluginState);
        }
    }
    // console.log(pluginObject)
}

var dist = plugma;

// Move to helpers
function genRandomId() {
    var randPassword = Array(10).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz").map(function (x) { return x[Math.floor(Math.random() * x.length)]; }).join('');
    return randPassword;
}
async function lookForComponent(template) {
    // Import component first?
    // If fails, then look for it by id? What if same id is confused with local component?
    // Needs to know if component is remote?
    var component;
    var localComponent = findComponentById(template.component.id);
    try {
        if (localComponent && localComponent.key === template.component.key) {
            component = localComponent;
        }
    }
    catch (_a) {
        component = await figma.importComponentByKeyAsync(template.component.key);
    }
    return component;
}
async function toggleColumnResizing(selection) {
    function getTableSettings(table) {
        var _a, _b, _c;
        let rowCount = 0;
        let columnCount = 0;
        for (let i = 0; i < table.children.length; i++) {
            var node = table.children[i];
            if (((_a = getPluginData(node, "elementSemantics")) === null || _a === void 0 ? void 0 : _a.is) === "tr") {
                rowCount++;
            }
        }
        let firstRow = table.findOne((node) => { var _a; return ((_a = getPluginData(node, "elementSemantics")) === null || _a === void 0 ? void 0 : _a.is) === "tr"; });
        let firstCell = firstRow.findOne((node) => { var _a, _b; return ((_a = getPluginData(node, "elementSemantics")) === null || _a === void 0 ? void 0 : _a.is) === "td" || ((_b = getPluginData(node, "elementSemantics")) === null || _b === void 0 ? void 0 : _b.is) === "th"; });
        for (let i = 0; i < firstRow.children.length; i++) {
            var node = firstRow.children[i];
            var cellType = (_b = getPluginData(node, "elementSemantics")) === null || _b === void 0 ? void 0 : _b.is;
            if (cellType === "td" || cellType === "th") {
                columnCount++;
            }
        }
        return {
            columnCount,
            rowCount,
            columnResizing: firstRow.type === "COMPONENT" ? true : false,
            includeHeader: ((_c = getPluginData(firstCell, "elementSemantics")) === null || _c === void 0 ? void 0 : _c.is) === "th" ? true : false,
            cellAlignment: "MIN"
        };
    }
    for (let i = 0; i < selection.length; i++) {
        var oldTable = selection[i];
        let settings = getTableSettings(oldTable);
        settings.columnResizing = !settings.columnResizing;
        // FIXME: Should use current node as the template
        let newTable = await createTableInstance(oldTable, settings);
        // copyPaste(oldTable, newTable, { include: ['x', 'y', 'name'] })
        // Loop new table and replace with cells from old table
        oldTable.remove();
    }
}
async function createTableInstance(templateNode, preferences) {
    // FIXME: Get it to work with parts which are not components as well
    let part = findTemplateParts(templateNode);
    console.log(part);
    // FIXME: Check for imported components
    // FIXME: Check all conditions are met. Is table, is row, is cell, is instance etc.
    // Let user know if a cell header can't be found
    if (preferences.includeHeader && !part.th) {
        figma.notify("No Header Cell component found");
        // FIXME: Check for header cell sooner so table creation doesn't start
        return;
    }
    var tableInstance = convertToFrame_1(part.table.clone());
    // Remove children which are trs
    tableInstance.findAll((node) => {
        var _a;
        if (((_a = getPluginData(node, "elementSemantics")) === null || _a === void 0 ? void 0 : _a.is) === "tr") {
            node.remove();
        }
    });
    // Create first row
    var firstRow;
    var rowIndex = getNodeIndex_1(part.tr);
    if (preferences.columnResizing) {
        // First row should be a component
        firstRow = convertToComponent_1(part.tr.clone());
    }
    else {
        // First row should be a frame
        firstRow = convertToFrame_1(part.tr.clone());
    }
    tableInstance.insertChild(rowIndex, firstRow);
    // Remove children which are tds
    firstRow.findAll((node) => {
        var _a, _b;
        console.log(node);
        if (((_a = getPluginData(node, "elementSemantics")) === null || _a === void 0 ? void 0 : _a.is) === "td" || ((_b = getPluginData(node, "elementSemantics")) === null || _b === void 0 ? void 0 : _b.is) === "th") {
            node.remove();
        }
    });
    // Create columns in first row
    for (let i = 0; i < preferences.columnCount; i++) {
        var duplicateCell = part.td.clone();
        // Figma doesn't automatically inherit this property
        duplicateCell.layoutAlign = part.td.layoutAlign;
        duplicateCell.primaryAxisAlignItems = preferences.cellAlignment;
        firstRow.appendChild(duplicateCell);
    }
    // Create rest of rows
    for (var i = 1; i < preferences.rowCount; i++) {
        var duplicateRow;
        if (firstRow.type === "COMPONENT") {
            duplicateRow = firstRow.createInstance();
        }
        else {
            duplicateRow = firstRow.clone();
        }
        tableInstance.insertChild(rowIndex + 1, duplicateRow);
    }
    // Swap first row to use header cell
    if (preferences.includeHeader && part.th) {
        for (var i = 0; i < firstRow.children.length; i++) {
            var child = firstRow.children[i];
            // FIXME: Check if instance or main component
            child.swapComponent(part.th.mainComponent);
        }
    }
    // If using columnResizing and header swap non headers to default cells
    if (preferences.columnResizing && preferences.includeHeader) {
        for (let i = 0; i < tableInstance.children.length; i++) {
            var row = tableInstance.children[i];
            // Don't swap the first one
            if (i > 0) {
                for (let i = 0; i < row.children.length; i++) {
                    var cell = row.children[i];
                    // cell.swapComponent(part.th)
                    // FIXME: Check if instance or main component
                    cell.mainComponent = part.td.mainComponent;
                }
            }
        }
    }
    return tableInstance;
}
async function updateTableInstances(template) {
    // FIXME: Template file name not up to date for some reason
    var tables = figma.root.findAll((node) => { var _a; return ((_a = getPluginData(node, 'template')) === null || _a === void 0 ? void 0 : _a.id) === template.id; });
    var tableTemplate = await lookForComponent(template);
    var rowTemplate = tableTemplate.findOne(node => node.getPluginData('isRow'));
    for (let b = 0; b < tables.length; b++) {
        var table = tables[b];
        // Don't apply if an instance
        if (table.type !== "INSTANCE") {
            console.log("tableTemplate", tableTemplate);
            copyPasteStyle(tableTemplate, table, { include: ['name'] });
            for (let x = 0; x < table.children.length; x++) {
                var row = table.children[x];
                if (getPluginData(row, "isRow") === true && row.type !== "INSTANCE") {
                    copyPasteStyle(rowTemplate, row, { include: ['name'] });
                }
                // // Only need to loop through cells if has been changed by user
                // if (row.children && getPluginData(row, "isRow") === true) {
                // 	for (let k = 0; k < row.children.length; k++) {
                // 		var cell = row.children[k]
                // 	}
                // }
            }
        }
    }
}
function selectParallelCells() {
    var _a;
    // Needs a way to exclude things which aren't rows/columns, or a way to include only rows/columns
    var regex = RegExp(/\[ignore\]/, 'g');
    var selection = figma.currentPage.selection;
    var newSelection = [];
    for (let i = 0; i < selection.length; i++) {
        var parent = (_a = selection[i].parent) === null || _a === void 0 ? void 0 : _a.parent;
        var children = parent === null || parent === void 0 ? void 0 : parent.children;
        var rowIndex = children.findIndex(x => x.id === selection[i].parent.id);
        var columnIndex = children[rowIndex].children.findIndex(x => x.id === selection[i].id);
        for (let i = 0; i < children.length; i++) {
            if (children[i].children) {
                if (children[i].children[columnIndex] && !regex.test(children[i].children[columnIndex].parent.name)) {
                    newSelection.push(clone(children[i].children[columnIndex]));
                }
            }
        }
    }
    figma.currentPage.selection = newSelection;
}
function selectAdjacentCells() {
    var _a;
    // Needs a way to exclude things which aren't rows/columns, or a way to include only rows/columns
    var regex = RegExp(/\[ignore\]/, 'g');
    var selection = figma.currentPage.selection;
    var newSelection = [];
    for (let i = 0; i < selection.length; i++) {
        // Table container
        var parent = (_a = selection[i].parent) === null || _a === void 0 ? void 0 : _a.parent;
        // rows or columns
        var children = parent === null || parent === void 0 ? void 0 : parent.children;
        var rowIndex = children.findIndex(x => x.id === selection[i].parent.id);
        // var columnIndex = children[rowIndex].children.findIndex(x => x.id === selection[i].id)
        for (let i = 0; i < children.length; i++) {
            var cell = children[rowIndex];
            for (let b = 0; b < cell.children.length; b++) {
                if (cell.children) {
                    if (cell.children[b] && !regex.test(cell.children[b].parent.name)) {
                        newSelection.push(clone(cell.children[b]));
                    }
                }
            }
        }
    }
    figma.currentPage.selection = newSelection;
}
function selectColumn() {
    var _a, _b;
    if (figma.currentPage.selection.length > 0) {
        if (((_a = figma.currentPage.selection[0].parent) === null || _a === void 0 ? void 0 : _a.parent.layoutMode) === "VERTICAL") {
            selectParallelCells();
        }
        if (((_b = figma.currentPage.selection[0].parent) === null || _b === void 0 ? void 0 : _b.parent.layoutMode) === "HORIZONTAL") {
            selectAdjacentCells();
        }
    }
    else {
        figma.notify("One or more table cells must be selected");
    }
}
function selectRow() {
    var _a, _b;
    if (figma.currentPage.selection.length > 0) {
        if (((_a = figma.currentPage.selection[0].parent) === null || _a === void 0 ? void 0 : _a.parent.layoutMode) === "HORIZONTAL") {
            selectParallelCells();
        }
        if (((_b = figma.currentPage.selection[0].parent) === null || _b === void 0 ? void 0 : _b.parent.layoutMode) === "VERTICAL") {
            selectAdjacentCells();
        }
    }
    else {
        figma.notify("One or more table cells must be selected");
    }
}
function linkComponent(template, selection) {
    if (selection.length === 1) {
        if (selection[0].type !== "COMPONENT") {
            figma.notify("Please make sure node is a component");
        }
        else {
            const capitalize = (s) => {
                if (typeof s !== 'string')
                    return '';
                return s.charAt(0).toUpperCase() + s.slice(1);
            };
            // Make sure old templates don't have any old preferences on them
            // TODO: Need to check this works
            var oldTemplate = findComponentById(getPluginData(figma.root, 'components').current[template].id);
            // Check if a previous template has been set first
            if (oldTemplate) {
                // updatePluginData(figma.root, 'components', (data) => { data.previous[template] = oldTemplate.id })
                oldTemplate.setPluginData("isTable", "");
                oldTemplate.setPluginData("isRow", "");
                oldTemplate.setPluginData("isCell", "");
                oldTemplate.setPluginData("isCellHeader", "");
            }
            selection[0].setPluginData("is" + capitalize(template), "true"); // Check
            // if (template === "cell") {
            // 	figma.root.setPluginData("cellWidth", selection[0].width.toString())
            // }
            if (template === "table") {
                selection[0].setRelaunchData({ detachTable: 'Detaches table and rows' });
            }
            // Save component ids which are used to create tables to preferences
            updateClientStorageAsync_1('userPreferences', (data) => {
                data.components[template] = selection[0].id;
                return data;
            });
            if (template === "cellHeader")
                template = "Header Cell";
            figma.notify(capitalize(template) + " component succesfully linked");
        }
    }
    if (selection.length > 1) {
        figma.notify("Make sure only one component is selected");
    }
    if (selection.length === 0) {
        figma.notify("No components selected");
    }
}
function restoreComponent(component) {
    var component = figma.getNodeById(figma.root.getPluginData(component + "ComponentID"));
    figma.currentPage.appendChild(component);
    if (component) {
        figma.currentPage.selection = [component];
        figma.viewport.scrollAndZoomIntoView(figma.currentPage.selection);
    }
    else {
        figma.notify("Component not found");
    }
}
// Takes input like rowCount and columnCount to create table and sets plugin preferences to root.
function createTable(msg) {
    getClientStorageAsync_1('userPreferences').then((res) => {
        // Will only let you create a table if less than 50 columns and rows
        if (msg.columnCount < 51 && msg.rowCount < 51) {
            var template = getPluginData(figma.root, 'defaultTemplate');
            lookForComponent(template).then((templateNode) => {
                // Will input from user and create table node
                createTableInstance(templateNode, msg).then((table) => {
                    // If table successfully created?
                    if (table) {
                        table.setRelaunchData({});
                        // Positions the table in the center of the viewport
                        positionInCenter(table);
                        // Makes table the users current selection
                        figma.currentPage.selection = [table];
                        // This updates the plugin preferences
                        updateClientStorageAsync_1('userPreferences', (data) => {
                            data.columnResizing = msg.columnResizing;
                            data.columnCount = msg.columnCount;
                            data.rowCount = msg.rowCount;
                            data.cellWidth = msg.cellWidth;
                            data.remember = msg.remember;
                            data.includeHeader = msg.includeHeader;
                            data.cellAlignment = msg.cellAlignment;
                            return data;
                        }).then(() => {
                            figma.closePlugin();
                        });
                    }
                });
            }).catch((error) => {
                figma.notify("Check template component is published");
            });
        }
        else {
            figma.notify("Plugin limited to max of 50 columns and rows");
        }
    });
}
// Merge document localTemplate and merge to clientStorage as recentFiles
async function syncRecentFiles() {
    return updateClientStorageAsync_1("recentFiles", (recentFiles) => {
        recentFiles = recentFiles || [];
        var localTemplates = getPluginData(figma.root, "localTemplates");
        // console.log("localTemplates", localTemplates)
        if ((Array.isArray(localTemplates) && localTemplates.length > 0) && recentFiles) {
            var newFile = {
                id: getPluginData(figma.root, 'fileId'),
                name: figma.root.name,
                templates: localTemplates
            };
            // Only add file to array if unique
            if (!recentFiles.some((item) => item.id === newFile.id)) {
                recentFiles.push(newFile);
            }
        }
        return recentFiles;
    });
}
// This makes sure the node data
function syncTemplateData() {
    var templateNodes = figma.root.findAll((node) => getPluginData(node, 'template') && node.type === "COMPONENT");
    for (let templateNode of templateNodes) {
        updateTemplate(templateNode);
    }
}
// This makes sure the default/chosen template is up to date
async function syncDefaultTemplate() {
    var defaultTemplate = getPluginData(figma.root, 'defaultTemplate');
    var defaultComponent = await lookForComponent(defaultTemplate);
    updatePluginData_1(figma.root, 'defaultTemplate', (data) => {
        if (defaultComponent) {
            // data.defaultTemplate.file.name = figma.root.name
            data.name = defaultComponent.name;
        }
        return data;
    });
}
// This makes sure the list of local and remote templates are up to date
async function syncRemoteFiles() {
    // First update file names by looking up first component of each file
    // TODO: Get remoteFiles from client storage
    // TODO: Add each file to list of document remoteFiles
    var recentFiles = await getClientStorageAsync_1("recentFiles");
    // console.log("recentFiles", recentFiles)
    updatePluginData_1(figma.root, 'remoteFiles', (remoteFiles) => {
        remoteFiles = remoteFiles || undefined;
        // Merge recentFiles into remoteFiles
        if (recentFiles) {
            if (!remoteFiles)
                remoteFiles = [];
            var ids = new Set(remoteFiles.map(d => d.id));
            var merged = [...remoteFiles, ...recentFiles.filter(d => !ids.has(d.id))];
            // Exclude current file
            merged = merged.filter(d => {
                return !(d.id === getPluginData(figma.root, "fileId"));
            });
            remoteFiles = merged;
        }
        if (remoteFiles) {
            for (var i = 0; i < remoteFiles.length; i++) {
                var file = remoteFiles[i];
                figma.importComponentByKeyAsync(file.templates[0].component.key).then((component) => {
                    var remoteTemplate = getPluginData(component, 'template');
                    updatePluginData_1(figma.root, 'remoteFiles', (remoteFiles) => {
                        remoteFiles.map((file) => {
                            if (file.id === remoteTemplate.file.id) {
                                file.name = remoteTemplate.file.name;
                            }
                        });
                        return remoteFiles;
                    });
                }).catch(() => {
                    // FIXME: Do I need to do something here if component is deleted?
                    // FIXME: Is this the wrong time to check if component is published?
                    // figma.notify("Please check component is published")
                });
            }
            // FIXME: Fix helper. Only needed because helper will cause plugin data to be undefined if doesn't return value
            return remoteFiles;
        }
    });
}
function syncLocalTemplates() {
    // Doesn't set templates, only updates them
    updatePluginData_1(figma.root, 'localTemplates', (templates) => {
        templates = templates || undefined;
        if (templates) {
            // console.log(templates)
            for (var i = 0; i < templates.length; i++) {
                // FIXME: What happens if template can't be found? TODO: Template should be removed from list
                var componentId = templates[i].component.id;
                var component = findComponentById(componentId);
                if (component) {
                    templates[i] = getPluginData(component, 'template');
                }
                else {
                    templates.splice(i, 1);
                }
            }
        }
        // FIXME: Fix helper. Only needed because helper will cause plugin data to be undefined if doesn't return value
        return templates;
    });
}
function addNewTemplate(node, templates) {
    // Add template to file in list
    var newTemplateEntry = {
        id: getPluginData(node, 'template').id,
        name: getPluginData(node, 'template').name,
        component: getPluginData(node, 'template').component,
        file: getPluginData(node, 'template').file
    };
    // Only add new template if unique
    if (!templates.some((template) => template.id === newTemplateEntry.id)) {
        templates.push(newTemplateEntry);
    }
    return templates;
}
function findTemplateParts(templateNode) {
    // find nodes with certain pluginData
    let elements = [
        "tr",
        "td",
        "th"
    ];
    let results = {};
    if (getPluginData(templateNode, 'elementSemantics').is === "table") {
        results["table"] = templateNode;
    }
    // Loop though element definitions and find them in the template
    for (let i = 0; i < elements.length; i++) {
        let elementName = elements[i];
        let part = templateNode.findOne(node => {
            let elementSemantics = getPluginData(node, 'elementSemantics');
            if ((elementSemantics === null || elementSemantics === void 0 ? void 0 : elementSemantics.is) === elementName) {
                return true;
            }
        });
        results[elementName] = part;
    }
    // // For instances assign the mainComponent as the part
    // for (let [key, value] of Object.entries(results)) {
    // 	if (value.type === "INSTANCE") {
    // 		results[key] = value.mainComponent
    // 	}
    // }
    return results;
}
function importTemplate(nodes) {
    // TODO: Needs to work more inteligently so that it corretly adds template if actually imported from file. Try to import first, if doesn't work then it must be local. Check to see if component published also.
    // TODO: Check if already imported by checking id in list?
    var _a, _b;
    // Add file to list of files used by the document
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var isLocalButNotComponent = ((_b = (_a = getPluginData(node, 'template')) === null || _a === void 0 ? void 0 : _a.file) === null || _b === void 0 ? void 0 : _b.id) === getPluginData(figma.root, 'fileId') && node.type !== "COMPONENT";
        if (node.type === "COMPONENT" || isLocalButNotComponent) {
            if (isLocalButNotComponent) {
                node = convertToComponent_1(node);
            }
            markNode(node, 'table');
            updatePluginData_1(figma.root, 'localTemplates', (data) => {
                data = data || [];
                data = addNewTemplate(node, data);
                return data;
            });
            figma.notify(`Imported ${node.name}`);
        }
        else {
            updatePluginData_1(figma.root, 'remoteFiles', (data) => {
                data = data || [];
                // First get a list of files currently stored on the document
                // If new file then add to the list
                // Use when adding from same file
                // var newValue = {
                // 	id: getPluginData(figma.root, 'fileId'),
                // 	name: figma.root.name,
                // 	templates: []
                // }
                // Use when importing from another file
                var newValue = {
                    id: getPluginData(figma.currentPage.selection[0], 'template').file.id,
                    name: getPluginData(figma.currentPage.selection[0], 'template').file.name,
                    templates: []
                };
                // Only add file to array if unique
                if (!data.some((item) => item.id === newValue.id)) {
                    data.push(newValue);
                }
                for (var i = 0; i < data.length; i++) {
                    var file = data[i];
                    if (file.id === getPluginData(figma.currentPage.selection[0], 'template').file.id) {
                        file.templates = addNewTemplate(figma.currentPage.selection[0], file.templates);
                    }
                }
                return data;
            });
            figma.notify(`Imported ${node.name}`);
        }
        setDefaultTemplate(getPluginData(node, 'template'));
    }
}
function markNode(node, element) {
    // Should this be split into markNode and setTemplate?
    setPluginData_1(node, `elementSemantics`, {
        is: element
    });
    if (element === 'table') {
        setTemplate(node);
    }
}
function setTemplate(node) {
    if (node.type === "COMPONENT") {
        setPluginData_1(node, "template", {
            file: {
                id: getPluginData(figma.root, 'fileId'),
                name: figma.root.name
            },
            name: node.name,
            id: genRandomId(),
            component: {
                key: node.key,
                id: node.id
            }
        });
    }
}
// Updates file name and component name for template data (currently only works with local template data)
function updateTemplate(node) {
    if (node.type === "COMPONENT") {
        updatePluginData_1(node, "template", (data) => {
            if (data) {
                data.file.name = figma.root.name;
                data.name = node.name;
            }
            return data;
        });
    }
}
function setDefaultTemplate(template) {
    setPluginData_1(figma.root, 'defaultTemplate', template);
    // TODO: If template is remote then set flag to say user is using remote/existing template
    // setPluginData(figma.root, "usingRemoteTemplate", true)
    // await updateClientStorageAsync('userPreferences', (data) => {
    // 	console.log(template)
    // 	data.defaultTemplate = template
    // 	return data
    // })
    // FIXME: Investigate why template is undefined sometimes
    if (template === null || template === void 0 ? void 0 : template.name) {
        figma.notify(`${template.name} set as default`);
    }
    // FIXME: Consider combining into it's own function?
    figma.clientStorage.getAsync('userPreferences').then((res) => {
        figma.ui.postMessage(Object.assign(Object.assign({}, res), { defaultTemplate: getPluginData(figma.root, 'defaultTemplate'), remoteFiles: getPluginData(figma.root, 'remoteFiles'), localTemplates: getPluginData(figma.root, 'localTemplates'), fileId: getPluginData(figma.root, 'fileId') }));
    });
}
// setTimeout(() => {
syncLocalTemplates();
syncRecentFiles().then(() => {
    syncTemplateData();
    syncDefaultTemplate();
    // TODO: Sync default template: find default template and pull in latest name
    syncRemoteFiles();
});
// }, 1)
dist((plugin) => {
    plugin.ui = {
        html: __uiFiles__.main,
        width: 268,
        height: 504
    };
    // Set default preferences
    updateClientStorageAsync_1('userPreferences', (data) => {
        data = data || {
            columnCount: 4,
            rowCount: 4,
            cellWidth: 100,
            remember: true,
            includeHeader: true,
            columnResizing: true,
            cellAlignment: "MIN"
        };
        return data;
    });
    // Set random id on  document
    updatePluginData_1(figma.root, 'fileId', (data) => {
        data = data || genRandomId();
        return data;
    });
    plugin.command('createTable', ({ ui, data }) => {
        getClientStorageAsync_1("recentFiles").then((recentFiles) => {
            if (recentFiles) {
                // Exclude current file
                recentFiles = recentFiles.filter(d => {
                    return !(d.id === getPluginData(figma.root, "fileId"));
                });
                recentFiles = (Array.isArray(recentFiles) && recentFiles.length > 0);
            }
            getClientStorageAsync_1("pluginAlreadyRun").then((pluginAlreadyRun) => {
                figma.clientStorage.getAsync('userPreferences').then((res) => {
                    ui.show(Object.assign(Object.assign({ type: "create-table" }, res), { usingRemoteTemplate: getPluginData(figma.root, "usingRemoteTemplate"), defaultTemplate: getPluginData(figma.root, 'defaultTemplate'), remoteFiles: getPluginData(figma.root, 'remoteFiles'), localTemplates: getPluginData(figma.root, 'localTemplates'), fileId: getPluginData(figma.root, 'fileId'), pluginAlreadyRun: pluginAlreadyRun, recentFiles: recentFiles }));
                });
            });
        });
    });
    // plugin.command('createTableInstance', () => {
    // 	var selection = figma.currentPage.selection
    // 	createTableInstance(getPluginData(selection[0], 'template'), preferences).then(() => {
    // 		figma.closePlugin("Table created")
    // 	})
    // })
    plugin.command('importTemplate', () => {
        var selection = figma.currentPage.selection;
        if (selection.length === 1) {
            if (getPluginData(selection[0], 'isTable')) {
                importTemplate(selection);
            }
        }
        figma.closePlugin();
    });
    plugin.command('markTable', () => {
        markNode(figma.currentPage.selection[0], 'table');
        figma.closePlugin();
    });
    plugin.command('markTableData', () => {
        var selection = figma.currentPage.selection;
        if (selection.length === 1) {
            setPluginData_1(selection[0], "isCell", true);
        }
        figma.closePlugin();
    });
    plugin.command('markTableRow', () => {
        var selection = figma.currentPage.selection;
        if (selection.length === 1) {
            setPluginData_1(selection[0], "isRow", true);
        }
        figma.closePlugin();
    });
    plugin.command('viewNodeData', () => {
        console.log('nodeData ->', getPluginData(figma.currentPage.selection[0], 'template'));
        figma.closePlugin();
    });
    plugin.command('linkComponents', ({ ui }) => {
        figma.clientStorage.getAsync('templates').then((components) => {
            ui.show({ type: "settings", components });
        });
    });
    plugin.command('newTemplate', () => {
        var components = createDefaultTemplate();
        // markNode(components.table, 'table')
        importTemplate([components.table]);
        var tempGroup = figma.group(Object.values(components), figma.currentPage);
        positionInCenter(tempGroup);
        figma.currentPage.selection = ungroup_1(tempGroup, figma.currentPage);
        setPluginData_1(figma.root, "usingRemoteTemplate", false);
        syncRecentFiles().then(() => {
            figma.closePlugin('New template created');
        });
    });
    plugin.command('selectColumn', () => {
        selectColumn();
        figma.closePlugin();
    });
    plugin.command('selectRow', () => {
        selectRow();
        figma.closePlugin();
    });
    plugin.command('resetRemoteData', () => {
        setPluginData_1(figma.root, "usingRemoteTemplate", "");
        setPluginData_1(figma.root, "remoteFiles", "");
        updateClientStorageAsync_1("recentFiles", (recentFiles) => {
            console.log("Recent files removed", recentFiles);
            setPluginData_1(figma.root, "remoteFiles", "");
            return undefined;
        }).then(() => {
            figma.closePlugin("Remote files reset");
        });
    });
    plugin.command('resetUserPreferences', () => {
        setClientStorageAsync_1("userPreferences", undefined).then(() => {
            figma.closePlugin("User preferences reset");
        });
    });
    plugin.command('toggleColumnResizing', () => {
        toggleColumnResizing(figma.currentPage.selection).then(() => {
            figma.closePlugin();
        });
    });
    // Listen for events from UI
    plugin.on('to-create-table', (msg) => {
        figma.clientStorage.getAsync('userPreferences').then((res) => {
            plugin.ui.show(Object.assign(Object.assign({ type: "create-table" }, res), { defaultTemplate: getPluginData(figma.root, 'defaultTemplate'), remoteFiles: getPluginData(figma.root, 'remoteFiles'), localTemplates: getPluginData(figma.root, 'localTemplates'), fileId: getPluginData(figma.root, 'fileId') }));
        });
    });
    plugin.on('update-table-instances', (msg) => {
        updateTableInstances(msg.template).then(() => {
            figma.notify('Tables updated', { timeout: 1500 });
        });
    });
    plugin.on('new-template', (msg) => {
        var components = createDefaultTemplate();
        // markNode(components.table, 'table')
        importTemplate([components.table]);
        // setDefaultTemplate(getPluginData(components.table, 'template'))
        figma.notify('New template created');
        // Shouldn't be set, but lets do it just for good measure
        setPluginData_1(figma.root, "usingRemoteTemplate", false);
        setClientStorageAsync_1("pluginAlreadyRun", true);
        syncRecentFiles();
    });
    plugin.on('existing-template', (msg) => {
        figma.notify('Using remote template');
    });
    plugin.on('using-remote-template', (msg) => {
        setPluginData_1(figma.root, "usingRemoteTemplate", msg.usingRemoteTemplate);
    });
    plugin.on('create-table', createTable);
    plugin.on('link-component', (msg) => {
        linkComponent(msg.template, figma.currentPage.selection);
    });
    // Updates what?
    plugin.on('update', (msg) => {
        // updatePluginData(figma.root, 'components', (data) => {
        // 	if (findComponentById(getPluginData(figma.root, 'components').current?.cell?.id)) {
        // 		data.componentsExist = true
        // 	}
        // 	else {
        // 		data.componentsExist = false
        // 	}
        // 	return data
        // })
        figma.clientStorage.getAsync('preferences').then((res) => {
            figma.ui.postMessage(Object.assign(Object.assign({}, res), { componentsExist: getPluginData(figma.root, 'components').componentsExist }));
        });
    });
    plugin.on('restore-component', (msg) => {
        restoreComponent(msg.component);
    });
    plugin.on('set-default-template', (msg) => {
        setDefaultTemplate(msg.template);
    });
    plugin.on('import-template', (msg) => {
        if (figma.currentPage.selection.length === 1) {
            if (getPluginData(figma.currentPage.selection[0], 'isTable')) {
                importTemplate(figma.currentPage.selection);
            }
        }
        figma.notify(`Template added`);
    });
});
// console.log('fileId ->', getPluginData(figma.root, 'fileId'))
// console.log('remoteFiles ->', getPluginData(figma.root, 'remoteFiles'))
// console.log('localTemplates ->', getPluginData(figma.root, 'localTemplates'))
console.log('defaultTemplate ->', getPluginData(figma.root, 'defaultTemplate'));
// getClientStorageAsync('userPreferences').then(res => {
// 	console.log(res)
// })
