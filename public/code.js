'use strict';

/**
 * Helpers which make it easier to update client storage
 */
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

  var obj = target;

  if (obj.id === undefined) {
    obj.id = source.id;
  }

  if (obj.type === undefined) {
    obj.type = source.type;
  }

  if (targetIsEmpty) {
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
  }

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

function copyPasteStyle(source, target, options = {}) {
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
function ungroupNode(node, parent) {
    // Avoid children changing while looping
    let children = node.children;
    for (let i = 0; i < children.length; i++) {
        parent.appendChild(children[i]);
    }
    if (node.type === "FRAME") {
        node.remove();
    }
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
        })
    ]);
}
function createDefaultComponents() {
    const obj = {};
    var tempContainer = figma.createFrame();
    tempContainer.fills = [];
    tempContainer.clipsContent = false;
    // Create TEXT
    var text_4_43 = figma.createText();
    text_4_43.resize(250.0000000000, 98.0000000000);
    text_4_43.name = "Customise the following components to create bespoke tables. Or to link using your own components go to Plugins > Table Creator > Settings. You can move and rename the components as you wish. The only component which must exist for the plugin to work is the Cell component.";
    text_4_43.layoutAlign = "STRETCH";
    loadFonts().then((res) => {
        text_4_43.fontName = {
            family: "Roboto",
            style: "Regular"
        };
        text_4_43.characters = "Customise the following components to create bespoke tables. Or to link using your own components go to Plugins > Table Creator > Settings. You can move and rename the components as you wish. The only component which must exist for the plugin to work is the Cell component.";
        text_4_43.textAutoResize = "HEIGHT";
    });
    tempContainer.appendChild(text_4_43);
    // Create TEXT
    var text_4_52 = figma.createText();
    text_4_52.resize(250.0000000000, 70.0000000000);
    text_4_52.name = "The Cell component is the only component required for Table Creator to create tables from. You can cutomise this component, or link the plugin to a different Cell component by running Plugins > Table Creator > Settings.";
    text_4_52.relativeTransform = [[1, 0, 300], [0, 1, 200]];
    text_4_52.x = 300;
    text_4_52.y = 200;
    text_4_52.layoutAlign = "STRETCH";
    loadFonts().then((res) => {
        text_4_52.fontName = {
            family: "Roboto",
            style: "Regular"
        };
        text_4_52.characters = "The Cell component is the only component required for Table Creator to create tables from. You can cutomise this component, or link the plugin to a different Cell component by running Plugins > Table Creator > Settings.";
        text_4_52.textAutoResize = "HEIGHT";
    });
    tempContainer.appendChild(text_4_52);
    // Create COMPONENT
    var component_4_48 = figma.createComponent();
    component_4_48.resize(100.0000000000, 34.0099983215);
    component_4_48.name = "Type=Default";
    component_4_48.layoutAlign = "STRETCH";
    component_4_48.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.00009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }];
    component_4_48.primaryAxisSizingMode = "FIXED";
    component_4_48.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.00009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }];
    component_4_48.layoutMode = "VERTICAL";
    component_4_48.description = "";
    component_4_48.setPluginData("isCell", "true");
    obj.cell = component_4_48;
    // Create FRAME
    var frame_4_49 = figma.createFrame();
    frame_4_49.resizeWithoutConstraints(100.0000000000, 0.01);
    frame_4_49.locked = true;
    frame_4_49.layoutAlign = "STRETCH";
    frame_4_49.fills = [];
    frame_4_49.backgrounds = [];
    frame_4_49.clipsContent = false;
    component_4_48.appendChild(frame_4_49);
    // Create COMPONENT
    var component_6_0 = figma.createComponent();
    component_6_0.name = "Table Border";
    component_6_0.constraints = { "horizontal": "STRETCH", "vertical": "STRETCH" };
    component_6_0.description = "";
    // Create LINE
    var line_6_1 = figma.createLine();
    line_6_1.resizeWithoutConstraints(10000.0000000000, 0.0000000000);
    line_6_1.strokes = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.7254902124404907, "g": 0.7254902124404907, "b": 0.7254902124404907 } }];
    line_6_1.constraints = { "horizontal": "STRETCH", "vertical": "STRETCH" };
    component_6_0.appendChild(line_6_1);
    // Create INSTANCE
    var instance_4_46 = component_6_0.createInstance();
    instance_4_46.relativeTransform = [[0, -1, 0], [1, 0, -5000]];
    instance_4_46.y = -5000;
    instance_4_46.rotation = -90;
    instance_4_46.expanded = false;
    instance_4_46.constraints = { "horizontal": "MIN", "vertical": "MIN" };
    frame_4_49.appendChild(instance_4_46);
    // Create FRAME
    var frame_4_50 = figma.createFrame();
    frame_4_50.resize(100.0000000000, 34.0000000000);
    frame_4_50.name = "Content";
    frame_4_50.relativeTransform = [[1, 0, 0], [0, 1, 0.0099999998]];
    frame_4_50.y = 0.009999999776482582;
    frame_4_50.layoutAlign = "STRETCH";
    frame_4_50.fills = [];
    frame_4_50.paddingLeft = 8;
    frame_4_50.paddingRight = 8;
    frame_4_50.paddingTop = 10;
    frame_4_50.paddingBottom = 10;
    frame_4_50.backgrounds = [];
    frame_4_50.layoutMode = "VERTICAL";
    component_4_48.appendChild(frame_4_50);
    // Create TEXT
    var text_4_51 = figma.createText();
    text_4_51.resize(84.0000000000, 14.0000000000);
    text_4_51.relativeTransform = [[1, 0, 8], [0, 1, 10]];
    text_4_51.x = 8;
    text_4_51.y = 10;
    text_4_51.layoutAlign = "STRETCH";
    loadFonts().then((res) => {
        text_4_51.fontName = {
            family: "Roboto",
            style: "Regular"
        };
        text_4_51.characters = "";
        text_4_51.textAutoResize = "HEIGHT";
    });
    frame_4_50.appendChild(text_4_51);
    // Create COMPONENT
    var component_4_53 = figma.createComponent();
    component_4_53.resize(100.0000000000, 34.0099983215);
    component_4_53.name = "Type=Header";
    component_4_53.relativeTransform = [[1, 0, 116], [0, 1, 8.391e-7]];
    component_4_53.x = 116;
    component_4_53.y = 8.391216397285461e-7;
    component_4_53.layoutAlign = "STRETCH";
    component_4_53.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.05000000074505806, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }];
    component_4_53.primaryAxisSizingMode = "FIXED";
    component_4_53.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.05000000074505806, "blendMode": "NORMAL", "color": { "r": 0, "g": 0, "b": 0 } }];
    component_4_53.layoutMode = "VERTICAL";
    component_4_53.description = "";
    component_4_53.setPluginData("isCellHeader", "true");
    obj.cellHeader = component_4_53;
    // Create INSTANCE
    var instance_4_54 = component_4_48.createInstance();
    instance_4_54.name = "Table/Cell";
    instance_4_54.fills = [];
    instance_4_54.primaryAxisSizingMode = "AUTO";
    instance_4_54.backgrounds = [];
    component_4_53.appendChild(instance_4_54);
    // Create COMPONENT_SET
    var componentSet_4_60 = figma.combineAsVariants([component_4_48, component_4_53], tempContainer);
    componentSet_4_60.resize(216.0000000000, 34.0099983215);
    componentSet_4_60.name = "Table/Cell";
    componentSet_4_60.visible = true;
    componentSet_4_60.locked = false;
    componentSet_4_60.opacity = 1;
    componentSet_4_60.blendMode = "PASS_THROUGH";
    componentSet_4_60.isMask = false;
    componentSet_4_60.effects = [];
    componentSet_4_60.relativeTransform = [[1, 0, 0], [0, 1, 200]];
    componentSet_4_60.x = 0;
    componentSet_4_60.y = 200;
    componentSet_4_60.rotation = 0;
    componentSet_4_60.layoutAlign = "INHERIT";
    componentSet_4_60.constrainProportions = false;
    componentSet_4_60.layoutGrow = 0;
    componentSet_4_60.exportSettings = [];
    componentSet_4_60.fills = [];
    componentSet_4_60.strokes = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.48235294222831726, "g": 0.3803921639919281, "b": 1 } }];
    componentSet_4_60.strokeWeight = 1;
    componentSet_4_60.strokeAlign = "INSIDE";
    componentSet_4_60.strokeCap = "NONE";
    componentSet_4_60.strokeJoin = "MITER";
    componentSet_4_60.strokeMiterLimit = 4;
    componentSet_4_60.dashPattern = [10, 5];
    componentSet_4_60.cornerRadius = 5;
    componentSet_4_60.cornerSmoothing = 0;
    componentSet_4_60.paddingLeft = 0;
    componentSet_4_60.paddingRight = 0;
    componentSet_4_60.paddingTop = 0;
    componentSet_4_60.paddingBottom = 0;
    componentSet_4_60.primaryAxisAlignItems = "MIN";
    componentSet_4_60.counterAxisAlignItems = "MIN";
    componentSet_4_60.primaryAxisSizingMode = "AUTO";
    componentSet_4_60.layoutGrids = [];
    componentSet_4_60.backgrounds = [];
    componentSet_4_60.clipsContent = true;
    componentSet_4_60.guides = [];
    componentSet_4_60.expanded = true;
    componentSet_4_60.constraints = { "horizontal": "MIN", "vertical": "MIN" };
    componentSet_4_60.layoutMode = "HORIZONTAL";
    componentSet_4_60.counterAxisSizingMode = "AUTO";
    componentSet_4_60.itemSpacing = 16;
    componentSet_4_60.description = "";
    // Create COMPONENT
    var component_4_61 = figma.createComponent();
    component_4_61.resize(200.0000000000, 34.0099983215);
    component_4_61.name = "Table/Row";
    component_4_61.effects = [{ "type": "INNER_SHADOW", "color": { "r": 0.7254902124404907, "g": 0.7254902124404907, "b": 0.7254902124404907, "a": 1 }, "offset": { "x": 0, "y": 1 }, "radius": 0, "spread": 0, "visible": true, "blendMode": "NORMAL" }];
    component_4_61.relativeTransform = [[1, 0, 0], [0, 1, 400]];
    component_4_61.y = 400;
    component_4_61.fills = [{ "type": "SOLID", "visible": true, "opacity": 0.00009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }];
    component_4_61.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 0.00009999999747378752, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }];
    component_4_61.clipsContent = true;
    component_4_61.layoutMode = "HORIZONTAL";
    component_4_61.counterAxisSizingMode = "AUTO";
    component_4_61.description = "";
    component_4_61.setPluginData("isRow", "true");
    tempContainer.appendChild(component_4_61);
    obj.row = component_4_61;
    // Create INSTANCE
    var instance_4_62 = component_4_48.createInstance();
    instance_4_62.name = "Table/Cell";
    instance_4_62.expanded = false;
    component_4_61.appendChild(instance_4_62);
    // Create INSTANCE
    var instance_4_68 = component_4_48.createInstance();
    instance_4_68.name = "Table/Cell";
    instance_4_68.relativeTransform = [[1, 0, 100], [0, 1, 8.391e-7]];
    instance_4_68.x = 100;
    instance_4_68.y = 8.391216397285461e-7;
    instance_4_68.expanded = false;
    component_4_61.appendChild(instance_4_68);
    // Create TEXT
    var text_4_74 = figma.createText();
    text_4_74.resize(250.0000000000, 42.0000000000);
    text_4_74.name = "Only layer styles such as: background, color, border radius etc will be used for rows when creating tables.";
    text_4_74.relativeTransform = [[1, 0, 300], [0, 1, 400]];
    text_4_74.x = 300;
    text_4_74.y = 400;
    text_4_74.layoutAlign = "STRETCH";
    loadFonts().then((res) => {
        text_4_74.fontName = {
            family: "Roboto",
            style: "Regular"
        };
        text_4_74.characters = "Only layer styles such as: background, color, border radius etc will be used for rows when creating tables.";
        text_4_74.textAutoResize = "HEIGHT";
    });
    tempContainer.appendChild(text_4_74);
    // Create COMPONENT
    var component_4_75 = figma.createComponent();
    component_4_75.resize(200.0000000000, 68.0199966431);
    component_4_75.name = "Table";
    component_4_75.relativeTransform = [[1, 0, 0], [0, 1, 600]];
    component_4_75.y = 600;
    component_4_75.fills = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }];
    component_4_75.strokes = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.7254902124404907, "g": 0.7254902124404907, "b": 0.7254902124404907 } }];
    component_4_75.cornerRadius = 2;
    component_4_75.backgrounds = [{ "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 1, "g": 1, "b": 1 } }];
    component_4_75.clipsContent = true;
    component_4_75.layoutMode = "VERTICAL";
    component_4_75.counterAxisSizingMode = "AUTO";
    component_4_75.description = "";
    component_4_75.setPluginData("isTable", "true");
    setPluginData(component_4_75, "template", {
        name: component_4_75.name,
        component: {
            key: component_4_75.key,
            id: component_4_75.id
        }
    });
    tempContainer.appendChild(component_4_75);
    obj.table = component_4_75;
    // Create INSTANCE
    var instance_4_76 = component_4_61.createInstance();
    instance_4_76.relativeTransform = [[1, 0, 0], [0, 1, 0]];
    instance_4_76.expanded = false;
    component_4_75.appendChild(instance_4_76);
    // Create INSTANCE
    var instance_4_89 = component_4_61.createInstance();
    instance_4_89.relativeTransform = [[1, 0, 0], [0, 1, 34.0099983215]];
    instance_4_89.y = 34.0099983215332;
    instance_4_89.expanded = false;
    component_4_75.appendChild(instance_4_89);
    // Create TEXT
    var text_4_102 = figma.createText();
    text_4_102.resize(250.0000000000, 140.0000000000);
    text_4_102.name = "Only layer styles such as: background, color, border radius etc will be used to create tables. You don't have to create tables using the plugin. You can also create tables by creating an instance of this component and detaching them and their rows. If you change the styles used on the table or row components you can update existing tables by going to Plugins > Table Creator > Settings and select Refresh Tables";
    text_4_102.relativeTransform = [[1, 0, 300], [0, 1, 600]];
    text_4_102.x = 300;
    text_4_102.y = 600;
    text_4_102.layoutAlign = "STRETCH";
    loadFonts().then((res) => {
        text_4_102.fontName = {
            family: "Roboto",
            style: "Regular"
        };
        text_4_102.characters = "Only layer styles such as: background, color, border radius etc will be used to create tables. You don't have to create tables using the plugin. You can also create tables by creating an instance of this component and detaching them and their rows. If you change the styles used on the table or row components you can update existing tables by going to Plugins > Table Creator > Settings and select Refresh Tables";
        text_4_102.textAutoResize = "HEIGHT";
    });
    tempContainer.appendChild(text_4_102);
    // Remove table border component from canvas
    component_6_0.remove();
    ungroupNode(tempContainer, figma.currentPage);
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
	"@figlets/helpers": "^0.0.0-alpha.6",
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

// getClientStorageAsync('components').then(res => {
// 	console.log(res)
// })
function genRandomId() {
    var randPassword = Array(10).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz").map(function (x) { return x[Math.floor(Math.random() * x.length)]; }).join('');
    return randPassword;
}
async function createTableInstance(template, preferences) {
    // Find table component
    var component = figma.getNodeById(template.component.id);
    var table = component.createInstance().detachInstance();
    // Find templates and hoist them so that don't get deleted when removing other children of table
    var rowTemplate = table.findOne(node => node.getPluginData('isRow')).detachInstance();
    figma.currentPage.appendChild(rowTemplate);
    var cellTemplate = rowTemplate.findOne(node => node.getPluginData('isCell'));
    var cellComponent = rowTemplate.findOne(node => node.getPluginData('isCell')).mainComponent;
    figma.currentPage.appendChild(cellTemplate);
    var headerCellComponent = cellTemplate.mainComponent.parent.findOne(node => node.getPluginData('isCellHeader'));
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
    if (preferences.usingLocalComponent) {
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
    else if (preferences.includeHeader && !headerCellComponent) {
        figma.notify("No Header Cell component found");
        return;
    }
    if (preferences.usingLocalComponent) {
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
// Must pass in both the source/target and their matching main components
function overrideChildrenChars(sourceComponentChildren, targetComponentChildren, sourceChildren, targetChildren) {
    for (let a = 0; a < targetChildren.length; a++) {
        for (let b = 0; b < sourceChildren.length; b++) {
            // If layer has children then run function again
            if (sourceComponentChildren[a].children && targetComponentChildren[a].children && targetChildren[a].children && sourceChildren[a].children) {
                overrideChildrenChars(sourceComponentChildren[a].children, targetComponentChildren[b].children, sourceChildren[b].children, targetChildren[b].children);
            }
            // If layer is a text node then check if the main components share the same name
            else if (sourceChildren[a].type === "TEXT") {
                if (sourceComponentChildren[a].name === targetComponentChildren[b].name) {
                    changeText(targetChildren[a], sourceChildren[a].characters, sourceChildren[a].fontName.style);
                }
            }
        }
    }
}
function overrideChildrenChars2(sourceChildren, targetChildren, sourceComponentChildren, targetComponentChildren) {
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
            changeText(targetChildren[a], sourceChildren[a].characters, sourceChildren[a].fontName.style);
            // }
        }
    }
}
async function updateTables() {
    var _a, _b;
    var tables;
    var discardBucket = figma.createFrame();
    var pages = figma.root.children;
    var previousCellTemplateID = (_a = getPluginData(figma.root, 'components').previous.cell) === null || _a === void 0 ? void 0 : _a.id;
    var previousCellHeaderTemplateID = (_b = getPluginData(figma.root, 'components').previous.cellHeader) === null || _b === void 0 ? void 0 : _b.id;
    // Get the templates
    // TODO: If component can't be imported need to show error message
    var cellTemplate, cellHeaderTemplate, rowTemplate, tableTemplate;
    if (getPluginData(figma.root, 'components').componentsRemote == true) {
        var components = getPluginData(figma.root, 'components').current;
        cellTemplate = await figma.importComponentByKeyAsync(components.cell.key);
        cellHeaderTemplate = await figma.importComponentByKeyAsync(components.cellHeader.key);
        rowTemplate = await figma.importComponentByKeyAsync(components.row.key);
        tableTemplate = await figma.importComponentByKeyAsync(components.table.key);
    }
    else {
        cellTemplate = findComponentById(getPluginData(figma.root, 'components').current.cell.id);
        cellHeaderTemplate = findComponentById(getPluginData(figma.root, 'components').current.cellHeader.id);
        rowTemplate = findComponentById(getPluginData(figma.root, 'components').current.row.id);
        tableTemplate = findComponentById(getPluginData(figma.root, 'components').current.table.id);
    }
    // If can't find table and row templates use plain frame
    if (!tableTemplate) {
        tableTemplate = figma.createFrame();
    }
    if (!rowTemplate) {
        rowTemplate = figma.createFrame();
    }
    // Look through each page to find tables created with plugin
    for (let i = 0; i < pages.length; i++) {
        tables = pages[i].findAll(node => node.getPluginData("isTable") === "true");
        for (let b = 0; b < tables.length; b++) {
            var table = tables[b];
            // Don't apply if an instance
            if (table.type !== "INSTANCE") {
                copyPasteStyle(tableTemplate, table, { include: ['name'] });
                for (let x = 0; x < table.children.length; x++) {
                    var row = table.children[x];
                    if (row.children && row.getPluginData("isRow") === "true") {
                        for (let k = 0; k < row.children.length; k++) {
                            var cell = row.children[k];
                            var width = cell.width;
                            var height = cell.height;
                            var newInstance = cell.clone();
                            discardBucket.appendChild(newInstance);
                            // Checks that main component has not been swapped by user
                            if (cell.mainComponent.id === previousCellTemplateID) {
                                overrideChildrenChars(cell.mainComponent.children, cellTemplate.children, cell.children, newInstance.children);
                                cell.mainComponent = cellTemplate;
                                // We should not set width or layout properties of cells inside row instances
                                if (row.type === "INSTANCE") ;
                                else {
                                    cell.resize(width, height);
                                    cell.layoutAlign = cellTemplate.layoutAlign;
                                    cell.layoutGrow = cellTemplate.layoutGrow;
                                }
                                // Bug where plugin preferences is lost when instance swapped
                                cell.setPluginData("instanceBug", "true");
                                cell.setPluginData("isCell", "");
                                cell.setPluginData("isCell", "true");
                                overrideChildrenChars2(newInstance.children, cell.children, newInstance.mainComponent.children, cell.mainComponent.children);
                            }
                            if (cell.mainComponent.id === previousCellHeaderTemplateID) {
                                overrideChildrenChars(cell.mainComponent.children, cellHeaderTemplate.children, cell.children, newInstance.children);
                                cell.mainComponent = cellHeaderTemplate;
                                // We should not set width or layout properties of cells inside row instances
                                if (row.type === "INSTANCE") ;
                                else {
                                    cell.resize(width, height);
                                    cell.layoutAlign = cellHeaderTemplate.layoutAlign;
                                    cell.layoutGrow = cellHeaderTemplate.layoutGrow;
                                }
                                // Bug where plugin preferences is lost when instance swapped
                                cell.setPluginData("instanceBug", "true");
                                cell.setPluginData("isCellHeader", "");
                                cell.setPluginData("isCellHeader", "true");
                                overrideChildrenChars2(newInstance.children, cell.children, newInstance.mainComponent.children, cell.mainComponent.children);
                            }
                        }
                        if (row.getPluginData("isRow") === "true" && row.type !== "INSTANCE") {
                            copyPasteStyle(rowTemplate, row, { include: ['name'] });
                        }
                    }
                }
            }
        }
    }
    discardBucket.remove();
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
    console.log(template);
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
                updatePluginData(figma.root, 'components', (data) => { data.previous[template] = oldTemplate.id; });
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
    // Does a check to only create a table if a table cell component is already defined
    if (findComponentById(getPluginData(figma.root, 'components').current.cell.id) || getPluginData(figma.root, 'components').componentsRemote) {
        updatePluginData(figma.root, 'components', (data) => {
            data.componentsExist = true;
            return data;
        });
        // Will only let you create a table if less than 50 columns and rows
        if (msg.columnCount < 51 && msg.rowCount < 51) {
            // Will input from user and create table node
            createTableInstance(getPluginData(figma.currentPage.selection[0], 'template'), msg).then((table) => {
                // If table successfully created?
                if (table) {
                    // Positions the table in the center of the viewport
                    positionInCenter(table);
                    // Makes table the users current selection
                    figma.currentPage.selection = [table];
                    // This updates the plugin preferences
                    updateClientStorageAsync('preferences', (data) => {
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
    }
    else {
        updatePluginData(figma.root, 'components', (data) => {
            data.componentsExist = false;
            return data;
        });
        figma.notify("Cannot find Cell component");
    }
}
async function syncComponentsToStorage() {
    // TODO: Find a way to check the files these components link to exist and if not remove them from storage
    return updateClientStorageAsync('templates', (data) => {
        var _a, _b;
        data = data || [];
        if (findComponentById((_b = (_a = getPluginData(figma.root, 'components').current) === null || _a === void 0 ? void 0 : _a.cell) === null || _b === void 0 ? void 0 : _b.id)) {
            updatePluginData(figma.root, 'components', (components) => {
                components.componentsExist = true;
                return components;
            });
            var newValue = {
                id: getPluginData(figma.root, 'documentId'),
                name: figma.root.name,
                set: getPluginData(figma.root, 'components').current,
                published: 'false'
            };
            // Only add to array if unique
            if (!data.some((item) => item.id === newValue.id)) {
                data.push(newValue);
            }
        }
        else {
            updatePluginData(figma.root, 'components', (components) => {
                components.componentsExist = false;
                return components;
            });
            // Remove any entries which no longer exist
            if (getPluginData(figma.root, 'documentId')) {
                data = data.filter(item => item.id !== getPluginData(figma.root, 'documentId'));
            }
        }
        return data;
    });
}
function addTemplate() {
    // Add file to list of files used by the document
    updatePluginData(figma.root, 'files', (data) => {
        data = data || [];
        // First get a list of files currently stored on the document
        // If new file then add to the list
        var newValue = {
            id: getPluginData(figma.root, 'fileId'),
            name: figma.root.name,
            templates: []
        };
        // Only add file to array if unique
        if (!data.some((item) => item.id === newValue.id)) {
            data.push(newValue);
        }
        // Add template to file in list
        data.find((file) => {
            if (file.id === getPluginData(figma.currentPage.selection[0], 'template').file.id) {
                var newTemplateEntry = {
                    id: getPluginData(figma.currentPage.selection[0], 'template').id,
                    name: getPluginData(figma.currentPage.selection[0], 'template').name,
                    component: getPluginData(figma.currentPage.selection[0], 'template').component
                };
                // Only add new template if unique
                if (!file.templates.some((template) => template.id === newTemplateEntry.id)) {
                    file.templates.push(newTemplateEntry);
                }
            }
        });
        return data;
    });
}
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
    syncComponentsToStorage().then((res) => {
        console.log(res);
    });
    plugin.command('createTable', ({ ui, data }) => {
        figma.clientStorage.getAsync('userPreferences').then((res) => {
            figma.clientStorage.getAsync('templates').then((components) => {
                ui.show(Object.assign(Object.assign({ type: "create-table" }, res), { componentsExist: getPluginData(figma.root, 'components').componentsExist, componentsRemote: getPluginData(figma.root, 'components').componentsRemote, components }));
            });
        });
    });
    plugin.command('createTableInstance', () => {
        var selection = figma.currentPage.selection;
        createTableInstance(getPluginData(selection[0], 'template'), preferences).then(() => {
            figma.closePlugin("Table created");
        });
    });
    plugin.command('markTable', () => {
        var selection = figma.currentPage.selection;
        if (selection.length === 1) {
            setPluginData(selection[0], "isTable", true);
            if (selection[0].type === "COMPONENT") {
                updatePluginData(selection[0], "template", (data) => {
                    data = data || {
                        file: {
                            id: getPluginData(figma.root, 'fileId'),
                            name: figma.root.name
                        },
                        name: selection[0].name,
                        id: genRandomId(),
                        component: {
                            key: selection[0].key,
                            id: selection[0].id
                        }
                    };
                    return data;
                });
            }
        }
        addTemplate();
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
        if (figma.currentPage.selection[0]) {
            console.log('nodeData ->', getPluginData(figma.currentPage.selection[0], 'components'));
        }
    });
    plugin.command('linkComponents', ({ ui }) => {
        figma.clientStorage.getAsync('templates').then((components) => {
            ui.show({ type: "settings", components });
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
    // Listen for events from UI
    plugin.on('to-create-table', (msg) => {
        figma.clientStorage.getAsync('preferences').then((res) => {
            plugin.ui.show(Object.assign(Object.assign({ type: "create-table" }, res), { componentsExist: getPluginData(figma.root, 'components').componentsExist }));
        });
    });
    plugin.on('update-tables', (msg) => {
        updateTables();
    });
    plugin.on('create-components', (msg) => {
        var components = createDefaultComponents();
        syncComponentsToStorage();
        figma.root.setRelaunchData({ createTable: 'Create a new table' });
        // Create new object with only key, id and type
        var componentsAsObject = {};
        for (let [key, value] of Object.entries(components)) {
            componentsAsObject[key] = copyPaste(value, {}, { include: ['key', 'id', 'type'] });
        }
        // Add plugin data to the document
        updatePluginData(figma.root, 'components', (data) => {
            data.current = Object.assign(data.current, componentsAsObject);
            return data;
        });
        // Add plugin data to each component so that it can be used remotely
        for (let [key, value] of Object.entries(components)) {
            updatePluginData(components[key], 'components', (data) => {
                data = componentsAsObject;
                return data;
            });
        }
        figma.notify('Default components created');
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
});
console.log(getPluginData(figma.root, 'files'));
