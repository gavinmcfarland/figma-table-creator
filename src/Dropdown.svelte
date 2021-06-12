<script>
	export let icon

	function clickOutside(element, callbackFunction) {
		function onClick(event) {
			if (!element.contains(event.target)) {
				callbackFunction(event, element);
			}
		}

		document.body.addEventListener('click', onClick);

		return {
			update(newCallbackFunction) {
				callbackFunction = newCallbackFunction;
			},
			destroy() {
				document.body.removeEventListener('click', onClick);
			}
		}
	}

	let showModal = false;
</script>

<div class="Select" use:clickOutside={(event, element) => {
			console.log('clicked outside');
			if (showModal === true) {
				console.log(element)
				element.classList.remove("show");
				showModal = false;
			}
			}}>
	<div class="label" on:click={(event) => {
		var parentElement = event.currentTarget.parentElement

		if (showModal === false) {
			parentElement.classList.add("show")
			showModal = true;
		} else {
			parentElement.classList.remove("show")
			showModal = false;
		}

		window.addEventListener("blur", () => {
			// parentElement.classList.remove("show")
			showModal = false;
		});
}}>
		{#if icon}<span class="icon" icon={icon} />{/if}<span><slot name="label" /></span><span class="icon" icon="chevron-down" style="margin-left: var(--margin-75)" />
	</div>
	<slot name="content" />


</div>

<style global>

	.Select > .label {
		line-height: 1;
		border: 2px solid transparent;
		place-items: center;
		height: 28px;
		margin-left: calc(
			var(--fgp-gap_item_column, 0px) + (-1 * var(--margin-100))
		);
		margin-right: calc((-1 * var(--margin-100)));
		padding-inline: calc(var(--padding-100) - 2px);
		border-radius: var(--border-radius-25);
		position: relative;
		display: flex; place-items: center;
		min-height: 30px;
	}

	.Select:hover > .label {
		/* padding-top: 1px; */
		border-color: var(--color-black-10);
		border-width: 1px;
		padding-inline: calc(var(--padding-100) - 1px);
	}

	.Select .icon:first-child {
		margin-left: calc((-1 * var(--margin-50)));
		margin-right: var(--margin-25);
	}

	.Select.show > .label {
		border-color: var(--color-black-10);
		border-width: 1px;
		padding-inline: calc(var(--padding-100) - 1px);
	}

	.show > .menu {
		display: block;
	}

	.show > .tooltip {
		display: block;
	}
</style>
