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
    // What should happen if user doesn't return anything in callback?
    if (!data) {
        data = null;
    }
    else {
        figma.clientStorage.setAsync(key, data);
        return data;
    }
}

const eventListeners$1 = [];
figma.ui.onmessage = message => {
    for (let eventListener of eventListeners$1) {
        if (message.action === eventListener.action)
            eventListener.callback(message.data);
    }
};

const nodeProps$1 = [
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
const readOnly$1 = [
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
function copyPaste$1(source, target, ...args) {
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
    let allowlist = nodeProps$1.filter(function (el) {
        return !readOnly$1.includes(el);
    });
    if (include) {
        // If include supplied, include copy across these properties and their values if they exist
        allowlist = include.filter(function (el) {
            return !readOnly$1.includes(el);
        });
    }
    if (exclude) {
        // If exclude supplied then don't copy over the values of these properties
        allowlist = allowlist.filter(function (el) {
            return !exclude.concat(readOnly$1).includes(el);
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
                obj.children = source.children.map((child) => copyPaste$1(child, {}, { withoutRelations }));
            }
        }
        if (source.type === "INSTANCE") {
            if (source.mainComponent && !withoutRelations) {
                obj.masterComponent = copyPaste$1(source.mainComponent, {}, { withoutRelations });
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
        copyPaste$1(node, frame, { include: ['x', 'y'] });
        // Treat like native method
        figma.currentPage.appendChild(frame);
        node.remove();
        return frame;
    }
    if (node.type === "RECTANGLE" || node.type === "GROUP") {
        let frame = figma.createFrame();
        // FIXME: Add this into copyPaste helper
        frame.resizeWithoutConstraints(node.width, node.height);
        copyPaste$1(node, frame);
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
    copyPaste$1(node, component);
    moveChildren(node, component);
    node.remove();
    return component;
}
/**
 *
 * @param {BaseNode} node  A figma node to set data on
 * @param {String} key A key to store data under
 * @param {any} data Data to be stoed
 */
function setPluginData$1(node, key, data) {
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
 * Convinient way to delete children of a node
 * @param {SceneNode & ChildrenMixin } node A node with children
 */
function removeChildren(node) {
    var length = node.children.length;
    if (length > 0) {
        for (let i = 0; i < length; i++) {
            node.children[0].remove();
        }
    }
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
        copyPaste$1(targetCopy, result, { include: ['x', 'y', 'constraints'] });
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

var convertToComponent_1 = convertToComponent;
var convertToFrame_1 = convertToFrame;
var getClientStorageAsync_1 = getClientStorageAsync;
var getNodeIndex_1 = getNodeIndex;
var nodeToObject_1 = nodeToObject;
var removeChildren_1 = removeChildren;
var replace_1 = replace;
var setClientStorageAsync_1 = setClientStorageAsync;
var setPluginData_1 = setPluginData$1;
var ungroup_1 = ungroup;
var updateClientStorageAsync_1 = updateClientStorageAsync;
var updatePluginData_1 = updatePluginData;

const eventListeners = [];

figma.ui.onmessage = message => {
  for (let eventListener of eventListeners) {
    if (message.action === eventListener.action) eventListener.callback(message.data);
  }
};

const nodeProps = ['id', 'parent', 'name', 'removed', 'visible', 'locked', 'children', 'constraints', 'absoluteTransform', 'relativeTransform', 'x', 'y', 'rotation', 'width', 'height', 'constrainProportions', 'layoutAlign', 'layoutGrow', 'opacity', 'blendMode', 'isMask', 'effects', 'effectStyleId', 'expanded', 'backgrounds', 'backgroundStyleId', 'fills', 'strokes', 'strokeWeight', 'strokeMiterLimit', 'strokeAlign', 'strokeCap', 'strokeJoin', 'dashPattern', 'fillStyleId', 'strokeStyleId', 'cornerRadius', 'cornerSmoothing', 'topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius', 'exportSettings', 'overflowDirection', 'numberOfFixedChildren', 'overlayPositionType', 'overlayBackground', 'overlayBackgroundInteraction', 'reactions', 'description', 'remote', 'key', 'layoutMode', 'primaryAxisSizingMode', 'counterAxisSizingMode', 'primaryAxisAlignItems', 'counterAxisAlignItems', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'itemSpacing', // 'horizontalPadding',
// 'verticalPadding',
'layoutGrids', 'gridStyleId', 'clipsContent', 'guides', 'type'];
const readOnly = ['id', 'parent', 'removed', 'children', 'absoluteTransform', 'width', 'height', 'overlayPositionType', 'overlayBackground', 'overlayBackgroundInteraction', 'reactions', 'remote', 'key', 'type', 'masterComponent', 'mainComponent'];
//     const obj = {};
//     if (mixedProps[prop] && node[prop] === figma.mixed) {
//         for (let prop of mixedProp[prop]) {
//             obj[prop] = source[prop]
//         }
//     } else {
//         obj[prop] = node[prop]
//     }
// }

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
  if (typeof args[0] === 'function') ;
  if (typeof args[1] === 'function') ;
  if (typeof args[0] === 'object' && typeof args[0] !== 'function') options = args[0];
  if (typeof args[0] === 'object' && typeof args[0] !== 'function') options = args[0];
  if (!options) options = {};
  const {
    include,
    exclude,
    withoutRelations,
    removeConflicts
  } = options; // const props = Object.entries(Object.getOwnPropertyDescriptors(source.__proto__))

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
  } // target supplied, don't copy over the values of these properties


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

    if (source.key) obj.key = source.key;
  }

  const props = Object.entries(Object.getOwnPropertyDescriptors(source.__proto__));

  for (const [key, value] of props) {
    if (allowlist.includes(key)) {
      try {
        if (typeof obj[key] === 'symbol') {
          obj[key] = 'Mixed';
        } else {
          obj[key] = value.get.call(source);
        }
      } catch (err) {
        obj[key] = undefined;
      }
    } // Needs building in
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
    } else {
      delete obj.textStyleId;
    }

    if (obj.cornerRadius !== figma.mixed) {
      delete obj.topLeftRadius;
      delete obj.topRightRadius;
      delete obj.bottomLeftRadius;
      delete obj.bottomRightRadius;
    } else {
      delete obj.cornerRadius;
    }
  } // Only applicable to objects because these properties cannot be set on nodes


  if (targetIsEmpty) {
    if (source.parent && !withoutRelations) {
      obj.parent = {
        id: source.parent.id,
        type: source.parent.type
      };
    }
  } // Only applicable to objects because these properties cannot be set on nodes


  if (targetIsEmpty) {
    if (source.type === "FRAME" || source.type === "COMPONENT" || source.type === "COMPONENT_SET" || source.type === "PAGE" || source.type === 'GROUP' || source.type === 'INSTANCE' || source.type === 'DOCUMENT' || source.type === 'BOOLEAN_OPERATION') {
      if (source.children && !withoutRelations) {
        obj.children = source.children.map(child => copyPaste(child, {}, {
          withoutRelations
        }));
      }
    }

    if (source.type === "INSTANCE") {
      if (source.mainComponent && !withoutRelations) {
        obj.masterComponent = copyPaste(source.mainComponent, {}, {
          withoutRelations
        });
      }
    }
  }

  Object.assign(target, obj);
  return obj;
}

/**
 * Helpers which automatically parse and stringify when you get, set or update plugin data
 */
/**
 * 
 * @param {BaseNode} node  A figma node to set data on
 * @param {String} key A key to store data under
 * @param {any} data Data to be stoed
 */

function setPluginData(node, key, data) {
  node.setPluginData(key, JSON.stringify(data));
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
        'clipsContent'
    ];
    if (options.include) {
        options.include = options.include.concat(styleProps);
    }
    else {
        options.include = styleProps;
    }
    return copyPaste(source, target, options);
}
function clone(val) {
    return JSON.parse(JSON.stringify(val));
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
function positionInCenter(node) {
    // Position newly created table in center of viewport
    node.x = figma.viewport.center.x - (node.width / 2);
    node.y = figma.viewport.center.y - (node.height / 2);
}
async function changeText(node, text, weight) {
    if (node.fontName === figma.mixed) {
        await figma.loadFontAsync(node.getRangeFontName(0, 1));
    }
    else {
        await figma.loadFontAsync({
            family: node.fontName.family,
            style: weight || node.fontName.style
        });
    }
    if (weight) {
        node.fontName = {
            family: node.fontName.family,
            style: weight
        };
    }
    if (text) {
        node.characters = text;
    }
    if (text === "") {
        // Fixes issue where spaces are ignored and node has zero width
        node.resize(10, node.height);
    }
    node.textAutoResize = "HEIGHT";
    node.layoutAlign = "STRETCH";
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

// TODO: Is it easier to ask the user to import and select their own components?
// 1. Hi, I'm tablo. My creator made me so I could help you upgrade to the shiny new version of Table Creator.
// 2. I notice you don't have a table or row component. Unfortunately you won't be able to continue using this plugin, only kidding. I just need to create some
// 1. The way table create works is slightly different now. Instead of relying on a single cell component to create tables from. Table Creator now use a table component as a template. As part of this upgrade I'm going to hopefully successfully upgrade your existing components to work with the new version of Table Creator. Unfortunately because of the way plugins work without this making this upgrade you won't be able to continue using the plugin. You can either follow this upgrade, or start from scratch and try and link your old components.
// 2. First I'll look to see if I can find a table component. If you don't have one I'll create one for you. This will be used as the main template that new tables are created from.
// 3. Next I'll look to see if you have a row component. If you don't
function upgradeFrom6to7() {
    function findUsersExisitingComponents() {
        return {
            table: findComponentById(figma.root.getPluginData("tableComponentID")),
            tr: findComponentById(figma.root.getPluginData("rowComponentID")),
            td: findComponentById(figma.root.getPluginData("cellComponentID")),
            th: findComponentById(figma.root.getPluginData("cellHeaderComponentID"))
        };
    }
    const usersExistingComponents = findUsersExisitingComponents();
    let newComponents = Object.assign({}, usersExistingComponents);
    if (usersExistingComponents.td) {
        if (!usersExistingComponents.table) {
            newComponents.table = figma.createComponent();
            // Leave a not to let user know how it works now
        }
        else {
            newComponents.table = usersExistingComponents.table;
        }
        if (!usersExistingComponents.tr) {
            newComponents.tr = figma.createComponent();
            // Add auto layout
            // Add cells to row component
            newComponents.tr.appendChild(newComponents.td.createInstance());
            newComponents.tr.appendChild(newComponents.td.createInstance());
            // Add row instance to table component
        }
        else {
            newComponents.tr = usersExistingComponents.tr;
        }
    }
    // Need to set templateData on the users existing components
    // If they don't have a table template then I need to create one
    // Import user's old template component as a new template
    // Tidy up data on the users template by removing old pluginData
}

// Wrap in function
function createDefaultTemplate() {
    const obj = {};
    // Load FONTS
    async function loadFonts() {
        await Promise.all([
            figma.loadFontAsync({
                family: "Inter",
                style: "Regular"
            }),
            figma.loadFontAsync({
                family: "Inter",
                style: "Semi Bold"
            })
        ]);
    }
    // Create COMPONENT
    var component_101_204 = figma.createComponent();
    component_101_204.resize(120.0000000000, 35.0000000000);
    component_101_204.name = "Type=Default";
    component_101_204.widgetEvents = [];
    component_101_204.layoutAlign = "STRETCH";
    component_101_204.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.000009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }];
    component_101_204.primaryAxisSizingMode = "FIXED";
    component_101_204.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.000009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }];
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
    component_101_119.expanded = false;
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
    frame_101_114.expanded = false;
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
    instance_102_493.relativeTransform = [[1, 0, 0], [0, 1, -250]];
    instance_102_493.y = -250;
    frame_101_114.appendChild(instance_102_493);
    // Swap COMPONENT
    instance_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    figma.getNodeById("I" + instance_102_493.id + ";" + line_1_352.id);
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
    instance_101_198.constraints = { "horizontal": "SCALE", "vertical": "CENTER" };
    component_101_204.appendChild(instance_101_198);
    // Swap COMPONENT
    instance_101_198.swapComponent(component_101_119);
    // Ref to SUB NODE
    figma.getNodeById("I" + instance_101_198.id + ";" + frame_101_114.id);
    // Ref to SUB NODE
    var instance_I101_198_102_493 = figma.getNodeById("I" + instance_101_198.id + ";" + instance_102_493.id);
    // Swap COMPONENT
    instance_I101_198_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    figma.getNodeById(instance_I101_198_102_493.id + ";" + line_1_352.id);
    // Ref to SUB NODE
    figma.getNodeById("I" + instance_101_198.id + ";" + frame_101_116.id);
    // Ref to SUB NODE
    figma.getNodeById("I" + instance_101_198.id + ";" + text_101_117.id);
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
    component_101_265.layoutMode = "VERTICAL";
    component_101_265.description = "";
    component_101_265.documentationLinks = [];
    // Create INSTANCE
    var instance_101_266 = component_101_119.createInstance();
    instance_101_266.resize(120.0000000000, 35.0009994507);
    instance_101_266.primaryAxisSizingMode = "AUTO";
    instance_101_266.relativeTransform = [[1, 0, 0], [0, 1, 0]];
    instance_101_266.primaryAxisSizingMode = "AUTO";
    instance_101_266.constraints = { "horizontal": "SCALE", "vertical": "CENTER" };
    component_101_265.appendChild(instance_101_266);
    // Swap COMPONENT
    instance_101_266.swapComponent(component_101_119);
    // Ref to SUB NODE
    figma.getNodeById("I" + instance_101_266.id + ";" + frame_101_114.id);
    // Ref to SUB NODE
    var instance_I101_266_102_493 = figma.getNodeById("I" + instance_101_266.id + ";" + instance_102_493.id);
    // Swap COMPONENT
    instance_I101_266_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    figma.getNodeById(instance_I101_266_102_493.id + ";" + line_1_352.id);
    // Ref to SUB NODE
    figma.getNodeById("I" + instance_101_266.id + ";" + frame_101_116.id);
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
    instance_1_366.expanded = false;
    component_1_365.appendChild(instance_1_366);
    // Swap COMPONENT
    instance_1_366.swapComponent(component_101_204);
    // Ref to SUB NODE
    var instance_I1_366_101_198 = figma.getNodeById("I" + instance_1_366.id + ";" + instance_101_198.id);
    // Swap COMPONENT
    instance_I1_366_101_198.swapComponent(component_101_119);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_366_101_198.id + ";" + frame_101_114.id);
    // Ref to SUB NODE
    var instance_I1_366_101_198_102_493 = figma.getNodeById(instance_I1_366_101_198.id + ";" + instance_102_493.id);
    // Swap COMPONENT
    instance_I1_366_101_198_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_366_101_198_102_493.id + ";" + line_1_352.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_366_101_198.id + ";" + frame_101_116.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_366_101_198.id + ";" + text_101_117.id);
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
    figma.getNodeById(instance_I1_372_101_198.id + ";" + frame_101_114.id);
    // Ref to SUB NODE
    var instance_I1_372_101_198_102_493 = figma.getNodeById(instance_I1_372_101_198.id + ";" + instance_102_493.id);
    // Swap COMPONENT
    instance_I1_372_101_198_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_372_101_198_102_493.id + ";" + line_1_352.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_372_101_198.id + ";" + frame_101_116.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_372_101_198.id + ";" + text_101_117.id);
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
    figma.getNodeById(instance_I1_379_1_366_101_266.id + ";" + frame_101_114.id);
    // Ref to SUB NODE
    var instance_I1_379_1_366_101_266_102_493 = figma.getNodeById(instance_I1_379_1_366_101_266.id + ";" + instance_102_493.id);
    // Swap COMPONENT
    instance_I1_379_1_366_101_266_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_379_1_366_101_266_102_493.id + ";" + line_1_352.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_379_1_366_101_266.id + ";" + frame_101_116.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_379_1_366_101_266.id + ";" + text_101_117.id);
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
    figma.getNodeById(instance_I1_379_1_372_101_266.id + ";" + frame_101_114.id);
    // Ref to SUB NODE
    var instance_I1_379_1_372_101_266_102_493 = figma.getNodeById(instance_I1_379_1_372_101_266.id + ";" + instance_102_493.id);
    // Swap COMPONENT
    instance_I1_379_1_372_101_266_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_379_1_372_101_266_102_493.id + ";" + line_1_352.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_379_1_372_101_266.id + ";" + frame_101_116.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_379_1_372_101_266.id + ";" + text_101_117.id);
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
    figma.getNodeById(instance_I1_398_1_366_101_198.id + ";" + frame_101_114.id);
    // Ref to SUB NODE
    var instance_I1_398_1_366_101_198_102_493 = figma.getNodeById(instance_I1_398_1_366_101_198.id + ";" + instance_102_493.id);
    // Swap COMPONENT
    instance_I1_398_1_366_101_198_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_398_1_366_101_198_102_493.id + ";" + line_1_352.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_398_1_366_101_198.id + ";" + frame_101_116.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_398_1_366_101_198.id + ";" + text_101_117.id);
    // Ref to SUB NODE
    var instance_I1_398_1_372 = figma.getNodeById("I" + instance_1_398.id + ";" + instance_1_372.id);
    instance_I1_398_1_372.expanded = false;
    // Swap COMPONENT
    instance_I1_398_1_372.swapComponent(component_101_204);
    // Ref to SUB NODE
    var instance_I1_398_1_372_101_198 = figma.getNodeById(instance_I1_398_1_372.id + ";" + instance_101_198.id);
    // Swap COMPONENT
    instance_I1_398_1_372_101_198.swapComponent(component_101_119);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_398_1_372_101_198.id + ";" + frame_101_114.id);
    // Ref to SUB NODE
    var instance_I1_398_1_372_101_198_102_493 = figma.getNodeById(instance_I1_398_1_372_101_198.id + ";" + instance_102_493.id);
    // Swap COMPONENT
    instance_I1_398_1_372_101_198_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_398_1_372_101_198_102_493.id + ";" + line_1_352.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_398_1_372_101_198.id + ";" + frame_101_116.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_398_1_372_101_198.id + ";" + text_101_117.id);
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
    figma.getNodeById(instance_I1_417_1_366_101_198.id + ";" + frame_101_114.id);
    // Ref to SUB NODE
    var instance_I1_417_1_366_101_198_102_493 = figma.getNodeById(instance_I1_417_1_366_101_198.id + ";" + instance_102_493.id);
    // Swap COMPONENT
    instance_I1_417_1_366_101_198_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_417_1_366_101_198_102_493.id + ";" + line_1_352.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_417_1_366_101_198.id + ";" + frame_101_116.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_417_1_366_101_198.id + ";" + text_101_117.id);
    // Ref to SUB NODE
    var instance_I1_417_1_372 = figma.getNodeById("I" + instance_1_417.id + ";" + instance_1_372.id);
    instance_I1_417_1_372.expanded = false;
    // Swap COMPONENT
    instance_I1_417_1_372.swapComponent(component_101_204);
    // Ref to SUB NODE
    var instance_I1_417_1_372_101_198 = figma.getNodeById(instance_I1_417_1_372.id + ";" + instance_101_198.id);
    // Swap COMPONENT
    instance_I1_417_1_372_101_198.swapComponent(component_101_119);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_417_1_372_101_198.id + ";" + frame_101_114.id);
    // Ref to SUB NODE
    var instance_I1_417_1_372_101_198_102_493 = figma.getNodeById(instance_I1_417_1_372_101_198.id + ";" + instance_102_493.id);
    // Swap COMPONENT
    instance_I1_417_1_372_101_198_102_493.swapComponent(component_1_351);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_417_1_372_101_198_102_493.id + ";" + line_1_352.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_417_1_372_101_198.id + ";" + frame_101_116.id);
    // Ref to SUB NODE
    figma.getNodeById(instance_I1_417_1_372_101_198.id + ";" + text_101_117.id);
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
    figma.getNodeById("I" + instance_1_434.id + ";" + frame_1_431.id);
    // Ref to SUB NODE
    figma.getNodeById("I" + instance_1_434.id + ";" + rectangle_1_432.id);
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
    figma.getNodeById("I" + instance_1_438.id + ";" + frame_1_431.id);
    // Ref to SUB NODE
    figma.getNodeById("I" + instance_1_438.id + ";" + rectangle_1_432.id);
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
    figma.getNodeById("I" + instance_1_442.id + ";" + frame_1_431.id);
    // Ref to SUB NODE
    figma.getNodeById("I" + instance_1_442.id + ";" + rectangle_1_432.id);
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
    figma.getNodeById("I" + instance_102_121.id + ";" + frame_1_431.id);
    // Ref to SUB NODE
    figma.getNodeById("I" + instance_102_121.id + ";" + rectangle_1_432.id);
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
    setPluginData(component_1_378, "elementSemantics", { is: "table" });
    setPluginData(component_1_365, "elementSemantics", { is: "tr" });
    setPluginData(component_101_204, "elementSemantics", { is: "td" });
    setPluginData(component_101_265, "elementSemantics", { is: "th" });
    // does it need to be on base component?
    component_101_204.setRelaunchData({ selectColumn: 'Select all cells in column', selectRow: 'Select all cells in row' });
    component_101_265.setRelaunchData({ selectColumn: 'Select all cells in column', selectRow: 'Select all cells in row' });
    // Manually add properties so cells will fill row height
    instance_1_372.layoutAlign = "STRETCH";
    instance_1_366.layoutAlign = "STRETCH";
    instance_101_198.layoutAlign = "STRETCH";
    instance_101_266.layoutAlign = "STRETCH";
    // Manually add bold font weight to header cell
    loadFonts().then((res) => {
        text_I101_266_101_117.fontName = {
            family: "Inter",
            style: "Semi Bold"
        };
    });
    obj.table = component_1_378;
    obj.row = component_1_365;
    obj.cell = component_101_204;
    obj.headerCell = component_101_265;
    obj.cellSet = componentSet_1_364;
    obj.baseCell = component_101_119;
    obj.instances = [
        instance_1_442,
        instance_102_121,
        instance_1_438,
        instance_1_434
    ];
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

console.clear();
function isVariant(node) {
    var _a;
    if (node.type === "INSTANCE") {
        return ((_a = node.mainComponent.parent) === null || _a === void 0 ? void 0 : _a.type) === "COMPONENT_SET";
    }
}
function getVariantName(node) {
    var _a, _b;
    if (isVariant(node)) {
        let type = ((_a = node.variantProperties) === null || _a === void 0 ? void 0 : _a.Type) || ((_b = node.variantProperties) === null || _b === void 0 ? void 0 : _b.type);
        if (type) {
            return node.name + "/" + type;
        }
        else {
            return node.name + "/" + node.mainComponent.name;
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
function animateIntoView(selection, duration, easing) {
    // Get current coordiantes
    let origCoords = Object.assign(Object.assign({}, figma.viewport.center), { z: figma.viewport.zoom });
    // Get to be coordiantes
    figma.viewport.scrollAndZoomIntoView(selection);
    let newCoords = Object.assign(Object.assign({}, Object.assign({}, figma.viewport.center)), { z: figma.viewport.zoom });
    // Reset back to current coordinates
    figma.viewport.center = {
        x: origCoords.x,
        y: origCoords.y
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
// start the update loop
// animate();
// reset
// setPluginData(figma.root, "usingRemoteTemplate", "")
// setPluginData(figma.root, "pluginVersion", "")
// setClientStorageAsync("pluginAlreadyRun", false)
// async function pluginAlreadyRun() {
// 	var oldPluginVersion = getPluginData(figma.root, "pluginVersion")
// 	var newPluginVersion = "7.0.0"
// 	if (parseFloat(oldPluginVersion) < parseFloat(newPluginVersion)) {
// 		// setPluginData(figma.root, "pluginVersion", "7.0.0")
// 		return true
// 	}
// 	if (pluginAlreadyRun) {
// 		return false
// 	}
// }
upgradeFrom6to7();
async function overrideChildrenChars2(sourceChildren, targetChildren, sourceComponentChildren, targetComponentChildren) {
    for (let a = 0; a < sourceChildren.length; a++) {
        if (sourceComponentChildren[a].name === targetComponentChildren[a].name) {
            targetChildren[a].name = sourceChildren[a].name;
        }
        // If layer has children then run function again
        if (targetChildren[a].children && sourceChildren[a].children) {
            overrideChildrenChars2(sourceChildren[a].children, targetChildren[a].children, sourceComponentChildren[a].children, targetComponentChildren[a].children);
        }
        // If layer is a text node then check if the main components share the same name
        else if (sourceChildren[a].type === "TEXT") {
            // if (sourceChildren[a].name === targetChildren[b].name) {
            await changeText(targetChildren[a], sourceChildren[a].characters, sourceChildren[a].fontName.style);
            // loadFonts(targetChildren[a]).then(() => {
            // 	targetChildren[a].characters = sourceChildren[a].characters
            // 	targetChildren[a].fontName.style = sourceChildren[a].fontName.style
            // })
            // }
        }
    }
}
async function swapInstance(target, source) {
    // await overrideChildrenChars(source.mainComponent.children, source.mainComponent.children, source.children, target.children)
    // replace(newTableCell, oldTableCell.clone())
    target.swapComponent(source.mainComponent);
    await overrideChildrenChars2(target.children, source.children, target.mainComponent.children, source.mainComponent.children);
}
let defaultRelaunchData = { detachTable: 'Detaches table and rows', spawnTable: 'Spawn a new table from this table', toggleColumnResizing: 'Use a component to resize columns or rows', toggleColumnsOrRows: 'Toggle between using columns or rows' };
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
        else {
            throw "error";
        }
    }
    catch (_a) {
        console.log("get remote", localComponent);
        component = await figma.importComponentByKeyAsync(template.component.key);
    }
    return component;
}
function getTableSettings(table) {
    var _a, _b, _c;
    let rowCount = 0;
    let columnCount = 0;
    let usingColumnsOrRows = "rows";
    for (let i = 0; i < table.children.length; i++) {
        var node = table.children[i];
        if (((_a = getPluginData(node, "elementSemantics")) === null || _a === void 0 ? void 0 : _a.is) === "tr") {
            rowCount++;
        }
    }
    let firstRow = table.findOne((node) => { var _a; return ((_a = getPluginData(node, "elementSemantics")) === null || _a === void 0 ? void 0 : _a.is) === "tr"; });
    let firstCell = firstRow.findOne((node) => { var _a, _b; return ((_a = getPluginData(node, "elementSemantics")) === null || _a === void 0 ? void 0 : _a.is) === "td" || ((_b = getPluginData(node, "elementSemantics")) === null || _b === void 0 ? void 0 : _b.is) === "th"; });
    console.log("layoutDirection", firstRow.parent.layoutMode);
    if (firstRow.parent.layoutMode === "VERTICAL") {
        usingColumnsOrRows = "rows";
    }
    if (firstRow.parent.layoutMode === "HORIZONTAL") {
        usingColumnsOrRows = "columns";
    }
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
        cellAlignment: "MIN",
        usingColumnsOrRows,
        cellWidth: firstCell.width
    };
}
async function toggleColumnsOrRows(selection) {
    function isRow(node) {
        var _a;
        return ((_a = getPluginData(node, "elementSemantics")) === null || _a === void 0 ? void 0 : _a.is) === "tr";
    }
    // TODO: Fix localise component to take account of rows or columns
    for (let i = 0; i < selection.length; i++) {
        var table = selection[i];
        let settings = getTableSettings(table);
        // let part: any = findTemplateParts(table)
        function iterateChildren() {
            var _a;
            let firstRow = table.findOne((node) => { var _a; return ((_a = getPluginData(node, "elementSemantics")) === null || _a === void 0 ? void 0 : _a.is) === "tr"; });
            if (table.type === "COMPONENT") {
                // Change main component row
                firstRow.mainComponent.layoutMode = settings.usingColumnsOrRows === "rows" ? "VERTICAL" : "HORIZONTAL";
            }
            else {
                var origRowlength = firstRow.parent.children.length;
                var rowContainer = firstRow.parent;
                var rowContainerObject = nodeToObject_1(rowContainer);
                // Change the table container
                if (settings.usingColumnsOrRows === "rows") {
                    firstRow.parent.layoutMode = "HORIZONTAL";
                }
                // Number of none rows won't work because when looping cells it hasn't looped rows yet.
                // function getRowIndex(currentNode, n = 0) {
                // 	// var i = getNodeIndex(node.parent.children[c])
                // 	var firstNode = currentNode.parent.children[1]
                // 	var i = getNodeIndex(currentNode)
                // 	// Is currentNode a row
                // 	if (isRow(firstNode)) {
                // 		// Does currenNode index equal 0
                // 		if (0 === getNodeIndex(currentNode)) {
                // 			return 0
                // 		}
                // 		else {
                // 			getRowIndex(currentNode.parent.children[i + 1], c)
                // 		}
                // 	}
                // 	else {
                // 		n = n + 1
                // 		getRowIndex(currentNode.parent.children[n], n)
                // 	}
                // 	if (isRow(node.parent.children[c + n])) {
                // 		return c + n
                // 	}
                // 	else {
                // 		return getRowIndex(node, c, n + 1)
                // 	}
                // }
                function getIndex(node, c) {
                    var container = node.parent;
                    var i = -1;
                    var x = -1;
                    while (i < c) {
                        i++;
                        x++;
                        var item = container.children[x];
                        if (!isRow(item)) {
                            i--;
                        }
                    }
                    return x;
                }
                for (let i = 0; i < firstRow.parent.children.length; i++) {
                    var row = rowContainer.children[i];
                    if (isRow(row)) {
                        console.log("rowName", row.name);
                        row.width;
                        row.height;
                        var cells = row.children;
                        if (settings.usingColumnsOrRows === "columns") {
                            row.name = row.name.replace("Col", "Row");
                            row.layoutMode = "HORIZONTAL";
                            row.layoutGrow = 0;
                            row.counterAxisSizingMode = "AUTO";
                        }
                        if (i < origRowlength) {
                            for (let c = 0; c < settings.columnCount; c++) {
                                var cell = cells[c];
                                // var cellLocation = [c + 1, r + 1]
                                // var columnIndex = getNodeIndex(row) + c
                                var oppositeIndex = getIndex(row, c);
                                console.log("column", c, "requiredIndex", oppositeIndex);
                                if (cell) {
                                    console.log("column", c, "requiredIndex", oppositeIndex);
                                    cell.primaryAxisSizingMode = "AUTO";
                                    // We do this because the first row isn't always the first in the array and also the c value needs to match the index starting from where the first row starts
                                    if (row.id === firstRow.id && !row.parent.children[oppositeIndex]) {
                                        // If it's the first row and column doesn't exist then create a new column
                                        var clonedColumn = row.clone();
                                        removeChildren_1(clonedColumn); // Need to remove children because they are clones
                                        table.appendChild(clonedColumn);
                                    }
                                    if (row.parent.children[oppositeIndex]) {
                                        if (settings.usingColumnsOrRows === "rows") {
                                            row.parent.children[oppositeIndex].appendChild(cell);
                                            row.parent.children[oppositeIndex].resize(cell.width, row.height);
                                            row.parent.children[oppositeIndex].layoutAlign = "STRETCH";
                                        }
                                        else {
                                            row.parent.children[oppositeIndex].appendChild(cell);
                                            cell.resize(row.width, 100);
                                            // cell.primaryAxisSizingMode = "FIXED"
                                            // cell.layoutAlign = "STRETCH"
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else {
                        console.log("none row width", row.height);
                        row.resize(rowContainerObject.children[i].height, rowContainerObject.children[i].width);
                    }
                    if (settings.usingColumnsOrRows === "rows") {
                        row.name = row.name.replace("Row", "Col");
                        if (isRow(row))
                            row.layoutMode = "VERTICAL";
                    }
                }
                if (settings.usingColumnsOrRows === "columns") {
                    firstRow.parent.layoutMode = "VERTICAL";
                }
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
                        if (settings.usingColumnsOrRows === "columns") {
                            row.counterAxisSizingMode = "AUTO";
                            row.layoutAlign = "STRETCH";
                            // We have to apply this after appending the cells because for some reason doing it before means that the width of the cells is incorrect
                            var cells = row.children;
                            var length = settings.usingColumnsOrRows === "columns" ? firstRow.parent.children.length : firstRow.children.length;
                            for (let c = 0; c < length; c++) {
                                var cell = cells[c];
                                if (cell) {
                                    if (row.parent.children[getNodeIndex_1(firstRow) + c]) {
                                        cell.primaryAxisSizingMode = "FIXED";
                                        cell.layoutAlign = "STRETCH";
                                        console.log(cell.layoutAlign);
                                    }
                                }
                            }
                        }
                        // If row ends up being empty, then assume it's not needed
                        if (row.children.length === 0) {
                            console.log("remove row");
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
async function toggleColumnResizing(selection) {
    var _a, _b, _c;
    for (let i = 0; i < selection.length; i++) {
        var oldTable = selection[i];
        let settings = getTableSettings(oldTable);
        console.log("settings", settings);
        if (settings.columnResizing) {
            detachTable(selection);
        }
        else {
            settings.columnResizing = !settings.columnResizing;
            let newTable = await createTableInstance(oldTable, settings);
            // copyPaste(oldTable, newTable, { include: ['x', 'y', 'name'] })
            // Loop new table and replace with cells from old table
            let rowLength = oldTable.children.length;
            for (let a = 0; a < rowLength; a++) {
                let nodeA = oldTable.children[a];
                if (((_a = getPluginData(nodeA, "elementSemantics")) === null || _a === void 0 ? void 0 : _a.is) === "tr") {
                    let columnLength = nodeA.children.length;
                    for (let b = 0; b < columnLength; b++) {
                        let nodeB = nodeA.children[b];
                        if (((_b = getPluginData(nodeB, "elementSemantics")) === null || _b === void 0 ? void 0 : _b.is) === "td" || ((_c = getPluginData(nodeB, "elementSemantics")) === null || _c === void 0 ? void 0 : _c.is) === "th") {
                            let newTableCell = newTable.children[a].children[b];
                            let oldTableCell = nodeB;
                            await swapInstance(oldTableCell, newTableCell);
                            newTableCell.resize(oldTableCell.width, oldTableCell.height);
                        }
                    }
                }
            }
            figma.currentPage.selection = [newTable];
            oldTable.remove();
        }
    }
}
async function spawnTable(selection, userSettings) {
    let newSelection = [];
    for (let i = 0; i < selection.length; i++) {
        var oldTable = selection[i];
        let settings = Object.assign(getTableSettings(oldTable), userSettings);
        let newTable = await createTableInstance(oldTable, settings);
        newSelection.push(newTable);
        // copyPaste(oldTable, newTable, { include: ['x', 'y', 'name'] })
        // Loop new table and replace with cells from old table
        // oldTable.remove()
    }
    let tempGroupArray = [];
    for (let i = 0; i < figma.currentPage.selection.length; i++) {
        let tempClone = figma.currentPage.selection[i].clone();
        tempGroupArray.push(tempClone);
    }
    let tempGroup = figma.group(tempGroupArray, figma.currentPage.selection[0].parent);
    for (let i = 0; i < newSelection.length; i++) {
        let node = newSelection[i];
        node.x = node.x + tempGroup.width + 80;
    }
    figma.currentPage.selection = newSelection;
    tempGroup.remove();
}
async function createTableInstance(templateNode, preferences) {
    // FIXME: Get it to work with parts which are not components as well
    var tableInstance = convertToFrame_1(templateNode.clone());
    let part = findTemplateParts(templateNode);
    // let template = () => {
    // 	if (templateNode)
    // }()
    // FIXME: Check for imported components
    // FIXME: Check all conditions are met. Is table, is row, is cell, is instance etc.
    // Let user know if a cell header can't be found
    if (preferences.includeHeader && !part.th) {
        figma.notify("No Header Cell component found");
        // FIXME: Check for header cell sooner so table creation doesn't start
        return;
    }
    var table;
    if (part.table.id === templateNode.id) {
        console.log("table and container are the same thing");
        table = tableInstance;
    }
    else {
        // Remove table from template
        tableInstance.findAll((node) => {
            var _a;
            if (((_a = getPluginData(node, "elementSemantics")) === null || _a === void 0 ? void 0 : _a.is) === "table") {
                node.remove();
            }
        });
        var tableIndex = getNodeIndex_1(part.table);
        // Add table back to template
        tableInstance.insertChild(tableIndex, table);
    }
    // Create first row
    var firstRow;
    var rowIndex = getNodeIndex_1(part.tr);
    function getRowParent() {
        var row = table.findOne((node) => { var _a; return ((_a = getPluginData(node, "elementSemantics")) === null || _a === void 0 ? void 0 : _a.is) === "tr"; });
        return row.parent;
    }
    var rowParent = getRowParent();
    console.log("rowParent", rowParent);
    // Remove children which are trs
    table.findAll((node) => {
        var _a;
        if (((_a = getPluginData(node, "elementSemantics")) === null || _a === void 0 ? void 0 : _a.is) === "tr") {
            node.remove();
        }
    });
    if (preferences.columnResizing) {
        // First row should be a component
        firstRow = convertToComponent_1(part.tr.clone());
        setPluginData_1(firstRow, "elementSemantics", { is: "tr" });
    }
    else {
        // First row should be a frame
        firstRow = convertToFrame_1(part.tr.clone());
        setPluginData_1(firstRow, "elementSemantics", { is: "tr" });
    }
    rowParent.insertChild(rowIndex, firstRow);
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
        var duplicateCell;
        if (part.td.type === "COMPONENT") {
            duplicateCell = part.td.clone();
        }
        if (part.td.type === "INSTANCE") {
            duplicateCell = part.td.mainComponent.createInstance();
        }
        if (preferences.cellWidth) {
            // let origLayoutAlign = duplicateCell.layoutAlign
            duplicateCell.resizeWithoutConstraints(preferences.cellWidth, duplicateCell.height);
            // duplicateCell.layoutAlign = origLayoutAlign
        }
        setPluginData_1(duplicateCell, "elementSemantics", { is: "td" });
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
        // If using columnResizing and header swap non headers to default cells
        if (preferences.columnResizing && preferences.includeHeader) {
            for (let i = 0; i < duplicateRow.children.length; i++) {
                var cell = duplicateRow.children[i];
                // cell.swapComponent(part.th)
                // FIXME: Check if instance or main component
                cell.mainComponent = part.td.mainComponent;
                setPluginData_1(cell, "elementSemantics", { is: "td" });
            }
        }
        rowParent.insertChild(rowIndex + 1, duplicateRow);
    }
    // Swap first row to use header cell
    if (preferences.includeHeader && part.th) {
        for (var i = 0; i < firstRow.children.length; i++) {
            var child = firstRow.children[i];
            // FIXME: Check if instance or main component
            child.swapComponent(part.th.mainComponent);
            setPluginData_1(child, "elementSemantics", { is: "th" });
            // child.mainComponent = part.th.mainComponent
        }
    }
    tableInstance.setRelaunchData(defaultRelaunchData);
    return tableInstance;
}
async function updateTableInstances(template) {
    // FIXME: Template file name not up to date for some reason
    var tables = figma.root.findAll((node) => { var _a; return ((_a = getPluginData(node, 'template')) === null || _a === void 0 ? void 0 : _a.id) === template.id; });
    var tableTemplate = await lookForComponent(template);
    var rowTemplate = tableTemplate.findOne(node => { var _a; return ((_a = getPluginData(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === "tr"; });
    for (let b = 0; b < tables.length; b++) {
        var table = tables[b];
        // Don't apply if an instance
        if (table.type !== "INSTANCE") {
            console.log("tableTemplate", tableTemplate);
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
            table.findAll(node => {
                var _a;
                if (((_a = getPluginData(node, 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is) === "tr" === true && node.type !== "INSTANCE") {
                    copyPasteStyle(rowTemplate, node, { exclude: ['name'] });
                }
            });
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
function detachTable(selection) {
    let newSelection = [];
    for (let i = 0; i < selection.length; i++) {
        let table = selection[i];
        if (table.type === "INSTANCE") {
            table = table.detachInstance();
        }
        table.findAll((node) => {
            var _a;
            if (((_a = getPluginData(node, "elementSemantics")) === null || _a === void 0 ? void 0 : _a.is) === "tr") {
                if (node.type === "INSTANCE") {
                    // console.log(node.type, node.id)
                    node.detachInstance();
                }
                if (node.type === "COMPONENT") {
                    replace_1(node, convertToFrame_1);
                }
            }
        });
        newSelection.push(table);
    }
    figma.currentPage.selection = newSelection;
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
                        // table.setRelaunchData({})
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
                console.log("error", error);
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
    var localTemplates = getPluginData(figma.root, "localTemplates");
    console.log("localTemplates", localTemplates);
    async function findPublishedTemplates() {
        let publishedTemplates = [];
        if (localTemplates && localTemplates.length > 0) {
            for (let i = 0; i < localTemplates.length; i++) {
                var template = localTemplates[i];
                var templateComponent = await lookForComponent(template);
                var status = await templateComponent.getPublishStatusAsync();
                if (status !== "UNPUBLISHED") {
                    publishedTemplates.push(template);
                }
            }
        }
        if (publishedTemplates.length > 0) {
            return publishedTemplates;
        }
        else {
            return false;
        }
    }
    let publishedTemplates = await findPublishedTemplates();
    return updateClientStorageAsync_1("recentFiles", (recentFiles) => {
        recentFiles = recentFiles || [];
        if (publishedTemplates) {
            if ((Array.isArray(localTemplates) && localTemplates.length > 0) && recentFiles) {
                var newFile = {
                    id: getPluginData(figma.root, 'fileId'),
                    name: figma.root.name,
                    // TODO: I could check if template component has been published. If so then add it
                    templates: publishedTemplates
                };
                // Only add file to array if unique AND contains publishedTemplates
                if ((!recentFiles.some((item) => item.id === newFile.id)) && publishedTemplates) {
                    recentFiles.push(newFile);
                }
                else {
                    if (publishedTemplates) {
                        // Update file data
                        recentFiles.map((file, i) => {
                            if (file.id === getPluginData(figma.root, 'fileId')) {
                                recentFiles[i] = newFile;
                            }
                        });
                    }
                    else {
                        // remove file from list
                        recentFiles.map((file, i) => {
                            if (file.id === getPluginData(figma.root, 'fileId')) {
                                recentFiles.splice(i, 1);
                            }
                        });
                    }
                }
            }
            console.log("updatedRecentFiles", recentFiles);
            return recentFiles;
        }
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
    // Default template doesn't exist until user creates a new template or chooses a remote one
    if (defaultTemplate) {
        var defaultComponent = await lookForComponent(defaultTemplate);
        updatePluginData_1(figma.root, 'defaultTemplate', (data) => {
            if (defaultComponent) {
                // data.defaultTemplate.file.name = figma.root.name
                data.name = defaultComponent.name;
            }
            return data;
        });
    }
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
        // Update remoteFiles to match recentFiles
        // Exclude current file
        recentFiles = recentFiles.filter(d => {
            return !(d.id === getPluginData(figma.root, "fileId"));
        });
        remoteFiles = recentFiles;
        // // Merge recentFiles into remoteFiles
        // if (recentFiles) {
        // 	if (!remoteFiles) remoteFiles = []
        // 	var ids = new Set(remoteFiles.map(d => d.id));
        // 	var merged = [...remoteFiles, ...recentFiles.filter(d => !ids.has(d.id))];
        // 	// Exclude current file
        // 	merged = merged.filter(d => {
        // 		return !(d.id === getPluginData(figma.root, "fileId"))
        // 	})
        // 	remoteFiles = merged
        // }
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
                }).catch((error) => {
                    console.log(error);
                    // FIXME: Do I need to do something here if component is deleted?
                    // FIXME: Is this the wrong time to check if component is published?
                    // figma.notify("Please check component is published")
                });
            }
        }
        return remoteFiles;
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
        "th",
        "table"
    ];
    let results = {};
    // Loop though element definitions and find them in the template
    for (let i = 0; i < elements.length; i++) {
        let elementName = elements[i];
        let part = templateNode.findOne(node => {
            let elementSemantics = getPluginData(node, 'elementSemantics');
            if ((elementSemantics === null || elementSemantics === void 0 ? void 0 : elementSemantics.is) === elementName) {
                console.log(elementSemantics);
                return true;
            }
        });
        results[elementName] = part;
    }
    if (!results["table"]) {
        if (getPluginData(templateNode, 'elementSemantics').is === "table") {
            results["table"] = templateNode;
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
function removeElement(nodeId, element) {
    let node = figma.getNodeById(nodeId);
    let templateContainer = node.type === "COMPONENT" ? node : getParentComponent(node);
    templateContainer.findAll(node => {
        var _a;
        if (((_a = getPluginData(node, "elementSemantics")) === null || _a === void 0 ? void 0 : _a.is) === element) {
            if (node.type === "INSTANCE") {
                setPluginData_1(node.mainComponent, "elementSemantics", "");
            }
            else {
                setPluginData_1(node, "elementSemantics", "");
            }
        }
    });
    // TODO: Remove relaunch data for selecting row or column if td
    if (element === "table") {
        setPluginData_1(templateContainer, "elementSemantics", "");
    }
}
function addElement(element) {
    let node = figma.currentPage.selection[0];
    if (node.type === "INSTANCE") {
        setPluginData_1(node.mainComponent, "elementSemantics", { is: element });
        // TODO: Add relaunch data for selecting row or column if td
    }
    else {
        setPluginData_1(node, "elementSemantics", { is: element });
    }
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
            node.setRelaunchData(defaultRelaunchData);
            updatePluginData_1(figma.root, 'localTemplates', (data) => {
                data = data || [];
                data = addNewTemplate(node, data);
                return data;
            });
            // figma.notify(`Imported ${node.name}`)
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
async function createNewTemplate(opts) {
    let { shouldCreateNewPage } = opts;
    if (shouldCreateNewPage) {
        var newPage = figma.createPage();
        newPage.name = "Table Creator";
        figma.currentPage = newPage;
    }
    var components = createDefaultTemplate();
    // figma.currentPage.selection = figma.currentPage.children
    figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
    // Find templates locally
    var localTemplates = figma.root.findAll((node) => getPluginData(node, "template") && node.type === "COMPONENT");
    if (localTemplates.length > 0) {
        localTemplates.sort((a, b) => a.name - b.name);
        localTemplates.map(node => {
            console.log(node.name);
        });
        if (localTemplates[localTemplates.length - 1].name.startsWith("Table")) {
            let matches = localTemplates[localTemplates.length - 1].name.match(/\d+$/);
            console.log(matches);
            if (matches) {
                components.table.name = `Table ${parseInt(matches[0], 10) + 1}`;
            }
        }
    }
    importTemplate([components.table]);
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
                figma.ui.postMessage(Object.assign(Object.assign({ type: "create-table" }, res), { usingRemoteTemplate: getPluginData(figma.root, "usingRemoteTemplate"), defaultTemplate: getPluginData(figma.root, 'defaultTemplate'), remoteFiles: getPluginData(figma.root, 'remoteFiles'), localTemplates: getPluginData(figma.root, 'localTemplates'), fileId: getPluginData(figma.root, 'fileId'), pluginAlreadyRun: pluginAlreadyRun, recentFiles: recentFiles }));
                // Shouldn't be set, but lets do it just for good measure
                setPluginData_1(figma.root, "usingRemoteTemplate", false);
                setClientStorageAsync_1("pluginAlreadyRun", true);
                syncRecentFiles();
            });
        });
    });
    return components;
}
function postCurrentSelection(templateNodeId) {
    var _a;
    let selection;
    function isInsideTemplate(node) {
        let parentComponent = node.type === "COMPONENT" ? node : getParentComponent(node);
        if ((isInsideComponent(node) || node.type === "COMPONENT") && parentComponent) {
            if (getPluginData(parentComponent, 'template') && parentComponent.id === templateNodeId) {
                return true;
            }
        }
    }
    if (figma.currentPage.selection.length === 1 && isInsideTemplate(figma.currentPage.selection[0])) {
        selection = {
            element: (_a = getPluginData(figma.currentPage.selection[0], 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is,
            name: getSelectionName(figma.currentPage.selection[0])
        };
        figma.ui.postMessage({ type: 'current-selection', selection: selection });
    }
    figma.on('selectionchange', () => {
        var _a;
        if (figma.currentPage.selection.length === 1 && isInsideTemplate(figma.currentPage.selection[0])) {
            console.log("selection changed");
            selection = {
                element: (_a = getPluginData(figma.currentPage.selection[0], 'elementSemantics')) === null || _a === void 0 ? void 0 : _a.is,
                name: getSelectionName(figma.currentPage.selection[0])
            };
            figma.ui.postMessage({ type: 'current-selection', selection: selection });
        }
        else {
            figma.ui.postMessage({ type: 'current-selection', selection: undefined });
        }
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
    plugin.command('detachTable', () => {
        detachTable(figma.currentPage.selection);
        figma.closePlugin();
    });
    plugin.command('spawnTable', () => {
        spawnTable(figma.currentPage.selection).then(() => {
            figma.closePlugin();
        });
    });
    plugin.command('toggleColumnResizing', () => {
        toggleColumnResizing(figma.currentPage.selection).then(() => {
            figma.closePlugin();
        });
    });
    plugin.command('toggleColumnsOrRows', () => {
        toggleColumnsOrRows(figma.currentPage.selection).then(() => {
            figma.closePlugin();
        });
    });
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
        createNewTemplate().then((components) => {
            components.cellSet.remove();
            components.row.remove();
            components.baseCell.remove();
            components.instances.map(instance => instance.remove());
            delete components.instances;
            var tempGroup = figma.group(Object.values(components), figma.currentPage);
            positionInCenter(tempGroup);
            figma.currentPage.selection = ungroup_1(tempGroup, figma.currentPage);
            figma.closePlugin();
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
    plugin.command('resetOnboarding', () => {
        setClientStorageAsync_1("pluginAlreadyRun", false).then(() => {
            figma.closePlugin("Onboarding flow reset");
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
        createNewTemplate({ shouldCreateNewPage: true });
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
    plugin.on('remove-element', (msg) => {
        removeElement(msg.id, msg.element);
    });
    plugin.on('add-element', (msg) => {
        addElement(msg.element);
    });
    plugin.on('edit-template', (msg) => {
        lookForComponent(msg.template).then((templateNode) => {
            var _a, _b, _c, _d;
            // figma.viewport.scrollAndZoomIntoView([templateNode])
            animateIntoView([templateNode]);
            figma.currentPage.selection = [templateNode];
            let parts = findTemplateParts(templateNode);
            let partsAsObject = {
                table: {
                    name: getSelectionName(parts === null || parts === void 0 ? void 0 : parts.table),
                    element: "table",
                    id: (_a = parts === null || parts === void 0 ? void 0 : parts.table) === null || _a === void 0 ? void 0 : _a.id
                },
                tr: {
                    name: getSelectionName(parts === null || parts === void 0 ? void 0 : parts.tr),
                    element: "tr",
                    id: (_b = parts === null || parts === void 0 ? void 0 : parts.tr) === null || _b === void 0 ? void 0 : _b.id
                },
                td: {
                    name: getSelectionName(parts === null || parts === void 0 ? void 0 : parts.td),
                    element: "td",
                    id: (_c = parts === null || parts === void 0 ? void 0 : parts.td) === null || _c === void 0 ? void 0 : _c.id
                },
                th: {
                    name: getSelectionName(parts === null || parts === void 0 ? void 0 : parts.th),
                    element: "th",
                    id: (_d = parts === null || parts === void 0 ? void 0 : parts.th) === null || _d === void 0 ? void 0 : _d.id
                }
            };
            postCurrentSelection(templateNode.id);
            figma.ui.postMessage({ type: 'template-parts', parts: partsAsObject });
        });
    });
    plugin.on('fetch-current-selection', (msg) => {
        lookForComponent(msg.template).then((templateNode) => {
            postCurrentSelection(templateNode.id);
        });
    });
    plugin.on('find-template-parts', (msg) => {
        lookForComponent(msg.template).then((templateNode) => {
            var _a, _b, _c, _d;
            // figma.viewport.scrollAndZoomIntoView([templateNode])
            // figma.currentPage.selection = [templateNode]
            let parts = findTemplateParts(templateNode);
            let partsAsObject = {
                table: {
                    name: getSelectionName(parts === null || parts === void 0 ? void 0 : parts.table),
                    element: "table",
                    id: (_a = parts === null || parts === void 0 ? void 0 : parts.table) === null || _a === void 0 ? void 0 : _a.id
                },
                tr: {
                    name: getSelectionName(parts === null || parts === void 0 ? void 0 : parts.tr),
                    element: "tr",
                    id: (_b = parts === null || parts === void 0 ? void 0 : parts.tr) === null || _b === void 0 ? void 0 : _b.id
                },
                td: {
                    name: getSelectionName(parts === null || parts === void 0 ? void 0 : parts.td),
                    element: "td",
                    id: (_c = parts === null || parts === void 0 ? void 0 : parts.td) === null || _c === void 0 ? void 0 : _c.id
                },
                th: {
                    name: getSelectionName(parts === null || parts === void 0 ? void 0 : parts.th),
                    element: "th",
                    id: (_d = parts === null || parts === void 0 ? void 0 : parts.th) === null || _d === void 0 ? void 0 : _d.id
                }
            };
            // let selection
            // function isInsideTemplate(node) {
            // 	let parentComponent = node.type === "COMPONENT" ? node : getParentComponent(node)
            // 	console.log(parentComponent)
            // 	if ((isInsideComponent(node) || node.type === "COMPONENT") && parentComponent) {
            // 		if (getPluginData(parentComponent, 'elementSemantics')?.is === 'table') {
            // 			return true
            // 		}
            // 	}
            // }
            // if (figma.currentPage.selection.length === 1 && isInsideTemplate(figma.currentPage.selection[0])) {
            // 	selection = {
            // 		element: getPluginData(figma.currentPage.selection[0], 'elementSemantics')?.is,
            // 		name: figma.currentPage.selection[0].name
            // 	}
            // 	figma.ui.postMessage({ type: 'current-selection', selection: selection })
            // }
            // figma.on('selectionchange', () => {
            // 	if (figma.currentPage.selection.length === 1 && isInsideTemplate(figma.currentPage.selection[0])) {
            // 		console.log("selection changed")
            // 		selection = {
            // 			element: getPluginData(figma.currentPage.selection[0], 'elementSemantics')?.is,
            // 			name: figma.currentPage.selection[0].name
            // 		}
            // 		figma.ui.postMessage({ type: 'current-selection', selection: selection })
            // 	}
            // 	else {
            // 		figma.ui.postMessage({ type: 'current-selection', selection: undefined })
            // 	}
            // })
            figma.ui.postMessage({ type: 'template-parts', parts: partsAsObject });
        });
    });
});
// console.log('fileId ->', getPluginData(figma.root, 'fileId'))
// console.log('remoteFiles ->', getPluginData(figma.root, 'remoteFiles'))
// console.log('localTemplates ->', getPluginData(figma.root, 'localTemplates'))
// console.log('defaultTemplate ->', getPluginData(figma.root, 'defaultTemplate'))
// console.log('remoteFiles ->', getPluginData(figma.root, 'remoteFiles'))
getClientStorageAsync_1("recentFiles").then(recentFiles => {
    console.log(recentFiles);
});
// getClientStorageAsync('userPreferences').then(res => {
// 	console.log(res)
// })
// figma.on('run', ({ command, parameters }: RunEvent) => {
// 	switch (command) {
// 		case "spawnTable":
// 			spawnTable(figma.currentPage.selection, { columnCount: parameters.numCols, rowCount: parameters.numRows }).then(() => {
// 				figma.closePlugin()
// 			})
// 			break
// 	}
// })
