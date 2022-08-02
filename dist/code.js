<<<<<<< HEAD
'use strict';

var global$1 = (typeof global !== "undefined" ? global :
  typeof self !== "undefined" ? self :
  typeof window !== "undefined" ? window : {});

var name = "svelte-app";
var version = "1.0.2";
var scripts = {
	build: "rollup -c",
	dev: "rollup -c -w",
	start: "sirv public"
};
var devDependencies = {
	"@figma/plugin-typings": "^1.49.0",
	"@fignite/helpers": "^0.0.0-alpha.10",
	"@rollup/plugin-commonjs": "^17.0.0",
	"@rollup/plugin-image": "^2.0.6",
	"@rollup/plugin-json": "^4.1.0",
	"@rollup/plugin-node-resolve": "^11.2.1",
	"@rollup/plugin-replace": "^2.4.2",
	"@rollup/plugin-strip": "^2.1.0",
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
	lodash: "^4.17.21",
	"postcss-logical": "^4.0.2",
	"sirv-cli": "^1.0.10",
	stylup: "0.0.0-alpha.3",
	tweeno: "^1.1.3",
	underscore: "^1.13.4",
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
    "id",
    "parent",
    "name",
    "removed",
    "visible",
    "locked",
    "children",
    "constraints",
    "absoluteTransform",
    "relativeTransform",
    "x",
    "y",
    "rotation",
    "width",
    "height",
    "constrainProportions",
    "layoutAlign",
    "layoutGrow",
    "opacity",
    "blendMode",
    "isMask",
    "effects",
    "effectStyleId",
    "expanded",
    "backgrounds",
    "backgroundStyleId",
    "fills",
    "strokes",
    "strokeWeight",
    "strokeMiterLimit",
    "strokeAlign",
    "strokeCap",
    "strokeJoin",
    "dashPattern",
    "fillStyleId",
    "strokeStyleId",
    "cornerRadius",
    "cornerSmoothing",
    "topLeftRadius",
    "topRightRadius",
    "bottomLeftRadius",
    "bottomRightRadius",
    "exportSettings",
    "overflowDirection",
    "numberOfFixedChildren",
    "overlayPositionType",
    "overlayBackground",
    "overlayBackgroundInteraction",
    "reactions",
    "description",
    "remote",
    "key",
    "layoutMode",
    "primaryAxisSizingMode",
    "counterAxisSizingMode",
    "primaryAxisAlignItems",
    "counterAxisAlignItems",
    "paddingLeft",
    "paddingRight",
    "paddingTop",
    "paddingBottom",
    "itemSpacing",
    // 'horizontalPadding',
    // 'verticalPadding',
    "layoutGrids",
    "gridStyleId",
    "clipsContent",
    "guides",
    "type",
    "strokeTopWeight",
    "strokeBottomWeight",
    "strokeRightWeight",
    "strokeLeftWeight",
];
const readOnly = [
    "id",
    "parent",
    "removed",
    "children",
    "absoluteTransform",
    "width",
    "height",
    "overlayPositionType",
    "overlayBackground",
    "overlayBackgroundInteraction",
    "reactions",
    "remote",
    "key",
    "type",
    "masterComponent",
    "mainComponent",
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
    if (target &&
        Object.keys(target).length === 0 &&
        target.constructor === Object) {
        targetIsEmpty = true;
    }
    var options;
    if (typeof args[0] === "function")
        ;
    if (typeof args[1] === "function")
        ;
    if (typeof args[0] === "object" && typeof args[0] !== "function")
        options = args[0];
    if (typeof args[0] === "object" && typeof args[0] !== "function")
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
            return !["id", "type"].includes(el);
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
                if (typeof obj[key] === "symbol") {
                    obj[key] = "Mixed";
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
        !obj.strokeStyleId && obj.strokes
            ? delete obj.strokeStyleId
            : delete obj.strokes;
        !obj.backgroundStyleId && obj.backgrounds
            ? delete obj.backgroundStyleId
            : delete obj.backgrounds;
        !obj.effectStyleId && obj.effects
            ? delete obj.effectStyleId
            : delete obj.effects;
        !obj.gridStyleId && obj.layoutGrids
            ? delete obj.gridStyleId
            : delete obj.layoutGrids;
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
        if (source.type === "FRAME" ||
            source.type === "COMPONENT" ||
            source.type === "COMPONENT_SET" ||
            source.type === "PAGE" ||
            source.type === "GROUP" ||
            source.type === "INSTANCE" ||
            source.type === "DOCUMENT" ||
            source.type === "BOOLEAN_OPERATION") {
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
        let frame = node.createInstance().detachInstance();
        parent.appendChild(frame);
        copyPaste(node, frame, { include: ["x", "y"] });
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
        return data;
    }
    else {
        node.setPluginData(key, JSON.stringify(data));
        return JSON.stringify(data);
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
 * Convinient way to delete children of a node
 * @param {SceneNode & ChildrenMixin } node A node with children
 */
function removeChildren$1(node) {
    let length = node.children.length;
    // Has to happen in reverse because of order layers are listed
    for (let i = length - 1; i >= 0; i--) {
        node.children[i].remove();
    }
}

/**
 * Resizes a node, to allow nodes of size < 0.01
 * A value of zero will be replaced with 1/Number.MAX_SAFE_INTEGER
 * @param {SceneNode & LayoutMixin} node Node to resize
 * @param {number} width
 * @param {number} height
 * @returns Resized Node
 */
function resize(node, width, height) {
    //Workaround to resize a node, if its size is less than 0.01
    //If 0, make it almost zero
    width === 0 ? width = 1 / Number.MAX_SAFE_INTEGER : null;
    height === 0 ? height = 1 / Number.MAX_SAFE_INTEGER : null;
    let nodeParent = node.parent;
    node.resize(width < 0.01 ? 1 : width, height < 0.01 ? 1 : height);
    if (width < 0.01 || height < 0.01) {
        let dummy = figma.createRectangle();
        dummy.resize(width < 0.01 ? 1 / width : width, height < 0.01 ? 1 / height : height);
        let group = figma.group([node, dummy], figma.currentPage);
        group.resize(width < 0.01 ? 1 : width, height < 0.01 ? 1 : height);
        nodeParent.appendChild(node);
        group.remove();
    }
    return node;
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

/**
 * Returns the index of a node
 * @param {SceneNode} node A node
 * @returns The index of the node
 */
function getNodeIndex(node) {
    return node.parent.children.indexOf(node);
}

const nodeToObject = (node, withoutRelations, removeConflicts) => {
    const props = Object.entries(Object.getOwnPropertyDescriptors(node.__proto__));
    const blacklist = ['parent', 'children', 'removed', 'masterComponent', 'horizontalPadding', 'verticalPadding'];
    const obj = { id: node.id, type: node.type };
    for (const [name, prop] of props) {
        if (prop.get && !blacklist.includes(name)) {
            try {
                if (typeof obj[name] === 'symbol') {
                    obj[name] = 'Mixed';
                }
                else {
                    obj[name] = prop.get.call(node);
                }
            }
            catch (err) {
                obj[name] = undefined;
            }
        }
    }
    if (node.parent && !withoutRelations) {
        obj.parent = { id: node.parent.id, type: node.parent.type };
    }
    if (node.children && !withoutRelations) {
        obj.children = node.children.map((child) => nodeToObject(child, withoutRelations));
    }
    if (node.masterComponent && !withoutRelations) {
        obj.masterComponent = nodeToObject(node.masterComponent, withoutRelations);
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
    return obj;
};

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

function isFunction$2(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}
// TODO: Add option to ignore width and height?
// TODO: Could do with refactoring
/**
 * Replace any node with another node
 * @param {SceneNode} target The node you want to replace
 * @param {SceneNode | Callback} source What you want to replace the node with
 * @returns Returns the new node as a component
 */
function replace(target, source) {
    let isSelection = false;
    let targetCopy;
    let clonedSelection = [];
    let nodeIndex;
    let parent;
    // If it's a selection we need to create a dummy node that represents the whole of the selection to base the properties off
    if (Array.isArray(target)) {
        nodeIndex = getNodeIndex(target[0]);
        parent = target[0].parent;
        // Clone the target so the actual target doesn't move
        for (let i = 0; i < target.length; i++) {
            let clone = target[i].clone();
            clonedSelection.push(clone);
        }
        // parent.insertChild(clone, nodeIndex)
        targetCopy = figma.group(clonedSelection, parent, nodeIndex);
        // I think this needs to happen because when you create a clone it doesn't get inserted into the same location as the original node?
        targetCopy.x = target[0].x;
        targetCopy.y = target[0].y;
        isSelection = true;
        nodeIndex = getNodeIndex(targetCopy);
        parent = targetCopy.parent;
    }
    else {
        targetCopy = nodeToObject(target);
        nodeIndex = getNodeIndex(target);
        parent = target.parent;
    }
    let targetWidth = targetCopy.width;
    let targetHeight = targetCopy.height;
    let result;
    if (isFunction$2(source)) {
        result = source(target);
    }
    else {
        result = source;
    }
    if (result) {
        // FIXME: Add this into copyPaste helper
        result.resizeWithoutConstraints(targetWidth, targetHeight);
        copyPaste(targetCopy, result, { include: ['x', 'y', 'constraints'] });
        // copyPaste not working properly so have to manually copy x and y
        result.x = targetCopy.x;
        result.y = targetCopy.y;
        console.log(parent);
        parent.insertChild(nodeIndex, result);
        if (isSelection) {
            targetCopy.remove();
            // clonedSelection gets removed when this node gets removed
        }
        if (figma.getNodeById(target.id)) {
            target.remove();
        }
        return result;
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

/**
 * Generates a Unique ID
 * @returns A unique identifier
 */
// TODO: Use with figma.activeUser session ID
function genUID() {
    // var randPassword = Array(10)
    //   .fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz")
    //   .map(function (x) {
    //     return x[Math.floor(Math.random() * x.length)];
    //   })
    //   .join("");
    return `${figma.currentUser.id +
        "-" +
        figma.currentUser.sessionId +
        "-" +
        new Date().valueOf()}`;
}

/**
 * Saves recently visited files to a list in clientStorage and keeps the data and name up to date each time they're visited. If a file is duplicated it could be problematic. The only solution is for the user to run the plugin when the file has been duplicated with the suffix "(Copy)" still present. Then the plugin will reset the fileId.
 * @param {any} fileData Any data you want to be associated with the file
 * @returns An array of files excluding the current file
 */
function addUniqueToArray$1(array, object) {
    // // Only add new template if unique
    var index = array.findIndex((x) => x.id === object.id);
    index === -1 ? array.push(object) : false;
    return array;
}
function isUnique(array, object) {
    // // Only add new template if unique
    var index = array.findIndex((x) => x.id === object.id);
    return index === -1 ? true : false;
}
function File$1(data) {
    this.id =
        getDocumentData("fileId") ||
            setDocumentData("fileId", genUID()).replace(/['"]+/g, "");
    // TODO: When getPluginData has been updated to evaluate expressions at runtime replace with below
    // this.name = `{figma.getNodeById("0:1").name}`
    this.name = figma.root.name;
    this.firstVisited = new Date().toISOString();
    this.lastVisited = new Date().toISOString();
    if (data) {
        this.data = data;
        setDocumentData("fileData", data);
    }
    else {
        this.data = getDocumentData("fileData");
    }
}
async function getRecentFilesAsync(fileData, opts) {
    opts = opts || {};
    // Should it include an option top only add published components/data?
    // const publishedComponents = await getPublishedComponents(fileData)
    fileData = fileData || getDocumentData("fileData");
    let recentFiles = await updateClientStorageAsync("recentFiles", (recentFiles) => {
        recentFiles = recentFiles || [];
        const currentFile = new File$1(fileData);
        // We have to check if the array is empty because we can't filter an empty array
        if (recentFiles.length === 0) {
            if (fileData.length > 0)
                recentFiles.push(currentFile);
        }
        else {
            // BUG: It's not possible to check for duplicates because you would need some way to tell them apart, otherwise you don't know if its a duplicate file for just the same file. I tried resetting the fileId when it wasn't unique, but then when it was a file that's already been added I had no way of telling them apart.
            // This is sort of like a get out clause. It enables a user to register a duplicated file if its the same user and the plugin is run when the file name ends in (Copy).
            if (!isUnique(recentFiles, currentFile)) {
                let [id, sessionId, timestamp] = currentFile.id.split("-");
                if (id === figma.currentUser.id &&
                    sessionId !== figma.currentUser.sessionId.toString() &&
                    figma.root.name.endsWith("(Copy)") &&
                    !getDocumentData("duplicateResolved")) {
                    currentFile.id = setDocumentData("fileId", genUID()).replace(/['"]+/g, "");
                    setDocumentData("duplicateResolved", true);
                }
            }
            if (!figma.root.name.endsWith("(Copy)")) {
                setDocumentData("duplicateResolved", "");
            }
            // If unique then add to array
            addUniqueToArray$1(recentFiles, currentFile);
            if (recentFiles.length > 0) {
                // If not, then update
                recentFiles.filter((item, i) => {
                    if (item.id === currentFile.id) {
                        item.name = currentFile.name;
                        item.lastVisited = new Date().toISOString();
                        item.data = currentFile.data;
                        setDocumentData("fileData", fileData);
                        // If data no longer exists, delete the file
                        if (!fileData ||
                            (Array.isArray(fileData) && fileData.length === 0)) {
                            recentFiles.splice(i, 1);
                        }
                    }
                });
                // Sort by firstVisitedByPlugin
                recentFiles.sort((a, b) => {
                    if (a.lastVisited === b.lastVisited)
                        return 0;
                    return a.lastVisited > b.lastVisited ? -1 : 1;
                });
                if (opts.expire) {
                    // Remove files which are out of date
                    recentFiles.map((file) => {
                        let fileTimestamp = new Date(file.lastVisited).valueOf();
                        let currentTimestamp = new Date().valueOf();
                        // if (fileTimestamp < currentTimestamp - daysToMilliseconds(7)) {
                        if (fileTimestamp < currentTimestamp - opts.expire) {
                            let fileIndex = recentFiles.indexOf(file);
                            if (fileIndex !== -1) {
                                recentFiles.splice(fileIndex, 1);
                            }
                        }
                    });
                }
            }
        }
        return recentFiles;
    });
    if (recentFiles.length > 0) {
        // Exclude current file
        recentFiles = recentFiles.filter((file) => {
            return !(file.id === getPluginData(figma.root, "fileId"));
        });
    }
    return recentFiles;
}

/**
 * Returns any remote files associated with the current file used by the plugin and keeps the name and data up to date.
 * @returns An array of files
 */
async function getRemoteFilesAsync(fileId) {
    var recentFiles = await getClientStorageAsync("recentFiles");
    return updatePluginData(figma.root, "remoteFiles", (remoteFiles) => {
        remoteFiles = remoteFiles || [];
        // Add new file to remote files
        if (fileId) {
            let fileAlreadyExists = remoteFiles.find((file) => file.id === fileId);
            let recentFile = recentFiles.find((file) => file.id === fileId);
            if (!fileAlreadyExists) {
                remoteFiles.push(recentFile);
            }
        }
        // Update all remote files with data from recent files
        if (recentFiles.length > 0) {
            for (let i = 0; i < remoteFiles.length; i++) {
                var remoteFile = remoteFiles[i];
                for (let x = 0; x < recentFiles.length; x++) {
                    var recentFile = recentFiles[x];
                    // Update existing remote files
                    if (recentFile.id === remoteFile.id) {
                        remoteFiles[i] = recentFile;
                    }
                }
            }
            // // I think this is a method of merging files, maybe removing duplicates?
            // var ids = new Set(remoteFiles.map((file) => file.id));
            // var merged = [
            //   ...remoteFiles,
            //   ...recentFiles.filter((file) => !ids.has(file.id)),
            // ];
            // // Exclude current file (because we want remote files to this file only)
            // merged = merged.filter((file) => {
            //   return !(file.id === getPluginData(figma.root, "fileId"));
            // });
            // Exclude current file (because we want remote files to this file only)
            remoteFiles = remoteFiles.filter((file) => {
                return !(file.id === getPluginData(figma.root, "fileId"));
            });
        }
        // }
        // Then I check to see if the file name has changed and make sure it's up to date
        // For now I've decided to include unpublished components in remote files, to act as a reminder to people to publish them
        if (remoteFiles.length > 0) {
            for (var i = 0; i < remoteFiles.length; i++) {
                var file = remoteFiles[i];
                if (file.data[0]) {
                    figma
                        .importComponentByKeyAsync(file.data[0].component.key)
                        .then((component) => {
                        var remoteTemplate = getPluginData(component, "template");
                        updatePluginData(figma.root, "remoteFiles", (remoteFiles) => {
                            remoteFiles.map((file) => {
                                if (file.id === remoteTemplate.file.id) {
                                    file.name = remoteTemplate.file.name;
                                }
                            });
                            return remoteFiles;
                        });
                    })
                        .catch((error) => {
                        console.log(error);
                        // FIXME: Do I need to do something here if component is deleted?
                        // FIXME: Is this the wrong time to check if component is published?
                        // figma.notify("Please check component is published")
                    });
                }
            }
        }
        return remoteFiles;
    });
}
function removeRemoteFile(fileId) {
    return updatePluginData(figma.root, "remoteFiles", (remoteFiles) => {
        let fileIndex = remoteFiles.findIndex((file) => {
            return file.id === fileId;
        });
        if (fileIndex !== -1) {
            remoteFiles.splice(fileIndex, 1);
        }
        return remoteFiles;
    });
}

/**
 * Increments the name numerically by 1.
 * @param {String} name The name you want to increment
 * @param {Array} array An array of objects to sort and compare against
 * @returns The incremented name
 */
function incrementName(name, array) {
    let nameToMatch = name;
    if (array && array.length > 1) {
        array.sort((a, b) => {
            if (a.name === b.name)
                return 0;
            return a.name > b.name ? -1 : 1;
        });
        nameToMatch = array[0].name;
    }
    let matches = nameToMatch.match(/^(.*\S)(\s*)(\d+)$/);
    // And increment by 1
    // Ignores if array is empty
    if (matches && !(array && array.length === 0)) {
        name = `${matches[1]}${matches[2]}${parseInt(matches[3], 10) + 1}`;
    }
    return name;
}

var convertToComponent_1 = convertToComponent;
var convertToFrame_1 = convertToFrame;
var copyPaste_1 = copyPaste;
var genUID_1 = genUID;
var getClientStorageAsync_1 = getClientStorageAsync;
var getDocumentData_1 = getDocumentData;
var getNodeIndex_1 = getNodeIndex;
var getPageNode_1 = getPageNode;
var getPluginData_1 = getPluginData;
var getRecentFilesAsync_1 = getRecentFilesAsync;
var getRemoteFilesAsync_1 = getRemoteFilesAsync;
var incrementName_1 = incrementName;
var nodeToObject_1 = nodeToObject;
var removeChildren_1 = removeChildren$1;
var removeRemoteFile_1 = removeRemoteFile;
var replace_1 = replace;
var resize_1 = resize;
var setDocumentData_1 = setDocumentData;
var setPluginData_1 = setPluginData;
var ungroup_1 = ungroup;
var updateClientStorageAsync_1 = updateClientStorageAsync;
var updatePluginData_1 = updatePluginData;

/* istanbul ignore next */
var Easing = {
    Linear: {
        None: function(k) {
            return k;
        }
    },
    Quadratic: {
        In: function(k) {
            return k * k;
        },
        Out: function(k) {
            return k * (2 - k);
        },
        InOut: function(k) {
            if((k *= 2) < 1) return 0.5 * k * k;
            return -0.5 * (--k * (k - 2) - 1);
        }
    },
    Cubic: {
        In: function(k) {
            return k * k * k;
        },
        Out: function(k) {
            return --k * k * k + 1;
        },
        InOut: function(k) {
            if((k *= 2) < 1) return 0.5 * k * k * k;
            return 0.5 * ((k -= 2) * k * k + 2);
        }
    },
    Quartic: {
        In: function(k) {
            return k * k * k * k;
        },
        Out: function(k) {
            return 1 - (--k * k * k * k);
        },
        InOut: function(k) {
            if((k *= 2) < 1) return 0.5 * k * k * k * k;
            return -0.5 * ((k -= 2) * k * k * k - 2);
        }
    },
    Quintic: {
        In: function(k) {
            return k * k * k * k * k;
        },
        Out: function(k) {
            return --k * k * k * k * k + 1;
        },
        InOut: function(k) {
            if((k *= 2) < 1) return 0.5 * k * k * k * k * k;
            return 0.5 * ((k -= 2) * k * k * k * k + 2);
        }
    },
    Sinusoidal: {
        In: function(k) {
            return 1 - Math.cos(k * Math.PI / 2);
        },
        Out: function(k) {
            return Math.sin(k * Math.PI / 2);
        },
        InOut: function(k) {
            return 0.5 * (1 - Math.cos(Math.PI * k));
        }
    },
    Exponential: {
        In: function(k) {
            return k === 0 ? 0 : Math.pow(1024, k - 1);
        },
        Out: function(k) {
            return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
        },
        InOut: function(k) {
            if(k === 0) return 0;
            if(k === 1) return 1;
            if((k *= 2) < 1) return 0.5 * Math.pow(1024, k - 1);
            return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
        }
    },
    Circular: {
        In: function(k) {
            return 1 - Math.sqrt(1 - k * k);
        },
        Out: function(k) {
            return Math.sqrt(1 - (--k * k));
        },
        InOut: function(k) {
            if((k *= 2) < 1) return -0.5 * (Math.sqrt(1 - k * k) - 1);
            return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
        }
    },
    Elastic: {
        In: function(k) {
            var s, a = 0.1,
                p = 0.4;
            if(k === 0) return 0;
            if(k === 1) return 1;
            if(!a || a < 1) {
                a = 1;
                s = p / 4;
            } else s = p * Math.asin(1 / a) / (2 * Math.PI);
            return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
        },
        Out: function(k) {
            var s, a = 0.1,
                p = 0.4;
            if(k === 0) return 0;
            if(k === 1) return 1;
            if(!a || a < 1) {
                a = 1;
                s = p / 4;
            } else s = p * Math.asin(1 / a) / (2 * Math.PI);
            return(a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1);
        },
        InOut: function(k) {
            var s, a = 0.1,
                p = 0.4;
            if(k === 0) return 0;
            if(k === 1) return 1;
            if(!a || a < 1) {
                a = 1;
                s = p / 4;
            } else s = p * Math.asin(1 / a) / (2 * Math.PI);
            if((k *= 2) < 1) return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
            return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;
        }
    },
    Back: {
        In: function(k) {
            var s = 1.70158;
            return k * k * ((s + 1) * k - s);
        },
        Out: function(k) {
            var s = 1.70158;
            return --k * k * ((s + 1) * k + s) + 1;
        },
        InOut: function(k) {
            var s = 1.70158 * 1.525;
            if((k *= 2) < 1) return 0.5 * (k * k * ((s + 1) * k - s));
            return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
        }
    },
    Bounce: {
        In: function(k) {
            return 1 - Easing.Bounce.Out(1 - k);
        },
        Out: function(k) {
            if(k < (1 / 2.75)) {
                return 7.5625 * k * k;
            } else if(k < (2 / 2.75)) {
                return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
            } else if(k < (2.5 / 2.75)) {
                return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
            } else {
                return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
            }
        },
        InOut: function(k) {
            if(k < 0.5) return Easing.Bounce.In(k * 2) * 0.5;
            return Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;
        }
    }
};
var easing = Easing;

/* istanbul ignore next */
var Utils = {
    Linear: function(p0, p1, t) {
        return (p1 - p0) * t + p0;
    },
    Bernstein: function(n, i) {
        var fc = Utils.Factorial;
        return fc(n) / fc(i) / fc(n - i);
    },
    Factorial: (function() {
        var a = [1];
        return function(n) {
            var s = 1,
                i;
            if(a[n]) return a[n];
            for(i = n; i > 1; i--) s *= i;
                a[n] = s;
            return a[n];
        };
    })(),
    CatmullRom: function(p0, p1, p2, p3, t) {
        var v0 = (p2 - p0) * 0.5,
            v1 = (p3 - p1) * 0.5,
            t2 = t * t,
            t3 = t * t2;
        return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
    }
};
/* istanbul ignore next */
var interpolation = {
    Linear: function(v, k) {
        var m = v.length - 1,
            f = m * k,
            i = Math.floor(f),
            fn = Utils.Linear;
        if(k < 0) return fn(v[0], v[1], f);
        if(k > 1) return fn(v[m], v[m - 1], m - f);
        return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
    },
    Bezier: function(v, k) {
        var b = 0,
            n = v.length - 1,
            pw = Math.pow,
            bn = Utils.Bernstein,
            i;
        for(i = 0; i <= n; i++) {
            b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
        }
        return b;
    },
    CatmullRom: function(v, k) {
        var m = v.length - 1,
            f = m * k,
            i = Math.floor(f),
            fn = Utils.CatmullRom;
        if(v[0] === v[m]) {
            if(k < 0) i = Math.floor(f = m * (1 + k));
            return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
        } else {
            if(k < 0) return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
            if(k > 1) return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
            return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
        }
    }
};

/**
    settings = {
        from: false,
        to: null,
        duration: null,
        repeat: false,
        delay: 0,
        easing: false,
        yoyo: false, // requires repeat to be 1 or greater, reverses animation every other repeat
        interpolation: false,
        onStart: false,
        onYoYo: false,
        onRepeat: false,
        onUpdate: false,
        onComplete: false,
        filters: false
    };
    **/
var Tween = function(object, settings) {
    settings = settings || {};
    this._object = object;
    this._valuesStart = {};

    this._valuesStartRepeat = {};
    this._startTime = null;
    this._onStartCallbackFired = false;
    this._onCompleteCallbackFired = false;
    // if true this tween will be removed from any animation list it is part of
    this.remove = false;

    this._isPlaying = false;
    this._reversed = false;

    this.filters = settings.filters || {};

    this.duration = settings.duration || 1000;
    this.repeat = settings.repeat || 0;
    this.repeatDelay = settings.repeatDelay || 0;
    this.delay = settings.delay || 0;
    this.from = settings.from || false;
    this.to = settings.to || {};
    this.yoyo = settings.yoyo || false;

    this.easing = settings.easing || easing.Linear.None;
    this.interpolation = settings.interpolation || interpolation.Linear;

    this.chained = settings.chained || [];

    this.onStart = settings.onStart || false;
    this.onUpdate = settings.onUpdate || false;
    this.onComplete = settings.onComplete || false;
    this.onRepeat = settings.onRepeat || false;
    this.onYoYo = settings.onYoYo || false;
    this.window = false;
};

Tween.prototype.start = function(time) {
    this._isPlaying = true;
    var property;
    // Set all starting values present on the target object
    for(var field in this._object) {
        // if a from object was set, apply those properties to the target object
        if(this.from && typeof this.from[field] !== 'undefined') {
            this._object[field] = this.from[field];
        }
    }
    this._onStartCallbackFired = false;
    this._onCompleteCallbackFired = false;

    if(typeof time !== 'undefined') {
        this._startTime = time;
    } else {
        // allows for unit testing
        var window = this.window || window;
        if(
            typeof window !== 'undefined' &&
            typeof window.performance !== 'undefined' &&
            typeof window.performance.now !== 'undefined'
        ) {
            this._startTime = window.performance.now();
        } else {
            this._startTime = Date.now();
        }
    }
    this._startTime += this.delay;

    for(property in this.to) {
        var toProperty = this.to[property],
            filter = this.filters[property];

        // check if an Array was provided as property value
        if(toProperty instanceof Array) {
            if(toProperty.length === 0) {
                continue;
            }
            // create a local copy of the Array with the start value at the front
            toProperty = [this._object[property]].concat(toProperty);
        }

        // if this property has a filter
        if(filter) {
            filter.start(this._object[property], toProperty);
        }

        this.to[property] = toProperty;
        this._valuesStart[property] = this._object[property];
        this._valuesStartRepeat[property] = this._valuesStart[property] || 0;
    }
    return this;
};

Tween.prototype.update = function(time) {
    if(!this._isPlaying) {
        return true;
    }
    var property;
    if(time < this._startTime) {
        return true;
    }
    if(this._onStartCallbackFired === false) {
        if(this.onStart) {
            this.onStart(this._object, this, 0, 0);
        }
        this._onStartCallbackFired = true;
    }

    var elapsed = (time - this._startTime) / this.duration;
    elapsed = elapsed > 1 ? 1 : elapsed;

    var easedProgress = this.easing(elapsed);

    for(property in this.to) {

        var start = this._valuesStart[property] || 0,
            end = this.to[property],
            filter = typeof this.filters[property] !== 'undefined' ? this.filters[property] : false,
            newValue;

        // protect against non numeric properties.
        if(typeof end === "number") {
            newValue = start + (end - start) * easedProgress;
        }
        // handle filtered end values
        else if(filter) {
            newValue = filter.getUpdatedValue(easedProgress, this.interpolation);
        }
        // handle interpolated end values
        else if(end instanceof Array) {
            newValue = this.interpolation(end, easedProgress);
        }

        if(typeof newValue !== 'undefined') {
            this._object[property] = newValue;
        }
    }

    if(this.onUpdate) {
        this.onUpdate(this._object, this, easedProgress, elapsed);
    }

    if(elapsed == 1) {
        if(this.repeat > 0) {
            if(isFinite(this.repeat)) {
                this.repeat--;
            }
            // reassign starting values, restart by making startTime = now
            for(property in this._valuesStartRepeat) {
                if(this.yoyo) {
                    var tmp = this._valuesStartRepeat[property];
                    this._valuesStartRepeat[property] = this.to[property];
                    this.to[property] = tmp;
                    this._reversed = !this._reversed;
                    if(this.onYoYo){
                        this.onYoYo(this._object, this, 1, 1);
                    }
                }
                this._valuesStart[property] = this._valuesStartRepeat[property];
                if(this.filters[property]) {
                    this.filters[property].start(this._valuesStart[property], this.to[property]);
                }
            }
            this._startTime = time + this.repeatDelay;
            if(this.onRepeat){
                this.onRepeat(this._object, this, 1, 1);
            }
            return true;
        } else {
            if(this._onCompleteCallbackFired === false) {
                if(this.onComplete) {
                    this.onComplete(this._object, this, 1, 1);
                }
                this._onCompleteCallbackFired = true;
            }
            return false;
        }
    }
    return true;
};

Tween.prototype.getDuration = function() {
    var repeatDelay = 0;
    if(this.repeat){
        repeatDelay = this.repeatDelay;
    }

    return this.delay + (repeatDelay + this.duration) * (this.repeat || 1);
};

var tween = Tween;

var Filter = function(settings) {
    settings = settings || {};
    this.format = settings.format || this.format;

    this.placeholder = settings.placeholder || this.placeholder;
    // prevent reference
    this.placeholderTypes = settings.placeholderTypes || [].concat(this.placeholderTypes);
    this._formatArray = this.format.split(this.placeholder);
};

Filter.prototype._formatArray = null;

Filter.prototype.format = 'rgba(%,%,%,%)';
Filter.prototype.placeholder = '%';
Filter.prototype.placeholderTypes = ['int', 'int', 'int', 'float'];

Filter.prototype.to = null;
Filter.prototype.from = null;

Filter.prototype.stringToArray = function(string) {
    var array = string.match(/[+-]?[\d]+(\.[\d]+)?/g);
    return array.map(parseFloat);
};

Filter.prototype.validateArrayLength = function(length, string, param) {
    param = param || '';
    string = string || '';

    if(param) {
        param = ' set to the "' + param + '" param';
    }
    if(string) {
        string = ' of string "' + string + '"';
    }

    var placeholderCount = this._formatArray.length - 1;
    if(length < placeholderCount) {
        throw new Error('value array length' + ' ( ' + length + ' )' + string + param + ' is less than the number of format placeholders ' + '( ' + placeholderCount + ' ) in ' + this.format);
    } else if(length > placeholderCount) {
        throw new Error('value array length' + ' ( ' + length + ' )' + string + param + ' is greater than the number of format placeholders ' + '( ' + placeholderCount + ' ) in ' + this.format);
    }
};

Filter.prototype.arrayToString = function(array) {
    var formatArray = this._formatArray,
        len = formatArray.length,
        out = [],
        i;

    for(i = 0; i < len; i++) {
        if(this.placeholderTypes[i] === 'int'){
            array[i] = Math.round(array[i]);
        }

        out.push(formatArray[i]);
        out.push(array[i]);
    }
    return out.join('');
};


Filter.prototype.start = function(from, to) {
    this.from = from;
    this.to = to;
    this.arrayFrom = this.stringToArray(from);
    this.validateArrayLength(this.arrayFrom.length, from, 'arrayFrom');
    var arrayTo;
    // interpolated end value
    if(to instanceof Array) {
        arrayTo = [];
        // create a local copy of the Array with the start value at the front
        to = [from].concat(to);
        var len = to.length,
            i;

        for(i = 0; i < len; i++) {
            var arrItem = this.stringToArray(to[i]);
            this.validateArrayLength(arrItem.length, to[i], 'arrayTo');
            arrayTo[i] = arrItem;
        }
        this.arrayToIndexedInterpolated = this.getIndexedInterpolationData(arrayTo);
    }
    // assume string
    else {
        arrayTo = this.stringToArray(to);
        this.validateArrayLength(arrayTo.length, to, 'arrayTo');
    }
    this.arrayTo = arrayTo;
};

// indexed interpolation data
/**
            ex: [rbga(1,2,3,1), rgba(10,20,30,1), rgba(15,25,35,1)]

            output: interpolatedArrayData = [
                [1, 10, 15, 1],
                [2, 20, 25, 1],
                [3, 30, 35, 1]
            ]

**/
Filter.prototype.getIndexedInterpolationData = function(toArray) {
    var interpolatedArrayData = [],
        ilen = toArray.length,
        i, j;

    for(i = 0; i < ilen; i++) {
        var interpolationStep = toArray[i],
            jLen = interpolationStep.length;

        for(j = 0; j < jLen; j++) {
            if(typeof interpolatedArrayData[j] === 'undefined') {
                interpolatedArrayData[j] = [];
            }
            interpolatedArrayData[j].push(interpolationStep[j]);
        }
    }

    return interpolatedArrayData;
};

Filter.prototype.getUpdatedValue = function(easedProgress, interpolation) {
    var end = this.arrayTo,
        newInterpolatedArray = [],
        out, i, len;

    //check if interpolated array
    if(end[0] instanceof Array) {
        var interpolatedArray = this.arrayToIndexedInterpolated;
        /**
        convert from
            interpolatedArray = [
                [1, 10, 15],
                [2, 20, 25],
                [3, 30, 35]
            ]
            to interpolated array
            [1.5, 2.5, 3.5, 1]
        **/
        len = interpolatedArray.length;
        for(i = 0; i < len; i++) {


            newInterpolatedArray[i] = interpolation(interpolatedArray[i], easedProgress);
        }
        out = this.arrayToString(newInterpolatedArray);
        return out;
    }

    var endArr = [];

    len = end.length;
    for(i = 0; i < len; i++) {
        var startVal = this.arrayFrom[i],
            endVal = end[i];
        endArr.push(startVal + (endVal - startVal) * easedProgress);
    }
    out = this.arrayToString(endArr);
    return out;
};

var filter$1 = Filter;

var Queue = function(tweens) {
    this.tweens = tweens || [];
    this.window = false;
};
Queue.prototype.window = null;
Queue.prototype.tweens = null;

Queue.prototype.add = function(tween) {
    this.tweens.push(tween);
    return this;
};

Queue.prototype.remove = function(tween) {
    var i = this.tweens.indexOf(tween);
    if(i !== -1) {
        this.tweens.splice(i, 1);
    }
    return this;
};

Queue.prototype.update = function(time) {
    if(this.tweens.length === 0) {
        return false;
    }
    var i = 0;
    if(time === undefined) {
        // allows for unit testing
        var window = this.window || window;

        if(
            typeof window !== 'undefined' &&
            typeof window.performance !== 'undefined' &&
            typeof window.performance.now !== 'undefined'
        ) {
            time = window.performance.now();
        } else {
            time = Date.now();
        }
    }
    while(i < this.tweens.length) {
        var tween = this.tweens[i],
            update = tween.update(time);
        if(tween.remove || !update) {
            this.tweens.splice(i, 1);
            // if end of tween without removing manually
            if(!tween.remove && tween.chained){
                var len = tween.chained.length;
                for (i = 0; i < len; i++) {
                    var chainedTween = tween.chained[i];
                    // add and start any chained tweens
                    this.add(chainedTween);
                    chainedTween.start(time);
                }
            }
        } else {
            i++;
        }
    }
    return true;
};

Queue.prototype.start = function(time) {
    for(var i = this.tweens.length - 1; i >= 0; i--) {
        this.tweens[i].start(time);
    }
    return this;
};

var queue = Queue;

var tweeno = {
    Tween: tween,
    Filter: filter$1,
    Queue: queue,
    Interpolation: interpolation,
    Easing: easing
};

function convertToNumber(data) {
    if (Number(data)) {
        return Number(data);
    }
    else {
        return data;
    }
}
async function lookForComponent(template) {
    // FIXME: Need to take notify out because causes error in params
    // Import component first?
    // If fails, then look for it by id? What if same id is confused with local component?
    // Needs to know if component is remote?
    var component;
    // We pass in the key, to be doubly sure it's the correct component
    var localComponent = getComponentByIdAndKey(template.component.id, template.component.key);
    // var localComponent = getComponentByKey(template.component.key)
    try {
        // If can find the component, and it's key is the same as the templates this assumes the node is in the file it originated from?
        // TRY: Another way could be to just check that the component is a template component? Maybe still not reliable. Maybe need to check file details with the file it's in.
        // if (localComponent && localComponent.key === template.component.key) {
        if (localComponent) {
            component = localComponent;
        }
        else {
            throw 'error';
        }
    }
    catch (_a) {
        try {
            component = await figma.importComponentByKeyAsync(template.component.key);
        }
        catch (e) {
            if (e.startsWith('Could not find a published component with the key')) {
                console.log('Template: ', template);
                try {
                    figma.notify('Check component is published', { error: true });
                }
                catch (e) {
                    console.log(e);
                }
            }
        }
    }
    return component;
}
function isEmpty$1(obj) {
    for (var prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            return false;
        }
    }
    return JSON.stringify(obj) === JSON.stringify({});
}
function getComponentByIdAndKey(id, key) {
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
    if (node && node.type === 'COMPONENT') {
        if (node) {
            if (node.parent === null || node.parent.parent === null) {
                return false;
            }
            else if (node.key === key) {
                return node;
            }
        }
        else {
            return null;
        }
    }
}
function getComponentById(id) {
    var node = figma.getNodeById(id);
    if (node) {
        if (node.type === 'COMPONENT') {
            if (node.parent === null || node.parent.parent === null) {
                return false;
            }
            else {
                return node;
            }
        }
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
function move(array, from, to, replaceWith) {
    // Remove from array
    let element = array.splice(from, 1)[0];
    // Add to array
    if (replaceWith) {
        array.splice(to, 0, replaceWith);
    }
    else {
        array.splice(to, 0, element);
    }
    return array;
}
function daysToMilliseconds(days) {
    // 👇️        hour  min  sec  ms
    return days * 24 * 60 * 60 * 1000;
}
function upsert(array, cb, entry) {
    array.some((item, index) => {
        let result = false;
        if (true === cb(array[index])) {
            result = true;
            // move to top
            if (entry) {
                move(array, index, 0, entry);
            }
            else {
                move(array, index, 0);
            }
        }
        return result;
    });
    let matchFound = false;
    array.map((item, index) => {
        if (true === cb(array[index])) {
            matchFound = true;
        }
    });
    if (!matchFound) {
        array.unshift(entry);
    }
    return array;
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
        easing: easing || tweeno.Easing.Cubic.Out,
    };
    var target = Object.assign(Object.assign({}, origCoords), { update: function () {
            figma.viewport.center = { x: this.x, y: this.y };
            figma.viewport.zoom = this.z;
            // console.log(Math.round(this.x), Math.round(this.y))
        } });
    var queue = new tweeno.Queue(), tween = new tweeno.Tween(target, settings);
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
function positionInCenterOfViewport(node) {
    node.x = figma.viewport.center.x - node.width / 2;
    node.y = figma.viewport.center.y - node.height / 2;
}
// Swaps auto layout axis
function swapAxises(node) {
    let primary = node.primaryAxisSizingMode;
    let counter = node.counterAxisSizingMode;
    node.primaryAxisSizingMode = counter;
    node.counterAxisSizingMode = primary;
    return node;
}
function genRandomId() {
    var randPassword = Array(10)
        .fill('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
        .map(function (x) {
        return x[Math.floor(Math.random() * x.length)];
    })
        .join('');
    return randPassword;
}
// TODO: Replace with more rebost clone function
function clone$1(val) {
    return JSON.parse(JSON.stringify(val));
}
function getTemplateParts$1(templateNode) {
    // find nodes with certain pluginData
    let elements = ['tr', 'td', 'th', 'table'];
    let results = {};
    // Loop though element definitions and find them in the template
    for (let i = 0; i < elements.length; i++) {
        let elementName = elements[i];
        let part = templateNode.findOne((node) => {
            let elementSemantics = getPluginData_1(node, 'elementSemantics');
            if ((elementSemantics === null || elementSemantics === void 0 ? void 0 : elementSemantics.is) === elementName) {
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
function removeChildren(node) {
    let length = node.children.length;
    for (let i = length - 1; i >= 0; i--) {
        node.children[i].remove();
    }
}
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
        'clipsContent',
        // --
        'layoutMode',
        'strokeTopWeight',
        'strokeBottomWeight',
        'strokeRightWeight',
        'strokeLeftWeight',
    ];
    if (options.include) {
        options.include = options.include.concat(styleProps);
    }
    else {
        options.include = styleProps;
    }
    return copyPaste_1(source, target, options);
}
async function changeText(node, text, weight) {
    // if (node.characters) {
    if (node.fontName === figma.mixed) {
        await figma.loadFontAsync(node.getRangeFontName(0, 1));
    }
    else {
        await figma.loadFontAsync({
            family: node.fontName.family,
            style: weight || node.fontName.style,
        });
    }
    if (weight) {
        node.fontName = {
            family: node.fontName.family,
            style: weight,
        };
    }
    if (text) {
        node.characters = text;
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
async function overrideChildrenChars2(sourceChildren, targetChildren, sourceComponentChildren, targetComponentChildren) {
    for (let a = 0; a < sourceChildren.length; a++) {
        if (sourceComponentChildren[a] && targetComponentChildren[a]) {
            if (sourceComponentChildren[a].name === targetComponentChildren[a].name) {
                targetChildren[a].name = sourceChildren[a].name;
                targetChildren[a].visible = sourceChildren[a].visible;
                if (targetChildren[a].type === 'INSTANCE') {
                    targetChildren[a].swapComponent(sourceChildren[a].mainComponent);
                }
                // targetChildren[a].resize(sourceChildren[a].width, sourceChildren[a].height)
            }
            // If layer has children then run function again
            if (targetChildren[a].children && sourceChildren[a].children) {
                await overrideChildrenChars2(sourceChildren[a].children, targetChildren[a].children, sourceComponentChildren[a].children, targetComponentChildren[a].children);
            }
            // If layer is a text node then check if the main components share the same name
            else if (sourceChildren[a].type === 'TEXT') {
                // if (sourceChildren[a].name === targetChildren[b].name) {
                await changeText(targetChildren[a], sourceChildren[a].characters, sourceChildren[a].fontName.style);
            }
        }
    }
}
async function swapInstance(target, source) {
    // await overrideChildrenChars(source.mainComponent.children, source.mainComponent.children, source.children, target.children)
    // replace(newTableCell, oldTableCell.clone())
    // target.swapComponent(source.mainComponent)
    if (target && source) {
        await overrideChildrenChars2(target.children, source.children, target.mainComponent.children, source.mainComponent.children);
    }
}

function isTheme(color) {
    /*
    From this W3C document: http://www.webmasterworld.com/r.cgi?f=88&d=9769&url=http://www.w3.org/TR/AERT#color-contrast
    Color brightness is determined by the following formula:
    ((Red value X 299) + (Green value X 587) + (Blue value X 114)) / 1000
    */
    var threshold = 160; /* about half of 256. Lower threshold equals more dark text on dark background  */
    var cBrightness = (color.r * 255 * 299 + color.g * 255 * 587 + color.b * 255 * 114) / 1000;
    if (cBrightness > threshold || figma.editorType === 'figjam') {
        return 'light';
    }
    else {
        return 'dark';
    }
}
async function createTooltip(text, color) {
    let theme = 'light';
    if (isTheme(color || figma.currentPage.backgrounds[0].color) === 'dark') {
        theme = 'dark';
    }
    // Load FONTS
    async function loadFonts() {
        await Promise.all([
            figma.loadFontAsync({
                family: 'Inter',
                style: 'Regular',
            }),
        ]);
    }
    await loadFonts();
    // Create COMPONENT
    var component_305_199 = figma.createComponent();
    component_305_199.resize(457.0, 53.0);
    component_305_199.counterAxisSizingMode = 'AUTO';
    component_305_199.name = '.Tooltip';
    component_305_199.relativeTransform = [
        [1, 0, 13222],
        [0, 1, 7008],
    ];
    component_305_199.x = 13222;
    component_305_199.y = 7008;
    component_305_199.fills = [];
    component_305_199.cornerRadius = 8;
    component_305_199.primaryAxisSizingMode = 'FIXED';
    component_305_199.strokeTopWeight = 1;
    component_305_199.strokeBottomWeight = 1;
    component_305_199.strokeLeftWeight = 1;
    component_305_199.strokeRightWeight = 1;
    component_305_199.backgrounds = [];
    component_305_199.expanded = false;
    component_305_199.layoutMode = 'HORIZONTAL';
    component_305_199.counterAxisSizingMode = 'AUTO';
    // Create FRAME
    var frame_305_200 = figma.createFrame();
    component_305_199.appendChild(frame_305_200);
    frame_305_200.resize(457.0, 53.0);
    frame_305_200.primaryAxisSizingMode = 'AUTO';
    frame_305_200.name = 'Artwork';
    frame_305_200.layoutPositioning = 'ABSOLUTE';
    frame_305_200.fills = [];
    frame_305_200.strokeTopWeight = 1;
    frame_305_200.strokeBottomWeight = 1;
    frame_305_200.strokeLeftWeight = 1;
    frame_305_200.strokeRightWeight = 1;
    frame_305_200.backgrounds = [];
    frame_305_200.clipsContent = false;
    frame_305_200.expanded = false;
    frame_305_200.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
    // Create RECTANGLE
    var rectangle_305_201 = figma.createRectangle();
    frame_305_200.appendChild(rectangle_305_201);
    rectangle_305_201.resize(15.5563220978, 15.5563220978);
    rectangle_305_201.name = 'Rectangle 1';
    rectangle_305_201.fills = [{ type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }];
    rectangle_305_201.fills = [{ type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }];
    rectangle_305_201.relativeTransform = [
        [0.7071068287, -0.7071068287, 0],
        [0.7071068287, 0.7071068287, 16],
    ];
    rectangle_305_201.y = 16;
    rectangle_305_201.rotation = -45;
    rectangle_305_201.constrainProportions = true;
    rectangle_305_201.strokeTopWeight = 1;
    rectangle_305_201.strokeBottomWeight = 1;
    rectangle_305_201.strokeLeftWeight = 1;
    rectangle_305_201.strokeRightWeight = 1;
    // Create RECTANGLE
    var rectangle_305_280 = figma.createRectangle();
    frame_305_200.appendChild(rectangle_305_280);
    rectangle_305_280.resize(457.0, 53.0);
    rectangle_305_280.name = 'Rectangle 2';
    rectangle_305_280.fills = [{ type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }];
    rectangle_305_280.constraints = { horizontal: 'MIN', vertical: 'STRETCH' };
    rectangle_305_280.cornerRadius = 8;
    rectangle_305_280.strokeTopWeight = 1;
    rectangle_305_280.strokeBottomWeight = 1;
    rectangle_305_280.strokeLeftWeight = 1;
    rectangle_305_280.strokeRightWeight = 1;
    // Create BOOLEAN_OPERATION
    var booleanOperation_305_620 = figma.union([rectangle_305_201, rectangle_305_280], frame_305_200);
    booleanOperation_305_620.name = 'Union';
    booleanOperation_305_620.visible = true;
    booleanOperation_305_620.locked = false;
    booleanOperation_305_620.opacity = 1;
    booleanOperation_305_620.blendMode = 'PASS_THROUGH';
    booleanOperation_305_620.isMask = false;
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
    ];
    booleanOperation_305_620.fills = [{ type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }];
    booleanOperation_305_620.strokes = [
        { type: 'SOLID', visible: true, opacity: 0.10000000149011612, blendMode: 'NORMAL', color: { r: 0, g: 0, b: 0 } },
    ];
    booleanOperation_305_620.strokeWeight = 1;
    booleanOperation_305_620.strokeAlign = 'INSIDE';
    booleanOperation_305_620.strokeJoin = 'MITER';
    booleanOperation_305_620.dashPattern = [];
    booleanOperation_305_620.strokeCap = 'NONE';
    booleanOperation_305_620.strokeMiterLimit = 4;
    booleanOperation_305_620.layoutAlign = 'INHERIT';
    booleanOperation_305_620.constrainProportions = false;
    booleanOperation_305_620.layoutGrow = 0;
    booleanOperation_305_620.layoutPositioning = 'AUTO';
    booleanOperation_305_620.exportSettings = [];
    booleanOperation_305_620.cornerRadius = 0;
    booleanOperation_305_620.cornerSmoothing = 0;
    booleanOperation_305_620.expanded = false;
    booleanOperation_305_620.reactions = [];
    // Create TEXT
    var text_305_202 = figma.createText();
    component_305_199.appendChild(text_305_202);
    text_305_202.resize(417.0, 21.0);
    text_305_202.name =
        "Only layer styles such as: background, color, border radius etc will be used to create tables. You don't have to create tables using the plugin. You can also create tables by creating an instance of this component and detaching them and their rows. If you change the styles used on the table or row components you can update existing tables by going to Plugins > Table Creator > Settings and select Refresh Tables";
    text_305_202.relativeTransform = [
        [1, 0, 20],
        [0, 1, 16],
    ];
    text_305_202.x = 20;
    text_305_202.y = 16;
    text_305_202.layoutGrow = 1;
    text_305_202.autoRename = false;
    // Font properties
    text_305_202.listSpacing = 0;
    text_305_202.characters = 'Text';
    text_305_202.fontSize = 14;
    text_305_202.lineHeight = { unit: 'PERCENT', value: 150 };
    text_305_202.fontName = { family: 'Inter', style: 'Regular' };
    text_305_202.textAutoResize = 'HEIGHT';
    component_305_199.remove();
    // Create INSTANCE
    var instance_305_196 = component_305_199.createInstance();
    figma.currentPage.appendChild(instance_305_196);
    instance_305_196.relativeTransform = [
        [1, 0, 13222],
        [0, 1, 7163],
    ];
    instance_305_196.y = 7163;
    // Swap COMPONENT
    instance_305_196.swapComponent(component_305_199);
    // Ref to SUB NODE
    var frame_I305_196_305_200 = figma.getNodeById('I' + instance_305_196.id + ';' + frame_305_200.id);
    frame_I305_196_305_200.resize(457.0, 116.0);
    frame_I305_196_305_200.primaryAxisSizingMode = 'AUTO';
    // Ref to SUB NODE
    var booleanOperation_I305_196_305_620 = figma.getNodeById('I' + instance_305_196.id + ';' + booleanOperation_305_620.id);
    // Ref to SUB NODE
    figma.getNodeById('I' + instance_305_196.id + ';' + rectangle_305_201.id);
    // Ref to SUB NODE
    var rectangle_I305_196_305_280 = figma.getNodeById('I' + instance_305_196.id + ';' + rectangle_305_280.id);
    rectangle_I305_196_305_280.resize(457.0, 116.0);
    // Ref to SUB NODE
    var text_I305_196_305_202 = figma.getNodeById('I' + instance_305_196.id + ';' + text_305_202.id);
    text_I305_196_305_202.resize(417.0, 84.0);
    text_I305_196_305_202.characters = text;
    // Add padding at the end
    component_305_199.paddingLeft = 20;
    component_305_199.paddingRight = 20;
    component_305_199.paddingTop = 16;
    component_305_199.paddingBottom = 16;
    if (theme === 'dark') {
        text_I305_196_305_202.fills = [{ type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }];
        booleanOperation_I305_196_305_620.fills = [
            {
                type: 'SOLID',
                visible: true,
                opacity: 1,
                blendMode: 'NORMAL',
                color: { r: 0.21250000596046448, g: 0.21250000596046448, b: 0.21250000596046448 },
            },
        ];
        booleanOperation_I305_196_305_620.strokes = [
            { type: 'SOLID', visible: true, opacity: 0.10000000149011612, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } },
        ];
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
        ];
    }
    return instance_305_196;
}
async function createTemplateComponents() {
    let theme = 'light';
    if (isTheme(figma.currentPage.backgrounds[0].color) === 'dark') {
        theme = 'dark';
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
        ]);
    }
    await loadFonts();
    // Create COMPONENT
    var component_305_178 = figma.createComponent();
    component_305_178.resize(120.0, 35.0);
    component_305_178.name = 'Type=Default';
    component_305_178.relativeTransform = [
        [1, 0, 16],
        [0, 1, 16],
    ];
    component_305_178.x = 16;
    component_305_178.y = 16;
    component_305_178.layoutAlign = 'STRETCH';
    component_305_178.fills = [{ type: 'SOLID', visible: true, opacity: 0.0020000000949949026, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }];
    if (theme === 'dark') {
        component_305_178.strokes = [
            {
                type: 'SOLID',
                visible: true,
                opacity: 1,
                blendMode: 'NORMAL',
                color: { r: 0.3583333194255829, g: 0.3583333194255829, b: 0.3583333194255829 },
            },
        ];
    }
    else {
        component_305_178.strokes = [
            {
                type: 'SOLID',
                visible: true,
                opacity: 1,
                blendMode: 'NORMAL',
                color: { r: 0.7254902124404907, g: 0.7254902124404907, b: 0.7254902124404907 },
            },
        ];
    }
    component_305_178.primaryAxisSizingMode = 'FIXED';
    component_305_178.strokeTopWeight = 1;
    component_305_178.strokeBottomWeight = 0;
    component_305_178.strokeLeftWeight = 1;
    component_305_178.strokeRightWeight = 0;
    component_305_178.backgrounds = [
        { type: 'SOLID', visible: true, opacity: 0.0020000000949949026, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } },
    ];
    component_305_178.expanded = false;
    component_305_178.layoutMode = 'VERTICAL';
    // Create FRAME
    var frame_305_179 = figma.createFrame();
    component_305_178.appendChild(frame_305_179);
    frame_305_179.resize(120.0, 35.0);
    frame_305_179.counterAxisSizingMode = 'AUTO';
    frame_305_179.primaryAxisSizingMode = 'FIXED';
    frame_305_179.name = 'Content';
    frame_305_179.layoutAlign = 'STRETCH';
    frame_305_179.fills = [];
    frame_305_179.paddingLeft = 12;
    frame_305_179.paddingRight = 12;
    frame_305_179.paddingTop = 10;
    frame_305_179.paddingBottom = 10;
    frame_305_179.strokeTopWeight = 1;
    frame_305_179.strokeBottomWeight = 1;
    frame_305_179.strokeLeftWeight = 1;
    frame_305_179.strokeRightWeight = 1;
    frame_305_179.backgrounds = [];
    frame_305_179.expanded = false;
    frame_305_179.layoutMode = 'HORIZONTAL';
    // Create TEXT
    var text_305_180 = figma.createText();
    frame_305_179.appendChild(text_305_180);
    text_305_180.resize(96.0, 15.0);
    text_305_180.relativeTransform = [
        [1, 0, 12],
        [0, 1, 10],
    ];
    text_305_180.x = 12;
    text_305_180.y = 10;
    // text_305_180.layoutAlign = 'STRETCH'
    text_305_180.layoutGrow = 1;
    // Font properties
    text_305_180.fontName = {
        family: 'Inter',
        style: 'Regular',
    };
    text_305_180.listSpacing = 0;
    text_305_180.characters = '';
    text_305_180.lineHeight = { unit: 'PERCENT', value: 130 };
    text_305_180.fontName = { family: 'Inter', style: 'Regular' };
    text_305_180.textAutoResize = 'HEIGHT';
    if (theme === 'dark') {
        text_305_180.fills = [{ type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }];
    }
    // Create COMPONENT
    var component_305_181 = figma.createComponent();
    component_305_181.resize(120.0, 35.0);
    component_305_181.name = 'Type=Header';
    component_305_181.relativeTransform = [
        [1, 0, 136],
        [0, 1, 16],
    ];
    component_305_181.x = 136;
    component_305_181.y = 16;
    component_305_181.layoutAlign = 'STRETCH';
    if (theme === 'dark') {
        component_305_181.fills = [{ type: 'SOLID', visible: true, opacity: 0.05, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }];
        component_305_181.strokes = [
            {
                type: 'SOLID',
                visible: true,
                opacity: 1,
                blendMode: 'NORMAL',
                color: { r: 0.3583333194255829, g: 0.3583333194255829, b: 0.3583333194255829 },
            },
        ];
    }
    else {
        component_305_181.fills = [{ type: 'SOLID', visible: true, opacity: 0.05999999865889549, blendMode: 'NORMAL', color: { r: 0, g: 0, b: 0 } }];
        component_305_181.strokes = [
            {
                type: 'SOLID',
                visible: true,
                opacity: 1,
                blendMode: 'NORMAL',
                color: { r: 0.7254902124404907, g: 0.7254902124404907, b: 0.7254902124404907 },
            },
        ];
    }
    component_305_181.primaryAxisSizingMode = 'FIXED';
    component_305_181.strokeTopWeight = 1;
    component_305_181.strokeBottomWeight = 0;
    component_305_181.strokeLeftWeight = 1;
    component_305_181.strokeRightWeight = 0;
    component_305_181.expanded = false;
    component_305_181.layoutMode = 'VERTICAL';
    // Create FRAME
    var frame_305_182 = figma.createFrame();
    component_305_181.appendChild(frame_305_182);
    frame_305_182.resize(120.0, 35.0);
    frame_305_182.counterAxisSizingMode = 'AUTO';
    frame_305_182.primaryAxisSizingMode = 'FIXED';
    frame_305_182.name = 'Content';
    frame_305_182.layoutAlign = 'STRETCH';
    frame_305_182.fills = [];
    frame_305_182.paddingLeft = 12;
    frame_305_182.paddingRight = 12;
    frame_305_182.paddingTop = 10;
    frame_305_182.paddingBottom = 10;
    frame_305_182.strokeTopWeight = 1;
    frame_305_182.strokeBottomWeight = 1;
    frame_305_182.strokeLeftWeight = 1;
    frame_305_182.strokeRightWeight = 1;
    frame_305_182.backgrounds = [];
    frame_305_182.expanded = false;
    frame_305_182.layoutMode = 'HORIZONTAL';
    // Create TEXT
    var text_305_183 = figma.createText();
    frame_305_182.appendChild(text_305_183);
    text_305_183.resize(96.0, 15.0);
    text_305_183.relativeTransform = [
        [1, 0, 12],
        [0, 1, 10],
    ];
    text_305_183.x = 12;
    text_305_183.y = 10;
    text_305_183.layoutGrow = 1;
    // text_305_183.layoutAlign = 'STRETCH'
    // Font properties
    text_305_183.fontName = {
        family: 'Inter',
        style: 'Semi Bold',
    };
    text_305_183.listSpacing = 0;
    text_305_183.characters = '';
    text_305_183.lineHeight = { unit: 'PERCENT', value: 130 };
    text_305_183.fontName = { family: 'Inter', style: 'Semi Bold' };
    text_305_183.textAutoResize = 'HEIGHT';
    if (theme === 'dark') {
        text_305_183.fills = [{ type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }];
    }
    // >>>>>>>>>>>>>>>>> Cells
    // Create COMPONENT_SET
    var componentSet_305_177 = figma.combineAsVariants([component_305_178, component_305_181], figma.currentPage);
    componentSet_305_177.resize(272.0, 67.0);
    componentSet_305_177.primaryAxisSizingMode = 'AUTO';
    componentSet_305_177.counterAxisSizingMode = 'AUTO';
    componentSet_305_177.name = 'Cell';
    componentSet_305_177.visible = true;
    componentSet_305_177.locked = false;
    componentSet_305_177.opacity = 1;
    componentSet_305_177.blendMode = 'PASS_THROUGH';
    componentSet_305_177.isMask = false;
    componentSet_305_177.effects = [];
    componentSet_305_177.relativeTransform = [
        [1, 0, 11673],
        [0, 1, 7538],
    ];
    componentSet_305_177.x = 11673;
    componentSet_305_177.y = 7538;
    componentSet_305_177.rotation = 0;
    componentSet_305_177.layoutAlign = 'INHERIT';
    componentSet_305_177.constrainProportions = false;
    componentSet_305_177.layoutGrow = 0;
    componentSet_305_177.layoutPositioning = 'AUTO';
    componentSet_305_177.exportSettings = [];
    componentSet_305_177.fills = [];
    componentSet_305_177.strokes = [
        {
            type: 'SOLID',
            visible: true,
            opacity: 1,
            blendMode: 'NORMAL',
            color: { r: 0.7254902124404907, g: 0.7254902124404907, b: 0.7254902124404907 },
        },
    ];
    componentSet_305_177.strokeWeight = 1;
    componentSet_305_177.strokeAlign = 'INSIDE';
    componentSet_305_177.strokeJoin = 'MITER';
    componentSet_305_177.dashPattern = [10, 5];
    componentSet_305_177.strokeCap = 'NONE';
    componentSet_305_177.strokeMiterLimit = 4;
    componentSet_305_177.cornerRadius = 5;
    componentSet_305_177.cornerSmoothing = 0;
    componentSet_305_177.paddingLeft = 16;
    componentSet_305_177.paddingRight = 16;
    componentSet_305_177.paddingTop = 16;
    componentSet_305_177.paddingBottom = 16;
    componentSet_305_177.primaryAxisAlignItems = 'MIN';
    componentSet_305_177.counterAxisAlignItems = 'MIN';
    componentSet_305_177.primaryAxisSizingMode = 'AUTO';
    componentSet_305_177.strokeTopWeight = 1;
    componentSet_305_177.strokeBottomWeight = 1;
    componentSet_305_177.strokeLeftWeight = 1;
    componentSet_305_177.strokeRightWeight = 1;
    componentSet_305_177.layoutGrids = [];
    componentSet_305_177.backgrounds = [];
    componentSet_305_177.clipsContent = true;
    componentSet_305_177.guides = [];
    componentSet_305_177.expanded = false;
    componentSet_305_177.constraints = { horizontal: 'MIN', vertical: 'MIN' };
    componentSet_305_177.layoutMode = 'HORIZONTAL';
    componentSet_305_177.counterAxisSizingMode = 'AUTO';
    componentSet_305_177.itemSpacing = 0;
    componentSet_305_177.overflowDirection = 'NONE';
    componentSet_305_177.numberOfFixedChildren = 0;
    componentSet_305_177.itemReverseZIndex = false;
    componentSet_305_177.strokesIncludedInLayout = false;
    componentSet_305_177.description = '';
    componentSet_305_177.documentationLinks = [];
    // >>>>>>>>>>>>>>>>> Row
    // Create COMPONENT
    var component_305_184 = figma.createComponent();
    figma.currentPage.appendChild(component_305_184);
    component_305_184.resize(240.0, 35.0);
    component_305_184.primaryAxisSizingMode = 'AUTO';
    component_305_184.counterAxisSizingMode = 'AUTO';
    component_305_184.name = 'Row';
    component_305_184.relativeTransform = [
        [1, 0, 11689],
        [0, 1, 7399],
    ];
    component_305_184.x = 11689;
    component_305_184.y = 7399;
    component_305_184.fills = [{ type: 'SOLID', visible: true, opacity: 0.00009999999747378752, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }];
    component_305_184.strokeTopWeight = 1;
    component_305_184.strokeBottomWeight = 1;
    component_305_184.strokeLeftWeight = 1;
    component_305_184.strokeRightWeight = 1;
    component_305_184.backgrounds = [
        { type: 'SOLID', visible: true, opacity: 0.00009999999747378752, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } },
    ];
    component_305_184.clipsContent = true;
    component_305_184.expanded = false;
    component_305_184.layoutMode = 'HORIZONTAL';
    component_305_184.counterAxisSizingMode = 'AUTO';
    component_305_184.layoutAlign = 'STRETCH';
    component_305_184.primaryAxisSizingMode = 'FIXED';
    // Create INSTANCE
    var instance_305_185 = component_305_178.createInstance();
    component_305_184.appendChild(instance_305_185);
    instance_305_185.relativeTransform = [
        [1, 0, 0],
        [0, 1, 0],
    ];
    instance_305_185.layoutAlign = 'STRETCH';
    // Swap COMPONENT
    instance_305_185.swapComponent(component_305_178);
    // Ref to SUB NODE
    figma.getNodeById('I' + instance_305_185.id + ';' + frame_305_179.id);
    // Ref to SUB NODE
    figma.getNodeById('I' + instance_305_185.id + ';' + text_305_180.id);
    // Create INSTANCE
    var instance_305_186 = component_305_178.createInstance();
    component_305_184.appendChild(instance_305_186);
    instance_305_186.relativeTransform = [
        [1, 0, 120],
        [0, 1, 0],
    ];
    instance_305_186.x = 120;
    instance_305_186.layoutAlign = 'STRETCH';
    // Swap COMPONENT
    instance_305_186.swapComponent(component_305_178);
    // Ref to SUB NODE
    figma.getNodeById('I' + instance_305_186.id + ';' + frame_305_179.id);
    // Ref to SUB NODE
    figma.getNodeById('I' + instance_305_186.id + ';' + text_305_180.id);
    // >>>>>>>>>>>>>>>>> Template
    // Create COMPONENT
    var component_305_187 = figma.createComponent();
    figma.currentPage.appendChild(component_305_187);
    component_305_187.resize(240.0, 105.0);
    component_305_187.primaryAxisSizingMode = 'AUTO';
    component_305_187.counterAxisSizingMode = 'AUTO';
    component_305_187.name = 'Table 1';
    // component_305_187.effects = [
    // 	{
    // 		type: 'DROP_SHADOW',
    // 		color: { r: 0, g: 0, b: 0, a: 0.10000000149011612 },
    // 		offset: { x: 0, y: 2 },
    // 		radius: 6,
    // 		spread: 0,
    // 		visible: true,
    // 		blendMode: 'NORMAL',
    // 		showShadowBehindNode: false,
    // 	},
    // ]
    component_305_187.relativeTransform = [
        [1, 0, 11689],
        [0, 1, 7174],
    ];
    component_305_187.x = 11689;
    component_305_187.y = 7174;
    if (theme === 'dark') {
        component_305_187.fills = [
            {
                type: 'SOLID',
                visible: true,
                opacity: 1,
                blendMode: 'NORMAL',
                color: { r: 0.21250000596046448, g: 0.21250000596046448, b: 0.21250000596046448 },
            },
        ];
        component_305_187.strokes = [
            {
                type: 'SOLID',
                visible: true,
                opacity: 1,
                blendMode: 'NORMAL',
                color: { r: 0.3583333194255829, g: 0.3583333194255829, b: 0.3583333194255829 },
            },
        ];
    }
    else {
        component_305_187.fills = [{ type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r: 1, g: 1, b: 1 } }];
        component_305_187.strokes = [
            {
                type: 'SOLID',
                visible: true,
                opacity: 1,
                blendMode: 'NORMAL',
                color: { r: 0.7254902124404907, g: 0.7254902124404907, b: 0.7254902124404907 },
            },
        ];
    }
    component_305_187.cornerRadius = 4;
    component_305_187.strokeTopWeight = 1;
    component_305_187.strokeBottomWeight = 1;
    component_305_187.strokeLeftWeight = 1;
    component_305_187.strokeRightWeight = 1;
    component_305_187.clipsContent = true;
    component_305_187.expanded = false;
    component_305_187.layoutMode = 'VERTICAL';
    component_305_187.counterAxisSizingMode = 'AUTO';
    // Create INSTANCE
    var instance_305_188 = component_305_184.createInstance();
    component_305_187.appendChild(instance_305_188);
    instance_305_188.relativeTransform = [
        [1, 0, 0],
        [0, 1, 0],
    ];
    instance_305_188.layoutAlign = 'STRETCH';
    instance_305_188.primaryAxisSizingMode = 'FIXED';
    // Swap COMPONENT
    instance_305_188.swapComponent(component_305_184);
    // Ref to SUB NODE
    var instance_I305_188_305_185 = figma.getNodeById('I' + instance_305_188.id + ';' + instance_305_185.id);
    instance_I305_188_305_185.fills = [
        { type: 'SOLID', visible: true, opacity: 0.05999999865889549, blendMode: 'NORMAL', color: { r: 0, g: 0, b: 0 } },
    ];
    instance_I305_188_305_185.backgrounds = [
        { type: 'SOLID', visible: true, opacity: 0.05999999865889549, blendMode: 'NORMAL', color: { r: 0, g: 0, b: 0 } },
    ];
    // Swap COMPONENT
    instance_I305_188_305_185.swapComponent(component_305_181);
    // Ref to SUB NODE
    figma.getNodeById(instance_I305_188_305_185.id + ';' + frame_305_182.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I305_188_305_185.id + ';' + text_305_183.id);
    // Ref to SUB NODE
    var instance_I305_188_305_186 = figma.getNodeById('I' + instance_305_188.id + ';' + instance_305_186.id);
    instance_I305_188_305_186.fills = [
        { type: 'SOLID', visible: true, opacity: 0.05999999865889549, blendMode: 'NORMAL', color: { r: 0, g: 0, b: 0 } },
    ];
    instance_I305_188_305_186.backgrounds = [
        { type: 'SOLID', visible: true, opacity: 0.05999999865889549, blendMode: 'NORMAL', color: { r: 0, g: 0, b: 0 } },
    ];
    // Swap COMPONENT
    instance_I305_188_305_186.swapComponent(component_305_181);
    // Ref to SUB NODE
    figma.getNodeById(instance_I305_188_305_186.id + ';' + frame_305_182.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I305_188_305_186.id + ';' + text_305_183.id);
    // Create INSTANCE
    var instance_305_189 = component_305_184.createInstance();
    component_305_187.appendChild(instance_305_189);
    instance_305_189.relativeTransform = [
        [1, 0, 0],
        [0, 1, 35],
    ];
    instance_305_189.y = 35;
    instance_305_189.layoutAlign = 'STRETCH';
    instance_305_189.primaryAxisSizingMode = 'FIXED';
    // Swap COMPONENT
    instance_305_189.swapComponent(component_305_184);
    // Ref to SUB NODE
    var instance_I305_189_305_185 = figma.getNodeById('I' + instance_305_189.id + ';' + instance_305_185.id);
    // Swap COMPONENT
    instance_I305_189_305_185.swapComponent(component_305_178);
    // Ref to SUB NODE
    figma.getNodeById(instance_I305_189_305_185.id + ';' + frame_305_179.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I305_189_305_185.id + ';' + text_305_180.id);
    // Ref to SUB NODE
    var instance_I305_189_305_186 = figma.getNodeById('I' + instance_305_189.id + ';' + instance_305_186.id);
    // Swap COMPONENT
    instance_I305_189_305_186.swapComponent(component_305_178);
    // Ref to SUB NODE
    figma.getNodeById(instance_I305_189_305_186.id + ';' + frame_305_179.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I305_189_305_186.id + ';' + text_305_180.id);
    // Create INSTANCE
    var instance_305_190 = component_305_184.createInstance();
    component_305_187.appendChild(instance_305_190);
    instance_305_190.relativeTransform = [
        [1, 0, 0],
        [0, 1, 70],
    ];
    instance_305_190.y = 70;
    instance_305_190.layoutAlign = 'STRETCH';
    instance_305_190.primaryAxisSizingMode = 'FIXED';
    // Swap COMPONENT
    instance_305_190.swapComponent(component_305_184);
    // Ref to SUB NODE
    var instance_I305_190_305_185 = figma.getNodeById('I' + instance_305_190.id + ';' + instance_305_185.id);
    // Swap COMPONENT
    instance_I305_190_305_185.swapComponent(component_305_178);
    // Ref to SUB NODE
    figma.getNodeById(instance_I305_190_305_185.id + ';' + frame_305_179.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I305_190_305_185.id + ';' + text_305_180.id);
    // Ref to SUB NODE
    var instance_I305_190_305_186 = figma.getNodeById('I' + instance_305_190.id + ';' + instance_305_186.id);
    // Swap COMPONENT
    instance_I305_190_305_186.swapComponent(component_305_178);
    // Ref to SUB NODE
    figma.getNodeById(instance_I305_190_305_186.id + ';' + frame_305_179.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I305_190_305_186.id + ';' + text_305_180.id);
    setPluginData_1(component_305_187, 'elementSemantics', { is: 'table' });
    setPluginData_1(component_305_184, 'elementSemantics', { is: 'tr' });
    setPluginData_1(component_305_178, 'elementSemantics', { is: 'td' });
    setPluginData_1(component_305_181, 'elementSemantics', { is: 'th' });
    component_305_178.setRelaunchData({ selectColumn: 'Select all cells in column', selectRow: 'Select all cells in row' });
    component_305_181.setRelaunchData({ selectColumn: 'Select all cells in column', selectRow: 'Select all cells in row' });
    return {
        templateComponent: component_305_187,
        rowComponent: component_305_184,
        cellComponentSet: componentSet_305_177,
    };
}

// Current version.
var VERSION = '1.13.4';

// Establish the root object, `window` (`self`) in the browser, `global`
// on the server, or `this` in some virtual machines. We use `self`
// instead of `window` for `WebWorker` support.
var root = (typeof self == 'object' && self.self === self && self) ||
          (typeof global$1 == 'object' && global$1.global === global$1 && global$1) ||
          Function('return this')() ||
          {};

// Save bytes in the minified (but not gzipped) version:
var ArrayProto = Array.prototype, ObjProto = Object.prototype;
var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

// Create quick reference variables for speed access to core prototypes.
var push = ArrayProto.push,
    slice = ArrayProto.slice,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty;

// Modern feature detection.
var supportsArrayBuffer = typeof ArrayBuffer !== 'undefined',
    supportsDataView = typeof DataView !== 'undefined';

// All **ECMAScript 5+** native function implementations that we hope to use
// are declared here.
var nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeCreate = Object.create,
    nativeIsView = supportsArrayBuffer && ArrayBuffer.isView;

// Create references to these builtin functions because we override them.
var _isNaN = isNaN,
    _isFinite = isFinite;

// Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
  'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

// The largest integer that can be represented exactly.
var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

// Some functions take a variable number of arguments, or a few expected
// arguments at the beginning and then a variable number of values to operate
// on. This helper accumulates all remaining arguments past the function’s
// argument length (or an explicit `startIndex`), into an array that becomes
// the last argument. Similar to ES6’s "rest parameter".
function restArguments(func, startIndex) {
  startIndex = startIndex == null ? func.length - 1 : +startIndex;
  return function() {
    var length = Math.max(arguments.length - startIndex, 0),
        rest = Array(length),
        index = 0;
    for (; index < length; index++) {
      rest[index] = arguments[index + startIndex];
    }
    switch (startIndex) {
      case 0: return func.call(this, rest);
      case 1: return func.call(this, arguments[0], rest);
      case 2: return func.call(this, arguments[0], arguments[1], rest);
    }
    var args = Array(startIndex + 1);
    for (index = 0; index < startIndex; index++) {
      args[index] = arguments[index];
    }
    args[startIndex] = rest;
    return func.apply(this, args);
  };
}

// Is a given variable an object?
function isObject(obj) {
  var type = typeof obj;
  return type === 'function' || (type === 'object' && !!obj);
}

// Is a given value equal to null?
function isNull(obj) {
  return obj === null;
}

// Is a given variable undefined?
function isUndefined(obj) {
  return obj === void 0;
}

// Is a given value a boolean?
function isBoolean(obj) {
  return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
}

// Is a given value a DOM element?
function isElement(obj) {
  return !!(obj && obj.nodeType === 1);
}

// Internal function for creating a `toString`-based type tester.
function tagTester(name) {
  var tag = '[object ' + name + ']';
  return function(obj) {
    return toString.call(obj) === tag;
  };
}

var isString = tagTester('String');

var isNumber = tagTester('Number');

var isDate = tagTester('Date');

var isRegExp = tagTester('RegExp');

var isError = tagTester('Error');

var isSymbol = tagTester('Symbol');

var isArrayBuffer = tagTester('ArrayBuffer');

var isFunction = tagTester('Function');

// Optimize `isFunction` if appropriate. Work around some `typeof` bugs in old
// v8, IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
var nodelist = root.document && root.document.childNodes;
if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
  isFunction = function(obj) {
    return typeof obj == 'function' || false;
  };
}

var isFunction$1 = isFunction;

var hasObjectTag = tagTester('Object');

// In IE 10 - Edge 13, `DataView` has string tag `'[object Object]'`.
// In IE 11, the most common among them, this problem also applies to
// `Map`, `WeakMap` and `Set`.
var hasStringTagBug = (
      supportsDataView && hasObjectTag(new DataView(new ArrayBuffer(8)))
    ),
    isIE11 = (typeof Map !== 'undefined' && hasObjectTag(new Map));

var isDataView = tagTester('DataView');

// In IE 10 - Edge 13, we need a different heuristic
// to determine whether an object is a `DataView`.
function ie10IsDataView(obj) {
  return obj != null && isFunction$1(obj.getInt8) && isArrayBuffer(obj.buffer);
}

var isDataView$1 = (hasStringTagBug ? ie10IsDataView : isDataView);

// Is a given value an array?
// Delegates to ECMA5's native `Array.isArray`.
var isArray = nativeIsArray || tagTester('Array');

// Internal function to check whether `key` is an own property name of `obj`.
function has$1(obj, key) {
  return obj != null && hasOwnProperty.call(obj, key);
}

var isArguments = tagTester('Arguments');

// Define a fallback version of the method in browsers (ahem, IE < 9), where
// there isn't any inspectable "Arguments" type.
(function() {
  if (!isArguments(arguments)) {
    isArguments = function(obj) {
      return has$1(obj, 'callee');
    };
  }
}());

var isArguments$1 = isArguments;

// Is a given object a finite number?
function isFinite$1(obj) {
  return !isSymbol(obj) && _isFinite(obj) && !isNaN(parseFloat(obj));
}

// Is the given value `NaN`?
function isNaN$1(obj) {
  return isNumber(obj) && _isNaN(obj);
}

// Predicate-generating function. Often useful outside of Underscore.
function constant(value) {
  return function() {
    return value;
  };
}

// Common internal logic for `isArrayLike` and `isBufferLike`.
function createSizePropertyCheck(getSizeProperty) {
  return function(collection) {
    var sizeProperty = getSizeProperty(collection);
    return typeof sizeProperty == 'number' && sizeProperty >= 0 && sizeProperty <= MAX_ARRAY_INDEX;
  }
}

// Internal helper to generate a function to obtain property `key` from `obj`.
function shallowProperty(key) {
  return function(obj) {
    return obj == null ? void 0 : obj[key];
  };
}

// Internal helper to obtain the `byteLength` property of an object.
var getByteLength = shallowProperty('byteLength');

// Internal helper to determine whether we should spend extensive checks against
// `ArrayBuffer` et al.
var isBufferLike = createSizePropertyCheck(getByteLength);

// Is a given value a typed array?
var typedArrayPattern = /\[object ((I|Ui)nt(8|16|32)|Float(32|64)|Uint8Clamped|Big(I|Ui)nt64)Array\]/;
function isTypedArray(obj) {
  // `ArrayBuffer.isView` is the most future-proof, so use it when available.
  // Otherwise, fall back on the above regular expression.
  return nativeIsView ? (nativeIsView(obj) && !isDataView$1(obj)) :
                isBufferLike(obj) && typedArrayPattern.test(toString.call(obj));
}

var isTypedArray$1 = supportsArrayBuffer ? isTypedArray : constant(false);

// Internal helper to obtain the `length` property of an object.
var getLength = shallowProperty('length');

// Internal helper to create a simple lookup structure.
// `collectNonEnumProps` used to depend on `_.contains`, but this led to
// circular imports. `emulatedSet` is a one-off solution that only works for
// arrays of strings.
function emulatedSet(keys) {
  var hash = {};
  for (var l = keys.length, i = 0; i < l; ++i) hash[keys[i]] = true;
  return {
    contains: function(key) { return hash[key] === true; },
    push: function(key) {
      hash[key] = true;
      return keys.push(key);
    }
  };
}

// Internal helper. Checks `keys` for the presence of keys in IE < 9 that won't
// be iterated by `for key in ...` and thus missed. Extends `keys` in place if
// needed.
function collectNonEnumProps(obj, keys) {
  keys = emulatedSet(keys);
  var nonEnumIdx = nonEnumerableProps.length;
  var constructor = obj.constructor;
  var proto = (isFunction$1(constructor) && constructor.prototype) || ObjProto;

  // Constructor is a special case.
  var prop = 'constructor';
  if (has$1(obj, prop) && !keys.contains(prop)) keys.push(prop);

  while (nonEnumIdx--) {
    prop = nonEnumerableProps[nonEnumIdx];
    if (prop in obj && obj[prop] !== proto[prop] && !keys.contains(prop)) {
      keys.push(prop);
    }
  }
}

// Retrieve the names of an object's own properties.
// Delegates to **ECMAScript 5**'s native `Object.keys`.
function keys(obj) {
  if (!isObject(obj)) return [];
  if (nativeKeys) return nativeKeys(obj);
  var keys = [];
  for (var key in obj) if (has$1(obj, key)) keys.push(key);
  // Ahem, IE < 9.
  if (hasEnumBug) collectNonEnumProps(obj, keys);
  return keys;
}

// Is a given array, string, or object empty?
// An "empty" object has no enumerable own-properties.
function isEmpty(obj) {
  if (obj == null) return true;
  // Skip the more expensive `toString`-based type checks if `obj` has no
  // `.length`.
  var length = getLength(obj);
  if (typeof length == 'number' && (
    isArray(obj) || isString(obj) || isArguments$1(obj)
  )) return length === 0;
  return getLength(keys(obj)) === 0;
}

// Returns whether an object has a given set of `key:value` pairs.
function isMatch(object, attrs) {
  var _keys = keys(attrs), length = _keys.length;
  if (object == null) return !length;
  var obj = Object(object);
  for (var i = 0; i < length; i++) {
    var key = _keys[i];
    if (attrs[key] !== obj[key] || !(key in obj)) return false;
  }
  return true;
}

// If Underscore is called as a function, it returns a wrapped object that can
// be used OO-style. This wrapper holds altered versions of all functions added
// through `_.mixin`. Wrapped objects may be chained.
function _$1(obj) {
  if (obj instanceof _$1) return obj;
  if (!(this instanceof _$1)) return new _$1(obj);
  this._wrapped = obj;
}

_$1.VERSION = VERSION;

// Extracts the result from a wrapped and chained object.
_$1.prototype.value = function() {
  return this._wrapped;
};

// Provide unwrapping proxies for some methods used in engine operations
// such as arithmetic and JSON stringification.
_$1.prototype.valueOf = _$1.prototype.toJSON = _$1.prototype.value;

_$1.prototype.toString = function() {
  return String(this._wrapped);
};

// Internal function to wrap or shallow-copy an ArrayBuffer,
// typed array or DataView to a new view, reusing the buffer.
function toBufferView(bufferSource) {
  return new Uint8Array(
    bufferSource.buffer || bufferSource,
    bufferSource.byteOffset || 0,
    getByteLength(bufferSource)
  );
}

// We use this string twice, so give it a name for minification.
var tagDataView = '[object DataView]';

// Internal recursive comparison function for `_.isEqual`.
function eq(a, b, aStack, bStack) {
  // Identical objects are equal. `0 === -0`, but they aren't identical.
  // See the [Harmony `egal` proposal](https://wiki.ecmascript.org/doku.php?id=harmony:egal).
  if (a === b) return a !== 0 || 1 / a === 1 / b;
  // `null` or `undefined` only equal to itself (strict comparison).
  if (a == null || b == null) return false;
  // `NaN`s are equivalent, but non-reflexive.
  if (a !== a) return b !== b;
  // Exhaust primitive checks
  var type = typeof a;
  if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
  return deepEq(a, b, aStack, bStack);
}

// Internal recursive comparison function for `_.isEqual`.
function deepEq(a, b, aStack, bStack) {
  // Unwrap any wrapped objects.
  if (a instanceof _$1) a = a._wrapped;
  if (b instanceof _$1) b = b._wrapped;
  // Compare `[[Class]]` names.
  var className = toString.call(a);
  if (className !== toString.call(b)) return false;
  // Work around a bug in IE 10 - Edge 13.
  if (hasStringTagBug && className == '[object Object]' && isDataView$1(a)) {
    if (!isDataView$1(b)) return false;
    className = tagDataView;
  }
  switch (className) {
    // These types are compared by value.
    case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
    case '[object String]':
      // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
      // equivalent to `new String("5")`.
      return '' + a === '' + b;
    case '[object Number]':
      // `NaN`s are equivalent, but non-reflexive.
      // Object(NaN) is equivalent to NaN.
      if (+a !== +a) return +b !== +b;
      // An `egal` comparison is performed for other numeric values.
      return +a === 0 ? 1 / +a === 1 / b : +a === +b;
    case '[object Date]':
    case '[object Boolean]':
      // Coerce dates and booleans to numeric primitive values. Dates are compared by their
      // millisecond representations. Note that invalid dates with millisecond representations
      // of `NaN` are not equivalent.
      return +a === +b;
    case '[object Symbol]':
      return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
    case '[object ArrayBuffer]':
    case tagDataView:
      // Coerce to typed array so we can fall through.
      return deepEq(toBufferView(a), toBufferView(b), aStack, bStack);
  }

  var areArrays = className === '[object Array]';
  if (!areArrays && isTypedArray$1(a)) {
      var byteLength = getByteLength(a);
      if (byteLength !== getByteLength(b)) return false;
      if (a.buffer === b.buffer && a.byteOffset === b.byteOffset) return true;
      areArrays = true;
  }
  if (!areArrays) {
    if (typeof a != 'object' || typeof b != 'object') return false;

    // Objects with different constructors are not equivalent, but `Object`s or `Array`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(isFunction$1(aCtor) && aCtor instanceof aCtor &&
                             isFunction$1(bCtor) && bCtor instanceof bCtor)
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
  }
  // Assume equality for cyclic structures. The algorithm for detecting cyclic
  // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

  // Initializing stack of traversed objects.
  // It's done here since we only need them for objects and arrays comparison.
  aStack = aStack || [];
  bStack = bStack || [];
  var length = aStack.length;
  while (length--) {
    // Linear search. Performance is inversely proportional to the number of
    // unique nested structures.
    if (aStack[length] === a) return bStack[length] === b;
  }

  // Add the first object to the stack of traversed objects.
  aStack.push(a);
  bStack.push(b);

  // Recursively compare objects and arrays.
  if (areArrays) {
    // Compare array lengths to determine if a deep comparison is necessary.
    length = a.length;
    if (length !== b.length) return false;
    // Deep compare the contents, ignoring non-numeric properties.
    while (length--) {
      if (!eq(a[length], b[length], aStack, bStack)) return false;
    }
  } else {
    // Deep compare objects.
    var _keys = keys(a), key;
    length = _keys.length;
    // Ensure that both objects contain the same number of properties before comparing deep equality.
    if (keys(b).length !== length) return false;
    while (length--) {
      // Deep compare each member
      key = _keys[length];
      if (!(has$1(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
    }
  }
  // Remove the first object from the stack of traversed objects.
  aStack.pop();
  bStack.pop();
  return true;
}

// Perform a deep comparison to check if two objects are equal.
function isEqual(a, b) {
  return eq(a, b);
}

// Retrieve all the enumerable property names of an object.
function allKeys(obj) {
  if (!isObject(obj)) return [];
  var keys = [];
  for (var key in obj) keys.push(key);
  // Ahem, IE < 9.
  if (hasEnumBug) collectNonEnumProps(obj, keys);
  return keys;
}

// Since the regular `Object.prototype.toString` type tests don't work for
// some types in IE 11, we use a fingerprinting heuristic instead, based
// on the methods. It's not great, but it's the best we got.
// The fingerprint method lists are defined below.
function ie11fingerprint(methods) {
  var length = getLength(methods);
  return function(obj) {
    if (obj == null) return false;
    // `Map`, `WeakMap` and `Set` have no enumerable keys.
    var keys = allKeys(obj);
    if (getLength(keys)) return false;
    for (var i = 0; i < length; i++) {
      if (!isFunction$1(obj[methods[i]])) return false;
    }
    // If we are testing against `WeakMap`, we need to ensure that
    // `obj` doesn't have a `forEach` method in order to distinguish
    // it from a regular `Map`.
    return methods !== weakMapMethods || !isFunction$1(obj[forEachName]);
  };
}

// In the interest of compact minification, we write
// each string in the fingerprints only once.
var forEachName = 'forEach',
    hasName = 'has',
    commonInit = ['clear', 'delete'],
    mapTail = ['get', hasName, 'set'];

// `Map`, `WeakMap` and `Set` each have slightly different
// combinations of the above sublists.
var mapMethods = commonInit.concat(forEachName, mapTail),
    weakMapMethods = commonInit.concat(mapTail),
    setMethods = ['add'].concat(commonInit, forEachName, hasName);

var isMap = isIE11 ? ie11fingerprint(mapMethods) : tagTester('Map');

var isWeakMap = isIE11 ? ie11fingerprint(weakMapMethods) : tagTester('WeakMap');

var isSet = isIE11 ? ie11fingerprint(setMethods) : tagTester('Set');

var isWeakSet = tagTester('WeakSet');

// Retrieve the values of an object's properties.
function values(obj) {
  var _keys = keys(obj);
  var length = _keys.length;
  var values = Array(length);
  for (var i = 0; i < length; i++) {
    values[i] = obj[_keys[i]];
  }
  return values;
}

// Convert an object into a list of `[key, value]` pairs.
// The opposite of `_.object` with one argument.
function pairs(obj) {
  var _keys = keys(obj);
  var length = _keys.length;
  var pairs = Array(length);
  for (var i = 0; i < length; i++) {
    pairs[i] = [_keys[i], obj[_keys[i]]];
  }
  return pairs;
}

// Invert the keys and values of an object. The values must be serializable.
function invert(obj) {
  var result = {};
  var _keys = keys(obj);
  for (var i = 0, length = _keys.length; i < length; i++) {
    result[obj[_keys[i]]] = _keys[i];
  }
  return result;
}

// Return a sorted list of the function names available on the object.
function functions(obj) {
  var names = [];
  for (var key in obj) {
    if (isFunction$1(obj[key])) names.push(key);
  }
  return names.sort();
}

// An internal function for creating assigner functions.
function createAssigner(keysFunc, defaults) {
  return function(obj) {
    var length = arguments.length;
    if (defaults) obj = Object(obj);
    if (length < 2 || obj == null) return obj;
    for (var index = 1; index < length; index++) {
      var source = arguments[index],
          keys = keysFunc(source),
          l = keys.length;
      for (var i = 0; i < l; i++) {
        var key = keys[i];
        if (!defaults || obj[key] === void 0) obj[key] = source[key];
      }
    }
    return obj;
  };
}

// Extend a given object with all the properties in passed-in object(s).
var extend = createAssigner(allKeys);

// Assigns a given object with all the own properties in the passed-in
// object(s).
// (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
var extendOwn = createAssigner(keys);

// Fill in a given object with default properties.
var defaults = createAssigner(allKeys, true);

// Create a naked function reference for surrogate-prototype-swapping.
function ctor() {
  return function(){};
}

// An internal function for creating a new object that inherits from another.
function baseCreate(prototype) {
  if (!isObject(prototype)) return {};
  if (nativeCreate) return nativeCreate(prototype);
  var Ctor = ctor();
  Ctor.prototype = prototype;
  var result = new Ctor;
  Ctor.prototype = null;
  return result;
}

// Creates an object that inherits from the given prototype object.
// If additional properties are provided then they will be added to the
// created object.
function create(prototype, props) {
  var result = baseCreate(prototype);
  if (props) extendOwn(result, props);
  return result;
}

// Create a (shallow-cloned) duplicate of an object.
function clone(obj) {
  if (!isObject(obj)) return obj;
  return isArray(obj) ? obj.slice() : extend({}, obj);
}

// Invokes `interceptor` with the `obj` and then returns `obj`.
// The primary purpose of this method is to "tap into" a method chain, in
// order to perform operations on intermediate results within the chain.
function tap(obj, interceptor) {
  interceptor(obj);
  return obj;
}

// Normalize a (deep) property `path` to array.
// Like `_.iteratee`, this function can be customized.
function toPath$1(path) {
  return isArray(path) ? path : [path];
}
_$1.toPath = toPath$1;

// Internal wrapper for `_.toPath` to enable minification.
// Similar to `cb` for `_.iteratee`.
function toPath(path) {
  return _$1.toPath(path);
}

// Internal function to obtain a nested property in `obj` along `path`.
function deepGet(obj, path) {
  var length = path.length;
  for (var i = 0; i < length; i++) {
    if (obj == null) return void 0;
    obj = obj[path[i]];
  }
  return length ? obj : void 0;
}

// Get the value of the (deep) property on `path` from `object`.
// If any property in `path` does not exist or if the value is
// `undefined`, return `defaultValue` instead.
// The `path` is normalized through `_.toPath`.
function get(object, path, defaultValue) {
  var value = deepGet(object, toPath(path));
  return isUndefined(value) ? defaultValue : value;
}

// Shortcut function for checking if an object has a given property directly on
// itself (in other words, not on a prototype). Unlike the internal `has`
// function, this public version can also traverse nested properties.
function has(obj, path) {
  path = toPath(path);
  var length = path.length;
  for (var i = 0; i < length; i++) {
    var key = path[i];
    if (!has$1(obj, key)) return false;
    obj = obj[key];
  }
  return !!length;
}

// Keep the identity function around for default iteratees.
function identity(value) {
  return value;
}

// Returns a predicate for checking whether an object has a given set of
// `key:value` pairs.
function matcher(attrs) {
  attrs = extendOwn({}, attrs);
  return function(obj) {
    return isMatch(obj, attrs);
  };
}

// Creates a function that, when passed an object, will traverse that object’s
// properties down the given `path`, specified as an array of keys or indices.
function property(path) {
  path = toPath(path);
  return function(obj) {
    return deepGet(obj, path);
  };
}

// Internal function that returns an efficient (for current engines) version
// of the passed-in callback, to be repeatedly applied in other Underscore
// functions.
function optimizeCb(func, context, argCount) {
  if (context === void 0) return func;
  switch (argCount == null ? 3 : argCount) {
    case 1: return function(value) {
      return func.call(context, value);
    };
    // The 2-argument case is omitted because we’re not using it.
    case 3: return function(value, index, collection) {
      return func.call(context, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(context, accumulator, value, index, collection);
    };
  }
  return function() {
    return func.apply(context, arguments);
  };
}

// An internal function to generate callbacks that can be applied to each
// element in a collection, returning the desired result — either `_.identity`,
// an arbitrary callback, a property matcher, or a property accessor.
function baseIteratee(value, context, argCount) {
  if (value == null) return identity;
  if (isFunction$1(value)) return optimizeCb(value, context, argCount);
  if (isObject(value) && !isArray(value)) return matcher(value);
  return property(value);
}

// External wrapper for our callback generator. Users may customize
// `_.iteratee` if they want additional predicate/iteratee shorthand styles.
// This abstraction hides the internal-only `argCount` argument.
function iteratee(value, context) {
  return baseIteratee(value, context, Infinity);
}
_$1.iteratee = iteratee;

// The function we call internally to generate a callback. It invokes
// `_.iteratee` if overridden, otherwise `baseIteratee`.
function cb(value, context, argCount) {
  if (_$1.iteratee !== iteratee) return _$1.iteratee(value, context);
  return baseIteratee(value, context, argCount);
}

// Returns the results of applying the `iteratee` to each element of `obj`.
// In contrast to `_.map` it returns an object.
function mapObject(obj, iteratee, context) {
  iteratee = cb(iteratee, context);
  var _keys = keys(obj),
      length = _keys.length,
      results = {};
  for (var index = 0; index < length; index++) {
    var currentKey = _keys[index];
    results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
  }
  return results;
}

// Predicate-generating function. Often useful outside of Underscore.
function noop(){}

// Generates a function for a given object that returns a given property.
function propertyOf(obj) {
  if (obj == null) return noop;
  return function(path) {
    return get(obj, path);
  };
}

// Run a function **n** times.
function times(n, iteratee, context) {
  var accum = Array(Math.max(0, n));
  iteratee = optimizeCb(iteratee, context, 1);
  for (var i = 0; i < n; i++) accum[i] = iteratee(i);
  return accum;
}

// Return a random integer between `min` and `max` (inclusive).
function random(min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }
  return min + Math.floor(Math.random() * (max - min + 1));
}

// A (possibly faster) way to get the current timestamp as an integer.
var now = Date.now || function() {
  return new Date().getTime();
};

// Internal helper to generate functions for escaping and unescaping strings
// to/from HTML interpolation.
function createEscaper(map) {
  var escaper = function(match) {
    return map[match];
  };
  // Regexes for identifying a key that needs to be escaped.
  var source = '(?:' + keys(map).join('|') + ')';
  var testRegexp = RegExp(source);
  var replaceRegexp = RegExp(source, 'g');
  return function(string) {
    string = string == null ? '' : '' + string;
    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
  };
}

// Internal list of HTML entities for escaping.
var escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;'
};

// Function for escaping strings to HTML interpolation.
var _escape = createEscaper(escapeMap);

// Internal list of HTML entities for unescaping.
var unescapeMap = invert(escapeMap);

// Function for unescaping strings from HTML interpolation.
var _unescape = createEscaper(unescapeMap);

// By default, Underscore uses ERB-style template delimiters. Change the
// following template settings to use alternative delimiters.
var templateSettings = _$1.templateSettings = {
  evaluate: /<%([\s\S]+?)%>/g,
  interpolate: /<%=([\s\S]+?)%>/g,
  escape: /<%-([\s\S]+?)%>/g
};

// When customizing `_.templateSettings`, if you don't want to define an
// interpolation, evaluation or escaping regex, we need one that is
// guaranteed not to match.
var noMatch = /(.)^/;

// Certain characters need to be escaped so that they can be put into a
// string literal.
var escapes = {
  "'": "'",
  '\\': '\\',
  '\r': 'r',
  '\n': 'n',
  '\u2028': 'u2028',
  '\u2029': 'u2029'
};

var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

function escapeChar(match) {
  return '\\' + escapes[match];
}

// In order to prevent third-party code injection through
// `_.templateSettings.variable`, we test it against the following regular
// expression. It is intentionally a bit more liberal than just matching valid
// identifiers, but still prevents possible loopholes through defaults or
// destructuring assignment.
var bareIdentifier = /^\s*(\w|\$)+\s*$/;

// JavaScript micro-templating, similar to John Resig's implementation.
// Underscore templating handles arbitrary delimiters, preserves whitespace,
// and correctly escapes quotes within interpolated code.
// NB: `oldSettings` only exists for backwards compatibility.
function template(text, settings, oldSettings) {
  if (!settings && oldSettings) settings = oldSettings;
  settings = defaults({}, settings, _$1.templateSettings);

  // Combine delimiters into one regular expression via alternation.
  var matcher = RegExp([
    (settings.escape || noMatch).source,
    (settings.interpolate || noMatch).source,
    (settings.evaluate || noMatch).source
  ].join('|') + '|$', 'g');

  // Compile the template source, escaping string literals appropriately.
  var index = 0;
  var source = "__p+='";
  text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
    source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
    index = offset + match.length;

    if (escape) {
      source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
    } else if (interpolate) {
      source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
    } else if (evaluate) {
      source += "';\n" + evaluate + "\n__p+='";
    }

    // Adobe VMs need the match returned to produce the correct offset.
    return match;
  });
  source += "';\n";

  var argument = settings.variable;
  if (argument) {
    // Insure against third-party code injection. (CVE-2021-23358)
    if (!bareIdentifier.test(argument)) throw new Error(
      'variable is not a bare identifier: ' + argument
    );
  } else {
    // If a variable is not specified, place data values in local scope.
    source = 'with(obj||{}){\n' + source + '}\n';
    argument = 'obj';
  }

  source = "var __t,__p='',__j=Array.prototype.join," +
    "print=function(){__p+=__j.call(arguments,'');};\n" +
    source + 'return __p;\n';

  var render;
  try {
    render = new Function(argument, '_', source);
  } catch (e) {
    e.source = source;
    throw e;
  }

  var template = function(data) {
    return render.call(this, data, _$1);
  };

  // Provide the compiled source as a convenience for precompilation.
  template.source = 'function(' + argument + '){\n' + source + '}';

  return template;
}

// Traverses the children of `obj` along `path`. If a child is a function, it
// is invoked with its parent as context. Returns the value of the final
// child, or `fallback` if any child is undefined.
function result(obj, path, fallback) {
  path = toPath(path);
  var length = path.length;
  if (!length) {
    return isFunction$1(fallback) ? fallback.call(obj) : fallback;
  }
  for (var i = 0; i < length; i++) {
    var prop = obj == null ? void 0 : obj[path[i]];
    if (prop === void 0) {
      prop = fallback;
      i = length; // Ensure we don't continue iterating.
    }
    obj = isFunction$1(prop) ? prop.call(obj) : prop;
  }
  return obj;
}

// Generate a unique integer id (unique within the entire client session).
// Useful for temporary DOM ids.
var idCounter = 0;
function uniqueId(prefix) {
  var id = ++idCounter + '';
  return prefix ? prefix + id : id;
}

// Start chaining a wrapped Underscore object.
function chain(obj) {
  var instance = _$1(obj);
  instance._chain = true;
  return instance;
}

// Internal function to execute `sourceFunc` bound to `context` with optional
// `args`. Determines whether to execute a function as a constructor or as a
// normal function.
function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
  if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
  var self = baseCreate(sourceFunc.prototype);
  var result = sourceFunc.apply(self, args);
  if (isObject(result)) return result;
  return self;
}

// Partially apply a function by creating a version that has had some of its
// arguments pre-filled, without changing its dynamic `this` context. `_` acts
// as a placeholder by default, allowing any combination of arguments to be
// pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
var partial = restArguments(function(func, boundArgs) {
  var placeholder = partial.placeholder;
  var bound = function() {
    var position = 0, length = boundArgs.length;
    var args = Array(length);
    for (var i = 0; i < length; i++) {
      args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
    }
    while (position < arguments.length) args.push(arguments[position++]);
    return executeBound(func, bound, this, this, args);
  };
  return bound;
});

partial.placeholder = _$1;

// Create a function bound to a given object (assigning `this`, and arguments,
// optionally).
var bind = restArguments(function(func, context, args) {
  if (!isFunction$1(func)) throw new TypeError('Bind must be called on a function');
  var bound = restArguments(function(callArgs) {
    return executeBound(func, bound, context, this, args.concat(callArgs));
  });
  return bound;
});

// Internal helper for collection methods to determine whether a collection
// should be iterated as an array or as an object.
// Related: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
// Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
var isArrayLike = createSizePropertyCheck(getLength);

// Internal implementation of a recursive `flatten` function.
function flatten$1(input, depth, strict, output) {
  output = output || [];
  if (!depth && depth !== 0) {
    depth = Infinity;
  } else if (depth <= 0) {
    return output.concat(input);
  }
  var idx = output.length;
  for (var i = 0, length = getLength(input); i < length; i++) {
    var value = input[i];
    if (isArrayLike(value) && (isArray(value) || isArguments$1(value))) {
      // Flatten current level of array or arguments object.
      if (depth > 1) {
        flatten$1(value, depth - 1, strict, output);
        idx = output.length;
      } else {
        var j = 0, len = value.length;
        while (j < len) output[idx++] = value[j++];
      }
    } else if (!strict) {
      output[idx++] = value;
    }
  }
  return output;
}

// Bind a number of an object's methods to that object. Remaining arguments
// are the method names to be bound. Useful for ensuring that all callbacks
// defined on an object belong to it.
var bindAll = restArguments(function(obj, keys) {
  keys = flatten$1(keys, false, false);
  var index = keys.length;
  if (index < 1) throw new Error('bindAll must be passed function names');
  while (index--) {
    var key = keys[index];
    obj[key] = bind(obj[key], obj);
  }
  return obj;
});

// Memoize an expensive function by storing its results.
function memoize(func, hasher) {
  var memoize = function(key) {
    var cache = memoize.cache;
    var address = '' + (hasher ? hasher.apply(this, arguments) : key);
    if (!has$1(cache, address)) cache[address] = func.apply(this, arguments);
    return cache[address];
  };
  memoize.cache = {};
  return memoize;
}

// Delays a function for the given number of milliseconds, and then calls
// it with the arguments supplied.
var delay = restArguments(function(func, wait, args) {
  return setTimeout(function() {
    return func.apply(null, args);
  }, wait);
});

// Defers a function, scheduling it to run after the current call stack has
// cleared.
var defer = partial(delay, _$1, 1);

// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
function throttle(func, wait, options) {
  var timeout, context, args, result;
  var previous = 0;
  if (!options) options = {};

  var later = function() {
    previous = options.leading === false ? 0 : now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  var throttled = function() {
    var _now = now();
    if (!previous && options.leading === false) previous = _now;
    var remaining = wait - (_now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = _now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };

  throttled.cancel = function() {
    clearTimeout(timeout);
    previous = 0;
    timeout = context = args = null;
  };

  return throttled;
}

// When a sequence of calls of the returned function ends, the argument
// function is triggered. The end of a sequence is defined by the `wait`
// parameter. If `immediate` is passed, the argument function will be
// triggered at the beginning of the sequence instead of at the end.
function debounce(func, wait, immediate) {
  var timeout, previous, args, result, context;

  var later = function() {
    var passed = now() - previous;
    if (wait > passed) {
      timeout = setTimeout(later, wait - passed);
    } else {
      timeout = null;
      if (!immediate) result = func.apply(context, args);
      // This check is needed because `func` can recursively invoke `debounced`.
      if (!timeout) args = context = null;
    }
  };

  var debounced = restArguments(function(_args) {
    context = this;
    args = _args;
    previous = now();
    if (!timeout) {
      timeout = setTimeout(later, wait);
      if (immediate) result = func.apply(context, args);
    }
    return result;
  });

  debounced.cancel = function() {
    clearTimeout(timeout);
    timeout = args = context = null;
  };

  return debounced;
}

// Returns the first function passed as an argument to the second,
// allowing you to adjust arguments, run code before and after, and
// conditionally execute the original function.
function wrap(func, wrapper) {
  return partial(wrapper, func);
}

// Returns a negated version of the passed-in predicate.
function negate(predicate) {
  return function() {
    return !predicate.apply(this, arguments);
  };
}

// Returns a function that is the composition of a list of functions, each
// consuming the return value of the function that follows.
function compose() {
  var args = arguments;
  var start = args.length - 1;
  return function() {
    var i = start;
    var result = args[start].apply(this, arguments);
    while (i--) result = args[i].call(this, result);
    return result;
  };
}

// Returns a function that will only be executed on and after the Nth call.
function after(times, func) {
  return function() {
    if (--times < 1) {
      return func.apply(this, arguments);
    }
  };
}

// Returns a function that will only be executed up to (but not including) the
// Nth call.
function before(times, func) {
  var memo;
  return function() {
    if (--times > 0) {
      memo = func.apply(this, arguments);
    }
    if (times <= 1) func = null;
    return memo;
  };
}

// Returns a function that will be executed at most one time, no matter how
// often you call it. Useful for lazy initialization.
var once = partial(before, 2);

// Returns the first key on an object that passes a truth test.
function findKey(obj, predicate, context) {
  predicate = cb(predicate, context);
  var _keys = keys(obj), key;
  for (var i = 0, length = _keys.length; i < length; i++) {
    key = _keys[i];
    if (predicate(obj[key], key, obj)) return key;
  }
}

// Internal function to generate `_.findIndex` and `_.findLastIndex`.
function createPredicateIndexFinder(dir) {
  return function(array, predicate, context) {
    predicate = cb(predicate, context);
    var length = getLength(array);
    var index = dir > 0 ? 0 : length - 1;
    for (; index >= 0 && index < length; index += dir) {
      if (predicate(array[index], index, array)) return index;
    }
    return -1;
  };
}

// Returns the first index on an array-like that passes a truth test.
var findIndex = createPredicateIndexFinder(1);

// Returns the last index on an array-like that passes a truth test.
var findLastIndex = createPredicateIndexFinder(-1);

// Use a comparator function to figure out the smallest index at which
// an object should be inserted so as to maintain order. Uses binary search.
function sortedIndex(array, obj, iteratee, context) {
  iteratee = cb(iteratee, context, 1);
  var value = iteratee(obj);
  var low = 0, high = getLength(array);
  while (low < high) {
    var mid = Math.floor((low + high) / 2);
    if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
  }
  return low;
}

// Internal function to generate the `_.indexOf` and `_.lastIndexOf` functions.
function createIndexFinder(dir, predicateFind, sortedIndex) {
  return function(array, item, idx) {
    var i = 0, length = getLength(array);
    if (typeof idx == 'number') {
      if (dir > 0) {
        i = idx >= 0 ? idx : Math.max(idx + length, i);
      } else {
        length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
      }
    } else if (sortedIndex && idx && length) {
      idx = sortedIndex(array, item);
      return array[idx] === item ? idx : -1;
    }
    if (item !== item) {
      idx = predicateFind(slice.call(array, i, length), isNaN$1);
      return idx >= 0 ? idx + i : -1;
    }
    for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
      if (array[idx] === item) return idx;
    }
    return -1;
  };
}

// Return the position of the first occurrence of an item in an array,
// or -1 if the item is not included in the array.
// If the array is large and already in sort order, pass `true`
// for **isSorted** to use binary search.
var indexOf = createIndexFinder(1, findIndex, sortedIndex);

// Return the position of the last occurrence of an item in an array,
// or -1 if the item is not included in the array.
var lastIndexOf = createIndexFinder(-1, findLastIndex);

// Return the first value which passes a truth test.
function find(obj, predicate, context) {
  var keyFinder = isArrayLike(obj) ? findIndex : findKey;
  var key = keyFinder(obj, predicate, context);
  if (key !== void 0 && key !== -1) return obj[key];
}

// Convenience version of a common use case of `_.find`: getting the first
// object containing specific `key:value` pairs.
function findWhere(obj, attrs) {
  return find(obj, matcher(attrs));
}

// The cornerstone for collection functions, an `each`
// implementation, aka `forEach`.
// Handles raw objects in addition to array-likes. Treats all
// sparse array-likes as if they were dense.
function each(obj, iteratee, context) {
  iteratee = optimizeCb(iteratee, context);
  var i, length;
  if (isArrayLike(obj)) {
    for (i = 0, length = obj.length; i < length; i++) {
      iteratee(obj[i], i, obj);
    }
  } else {
    var _keys = keys(obj);
    for (i = 0, length = _keys.length; i < length; i++) {
      iteratee(obj[_keys[i]], _keys[i], obj);
    }
  }
  return obj;
}

// Return the results of applying the iteratee to each element.
function map(obj, iteratee, context) {
  iteratee = cb(iteratee, context);
  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length,
      results = Array(length);
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    results[index] = iteratee(obj[currentKey], currentKey, obj);
  }
  return results;
}

// Internal helper to create a reducing function, iterating left or right.
function createReduce(dir) {
  // Wrap code that reassigns argument variables in a separate function than
  // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
  var reducer = function(obj, iteratee, memo, initial) {
    var _keys = !isArrayLike(obj) && keys(obj),
        length = (_keys || obj).length,
        index = dir > 0 ? 0 : length - 1;
    if (!initial) {
      memo = obj[_keys ? _keys[index] : index];
      index += dir;
    }
    for (; index >= 0 && index < length; index += dir) {
      var currentKey = _keys ? _keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  return function(obj, iteratee, memo, context) {
    var initial = arguments.length >= 3;
    return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
  };
}

// **Reduce** builds up a single result from a list of values, aka `inject`,
// or `foldl`.
var reduce = createReduce(1);

// The right-associative version of reduce, also known as `foldr`.
var reduceRight = createReduce(-1);

// Return all the elements that pass a truth test.
function filter(obj, predicate, context) {
  var results = [];
  predicate = cb(predicate, context);
  each(obj, function(value, index, list) {
    if (predicate(value, index, list)) results.push(value);
  });
  return results;
}

// Return all the elements for which a truth test fails.
function reject(obj, predicate, context) {
  return filter(obj, negate(cb(predicate)), context);
}

// Determine whether all of the elements pass a truth test.
function every(obj, predicate, context) {
  predicate = cb(predicate, context);
  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length;
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    if (!predicate(obj[currentKey], currentKey, obj)) return false;
  }
  return true;
}

// Determine if at least one element in the object passes a truth test.
function some(obj, predicate, context) {
  predicate = cb(predicate, context);
  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length;
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    if (predicate(obj[currentKey], currentKey, obj)) return true;
  }
  return false;
}

// Determine if the array or object contains a given item (using `===`).
function contains(obj, item, fromIndex, guard) {
  if (!isArrayLike(obj)) obj = values(obj);
  if (typeof fromIndex != 'number' || guard) fromIndex = 0;
  return indexOf(obj, item, fromIndex) >= 0;
}

// Invoke a method (with arguments) on every item in a collection.
var invoke = restArguments(function(obj, path, args) {
  var contextPath, func;
  if (isFunction$1(path)) {
    func = path;
  } else {
    path = toPath(path);
    contextPath = path.slice(0, -1);
    path = path[path.length - 1];
  }
  return map(obj, function(context) {
    var method = func;
    if (!method) {
      if (contextPath && contextPath.length) {
        context = deepGet(context, contextPath);
      }
      if (context == null) return void 0;
      method = context[path];
    }
    return method == null ? method : method.apply(context, args);
  });
});

// Convenience version of a common use case of `_.map`: fetching a property.
function pluck(obj, key) {
  return map(obj, property(key));
}

// Convenience version of a common use case of `_.filter`: selecting only
// objects containing specific `key:value` pairs.
function where(obj, attrs) {
  return filter(obj, matcher(attrs));
}

// Return the maximum element (or element-based computation).
function max(obj, iteratee, context) {
  var result = -Infinity, lastComputed = -Infinity,
      value, computed;
  if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null)) {
    obj = isArrayLike(obj) ? obj : values(obj);
    for (var i = 0, length = obj.length; i < length; i++) {
      value = obj[i];
      if (value != null && value > result) {
        result = value;
      }
    }
  } else {
    iteratee = cb(iteratee, context);
    each(obj, function(v, index, list) {
      computed = iteratee(v, index, list);
      if (computed > lastComputed || (computed === -Infinity && result === -Infinity)) {
        result = v;
        lastComputed = computed;
      }
    });
  }
  return result;
}

// Return the minimum element (or element-based computation).
function min(obj, iteratee, context) {
  var result = Infinity, lastComputed = Infinity,
      value, computed;
  if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null)) {
    obj = isArrayLike(obj) ? obj : values(obj);
    for (var i = 0, length = obj.length; i < length; i++) {
      value = obj[i];
      if (value != null && value < result) {
        result = value;
      }
    }
  } else {
    iteratee = cb(iteratee, context);
    each(obj, function(v, index, list) {
      computed = iteratee(v, index, list);
      if (computed < lastComputed || (computed === Infinity && result === Infinity)) {
        result = v;
        lastComputed = computed;
      }
    });
  }
  return result;
}

// Safely create a real, live array from anything iterable.
var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
function toArray(obj) {
  if (!obj) return [];
  if (isArray(obj)) return slice.call(obj);
  if (isString(obj)) {
    // Keep surrogate pair characters together.
    return obj.match(reStrSymbol);
  }
  if (isArrayLike(obj)) return map(obj, identity);
  return values(obj);
}

// Sample **n** random values from a collection using the modern version of the
// [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
// If **n** is not specified, returns a single random element.
// The internal `guard` argument allows it to work with `_.map`.
function sample(obj, n, guard) {
  if (n == null || guard) {
    if (!isArrayLike(obj)) obj = values(obj);
    return obj[random(obj.length - 1)];
  }
  var sample = toArray(obj);
  var length = getLength(sample);
  n = Math.max(Math.min(n, length), 0);
  var last = length - 1;
  for (var index = 0; index < n; index++) {
    var rand = random(index, last);
    var temp = sample[index];
    sample[index] = sample[rand];
    sample[rand] = temp;
  }
  return sample.slice(0, n);
}

// Shuffle a collection.
function shuffle(obj) {
  return sample(obj, Infinity);
}

// Sort the object's values by a criterion produced by an iteratee.
function sortBy(obj, iteratee, context) {
  var index = 0;
  iteratee = cb(iteratee, context);
  return pluck(map(obj, function(value, key, list) {
    return {
      value: value,
      index: index++,
      criteria: iteratee(value, key, list)
    };
  }).sort(function(left, right) {
    var a = left.criteria;
    var b = right.criteria;
    if (a !== b) {
      if (a > b || a === void 0) return 1;
      if (a < b || b === void 0) return -1;
    }
    return left.index - right.index;
  }), 'value');
}

// An internal function used for aggregate "group by" operations.
function group(behavior, partition) {
  return function(obj, iteratee, context) {
    var result = partition ? [[], []] : {};
    iteratee = cb(iteratee, context);
    each(obj, function(value, index) {
      var key = iteratee(value, index, obj);
      behavior(result, value, key);
    });
    return result;
  };
}

// Groups the object's values by a criterion. Pass either a string attribute
// to group by, or a function that returns the criterion.
var groupBy = group(function(result, value, key) {
  if (has$1(result, key)) result[key].push(value); else result[key] = [value];
});

// Indexes the object's values by a criterion, similar to `_.groupBy`, but for
// when you know that your index values will be unique.
var indexBy = group(function(result, value, key) {
  result[key] = value;
});

// Counts instances of an object that group by a certain criterion. Pass
// either a string attribute to count by, or a function that returns the
// criterion.
var countBy = group(function(result, value, key) {
  if (has$1(result, key)) result[key]++; else result[key] = 1;
});

// Split a collection into two arrays: one whose elements all pass the given
// truth test, and one whose elements all do not pass the truth test.
var partition = group(function(result, value, pass) {
  result[pass ? 0 : 1].push(value);
}, true);

// Return the number of elements in a collection.
function size(obj) {
  if (obj == null) return 0;
  return isArrayLike(obj) ? obj.length : keys(obj).length;
}

// Internal `_.pick` helper function to determine whether `key` is an enumerable
// property name of `obj`.
function keyInObj(value, key, obj) {
  return key in obj;
}

// Return a copy of the object only containing the allowed properties.
var pick = restArguments(function(obj, keys) {
  var result = {}, iteratee = keys[0];
  if (obj == null) return result;
  if (isFunction$1(iteratee)) {
    if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
    keys = allKeys(obj);
  } else {
    iteratee = keyInObj;
    keys = flatten$1(keys, false, false);
    obj = Object(obj);
  }
  for (var i = 0, length = keys.length; i < length; i++) {
    var key = keys[i];
    var value = obj[key];
    if (iteratee(value, key, obj)) result[key] = value;
  }
  return result;
});

// Return a copy of the object without the disallowed properties.
var omit = restArguments(function(obj, keys) {
  var iteratee = keys[0], context;
  if (isFunction$1(iteratee)) {
    iteratee = negate(iteratee);
    if (keys.length > 1) context = keys[1];
  } else {
    keys = map(flatten$1(keys, false, false), String);
    iteratee = function(value, key) {
      return !contains(keys, key);
    };
  }
  return pick(obj, iteratee, context);
});

// Returns everything but the last entry of the array. Especially useful on
// the arguments object. Passing **n** will return all the values in
// the array, excluding the last N.
function initial(array, n, guard) {
  return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
}

// Get the first element of an array. Passing **n** will return the first N
// values in the array. The **guard** check allows it to work with `_.map`.
function first(array, n, guard) {
  if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
  if (n == null || guard) return array[0];
  return initial(array, array.length - n);
}

// Returns everything but the first entry of the `array`. Especially useful on
// the `arguments` object. Passing an **n** will return the rest N values in the
// `array`.
function rest(array, n, guard) {
  return slice.call(array, n == null || guard ? 1 : n);
}

// Get the last element of an array. Passing **n** will return the last N
// values in the array.
function last(array, n, guard) {
  if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
  if (n == null || guard) return array[array.length - 1];
  return rest(array, Math.max(0, array.length - n));
}

// Trim out all falsy values from an array.
function compact(array) {
  return filter(array, Boolean);
}

// Flatten out an array, either recursively (by default), or up to `depth`.
// Passing `true` or `false` as `depth` means `1` or `Infinity`, respectively.
function flatten(array, depth) {
  return flatten$1(array, depth, false);
}

// Take the difference between one array and a number of other arrays.
// Only the elements present in just the first array will remain.
var difference = restArguments(function(array, rest) {
  rest = flatten$1(rest, true, true);
  return filter(array, function(value){
    return !contains(rest, value);
  });
});

// Return a version of the array that does not contain the specified value(s).
var without = restArguments(function(array, otherArrays) {
  return difference(array, otherArrays);
});

// Produce a duplicate-free version of the array. If the array has already
// been sorted, you have the option of using a faster algorithm.
// The faster algorithm will not work with an iteratee if the iteratee
// is not a one-to-one function, so providing an iteratee will disable
// the faster algorithm.
function uniq(array, isSorted, iteratee, context) {
  if (!isBoolean(isSorted)) {
    context = iteratee;
    iteratee = isSorted;
    isSorted = false;
  }
  if (iteratee != null) iteratee = cb(iteratee, context);
  var result = [];
  var seen = [];
  for (var i = 0, length = getLength(array); i < length; i++) {
    var value = array[i],
        computed = iteratee ? iteratee(value, i, array) : value;
    if (isSorted && !iteratee) {
      if (!i || seen !== computed) result.push(value);
      seen = computed;
    } else if (iteratee) {
      if (!contains(seen, computed)) {
        seen.push(computed);
        result.push(value);
      }
    } else if (!contains(result, value)) {
      result.push(value);
    }
  }
  return result;
}

// Produce an array that contains the union: each distinct element from all of
// the passed-in arrays.
var union = restArguments(function(arrays) {
  return uniq(flatten$1(arrays, true, true));
});

// Produce an array that contains every item shared between all the
// passed-in arrays.
function intersection(array) {
  var result = [];
  var argsLength = arguments.length;
  for (var i = 0, length = getLength(array); i < length; i++) {
    var item = array[i];
    if (contains(result, item)) continue;
    var j;
    for (j = 1; j < argsLength; j++) {
      if (!contains(arguments[j], item)) break;
    }
    if (j === argsLength) result.push(item);
  }
  return result;
}

// Complement of zip. Unzip accepts an array of arrays and groups
// each array's elements on shared indices.
function unzip(array) {
  var length = (array && max(array, getLength).length) || 0;
  var result = Array(length);

  for (var index = 0; index < length; index++) {
    result[index] = pluck(array, index);
  }
  return result;
}

// Zip together multiple lists into a single array -- elements that share
// an index go together.
var zip = restArguments(unzip);

// Converts lists into objects. Pass either a single array of `[key, value]`
// pairs, or two parallel arrays of the same length -- one of keys, and one of
// the corresponding values. Passing by pairs is the reverse of `_.pairs`.
function object(list, values) {
  var result = {};
  for (var i = 0, length = getLength(list); i < length; i++) {
    if (values) {
      result[list[i]] = values[i];
    } else {
      result[list[i][0]] = list[i][1];
    }
  }
  return result;
}

// Generate an integer Array containing an arithmetic progression. A port of
// the native Python `range()` function. See
// [the Python documentation](https://docs.python.org/library/functions.html#range).
function range(start, stop, step) {
  if (stop == null) {
    stop = start || 0;
    start = 0;
  }
  if (!step) {
    step = stop < start ? -1 : 1;
  }

  var length = Math.max(Math.ceil((stop - start) / step), 0);
  var range = Array(length);

  for (var idx = 0; idx < length; idx++, start += step) {
    range[idx] = start;
  }

  return range;
}

// Chunk a single array into multiple arrays, each containing `count` or fewer
// items.
function chunk(array, count) {
  if (count == null || count < 1) return [];
  var result = [];
  var i = 0, length = array.length;
  while (i < length) {
    result.push(slice.call(array, i, i += count));
  }
  return result;
}

// Helper function to continue chaining intermediate results.
function chainResult(instance, obj) {
  return instance._chain ? _$1(obj).chain() : obj;
}

// Add your own custom functions to the Underscore object.
function mixin(obj) {
  each(functions(obj), function(name) {
    var func = _$1[name] = obj[name];
    _$1.prototype[name] = function() {
      var args = [this._wrapped];
      push.apply(args, arguments);
      return chainResult(this, func.apply(_$1, args));
    };
  });
  return _$1;
}

// Add all mutator `Array` functions to the wrapper.
each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
  var method = ArrayProto[name];
  _$1.prototype[name] = function() {
    var obj = this._wrapped;
    if (obj != null) {
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) {
        delete obj[0];
      }
    }
    return chainResult(this, obj);
  };
});

// Add all accessor `Array` functions to the wrapper.
each(['concat', 'join', 'slice'], function(name) {
  var method = ArrayProto[name];
  _$1.prototype[name] = function() {
    var obj = this._wrapped;
    if (obj != null) obj = method.apply(obj, arguments);
    return chainResult(this, obj);
  };
});

// Named Exports

var allExports = /*#__PURE__*/Object.freeze({
  __proto__: null,
  VERSION: VERSION,
  restArguments: restArguments,
  isObject: isObject,
  isNull: isNull,
  isUndefined: isUndefined,
  isBoolean: isBoolean,
  isElement: isElement,
  isString: isString,
  isNumber: isNumber,
  isDate: isDate,
  isRegExp: isRegExp,
  isError: isError,
  isSymbol: isSymbol,
  isArrayBuffer: isArrayBuffer,
  isDataView: isDataView$1,
  isArray: isArray,
  isFunction: isFunction$1,
  isArguments: isArguments$1,
  isFinite: isFinite$1,
  isNaN: isNaN$1,
  isTypedArray: isTypedArray$1,
  isEmpty: isEmpty,
  isMatch: isMatch,
  isEqual: isEqual,
  isMap: isMap,
  isWeakMap: isWeakMap,
  isSet: isSet,
  isWeakSet: isWeakSet,
  keys: keys,
  allKeys: allKeys,
  values: values,
  pairs: pairs,
  invert: invert,
  functions: functions,
  methods: functions,
  extend: extend,
  extendOwn: extendOwn,
  assign: extendOwn,
  defaults: defaults,
  create: create,
  clone: clone,
  tap: tap,
  get: get,
  has: has,
  mapObject: mapObject,
  identity: identity,
  constant: constant,
  noop: noop,
  toPath: toPath$1,
  property: property,
  propertyOf: propertyOf,
  matcher: matcher,
  matches: matcher,
  times: times,
  random: random,
  now: now,
  escape: _escape,
  unescape: _unescape,
  templateSettings: templateSettings,
  template: template,
  result: result,
  uniqueId: uniqueId,
  chain: chain,
  iteratee: iteratee,
  partial: partial,
  bind: bind,
  bindAll: bindAll,
  memoize: memoize,
  delay: delay,
  defer: defer,
  throttle: throttle,
  debounce: debounce,
  wrap: wrap,
  negate: negate,
  compose: compose,
  after: after,
  before: before,
  once: once,
  findKey: findKey,
  findIndex: findIndex,
  findLastIndex: findLastIndex,
  sortedIndex: sortedIndex,
  indexOf: indexOf,
  lastIndexOf: lastIndexOf,
  find: find,
  detect: find,
  findWhere: findWhere,
  each: each,
  forEach: each,
  map: map,
  collect: map,
  reduce: reduce,
  foldl: reduce,
  inject: reduce,
  reduceRight: reduceRight,
  foldr: reduceRight,
  filter: filter,
  select: filter,
  reject: reject,
  every: every,
  all: every,
  some: some,
  any: some,
  contains: contains,
  includes: contains,
  include: contains,
  invoke: invoke,
  pluck: pluck,
  where: where,
  max: max,
  min: min,
  shuffle: shuffle,
  sample: sample,
  sortBy: sortBy,
  groupBy: groupBy,
  indexBy: indexBy,
  countBy: countBy,
  partition: partition,
  toArray: toArray,
  size: size,
  pick: pick,
  omit: omit,
  first: first,
  head: first,
  take: first,
  initial: initial,
  last: last,
  rest: rest,
  tail: rest,
  drop: rest,
  compact: compact,
  flatten: flatten,
  without: without,
  uniq: uniq,
  unique: uniq,
  union: union,
  intersection: intersection,
  difference: difference,
  unzip: unzip,
  transpose: unzip,
  zip: zip,
  object: object,
  range: range,
  chunk: chunk,
  mixin: mixin,
  'default': _$1
});

// Default Export

// Add all of the Underscore functions to the wrapper object.
var _ = mixin(allExports);
// Legacy Node.js API.
_._ = _;

let defaultRelaunchData = {
    detachTable: 'Detaches table and rows',
    toggleColumnResizing: 'Apply or remove component to first row or column',
    switchColumnsOrRows: 'Switch between using columns or rows',
    updateTables: 'Refresh tables already created',
};
async function applyTableSettings(target, source) {
    if (source.template) {
        await setDefaultTemplate(source.template);
        target.template = source.template;
    }
    if (source.matrix) {
        target.matrix = upsert(target.matrix, (item) => _.isEqual(item, source.matrix), source.matrix);
        target.matrix = target.matrix.slice(0, 4);
    }
    if (source.size) {
        target.size = upsert(target.size, (item) => _.isEqual(item, source.size), source.size);
        target.size = target.size.slice(0, 4);
    }
    if (source.cell) {
        target.cell = upsert(target.cell, (item) => _.isEqual(item, source.cell), source.cell);
        target.cell = target.cell.slice(0, 4);
    }
    if (source.alignment) {
        target.alignment = source.alignment;
    }
    target.resizing = source.resizing;
    if (source.header === false || source.header === true) {
        target.header = source.header;
    }
    return target;
}
async function updatePluginVersion(semver) {
    return updateClientStorageAsync_1('pluginVersion', (pluginVersion) => {
        // Remove plugin version from document for now
        if (figma.root.getPluginData('pluginVersion'))
            figma.root.setPluginData('pluginVersion', '');
        return semver || pluginVersion;
    });
}
async function copyTemplatePart(partParent, node, index, templateSettings, tableSettings, rowIndex) {
    // TODO: Copy across overrides like text, and instance swaps
    // Beacuse template will not be as big as table we need to cap the index to the size of the template, therefore copying the last cell
    if (templateSettings.matrix[0] !== '$') {
        if (index > templateSettings.matrix[0] - 1) {
            index = templateSettings.matrix[0] - 1;
        }
    }
    let templateCell = partParent.children[index];
    // Copy across width
    if (tableSettings) {
        let cellWidth;
        if (tableSettings.cell[0] === '$') {
            cellWidth = templateCell.width;
        }
        else {
            cellWidth = tableSettings.cell[0];
        }
        if (cellWidth && cellWidth !== 'FILL' && cellWidth !== 'HUG') {
            node.resizeWithoutConstraints(cellWidth, node.height);
        }
        // If templateCell === FILL
        if (templateCell.layoutGrow === 1 && tableSettings.cell[0] === '$') {
            node.layoutGrow = 1;
        }
        // If templateCell === HUG
        if (templateCell.layoutGrow === 0 && templateCell.counterAxisSizingMode === 'AUTO' && tableSettings.cell[0] === '$') {
            node.layoutGrow = 0;
            node.counterAxisSizingMode = 'AUTO';
        }
        // Change size of cells
        if (tableSettings.size[0] && tableSettings.size[0] !== 'HUG' && tableSettings.cell[0] !== '$') {
            node.layoutGrow = 1;
        }
    }
    // // Set component properties on instances
    // if (templateCell.componentProperties) {
    // 	node.setProperties(extractValues(templateCell.componentProperties))
    // }
    // // Add table numbering
    // if (rowIndex || rowIndex === 0) {
    // 	let templateText = templateCell.findOne((node) => node.name === 'Text')
    // 	if (templateText) {
    // 		let number = convertToNumber(templateText.characters)
    // 		if (Number(number)) {
    // 			let tableText = node.findOne((node) => node.name === 'Text')
    // 			await figma.loadFontAsync(templateText.fontName)
    // 			if (tableText) {
    // 				tableText.characters = (number + rowIndex).toString()
    // 			}
    // 		}
    // 	}
    // }
}
async function createTable(templateComponent, settings, type) {
    // FIXME: Get it to work with parts which are not components as well
    // FIXME: Check for imported components
    // FIXME: Check all conditions are met. Is table, is row, is cell, is instance etc.
    let part = getTemplateParts$1(templateComponent);
    let tableInstance;
    // Santitize data
    settings.matrix[0] = convertToNumber(settings.matrix[0]);
    settings.matrix[1] = convertToNumber(settings.matrix[1]);
    settings.size[0] = convertToNumber(settings.size[0]);
    settings.size[1] = convertToNumber(settings.size[1]);
    settings.cell[0] = convertToNumber(settings.cell[0]);
    settings.cell[1] = convertToNumber(settings.cell[1]);
    // Could be better. Need a way to avoid mutating original object (settings)
    let tableSettings = {
        matrix: [settings.matrix[0], settings.matrix[1]],
        size: [settings.size[0], settings.size[1]],
        cell: [settings.cell[0], settings.cell[1]],
    };
    if (!part.table || !part.tr || !part.td || (!part.th && settings.header)) {
        let array = [];
        part.table ? null : array.push('table');
        part.tr ? null : array.push('row');
        !part.th && settings.header ? array.push('header') : null;
        part.td ? null : array.push('cell');
        if (array.length > 1) {
            figma.notify(`Template parts "${array.join(', ')}" not configured`);
        }
        else {
            figma.notify(`Template part "${array.join(', ')}" not configured`);
        }
        tableInstance = false;
    }
    else {
        let templateSettings = getTableSettings(part.table);
        // Get settings from template
        if (settings.matrix[0] === '$') {
            tableSettings.matrix[0] = templateSettings.matrix[0];
        }
        if (settings.matrix[1] === '$') {
            tableSettings.matrix[1] = templateSettings.matrix[1];
        }
        if (settings.size[0] === '$') {
            tableSettings.size[0] = templateSettings.size[0];
        }
        if (settings.size[1] === '$') {
            tableSettings.size[1] = templateSettings.size[1];
        }
        // Can't set this here because needs to happen inside template
        // if (settings.table.cell[0][0] === '$') {
        // 	tableSettings.table.cell[0][0] = templateSettings.table.size[0][0]
        // }
        if (settings.cell[1] === '$') {
            tableSettings.cell[1] = templateSettings.cell[0][1];
        }
        tableInstance = convertToFrame_1(templateComponent.clone());
        var table;
        if (part.table.id === templateComponent.id) {
            if (type === 'COMPONENT') {
                table = convertToComponent_1(tableInstance);
                tableInstance = table;
            }
            else {
                table = tableInstance;
            }
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
        if (settings.resizing && type !== 'COMPONENT') {
            // First row should be a component
            firstRow = convertToComponent_1(part.tr.clone());
            firstRow.layoutAlign = part.tr.layoutAlign;
            firstRow.primaryAxisSizingMode = part.tr.primaryAxisSizingMode;
            // Don't apply if layer already ignored
            if (!firstRow.name.startsWith('.') && !firstRow.name.startsWith('_')) {
                // Add dot to name do that component is not published
                firstRow.name = '.' + firstRow.name;
            }
            setPluginData_1(firstRow, 'elementSemantics', { is: 'tr' });
        }
        else {
            // First row should be a frame
            firstRow = convertToFrame_1(part.tr.clone());
            setPluginData_1(firstRow, 'elementSemantics', { is: 'tr' });
        }
        rowParent.insertChild(rowIndex, firstRow);
        removeChildren(firstRow);
        // If height specified then make rows grow to height
        // Change size of cells
        if (tableSettings.size[1] && tableSettings.size[1] !== 'HUG') {
            firstRow.layoutGrow = 1;
        }
        // If Height of cell defined then resize row height
        let cellHeight;
        if (tableSettings.cell[1] === '$') {
            cellHeight = templateCell.height;
        }
        else {
            cellHeight = tableSettings.cell[1];
        }
        if (cellHeight && cellHeight !== 'FILL' && cellHeight !== 'HUG') {
            firstRow.resizeWithoutConstraints(firstRow.width, cellHeight);
            firstRow.layoutGrow = 0;
            firstRow.counterAxisSizingMode = 'FIXED';
        }
        // MANDATORY PROP as can't guarentee user will or figma will honour this
        firstRow.layoutAlign = 'STRETCH';
        // Create columns in first row
        for (let i = 0; i < tableSettings.matrix[0]; i++) {
            var duplicateCell;
            if (part.td.type === 'COMPONENT') {
                duplicateCell = part.td.clone();
            }
            if (part.td.type === 'INSTANCE') {
                duplicateCell = part.td.mainComponent.createInstance();
            }
            setPluginData_1(duplicateCell, 'elementSemantics', { is: 'td' });
            firstRow.appendChild(duplicateCell);
            copyTemplatePart(part.table.children[1], duplicateCell, i, templateSettings, tableSettings);
            duplicateCell.primaryAxisAlignItems = settings.alignment[0];
            // We want to always force the cells to stretch to height of row regardless of users settings
            duplicateCell.layoutAlign = 'STRETCH';
            // The property below would need to be applied to if I wanted to force this. Normally inherited from cell
            duplicateCell.primaryAxisSizingMode = 'FIXED';
        }
        // Create rest of rows
        for (var r = tableSettings.matrix[1] - 2; r >= 0; r--) {
            var duplicateRow;
            if (firstRow.type === 'COMPONENT') {
                duplicateRow = firstRow.createInstance();
                // BUG: isn't copying across layoutAlign, so we have to do it manually
                duplicateRow.layoutAlign = firstRow.layoutAlign;
            }
            else {
                duplicateRow = firstRow.clone();
            }
            if (tableSettings.size[1] && tableSettings.size[1] !== 'HUG') {
                duplicateRow.layoutGrow = 1;
            }
            // If using columnResizing and header swap non headers to default cells
            if (settings.resizing && type !== 'COMPONENT' && settings.header) {
                for (let i = 0; i < duplicateRow.children.length; i++) {
                    var cell = duplicateRow.children[i];
                    // cell.swapComponent(part.th)
                    // FIXME: Check if instance or main component
                    cell.mainComponent = part.td.mainComponent;
                    setPluginData_1(cell, 'elementSemantics', { is: 'td' });
                    // Set component properties on instances
                    // cell.setProperties(extractValues(part.td.componentProperties))
                    copyTemplatePart(part.table.children[1], cell, i, templateSettings, null);
                    // Needs to be applied here too
                    cell.primaryAxisSizingMode = 'FIXED';
                    cell.primaryAxisAlignItems = settings.alignment[0];
                }
            }
            rowParent.insertChild(rowIndex + 1, duplicateRow);
        }
        // Swap first row to use header cell
        if (settings.header && part.th) {
            for (var i = 0; i < firstRow.children.length; i++) {
                var child = firstRow.children[i];
                // FIXME: Check if instance or main component
                child.swapComponent(part.th.mainComponent);
                setPluginData_1(child, 'elementSemantics', { is: 'th' });
                // // Set component properties on instances
                // if (part.th.componentProperties) {
                // 	child.setProperties(extractValues(part.th.componentProperties))
                // }
                // Need first row which is the header
                copyTemplatePart(part.table.children[0], child, i, templateSettings, null);
                // child.mainComponent = part.th.mainComponent
                child.primaryAxisAlignItems = settings.alignment[0];
            }
        }
        tableInstance.setRelaunchData(defaultRelaunchData);
        // Set width of table
        if (tableSettings.size[0] && !(typeof tableSettings.size[0] === 'string')) {
            tableInstance.resize(convertToNumber(tableSettings.size[0]), tableInstance.height);
        }
        if (tableSettings.size[1] && !(typeof tableSettings.size[1] === 'string')) {
            tableInstance.resize(tableInstance.width, convertToNumber(tableSettings.size[1]));
        }
        if (tableSettings.size[0] === 'HUG') {
            tableInstance.counterAxisSizingMode = 'AUTO';
        }
        if (tableSettings.size[1] === 'HUG') {
            tableInstance.primaryAxisSizingMode = 'AUTO';
        }
        return tableInstance;
    }
}
class File {
    constructor(data) {
        // TODO: if fileId doesn't exist then create random ID and set fileId
        this.id = getDocumentData_1('fileId') || setDocumentData_1('fileId', genRandomId());
        // this.name = `{figma.getNodeById("0:1").name}`
        this.name = figma.root.name;
        if (data)
            this.data = data;
    }
}
class Template {
    constructor(node) {
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
}
function getLocalTemplatesWithoutUpdating() {
    figma.skipInvisibleInstanceChildren = true;
    var templates = [];
    var components = figma.root.findAllWithCriteria({
        types: ['COMPONENT'],
    });
    for (let i = 0; i < components.length; i++) {
        let node = components[i];
        var templateData = getPluginData_1(node, 'template');
        if (templateData && node.type === 'COMPONENT') {
            templateData.id = node.id;
            templateData.name = node.name;
            templateData.name = node.name;
            templateData.component.id = node.id;
            // KEY needs updating if template duplicated
            templateData.component.key = node.key;
            // Update file id incase component moved to another file. Is this needed? Maybe when passed around as an instance
            // We need to generate the fileId here because it's needed for the UI to check if template is local or not and we can't rely on the recentFiles to do it, because it's too late at that point.
            let fileId = getDocumentData_1('fileId') || genUID_1();
            templateData.file.id = fileId;
            templates.push(templateData);
        }
    }
    return templates;
}
function getLocalTemplates() {
    figma.skipInvisibleInstanceChildren = true;
    var templates = [];
    var components = figma.root.findAllWithCriteria({
        types: ['COMPONENT'],
    });
    for (let i = 0; i < components.length; i++) {
        let node = components[i];
        var templateData = getPluginData_1(node, 'template');
        if (templateData && node.type === 'COMPONENT') {
            // ID could update if copied to another file
            templateData.id = node.id;
            templateData.name = node.name;
            templateData.component.id = node.id;
            // KEY needs updating if template duplicated
            templateData.component.key = node.key;
            // Update file id incase component moved to another file. Is this needed? Maybe when passed around as an instance
            // We need to generate the fileId here because it's needed for the UI to check if template is local or not and we can't rely on the recentFiles to do it, because it's too late at that point.
            let fileId = getDocumentData_1('fileId') || genUID_1();
            templateData.file.id = fileId;
            setPluginData_1(node, 'template', templateData);
            templates.push(templateData);
        }
    }
    // figma.root.findAll((node) => {
    // 	var templateData = getPluginData(node, 'template')
    // 	if (templateData && node.type === 'COMPONENT') {
    // 		// ID could update if copied to another file
    // 		templateData.id = node.id
    // 		templateData.name = node.name
    // 		templateData.component.id = node.id
    // 		// KEY needs updating if template duplicated
    // 		templateData.component.key = node.key
    // 		// Update file id incase component moved to another file
    // 		templateData.file.id = getDocumentData('fileId')
    // 		setPluginData(node, 'template', templateData)
    // 		templates.push(templateData)
    // 	}
    // })
    return templates;
}
async function setDefaultTemplate(templateData) {
    await getRemoteFilesAsync_1();
    await getRecentFilesAsync_1(getLocalTemplates());
    let currentFileId = getDocumentData_1('fileId');
    await updateClientStorageAsync_1('recentTables', (recentTables) => {
        recentTables = recentTables || [];
        recentTables = upsert(recentTables, (item) => item.template.component.key === templateData.component.key && item.file.id === currentFileId, {
            template: templateData,
            file: { id: currentFileId },
        });
        recentTables = recentTables.slice(0, 10);
        let defaultTemplate = recentTables[0].template;
        try {
            figma.ui.postMessage({
                type: 'post-default-template',
                defaultTemplate,
                localTemplates: getLocalTemplates(),
            });
        }
        catch (e) {
            console.log(e);
        }
        return recentTables;
    });
}
async function getDefaultTemplate() {
    // let { table } = await getClientStorageAsync('userPreferences')
    let recentTables = (await getClientStorageAsync_1('recentTables')) || [];
    let defaultTemplates = recentTables;
    let fileId = getDocumentData_1('fileId');
    let defaultTemplate;
    if (defaultTemplates.length > 0) {
        let lastTemplateUsedWithFile = defaultTemplates.find((item) => item.file.id === fileId);
        if (lastTemplateUsedWithFile) {
            defaultTemplate = lastTemplateUsedWithFile.template;
        }
    }
    let localTemplates = getLocalTemplatesWithoutUpdating();
    let remoteFiles = getDocumentData_1('remoteFiles');
    if (defaultTemplate && !isEmpty$1(defaultTemplate)) {
        if (defaultTemplate.file.id === fileId) {
            let templateComponent = getComponentByIdAndKey(defaultTemplate.component.id, defaultTemplate.component.key);
            if (!templateComponent) {
                if (localTemplates.length > 0) {
                    defaultTemplate = localTemplates[0];
                }
                else if (remoteFiles.length > 0) {
                    defaultTemplate = remoteFiles[0].data[0];
                }
            }
        }
        else {
            let templateComponent = await lookForComponent(defaultTemplate);
            if (!templateComponent) {
                if (remoteFiles.length > 0) {
                    defaultTemplate = remoteFiles[0].data[0];
                }
                else if (localTemplates.length > 0) {
                    defaultTemplate = localTemplates[0];
                }
            }
        }
    }
    else {
        // In the event defaultTemplate not set, but there are templates
        if ((localTemplates === null || localTemplates === void 0 ? void 0 : localTemplates.length) > 0) {
            defaultTemplate = localTemplates[0];
        }
        else if ((remoteFiles === null || remoteFiles === void 0 ? void 0 : remoteFiles.length) > 0) {
            defaultTemplate = remoteFiles[0].data[0];
        }
    }
    return defaultTemplate;
}
async function updateTables(template) {
    var templateComponent = await lookForComponent(template);
    // FIXME: Template file name not up to date for some reason
    let pages = figma.root.children;
    figma.notify(`Updating tables on page 1 of ${pages.length}...`);
    await sleep();
    let handler = {};
    for (let p = 0; p < pages.length; p++) {
        let page = pages[p];
        if (handler === null || handler === void 0 ? void 0 : handler.cancel) {
            handler.cancel();
        }
        handler = figma.notify(`Updating tables on page ${p + 1} of ${pages.length}...`, { timeout: 1 });
        await sleep();
        var tables = page.findAll((node) => { var _a; return ((_a = getPluginData_1(node, 'template')) === null || _a === void 0 ? void 0 : _a.id) === template.id && node.type === 'FRAME'; });
        if (templateComponent && tables) {
            var rowTemplate = templateComponent.findOne((node) => { var _a; return ((_a = getPluginData_1(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === 'tr'; });
            for (let b = 0; b < tables.length; b++) {
                var table = tables[b];
                // Don't apply if an instance
                if (table.type !== 'INSTANCE') {
                    console.log(`Updating table ${b + 1} of ${tables.length} on page ${p + 1}`);
                    copyPasteStyle(templateComponent, table, { exclude: ['name', 'layoutMode'] });
                    table.findAll((node) => {
                        var _a;
                        if ((((_a = getPluginData_1(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === 'tr') === true && node.type !== 'INSTANCE') {
                            copyPasteStyle(rowTemplate, node, { exclude: ['name', 'layoutMode'] });
                        }
                    });
                }
            }
        }
    }
}
function getTableSettings(tableNode) {
    var _a, _b, _c;
    let rowCount = 0;
    let columnCount = 0;
    let usingColumnsOrRows = null;
    let table = {
        matrix: [0, 0],
        size: [0, 0],
        cell: ['FILL', 'FILL'],
        alignment: ['MIN', 'MIN'],
        resizing: true,
        header: true,
        axis: 'COLUMNS',
    };
    for (let i = 0; i < tableNode.children.length; i++) {
        var node = tableNode.children[i];
        if (((_a = getPluginData_1(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === 'tr') {
            rowCount++;
        }
    }
    let firstRow = tableNode.findOne((node) => { var _a; return ((_a = getPluginData_1(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === 'tr'; });
    let firstCell = firstRow.findOne((node) => { var _a, _b; return ((_a = getPluginData_1(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === 'td' || ((_b = getPluginData_1(node, 'elementSemantics')) === null || _b === void 0 ? void 0 : _b.is) === 'th'; });
    if (firstRow.parent.layoutMode === 'VERTICAL') {
        usingColumnsOrRows = 'ROWS';
    }
    if (firstRow.parent.layoutMode === 'HORIZONTAL') {
        usingColumnsOrRows = 'COLUMNS';
    }
    for (let i = 0; i < firstRow.children.length; i++) {
        var node = firstRow.children[i];
        var cellType = (_b = getPluginData_1(node, 'elementSemantics')) === null || _b === void 0 ? void 0 : _b.is;
        if (cellType === 'td' || cellType === 'th') {
            columnCount++;
        }
    }
    table.matrix = [columnCount, rowCount];
    table.alignment = [firstCell.primaryAxisAlignItems, firstCell.counterAxisAlignItems];
    table.size = [
        (() => {
            if (tableNode.counterAxisSizingMode === 'AUTO') {
                return 'HUG';
            }
            else {
                return tableNode.width;
            }
        })(),
        (() => {
            if (tableNode.primaryAxisSizingMode === 'AUTO') {
                return 'HUG';
            }
            else {
                return tableNode.height;
            }
        })(),
    ];
    table.axis = usingColumnsOrRows;
    table.header = ((_c = getPluginData_1(firstCell, 'elementSemantics')) === null || _c === void 0 ? void 0 : _c.is) === 'th' ? true : false;
    table.resizing = firstRow.type === 'COMPONENT' ? true : false;
    return Object.assign({}, table);
}

function sleep$1(ms = 0) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
// // 9s for 45k nodes
// let count = 0
// async function traverseNodes() {
// 	console.log('Recursive generator method')
// 	function* processData(nodes) {
// 		const len = nodes.length
// 		if (len === 0) {
// 			return
// 		}
// 		for (var i = 0; i < len; i++) {
// 			var node = nodes[i]
// 			yield node
// 			let children = node.children
// 			if (children) {
// 				yield* processData(children)
// 			}
// 		}
// 	}
// 	var it = processData(figma.root.children)
// 	var res = it.next()
// 	let tables = []
// 	while (!res.done) {
// 		let node = res.value
// 		if (node.getPluginData('isTable') === 'true' && node.type !== 'COMPONENT') {
// 			count++
// 			tables.push(node)
// 		}
// 		res = it.next()
// 	}
// 	await sleep()
// 	figma.notify(`Updating table ${count}`, { timeout: 1 })
// 	console.log(tables)
// }
//TODO: Is it easier to ask the user to import and select their own components?
// 1. Hi, I'm tablo. My creator made me so I could help you upgrade to the shiny new version of Table Creator.
// 2. I notice you don't have a table or row component. Unfortunately you won't be able to continue using this plugin, only kidding. I just need to create some
// 1. The way table creator works is slightly different now. Instead of relying on a single cell component to create tables from. Table Creator now use a table component as a template. As part of this upgrade I'm going to hopefully successfully upgrade your existing components to work with the new version of Table Creator. Unfortunately because of the way plugins work without this making this upgrade you won't be able to continue using the plugin. You can either follow this upgrade, or start from scratch and try and link your old components.
// 2. First I'll look to see if I can find a table component. If you don't have one I'll create one for you. This will be used as the main template that new tables are created from.
// 3. Next I'll look to see if you have a row component. If you don't
// let tableInstance = createTable(getTemplateParts(templateComponent), msg.data, 'COMPONENT')
function cleanupOldPluginData() {
    let notify = figma.notify('Cleaning up old plugin data...');
    let keys = ['cellComponentID', 'cellHeaderComponentID', 'rowComponentID', 'tableComponentID'];
    keys.forEach((element) => {
        figma.root.setPluginData(element, '');
    });
    notify.cancel();
}
function cleanUpOldTooltips(componentPage) {
    componentPage.findOne((node) => {
        if (node.characters ===
            'Customise the following components to create bespoke tables. Or to link using your own components go to Plugins > Table Creator > Settings. You can move and rename the components as you wish. The only component which must exist for the plugin to work is the Cell component.') {
            node.remove();
        }
    });
    componentPage.findOne((node) => {
        if (node.characters ===
            'The Cell component is the only component required for Table Creator to create tables from. You can cutomise this component, or link the plugin to a different Cell component by running Plugins > Table Creator > Settings.') {
            node.remove();
        }
    });
    componentPage.findOne((node) => {
        if (node.characters === 'Only layer styles such as: background, color, border radius etc will be used for rows when creating tables.') {
            node.remove();
        }
    });
    componentPage.findOne((node) => {
        if (node.characters ===
            `Only layer styles such as: background, color, border radius etc will be used to create tables. You don't have to create tables using the plugin. You can also create tables by creating an instance of this component and detaching them and their rows. If you change the styles used on the table or row components you can update existing tables by going to Plugins > Table Creator > Settings and select Refresh Tables`) {
            node.remove();
        }
    });
}
function createTemplateComponent() {
    let cellComponent = getComponentById(figma.root.getPluginData('cellComponentID'));
    // TODO: Set semantics
    setPluginData_1(cellComponent, `elementSemantics`, { is: 'td' });
    let headerComponent = getComponentById(figma.root.getPluginData('cellHeaderComponentID'));
    if (headerComponent)
        setPluginData_1(headerComponent, `elementSemantics`, { is: 'th' });
    let rowComponent = getComponentById(figma.root.getPluginData('rowComponentID')) || figma.createComponent();
    setPluginData_1(rowComponent, `elementSemantics`, { is: 'tr' });
    // Apply styling to row
    removeChildren(rowComponent);
    rowComponent.name = getComponentById(figma.root.getPluginData('rowComponentID')).name || '_Row';
    rowComponent.layoutMode = 'HORIZONTAL';
    rowComponent.primaryAxisSizingMode = 'AUTO';
    rowComponent.counterAxisSizingMode = 'AUTO';
    rowComponent.clipsContent = true;
    let cellInstance1 = cellComponent.createInstance();
    let cellInstance2 = cellComponent.createInstance();
    rowComponent.appendChild(cellInstance1);
    rowComponent.appendChild(cellInstance2);
    // We need to clone it because we don't want it to affect existing components
    let tableComponent = getComponentById(figma.root.getPluginData('tableComponentID'));
    let templateComponent;
    if (tableComponent) {
        templateComponent = tableComponent;
    }
    else {
        templateComponent = figma.createComponent();
        if (getComponentById(figma.root.getPluginData('rowComponentID'))) {
            templateComponent.y = rowComponent.y + rowComponent.height + 120;
            templateComponent.x = rowComponent.x;
        }
        else {
            templateComponent.y = cellComponent.parent.y + cellComponent.height + 120;
            templateComponent.x = cellComponent.x;
        }
    }
    // let templateComponent = tableComponent ? tableComponent.clone() : figma.createComponent()
    setPluginData_1(templateComponent, `elementSemantics`, { is: 'table' });
    // Apply styling to table
    removeChildren(templateComponent);
    templateComponent.name = getComponentById(figma.root.getPluginData('tableComponentID')).name || 'Table 1';
    templateComponent.layoutMode = 'VERTICAL';
    templateComponent.primaryAxisSizingMode = 'AUTO';
    templateComponent.counterAxisSizingMode = 'AUTO';
    let rowInstance1 = rowComponent.createInstance();
    let rowInstance2 = rowComponent.createInstance();
    let rowInstance3 = rowComponent.createInstance();
    // BUG: isn't copying across layoutAlign, so we have to do it manually
    rowInstance1.layoutAlign = 'STRETCH';
    rowInstance2.layoutAlign = 'STRETCH';
    rowInstance3.layoutAlign = 'STRETCH';
    rowInstance1.primaryAxisSizingMode = 'FIXED';
    rowInstance2.primaryAxisSizingMode = 'FIXED';
    rowInstance3.primaryAxisSizingMode = 'FIXED';
    templateComponent.appendChild(rowInstance1);
    templateComponent.appendChild(rowInstance2);
    templateComponent.appendChild(rowInstance3);
    // Swap header cells
    if (headerComponent) {
        rowInstance1.children[0].swapComponent(headerComponent);
        rowInstance1.children[1].swapComponent(headerComponent);
    }
    // Remove row component if user didn't have them
    if (!getComponentById(figma.root.getPluginData('rowComponentID')))
        rowComponent.remove();
    return templateComponent;
}
async function upgradeOldTablesToNewTables(templateData) {
    // figma.skipInvisibleInstanceChildren = true
    // let notify1 = figma.notify(`Updating tables...`)
    let pages = figma.root.children;
    // await sleep()
    let handler = {};
    for (let p = 0; p < pages.length; p++) {
        let page = pages[p];
        console.log(`Scanning page ${p + 1} of ${pages.length}`);
        if (handler === null || handler === void 0 ? void 0 : handler.cancel) {
            handler.cancel();
        }
        handler = figma.notify(`Scanning page ${p + 1} of ${pages.length} for tables...`, { timeout: 1 });
        await sleep$1();
        // // Get all the old tables
        // let tableFrames = page.findAllWithCriteria({ types: ['FRAME'] })
        // let tables = []
        // for (let i = 0; i < tableFrames.length; i++) {
        // 	let tableFrame = tableFrames[i]
        // 	if (tableFrame.getPluginData('isTable')) {
        // 		tables.push(tableFrame)
        // 	}
        // }
        let tables = page.findAll((node) => node.getPluginData('isTable') === 'true' && node.type !== 'COMPONENT');
        for (let i = 0; i < tables.length; i++) {
            let table = tables[i];
            console.log(`Updating table ${i + 1} of ${tables.length} on page ${p + 1}`);
            if (handler === null || handler === void 0 ? void 0 : handler.cancel) {
                handler.cancel();
            }
            // Remove old plugin data from table
            table.setPluginData(`isTable`, '');
            // Add template details to table
            setPluginData_1(table, `template`, templateData);
            // Add new plugin data to table
            setPluginData_1(table, `elementSemantics`, { is: 'table' });
            let rows = table.findAll((node) => node.getPluginData('isRow') === 'true');
            for (let r = 0; r < rows.length; r++) {
                let row = rows[r];
                // Should not matter what type of node
                // Remove old plugin data from row
                row.setPluginData(`isRow`, '');
                // Add new plugin data to row
                setPluginData_1(row, `elementSemantics`, { is: 'tr' });
                let cells = row.findAll((node) => node.getPluginData('isCell') === 'true');
                let headerCells = row.findAll((node) => node.getPluginData('isHeaderCell') === 'true');
                for (let c = 0; c < cells.length; c++) {
                    var cell = cells[c];
                    cell.setPluginData(`isCell`, '');
                    setPluginData_1(cell, `elementSemantics`, { is: 'td' });
                }
                for (let h = 0; h < headerCells.length; h++) {
                    var headerCell = headerCells[h];
                    headerCell.setPluginData(`isCellHeader`, '');
                    setPluginData_1(headerCell, `elementSemantics`, { is: 'th' });
                }
            }
        }
    }
}
async function upgradeOldComponentsToTemplate() {
    if (getComponentById(figma.root.getPluginData('cellComponentID'))) {
        const templateComponent = createTemplateComponent();
        // Add template data and relaunch data to templateComponent
        let templateData = new Template(templateComponent);
        await upgradeOldTablesToNewTables(templateData);
        figma.currentPage = getPageNode_1(templateComponent);
        setPluginData_1(templateComponent, 'template', templateData);
        templateComponent.setRelaunchData(defaultRelaunchData);
        setDefaultTemplate(templateData);
        let tooltip = await createTooltip('Your table components have been converted into a template. A template is a single component used by Table Creator to create tables from.', figma.currentPage.backgrounds[0].color);
        tooltip.x = templateComponent.x + templateComponent.width + 80;
        tooltip.y = templateComponent.y - 10;
        let componentPage = getPageNode_1(templateComponent);
        componentPage.appendChild(tooltip);
        figma.currentPage.selection = [templateComponent, tooltip];
        figma.viewport.scrollAndZoomIntoView([templateComponent, tooltip]);
        cleanUpOldTooltips(componentPage);
        cleanupOldPluginData();
    }
}

// FIXME: Recent files not adding unique files only DONE
// FIXME: Duplicated file default template not selected by default in UI (undefined, instead of local components)
// FIXME: Column resizing doesn't work on table without headers
// FIXME: When turning column resizing off component does not resize with table DONE
// TODO: Consider removing number when creating table
// TODO: When template renamed, default data no updated
// TODO: Should default template be stored in usersPreferences? different for each file
console.clear();
// figma.clientStorage.deleteAsync('recentFiles')
// figma.clientStorage.deleteAsync('pluginVersion')
// figma.root.setPluginData('remoteFiles', '')
// figma.root.setPluginData('fileId', '')
// figma.root.setPluginData('defaultTemplate', '')
// figma.clientStorage.deleteAsync('userPreferences')
// figma.clientStorage.deleteAsync('recentTables')
function addUniqueToArray(object, array) {
    // // Only add new template if unique
    var index = array.findIndex((x) => x.id === object.id);
    index === -1 ? array.push(object) : false;
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
function addElement(element) {
    let node = figma.currentPage.selection[0];
    if (node.type === 'INSTANCE') {
        setPluginData_1(node.mainComponent, 'elementSemantics', { is: element });
        // TODO: Add relaunch data for selecting row or column if td
    }
    else {
        setPluginData_1(node, 'elementSemantics', { is: element });
    }
}
function removeElement(nodeId, element) {
    let node = figma.getNodeById(nodeId);
    let templateContainer = node.type === 'COMPONENT' ? node : getParentComponent(node);
    templateContainer.findAll((node) => {
        var _a;
        if (((_a = getPluginData_1(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === element) {
            if (node.type === 'INSTANCE') {
                setPluginData_1(node.mainComponent, 'elementSemantics', '');
            }
            else {
                setPluginData_1(node, 'elementSemantics', '');
            }
        }
    });
    // TODO: Remove relaunch data for selecting row or column if td
    if (element === 'table') {
        setPluginData_1(templateContainer, 'elementSemantics', '');
    }
}
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
function getTemplateParts(templateNode) {
    // find nodes with certain pluginData
    let elements = ['tr', 'td', 'th', 'table'];
    let results = {};
    // Loop though element definitions and find them in the template
    for (let i = 0; i < elements.length; i++) {
        let elementName = elements[i];
        let parts = templateNode.findOne((node) => {
            let elementSemantics = getPluginData_1(node, 'elementSemantics');
            if ((elementSemantics === null || elementSemantics === void 0 ? void 0 : elementSemantics.is) === elementName) {
                return true;
            }
        });
        results[elementName] = parts;
    }
    if (!results['table']) {
        if (getPluginData_1(templateNode, 'elementSemantics').is === 'table') {
            results['table'] = templateNode;
        }
    }
    // // For instances assign the mainComponent as the parts
    // for (let [key, value] of Object.entries(results)) {
    // 	if (value.type === "INSTANCE") {
    // 		results[key] = value.mainComponent
    // 	}
    // }
    return results;
}
function postCurrentSelection(templateNodeId) {
    let selection;
    function isInsideTemplate(node) {
        let parentComponent = node.type === 'COMPONENT' ? node : getParentComponent(node);
        if ((isInsideComponent(node) || node.type === 'COMPONENT') && parentComponent) {
            if (getPluginData_1(parentComponent, 'template') && parentComponent.id === templateNodeId) {
                return true;
            }
        }
    }
    function postSelection() {
        var _a;
        let sel = figma.currentPage.selection[0];
        if (figma.currentPage.selection.length === 1 &&
            isInsideTemplate(figma.currentPage.selection[0]) &&
            (sel.type === 'COMPONENT' || sel.type === 'FRAME' || sel.type === 'INSTANCE')) {
            let semanticName = (_a = getPluginData_1(figma.currentPage.selection[0], 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is;
            selection = {
                element: semanticName,
                name: getSelectionName(figma.currentPage.selection[0]),
                longName: (() => {
                    if (semanticName === 'table') {
                        return 'Table';
                    }
                    if (semanticName === 'tr') {
                        return 'Row';
                    }
                    if (semanticName === 'td') {
                        return 'Cell';
                    }
                    if (semanticName === 'th') {
                        return 'Header Cell';
                    }
                })(),
            };
            figma.ui.postMessage({ type: 'current-selection', selection: selection });
        }
        else {
            figma.ui.postMessage({ type: 'current-selection', selection: undefined });
        }
    }
    postSelection();
    figma.on('selectionchange', () => {
        postSelection();
    });
}
function selectTableCells(direction) {
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
        var rowIndex = children.findIndex((x) => x.id === selection[i].parent.id);
        var columnIndex = children[rowIndex].children.findIndex((x) => x.id === selection[i].id);
        for (let i = 0; i < children.length; i++) {
            if (direction === 'parallel') {
                if (children[i].children) {
                    if (children[i].children[columnIndex] && !regex.test(children[i].children[columnIndex].parent.name)) {
                        newSelection.push(clone$1(children[i].children[columnIndex]));
                    }
                }
            }
            if (direction === 'adjacent') {
                var cell = children[rowIndex];
                for (let b = 0; b < cell.children.length; b++) {
                    if (cell.children) {
                        if (cell.children[b] && !regex.test(cell.children[b].parent.name)) {
                            newSelection.push(clone$1(cell.children[b]));
                        }
                    }
                }
            }
        }
    }
    figma.currentPage.selection = newSelection;
}
// Commands
function detachTable(selection) {
    let newSelection = [];
    for (let i = 0; i < selection.length; i++) {
        let table = selection[i];
        if (table.type === 'INSTANCE') {
            table = table.detachInstance();
            newSelection.push(table);
        }
        if (table.type !== 'COMPONENT') {
            table.findAll((node) => {
                var _a;
                if (((_a = getPluginData_1(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === 'tr') {
                    if (node.type === 'INSTANCE') {
                        node.detachInstance();
                    }
                    if (node.type === 'COMPONENT') {
                        let oldLayout = node.layoutAlign;
                        // FIXME: Replace function, or convertToFrame not copying layoutAlign?
                        node = replace_1(node, convertToFrame_1);
                        node.layoutAlign = oldLayout;
                    }
                }
            });
            newSelection.push(table);
        }
        // Remove dot from nodes used as column resizing
        table.findAll((node) => {
            var _a;
            if (((_a = getPluginData_1(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === 'tr') {
                node.name = node.name.replace(/^./, '');
            }
        });
    }
    figma.currentPage.selection = newSelection;
    return newSelection;
}
async function toggleColumnResizing(selection) {
    // FIXME: Something weird happening with resizing of cell/text
    // FIXME: check width fill, fixed, fill when applied
    var _a, _b, _c;
    let newSelection = [];
    let discardBucket = [];
    let firstTableColumnResizing;
    let result = false;
    for (let i = 0; i < selection.length; i++) {
        var oldTable = selection[i];
        if (oldTable.type !== 'COMPONENT') {
            let settings = getTableSettings(oldTable);
            if (i === 0) {
                firstTableColumnResizing = settings.resizing;
            }
            if (firstTableColumnResizing) {
                let [newTable] = detachTable([oldTable]);
                result = 'removed';
                newSelection.push(newTable);
            }
            else {
                result = 'applied';
                settings.resizing = !firstTableColumnResizing;
                // BUG: Apply fixed width to get around a bug in Figma API that causes table to go wild
                let oldTablePrimaryAxisSizingMode = oldTable.primaryAxisSizingMode;
                oldTable.primaryAxisSizingMode = 'FIXED';
                let newTable = await createTable(oldTable, settings);
                // copyPaste(oldTable, newTable, { include: ['x', 'y', 'name'] })
                // Loop new table and replace with cells from old table
                let rowLength = oldTable.children.length;
                for (let a = 0; a < rowLength; a++) {
                    let nodeA = oldTable.children[a];
                    if (((_a = getPluginData_1(nodeA, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === 'tr') {
                        let columnLength = nodeA.children.length;
                        for (let b = 0; b < columnLength; b++) {
                            let nodeB = nodeA.children[b];
                            if (((_b = getPluginData_1(nodeB, 'elementSemantics')) === null || _b === void 0 ? void 0 : _b.is) === 'td' || ((_c = getPluginData_1(nodeB, 'elementSemantics')) === null || _c === void 0 ? void 0 : _c.is) === 'th') {
                                let newTableCell = newTable.children[a].children[b];
                                let oldTableCell = nodeB;
                                newTableCell.swapComponent(oldTableCell.mainComponent);
                                await swapInstance(oldTableCell, newTableCell);
                                // replace(newTableCell, oldTableCell)
                                // newTableCell.swapComponent(oldTableCell.mainComponent)
                                resize_1(newTableCell, oldTableCell.width, oldTableCell.height);
                                // Old layoutAlign not being preserved
                                newTableCell.layoutAlign = oldTableCell.layoutAlign;
                            }
                        }
                    }
                }
                // BUG: Apply fixed width to get around a bug in Figma API that causes table to go wild
                newTable.primaryAxisSizingMode = oldTablePrimaryAxisSizingMode;
                newSelection.push(newTable);
                discardBucket.push(oldTable);
            }
        }
    }
    figma.currentPage.selection = newSelection;
    for (let i = 0; i < discardBucket.length; i++) {
        discardBucket[i].remove();
    }
    return result;
}
function switchColumnsOrRows(selection) {
    let vectorType;
    function isRow(node) {
        var _a;
        return ((_a = getPluginData_1(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === 'tr';
    }
    // TODO: Fix localise component to take account of rows or columns
    // FIXME: Change cell to
    let settings;
    let firstTableLayoutMode;
    for (let i = 0; i < selection.length; i++) {
        var table = selection[i];
        if (getPluginData_1(table, 'template')) {
            if (table.type !== 'COMPONENT') {
                let firstRow = table.findOne((node) => { var _a; return ((_a = getPluginData_1(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === 'tr'; });
                if (table.type === 'INSTANCE' || firstRow.type === 'INSTANCE' || firstRow.type === 'COMPONENT') {
                    table = detachTable(figma.currentPage.selection)[0];
                    // As it's a new table, we need to find the first row again
                    firstRow = table.findOne((node) => { var _a; return ((_a = getPluginData_1(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === 'tr'; });
                }
                // else {
                settings = getTableSettings(table);
                if (i === 0) {
                    vectorType = settings.axis;
                    if (vectorType === 'ROWS') {
                        firstTableLayoutMode = 'VERTICAL';
                    }
                    if (vectorType === 'COLUMNS') {
                        firstTableLayoutMode = 'HORIZONTAL';
                    }
                }
                // let parts: any = findTemplateParts(table)
                function iterateChildren() {
                    var _a;
                    var origRowlength = firstRow.parent.children.length;
                    var rowContainer = firstRow.parent;
                    var rowContainerObject = nodeToObject_1(rowContainer);
                    // Change the table container
                    if (settings.axis === 'ROWS') {
                        rowContainer.layoutMode = 'HORIZONTAL';
                    }
                    if (firstRow.type !== 'COMPONENT') {
                        function getIndex(node, c) {
                            var container = node.parent;
                            var i = -1;
                            var x = -1;
                            while (i < c) {
                                i++;
                                x++;
                                var item = container.children[x];
                                if (item && !isRow(item)) {
                                    i--;
                                }
                            }
                            return x;
                        }
                        for (let i = 0; i < firstRow.parent.children.length; i++) {
                            var row = rowContainer.children[i];
                            if (isRow(row)) {
                                row.width;
                                row.height;
                                var cells = row.children;
                                if (settings.axis === 'COLUMNS') {
                                    row.name = row.name.replace('Col', 'Row');
                                    row.layoutMode = 'HORIZONTAL';
                                    row.layoutGrow = 0;
                                    row.counterAxisSizingMode = 'AUTO';
                                }
                                if (i < origRowlength) {
                                    for (let c = 0; c < settings.matrix[0]; c++) {
                                        var cell = cells[c];
                                        cell.width;
                                        // var cellLocation = [c + 1, r + 1]
                                        // var columnIndex = getNodeIndex(row) + c
                                        var oppositeIndex = getIndex(row, c);
                                        if (cell) {
                                            cell.primaryAxisSizingMode = 'AUTO';
                                            // We do this because the first row isn't always the first in the array and also the c value needs to match the index starting from where the first row starts
                                            if (row.id === firstRow.id && !row.parent.children[oppositeIndex]) {
                                                // If it's the first row and column doesn't exist then create a new column
                                                var clonedColumn = row.clone();
                                                removeChildren_1(clonedColumn); // Need to remove children because they are clones
                                                table.appendChild(clonedColumn);
                                            }
                                            if (row.parent.children[oppositeIndex]) {
                                                if (settings.axis === 'ROWS') {
                                                    row.parent.children[oppositeIndex].appendChild(cell);
                                                    row.parent.children[oppositeIndex].resize(rowContainerObject.children[i].children[c].width, row.height);
                                                    row.parent.children[oppositeIndex].layoutGrow =
                                                        rowContainerObject.children[i].children[c].layoutGrow;
                                                    row.parent.children[oppositeIndex].layoutAlign = 'STRETCH';
                                                }
                                                else {
                                                    row.parent.children[oppositeIndex].appendChild(cell);
                                                    cell.resize(row.width, cell.height);
                                                    // cell.primaryAxisSizingMode = rowContainerObject.children[i].children[c].primaryAxisSizingMode
                                                    if (rowContainerObject.children[i].layoutGrow === 1) {
                                                        cell.layoutGrow = 1;
                                                        // cell.layoutAlign =  "STRETCH"
                                                        // cell.primaryAxisSizingMode = "AUTO"
                                                    }
                                                    else {
                                                        cell.layoutGrow = 0;
                                                        // cell.layoutAlign =  "INHERIT"
                                                        // cell.primaryAxisSizingMode = "FIXED"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                row.resize(rowContainerObject.children[i].height, rowContainerObject.children[i].width);
                            }
                            if (settings.axis === 'ROWS' && isRow(row)) {
                                row.name = row.name.replace('Row', 'Col');
                                row.layoutMode = 'VERTICAL';
                            }
                        }
                        if (settings.axis === 'COLUMNS') {
                            rowContainer.layoutMode = 'VERTICAL';
                        }
                        swapAxises(rowContainer);
                        resize_1(rowContainer, rowContainerObject.width, rowContainerObject.height);
                        rowContainer.primaryAxisSizingMode = 'AUTO';
                        // Because changing layout mode swaps sizingModes you need to loop children again
                        var rowlength = rowContainer.children.length;
                        // For some reason can't remove nodes while in loop, so workaround is to add to an array.
                        let discardBucket = [];
                        for (let i = 0; i < rowlength; i++) {
                            var row = rowContainer.children[i];
                            // This is the original object before rows are converted to columns, so may not always match new converted table
                            if ((_a = rowContainerObject.children[i]) === null || _a === void 0 ? void 0 : _a.layoutAlign)
                                row.layoutAlign = rowContainerObject.children[i].layoutAlign;
                            if (isRow(row)) {
                                // Settings is original settings, not new settings
                                if (settings.axis === 'COLUMNS') {
                                    row.counterAxisSizingMode = 'AUTO';
                                    row.layoutAlign = 'STRETCH';
                                    // We have to apply this after appending the cells because for some reason doing it before means that the width of the cells is incorrect
                                    var cells = row.children;
                                    var length = settings.axis === 'COLUMNS' ? firstRow.parent.children.length : firstRow.children.length;
                                    for (let c = 0; c < length; c++) {
                                        var cell = cells[c];
                                        if (cell) {
                                            if (row.parent.children[getNodeIndex_1(firstRow) + c]) {
                                                cell.primaryAxisSizingMode = 'FIXED';
                                                cell.layoutAlign = 'STRETCH';
                                            }
                                        }
                                    }
                                }
                                else {
                                    var cells = row.children;
                                    var length = settings.axis === 'ROWS' ? firstRow.parent.children.length : firstRow.children.length;
                                    for (let c = 0; c < length; c++) {
                                        var cell = cells[c];
                                        if (cell) {
                                            if (row.parent.children[getNodeIndex_1(firstRow) + c]) {
                                                // NOTE: temporary fix. Could be better
                                                if (settings.size[0] === 'HUG') {
                                                    cell.layoutGrow = 0;
                                                    cell.primaryAxisSizingMode = 'AUTO';
                                                }
                                                else {
                                                    cell.layoutGrow = 1;
                                                    cell.primaryAxisSizingMode = 'FIXED';
                                                }
                                            }
                                        }
                                    }
                                    row.layoutAlign = 'STRETCH';
                                }
                                // If row ends up being empty, then assume it's not needed
                                if (row.children.length === 0) {
                                    discardBucket.push(row);
                                }
                            }
                        }
                        for (let i = 0; i < discardBucket.length; i++) {
                            discardBucket[i].remove();
                        }
                    }
                }
                if (vectorType === table.layoutMode) ;
                if (firstTableLayoutMode === table.layoutMode) {
                    iterateChildren();
                }
            }
        }
        else {
            figma.closePlugin('Please select a table');
        }
    }
    return {
        vectorType: vectorType,
    };
}
function selectTableVector(type) {
    var _a, _b;
    if (figma.currentPage.selection.length > 0) {
        if (((_a = figma.currentPage.selection[0].parent) === null || _a === void 0 ? void 0 : _a.parent.layoutMode) === (type === 'column' ? 'VERTICAL' : 'HORIZONTAL')) {
            selectTableCells('parallel');
        }
        if (((_b = figma.currentPage.selection[0].parent) === null || _b === void 0 ? void 0 : _b.parent.layoutMode) === (type === 'column' ? 'HORIZONTAL' : 'VERTICAL')) {
            selectTableCells('adjacent');
        }
    }
    else {
        figma.notify('One or more table cells must be selected');
    }
}
async function createTableUI() {
    figma.root.setRelaunchData({
        createTable: '',
    });
    // Whenever plugin run
    const localTemplates = getLocalTemplates();
    // Sync recent files when plugin is run (checks if current file is new, and if not updates data)
    var recentFiles = await getRecentFilesAsync_1(localTemplates, { expire: daysToMilliseconds(7) });
    var remoteFiles = await getRemoteFilesAsync_1();
    // Show create table UI
    let pluginVersion = await getClientStorageAsync_1('pluginVersion');
    let userPreferences = await getClientStorageAsync_1('userPreferences');
    let usingRemoteTemplate = await getDocumentData_1('usingRemoteTemplate');
    let pluginUsingOldComponents = getComponentById(figma.root.getPluginData('cellComponentID')) ? true : false;
    let tableSettings = userPreferences.table;
    const fileId = getDocumentData_1('fileId');
    let defaultTemplate = await getDefaultTemplate();
    figma.showUI(__uiFiles__.main, {
        width: 240,
        height: 474 + 8 + 8,
        themeColors: true,
    });
    figma.ui.postMessage(Object.assign(Object.assign({ type: 'show-create-table-ui' }, tableSettings), { remoteFiles,
        recentFiles,
        localTemplates,
        defaultTemplate,
        fileId,
        usingRemoteTemplate,
        pluginVersion,
        pluginUsingOldComponents }));
    // We update plugin version after UI opened for the first time so user can see the whats new message
    updatePluginVersion('7.0.0');
}
async function createTableInstance(tableSettings) {
    const templateComponent = await lookForComponent(tableSettings.template);
    if (templateComponent) {
        let tableInstance = await createTable(templateComponent, tableSettings);
        if (tableInstance) {
            positionInCenterOfViewport(tableInstance);
            figma.currentPage.selection = [tableInstance];
            await setDefaultTemplate(tableSettings.template);
            let userPreferences = await getClientStorageAsync_1('userPreferences');
            let newUserPreferences = await applyTableSettings(userPreferences.table, tableSettings);
            figma.clientStorage.setAsync('userPreferences', { table: newUserPreferences }).then(() => {
                figma.closePlugin('Table created');
            });
        }
    }
}
async function main() {
    // Set default preferences
    await updateClientStorageAsync_1('userPreferences', (data) => {
        let table = {
            matrix: [[(data === null || data === void 0 ? void 0 : data.columnCount) || 4, (data === null || data === void 0 ? void 0 : data.rowCount) || 4]],
            size: [[(data === null || data === void 0 ? void 0 : data.tableWidth) || 'HUG', (data === null || data === void 0 ? void 0 : data.tableHeight) || 'HUG']],
            cell: [[(data === null || data === void 0 ? void 0 : data.cellWidth) || 120, (data === null || data === void 0 ? void 0 : data.cellHeight) || 'FILL']],
            alignment: [(data === null || data === void 0 ? void 0 : data.cellAlignment) || 'MIN', 'MIN'],
            header: (data === null || data === void 0 ? void 0 : data.includeHeader) || true,
            resizing: (data === null || data === void 0 ? void 0 : data.columnResizing) || true,
        };
        let defaultData = {
            table,
        };
        // If the property table deosn't exist, then declare new defaultData
        if (!(data === null || data === void 0 ? void 0 : data.table)) {
            data = defaultData;
        }
        // Merge user's data with deafult
        data = Object.assign(defaultData, data || {});
        return data;
    });
    dist((plugin) => {
        plugin.ui = {
            html: __uiFiles__.main,
            width: 240,
            height: 504,
        };
        // Received messages
        async function newTemplateComponent(opts) {
            let { newPage, tooltips, subComponents } = opts;
            if (newPage) {
                createPage('Table Creator');
            }
            let newSelection = [];
            let components = await createTemplateComponents();
            let { templateComponent, rowComponent, cellComponentSet } = components;
            // Add template data and relaunch data to templateComponent
            let templateData = new Template(templateComponent);
            // Increment name
            // Before first template data set
            let localTemplates = getLocalTemplates();
            localTemplates = localTemplates.filter((item) => item.name.startsWith('Table'));
            templateComponent.name = incrementName_1(templateComponent.name, localTemplates);
            templateData.name = templateComponent.name;
            setPluginData_1(templateComponent, 'template', templateData);
            templateComponent.setRelaunchData(defaultRelaunchData);
            setDefaultTemplate(templateData);
            if (tooltips !== false) {
                let tooltip1 = await createTooltip('This component is a template used by Table Creator to create tables from. You can customise the appearance of your tables by customising this template. It’s made up of the components below.');
                tooltip1.x = templateComponent.x + templateComponent.width + 80;
                tooltip1.y = templateComponent.y - 10;
                let tooltip2 = await createTooltip('Customise rows by changing this component.');
                tooltip2.x = rowComponent.x + rowComponent.width + 80;
                tooltip2.y = rowComponent.y - 10;
                let tooltip3 = await createTooltip('Customise cell borders by changing these components. Create variants for different types of cells, icons, dropdowns, ratings etc.');
                tooltip3.x = cellComponentSet.x + cellComponentSet.width + 80 - 16;
                tooltip3.y = cellComponentSet.y - 10 + 16;
                newSelection.push(tooltip1, tooltip2, tooltip3);
            }
            if (subComponents === false) {
                rowComponent.remove();
                cellComponentSet.remove();
            }
            else {
                newSelection.push(rowComponent, cellComponentSet);
            }
            newSelection.push(templateComponent);
            let tempGroup = figma.group(newSelection, figma.currentPage);
            positionInCenterOfViewport(tempGroup);
            ungroup_1(tempGroup, figma.currentPage);
            // animateNodeIntoView(newSelection)
            figma.currentPage.selection = newSelection;
            figma.notify('Template created');
            return templateComponent;
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
                        longName: 'Table',
                    },
                    tr: {
                        name: getSelectionName(parts === null || parts === void 0 ? void 0 : parts.tr),
                        element: 'tr',
                        id: (_b = parts === null || parts === void 0 ? void 0 : parts.tr) === null || _b === void 0 ? void 0 : _b.id,
                        longName: 'Row',
                    },
                    td: {
                        name: getSelectionName(parts === null || parts === void 0 ? void 0 : parts.td),
                        element: 'td',
                        id: (_c = parts === null || parts === void 0 ? void 0 : parts.td) === null || _c === void 0 ? void 0 : _c.id,
                        longName: 'Cell',
                    },
                    th: {
                        name: getSelectionName(parts === null || parts === void 0 ? void 0 : parts.th),
                        element: 'th',
                        id: (_d = parts === null || parts === void 0 ? void 0 : parts.th) === null || _d === void 0 ? void 0 : _d.id,
                        longName: 'Cell Header',
                    },
                };
                postCurrentSelection(templateNode.id);
                figma.ui.postMessage({ type: 'template-parts', parts: partsAsObject });
            });
        }
        plugin.command('createTable', async ({ ui }) => {
            let userPreferences = await getClientStorageAsync_1('userPreferences');
            let tableSettings = userPreferences.table;
            let localTemplates = getLocalTemplatesWithoutUpdating();
            let remoteFiles = getDocumentData_1('remoteFiles') || [];
            let remoteTemplates = [];
            let defaultTemplate = await getDefaultTemplate();
            for (let i = 0; i < remoteFiles.length; i++) {
                let file = remoteFiles[i];
                for (let x = 0; x < file.data.length; x++) {
                    let template = file.data[x];
                    remoteTemplates.push({
                        name: template.name,
                        data: template,
                        icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M1.9223 7.04535L7.42828 1.53783L6.72107 0.830826L1.21509 6.33834C0.678222 6.87536 0.678314 7.74592 1.2153 8.28282L6.10292 13.1697C6.6399 13.7066 7.51045 13.7066 8.04739 13.1696L13.5528 7.66416L12.8457 6.95706L7.34028 12.4625C7.19384 12.609 6.95642 12.609 6.80997 12.4625L1.92235 7.57566C1.7759 7.42923 1.77588 7.19181 1.9223 7.04535ZM11.8886 1.99731H8.82607V2.99731H10.6815L7.16001 6.51876L7.86712 7.22586L11.3886 3.70442V5.55981H12.3886V2.49731V1.99731H11.8886Z" fill="#818181" fill-opacity="0.5"/>
						</svg>`,
                    });
                }
            }
            localTemplates = localTemplates.map((item) => {
                return {
                    name: item.name,
                    data: item,
                };
            });
            figma.parameters.on('input', ({ query, result, key }) => {
                function genSuggestions(key, query) {
                    let suggestions = [];
                    if (query) {
                        let [item1, item2] = query.split('x');
                        if (item1) {
                            item1 = convertToNumber(item1.toUpperCase().toString().trim());
                        }
                        if (item2) {
                            item2 = convertToNumber(item2.toUpperCase().toString().trim());
                        }
                        // ---
                        if (!item1 || item1 === tableSettings[key][0][0]) {
                            item1 = '';
                        }
                        else if (!Number(item1)) {
                            if (key === 'matrix' && item1 !== '$') {
                                item1 = false;
                            }
                            if (key === 'size' && item1 !== 'HUG' && item1 !== '$') {
                                item1 = false;
                            }
                            if (key === 'cell' && item1 !== 'FILL' && item1 !== '$') {
                                item1 = false;
                            }
                        }
                        else if (Number(item1) < 1) {
                            item1 = false;
                        }
                        // ---
                        if (!item2 || item2 === tableSettings[key][0][1]) {
                            item2 = '';
                        }
                        else if (!Number(item2)) {
                            if (key === 'matrix' && item2 !== '$') {
                                item2 = false;
                            }
                            if (key === 'size' && item2 !== 'HUG' && item2 !== '$') {
                                item2 = false;
                            }
                            if (key === 'cell' && item2 !== 'FILL' && item2 !== '$') {
                                item2 = false;
                            }
                        }
                        else if (Number(item2) < 1) {
                            item2 = false;
                        }
                        // ---
                        if (item1 && !item2 && item2 !== false) {
                            suggestions.push({
                                name: `${item1} x ${item2 || tableSettings[key][0][1]}`,
                                data: [item1, item2 || tableSettings[key][0][1]],
                            });
                        }
                        if (!item1 && item1 !== false && item2) {
                            suggestions.push({
                                name: `${item1 || tableSettings[key][0][0]} x ${item2}`,
                                data: [item1 || tableSettings[key][0][1], item2],
                            });
                        }
                        if (item1 && item2) {
                            suggestions.push({
                                name: `${item1} x ${item2}`,
                                data: [item1, item2],
                            });
                        }
                    }
                    for (let i = 0; i < tableSettings[key].length; i++) {
                        let item = tableSettings[key][i];
                        let obj = {
                            name: `${item[0].toString().toUpperCase()} x ${item[1].toString().toUpperCase()}`,
                            data: item,
                        };
                        suggestions.push(obj);
                    }
                    return suggestions;
                }
                if (localTemplates.length > 0 || remoteFiles.length > 0) {
                    if (key === 'template') {
                        // TODO: Add remote templates if they exist
                        // TODO: Add icon for remote templates
                        // TODO: reorder so that defaultTemplate is first in array
                        let suggestions = [...localTemplates, ...remoteTemplates];
                        // Reorder array so that default template is at the top
                        let indexOfDefaultTemplate = suggestions.findIndex((item) => item.data.component.key === defaultTemplate.component.key);
                        suggestions = move(suggestions, indexOfDefaultTemplate, 0);
                        if (suggestions.length > 0) {
                            suggestions = suggestions.filter((s) => s.name.toUpperCase().includes(query.toUpperCase()));
                            result.setSuggestions(suggestions);
                        }
                    }
                    if (key === 'matrix') {
                        result.setSuggestions(genSuggestions('matrix', query));
                    }
                    if (key === 'size') {
                        result.setSuggestions(genSuggestions('size', query));
                    }
                    // Optional parameters
                    if (key === 'cell') {
                        let suggestions = genSuggestions('cell', query);
                        result.setSuggestions(suggestions);
                    }
                    if (key === 'alignment') {
                        let suggestions = [
                            { name: 'Top', data: ['MIN', 'MIN'] },
                            { name: 'Center', data: ['CENTER', 'MIN'] },
                            { name: 'Bottom', data: ['MAX', 'MIN'] },
                        ];
                        // Reorder array so that default template is at the top
                        let indexFrom = suggestions.findIndex((item) => item.data[0] === tableSettings.alignment[0]);
                        move(suggestions, indexFrom, 0);
                        suggestions = suggestions.filter((s) => s.name.toUpperCase().includes(query.toUpperCase()));
                        result.setSuggestions(suggestions);
                    }
                    if (key === 'header') {
                        let suggestions = [];
                        let first;
                        let second;
                        if (tableSettings.header) {
                            first = { name: 'True', data: true };
                            second = { name: 'False', data: false };
                        }
                        else {
                            first = { name: 'False', data: false };
                            second = { name: 'True', data: true };
                        }
                        suggestions = [first, second].filter((s) => s.name.toUpperCase().includes(query.toUpperCase()));
                        result.setSuggestions(suggestions);
                    }
                }
                else {
                    result.setError('No templates found. Run plugin without parameters.');
                }
            });
            figma.on('run', async ({ parameters }) => {
                let userSettings = userPreferences.table;
                if (parameters) {
                    // ---- Because we can't set data when parameters is launched we need to retrospectively update template components that may have been copied and have the out of date template data on them
                    let localTemplatesWithoutUpdating = getLocalTemplatesWithoutUpdating();
                    let indexOfDefaultTemplate = localTemplatesWithoutUpdating.findIndex((item) => item.component.key === parameters.template.component.key);
                    // Updates components as it gets them
                    let localTemplates = getLocalTemplates();
                    // We need to reassign the template now as it may have changed
                    if (indexOfDefaultTemplate > -1) {
                        parameters.template = localTemplates[indexOfDefaultTemplate];
                    }
                    // ----
                    // Matrix, size and template will get replaced by parameters
                    let tableSettings = Object.assign(userSettings, parameters);
                    if (!parameters.cell) {
                        tableSettings.cell = userSettings.cell[0];
                    }
                    createTableInstance(tableSettings);
                }
                else {
                    createTableUI();
                }
            });
        });
        plugin.command('detachTable', () => {
            let tables = detachTable(figma.currentPage.selection);
            if (tables.length > 0) {
                figma.closePlugin(`Table and rows detached`);
            }
            else {
                figma.closePlugin(`Can't detach template`);
            }
        });
        plugin.command('toggleColumnResizing', () => {
            toggleColumnResizing(figma.currentPage.selection).then((result) => {
                if (result) {
                    figma.closePlugin(`Column resizing ${result}`);
                }
                else {
                    figma.closePlugin(`Can't apply to templates`);
                }
            });
        });
        plugin.command('switchColumnsOrRows', () => {
            let { vectorType } = switchColumnsOrRows(figma.currentPage.selection);
            if (vectorType) {
                figma.closePlugin(`Switched to ${vectorType === 'rows' ? 'columns' : 'rows'}`);
            }
            else if (figma.currentPage.selection.length === 0) {
                figma.closePlugin('Please select a table');
            }
            else {
                figma.closePlugin(`Can't apply to templates`);
            }
        });
        plugin.command('selectColumn', () => {
            selectTableVector('column');
            figma.closePlugin();
        });
        plugin.command('selectRow', () => {
            selectTableVector('row');
            figma.closePlugin();
        });
        plugin.command('newTemplate', newTemplateComponent);
        plugin.command('importTemplate', importTemplate);
        plugin.on('new-template', async (msg) => {
            let templateComponent = await newTemplateComponent(msg.options);
            let templateData = getPluginData_1(templateComponent, 'template');
            setDefaultTemplate(templateData);
        });
        plugin.on('remove-template', async (msg) => {
            let currentTemplate = await getDefaultTemplate();
            getDocumentData_1('previousTemplate');
            if (msg.file) {
                let remoteFiles = getDocumentData_1('remoteFiles');
                let currentFileIndex = remoteFiles.findIndex((file) => file.id === msg.file.id);
                let currentFile = remoteFiles[currentFileIndex];
                let templateIndex = currentFile.data.findIndex((template) => template.id === msg.template.id);
                currentFile.data.splice(templateIndex, 1);
                // If no data, then remove file from list
                if (currentFile.data.length === 0) {
                    remoteFiles.splice(currentFileIndex, 1);
                }
                setDocumentData_1('remoteFiles', remoteFiles);
                figma.ui.postMessage({
                    type: 'remote-files',
                    remoteFiles: remoteFiles,
                });
            }
            else {
                let templateComponent = getComponentByIdAndKey(msg.template.id, msg.template.component.key);
                templateComponent.remove();
                let localTemplates = getLocalTemplates();
                figma.ui.postMessage({
                    type: 'local-templates',
                    localTemplates: localTemplates,
                });
            }
            if (currentTemplate.component.id === msg.template.id) {
                let localTemplates = getLocalTemplates();
                setDefaultTemplate(localTemplates[localTemplates.length - 1]);
            }
        });
        plugin.on('edit-template', (msg) => {
            editTemplateComponent(msg);
        });
        plugin.on('set-default-template', (msg) => {
            setDefaultTemplate(msg.template);
        });
        plugin.on('add-remote-file', async (msg) => {
            const remoteFiles = await getRemoteFilesAsync_1(msg.file.id);
            figma.ui.postMessage({ type: 'remote-files', remoteFiles });
        });
        plugin.on('remove-remote-file', async (msg) => {
            removeRemoteFile_1(msg.file.id);
            const remoteFiles = await getRemoteFilesAsync_1();
            const localTemplates = getLocalTemplates();
            if (remoteFiles.length > 0) {
                setDefaultTemplate(remoteFiles[0].data[0]);
            }
            else {
                if (localTemplates.length > 0) {
                    setDefaultTemplate(localTemplates[0]);
                }
                else {
                    setDefaultTemplate(null);
                    figma.ui.postMessage({ type: 'post-default-template', defaultTemplate: null });
                }
            }
            figma.ui.postMessage({ type: 'remote-files', remoteFiles });
        });
        plugin.on('remove-element', (msg) => {
            removeElement(msg.id, msg.element);
        });
        plugin.on('add-element', (msg) => {
            addElement(msg.element);
        });
        plugin.on('create-table-instance', async (msg) => {
            createTableInstance(msg.data);
        });
        plugin.command('updateTables', () => {
            let templateData = getPluginData_1(figma.currentPage.selection[0], 'template');
            updateTables(templateData).then(() => {
                figma.notify('Tables updated', { timeout: 1500 });
                figma.closePlugin();
            });
        });
        plugin.on('update-tables', (msg) => {
            updateTables(msg.template).then(() => {
                figma.notify('Tables updated', { timeout: 1500 });
            });
        });
        plugin.on('save-user-preferences', () => { });
        plugin.on('fetch-template-part', () => { });
        plugin.on('fetch-current-selection', (msg) => {
            if (msg.template) {
                lookForComponent(msg.template).then((templateNode) => {
                    postCurrentSelection(templateNode.id);
                });
            }
        });
        plugin.on('fetch-template-parts', (msg) => {
            lookForComponent(msg.template).then((templateNode) => {
                var _a, _b, _c, _d;
                // figma.viewport.scrollAndZoomIntoView([templateNode])
                // figma.currentPage.selection = [templateNode]
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
                figma.ui.postMessage({ type: 'template-parts', parts: partsAsObject });
            });
        });
        plugin.on('upgrade-to-template', async () => {
            await upgradeOldComponentsToTemplate();
            figma.notify('Template created');
            createTableUI();
            figma.ui.postMessage({ type: 'post-default-template', defaultTemplate: getDefaultTemplate(), localTemplates: getLocalTemplates() });
        });
        // plugin.on('existing-template', (msg) => {
        // 	figma.notify('Using remote template')
        // })
        plugin.on('using-remote-template', async (msg) => {
            const remoteFiles = await getRemoteFilesAsync_1();
            setDocumentData_1('usingRemoteTemplate', msg.usingRemoteTemplate);
            figma.ui.postMessage({ type: 'remote-files', remoteFiles });
        });
    });
}
main();
// figma.clientStorage.deleteAsync('pluginVersion')
=======
"use strict";var global$1="undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},name="svelte-app",version="1.0.2",scripts={build:"rollup -c",dev:"rollup -c -w",start:"sirv public"},devDependencies={"@figma/plugin-typings":"^1.49.0","@fignite/helpers":"^0.0.0-alpha.10","@rollup/plugin-commonjs":"^17.0.0","@rollup/plugin-image":"^2.0.6","@rollup/plugin-json":"^4.1.0","@rollup/plugin-node-resolve":"^11.2.1","@rollup/plugin-replace":"^2.4.2","@rollup/plugin-strip":"^2.1.0",cssnano:"^4.1.10","figma-plugin-ds-svelte":"^1.0.7","flex-gap-polyfill":"^2.2.1",nanoid:"^3.1.22",plugma:"0.0.0-alpha0.7",postcss:"^8.2.4","postcss-nested":"^4.2.3",rollup:"^2.36.2","rollup-plugin-html-bundle":"0.0.3","rollup-plugin-livereload":"^2.0.0","rollup-plugin-node-polyfills":"^0.2.1","rollup-plugin-postcss":"^4.0.0","rollup-plugin-svelte":"^7.0.0","rollup-plugin-svg":"^2.0.0","rollup-plugin-terser":"^7.0.2","rollup-plugin-typescript":"^1.0.1",svelte:"^3.31.2","svelte-preprocess":"^4.6.9",tslib:"^2.1.0",typescript:"^4.1.3"},dependencies={autoprefixer:"^10.2.1","common-tags":"^1.8.0","fs-extra":"^9.1.0",lodash:"^4.17.21","postcss-logical":"^4.0.2","sirv-cli":"^1.0.10",stylup:"0.0.0-alpha.3",tweeno:"^1.1.3",underscore:"^1.13.4",uniqid:"^5.3.0",uuid:"^8.3.2"},require$$0={name:name,version:version,scripts:scripts,devDependencies:devDependencies,dependencies:dependencies},pkg;function plugma(e){var t={updateAvailable:!1,ui:{}};(null==pkg?void 0:pkg.version)&&(t.version=pkg.version);var n=[],i=[];t.on=(e,t)=>{n.push({type:e,callback:t})},t.command=(e,t)=>{i.push({type:e,callback:t})};var a=!1;t.setStartPage=e=>{t.ui.page=e,a=!0};var r=e(t);if(Object.assign({},t,{commands:r}),r)for(let[e,n]of Object.entries(r))figma.command===e&&(a||(t.ui.page=e),n(t),t.ui.open&&figma.showUI(t.ui.html));figma.ui.onmessage=e=>{for(let t of n)e.type===t.type&&t.callback(e)},t.ui.show=e=>{figma.showUI(t.ui.html,{width:t.ui.width,height:t.ui.height}),figma.ui.postMessage(e)};for(let e of i)figma.command===e.type&&e.callback(t)}pkg=require$$0;var dist=plugma;async function getClientStorageAsync(e){return await figma.clientStorage.getAsync(e)}async function updateClientStorageAsync(e,t){var n=await figma.clientStorage.getAsync(e);if(n=t(n))return figma.clientStorage.setAsync(e,n),n;n=null}const eventListeners=[];figma.ui.onmessage=e=>{for(let t of eventListeners)e.action===t.action&&t.callback(e.data)};const nodeProps=["id","parent","name","removed","visible","locked","children","constraints","absoluteTransform","relativeTransform","x","y","rotation","width","height","constrainProportions","layoutAlign","layoutGrow","opacity","blendMode","isMask","effects","effectStyleId","expanded","backgrounds","backgroundStyleId","fills","strokes","strokeWeight","strokeMiterLimit","strokeAlign","strokeCap","strokeJoin","dashPattern","fillStyleId","strokeStyleId","cornerRadius","cornerSmoothing","topLeftRadius","topRightRadius","bottomLeftRadius","bottomRightRadius","exportSettings","overflowDirection","numberOfFixedChildren","overlayPositionType","overlayBackground","overlayBackgroundInteraction","reactions","description","remote","key","layoutMode","primaryAxisSizingMode","counterAxisSizingMode","primaryAxisAlignItems","counterAxisAlignItems","paddingLeft","paddingRight","paddingTop","paddingBottom","itemSpacing","layoutGrids","gridStyleId","clipsContent","guides","type","strokeTopWeight","strokeBottomWeight","strokeRightWeight","strokeLeftWeight"],readOnly=["id","parent","removed","children","absoluteTransform","width","height","overlayPositionType","overlayBackground","overlayBackgroundInteraction","reactions","remote","key","type","masterComponent","mainComponent"];function copyPaste(e,t,...n){var i,a;t&&0===Object.keys(t).length&&t.constructor===Object&&(i=!0),n[0],n[1],"object"==typeof n[0]&&"function"!=typeof n[0]&&(a=n[0]),"object"==typeof n[0]&&"function"!=typeof n[0]&&(a=n[0]),a||(a={});const{include:r,exclude:o,withoutRelations:l,removeConflicts:s}=a;let u=nodeProps.filter((function(e){return!readOnly.includes(e)}));r&&(u=r.filter((function(e){return!readOnly.includes(e)}))),o&&(u=u.filter((function(e){return!o.concat(readOnly).includes(e)}))),t&&!i&&(u=u.filter((function(e){return!["id","type"].includes(e)})));var c={};i&&(void 0===c.id&&(c.id=e.id),void 0===c.type&&(c.type=e.type),e.key&&(c.key=e.key));const d=Object.entries(Object.getOwnPropertyDescriptors(e.__proto__));for(const[t,n]of d)if(u.includes(t))try{"symbol"==typeof c[t]?c[t]="Mixed":c[t]=n.get.call(e)}catch(e){c[t]=void 0}return s||(!c.fillStyleId&&c.fills?delete c.fillStyleId:delete c.fills,!c.strokeStyleId&&c.strokes?delete c.strokeStyleId:delete c.strokes,!c.backgroundStyleId&&c.backgrounds?delete c.backgroundStyleId:delete c.backgrounds,!c.effectStyleId&&c.effects?delete c.effectStyleId:delete c.effects,!c.gridStyleId&&c.layoutGrids?delete c.gridStyleId:delete c.layoutGrids,c.textStyleId?(delete c.fontName,delete c.fontSize,delete c.letterSpacing,delete c.lineHeight,delete c.paragraphIndent,delete c.paragraphSpacing,delete c.textCase,delete c.textDecoration):delete c.textStyleId,c.cornerRadius!==figma.mixed?(delete c.topLeftRadius,delete c.topRightRadius,delete c.bottomLeftRadius,delete c.bottomRightRadius):delete c.cornerRadius),i&&e.parent&&!l&&(c.parent={id:e.parent.id,type:e.parent.type}),i&&("FRAME"!==e.type&&"COMPONENT"!==e.type&&"COMPONENT_SET"!==e.type&&"PAGE"!==e.type&&"GROUP"!==e.type&&"INSTANCE"!==e.type&&"DOCUMENT"!==e.type&&"BOOLEAN_OPERATION"!==e.type||e.children&&!l&&(c.children=e.children.map((e=>copyPaste(e,{},{withoutRelations:l})))),"INSTANCE"===e.type&&e.mainComponent&&!l&&(c.masterComponent=copyPaste(e.mainComponent,{},{withoutRelations:l}))),Object.assign(t,c),c}function convertToFrame(e){if("INSTANCE"===e.type)return e.detachInstance();if("COMPONENT"===e.type){let t=e.parent,n=e.createInstance().detachInstance();return t.appendChild(n),copyPaste(e,n,{include:["x","y"]}),figma.currentPage.appendChild(n),e.remove(),n}if("RECTANGLE"===e.type||"GROUP"===e.type){let t=figma.createFrame();return t.resizeWithoutConstraints(e.width,e.height),copyPaste(e,t),e.remove(),t}return"FRAME"===e.type?e:void 0}function moveChildren(e,t){let n=e.children,i=n.length;for(let e=0;e<i;e++){let i=n[e];t.appendChild(i)}return t}function convertToComponent(e){const t=figma.createComponent();return e=convertToFrame(e),t.resizeWithoutConstraints(e.width,e.height),copyPaste(e,t),moveChildren(e,t),e.remove(),t}function getPluginData(node,key,opts){var data;if(data=node.getPluginData(key),data=data?"string"==typeof data&&data.startsWith(">>>")?data:JSON.parse(data):void 0,"string"==typeof data&&data.startsWith(">>>")){data=data.slice(3);var string="(() => {\n            return "+data+"\n            })()";data=eval(string)}return data}function setPluginData(e,t,n){return"string"==typeof n&&n.startsWith(">>>")?(e.setPluginData(t,n),n):(e.setPluginData(t,JSON.stringify(n)),JSON.stringify(n))}function updatePluginData(e,t,n){var i;return(i=n(i=e.getPluginData(t)?JSON.parse(e.getPluginData(t)):null))||(i=null),e.setPluginData(t,JSON.stringify(i)),i}function removeChildren$1(e){for(let t=e.children.length-1;t>=0;t--)e.children[t].remove()}function resize(e,t,n){0===t&&(t=1/Number.MAX_SAFE_INTEGER),0===n&&(n=1/Number.MAX_SAFE_INTEGER);let i=e.parent;if(e.resize(t<.01?1:t,n<.01?1:n),t<.01||n<.01){let a=figma.createRectangle();a.resize(t<.01?1/t:t,n<.01?1/n:n);let r=figma.group([e,a],figma.currentPage);r.resize(t<.01?1:t,n<.01?1:n),i.appendChild(e),r.remove()}return e}function ungroup(e,t){let n=[],i=e.children;for(let e=0;e<i.length;e++)t.appendChild(i[e]),n.push(i[e]);return"GROUP"!==e.type&&e.remove(),n}function getNodeIndex(e){return e.parent.children.indexOf(e)}function getNodeLocation(e,t=figma.currentPage,n=[]){if(!e||!t)return console.error("Node or container not defined"),!1;if(e.id===t.id)return n.length>0&&(n.push(t),n.reverse());if(e.parent){var i=getNodeIndex(e);return n.push(i),getNodeLocation(e.parent,t,n)}return!1}function getNodeDepth(e,t=figma.currentPage,n=0){if(e)return e.id===t.id?n:(n+=1,getNodeDepth(e.parent,t,n))}const nodeToObject=(e,t,n)=>{const i=Object.entries(Object.getOwnPropertyDescriptors(e.__proto__)),a=["parent","children","removed","masterComponent","horizontalPadding","verticalPadding"],r={id:e.id,type:e.type};for(const[t,n]of i)if(n.get&&!a.includes(t))try{"symbol"==typeof r[t]?r[t]="Mixed":r[t]=n.get.call(e)}catch(e){r[t]=void 0}return e.parent&&!t&&(r.parent={id:e.parent.id,type:e.parent.type}),e.children&&!t&&(r.children=e.children.map((e=>nodeToObject(e,t)))),e.masterComponent&&!t&&(r.masterComponent=nodeToObject(e.masterComponent,t)),n||(!r.fillStyleId&&r.fills?delete r.fillStyleId:delete r.fills,!r.strokeStyleId&&r.strokes?delete r.strokeStyleId:delete r.strokes,!r.backgroundStyleId&&r.backgrounds?delete r.backgroundStyleId:delete r.backgrounds,!r.effectStyleId&&r.effects?delete r.effectStyleId:delete r.effects,!r.gridStyleId&&r.layoutGrids?delete r.gridStyleId:delete r.layoutGrids,r.textStyleId?(delete r.fontName,delete r.fontSize,delete r.letterSpacing,delete r.lineHeight,delete r.paragraphIndent,delete r.paragraphSpacing,delete r.textCase,delete r.textDecoration):delete r.textStyleId,r.cornerRadius!==figma.mixed?(delete r.topLeftRadius,delete r.topRightRadius,delete r.bottomLeftRadius,delete r.bottomRightRadius):delete r.cornerRadius),r};function getPageNode(e){return"PAGE"===e.parent.type?e.parent:getPageNode(e.parent)}function isFunction$2(e){return e&&"[object Function]"==={}.toString.call(e)}function replace(e,t){let n,i,a,r=!1,o=[];if(Array.isArray(e)){i=getNodeIndex(e[0]),a=e[0].parent;for(let t=0;t<e.length;t++){let n=e[t].clone();o.push(n)}n=figma.group(o,a,i),n.x=e[0].x,n.y=e[0].y,r=!0,i=getNodeIndex(n),a=n.parent}else n=nodeToObject(e),i=getNodeIndex(e),a=e.parent;let l,s=n.width,u=n.height;if(l=isFunction$2(t)?t(e):t,l)return l.resizeWithoutConstraints(s,u),copyPaste(n,l,{include:["x","y","constraints"]}),l.x=n.x,l.y=n.y,console.log(a),a.insertChild(i,l),r&&n.remove(),figma.getNodeById(e.id)&&e.remove(),l}function setDocumentData(e,t){return setPluginData(figma.root,e,t)}function getDocumentData(e){return getPluginData(figma.root,e)}function genUID(){return""+(figma.currentUser.id+"-"+figma.currentUser.sessionId+"-"+(new Date).valueOf())}function addUniqueToArray$1(e,t){return-1===e.findIndex((e=>e.id===t.id))&&e.push(t),e}function isUnique(e,t){return-1===e.findIndex((e=>e.id===t.id))}function File$1(e){this.id=getDocumentData("fileId")||setDocumentData("fileId",genUID()).replace(/['"]+/g,""),this.name=figma.root.name,this.firstVisited=(new Date).toISOString(),this.lastVisited=(new Date).toISOString(),e?(this.data=e,setDocumentData("fileData",e)):this.data=getDocumentData("fileData")}async function getRecentFilesAsync(e,t){t=t||{},e=e||getDocumentData("fileData");let n=await updateClientStorageAsync("recentFiles",(n=>{n=n||[];const i=new File$1(e);if(0===n.length)e.length>0&&n.push(i);else{if(!isUnique(n,i)){let[e,t,n]=i.id.split("-");e===figma.currentUser.id&&t!==figma.currentUser.sessionId.toString()&&figma.root.name.endsWith("(Copy)")&&!getDocumentData("duplicateResolved")&&(i.id=setDocumentData("fileId",genUID()).replace(/['"]+/g,""),setDocumentData("duplicateResolved",!0))}figma.root.name.endsWith("(Copy)")||setDocumentData("duplicateResolved",""),addUniqueToArray$1(n,i),n.length>0&&(n.filter(((t,a)=>{t.id===i.id&&(t.name=i.name,t.lastVisited=(new Date).toISOString(),t.data=i.data,setDocumentData("fileData",e),(!e||Array.isArray(e)&&0===e.length)&&n.splice(a,1))})),n.sort(((e,t)=>e.lastVisited===t.lastVisited?0:e.lastVisited>t.lastVisited?-1:1)),t.expire&&n.map((e=>{if(new Date(e.lastVisited).valueOf()<(new Date).valueOf()-t.expire){let t=n.indexOf(e);-1!==t&&n.splice(t,1)}})),t.limit&&(n=n.slice(0,t.limit)))}return n}));return n.length>0&&(n=n.filter((e=>!(e.id===getPluginData(figma.root,"fileId"))))),n}async function getRemoteFilesAsync(e){var t=await getClientStorageAsync("recentFiles");return updatePluginData(figma.root,"remoteFiles",(n=>{if(n=n||[],e){let i=n.find((t=>t.id===e)),a=t.find((t=>t.id===e));i||n.push(a)}if(t.length>0){for(let e=0;e<n.length;e++){var i=n[e];for(let r=0;r<t.length;r++){var a=t[r];a.id===i.id&&(n[e]=a)}}n=n.filter((e=>!(e.id===getPluginData(figma.root,"fileId"))))}if(n.length>0)for(var r=0;r<n.length;r++){var o=n[r];o.data[0]&&figma.importComponentByKeyAsync(o.data[0].component.key).then((e=>{var t=getPluginData(e,"template");updatePluginData(figma.root,"remoteFiles",(e=>(e.map((e=>{e.id===t.file.id&&(e.name=t.file.name)})),e)))})).catch((e=>{console.log(e)}))}return n}))}function removeRemoteFile(e){return updatePluginData(figma.root,"remoteFiles",(t=>{let n=t.findIndex((t=>t.id===e));return-1!==n&&t.splice(n,1),t}))}function incrementName(e,t){let n=e;t&&t.length>1&&(t.sort(((e,t)=>e.name===t.name?0:e.name>t.name?-1:1)),n=t[0].name);let i=n.match(/^(.*\S)(\s*)(\d+)$/);return!i||t&&0===t.length||(e=`${i[1]}${i[2]}${parseInt(i[3],10)+1}`),e}var convertToComponent_1=convertToComponent,convertToFrame_1=convertToFrame,copyPaste_1=copyPaste,genUID_1=genUID,getClientStorageAsync_1=getClientStorageAsync,getDocumentData_1=getDocumentData,getNodeDepth_1=getNodeDepth,getNodeIndex_1=getNodeIndex,getNodeLocation_1=getNodeLocation,getPageNode_1=getPageNode,getPluginData_1=getPluginData,getRecentFilesAsync_1=getRecentFilesAsync,getRemoteFilesAsync_1=getRemoteFilesAsync,incrementName_1=incrementName,nodeToObject_1=nodeToObject,removeChildren_1=removeChildren$1,removeRemoteFile_1=removeRemoteFile,replace_1=replace,resize_1=resize,setDocumentData_1=setDocumentData,setPluginData_1=setPluginData,ungroup_1=ungroup,updateClientStorageAsync_1=updateClientStorageAsync,updatePluginData_1=updatePluginData,Easing={Linear:{None:function(e){return e}},Quadratic:{In:function(e){return e*e},Out:function(e){return e*(2-e)},InOut:function(e){return(e*=2)<1?.5*e*e:-.5*(--e*(e-2)-1)}},Cubic:{In:function(e){return e*e*e},Out:function(e){return--e*e*e+1},InOut:function(e){return(e*=2)<1?.5*e*e*e:.5*((e-=2)*e*e+2)}},Quartic:{In:function(e){return e*e*e*e},Out:function(e){return 1- --e*e*e*e},InOut:function(e){return(e*=2)<1?.5*e*e*e*e:-.5*((e-=2)*e*e*e-2)}},Quintic:{In:function(e){return e*e*e*e*e},Out:function(e){return--e*e*e*e*e+1},InOut:function(e){return(e*=2)<1?.5*e*e*e*e*e:.5*((e-=2)*e*e*e*e+2)}},Sinusoidal:{In:function(e){return 1-Math.cos(e*Math.PI/2)},Out:function(e){return Math.sin(e*Math.PI/2)},InOut:function(e){return.5*(1-Math.cos(Math.PI*e))}},Exponential:{In:function(e){return 0===e?0:Math.pow(1024,e-1)},Out:function(e){return 1===e?1:1-Math.pow(2,-10*e)},InOut:function(e){return 0===e?0:1===e?1:(e*=2)<1?.5*Math.pow(1024,e-1):.5*(2-Math.pow(2,-10*(e-1)))}},Circular:{In:function(e){return 1-Math.sqrt(1-e*e)},Out:function(e){return Math.sqrt(1- --e*e)},InOut:function(e){return(e*=2)<1?-.5*(Math.sqrt(1-e*e)-1):.5*(Math.sqrt(1-(e-=2)*e)+1)}},Elastic:{In:function(e){var t,n=.1;return 0===e?0:1===e?1:(!n||n<1?(n=1,t=.1):t=.4*Math.asin(1/n)/(2*Math.PI),-n*Math.pow(2,10*(e-=1))*Math.sin((e-t)*(2*Math.PI)/.4))},Out:function(e){var t,n=.1;return 0===e?0:1===e?1:(!n||n<1?(n=1,t=.1):t=.4*Math.asin(1/n)/(2*Math.PI),n*Math.pow(2,-10*e)*Math.sin((e-t)*(2*Math.PI)/.4)+1)},InOut:function(e){var t,n=.1,i=.4;return 0===e?0:1===e?1:(!n||n<1?(n=1,t=.1):t=i*Math.asin(1/n)/(2*Math.PI),(e*=2)<1?n*Math.pow(2,10*(e-=1))*Math.sin((e-t)*(2*Math.PI)/i)*-.5:n*Math.pow(2,-10*(e-=1))*Math.sin((e-t)*(2*Math.PI)/i)*.5+1)}},Back:{In:function(e){var t=1.70158;return e*e*((t+1)*e-t)},Out:function(e){var t=1.70158;return--e*e*((t+1)*e+t)+1},InOut:function(e){var t=2.5949095;return(e*=2)<1?e*e*((t+1)*e-t)*.5:.5*((e-=2)*e*((t+1)*e+t)+2)}},Bounce:{In:function(e){return 1-Easing.Bounce.Out(1-e)},Out:function(e){return e<1/2.75?7.5625*e*e:e<2/2.75?7.5625*(e-=1.5/2.75)*e+.75:e<2.5/2.75?7.5625*(e-=2.25/2.75)*e+.9375:7.5625*(e-=2.625/2.75)*e+.984375},InOut:function(e){return e<.5?.5*Easing.Bounce.In(2*e):.5*Easing.Bounce.Out(2*e-1)+.5}}},easing=Easing,Utils={Linear:function(e,t,n){return(t-e)*n+e},Bernstein:function(e,t){var n=Utils.Factorial;return n(e)/n(t)/n(e-t)},Factorial:(a=[1],function(e){var t,n=1;if(a[e])return a[e];for(t=e;t>1;t--)n*=t;return a[e]=n,a[e]}),CatmullRom:function(e,t,n,i,a){var r=.5*(n-e),o=.5*(i-t),l=a*a;return(2*t-2*n+r+o)*(a*l)+(-3*t+3*n-2*r-o)*l+r*a+t}},a,interpolation={Linear:function(e,t){var n=e.length-1,i=n*t,a=Math.floor(i),r=Utils.Linear;return t<0?r(e[0],e[1],i):t>1?r(e[n],e[n-1],n-i):r(e[a],e[a+1>n?n:a+1],i-a)},Bezier:function(e,t){var n,i=0,a=e.length-1,r=Math.pow,o=Utils.Bernstein;for(n=0;n<=a;n++)i+=r(1-t,a-n)*r(t,n)*e[n]*o(a,n);return i},CatmullRom:function(e,t){var n=e.length-1,i=n*t,a=Math.floor(i),r=Utils.CatmullRom;return e[0]===e[n]?(t<0&&(a=Math.floor(i=n*(1+t))),r(e[(a-1+n)%n],e[a],e[(a+1)%n],e[(a+2)%n],i-a)):t<0?e[0]-(r(e[0],e[0],e[1],e[1],-i)-e[0]):t>1?e[n]-(r(e[n],e[n],e[n-1],e[n-1],i-n)-e[n]):r(e[a?a-1:0],e[a],e[n<a+1?n:a+1],e[n<a+2?n:a+2],i-a)}},Tween=function(e,t){t=t||{},this._object=e,this._valuesStart={},this._valuesStartRepeat={},this._startTime=null,this._onStartCallbackFired=!1,this._onCompleteCallbackFired=!1,this.remove=!1,this._isPlaying=!1,this._reversed=!1,this.filters=t.filters||{},this.duration=t.duration||1e3,this.repeat=t.repeat||0,this.repeatDelay=t.repeatDelay||0,this.delay=t.delay||0,this.from=t.from||!1,this.to=t.to||{},this.yoyo=t.yoyo||!1,this.easing=t.easing||easing.Linear.None,this.interpolation=t.interpolation||interpolation.Linear,this.chained=t.chained||[],this.onStart=t.onStart||!1,this.onUpdate=t.onUpdate||!1,this.onComplete=t.onComplete||!1,this.onRepeat=t.onRepeat||!1,this.onYoYo=t.onYoYo||!1,this.window=!1};Tween.prototype.start=function(e){var t;for(var n in this._isPlaying=!0,this._object)this.from&&void 0!==this.from[n]&&(this._object[n]=this.from[n]);if(this._onStartCallbackFired=!1,this._onCompleteCallbackFired=!1,void 0!==e)this._startTime=e;else{var i=this.window||i;void 0!==i&&void 0!==i.performance&&void 0!==i.performance.now?this._startTime=i.performance.now():this._startTime=Date.now()}for(t in this._startTime+=this.delay,this.to){var a=this.to[t],r=this.filters[t];if(a instanceof Array){if(0===a.length)continue;a=[this._object[t]].concat(a)}r&&r.start(this._object[t],a),this.to[t]=a,this._valuesStart[t]=this._object[t],this._valuesStartRepeat[t]=this._valuesStart[t]||0}return this},Tween.prototype.update=function(e){if(!this._isPlaying)return!0;var t;if(e<this._startTime)return!0;!1===this._onStartCallbackFired&&(this.onStart&&this.onStart(this._object,this,0,0),this._onStartCallbackFired=!0);var n=(e-this._startTime)/this.duration;n=n>1?1:n;var i=this.easing(n);for(t in this.to){var a,r=this._valuesStart[t]||0,o=this.to[t],l=void 0!==this.filters[t]&&this.filters[t];"number"==typeof o?a=r+(o-r)*i:l?a=l.getUpdatedValue(i,this.interpolation):o instanceof Array&&(a=this.interpolation(o,i)),void 0!==a&&(this._object[t]=a)}if(this.onUpdate&&this.onUpdate(this._object,this,i,n),1==n){if(this.repeat>0){for(t in isFinite(this.repeat)&&this.repeat--,this._valuesStartRepeat){if(this.yoyo){var s=this._valuesStartRepeat[t];this._valuesStartRepeat[t]=this.to[t],this.to[t]=s,this._reversed=!this._reversed,this.onYoYo&&this.onYoYo(this._object,this,1,1)}this._valuesStart[t]=this._valuesStartRepeat[t],this.filters[t]&&this.filters[t].start(this._valuesStart[t],this.to[t])}return this._startTime=e+this.repeatDelay,this.onRepeat&&this.onRepeat(this._object,this,1,1),!0}return!1===this._onCompleteCallbackFired&&(this.onComplete&&this.onComplete(this._object,this,1,1),this._onCompleteCallbackFired=!0),!1}return!0},Tween.prototype.getDuration=function(){var e=0;return this.repeat&&(e=this.repeatDelay),this.delay+(e+this.duration)*(this.repeat||1)};var tween=Tween,Filter=function(e){e=e||{},this.format=e.format||this.format,this.placeholder=e.placeholder||this.placeholder,this.placeholderTypes=e.placeholderTypes||[].concat(this.placeholderTypes),this._formatArray=this.format.split(this.placeholder)};Filter.prototype._formatArray=null,Filter.prototype.format="rgba(%,%,%,%)",Filter.prototype.placeholder="%",Filter.prototype.placeholderTypes=["int","int","int","float"],Filter.prototype.to=null,Filter.prototype.from=null,Filter.prototype.stringToArray=function(e){return e.match(/[+-]?[\d]+(\.[\d]+)?/g).map(parseFloat)},Filter.prototype.validateArrayLength=function(e,t,n){(n=n||"")&&(n=' set to the "'+n+'" param'),(t=t||"")&&(t=' of string "'+t+'"');var i=this._formatArray.length-1;if(e<i)throw new Error("value array length ( "+e+" )"+t+n+" is less than the number of format placeholders ( "+i+" ) in "+this.format);if(e>i)throw new Error("value array length ( "+e+" )"+t+n+" is greater than the number of format placeholders ( "+i+" ) in "+this.format)},Filter.prototype.arrayToString=function(e){var t,n=this._formatArray,i=n.length,a=[];for(t=0;t<i;t++)"int"===this.placeholderTypes[t]&&(e[t]=Math.round(e[t])),a.push(n[t]),a.push(e[t]);return a.join("")},Filter.prototype.start=function(e,t){var n;if(this.from=e,this.to=t,this.arrayFrom=this.stringToArray(e),this.validateArrayLength(this.arrayFrom.length,e,"arrayFrom"),t instanceof Array){n=[];var i,a=(t=[e].concat(t)).length;for(i=0;i<a;i++){var r=this.stringToArray(t[i]);this.validateArrayLength(r.length,t[i],"arrayTo"),n[i]=r}this.arrayToIndexedInterpolated=this.getIndexedInterpolationData(n)}else n=this.stringToArray(t),this.validateArrayLength(n.length,t,"arrayTo");this.arrayTo=n},Filter.prototype.getIndexedInterpolationData=function(e){var t,n,i=[],a=e.length;for(t=0;t<a;t++){var r=e[t],o=r.length;for(n=0;n<o;n++)void 0===i[n]&&(i[n]=[]),i[n].push(r[n])}return i},Filter.prototype.getUpdatedValue=function(e,t){var n,i,a=this.arrayTo,r=[];if(a[0]instanceof Array){var o=this.arrayToIndexedInterpolated;for(i=o.length,n=0;n<i;n++)r[n]=t(o[n],e);return this.arrayToString(r)}var l=[];for(i=a.length,n=0;n<i;n++){var s=this.arrayFrom[n],u=a[n];l.push(s+(u-s)*e)}return this.arrayToString(l)};var filter$1=Filter,Queue=function(e){this.tweens=e||[],this.window=!1};Queue.prototype.window=null,Queue.prototype.tweens=null,Queue.prototype.add=function(e){return this.tweens.push(e),this},Queue.prototype.remove=function(e){var t=this.tweens.indexOf(e);return-1!==t&&this.tweens.splice(t,1),this},Queue.prototype.update=function(e){if(0===this.tweens.length)return!1;var t=0;if(void 0===e){var n=this.window||n;e=void 0!==n&&void 0!==n.performance&&void 0!==n.performance.now?n.performance.now():Date.now()}for(;t<this.tweens.length;){var i=this.tweens[t],a=i.update(e);if(i.remove||!a){if(this.tweens.splice(t,1),!i.remove&&i.chained){var r=i.chained.length;for(t=0;t<r;t++){var o=i.chained[t];this.add(o),o.start(e)}}}else t++}return!0},Queue.prototype.start=function(e){for(var t=this.tweens.length-1;t>=0;t--)this.tweens[t].start(e);return this};var queue=Queue,tweeno={Tween:tween,Filter:filter$1,Queue:queue,Interpolation:interpolation,Easing:easing};function convertToNumber(e){return Number(e)?Number(e):e}async function lookForComponent(e){var t,n=getComponentByIdAndKey(e.component.id,e.component.key);try{if(!n)throw"error";t=n}catch(n){try{t=await figma.importComponentByKeyAsync(e.component.key)}catch(t){if(t.startsWith("Could not find a published component with the key")){console.log("Template: ",e);try{figma.notify("Check component is published",{error:!0})}catch(e){console.log(e)}}}}return t}function isEmpty$1(e){for(var t in e)if(Object.prototype.hasOwnProperty.call(e,t))return!1;return JSON.stringify(e)===JSON.stringify({})}function getComponentByIdAndKey(e,t){var n=figma.getNodeById(e);if(n&&"COMPONENT"===n.type){if(!n)return null;if(null===n.parent||null===n.parent.parent)return!1;if(n.key===t)return n}}function getComponentById(e){var t=figma.getNodeById(e);if(t&&"COMPONENT"===t.type)return null!==t.parent&&null!==t.parent.parent&&t}function createPage(e){var t=figma.createPage();return t.name=e,figma.currentPage=t,t}function isVariant(e){var t;if("INSTANCE"===e.type)return"COMPONENT_SET"===(null===(t=e.mainComponent.parent)||void 0===t?void 0:t.type)}function getVariantName(e){var t,n;if(isVariant(e)){let i=(null===(t=e.variantProperties)||void 0===t?void 0:t.Type)||(null===(n=e.variantProperties)||void 0===n?void 0:n.type);return i?e.name+"/"+i:e.name+"/"+e.mainComponent.name}return e.name}function getSelectionName(e){return e?isVariant(e)?getVariantName(e):e.name:void 0}function isInsideComponent(e){const t=e.parent;return!!t&&(!(!t||"COMPONENT"!==t.type)||(!t||"PAGE"!==t.type)&&isInsideComponent(t))}function move(e,t,n,i){let a=e.splice(t,1)[0];return i?e.splice(n,0,i):e.splice(n,0,a),e}function upsert(e,t,n){e.some(((i,a)=>{let r=!1;return!0===t(e[a])&&(r=!0,n?move(e,a,0,n):move(e,a,0)),r}));let i=!1;return e.map(((n,a)=>{!0===t(e[a])&&(i=!0)})),i||e.unshift(n),e}function getParentComponent(e){const t=e.parent;return!!t&&(t&&"COMPONENT"===t.type?t:(!t||"PAGE"!==t.type)&&getParentComponent(t))}function animateNodeIntoView(e,t,n){let i=getPageNode_1(e[0]);figma.currentPage=i;let a=Object.assign(Object.assign({},figma.viewport.center),{z:figma.viewport.zoom});figma.viewport.scrollAndZoomIntoView(e);let r=Object.assign(Object.assign({},Object.assign({},figma.viewport.center)),{z:figma.viewport.zoom});figma.viewport.center={x:a.x,y:a.y},figma.viewport.zoom=a.z;var o={from:a,to:r,duration:t||1e3,repeat:0,easing:n||tweeno.Easing.Cubic.Out},l=Object.assign(Object.assign({},a),{update:function(){figma.viewport.center={x:this.x,y:this.y},figma.viewport.zoom=this.z}}),s=new tweeno.Queue,u=new tweeno.Tween(l,o);s.add(u),s.start();let c=setInterval((()=>{0===s.tweens.length?clearInterval(c):(s.update(),l.update())}),1)}function positionInCenterOfViewport(e){e.x=figma.viewport.center.x-e.width/2,e.y=figma.viewport.center.y-e.height/2}function swapAxises(e){let t=e.primaryAxisSizingMode,n=e.counterAxisSizingMode;return e.primaryAxisSizingMode=n,e.counterAxisSizingMode=t,e}function genRandomId(){return Array(10).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz").map((function(e){return e[Math.floor(Math.random()*e.length)]})).join("")}function clone$1(e){return JSON.parse(JSON.stringify(e))}function getTemplateParts$1(e){let t=["tr","td","th","table"],n={};for(let i=0;i<t.length;i++){let a=t[i],r=e.findOne((e=>{let t=getPluginData_1(e,"elementSemantics");if((null==t?void 0:t.is)===a)return!0}));n[a]=r}return n.table||"table"===getPluginData_1(e,"elementSemantics").is&&(n.table=e),n.container=e,n}function removeChildren(e){for(let t=e.children.length-1;t>=0;t--)e.children[t].remove()}function copyPasteStyle(e,t,n={}){const i=["opacity","blendMode","effects","effectStyleId","backgrounds","backgroundStyleId","fills","strokes","strokeWeight","strokeMiterLimit","strokeAlign","strokeCap","strokeJoin","dashPattern","fillStyleId","strokeStyleId","cornerRadius","cornerSmoothing","topLeftRadius","topRightRadius","bottomLeftRadius","bottomRightRadius","paddingLeft","paddingRight","paddingTop","paddingBottom","itemSpacing","clipsContent","layoutMode","strokeTopWeight","strokeBottomWeight","strokeRightWeight","strokeLeftWeight"];return n.include?n.include=n.include.concat(i):n.include=i,copyPaste_1(e,t,n)}async function changeText(e,t,n){e.fontName===figma.mixed?await figma.loadFontAsync(e.getRangeFontName(0,1)):await figma.loadFontAsync({family:e.fontName.family,style:n||e.fontName.style}),n&&(e.fontName={family:e.fontName.family,style:n}),t&&(e.characters=t)}async function overrideChildrenChars2(e,t,n,i){for(let a=0;a<e.length;a++)n[a]&&i[a]&&(n[a].name===i[a].name&&(t[a].name=e[a].name,t[a].visible=e[a].visible,"INSTANCE"===t[a].type&&t[a].swapComponent(e[a].mainComponent)),t[a].children&&e[a].children?await overrideChildrenChars2(e[a].children,t[a].children,n[a].children,i[a].children):"TEXT"===e[a].type&&await changeText(t[a],e[a].characters,e[a].fontName.style))}async function swapInstance(e,t){e&&t&&await overrideChildrenChars2(e.children,t.children,e.mainComponent.children,t.mainComponent.children)}function isTheme(e){return(255*e.r*299+255*e.g*587+255*e.b*114)/1e3>160||"figjam"===figma.editorType?"light":"dark"}async function createTooltip(e,t){let n="light";"dark"===isTheme(t||figma.currentPage.backgrounds[0].color)&&(n="dark"),await async function(){await Promise.all([figma.loadFontAsync({family:"Inter",style:"Regular"})])}();var i=figma.createComponent();i.resize(457,53),i.counterAxisSizingMode="AUTO",i.name=".Tooltip",i.relativeTransform=[[1,0,13222],[0,1,7008]],i.x=13222,i.y=7008,i.fills=[],i.cornerRadius=8,i.primaryAxisSizingMode="FIXED",i.strokeTopWeight=1,i.strokeBottomWeight=1,i.strokeLeftWeight=1,i.strokeRightWeight=1,i.backgrounds=[],i.expanded=!1,i.layoutMode="HORIZONTAL",i.counterAxisSizingMode="AUTO";var a=figma.createFrame();i.appendChild(a),a.resize(457,53),a.primaryAxisSizingMode="AUTO",a.name="Artwork",a.layoutPositioning="ABSOLUTE",a.fills=[],a.strokeTopWeight=1,a.strokeBottomWeight=1,a.strokeLeftWeight=1,a.strokeRightWeight=1,a.backgrounds=[],a.clipsContent=!1,a.expanded=!1,a.constraints={horizontal:"STRETCH",vertical:"STRETCH"};var r=figma.createRectangle();a.appendChild(r),r.resize(15.5563220978,15.5563220978),r.name="Rectangle 1",r.fills=[{type:"SOLID",visible:!0,opacity:1,blendMode:"NORMAL",color:{r:1,g:1,b:1}}],r.fills=[{type:"SOLID",visible:!0,opacity:1,blendMode:"NORMAL",color:{r:1,g:1,b:1}}],r.relativeTransform=[[.7071068287,-.7071068287,0],[.7071068287,.7071068287,16]],r.y=16,r.rotation=-45,r.constrainProportions=!0,r.strokeTopWeight=1,r.strokeBottomWeight=1,r.strokeLeftWeight=1,r.strokeRightWeight=1;var o=figma.createRectangle();a.appendChild(o),o.resize(457,53),o.name="Rectangle 2",o.fills=[{type:"SOLID",visible:!0,opacity:1,blendMode:"NORMAL",color:{r:1,g:1,b:1}}],o.constraints={horizontal:"MIN",vertical:"STRETCH"},o.cornerRadius=8,o.strokeTopWeight=1,o.strokeBottomWeight=1,o.strokeLeftWeight=1,o.strokeRightWeight=1;var l=figma.union([r,o],a);l.name="Union",l.visible=!0,l.locked=!1,l.opacity=1,l.blendMode="PASS_THROUGH",l.isMask=!1,l.effects=[{type:"DROP_SHADOW",color:{r:0,g:0,b:0,a:.07000000029802322},offset:{x:0,y:4},radius:12,spread:0,visible:!0,blendMode:"NORMAL",showShadowBehindNode:!1}],l.fills=[{type:"SOLID",visible:!0,opacity:1,blendMode:"NORMAL",color:{r:1,g:1,b:1}}],l.strokes=[{type:"SOLID",visible:!0,opacity:.10000000149011612,blendMode:"NORMAL",color:{r:0,g:0,b:0}}],l.strokeWeight=1,l.strokeAlign="INSIDE",l.strokeJoin="MITER",l.dashPattern=[],l.strokeCap="NONE",l.strokeMiterLimit=4,l.layoutAlign="INHERIT",l.constrainProportions=!1,l.layoutGrow=0,l.layoutPositioning="AUTO",l.exportSettings=[],l.cornerRadius=0,l.cornerSmoothing=0,l.expanded=!1,l.reactions=[];var s=figma.createText();i.appendChild(s),s.resize(417,21),s.name="Only layer styles such as: background, color, border radius etc will be used to create tables. You don't have to create tables using the plugin. You can also create tables by creating an instance of this component and detaching them and their rows. If you change the styles used on the table or row components you can update existing tables by going to Plugins > Table Creator > Settings and select Refresh Tables",s.relativeTransform=[[1,0,20],[0,1,16]],s.x=20,s.y=16,s.layoutGrow=1,s.autoRename=!1,s.listSpacing=0,s.characters="Text",s.fontSize=14,s.lineHeight={unit:"PERCENT",value:150},s.fontName={family:"Inter",style:"Regular"},s.textAutoResize="HEIGHT",i.remove();var u=i.createInstance();figma.currentPage.appendChild(u),u.relativeTransform=[[1,0,13222],[0,1,7163]],u.y=7163,u.swapComponent(i);var c=figma.getNodeById("I"+u.id+";"+a.id);c.resize(457,116),c.primaryAxisSizingMode="AUTO";var d=figma.getNodeById("I"+u.id+";"+l.id);figma.getNodeById("I"+u.id+";"+r.id),figma.getNodeById("I"+u.id+";"+o.id).resize(457,116);var p=figma.getNodeById("I"+u.id+";"+s.id);return p.resize(417,84),p.characters=e,i.paddingLeft=20,i.paddingRight=20,i.paddingTop=16,i.paddingBottom=16,"dark"===n&&(p.fills=[{type:"SOLID",visible:!0,opacity:1,blendMode:"NORMAL",color:{r:1,g:1,b:1}}],d.fills=[{type:"SOLID",visible:!0,opacity:1,blendMode:"NORMAL",color:{r:.21250000596046448,g:.21250000596046448,b:.21250000596046448}}],d.strokes=[{type:"SOLID",visible:!0,opacity:.10000000149011612,blendMode:"NORMAL",color:{r:1,g:1,b:1}}],d.effects=[{type:"DROP_SHADOW",color:{r:0,g:0,b:0,a:.10000000149011612},offset:{x:0,y:4},radius:12,spread:0,visible:!0,blendMode:"NORMAL",showShadowBehindNode:!1}]),u}async function createTemplateComponents(){let e="light";"dark"===isTheme(figma.currentPage.backgrounds[0].color)&&(e="dark"),await async function(){await Promise.all([figma.loadFontAsync({family:"Inter",style:"Regular"}),figma.loadFontAsync({family:"Inter",style:"Semi Bold"})])}();var t=figma.createComponent();t.resize(120,35),t.name="Type=Default",t.relativeTransform=[[1,0,16],[0,1,16]],t.x=16,t.y=16,t.layoutAlign="STRETCH",t.fills=[{type:"SOLID",visible:!0,opacity:.0020000000949949026,blendMode:"NORMAL",color:{r:1,g:1,b:1}}],t.strokes="dark"===e?[{type:"SOLID",visible:!0,opacity:1,blendMode:"NORMAL",color:{r:.3583333194255829,g:.3583333194255829,b:.3583333194255829}}]:[{type:"SOLID",visible:!0,opacity:1,blendMode:"NORMAL",color:{r:.7254902124404907,g:.7254902124404907,b:.7254902124404907}}],t.primaryAxisSizingMode="FIXED",t.strokeTopWeight=1,t.strokeBottomWeight=0,t.strokeLeftWeight=1,t.strokeRightWeight=0,t.backgrounds=[{type:"SOLID",visible:!0,opacity:.0020000000949949026,blendMode:"NORMAL",color:{r:1,g:1,b:1}}],t.expanded=!1,t.layoutMode="VERTICAL";var n=figma.createFrame();t.appendChild(n),n.resize(120,35),n.counterAxisSizingMode="AUTO",n.primaryAxisSizingMode="FIXED",n.name="Content",n.layoutAlign="STRETCH",n.fills=[],n.paddingLeft=12,n.paddingRight=12,n.paddingTop=10,n.paddingBottom=10,n.strokeTopWeight=1,n.strokeBottomWeight=1,n.strokeLeftWeight=1,n.strokeRightWeight=1,n.backgrounds=[],n.expanded=!1,n.layoutMode="HORIZONTAL";var i=figma.createText();n.appendChild(i),i.resize(96,15),i.relativeTransform=[[1,0,12],[0,1,10]],i.x=12,i.y=10,i.layoutGrow=1,i.fontName={family:"Inter",style:"Regular"},i.listSpacing=0,i.characters="",i.lineHeight={unit:"PERCENT",value:130},i.fontName={family:"Inter",style:"Regular"},i.textAutoResize="HEIGHT","dark"===e&&(i.fills=[{type:"SOLID",visible:!0,opacity:1,blendMode:"NORMAL",color:{r:1,g:1,b:1}}]);var a=figma.createComponent();a.resize(120,35),a.name="Type=Header",a.relativeTransform=[[1,0,136],[0,1,16]],a.x=136,a.y=16,a.layoutAlign="STRETCH","dark"===e?(a.fills=[{type:"SOLID",visible:!0,opacity:.05,blendMode:"NORMAL",color:{r:1,g:1,b:1}}],a.strokes=[{type:"SOLID",visible:!0,opacity:1,blendMode:"NORMAL",color:{r:.3583333194255829,g:.3583333194255829,b:.3583333194255829}}]):(a.fills=[{type:"SOLID",visible:!0,opacity:.05999999865889549,blendMode:"NORMAL",color:{r:0,g:0,b:0}}],a.strokes=[{type:"SOLID",visible:!0,opacity:1,blendMode:"NORMAL",color:{r:.7254902124404907,g:.7254902124404907,b:.7254902124404907}}]),a.primaryAxisSizingMode="FIXED",a.strokeTopWeight=1,a.strokeBottomWeight=0,a.strokeLeftWeight=1,a.strokeRightWeight=0,a.expanded=!1,a.layoutMode="VERTICAL";var r=figma.createFrame();a.appendChild(r),r.resize(120,35),r.counterAxisSizingMode="AUTO",r.primaryAxisSizingMode="FIXED",r.name="Content",r.layoutAlign="STRETCH",r.fills=[],r.paddingLeft=12,r.paddingRight=12,r.paddingTop=10,r.paddingBottom=10,r.strokeTopWeight=1,r.strokeBottomWeight=1,r.strokeLeftWeight=1,r.strokeRightWeight=1,r.backgrounds=[],r.expanded=!1,r.layoutMode="HORIZONTAL";var o=figma.createText();r.appendChild(o),o.resize(96,15),o.relativeTransform=[[1,0,12],[0,1,10]],o.x=12,o.y=10,o.layoutGrow=1,o.fontName={family:"Inter",style:"Semi Bold"},o.listSpacing=0,o.characters="",o.lineHeight={unit:"PERCENT",value:130},o.fontName={family:"Inter",style:"Semi Bold"},o.textAutoResize="HEIGHT","dark"===e&&(o.fills=[{type:"SOLID",visible:!0,opacity:1,blendMode:"NORMAL",color:{r:1,g:1,b:1}}]);var l=figma.combineAsVariants([t,a],figma.currentPage);l.resize(272,67),l.primaryAxisSizingMode="AUTO",l.counterAxisSizingMode="AUTO",l.name="Cell",l.visible=!0,l.locked=!1,l.opacity=1,l.blendMode="PASS_THROUGH",l.isMask=!1,l.effects=[],l.relativeTransform=[[1,0,11673],[0,1,7538]],l.x=11673,l.y=7538,l.rotation=0,l.layoutAlign="INHERIT",l.constrainProportions=!1,l.layoutGrow=0,l.layoutPositioning="AUTO",l.exportSettings=[],l.fills=[],l.strokes=[{type:"SOLID",visible:!0,opacity:1,blendMode:"NORMAL",color:{r:.7254902124404907,g:.7254902124404907,b:.7254902124404907}}],l.strokeWeight=1,l.strokeAlign="INSIDE",l.strokeJoin="MITER",l.dashPattern=[10,5],l.strokeCap="NONE",l.strokeMiterLimit=4,l.cornerRadius=5,l.cornerSmoothing=0,l.paddingLeft=16,l.paddingRight=16,l.paddingTop=16,l.paddingBottom=16,l.primaryAxisAlignItems="MIN",l.counterAxisAlignItems="MIN",l.primaryAxisSizingMode="AUTO",l.strokeTopWeight=1,l.strokeBottomWeight=1,l.strokeLeftWeight=1,l.strokeRightWeight=1,l.layoutGrids=[],l.backgrounds=[],l.clipsContent=!0,l.guides=[],l.expanded=!1,l.constraints={horizontal:"MIN",vertical:"MIN"},l.layoutMode="HORIZONTAL",l.counterAxisSizingMode="AUTO",l.itemSpacing=0,l.overflowDirection="NONE",l.numberOfFixedChildren=0,l.itemReverseZIndex=!1,l.strokesIncludedInLayout=!1,l.description="",l.documentationLinks=[];var s=figma.createComponent();figma.currentPage.appendChild(s),s.resize(240,35),s.primaryAxisSizingMode="AUTO",s.counterAxisSizingMode="AUTO",s.name="Row",s.relativeTransform=[[1,0,11689],[0,1,7399]],s.x=11689,s.y=7399,s.fills=[{type:"SOLID",visible:!0,opacity:9999999747378752e-20,blendMode:"NORMAL",color:{r:1,g:1,b:1}}],s.strokeTopWeight=1,s.strokeBottomWeight=1,s.strokeLeftWeight=1,s.strokeRightWeight=1,s.backgrounds=[{type:"SOLID",visible:!0,opacity:9999999747378752e-20,blendMode:"NORMAL",color:{r:1,g:1,b:1}}],s.clipsContent=!0,s.expanded=!1,s.layoutMode="HORIZONTAL",s.counterAxisSizingMode="AUTO",s.layoutAlign="STRETCH",s.primaryAxisSizingMode="FIXED";var u=t.createInstance();s.appendChild(u),u.relativeTransform=[[1,0,0],[0,1,0]],u.layoutAlign="STRETCH",u.swapComponent(t),figma.getNodeById("I"+u.id+";"+n.id),figma.getNodeById("I"+u.id+";"+i.id);var c=t.createInstance();s.appendChild(c),c.relativeTransform=[[1,0,120],[0,1,0]],c.x=120,c.layoutAlign="STRETCH",c.swapComponent(t),figma.getNodeById("I"+c.id+";"+n.id),figma.getNodeById("I"+c.id+";"+i.id);var d=figma.createComponent();figma.currentPage.appendChild(d),d.resize(240,105),d.primaryAxisSizingMode="AUTO",d.counterAxisSizingMode="AUTO",d.name="Table 1",d.relativeTransform=[[1,0,11689],[0,1,7174]],d.x=11689,d.y=7174,"dark"===e?(d.fills=[{type:"SOLID",visible:!0,opacity:1,blendMode:"NORMAL",color:{r:.21250000596046448,g:.21250000596046448,b:.21250000596046448}}],d.strokes=[{type:"SOLID",visible:!0,opacity:1,blendMode:"NORMAL",color:{r:.3583333194255829,g:.3583333194255829,b:.3583333194255829}}]):(d.fills=[{type:"SOLID",visible:!0,opacity:1,blendMode:"NORMAL",color:{r:1,g:1,b:1}}],d.strokes=[{type:"SOLID",visible:!0,opacity:1,blendMode:"NORMAL",color:{r:.7254902124404907,g:.7254902124404907,b:.7254902124404907}}]),d.cornerRadius=4,d.strokeTopWeight=1,d.strokeBottomWeight=1,d.strokeLeftWeight=1,d.strokeRightWeight=1,d.clipsContent=!0,d.expanded=!1,d.layoutMode="VERTICAL",d.counterAxisSizingMode="AUTO";var p=s.createInstance();d.appendChild(p),p.relativeTransform=[[1,0,0],[0,1,0]],p.layoutAlign="STRETCH",p.primaryAxisSizingMode="FIXED",p.swapComponent(s);var g=figma.getNodeById("I"+p.id+";"+u.id);g.fills=[{type:"SOLID",visible:!0,opacity:.05999999865889549,blendMode:"NORMAL",color:{r:0,g:0,b:0}}],g.backgrounds=[{type:"SOLID",visible:!0,opacity:.05999999865889549,blendMode:"NORMAL",color:{r:0,g:0,b:0}}],g.swapComponent(a),figma.getNodeById(g.id+";"+r.id),figma.getNodeById(g.id+";"+o.id);var m=figma.getNodeById("I"+p.id+";"+c.id);m.fills=[{type:"SOLID",visible:!0,opacity:.05999999865889549,blendMode:"NORMAL",color:{r:0,g:0,b:0}}],m.backgrounds=[{type:"SOLID",visible:!0,opacity:.05999999865889549,blendMode:"NORMAL",color:{r:0,g:0,b:0}}],m.swapComponent(a),figma.getNodeById(m.id+";"+r.id),figma.getNodeById(m.id+";"+o.id);var f=s.createInstance();d.appendChild(f),f.relativeTransform=[[1,0,0],[0,1,35]],f.y=35,f.layoutAlign="STRETCH",f.primaryAxisSizingMode="FIXED",f.swapComponent(s);var h=figma.getNodeById("I"+f.id+";"+u.id);h.swapComponent(t),figma.getNodeById(h.id+";"+n.id),figma.getNodeById(h.id+";"+i.id);var y=figma.getNodeById("I"+f.id+";"+c.id);y.swapComponent(t),figma.getNodeById(y.id+";"+n.id),figma.getNodeById(y.id+";"+i.id);var v=s.createInstance();d.appendChild(v),v.relativeTransform=[[1,0,0],[0,1,70]],v.y=70,v.layoutAlign="STRETCH",v.primaryAxisSizingMode="FIXED",v.swapComponent(s);var b=figma.getNodeById("I"+v.id+";"+u.id);b.swapComponent(t),figma.getNodeById(b.id+";"+n.id),figma.getNodeById(b.id+";"+i.id);var T=figma.getNodeById("I"+v.id+";"+c.id);return T.swapComponent(t),figma.getNodeById(T.id+";"+n.id),figma.getNodeById(T.id+";"+i.id),setPluginData_1(d,"elementSemantics",{is:"table"}),setPluginData_1(s,"elementSemantics",{is:"tr"}),setPluginData_1(t,"elementSemantics",{is:"td"}),setPluginData_1(a,"elementSemantics",{is:"th"}),t.setRelaunchData({selectColumn:"Select all cells in column",selectRow:"Select all cells in row"}),a.setRelaunchData({selectColumn:"Select all cells in column",selectRow:"Select all cells in row"}),{templateComponent:d,rowComponent:s,cellComponentSet:l}}var VERSION="1.13.4",root="object"==typeof self&&self.self===self&&self||"object"==typeof global$1&&global$1.global===global$1&&global$1||Function("return this")()||{},ArrayProto=Array.prototype,ObjProto=Object.prototype,SymbolProto="undefined"!=typeof Symbol?Symbol.prototype:null,push=ArrayProto.push,slice=ArrayProto.slice,toString=ObjProto.toString,hasOwnProperty=ObjProto.hasOwnProperty,supportsArrayBuffer="undefined"!=typeof ArrayBuffer,supportsDataView="undefined"!=typeof DataView,nativeIsArray=Array.isArray,nativeKeys=Object.keys,nativeCreate=Object.create,nativeIsView=supportsArrayBuffer&&ArrayBuffer.isView,_isNaN=isNaN,_isFinite=isFinite,hasEnumBug=!{toString:null}.propertyIsEnumerable("toString"),nonEnumerableProps=["valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"],MAX_ARRAY_INDEX=Math.pow(2,53)-1;function restArguments(e,t){return t=null==t?e.length-1:+t,function(){for(var n=Math.max(arguments.length-t,0),i=Array(n),a=0;a<n;a++)i[a]=arguments[a+t];switch(t){case 0:return e.call(this,i);case 1:return e.call(this,arguments[0],i);case 2:return e.call(this,arguments[0],arguments[1],i)}var r=Array(t+1);for(a=0;a<t;a++)r[a]=arguments[a];return r[t]=i,e.apply(this,r)}}function isObject(e){var t=typeof e;return"function"===t||"object"===t&&!!e}function isNull(e){return null===e}function isUndefined(e){return void 0===e}function isBoolean(e){return!0===e||!1===e||"[object Boolean]"===toString.call(e)}function isElement(e){return!(!e||1!==e.nodeType)}function tagTester(e){var t="[object "+e+"]";return function(e){return toString.call(e)===t}}var isString=tagTester("String"),isNumber=tagTester("Number"),isDate=tagTester("Date"),isRegExp=tagTester("RegExp"),isError=tagTester("Error"),isSymbol=tagTester("Symbol"),isArrayBuffer=tagTester("ArrayBuffer"),isFunction=tagTester("Function"),nodelist=root.document&&root.document.childNodes;"function"!=typeof/./&&"object"!=typeof Int8Array&&"function"!=typeof nodelist&&(isFunction=function(e){return"function"==typeof e||!1});var isFunction$1=isFunction,hasObjectTag=tagTester("Object"),hasStringTagBug=supportsDataView&&hasObjectTag(new DataView(new ArrayBuffer(8))),isIE11="undefined"!=typeof Map&&hasObjectTag(new Map),isDataView=tagTester("DataView");function ie10IsDataView(e){return null!=e&&isFunction$1(e.getInt8)&&isArrayBuffer(e.buffer)}var isDataView$1=hasStringTagBug?ie10IsDataView:isDataView,isArray=nativeIsArray||tagTester("Array");function has$1(e,t){return null!=e&&hasOwnProperty.call(e,t)}var isArguments=tagTester("Arguments");!function(){isArguments(arguments)||(isArguments=function(e){return has$1(e,"callee")})}();var isArguments$1=isArguments;function isFinite$1(e){return!isSymbol(e)&&_isFinite(e)&&!isNaN(parseFloat(e))}function isNaN$1(e){return isNumber(e)&&_isNaN(e)}function constant(e){return function(){return e}}function createSizePropertyCheck(e){return function(t){var n=e(t);return"number"==typeof n&&n>=0&&n<=MAX_ARRAY_INDEX}}function shallowProperty(e){return function(t){return null==t?void 0:t[e]}}var getByteLength=shallowProperty("byteLength"),isBufferLike=createSizePropertyCheck(getByteLength),typedArrayPattern=/\[object ((I|Ui)nt(8|16|32)|Float(32|64)|Uint8Clamped|Big(I|Ui)nt64)Array\]/;function isTypedArray(e){return nativeIsView?nativeIsView(e)&&!isDataView$1(e):isBufferLike(e)&&typedArrayPattern.test(toString.call(e))}var isTypedArray$1=supportsArrayBuffer?isTypedArray:constant(!1),getLength=shallowProperty("length");function emulatedSet(e){for(var t={},n=e.length,i=0;i<n;++i)t[e[i]]=!0;return{contains:function(e){return!0===t[e]},push:function(n){return t[n]=!0,e.push(n)}}}function collectNonEnumProps(e,t){t=emulatedSet(t);var n=nonEnumerableProps.length,i=e.constructor,a=isFunction$1(i)&&i.prototype||ObjProto,r="constructor";for(has$1(e,r)&&!t.contains(r)&&t.push(r);n--;)(r=nonEnumerableProps[n])in e&&e[r]!==a[r]&&!t.contains(r)&&t.push(r)}function keys(e){if(!isObject(e))return[];if(nativeKeys)return nativeKeys(e);var t=[];for(var n in e)has$1(e,n)&&t.push(n);return hasEnumBug&&collectNonEnumProps(e,t),t}function isEmpty(e){if(null==e)return!0;var t=getLength(e);return"number"==typeof t&&(isArray(e)||isString(e)||isArguments$1(e))?0===t:0===getLength(keys(e))}function isMatch(e,t){var n=keys(t),i=n.length;if(null==e)return!i;for(var a=Object(e),r=0;r<i;r++){var o=n[r];if(t[o]!==a[o]||!(o in a))return!1}return!0}function _$1(e){return e instanceof _$1?e:this instanceof _$1?void(this._wrapped=e):new _$1(e)}function toBufferView(e){return new Uint8Array(e.buffer||e,e.byteOffset||0,getByteLength(e))}_$1.VERSION=VERSION,_$1.prototype.value=function(){return this._wrapped},_$1.prototype.valueOf=_$1.prototype.toJSON=_$1.prototype.value,_$1.prototype.toString=function(){return String(this._wrapped)};var tagDataView="[object DataView]";function eq(e,t,n,i){if(e===t)return 0!==e||1/e==1/t;if(null==e||null==t)return!1;if(e!=e)return t!=t;var a=typeof e;return("function"===a||"object"===a||"object"==typeof t)&&deepEq(e,t,n,i)}function deepEq(e,t,n,i){e instanceof _$1&&(e=e._wrapped),t instanceof _$1&&(t=t._wrapped);var a=toString.call(e);if(a!==toString.call(t))return!1;if(hasStringTagBug&&"[object Object]"==a&&isDataView$1(e)){if(!isDataView$1(t))return!1;a=tagDataView}switch(a){case"[object RegExp]":case"[object String]":return""+e==""+t;case"[object Number]":return+e!=+e?+t!=+t:0==+e?1/+e==1/t:+e==+t;case"[object Date]":case"[object Boolean]":return+e==+t;case"[object Symbol]":return SymbolProto.valueOf.call(e)===SymbolProto.valueOf.call(t);case"[object ArrayBuffer]":case tagDataView:return deepEq(toBufferView(e),toBufferView(t),n,i)}var r="[object Array]"===a;if(!r&&isTypedArray$1(e)){if(getByteLength(e)!==getByteLength(t))return!1;if(e.buffer===t.buffer&&e.byteOffset===t.byteOffset)return!0;r=!0}if(!r){if("object"!=typeof e||"object"!=typeof t)return!1;var o=e.constructor,l=t.constructor;if(o!==l&&!(isFunction$1(o)&&o instanceof o&&isFunction$1(l)&&l instanceof l)&&"constructor"in e&&"constructor"in t)return!1}i=i||[];for(var s=(n=n||[]).length;s--;)if(n[s]===e)return i[s]===t;if(n.push(e),i.push(t),r){if((s=e.length)!==t.length)return!1;for(;s--;)if(!eq(e[s],t[s],n,i))return!1}else{var u,c=keys(e);if(s=c.length,keys(t).length!==s)return!1;for(;s--;)if(!has$1(t,u=c[s])||!eq(e[u],t[u],n,i))return!1}return n.pop(),i.pop(),!0}function isEqual(e,t){return eq(e,t)}function allKeys(e){if(!isObject(e))return[];var t=[];for(var n in e)t.push(n);return hasEnumBug&&collectNonEnumProps(e,t),t}function ie11fingerprint(e){var t=getLength(e);return function(n){if(null==n)return!1;var i=allKeys(n);if(getLength(i))return!1;for(var a=0;a<t;a++)if(!isFunction$1(n[e[a]]))return!1;return e!==weakMapMethods||!isFunction$1(n[forEachName])}}var forEachName="forEach",hasName="has",commonInit=["clear","delete"],mapTail=["get",hasName,"set"],mapMethods=commonInit.concat(forEachName,mapTail),weakMapMethods=commonInit.concat(mapTail),setMethods=["add"].concat(commonInit,forEachName,hasName),isMap=isIE11?ie11fingerprint(mapMethods):tagTester("Map"),isWeakMap=isIE11?ie11fingerprint(weakMapMethods):tagTester("WeakMap"),isSet=isIE11?ie11fingerprint(setMethods):tagTester("Set"),isWeakSet=tagTester("WeakSet");function values(e){for(var t=keys(e),n=t.length,i=Array(n),a=0;a<n;a++)i[a]=e[t[a]];return i}function pairs(e){for(var t=keys(e),n=t.length,i=Array(n),a=0;a<n;a++)i[a]=[t[a],e[t[a]]];return i}function invert(e){for(var t={},n=keys(e),i=0,a=n.length;i<a;i++)t[e[n[i]]]=n[i];return t}function functions(e){var t=[];for(var n in e)isFunction$1(e[n])&&t.push(n);return t.sort()}function createAssigner(e,t){return function(n){var i=arguments.length;if(t&&(n=Object(n)),i<2||null==n)return n;for(var a=1;a<i;a++)for(var r=arguments[a],o=e(r),l=o.length,s=0;s<l;s++){var u=o[s];t&&void 0!==n[u]||(n[u]=r[u])}return n}}var extend=createAssigner(allKeys),extendOwn=createAssigner(keys),defaults=createAssigner(allKeys,!0);function ctor(){return function(){}}function baseCreate(e){if(!isObject(e))return{};if(nativeCreate)return nativeCreate(e);var t=ctor();t.prototype=e;var n=new t;return t.prototype=null,n}function create(e,t){var n=baseCreate(e);return t&&extendOwn(n,t),n}function clone(e){return isObject(e)?isArray(e)?e.slice():extend({},e):e}function tap(e,t){return t(e),e}function toPath$1(e){return isArray(e)?e:[e]}function toPath(e){return _$1.toPath(e)}function deepGet(e,t){for(var n=t.length,i=0;i<n;i++){if(null==e)return;e=e[t[i]]}return n?e:void 0}function get(e,t,n){var i=deepGet(e,toPath(t));return isUndefined(i)?n:i}function has(e,t){for(var n=(t=toPath(t)).length,i=0;i<n;i++){var a=t[i];if(!has$1(e,a))return!1;e=e[a]}return!!n}function identity(e){return e}function matcher(e){return e=extendOwn({},e),function(t){return isMatch(t,e)}}function property(e){return e=toPath(e),function(t){return deepGet(t,e)}}function optimizeCb(e,t,n){if(void 0===t)return e;switch(null==n?3:n){case 1:return function(n){return e.call(t,n)};case 3:return function(n,i,a){return e.call(t,n,i,a)};case 4:return function(n,i,a,r){return e.call(t,n,i,a,r)}}return function(){return e.apply(t,arguments)}}function baseIteratee(e,t,n){return null==e?identity:isFunction$1(e)?optimizeCb(e,t,n):isObject(e)&&!isArray(e)?matcher(e):property(e)}function iteratee(e,t){return baseIteratee(e,t,1/0)}function cb(e,t,n){return _$1.iteratee!==iteratee?_$1.iteratee(e,t):baseIteratee(e,t,n)}function mapObject(e,t,n){t=cb(t,n);for(var i=keys(e),a=i.length,r={},o=0;o<a;o++){var l=i[o];r[l]=t(e[l],l,e)}return r}function noop(){}function propertyOf(e){return null==e?noop:function(t){return get(e,t)}}function times(e,t,n){var i=Array(Math.max(0,e));t=optimizeCb(t,n,1);for(var a=0;a<e;a++)i[a]=t(a);return i}function random(e,t){return null==t&&(t=e,e=0),e+Math.floor(Math.random()*(t-e+1))}_$1.toPath=toPath$1,_$1.iteratee=iteratee;var now=Date.now||function(){return(new Date).getTime()};function createEscaper(e){var t=function(t){return e[t]},n="(?:"+keys(e).join("|")+")",i=RegExp(n),a=RegExp(n,"g");return function(e){return e=null==e?"":""+e,i.test(e)?e.replace(a,t):e}}var escapeMap={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},_escape=createEscaper(escapeMap),unescapeMap=invert(escapeMap),_unescape=createEscaper(unescapeMap),templateSettings=_$1.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g},noMatch=/(.)^/,escapes={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},escapeRegExp=/\\|'|\r|\n|\u2028|\u2029/g;function escapeChar(e){return"\\"+escapes[e]}var bareIdentifier=/^\s*(\w|\$)+\s*$/;function template(e,t,n){!t&&n&&(t=n),t=defaults({},t,_$1.templateSettings);var i=RegExp([(t.escape||noMatch).source,(t.interpolate||noMatch).source,(t.evaluate||noMatch).source].join("|")+"|$","g"),a=0,r="__p+='";e.replace(i,(function(t,n,i,o,l){return r+=e.slice(a,l).replace(escapeRegExp,escapeChar),a=l+t.length,n?r+="'+\n((__t=("+n+"))==null?'':_.escape(__t))+\n'":i?r+="'+\n((__t=("+i+"))==null?'':__t)+\n'":o&&(r+="';\n"+o+"\n__p+='"),t})),r+="';\n";var o,l=t.variable;if(l){if(!bareIdentifier.test(l))throw new Error("variable is not a bare identifier: "+l)}else r="with(obj||{}){\n"+r+"}\n",l="obj";r="var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n"+r+"return __p;\n";try{o=new Function(l,"_",r)}catch(e){throw e.source=r,e}var s=function(e){return o.call(this,e,_$1)};return s.source="function("+l+"){\n"+r+"}",s}function result(e,t,n){var i=(t=toPath(t)).length;if(!i)return isFunction$1(n)?n.call(e):n;for(var a=0;a<i;a++){var r=null==e?void 0:e[t[a]];void 0===r&&(r=n,a=i),e=isFunction$1(r)?r.call(e):r}return e}var idCounter=0;function uniqueId(e){var t=++idCounter+"";return e?e+t:t}function chain(e){var t=_$1(e);return t._chain=!0,t}function executeBound(e,t,n,i,a){if(!(i instanceof t))return e.apply(n,a);var r=baseCreate(e.prototype),o=e.apply(r,a);return isObject(o)?o:r}var partial=restArguments((function(e,t){var n=partial.placeholder,i=function(){for(var a=0,r=t.length,o=Array(r),l=0;l<r;l++)o[l]=t[l]===n?arguments[a++]:t[l];for(;a<arguments.length;)o.push(arguments[a++]);return executeBound(e,i,this,this,o)};return i}));partial.placeholder=_$1;var bind=restArguments((function(e,t,n){if(!isFunction$1(e))throw new TypeError("Bind must be called on a function");var i=restArguments((function(a){return executeBound(e,i,t,this,n.concat(a))}));return i})),isArrayLike=createSizePropertyCheck(getLength);function flatten$1(e,t,n,i){if(i=i||[],t||0===t){if(t<=0)return i.concat(e)}else t=1/0;for(var a=i.length,r=0,o=getLength(e);r<o;r++){var l=e[r];if(isArrayLike(l)&&(isArray(l)||isArguments$1(l)))if(t>1)flatten$1(l,t-1,n,i),a=i.length;else for(var s=0,u=l.length;s<u;)i[a++]=l[s++];else n||(i[a++]=l)}return i}var bindAll=restArguments((function(e,t){var n=(t=flatten$1(t,!1,!1)).length;if(n<1)throw new Error("bindAll must be passed function names");for(;n--;){var i=t[n];e[i]=bind(e[i],e)}return e}));function memoize(e,t){var n=function(i){var a=n.cache,r=""+(t?t.apply(this,arguments):i);return has$1(a,r)||(a[r]=e.apply(this,arguments)),a[r]};return n.cache={},n}var delay=restArguments((function(e,t,n){return setTimeout((function(){return e.apply(null,n)}),t)})),defer=partial(delay,_$1,1);function throttle(e,t,n){var i,a,r,o,l=0;n||(n={});var s=function(){l=!1===n.leading?0:now(),i=null,o=e.apply(a,r),i||(a=r=null)},u=function(){var u=now();l||!1!==n.leading||(l=u);var c=t-(u-l);return a=this,r=arguments,c<=0||c>t?(i&&(clearTimeout(i),i=null),l=u,o=e.apply(a,r),i||(a=r=null)):i||!1===n.trailing||(i=setTimeout(s,c)),o};return u.cancel=function(){clearTimeout(i),l=0,i=a=r=null},u}function debounce(e,t,n){var i,a,r,o,l,s=function(){var u=now()-a;t>u?i=setTimeout(s,t-u):(i=null,n||(o=e.apply(l,r)),i||(r=l=null))},u=restArguments((function(u){return l=this,r=u,a=now(),i||(i=setTimeout(s,t),n&&(o=e.apply(l,r))),o}));return u.cancel=function(){clearTimeout(i),i=r=l=null},u}function wrap(e,t){return partial(t,e)}function negate(e){return function(){return!e.apply(this,arguments)}}function compose(){var e=arguments,t=e.length-1;return function(){for(var n=t,i=e[t].apply(this,arguments);n--;)i=e[n].call(this,i);return i}}function after(e,t){return function(){if(--e<1)return t.apply(this,arguments)}}function before(e,t){var n;return function(){return--e>0&&(n=t.apply(this,arguments)),e<=1&&(t=null),n}}var once=partial(before,2);function findKey(e,t,n){t=cb(t,n);for(var i,a=keys(e),r=0,o=a.length;r<o;r++)if(t(e[i=a[r]],i,e))return i}function createPredicateIndexFinder(e){return function(t,n,i){n=cb(n,i);for(var a=getLength(t),r=e>0?0:a-1;r>=0&&r<a;r+=e)if(n(t[r],r,t))return r;return-1}}var findIndex=createPredicateIndexFinder(1),findLastIndex=createPredicateIndexFinder(-1);function sortedIndex(e,t,n,i){for(var a=(n=cb(n,i,1))(t),r=0,o=getLength(e);r<o;){var l=Math.floor((r+o)/2);n(e[l])<a?r=l+1:o=l}return r}function createIndexFinder(e,t,n){return function(i,a,r){var o=0,l=getLength(i);if("number"==typeof r)e>0?o=r>=0?r:Math.max(r+l,o):l=r>=0?Math.min(r+1,l):r+l+1;else if(n&&r&&l)return i[r=n(i,a)]===a?r:-1;if(a!=a)return(r=t(slice.call(i,o,l),isNaN$1))>=0?r+o:-1;for(r=e>0?o:l-1;r>=0&&r<l;r+=e)if(i[r]===a)return r;return-1}}var indexOf=createIndexFinder(1,findIndex,sortedIndex),lastIndexOf=createIndexFinder(-1,findLastIndex);function find(e,t,n){var i=(isArrayLike(e)?findIndex:findKey)(e,t,n);if(void 0!==i&&-1!==i)return e[i]}function findWhere(e,t){return find(e,matcher(t))}function each(e,t,n){var i,a;if(t=optimizeCb(t,n),isArrayLike(e))for(i=0,a=e.length;i<a;i++)t(e[i],i,e);else{var r=keys(e);for(i=0,a=r.length;i<a;i++)t(e[r[i]],r[i],e)}return e}function map(e,t,n){t=cb(t,n);for(var i=!isArrayLike(e)&&keys(e),a=(i||e).length,r=Array(a),o=0;o<a;o++){var l=i?i[o]:o;r[o]=t(e[l],l,e)}return r}function createReduce(e){var t=function(t,n,i,a){var r=!isArrayLike(t)&&keys(t),o=(r||t).length,l=e>0?0:o-1;for(a||(i=t[r?r[l]:l],l+=e);l>=0&&l<o;l+=e){var s=r?r[l]:l;i=n(i,t[s],s,t)}return i};return function(e,n,i,a){var r=arguments.length>=3;return t(e,optimizeCb(n,a,4),i,r)}}var reduce=createReduce(1),reduceRight=createReduce(-1);function filter(e,t,n){var i=[];return t=cb(t,n),each(e,(function(e,n,a){t(e,n,a)&&i.push(e)})),i}function reject(e,t,n){return filter(e,negate(cb(t)),n)}function every(e,t,n){t=cb(t,n);for(var i=!isArrayLike(e)&&keys(e),a=(i||e).length,r=0;r<a;r++){var o=i?i[r]:r;if(!t(e[o],o,e))return!1}return!0}function some(e,t,n){t=cb(t,n);for(var i=!isArrayLike(e)&&keys(e),a=(i||e).length,r=0;r<a;r++){var o=i?i[r]:r;if(t(e[o],o,e))return!0}return!1}function contains(e,t,n,i){return isArrayLike(e)||(e=values(e)),("number"!=typeof n||i)&&(n=0),indexOf(e,t,n)>=0}var invoke=restArguments((function(e,t,n){var i,a;return isFunction$1(t)?a=t:(t=toPath(t),i=t.slice(0,-1),t=t[t.length-1]),map(e,(function(e){var r=a;if(!r){if(i&&i.length&&(e=deepGet(e,i)),null==e)return;r=e[t]}return null==r?r:r.apply(e,n)}))}));function pluck(e,t){return map(e,property(t))}function where(e,t){return filter(e,matcher(t))}function max(e,t,n){var i,a,r=-1/0,o=-1/0;if(null==t||"number"==typeof t&&"object"!=typeof e[0]&&null!=e)for(var l=0,s=(e=isArrayLike(e)?e:values(e)).length;l<s;l++)null!=(i=e[l])&&i>r&&(r=i);else t=cb(t,n),each(e,(function(e,n,i){((a=t(e,n,i))>o||a===-1/0&&r===-1/0)&&(r=e,o=a)}));return r}function min(e,t,n){var i,a,r=1/0,o=1/0;if(null==t||"number"==typeof t&&"object"!=typeof e[0]&&null!=e)for(var l=0,s=(e=isArrayLike(e)?e:values(e)).length;l<s;l++)null!=(i=e[l])&&i<r&&(r=i);else t=cb(t,n),each(e,(function(e,n,i){((a=t(e,n,i))<o||a===1/0&&r===1/0)&&(r=e,o=a)}));return r}var reStrSymbol=/[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;function toArray(e){return e?isArray(e)?slice.call(e):isString(e)?e.match(reStrSymbol):isArrayLike(e)?map(e,identity):values(e):[]}function sample(e,t,n){if(null==t||n)return isArrayLike(e)||(e=values(e)),e[random(e.length-1)];var i=toArray(e),a=getLength(i);t=Math.max(Math.min(t,a),0);for(var r=a-1,o=0;o<t;o++){var l=random(o,r),s=i[o];i[o]=i[l],i[l]=s}return i.slice(0,t)}function shuffle(e){return sample(e,1/0)}function sortBy(e,t,n){var i=0;return t=cb(t,n),pluck(map(e,(function(e,n,a){return{value:e,index:i++,criteria:t(e,n,a)}})).sort((function(e,t){var n=e.criteria,i=t.criteria;if(n!==i){if(n>i||void 0===n)return 1;if(n<i||void 0===i)return-1}return e.index-t.index})),"value")}function group(e,t){return function(n,i,a){var r=t?[[],[]]:{};return i=cb(i,a),each(n,(function(t,a){var o=i(t,a,n);e(r,t,o)})),r}}var groupBy=group((function(e,t,n){has$1(e,n)?e[n].push(t):e[n]=[t]})),indexBy=group((function(e,t,n){e[n]=t})),countBy=group((function(e,t,n){has$1(e,n)?e[n]++:e[n]=1})),partition=group((function(e,t,n){e[n?0:1].push(t)}),!0);function size(e){return null==e?0:isArrayLike(e)?e.length:keys(e).length}function keyInObj(e,t,n){return t in n}var pick=restArguments((function(e,t){var n={},i=t[0];if(null==e)return n;isFunction$1(i)?(t.length>1&&(i=optimizeCb(i,t[1])),t=allKeys(e)):(i=keyInObj,t=flatten$1(t,!1,!1),e=Object(e));for(var a=0,r=t.length;a<r;a++){var o=t[a],l=e[o];i(l,o,e)&&(n[o]=l)}return n})),omit=restArguments((function(e,t){var n,i=t[0];return isFunction$1(i)?(i=negate(i),t.length>1&&(n=t[1])):(t=map(flatten$1(t,!1,!1),String),i=function(e,n){return!contains(t,n)}),pick(e,i,n)}));function initial(e,t,n){return slice.call(e,0,Math.max(0,e.length-(null==t||n?1:t)))}function first(e,t,n){return null==e||e.length<1?null==t||n?void 0:[]:null==t||n?e[0]:initial(e,e.length-t)}function rest(e,t,n){return slice.call(e,null==t||n?1:t)}function last(e,t,n){return null==e||e.length<1?null==t||n?void 0:[]:null==t||n?e[e.length-1]:rest(e,Math.max(0,e.length-t))}function compact(e){return filter(e,Boolean)}function flatten(e,t){return flatten$1(e,t,!1)}var difference=restArguments((function(e,t){return t=flatten$1(t,!0,!0),filter(e,(function(e){return!contains(t,e)}))})),without=restArguments((function(e,t){return difference(e,t)}));function uniq(e,t,n,i){isBoolean(t)||(i=n,n=t,t=!1),null!=n&&(n=cb(n,i));for(var a=[],r=[],o=0,l=getLength(e);o<l;o++){var s=e[o],u=n?n(s,o,e):s;t&&!n?(o&&r===u||a.push(s),r=u):n?contains(r,u)||(r.push(u),a.push(s)):contains(a,s)||a.push(s)}return a}var union=restArguments((function(e){return uniq(flatten$1(e,!0,!0))}));function intersection(e){for(var t=[],n=arguments.length,i=0,a=getLength(e);i<a;i++){var r=e[i];if(!contains(t,r)){var o;for(o=1;o<n&&contains(arguments[o],r);o++);o===n&&t.push(r)}}return t}function unzip(e){for(var t=e&&max(e,getLength).length||0,n=Array(t),i=0;i<t;i++)n[i]=pluck(e,i);return n}var zip=restArguments(unzip);function object(e,t){for(var n={},i=0,a=getLength(e);i<a;i++)t?n[e[i]]=t[i]:n[e[i][0]]=e[i][1];return n}function range(e,t,n){null==t&&(t=e||0,e=0),n||(n=t<e?-1:1);for(var i=Math.max(Math.ceil((t-e)/n),0),a=Array(i),r=0;r<i;r++,e+=n)a[r]=e;return a}function chunk(e,t){if(null==t||t<1)return[];for(var n=[],i=0,a=e.length;i<a;)n.push(slice.call(e,i,i+=t));return n}function chainResult(e,t){return e._chain?_$1(t).chain():t}function mixin(e){return each(functions(e),(function(t){var n=_$1[t]=e[t];_$1.prototype[t]=function(){var e=[this._wrapped];return push.apply(e,arguments),chainResult(this,n.apply(_$1,e))}})),_$1}each(["pop","push","reverse","shift","sort","splice","unshift"],(function(e){var t=ArrayProto[e];_$1.prototype[e]=function(){var n=this._wrapped;return null!=n&&(t.apply(n,arguments),"shift"!==e&&"splice"!==e||0!==n.length||delete n[0]),chainResult(this,n)}})),each(["concat","join","slice"],(function(e){var t=ArrayProto[e];_$1.prototype[e]=function(){var e=this._wrapped;return null!=e&&(e=t.apply(e,arguments)),chainResult(this,e)}}));var allExports=Object.freeze({__proto__:null,VERSION:VERSION,restArguments:restArguments,isObject:isObject,isNull:isNull,isUndefined:isUndefined,isBoolean:isBoolean,isElement:isElement,isString:isString,isNumber:isNumber,isDate:isDate,isRegExp:isRegExp,isError:isError,isSymbol:isSymbol,isArrayBuffer:isArrayBuffer,isDataView:isDataView$1,isArray:isArray,isFunction:isFunction$1,isArguments:isArguments$1,isFinite:isFinite$1,isNaN:isNaN$1,isTypedArray:isTypedArray$1,isEmpty:isEmpty,isMatch:isMatch,isEqual:isEqual,isMap:isMap,isWeakMap:isWeakMap,isSet:isSet,isWeakSet:isWeakSet,keys:keys,allKeys:allKeys,values:values,pairs:pairs,invert:invert,functions:functions,methods:functions,extend:extend,extendOwn:extendOwn,assign:extendOwn,defaults:defaults,create:create,clone:clone,tap:tap,get:get,has:has,mapObject:mapObject,identity:identity,constant:constant,noop:noop,toPath:toPath$1,property:property,propertyOf:propertyOf,matcher:matcher,matches:matcher,times:times,random:random,now:now,escape:_escape,unescape:_unescape,templateSettings:templateSettings,template:template,result:result,uniqueId:uniqueId,chain:chain,iteratee:iteratee,partial:partial,bind:bind,bindAll:bindAll,memoize:memoize,delay:delay,defer:defer,throttle:throttle,debounce:debounce,wrap:wrap,negate:negate,compose:compose,after:after,before:before,once:once,findKey:findKey,findIndex:findIndex,findLastIndex:findLastIndex,sortedIndex:sortedIndex,indexOf:indexOf,lastIndexOf:lastIndexOf,find:find,detect:find,findWhere:findWhere,each:each,forEach:each,map:map,collect:map,reduce:reduce,foldl:reduce,inject:reduce,reduceRight:reduceRight,foldr:reduceRight,filter:filter,select:filter,reject:reject,every:every,all:every,some:some,any:some,contains:contains,includes:contains,include:contains,invoke:invoke,pluck:pluck,where:where,max:max,min:min,shuffle:shuffle,sample:sample,sortBy:sortBy,groupBy:groupBy,indexBy:indexBy,countBy:countBy,partition:partition,toArray:toArray,size:size,pick:pick,omit:omit,first:first,head:first,take:first,initial:initial,last:last,rest:rest,tail:rest,drop:rest,compact:compact,flatten:flatten,without:without,uniq:uniq,unique:uniq,union:union,intersection:intersection,difference:difference,unzip:unzip,transpose:unzip,zip:zip,object:object,range:range,chunk:chunk,mixin:mixin,default:_$1}),_=mixin(allExports);_._=_;let defaultRelaunchData={detachTable:"Detaches table and rows",toggleColumnResizing:"Apply or remove component to first row or column",switchColumnsOrRows:"Switch between using columns or rows",updateTables:"Refresh tables already created"};async function applyTableSettings(e,t){return t.template&&(await setDefaultTemplate(t.template),e.template=t.template),t.matrix&&(e.matrix=upsert(e.matrix,(e=>_.isEqual(e,t.matrix)),t.matrix),e.matrix=e.matrix.slice(0,4)),t.size&&(e.size=upsert(e.size,(e=>_.isEqual(e,t.size)),t.size),e.size=e.size.slice(0,4)),t.cell&&(e.cell=upsert(e.cell,(e=>_.isEqual(e,t.cell)),t.cell),e.cell=e.cell.slice(0,4)),t.alignment&&(e.alignment=t.alignment),e.resizing=t.resizing,!1!==t.header&&!0!==t.header||(e.header=t.header),e}function isTemplateNode(e){if("COMPONENT"===e.type&&getPluginData_1(e,"template"))return e}async function updatePluginVersion(e){return updateClientStorageAsync_1("pluginVersion",(t=>(figma.root.getPluginData("pluginVersion")&&figma.root.setPluginData("pluginVersion",""),e||t)))}async function copyTemplatePart(e,t,n,i,a,r){"$"!==i.matrix[0]&&n>i.matrix[0]-1&&(n=i.matrix[0]-1);let o=e.children[n];if(a&&o&&a){let e;e="$"===a.cell[0]?o.width:a.cell[0],e&&"FILL"!==e&&"HUG"!==e&&t.resizeWithoutConstraints(e,t.height),1===o.layoutGrow&&"$"===a.cell[0]&&(t.layoutGrow=1),0===o.layoutGrow&&"AUTO"===o.counterAxisSizingMode&&"$"===a.cell[0]&&(t.layoutGrow=0,t.counterAxisSizingMode="AUTO"),a.size[0]&&"HUG"!==a.size[0]&&"$"!==a.cell[0]&&(t.layoutGrow=1,t.counterAxisSizingMode="AUTO")}}async function createTable(e,t,n){let i,a=getTemplateParts$1(e);t.matrix[0]=convertToNumber(t.matrix[0]),t.matrix[1]=convertToNumber(t.matrix[1]),t.size[0]=convertToNumber(t.size[0]),t.size[1]=convertToNumber(t.size[1]),t.cell[0]=convertToNumber(t.cell[0]),t.cell[1]=convertToNumber(t.cell[1]);let r={matrix:[t.matrix[0],t.matrix[1]],size:[t.size[0],t.size[1]],cell:[t.cell[0],t.cell[1]]};if(a.table&&a.tr&&a.td&&(a.th||!t.header)){let h=getTableSettings(a.table);var o;"$"===t.matrix[0]&&(r.matrix[0]=h.matrix[0]),"$"===t.matrix[1]&&(r.matrix[1]=h.matrix[1]),"$"===t.size[0]&&(r.size[0]=h.size[0]),"$"===t.size[1]&&(r.size[1]=h.size[1]),"$"===t.cell[1]&&(r.cell[1]=h.cell[0][1]),i=convertToFrame_1(e.clone());var l,s=a.table.id===e.id;if(s)"COMPONENT"===n?i=o=convertToComponent_1(i):o=i;else{o=a.table.clone();let e=getNodeLocation_1(a.table,a.container);e.shift();let t=i;for(let n=0;n<e.length;n++){let i=e[n];t.children&&(t=t.children[i])}replace_1(t,o)}o.layoutMode="VERTICAL";var u=o.findOne((e=>{var t;return"tr"===(null===(t=getPluginData_1(e,"elementSemantics"))||void 0===t?void 0:t.is)})).parent;let y;removeChildren(o),t.resizing&&"COMPONENT"!==n?((l=convertToComponent_1(a.tr.clone())).layoutAlign=a.tr.layoutAlign,l.primaryAxisSizingMode=a.tr.primaryAxisSizingMode,l.name.startsWith(".")||l.name.startsWith("_")||(l.name="."+l.name),setPluginData_1(l,"elementSemantics",{is:"tr"})):(l=convertToFrame_1(a.tr.clone()),setPluginData_1(l,"elementSemantics",{is:"tr"})),u.appendChild(l),removeChildren(l),r.size[1]&&"HUG"!==r.size[1]&&(l.layoutGrow=1),y="$"===r.cell[1]?templateCell.height:r.cell[1],y&&"FILL"!==y&&"HUG"!==y&&(l.resizeWithoutConstraints(l.width,y),l.layoutGrow=0,l.counterAxisSizingMode="FIXED"),l.layoutAlign="STRETCH";for(let e=0;e<r.matrix[0];e++){var c;"COMPONENT"===a.td.type&&(c=a.td.clone()),"INSTANCE"===a.td.type&&(c=a.td.mainComponent.createInstance()),setPluginData_1(c,"elementSemantics",{is:"td"}),l.appendChild(c),copyTemplatePart(a.table.children[1],c,e,h,r),c.primaryAxisAlignItems=t.alignment[0],c.layoutAlign="STRETCH",c.primaryAxisSizingMode="FIXED"}for(var d=r.matrix[1]-2;d>=0;d--){var p;if("COMPONENT"===l.type?(p=l.createInstance()).layoutAlign=l.layoutAlign:p=l.clone(),r.size[1]&&"HUG"!==r.size[1]&&(p.layoutGrow=1),t.resizing&&t.header)for(let e=0;e<p.children.length;e++){var g=p.children[e];g.mainComponent=a.td.mainComponent,setPluginData_1(g,"elementSemantics",{is:"td"}),copyTemplatePart(a.table.children[1],g,e,h,r),g.primaryAxisSizingMode="FIXED",g.primaryAxisAlignItems=t.alignment[0]}u.appendChild(p)}if(t.header&&a.th)for(var m=0;m<l.children.length;m++){var f=l.children[m];f.swapComponent(a.th.mainComponent),setPluginData_1(f,"elementSemantics",{is:"th"}),copyTemplatePart(a.table.children[0],f,m,h,r),f.primaryAxisAlignItems=t.alignment[0]}return i.setRelaunchData(defaultRelaunchData),r.size[0]&&"string"!=typeof r.size[0]&&i.resize(convertToNumber(r.size[0]),i.height),r.size[1]&&"string"!=typeof r.size[1]&&i.resize(i.width,convertToNumber(r.size[1])),"HUG"===r.size[0]&&(i.counterAxisSizingMode="AUTO"),"HUG"===r.size[1]&&(i.primaryAxisSizingMode="AUTO"),s||("HUG"===r.size[0]?o.counterAxisSizingMode="AUTO":(o.layoutAlign="STRETCH",o.primaryAxisSizingMode="FIXED"),"HUG"===r.size[1]?(o.layoutGrow=0,o.primaryAxisSizingMode="AUTO"):(o.layoutGrow=1,o.counterAxisSizingMode="FIXED")),i}{let e=[];!a.table&&e.push("table"),!a.tr&&e.push("row"),!a.th&&t.header&&e.push("header"),!a.td&&e.push("cell"),e.length>1?figma.notify(`Template parts "${e.join(", ")}" not configured`):figma.notify(`Template part "${e.join(", ")}" not configured`),i=!1}}class File{constructor(e){this.id=getDocumentData_1("fileId")||setDocumentData_1("fileId",genRandomId()),this.name=figma.root.name,e&&(this.data=e)}}class Template{constructor(e){this.name=e.name,this.component={id:e.id,key:e.key},this.file={id:getDocumentData_1("fileId")||setDocumentData_1("fileId",genRandomId()),name:figma.root.name}}}function getLocalTemplatesWithoutUpdating(){figma.skipInvisibleInstanceChildren=!0;var e=[],t=figma.root.findAllWithCriteria({types:["COMPONENT"]});for(let i=0;i<t.length;i++){let a=t[i];var n=getPluginData_1(a,"template");if(n&&"COMPONENT"===a.type){n.id=a.id,n.name=a.name,n.name=a.name,n.component.id=a.id,n.component.key=a.key;let t=getDocumentData_1("fileId")||genUID_1();n.file.id=t,e.push(n)}}return e}function getLocalTemplates(){figma.skipInvisibleInstanceChildren=!0;var e=[],t=figma.root.findAllWithCriteria({types:["COMPONENT"]});for(let i=0;i<t.length;i++){let a=t[i];var n=getPluginData_1(a,"template");if(n&&"COMPONENT"===a.type){n.id=a.id,n.name=a.name,n.component.id=a.id,n.component.key=a.key;let t=getDocumentData_1("fileId")||genUID_1();n.file.id=t,setPluginData_1(a,"template",n),e.push(n)}}return e}async function setDefaultTemplate(e){await getRemoteFilesAsync_1(),await getRecentFilesAsync_1(getLocalTemplates());let t=getDocumentData_1("fileId");await updateClientStorageAsync_1("recentTables",(n=>{let i=(n=(n=upsert(n=n||[],(n=>n.template.component.key===e.component.key&&n.file.id===t),{template:e,file:{id:t}})).slice(0,10))[0].template;try{figma.ui.postMessage({type:"post-default-template",defaultTemplate:i,localTemplates:getLocalTemplates()})}catch(e){console.log(e)}return n}))}async function getDefaultTemplate(){let e,t=await getClientStorageAsync_1("recentTables")||[],n=getDocumentData_1("fileId");if(t.length>0){let i=t.find((e=>e.file.id===n));i&&(e=i.template)}let i=getLocalTemplatesWithoutUpdating(),a=getDocumentData_1("remoteFiles");if(e&&!isEmpty$1(e))if(e.file.id===n){getComponentByIdAndKey(e.component.id,e.component.key)||(i.length>0?e=i[0]:a.length>0&&(e=a[0].data[0]))}else{await lookForComponent(e)||(a.length>0?e=a[0].data[0]:i.length>0&&(e=i[0]))}else(null==i?void 0:i.length)>0?e=i[0]:(null==a?void 0:a.length)>0&&(e=a[0].data[0]);return e}async function updateTables(e){var t=await lookForComponent(e);let n=figma.root.children;figma.notify(`Updating tables on page 1 of ${n.length}...`),await sleep();let i={};for(let l=0;l<n.length;l++){let s=n[l];(null==i?void 0:i.cancel)&&i.cancel(),i=figma.notify(`Updating tables on page ${l+1} of ${n.length}...`,{timeout:1}),await sleep();var a=s.findAll((t=>{var n;return(null===(n=getPluginData_1(t,"template"))||void 0===n?void 0:n.id)===e.id&&"FRAME"===t.type}));if(t&&a){var r=t.findOne((e=>{var t;return"tr"===(null===(t=getPluginData_1(e,"elementSemantics"))||void 0===t?void 0:t.is)}));for(let e=0;e<a.length;e++){var o=a[e];"INSTANCE"!==o.type&&(copyPasteStyle(t,o,{exclude:["name","layoutMode"]}),o.findAll((e=>{var t;"tr"===(null===(t=getPluginData_1(e,"elementSemantics"))||void 0===t?void 0:t.is)==!0&&"INSTANCE"!==e.type&&copyPasteStyle(r,e,{exclude:["name","layoutMode"]})})))}}}}function getTableSettings(e){var t,n,i;let a=0,r=0,o=null,l={matrix:[0,0],size:[0,0],cell:["FILL","FILL"],alignment:["MIN","MIN"],resizing:!0,header:!0,axis:"COLUMNS"},s=getTemplateParts$1(e).table;for(let e=0;e<s.children.length;e++){var u=s.children[e];"tr"===(null===(t=getPluginData_1(u,"elementSemantics"))||void 0===t?void 0:t.is)&&a++}let c=s.findOne((e=>{var t;return"tr"===(null===(t=getPluginData_1(e,"elementSemantics"))||void 0===t?void 0:t.is)})),d=c.findOne((e=>{var t,n;return"td"===(null===(t=getPluginData_1(e,"elementSemantics"))||void 0===t?void 0:t.is)||"th"===(null===(n=getPluginData_1(e,"elementSemantics"))||void 0===n?void 0:n.is)}));"VERTICAL"===c.parent.layoutMode&&(o="ROWS"),"HORIZONTAL"===c.parent.layoutMode&&(o="COLUMNS");for(let e=0;e<c.children.length;e++){u=c.children[e];var p=null===(n=getPluginData_1(u,"elementSemantics"))||void 0===n?void 0:n.is;"td"!==p&&"th"!==p||r++}return l.matrix=[r,a],l.alignment=[d.primaryAxisAlignItems,d.counterAxisAlignItems],l.size=["AUTO"===s.counterAxisSizingMode?"HUG":s.width,"AUTO"===s.primaryAxisSizingMode?"HUG":s.height],l.axis=o,l.header="th"===(null===(i=getPluginData_1(d,"elementSemantics"))||void 0===i?void 0:i.is),l.resizing="COMPONENT"===c.type,Object.assign({},l)}function sleep$1(e=0){return new Promise((t=>setTimeout(t,e)))}function cleanupOldPluginData(){let e=figma.notify("Cleaning up old plugin data...");["cellComponentID","cellHeaderComponentID","rowComponentID","tableComponentID"].forEach((e=>{figma.root.setPluginData(e,"")})),e.cancel()}function cleanUpOldTooltips(e){e.findOne((e=>{"Customise the following components to create bespoke tables. Or to link using your own components go to Plugins > Table Creator > Settings. You can move and rename the components as you wish. The only component which must exist for the plugin to work is the Cell component."===e.characters&&e.remove()})),e.findOne((e=>{"The Cell component is the only component required for Table Creator to create tables from. You can cutomise this component, or link the plugin to a different Cell component by running Plugins > Table Creator > Settings."===e.characters&&e.remove()})),e.findOne((e=>{"Only layer styles such as: background, color, border radius etc will be used for rows when creating tables."===e.characters&&e.remove()})),e.findOne((e=>{"Only layer styles such as: background, color, border radius etc will be used to create tables. You don't have to create tables using the plugin. You can also create tables by creating an instance of this component and detaching them and their rows. If you change the styles used on the table or row components you can update existing tables by going to Plugins > Table Creator > Settings and select Refresh Tables"===e.characters&&e.remove()}))}function createTemplateComponent(){let e=getComponentById(figma.root.getPluginData("cellComponentID"));setPluginData_1(e,"elementSemantics",{is:"td"});let t=getComponentById(figma.root.getPluginData("cellHeaderComponentID"));t&&setPluginData_1(t,"elementSemantics",{is:"th"});let n=getComponentById(figma.root.getPluginData("rowComponentID"))||figma.createComponent();setPluginData_1(n,"elementSemantics",{is:"tr"}),removeChildren(n),n.name=getComponentById(figma.root.getPluginData("rowComponentID")).name||"_Row",n.layoutMode="HORIZONTAL",n.primaryAxisSizingMode="AUTO",n.counterAxisSizingMode="AUTO",n.clipsContent=!0;let i=e.createInstance(),a=e.createInstance();n.appendChild(i),n.appendChild(a);let r,o=getComponentById(figma.root.getPluginData("tableComponentID"));o?r=o:(r=figma.createComponent(),getComponentById(figma.root.getPluginData("rowComponentID"))?(r.y=n.y+n.height+120,r.x=n.x):(r.y=e.parent.y+e.height+120,r.x=e.x)),setPluginData_1(r,"elementSemantics",{is:"table"}),removeChildren(r),r.name=getComponentById(figma.root.getPluginData("tableComponentID")).name||"Table 1",r.layoutMode="VERTICAL",r.primaryAxisSizingMode="AUTO",r.counterAxisSizingMode="AUTO";let l=n.createInstance(),s=n.createInstance(),u=n.createInstance();return l.layoutAlign="STRETCH",s.layoutAlign="STRETCH",u.layoutAlign="STRETCH",l.primaryAxisSizingMode="FIXED",s.primaryAxisSizingMode="FIXED",u.primaryAxisSizingMode="FIXED",r.appendChild(l),r.appendChild(s),r.appendChild(u),t&&(l.children[0].swapComponent(t),l.children[1].swapComponent(t)),getComponentById(figma.root.getPluginData("rowComponentID"))||n.remove(),r}async function upgradeOldTablesToNewTables(e){let t=figma.root.children,n={};for(let r=0;r<t.length;r++){let o=t[r];console.log(`Scanning page ${r+1} of ${t.length}`),(null==n?void 0:n.cancel)&&n.cancel(),n=figma.notify(`Scanning page ${r+1} of ${t.length} for tables...`,{timeout:1}),await sleep$1();let l=o.findAll((e=>"true"===e.getPluginData("isTable")&&"COMPONENT"!==e.type));for(let t=0;t<l.length;t++){let o=l[t];console.log(`Updating table ${t+1} of ${l.length} on page ${r+1}`),(null==n?void 0:n.cancel)&&n.cancel(),o.setPluginData("isTable",""),setPluginData_1(o,"template",e),setPluginData_1(o,"elementSemantics",{is:"table"});let s=o.findAll((e=>"true"===e.getPluginData("isRow")));for(let e=0;e<s.length;e++){let t=s[e];t.setPluginData("isRow",""),setPluginData_1(t,"elementSemantics",{is:"tr"});let n=t.findAll((e=>"true"===e.getPluginData("isCell"))),r=t.findAll((e=>"true"===e.getPluginData("isHeaderCell")));for(let e=0;e<n.length;e++){var i=n[e];i.setPluginData("isCell",""),setPluginData_1(i,"elementSemantics",{is:"td"})}for(let e=0;e<r.length;e++){var a=r[e];a.setPluginData("isCellHeader",""),setPluginData_1(a,"elementSemantics",{is:"th"})}}}}}async function upgradeOldComponentsToTemplate(){if(getComponentById(figma.root.getPluginData("cellComponentID"))){const e=createTemplateComponent();let t=new Template(e);await upgradeOldTablesToNewTables(t),figma.currentPage=getPageNode_1(e),setPluginData_1(e,"template",t),e.setRelaunchData(defaultRelaunchData),setDefaultTemplate(t);let n=await createTooltip("Your table components have been converted into a template. A template is a single component used by Table Creator to create tables from.",figma.currentPage.backgrounds[0].color);n.x=e.x+e.width+80,n.y=e.y-10;let i=getPageNode_1(e);i.appendChild(n),figma.currentPage.selection=[e,n],figma.viewport.scrollAndZoomIntoView([e,n]),cleanUpOldTooltips(i),cleanupOldPluginData()}}function addUniqueToArray(e,t){return-1===t.findIndex((t=>t.id===e.id))&&t.push(e),t}function addTemplateToRemoteFiles(e){updatePluginData_1(figma.root,"remoteFiles",(t=>{t=t||[],addUniqueToArray(new File,t);for(var n=0;n<t.length;n++){var i=t[n];i.id===getPluginData_1(figma.currentPage.selection[0],"template").file.id&&(i.templates=addUniqueToArray(new Template(e),i.templates))}return t})),figma.notify(`Imported ${e.name}`)}function addElement(e){let t=figma.currentPage.selection[0];"INSTANCE"===t.type?setPluginData_1(t.mainComponent,"elementSemantics",{is:e}):setPluginData_1(t,"elementSemantics",{is:e})}function removeElement(e,t){let n=figma.getNodeById(e),i="COMPONENT"===n.type?n:getParentComponent(n);i.findAll((e=>{var n;(null===(n=getPluginData_1(e,"elementSemantics"))||void 0===n?void 0:n.is)===t&&("INSTANCE"===e.type?setPluginData_1(e.mainComponent,"elementSemantics",""):setPluginData_1(e,"elementSemantics",""))})),"table"===t&&setPluginData_1(i,"elementSemantics","")}function importTemplate(e){var t,n=getPluginData_1(e,"template"),i=n,a=(null===(t=null==n?void 0:n.file)||void 0===t?void 0:t.id)===getDocumentData_1("fileId");i?("COMPONENT"===e.type?a?figma.notify("Template already imported"):(addTemplateToRemoteFiles(e),figma.notify("Imported remote template")):(e=convertToComponent_1(e),figma.notify("Imported template")),setDocumentData_1("defaultTemplate",getPluginData_1(e,"template"))):figma.notify("No template found")}function getTemplateParts(e){let t=["tr","td","th","table"],n={};for(let i=0;i<t.length;i++){let a=t[i],r=e.findOne((e=>{let t=getPluginData_1(e,"elementSemantics");if((null==t?void 0:t.is)===a)return!0}));n[a]=r}return n.table||"table"===getPluginData_1(e,"elementSemantics").is&&(n.table=e),n}function postCurrentSelection(e){let t;function n(n){var i;if(1===n.length&&(function(t){let n="COMPONENT"===t.type?t:getParentComponent(t);if(isInsideComponent(t)&&getPluginData_1(n,"template")&&n.id===e)return!0}(n[0])||isTemplateNode(n[0])&&n[0].id===e)){if(function(e){return"FRAME"===e[0].type||"INSTANCE"===e[0].type}(n)||isTemplateNode(n[0])){let e=null===(i=getPluginData_1(n[0],"elementSemantics"))||void 0===i?void 0:i.is,a=[];(isTemplateNode(n[0])||isTemplateNode(n[0].parent))&&a.push("table"),isTemplateNode(n[0])||a.push("tr");let r=getParentComponent(n[0]);getNodeDepth_1(n[0],r)>=2&&(a.push("td"),a.push("th")),t={element:e,name:getSelectionName(n[0]),longName:"table"===e?"Table":"tr"===e?"Row":"td"===e?"Cell":"th"===e?"Header Cell":void 0,allow:a}}else t=null;figma.ui.postMessage({type:"current-selection",selection:t})}else figma.ui.postMessage({type:"current-selection",selection:void 0});console.log("send selection",t)}n(figma.currentPage.selection),figma.on("selectionchange",(()=>{n(figma.currentPage.selection)}))}function selectTableCells(e){var t,n=RegExp(/\[ignore\]/,"g"),i=figma.currentPage.selection,a=[];for(let c=0;c<i.length;c++){var r=null===(t=i[c].parent)||void 0===t?void 0:t.parent,o=null==r?void 0:r.children,l=o.findIndex((e=>e.id===i[c].parent.id)),s=o[l].children.findIndex((e=>e.id===i[c].id));for(let t=0;t<o.length;t++)if("parallel"===e&&o[t].children&&o[t].children[s]&&!n.test(o[t].children[s].parent.name)&&a.push(clone$1(o[t].children[s])),"adjacent"===e){var u=o[l];for(let e=0;e<u.children.length;e++)u.children&&u.children[e]&&!n.test(u.children[e].parent.name)&&a.push(clone$1(u.children[e]))}}figma.currentPage.selection=a}function detachTable(e){let t=[];for(let n=0;n<e.length;n++){let i=e[n];"INSTANCE"===i.type&&(i=i.detachInstance(),t.push(i)),"COMPONENT"!==i.type&&(i.findAll((e=>{var t;if("tr"===(null===(t=getPluginData_1(e,"elementSemantics"))||void 0===t?void 0:t.is)&&("INSTANCE"===e.type&&e.detachInstance(),"COMPONENT"===e.type)){let t=e.layoutAlign;(e=replace_1(e,convertToFrame_1)).layoutAlign=t}})),t.push(i)),i.findAll((e=>{var t;"tr"===(null===(t=getPluginData_1(e,"elementSemantics"))||void 0===t?void 0:t.is)&&(e.name=e.name.replace(/^./,""))}))}return figma.currentPage.selection=t,t}async function toggleColumnResizing(e){var t,n,i;let a,r=[],o=[],l=!1;for(let u=0;u<e.length;u++){var s=e[u];if("COMPONENT"!==s.type){let e=getTableSettings(s);if(0===u&&(a=e.resizing),a){let[e]=detachTable([s]);l="removed",r.push(e)}else{l="applied",e.resizing=!a;let u=s.primaryAxisSizingMode;s.primaryAxisSizingMode="FIXED";let c=await createTable(s,e),d=s.children.length;for(let e=0;e<d;e++){let a=s.children[e];if("tr"===(null===(t=getPluginData_1(a,"elementSemantics"))||void 0===t?void 0:t.is)){let t=a.children.length;for(let r=0;r<t;r++){let t=a.children[r];if("td"===(null===(n=getPluginData_1(t,"elementSemantics"))||void 0===n?void 0:n.is)||"th"===(null===(i=getPluginData_1(t,"elementSemantics"))||void 0===i?void 0:i.is)){let n=c.children[e].children[r],i=t;n.swapComponent(i.mainComponent),await swapInstance(i,n),resize_1(n,i.width,i.height),n.layoutAlign=i.layoutAlign}}}}c.primaryAxisSizingMode=u,r.push(c),o.push(s)}}}figma.currentPage.selection=r;for(let e=0;e<o.length;e++)o[e].remove();return l}function switchColumnsOrRows(e){var t;let n,i,a;function r(e){var t;return"tr"===(null===(t=getPluginData_1(e,"elementSemantics"))||void 0===t?void 0:t.is)}for(let s=0;s<e.length;s++){var o=e[s];if(getPluginData_1(o,"template")||"table"===(null===(t=getPluginData_1(o,"elementSemantics"))||void 0===t?void 0:t.is)){let e=getTemplateParts(o);if("COMPONENT"!==e.table.type){let t=e.table.findOne((e=>{var t;return"tr"===(null===(t=getPluginData_1(e,"elementSemantics"))||void 0===t?void 0:t.is)}));function l(){var n,a=t.parent.children.length,o=t.parent,l=nodeToObject_1(o);if("ROWS"===i.axis&&(o.layoutMode="HORIZONTAL"),"COMPONENT"!==t.type){function s(e,t){for(var n=e.parent,i=-1,a=-1;i<t;){i++,a++;var o=n.children[a];o&&!r(o)&&i--}return a}for(let n=0;n<t.parent.children.length;n++){var u=o.children[n];if(r(u)){u.width,u.height;var c=u.children;if("COLUMNS"===i.axis&&(u.name=u.name.replace("Col","Row"),u.layoutMode="HORIZONTAL",u.layoutGrow=0,u.counterAxisSizingMode="AUTO"),n<a)for(let a=0;a<i.matrix[0];a++){(h=c[a]).width;var d=s(u,a);if(h){if(h.primaryAxisSizingMode="AUTO",u.id===t.id&&!u.parent.children[d]){var p=u.clone();removeChildren_1(p),e.table.appendChild(p)}u.parent.children[d]&&("ROWS"===i.axis?(u.parent.children[d].appendChild(h),u.parent.children[d].resize(l.children[n].children[a].width,u.height),u.parent.children[d].layoutGrow=l.children[n].children[a].layoutGrow,u.parent.children[d].layoutAlign="STRETCH"):(u.parent.children[d].appendChild(h),h.resize(u.width,h.height),1===l.children[n].layoutGrow?h.layoutGrow=1:h.layoutGrow=0))}}}else u.resize(l.children[n].height,l.children[n].width);"ROWS"===i.axis&&r(u)&&(u.name=u.name.replace("Row","Col"),u.layoutMode="VERTICAL")}"COLUMNS"===i.axis&&(o.layoutMode="VERTICAL"),swapAxises(o),resize_1(o,l.width,l.height);var g=o.children.length;let y=[];for(let e=0;e<g;e++){var m=o.children[e];if((null===(n=l.children[e])||void 0===n?void 0:n.layoutAlign)&&(m.layoutAlign=l.children[e].layoutAlign),r(m)){if("COLUMNS"===i.axis){m.counterAxisSizingMode="AUTO",m.layoutAlign="STRETCH";c=m.children;var f="COLUMNS"===i.axis?t.parent.children.length:t.children.length;for(let e=0;e<f;e++){(h=c[e])&&m.parent.children[getNodeIndex_1(t)+e]&&(h.primaryAxisSizingMode="FIXED",h.layoutAlign="STRETCH")}"HUG"!==i.size[1]&&(m.layoutGrow=1)}else{c=m.children,f="ROWS"===i.axis?t.parent.children.length:t.children.length;for(let e=0;e<f;e++){var h;(h=c[e])&&m.parent.children[getNodeIndex_1(t)+e]&&("HUG"===i.size[0]?(h.layoutGrow=0,h.primaryAxisSizingMode="AUTO"):(h.layoutGrow=1,h.primaryAxisSizingMode="FIXED"),"HUG"===i.size[1]?(h.layoutGrow=0,h.primaryAxisSizingMode="AUTO"):(h.layoutGrow=1,h.primaryAxisSizingMode="FIXED"))}m.layoutAlign="STRETCH"}0===m.children.length&&y.push(m)}}o.layoutGrow=l.layoutGrow,o.layoutAlign=l.layoutAlign,o.primaryAxisSizingMode=l.counterAxisSizingMode,o.counterAxisSizingMode=l.primaryAxisSizingMode;for(let e=0;e<y.length;e++)y[e].remove()}}"INSTANCE"!==e.table.type&&"INSTANCE"!==t.type&&"COMPONENT"!==t.type||(e.table=detachTable(figma.currentPage.selection)[0],t=e.table.findOne((e=>{var t;return"tr"===(null===(t=getPluginData_1(e,"elementSemantics"))||void 0===t?void 0:t.is)}))),i=getTableSettings(e.table),0===s&&(n=i.axis,"ROWS"===n&&(a="VERTICAL"),"COLUMNS"===n&&(a="HORIZONTAL")),a===e.table.layoutMode&&l()}}else figma.closePlugin("Please select a table")}return{vectorType:n}}function selectTableVector(e){var t,n;figma.currentPage.selection.length>0?((null===(t=figma.currentPage.selection[0].parent)||void 0===t?void 0:t.parent.layoutMode)===("column"===e?"VERTICAL":"HORIZONTAL")&&selectTableCells("parallel"),(null===(n=figma.currentPage.selection[0].parent)||void 0===n?void 0:n.parent.layoutMode)===("column"===e?"HORIZONTAL":"VERTICAL")&&selectTableCells("adjacent")):figma.notify("One or more table cells must be selected")}async function createTableUI(){figma.root.setRelaunchData({createTable:""});const e=getLocalTemplates();var t=await getRecentFilesAsync_1(e,{limit:8}),n=await getRemoteFilesAsync_1();let i=await getClientStorageAsync_1("pluginVersion"),a=await getClientStorageAsync_1("userPreferences"),r=await getDocumentData_1("usingRemoteTemplate"),o=!!getComponentById(figma.root.getPluginData("cellComponentID")),l=a.table;const s=getDocumentData_1("fileId");let u=await getDefaultTemplate();figma.showUI(__uiFiles__.main,{width:240,height:490,themeColors:!0}),figma.ui.postMessage(Object.assign(Object.assign({type:"show-create-table-ui"},l),{remoteFiles:n,recentFiles:t,localTemplates:e,defaultTemplate:u,fileId:s,usingRemoteTemplate:r,pluginVersion:i,pluginUsingOldComponents:o})),updatePluginVersion("7.0.0")}async function createTableInstance(e){const t=await lookForComponent(e.template);if(t){let n=await createTable(t,e);if(n){positionInCenterOfViewport(n),figma.currentPage.selection=[n],await setDefaultTemplate(e.template);let t=await getClientStorageAsync_1("userPreferences"),i=await applyTableSettings(t.table,e);figma.clientStorage.setAsync("userPreferences",{table:i}).then((()=>{figma.closePlugin("Table created")}))}}}async function main(){await updateClientStorageAsync_1("userPreferences",(e=>{let t={table:{matrix:[[(null==e?void 0:e.columnCount)||4,(null==e?void 0:e.rowCount)||4]],size:[[(null==e?void 0:e.tableWidth)||"HUG",(null==e?void 0:e.tableHeight)||"HUG"]],cell:[[(null==e?void 0:e.cellWidth)||120,(null==e?void 0:e.cellHeight)||"FILL"]],alignment:[(null==e?void 0:e.cellAlignment)||"MIN","MIN"],header:(null==e?void 0:e.includeHeader)||!0,resizing:(null==e?void 0:e.columnResizing)||!0}};return(null==e?void 0:e.table)||(e=t),e=Object.assign(t,e||{})})),dist((e=>{async function t(e){let{newPage:t,tooltips:n,subComponents:i}=e;t&&createPage("Table Creator");let a=[],r=await createTemplateComponents(),{templateComponent:o,rowComponent:l,cellComponentSet:s}=r,u=new Template(o),c=getLocalTemplates();if(c=c.filter((e=>e.name.startsWith("Table"))),o.name=incrementName_1(o.name,c),u.name=o.name,setPluginData_1(o,"template",u),o.setRelaunchData(defaultRelaunchData),setDefaultTemplate(u),!1!==n){let e=await createTooltip("This component is a template used by Table Creator to create tables from. You can customise the appearance of your tables by customising this template. It’s made up of the components below.");e.x=o.x+o.width+80,e.y=o.y-10;let t=await createTooltip("Customise rows by changing this component.");t.x=l.x+l.width+80,t.y=l.y-10;let n=await createTooltip("Customise cell borders by changing these components. Create variants for different types of cells, icons, dropdowns, ratings etc.");n.x=s.x+s.width+80-16,n.y=s.y-10+16,a.push(e,t,n)}!1===i?(l.remove(),s.remove()):a.push(l,s),a.push(o);let d=figma.group(a,figma.currentPage);return positionInCenterOfViewport(d),ungroup_1(d,figma.currentPage),figma.currentPage.selection=a,figma.notify("Template created"),o}e.ui={html:__uiFiles__.main,width:240,height:504},e.command("createTable",(async({ui:e})=>{let t=await getClientStorageAsync_1("userPreferences"),n=t.table,i=getLocalTemplatesWithoutUpdating(),a=getDocumentData_1("remoteFiles")||[],r=[],o=await getDefaultTemplate();for(let e=0;e<a.length;e++){let t=a[e];for(let e=0;e<t.data.length;e++){let n=t.data[e];r.push({name:n.name,data:n,icon:'<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">\n\t\t\t\t\t\t<path fill-rule="evenodd" clip-rule="evenodd" d="M1.9223 7.04535L7.42828 1.53783L6.72107 0.830826L1.21509 6.33834C0.678222 6.87536 0.678314 7.74592 1.2153 8.28282L6.10292 13.1697C6.6399 13.7066 7.51045 13.7066 8.04739 13.1696L13.5528 7.66416L12.8457 6.95706L7.34028 12.4625C7.19384 12.609 6.95642 12.609 6.80997 12.4625L1.92235 7.57566C1.7759 7.42923 1.77588 7.19181 1.9223 7.04535ZM11.8886 1.99731H8.82607V2.99731H10.6815L7.16001 6.51876L7.86712 7.22586L11.3886 3.70442V5.55981H12.3886V2.49731V1.99731H11.8886Z" fill="#818181" fill-opacity="0.5"/>\n\t\t\t\t\t\t</svg>'})}}i=i.map((e=>({name:e.name,data:e}))),figma.parameters.on("input",(({query:e,result:t,key:l})=>{function s(e,t){let i=[];if(t){let[a,r]=t.split("x");a&&(a=convertToNumber(a.toUpperCase().toString().trim())),r&&(r=convertToNumber(r.toUpperCase().toString().trim())),a&&a!==n[e][0][0]?Number(a)?Number(a)<1&&(a=!1):("matrix"===e&&"$"!==a&&(a=!1),"size"===e&&"HUG"!==a&&"$"!==a&&(a=!1),"cell"===e&&"FILL"!==a&&"$"!==a&&(a=!1)):a="",r&&r!==n[e][0][1]?Number(r)?Number(r)<1&&(r=!1):("matrix"===e&&"$"!==r&&(r=!1),"size"===e&&"HUG"!==r&&"$"!==r&&(r=!1),"cell"===e&&"FILL"!==r&&"$"!==r&&(r=!1)):r="",a&&!r&&!1!==r&&i.push({name:`${a} x ${r||n[e][0][1]}`,data:[a,r||n[e][0][1]]}),!a&&!1!==a&&r&&i.push({name:`${a||n[e][0][0]} x ${r}`,data:[a||n[e][0][1],r]}),a&&r&&i.push({name:`${a} x ${r}`,data:[a,r]})}for(let t=0;t<n[e].length;t++){let a=n[e][t],r={name:`${a[0].toString().toUpperCase()} x ${a[1].toString().toUpperCase()}`,data:a};i.push(r)}return i}if(i.length>0||a.length>0){if("template"===l){let n=[...i,...r],a=n.findIndex((e=>e.data.component.key===o.component.key));n=move(n,a,0),n.length>0&&(n=n.filter((t=>t.name.toUpperCase().includes(e.toUpperCase()))),t.setSuggestions(n))}if("matrix"===l&&t.setSuggestions(s("matrix",e)),"size"===l&&t.setSuggestions(s("size",e)),"cell"===l){let n=s("cell",e);t.setSuggestions(n)}if("alignment"===l){let i=[{name:"Top",data:["MIN","MIN"]},{name:"Center",data:["CENTER","MIN"]},{name:"Bottom",data:["MAX","MIN"]}],a=i.findIndex((e=>e.data[0]===n.alignment[0]));move(i,a,0),i=i.filter((t=>t.name.toUpperCase().includes(e.toUpperCase()))),t.setSuggestions(i)}if("header"===l){let i,a,r=[];n.header?(i={name:"True",data:!0},a={name:"False",data:!1}):(i={name:"False",data:!1},a={name:"True",data:!0}),r=[i,a].filter((t=>t.name.toUpperCase().includes(e.toUpperCase()))),t.setSuggestions(r)}}else t.setError("No templates found. Run plugin without parameters.")})),figma.on("run",(async({parameters:e})=>{let n=t.table;if(e){let t=getLocalTemplatesWithoutUpdating().findIndex((t=>t.component.key===e.template.component.key)),i=getLocalTemplates();t>-1&&(e.template=i[t]);let a=Object.assign(n,e);e.cell||(a.cell=n.cell[0]),createTableInstance(a)}else createTableUI()}))})),e.command("detachTable",(()=>{detachTable(figma.currentPage.selection).length>0?figma.closePlugin("Table and rows detached"):figma.closePlugin("Can't detach template")})),e.command("toggleColumnResizing",(()=>{toggleColumnResizing(figma.currentPage.selection).then((e=>{e?figma.closePlugin(`Column resizing ${e}`):figma.closePlugin("Can't apply to templates")}))})),e.command("switchColumnsOrRows",(()=>{let{vectorType:e}=switchColumnsOrRows(figma.currentPage.selection);e?figma.closePlugin("Switched to "+("ROWS"===e?"columns":"rows")):0===figma.currentPage.selection.length?figma.closePlugin("Please select a table"):figma.closePlugin("Can't apply to templates")})),e.command("selectColumn",(()=>{selectTableVector("column"),figma.closePlugin()})),e.command("selectRow",(()=>{selectTableVector("row"),figma.closePlugin()})),e.command("newTemplate",t),e.command("importTemplate",importTemplate),e.on("new-template",(async e=>{let n=await t(e.options);setDefaultTemplate(getPluginData_1(n,"template"))})),e.on("remove-template",(async e=>{let t=await getDefaultTemplate();if(getDocumentData_1("previousTemplate"),e.file){let t=getDocumentData_1("remoteFiles"),n=t.findIndex((t=>t.id===e.file.id)),i=t[n],a=i.data.findIndex((t=>t.id===e.template.id));i.data.splice(a,1),0===i.data.length&&t.splice(n,1),setDocumentData_1("remoteFiles",t),figma.ui.postMessage({type:"remote-files",remoteFiles:t})}else{getComponentByIdAndKey(e.template.id,e.template.component.key).remove();let t=getLocalTemplates();figma.ui.postMessage({type:"local-templates",localTemplates:t})}if(t.component.id===e.template.id){let e=getLocalTemplates();setDefaultTemplate(e[e.length-1])}})),e.on("edit-template",(e=>{!async function(e){lookForComponent(e.template).then((e=>{var t,n,i,a;animateNodeIntoView([e]),figma.currentPage.selection=[e];let r=getTemplateParts(e),o={table:{name:getSelectionName(null==r?void 0:r.table),element:"table",id:null===(t=null==r?void 0:r.table)||void 0===t?void 0:t.id,longName:"Table"},tr:{name:getSelectionName(null==r?void 0:r.tr),element:"tr",id:null===(n=null==r?void 0:r.tr)||void 0===n?void 0:n.id,longName:"Row"},td:{name:getSelectionName(null==r?void 0:r.td),element:"td",id:null===(i=null==r?void 0:r.td)||void 0===i?void 0:i.id,longName:"Cell"},th:{name:getSelectionName(null==r?void 0:r.th),element:"th",id:null===(a=null==r?void 0:r.th)||void 0===a?void 0:a.id,longName:"Cell Header"}};postCurrentSelection(e.id),figma.ui.postMessage({type:"template-parts",parts:o})}))}(e)})),e.on("set-default-template",(e=>{setDefaultTemplate(e.template)})),e.on("add-remote-file",(async e=>{const t=await getRemoteFilesAsync_1(e.file.id);figma.ui.postMessage({type:"remote-files",remoteFiles:t})})),e.on("remove-remote-file",(async e=>{removeRemoteFile_1(e.file.id);const t=await getRemoteFilesAsync_1(),n=getLocalTemplates();t.length>0?setDefaultTemplate(t[0].data[0]):n.length>0?setDefaultTemplate(n[0]):(setDefaultTemplate(null),figma.ui.postMessage({type:"post-default-template",defaultTemplate:null})),figma.ui.postMessage({type:"remote-files",remoteFiles:t})})),e.on("remove-element",(e=>{removeElement(e.id,e.element)})),e.on("add-element",(e=>{addElement(e.element)})),e.on("create-table-instance",(async e=>{createTableInstance(e.data)})),e.command("updateTables",(()=>{updateTables(getPluginData_1(figma.currentPage.selection[0],"template")).then((()=>{figma.notify("Tables updated",{timeout:1500}),figma.closePlugin()}))})),e.on("update-tables",(e=>{updateTables(e.template).then((()=>{figma.notify("Tables updated",{timeout:1500})}))})),e.on("save-user-preferences",(()=>{})),e.on("fetch-current-selection",(e=>{e.template&&lookForComponent(e.template).then((e=>{postCurrentSelection(e.id)}))})),e.on("fetch-template-parts",(e=>{lookForComponent(e.template).then((e=>{!function(e){var t,n,i,a;let r=getTemplateParts(e),o={table:{name:getSelectionName(null==r?void 0:r.table),element:"table",id:null===(t=null==r?void 0:r.table)||void 0===t?void 0:t.id},tr:{name:getSelectionName(null==r?void 0:r.tr),element:"tr",id:null===(n=null==r?void 0:r.tr)||void 0===n?void 0:n.id},td:{name:getSelectionName(null==r?void 0:r.td),element:"td",id:null===(i=null==r?void 0:r.td)||void 0===i?void 0:i.id},th:{name:getSelectionName(null==r?void 0:r.th),element:"th",id:null===(a=null==r?void 0:r.th)||void 0===a?void 0:a.id}};figma.ui.postMessage({type:"template-parts",parts:o})}(e)}))})),e.on("upgrade-to-template",(async()=>{await upgradeOldComponentsToTemplate(),figma.notify("Template created"),createTableUI(),figma.ui.postMessage({type:"post-default-template",defaultTemplate:getDefaultTemplate(),localTemplates:getLocalTemplates()})})),e.on("using-remote-template",(async e=>{const t=await getRemoteFilesAsync_1();setDocumentData_1("usingRemoteTemplate",e.usingRemoteTemplate),figma.ui.postMessage({type:"remote-files",remoteFiles:t})}))}))}console.clear(),main();
>>>>>>> feature-inner-table
