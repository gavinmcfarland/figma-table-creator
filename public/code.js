'use strict';

/**
 * Copy properties from one node to another while avoiding conflicts. When no target node is provided it returns a new object.
 *
 * For example:
 * ```js
 * const rectangle = figma.createRectangle()
 * const frame = figma.createFrame()
 *
 * copyPaste({ rectangle, frame, exclude: ['fills'] })
 * ```
 *
 * This will copy and paste all properties except for `fills` and readonly properties.
 *
 * @param source - Node being copied from
 * @param target - Node being copied to
 * @param include - Props that should be copied
 * @param exclude - Props that shouldn't be copied
 */
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
    'guides'
];
const readonly = [
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
    'type'
];
const defaults = [
    'name',
    'guides',
    'description',
    'remote',
    'key',
    'reactions',
    'x',
    'y',
    'exportSettings',
    'expanded',
    'isMask',
    'exportSettings',
    'overflowDirection',
    'numberOfFixedChildren',
    'constraints',
    'relativeTransform'
];
function copyPasteProps(source, target, { include, exclude } = {}) {
    let allowlist = nodeProps.filter(function (el) {
        return !defaults.concat(readonly).includes(el);
    });
    if (include) {
        allowlist = allowlist.concat(include);
    }
    if (exclude) {
        allowlist = allowlist.filter(function (el) {
            return !exclude.includes(el);
        });
    }
    const val = source;
    const type = typeof source;
    if (type === 'undefined' ||
        type === 'number' ||
        type === 'string' ||
        type === 'boolean' ||
        type === 'symbol' ||
        source === null) {
        return val;
    }
    else if (type === 'object') {
        if (val instanceof Array) {
            return val.map(copyPasteProps);
        }
        else if (val instanceof Uint8Array) {
            return new Uint8Array(val);
        }
        else {
            const o = {};
            for (const key1 in val) {
                if (target) {
                    for (const key2 in target) {
                        if (allowlist.includes(key2)) {
                            if (key1 === key2) {
                                o[key1] = copyPasteProps(val[key1]);
                            }
                        }
                    }
                }
                else {
                    o[key1] = copyPasteProps(val[key1]);
                }
            }
            if (target) {
                !o.fillStyleId && o.fills ? null : delete o.fills;
                !o.strokeStyleId && o.strokes ? null : delete o.strokes;
                !o.backgroundStyleId && o.backgrounds ? null : delete o.backgrounds;
                if (o.cornerRadius !== figma.mixed) {
                    delete o.topLeftRadius;
                    delete o.topRightRadius;
                    delete o.bottomLeftRadius;
                    delete o.bottomRightRadius;
                }
                else {
                    delete o.cornerRadius;
                }
                return target ? Object.assign(target, o) : o;
            }
            else {
                return o;
            }
        }
    }
    throw 'unknown';
}
function pageNode(node) {
    if (node.parent.type === "PAGE") {
        return node.parent;
    }
    else {
        return pageNode(node.parent);
    }
}
function clone(val) {
    return JSON.parse(JSON.stringify(val));
}
function removeChildren(node) {
    var length = node.children.length;
    if (length > 0) {
        for (let i = 0; i < length; i++) {
            node.children[0].remove();
        }
        // node.children[0].remove()
    }
}
function positionInCenter(node) {
    // Position newly created table in center of viewport
    node.x = figma.viewport.center.x - (node.width / 2);
    node.y = figma.viewport.center.y - (node.height / 2);
}
function compareVersion(v1, v2, options) {
    var lexicographical = options && options.lexicographical, zeroExtend = options && options.zeroExtend, v1parts = v1.split('.'), v2parts = v2.split('.');
    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }
    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }
    if (zeroExtend) {
        while (v1parts.length < v2parts.length)
            v1parts.push("0");
        while (v2parts.length < v1parts.length)
            v2parts.push("0");
    }
    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }
    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;
        }
        if (v1parts[i] == v2parts[i]) {
            continue;
        }
        else if (v1parts[i] > v2parts[i]) {
            return 1;
        }
        else {
            return -1;
        }
    }
    if (v1parts.length != v2parts.length) {
        return -1;
    }
    return 0;
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
	"@rollup/plugin-commonjs": "^17.0.0",
	"@rollup/plugin-image": "^2.0.6",
	"@rollup/plugin-json": "^4.1.0",
	"@rollup/plugin-node-resolve": "^11.2.1",
	"@rollup/plugin-replace": "^2.4.2",
	cssnano: "^4.1.10",
	"figma-plugin-ds-svelte": "^1.0.7",
	"flex-gap-polyfill": "^2.2.1",
	plugma: "0.0.0-alpha0.7",
	postcss: "^8.2.4",
	"postcss-nested": "^5.0.3",
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
	uniqid: "^5.3.0"
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

let pkg$1 = {
    version: "6.1.0"
};
if (figma.root.getPluginData("pluginVersion") === "") {
    // If plugin was used before new auto layout tables were supported
    if (figma.root.getPluginData("cellComponentID")) {
        figma.root.setPluginData("pluginVersion", "5.0.0");
        figma.root.setPluginData("upgradedTables", "false");
    }
    // Else if plugin never used
    else {
        figma.root.setPluginData("pluginVersion", pkg$1.version);
    }
}
// --------
function createNewTable(numberColumns, numberRows, cellWidth, includeHeader, usingLocalComponent, cellAlignment) {
    // Get Cell Templa
    var cell = findComponentById(figma.root.getPluginData("cellComponentID"));
    var cellHeader = findComponentById(figma.root.getPluginData("cellHeaderComponentID"));
    if (!cellHeader && includeHeader) {
        // throw "No Header Cell component found";
        figma.notify("No Header Cell component found");
        return;
    }
    var rowTemplate = findComponentById(figma.root.getPluginData("rowComponentID"));
    var row = figma.createFrame();
    copyPasteProps(rowTemplate, row, { include: ['name'] });
    var tableTemplate = findComponentById(figma.root.getPluginData("tableComponentID"));
    var table = figma.createFrame();
    copyPasteProps(tableTemplate, table, { include: ['name'] });
    // Manually set layout mode
    table.layoutMode = "VERTICAL";
    row.layoutMode = "HORIZONTAL";
    // Duplicated Cells and Rows
    var firstRow;
    if (usingLocalComponent) {
        if (rowTemplate) {
            firstRow = rowTemplate.clone();
        }
        else {
            firstRow = figma.createComponent();
            firstRow.layoutMode = "HORIZONTAL";
            firstRow.counterAxisSizingMode = "AUTO";
            firstRow.layoutAlign = "STRETCH";
        }
        // Remove children (we only need the container)
        removeChildren(firstRow);
        firstRow.setPluginData("isRow", "true");
        firstRow.name = row.name;
        firstRow.layoutMode = "HORIZONTAL";
        firstRow.primaryAxisSizingMode = "FIXED";
        firstRow.layoutAlign = "STRETCH";
        firstRow.counterAxisAlignItems = cellAlignment;
    }
    else {
        firstRow = row;
        firstRow.setPluginData("isRow", "true");
        firstRow.layoutAlign = "STRETCH";
        firstRow.primaryAxisSizingMode = "FIXED";
    }
    var rowHeader;
    if (includeHeader) {
        rowHeader = firstRow.clone();
        rowHeader.layoutAlign = "STRETCH";
        rowHeader.primaryAxisSizingMode = "FIXED";
        for (var i = 0; i < numberColumns; i++) {
            // Duplicate cell for each column and append to row
            var duplicatedCellHeader = cellHeader.createInstance();
            duplicatedCellHeader.setPluginData("isCellHeader", "true");
            duplicatedCellHeader.layoutAlign = cellHeader.layoutAlign;
            duplicatedCellHeader.layoutGrow = cellHeader.layoutGrow;
            duplicatedCellHeader.resizeWithoutConstraints(cellWidth, duplicatedCellHeader.height);
            duplicatedCellHeader.primaryAxisAlignItems = cellAlignment;
            if (duplicatedCellHeader.children.length === 1) {
                duplicatedCellHeader.children[0].primaryAxisAlignItems = cellAlignment;
            }
            rowHeader.appendChild(duplicatedCellHeader);
        }
        table.appendChild(rowHeader);
    }
    for (var i = 0; i < numberColumns; i++) {
        var duplicatedCell = cell.createInstance();
        duplicatedCell.setPluginData("isCell", "true");
        // Bug: layoutAlign is not inherited when creating an instance
        duplicatedCell.layoutAlign = cell.layoutAlign;
        duplicatedCell.layoutGrow = cell.layoutGrow;
        duplicatedCell.primaryAxisSizingMode = "FIXED";
        duplicatedCell.primaryAxisAlignItems = cellAlignment;
        duplicatedCell.resizeWithoutConstraints(cellWidth, duplicatedCell.height);
        if (duplicatedCell.children.length === 1) {
            duplicatedCell.children[0].primaryAxisAlignItems = cellAlignment;
        }
        firstRow.appendChild(duplicatedCell);
    }
    // Duplicate row for each row and append to table
    // Easier to append cloned row and then duplicate, than remove later, hence numberRows - 1
    if (!usingLocalComponent || !includeHeader) {
        table.appendChild(firstRow);
    }
    for (let i = 0; i < numberRows - 1; i++) {
        var duplicatedRow;
        if (usingLocalComponent) {
            if (includeHeader) {
                duplicatedRow = rowHeader.createInstance();
                duplicatedRow.layoutAlign = "STRETCH";
                duplicatedRow.primaryAxisSizingMode = "FIXED";
                // duplicatedRow.setPluginData("isRowInstance", "true")
                for (let b = 0; b < duplicatedRow.children.length; b++) {
                    // Save original layout align of component before it gets swapped
                    duplicatedRow.children[b].mainComponent = cell;
                    // duplicatedRow.children[b].primaryAxisSizingMode = "FIXED"
                    duplicatedRow.children[b].setPluginData("isCell", "true"); // Check
                    // When main component is changed set back to what original component was
                    duplicatedRow.children[b].layoutAlign = cell.layoutAlign;
                    duplicatedRow.children[b].primaryAxisSizingMode = "FIXED";
                    duplicatedRow.children[b].primaryAxisAlignItems = cellAlignment;
                    if (duplicatedRow.children[b].children.length === 1) {
                        duplicatedRow.children[b].children[0].primaryAxisAlignItems = cellAlignment;
                    }
                    // }
                }
                firstRow.remove();
            }
            else {
                duplicatedRow = firstRow.createInstance();
                duplicatedRow.layoutAlign = "STRETCH";
                duplicatedRow.primaryAxisSizingMode = "FIXED";
                // Bug: You need to swap the instances because otherwise figma API calculates the height incorrectly
                for (let b = 0; b < duplicatedRow.children.length; b++) {
                    duplicatedRow.children[b].mainComponent = cell;
                    // duplicatedRow.children[b].primaryAxisSizingMode = "FIXED"
                    duplicatedRow.children[b].setPluginData("isCell", "true"); // Check
                    // When main component is changed set back to what original main component was
                    // duplicatedRow.children[b].layoutAlign = sizing
                    duplicatedRow.children[b].primaryAxisAlignItems = cellAlignment;
                    if (duplicatedRow.children[b].children.length === 1) {
                        duplicatedRow.children[b].children[0].primaryAxisAlignItems = cellAlignment;
                    }
                    // }
                }
            }
        }
        else {
            duplicatedRow = row.clone();
            duplicatedRow.layoutAlign = "STRETCH";
            duplicatedRow.primaryAxisSizingMode = "FIXED";
        }
        table.appendChild(duplicatedRow);
    }
    if (includeHeader || usingLocalComponent) {
        row.remove();
    }
    // Resize table
    var padding = tableTemplate.paddingLeft + tableTemplate.paddingRight + rowTemplate.paddingLeft + rowTemplate.paddingRight + (rowTemplate.itemSpacing * (numberColumns - 1));
    table.resize(cellWidth * numberColumns + padding, table.height);
    table.counterAxisSizingMode = "AUTO";
    // TODO: Needs to be added to components linked by user also
    table.setPluginData("isTable", "true");
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
function updateTables() {
    // Find all tables
    var pages = figma.root.children;
    var tables;
    var tableTemplateID = figma.root.getPluginData("tableComponentID");
    var tableTemplate = findComponentById(tableTemplateID);
    // removeChildren(tableTemplate)
    var rowTemplate = findComponentById(figma.root.getPluginData("rowComponentID"));
    // removeChildren(rowTemplate)
    // If can't find table and row templates use plain frame
    if (!tableTemplate) {
        tableTemplate = figma.createFrame();
    }
    if (!rowTemplate) {
        rowTemplate = figma.createFrame();
    }
    var cellTemplateID = figma.root.getPluginData("cellComponentID");
    var previousCellTemplateID = figma.root.getPluginData("previousCellComponentID");
    var cellTemplate = findComponentById(cellTemplateID);
    var cellHeaderTemplateID = figma.root.getPluginData("cellHeaderComponentID");
    var previousCellHeaderTemplateID = figma.root.getPluginData("previousCellHeaderComponentID");
    var cellHeaderTemplate = findComponentById(cellHeaderTemplateID);
    var discardBucket = figma.createFrame();
    // Look through each page to find tables created with plugin
    for (let i = 0; i < pages.length; i++) {
        tables = pages[i].findAll(node => node.getPluginData("isTable") === "true");
        // Add && node.id !== tableTemplateID ^^ if don't want it to update linked component
        for (let b = 0; b < tables.length; b++) {
            var table = tables[b];
            // Don't apply if an instance
            if (table.type !== "INSTANCE") {
                copyPasteProps(tableTemplate, table, { include: ['name'], exclude: ['layoutMode', 'counterAxisSizingMode', 'primaryAxisSizingMode', 'layoutAlign', 'rotation', 'constrainProportions'] });
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
                                // Bug where plugin data is lost when instance swapped
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
                                // Bug where plugin data is lost when instance swapped
                                cell.setPluginData("instanceBug", "true");
                                cell.setPluginData("isCellHeader", "");
                                cell.setPluginData("isCellHeader", "true");
                                overrideChildrenChars2(newInstance.children, cell.children, newInstance.mainComponent.children, cell.mainComponent.children);
                            }
                        }
                        if (row.getPluginData("isRow") === "true" && row.type !== "INSTANCE") {
                            copyPasteProps(rowTemplate, row, { include: ['name'], exclude: ['layoutMode', 'counterAxisSizingMode', 'primaryAxisSizingMode', 'layoutAlign', 'rotation', 'constrainProportions'] });
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
            var templateID = template + "ComponentID";
            // Make sure old templates don't have any old data on them
            var oldTemplate = findComponentById(figma.root.getPluginData(template + "ComponentID"));
            // Check if a previous template has been set first
            if (oldTemplate) {
                figma.root.setPluginData("previous" + capitalize(template) + "ComponentID", oldTemplate.id);
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
            figma.root.setPluginData(templateID, selection[0].id);
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
if (compareVersion(figma.root.getPluginData("pluginVersion"), "6.3.0") < 0) {
    var tableTemplate = findComponentById(figma.root.getPluginData("tableComponentID"));
    if (tableTemplate) {
        tableTemplate.setRelaunchData({ detachTable: 'Detaches table and rows' });
    }
}
var message = {
    componentsExist: false,
    cellExists: false,
    columnCount: parseInt(figma.root.getPluginData("columnCount"), 10) || 4,
    rowCount: parseInt(figma.root.getPluginData("rowCount"), 10) || 4,
    cellWidth: parseInt(figma.root.getPluginData("cellWidth"), 10) || 100,
    remember: true,
    includeHeader: true,
    columnResizing: true,
    upgradedTables: figma.root.getPluginData("upgradedTables") || null,
    cellAlignment: figma.root.getPluginData("cellAlignment") || "MIN",
    templates: {
        table: {
            name: figma.root.getPluginData("tableComponentName") || "",
            state: figma.root.getPluginData("tableComponentState") || null
        },
        row: {
            name: figma.root.getPluginData("rowComponentName") || "",
            state: figma.root.getPluginData("rowComponentState") || null
        },
        cell: {
            name: figma.root.getPluginData("cellComponentName") || "",
            state: figma.root.getPluginData("cellComponentState") || null
        },
        cellHeader: {
            name: figma.root.getPluginData("cellHeaderComponentName") || "",
            state: figma.root.getPluginData("cellHeaderComponentState") || null
        }
    }
};
if (figma.root.getPluginData("remember") == "true")
    message.remember = true;
if (figma.root.getPluginData("remember") == "false")
    message.remember = false;
if (figma.root.getPluginData("includeHeader") == "true")
    message.includeHeader = true;
if (figma.root.getPluginData("includeHeader") == "false")
    message.includeHeader = false;
if (figma.root.getPluginData("columnResizing") == "true")
    message.columnResizing = true;
if (figma.root.getPluginData("columnResizing") == "false")
    message.columnResizing = false;
function checkVersion() {
    if (compareVersion(figma.root.getPluginData("pluginVersion"), pkg$1.version) < 0) {
        // TODO: Change to store version on client storage?
        figma.root.setPluginData("pluginVersion", pkg$1.version);
        console.log(figma.root.getPluginData("pluginVersion"));
        throw 'New Version';
    }
}
// Upgrades old tables to use new Auto Layout. Could be assumed that it is no longer needed.
function upgradeTables() {
    // TODO: Add check for header cell DONE
    // TODO: Check for when no cellVariantsName can be identified DONE
    // TODO: Set plugin data so you can check if file has been upgraded to new tables DONE
    // TODO: Investigate if layout properties are supposed to be inherited by instances/variants
    var _a, _b;
    // TODO: make rows in table template fill container DONE
    var tableTemplate = figma.getNodeById(figma.root.getPluginData("tableComponentID"));
    if (tableTemplate) {
        for (let i = 0; i < tableTemplate.children.length; i++) {
            var node = tableTemplate.children[i];
            if (node.getPluginData("isRow")) {
                node.layoutAlign = "STRETCH";
                node.primaryAxisSizingMode = "FIXED";
            }
        }
    }
    // Find cell templates
    var cellTemplate = figma.getNodeById(figma.root.getPluginData("cellComponentID"));
    var cellHeaderTemplate = figma.getNodeById(figma.root.getPluginData("cellHeaderComponentID"));
    var x = cellTemplate.x;
    var y = cellTemplate.y;
    var height = cellTemplate.height;
    var array = cellTemplate.name.split("/");
    var cellName;
    var cellVariantsName;
    if (array.length > 1) {
        cellName = array.pop();
        cellVariantsName = array.join("/");
    }
    else {
        if (cellTemplate.name === "Cell" || cellTemplate.name === "cell") {
            cellName = "Default";
        }
        else {
            cellName = cellTemplate.name;
        }
        cellVariantsName = "Table/Cell";
    }
    var nodes = [];
    if (cellTemplate) {
        nodes.push(cellTemplate);
    }
    var cellHeaderName = "";
    if (cellHeaderTemplate) {
        cellHeaderName = cellHeaderTemplate.name.split("/").pop();
        nodes.push(cellHeaderTemplate);
    }
    var cellVariants = figma.combineAsVariants(nodes, pageNode(cellTemplate));
    cellVariants.x = x;
    cellVariants.y = y;
    cellVariants.layoutMode = "HORIZONTAL";
    cellVariants.itemSpacing = 16;
    cellVariants.resize(cellVariants.width, height);
    cellVariants.name = cellVariantsName;
    cellTemplate.name = "Type=" + cellName;
    if (cellHeaderTemplate) {
        cellHeaderTemplate.name = "Type=" + cellHeaderName;
    }
    var cells = figma.root.findAll(node => node.getPluginData("isCell") === "true");
    var headerCells = figma.root.findAll(node => node.getPluginData("isCellHeader") === "true");
    for (let i = 0; i < cells.length; i++) {
        var cell = cells[i];
        if (((_a = cell.parent) === null || _a === void 0 ? void 0 : _a.type) === "INSTANCE") ;
        else {
            if (cell.parent.getPluginData("isCellHeader") === "true") {
                cell.layoutAlign = "INHERIT";
                cell.primaryAxisSizingMode = "AUTO";
            }
            else {
                cell.layoutAlign = "STRETCH";
                cell.primaryAxisSizingMode = "FIXED";
            }
        }
    }
    for (let i = 0; i < headerCells.length; i++) {
        var cell = headerCells[i];
        if (((_b = cell.parent) === null || _b === void 0 ? void 0 : _b.type) === "INSTANCE") ;
        else {
            cell.layoutAlign = "STRETCH";
            cell.primaryAxisSizingMode = "FIXED";
        }
    }
    figma.notify("Table components upgraded");
    figma.root.setPluginData("upgradedTables", "true");
}
// Takes input like rowCount and columnCount to create table and sets plugin data to root.
function createTable(message, msg) {
    if (findComponentById(figma.root.getPluginData("cellComponentID"))) {
        message.componentsExist = true;
        message.upgradedTables = figma.root.getPluginData("upgradedTables");
        if (msg.columnCount < 51 && msg.rowCount < 51) {
            var table = createNewTable(msg.columnCount, msg.rowCount, msg.cellWidth, msg.includeHeader, msg.columnResizing, msg.cellAlignment);
            if (table) {
                figma.root.setPluginData("columnCount", msg.columnCount.toString());
                figma.root.setPluginData("rowCount", msg.rowCount.toString());
                figma.root.setPluginData("cellWidth", msg.cellWidth.toString());
                figma.root.setPluginData("remember", msg.remember.toString());
                figma.root.setPluginData("includeHeader", msg.includeHeader.toString());
                figma.root.setPluginData("columnResizing", msg.columnResizing.toString());
                figma.root.setPluginData("cellAlignment", msg.cellAlignment);
                if (figma.root.getPluginData("remember")) {
                    message.remember = (figma.root.getPluginData("remember") == "true");
                }
                if (figma.root.getPluginData("includeHeader")) {
                    message.includeHeader = (figma.root.getPluginData("includeHeader") == "true");
                }
                if (figma.root.getPluginData("columnResizing")) {
                    message.includeHeader = (figma.root.getPluginData("columnResizing") == "true");
                }
                if (figma.root.getPluginData("columnCount")) {
                    message.columnCount = parseInt(figma.root.getPluginData("columnCount"), 10);
                }
                if (figma.root.getPluginData("rowCount")) {
                    message.rowCount = parseInt(figma.root.getPluginData("rowCount"), 10);
                }
                if (figma.root.getPluginData("cellWidth")) {
                    message.rowCount = parseInt(figma.root.getPluginData("cellWidth"), 10);
                }
                if (figma.root.getPluginData("cellAlignment")) {
                    message.cellAlignment = figma.root.getPluginData("cellAlignment");
                }
                const nodes = [];
                nodes.push(table);
                positionInCenter(table);
                figma.currentPage.selection = nodes;
                // figma.viewport.scrollAndZoomIntoView(nodes);
                figma.closePlugin();
            }
        }
        else {
            figma.notify("Plugin limited to max of 50 columns and rows");
        }
    }
    else {
        message.componentsExist = false;
        figma.notify("Cannot find Cell component");
    }
}
function createTableCommands(message, msg) {
    if (msg.type === "update-tables") {
        updateTables();
    }
    if (msg.type === "upgrade-tables") {
        upgradeTables();
    }
    if (msg.type === 'create-components') {
        var components = createDefaultComponents();
        figma.root.setRelaunchData({ createTable: 'Create a new table' });
        figma.root.setPluginData("cellComponentID", components.cell.id);
        figma.root.setPluginData("cellHeaderComponentID", components.cellHeader.id);
        figma.root.setPluginData("rowComponentID", components.row.id);
        figma.root.setPluginData("tableComponentID", components.table.id);
        figma.notify('Default components created');
    }
    if (msg.type === 'create-table') {
        createTable(message, msg);
    }
    if (msg.type === "link-component") {
        linkComponent(msg.template, figma.currentPage.selection);
    }
    if (msg.type === "update") {
        if (findComponentById(figma.root.getPluginData("cellComponentID"))) {
            message.componentsExist = true;
            // message.cellWidth = parseInt(figma.root.getPluginData("cellWidth"), 10)
        }
        else {
            message.componentsExist = false;
        }
        figma.ui.postMessage(message);
    }
    if (msg.type === "restore-component") {
        restoreComponent(msg.component);
    }
}
dist((plugin) => {
    console.log(plugin);
    plugin.command('createTable', () => {
        block_1: {
            // figma.root.setRelaunchData({ createTable: 'Create a new table' })
            if (findComponentById(figma.root.getPluginData("cellComponentID"))) {
                message.componentsExist = true;
            }
            try {
                checkVersion();
            }
            catch (e) {
                figma.showUI(__uiFiles__.versionLog);
                figma.ui.resize(268, 504);
                console.error(e);
                figma.ui.onmessage = msg => {
                    if (msg.type === "to-create-table") {
                        figma.showUI(__uiFiles__.main);
                        figma.ui.postMessage(message);
                    }
                    createTableCommands(message, msg);
                };
                break block_1;
                // expected output: "Parameter is not a number!"
            }
            figma.showUI(__uiFiles__.main);
            figma.ui.resize(268, 504);
            message.type = "create-table";
            figma.ui.postMessage(message);
            figma.ui.onmessage = msg => {
                createTableCommands(message, msg);
            };
        }
    });
    plugin.command('linkComponents', () => {
        figma.showUI(__uiFiles__.main);
        figma.ui.resize(268, 486);
        message.type = "settings";
        figma.ui.postMessage(message);
        figma.ui.onmessage = msg => {
            if (msg.type === "link-component") {
                linkComponent(msg.template, figma.currentPage.selection);
            }
            if (msg.type === "update") {
                if (findComponentById(figma.root.getPluginData("cellComponentID"))) {
                    message.componentsExist = true;
                    // message.cellWidth = parseInt(figma.root.getPluginData("cellWidth"), 10)
                }
                else {
                    message.componentsExist = false;
                }
                figma.ui.postMessage(message);
            }
            if (msg.type === "restore-component") {
                restoreComponent(msg.component);
            }
            if (msg.type === "update-tables") {
                updateTables();
            }
            if (msg.type === "upgrade-tables") {
                upgradeTables();
            }
        };
    });
    plugin.command('selectColumn', () => {
        selectColumn();
        figma.closePlugin();
    });
    plugin.command('selectRow', () => {
        selectRow();
        figma.closePlugin();
    });
});
