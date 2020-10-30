var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function clone(val) {
    return JSON.parse(JSON.stringify(val));
}
function changeText(node, text, weight) {
    return __awaiter(this, void 0, void 0, function* () {
        if (node.fontName === figma.mixed) {
            yield figma.loadFontAsync(node.getRangeFontName(0, 1));
        }
        else {
            yield figma.loadFontAsync({
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
    });
}
function cloneComponentAsFrame(component) {
    if (!component) {
        return false;
    }
    var frame = figma.createFrame();
    if (component.name) {
        frame.name = component.name;
    }
    frame.fills = component.fills;
    frame.strokes = component.strokes;
    frame.strokeWeight = component.strokeWeight;
    frame.strokeStyleId = component.strokeStyleId;
    frame.strokeAlign = component.strokeAlign;
    frame.strokeCap = component.strokeCap;
    frame.strokeJoin = component.strokeJoin;
    frame.strokeMiterLimit = component.strokeMiterLimit;
    frame.topLeftRadius = component.topLeftRadius;
    frame.topRightRadius = component.topRightRadius;
    frame.bottomLeftRadius = component.bottomLeftRadius;
    frame.bottomRightRadius = component.bottomRightRadius;
    frame.layoutMode = component.layoutMode;
    frame.counterAxisSizingMode = component.counterAxisSizingMode;
    frame.effects = clone(component.effects);
    for (let i = 0; i < component.children.length; i++) {
        frame.appendChild(component.children[i].clone());
    }
    return frame;
}
function copyAndPasteStyles(current, node) {
    node.name = current.name;
    node.fills = current.fills;
    node.strokes = current.strokes;
    node.strokeWeight = current.strokeWeight;
    node.strokeStyleId = current.strokeStyleId;
    node.strokeAlign = current.strokeAlign;
    node.strokeCap = current.strokeCap;
    node.strokeJoin = current.strokeJoin;
    node.strokeMiterLimit = current.strokeMiterLimit;
    if (node.type !== "INSTANCE") {
        node.topLeftRadius = current.topLeftRadius;
        node.topRightRadius = current.topRightRadius;
        node.bottomLeftRadius = current.bottomLeftRadius;
        node.bottomRightRadius = current.bottomRightRadius;
    }
    node.dashPattern = current.dashPattern;
    node.clipsContent = current.clipsContent;
    node.effects = clone(current.effects);
    // for (let i = 0; i < current.children.length; i++) {
    // 	node.appendChild(current.children[i].clone())
    // }
}
function removeChildren(node) {
    var length = node.children.length;
    if (length > 0) {
        for (let i = 0; i < length; i++) {
            console.log(node.children[0]);
            node.children[0].remove();
        }
        // node.children[0].remove()
    }
}
function createBorder() {
    var frame1 = figma.createComponent();
    var line1 = figma.createLine();
    // frame1.resizeWithoutConstraints(0.01, 0.01)
    frame1.name = "Table Border";
    line1.constraints = {
        horizontal: "STRETCH",
        vertical: "STRETCH"
    };
    frame1.constraints = {
        horizontal: "STRETCH",
        vertical: "STRETCH"
    };
    frame1.clipsContent = false;
    line1.resizeWithoutConstraints(10000, 0);
    const strokes = clone(line1.strokes);
    strokes[0].color.r = 0.725490196078431;
    strokes[0].color.g = 0.725490196078431;
    strokes[0].color.b = 0.725490196078431;
    line1.strokes = strokes;
    frame1.appendChild(line1);
    return frame1;
}
function createCell(topBorder, leftBorder) {
    var cell = figma.createComponent();
    var frame1 = figma.createFrame();
    var frame2 = figma.createFrame();
    var line1 = topBorder;
    var text = figma.createText();
    frame2.name = "Content";
    changeText(text, "");
    cell.name = "Table/Cell/Default";
    const fills = clone(cell.fills);
    fills[0].opacity = 0.0001;
    fills[0].visible = true;
    cell.fills = fills;
    frame2.layoutMode = "VERTICAL";
    frame1.appendChild(line1);
    frame1.locked = true;
    frame1.fills = [];
    frame2.fills = [];
    line1.rotation = -90;
    line1.y = -5000;
    frame1.resizeWithoutConstraints(100, 0.01);
    frame1.clipsContent = false;
    frame1.layoutAlign = "STRETCH";
    frame2.layoutAlign = "STRETCH";
    frame2.horizontalPadding = 8;
    frame2.verticalPadding = 10;
    cell.layoutMode = "VERTICAL";
    cell.appendChild(frame1);
    cell.appendChild(frame2);
    frame2.appendChild(text);
    return cell;
}
// function createCellHeader() {
// 	var cell = figma.createComponent()
// 	cell.name = "Table/Cell/Header"
// 	return cell
// }
function createRow() {
    var row = figma.createComponent();
    row.name = "Table/Row";
    row.clipsContent = true;
    const paint = {
        r: 0.725490196078431,
        g: 0.725490196078431,
        b: 0.725490196078431,
        a: 1
    };
    var innerShadow = {
        type: "INNER_SHADOW",
        color: paint,
        offset: { x: 0, y: 1 },
        radius: 0,
        visible: true,
        blendMode: "NORMAL"
    };
    row.effects = [innerShadow];
    const fills = clone(row.fills);
    fills[0].opacity = 0.0001;
    fills[0].visible = true;
    row.fills = fills;
    return row;
}
function createTable() {
    var table = figma.createComponent();
    table.name = "Table";
    const strokes = clone(table.strokes);
    const paint = {
        type: "SOLID",
        color: {
            r: 0.725490196078431,
            g: 0.725490196078431,
            b: 0.725490196078431
        }
    };
    strokes[0] = paint;
    table.strokes = strokes;
    table.cornerRadius = 2;
    table.clipsContent = true;
    const fills = clone(table.fills);
    fills[0].visible = true;
    table.fills = fills;
    return table;
}
var components = {};
function createDefaultComponents() {
    var componentSpacing = 200;
    var page = figma.createPage();
    page.name = "Table Creator";
    var introText = figma.createText();
    page.appendChild(introText);
    changeText(introText, "Customise the following components to create bespoke tables. Or to link using your own components go to Plugins > Table Creator > Link Components. You can move and rename the components as you wish. The only component which must exist for the plugin to work is the Cell component.");
    introText.resizeWithoutConstraints(250, 100);
    var border = createBorder();
    page.appendChild(border);
    border.y = componentSpacing;
    var borderText = figma.createText();
    page.appendChild(borderText);
    changeText(borderText, "This is a hack to support table cells with varying content height.");
    borderText.x = 300;
    borderText.y = componentSpacing;
    borderText.resizeWithoutConstraints(250, 100);
    components.cell = createCell(border.createInstance());
    page.appendChild(components.cell);
    components.cell.setPluginData("isCell", "true");
    var cellText = figma.createText();
    page.appendChild(cellText);
    changeText(cellText, "This is the only component required for Table Creator to be able to create tables from. You can cutomise this component, or link the plugin to a different Cell component by running Plugins > Table Creator > Link Components");
    cellText.y = componentSpacing * 2;
    cellText.x = 300;
    cellText.resizeWithoutConstraints(250, 100);
    components.cell.y = componentSpacing * 2;
    components.cellHeader = figma.createComponent();
    components.cellHeader.y = componentSpacing * 3;
    var innerCell = components.cell.createInstance();
    innerCell.layoutAlign = "STRETCH";
    components.cellHeader.appendChild(innerCell);
    components.cellHeader.name = "Table/Cell/Header";
    components.cellHeader.layoutMode = "VERTICAL";
    components.cellHeader.children[0].fills = [];
    components.cellHeader.setPluginData("isCellHeader", "true");
    changeText(components.cellHeader.children[0].children[1].children[0], null, "Bold");
    var cellHeaderText = figma.createText();
    page.appendChild(cellHeaderText);
    changeText(cellHeaderText, "An alternative style for Header Cells");
    cellHeaderText.y = componentSpacing * 3;
    cellHeaderText.x = 300;
    cellHeaderText.resizeWithoutConstraints(250, 100);
    // TODO: Needs to be aplied to user linked templates also
    components.cell.setRelaunchData({ selectColumn: 'Select all cells in column', selectRow: 'Select all cells in row' });
    components.cellHeader.setRelaunchData({ selectColumn: 'Select all cells in column', selectRow: 'Select all cells in row' });
    const fills = clone(components.cellHeader.fills);
    fills[0].opacity = 0.05;
    fills[0].color.r = 0;
    fills[0].color.b = 0;
    fills[0].color.g = 0;
    fills[0].visible = true;
    components.cellHeader.fills = fills;
    page.appendChild(components.cellHeader);
    components.row = createRow();
    components.row.y = componentSpacing * 4;
    components.row.appendChild(components.cell.createInstance());
    components.row.appendChild(components.cell.createInstance());
    components.row.setPluginData("isRow", "true");
    components.row.layoutMode = "HORIZONTAL";
    components.row.counterAxisSizingMode = "AUTO";
    var rowText = figma.createText();
    page.appendChild(rowText);
    changeText(rowText, "Only layer styles such as: background, color, border radius etc will be used for rows when creating tables.");
    rowText.y = componentSpacing * 4;
    rowText.x = 300;
    rowText.resizeWithoutConstraints(250, 100);
    page.appendChild(components.row);
    components.table = createTable();
    components.table.y = componentSpacing * 5;
    var clonedRow = cloneComponentAsFrame(components.row);
    var clonedRow2 = cloneComponentAsFrame(components.row);
    components.table.appendChild(clonedRow);
    components.table.appendChild(clonedRow2);
    components.table.setPluginData("isTable", "true");
    clonedRow.setPluginData("isRow", "true");
    clonedRow2.setPluginData("isRow", "true");
    components.table.layoutMode = "VERTICAL";
    components.table.counterAxisSizingMode = "AUTO";
    var tableText = figma.createText();
    page.appendChild(tableText);
    changeText(tableText, "Only layer styles such as: background, color, border radius etc will be used to create tables. You don't have to create tables using the plugin. You can also create tables by creating an instance of this component and detaching them. If you change the styles used on the table or row components you can update existing tables by going to Plugins > Table Creator > Link Components and select Update all tables");
    tableText.y = componentSpacing * 5;
    tableText.x = 300;
    tableText.resizeWithoutConstraints(250, 100);
    page.appendChild(components.table);
}
var cellID;
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
    if ((node === null || node === void 0 ? void 0 : node.parent) === null) {
        return false;
    }
    else {
        return node;
    }
}
function createNewTable(numberColumns, numberRows, cellWidth, includeHeader, usingLocalComponent, cellAlignment) {
    // Get Cell Template
    var cell = findComponentById(figma.root.getPluginData("cellComponentID"));
    cell.layoutAlign = cellAlignment;
    // Get Header Cell Template
    var cellHeader = findComponentById(figma.root.getPluginData("cellHeaderComponentID"));
    // try {
    if (!cellHeader && includeHeader) {
        // throw "No Header Cell component found";
        figma.notify("No Header Cell component found");
        return;
    }
    // }
    // catch (err) {
    // 	figma.notify("No Header Cell component found")
    // 	console.log(err);
    // }
    // Get Row Template
    var row = cloneComponentAsFrame(findComponentById(figma.root.getPluginData("rowComponentID")));
    if (!row) {
        row = figma.createFrame();
    }
    // Remove children (we only need the container)
    removeChildren(row);
    console.log(row.children);
    // Set autolayout
    row.layoutMode = "HORIZONTAL";
    row.counterAxisSizingMode = "AUTO";
    // Get Table Template
    var table = cloneComponentAsFrame(findComponentById(figma.root.getPluginData("tableComponentID")));
    if (!table) {
        table = figma.createFrame();
    }
    // Remove children (we only need the container)
    removeChildren(table);
    // Set autolayout
    table.layoutMode = "VERTICAL";
    table.counterAxisSizingMode = "AUTO";
    // Duplicated Cells and Rows
    var firstRow;
    if (usingLocalComponent) {
        if (findComponentById(figma.root.getPluginData("rowComponentID"))) {
            firstRow = findComponentById(figma.root.getPluginData("rowComponentID")).clone();
        }
        else {
            firstRow = figma.createComponent();
            firstRow.layoutMode = "HORIZONTAL";
            firstRow.counterAxisSizingMode = "AUTO";
        }
        // Remove children (we only need the container)
        removeChildren(firstRow);
        firstRow.setPluginData("isRow", "true");
        firstRow.name = row.name;
        firstRow.layoutMode = "HORIZONTAL";
        firstRow.counterAxisSizingMode = "AUTO";
        row.remove();
    }
    else {
        firstRow = row;
        firstRow.setPluginData("isRow", "true");
    }
    var rowHeader;
    if (includeHeader) {
        rowHeader = firstRow.clone();
        for (var i = 0; i < numberColumns; i++) {
            // Duplicate cell for each column and append to row
            var duplicatedCellHeader = cellHeader.createInstance();
            duplicatedCellHeader.setPluginData("isCellHeader", "true");
            duplicatedCellHeader.resizeWithoutConstraints(cellWidth, duplicatedCellHeader.height);
            rowHeader.appendChild(duplicatedCellHeader);
        }
        table.appendChild(rowHeader);
    }
    for (var i = 0; i < numberColumns; i++) {
        var duplicatedCell = cell.createInstance();
        duplicatedCell.setPluginData("isCell", "true");
        duplicatedCell.resizeWithoutConstraints(cellWidth, duplicatedCell.height);
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
                // duplicatedRow.setPluginData("isRowInstance", "true")
                for (let b = 0; b < duplicatedRow.children.length; b++) {
                    duplicatedRow.children[b].mainComponent = cell;
                    duplicatedRow.children[b].setPluginData("isCell", "true"); // Check
                }
                firstRow.remove();
            }
            else {
                duplicatedRow = firstRow.createInstance();
                // Bug: You need to swap the instances because otherwise figma API calculates the height incorrectly
                for (let b = 0; b < duplicatedRow.children.length; b++) {
                    duplicatedRow.children[b].mainComponent = cell;
                    duplicatedRow.children[b].setPluginData("isCell", "true"); // Check
                }
            }
        }
        else {
            duplicatedRow = firstRow.clone();
        }
        table.appendChild(duplicatedRow);
    }
    if (includeHeader && !usingLocalComponent) {
        row.remove();
    }
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
function overrideChildrenChars2(sourceChildren, targetChildren) {
    for (let a = 0; a < sourceChildren.length; a++) {
        // If layer has children then run function again
        if (targetChildren[a].children && sourceChildren[a].children) {
            overrideChildrenChars2(sourceChildren[a].children, targetChildren[a].children);
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
                copyAndPasteStyles(tableTemplate, table);
                for (let x = 0; x < table.children.length; x++) {
                    var row = table.children[x];
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
                            cell.resize(width, height);
                            // Bug where plugin data is lost when instance swapped
                            cell.setPluginData("instanceBug", "true");
                            cell.setPluginData("isCell", "");
                            cell.setPluginData("isCell", "true");
                            overrideChildrenChars2(newInstance.children, cell.children);
                        }
                        if (cell.mainComponent.id === previousCellHeaderTemplateID) {
                            overrideChildrenChars(cell.mainComponent.children, cellHeaderTemplate.children, cell.children, newInstance.children);
                            cell.mainComponent = cellHeaderTemplate;
                            cell.resize(width, height);
                            // Bug where plugin data is lost when instance swapped
                            cell.setPluginData("instanceBug", "true");
                            cell.setPluginData("isCellHeader", "");
                            cell.setPluginData("isCellHeader", "true");
                            overrideChildrenChars2(newInstance.children, cell.children);
                        }
                    }
                    // Due to bug in Figma Plugin API that loses pluginData on children of instance we are going to ignore this rule
                    // if (row.getPluginData("isRow") === "true") {
                    copyAndPasteStyles(rowTemplate, row);
                    // }
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
                    if (cell)
                        ;
                    children[b] && !regex.test(cell.children[b].parent.name);
                    {
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
    if (((_a = figma.currentPage.selection[0].parent) === null || _a === void 0 ? void 0 : _a.parent.layoutMode) === "VERTICAL") {
        selectParallelCells();
    }
    if (((_b = figma.currentPage.selection[0].parent) === null || _b === void 0 ? void 0 : _b.parent.layoutMode) === "HORIZONTAL") {
        selectAdjacentCells();
    }
}
function selectRow() {
    var _a, _b;
    if (((_a = figma.currentPage.selection[0].parent) === null || _a === void 0 ? void 0 : _a.parent.layoutMode) === "HORIZONTAL") {
        selectParallelCells();
    }
    if (((_b = figma.currentPage.selection[0].parent) === null || _b === void 0 ? void 0 : _b.parent.layoutMode) === "VERTICAL") {
        selectAdjacentCells();
    }
}
function linkTemplate(template, selection) {
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
    var component = findComponentById(figma.root.getPluginData(component + "ComponentID"));
    figma.currentPage.appendChild(component);
    positionInCenter(component);
}
function positionInCenter(node) {
    // Position newly created table in center of viewport
    node.x = figma.viewport.center.x - (node.width / 2);
    node.y = figma.viewport.center.y - (node.height / 2);
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
    cellAlignment: figma.root.getPluginData("cellAlignment") || "MIN",
    templates: {
        table: {
            name: figma.root.getPluginData("tableComponentName") || ""
        },
        row: {
            name: figma.root.getPluginData("rowComponentName") || ""
        },
        cell: {
            name: figma.root.getPluginData("cellComponentName") || ""
        },
        cellHeader: {
            name: figma.root.getPluginData("cellHeaderComponentName") || ""
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
if (figma.command === "createTable") {
    if (findComponentById(figma.root.getPluginData("cellComponentID"))) {
        message.componentsExist = true;
    }
    figma.showUI(__uiFiles__.main);
    figma.ui.resize(268, 486);
    figma.ui.postMessage(message);
    figma.ui.onmessage = msg => {
        if (msg.type === "update-tables") {
            updateTables();
        }
        if (msg.type === 'create-components') {
            createDefaultComponents();
            figma.root.setPluginData("cellComponentID", components.cell.id);
            figma.root.setPluginData("cellHeaderComponentID", components.cellHeader.id);
            figma.root.setPluginData("rowComponentID", components.row.id);
            figma.root.setPluginData("tableComponentID", components.table.id);
            figma.notify('Default table components created');
        }
        if (msg.type === 'create-table') {
            if (findComponentById(figma.root.getPluginData("cellComponentID"))) {
                message.componentsExist = true;
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
        if (msg.type === "link-template") {
            linkTemplate(msg.template, figma.currentPage.selection);
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
        if (msg.type === "link-components") {
            figma.showUI(__uiFiles__.components);
            figma.ui.resize(268, 486);
            figma.ui.postMessage(message);
            figma.ui.onmessage = msg => {
                if (msg.type === "link-template") {
                    linkTemplate(msg.template, figma.currentPage.selection);
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
            };
        }
        if (msg.type === "restore-component") {
            restoreComponent(msg.component);
        }
    };
}
if (figma.command === "linkComponents") {
    figma.showUI(__uiFiles__.components);
    figma.ui.resize(268, 486);
    figma.ui.postMessage(message);
    figma.ui.onmessage = msg => {
        if (msg.type === "link-template") {
            linkTemplate(msg.template, figma.currentPage.selection);
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
    };
}
if (figma.command === "selectColumn") {
    selectColumn();
    // console.log(figma.currentPage.selection[0].getPluginData("isCellHeader"))
    figma.closePlugin();
}
if (figma.command === "selectRow") {
    selectRow();
    figma.closePlugin();
}
if (figma.command === "updateTables") {
    if (figma.currentPage.selection[0]) {
        console.log("row", figma.currentPage.selection[0].getPluginData("isRow"));
        console.log("table", figma.currentPage.selection[0].getPluginData("isTable"));
        console.log("cell", figma.currentPage.selection[0].getPluginData("isCell"));
    }
    updateTables();
    figma.closePlugin();
}
figma.root.setRelaunchData({ updateTables: 'Update all tables with changes from templates' });
