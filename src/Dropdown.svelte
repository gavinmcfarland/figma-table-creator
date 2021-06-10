<script>
	export let icon

	function importTemplate() {

		parent.postMessage(
			{
				pluginMessage: {
					type: "import-template"
				},
			},
			"*"
		)
	}

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

<div class="SelectWrapper">
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
				parentElement.classList.remove("show")
				showModal = false;
			});
	}}>
			{#if icon}<span class="icon" icon={icon} />{/if}<span class="text-bold"><slot name="label" /></span><span class="icon" icon="chevron-down" style="margin-left: var(--margin-75)" />
		</div>
		<div class="menu">
			<slot name="content" />
		</div>
	</div>
	<!-- <span style="margin-left: auto;" class="ButtonIcon icon" icon="plus" on:click={() => importTemplate()}></span> -->
</div>

<style>

</style>
