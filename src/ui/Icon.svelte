<script>
	export let icon
	export let color = 'currentColor'
	export let opacity = 0.8
</script>

{#if icon === 'code'}
	<!-- <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path fill-rule="evenodd" clip-rule="evenodd" d="M2.46088 8.24248L6.35087 4.35348L5.64287 3.64648L1.40087 7.88948L1.04688 8.24248L1.40087 8.59648L5.64287 12.8385L6.34987 12.1315L2.46088 8.24248V8.24248ZM10.3509 3.64648L14.5929 7.88948L14.9469 8.24248L14.5929 8.59648L10.3499 12.8385L9.64287 12.1315L13.5329 8.24248L9.64287 4.35348L10.3499 3.64648H10.3509Z" fill="{color}"/>
	</svg> -->
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M6.20313 5.12695L2.20312 8.01317L6.20313 10.6589" stroke="currentColor" stroke-opacity={opacity} stroke-linejoin="bevel" />
		<path d="M9.79687 5.12695L13.7969 8.01317L9.79687 10.6589" stroke="currentColor" stroke-opacity={opacity} stroke-linejoin="bevel" />
		<path d="M10.7422 3.21289L5.26019 12.6149" stroke="currentColor" stroke-opacity="0.7" stroke-linejoin="bevel" />
	</svg>
{/if}

{#if icon === 'star'}
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M14.2368 10.0591L12.5322 5.88821L11.9904 4.56252L11.4526 5.88982L9.76316 10.0591H5.29381H3.5L4.98921 11.0591L8.75686 13.5891L7.28415 17.8413L6.73132 19.4375L8.12181 18.4783L11.9904 15.8095L15.8591 18.4783L17.2496 19.4375L16.6967 17.8413L15.224 13.5891L19.0054 11.0591L20.5 10.0591H18.7017H14.2368ZM17.2071 11.0591H14.2368H13.5652L13.3112 10.4374L11.9944 7.21551L10.69 10.4347L10.4369 11.0591H9.76316H6.78302L9.31433 12.7589L9.95392 13.1884L9.70179 13.9164L8.67465 16.8821L11.4226 14.9864L11.9904 14.5947L12.5583 14.9864L15.3062 16.8821L14.2791 13.9164L14.0265 13.1871L14.668 12.758L17.2071 11.0591Z"
			fill={color}
			fill-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'star-filled'}
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M11.9904 4.56252L14.2368 10.0591H20.5L15.224 13.5891L17.2496 19.4375L11.9904 15.8095L6.73132 19.4375L8.75686 13.5891L3.5 10.0591H9.76316L11.9904 4.56252Z"
			fill={color}
			fill-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'frame'}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M6 2.5V3V5H10V3V2.5H11V3V5H13H13.5V6H13H11L11 10H13H13.5V11H13H11V13V13.5H10V13V11H6V13V13.5H5V13V11H3H2.5V10H3H5L5 6H3H2.5V5H3H5V3V2.5H6ZM10 10V6H6L6 10H10Z"
			fill={color}
			fill-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'node'}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M12 4H4V12H12V4ZM4 3C3.44772 3 3 3.44772 3 4V12C3 12.5523 3.44772 13 4 13H12C12.5523 13 13 12.5523 13 12V4C13 3.44772 12.5523 3 12 3H4Z"
			fill={color}
			fill-opacity={opacity} />
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M8 7C7.448 7 7 7.448 7 8C7 8.552 7.448 9 8 9C8.552 9 9 8.552 9 8C9 7.448 8.552 7 8 7Z"
			fill={color}
			fill-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'component'}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M5.74254 4.74795L7.99981 2.5L10.2571 4.74795L7.99981 6.9959L5.74254 4.74795ZM4.74795 10.2571L2.5 7.9998L4.74795 5.74253L6.9959 7.9998L4.74795 10.2571ZM10.2571 11.2517L7.9998 13.4996L5.74253 11.2517L7.9998 9.00371L10.2571 11.2517ZM13.4996 7.99981L11.2517 5.74254L9.00371 7.99981L11.2517 10.2571L13.4996 7.99981Z"
			fill={color}
			fill-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'number'}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M5.00759 11.1143C4.49814 11.1143 4.06421 10.9756 3.70579 10.6984C3.34737 10.4189 3.07348 10.0142 2.88413 9.48449C2.69477 8.95249 2.6001 8.31004 2.6001 7.55714C2.6001 6.80874 2.69477 6.16967 2.88413 5.63994C3.07574 5.10794 3.35075 4.70219 3.70917 4.42266C4.06984 4.14089 4.50265 4 5.00759 4C5.51253 4 5.94421 4.14089 6.30263 4.42266C6.66331 4.70219 6.93832 5.10794 7.12767 5.63994C7.31928 6.16967 7.41508 6.80874 7.41508 7.55714C7.41508 8.31004 7.32041 8.95249 7.13105 9.48449C6.9417 10.0142 6.66781 10.4189 6.3094 10.6984C5.95098 10.9756 5.51704 11.1143 5.00759 11.1143ZM5.00759 10.3704C5.51253 10.3704 5.90476 10.1269 6.18429 9.64003C6.46381 9.15312 6.60357 8.45882 6.60357 7.55714C6.60357 6.95752 6.53932 6.44694 6.41083 6.0254C6.2846 5.60387 6.10201 5.28264 5.86306 5.06173C5.62637 4.84082 5.34121 4.73036 5.00759 4.73036C4.50716 4.73036 4.11605 4.9772 3.83428 5.47087C3.5525 5.96229 3.41161 6.65771 3.41161 7.55714C3.41161 8.15676 3.47473 8.66621 3.60097 9.08549C3.7272 9.50477 3.90866 9.82374 4.14536 10.0424C4.3843 10.2611 4.67171 10.3704 5.00759 10.3704Z"
			fill={color}
			fill-opacity={opacity} />
		<path
			d="M9.38696 11.9718L12.4842 5.84486V5.79076H8.91357V5.04688H13.3499V5.83134L10.2661 11.9718H9.38696Z"
			fill={color}
			fill-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'square'}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fill-rule="evenodd" clip-rule="evenodd" d="M13 3H3V13H13V3ZM3 2H2V3V13V14H3H13H14V13V3V2H13H3Z" fill={color} fill-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'play'}
	<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M12 10.0977L12.765 10.5758L20.765 15.5758L21.4434 15.9998L20.765 16.4238L12.765 21.4238L12 21.9019V20.9998V10.9998V10.0977ZM13 11.9019V20.0977L19.5566 15.9998L13 11.9019Z"
			fill={color}
			fill-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'sidepanel'}
	<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
		<line x1="17.5" y1="11" x2="17.5" y2="21" stroke={color} stroke-opacity={opacity} />
		<rect x="9.5" y="10.5" width="13" height="11" rx="0.5" stroke={color} stroke-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'sidepanel-go-left'}
	<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M14.5 13.5713H16V18.4284H14.5L14.5 13.5713ZM13.5 13.5713H10V18.4284L13.5 18.4284L13.5 13.5713ZM9 13.5713C9 13.019 9.44772 12.5713 10 12.5713H16C16.5523 12.5713 17 13.019 17 13.5713V18.4284C17 18.9807 16.5523 19.4284 16 19.4284H10C9.44772 19.4284 9 18.9807 9 18.4284V13.5713Z"
			fill={color}
			fill-opacity={opacity} />
		<path d="M20.3333 16L23 18L23 14L20.3333 16Z" fill={color} fill-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'sidepanel-go-right'}
	<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M14.5 13.5713H16V18.4284H14.5L14.5 13.5713ZM13.5 13.5713H10V18.4284L13.5 18.4284L13.5 13.5713ZM9 13.5713C9 13.019 9.44772 12.5713 10 12.5713H16C16.5523 12.5713 17 13.019 17 13.5713V18.4284C17 18.9807 16.5523 19.4284 16 19.4284H10C9.44772 19.4284 9 18.9807 9 18.4284V13.5713Z"
			fill={color}
			fill-opacity={opacity} />
		<path d="M23.6667 16L21 18L21 14L23.6667 16Z" fill={color} fill-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'editor-figma'}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect width="16" height="16" rx="3" fill="#0D99FF" />
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M8.52363 5.97256L8.51216 5.96929L5.9425 5.23662L7.87752 7.17164C7.91936 7.16527 7.9622 7.16196 8.00581 7.16196C8.47253 7.16196 8.85088 7.54031 8.85088 8.00703C8.85088 8.47375 8.47253 8.8521 8.00581 8.8521C7.53909 8.8521 7.16074 8.47375 7.16074 8.00703C7.16074 7.96342 7.16404 7.92058 7.17042 7.87874L5.2413 5.94963L5.93221 8.35975L5.9427 8.39634L5.95038 8.43361C6.14698 9.38821 6.99373 10.1056 8.00578 10.1056C8.23733 10.1056 8.45821 10.0685 8.66395 10.0006L9.24882 9.80768L9.68432 10.2432L10.416 10.9749L10.9936 10.3972L10.2517 9.65532L9.82127 9.22486L10.006 8.64479C10.0696 8.44492 10.1044 8.23099 10.1044 8.00704C10.1044 7.03201 9.43851 6.20998 8.53517 5.97555L8.52363 5.97256ZM11.7008 9.69013L12.4079 10.3972L11.7008 11.1043L11.1231 11.682L10.416 12.3891L9.70891 11.682L8.97721 10.9503C8.67166 11.0511 8.34509 11.1056 8.00578 11.1056C6.50974 11.1056 5.26133 10.0454 4.97093 8.63532L3.82341 4.63241L3.49878 3.5L4.63166 3.82301L8.78636 5.00762C10.1198 5.35365 11.1044 6.56536 11.1044 8.00704C11.1044 8.33517 11.0534 8.6514 10.9588 8.94822L11.7008 9.69013Z"
			fill="white" />
	</svg>
{/if}

{#if icon === 'editor-figjam'}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect width="16" height="16" rx="3" fill="#9747FF" />
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M10.5271 11.1831C10.7832 11.4392 11.1983 11.4392 11.4544 11.1831C11.7105 10.9271 11.7105 10.5119 11.4544 10.2559L7.41093 6.21241L6.48368 7.13967L10.5271 11.1831ZM5.77657 6.43256L5.27781 5.9338L5.04599 4.77473L6.20507 5.00654L6.70383 5.50531L5.77657 6.43256ZM4.83354 3.71244L6.69808 4.08534L12.1615 9.54878C12.8081 10.1954 12.8081 11.2437 12.1615 11.8902C11.5149 12.5368 10.4666 12.5368 9.82004 11.8902L4.35661 6.42681L3.9837 4.56228L3.77124 3.49998L4.83354 3.71244Z"
			fill="white" />
	</svg>
{/if}

{#if icon === 'editor-universal'}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g clip-path="url(#clip0_724_17542)">
			<rect width="16" height="16" rx="3" fill="#0D99FF" />
			<path d="M24 -8V24H-8L24 -8Z" fill="#9747FF" />
			<path
				d="M6.22222 8H6C4.89543 8 4 7.10457 4 6C4 4.89543 4.89543 4 6 4C7.10457 4 8 4.89543 8 6V8V10C8 11.1046 8.89543 12 10 12C11.1046 12 12 11.1046 12 10C12 8.89543 11.1046 8 10 8H9.77778"
				stroke="white" />
		</g>
		<defs>
			<clipPath id="clip0_724_17542">
				<rect width="16" height="16" rx="3" fill="white" />
			</clipPath>
		</defs>
	</svg>
{/if}

{#if icon === 'cross'}
	<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M16 15.293L20.6465 10.6465L21.3536 11.3536L16.7071 16.0001L21.3536 20.6465L20.6465 21.3536L16 16.7072L11.3536 21.3536L10.6465 20.6465L15.2929 16.0001L10.6465 11.3537L11.3536 10.6466L16 15.293Z"
			fill={color}
			fill-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'left-chevron'}
	<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M14.0607 16L18.7071 11.3536L18 10.6465L13 15.6464L12.6465 16L13 16.3536L18 21.3535L18.7071 20.6464L14.0607 16Z"
			fill={color}
			fill-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'code-go-left'}
	<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M20.3333 16L23 18L23 14L20.3333 16Z" fill={color} fill-opacity={opacity} />
		<path
			d="M11.5857 13.7021L8.44287 16.0111L11.5857 18.1277"
			stroke={color}
			stroke-width="0.9"
			stroke-linejoin="bevel"
			stroke-opacity={opacity} />
		<path
			d="M14.4143 13.7021L17.5571 16.0111L14.4143 18.1277"
			stroke={color}
			stroke-width="0.9"
			stroke-linejoin="bevel"
			stroke-opacity={opacity} />
		<path d="M15.1536 12.1702L10.8463 19.6918" stroke={color} stroke-width="0.9" stroke-linejoin="bevel" stroke-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'code-go-right'}
	<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M23.6667 16L21 18L21 14L23.6667 16Z" fill={color} fill-opacity={opacity} />
		<path
			d="M11.5857 13.7021L8.44287 16.0111L11.5857 18.1277"
			stroke={color}
			stroke-width="0.9"
			stroke-linejoin="bevel"
			stroke-opacity={opacity} />
		<path
			d="M14.4143 13.7021L17.5571 16.0111L14.4143 18.1277"
			stroke={color}
			stroke-width="0.9"
			stroke-linejoin="bevel"
			stroke-opacity={opacity} />
		<path d="M15.1536 12.1702L10.8463 19.6918" stroke="black" stroke-width="0.9" stroke-linejoin="bevel" stroke-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'text-go-left'}
	<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M20.3333 16L23 18L23 14L20.3333 16Z" fill={color} fill-opacity={opacity} />
		<line x1="9" y1="13" x2="17" y2="13" stroke={color} stroke-opacity={opacity} />
		<line x1="9" y1="16" x2="17" y2="16" stroke={color} stroke-opacity={opacity} />
		<line x1="9" y1="19" x2="17" y2="19" stroke={color} stroke-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'text-go-right'}
	<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M23.6667 16L21 18L21 14L23.6667 16Z" fill={color} fill-opacity={opacity} />
		<line x1="9" y1="13" x2="17" y2="13" stroke={color} stroke-opacity={opacity} />
		<line x1="9" y1="16" x2="17" y2="16" stroke={color} stroke-opacity={opacity} />
		<line x1="9" y1="19" x2="17" y2="19" stroke={color} stroke-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'small-star'}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M7.98663 2.34766L8.91626 4.62234L9.45503 5.94063H10.994H14.2869L11.55 7.77176L10.3293 8.58847L10.7917 9.92338L11.7901 12.8061L9.27891 11.0738L7.99058 10.185L6.70226 11.0738L4.19109 12.8061L5.18949 9.92338L5.65225 8.58721L4.43648 7.77082L1.71094 5.94063H4.99395H6.53071L7.06378 4.6251L7.98663 2.34766ZM7.20448 6.94063H6.78776H4.99395L6.48316 7.94063L6.84931 8.1865L6.68726 8.65442L6.13442 10.2506L7.52491 9.29143L7.99058 8.97019L8.45625 9.29143L9.84675 10.2506L9.29391 8.65442L9.13185 8.1865L9.49933 7.94063L10.994 6.94063H9.19565H8.78343L8.53238 6.32634L7.99058 5.00065L7.45274 6.32795L7.20448 6.94063Z"
			fill={color}
			fill-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'small-star-filled'}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M7.98663 2.34766L9.45503 5.94063H14.2869L10.3293 8.58847L11.7901 12.8061L7.99058 10.185L4.19109 12.8061L5.65225 8.58721L1.71094 5.94063H6.53071L7.98663 2.34766Z"
			fill={color}
			fill-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'small-globe'}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M5.92695 8.5C5.98052 9.79492 6.23995 10.9445 6.62557 11.7576C5.24377 11.252 4.21875 10.006 4.03095 8.5H5.92695ZM6.92788 8.5C6.97621 9.57037 7.17673 10.4952 7.44994 11.1509C7.60831 11.531 7.77144 11.7733 7.90146 11.9053C7.94585 11.9503 7.97869 11.9754 8 11.9891C8.02131 11.9754 8.05415 11.9503 8.09854 11.9053C8.22856 11.7733 8.39169 11.531 8.55006 11.1509C8.82327 10.4952 9.02379 9.57037 9.07212 8.5H6.92788ZM9.07212 7.5H6.92788C6.97621 6.42963 7.17673 5.50477 7.44994 4.84908C7.60831 4.469 7.77144 4.2267 7.90146 4.09471C7.94585 4.04965 7.97869 4.02455 8 4.01095C8.02131 4.02455 8.05415 4.04965 8.09854 4.09471C8.22856 4.2267 8.39169 4.469 8.55006 4.84908C8.82327 5.50477 9.02379 6.42963 9.07212 7.5ZM10.073 8.5C10.0195 9.79492 9.76005 10.9445 9.37443 11.7576C10.7562 11.252 11.7813 10.006 11.9691 8.5H10.073ZM11.9691 7.5H10.073C10.0195 6.20508 9.76006 5.05549 9.37443 4.24239C10.7562 4.74795 11.7813 5.99397 11.9691 7.5ZM5.92695 7.5H4.03095C4.21875 5.99397 5.24377 4.74795 6.62557 4.24239C6.23994 5.05549 5.98052 6.20508 5.92695 7.5ZM13 8C13 5.23858 10.7614 3 8 3C5.23858 3 3 5.23858 3 8C3 10.7614 5.23858 13 8 13C10.7614 13 13 10.7614 13 8Z"
			fill={color}
			fill-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'info-square'}
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M17 6.06445H7C6.44772 6.06445 6 6.51217 6 7.06445V17.0645C6 17.6167 6.44772 18.0645 7 18.0645H17C17.5523 18.0645 18 17.6167 18 17.0645V7.06445C18 6.51217 17.5523 6.06445 17 6.06445ZM7 5.06445C5.89543 5.06445 5 5.95988 5 7.06445V17.0645C5 18.169 5.89543 19.0645 7 19.0645H17C18.1046 19.0645 19 18.169 19 17.0645V7.06445C19 5.95988 18.1046 5.06445 17 5.06445H7ZM12.5 15.5684V15.0684V12.0684V11.5684H11.5V12.0684V15.0684V15.5684H12.5ZM11.25 9.06836C11.25 9.48257 11.5858 9.81836 12 9.81836C12.4142 9.81836 12.75 9.48257 12.75 9.06836V8.9998C12.75 8.58559 12.4142 8.2498 12 8.2498C11.5858 8.2498 11.25 8.58559 11.25 8.9998V9.06836Z"
			fill={color}
			fill-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'folder'}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M3 4H8V5H3V4ZM2 5V4V3H3H8H9V4V5H13H14V6V12V13H13H3H2V12V6V5ZM9 6H8H3V12H13V6H9Z"
			fill={color}
			fill-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'file-play'}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M2 2C2 1.17157 2.67157 0.5 3.5 0.5H9.5C9.63261 0.5 9.75979 0.552678 9.85355 0.646447L13.8536 4.64645C13.9473 4.74021 14 4.86739 14 5V14C14 14.8284 13.3284 15.5 12.5 15.5H3.5C2.67157 15.5 2 14.8284 2 14V2ZM3.5 1.5C3.22386 1.5 3 1.72386 3 2V14C3 14.2761 3.22386 14.5 3.5 14.5H12.5C12.7761 14.5 13 14.2761 13 14V5.5H9.5H9V5V1.5H3.5ZM10 2.20711L12.2929 4.5H10V2.20711Z"
			fill={color}
			fill-opacity={opacity} />
		<path d="M10.5 8.5L6.75 10.6651L6.75 6.33494L10.5 8.5Z" fill={color} fill-opacity={opacity} />
	</svg>
{/if}

{#if icon === 'plus-boxed'}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M3 1C1.89543 1 1 1.89543 1 3V13C1 14.1046 1.89543 15 3 15H13C14.1046 15 15 14.1046 15 13V3C15 1.89543 14.1046 1 13 1H3ZM7.5 4V7.5H4V8.5H7.5V12H8.5V8.5H12V7.5H8.5V4H7.5Z"
			fill={color}
			fill-opacity={opacity} />
	</svg>

	<!-- <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M2 0C0.895431 0 0 0.895431 0 2V10C0 11.1046 0.895431 12 2 12H10C11.1046 12 12 11.1046 12 10V2C12 0.895431 11.1046 0 10 0H2ZM5.5 3V5.5H3V6.5H5.5V9H6.5V6.5H9V5.5H6.5V3H5.5Z"
			fill={color}
			fill-opacity={opacity} />
	</svg> -->
{/if}
