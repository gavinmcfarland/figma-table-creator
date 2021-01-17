<script>
	//import Global CSS from the svelte boilerplate
	//contains Figma color vars, spacing vars, utility classes and more
	// import { GlobalCSS } from "figma-plugin-ds-svelte";

	import CreateTablePage from "./CreateTablePage";

	// import { Button, Input, SelectMenu } from "figma-plugin-ds-svelte";

	import { onMount } from "svelte";

	onMount(() => {
		const table = document.getElementById("table");
		const remember = document.getElementById("remember");
		const includeHeader = document.getElementById("includeHeader");
		const welcomePage = document.getElementById("welcomePage");
		const createTablePage = document.getElementById("createTablePage");
		const columnResizingInput = document.getElementById(
			"columnResizingInput"
		);

		const doneButton = document.getElementById("doneButton");
		const menu = document.getElementById("menu");

		const cells = table.querySelectorAll("td");

		const columnInput = document.getElementById("columnCount");
		const rowInput = document.getElementById("rowCount");
		const cellWidthInput = document.getElementById("cellWidth");

		window.onmessage = async (event) => {
			const message = event.data.pluginMessage;

			remember.checked = message.remember;
			includeHeader.checked = message.includeHeader;
			columnResizingInput.checked = message.columnResizing;

			var cellAlignments = document.getElementsByName("cellAlignment");

			for (var i = 0; i < cellAlignments.length; i++) {
				if (cellAlignments[i].value === message.cellAlignment)
					cellAlignments[i].checked = true;
			}

			if (message.componentsExist) {
				welcomePage.classList.add("hide");
				createTablePage.classList.add("show");
			} else {
				welcomePage.classList.add("show");
				createTablePage.classList.add("hide");
			}

			if (message.remember) {
				if (message.columnCount) {
					columnInput.value = message.columnCount;
				}

				if (message.rowCount) {
					rowInput.value = message.rowCount;
				}

				if (message.cellWidth) {
					cellWidthInput.value = message.cellWidth;
				}
			} else {
				if (message.columnCount) {
					columnInput.value = 4;
				}

				if (message.rowCount) {
					rowInput.value = 4;
				}

				if (message.cellWidth) {
					cellWidthInput.value = 100;
				}
			}

			for (let b = 0; b < cells.length; b++) {
				cells[b]
					.getElementsByTagName("label")[0]
					.classList.remove("selected");
				if (
					cells[b].cellIndex < columnInput.value &&
					cells[b].parentNode.rowIndex < rowInput.value
				) {
					cells[b]
						.getElementsByTagName("label")[0]
						.classList.add("selected");
				}

				if (
					(rowInput.value > 8 &&
						cells[b].parentNode.rowIndex === 7 &&
						cells[b].cellIndex < columnInput.value) ||
					(columnInput.value > 8 &&
						cells[b].cellIndex === 7 &&
						cells[b].parentNode.rowIndex < rowInput.value)
				) {
					cells[b]
						.getElementsByTagName("label")[0]
						.classList.add("more");
				}
			}

			columnInput.addEventListener("input", function (evt) {
				for (let b = 0; b < cells.length; b++) {
					cells[b]
						.getElementsByTagName("label")[0]
						.classList.remove("selected");
					if (
						cells[b].cellIndex < columnInput.value &&
						cells[b].parentNode.rowIndex < rowInput.value
					) {
						cells[b]
							.getElementsByTagName("label")[0]
							.classList.add("selected");
					}

					if (
						(rowInput.value > 8 &&
							cells[b].parentNode.rowIndex === 7 &&
							cells[b].cellIndex < columnInput.value) ||
						(columnInput.value > 8 &&
							cells[b].cellIndex === 7 &&
							cells[b].parentNode.rowIndex < rowInput.value)
					) {
						cells[b]
							.getElementsByTagName("label")[0]
							.classList.add("more");
					} else {
						cells[b]
							.getElementsByTagName("label")[0]
							.classList.remove("more");
					}
				}
			});

			rowInput.addEventListener("input", function (evt) {
				for (let b = 0; b < cells.length; b++) {
					cells[b]
						.getElementsByTagName("label")[0]
						.classList.remove("selected");
					if (
						cells[b].cellIndex < columnInput.value &&
						cells[b].parentNode.rowIndex < rowInput.value
					) {
						cells[b]
							.getElementsByTagName("label")[0]
							.classList.add("selected");
					}

					if (
						(rowInput.value > 8 &&
							cells[b].parentNode.rowIndex === 7 &&
							cells[b].cellIndex < columnInput.value) ||
						(columnInput.value > 8 &&
							cells[b].cellIndex === 7 &&
							cells[b].parentNode.rowIndex < rowInput.value)
					) {
						cells[b]
							.getElementsByTagName("label")[0]
							.classList.add("more");
					} else {
						cells[b]
							.getElementsByTagName("label")[0]
							.classList.remove("more");
					}
				}
			});

			for (let i = 0; i < cells.length; i++) {
				cells[i].addEventListener("mouseover", function (event) {
					for (let b = 0; b < cells.length; b++) {
						if (
							cells[b].cellIndex <= this.cellIndex &&
							cells[b].parentNode.rowIndex <=
								this.parentNode.rowIndex
						) {
							cells[b]
								.getElementsByTagName("label")[0]
								.classList.add("hover");
						}
					}
				});

				cells[i].addEventListener("mouseout", function (event) {
					for (let b = 0; b < cells.length; b++) {
						if (
							cells[b].cellIndex <= this.cellIndex &&
							cells[b].parentNode.rowIndex <=
								this.parentNode.rowIndex
						) {
							cells[b]
								.getElementsByTagName("label")[0]
								.classList.remove("hover");
						}
					}
				});

				cells[i].addEventListener("click", function () {
					columnInput.value = this.cellIndex + 1;
					rowInput.value = this.parentNode.rowIndex + 1;
					for (let b = 0; b < cells.length; b++) {
						cells[b]
							.getElementsByTagName("label")[0]
							.classList.remove("selected");
						cells[b]
							.getElementsByTagName("label")[0]
							.classList.remove("more");
						if (
							cells[b].cellIndex <= this.cellIndex &&
							cells[b].parentNode.rowIndex <=
								this.parentNode.rowIndex
						) {
							cells[b]
								.getElementsByTagName("label")[0]
								.classList.add("selected");
						}
					}
				});
			}
		};

		document.getElementById("create").onclick = () => {
			const textbox1 = document.getElementById("columnCount");
			const textbox2 = document.getElementById("rowCount");
			const textbox3 = document.getElementById("cellWidth");

			const columnCount = parseInt(textbox1.value, 10);
			const rowCount = parseInt(textbox2.value, 10);
			const cellWidth = parseInt(textbox3.value, 10);
			const remember = document.getElementById("remember").checked;
			const columnResizing = document.getElementById(
				"columnResizingInput"
			).checked;
			const includeHeader = document.getElementById("includeHeader")
				.checked;

			var cellAlignments = document.getElementsByName("cellAlignment");
			var cellAlignment;

			for (var i = 0; i < cellAlignments.length; i++) {
				if (cellAlignments[i].checked)
					cellAlignment = cellAlignments[i].value;
			}

			parent.postMessage(
				{
					pluginMessage: {
						type: "create-table",
						columnCount,
						rowCount,
						remember,
						cellWidth,
						includeHeader,
						columnResizing,
						cellAlignment,
					},
				},
				"*"
			);
		};

		document.getElementById("createComponents").onclick = () => {
			welcomePage.classList.add("hide");
			welcomePage.classList.remove("show");
			createTablePage.classList.add("show");
			parent.postMessage(
				{ pluginMessage: { type: "create-components" } },
				"*"
			);
		};

		// document.getElementById('linkComponents').onclick = () => {
		// 	welcomePage.classList.add("hide")
		// 	welcomePage.classList.remove("show")
		// 	manageComponentsPage.classList.add("show")
		// }

		document.getElementById("optionsButton").onclick = () => {
			menu.classList.toggle("open");
		};

		createTablePage.onclick = (event) => {
			if (
				!document.getElementById("menu").contains(event.target) &&
				!document.getElementById("optionsButton").contains(event.target)
			) {
				menu.classList.remove("open");
			}
		};

		remember.onclick = (event) => {
			menu.classList.remove("open");
		};

		columnResizingInput.onclick = (event) => {
			menu.classList.remove("open");
		};
	});
</script>

<div
	class="page welcomePage type m-xsmall"
	id="welcomePage"
	style="height: 100%"
>
	<div
		style="text-align: center; display: grid; place-items: center; height: calc(100% - 32px); margin-top: -16px"
	>
		<div>
			<span class="table-creator-icon" width="172" height="148" />
			<h2 class="type--small type--bold">Get Started</h2>
			<p class="intro-text">
				This plugin uses components to create tables from. This allows
				you to style and integrate them with your design system. These
				components will be created in a page called<br />
				Table Creator.
			</p>
			<button
				class="button button--primary"
				id="createComponents"
				style="margin: 0 auto; margin-top: 16px;"
				>Create Components</button
			>
		</div>
	</div>
</div>

<div
	class="page createTablePage"
	id="createTablePage"
	style="position: relative;"
>
	<div class="icon-button settings-button">
		<div class="icon icon--ellipses" id="optionsButton" />
		<div class="menu type type--small" style="width: 174px" id="menu">
			<div class="triangle" />
			<div>
				<input type="checkbox" id="columnResizingInput" />
				<label for="columnResizingInput">Column Resizing</label>
			</div>

			<div>
				<input type="checkbox" id="remember" />
				<label for="remember">Remember Settings</label>
			</div>
		</div>
	</div>

	<section class="ml-xxsmall mr-xxsmall mt-xxsmall mb-xxsmall">
		<div class="section-title" style="color: red !important;">Table</div>

		<div class="flex">
			<div class="input" style="display: flex; flex-basis: 50%;">
				<label for="columnCount" class="label" style="width: 68px"
					>Columns</label
				>
				<input
					type="number"
					class="input__field"
					id="columnCount"
					size="4"
					step="1"
					min="1"
					max="50"
					style="width: 104px; margin-left: -68px; padding-left: 68px;"
				/>
			</div>

			<div class="input" style="display: flex; flex-basis: 50%;">
				<label for="rowCount" class="label" style="width: 50px"
					>Rows</label
				>
				<input
					type="number"
					class="input__field"
					id="rowCount"
					size="4"
					step="1"
					min="1"
					max="50"
					style="width: 86px; margin-left: -50px;
		padding-left: 50px;"
				/>
			</div>
		</div>
		<div class="checkbox">
			<input type="checkbox" class="checkbox__box" id="includeHeader" />
			<label for="includeHeader" class="checkbox__label"
				>Include table header</label
			>
		</div>
	</section>

	<section
		class="mt-xxsmall mb-xsmall"
		style="margin-bottom: 0px; margin-left: 17px; margin-right: 17px;"
	>
		<table class="Table flex" id="table">
			<tr>
				<td class="input__radio">
					<input type="radio" id="t1x1" name="selection" />
					<label for="t1x1" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t1x2" name="selection" />
					<label for="t1x2" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t1x3" name="selection" />
					<label for="t1x3" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t1x4" name="selection" />
					<label for="t1x4" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t1x5" name="selection" />
					<label for="t1x5" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t1x6" name="selection" />
					<label for="t1x6" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t1x7" name="selection" />
					<label for="t1x7" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t1x8" name="selection" />
					<label for="t1x8" />
				</td>
			</tr>
			<tr>
				<td class="input__radio">
					<input type="radio" id="t2x1" name="selection" />
					<label for="t2x1" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t2x2" name="selection" />
					<label for="t2x2" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t2x3" name="selection" />
					<label for="t2x3" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t2x4" name="selection" />
					<label for="t2x4" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t2x5" name="selection" />
					<label for="t2x5" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t2x6" name="selection" />
					<label for="t2x6" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t2x7" name="selection" />
					<label for="t2x7" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t1x8" name="selection" />
					<label for="t2x8" />
				</td>
			</tr>
			<tr>
				<td class="input__radio">
					<input type="radio" id="t3x1" name="selection" />
					<label for="t3x1" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t3x2" name="selection" />
					<label for="t3x2" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t3x3" name="selection" />
					<label for="t3x3" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t3x4" name="selection" />
					<label for="t3x4" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t3x5" name="selection" />
					<label for="t3x5" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t3x6" name="selection" />
					<label for="t3x6" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t3x7" name="selection" />
					<label for="t3x7" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t1x8" name="selection" />
					<label for="t3x8" />
				</td>
			</tr>
			<tr>
				<td class="input__radio">
					<input type="radio" id="t4x1" name="selection" />
					<label for="t4x1" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t4x2" name="selection" />
					<label for="41x2" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t4x3" name="selection" />
					<label for="41x3" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t4x4" name="selection" />
					<label for="t4x4" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t4x5" name="selection" />
					<label for="t4x5" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t4x6" name="selection" />
					<label for="t4x6" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t4x7" name="selection" />
					<label for="t4x7" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t4x8" name="selection" />
					<label for="t4x8" />
				</td>
			</tr>
			<tr>
				<td class="input__radio">
					<input type="radio" id="t5x1" name="selection" />
					<label for="t5x1" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t5x2" name="selection" />
					<label for="t5x2" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t5x3" name="selection" />
					<label for="t5x3" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t5x4" name="selection" />
					<label for="t5x4" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t5x5" name="selection" />
					<label for="t5x5" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t5x6" name="selection" />
					<label for="t5x6" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t5x7" name="selection" />
					<label for="t5x7" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t5x8" name="selection" />
					<label for="t5x8" />
				</td>
			</tr>
			<tr>
				<td class="input__radio">
					<input type="radio" id="t6x1" name="selection" />
					<label for="t6x1" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t6x2" name="selection" />
					<label for="t6x2" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t6x3" name="selection" />
					<label for="t6x3" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t6x4" name="selection" />
					<label for="t6x4" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t6x5" name="selection" />
					<label for="t6x5" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t6x6" name="selection" />
					<label for="t6x6" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t6x7" name="selection" />
					<label for="t6x7" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t6x8" name="selection" />
					<label for="t6x8" />
				</td>
			</tr>
			<tr>
				<td class="input__radio">
					<input type="radio" id="t7x1" name="selection" />
					<label for="t7x1" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t7x2" name="selection" />
					<label for="t7x2" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t7x3" name="selection" />
					<label for="t7x3" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t7x4" name="selection" />
					<label for="t7x4" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t7x5" name="selection" />
					<label for="t7x5" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t7x6" name="selection" />
					<label for="t7x6" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t7x7" name="selection" />
					<label for="t7x7" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t7x8" name="selection" />
					<label for="t7x8" />
				</td>
			</tr>

			<tr>
				<td class="input__radio">
					<input type="radio" id="t8x1" name="selection" />
					<label for="t8x1" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t8x2" name="selection" />
					<label for="t8x2" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t8x3" name="selection" />
					<label for="t8x3" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t8x4" name="selection" />
					<label for="t8x4" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t8x5" name="selection" />
					<label for="t8x5" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t8x6" name="selection" />
					<label for="t8x6" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t8x7" name="selection" />
					<label for="t8x7" />
				</td>
				<td class="input__radio">
					<input type="radio" id="t8x8" name="selection" />
					<label for="t8x8" />
				</td>
			</tr>
		</table>
	</section>

	<section class="m-xxsmall" style="margin-top: 2px;">
		<div class="section-title">Cell</div>
		<div class="flex">
			<div class="input" style="display: flex; flex-basis: 50%;">
				<label for="cellWidth" class="label" style="width: 68px"
					>Width</label
				>
				<input
					type="number"
					class="input__field"
					id="cellWidth"
					size="4"
					step="1"
					min="1"
					max="400"
					style="width: 104px; margin-left: -68px; padding-left: 68px;"
				/>
			</div>
			<div class="radio-buttons">
				<div class="radio-button">
					<input
						id="radioButton1"
						type="radio"
						value="MIN"
						name="cellAlignment"
					/>
					<label for="radioButton1" class="icon-button">
						<div class="icon icon--text-align-top" />
					</label>
				</div>
				<div class="radio-button">
					<input
						id="radioButton2"
						type="radio"
						value="CENTER"
						name="cellAlignment"
					/>
					<label for="radioButton2" class="icon-button">
						<div class="icon icon--text-align-middle" />
					</label>
				</div>
				<div class="radio-button">
					<input
						id="radioButton3"
						type="radio"
						value="MAX"
						name="cellAlignment"
					/>
					<label for="radioButton3" class="icon-button">
						<div class="icon icon--text-align-bottom" />
					</label>
				</div>
			</div>
		</div>
	</section>
	<section
		class="p-xxsmall"
		style="display: flex; border-top:1px solid rgba(0, 0, 0, .1); justify-content: flex-end; position: fixed; bottom: 0; width: 100%;"
	>
		<button class="button button--primary" id="create">Create Table</button>
	</section>
</div>

<style>
</style>
