import { writable } from "svelte/store";

export let valueStore = writable({
    columns: 4,
    rows: 4
});