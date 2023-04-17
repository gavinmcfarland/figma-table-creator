<script>
	export let string
	export let chars
</script>

<span style="display: grid;">
	<!-- Quick fix for when string not passed intime from server -->
	{#if string}
	<span class="item-text">
		{#if string.length > chars}
		<span class="text-first-part">{string.slice(0, -1 * chars)}</span><span class="text-second-part">{string.slice(string.length - chars)}</span>
		{:else}
		{string}
		{/if}
	</span>
	{/if}
</span>

<style>

.item-text {
		flex-grow: 1;
		overflow: hidden;
		display: flex;
		/* background-color: red; */
		margin: -8px 0 -8px -16px;
		line-height: 32px;
		padding-left: 16px;
	}

	.text-first-part {
		text-overflow: ellipsis;
		flex-grow: 0;
	}

	.text-second-part {
		direction: rtl;
		min-width: 10.4ch;
		flex-grow: 0;
		padding-right: 8px;
		flex-shrink: 0;
	}

	.text-first-part, .text-second-part {
		white-space: nowrap;
		overflow: hidden;
		display: inline-block;
		user-select: none;
	}

</style>
