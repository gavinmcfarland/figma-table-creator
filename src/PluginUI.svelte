<script>
	import { valueStore } from "./data.js";
	import { onMount } from "svelte";
	import Field from "./Field.svelte";
	import Checkbox from "./Checkbox.svelte";
	import Matrix from "./Matrix.svelte";

	let data;
	let columns;
	let rows;

	// onMount(() => {
	valueStore.subscribe((value) => {
		columns = value.columns;
		rows = value.rows;
	});
	// });

	async function onLoad(event) {
		data = await event.data.pluginMessage;
	}
</script>

<svelte:window on:message={onLoad} />

<!-- {console.log(data)} -->
{columns}
<Field
	id="columns"
	label="Columns"
	type="number"
	step="1"
	min="1"
	max="50"
	value={columns}
/>
<Field
	id="rows"
	label="Rows"
	type="number"
	step="1"
	min="1"
	max="50"
	value={rows}
/>
<Checkbox id="includeHeader" label="Include table header" value="4" />

<Matrix {columns} {rows} grid={[8, 8]} />

<style global>
	/* Reset */
	button {
		font: inherit;
	}

	table {
		border-spacing: 0;
	}

	td {
		padding: 0;
	}

	* {
		box-sizing: border-box;
		padding: 0;
	}

	body {
		font-family: Inter, sans-serif;
		font-size: 11px;
		line-height: normal;
		padding: 0;
		margin: 0;
	}

	input {
		border: none;
		font: inherit;
	}

	input:focus {
		border: none;
		outline: none;
	}

	/* Hide arrows from input */
	/* Chrome, Safari, Edge, Opera */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	/* Firefox */
	input[type="number"] {
		-moz-appearance: textfield;
	}

	:root {
		--color-blue: #18a0fb;
		--color-black-10: rgba(0, 0, 0, 0.1);
		--color-black-30: rgba(0, 0, 0, 0.3);
		--color-black-80: rgba(0, 0, 0, 0.8);
		--color-black-100: #000;

		--size-0: 0px;
		--size-50: 4px;
		--size-75: 6px;
		--size-100: 8px;
		--size-125: 10px;
		--size-150: 12px;
		--size-175: 14px;
		--size-200: 16px;
		--size-300: 24px;
		--size-400: 32px;
		--size-500: 40px;
		--size-600: 48px;
		--size-800: 64px;
		--size-1000: 80px;

		--border-radius-25: 2px;
		--border-radius-50: 4px;
		--border-radius-75: 6px;
		--border-radius-100: 8px;
		--border-radius-125: 10px;
		--border-radius-200: 16px;
		--border-radius-300: 24px;
		--border-radius-400: 32px;
		--border-radius-500: 40px;
		--border-radius-600: 48px;
		--border-radius-800: 64px;
		--border-radius-1000: 80px;

		--margin-0: var(--size-0);
		--margin-50: var(--size-50);
		--margin-75: var(--size-75);
		--margin-100: var(--size-100);
		--margin-125: var(--size-125);
		--margin-200: var(--size-200);
		--margin-300: var(--size-300);
		--margin-400: var(--size-400);
		--margin-500: var(--size-800);
		--margin-600: var(--size-600);
		--margin-800: var(--size-800);
		--margin-1000: var(--size-1000);

		--padding-0: var(--size-0);
		--padding-50: var(--size-50);
		--padding-75: var(--size-75);
		--padding-100: var(--size-100);
		--padding-200: var(--size-200);
		--padding-300: var(--size-300);
		--padding-400: var(--size-400);
		--padding-500: var(--size-800);
		--padding-600: var(--size-600);
		--padding-800: var(--size-800);
		--padding-1000: var(--size-1000);
	}

	.wrapper {
		padding: var(--padding-200);
	}

	.Button,
	button {
		line-height: 28px;
		padding: var(--padding-0) var(--padding-200);
		border: 2px solid var(--color-blue);
		background-color: var(--color-blue);
		color: white;
		border-radius: var(--border-radius-75);
		font-weight: 500;
		letter-spacing: 0.055px;
	}

	/* Table Radio */

	td {
		padding-right: var(--padding-75);
		padding-bottom: var(--padding-75);
	}

	input[type="radio"] {
		opacity: 0;
		width: 0px;
		height: 0px;
		margin: 0;
		padding: 0;
		position: absolute;
	}

	.SectionTitle {
		font-weight: 600;
		line-height: var(--size-400);
	}
</style>
