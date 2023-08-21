<script context="module">
	import Icon from './Icon.svelte'
	const bannerNotifications = {}

	export function getBannerNotification(id = '') {
		console.log('sasas')
		return bannerNotifications[id]
	}
</script>

<script>
	import { onMount, onDestroy, afterUpdate, createEventDispatcher } from 'svelte'
	import { IconButton, Button } from 'svelte-components'
	import { fly, slide } from 'svelte/transition'
	import { elasticOut } from 'svelte/easing'

	function swoop() {
		return {
			duration: 1000,
			easing: elasticOut,
			css: (t, u) => `margin-top: ${u * -48}`,
		}
	}

	const dispatch = createEventDispatcher()

	export let id = ''
	export let type
	// export let show
	export let timeout = 0

	let timeoutId

	let show = true

	function close() {
		const shouldContinue = dispatch('close')
		if (shouldContinue || !timeout) {
			show = false
		}
		clearTimeout(timeoutId)
	}

	function open() {
		show = true
	}

	onMount(() => {
		// open()
		dispatch('open', { height: banner.offsetHeight })

		if (timeout) {
			timeoutId = setTimeout(() => close(), timeout)
		}

		return () => {
			clearTimeout(timeoutId)
		}
	})

	// afterUpdate(() => {
	// 	// console.log('Updated', id)
	// 	clearTimeout(timeoutId)
	// 	if (timeout > 0 && show) {
	// 		// clearTimeout(timeout)
	// 		console.log('show', show)

	// 	}
	// })

	onDestroy(() => {
		dispatch('close')
		delete bannerNotifications[id]
	})

	bannerNotifications[id] = { close }

	let banner

	// FIXME: Slots not working properly
</script>

{#if show}
	<div bind:this={banner} {id} class="host BannerNotification" data-type={type}>
		{#if $$slots.message}
			<div class="content">
				{#if $$slots.icon}
					<slot name="icon" />
				{/if}
				<slot name="message" />
			</div>
		{/if}

		<div class="group">
			{#if $$slots.action}
				<slot name="action" />
			{/if}

			<IconButton
				on:click={() => {
					close()
				}}>
				<Icon icon="cross" />
			</IconButton>
		</div>
	</div>
{/if}

<style>
	/* .host :global(.IconButton) {
	/* background-color: red;
}

.host :global(.IconButton:hover) {
	background-color: var(--figma-color-bg-hover);
} */

	.host :global(.IconButton:hover) {
		background-color: var(--plugin-color-bg-hover);
	}

	.host svg {
		fill: black;
	}

	.host .content {
		padding: 6px 8px;
		display: flex;
		gap: 2px;
		flex-direction: column;
	}

	.host .content > :global(*) {
		margin: 0;
	}

	.group {
		display: flex;
	}

	.host {
		margin: -8px -16px 8px;
		align-items: center;
		display: flex;
		gap: 8px;
		/* position: absolute;
		bottom: 0;
		left: 0;
		right: 0; */
		padding: 8px;
		justify-content: space-between;
		z-index: 200;
	}

	:global(.host > :first-child) {
		margin-top: 0;
	}

	:global(.host > :last-child) {
		margin-bottom: 0;
	}

	[data-type='success'] {
		background-color: var(--figma-color-bg-success);
		color: var(--figma-color-text-onsuccess);
	}
	[data-type='success'] svg path {
		fill: var(--figma-color-icon-onsuccess);
	}

	[data-type='critical'] {
		background-color: var(--figma-color-bg-danger);
		color: var(--figma-color-text-ondanger);
	}

	[data-type='warning'] {
		background-color: var(--figma-color-bg-warning);
		color: var(--figma-color-text-onwarning);
	}

	[data-type='info'] {
		background-color: var(--figma-color-bg-brand-tertiary);
		color: var(--figma-color-text);
	}

	[data-type='warning'] :global(.IconButton:hover),
	[data-type='warning'] :global(.Button:hover) {
		background-color: var(--figma-color-bg-warning-hover);
	}

	[data-type='info'] :global(.IconButton:hover),
	[data-type='info'] :global(.Button:hover) {
		background-color: var(--figma-color-bg-selected-hover);
	}

	[data-type='success'] :global(.IconButton:hover),
	[data-type='success'] :global(.Button:hover) {
		background-color: var(--figma-color-bg-success-hover);
	}
</style>
