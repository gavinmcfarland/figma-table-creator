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
async function updateClientStorageAsync$1(key, callback) {
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

function isFunction(functionToCheck) {
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
    if (isFunction(source)) {
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
    if (data) {
        this.data = data;
        setDocumentData("fileData", data);
    }
    else {
        this.data = getDocumentData("fileData");
    }
}
async function getRecentFilesAsync(fileData) {
    // Should it include an option top only add published components/data?
    // const publishedComponents = await getPublishedComponents(fileData)
    fileData = fileData || getDocumentData("fileData");
    let recentFiles = await updateClientStorageAsync$1("recentFiles", (recentFiles) => {
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
            // If not, then update
            recentFiles.filter((item, i) => {
                if (item.id === currentFile.id) {
                    item.name = currentFile.name;
                    item.data = currentFile.data;
                    setDocumentData("fileData", fileData);
                    // If data no longer exists, delete the file
                    if (!fileData ||
                        (Array.isArray(fileData) && fileData.length === 0)) {
                        recentFiles.splice(i, 1);
                    }
                }
            });
        }
        return recentFiles;
    });
    // Exclude current file
    recentFiles = recentFiles.filter((file) => {
        return !(file.id === getPluginData(figma.root, "fileId"));
    });
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
var updateClientStorageAsync_1 = updateClientStorageAsync$1;
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

var filter = Filter;

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
    Filter: filter,
    Queue: queue,
    Interpolation: interpolation,
    Easing: easing
};

async function lookForComponent(template) {
    // Import component first?
    // If fails, then look for it by id? What if same id is confused with local component?
    // Needs to know if component is remote?
    var component;
    var localComponent = getComponentById(template.component.id);
    try {
        // If can find the component, and it's key is the same as the templates this assumes the node is in the file it originated from?
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
                figma.notify('Check component is published', { error: true });
            }
        }
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
    if (node && node.type === 'COMPONENT') {
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
function clone(val) {
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

let defaultRelaunchData = {
    detachTable: 'Detaches table and rows',
    toggleColumnResizing: 'Turn column resizing on or off',
    switchColumnsOrRows: 'Switch between using columns or rows',
    updateTables: 'Refresh tables already created',
};
function convertToNumber(data) {
    if (Number(data)) {
        return Number(data);
    }
    else {
        return data;
    }
}
async function updatePluginVersion(semver) {
    return updateClientStorageAsync('pluginVersion', (pluginVersion) => {
        // Remove plugin version from document for now
        if (figma.root.getPluginData('pluginVersion'))
            figma.root.setPluginData('pluginVersion', '');
        return semver || pluginVersion;
    });
}
function createTable(templateComponent, settings, type) {
    // FIXME: Get it to work with parts which are not components as well
    // FIXME: Check for imported components
    // FIXME: Check all conditions are met. Is table, is row, is cell, is instance etc.
    let part = getTemplateParts$1(templateComponent);
    let tableInstance;
    if (!part.table || !part.tr || !part.td || (!part.th && settings.includeHeader)) {
        let array = [];
        part.table ? null : array.push('table');
        part.tr ? null : array.push('row');
        !part.th && settings.includeHeader ? array.push('header') : null;
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
        if (settings.columnResizing && type !== 'COMPONENT') {
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
        // Remove children which are tds and ths
        // firstRow.findAll((node) => {
        // 	if (node) {
        // 		if (getPluginData(node, 'elementSemantics')?.is === 'td' || getPluginData(node, 'elementSemantics')?.is === 'th') {
        // 			node.remove()
        // 		}
        // 	}
        // })
        removeChildren(firstRow);
        // If height specified then make rows grow to height
        // Change size of cells
        if (settings.tableHeight && settings.tableHeight !== 'HUG') {
            firstRow.layoutGrow = 1;
        }
        // MANDATORY PROP
        firstRow.layoutAlign = 'STRETCH';
        // Create columns in first row
        for (let i = 0; i < settings.columnCount; i++) {
            var duplicateCell;
            if (part.td.type === 'COMPONENT') {
                duplicateCell = part.td.clone();
            }
            if (part.td.type === 'INSTANCE') {
                duplicateCell = part.td.mainComponent.createInstance();
            }
            if (settings.cellWidth && settings.cellWidth !== 'FILL') {
                // if (settings.cellWidth === 'FILL') {
                // 	duplicateCell.layoutGrow = 1
                // } else {
                // let origLayoutAlign = duplicateCell.layoutAlign
                duplicateCell.resizeWithoutConstraints(settings.cellWidth, duplicateCell.height);
                // duplicateCell.layoutAlign = origLayoutAlign
                // }
            }
            // Change size of cells
            if (settings.tableWidth && settings.tableWidth !== 'HUG') {
                duplicateCell.layoutGrow = 1;
            }
            setPluginData_1(duplicateCell, 'elementSemantics', { is: 'td' });
            duplicateCell.primaryAxisAlignItems = settings.cellAlignment;
            firstRow.appendChild(duplicateCell);
            // We want to always force the cells to stretch to height of row regardless of users settings
            duplicateCell.layoutAlign = 'STRETCH';
            // The property below would need to be applied to if I wanted to force this. Normally inherited from cell
            duplicateCell.primaryAxisSizingMode = 'FIXED';
        }
        // Create rest of rows
        for (var i = 1; i < settings.rowCount; i++) {
            var duplicateRow;
            if (firstRow.type === 'COMPONENT') {
                duplicateRow = firstRow.createInstance();
                // BUG: isn't copying across layoutAlign, so we have to do it manually
                duplicateRow.layoutAlign = firstRow.layoutAlign;
            }
            else {
                duplicateRow = firstRow.clone();
            }
            if (settings.tableHeight && settings.tableHeight !== 'HUG') {
                duplicateRow.layoutGrow = 1;
            }
            // If using columnResizing and header swap non headers to default cells
            if (settings.columnResizing && type !== 'COMPONENT' && settings.includeHeader) {
                for (let i = 0; i < duplicateRow.children.length; i++) {
                    var cell = duplicateRow.children[i];
                    // cell.swapComponent(part.th)
                    // FIXME: Check if instance or main component
                    cell.mainComponent = part.td.mainComponent;
                    setPluginData_1(cell, 'elementSemantics', { is: 'td' });
                    // Needs to be applied here too
                    cell.primaryAxisSizingMode = 'FIXED';
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
        // Set width of table
        if (settings.tableWidth && settings.tableWidth !== 'HUG') {
            tableInstance.resize(convertToNumber(settings.tableWidth), tableInstance.height);
        }
        if (settings.tableHeight && settings.tableHeight !== 'HUG') {
            tableInstance.resize(tableInstance.width, convertToNumber(settings.tableHeight));
        }
        return tableInstance;
    }
}
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
// function getLocalTemplateComponents() {
// 	return figma.root.findAll((node) => getPluginData(node, 'template') && node.type === 'COMPONENT')
// }
function getLocalTemplates() {
    var templates = [];
    figma.root.findAll((node) => {
        var templateData = getPluginData_1(node, 'template');
        if (templateData && node.type === 'COMPONENT') {
            // ID could update if copied to another file
            templateData.id = node.id;
            templateData.name = node.name;
            templateData.component.id = node.id;
            // Update file id incase component moved to another file
            templateData.file.id = getDocumentData_1('fileId');
            setPluginData_1(node, 'template', templateData);
            templates.push(templateData);
        }
    });
    return templates;
}
async function setDefaultTemplate(templateData) {
    // Only set prevoious template if default template has been set once
    let previousTemplate = getDocumentData_1('defaultTemplate') ? getDocumentData_1('defaultTemplate') : null;
    await getRemoteFilesAsync_1();
    await getRecentFilesAsync_1(getLocalTemplates());
    setDocumentData_1('defaultTemplate', templateData);
    figma.ui.postMessage({
        type: 'post-default-template',
        defaultTemplate: templateData,
        localTemplates: getLocalTemplates(),
    });
    if (previousTemplate) {
        setPreviousTemplate(previousTemplate);
    }
}
async function setPreviousTemplate(templateData) {
    // await getRemoteFilesAsync()
    // await getRecentFilesAsync(getLocalTemplates())
    setDocumentData_1('previousTemplate', templateData);
    return templateData;
}
async function updateTables(template) {
    // FIXME: Template file name not up to date for some reason
    var tables = figma.root.findAll((node) => { var _a; return ((_a = getPluginData_1(node, 'template')) === null || _a === void 0 ? void 0 : _a.id) === template.id; });
    // getAllTableInstances()
    var templateComponent = await lookForComponent(template);
    if (templateComponent && tables) {
        var rowTemplate = templateComponent.findOne((node) => { var _a; return ((_a = getPluginData_1(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === 'tr'; });
        for (let b = 0; b < tables.length; b++) {
            var table = tables[b];
            // Don't apply if an instance
            if (table.type !== 'INSTANCE') {
                copyPasteStyle(templateComponent, table, { exclude: ['name'] });
                table.findAll((node) => {
                    var _a;
                    if ((((_a = getPluginData_1(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === 'tr') === true && node.type !== 'INSTANCE') {
                        copyPasteStyle(rowTemplate, node, { exclude: ['name'] });
                    }
                });
            }
        }
    }
}
function getTableSettings(tableNode) {
    var _a, _b, _c;
    let rowCount = 0;
    let columnCount = 0;
    let usingColumnsOrRows = 'rows';
    for (let i = 0; i < tableNode.children.length; i++) {
        var node = tableNode.children[i];
        if (((_a = getPluginData_1(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === 'tr') {
            rowCount++;
        }
    }
    let firstRow = tableNode.findOne((node) => { var _a; return ((_a = getPluginData_1(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === 'tr'; });
    let firstCell = firstRow.findOne((node) => { var _a, _b; return ((_a = getPluginData_1(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === 'td' || ((_b = getPluginData_1(node, 'elementSemantics')) === null || _b === void 0 ? void 0 : _b.is) === 'th'; });
    if (firstRow.parent.layoutMode === 'VERTICAL') {
        usingColumnsOrRows = 'rows';
    }
    if (firstRow.parent.layoutMode === 'HORIZONTAL') {
        usingColumnsOrRows = 'columns';
    }
    for (let i = 0; i < firstRow.children.length; i++) {
        var node = firstRow.children[i];
        var cellType = (_b = getPluginData_1(node, 'elementSemantics')) === null || _b === void 0 ? void 0 : _b.is;
        if (cellType === 'td' || cellType === 'th') {
            columnCount++;
        }
    }
    return {
        tableWidth: (() => {
            if (tableNode.counterAxisSizingMode === 'AUTO') {
                return 'HUG';
            }
            else {
                return tableNode.width;
            }
        })(),
        tableHeight: (() => {
            if (tableNode.primaryAxisSizingMode === 'AUTO') {
                return 'HUG';
            }
            else {
                return tableNode.height;
            }
        })(),
        columnCount,
        rowCount,
        columnResizing: firstRow.type === 'COMPONENT' ? true : false,
        includeHeader: ((_c = getPluginData_1(firstCell, 'elementSemantics')) === null || _c === void 0 ? void 0 : _c.is) === 'th' ? true : false,
        cellAlignment: 'MIN',
        usingColumnsOrRows,
        cellWidth: firstCell.width,
    };
}

//TODO: Is it easier to ask the user to import and select their own components?
// 1. Hi, I'm tablo. My creator made me so I could help you upgrade to the shiny new version of Table Creator.
// 2. I notice you don't have a table or row component. Unfortunately you won't be able to continue using this plugin, only kidding. I just need to create some
// 1. The way table creator works is slightly different now. Instead of relying on a single cell component to create tables from. Table Creator now use a table component as a template. As part of this upgrade I'm going to hopefully successfully upgrade your existing components to work with the new version of Table Creator. Unfortunately because of the way plugins work without this making this upgrade you won't be able to continue using the plugin. You can either follow this upgrade, or start from scratch and try and link your old components.
// 2. First I'll look to see if I can find a table component. If you don't have one I'll create one for you. This will be used as the main template that new tables are created from.
// 3. Next I'll look to see if you have a row component. If you don't
// let tableInstance = createTable(getTemplateParts(templateComponent), msg.data, 'COMPONENT')
function upgradeOldTablesToNewTables(templateData) {
    // Get all the old tables
    var tables = figma.root.findAll((node) => node.getPluginData('isTable') === 'true' && node.type !== 'COMPONENT');
    var rows = figma.root.findAll((node) => node.getPluginData('isRow') === 'true');
    var cells = figma.root.findAll((node) => node.getPluginData('isCell') === 'true');
    var headerCells = figma.root.findAll((node) => node.getPluginData('isHeaderCell') === 'true');
    // Remap all pluginData
    for (var i = 0; i < tables.length; i++) {
        var node = tables[i];
        // Remove old plugin data from table
        node.setPluginData(`isTable`, '');
        // Add template details to table
        setPluginData_1(node, `template`, templateData);
        // Add new plugin data to table
        // TODO: Do we need to check if instance, component, frame etc?
        setPluginData_1(node, `elementSemantics`, { is: 'table' });
    }
    for (var i = 0; i < rows.length; i++) {
        var node = rows[i];
        // Remove old plugin data from row
        node.setPluginData(`isRow`, '');
        // Add new plugin data to row
        // TODO: Do we need to check if instance, component, frame etc?
        setPluginData_1(node, `elementSemantics`, { is: 'tr' });
    }
    for (var i = 0; i < cells.length; i++) {
        var node = cells[i];
        // Remove old plugin data from row
        node.setPluginData(`isCell`, '');
        // Add new plugin data to row
        // TODO: Do we need to check if instance, component, frame etc?
        setPluginData_1(node, `elementSemantics`, { is: 'td' });
    }
    for (var i = 0; i < headerCells.length; i++) {
        var node = headerCells[i];
        // Remove old plugin data from row
        node.setPluginData(`isCellHeader`, '');
        // Add new plugin data to row
        // TODO: Do we need to check if instance, component, frame etc?
        setPluginData_1(node, `elementSemantics`, { is: 'th' });
    }
    // Probably don't need to update look as won't change while upgrading?
}
async function upgradeOldComponentsToTemplate() {
    function cleanupOldPluginData() {
        let keys = ['cellComponentID', 'cellHeaderComponentID', 'rowComponentID', 'tableComponentID'];
        keys.forEach((element) => {
            figma.root.setPluginData(element, '');
        });
    }
    function cleanUpOldTooltips() {
        figma.root.findOne((node) => {
            if (node.characters ===
                'Customise the following components to create bespoke tables. Or to link using your own components go to Plugins > Table Creator > Settings. You can move and rename the components as you wish. The only component which must exist for the plugin to work is the Cell component.') {
                node.remove();
            }
        });
        figma.root.findOne((node) => {
            if (node.characters ===
                'The Cell component is the only component required for Table Creator to create tables from. You can cutomise this component, or link the plugin to a different Cell component by running Plugins > Table Creator > Settings.') {
                node.remove();
            }
        });
        figma.root.findOne((node) => {
            if (node.characters === 'Only layer styles such as: background, color, border radius etc will be used for rows when creating tables.') {
                node.remove();
            }
        });
        figma.root.findOne((node) => {
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
    if (getComponentById(figma.root.getPluginData('cellComponentID'))) {
        const templateComponent = createTemplateComponent();
        // TODO: Needs to be added to list of templates
        // TODO: Needs to relink previously created tables
        figma.currentPage = getPageNode_1(templateComponent);
        // Add template data and relaunch data to templateComponent
        let templateData = new Template(templateComponent);
        setPluginData_1(templateComponent, 'template', templateData);
        templateComponent.setRelaunchData(defaultRelaunchData);
        setDefaultTemplate(templateData);
        // positionInCenterOfViewport(templateComponent)
        // // Create new page and add template to it
        // let newPage = figma.createPage()
        // newPage.name = 'Table Creator Template'
        // newPage.appendChild(templateComponent)
        let tooltip = await createTooltip('Your table components have been converted into a template. A template is a single component used by Table Creator to create tables from.', figma.currentPage.backgrounds[0].color);
        tooltip.x = templateComponent.x + templateComponent.width + 80;
        tooltip.y = templateComponent.y - 10;
        let componentPage = getPageNode_1(templateComponent);
        componentPage.appendChild(tooltip);
        // figma.currentPage.selection = [templateComponent, tooltip]
        // let group = figma.group([templateComponent, tooltip], componentPage)
        // figma.currentPage = componentPage
        figma.currentPage.selection = [templateComponent, tooltip];
        figma.viewport.scrollAndZoomIntoView([templateComponent, tooltip]);
        cleanupOldPluginData();
        cleanUpOldTooltips();
        upgradeOldTablesToNewTables(templateData);
    }
}

// FIXME: Recent files not adding unique files only DONE
// FIXME: Duplicated file default template not selected by default in UI (undefined, instead of local components)
// FIXME: Column resizing doesn't work on table without headers
// FIXME: When turning column resizing off component does not resize with table DONE
// TODO: Consider removing number when creating table
console.clear();
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
// function getUserPreferencesAsync() {
// 	return getRecentFilesAsync()
// }
function getDefaultTemplate() {
    var _a;
    var usingRemoteTemplate = getDocumentData_1('usingRemoteTemplate');
    var defaultTemplate = getDocumentData_1('defaultTemplate');
    // FIXME: Should I be doing more, like checking if the component has been published at this point?
    if (usingRemoteTemplate) {
        return defaultTemplate;
    }
    else {
        return getComponentById((_a = defaultTemplate === null || defaultTemplate === void 0 ? void 0 : defaultTemplate.component) === null || _a === void 0 ? void 0 : _a.id) ? defaultTemplate : undefined;
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
    figma.on('selectionchange', () => {
        var _a;
        if (figma.currentPage.selection.length === 1 && isInsideTemplate(figma.currentPage.selection[0])) {
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
    });
}
// /**
//  * Adds new files to recentFiles in localStorage if they don't exist and updates them if they do
//  * @param {String} key A key to store data under
//  * @param {any} data Data to be stored
//  */
// async function syncRecentFilesAsync(data) {
// 	// NOTE: Should function add file, when there is no data?
// 	// const publishedComponents = await getPublishedComponents(data)
// 	return updateClientStorageAsync('recentFiles', (recentFiles) => {
// 		recentFiles = recentFiles || []
// 		const newFile = new File(data)
// 		// We have to check if the array is empty because we can't filter an empty array
// 		if (recentFiles.length === 0) {
// 			if (data.length > 0) recentFiles.push(newFile)
// 		} else {
// 			recentFiles.filter((item) => {
// 				if (item.id === newFile.id) {
// 					item.data = data
// 				} else {
// 					if (data.length > 0) recentFiles.push(newFile)
// 				}
// 			})
// 		}
// 		return recentFiles
// 	})
// }
// async function getRecentFilesAsync() {
// 	return await getClientStorageAsync('recentFiles')
// }
// // This makes sure the list of local and remote templates are up to date
// async function syncRemoteFilesAsync() {
// 	var recentFiles = await getClientStorageAsync('recentFiles')
// 	return updatePluginData(figma.root, 'remoteFiles', (remoteFiles) => {
// 		remoteFiles = remoteFiles || []
// 		// Merge recentFiles into remoteFiles (because we need to add them if they don't exist, and update them if they do)
// 		if (recentFiles.length > 0) {
// 			// if (!remoteFiles) remoteFiles = []
// 			// I think this is a method of merging files, maybe removing duplicates?
// 			var ids = new Set(remoteFiles.map((file) => file.id))
// 			var merged = [...remoteFiles, ...recentFiles.filter((file) => !ids.has(file.id))]
// 			// Exclude current file (because we want remote files to this file only)
// 			merged = merged.filter((file) => {
// 				return !(file.id === getPluginData(figma.root, 'fileId'))
// 			})
// 			remoteFiles = merged
// 		}
// 		// Then I check to see if the file name has changed and make sure it's up to date
// 		// For now I've decided to include unpublished components in remote files, to act as a reminder to people to publish them
// 		if (remoteFiles.length > 0) {
// 			for (var i = 0; i < remoteFiles.length; i++) {
// 				var file = remoteFiles[i]
// 				figma
// 					.importComponentByKeyAsync(file.data[0].component.key)
// 					.then((component) => {
// 						var remoteTemplate = getPluginData(component, 'template')
// 						updatePluginData(figma.root, 'remoteFiles', (remoteFiles) => {
// 							remoteFiles.map((file) => {
// 								if (file.id === remoteTemplate.file.id) {
// 									file.name = remoteTemplate.file.name
// 								}
// 							})
// 							return remoteFiles
// 						})
// 					})
// 					.catch((error) => {
// 						console.log(error)
// 						// FIXME: Do I need to do something here if component is deleted?
// 						// FIXME: Is this the wrong time to check if component is published?
// 						// figma.notify("Please check component is published")
// 					})
// 			}
// 		}
// 		return remoteFiles
// 	})
// }
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
                        newSelection.push(clone(children[i].children[columnIndex]));
                    }
                }
            }
            if (direction === 'adjacent') {
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
                        // console.log(node.type, node.id)
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
function spawnTable() { }
async function toggleColumnResizing(selection) {
    var _a, _b, _c;
    // FIXME: Check for text layer before setting characters
    // TODO: Swap instance to preverve current instance
    // FIXME: Something weird happening with resizing of cell/text
    let result = false;
    for (let i = 0; i < selection.length; i++) {
        var oldTable = selection[i];
        if (oldTable.type !== 'COMPONENT') {
            let settings = getTableSettings(oldTable);
            if (settings.columnResizing) {
                detachTable(selection);
                result = 'removed';
            }
            else {
                result = 'added';
                settings.columnResizing = !settings.columnResizing;
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
                                // console.log('vp', oldTableCell.variantProperties, newTableCell.variantProperties)
                                await swapInstance(oldTableCell, newTableCell);
                                // console.log('tableCell', oldTableCell.width, newTableCell)
                                // replace(newTableCell, oldTableCell)
                                // newTableCell.swapComponent(oldTableCell.mainComponent)
                                resize_1(newTableCell, oldTableCell.width, oldTableCell.height);
                                // Old layoutAlign not being preserved
                                newTableCell.layoutAlign = oldTableCell.layoutAlign;
                            }
                        }
                    }
                }
                figma.currentPage.selection = [newTable];
                oldTable.remove();
            }
        }
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
                let settings = getTableSettings(table);
                vectorType = settings.usingColumnsOrRows;
                // let parts: any = findTemplateParts(table)
                function iterateChildren() {
                    var _a;
                    var origRowlength = firstRow.parent.children.length;
                    var rowContainer = firstRow.parent;
                    var rowContainerObject = nodeToObject_1(rowContainer);
                    // Change the table container
                    if (settings.usingColumnsOrRows === 'rows') {
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
                                if (settings.usingColumnsOrRows === 'columns') {
                                    row.name = row.name.replace('Col', 'Row');
                                    row.layoutMode = 'HORIZONTAL';
                                    row.layoutGrow = 0;
                                    row.counterAxisSizingMode = 'AUTO';
                                }
                                if (i < origRowlength) {
                                    for (let c = 0; c < settings.columnCount; c++) {
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
                                                if (settings.usingColumnsOrRows === 'rows') {
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
                            if (settings.usingColumnsOrRows === 'rows' && isRow(row)) {
                                row.name = row.name.replace('Row', 'Col');
                                row.layoutMode = 'VERTICAL';
                            }
                        }
                        if (settings.usingColumnsOrRows === 'columns') {
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
                                if (settings.usingColumnsOrRows === 'columns') {
                                    row.counterAxisSizingMode = 'AUTO';
                                    row.layoutAlign = 'STRETCH';
                                    // We have to apply this after appending the cells because for some reason doing it before means that the width of the cells is incorrect
                                    var cells = row.children;
                                    var length = settings.usingColumnsOrRows === 'columns' ? firstRow.parent.children.length : firstRow.children.length;
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
                                    var length = settings.usingColumnsOrRows === 'rows' ? firstRow.parent.children.length : firstRow.children.length;
                                    for (let c = 0; c < length; c++) {
                                        var cell = cells[c];
                                        if (cell) {
                                            if (row.parent.children[getNodeIndex_1(firstRow) + c]) {
                                                // NOTE: temporary fix. Could be better
                                                if (settings.tableHeight === 'HUG') {
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
                iterateChildren();
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
    // Sync recent files when plugin is run (checks if current file is new, and if not updates data)
    await getRecentFilesAsync_1(getLocalTemplates());
    var remoteFiles = await getRemoteFilesAsync_1();
    // Show create table UI
    let pluginVersion = await getClientStorageAsync_1('pluginVersion');
    let userPreferences = await getClientStorageAsync_1('userPreferences');
    let usingRemoteTemplate = await getClientStorageAsync_1('usingRemoteTemplate');
    let pluginUsingOldComponents = getComponentById(figma.root.getPluginData('cellComponentID')) ? true : false;
    // const remoteFiles = getDocumentData('remoteFiles')
    const fileId = getDocumentData_1('fileId');
    let defaultTemplate = getDefaultTemplate();
    const localTemplates = getLocalTemplates();
    // Check for defaultTemplate
    let previousTemplate = getDocumentData_1('previousTemplate');
    getComponentById(previousTemplate === null || previousTemplate === void 0 ? void 0 : previousTemplate.id);
    let defaultTemplateComponent = getComponentById(defaultTemplate === null || defaultTemplate === void 0 ? void 0 : defaultTemplate.id);
    // If can't find current template, but can find previous, then set it as the default
    if (!defaultTemplateComponent && localTemplates.length > 0) {
        defaultTemplate = localTemplates[0];
    }
    else if (localTemplates.length === 0) {
        defaultTemplate = undefined;
    }
    // console.log({ localTemplates, defaultTemplate })
    figma.showUI(__uiFiles__.main, {
        width: 240,
        height: 474 + 8 + 8,
        themeColors: true,
    });
    figma.ui.postMessage(Object.assign(Object.assign({ type: 'show-create-table-ui' }, userPreferences), { remoteFiles, recentFiles: await getRecentFilesAsync_1(localTemplates), localTemplates,
        defaultTemplate,
        fileId,
        usingRemoteTemplate,
        pluginVersion,
        pluginUsingOldComponents }));
    // We update plugin version after UI opened for the first time so user can see the whats new message
    updatePluginVersion('7.0.0');
}
async function main() {
    // Set default preferences
    await updateClientStorageAsync_1('userPreferences', (data) => {
        data = data || {
            columnCount: 4,
            rowCount: 4,
            cellWidth: 120,
            remember: true,
            includeHeader: true,
            columnResizing: true,
            cellAlignment: 'MIN',
            tableWidth: 'HUG',
            tableHeight: 'HUG',
        };
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
            createTableUI();
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
        plugin.command('spawnTable', spawnTable);
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
        plugin.on('remove-template', (msg) => {
            let currentTemplate = getDefaultTemplate();
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
                let templateComponent = getComponentById(msg.template.id);
                templateComponent.remove();
                let localTemplates = getLocalTemplates();
                figma.ui.postMessage({
                    type: 'local-templates',
                    localTemplates: localTemplates,
                });
            }
            if (currentTemplate.id === msg.template.id) {
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
            await getRemoteFilesAsync_1();
            const templateComponent = await lookForComponent(getDocumentData_1('defaultTemplate'));
            // const templateComponent = await getComponentById(getDocumentData('defaultTemplate').id)
            if (templateComponent) {
                if (typeof msg.data.tableWidth === 'string' || msg.data.tableWidth instanceof String) {
                    msg.data.tableWidth = msg.data.tableWidth.toUpperCase();
                    msg.data.tableWidth = convertToNumber(msg.data.tableWidth);
                }
                if (typeof msg.data.tableHeight === 'string' || msg.data.tableHeight instanceof String) {
                    msg.data.tableHeight = msg.data.tableHeight.toUpperCase();
                    msg.data.tableHeight = convertToNumber(msg.data.tableHeight);
                }
                if (typeof msg.data.cellWidth === 'string' || msg.data.cellWidth instanceof String) {
                    msg.data.cellWidth = msg.data.cellWidth.toUpperCase();
                    msg.data.cellWidth = convertToNumber(msg.data.cellWidth);
                }
                if (typeof msg.data.cellHeight === 'string' || msg.data.cellHeight instanceof String) {
                    msg.data.cellHeight = msg.data.tableHeight.toUpperCase();
                    msg.data.cellHeight = convertToNumber(msg.data.cellHeight);
                }
                let tableInstance = createTable(templateComponent, msg.data);
                if (tableInstance) {
                    positionInCenterOfViewport(tableInstance);
                    figma.currentPage.selection = [tableInstance];
                    updateClientStorageAsync_1('userPreferences', (data) => Object.assign(data, msg.data)).then(() => {
                        figma.closePlugin('Table created');
                    });
                }
            }
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
            lookForComponent(msg.template).then((templateNode) => {
                postCurrentSelection(templateNode.id);
            });
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
        plugin.on('upgrade-to-template', () => {
            upgradeOldComponentsToTemplate();
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
