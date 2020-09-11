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
function changeText(node) {
    return __awaiter(this, void 0, void 0, function* () {
        yield figma.loadFontAsync({ family: "Roboto", style: "Regular" });
        node.characters = "text";
    });
}
function createBorder() {
    var frame1 = figma.createComponent();
    var line1 = figma.createLine();
    frame1.resizeWithoutConstraints(0.01, 0.01);
    console.log(line1.resize(1000, 0));
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
    frame1.appendChild(line1);
    return frame1;
}
function createCell(topBorder, leftBorder) {
    var cell = figma.createComponent();
    var frame1 = figma.createFrame();
    var frame2 = figma.createFrame();
    var line1 = topBorder;
    var line2 = leftBorder;
    var text = figma.createText();
    frame2.name = "Content";
    text.layoutAlign = "STRETCH";
    changeText(text);
    cell.name = "Cell";
    frame2.layoutMode = "VERTICAL";
    frame1.appendChild(line1);
    frame1.appendChild(line2);
    frame1.fills = [];
    frame2.fills = [];
    line1.rotation = -90;
    line2.rotation = 180;
    line2.x = 100;
    line2.constraints = {
        horizontal: "STRETCH",
        vertical: "STRETCH"
    };
    frame1.resizeWithoutConstraints(100, 0.01);
    frame1.clipsContent = false;
    frame1.layoutAlign = "STRETCH";
    frame2.layoutAlign = "STRETCH";
    frame2.horizontalPadding = 8;
    frame2.verticalPadding = 8;
    cell.layoutMode = "VERTICAL";
    cell.appendChild(frame1);
    cell.appendChild(frame2);
    frame2.appendChild(text);
    return cell;
}
function createTable(numberColumns, numberRows) {
    var tableBorder = createBorder();
    var container = figma.createFrame();
    var cell = createCell(tableBorder.createInstance(), tableBorder.createInstance());
    var row = figma.createFrame();
    var frame1 = figma.createFrame();
    var bottomBorder = tableBorder.createInstance();
    var rightBorder = tableBorder.createInstance();
    container.name = "Table";
    row.name = "Row";
    row.fills = [];
    container.fills = [];
    container.layoutMode = "VERTICAL";
    container.counterAxisSizingMode = "AUTO";
    row.counterAxisSizingMode = "AUTO";
    row.layoutMode = "HORIZONTAL";
    row.appendChild(cell.createInstance());
    container.appendChild(row);
    for (var i = 0; i < numberColumns - 1; i++) {
        var duplicatedCell = cell.createInstance();
        row.appendChild(duplicatedCell);
    }
    for (var i = 0; i < numberRows - 1; i++) {
        var duplicatedRow = row.clone();
        container.appendChild(duplicatedRow);
    }
    frame1.clipsContent = false;
    frame1.appendChild(bottomBorder);
    frame1.appendChild(rightBorder);
    frame1.resizeWithoutConstraints(0.01, 0.01);
    frame1.layoutAlign = "STRETCH";
    bottomBorder.constraints = { horizontal: "STRETCH", vertical: "STRETCH" };
    rightBorder.constraints = { horizontal: "MAX", vertical: "STRETCH" };
    rightBorder.rotation = 90;
    container.appendChild(frame1);
    tableBorder.remove();
    cell.remove();
    return container;
}
function addNewNodeToSelection(page, node) {
    page.selection = node;
}
function selectColumn() {
    var _a;
    var selection = figma.currentPage.selection;
    if (selection.length === 1) {
        var newSelection = [];
        var parent = (_a = selection[0].parent) === null || _a === void 0 ? void 0 : _a.parent;
        var children = parent === null || parent === void 0 ? void 0 : parent.children;
        var rowIndex = children.findIndex(x => x.id === selection[0].parent.id);
        var columnIndex = children[rowIndex].children.findIndex(x => x.id === selection[0].id);
        for (var i = 0; i < children.length - 1; i++) {
            newSelection.push(clone(children[i].children[columnIndex]));
        }
        addNewNodeToSelection(figma.currentPage, newSelection);
    }
}
figma.showUI(__html__);
figma.ui.resize(300, 280);
figma.ui.onmessage = msg => {
    if (msg.type === 'create-table') {
        var table = createTable(msg.columnCount, msg.rowCount);
        const nodes = [];
        nodes.push(table);
        figma.currentPage.selection = nodes;
        figma.viewport.scrollAndZoomIntoView(nodes);
    }
    else if (msg.type === 'select-columns') {
        selectColumn();
    }
    figma.closePlugin();
};
