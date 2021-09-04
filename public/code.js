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
  await figma.clientStorage.setAsync(key, data); // What should happen if user doesn't return anything in callback?

  if (!data) {
    data = null;
  } // node.setPluginData(key, JSON.stringify(data))


  return data;
}

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
  if (typeof args[0] === 'function') args[0];
  if (typeof args[1] === 'function') args[1];
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
function updatePluginData(node, key, callback) {
  var data;

  if (node.getPluginData(key)) {
    data = JSON.parse(node.getPluginData(key));
  } else {
    data = null;
  }

  data = callback(data); // What should happen if user doesn't return anything in callback?

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
  } // Doesn't need removing if it's a group node


  if (node.type !== "GROUP") {
    node.remove();
  }

  return selection;
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
            family: "Roboto",
            style: "Regular"
        }), figma.loadFontAsync({
            family: "Inter",
            style: "Regular"
        })
    ]);
}
// Wrap in function
function createDefaultTemplate() {
    const obj = {};
    // Create COMPONENT
    var component_1_5 = figma.createComponent();
    component_1_5.resize(100.0000000000, 34.0099983215);
    component_1_5.name = "Type=Default";
    component_1_5.layoutAlign = "STRETCH";
    component_1_5.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.00009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }];
    component_1_5.primaryAxisSizingMode = "FIXED";
    component_1_5.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.00009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }];
    component_1_5.layoutMode = "VERTICAL";
    component_1_5.description = "";
    component_1_5.documentationLinks = [];
    obj.component_1_5 = component_1_5;
    // Create FRAME
    var frame_1_6 = figma.createFrame();
    frame_1_6.resizeWithoutConstraints(100.0000000000, 0.01);
    frame_1_6.locked = true;
    frame_1_6.layoutAlign = "STRETCH";
    frame_1_6.fills = [];
    frame_1_6.backgrounds = [];
    frame_1_6.clipsContent = false;
    obj.frame_1_6 = frame_1_6;
    component_1_5.appendChild(frame_1_6);
    // Create COMPONENT
    var component_28_2393 = figma.createComponent();
    component_28_2393.name = "Table Border";
    component_28_2393.relativeTransform = [[1, 0, 8227], [0, 1, 5078]];
    component_28_2393.x = 8227;
    component_28_2393.y = 5078;
    component_28_2393.constraints = { "horizontal": "STRETCH", "vertical": "STRETCH" };
    component_28_2393.description = "";
    component_28_2393.documentationLinks = [];
    obj.component_28_2393 = component_28_2393;
    // Create LINE
    var line_28_2394 = figma.createLine();
    line_28_2394.resizeWithoutConstraints(10000.0000000000, 0.0000000000);
    line_28_2394.strokes = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.7254902124404907, "g": 0.7254902124404907, "b": 0.7254902124404907 } }];
    line_28_2394.constraints = { "horizontal": "STRETCH", "vertical": "STRETCH" };
    obj.line_28_2394 = line_28_2394;
    component_28_2393.appendChild(line_28_2394);
    // Create INSTANCE
    var instance_1_9 = component_28_2393.createInstance();
    instance_1_9.relativeTransform = [[0, -1, 0], [1, 0, -5000]];
    instance_1_9.y = -5000;
    instance_1_9.rotation = -90;
    instance_1_9.expanded = false;
    instance_1_9.constraints = { "horizontal": "MIN", "vertical": "MIN" };
    obj.instance_1_9 = instance_1_9;
    frame_1_6.appendChild(instance_1_9);
    // Create FRAME
    var frame_1_11 = figma.createFrame();
    frame_1_11.resize(100.0000000000, 34.0000000000);
    frame_1_11.name = "Content";
    frame_1_11.relativeTransform = [[1, 0, 0], [0, 1, 0.0099999998]];
    frame_1_11.y = 0.009999999776482582;
    frame_1_11.layoutAlign = "STRETCH";
    frame_1_11.fills = [];
    frame_1_11.paddingLeft = 8;
    frame_1_11.paddingRight = 8;
    frame_1_11.paddingTop = 10;
    frame_1_11.paddingBottom = 10;
    frame_1_11.backgrounds = [];
    frame_1_11.expanded = false;
    frame_1_11.layoutMode = "VERTICAL";
    obj.frame_1_11 = frame_1_11;
    component_1_5.appendChild(frame_1_11);
    // Create TEXT
    var text_1_12 = figma.createText();
    text_1_12.resize(84.0000000000, 14.0000000000);
    text_1_12.relativeTransform = [[1, 0, 8], [0, 1, 10]];
    text_1_12.x = 8;
    text_1_12.y = 10;
    text_1_12.layoutAlign = "STRETCH";
    text_1_12.hyperlink = null;
    loadFonts().then((res) => {
        text_1_12.fontName = {
            family: "Roboto",
            style: "Regular"
        };
        text_1_12.characters = "";
        text_1_12.textAutoResize = "HEIGHT";
    });
    obj.text_1_12 = text_1_12;
    frame_1_11.appendChild(text_1_12);
    // Create COMPONENT
    var component_1_13 = figma.createComponent();
    component_1_13.resize(100.0000000000, 34.0099983215);
    component_1_13.name = "Type=Header";
    component_1_13.relativeTransform = [[1, 0, 100], [0, 1, 8.391e-7]];
    component_1_13.x = 100;
    component_1_13.y = 8.391216397285461e-7;
    component_1_13.layoutAlign = "STRETCH";
    component_1_13.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.05000000074505806, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }];
    component_1_13.primaryAxisSizingMode = "FIXED";
    component_1_13.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.05000000074505806, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }];
    component_1_13.layoutMode = "VERTICAL";
    component_1_13.description = "";
    component_1_13.documentationLinks = [];
    obj.component_1_13 = component_1_13;
    // Create INSTANCE
    var instance_1_14 = component_1_5.createInstance();
    instance_1_14.name = "Table/Cell";
    instance_1_14.layoutAlign = "INHERIT";
    instance_1_14.fills = [];
    instance_1_14.primaryAxisSizingMode = "AUTO";
    instance_1_14.backgrounds = [];
    obj.instance_1_14 = instance_1_14;
    component_1_13.appendChild(instance_1_14);
    // Create COMPONENT_SET
    var componentSet_1_20 = figma.combineAsVariants([component_1_5, component_1_13], figma.currentPage);
    componentSet_1_20.resize(200.0000000000, 34.0099983215);
    componentSet_1_20.name = "_Cell";
    componentSet_1_20.visible = true;
    componentSet_1_20.locked = false;
    componentSet_1_20.opacity = 1;
    componentSet_1_20.blendMode = "PASS_THROUGH";
    componentSet_1_20.isMask = false;
    componentSet_1_20.effects = [];
    componentSet_1_20.relativeTransform = [[1, 0, 8735], [0, 1, 4835]];
    componentSet_1_20.x = 8735;
    componentSet_1_20.y = 4835;
    componentSet_1_20.rotation = 0;
    componentSet_1_20.layoutAlign = "INHERIT";
    componentSet_1_20.constrainProportions = false;
    componentSet_1_20.layoutGrow = 0;
    componentSet_1_20.exportSettings = [];
    componentSet_1_20.fills = [];
    componentSet_1_20.strokes = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.48235294222831726, "g": 0.3803921639919281, "b": 1 } }];
    componentSet_1_20.strokeWeight = 1;
    componentSet_1_20.strokeAlign = "INSIDE";
    componentSet_1_20.strokeJoin = "MITER";
    componentSet_1_20.dashPattern = [10, 5];
    componentSet_1_20.strokeCap = "NONE";
    componentSet_1_20.strokeMiterLimit = 4;
    componentSet_1_20.cornerRadius = 5;
    componentSet_1_20.cornerSmoothing = 0;
    componentSet_1_20.paddingLeft = 0;
    componentSet_1_20.paddingRight = 0;
    componentSet_1_20.paddingTop = 0;
    componentSet_1_20.paddingBottom = 0;
    componentSet_1_20.primaryAxisAlignItems = "MIN";
    componentSet_1_20.counterAxisAlignItems = "MIN";
    componentSet_1_20.primaryAxisSizingMode = "AUTO";
    componentSet_1_20.layoutGrids = [];
    componentSet_1_20.backgrounds = [];
    componentSet_1_20.clipsContent = true;
    componentSet_1_20.guides = [];
    componentSet_1_20.expanded = true;
    componentSet_1_20.constraints = { "horizontal": "MIN", "vertical": "MIN" };
    componentSet_1_20.layoutMode = "HORIZONTAL";
    componentSet_1_20.counterAxisSizingMode = "AUTO";
    componentSet_1_20.itemSpacing = 0;
    componentSet_1_20.description = "";
    componentSet_1_20.documentationLinks = [];
    obj.componentSet_1_20 = componentSet_1_20;
    // Create COMPONENT
    var component_1_21 = figma.createComponent();
    component_1_21.resize(200.0000000000, 34.0099983215);
    component_1_21.name = "_Row";
    component_1_21.effects = [{ "type": "INNER_SHADOW", "color": { "r": 0.7254902124404907, "g": 0.7254902124404907, "b": 0.7254902124404907, "a": 1 }, "offset": { "x": 0, "y": 1 }, "radius": 0, "spread": 0, "visible": true, "blendMode": "NORMAL" }];
    component_1_21.relativeTransform = [[1, 0, 8735], [0, 1, 4655]];
    component_1_21.x = 8735;
    component_1_21.y = 4655;
    component_1_21.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.00009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }];
    component_1_21.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.00009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }];
    component_1_21.clipsContent = true;
    component_1_21.layoutMode = "HORIZONTAL";
    component_1_21.counterAxisSizingMode = "AUTO";
    component_1_21.description = "";
    component_1_21.documentationLinks = [];
    obj.component_1_21 = component_1_21;
    figma.currentPage.appendChild(component_1_21);
    // Create INSTANCE
    var instance_1_22 = component_1_5.createInstance();
    instance_1_22.name = "_Cell";
    instance_1_22.layoutAlign = "INHERIT";
    instance_1_22.expanded = false;
    obj.instance_1_22 = instance_1_22;
    component_1_21.appendChild(instance_1_22);
    // Create INSTANCE
    var instance_1_28 = component_1_5.createInstance();
    instance_1_28.name = "_Cell";
    instance_1_28.relativeTransform = [[1, 0, 100], [0, 1, 8.391e-7]];
    instance_1_28.x = 100;
    instance_1_28.y = 8.391216397285461e-7;
    instance_1_28.layoutAlign = "INHERIT";
    instance_1_28.expanded = false;
    obj.instance_1_28 = instance_1_28;
    component_1_21.appendChild(instance_1_28);
    // Create COMPONENT
    var component_1_35 = figma.createComponent();
    component_1_35.resize(200.0000000000, 102.0299987793);
    component_1_35.name = "Table 1";
    component_1_35.relativeTransform = [[1, 0, 8735], [0, 1, 4447]];
    component_1_35.x = 8735;
    component_1_35.y = 4447;
    component_1_35.fills = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }];
    component_1_35.strokes = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.7254902124404907, "g": 0.7254902124404907, "b": 0.7254902124404907 } }];
    component_1_35.strokeWeight = 2;
    component_1_35.cornerRadius = 2;
    component_1_35.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }];
    component_1_35.clipsContent = true;
    component_1_35.layoutMode = "VERTICAL";
    component_1_35.counterAxisSizingMode = "AUTO";
    component_1_35.description = "";
    component_1_35.documentationLinks = [];
    obj.component_1_35 = component_1_35;
    figma.currentPage.appendChild(component_1_35);
    // Create INSTANCE
    var instance_1_36 = component_1_21.createInstance();
    instance_1_36.relativeTransform = [[1, 0, 0], [0, 1, 0]];
    obj.instance_1_36 = instance_1_36;
    component_1_35.appendChild(instance_1_36);
    // Create INSTANCE
    var instance_15_3860 = component_1_21.createInstance();
    instance_15_3860.relativeTransform = [[1, 0, 0], [0, 1, 34.0099983215]];
    instance_15_3860.y = 34.0099983215332;
    obj.instance_15_3860 = instance_15_3860;
    component_1_35.appendChild(instance_15_3860);
    // Create INSTANCE
    var instance_1_49 = component_1_21.createInstance();
    instance_1_49.relativeTransform = [[1, 0, 0], [0, 1, 68.0199966431]];
    instance_1_49.y = 68.0199966430664;
    obj.instance_1_49 = instance_1_49;
    component_1_35.appendChild(instance_1_49);
    // Create COMPONENT
    var component_15_3841 = figma.createComponent();
    component_15_3841.resize(457.0000000000, 179.0000000000);
    component_15_3841.name = "Tooltip";
    component_15_3841.effects = [{ "type": "DROP_SHADOW", "color": { "r": 0.9666666388511658, "g": 0.15708333253860474, "b": 0.15708333253860474, "a": 0.09000000357627869 }, "offset": { "x": 0, "y": 16 }, "radius": 8, "spread": 0, "visible": false, "blendMode": "NORMAL" }];
    component_15_3841.relativeTransform = [[1, 0, 8991], [0, 1, 4134]];
    component_15_3841.x = 8991;
    component_15_3841.y = 4134;
    component_15_3841.fills = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }, { "type": "GRADIENT_LINEAR", "visible": true, "opacity": 1, "blendMode": "NORMAL", "gradientStops": [{ "color": { "r": 0, "g": 0, "b": 0, "a": 1 }, "position": 0 }, { "color": { "r": 0.26249998807907104, "g": 0.26249998807907104, "b": 0.26249998807907104, "a": 1 }, "position": 1 }], "gradientTransform": [[0.37368255853652954, 0.4259088337421417, 0.21073251962661743], [-0.0000021187263428146252, 0.0000018692335288506001, 0.5000001788139343]] }];
    component_15_3841.cornerRadius = 8;
    component_15_3841.paddingLeft = 20;
    component_15_3841.paddingRight = 20;
    component_15_3841.paddingTop = 16;
    component_15_3841.paddingBottom = 16;
    component_15_3841.primaryAxisSizingMode = "FIXED";
    component_15_3841.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }, { "type": "GRADIENT_LINEAR", "visible": true, "opacity": 1, "blendMode": "NORMAL", "gradientStops": [{ "color": { "r": 0, "g": 0, "b": 0, "a": 1 }, "position": 0 }, { "color": { "r": 0.26249998807907104, "g": 0.26249998807907104, "b": 0.26249998807907104, "a": 1 }, "position": 1 }], "gradientTransform": [[0.37368255853652954, 0.4259088337421417, 0.21073251962661743], [-0.0000021187263428146252, 0.0000018692335288506001, 0.5000001788139343]] }];
    component_15_3841.layoutMode = "HORIZONTAL";
    component_15_3841.counterAxisSizingMode = "AUTO";
    component_15_3841.description = "";
    component_15_3841.documentationLinks = [];
    obj.component_15_3841 = component_15_3841;
    figma.currentPage.appendChild(component_15_3841);
    // Create FRAME
    var frame_15_3838 = figma.createFrame();
    frame_15_3838.resizeWithoutConstraints(0.01, 0.01);
    frame_15_3838.name = "Frame 2";
    frame_15_3838.relativeTransform = [[1, 0, 20], [0, 1, 16]];
    frame_15_3838.x = 20;
    frame_15_3838.y = 16;
    frame_15_3838.fills = [];
    frame_15_3838.backgrounds = [];
    frame_15_3838.clipsContent = false;
    obj.frame_15_3838 = frame_15_3838;
    component_15_3841.appendChild(frame_15_3838);
    // Create RECTANGLE
    var rectangle_15_3839 = figma.createRectangle();
    rectangle_15_3839.resize(15.5563220978, 15.5563220978);
    rectangle_15_3839.name = "Rectangle 1";
    rectangle_15_3839.fills = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.0784313753247261, "g": 0.0784313753247261, "b": 0.0784313753247261 } }];
    rectangle_15_3839.relativeTransform = [[0.7071067691, -0.7071067691, -19.1801757812], [0.7071067691, 0.7071067691, 1.8198242188]];
    rectangle_15_3839.x = -19.18017578125;
    rectangle_15_3839.y = 1.81982421875;
    rectangle_15_3839.rotation = -45;
    rectangle_15_3839.constrainProportions = true;
    obj.rectangle_15_3839 = rectangle_15_3839;
    frame_15_3838.appendChild(rectangle_15_3839);
    // Create TEXT
    var text_15_3840 = figma.createText();
    text_15_3840.resize(416.9989929199, 147.0000000000);
    text_15_3840.name = "Only layer styles such as: background, color, border radius etc will be used to create tables. You don't have to create tables using the plugin. You can also create tables by creating an instance of this component and detaching them and their rows. If you change the styles used on the table or row components you can update existing tables by going to Plugins > Table Creator > Settings and select Refresh Tables";
    text_15_3840.fills = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }];
    text_15_3840.relativeTransform = [[1, 0, 20.0009994507], [0, 1, 16]];
    text_15_3840.x = 20.000999450683594;
    text_15_3840.y = 16;
    text_15_3840.layoutGrow = 1;
    text_15_3840.hyperlink = null;
    text_15_3840.autoRename = false;
    loadFonts().then((res) => {
        text_15_3840.fontName = {
            family: "Inter",
            style: "Regular"
        };
        text_15_3840.characters = "Only layer styles such as: background, color, border radius etc will be used to create tables. You don't have to create tables using the plugin. You can also create tables by creating an instance of this component and detaching them and their rows. If you change the styles used on the table or row components you can update existing tables by going to Plugins > Table Creator > Settings and select Refresh Tables";
        text_15_3840.fontSize = 14;
        text_15_3840.lineHeight = { "unit": "PERCENT", "value": 150 };
        text_15_3840.fontName = { "family": "Inter", "style": "Regular" };
        text_15_3840.textAutoResize = "HEIGHT";
    });
    obj.text_15_3840 = text_15_3840;
    component_15_3841.appendChild(text_15_3840);
    // Create INSTANCE
    var instance_15_3842 = component_15_3841.createInstance();
    instance_15_3842.resize(457.0000000000, 137.0000000000);
    instance_15_3842.name = "Frame 2";
    instance_15_3842.relativeTransform = [[1, 0, 8991], [0, 1, 4435]];
    instance_15_3842.y = 4435;
    obj.instance_15_3842 = instance_15_3842;
    figma.currentPage.appendChild(instance_15_3842);
    loadFonts().then((res) => {
        instance_15_3842.children[1].characters = "This component is the template used by the plugin to create tables from. You can customise the appearance of your tables by customizing the components below. There are a number of features and ways to the use the plugin. Check out this short video to get started.";
    });
    // Create INSTANCE
    var instance_15_3846 = component_15_3841.createInstance();
    instance_15_3846.resize(457.0000000000, 53.0000000000);
    instance_15_3846.name = "Frame 3";
    instance_15_3846.relativeTransform = [[1, 0, 8991], [0, 1, 4823]];
    instance_15_3846.y = 4823;
    obj.instance_15_3846 = instance_15_3846;
    figma.currentPage.appendChild(instance_15_3846);
    loadFonts().then((res) => {
        instance_15_3846.children[1].characters = "Change the appearance of cells by customising these variants.";
    });
    // Create INSTANCE
    var instance_15_3850 = component_15_3841.createInstance();
    instance_15_3850.resize(457.0000000000, 95.0000000000);
    instance_15_3850.name = "Frame 4";
    instance_15_3850.relativeTransform = [[1, 0, 8991], [0, 1, 4643]];
    instance_15_3850.y = 4643;
    obj.instance_15_3850 = instance_15_3850;
    figma.currentPage.appendChild(instance_15_3850);
    loadFonts().then((res) => {
        instance_15_3850.children[1].characters = "Change the appearance of rows by customising this component. Change the shadow color to customise the horizontal borders.";
    });
    // Remove table border component from canvas
    component_28_2393.remove();
    // Remove tooltip component from canvas
    component_15_3841.remove();
    obj.component_1_5.setPluginData("isCell", "true");
    obj.component_1_5.setRelaunchData({ selectColumn: 'Select all cells in column', selectRow: 'Select all cells in row' });
    obj.component_1_13.setPluginData("isCellHeader", "true");
    obj.component_1_13.setRelaunchData({ selectColumn: 'Select all cells in column', selectRow: 'Select all cells in row' });
    obj.component_1_21.setPluginData("isRow", "true");
    obj.component_1_35.setRelaunchData({ detachTable: 'Detaches table and rows' });
    obj.table = component_1_35;
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
// Move to helpers
function convertToComponent(node) {
    const component = figma.createComponent();
    if (node.type === "INSTANCE") {
        node = node.detachInstance();
    }
    component.resizeWithoutConstraints(node.width, node.height);
    for (const child of node.children) {
        component.appendChild(child);
    }
    copyPaste(node, component);
    node.remove();
    return component;
}
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
    try {
        component = await figma.importComponentByKeyAsync(template.component.key);
    }
    catch (_a) {
        component = findComponentById(template.component.id);
    }
    return component;
}
async function createTableInstance(template, preferences) {
    // FIXME: Check for imported components
    // FIXME: Check all conditions are met. Is table, is row, is cell, is instance etc.
    // Find table component
    var component = await lookForComponent(template);
    console.log(component);
    console.log(component.findOne(node => node.getPluginData('isCell')));
    // findComponentById(template.component.id)
    var headerCellComponent = component.findOne(node => node.getPluginData('isCell')).mainComponent.parent.findOne(node => node.getPluginData('isCellHeader'));
    if (preferences.includeHeader && !headerCellComponent) {
        figma.notify("No Header Cell component found");
        // FIXME: Check for header cell sooner so table creation doesn't start
        return;
    }
    var table = component.createInstance().detachInstance();
    // Find templates and hoist them so that don't get deleted when removing other children of table
    var rowTemplate = table.findOne(node => node.getPluginData('isRow'));
    if (rowTemplate.type === "INSTANCE") {
        rowTemplate = rowTemplate.detachInstance();
    }
    figma.currentPage.appendChild(rowTemplate);
    var cellTemplate = rowTemplate.findOne(node => node.getPluginData('isCell'));
    // FIXME: Add check to see if cell node is instance?
    var cellComponent = rowTemplate.findOne(node => node.getPluginData('isCell'));
    if (cellComponent.type === "INSTANCE") {
        cellComponent = cellComponent.mainComponent;
    }
    figma.currentPage.appendChild(cellTemplate);
    // if (headerCellTemplate) figma.currentPage.appendChild(headerCellTemplate)
    table.findAll(node => {
        if (node.getPluginData('isRow'))
            node.remove();
    });
    rowTemplate.findAll(node => {
        if (node.getPluginData('isCell'))
            node.remove();
    });
    // Adds children back to template
    table.insertChild(0, rowTemplate);
    rowTemplate.insertChild(0, cellTemplate);
    if (preferences.columnResizing) {
        // Turn first row (rowTemplate) into component
        var rowTemplateComponent = figma.createComponent();
        copyPaste(rowTemplate, rowTemplateComponent);
        rowTemplateComponent.insertChild(0, cellTemplate);
        var oldRowTemplate = rowTemplate;
        rowTemplate = rowTemplateComponent;
        table.appendChild(rowTemplate);
        oldRowTemplate.remove();
    }
    for (var i = 1; i < preferences.columnCount; i++) {
        var duplicateCell = cellTemplate.clone();
        duplicateCell.primaryAxisAlignItems = preferences.cellAlignment;
        rowTemplate.appendChild(duplicateCell);
    }
    for (var i = 1; i < preferences.rowCount; i++) {
        var duplicateRow;
        if (rowTemplate.type === "COMPONENT") {
            duplicateRow = rowTemplate.createInstance();
        }
        else {
            duplicateRow = rowTemplate.clone();
        }
        table.appendChild(duplicateRow);
    }
    if (preferences.includeHeader && headerCellComponent) {
        for (var i = 0; i < rowTemplate.children.length; i++) {
            var child = rowTemplate.children[i];
            child.swapComponent(headerCellComponent);
        }
    }
    if (preferences.columnResizing) {
        for (let i = 0; i < table.children.length; i++) {
            var row = table.children[i];
            if (i > 0) {
                for (let i = 0; i < row.children.length; i++) {
                    var cell = row.children[i];
                    cell.mainComponent = cellComponent;
                }
            }
        }
    }
    return table;
}
async function updateTableInstances(template) {
    // Template file name not up to date for some reason
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
function addNewNodeToSelection(page, node) {
    page.selection = node;
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
    addNewNodeToSelection(figma.currentPage, newSelection);
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
    addNewNodeToSelection(figma.currentPage, newSelection);
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
            updateClientStorageAsync('userPreferences', (data) => {
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
    getClientStorageAsync('userPreferences').then((res) => {
        // Will only let you create a table if less than 50 columns and rows
        if (msg.columnCount < 51 && msg.rowCount < 51) {
            // Will input from user and create table node
            createTableInstance(getPluginData(figma.root, 'defaultTemplate'), msg).then((table) => {
                // If table successfully created?
                if (table) {
                    table.setRelaunchData({});
                    // Positions the table in the center of the viewport
                    positionInCenter(table);
                    // Makes table the users current selection
                    figma.currentPage.selection = [table];
                    // This updates the plugin preferences
                    updateClientStorageAsync('userPreferences', (data) => {
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
        }
        else {
            figma.notify("Plugin limited to max of 50 columns and rows");
        }
    });
}
// function addTemplateToFiles(template, files) {
// 	var newFile = {
// 		id: template.file.id,
// 		name: template.file.name,
// 		templates: [template]
// 	}
// 	// Only add file to array if unique
// 	if (!files.some((item) => item.id === newFile.id)) {
// 		files.push(newFile)
// 	}
// 	// for (var i = 0; i < recentFiles.length; i++) {
// 	// 	var file = recentFiles[i]
// 	// 	if (file.id === getPluginData(template.file.id) {
// 	// 		file.templates = addNewTemplate(figma.currentPage.selection[0], file.templates)
// 	// 	}
// 	// }
// 	return files
// }
// setClientStorageAsync("recentFiles", undefined)
// Merge document localTemplate and merge to clientStorage as recentFiles
async function syncRecentFiles() {
    updateClientStorageAsync("recentFiles", (recentFiles) => {
        recentFiles = recentFiles || [];
        if (recentFiles) {
            var localTemplates = getPluginData(figma.root, "localTemplates");
            console.log("localTemplates", localTemplates);
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
    updatePluginData(figma.root, 'defaultTemplate', (data) => {
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
    var recentFiles = await getClientStorageAsync("recentFiles");
    console.log(recentFiles);
    updatePluginData(figma.root, 'remoteFiles', (remoteFiles) => {
        remoteFiles = remoteFiles || [];
        // Merge recentFiles into remoteFiles
        if (remoteFiles && recentFiles) {
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
                    updatePluginData(figma.root, 'remoteFiles', (remoteFiles) => {
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
    updatePluginData(figma.root, 'localTemplates', (templates) => {
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
            // FIXME: Fix helper. Only needed because helper will cause plugin data to be undefined if doesn't return value
            return templates;
        }
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
                node = convertToComponent(node);
            }
            markNode(node, 'table');
            updatePluginData(figma.root, 'localTemplates', (data) => {
                data = data || [];
                data = addNewTemplate(node, data);
                return data;
            });
            figma.notify(`Imported ${node.name}`);
        }
        else {
            updatePluginData(figma.root, 'remoteFiles', (data) => {
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
    const capitalize = (s) => {
        if (typeof s !== 'string')
            return '';
        return s.charAt(0).toUpperCase() + s.slice(1);
    };
    setPluginData(node, `is${capitalize(element)}`, true);
    if (element === 'table') {
        setTemplate(node);
    }
}
function setTemplate(node) {
    if (node.type === "COMPONENT") {
        setPluginData(node, "template", {
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
        updatePluginData(node, "template", (data) => {
            if (data) {
                data.file.name = figma.root.name;
                data.name = node.name;
            }
            return data;
        });
    }
}
function setDefaultTemplate(template) {
    setPluginData(figma.root, 'defaultTemplate', template);
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
syncRecentFiles();
syncTemplateData();
syncDefaultTemplate();
// TODO: Sync default template: find default template and pull in latest name
syncRemoteFiles();
// }, 1)
dist((plugin) => {
    plugin.ui = {
        html: __uiFiles__.main,
        width: 268,
        height: 504
    };
    updatePluginData(figma.root, 'components', (data) => {
        data = data || {
            componentsExist: false,
            current: {},
            previous: {}
        };
        return data;
    });
    // Set default preferences
    updateClientStorageAsync('userPreferences', (data) => {
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
    updatePluginData(figma.root, 'fileId', (data) => {
        data = data || genRandomId();
        return data;
    });
    // Look for any components in file and update component settings and add to storage
    // syncComponentsToStorage().then((res) => {
    // 	console.log(res)
    // })
    plugin.command('createTable', ({ ui, data }) => {
        getClientStorageAsync("pluginAlreadyRun").then((pluginAlreadyRun) => {
            figma.clientStorage.getAsync('userPreferences').then((res) => {
                ui.show(Object.assign(Object.assign({ type: "create-table" }, res), { defaultTemplate: getPluginData(figma.root, 'defaultTemplate'), remoteFiles: getPluginData(figma.root, 'remoteFiles'), localTemplates: getPluginData(figma.root, 'localTemplates'), fileId: getPluginData(figma.root, 'fileId'), pluginAlreadyRun: pluginAlreadyRun }));
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
            setPluginData(selection[0], "isCell", true);
        }
        figma.closePlugin();
    });
    plugin.command('markTableRow', () => {
        var selection = figma.currentPage.selection;
        if (selection.length === 1) {
            setPluginData(selection[0], "isRow", true);
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
        figma.currentPage.selection = ungroup(tempGroup, figma.currentPage);
        figma.closePlugin('New template created');
    });
    plugin.command('selectColumn', () => {
        selectColumn();
        figma.closePlugin();
    });
    plugin.command('selectRow', () => {
        selectRow();
        figma.closePlugin();
    });
    plugin.command('removeRemoteFiles', () => {
        setPluginData(figma.root, "remoteFiles", "");
        updateClientStorageAsync("recentFiles", (recentFiles) => {
            console.log("Recent files removed", recentFiles);
            setPluginData(figma.root, "remoteFiles", "");
            return undefined;
        }).then(() => {
            figma.closePlugin("Remote files removed");
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
        setClientStorageAsync("pluginAlreadyRun", true);
    });
    plugin.on('create-table', createTable);
    plugin.on('link-component', (msg) => {
        linkComponent(msg.template, figma.currentPage.selection);
    });
    // Updates what?
    plugin.on('update', (msg) => {
        updatePluginData(figma.root, 'components', (data) => {
            var _a, _b;
            if (findComponentById((_b = (_a = getPluginData(figma.root, 'components').current) === null || _a === void 0 ? void 0 : _a.cell) === null || _b === void 0 ? void 0 : _b.id)) {
                data.componentsExist = true;
            }
            else {
                data.componentsExist = false;
            }
            return data;
        });
        figma.clientStorage.getAsync('preferences').then((res) => {
            figma.ui.postMessage(Object.assign(Object.assign({}, res), { componentsExist: getPluginData(figma.root, 'components').componentsExist }));
        });
    });
    plugin.on('restore-component', (msg) => {
        restoreComponent(msg.component);
    });
    plugin.on('set-components', (msg) => {
        // Update components used by this file
        updatePluginData(figma.root, 'components', (data) => {
            if (msg.components === 'selected') {
                data.current = getPluginData(figma.currentPage.selection[0], 'components');
            }
            else {
                data.current = msg.components;
            }
            data.componentsExist = true;
            data.componentsRemote = true;
            return data;
        });
        figma.notify('Components set');
    });
    plugin.on('set-default-template', (msg) => {
        setDefaultTemplate(msg.template);
        // // FIXME: Consider combining into it's own function?
        // figma.clientStorage.getAsync('userPreferences').then((res) => {
        // 	figma.ui.postMessage({ ...res, defaultTemplate: getPluginData(figma.root, 'defaultTemplate'), remoteFiles: getPluginData(figma.root, 'remoteFiles'), localTemplates: getPluginData(figma.root, 'localTemplates'), fileId: getPluginData(figma.root, 'fileId') })
        // })
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
// getClientStorageAsync('userPreferences').then(res => {
// 	console.log(res)
// })
