<script>
	import Button from "./Button.svelte"

	function updateTables() {
		parent.postMessage({ pluginMessage: { type: "update-tables" } }, "*")
	}

	function linkComponent(component) {
		console.log("Component linked")
		parent.postMessage({ pluginMessage: { type: "link-template", template: component } }, "*")
	}
</script>

<h class="SectionTitle">Link Components</h>
<p class="type m-xxsmall">
	First select a component on the canvas and then click <span class="icon-link" />
	to link.
</p>

<div>
	<div class="ListItem">
		<p>Cell <span>(required)</span></p>
		<span on:click={() => linkComponent("cell")}><Button>Link</Button></span>
	</div>
	<div class="ListItem">
		<p>Header Cell</p>
		<span on:click={() => linkComponent("cellHeader")}><Button>Link</Button></span>
	</div>
	<div class="ListItem">
		<p>Row</p>
		<span on:click={() => linkComponent("row")}><Button>Link</Button></span>
	</div>
	<div class="ListItem">
		<p>Table</p>
		<span on:click={() => linkComponent("table")}><Button>Link</Button></span>
	</div>
</div>

<h class="SectionTitle">Refresh Tables</h>

<div>
	<p>Updates new styles and any components which have been relinked.</p>
	<span on:click={() => updateTables()}><Button>Refresh</Button></span>
</div>

<style global>
	.ListItem {
		display: flex;
		border-bottom: 1px solid var(--color-black-10);
		padding-bottom: var(--size-100);
		margin-bottom: var(--size-100);
		place-items: center;
	}

	.ListItem p {
		margin: 0;
	}

	.ListItem :first-child {
		flex-grow: 1;
	}
</style>
