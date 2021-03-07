import { writable } from "svelte/store";

export let valueStore = writable({
	rememberSettings: true,
	columnResizing: true,

	columnCount: 4,
	rowCount: 4,
	includeHeader: true,

	cellWidth: 100,
	cellAlignment: "MIN"
});
