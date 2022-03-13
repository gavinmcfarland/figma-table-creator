'use strict';

var name = "svelte-app";
var version = "1.0.2";
var scripts = {
	build: "rollup -c",
	dev: "rollup -c -w",
	start: "sirv public"
};
var devDependencies = {
	"@figma/plugin-typings": "^1.37.0",
	"@fignite/helpers": "^0.0.0-alpha.10",
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
	tweeno: "^1.1.3",
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

/**
 * Helpers which make it easier to update client storage
 */
async function getClientStorageAsync(key) {
    return await figma.clientStorage.getAsync(key);
}
async function updateClientStorageAsync(key, callback) {
    var data = await figma.clientStorage.getAsync(key);
    data = callback(data);
    // What should happen if user doesn't return anything in callback?
    if (!data) {
        data = null;
    }
    else {
        figma.clientStorage.setAsync(key, data);
        return data;
    }
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
// FIXME: When an empty objet is provided, copy over all properties including width and height
// FIXME: Don't require a setter in order to copy property. Should be able to copy from an object literal for example.
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
 * Converts an instance, component, or rectangle to a frame
 * @param {SceneNode} node The node you want to convert to a frame
 * @returns Returns the new node as a frame
 */
function convertToFrame(node) {
    if (node.type === "INSTANCE") {
        return node.detachInstance();
    }
    if (node.type === "COMPONENT") {
        let parent = node.parent;
        // This method preserves plugin data and relaunch data
        console.log("hello");
        let frame = node.createInstance().detachInstance();
        parent.appendChild(frame);
        copyPaste(node, frame, { include: ['x', 'y'] });
        // Treat like native method
        figma.currentPage.appendChild(frame);
        node.remove();
        return frame;
    }
    if (node.type === "RECTANGLE" || node.type === "GROUP") {
        let frame = figma.createFrame();
        // FIXME: Add this into copyPaste helper
        frame.resizeWithoutConstraints(node.width, node.height);
        copyPaste(node, frame);
        node.remove();
        return frame;
    }
    if (node.type === "FRAME") {
        // Don't do anything to it if it's a frame
        return node;
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
    node = convertToFrame(node);
    // FIXME: Add this into copyPaste helper
    component.resizeWithoutConstraints(node.width, node.height);
    copyPaste(node, component);
    moveChildren(node, component);
    node.remove();
    return component;
}

/**
 * Helpers which automatically parse and stringify when you get, set or update plugin data
 */
/**
 *
 * @param {BaseNode} node A figma node to get data from
 * @param {string} key  The key under which data is stored
 * @returns Plugin Data
 */
function getPluginData(node, key, opts) {
    var data;
    data = node.getPluginData(key);
    if (data) {
        if (typeof data === "string" && data.startsWith(">>>")) {
            data = data;
        }
        else {
            data = JSON.parse(data);
        }
    }
    else {
        data = undefined;
    }
    if (typeof data === "string" && data.startsWith(">>>")) {
        data = data.slice(3);
        var string = `(() => {
            return ` +
            data +
            `
            })()`;
        data = eval(string);
    }
    return data;
}
/**
 *
 * @param {BaseNode} node  A figma node to set data on
 * @param {String} key A key to store data under
 * @param {any} data Data to be stoed
 */
function setPluginData(node, key, data) {
    if (typeof data === "string" && data.startsWith(">>>")) {
        node.setPluginData(key, data);
    }
    else {
        node.setPluginData(key, JSON.stringify(data));
    }
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
 * Returns the index of a node
 * @param {SceneNode} node A node
 * @returns The index of the node
 */
function getNodeIndex(node) {
    return node.parent.children.indexOf(node);
}

/**
 * Returns the page node of the selected node
 * @param {SceneNode} node A node
 * @returns The page node
 */
function getPageNode(node) {
    if (node.parent.type === "PAGE") {
        return node.parent;
    }
    else {
        return getPageNode(node.parent);
    }
}

/**
 * An alias for `figma.root` plugin data
 * @param {String} key A key to store data under
 * @param {any} data Data to be stored
 */
function setDocumentData(key, data) {
    return setPluginData(figma.root, key, data);
}
/**
 * An alias for `figma.root` plugin data
 * @param {String} key A key to store data under
 */
function getDocumentData(key) {
    return getPluginData(figma.root, key);
}

var convertToComponent_1 = convertToComponent;
var convertToFrame_1 = convertToFrame;
var getClientStorageAsync_1 = getClientStorageAsync;
var getDocumentData_1 = getDocumentData;
var getNodeIndex_1 = getNodeIndex;
var getPageNode_1 = getPageNode;
var getPluginData_1 = getPluginData;
var setDocumentData_1 = setDocumentData;
var setPluginData_1 = setPluginData;
var updateClientStorageAsync_1 = updateClientStorageAsync;
var updatePluginData_1 = updatePluginData;

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
        else {
            throw 'error';
        }
    }
    catch (_a) {
        console.log('get remote', localComponent);
        component = await figma.importComponentByKeyAsync(template.component.key);
    }
    return component;
}
function getComponentById(id) {
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
            figma.root.setPluginData('cellComponentState', 'exists');
            return false;
        }
        else {
            figma.root.setPluginData('cellComponentState', 'removed');
            return node;
        }
    }
    else {
        figma.root.setPluginData('cellComponentState', 'deleted');
        return null;
    }
}
function createPage(name) {
    var newPage = figma.createPage();
    newPage.name = name;
    figma.currentPage = newPage;
    return newPage;
}
function isVariant(node) {
    var _a;
    if (node.type === 'INSTANCE') {
        return ((_a = node.mainComponent.parent) === null || _a === void 0 ? void 0 : _a.type) === 'COMPONENT_SET';
    }
}
function getVariantName(node) {
    var _a, _b;
    if (isVariant(node)) {
        let type = ((_a = node.variantProperties) === null || _a === void 0 ? void 0 : _a.Type) || ((_b = node.variantProperties) === null || _b === void 0 ? void 0 : _b.type);
        if (type) {
            return node.name + '/' + type;
        }
        else {
            return node.name + '/' + node.mainComponent.name;
        }
    }
    else {
        return node.name;
    }
}
function getSelectionName(node) {
    if (node) {
        if (isVariant(node)) {
            return getVariantName(node);
        }
        else {
            return node.name;
        }
    }
    else {
        return undefined;
    }
}
function isInsideComponent(node) {
    const parent = node.parent;
    // Sometimes parent is null
    if (parent) {
        if (parent && parent.type === 'COMPONENT') {
            return true;
        }
        else if (parent && parent.type === 'PAGE') {
            return false;
        }
        else {
            return isInsideComponent(parent);
        }
    }
    else {
        return false;
    }
}
function getParentComponent(node) {
    const parent = node.parent;
    // Sometimes parent is null
    if (parent) {
        if (parent && parent.type === 'COMPONENT') {
            return parent;
        }
        else if (parent && parent.type === 'PAGE') {
            return false;
        }
        else {
            return getParentComponent(parent);
        }
    }
    else {
        return false;
    }
}
function animateNodeIntoView(selection, duration, easing) {
    let page = getPageNode_1(selection[0]);
    figma.currentPage = page;
    // Get current coordiantes
    let origCoords = Object.assign(Object.assign({}, figma.viewport.center), { z: figma.viewport.zoom });
    // Get to be coordiantes
    figma.viewport.scrollAndZoomIntoView(selection);
    let newCoords = Object.assign(Object.assign({}, Object.assign({}, figma.viewport.center)), { z: figma.viewport.zoom });
    // Reset back to current coordinates
    figma.viewport.center = {
        x: origCoords.x,
        y: origCoords.y,
    };
    figma.viewport.zoom = origCoords.z;
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
    var target = Object.assign(Object.assign({}, origCoords), { update: function () {
            figma.viewport.center = { x: this.x, y: this.y };
            figma.viewport.zoom = this.z;
            // console.log(Math.round(this.x), Math.round(this.y))
        } });
    var queue = new Queue(), tween = new Tween(target, settings);
    // add the tween to the queue
    queue.add(tween);
    // start the queue
    queue.start();
    let loop = setInterval(() => {
        if (queue.tweens.length === 0) {
            clearInterval(loop);
        }
        else {
            queue.update();
            // update the target object state
            target.update();
        }
    }, 1);
}
function selectAndZoomIntoView(nodes) {
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
}

// figma.on('run', () => {
// 	updatePluginData(node, key, () => {
// 		data
// 	})
// })
// Move to helpers
function genRandomId() {
    var randPassword = Array(10).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz").map(function (x) { return x[Math.floor(Math.random() * x.length)]; }).join('');
    return randPassword;
}

// Wrap in function
async function createDefaultComponents() {
    const obj = {};
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
        ]);
    }
    // Create COMPONENT
    var component_101_204 = figma.createComponent();
    component_101_204.resize(120.0, 35.0);
    component_101_204.name = 'Type=Default';
    component_101_204.layoutAlign = 'STRETCH';
    component_101_204.fills = [{ type: 'SOLID', visible: true, opacity: 0.000009999999747378752, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }];
    component_101_204.primaryAxisSizingMode = 'FIXED';
    component_101_204.backgrounds = [
        { type: 'SOLID', visible: true, opacity: 0.000009999999747378752, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } },
    ];
    component_101_204.layoutMode = 'VERTICAL';
    component_101_204.description = '';
    component_101_204.documentationLinks = [];
    // Create COMPONENT
    var component_101_119 = figma.createComponent();
    component_101_119.resize(120.0, 35.0);
    component_101_119.name = '_BaseCell';
    component_101_119.relativeTransform = [
        [1, 0, 8760],
        [0, 1, 5164],
    ];
    component_101_119.x = 8760;
    component_101_119.y = 5164;
    component_101_119.layoutAlign = 'STRETCH';
    component_101_119.fills = [];
    component_101_119.primaryAxisSizingMode = 'FIXED';
    component_101_119.backgrounds = [];
    component_101_119.expanded = false;
    component_101_119.layoutMode = 'VERTICAL';
    component_101_119.description = '';
    component_101_119.documentationLinks = [];
    // Create FRAME
    var frame_101_114 = figma.createFrame();
    frame_101_114.resizeWithoutConstraints(120.0, 0.01);
    frame_101_114.primaryAxisSizingMode = 'AUTO';
    frame_101_114.locked = true;
    frame_101_114.layoutAlign = 'STRETCH';
    frame_101_114.fills = [];
    frame_101_114.backgrounds = [];
    frame_101_114.clipsContent = false;
    frame_101_114.expanded = false;
    component_101_119.appendChild(frame_101_114);
    // Create COMPONENT
    var component_1_351 = figma.createComponent();
    component_1_351.name = '_TableBorder';
    component_1_351.relativeTransform = [
        [1, 0, 8476],
        [0, 1, 5168],
    ];
    component_1_351.x = 8476;
    component_1_351.y = 5168;
    component_1_351.expanded = false;
    component_1_351.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
    component_1_351.description = '';
    component_1_351.documentationLinks = [];
    // Create LINE
    var line_1_352 = figma.createLine();
    line_1_352.resizeWithoutConstraints(500.0, 0.0);
    line_1_352.strokes = [
        {
            type: 'SOLID',
            visible: true,
            opacity: 1,
            blendMode: 'NORMAL',
            color: { r: 0.7254902124404907, g: 0.7254902124404907, b: 0.7254902124404907 },
        },
    ];
    line_1_352.relativeTransform = [
        [-4.37e-8, -1, 0],
        [1, -4.37e-8, 0],
    ];
    line_1_352.rotation = -90.00000250447827;
    line_1_352.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
    component_1_351.appendChild(line_1_352);
    // Create INSTANCE
    var instance_102_493 = component_1_351.createInstance();
    instance_102_493.relativeTransform = [
        [1, 0, 0],
        [0, 1, -250],
    ];
    instance_102_493.y = -250;
    frame_101_114.appendChild(instance_102_493);
    // Swap COMPONENT
    instance_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    figma.getNodeById('I' + instance_102_493.id + ';' + line_1_352.id);
    // Create FRAME
    var frame_101_116 = figma.createFrame();
    frame_101_116.resize(120.0, 35.0);
    frame_101_116.primaryAxisSizingMode = 'AUTO';
    frame_101_116.name = 'Content';
    frame_101_116.relativeTransform = [
        [1, 0, 0],
        [0, 1, 0.001],
    ];
    frame_101_116.y = 0.0010000000474974513;
    frame_101_116.layoutAlign = 'STRETCH';
    frame_101_116.fills = [];
    frame_101_116.paddingLeft = 12;
    frame_101_116.paddingRight = 12;
    frame_101_116.paddingTop = 10;
    frame_101_116.paddingBottom = 10;
    frame_101_116.backgrounds = [];
    frame_101_116.expanded = false;
    frame_101_116.layoutMode = 'VERTICAL';
    component_101_119.appendChild(frame_101_116);
    // Create TEXT
    var text_101_117 = figma.createText();
    text_101_117.resize(96.0, 15.0);
    text_101_117.relativeTransform = [
        [1, 0, 12],
        [0, 1, 10],
    ];
    text_101_117.x = 12;
    text_101_117.y = 10;
    text_101_117.layoutAlign = 'STRETCH';
    text_101_117.hyperlink = null;
    loadFonts().then((res) => {
        text_101_117.fontName = {
            family: 'Inter',
            style: 'Regular',
        };
        text_101_117.listSpacing = 0;
        text_101_117.characters = '';
        text_101_117.lineHeight = { unit: 'PERCENT', value: 125 };
        text_101_117.fontName = { family: 'Inter', style: 'Regular' };
        text_101_117.textAutoResize = 'HEIGHT';
    });
    frame_101_116.appendChild(text_101_117);
    // Create INSTANCE
    var instance_101_198 = component_101_119.createInstance();
    instance_101_198.resize(120.0, 35.0009994507);
    instance_101_198.primaryAxisSizingMode = 'AUTO';
    instance_101_198.relativeTransform = [
        [1, 0, 0],
        [0, 1, 0],
    ];
    instance_101_198.primaryAxisSizingMode = 'AUTO';
    instance_101_198.constraints = { horizontal: 'SCALE', vertical: 'CENTER' };
    component_101_204.appendChild(instance_101_198);
    // Swap COMPONENT
    instance_101_198.swapComponent(component_101_119);
    // Ref to SUB NODE
    figma.getNodeById('I' + instance_101_198.id + ';' + frame_101_114.id);
    // Ref to SUB NODE
    var instance_I101_198_102_493 = figma.getNodeById('I' + instance_101_198.id + ';' + instance_102_493.id);
    // Swap COMPONENT
    instance_I101_198_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    figma.getNodeById(instance_I101_198_102_493.id + ';' + line_1_352.id);
    // Ref to SUB NODE
    figma.getNodeById('I' + instance_101_198.id + ';' + frame_101_116.id);
    // Ref to SUB NODE
    figma.getNodeById('I' + instance_101_198.id + ';' + text_101_117.id);
    // Create COMPONENT
    var component_101_265 = figma.createComponent();
    component_101_265.resize(120.0, 35.0);
    component_101_265.name = 'Type=Header';
    component_101_265.relativeTransform = [
        [1, 0, 120],
        [0, 1, 0],
    ];
    component_101_265.x = 120;
    component_101_265.layoutAlign = 'STRETCH';
    component_101_265.fills = [{ type: 'SOLID', visible: true, opacity: 0.05999999865889549, blendMode: 'NORMAL', color: { r: 0, g: 0, b: 0 } }];
    component_101_265.primaryAxisSizingMode = 'FIXED';
    component_101_265.backgrounds = [{ type: 'SOLID', visible: true, opacity: 0.05999999865889549, blendMode: 'NORMAL', color: { r: 0, g: 0, b: 0 } }];
    component_101_265.layoutMode = 'VERTICAL';
    component_101_265.description = '';
    component_101_265.documentationLinks = [];
    // Create INSTANCE
    var instance_101_266 = component_101_119.createInstance();
    instance_101_266.resize(120.0, 35.0009994507);
    instance_101_266.primaryAxisSizingMode = 'AUTO';
    instance_101_266.relativeTransform = [
        [1, 0, 0],
        [0, 1, 0],
    ];
    instance_101_266.primaryAxisSizingMode = 'AUTO';
    instance_101_266.constraints = { horizontal: 'SCALE', vertical: 'CENTER' };
    component_101_265.appendChild(instance_101_266);
    // Swap COMPONENT
    instance_101_266.swapComponent(component_101_119);
    // Ref to SUB NODE
    figma.getNodeById('I' + instance_101_266.id + ';' + frame_101_114.id);
    // Ref to SUB NODE
    var instance_I101_266_102_493 = figma.getNodeById('I' + instance_101_266.id + ';' + instance_102_493.id);
    // Swap COMPONENT
    instance_I101_266_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    figma.getNodeById(instance_I101_266_102_493.id + ';' + line_1_352.id);
    // Ref to SUB NODE
    figma.getNodeById('I' + instance_101_266.id + ';' + frame_101_116.id);
    // Ref to SUB NODE
    var text_I101_266_101_117 = figma.getNodeById('I' + instance_101_266.id + ';' + text_101_117.id);
    // Create COMPONENT_SET
    var componentSet_1_364 = figma.combineAsVariants([component_101_204, component_101_265], figma.currentPage);
    componentSet_1_364.resize(240.0, 35.0);
    componentSet_1_364.primaryAxisSizingMode = 'AUTO';
    componentSet_1_364.name = '_Cell';
    componentSet_1_364.visible = true;
    componentSet_1_364.locked = false;
    componentSet_1_364.opacity = 1;
    componentSet_1_364.blendMode = 'PASS_THROUGH';
    componentSet_1_364.isMask = false;
    componentSet_1_364.effects = [];
    componentSet_1_364.relativeTransform = [
        [1, 0, 8760],
        [0, 1, 5009],
    ];
    componentSet_1_364.x = 8760;
    componentSet_1_364.y = 5009;
    componentSet_1_364.rotation = 0;
    componentSet_1_364.layoutAlign = 'INHERIT';
    componentSet_1_364.constrainProportions = false;
    componentSet_1_364.layoutGrow = 0;
    componentSet_1_364.fills = [];
    componentSet_1_364.strokes = [
        { type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 0.48235294222831726, g: 0.3803921639919281, b: 1 } },
    ];
    componentSet_1_364.strokeWeight = 1;
    componentSet_1_364.strokeAlign = 'INSIDE';
    componentSet_1_364.strokeJoin = 'MITER';
    componentSet_1_364.dashPattern = [10, 5];
    componentSet_1_364.strokeCap = 'NONE';
    componentSet_1_364.strokeMiterLimit = 4;
    componentSet_1_364.cornerRadius = 5;
    componentSet_1_364.cornerSmoothing = 0;
    componentSet_1_364.paddingLeft = 0;
    componentSet_1_364.paddingRight = 0;
    componentSet_1_364.paddingTop = 0;
    componentSet_1_364.paddingBottom = 0;
    componentSet_1_364.primaryAxisAlignItems = 'MIN';
    componentSet_1_364.counterAxisAlignItems = 'MIN';
    componentSet_1_364.primaryAxisSizingMode = 'AUTO';
    componentSet_1_364.layoutGrids = [];
    componentSet_1_364.backgrounds = [];
    componentSet_1_364.clipsContent = true;
    componentSet_1_364.guides = [];
    componentSet_1_364.expanded = true;
    componentSet_1_364.constraints = { horizontal: 'MIN', vertical: 'MIN' };
    componentSet_1_364.layoutMode = 'HORIZONTAL';
    componentSet_1_364.counterAxisSizingMode = 'FIXED';
    componentSet_1_364.itemSpacing = 0;
    componentSet_1_364.description = '';
    componentSet_1_364.documentationLinks = [];
    // Create COMPONENT
    var component_1_365 = figma.createComponent();
    component_1_365.resize(240.0, 35.0009994507);
    component_1_365.primaryAxisSizingMode = 'AUTO';
    component_1_365.counterAxisSizingMode = 'AUTO';
    component_1_365.name = '_Row';
    component_1_365.effects = [
        {
            type: 'INNER_SHADOW',
            color: { r: 0.7254902124404907, g: 0.7254902124404907, b: 0.7254902124404907, a: 1 },
            offset: { x: 0, y: 1 },
            radius: 0,
            spread: 0,
            visible: true,
            blendMode: 'NORMAL',
        },
    ];
    component_1_365.relativeTransform = [
        [1, 0, 8760],
        [0, 1, 4854],
    ];
    component_1_365.x = 8760;
    component_1_365.y = 4854;
    component_1_365.fills = [{ type: 'SOLID', visible: true, opacity: 0.00009999999747378752, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }];
    component_1_365.backgrounds = [
        { type: 'SOLID', visible: true, opacity: 0.00009999999747378752, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } },
    ];
    component_1_365.clipsContent = true;
    component_1_365.layoutMode = 'HORIZONTAL';
    component_1_365.counterAxisSizingMode = 'AUTO';
    component_1_365.description = '';
    component_1_365.documentationLinks = [];
    figma.currentPage.appendChild(component_1_365);
    // Create INSTANCE
    var instance_1_366 = component_101_204.createInstance();
    instance_1_366.resize(120.0, 35.0009994507);
    instance_1_366.name = '_Cell';
    instance_1_366.expanded = false;
    component_1_365.appendChild(instance_1_366);
    // Swap COMPONENT
    instance_1_366.swapComponent(component_101_204);
    // Ref to SUB NODE
    var instance_I1_366_101_198 = figma.getNodeById('I' + instance_1_366.id + ';' + instance_101_198.id);
    // Swap COMPONENT
    instance_I1_366_101_198.swapComponent(component_101_119);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_366_101_198.id + ';' + frame_101_114.id);
    // Ref to SUB NODE
    var instance_I1_366_101_198_102_493 = figma.getNodeById(instance_I1_366_101_198.id + ';' + instance_102_493.id);
    // Swap COMPONENT
    instance_I1_366_101_198_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_366_101_198_102_493.id + ';' + line_1_352.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_366_101_198.id + ';' + frame_101_116.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_366_101_198.id + ';' + text_101_117.id);
    // Create INSTANCE
    var instance_1_372 = component_101_204.createInstance();
    instance_1_372.resize(120.0, 35.0009994507);
    instance_1_372.name = '_Cell';
    instance_1_372.relativeTransform = [
        [1, 0, 120],
        [0, 1, 0],
    ];
    instance_1_372.x = 120;
    component_1_365.appendChild(instance_1_372);
    // Swap COMPONENT
    instance_1_372.swapComponent(component_101_204);
    // Ref to SUB NODE
    var instance_I1_372_101_198 = figma.getNodeById('I' + instance_1_372.id + ';' + instance_101_198.id);
    // Swap COMPONENT
    instance_I1_372_101_198.swapComponent(component_101_119);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_372_101_198.id + ';' + frame_101_114.id);
    // Ref to SUB NODE
    var instance_I1_372_101_198_102_493 = figma.getNodeById(instance_I1_372_101_198.id + ';' + instance_102_493.id);
    // Swap COMPONENT
    instance_I1_372_101_198_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_372_101_198_102_493.id + ';' + line_1_352.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_372_101_198.id + ';' + frame_101_116.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_372_101_198.id + ';' + text_101_117.id);
    // Create COMPONENT
    var component_1_378 = figma.createComponent();
    component_1_378.resize(240.0, 105.0029983521);
    component_1_378.primaryAxisSizingMode = 'AUTO';
    component_1_378.counterAxisSizingMode = 'AUTO';
    component_1_378.name = 'Table 1';
    component_1_378.effects = [
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
    ];
    component_1_378.relativeTransform = [
        [1, 0, 8760],
        [0, 1, 4629],
    ];
    component_1_378.x = 8760;
    component_1_378.y = 4629;
    component_1_378.fills = [{ type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }];
    component_1_378.strokes = [
        {
            type: 'SOLID',
            visible: true,
            opacity: 1,
            blendMode: 'NORMAL',
            color: { r: 0.7254902124404907, g: 0.7254902124404907, b: 0.7254902124404907 },
        },
    ];
    component_1_378.cornerRadius = 4;
    component_1_378.backgrounds = [{ type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }];
    component_1_378.clipsContent = true;
    component_1_378.layoutMode = 'VERTICAL';
    component_1_378.counterAxisSizingMode = 'AUTO';
    component_1_378.description = '';
    component_1_378.documentationLinks = [];
    figma.currentPage.appendChild(component_1_378);
    // Create INSTANCE
    var instance_1_379 = component_1_365.createInstance();
    instance_1_379.relativeTransform = [
        [1, 0, 0],
        [0, 1, 0],
    ];
    component_1_378.appendChild(instance_1_379);
    // Swap COMPONENT
    instance_1_379.swapComponent(component_1_365);
    // Ref to SUB NODE
    var instance_I1_379_1_366 = figma.getNodeById('I' + instance_1_379.id + ';' + instance_1_366.id);
    instance_I1_379_1_366.fills = [{ type: 'SOLID', visible: true, opacity: 0.05999999865889549, blendMode: 'NORMAL', color: { r: 0, g: 0, b: 0 } }];
    instance_I1_379_1_366.backgrounds = [
        { type: 'SOLID', visible: true, opacity: 0.05999999865889549, blendMode: 'NORMAL', color: { r: 0, g: 0, b: 0 } },
    ];
    // Swap COMPONENT
    instance_I1_379_1_366.swapComponent(component_101_265);
    // Ref to SUB NODE
    var instance_I1_379_1_366_101_266 = figma.getNodeById(instance_I1_379_1_366.id + ';' + instance_101_266.id);
    // Swap COMPONENT
    instance_I1_379_1_366_101_266.swapComponent(component_101_119);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_379_1_366_101_266.id + ';' + frame_101_114.id);
    // Ref to SUB NODE
    var instance_I1_379_1_366_101_266_102_493 = figma.getNodeById(instance_I1_379_1_366_101_266.id + ';' + instance_102_493.id);
    // Swap COMPONENT
    instance_I1_379_1_366_101_266_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_379_1_366_101_266_102_493.id + ';' + line_1_352.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_379_1_366_101_266.id + ';' + frame_101_116.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_379_1_366_101_266.id + ';' + text_101_117.id);
    // Ref to SUB NODE
    var instance_I1_379_1_372 = figma.getNodeById('I' + instance_1_379.id + ';' + instance_1_372.id);
    instance_I1_379_1_372.fills = [{ type: 'SOLID', visible: true, opacity: 0.05999999865889549, blendMode: 'NORMAL', color: { r: 0, g: 0, b: 0 } }];
    instance_I1_379_1_372.backgrounds = [
        { type: 'SOLID', visible: true, opacity: 0.05999999865889549, blendMode: 'NORMAL', color: { r: 0, g: 0, b: 0 } },
    ];
    // Swap COMPONENT
    instance_I1_379_1_372.swapComponent(component_101_265);
    // Ref to SUB NODE
    var instance_I1_379_1_372_101_266 = figma.getNodeById(instance_I1_379_1_372.id + ';' + instance_101_266.id);
    // Swap COMPONENT
    instance_I1_379_1_372_101_266.swapComponent(component_101_119);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_379_1_372_101_266.id + ';' + frame_101_114.id);
    // Ref to SUB NODE
    var instance_I1_379_1_372_101_266_102_493 = figma.getNodeById(instance_I1_379_1_372_101_266.id + ';' + instance_102_493.id);
    // Swap COMPONENT
    instance_I1_379_1_372_101_266_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_379_1_372_101_266_102_493.id + ';' + line_1_352.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_379_1_372_101_266.id + ';' + frame_101_116.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_379_1_372_101_266.id + ';' + text_101_117.id);
    // Create INSTANCE
    var instance_1_398 = component_1_365.createInstance();
    instance_1_398.relativeTransform = [
        [1, 0, 0],
        [0, 1, 35.0009994507],
    ];
    instance_1_398.y = 35.000999450683594;
    instance_1_398.expanded = false;
    component_1_378.appendChild(instance_1_398);
    // Swap COMPONENT
    instance_1_398.swapComponent(component_1_365);
    // Ref to SUB NODE
    var instance_I1_398_1_366 = figma.getNodeById('I' + instance_1_398.id + ';' + instance_1_366.id);
    // Swap COMPONENT
    instance_I1_398_1_366.swapComponent(component_101_204);
    // Ref to SUB NODE
    var instance_I1_398_1_366_101_198 = figma.getNodeById(instance_I1_398_1_366.id + ';' + instance_101_198.id);
    // Swap COMPONENT
    instance_I1_398_1_366_101_198.swapComponent(component_101_119);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_398_1_366_101_198.id + ';' + frame_101_114.id);
    // Ref to SUB NODE
    var instance_I1_398_1_366_101_198_102_493 = figma.getNodeById(instance_I1_398_1_366_101_198.id + ';' + instance_102_493.id);
    // Swap COMPONENT
    instance_I1_398_1_366_101_198_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_398_1_366_101_198_102_493.id + ';' + line_1_352.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_398_1_366_101_198.id + ';' + frame_101_116.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_398_1_366_101_198.id + ';' + text_101_117.id);
    // Ref to SUB NODE
    var instance_I1_398_1_372 = figma.getNodeById('I' + instance_1_398.id + ';' + instance_1_372.id);
    instance_I1_398_1_372.expanded = false;
    // Swap COMPONENT
    instance_I1_398_1_372.swapComponent(component_101_204);
    // Ref to SUB NODE
    var instance_I1_398_1_372_101_198 = figma.getNodeById(instance_I1_398_1_372.id + ';' + instance_101_198.id);
    // Swap COMPONENT
    instance_I1_398_1_372_101_198.swapComponent(component_101_119);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_398_1_372_101_198.id + ';' + frame_101_114.id);
    // Ref to SUB NODE
    var instance_I1_398_1_372_101_198_102_493 = figma.getNodeById(instance_I1_398_1_372_101_198.id + ';' + instance_102_493.id);
    // Swap COMPONENT
    instance_I1_398_1_372_101_198_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_398_1_372_101_198_102_493.id + ';' + line_1_352.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_398_1_372_101_198.id + ';' + frame_101_116.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_398_1_372_101_198.id + ';' + text_101_117.id);
    // Create INSTANCE
    var instance_1_417 = component_1_365.createInstance();
    instance_1_417.relativeTransform = [
        [1, 0, 0],
        [0, 1, 70.0019989014],
    ];
    instance_1_417.y = 70.00199890136719;
    instance_1_417.expanded = false;
    component_1_378.appendChild(instance_1_417);
    // Swap COMPONENT
    instance_1_417.swapComponent(component_1_365);
    // Ref to SUB NODE
    var instance_I1_417_1_366 = figma.getNodeById('I' + instance_1_417.id + ';' + instance_1_366.id);
    // Swap COMPONENT
    instance_I1_417_1_366.swapComponent(component_101_204);
    // Ref to SUB NODE
    var instance_I1_417_1_366_101_198 = figma.getNodeById(instance_I1_417_1_366.id + ';' + instance_101_198.id);
    // Swap COMPONENT
    instance_I1_417_1_366_101_198.swapComponent(component_101_119);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_417_1_366_101_198.id + ';' + frame_101_114.id);
    // Ref to SUB NODE
    var instance_I1_417_1_366_101_198_102_493 = figma.getNodeById(instance_I1_417_1_366_101_198.id + ';' + instance_102_493.id);
    // Swap COMPONENT
    instance_I1_417_1_366_101_198_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_417_1_366_101_198_102_493.id + ';' + line_1_352.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_417_1_366_101_198.id + ';' + frame_101_116.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_417_1_366_101_198.id + ';' + text_101_117.id);
    // Ref to SUB NODE
    var instance_I1_417_1_372 = figma.getNodeById('I' + instance_1_417.id + ';' + instance_1_372.id);
    instance_I1_417_1_372.expanded = false;
    // Swap COMPONENT
    instance_I1_417_1_372.swapComponent(component_101_204);
    // Ref to SUB NODE
    var instance_I1_417_1_372_101_198 = figma.getNodeById(instance_I1_417_1_372.id + ';' + instance_101_198.id);
    // Swap COMPONENT
    instance_I1_417_1_372_101_198.swapComponent(component_101_119);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_417_1_372_101_198.id + ';' + frame_101_114.id);
    // Ref to SUB NODE
    var instance_I1_417_1_372_101_198_102_493 = figma.getNodeById(instance_I1_417_1_372_101_198.id + ';' + instance_102_493.id);
    // Swap COMPONENT
    instance_I1_417_1_372_101_198_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_417_1_372_101_198_102_493.id + ';' + line_1_352.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_417_1_372_101_198.id + ';' + frame_101_116.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_417_1_372_101_198.id + ';' + text_101_117.id);
    // Create COMPONENT
    var component_1_430 = figma.createComponent();
    component_1_430.resize(457.0, 179.0);
    component_1_430.counterAxisSizingMode = 'AUTO';
    component_1_430.name = '_Tooltip';
    component_1_430.effects = [
        {
            type: 'DROP_SHADOW',
            color: { r: 0.9666666388511658, g: 0.15708333253860474, b: 0.15708333253860474, a: 0.09000000357627869 },
            offset: { x: 0, y: 16 },
            radius: 8,
            spread: 0,
            visible: false,
            blendMode: 'NORMAL',
            showShadowBehindNode: true,
        },
    ];
    component_1_430.relativeTransform = [
        [1, 0, 9080],
        [0, 1, 4316],
    ];
    component_1_430.x = 9080;
    component_1_430.y = 4316;
    component_1_430.fills = [
        { type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 0, g: 0, b: 0 } },
        {
            type: 'GRADIENT_LINEAR',
            visible: true,
            opacity: 1,
            blendMode: 'NORMAL',
            gradientStops: [
                { color: { r: 0, g: 0, b: 0, a: 1 }, position: 0 },
                { color: { r: 0.26249998807907104, g: 0.26249998807907104, b: 0.26249998807907104, a: 1 }, position: 1 },
            ],
            gradientTransform: [
                [0.37368255853652954, 0.4259088337421417, 0.21073251962661743],
                [-0.0000021187263428146252, 0.0000018692335288506001, 0.5000001788139343],
            ],
        },
    ];
    component_1_430.cornerRadius = 8;
    component_1_430.paddingLeft = 20;
    component_1_430.paddingRight = 20;
    component_1_430.paddingTop = 16;
    component_1_430.paddingBottom = 16;
    component_1_430.primaryAxisSizingMode = 'FIXED';
    component_1_430.backgrounds = [
        { type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 0, g: 0, b: 0 } },
        {
            type: 'GRADIENT_LINEAR',
            visible: true,
            opacity: 1,
            blendMode: 'NORMAL',
            gradientStops: [
                { color: { r: 0, g: 0, b: 0, a: 1 }, position: 0 },
                { color: { r: 0.26249998807907104, g: 0.26249998807907104, b: 0.26249998807907104, a: 1 }, position: 1 },
            ],
            gradientTransform: [
                [0.37368255853652954, 0.4259088337421417, 0.21073251962661743],
                [-0.0000021187263428146252, 0.0000018692335288506001, 0.5000001788139343],
            ],
        },
    ];
    component_1_430.expanded = false;
    component_1_430.layoutMode = 'HORIZONTAL';
    component_1_430.counterAxisSizingMode = 'AUTO';
    component_1_430.description = '';
    component_1_430.documentationLinks = [];
    // Create FRAME
    var frame_1_431 = figma.createFrame();
    frame_1_431.resizeWithoutConstraints(0.01, 0.01);
    frame_1_431.primaryAxisSizingMode = 'AUTO';
    frame_1_431.name = 'Frame 2';
    frame_1_431.relativeTransform = [
        [1, 0, 20],
        [0, 1, 16],
    ];
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
    rectangle_1_432.name = 'Rectangle 1';
    rectangle_1_432.fills = [
        {
            type: 'SOLID',
            visible: true,
            opacity: 1,
            blendMode: 'NORMAL',
            color: { r: 0.0784313753247261, g: 0.0784313753247261, b: 0.0784313753247261 },
        },
    ];
    rectangle_1_432.relativeTransform = [
        [0.7071068287, -0.7071068287, -19.1801757812],
        [0.7071068287, 0.7071068287, 1.8198242188],
    ];
    rectangle_1_432.x = -19.18017578125;
    rectangle_1_432.y = 1.81982421875;
    rectangle_1_432.rotation = -45;
    rectangle_1_432.constrainProportions = true;
    frame_1_431.appendChild(rectangle_1_432);
    // Create TEXT
    var text_1_433 = figma.createText();
    text_1_433.resize(416.9899902344, 147.0);
    text_1_433.name =
        "Only layer styles such as: background, color, border radius etc will be used to create tables. You don't have to create tables using the plugin. You can also create tables by creating an instance of this component and detaching them and their rows. If you change the styles used on the table or row components you can update existing tables by going to Plugins > Table Creator > Settings and select Refresh Tables";
    text_1_433.fills = [{ type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }];
    text_1_433.relativeTransform = [
        [1, 0, 20.0100002289],
        [0, 1, 16],
    ];
    text_1_433.x = 20.010000228881836;
    text_1_433.y = 16;
    text_1_433.layoutGrow = 1;
    text_1_433.hyperlink = null;
    text_1_433.autoRename = false;
    loadFonts().then((res) => {
        text_1_433.fontName = {
            family: 'Inter',
            style: 'Regular',
        };
        text_1_433.listSpacing = 0;
        text_1_433.characters =
            "Only layer styles such as: background, color, border radius etc will be used to create tables. You don't have to create tables using the plugin. You can also create tables by creating an instance of this component and detaching them and their rows. If you change the styles used on the table or row components you can update existing tables by going to Plugins > Table Creator > Settings and select Refresh Tables";
        text_1_433.fontSize = 14;
        text_1_433.lineHeight = { unit: 'PERCENT', value: 150 };
        text_1_433.fontName = { family: 'Inter', style: 'Regular' };
        text_1_433.textAutoResize = 'HEIGHT';
    });
    component_1_430.appendChild(text_1_433);
    // Create INSTANCE
    var instance_1_434 = component_1_430.createInstance();
    instance_1_434.relativeTransform = [
        [1, 0, 9080],
        [0, 1, 4618],
    ];
    instance_1_434.y = 4618;
    figma.currentPage.appendChild(instance_1_434);
    // Swap COMPONENT
    instance_1_434.swapComponent(component_1_430);
    // Ref to SUB NODE
    figma.getNodeById('I' + instance_1_434.id + ';' + frame_1_431.id);
    // Ref to SUB NODE
    figma.getNodeById('I' + instance_1_434.id + ';' + rectangle_1_432.id);
    // Ref to SUB NODE
    var text_I1_434_1_433 = figma.getNodeById('I' + instance_1_434.id + ';' + text_1_433.id);
    text_I1_434_1_433.resize(416.9899902344, 63.0);
    loadFonts().then((res) => {
        text_I1_434_1_433.fontName = {
            family: 'Inter',
            style: 'Regular',
        };
        text_I1_434_1_433.characters =
            'This component is the template used by the plugin to create tables from. You can customise the appearance of your tables by customising these components.';
    });
    // Create INSTANCE
    var instance_1_438 = component_1_430.createInstance();
    instance_1_438.relativeTransform = [
        [1, 0, 9080],
        [0, 1, 4843],
    ];
    instance_1_438.y = 4843;
    figma.currentPage.appendChild(instance_1_438);
    // Swap COMPONENT
    instance_1_438.swapComponent(component_1_430);
    // Ref to SUB NODE
    figma.getNodeById('I' + instance_1_438.id + ';' + frame_1_431.id);
    // Ref to SUB NODE
    figma.getNodeById('I' + instance_1_438.id + ';' + rectangle_1_432.id);
    // Ref to SUB NODE
    var text_I1_438_1_433 = figma.getNodeById('I' + instance_1_438.id + ';' + text_1_433.id);
    text_I1_438_1_433.resize(416.9899902344, 42.0);
    loadFonts().then((res) => {
        text_I1_438_1_433.fontName = {
            family: 'Inter',
            style: 'Regular',
        };
        text_I1_438_1_433.characters = ' To customise the horizontal borders change the shadow colour.';
    });
    // Create INSTANCE
    var instance_1_442 = component_1_430.createInstance();
    instance_1_442.relativeTransform = [
        [1, 0, 9080],
        [0, 1, 4998],
    ];
    instance_1_442.y = 4998;
    figma.currentPage.appendChild(instance_1_442);
    // Swap COMPONENT
    instance_1_442.swapComponent(component_1_430);
    // Ref to SUB NODE
    figma.getNodeById('I' + instance_1_442.id + ';' + frame_1_431.id);
    // Ref to SUB NODE
    figma.getNodeById('I' + instance_1_442.id + ';' + rectangle_1_432.id);
    // Ref to SUB NODE
    var text_I1_442_1_433 = figma.getNodeById('I' + instance_1_442.id + ';' + text_1_433.id);
    text_I1_442_1_433.resize(416.9899902344, 42.0);
    loadFonts().then((res) => {
        text_I1_442_1_433.fontName = {
            family: 'Inter',
            style: 'Regular',
        };
        text_I1_442_1_433.characters = 'Change the appearance of each cell type by customising these variants.';
    });
    // Create INSTANCE
    var instance_102_121 = component_1_430.createInstance();
    instance_102_121.relativeTransform = [
        [1, 0, 9080],
        [0, 1, 5152],
    ];
    instance_102_121.y = 5152;
    figma.currentPage.appendChild(instance_102_121);
    // Swap COMPONENT
    instance_102_121.swapComponent(component_1_430);
    // Ref to SUB NODE
    figma.getNodeById('I' + instance_102_121.id + ';' + frame_1_431.id);
    // Ref to SUB NODE
    figma.getNodeById('I' + instance_102_121.id + ';' + rectangle_1_432.id);
    // Ref to SUB NODE
    var text_I102_121_1_433 = figma.getNodeById('I' + instance_102_121.id + ';' + text_1_433.id);
    text_I102_121_1_433.resize(416.9899902344, 42.0);
    loadFonts().then((res) => {
        text_I102_121_1_433.fontName = {
            family: 'Inter',
            style: 'Regular',
        };
        text_I102_121_1_433.characters = 'Change the deafult appearance of all cells by customising this base component.';
    });
    // Remove table border component from canvas
    component_1_351.remove();
    // Remove tooltip component from canvas
    component_1_430.remove();
    setPluginData_1(component_1_378, 'elementSemantics', { is: 'table' });
    setPluginData_1(component_1_365, 'elementSemantics', { is: 'tr' });
    setPluginData_1(component_101_204, 'elementSemantics', { is: 'td' });
    setPluginData_1(component_101_265, 'elementSemantics', { is: 'th' });
    // does it need to be on base component?
    component_101_204.setRelaunchData({ selectColumn: 'Select all cells in column', selectRow: 'Select all cells in row' });
    component_101_265.setRelaunchData({ selectColumn: 'Select all cells in column', selectRow: 'Select all cells in row' });
    // Manually add properties so cells will fill row height
    instance_1_372.layoutAlign = 'STRETCH';
    instance_1_366.layoutAlign = 'STRETCH';
    instance_101_198.layoutAlign = 'STRETCH';
    instance_101_266.layoutAlign = 'STRETCH';
    // Manually add shadow to cells for when used in column mode
    component_101_265.effects = [
        {
            type: 'INNER_SHADOW',
            color: { r: 0.7254902124404907, g: 0.7254902124404907, b: 0.7254902124404907, a: 1 },
            offset: { x: 0, y: 1 },
            radius: 0,
            spread: 0,
            visible: true,
            blendMode: 'NORMAL',
        },
    ];
    component_101_204.effects = [
        {
            type: 'INNER_SHADOW',
            color: { r: 0.7254902124404907, g: 0.7254902124404907, b: 0.7254902124404907, a: 1 },
            offset: { x: 0, y: 1 },
            radius: 0,
            spread: 0,
            visible: true,
            blendMode: 'NORMAL',
        },
    ];
    component_101_204.backgrounds = [
        { type: 'SOLID', visible: true, opacity: 0.0020000000949949026, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } },
    ];
    // Manually add bold font weight to header cell
    loadFonts().then((res) => {
        text_I101_266_101_117.fontName = {
            family: 'Inter',
            style: 'Semi Bold',
        };
    });
    obj.templateComponent = component_1_378;
    obj.row = component_1_365;
    obj.cell = component_101_204;
    obj.headerCell = component_101_265;
    obj.cellSet = componentSet_1_364;
    obj.baseCell = component_101_119;
    obj.instances = [instance_1_442, instance_102_121, instance_1_438, instance_1_434];
    return obj;
}

console.clear();
let defaultRelaunchData = {
    detachTable: 'Detaches table and rows',
    spawnTable: 'Spawn a new table from this table',
    toggleColumnResizing: 'Use a component to resize columns or rows',
    toggleColumnsOrRows: 'Toggle between using columns or rows',
};
function File(data) {
    // TODO: if fileId doesn't exist then create random ID and set fileId
    this.id = getDocumentData_1('fileId') || setDocumentData_1('fileId', genRandomId());
    // this.name = `{figma.getNodeById("0:1").name}`
    this.name = figma.root.name;
    if (data)
        this.data = data;
}
function Template(node) {
    this.id = node.id;
    this.name = node.name;
    this.component = {
        id: node.id,
        key: node.key,
    };
    this.file = {
        id: getDocumentData_1('fileId') || setDocumentData_1('fileId', genRandomId()),
        name: figma.root.name,
    };
}
function addUniqueToArray(object, array) {
    // // Only add new template if unique
    var index = array.findIndex((x) => x.id === object.id);
    index === -1 ? array.push(object) : console.log('object already exists');
    return array;
}
function addTemplateToRemoteFiles(node) {
    updatePluginData_1(figma.root, 'remoteFiles', (remoteFiles) => {
        remoteFiles = remoteFiles || [];
        // Only add file to array if unique
        addUniqueToArray(new File(), remoteFiles);
        for (var i = 0; i < remoteFiles.length; i++) {
            var file = remoteFiles[i];
            if (file.id === getPluginData_1(figma.currentPage.selection[0], 'template').file.id) {
                file.templates = addUniqueToArray(new Template(node), file.templates);
            }
        }
        return remoteFiles;
    });
    figma.notify(`Imported ${node.name}`);
}
function incrementNameNumerically(node) {
    // TODO: Update to support any type of node
    var nodeType = node.type;
    if (nodeType === 'COMPONENT' && getPluginData_1(node, 'template'))
        ;
    // Find templates locally
    if (nodeType === 'TEMPLATE_COMPONENT') {
        var localTemplates = figma.root.findAll((node) => getPluginData_1(node, 'template') && node.type === 'COMPONENT');
        if (localTemplates && localTemplates.length > 0) {
            localTemplates.sort((a, b) => a.name - b.name);
            localTemplates.map((node) => {
                console.log(node.name);
            });
            if (localTemplates[localTemplates.length - 1].name.startsWith('Table')) {
                let matches = localTemplates[localTemplates.length - 1].name.match(/\d+$/);
                console.log(matches);
                if (matches) {
                    node.name = `Table ${parseInt(matches[0], 10) + 1}`;
                }
            }
        }
    }
}
function geTemplateParts() { }
function importTemplate(node) {
    // TODO: Needs to work more inteligently so that it corretly adds template if actually imported from file. Try to import first, if doesn't work then it must be local. Check to see if component published also.
    // TODO: Check if already imported by checking id in list?
    var _a;
    var templateData = getPluginData_1(node, 'template');
    var isTemplateNode = templateData;
    var isLocal = ((_a = templateData === null || templateData === void 0 ? void 0 : templateData.file) === null || _a === void 0 ? void 0 : _a.id) === getDocumentData_1('fileId');
    if (isTemplateNode) {
        if (node.type === 'COMPONENT') {
            if (isLocal) {
                figma.notify('Template already imported');
            }
            else {
                addTemplateToRemoteFiles(node);
                figma.notify('Imported remote template');
            }
        }
        else {
            node = convertToComponent_1(node);
            figma.notify('Imported template');
            // (add to local templates)
        }
        setDocumentData_1('defaultTemplate', getPluginData_1(node, 'template'));
    }
    else {
        figma.notify('No template found');
    }
}
function getLocalTemplates() {
    var templates = [];
    figma.root.findAll((node) => {
        var templateData = getPluginData_1(node, 'template');
        if (templateData && node.type === 'COMPONENT') {
            templates.push(templateData);
        }
    });
    return templates;
}
function createTableInstance(templateComponent, settings) {
    // FIXME: Get it to work with parts which are not components as well
    // FIXME: Check for imported components
    // FIXME: Check all conditions are met. Is table, is row, is cell, is instance etc.
    let tableInstance = convertToFrame_1(templateComponent.clone());
    let part = geTemplateParts();
    var table;
    if (settings.includeHeader && !part.th) {
        figma.notify('No Header Cell component found');
        // FIXME: Check for header cell sooner so table creation doesn't start
        return;
    }
    if (part.table.id === templateComponent.id) {
        console.log('table and container are the same thing');
        table = tableInstance;
    }
    else {
        // Remove table from template
        tableInstance.findAll((node) => {
            var _a;
            if (((_a = getPluginData_1(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === 'table') {
                node.remove();
            }
        });
        var tableIndex = getNodeIndex_1(part.table);
        // Add table back to template
        tableInstance.insertChild(tableIndex, table);
    }
    var firstRow;
    var rowIndex = getNodeIndex_1(part.tr);
    function getRowParent() {
        var row = table.findOne((node) => { var _a; return ((_a = getPluginData_1(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === 'tr'; });
        return row.parent;
    }
    var rowParent = getRowParent();
    // Remove children which are trs
    table.findAll((node) => {
        var _a;
        if (((_a = getPluginData_1(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === 'tr') {
            node.remove();
        }
    });
    if (settings.columnResizing) {
        // First row should be a component
        firstRow = convertToComponent_1(part.tr.clone());
        setPluginData_1(firstRow, 'elementSemantics', { is: 'tr' });
    }
    else {
        // First row should be a frame
        firstRow = convertToFrame_1(part.tr.clone());
        setPluginData_1(firstRow, 'elementSemantics', { is: 'tr' });
    }
    rowParent.insertChild(rowIndex, firstRow);
    // Remove children which are tds
    firstRow.findAll((node) => {
        var _a, _b;
        console.log('children', node);
        if (node) {
            if (((_a = getPluginData_1(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === 'td' || ((_b = getPluginData_1(node, 'elementSemantics')) === null || _b === void 0 ? void 0 : _b.is) === 'th') {
                node.remove();
            }
        }
    });
    // Create columns in first row
    for (let i = 0; i < settings.columnCount; i++) {
        var duplicateCell;
        if (part.td.type === 'COMPONENT') {
            duplicateCell = part.td.clone();
        }
        if (part.td.type === 'INSTANCE') {
            duplicateCell = part.td.mainComponent.createInstance();
        }
        if (settings.cellWidth) {
            // let origLayoutAlign = duplicateCell.layoutAlign
            duplicateCell.resizeWithoutConstraints(settings.cellWidth, duplicateCell.height);
            // duplicateCell.layoutAlign = origLayoutAlign
        }
        setPluginData_1(duplicateCell, 'elementSemantics', { is: 'td' });
        // Figma doesn't automatically inherit this property
        duplicateCell.layoutAlign = part.td.layoutAlign;
        duplicateCell.primaryAxisAlignItems = settings.cellAlignment;
        firstRow.appendChild(duplicateCell);
    }
    // Create rest of rows
    for (var i = 1; i < settings.rowCount; i++) {
        var duplicateRow;
        if (firstRow.type === 'COMPONENT') {
            duplicateRow = firstRow.createInstance();
        }
        else {
            duplicateRow = firstRow.clone();
        }
        // If using columnResizing and header swap non headers to default cells
        if (settings.columnResizing && settings.includeHeader) {
            for (let i = 0; i < duplicateRow.children.length; i++) {
                var cell = duplicateRow.children[i];
                // cell.swapComponent(part.th)
                // FIXME: Check if instance or main component
                cell.mainComponent = part.td.mainComponent;
                setPluginData_1(cell, 'elementSemantics', { is: 'td' });
            }
        }
        rowParent.insertChild(rowIndex + 1, duplicateRow);
    }
    // Swap first row to use header cell
    if (settings.includeHeader && part.th) {
        for (var i = 0; i < firstRow.children.length; i++) {
            var child = firstRow.children[i];
            // FIXME: Check if instance or main component
            child.swapComponent(part.th.mainComponent);
            setPluginData_1(child, 'elementSemantics', { is: 'th' });
            // child.mainComponent = part.th.mainComponent
        }
    }
    tableInstance.setRelaunchData(defaultRelaunchData);
    return tableInstance;
}
function getUserPreferencesAsync() {
}
function getDefaultTemplate() {
    var defaultTemplate = getDocumentData_1('defaultTemplate');
    return getComponentById(defaultTemplate === null || defaultTemplate === void 0 ? void 0 : defaultTemplate.component.id) ? defaultTemplate : undefined;
}
function getTemplateParts(templateNode) {
    // find nodes with certain pluginData
    let elements = ['tr', 'td', 'th', 'table'];
    let results = {};
    // Loop though element definitions and find them in the template
    for (let i = 0; i < elements.length; i++) {
        let elementName = elements[i];
        let part = templateNode.findOne((node) => {
            let elementSemantics = getPluginData_1(node, 'elementSemantics');
            if ((elementSemantics === null || elementSemantics === void 0 ? void 0 : elementSemantics.is) === elementName) {
                console.log(elementSemantics);
                return true;
            }
        });
        results[elementName] = part;
    }
    if (!results['table']) {
        if (getPluginData_1(templateNode, 'elementSemantics').is === 'table') {
            results['table'] = templateNode;
        }
    }
    // // For instances assign the mainComponent as the part
    // for (let [key, value] of Object.entries(results)) {
    // 	if (value.type === "INSTANCE") {
    // 		results[key] = value.mainComponent
    // 	}
    // }
    return results;
}
function postCurrentSelection(templateNodeId) {
    var _a;
    let selection;
    function isInsideTemplate(node) {
        let parentComponent = node.type === 'COMPONENT' ? node : getParentComponent(node);
        if ((isInsideComponent(node) || node.type === 'COMPONENT') && parentComponent) {
            if (getPluginData_1(parentComponent, 'template') && parentComponent.id === templateNodeId) {
                return true;
            }
        }
    }
    if (figma.currentPage.selection.length === 1 && isInsideTemplate(figma.currentPage.selection[0])) {
        selection = {
            element: (_a = getPluginData_1(figma.currentPage.selection[0], 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is,
            name: getSelectionName(figma.currentPage.selection[0]),
        };
        figma.ui.postMessage({ type: 'current-selection', selection: selection });
    }
    figma.on('selectionchange', () => {
        var _a;
        if (figma.currentPage.selection.length === 1 && isInsideTemplate(figma.currentPage.selection[0])) {
            console.log('selection changed');
            selection = {
                element: (_a = getPluginData_1(figma.currentPage.selection[0], 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is,
                name: getSelectionName(figma.currentPage.selection[0]),
            };
            figma.ui.postMessage({ type: 'current-selection', selection: selection });
        }
        else {
            figma.ui.postMessage({ type: 'current-selection', selection: undefined });
        }
    });
}
function getRecentFilesAsync() { }
// Commands
function detachTable() { }
function spawnTable() { }
function toggleColumnResizing() { }
function switchColumnsOrRows() { }
function selectColumns() { }
function selectRows() { }
dist((plugin) => {
    plugin.ui = {
        html: __uiFiles__.main,
        width: 268,
        height: 504,
    };
    // Received messages
    async function newTemplateComponent(opts) {
        let { shouldCreatePage } = opts;
        if (shouldCreatePage) {
            createPage('Table Creator');
        }
        let components = await createDefaultComponents();
        let { templateComponent } = components;
        // Set template data on component
        let templateData = new Template(templateComponent);
        setPluginData_1(templateComponent, 'template', templateData);
        setDocumentData_1('defaultTemplate', templateData);
        templateComponent.setRelaunchData(defaultRelaunchData);
        figma.ui.postMessage({ type: 'post-default-component', defaultTemplate: templateData, localTemplates: getLocalTemplates() });
        incrementNameNumerically(templateComponent);
        selectAndZoomIntoView(figma.currentPage.children);
    }
    async function editTemplateComponent(msg) {
        lookForComponent(msg.template).then((templateNode) => {
            var _a, _b, _c, _d;
            // figma.viewport.scrollAndZoomIntoView([templateNode])
            animateNodeIntoView([templateNode]);
            figma.currentPage.selection = [templateNode];
            let parts = getTemplateParts(templateNode);
            let partsAsObject = {
                table: {
                    name: getSelectionName(parts === null || parts === void 0 ? void 0 : parts.table),
                    element: 'table',
                    id: (_a = parts === null || parts === void 0 ? void 0 : parts.table) === null || _a === void 0 ? void 0 : _a.id,
                },
                tr: {
                    name: getSelectionName(parts === null || parts === void 0 ? void 0 : parts.tr),
                    element: 'tr',
                    id: (_b = parts === null || parts === void 0 ? void 0 : parts.tr) === null || _b === void 0 ? void 0 : _b.id,
                },
                td: {
                    name: getSelectionName(parts === null || parts === void 0 ? void 0 : parts.td),
                    element: 'td',
                    id: (_c = parts === null || parts === void 0 ? void 0 : parts.td) === null || _c === void 0 ? void 0 : _c.id,
                },
                th: {
                    name: getSelectionName(parts === null || parts === void 0 ? void 0 : parts.th),
                    element: 'th',
                    id: (_d = parts === null || parts === void 0 ? void 0 : parts.th) === null || _d === void 0 ? void 0 : _d.id,
                },
            };
            postCurrentSelection(templateNode.id);
            figma.ui.postMessage({ type: 'template-parts', parts: partsAsObject });
        });
    }
    function setDefaultTemplate(templateData) {
        plugin.post('default-template', () => {
        });
        figma.notify(`${templateData.name} set as default`);
    }
    async function refreshTables() {
        // FIXME: Template file name not up to date for some reason
        var tables = figma.root.findAll((node) => { var _a; return ((_a = getPluginData_1(node, 'template')) === null || _a === void 0 ? void 0 : _a.id) === template.id; });
        // getAllTableInstances()
        var tableTemplate = await lookForComponent(template);
        var rowTemplate = tableTemplate.findOne((node) => { var _a; return ((_a = getPluginData_1(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === 'tr'; });
        for (let b = 0; b < tables.length; b++) {
            var table = tables[b];
            // Don't apply if an instance
            if (table.type !== 'INSTANCE') {
                console.log('tableTemplate', tableTemplate);
                copyPasteStyle(tableTemplate, table, { exclude: ['name'] });
                // for (let x = 0; x < table.children.length; x++) {
                // 	var row = table.children[x]
                // 	if (getPluginData(row, 'elementSemantics')?.is === "tr" === true && row.type !== "INSTANCE") {
                // 		copyPasteStyle(rowTemplate, row, { exclude: ['name'] })
                // 	}
                // 	// // Only need to loop through cells if has been changed by user
                // 	// if (row.children && getPluginData(row, "isRow") === true) {
                // 	// 	for (let k = 0; k < row.children.length; k++) {
                // 	// 		var cell = row.children[k]
                // 	// 	}
                // 	// }
                // }
                table.findAll((node) => {
                    var _a;
                    if ((((_a = getPluginData_1(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === 'tr') === true && node.type !== 'INSTANCE') {
                        copyPasteStyle(rowTemplate, node, { exclude: ['name'] });
                    }
                });
            }
        }
    }
    plugin.command('createTable', async ({ ui }) => {
        // Show create table UI
        let pluginAlreadyRun = await getClientStorageAsync_1('pluginAlreadyRun');
        let userPreferences = await getClientStorageAsync_1('userPreferences');
        let usingRemoteTemplate = await getClientStorageAsync_1('usingRemoteTemplate');
        const recentFiles = await getRecentFilesAsync();
        const remoteFiles = getDocumentData_1('remoteFiles');
        const fileId = getDocumentData_1('fileId');
        const defaultTemplate = getDefaultTemplate();
        const localTemplates = getLocalTemplates();
        ui.show(Object.assign(Object.assign({ type: 'show-create-table-ui' }, userPreferences), { remoteFiles,
            recentFiles,
            localTemplates,
            defaultTemplate,
            fileId,
            usingRemoteTemplate,
            pluginAlreadyRun }));
    });
    plugin.command('detachTable', detachTable);
    plugin.command('spawnTable', spawnTable);
    plugin.command('toggleColumnResizing', toggleColumnResizing);
    plugin.command('switchColumnsOrRows', switchColumnsOrRows);
    plugin.command('selectColumns', selectColumns);
    plugin.command('selectRows', selectRows);
    plugin.command('newTemplate', newTemplateComponent);
    plugin.command('importTemplate', importTemplate);
    plugin.on('new-template', () => {
        newTemplateComponent({ shouldCreatePage: true });
    });
    plugin.on('edit-template', editTemplateComponent);
    plugin.on('set-default-template', setDefaultTemplate);
    plugin.on('set-semantics', () => { });
    plugin.on('create-table-instance', async (msg) => {
        const templateComponent = await getComponent(getDocumentData_1('defaultTemplate').id);
        const userPreferences = await getUserPreferencesAsync();
        createTableInstance(templateComponent, userPreferences)
            .then((tableInstance) => {
            updateClientStorageAsync_1('userPreferences', (data) => Object.assign(data, msg)).then(figma.closePlugin('Table created'));
        })
            .catch();
    });
    plugin.on('refresh-tables', refreshTables);
    plugin.on('save-user-preferences', () => { });
    plugin.on('fetch-template-part', () => { });
    plugin.on('fetch-current-selection', () => { });
});
