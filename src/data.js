import { writable } from "svelte/store";

export let valueStore = writable({
	selectedFile: "",

	pageState: {
		welcomePageActive: false,
		createTablePageActive: true,
		templateSettingsPageActive: false
	},

	rememberSettings: true,
	columnResizing: true,

	columnCount: 4,
	rowCount: 4,
	includeHeader: true,

	cellWidth: 100,
	cellAlignment: "MIN"
});
