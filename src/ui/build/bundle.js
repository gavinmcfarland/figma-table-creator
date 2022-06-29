
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var ui = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function compute_slots(slots) {
        const result = {};
        for (const key in slots) {
            result[key] = true;
        }
        return result;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    let valueStore = writable({
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

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (!css || typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css_248z$8 = ":root{\n\t--fgp-has-polyfil_gap-container: 0px;\n\t--fgp-has-polyfil_gap-item: 0px}div.svelte-qj39gx.svelte-qj39gx{padding-top:2px;padding-bottom:2px}.TextField.svelte-qj39gx.svelte-qj39gx > *{\n\t--fgp-has-polyfil_gap-item: initial}.TextField.svelte-qj39gx.svelte-qj39gx > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.TextField.svelte-qj39gx.svelte-qj39gx{\n\tdisplay:flex;\n\tborder:2px solid transparent;\n\tplace-items:center;\n\theight:28px;\n\tmargin-left:calc(\n\t\t\tvar(--fgp-gap_item_column, 0px) + (-1 * var(--margin-100))\n\t\t);\n\tmargin-right:calc((-1 * var(--margin-100)));\n\tpadding-left:calc(var(--padding-100) - 2px);\n\tpadding-right:calc(var(--padding-100) - 2px);\n\tborder-radius:var(--border-radius-25);\n\t--fgp-has-polyfil_gap-container: initial;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 28px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 28px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(28px - var(--fgp-gap_container_row, 0%)) !important}.TextField.svelte-qj39gx.svelte-qj39gx:hover{border-color:var(--figma-color-border, var(--color-black-10));border-width:1px;padding-left:calc(var(--padding-100) - 1px);padding-right:calc(var(--padding-100) - 1px)}.TextField.svelte-qj39gx.svelte-qj39gx:focus-within{border-color:var(--figma-color-border-selected, var(--color-blue));border-width:2px;padding-left:calc(var(--padding-100) - 2px);padding-right:calc(var(--padding-100) - 2px)}.TextField.svelte-qj39gx span.svelte-qj39gx{color:var(--figma-color-text-tertiary, var(--color-black-30));min-width:32px;text-align:center;margin-left:-8px}.TextField.svelte-qj39gx input.svelte-qj39gx{flex-grow:1;cursor:default}";
    styleInject(css_248z$8);

    /* src/ui/Field.svelte generated by Svelte v3.31.2 */

    function create_fragment$7(ctx) {
    	let div;
    	let label_1;
    	let span;
    	let t0;
    	let t1;
    	let input;
    	let label_1_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			label_1 = element("label");
    			span = element("span");
    			t0 = text(/*label*/ ctx[1]);
    			t1 = space();
    			input = element("input");
    			attr(span, "class", "svelte-qj39gx");
    			attr(input, "id", /*id*/ ctx[3]);
    			attr(input, "type", /*type*/ ctx[4]);
    			input.disabled = /*disabled*/ ctx[2];
    			input.value = /*value*/ ctx[0];
    			attr(input, "min", /*min*/ ctx[5]);
    			attr(input, "max", /*max*/ ctx[6]);
    			attr(input, "step", /*step*/ ctx[7]);
    			attr(input, "class", "svelte-qj39gx");
    			attr(label_1, "class", label_1_class_value = "TextField " + /*classes*/ ctx[8] + " svelte-qj39gx");
    			attr(div, "style", /*style*/ ctx[9]);
    			attr(div, "class", "svelte-qj39gx");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, label_1);
    			append(label_1, span);
    			append(span, t0);
    			append(label_1, t1);
    			append(label_1, input);

    			if (!mounted) {
    				dispose = listen(input, "change", /*handleInput*/ ctx[10]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*label*/ 2) set_data(t0, /*label*/ ctx[1]);

    			if (dirty & /*id*/ 8) {
    				attr(input, "id", /*id*/ ctx[3]);
    			}

    			if (dirty & /*type*/ 16) {
    				attr(input, "type", /*type*/ ctx[4]);
    			}

    			if (dirty & /*disabled*/ 4) {
    				input.disabled = /*disabled*/ ctx[2];
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				input.value = /*value*/ ctx[0];
    			}

    			if (dirty & /*min*/ 32) {
    				attr(input, "min", /*min*/ ctx[5]);
    			}

    			if (dirty & /*max*/ 64) {
    				attr(input, "max", /*max*/ ctx[6]);
    			}

    			if (dirty & /*step*/ 128) {
    				attr(input, "step", /*step*/ ctx[7]);
    			}

    			if (dirty & /*classes*/ 256 && label_1_class_value !== (label_1_class_value = "TextField " + /*classes*/ ctx[8] + " svelte-qj39gx")) {
    				attr(label_1, "class", label_1_class_value);
    			}

    			if (dirty & /*style*/ 512) {
    				attr(div, "style", /*style*/ ctx[9]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { placeholder = "PLACEHOLDER" } = $$props;
    	let { value = "" } = $$props;
    	let { label = "" } = $$props;
    	let { disabled = false } = $$props;
    	let { id } = $$props;
    	let { type } = $$props;
    	let { min } = $$props;
    	let { max } = $$props;
    	let { step } = $$props;
    	let { classes = "" } = $$props;
    	let { style } = $$props;
    	createEventDispatcher();

    	const handleInput = e => {
    		// in here, you can switch on type and implement
    		// whatever behaviour you need
    		$$invalidate(0, value = type.match(/^(number|range)$/)
    		? +e.target.value
    		: e.target.value);

    		//   if (id === "columns") {
    		valueStore.update(data => {
    			data[id] = value;
    			return data;
    		});
    	}; //   }

    	$$self.$$set = $$props => {
    		if ("placeholder" in $$props) $$invalidate(11, placeholder = $$props.placeholder);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ("id" in $$props) $$invalidate(3, id = $$props.id);
    		if ("type" in $$props) $$invalidate(4, type = $$props.type);
    		if ("min" in $$props) $$invalidate(5, min = $$props.min);
    		if ("max" in $$props) $$invalidate(6, max = $$props.max);
    		if ("step" in $$props) $$invalidate(7, step = $$props.step);
    		if ("classes" in $$props) $$invalidate(8, classes = $$props.classes);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    	};

    	return [
    		value,
    		label,
    		disabled,
    		id,
    		type,
    		min,
    		max,
    		step,
    		classes,
    		style,
    		handleInput,
    		placeholder
    	];
    }

    class Field extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			placeholder: 11,
    			value: 0,
    			label: 1,
    			disabled: 2,
    			id: 3,
    			type: 4,
    			min: 5,
    			max: 6,
    			step: 7,
    			classes: 8,
    			style: 9
    		});
    	}
    }

    var css_248z$7 = ":root{\n\t--fgp-has-polyfil_gap-container: 0px;\n\t--fgp-has-polyfil_gap-item: 0px}.Button.svelte-444hdn,button.svelte-444hdn{line-height:24px;padding:var(--padding-0) var(--padding-150);border:2px solid var(--figma-color-bg-brand, var(--color-blue));background-color:var(--figma-color-bg-brand, var(--color-blue));color:white;border-radius:var(--border-radius-75);font-weight:500;letter-spacing:0.055px;overflow:hidden}.Button.svelte-444hdn > *{\n\t--fgp-has-polyfil_gap-item: initial}.Button.svelte-444hdn{border-radius:var(--border-radius-75);display:flex;place-items:center;--fgp-has-polyfil_gap-container: initial}.gap.svelte-444hdn > *{\n\t--fgp-has-polyfil_gap-item: initial}.gap.svelte-444hdn > * > *{\n\t--fgp-gap_item_row: initial;\n\t--fgp-gap_item_column: initial}.gap.svelte-444hdn > *{\n\tpointer-events: all;\n\t--fgp-gap_container_row: initial;\n\t--fgp-gap_item_row: var(--fgp-has-polyfil_gap-item, var(--size-50)) !important;\n\t--fgp-gap_row: var(--fgp-gap_item_row);\n\t--fgp-gap_parent_row: var(--fgp-has-polyfil_gap-item, var(--size-50)) !important;\n\tmargin-top: var(--fgp-gap_row);\n\tpointer-events: all;\n\t--fgp-gap_container_column: initial;\n\t--fgp-gap_item_column: var(--fgp-has-polyfil_gap-item, var(--size-50)) !important;\n\t--fgp-gap_column: var(--fgp-gap_item_column);\n\t--fgp-gap_parent_column: var(--fgp-has-polyfil_gap-item, var(--size-50)) !important;\n\tmargin-left: var(--fgp-gap_column)}.gap.svelte-444hdn{\n\tdisplay:flex;\n\tpadding-top:2px !important;\n\tpadding-bottom:2px !important;\n\tplace-items:center;\n\t--fgp-has-polyfil_gap-container: initial;\n\t--fgp-gap_container_row: var(--fgp-has-polyfil_gap-container, calc(var(--fgp-gap_parent_row, 0px) - var(--size-50))) !important;\n\tpointer-events: none;\n\t--fgp-gap_parent_row: initial;\n\t--fgp-gap_item_row: initial;\n\t--fgp-gap_row: var(--fgp-gap_container_row) !important;\n\tpadding-top: 0.02px;\n\t--fgp-margin-top: calc(var(--fgp-gap_row) + 0px);\n\tmargin-top: var(--fgp-margin-top) !important;\n\t--fgp-gap_container_column: var(--fgp-has-polyfil_gap-container, calc(var(--fgp-gap_parent_column, 0px) - var(--size-50))) !important;\n\tpointer-events: none;\n\t--fgp-gap_parent_column: initial;\n\t--fgp-gap_item_column: initial;\n\t--fgp-gap_column: var(--fgp-gap_container_column) !important;\n\tpadding-top: 0.02px;\n\t--fgp-margin-left: calc(var(--fgp-gap_column) + 0px);\n\tmargin-left: var(--fgp-margin-left) !important}.icon.svelte-444hdn > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.icon.svelte-444hdn > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.icon.svelte-444hdn{\n\tdisplay:inline-block;\n\twidth:24px;\n\theight:24px;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 24px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 24px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(24px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 24px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 24px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(24px - var(--fgp-gap_container_row, 0%)) !important}.secondary.svelte-444hdn{background-color:transparent;color:var(--figma-color-text, black);border:1px solid var(--figma-color-border-strong, white)}";
    styleInject(css_248z$7);

    /* src/ui/Button.svelte generated by Svelte v3.31.2 */

    function create_if_block_1$3(ctx) {
    	let span;

    	return {
    		c() {
    			span = element("span");
    			attr(span, "class", "icon svelte-444hdn");
    			attr(span, "icon", /*icon*/ ctx[2]);
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icon*/ 4) {
    				attr(span, "icon", /*icon*/ ctx[2]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (23:71) {#if iconRight}
    function create_if_block$3(ctx) {
    	let span;

    	return {
    		c() {
    			span = element("span");
    			attr(span, "class", "icon svelte-444hdn");
    			attr(span, "icon", /*iconRight*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*iconRight*/ 8) {
    				attr(span, "icon", /*iconRight*/ ctx[3]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    function create_fragment$6(ctx) {
    	let div1;
    	let button;
    	let div0;
    	let span;
    	let button_class_value;
    	let current;
    	let if_block0 = /*icon*/ ctx[2] && create_if_block_1$3(ctx);
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	let if_block1 = /*iconRight*/ ctx[3] && create_if_block$3(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			button = element("button");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			span = element("span");
    			if (default_slot) default_slot.c();
    			if (if_block1) if_block1.c();
    			attr(div0, "class", "gap svelte-444hdn");
    			attr(button, "id", /*id*/ ctx[0]);
    			attr(button, "class", button_class_value = "Button " + /*classes*/ ctx[1] + " svelte-444hdn");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, button);
    			append(button, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append(div0, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			if (if_block1) if_block1.m(div0, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*icon*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					if_block0.m(div0, span);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}

    			if (/*iconRight*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*id*/ 1) {
    				attr(button, "id", /*id*/ ctx[0]);
    			}

    			if (!current || dirty & /*classes*/ 2 && button_class_value !== (button_class_value = "Button " + /*classes*/ ctx[1] + " svelte-444hdn")) {
    				attr(button, "class", button_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (if_block0) if_block0.d();
    			if (default_slot) default_slot.d(detaching);
    			if (if_block1) if_block1.d();
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { id } = $$props;
    	let { classes = "" } = $$props;
    	let { label = "" } = $$props;
    	let { icon } = $$props;
    	let { iconRight } = $$props;
    	getContext("handleInput");
    	createEventDispatcher();

    	$$self.$$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("classes" in $$props) $$invalidate(1, classes = $$props.classes);
    		if ("label" in $$props) $$invalidate(4, label = $$props.label);
    		if ("icon" in $$props) $$invalidate(2, icon = $$props.icon);
    		if ("iconRight" in $$props) $$invalidate(3, iconRight = $$props.iconRight);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	return [id, classes, icon, iconRight, label, $$scope, slots];
    }

    class Button extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			id: 0,
    			classes: 1,
    			label: 4,
    			icon: 2,
    			iconRight: 3
    		});
    	}
    }

    var css_248z$6 = ":root{\n\t--fgp-has-polyfil_gap-container: 0px;\n\t--fgp-has-polyfil_gap-item: 0px}.Select>.label > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.Select>.label > *{\n\t--fgp-has-polyfil_gap-item: initial}.Select>.label{\n\tline-height:1;\n\tborder:2px solid transparent;\n\tplace-items:center;\n\theight:28px;\n\tmargin-left:calc(\n\t\t\tvar(--fgp-gap_item_column, 0px) + (-1 * var(--margin-100))\n\t\t);\n\tmargin-right:calc((-1 * var(--margin-100)));\n\tpadding-left:calc(var(--padding-100) - 2px);\n\tpadding-right:calc(var(--padding-100) - 2px);\n\tborder-radius:var(--border-radius-25);\n\tposition:relative;\n\tdisplay:flex;\n\tplace-items:center;\n\tmin-height:30px;\n\tcursor:default;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 28px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 28px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(28px - var(--fgp-gap_container_row, 0%)) !important;--fgp-has-polyfil_gap-container: initial}.Select:hover>.label{border-color:var(--figma-color-border, var(--color-black-10));border-width:1px;padding-left:calc(var(--padding-100) - 1px);padding-right:calc(var(--padding-100) - 1px)}.Select>.label>.icon:first-child{margin-left:calc((-1 * var(--margin-50)));margin-right:var(--margin-25)}.Select.show>.label{border-color:var(--figma-color-border, var(--color-black-10));border-width:1px;padding-left:calc(var(--padding-100) - 1px);padding-right:calc(var(--padding-100) - 1px)}.show>.menu{display:block}.Select:not(.fill)>.label{max-width:120px}.Select:not(.fill)>.label>span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.Select.fill{flex-grow:1}.Select.fill>.label{margin-right:0}.Select.fill:hover>.label>[icon=\"chevron-down\"]{margin-left:auto !important}.Select.fill.show>.label>[icon=\"chevron-down\"]{margin-left:auto !important}.show>.tooltip{display:block}";
    styleInject(css_248z$6);

    /* src/ui/Dropdown.svelte generated by Svelte v3.31.2 */
    const get_content_slot_changes = dirty => ({});
    const get_content_slot_context = ctx => ({});
    const get_label_slot_changes = dirty => ({});
    const get_label_slot_context = ctx => ({});
    const get_hitThing_slot_changes = dirty => ({});
    const get_hitThing_slot_context = ctx => ({});

    // (58:1) {#if $$slots.hitThing}
    function create_if_block_2$1(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const hitThing_slot_template = /*#slots*/ ctx[9].hitThing;
    	const hitThing_slot = create_slot(hitThing_slot_template, ctx, /*$$scope*/ ctx[8], get_hitThing_slot_context);

    	return {
    		c() {
    			div = element("div");
    			if (hitThing_slot) hitThing_slot.c();
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (hitThing_slot) {
    				hitThing_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen(div, "click", /*click_handler*/ ctx[10]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (hitThing_slot) {
    				if (hitThing_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(hitThing_slot, hitThing_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_hitThing_slot_changes, get_hitThing_slot_context);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(hitThing_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(hitThing_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (hitThing_slot) hitThing_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (73:1) {#if $$slots.label}
    function create_if_block$2(ctx) {
    	let div;
    	let span0;
    	let span1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*icon*/ ctx[1] && create_if_block_1$2(ctx);
    	const label_slot_template = /*#slots*/ ctx[9].label;
    	const label_slot = create_slot(label_slot_template, ctx, /*$$scope*/ ctx[8], get_label_slot_context);

    	return {
    		c() {
    			div = element("div");
    			if (if_block) if_block.c();
    			span0 = element("span");
    			if (label_slot) label_slot.c();
    			span1 = element("span");
    			attr(span1, "class", "icon");
    			attr(span1, "icon", "chevron-down");
    			set_style(span1, "margin-left", "var(--margin-75)");
    			attr(div, "class", "label");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append(div, span0);

    			if (label_slot) {
    				label_slot.m(span0, null);
    			}

    			append(div, span1);
    			current = true;

    			if (!mounted) {
    				dispose = listen(div, "click", /*click_handler_1*/ ctx[11]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (/*icon*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					if_block.m(div, span0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (label_slot) {
    				if (label_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(label_slot, label_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_label_slot_changes, get_label_slot_context);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(label_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(label_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block) if_block.d();
    			if (label_slot) label_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (87:3) {#if icon}
    function create_if_block_1$2(ctx) {
    	let span;

    	return {
    		c() {
    			span = element("span");
    			attr(span, "class", "icon");
    			attr(span, "icon", /*icon*/ ctx[1]);
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icon*/ 2) {
    				attr(span, "icon", /*icon*/ ctx[1]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    function create_fragment$5(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*$$slots*/ ctx[6].hitThing && create_if_block_2$1(ctx);
    	let if_block1 = /*$$slots*/ ctx[6].label && create_if_block$2(ctx);
    	const content_slot_template = /*#slots*/ ctx[9].content;
    	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[8], get_content_slot_context);

    	return {
    		c() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (content_slot) content_slot.c();
    			attr(div, "style", /*style*/ ctx[2]);
    			attr(div, "class", div_class_value = "Select " + (/*showMenu*/ ctx[0] ? "show" : "") + " " + (/*fill*/ ctx[3] ? "fill" : ""));
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append(div, t1);

    			if (content_slot) {
    				content_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(clickOutside.call(null, div, /*clickOutside_function*/ ctx[12]));
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (/*$$slots*/ ctx[6].hitThing) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*$$slots*/ 64) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*$$slots*/ ctx[6].label) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*$$slots*/ 64) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (content_slot) {
    				if (content_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(content_slot, content_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_content_slot_changes, get_content_slot_context);
    				}
    			}

    			if (!current || dirty & /*style*/ 4) {
    				attr(div, "style", /*style*/ ctx[2]);
    			}

    			if (!current || dirty & /*showMenu, fill*/ 9 && div_class_value !== (div_class_value = "Select " + (/*showMenu*/ ctx[0] ? "show" : "") + " " + (/*fill*/ ctx[3] ? "fill" : ""))) {
    				attr(div, "class", div_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(content_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(content_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (content_slot) content_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    const dropdowns = {};

    function getDropdown(id = "") {
    	return dropdowns[id];
    }

    function clickOutside(element, callbackFunction) {
    	function onClick(event) {
    		if (!element.contains(event.target)) {
    			callbackFunction(event, element);
    		}
    	}

    	document.body.addEventListener("click", onClick);

    	return {
    		update(newCallbackFunction) {
    			callbackFunction = newCallbackFunction;
    		},
    		destroy() {
    			document.body.removeEventListener("click", onClick);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	const $$slots = compute_slots(slots);
    	let { icon } = $$props;
    	let { showMenu = false } = $$props;
    	let { id = "" } = $$props;
    	let { style } = $$props;
    	let { fill } = $$props;

    	function close() {
    		$$invalidate(0, showMenu = false);
    	}

    	function open() {
    		$$invalidate(0, showMenu = true);
    	}

    	dropdowns[id] = { open, close };

    	onDestroy(() => {
    		delete dropdowns[id];
    	});

    	const click_handler = event => {
    		if (showMenu === false) {
    			open();
    		} else {
    			close();
    		}

    		window.addEventListener("blur", () => {
    			// parentElement.classList.remove("show")
    			close();
    		});
    	};

    	const click_handler_1 = event => {
    		if (showMenu === false) {
    			open();
    		} else {
    			close();
    		}

    		window.addEventListener("blur", () => {
    			// parentElement.classList.remove("show")
    			close();
    		});
    	};

    	const clickOutside_function = (event, element) => {
    		close();
    	};

    	$$self.$$set = $$props => {
    		if ("icon" in $$props) $$invalidate(1, icon = $$props.icon);
    		if ("showMenu" in $$props) $$invalidate(0, showMenu = $$props.showMenu);
    		if ("id" in $$props) $$invalidate(7, id = $$props.id);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    		if ("fill" in $$props) $$invalidate(3, fill = $$props.fill);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	return [
    		showMenu,
    		icon,
    		style,
    		fill,
    		close,
    		open,
    		$$slots,
    		id,
    		$$scope,
    		slots,
    		click_handler,
    		click_handler_1,
    		clickOutside_function
    	];
    }

    class Dropdown extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			icon: 1,
    			showMenu: 0,
    			id: 7,
    			style: 2,
    			fill: 3
    		});
    	}
    }

    var css_248z$5 = ":root{\n\t--fgp-has-polyfil_gap-container: 0px;\n\t--fgp-has-polyfil_gap-item: 0px}.Checkbox.svelte-157iyki.svelte-157iyki.svelte-157iyki > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.Checkbox.svelte-157iyki.svelte-157iyki.svelte-157iyki > *{\n\t--fgp-has-polyfil_gap-item: initial}.Checkbox.svelte-157iyki.svelte-157iyki.svelte-157iyki{\n\theight:32px;\n\tdisplay:flex;\n\tplace-items:center;\n\tpadding-top:2px;\n\tpadding-bottom:2px;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 32px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 32px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(32px - var(--fgp-gap_container_row, 0%)) !important;--fgp-has-polyfil_gap-container: initial}input[type=\"checkbox\"].svelte-157iyki.svelte-157iyki.svelte-157iyki > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}input[type=\"checkbox\"].svelte-157iyki.svelte-157iyki.svelte-157iyki > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}input[type=\"checkbox\"].svelte-157iyki.svelte-157iyki.svelte-157iyki{\n\topacity:0;\n\twidth:0px;\n\theight:0px;\n\tmargin:0;\n\tpadding:0;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 0px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 0px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(0px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 0px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 0px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(0px - var(--fgp-gap_container_row, 0%)) !important}input[type=\"checkbox\"].svelte-157iyki+label.svelte-157iyki.svelte-157iyki{vertical-align:middle;margin-top:2px}input[type=\"checkbox\"].svelte-157iyki+label.svelte-157iyki.svelte-157iyki::before{width:var(--size-150);height:var(--size-150);display:inline-block;content:\"\";border-radius:var(--border-radius-25);background-repeat:no-repeat;background-position:1px 2px;border:1px solid var(--figma-color-border-strong, var(--color-black-80));margin-left:2px;margin-right:var(--margin-125);margin-bottom:2px;vertical-align:middle;box-sizing:border-box}.Checkbox.svelte-157iyki:focus-within input[type=\"checkbox\"].svelte-157iyki+label.svelte-157iyki::before{border:1px solid var(--figma-color-brand, var(--color-blue))}input[type=\"checkbox\"].svelte-157iyki:checked+label.svelte-157iyki.svelte-157iyki::before{border-color:var(--figma-color-brand, var(--color-blue));background-color:var(--figma-color-brand, var(--color-blue));background-image:url(data:image/svg+xml;utf8,%3Csvg%20fill%3D%22none%22%20height%3D%227%22%20viewBox%3D%220%200%208%207%22%20width%3D%228%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20clip-rule%3D%22evenodd%22%20d%3D%22m1.17647%201.88236%201.88235%201.88236%203.76471-3.76472%201.17647%201.17648-4.94118%204.9412-3.05882-3.05884z%22%20fill%3D%22%23fff%22%20fill-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E)}";
    styleInject(css_248z$5);

    /* src/ui/Checkbox.svelte generated by Svelte v3.31.2 */

    function create_fragment$4(ctx) {
    	let div;
    	let input;
    	let t0;
    	let label_1;
    	let t1;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label_1 = element("label");
    			t1 = text(/*label*/ ctx[2]);
    			attr(input, "id", /*id*/ ctx[3]);
    			attr(input, "type", "checkbox");
    			attr(input, "class", "svelte-157iyki");
    			attr(label_1, "for", /*id*/ ctx[3]);
    			attr(label_1, "class", "svelte-157iyki");
    			attr(div, "class", div_class_value = "Checkbox " + /*classes*/ ctx[4] + " svelte-157iyki");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, input);
    			input.checked = /*checked*/ ctx[1];
    			set_input_value(input, /*value*/ ctx[0]);
    			append(div, t0);
    			append(div, label_1);
    			append(label_1, t1);

    			if (!mounted) {
    				dispose = [
    					listen(input, "change", /*input_change_handler*/ ctx[12]),
    					listen(input, "change", /*handleInput*/ ctx[5])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*id*/ 8) {
    				attr(input, "id", /*id*/ ctx[3]);
    			}

    			if (dirty & /*checked*/ 2) {
    				input.checked = /*checked*/ ctx[1];
    			}

    			if (dirty & /*value*/ 1) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (dirty & /*label*/ 4) set_data(t1, /*label*/ ctx[2]);

    			if (dirty & /*id*/ 8) {
    				attr(label_1, "for", /*id*/ ctx[3]);
    			}

    			if (dirty & /*classes*/ 16 && div_class_value !== (div_class_value = "Checkbox " + /*classes*/ ctx[4] + " svelte-157iyki")) {
    				attr(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { placeholder = "PLACEHOLDER" } = $$props;
    	let { value = "" } = $$props;
    	let { label = "" } = $$props;
    	let { disabled = false } = $$props;
    	let { id } = $$props;
    	let { type } = $$props;
    	let { min } = $$props;
    	let { max } = $$props;
    	let { step } = $$props;
    	let { classes = "" } = $$props;
    	let { checked } = $$props;

    	function handleInput() {
    		valueStore.update(data => {
    			data[id] = checked;
    			return data;
    		});
    	}

    	function input_change_handler() {
    		checked = this.checked;
    		value = this.value;
    		$$invalidate(1, checked);
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ("placeholder" in $$props) $$invalidate(6, placeholder = $$props.placeholder);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    		if ("disabled" in $$props) $$invalidate(7, disabled = $$props.disabled);
    		if ("id" in $$props) $$invalidate(3, id = $$props.id);
    		if ("type" in $$props) $$invalidate(8, type = $$props.type);
    		if ("min" in $$props) $$invalidate(9, min = $$props.min);
    		if ("max" in $$props) $$invalidate(10, max = $$props.max);
    		if ("step" in $$props) $$invalidate(11, step = $$props.step);
    		if ("classes" in $$props) $$invalidate(4, classes = $$props.classes);
    		if ("checked" in $$props) $$invalidate(1, checked = $$props.checked);
    	};

    	return [
    		value,
    		checked,
    		label,
    		id,
    		classes,
    		handleInput,
    		placeholder,
    		disabled,
    		type,
    		min,
    		max,
    		step,
    		input_change_handler
    	];
    }

    class Checkbox extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			placeholder: 6,
    			value: 0,
    			label: 2,
    			disabled: 7,
    			id: 3,
    			type: 8,
    			min: 9,
    			max: 10,
    			step: 11,
    			classes: 4,
    			checked: 1
    		});
    	}
    }

    var css_248z$4 = ":root{\n\t--fgp-has-polyfil_gap-container: 0px;\n\t--fgp-has-polyfil_gap-item: 0px}.RadioButton.svelte-1prack5 input[type=\"radio\"].svelte-1prack5~label.svelte-1prack5 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.RadioButton.svelte-1prack5 input[type=\"radio\"].svelte-1prack5~label.svelte-1prack5{\n\tborder-radius:2px;\n\tdisplay:block;\n\theight:24px;\n\tmin-width:24px;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 24px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 24px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(24px - var(--fgp-gap_container_row, 0%)) !important}.RadioButton.svelte-1prack5 input.svelte-1prack5.svelte-1prack5{position:absolute;opacity:0;cursor:pointer;height:0;width:0}.RadioButton.svelte-1prack5.svelte-1prack5.svelte-1prack5 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.RadioButton.svelte-1prack5.svelte-1prack5.svelte-1prack5 > *{\n\t--fgp-has-polyfil_gap-item: initial}.RadioButton.svelte-1prack5.svelte-1prack5.svelte-1prack5{\n\theight:28px;\n\tdisplay:flex;\n\tplace-items:center;\n\tflex-grow:1;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 28px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 28px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(28px - var(--fgp-gap_container_row, 0%)) !important;--fgp-has-polyfil_gap-container: initial}.RadioButton.svelte-1prack5 input.svelte-1prack5+label.svelte-1prack5::before > *{\n\t--fgp-height_percentages-decimal: initial}.RadioButton.svelte-1prack5 input.svelte-1prack5+label.svelte-1prack5::before > *{\n\t--fgp-width_percentages-decimal: initial}.RadioButton.svelte-1prack5 input.svelte-1prack5+label.svelte-1prack5::before{\n\tcontent:\"\";\n\theight:100%;\n\tdisplay:block;\n\twidth:100%;\n\tbackground-repeat:no-repeat;\n\tbackground-position:center;\n\t--fgp-height_percentages-decimal: 1 !important;\n\t--fgp-width_percentages-decimal: 1 !important}.RadioButton.svelte-1prack5 input.svelte-1prack5:checked+label.svelte-1prack5{background-color:var(--figma-color-border, var(--color-black-10))}";
    styleInject(css_248z$4);

    /* src/ui/RadioButton.svelte generated by Svelte v3.31.2 */

    function create_fragment$3(ctx) {
    	let div;
    	let input;
    	let t0;
    	let label_1;
    	let t1;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label_1 = element("label");
    			t1 = text(/*label*/ ctx[2]);
    			attr(input, "id", /*id*/ ctx[4]);
    			attr(input, "type", "radio");
    			input.disabled = /*disabled*/ ctx[3];
    			input.__value = /*value*/ ctx[1];
    			input.value = input.__value;
    			input.checked = /*checked*/ ctx[7];
    			attr(input, "name", /*name*/ ctx[6]);
    			attr(input, "class", "svelte-1prack5");
    			/*$$binding_groups*/ ctx[16][0].push(input);
    			attr(label_1, "for", /*id*/ ctx[4]);
    			attr(label_1, "class", "svelte-1prack5");
    			attr(div, "class", div_class_value = "RadioButton " + /*classes*/ ctx[5] + " svelte-1prack5");
    			attr(div, "icon", /*icon*/ ctx[8]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, input);
    			input.checked = input.__value === /*group*/ ctx[0];
    			append(div, t0);
    			append(div, label_1);
    			append(label_1, t1);

    			if (!mounted) {
    				dispose = [
    					listen(input, "change", /*input_change_handler*/ ctx[15]),
    					listen(input, "change", /*handleInput*/ ctx[9])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*id*/ 16) {
    				attr(input, "id", /*id*/ ctx[4]);
    			}

    			if (dirty & /*disabled*/ 8) {
    				input.disabled = /*disabled*/ ctx[3];
    			}

    			if (dirty & /*value*/ 2) {
    				input.__value = /*value*/ ctx[1];
    				input.value = input.__value;
    			}

    			if (dirty & /*checked*/ 128) {
    				input.checked = /*checked*/ ctx[7];
    			}

    			if (dirty & /*name*/ 64) {
    				attr(input, "name", /*name*/ ctx[6]);
    			}

    			if (dirty & /*group*/ 1) {
    				input.checked = input.__value === /*group*/ ctx[0];
    			}

    			if (dirty & /*label*/ 4) set_data(t1, /*label*/ ctx[2]);

    			if (dirty & /*id*/ 16) {
    				attr(label_1, "for", /*id*/ ctx[4]);
    			}

    			if (dirty & /*classes*/ 32 && div_class_value !== (div_class_value = "RadioButton " + /*classes*/ ctx[5] + " svelte-1prack5")) {
    				attr(div, "class", div_class_value);
    			}

    			if (dirty & /*icon*/ 256) {
    				attr(div, "icon", /*icon*/ ctx[8]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			/*$$binding_groups*/ ctx[16][0].splice(/*$$binding_groups*/ ctx[16][0].indexOf(input), 1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { placeholder = "PLACEHOLDER" } = $$props;
    	let { value = "" } = $$props;
    	let { label = "" } = $$props;
    	let { disabled = false } = $$props;
    	let { id } = $$props;
    	let { type } = $$props;
    	let { min } = $$props;
    	let { max } = $$props;
    	let { step } = $$props;
    	let { classes = "" } = $$props;
    	let { name } = $$props;
    	let { checked } = $$props;
    	let { icon } = $$props;
    	let { group = "MIN" } = $$props;

    	function handleInput() {
    		valueStore.update(data => {
    			data[name] = group;
    			return data;
    		});
    	}

    	const $$binding_groups = [[]];

    	function input_change_handler() {
    		group = this.__value;
    		$$invalidate(0, group);
    	}

    	$$self.$$set = $$props => {
    		if ("placeholder" in $$props) $$invalidate(10, placeholder = $$props.placeholder);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    		if ("disabled" in $$props) $$invalidate(3, disabled = $$props.disabled);
    		if ("id" in $$props) $$invalidate(4, id = $$props.id);
    		if ("type" in $$props) $$invalidate(11, type = $$props.type);
    		if ("min" in $$props) $$invalidate(12, min = $$props.min);
    		if ("max" in $$props) $$invalidate(13, max = $$props.max);
    		if ("step" in $$props) $$invalidate(14, step = $$props.step);
    		if ("classes" in $$props) $$invalidate(5, classes = $$props.classes);
    		if ("name" in $$props) $$invalidate(6, name = $$props.name);
    		if ("checked" in $$props) $$invalidate(7, checked = $$props.checked);
    		if ("icon" in $$props) $$invalidate(8, icon = $$props.icon);
    		if ("group" in $$props) $$invalidate(0, group = $$props.group);
    	};

    	return [
    		group,
    		value,
    		label,
    		disabled,
    		id,
    		classes,
    		name,
    		checked,
    		icon,
    		handleInput,
    		placeholder,
    		type,
    		min,
    		max,
    		step,
    		input_change_handler,
    		$$binding_groups
    	];
    }

    class RadioButton extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			placeholder: 10,
    			value: 1,
    			label: 2,
    			disabled: 3,
    			id: 4,
    			type: 11,
    			min: 12,
    			max: 13,
    			step: 14,
    			classes: 5,
    			name: 6,
    			checked: 7,
    			icon: 8,
    			group: 0
    		});
    	}
    }

    var css_248z$3 = ":root{\n\t--fgp-has-polyfil_gap-container: 0px;\n\t--fgp-has-polyfil_gap-item: 0px}.svelte-h95bsr.svelte-h95bsr{box-sizing:border-box}table.svelte-h95bsr.svelte-h95bsr{border:0 solid transparent;border-spacing:0;border-collapse:collapse;margin-top:8px;margin-bottom:8px}td.svelte-h95bsr.svelte-h95bsr{padding:0}label.svelte-h95bsr.svelte-h95bsr > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}label.svelte-h95bsr.svelte-h95bsr > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}label.svelte-h95bsr.svelte-h95bsr{\n\tdisplay:block;\n\twidth:auto;\n\tborder:1px solid var(--figma-color-border, var(--color-black-10));\n\tmargin:0;\n\twidth:24px;\n\theight:24px;\n\tpadding:1px;\n\tmargin-right:5px;\n\tmargin-bottom:5px;\n\tborder-radius:2px;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 24px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 24px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(24px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 24px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 24px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(24px - var(--fgp-gap_container_row, 0%)) !important}table.svelte-h95bsr.svelte-h95bsr > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}table.svelte-h95bsr.svelte-h95bsr{\n\twidth:calc(100% + 6px);\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * calc(100% + 6px) * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * calc(100% + 6px) * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(calc(100% + 6px) - var(--fgp-gap_container_column, 0%)) !important}@supports (aspect-ratio: 1){table.svelte-h95bsr.svelte-h95bsr > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}table.svelte-h95bsr.svelte-h95bsr{\n\twidth:calc(100% + 5px);\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * calc(100% + 5px) * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * calc(100% + 5px) * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(calc(100% + 5px) - var(--fgp-gap_container_column, 0%)) !important}label.svelte-h95bsr.svelte-h95bsr{width:auto;height:auto;aspect-ratio:1}}.selected.svelte-h95bsr label.svelte-h95bsr{border-width:1.5px;padding:0px;border-color:var(--figma-color-bg-brand, --color-blue);background:var(--figma-color-bg-brand-tertiary, rgba(24, 160, 251, 0.2))}.hover.svelte-h95bsr label.svelte-h95bsr{background:var(--figma-color-bg-hover, var(--color-black-10))}.selected.hover.svelte-h95bsr label.svelte-h95bsr{padding:0px;background-color:rgba(13, 153, 255, 0.4)}input.svelte-h95bsr.svelte-h95bsr > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}input.svelte-h95bsr.svelte-h95bsr > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}input.svelte-h95bsr.svelte-h95bsr{\n\twidth:0px;\n\theight:0px;\n\topacity:0;\n\tmargin:0;\n\tpadding:0;\n\tposition:absolute;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 0px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 0px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(0px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 0px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 0px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(0px - var(--fgp-gap_container_row, 0%)) !important}";
    styleInject(css_248z$3);

    /* src/ui/Matrix.svelte generated by Svelte v3.31.2 */

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[20] = i;
    	return child_ctx;
    }

    // (107:3) {#each { length: grid[1] } as _, y}
    function create_each_block_1$1(ctx) {
    	let td;
    	let label;
    	let t;
    	let input;
    	let input_checked_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[8](/*x*/ ctx[18], /*y*/ ctx[20]);
    	}

    	function mouseover_handler() {
    		return /*mouseover_handler*/ ctx[9](/*x*/ ctx[18], /*y*/ ctx[20]);
    	}

    	function mouseout_handler() {
    		return /*mouseout_handler*/ ctx[10](/*x*/ ctx[18], /*y*/ ctx[20]);
    	}

    	return {
    		c() {
    			td = element("td");
    			label = element("label");
    			t = space();
    			input = element("input");
    			attr(label, "for", "" + (/*x*/ ctx[18] + "of" + /*y*/ ctx[20]));
    			attr(label, "tabindex", "-1");
    			attr(label, "class", "svelte-h95bsr");
    			attr(input, "id", "" + (/*x*/ ctx[18] + "of" + /*y*/ ctx[20]));
    			attr(input, "type", "radio");
    			input.value = "" + (/*x*/ ctx[18] + "of" + /*y*/ ctx[20]);
    			attr(input, "name", "selection");
    			input.checked = input_checked_value = /*table_state*/ ctx[1][/*x*/ ctx[18]][/*y*/ ctx[20]].checked;
    			attr(input, "class", "svelte-h95bsr");
    			attr(td, "class", "svelte-h95bsr");
    			toggle_class(td, "hover", /*table_state*/ ctx[1][/*x*/ ctx[18]][/*y*/ ctx[20]].hover);
    			toggle_class(td, "selected", /*table_state*/ ctx[1][/*x*/ ctx[18]][/*y*/ ctx[20]].selected);
    		},
    		m(target, anchor) {
    			insert(target, td, anchor);
    			append(td, label);
    			append(td, t);
    			append(td, input);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(/*on_load*/ ctx[3].call(null, td)),
    					listen(td, "click", click_handler),
    					listen(td, "mouseover", mouseover_handler),
    					listen(td, "mouseout", mouseout_handler)
    				];

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*table_state*/ 2 && input_checked_value !== (input_checked_value = /*table_state*/ ctx[1][/*x*/ ctx[18]][/*y*/ ctx[20]].checked)) {
    				input.checked = input_checked_value;
    			}

    			if (dirty & /*table_state*/ 2) {
    				toggle_class(td, "hover", /*table_state*/ ctx[1][/*x*/ ctx[18]][/*y*/ ctx[20]].hover);
    			}

    			if (dirty & /*table_state*/ 2) {
    				toggle_class(td, "selected", /*table_state*/ ctx[1][/*x*/ ctx[18]][/*y*/ ctx[20]].selected);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(td);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (105:1) {#each { length: grid[0] } as _, x}
    function create_each_block$2(ctx) {
    	let tr;
    	let t;
    	let each_value_1 = { length: /*grid*/ ctx[0][1] };
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	return {
    		c() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr(tr, "class", "svelte-h95bsr");
    		},
    		m(target, anchor) {
    			insert(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append(tr, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*table_state, select, enter, leave, grid*/ 55) {
    				each_value_1 = { length: /*grid*/ ctx[0][1] };
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	let table;
    	let each_value = { length: /*grid*/ ctx[0][0] };
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	return {
    		c() {
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(table, "class", "svelte-h95bsr");
    		},
    		m(target, anchor) {
    			insert(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*grid, table_state, select, enter, leave*/ 55) {
    				each_value = { length: /*grid*/ ctx[0][0] };
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { grid = [4, 4] } = $$props;
    	let { columnCount = 4 } = $$props;
    	let { rowCount = 4 } = $$props;
    	let table_state = [];

    	for (let k = 0; k < grid[0]; k++) {
    		table_state[k] = [];

    		for (let i = 0; i < grid[1]; i++) {
    			table_state[k][i] = {
    				selected: false,
    				hover: false,
    				checked: false
    			};
    		}
    	}
    	let hover_end = [];

    	function select(x, y) {
    		$$invalidate(6, columnCount = y + 1);
    		$$invalidate(7, rowCount = x + 1);

    		// Reset to no state
    		set_state("selected", [grid[0], grid[1]], false);

    		// Set new state
    		set_state("selected", [x, y]);

    		valueStore.update(data => {
    			data.columnCount = columnCount;
    			data.rowCount = rowCount;
    			return data;
    		});
    	}

    	// TODO: Check rows and columns are right way round
    	// TODO: Need to disable onload and active this to subscribe to changes to input
    	valueStore.subscribe(value => {
    		// columnCount = value.columnCount;
    		// rowCount = value.rowCount;
    		// Reset to no state
    		set_state("selected", [grid[0], grid[1]], false);

    		set_state("selected", [value.rowCount - 1, value.columnCount - 1]);
    	});

    	function on_load(node) {
    		// Set default checked radio
    		$$invalidate(1, table_state[rowCount - 1][columnCount - 1].checked = true, table_state);

    		// Set default state
    		set_state("selected", [rowCount - 1, columnCount - 1]);
    	}

    	function enter(x, y) {
    		hover_end = [x, y];
    		set_state("hover", hover_end);
    	} // valueStore.set({ columnCount: x + 1, rowCount: y + 1 })

    	function leave(x, y) {
    		hover_end = [x, y];
    		set_state("hover", hover_end, false);
    	} // valueStore.set({ columnCount: origColumnCount, rowCount: origRowCount })

    	function set_state(type, end, value = true) {
    		let [x2, y2] = end;

    		$$invalidate(1, table_state = table_state.map((a, x) => a.map((obj, y) => {
    			if (type === "selected") {
    				if (x <= x2 && y <= y2) {
    					obj.selected = value;
    				}
    			}

    			if (type === "hover") {
    				if (x <= x2 && y <= y2) {
    					obj.hover = value;
    				}
    			}

    			return obj;
    		})));
    	}

    	const click_handler = (x, y) => select(x, y);
    	const mouseover_handler = (x, y) => enter(x, y);
    	const mouseout_handler = (x, y) => leave(x, y);

    	$$self.$$set = $$props => {
    		if ("grid" in $$props) $$invalidate(0, grid = $$props.grid);
    		if ("columnCount" in $$props) $$invalidate(6, columnCount = $$props.columnCount);
    		if ("rowCount" in $$props) $$invalidate(7, rowCount = $$props.rowCount);
    	};

    	return [
    		grid,
    		table_state,
    		select,
    		on_load,
    		enter,
    		leave,
    		columnCount,
    		rowCount,
    		click_handler,
    		mouseover_handler,
    		mouseout_handler
    	];
    }

    class Matrix extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { grid: 0, columnCount: 6, rowCount: 7 });
    	}
    }

    var css_248z$2 = ":root{\n\t--fgp-has-polyfil_gap-container: 0px;\n\t--fgp-has-polyfil_gap-item: 0px\n}.description{color:var(--figma-color-text-secondary, var(--color-black-30))\n\t}.SectionTitle > *{\n\t--fgp-has-polyfil_gap-item: initial\n}.SectionTitle{margin-top:-8px;min-height:34px;display:flex;place-items:center;--fgp-has-polyfil_gap-container: initial}.SectionTitle .Label > *{\n\t--fgp-has-polyfil_gap-item: initial\n}.SectionTitle .Label{display:flex;align-items:center;line-height:1;--fgp-has-polyfil_gap-container: initial}.SectionTitle .Label .icon{margin-right:2px;margin-left:-4px}.SectionTitle .Label .text{margin-top:1px}.text-bold{font-weight:600}.EditTemplate .target{border:2px solid var(--color-purple);position:absolute;display:none;transition:all 0.25s ease-out}.EditTemplate .artwork{position:relative;margin-bottom:8px}.EditTemplate .target.currentlySelected{margin-bottom:24px;text-align:center;margin-left:-4px;color:var(--figma-color-text-tertiary, var(--color-black-30))}.ListItem.currentlySelected{outline:1px solid var(--color-purple);outline-offset:-1px}.EditTemplate .hover{border:2px solid var(--color-black-30)}.ListItem .currentSelectionName{display:none;color:var(--figma-color-text-tertiary, var(--color-black-30))}.ListItem:hover .currentSelectionName{display:block}.EditTemplate .current-table.table,.EditTemplate .current-tr.tr,.EditTemplate .current-td.td,.EditTemplate .current-th.th{border:2px solid var(--color-purple)}.EditTemplate .taken.taken{border-color:var(--color-purple) !important}.EditTemplate .remove.remove{border-color:#FF4D4D !important}.EditTemplate .add{border-color:var(--color-purple) !important}.EditTemplate .not-taken{border-style:dashed !important}.EditTemplate .target.table > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial\n}.EditTemplate .target.table > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial\n}.EditTemplate .target.table{\n\tdisplay:block;\n\tleft:65px;\n\ttop:14px;\n\twidth:106px;\n\theight:74px;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 106px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 106px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(106px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 74px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 74px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(74px - var(--fgp-gap_container_row, 0%)) !important}.EditTemplate .target.tr > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial\n}.EditTemplate .target.tr > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial\n}.EditTemplate .target.tr{\n\tdisplay:block;\n\tleft:65px;\n\ttop:33px;\n\twidth:106px;\n\theight:36px;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 106px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 106px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(106px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 36px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 36px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(36px - var(--fgp-gap_container_row, 0%)) !important}.EditTemplate .target.td > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial\n}.EditTemplate .target.td > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial\n}.EditTemplate .target.td{\n\tdisplay:block;\n\tleft:65px;\n\ttop:53px;\n\twidth:61px;\n\theight:36px;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 61px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 61px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(61px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 36px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 36px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(36px - var(--fgp-gap_container_row, 0%)) !important}.EditTemplate .target.th > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial\n}.EditTemplate .target.th > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial\n}.EditTemplate .target.th{\n\tdisplay:block;\n\tleft:110px;\n\ttop:13px;\n\twidth:61px;\n\theight:36px;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 61px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 61px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(61px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 36px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 36px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(36px - var(--fgp-gap_container_row, 0%)) !important}.List{margin-top:8px}.ListItem > *{\n\t--fgp-has-polyfil_gap-item: initial\n}.ListItem{display:flex;place-items:center;min-height:34px;margin:0 -16px;padding:0 16px;--fgp-has-polyfil_gap-container: initial}.ListItem p{margin:0}.ListItem .element{font-weight:bold;min-width:50px}.ListItem>.buttons{margin-left:auto;display:none;margin-right:-8px}.ListItem:hover{background-color:var(--figma-color-bg-hover, var(--color-hover-fill))}.ListItem:hover>.buttons{display:block}.EditTemplate .image > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial\n}.EditTemplate .image > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial\n}.EditTemplate .image{\n\tmargin:0 auto;\n\twidth:160px;\n\theight:102px;\n\tbackground-size:contain;\n\tbackground-image:url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAgEAkACQAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCADMAUADAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+/igAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAQkDrQA0uAccfn+Z78D16cH0oAZ5y+oI9OQR9c9fwz+FAC+aPwJxkj25PXoP8AH60AJ5wx2yDg5B9B9Ocnp1wQcdaAAzAdwe49x8xJxntjqMj364AE84Zxx1x17ggEdfx+nuCKAF85M9R0z/8AqJxke+B3NAB5wxnr9Oh69D+B9c9KADzl65BHB69Ov+HXGB096ADzl55HHuP55APbgc/jgEATzhnGVOegBHPPrnHrnOAP0oAXzl45A9c56+mBkjODj6dulACeeMf06+/PPcdPf8cAC+cvHv7j8QOxP485H1oAXzV55GBzntjp05Oc9u2eenIAnmrxyPzB57jr+XUYzzwQAA85c4z3/TGfXr1/pmgA84DqR07dz6dTjkgc9+uKAFEq9CQDgn/Dv3/qOnNACecOD0Gcc8c9h9fz/CgA84eh74zgdBnpkn3/AK0AHnL/AHl7+vOOeM4HToCRkkUAAmB46H05+h9eh/mOeDQA4SAnHT/PcYBGD6/n6gElABQAUAFABQAUAFABQAUAFABQAUAFABQAUAV5JQgyfryenI29gPXoGOM9aAPyC/aD0/X/AI0/tZy/CS+8UXWk6FY2llaaH/o0moWWkqvgGDxhfTjSRfafDc3moXxmt5bv7RDMIDaq7yxWMMBALv8AwwT/ANVW/wDLF/8AwxoAX/hgn/qq3/li/wD4Y0AJ/wAME/8AVVv/ACxf/wAMaAD/AIYJ/wCqr/8Aljf/AIY/SgA/4YJ/6qt/5Yv/AOGNAC/8ME/9VW/8sbv6/wDI40AJ/wAME/8AVVv/ACxf/wAMaAD/AIYJ/wCqr/8Ali//AIY0AH/DBP8A1Vb/AMsX/wDDH/P50AL/AMME/wDVVv8Ayxv/AMMaAOE+Jn7H/wDwrrwRrfjH/hYn9sf2OdN/4l3/AAiX9nm4GoavYaV/x+/8JNfeT5IvvP8A+PWUSeV5Xyb/ADEAD4afsf8A/CxPBOieMf8AhYh0f+2BqX/Eu/4RL+0Ps32DVb7Sv+Pv/hJrHzfO+w+f/wAesXliXyvnMfmuAd1/wwT/ANVX/wDLF/8AwxoAP+GCf+qr/wDli/8A4Y0AH/DBP/VVv/LF/wDwxoAX/hgn/qq3/li//hj/APX75zQAf8ME/wDVVv8Ayxfw/wChx/zxnOMUAJ/wwT/1Vb/yxf8A8MaAD/hgn/qq/wD5Yv8A+GNAC/8ADBP/AFVb8/Av/wCGNACj9gkD/mqv/lj/AP4Y0AOH7BYH/NVPp/xQ2P8A3cDQBB+z5pmvfBj9q2L4UWPii71TQr62vLXW9tu+nWOrFvAUvi2xuJNKN5qMNveWF6tvbw3i3MlyYEnRZYre8ntqAP1zjfcQc9e+ecdeeBk4IzjIAyeOKALFABQAUAFABQAUAFABQAUAFABQAUAFACMcAn/J7f55FAGPeyFN3TnrxwevBzjpxz05IHBoA/K2/cv/AMFBpmOckpnvwPgmg/DGAP046UAfoHQAUAFABQAUAFABQAUAFABQB4X+0oM/BTxoPX/hHP8A1LdBoAX9mwY+Cvgsf9jF/wCpZrtAHudABQAUAFABQAUAFABQAUAFAHwdYfJ+3pDLnG0nnOP+aOMPT8OaAP1BspAcZPbOcdT7dO546HnHYUAa6nI/z/n8+frQAtABQAUAFABQAUAFABQAUAFABQAUANc4U/Q9fp+v0/KgDndRJCn3GWBPuSeMjGecD/a5xk4APyxnOf8AgoDIf9rr/wB0W/r1x+g6UAfoVQAUAFABQAUAFABQAUAFABQB4f8AtIDPwX8ZD/sXf/Ur0KgBf2cBj4MeDR/2MP8A6lWuUAe30AFABQAUAFABQAUAFABQAUAfCluuP25Ekx0Pf/skRHX8ffnFAH6YacTheSQM568YJGDkY55weuOuM4AB0Q6c9eM855wP89vWgBaACgAoAKACgAoAKACgAoAKACgAoAa2ccev/wBb/wCt9KAOa1LlSuME5yeSSCeuQCT16evPQ4AB+Wc2P+HgEnB5YkfT/hS/4549/wA6AP0LoAKACgAoAKACgAoAKACgAoA8S/aMGfg14xH/AGL3/qVaHQAv7Ogx8G/Bw/7GD/1KdcoA9soAKACgAoAKACgAoAKACgAoA+HoE/4zaR+nOM/X4TEUD6f1/wAOfpHpvROe3PHy9MA8emOmMDHTkAAjpF+6P8+/Ht6UAOoAKACgAoAKACgAoAKACgAoAKACgBr/AHeuPr/n1x6fUdaAOc1IHDDoQTxkH+HO4nGCTnkg54AwcmgD8spgf+G/5D1G485/6ox6HmgD9CqACgAoAKACgAoAKACgAoAKAPFf2iBn4O+MBjP/ACL/AP6lOiUAL+zwMfB7wgP+w/8A+pRrdAHtNABQAUAFABQAUAFABQAUAFAHxRCn/GZ6P7/+8r2/596B9P8AgfqfozpvSPIGT0PLZweBjvkdOc44xydwI6Rcgc/5/wAD2xQA6gAoAKACgAoAKACgAoAKACgAoAKAGP8AdP559MA+nNAHOalwGHP3c8jaCQSOOvIHPToCSQBwAfkT8Rfhx/wtn9sjWvAX9sf2B/b7WGdX/s7+1fsp0r4W2Wsk/YPt2neebj+zvs//AB+w+V5/m/vBH5TgHtn/AA7s/wCqw/8AmPv/AMN6AF/4d2f9Vg/8x9/+G39P15oAT/h3Z/1WH/zH/wD+G9AB/wAO7P8AqsP/AJj7/wDDegA/4d2f9Vh/8x//APhvQBKv/BPAL/zV76f8UB0/8vagCwv/AAT3C/8ANXOnT/igf/w0oAnX/gn8F/5qzn/uQ+/r/wAjnQBYX9gQL/zVfP8A3IvX/wAvH9KAJ1/YLC/81Vz6/wDFDY/93CgDhvih+yWPhn4E13xr/wAJ9/bf9i/2Z/xLP+EV/s37T/aOs6fpOBef8JHf+R5P2/7R/wAek3meV5Xyb/MQAsfCz9lH/hZHgXQvGp8ef2Kda/tP/iWf8Iv/AGj9l/s7WNQ0ni9/4SKx87zvsHn/APHpF5fm+V+82eY4B6Ov7D4X/mp3Tp/xRf8A+FlAFhf2Jgv/ADUvP/cmfr/yNfWgCdf2LAv/ADUnP/cndf8Ay6v0oAnX9jML/wA1Hz6/8UfjP/l0GgCwv7HIX/momf8AuUcfh/yM/FAE6/sgBf8AmoWf+5Txx/4U1AE6/sjhf+agfT/ilOn/AJctAFhf2TQv/M+5/wC5W/X/AJGPrQBOv7KgXH/Fd5/7lfGT/wCFFQBOv7LYX/mec+v/ABTPX/y4KAPm7QvCn/CGfta2nh37d/aX9mmX/Tfsv2Pzvtnw2lv/APj2+0XXl+V9pER/0h9+zeCu7y1B9P8Agn6P6cflX2x1B59/4QeDkZBOOoAzQI6VOnp/LoOn+evagB1ABQAUAFABQAUAFABQAUAFABQAUANf7v4/5x/npmgDm9QI2Hr/ABZx1z1A4/LqPXvigD84NDT/AI2C274/iuOvXP8AwpWcdOnr60AfqLQAUAFABQAUAFABQAUAFABQB4F+1AM/AvxwP+xZ/wDUw8PmgBf2Xxj4GeBx/wBjL/6l/iCgD3ygAoAKACgAoAKACgAoAKACgD88daTH7aly/HW3HP8A2SiFe/Hfp36ZBoH0/rv+J90adnao55AAzyeAeMYzg4B6AD5TjPzAEdInC/y5z+fv69Oe1ADqACgAoAKACgAoAKACgAoAKACgAoAa2cHHv+WDQBzepcq/IH5D5WHJP1znGTxnHc0AfnXoaf8AGfdu/wDtXHYAcfBmYYxQB+nVABQAUAFABQAUAFABQAUAFAHgv7Tgz8DvG4xn/kWv/Uv0CgBf2ZBj4H+CB/2Mn/qXa/QB7zQAUAFABQAUAFABQAUAFABQB+fetp/xmVcv05t+f+6WwjODxx78Y/GgfQ+4NO6KcZzjA/vDjGex9h1Lfwg4ABHRJ93/AD+P0/ye9ADqACgAoAKACgAoAKACgAoAKACgAoAa/wB0j14+vqPxGf8A6/SgDnNS+63cE56jtxnqB25OTgLk98gH566In/GeNu+P47nkZx/yR2ZeM/59KB9P6/pn6X0CCgAoAKACgAoAKACgAoAKAPCP2mBn4I+NR/2Lf/qXaDQAv7NAx8EvBQ/7GP8A9S3XjQB7tQAUAFABQAUAFABQAUAFABQB8Da0n/GYFy/Tm35xkf8AJMYB+uMe2elA+h9qadkhfvY6Dp+ROOOOe3pjnABHRr0/H8+/+c80AOoAKACgAoAKACgAoAKACgAoAKACgBjjKnr+H5UAc5qGDux/tAk89fzIzk+/BxnnAB8A6Gn/ABnPbvjGTcf+qhmH69cf4YoH0/r+up+klAgoAKACgAoAKACgAoAKACgDwz9pQZ+CnjQf9i5/6lmg0AL+zYMfBXwWP+xi/wDUs12gD3KgAoAKACgAoAKACgAoAKACgD4R1tP+Mtbl8Dhrc5x6fDWAdTx/OkV0/rufZGnY2rgjgYH8R59sAZJyCTnGTjI5pknSJ90fQfX059T2J70AOoAKACgAoAKACgAoAKACgAoAKACgBj/dP+f/ANX1oA5zUjlSMEjPf2PIyeB2HoB244APzB+I3w3HxY/aX1rwGNZ/sH+32sP+JuNP/tT7J/ZXgKy1n/jwF7pvni4/s37NxewmLzvOzJ5RikB9P67nbL/wTtA5/wCFwZ/7p/8A/hsaBE6/8E9Av/NXfp/xQHT/AMvWgCwv/BPoL/zVvP8A3IX6/wDI59aAJ1/YBC4/4uxn/uRMZP8A4WVAE6/sDhf+arZ9f+KF6/8Al40AWF/YOC/81Uz6/wDFD4/93CgCdf2FQv8AzVLP/ckY4/8ACuoAnX9hwL/zU/6f8UV0/wDLtoAsL+xEF/5qbnHT/ijP/wALKAJ1/YpC4/4uVn/uTcZP/hVUAcf8Rf2Yh8PfBms+Lv8AhNv7Y/sj+zv+Jd/wjf8AZ/2n7fqtjpn/AB9/2/e+T5P23z/+PaXf5XlfJv8AMUAsfDb9mgePvBmjeLj40/sn+1/7Qzp//COfb/s/2DVb7TMfa/7dsvN837F5/wDx7RbPM8v59nmMAd8v7HoX/momf+5Sxx/4U1AE6/shhf8AmoP0/wCKT6f+XLQBYX9koL/zP+cdP+KV/wDwkoAnX9lELj/ivOn/AFK/f1/5GKgCwv7K4X/mes/9yx1/8uH9KAJ1/ZeC/wDM8Z9f+Kax/wC7BQBOv7MoX/mdf/Lbxx6f8h40ATr+zWF/5nP6f8U70/8AK7QBYX9nIL/zOPTp/wAU9/8AfygCdf2eQuP+Ku6f9QDv6/8AIaoA8L0zw3/wi37RUGifa/t/2Atm68j7KZftPghrz/Uedc+X5f2jy/8AXPuCF/l3bVXUr7P9dz7j03hVIJ9sYPHGe+DySCeT1IyMmmSdGn3R+X5DFADqACgAoAKACgAoAKACgAoAKACgAoAY/wB3n/PB/wA4wc9Mc0Ac3qOdrEYP8OB169frgY5wfquAQD4Y0RB/w2nbvjHNx/6qmVc/j17/AIc0D6H6HUCCgAoAKACgAoAKACgAoAKAPEv2jBn4NeMR/wBi9/6lWh0AL+zqMfBvwcMY/wCRg/8AUp1ugD2ygAoAKACgAoAKACgAoAKACgD4j1zH/DUlx3O639f+ieQY6Y9zwaXUr7P9dz6300gBRnnvyTnn5sDPPT1wec8HhknRr06g/TgD2HSgB1ABQAUAFABQAUAFABQAUAFABQAUAMfO046np1/p/LnPTHNAHN6j0fsM/wAPrj1JBA+oPqT0NAHxFoif8ZkWzjnmfn/ulky49BjpjoOnOM0D6H6CUCCgAoAKACgAoAKACgAoAKAPFv2hxn4PeLx/2L//AKlOiUAH7PIx8HvCA/7D/wD6lGtmgD2mgAoAKACgAoAKACgAoAKACgD4k1v/AJOkuenW3OeeP+Lew/hx1/x6UupX2f67n1vpv8I78dM9SQR/D06dPl3McdcUyTo1zgZ68/qaAFoAKACgAoAKACgAoAKACgAoAKACgBGzg4OP8/4+4+tAHM6mOG9MHOfbsPyxkDOck/7IB8W6Gn/GX9u+O9wOf+yZTD1P0oH0PvmgQUAFABQAUAFABQAUAFABQB4z+0GM/CDxcP8AsAf+pPopoAX9n0Y+EPhEen9vf+pPrVAHstABQAUAFABQAUAFABQAUAFAHxHrf/J0lx9bf6/8k9h/zn60upX2f67n1tpvO3AB9R7nIP5EjAzk8kcE0yTpF6DJz/P8fQ0AOoAKACgAoAKACgAoAKACgAoAKACgBkn3SPXj/OOv+T2oA5vUcEEenHGfcZA79fxzyM0AfHGhof8AhrS2c9c3H/qtpgB64H+fcH0Pu6gQUAFABQAUAFABQAUAFABQB458fxn4SeLB/wBgH/1JtGoAX4AjHwk8JjGP+Q7/AOpLrNAHsVABQAUAFABQAUAFABQAUAFAHxJrfP7Ulz7G3x/4byDv7fj+VLqV9n+u59b6d0Q9DjOegyMEdTkEc9ueMgDkMk6Nen8+c/5+nagBaACgAoAKACgAoAKACgAoAKACgAoAa+dpwSPcfl+P0oAwNQQ7XyucE5PJGeT3I9Oh756c0AfLvxJ+DVj4v1uTXoNUl0m/miijvc2Yv4Lv7PGIYJAn2q1eCVYEihZhJJE6RJ+6Rw7yA7nlr/ANoyf+KnBwTj/iSgZ9eDq5PHtkntmgL/0iFfgY/wD0MRHT/mC46n1/tX6DJ9elId/L8R//AAo5/wDoYj+OjH+mqHv6ZGPyosHMKPghJzjxCMj/AKgx7f8AcTzyOemenvgC/kO/4UhIc/8AFRHHOT/Yx7e39qd+g75HT0LBzeQn/CkZef8Aioj0z/yBjz9M6n2BPOP05BYOby/EX/hSL9P+EjPcc6KRzz1/4mmR9eccHpnBYObyD/hSMp/5mI9h/wAgU9OMf8xPnqOMdCMZ6UWDm8vxD/hSEv8A0MfbP/IGbHBx/wBBPjuORnOBjngsHN5AfgjIB/yMR9DnRj05PUaqefYgdPbksHN5Cn4Iy4/5GI4zjP8AY2BnOBz/AGpyOByMnjoexYObyE/4UjJ38RnHPH9j4PAHXOq4Hp1OCMYJ4BYObyD/AIUjJx/xUR7/APMGz3OBxqnOenTrkdBmiwc3l+In/CkZen/CRHqR/wAgY845z/yFM+vbGO+ciiwc3kL/AMKRl/6GLr/1Bj7ZP/IT47geuKLBzeQf8KRk6f8ACRnrz/xJ84Pr/wAhQDkdvcUWDm8hB8EZe/iE9uRo2Rz651QdPyODzxRYObyF/wCFIS8n/hIuB1P9jkcY6/8AIT79s9fxosHN5APgnL/0MRB6HOjnrjPAGqdu3p+VFg5vIT/hSMvfxF/5Rj6e2p+vfpjkZyRRYObyFPwQlBx/wkR7c/2M2O2f+Ymf0yDxg4NFg5vIni+BckhA/wCEkIyBz/YuSDjIGP7WH055x0osHN/X9I9T+HPwhs/CmsrrlzqUurX0KSxWOLMWUNsZ0aCeUp9oumklMDyQoxkRESSUGN3KNExN/I+nbFOF4647enynkA9T0LDOST35BG4v3R/n69h3zQA6gAoAKACgAoAKACgAoAKACgAoAKAEIyP5Z9aAM+4iLA8ZBxjqcj6+vqD3wQB0oA5i808OwwpzznHXP3RjPbr0HIPIHSgDBm0gkn5ev+ye/P8AFkc4BwRgDjHHIBUOjH+719PU/dB9scj6jkgAUAH9ig9uq5HAxxz6ZHQnPQdBkdABf7FOeh6/U89OfXgHK/w856GgA/sUtuwMDuc4AIGOpHQk/UjrQAo0bvgjpz0YHGD3xwT1J45BIoAb/YuM5Xlfc4H+TngD73txQAf2L/segz055BHAxzg88+vGSAAOOjfLnaPrxx2GSQ3ByDngZ+UYByABv9jcZ24wO2ADxkjJ4JxgYxu5w2duCAJ/YvJ4PXOOc+3B9c+p+vPIAo0bJOVb04HYde/UHnbjHTHXJAHf2Mem0n5uegAJ5zx+OC3T070AJ/Yp6FSSRnrjpzgYBGeQcEemB8woADozEEYOAMnPtgZPT3IwTkjn1oADovJ4JwSScAHrzwOhGM4OcDGOOKAAaLkk4PBOACDnJboQSTjAJ56bj2OQBf7G9QdvQgH+7np1Bx97B49CM0ANGin0IIwcMACMnA46Ec9cdTnGRkAC/wBjYBBHfgdeuPY4JwBn3HXjAAf2LyOM5HAHAxjr046ZAIHPOO1AFmHSCCOBjjsOgI7kA98n29eaAN+zsAmOMY5wMDGMHvyTnI47A9c5oA6m3jCqMY+Xnoew688ZyMrgDIznpgAF4DAwKAFoAKACgAoAKACgAoAKACgAoAKACgAoAYybvx6+nfn60AVpLdTjIyeffI5HPHfIH5dwKAK7WalgdoxwMdepweqkdOMfeHHpmgBn2Fc5xx+BGOR97rwccYHQBh3oAaLBT/DycgcAEcdBwOmc89Mdc0AKLEY5HGcenPYnJxnrnGO3pyAKLBcjoBgckknjkjrwewOCPrigBv2FepHc4GPoQDnp0AOOnBJBwSAL9hXk4GR7euevHOD165J6EYoAPsA9OvJGDnGQSATjAGT0Of8Ax4gAUWK4AHY4JIGOmTgEjgHtkjr04BAE+wAg8D1PPU847kjtyT1zznqAH2Fc4xx34J4weh6kevXOSPTIAfYRxwvIAzz8uMZyMEEcZIGRjGMYwQANiMcde3Q498L/ACxjJ56LQAv2AbunLZ/iPAOc+/TjsccdWwABDYjkY7H8ME8EdCQDjPPbjIoADYj0HY4yD69skZ57YPA564AFFgm4k8jjAAHBGB0OPU5x1z1znAAfYBgdeh+v546ZOBgDHTnPAA37COuB3x0PA6Dgdc454zgd+oAosF57g4IJ6jkDk4Bz0J+715zwCAL9hUgdM5/IDHXkdOufT/vlQBwsgOo6eg4+7785OSAOgz6GgCzHBt7DH06dOcdzjHOOePc0AWlGB+X+f8k0AOoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKADA9KACgAoAKADFABigAwPT/AD0/lxQAUAFABQAYHp/nr/PmgAoAKADHfvQAYoAKAEwPQetAC0AFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAD/2Q==);\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 160px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 160px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(160px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 102px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 102px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(102px - var(--fgp-gap_container_row, 0%)) !important}";
    styleInject(css_248z$2);

    /* src/ui/TemplateSettings.svelte generated by Svelte v3.31.2 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[17] = i;
    	return child_ctx;
    }

    // (219:2) {#if parts}
    function create_if_block$1(ctx) {
    	let div;
    	let each_value = /*parts*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div, "class", "List");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*currentSelection, parts, addRemoveElement*/ 42) {
    				each_value = /*parts*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (228:5) {:else}
    function create_else_block$1(ctx) {
    	let span;

    	let t_value = (/*currentSelection*/ ctx[3]
    	? /*currentSelection*/ ctx[3].name
    	: "") + "";

    	let t;

    	return {
    		c() {
    			span = element("span");
    			t = text(t_value);
    			attr(span, "class", "currentSelectionName");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*currentSelection*/ 8 && t_value !== (t_value = (/*currentSelection*/ ctx[3]
    			? /*currentSelection*/ ctx[3].name
    			: "") + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (226:5) {#if part.name}
    function create_if_block_1$1(ctx) {
    	let span;
    	let t_value = /*part*/ ctx[15].name + "";
    	let t;

    	return {
    		c() {
    			span = element("span");
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*parts*/ 2 && t_value !== (t_value = /*part*/ ctx[15].name + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (222:3) {#each parts as part, i}
    function create_each_block$1(ctx) {
    	let div;
    	let p;
    	let t0;
    	let t1_value = /*part*/ ctx[15].element + "";
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let span1;
    	let span0;
    	let span0_icon_value;
    	let span1_style_value;
    	let t5;
    	let div_class_value;
    	let hover_action;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*part*/ ctx[15].name) return create_if_block_1$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[10](/*part*/ ctx[15], /*i*/ ctx[17], ...args);
    	}

    	return {
    		c() {
    			div = element("div");
    			p = element("p");
    			t0 = text("<");
    			t1 = text(t1_value);
    			t2 = text(">");
    			t3 = space();
    			if_block.c();
    			t4 = space();
    			span1 = element("span");
    			span0 = element("span");
    			t5 = space();
    			attr(p, "class", "element");
    			attr(span0, "class", "refresh icon addRemoveButton");
    			attr(span0, "icon", span0_icon_value = /*part*/ ctx[15].name ? "minus" : "plus");
    			attr(span1, "class", "buttons");

    			attr(span1, "style", span1_style_value = /*part*/ ctx[15].name || /*currentSelection*/ ctx[3]
    			? ""
    			: "display: none;");

    			attr(div, "class", div_class_value = /*currentSelection*/ ctx[3]?.element === /*part*/ ctx[15].element
    			? "ListItem currentlySelected"
    			: "ListItem");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, p);
    			append(p, t0);
    			append(p, t1);
    			append(p, t2);
    			append(div, t3);
    			if_block.m(div, null);
    			append(div, t4);
    			append(div, span1);
    			append(span1, span0);
    			append(div, t5);

    			if (!mounted) {
    				dispose = [
    					listen(span0, "click", click_handler),
    					action_destroyer(hover_action = /*hover*/ ctx[7].call(null, div, /*i*/ ctx[17]))
    				];

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*parts*/ 2 && t1_value !== (t1_value = /*part*/ ctx[15].element + "")) set_data(t1, t1_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, t4);
    				}
    			}

    			if (dirty & /*parts*/ 2 && span0_icon_value !== (span0_icon_value = /*part*/ ctx[15].name ? "minus" : "plus")) {
    				attr(span0, "icon", span0_icon_value);
    			}

    			if (dirty & /*parts, currentSelection*/ 10 && span1_style_value !== (span1_style_value = /*part*/ ctx[15].name || /*currentSelection*/ ctx[3]
    			? ""
    			: "display: none;")) {
    				attr(span1, "style", span1_style_value);
    			}

    			if (dirty & /*currentSelection, parts*/ 10 && div_class_value !== (div_class_value = /*currentSelection*/ ctx[3]?.element === /*part*/ ctx[15].element
    			? "ListItem currentlySelected"
    			: "ListItem")) {
    				attr(div, "class", div_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (242:39) <Button id="create-table">
    function create_default_slot$1(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("Done");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	let div5;
    	let div0;
    	let span2;
    	let span0;
    	let t0;
    	let span1;
    	let t1_value = /*template*/ ctx[0].name + "";
    	let t1;
    	let t2;
    	let p;
    	let t4;
    	let div3;
    	let div1;
    	let t5;
    	let div2;
    	let t6;
    	let t7;
    	let div4;
    	let span3;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*parts*/ ctx[1] && create_if_block$1(ctx);

    	button = new Button({
    			props: {
    				id: "create-table",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			div5 = element("div");
    			div0 = element("div");
    			span2 = element("span");
    			span0 = element("span");
    			t0 = space();
    			span1 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			p.textContent = "Configure which layers of your template represent the following elements below.";
    			t4 = space();
    			div3 = element("div");
    			div1 = element("div");
    			t5 = space();
    			div2 = element("div");
    			t6 = space();
    			if (if_block) if_block.c();
    			t7 = space();
    			div4 = element("div");
    			span3 = element("span");
    			create_component(button.$$.fragment);
    			attr(span0, "class", "icon");
    			attr(span0, "icon", "component");
    			attr(span1, "class", "text text-bold");
    			attr(span2, "class", "Label");
    			attr(div0, "class", "SectionTitle");
    			attr(p, "class", "type m-xxsmall description");
    			attr(div1, "class", "target");
    			attr(div2, "class", "image");
    			attr(div3, "class", "artwork");
    			attr(div4, "class", "BottomBar");
    			attr(div5, "class", "EditTemplate");
    		},
    		m(target, anchor) {
    			insert(target, div5, anchor);
    			append(div5, div0);
    			append(div0, span2);
    			append(span2, span0);
    			append(span2, t0);
    			append(span2, span1);
    			append(span1, t1);
    			append(div5, t2);
    			append(div5, p);
    			append(div5, t4);
    			append(div5, div3);
    			append(div3, div1);
    			/*div1_binding*/ ctx[9](div1);
    			append(div3, t5);
    			append(div3, div2);
    			append(div5, t6);
    			if (if_block) if_block.m(div5, null);
    			append(div5, t7);
    			append(div5, div4);
    			append(div4, span3);
    			mount_component(button, span3, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(window, "message", /*onMessage*/ ctx[6]),
    					listen(span3, "click", /*click_handler_1*/ ctx[11])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if ((!current || dirty & /*template*/ 1) && t1_value !== (t1_value = /*template*/ ctx[0].name + "")) set_data(t1, t1_value);

    			if (/*parts*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div5, t7);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div5);
    			/*div1_binding*/ ctx[9](null);
    			if (if_block) if_block.d();
    			destroy_component(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function editTemplate(template) {
    	// Todo: Needs to be seperated into two
    	parent.postMessage(
    		{
    			pluginMessage: { type: "edit-template", template }
    		},
    		"*"
    	);
    }

    function fetchTemplateParts(template) {
    	// Todo: Needs to be seperated into two
    	parent.postMessage(
    		{
    			pluginMessage: { type: "fetch-template-parts", template }
    		},
    		"*"
    	);
    }

    function fetchCurrentSelection(template) {
    	// Todo: Needs to be seperated into two
    	parent.postMessage(
    		{
    			pluginMessage: { type: "fetch-current-selection" },
    			template
    		},
    		"*"
    	);
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { template } = $$props;
    	let { pageState } = $$props;
    	let parts = {};
    	let message;
    	let artworkTarget;
    	let currentSelection = {};
    	let previousSelection = {};
    	let currentlyHovering = false;
    	fetchTemplateParts(template);
    	editTemplate(template);

    	function doneEditing() {
    		console.log("done editing");

    		$$invalidate(8, pageState = {
    			welcomePageActive: false,
    			createTablePageActive: true,
    			templateSettingsPageActive: false
    		});

    		valueStore.update(data => {
    			data.pageState = pageState;
    			return data;
    		});
    	}

    	function addRemoveElement(event, part, i) {
    		let { name, element, id } = part;
    		let button = event.target;
    		console.log(button);

    		if (typeof name === "undefined") {
    			$$invalidate(1, parts[i].name = currentSelection.name, parts);
    			artworkTarget.classList.add("taken");
    			artworkTarget.classList.remove("not-taken");

    			// artworkTarget.classList.remove('add')
    			parent.postMessage(
    				{
    					pluginMessage: { type: "add-element", element }
    				},
    				"*"
    			);
    		} else {
    			$$invalidate(1, parts[i].name = undefined, parts);
    			artworkTarget.classList.remove("remove");
    			artworkTarget.classList.remove("taken");
    			artworkTarget.classList.add("not-taken");

    			parent.postMessage(
    				{
    					pluginMessage: { type: "remove-element", element, id }
    				},
    				"*"
    			);
    		}

    		fetchCurrentSelection(template);
    		fetchTemplateParts(template);
    	}

    	async function onMessage(event) {
    		message = await event.data.pluginMessage;

    		if (message.type === "template-parts") {
    			$$invalidate(1, parts = Object.values(message.parts));
    			console.log("template-parts-updated");
    		}

    		if (message.type === "current-selection") {
    			$$invalidate(3, currentSelection = message.selection);

    			if (currentSelection) {
    				console.log("currentSelection", currentSelection);

    				if (currentSelection.element) {
    					if (previousSelection && previousSelection.element) {
    						artworkTarget.classList.remove(previousSelection.element);
    						artworkTarget.classList.remove("current-" + previousSelection.element);
    					}

    					artworkTarget.classList.add(currentSelection.element);
    					artworkTarget.classList.add("current");
    					artworkTarget.classList.add("current-" + currentSelection.element);
    					previousSelection = message.selection;
    				} else {
    					if (!currentlyHovering) {
    						artworkTarget.classList.remove(previousSelection.element);
    					}

    					artworkTarget.classList.remove("current");
    					artworkTarget.classList.remove("current-" + previousSelection.element);
    					previousSelection = undefined;
    				}
    			} else {
    				if (previousSelection) {
    					artworkTarget.classList.remove("current");
    					artworkTarget.classList.remove("current-" + previousSelection.element);
    					artworkTarget.classList.remove(previousSelection.element);
    				}

    				previousSelection = undefined;
    			}
    		}
    	}

    	function hover(node, i) {
    		const addRemoveButton = node.querySelector(".addRemoveButton");

    		if (addRemoveButton) {
    			addRemoveButton.addEventListener("mouseenter", () => {
    				// if (previousSelection) {
    				// artworkTarget.classList.remove(previousSelection.element)
    				// }
    				// artworkTarget.classList.add(parts[i].element)
    				// artworkTarget.classList.add('hover')
    				if (typeof parts[i].name !== "undefined") {
    					artworkTarget.classList.add("remove");
    				} else {
    					artworkTarget.classList.add("add");
    				}
    			});

    			addRemoveButton.addEventListener("mouseleave", () => {
    				// artworkTarget.classList.remove(parts[i].element)
    				// if (previousSelection) {
    				// 	artworkTarget.classList.add(previousSelection.element)
    				// 	artworkTarget.classList.remove('hover')
    				// }
    				artworkTarget.classList.remove("remove");

    				artworkTarget.classList.remove("add");
    			});
    		}

    		node.addEventListener("mouseenter", () => {
    			currentlyHovering = true;

    			if (previousSelection) {
    				artworkTarget.classList.remove(previousSelection.element);
    			}

    			artworkTarget.classList.add(parts[i].element);
    			artworkTarget.classList.add("hover");

    			if (parts[i].name) {
    				artworkTarget.classList.add("taken");
    			} else {
    				artworkTarget.classList.add("not-taken");
    			}
    		});

    		node.addEventListener("mouseleave", () => {
    			currentlyHovering = false;
    			artworkTarget.classList.remove(parts[i].element);

    			if (previousSelection) {
    				artworkTarget.classList.add(previousSelection.element);
    				artworkTarget.classList.remove("hover");
    			}

    			artworkTarget.classList.remove("taken");
    			artworkTarget.classList.remove("not-taken");
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			artworkTarget = $$value;
    			$$invalidate(2, artworkTarget);
    		});
    	}

    	const click_handler = (part, i, event) => addRemoveElement(event, part, i);
    	const click_handler_1 = () => doneEditing();

    	$$self.$$set = $$props => {
    		if ("template" in $$props) $$invalidate(0, template = $$props.template);
    		if ("pageState" in $$props) $$invalidate(8, pageState = $$props.pageState);
    	};

    	return [
    		template,
    		parts,
    		artworkTarget,
    		currentSelection,
    		doneEditing,
    		addRemoveElement,
    		onMessage,
    		hover,
    		pageState,
    		div1_binding,
    		click_handler,
    		click_handler_1
    	];
    }

    class TemplateSettings extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { template: 0, pageState: 8 });
    	}
    }

    var css_248z$1 = ":root {\n\t--fgp-has-polyfil_gap-container: 0px;\n\t--fgp-has-polyfil_gap-item: 0px;\n}\n\nhtml > * {\n\t--fgp-height_percentages-decimal: initial;\n}\n\nhtml {\n\theight: 100%;\n\t--fgp-height_percentages-decimal: 1 !important;\n}\n\n/* body {\n\t\tdisplay: flex;\n\t\tplace-items: center;\n\t\tplace-content: center;\n\t\theight: 100%;\n\t}\n\t.container {\n\t\twidth: 240px;\n\t\theight: 600px;\n\t\tbox-shadow: 0px 2px 14px 0px rgba(0, 0, 0, 0.15);\n\t\tborder: 0.5px solid rgba(0, 0, 0, 0.15);\n\t\tborder-radius: 4px;\n\t\tposition: relative;\n\t} */\n.field-group > * {\n\t--fgp-has-polyfil_gap-item: initial;\n}\n.field-group > * > * {\n\t--fgp-gap_item_row: initial;\n\t--fgp-gap_item_column: initial;\n}\n.field-group > * {\n\tpointer-events: all;\n\t--fgp-gap_container_row: initial;\n\t--fgp-gap_item_row: var(--fgp-has-polyfil_gap-item, var(--size-400)) !important;\n\t--fgp-gap_row: var(--fgp-gap_item_row);\n\t--fgp-gap_parent_row: var(--fgp-has-polyfil_gap-item, var(--size-400)) !important;\n\tmargin-top: var(--fgp-gap_row);\n\tpointer-events: all;\n\t--fgp-gap_container_column: initial;\n\t--fgp-gap_item_column: var(--fgp-has-polyfil_gap-item, var(--size-400)) !important;\n\t--fgp-gap_column: var(--fgp-gap_item_column);\n\t--fgp-gap_parent_column: var(--fgp-has-polyfil_gap-item, var(--size-400)) !important;\n\tmargin-left: var(--fgp-gap_column);\n}\n.field-group {\n\tdisplay: flex;\n\t--fgp-has-polyfil_gap-container: initial;\n\t--fgp-gap_container_row: var(--fgp-has-polyfil_gap-container, calc(var(--fgp-gap_parent_row, 0px) - var(--size-400))) !important;\n\tpointer-events: none;\n\t--fgp-gap_parent_row: initial;\n\t--fgp-gap_item_row: initial;\n\t--fgp-gap_row: var(--fgp-gap_container_row) !important;\n\tpadding-top: 0.02px;\n\t--fgp-margin-top: calc(var(--fgp-gap_row) + 0px);\n\tmargin-top: var(--fgp-margin-top) !important;\n\t--fgp-gap_container_column: var(--fgp-has-polyfil_gap-container, calc(var(--fgp-gap_parent_column, 0px) - var(--size-400))) !important;\n\tpointer-events: none;\n\t--fgp-gap_parent_column: initial;\n\t--fgp-gap_item_column: initial;\n\t--fgp-gap_column: var(--fgp-gap_container_column) !important;\n\tpadding-top: 0.02px;\n\t--fgp-margin-left: calc(var(--fgp-gap_column) + 0px);\n\tmargin-left: var(--fgp-margin-left) !important;\n}\n\n.field-group > * {\n\tflex-grow: 1;\n\tflex-basis: 100%;\n}\n/* Reset */\nbutton {\n\tfont: inherit;\n}\n\ntable {\n\tborder-spacing: 0;\n}\n\ntd {\n\tpadding: 0;\n}\n\n* {\n\tbox-sizing: border-box;\n\tpadding: 0;\n\tmargin: 0;\n}\n\nbody {\n\tbackground: var(--figma-color-bg, white);\n\tcolor: var(--figma-color-text, black);\n\tfont-family: Inter, sans-serif;\n\tfont-size: 11px;\n\tline-height: 1.454545;\n\tpadding: 0;\n\tmargin: 0;\n}\n\ninput {\n\tborder: none;\n\tfont: inherit;\n\tbackground-color: transparent;\n\tcolor: var(--figma-color-text, black)\n}\n\ninput:focus {\n\tborder: none;\n\toutline: none;\n}\n\n/* Hide arrows from input */\n/* Chrome, Safari, Edge, Opera */\ninput::-webkit-outer-spin-button,\ninput::-webkit-inner-spin-button {\n\t-webkit-appearance: none;\n\tmargin: 0;\n}\n\n/* Firefox */\ninput[type=\"number\"] {\n\t-moz-appearance: textfield;\n}\n\nul {\n\tlist-style: none;\n}\n\np {\n\tmargin-top: var(--size-100);\n\tmargin-bottom: var(--size-100);\n}\n\nbutton {\n\t/* margin-top: var(--size-200); */\n}\n\n:root {\n\t--color-blue: #18a0fb;\n\t--color-selection-a: #daebf7;\n\t--color-hover-fill: rgba(0, 0, 0, 0.06);\n\t--color-black-10: rgba(0, 0, 0, 0.1);\n\t--color-black-30: rgba(0, 0, 0, 0.3);\n\t--color-black-80: rgba(0, 0, 0, 0.8);\n\t--color-black-100: #000;\n\t--color-purple: #7B61FF;\n\n\t--size-0: 0px;\n\t--size-25: 2px;\n\t--size-50: 4px;\n\t--size-75: 6px;\n\t--size-100: 8px;\n\t--size-125: 10px;\n\t--size-150: 12px;\n\t--size-175: 14px;\n\t--size-200: 16px;\n\t--size-300: 24px;\n\t--size-400: 32px;\n\t--size-500: 40px;\n\t--size-600: 48px;\n\t--size-800: 64px;\n\t--size-1000: 80px;\n\n\t--border-radius-25: 2px;\n\t--border-radius-50: 4px;\n\t--border-radius-75: 6px;\n\t--border-radius-100: 8px;\n\t--border-radius-125: 10px;\n\t--border-radius-200: 16px;\n\t--border-radius-300: 24px;\n\t--border-radius-400: 32px;\n\t--border-radius-500: 40px;\n\t--border-radius-600: 48px;\n\t--border-radius-800: 64px;\n\t--border-radius-1000: 80px;\n\n\t--margin-0: var(--size-0);\n\t--margin-25: var(--size-25);\n\t--margin-50: var(--size-50);\n\t--margin-75: var(--size-75);\n\t--margin-100: var(--size-100);\n\t--margin-125: var(--size-125);\n\t--margin-150: var(--size-150);\n\t--margin-175: var(--size-175);\n\t--margin-200: var(--size-200);\n\t--margin-300: var(--size-300);\n\t--margin-400: var(--size-400);\n\t--margin-500: var(--size-800);\n\t--margin-600: var(--size-600);\n\t--margin-800: var(--size-800);\n\t--margin-1000: var(--size-1000);\n\n\t--padding-0: var(--size-0);\n\t--padding-50: var(--size-50);\n\t--padding-75: var(--size-75);\n\t--padding-100: var(--size-100);\n\t--padding-125: var(--size-125);\n\t--padding-150: var(--size-150);\n\t--padding-175: var(--size-175);\n\t--padding-200: var(--size-200);\n\t--padding-300: var(--size-300);\n\t--padding-400: var(--size-400);\n\t--padding-500: var(--size-800);\n\t--padding-600: var(--size-600);\n\t--padding-800: var(--size-800);\n\t--padding-1000: var(--size-1000);\n\n\n\t/* Figma */\n\t--elevation-400-menu-panel: 0px 10px 16px rgba(0, 0, 0, .35), 0px 2px 5px rgba(0, 0, 0, .35), inset 0px .5px 0px rgba(255, 255, 255, .08), inset 0px 0px .5px rgba(255, 255, 255, .35);\n\t--modal-box-shadow: var(--elevation-400-menu-panel, 0px 2px 14px rgba(0, 0, 0, .15), 0px 0px 0px .5px rgba(0, 0, 0, .2));\n}\n";
    styleInject(css_248z$1);

    var css_248z = ":root{\n\t--fgp-has-polyfil_gap-container: 0px;\n\t--fgp-has-polyfil_gap-item: 0px}.welcomePage .buttons .button{margin-top:var(--margin-200)}.wrapper{padding:var(--padding-200)}.container > *{\n\t--fgp-height_percentages-decimal: initial}.container > *{\n\t--fgp-has-polyfil_gap-item: initial}.container{\n\theight:100%;\n\tdisplay:flex;\n\tflex-direction:column;\n\t--fgp-height_percentages-decimal: 1 !important;--fgp-has-polyfil_gap-container: initial}.content .Button{margin-left:auto}.artwork > *{\n\t--fgp-has-polyfil_gap-item: initial}.artwork > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.artwork{\n\tdisplay:flex;\n\tflex-grow:1;\n\tjustify-content:center;\n\talign-items:center;\n\tmargin:0 -16px;\n\theight:322px;\n\tmax-height:322px;\n\t--fgp-has-polyfil_gap-container: initial;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 322px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 322px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(322px - var(--fgp-gap_container_row, 0%)) !important}.content{flex-grow:1;position:relative}.buttons{position:absolute;bottom:0;right:0}td{padding-right:var(--padding-75);padding-bottom:var(--padding-75)}input[type=\"radio\"] > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}input[type=\"radio\"] > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}input[type=\"radio\"]{\n\topacity:0;\n\twidth:0px;\n\theight:0px;\n\tmargin:0;\n\tpadding:0;\n\tposition:absolute;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 0px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 0px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(0px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 0px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 0px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(0px - var(--fgp-gap_container_row, 0%)) !important}.SectionTitle{line-height:var(--size-400)}.section-title>.SelectWrapper>.Select>.label{font-weight:600}.text-bold{font-weight:600}.RadioButtons > *{\n\t--fgp-has-polyfil_gap-item: initial}.RadioButtons{display:flex;flex-grow:0 !important;padding-top:2px;padding-bottom:2px;flex-grow:0;flex-basis:auto;position:relative;margin-left:calc(var(--fgp-gap_item_column, 0px) + 8px) !important;--fgp-has-polyfil_gap-container: initial}.RadioButtons:hover::before,.RadioButtons:focus-within::before{content:\"\";display:block;position:absolute;top:4px;left:0px;bottom:4px;right:0px;border-radius:2px;border:1px solid transparent;border-color:var(--figma-color-border, var(--color-black-10));user-select:none;pointer-events:none}.RadioButtons:focus-within::before{border-color:var(--figma-color-brand, var(--color-blue))}.RadioButtons:hover label{border-radius:0 !important}.RadioButtons:hover :first-child label{border-top-left-radius:2px !important;border-bottom-left-radius:2px !important}.RadioButtons:hover :last-child label{border-top-right-radius:2px !important;border-bottom-right-radius:2px !important}.RadioButtons>*{flex-grow:0}.RadioButtons:hover .icon-button{border-radius:0}.BottomBar > *{\n\t--fgp-has-polyfil_gap-item: initial}.BottomBar{display:flex;place-content:flex-end;position:absolute;bottom:0;left:0;right:0;border-top:1px solid var(--figma-color-border, var(--color-black-10));padding:var(--size-100);--fgp-has-polyfil_gap-container: initial}.SelectWrapper > *{\n\t--fgp-has-polyfil_gap-item: initial}.SelectWrapper{padding-top:2px;padding-bottom:2px;display:flex;--fgp-has-polyfil_gap-container: initial}.icon > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.icon > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.icon{\n\tdisplay:inline-block;\n\twidth:24px;\n\theight:24px;\n\tflex-grow:0;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 24px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 24px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(24px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 24px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 24px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(24px - var(--fgp-gap_container_row, 0%)) !important}.icon::before > *{\n\t--fgp-height_percentages-decimal: initial}.icon::before > *{\n\t--fgp-width_percentages-decimal: initial}.icon::before{\n\tcontent:\"\";\n\theight:100%;\n\tdisplay:block;\n\twidth:100%;\n\tbackground-repeat:no-repeat;\n\tbackground-position:center;\n\t--fgp-height_percentages-decimal: 1 !important;\n\t--fgp-width_percentages-decimal: 1 !important}.figma-light [icon=\"text-align-top\"] label::before{background-image:url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M15 1H1V2H15V1ZM8.35355 3.64645L8 3.29289L7.64645 3.64645L4.64645 6.64645L5.35355 7.35355L7.5 5.20711V13H8.5V5.20711L10.6464 7.35355L11.3536 6.64645L8.35355 3.64645Z' fill='black'/%3E%3C/svg%3E%0A\")}.figma-dark [icon=\"text-align-top\"] label::before{background-image:url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M15 1H1V2H15V1ZM8.35355 3.64645L8 3.29289L7.64645 3.64645L4.64645 6.64645L5.35355 7.35355L7.5 5.20711V13H8.5V5.20711L10.6464 7.35355L11.3536 6.64645L8.35355 3.64645Z' fill='white'/%3E%3C/svg%3E%0A\")}.figma-light [icon=\"text-align-middle\"] label::before{background-image:url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M8 6.20711L8.35355 5.85355L10.3536 3.85355L9.64645 3.14645L8.5 4.29289V0H7.5V4.29289L6.35355 3.14645L5.64645 3.85355L7.64645 5.85355L8 6.20711ZM8 9.79289L8.35355 10.1464L10.3536 12.1464L9.64645 12.8536L8.5 11.7071V16H7.5V11.7071L6.35355 12.8536L5.64645 12.1464L7.64645 10.1464L8 9.79289ZM1 8.5H15V7.5H1V8.5Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A\")}.figma-dark [icon=\"text-align-middle\"] label::before{background-image:url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M8 6.20711L8.35355 5.85355L10.3536 3.85355L9.64645 3.14645L8.5 4.29289V0H7.5V4.29289L6.35355 3.14645L5.64645 3.85355L7.64645 5.85355L8 6.20711ZM8 9.79289L8.35355 10.1464L10.3536 12.1464L9.64645 12.8536L8.5 11.7071V16H7.5V11.7071L6.35355 12.8536L5.64645 12.1464L7.64645 10.1464L8 9.79289ZM1 8.5H15V7.5H1V8.5Z' fill='white' fill-opacity='0.8'/%3E%3C/svg%3E%0A\")}.figma-light [icon=\"text-align-bottom\"] label::before{background-image:url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M8.35355 12.3536L8 12.7071L7.64645 12.3536L4.64645 9.35355L5.35355 8.64645L7.5 10.7929V3H8.5V10.7929L10.6464 8.64645L11.3536 9.35355L8.35355 12.3536ZM15 14V15H1V14H15Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A\")}.figma-dark [icon=\"text-align-bottom\"] label::before{background-image:url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M8.35355 12.3536L8 12.7071L7.64645 12.3536L4.64645 9.35355L5.35355 8.64645L7.5 10.7929V3H8.5V10.7929L10.6464 8.64645L11.3536 9.35355L8.35355 12.3536ZM15 14V15H1V14H15Z' fill='white' fill-opacity='0.8'/%3E%3C/svg%3E%0A\")}.figma-light [icon=\"template\"]::before{background-image:url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M1.82812 7.99988L2.164 7.664L3.539 6.289L3.87488 5.95312L4.54663 6.62488L4.21075 6.96075L3.17163 7.99988L4.21075 9.039L4.54663 9.37488L3.87488 10.0466L3.539 9.71075L2.164 8.33575L1.82812 7.99988ZM6.62488 11.4531L6.96075 11.789L7.99988 12.8281L9.039 11.789L9.37488 11.4531L10.0466 12.1249L9.71075 12.4608L8.33575 13.8358L7.99988 14.1716L7.664 13.8358L6.289 12.4608L5.95312 12.1249L6.62488 11.4531ZM5.95312 3.87488L6.289 3.539L7.664 2.164L7.99988 1.82812L8.33575 2.164L9.71075 3.539L10.0466 3.87488L9.37488 4.54663L9.039 4.21075L7.99988 3.17163L6.96075 4.21075L6.62488 4.54663L5.95312 3.87488ZM11.4531 9.37488L11.789 9.039L12.8281 7.99988L11.789 6.96075L11.4531 6.62488L12.1249 5.95312L12.4608 6.289L13.8358 7.664L14.1716 7.99988L13.8358 8.33575L12.4608 9.71075L12.1249 10.0466L11.4531 9.37488Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A\")}.figma-dark [icon=\"template\"]::before{background-image:url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M1.82812 7.99988L2.164 7.664L3.539 6.289L3.87488 5.95312L4.54663 6.62488L4.21075 6.96075L3.17163 7.99988L4.21075 9.039L4.54663 9.37488L3.87488 10.0466L3.539 9.71075L2.164 8.33575L1.82812 7.99988ZM6.62488 11.4531L6.96075 11.789L7.99988 12.8281L9.039 11.789L9.37488 11.4531L10.0466 12.1249L9.71075 12.4608L8.33575 13.8358L7.99988 14.1716L7.664 13.8358L6.289 12.4608L5.95312 12.1249L6.62488 11.4531ZM5.95312 3.87488L6.289 3.539L7.664 2.164L7.99988 1.82812L8.33575 2.164L9.71075 3.539L10.0466 3.87488L9.37488 4.54663L9.039 4.21075L7.99988 3.17163L6.96075 4.21075L6.62488 4.54663L5.95312 3.87488ZM11.4531 9.37488L11.789 9.039L12.8281 7.99988L11.789 6.96075L11.4531 6.62488L12.1249 5.95312L12.4608 6.289L13.8358 7.664L14.1716 7.99988L13.8358 8.33575L12.4608 9.71075L12.1249 10.0466L11.4531 9.37488Z' fill='white' fill-opacity='0.8'/%3E%3C/svg%3E%0A\")}.figma-light [icon=\"component\"]::before{background-image:url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M5.74254 4.74795L7.99981 2.5L10.2571 4.74795L7.99981 6.9959L5.74254 4.74795ZM4.74795 10.2571L2.5 7.9998L4.74795 5.74253L6.9959 7.9998L4.74795 10.2571ZM10.2571 11.2517L7.9998 13.4996L5.74253 11.2517L7.9998 9.00371L10.2571 11.2517ZM13.4996 7.99981L11.2517 5.74254L9.00371 7.99981L11.2517 10.2571L13.4996 7.99981Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A\")}.figma-dark [icon=\"component\"]::before{background-image:url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M5.74254 4.74795L7.99981 2.5L10.2571 4.74795L7.99981 6.9959L5.74254 4.74795ZM4.74795 10.2571L2.5 7.9998L4.74795 5.74253L6.9959 7.9998L4.74795 10.2571ZM10.2571 11.2517L7.9998 13.4996L5.74253 11.2517L7.9998 9.00371L10.2571 11.2517ZM13.4996 7.99981L11.2517 5.74254L9.00371 7.99981L11.2517 10.2571L13.4996 7.99981Z' fill='white' fill-opacity='0.8'/%3E%3C/svg%3E%0A\")}[icon=\"chevron-down\"] > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}[icon=\"chevron-down\"] > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}[icon=\"chevron-down\"]{\n\twidth:8px;\n\theight:8px;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 8px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 8px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(8px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 8px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 8px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(8px - var(--fgp-gap_container_row, 0%)) !important}.figma-light [icon=\"chevron-down\"]::before{background-image:url(\"data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M3.64648 6.35359L0.646484 3.35359L1.35359 2.64648L4.00004 5.29293L6.64648 2.64648L7.35359 3.35359L4.35359 6.35359L4.00004 6.70714L3.64648 6.35359Z' fill='black' fill-opacity='0.3'/%3E%3C/svg%3E%0A\")}.figma-dark [icon=\"chevron-down\"]::before{background-image:url(\"data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M3.64648 6.35359L0.646484 3.35359L1.35359 2.64648L4.00004 5.29293L6.64648 2.64648L7.35359 3.35359L4.35359 6.35359L4.00004 6.70714L3.64648 6.35359Z' fill='white' fill-opacity='0.3'/%3E%3C/svg%3E%0A\")}.figma-light [icon=\"plus\"]::before{background-image:url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M7.5 7.5V2.5H8.5V7.5H13.5V8.5H8.5V13.5H7.5V8.5H2.5V7.5H7.5Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A\")}.figma-dark [icon=\"plus\"]::before{background-image:url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M7.5 7.5V2.5H8.5V7.5H13.5V8.5H8.5V13.5H7.5V8.5H2.5V7.5H7.5Z' fill='white' fill-opacity='0.8'/%3E%3C/svg%3E%0A\")}.figma-light [icon=\"minus\"]::before{background-image:url(\"data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M22 16.5H10V15.5H22V16.5Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A\")}.figma-dark [icon=\"minus\"]::before{background-image:url(\"data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M22 16.5H10V15.5H22V16.5Z' fill='white' fill-opacity='0.8'/%3E%3C/svg%3E%0A\")}.figma-light [icon=\"swap\"]::before{background-image:url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M14.6096 5.68765L13.4349 7.15603C13.4268 7.10387 13.418 7.05185 13.4084 7C13.2569 6.18064 12.9203 5.40189 12.419 4.72539C11.7169 3.77797 10.7289 3.08128 9.60075 2.73808C8.47259 2.39489 7.264 2.42337 6.15326 2.81933C5.36015 3.10206 4.64691 3.56145 4.06479 4.15764C3.83166 4.3964 3.61956 4.6571 3.43178 4.93718L3.43192 4.93728L4.26237 5.49406L4.26252 5.49416C4.79977 4.69282 5.58035 4.08538 6.4891 3.76143C7.39785 3.43748 8.38666 3.41418 9.30967 3.69496C10.2327 3.97574 11.041 4.54574 11.6154 5.32088C12.1002 5.97502 12.3966 6.74603 12.4774 7.55063L10.2774 6.08398L9.7227 6.91603L12.7227 8.91603L13.1041 9.1703L13.3905 8.81235L15.3905 6.31235L14.6096 5.68765ZM2.60962 7.18765L0.609619 9.68765L1.39049 10.3123L2.56519 8.84397C2.57329 8.89614 2.58213 8.94815 2.59172 9C2.74323 9.81936 3.07981 10.5981 3.58113 11.2746C4.2832 12.222 5.27119 12.9187 6.39935 13.2619C7.52751 13.6051 8.7361 13.5766 9.84684 13.1807C10.64 12.8979 11.3532 12.4386 11.9353 11.8424C12.168 11.6041 12.3797 11.344 12.5672 11.0646L12.5683 11.0628L12.5682 11.0627L11.7377 10.5059L11.7376 10.5058L11.7365 10.5074C11.1993 11.308 10.4192 11.9148 9.51101 12.2386C8.60225 12.5625 7.61344 12.5858 6.69044 12.305C5.76744 12.0243 4.95911 11.4543 4.38471 10.6791C3.89996 10.025 3.60346 9.25397 3.52271 8.44937L5.7227 9.91603L6.2774 9.08398L3.2774 7.08398L2.89598 6.8297L2.60962 7.18765Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A\")}.figma-dark [icon=\"swap\"]::before{background-image:url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M14.6096 5.68765L13.4349 7.15603C13.4268 7.10387 13.418 7.05185 13.4084 7C13.2569 6.18064 12.9203 5.40189 12.419 4.72539C11.7169 3.77797 10.7289 3.08128 9.60075 2.73808C8.47259 2.39489 7.264 2.42337 6.15326 2.81933C5.36015 3.10206 4.64691 3.56145 4.06479 4.15764C3.83166 4.3964 3.61956 4.6571 3.43178 4.93718L3.43192 4.93728L4.26237 5.49406L4.26252 5.49416C4.79977 4.69282 5.58035 4.08538 6.4891 3.76143C7.39785 3.43748 8.38666 3.41418 9.30967 3.69496C10.2327 3.97574 11.041 4.54574 11.6154 5.32088C12.1002 5.97502 12.3966 6.74603 12.4774 7.55063L10.2774 6.08398L9.7227 6.91603L12.7227 8.91603L13.1041 9.1703L13.3905 8.81235L15.3905 6.31235L14.6096 5.68765ZM2.60962 7.18765L0.609619 9.68765L1.39049 10.3123L2.56519 8.84397C2.57329 8.89614 2.58213 8.94815 2.59172 9C2.74323 9.81936 3.07981 10.5981 3.58113 11.2746C4.2832 12.222 5.27119 12.9187 6.39935 13.2619C7.52751 13.6051 8.7361 13.5766 9.84684 13.1807C10.64 12.8979 11.3532 12.4386 11.9353 11.8424C12.168 11.6041 12.3797 11.344 12.5672 11.0646L12.5683 11.0628L12.5682 11.0627L11.7377 10.5059L11.7376 10.5058L11.7365 10.5074C11.1993 11.308 10.4192 11.9148 9.51101 12.2386C8.60225 12.5625 7.61344 12.5858 6.69044 12.305C5.76744 12.0243 4.95911 11.4543 4.38471 10.6791C3.89996 10.025 3.60346 9.25397 3.52271 8.44937L5.7227 9.91603L6.2774 9.08398L3.2774 7.08398L2.89598 6.8297L2.60962 7.18765Z' fill='white' fill-opacity='0.8'/%3E%3C/svg%3E%0A\")}.figma-light [icon=\"pencil\"]::before{background-image:url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M14.2561 5.71957L6.79292 13.1827L6.08763 13.888L6.08536 13.8903L6.0853 13.8904L6.08539 13.8904L6.08518 13.8905L4.87536 14.1324L3.0623 14.4951L2 14.7075L2.21246 13.6452L2.81708 10.6221L2.81699 10.622L3.52409 9.91494L10.9878 2.45126C11.5894 1.84958 12.565 1.84958 13.1666 2.45126L14.2561 3.5407C14.8578 4.14238 14.8578 5.11789 14.2561 5.71957ZM11.8336 6.72784L5.59216 12.9693L3.27476 13.4328L3.73832 11.1149L9.97951 4.87374L11.8336 6.72784ZM12.5407 6.02073L13.549 5.01247C13.7601 4.80131 13.7601 4.45896 13.549 4.2478L12.4595 3.15837C12.2484 2.94721 11.906 2.94721 11.6949 3.15837L10.6866 4.16663L12.5407 6.02073Z' fill='black' fill-opacity='0.8'/%3E%3C/svg%3E%0A\")}.figma-dark [icon=\"pencil\"]::before{background-image:url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M14.2561 5.71957L6.79292 13.1827L6.08763 13.888L6.08536 13.8903L6.0853 13.8904L6.08539 13.8904L6.08518 13.8905L4.87536 14.1324L3.0623 14.4951L2 14.7075L2.21246 13.6452L2.81708 10.6221L2.81699 10.622L3.52409 9.91494L10.9878 2.45126C11.5894 1.84958 12.565 1.84958 13.1666 2.45126L14.2561 3.5407C14.8578 4.14238 14.8578 5.11789 14.2561 5.71957ZM11.8336 6.72784L5.59216 12.9693L3.27476 13.4328L3.73832 11.1149L9.97951 4.87374L11.8336 6.72784ZM12.5407 6.02073L13.549 5.01247C13.7601 4.80131 13.7601 4.45896 13.549 4.2478L12.4595 3.15837C12.2484 2.94721 11.906 2.94721 11.6949 3.15837L10.6866 4.16663L12.5407 6.02073Z' fill='white' fill-opacity='0.8'/%3E%3C/svg%3E%0A\")}.figma-light [icon=\"ellipses\"]::before{background-image:url(\"data:image/svg+xml;charset=utf8,%3Csvg fill='none' height='32' width='32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath clip-rule='evenodd' d='M11.5 16a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm4.5 1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z' fill='%23000' fill-rule='evenodd'/%3E%3C/svg%3E\")\n\t}.figma-dark [icon=\"ellipses\"]::before{background-image:url(\"data:image/svg+xml;charset=utf8,%3Csvg fill='none' height='32' width='32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath clip-rule='evenodd' d='M11.5 16a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm4.5 1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z' fill='white' fill-opacity='0.8' fill-rule='evenodd'/%3E%3C/svg%3E\")\n\t}.figma-light [icon=\"arrow-right\"]::before{background-image:url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12.7071 8.00004L12.3536 7.64648L9.35355 4.64648L8.64645 5.35359L10.7929 7.50004H5L5 8.50004H10.7929L8.64645 10.6465L9.35355 11.3536L12.3536 8.35359L12.7071 8.00004Z' fill='black'/%3E%3C/svg%3E%0A\")}.figma-dark [icon=\"arrow-right\"]::before{background-image:url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12.7071 8.00004L12.3536 7.64648L9.35355 4.64648L8.64645 5.35359L10.7929 7.50004H5L5 8.50004H10.7929L8.64645 10.6465L9.35355 11.3536L12.3536 8.35359L12.7071 8.00004Z' fill='white'/%3E%3C/svg%3E%0A\")}.menu{display:none;position:absolute;background:var(--figma-color-bg, white);box-shadow:var(--modal-box-shadow);border-radius:2px;padding:var(--size-200);left:12px;right:12px;width:auto;min-width:242px;margin-top:1px}.menu__content{min-height:calc(4.5 * var(--size-400));max-height:calc(4.5 * var(--size-400));overflow-y:auto}.menu>*{display:block;padding:var(--margin-100) var(--margin-200);margin-left:calc(-1 * var(--margin-200));margin-right:calc(-1 * var(--margin-200));place-items:center}.menu>:first-child{margin-top:calc(-1 * var(--margin-200))}.menu>:last-child{margin-bottom:calc(-1 * var(--margin-200))}.menu ul{padding:0}.menu ul>* > *{\n\t--fgp-has-polyfil_gap-item: initial}.menu ul>*{display:flex;padding-left:var(--margin-200);padding-right:var(--margin-200);min-height:32px;place-items:center;--fgp-has-polyfil_gap-container: initial}.menu li{margin-left:calc(-1 * var(--margin-200));margin-right:calc(-1 * var(--margin-200))}.menu li:hover{background-color:var(--figma-color-bg-hover, var(--color-hover-fill))}.menu li.selected{background-color:var(--figma-color-bg-selected, var(--color-selection-a))}.Title > *{\n\t--fgp-has-polyfil_gap-item: initial}.Title{padding:var(--margin-100) var(--margin-200);border-bottom:1px solid var(--figma-color-border, var(--color-black-10));min-height:40px;display:flex;place-items:center;--fgp-has-polyfil_gap-container: initial}.Title>*{flex-grow:1}.Title>:last-child{margin-left:auto;flex-grow:0}.Title>p{margin:0}.ButtonIcon > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.ButtonIcon > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.ButtonIcon{\n\twidth:30px;\n\theight:30px;\n\tborder-radius:var(--border-radius-25);\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 30px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 30px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(30px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 30px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 30px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(30px - var(--fgp-gap_container_row, 0%)) !important}.ButtonIcon:last-child{margin-right:calc(-1 * var(--size-100))}.ButtonIcon:hover{background-color:var(--figma-color-bg-hover, var(--color-black-10))}.tooltip > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.tooltip{\n\tdisplay:none;\n\tcolor:#FFF;\n\tpadding:8px 0;\n\tposition:absolute;\n\ttop:3px;\n\tright:-2px;\n\tz-index:100;\n\twidth:160px;\n\tbackground:#222222;\n\tbox-shadow:0px 2px 7px rgba(0, 0, 0, 0.15), 0px 5px 17px rgba(0, 0, 0, 0.2);\n\tborder-radius:2px;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 160px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 160px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(160px - var(--fgp-gap_container_column, 0%)) !important}.tooltip input[type=\"checkbox\"]{position:absolute;opacity:0;cursor:pointer;height:0;width:0}.tooltip label{line-height:24px;padding-left:32px;padding-right:16px;position:relative;display:block}.tooltip label:hover{background-color:var(--blue)}.tooltip input[type=\"radio\"]:checked+label::before,.tooltip input[type=\"checkbox\"]:checked+label::before > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.tooltip input[type=\"radio\"]:checked+label::before,.tooltip input[type=\"checkbox\"]:checked+label::before > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.tooltip input[type=\"radio\"]:checked+label::before,.tooltip input[type=\"checkbox\"]:checked+label::before{\n\tdisplay:block;\n\tcontent:\"\";\n\ttop:4px;\n\tposition:absolute;\n\tleft:8px;\n\twidth:16px;\n\theight:16px;\n\tbackground-image:url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M13.2072 5.20718L7.70718 10.7072L7.00008 11.4143L6.29297 10.7072L3.29297 7.70718L4.70718 6.29297L7.00008 8.58586L11.793 3.79297L13.2072 5.20718Z' fill='white'/%3E%3C/svg%3E%0A\");\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 16px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 16px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(16px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 16px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 16px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(16px - var(--fgp-gap_container_row, 0%)) !important}.tooltip.wTriangle{top:unset;margin-top:4px;right:8px;left:unset}.tooltip.wTriangle::before > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.tooltip.wTriangle::before > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.tooltip.wTriangle::before{\n\tdisplay:block;\n\tcontent:\"\";\n\twidth:12px;\n\theight:12px;\n\tbackground-color:#222222;\n\ttransform:rotate(45deg);\n\tposition:absolute;\n\ttop:-3px;\n\tright:9px;\n\tz-index:-100;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 12px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 12px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(12px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 12px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 12px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(12px - var(--fgp-gap_container_row, 0%)) !important}.tooltop input[type=\"radio\"]:checked+label::before,.tooltop input[type=\"checkbox\"]:checked+label::before > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.tooltop input[type=\"radio\"]:checked+label::before,.tooltop input[type=\"checkbox\"]:checked+label::before > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.tooltop input[type=\"radio\"]:checked+label::before,.tooltop input[type=\"checkbox\"]:checked+label::before{\n\tdisplay:block;\n\tcontent:\"\";\n\ttop:4px;\n\tposition:absolute;\n\tleft:8px;\n\twidth:16px;\n\theight:16px;\n\tbackground-image:url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M13.2072 5.20718L7.70718 10.7072L7.00008 11.4143L6.29297 10.7072L3.29297 7.70718L4.70718 6.29297L7.00008 8.58586L11.793 3.79297L13.2072 5.20718Z' fill='white'/%3E%3C/svg%3E%0A\");\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 16px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 16px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(16px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 16px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 16px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(16px - var(--fgp-gap_container_row, 0%)) !important}.tooltip .selected{background-color:var(--color-blue)}.tooltip div:hover{background-color:var(--color-blue)}.tooltip-divider{display:block;margin-top:8px;margin-bottom:8px;border-bottom:1px solid rgba(255, 255, 255, 0.2)}.refresh > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.refresh > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.refresh{\n\theight:32px;\n\twidth:32px;\n\tborder-radius:2px;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 32px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 32px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(32px - var(--fgp-gap_container_row, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 32px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 32px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(32px - var(--fgp-gap_container_column, 0%)) !important}.refresh:hover{background-color:var(--figma-color-bg-tertiary, var(--color-selection-a))}.selected .refresh:hover{background-color:var(--figma-color-bg-selected-hover, var(--color-selection-a))}.item>div{display:none}.item:hover>div > *{\n\t--fgp-has-polyfil_gap-item: initial}.item:hover>div{display:flex;--fgp-has-polyfil_gap-container: initial}h6{font-size:1em;margin-bottom:var(--size-100)}.List{margin-top:8px}.ListItem > *{\n\t--fgp-has-polyfil_gap-item: initial}.ListItem{display:flex;place-items:center;min-height:34px;margin:0 -16px;padding:0 16px;--fgp-has-polyfil_gap-container: initial}.ListItem p{margin:0}.ListItem .element{font-weight:bold;min-width:50px}.ListItem>.buttons{margin-left:auto;display:none;margin-right:-8px}.ListItem:hover{background-color:var(--figma-color-bg-hover, var(--color-selection-a))}.ListItem:hover>.buttons{display:block}.figma-light .svg1 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-light .svg1 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-light .svg1{\n\tmargin:-9px 0 -26px 0;\n\twidth:188px;\n\theight:188px;\n\tbackground-size:contain;\n\tbackground-image:url(\"data:image/svg+xml,%3Csvg width='188' height='188' viewBox='0 0 188 188' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_113_2989)'%3E%3Cg clip-path='url(%23clip0_113_2989)'%3E%3Crect x='14' y='40' width='160' height='108' rx='1.44444' fill='white'/%3E%3Crect width='40' height='36' transform='translate(14 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='40' width='40' height='36' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(54 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='54' y='40' width='40' height='36' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(94 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='40' width='40' height='36' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(134 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='134' y='40' width='40' height='36' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(14 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='76' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(54 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='54' y='76' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(94 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='76' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(134 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='134' y='76' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(14 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='112' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(54 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='54' y='112' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(94 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='112' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(134 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='134' y='112' width='40' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='40' width='160' height='108' rx='1.44444' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='4' y='30' width='180' height='128' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='181' y='27' width='6' height='6' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='181' y='155' width='6' height='6' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='1' y='155' width='6' height='6' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='1' y='27' width='6' height='6' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Cpath d='M0.477273 11.598V10.2727H7.44034V11.598H4.7429V19H3.17472V11.598H0.477273ZM9.76739 19.1321C9.35261 19.1321 8.97903 19.0582 8.64665 18.9105C8.3171 18.7599 8.05574 18.5384 7.86256 18.2457C7.67222 17.9531 7.57705 17.5923 7.57705 17.1634C7.57705 16.794 7.64523 16.4886 7.78159 16.2472C7.91795 16.0057 8.10403 15.8125 8.33983 15.6676C8.57563 15.5227 8.84125 15.4134 9.1367 15.3395C9.435 15.2628 9.74324 15.2074 10.0614 15.1733C10.4449 15.1335 10.756 15.098 10.9947 15.0668C11.2333 15.0327 11.4066 14.9815 11.5145 14.9134C11.6253 14.8423 11.6807 14.733 11.6807 14.5852V14.5597C11.6807 14.2386 11.5856 13.9901 11.3952 13.8139C11.2049 13.6378 10.9307 13.5497 10.5728 13.5497C10.1949 13.5497 9.89523 13.6321 9.67364 13.7969C9.45489 13.9616 9.30716 14.1562 9.23045 14.3807L7.79011 14.1761C7.90375 13.7784 8.09125 13.446 8.35261 13.179C8.61398 12.9091 8.93358 12.7074 9.31142 12.5739C9.68926 12.4375 10.1069 12.3693 10.5643 12.3693C10.8796 12.3693 11.1935 12.4062 11.506 12.4801C11.8185 12.554 12.104 12.6761 12.3626 12.8466C12.6211 13.0142 12.8285 13.2429 12.9847 13.5327C13.1438 13.8224 13.2234 14.1847 13.2234 14.6193V19H11.7404V18.1009H11.6893C11.5955 18.2827 11.4634 18.4531 11.293 18.6122C11.1253 18.7685 10.9137 18.8949 10.658 18.9915C10.4052 19.0852 10.1083 19.1321 9.76739 19.1321ZM10.168 17.9986C10.4776 17.9986 10.7461 17.9375 10.9734 17.8153C11.2006 17.6903 11.3753 17.5256 11.4975 17.321C11.6225 17.1165 11.685 16.8935 11.685 16.652V15.8807C11.6367 15.9205 11.5543 15.9574 11.4378 15.9915C11.3242 16.0256 11.1964 16.0554 11.0543 16.081C10.9123 16.1065 10.7716 16.1293 10.6324 16.1491C10.4932 16.169 10.3725 16.1861 10.2702 16.2003C10.0401 16.2315 9.83415 16.2827 9.65233 16.3537C9.47051 16.4247 9.32705 16.5241 9.22193 16.652C9.11682 16.777 9.06426 16.9389 9.06426 17.1378C9.06426 17.4219 9.16795 17.6364 9.37534 17.7812C9.58273 17.9261 9.84693 17.9986 10.168 17.9986ZM14.9027 19V10.2727H16.4453V13.5369H16.5092C16.5887 13.3778 16.701 13.2088 16.8459 13.0298C16.9907 12.848 17.1868 12.6932 17.4339 12.5653C17.6811 12.4347 17.9964 12.3693 18.3799 12.3693C18.8856 12.3693 19.3416 12.4986 19.7478 12.7571C20.1569 13.0128 20.4808 13.392 20.7194 13.8949C20.9609 14.3949 21.0816 15.0085 21.0816 15.7358C21.0816 16.4545 20.9638 17.0653 20.728 17.5682C20.4922 18.071 20.1711 18.4545 19.7649 18.7188C19.3586 18.983 18.8984 19.1151 18.3842 19.1151C18.0092 19.1151 17.6981 19.0526 17.451 18.9276C17.2038 18.8026 17.0049 18.652 16.8544 18.4759C16.7066 18.2969 16.5916 18.1278 16.5092 17.9688H16.4197V19H14.9027ZM16.4155 15.7273C16.4155 16.1506 16.4751 16.5213 16.5944 16.8395C16.7166 17.1577 16.8913 17.4062 17.1186 17.5852C17.3487 17.7614 17.6271 17.8494 17.9538 17.8494C18.2947 17.8494 18.5802 17.7585 18.8103 17.5767C19.0405 17.392 19.2138 17.1406 19.3302 16.8224C19.4495 16.5014 19.5092 16.1364 19.5092 15.7273C19.5092 15.321 19.451 14.9602 19.3345 14.6449C19.218 14.3295 19.0447 14.0824 18.8146 13.9034C18.5845 13.7244 18.2976 13.6349 17.9538 13.6349C17.6243 13.6349 17.3444 13.7216 17.1143 13.8949C16.8842 14.0682 16.7095 14.3111 16.5902 14.6236C16.4737 14.9361 16.4155 15.304 16.4155 15.7273ZM23.9957 10.2727V19H22.4531V10.2727H23.9957ZM28.5397 19.1278C27.8835 19.1278 27.3167 18.9915 26.8394 18.7188C26.365 18.4432 25.9999 18.054 25.7443 17.5511C25.4886 17.0455 25.3607 16.4503 25.3607 15.7656C25.3607 15.0923 25.4886 14.5014 25.7443 13.9929C26.0028 13.4815 26.3636 13.0838 26.8266 12.7997C27.2897 12.5128 27.8337 12.3693 28.4587 12.3693C28.8622 12.3693 29.2428 12.4347 29.6008 12.5653C29.9616 12.6932 30.2798 12.892 30.5553 13.1619C30.8338 13.4318 31.0525 13.7756 31.2116 14.1932C31.3707 14.608 31.4502 15.1023 31.4502 15.6761V16.1491H26.0852V15.1094H29.9715C29.9687 14.8139 29.9048 14.5511 29.7798 14.321C29.6548 14.0881 29.4801 13.9048 29.2556 13.7713C29.034 13.6378 28.7755 13.571 28.4801 13.571C28.1647 13.571 27.8877 13.6477 27.6491 13.8011C27.4105 13.9517 27.2244 14.1506 27.0909 14.3977C26.9602 14.642 26.8934 14.9105 26.8906 15.2031V16.1108C26.8906 16.4915 26.9602 16.8182 27.0994 17.0909C27.2386 17.3608 27.4332 17.5682 27.6832 17.7131C27.9332 17.8551 28.2258 17.9261 28.561 17.9261C28.7855 17.9261 28.9886 17.8949 29.1704 17.8324C29.3522 17.767 29.5099 17.6719 29.6434 17.5469C29.7769 17.4219 29.8778 17.267 29.946 17.0824L31.3863 17.2443C31.2954 17.625 31.1221 17.9574 30.8664 18.2415C30.6136 18.5227 30.2897 18.7415 29.8948 18.8977C29.4999 19.0511 29.0482 19.1278 28.5397 19.1278Z' fill='%232F80ED'/%3E%3Crect x='54' y='40' width='40' height='36' stroke='%23A54EEA' stroke-width='2'/%3E%3Cg filter='url(%23filter1_d_113_2989)'%3E%3Cpath d='M92.7091 86.0833L90 72L101.92 79.0417L95.9601 80.6667L92.7091 86.0833Z' fill='%23010101'/%3E%3Cpath d='M90.2755 71.5336L89.2411 70.9226L89.4681 72.1023L92.1772 86.1857L92.4447 87.5764L93.1736 86.3621L96.3125 81.132L102.063 79.5643L103.299 79.2271L102.196 78.5753L90.2755 71.5336Z' stroke='white' stroke-width='1.08333' stroke-linecap='square'/%3E%3C/g%3E%3Cpath d='M34.6444 88.3362C35.0042 88.4452 35.2724 88.747 35.3386 89.1171L37.0156 98.4951C37.2121 99.5938 38.7879 99.5938 38.9844 98.4951L40.6614 89.1171C40.7276 88.747 40.9958 88.4452 41.3556 88.3362L46.8432 86.6726C47.7897 86.3856 47.7897 85.0455 46.8432 84.7586L41.3587 83.0959C40.9973 82.9863 40.7284 82.6825 40.6636 82.3103L38.9852 72.6628C38.793 71.558 37.207 71.558 37.0148 72.6628L35.3364 82.3103C35.2716 82.6825 35.0027 82.9863 34.6413 83.0959L29.1568 84.7586C28.2103 85.0455 28.2103 86.3856 29.1568 86.6726L34.6444 88.3362Z' fill='%23F26E6E'/%3E%3Cpath d='M90.0259 180.292C90.3875 180.399 90.6583 180.7 90.7265 181.071L91.0165 182.649C91.2172 183.741 92.7828 183.741 92.9835 182.649L93.2735 181.071C93.3417 180.7 93.6125 180.399 93.9741 180.292L94.7482 180.064C95.7044 179.782 95.7044 178.428 94.7482 178.146L93.9773 177.918C93.6141 177.811 93.3425 177.508 93.2758 177.135L92.9844 175.505C92.7879 174.407 91.2121 174.407 91.0156 175.505L90.7242 177.135C90.6575 177.508 90.3859 177.811 90.0227 177.918L89.2518 178.146C88.2956 178.428 88.2956 179.782 89.2518 180.064L90.0259 180.292Z' fill='%23F26E6E'/%3E%3Cpath d='M149.795 131.037C150.157 131.143 150.428 131.444 150.496 131.815L151.016 134.649C151.217 135.741 152.783 135.741 152.984 134.649L153.504 131.815C153.572 131.444 153.843 131.143 154.205 131.037L155.748 130.581C156.704 130.299 156.704 128.945 155.748 128.663L154.208 128.209C153.845 128.102 153.573 127.799 153.507 127.426L152.984 124.505C152.788 123.407 151.212 123.407 151.016 124.505L150.493 127.426C150.427 127.799 150.155 128.102 149.792 128.209L148.252 128.663C147.296 128.945 147.296 130.299 148.252 130.581L149.795 131.037Z' fill='%23F26E6E'/%3E%3Cpath d='M119.338 16.1018C119.697 16.2117 119.964 16.5136 120.03 16.8835L121.015 22.444C121.21 23.5447 122.79 23.5447 122.985 22.444L123.97 16.8835C124.036 16.5136 124.303 16.2117 124.662 16.1018L127.874 15.1194C128.817 14.8308 128.817 13.4954 127.874 13.2069L124.665 12.2254C124.304 12.1151 124.036 11.811 123.972 11.4391L122.985 5.71533C122.795 4.60855 121.205 4.60855 121.015 5.71533L120.028 11.4391C119.964 11.811 119.696 12.1151 119.335 12.2254L116.126 13.2069C115.183 13.4954 115.183 14.8308 116.126 15.1194L119.338 16.1018Z' fill='%23F26E6E'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_113_2989' x='1' y='39' width='186' height='138' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_113_2989'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_113_2989' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_113_2989' x='85.2322' y='67.6785' width='22.6958' height='25.7243' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='1.08333'/%3E%3CfeGaussianBlur stdDeviation='1.625'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_113_2989'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_113_2989' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_113_2989'%3E%3Crect x='14' y='40' width='160' height='108' rx='1.44444' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A\");\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 188px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 188px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(188px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 188px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 188px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(188px - var(--fgp-gap_container_row, 0%)) !important}.figma-dark .svg1 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-dark .svg1 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-dark .svg1{\n\tmargin:-9px 0 -26px 0;\n\twidth:188px;\n\theight:188px;\n\tbackground-size:contain;\n\tbackground-image:url(\"data:image/svg+xml,%3Csvg width='188' height='188' viewBox='0 0 188 188' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_113_3061)'%3E%3Cg clip-path='url(%23clip0_113_3061)'%3E%3Crect x='14' y='40' width='160' height='108' rx='1.44444' fill='%232D2D2C'/%3E%3Crect width='40' height='36' transform='translate(14 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='40' width='40' height='36' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(54 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='54' y='40' width='40' height='36' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(94 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='40' width='40' height='36' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(134 40)' fill='white' fill-opacity='0.01'/%3E%3Crect x='134' y='40' width='40' height='36' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(14 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='76' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(54 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='54' y='76' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(94 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='76' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(134 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='134' y='76' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(14 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='112' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(54 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='54' y='112' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(94 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='112' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='40' height='36' transform='translate(134 112)' fill='white' fill-opacity='0.01'/%3E%3Crect x='134' y='112' width='40' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='40' width='160' height='108' rx='1.44444' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='4' y='30' width='180' height='128' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='181' y='27' width='6' height='6' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='181' y='155' width='6' height='6' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='1' y='155' width='6' height='6' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='1' y='27' width='6' height='6' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Cpath d='M0.477273 11.598V10.2727H7.44034V11.598H4.7429V19H3.17472V11.598H0.477273ZM9.76739 19.1321C9.35261 19.1321 8.97903 19.0582 8.64665 18.9105C8.3171 18.7599 8.05574 18.5384 7.86256 18.2457C7.67222 17.9531 7.57705 17.5923 7.57705 17.1634C7.57705 16.794 7.64523 16.4886 7.78159 16.2472C7.91795 16.0057 8.10403 15.8125 8.33983 15.6676C8.57563 15.5227 8.84125 15.4134 9.1367 15.3395C9.435 15.2628 9.74324 15.2074 10.0614 15.1733C10.4449 15.1335 10.756 15.098 10.9947 15.0668C11.2333 15.0327 11.4066 14.9815 11.5145 14.9134C11.6253 14.8423 11.6807 14.733 11.6807 14.5852V14.5597C11.6807 14.2386 11.5856 13.9901 11.3952 13.8139C11.2049 13.6378 10.9307 13.5497 10.5728 13.5497C10.1949 13.5497 9.89523 13.6321 9.67364 13.7969C9.45489 13.9616 9.30716 14.1562 9.23045 14.3807L7.79011 14.1761C7.90375 13.7784 8.09125 13.446 8.35261 13.179C8.61398 12.9091 8.93358 12.7074 9.31142 12.5739C9.68926 12.4375 10.1069 12.3693 10.5643 12.3693C10.8796 12.3693 11.1935 12.4062 11.506 12.4801C11.8185 12.554 12.104 12.6761 12.3626 12.8466C12.6211 13.0142 12.8285 13.2429 12.9847 13.5327C13.1438 13.8224 13.2234 14.1847 13.2234 14.6193V19H11.7404V18.1009H11.6893C11.5955 18.2827 11.4634 18.4531 11.293 18.6122C11.1253 18.7685 10.9137 18.8949 10.658 18.9915C10.4052 19.0852 10.1083 19.1321 9.76739 19.1321ZM10.168 17.9986C10.4776 17.9986 10.7461 17.9375 10.9734 17.8153C11.2006 17.6903 11.3753 17.5256 11.4975 17.321C11.6225 17.1165 11.685 16.8935 11.685 16.652V15.8807C11.6367 15.9205 11.5543 15.9574 11.4378 15.9915C11.3242 16.0256 11.1964 16.0554 11.0543 16.081C10.9123 16.1065 10.7716 16.1293 10.6324 16.1491C10.4932 16.169 10.3725 16.1861 10.2702 16.2003C10.0401 16.2315 9.83415 16.2827 9.65233 16.3537C9.47051 16.4247 9.32705 16.5241 9.22193 16.652C9.11682 16.777 9.06426 16.9389 9.06426 17.1378C9.06426 17.4219 9.16795 17.6364 9.37534 17.7812C9.58273 17.9261 9.84693 17.9986 10.168 17.9986ZM14.9027 19V10.2727H16.4453V13.5369H16.5092C16.5887 13.3778 16.701 13.2088 16.8459 13.0298C16.9907 12.848 17.1868 12.6932 17.4339 12.5653C17.6811 12.4347 17.9964 12.3693 18.3799 12.3693C18.8856 12.3693 19.3416 12.4986 19.7478 12.7571C20.1569 13.0128 20.4808 13.392 20.7194 13.8949C20.9609 14.3949 21.0816 15.0085 21.0816 15.7358C21.0816 16.4545 20.9638 17.0653 20.728 17.5682C20.4922 18.071 20.1711 18.4545 19.7649 18.7188C19.3586 18.983 18.8984 19.1151 18.3842 19.1151C18.0092 19.1151 17.6981 19.0526 17.451 18.9276C17.2038 18.8026 17.0049 18.652 16.8544 18.4759C16.7066 18.2969 16.5916 18.1278 16.5092 17.9688H16.4197V19H14.9027ZM16.4155 15.7273C16.4155 16.1506 16.4751 16.5213 16.5944 16.8395C16.7166 17.1577 16.8913 17.4062 17.1186 17.5852C17.3487 17.7614 17.6271 17.8494 17.9538 17.8494C18.2947 17.8494 18.5802 17.7585 18.8103 17.5767C19.0405 17.392 19.2138 17.1406 19.3302 16.8224C19.4495 16.5014 19.5092 16.1364 19.5092 15.7273C19.5092 15.321 19.451 14.9602 19.3345 14.6449C19.218 14.3295 19.0447 14.0824 18.8146 13.9034C18.5845 13.7244 18.2976 13.6349 17.9538 13.6349C17.6243 13.6349 17.3444 13.7216 17.1143 13.8949C16.8842 14.0682 16.7095 14.3111 16.5902 14.6236C16.4737 14.9361 16.4155 15.304 16.4155 15.7273ZM23.9957 10.2727V19H22.4531V10.2727H23.9957ZM28.5397 19.1278C27.8835 19.1278 27.3167 18.9915 26.8394 18.7188C26.365 18.4432 25.9999 18.054 25.7443 17.5511C25.4886 17.0455 25.3607 16.4503 25.3607 15.7656C25.3607 15.0923 25.4886 14.5014 25.7443 13.9929C26.0028 13.4815 26.3636 13.0838 26.8266 12.7997C27.2897 12.5128 27.8337 12.3693 28.4587 12.3693C28.8622 12.3693 29.2428 12.4347 29.6008 12.5653C29.9616 12.6932 30.2798 12.892 30.5553 13.1619C30.8338 13.4318 31.0525 13.7756 31.2116 14.1932C31.3707 14.608 31.4502 15.1023 31.4502 15.6761V16.1491H26.0852V15.1094H29.9715C29.9687 14.8139 29.9048 14.5511 29.7798 14.321C29.6548 14.0881 29.4801 13.9048 29.2556 13.7713C29.034 13.6378 28.7755 13.571 28.4801 13.571C28.1647 13.571 27.8877 13.6477 27.6491 13.8011C27.4105 13.9517 27.2244 14.1506 27.0909 14.3977C26.9602 14.642 26.8934 14.9105 26.8906 15.2031V16.1108C26.8906 16.4915 26.9602 16.8182 27.0994 17.0909C27.2386 17.3608 27.4332 17.5682 27.6832 17.7131C27.9332 17.8551 28.2258 17.9261 28.561 17.9261C28.7855 17.9261 28.9886 17.8949 29.1704 17.8324C29.3522 17.767 29.5099 17.6719 29.6434 17.5469C29.7769 17.4219 29.8778 17.267 29.946 17.0824L31.3863 17.2443C31.2954 17.625 31.1221 17.9574 30.8664 18.2415C30.6136 18.5227 30.2897 18.7415 29.8948 18.8977C29.4999 19.0511 29.0482 19.1278 28.5397 19.1278Z' fill='%232F80ED'/%3E%3Crect x='54' y='40' width='40' height='36' stroke='%23A54EEA' stroke-width='2'/%3E%3Cg filter='url(%23filter1_d_113_3061)'%3E%3Cpath d='M92.7091 86.0833L90 72L101.92 79.0417L95.9601 80.6667L92.7091 86.0833Z' fill='%23010101'/%3E%3Cpath d='M90.2755 71.5336L89.2411 70.9226L89.4681 72.1023L92.1772 86.1857L92.4447 87.5764L93.1736 86.3621L96.3125 81.132L102.063 79.5643L103.299 79.2271L102.196 78.5753L90.2755 71.5336Z' stroke='white' stroke-width='1.08333' stroke-linecap='square'/%3E%3C/g%3E%3Cpath d='M34.6444 88.3362C35.0042 88.4452 35.2724 88.747 35.3386 89.1171L37.0156 98.4951C37.2121 99.5938 38.7879 99.5938 38.9844 98.4951L40.6614 89.1171C40.7276 88.747 40.9958 88.4452 41.3556 88.3362L46.8432 86.6726C47.7897 86.3856 47.7897 85.0455 46.8432 84.7586L41.3587 83.0959C40.9973 82.9863 40.7284 82.6825 40.6636 82.3103L38.9852 72.6628C38.793 71.558 37.207 71.558 37.0148 72.6628L35.3364 82.3103C35.2716 82.6825 35.0027 82.9863 34.6413 83.0959L29.1568 84.7586C28.2103 85.0455 28.2103 86.3856 29.1568 86.6726L34.6444 88.3362Z' fill='%23F26E6E'/%3E%3Cpath d='M90.0259 180.292C90.3875 180.399 90.6583 180.7 90.7265 181.071L91.0165 182.649C91.2172 183.741 92.7828 183.741 92.9835 182.649L93.2735 181.071C93.3417 180.7 93.6125 180.399 93.9741 180.292L94.7482 180.064C95.7044 179.782 95.7044 178.428 94.7482 178.146L93.9773 177.918C93.6141 177.811 93.3425 177.508 93.2758 177.135L92.9844 175.505C92.7879 174.407 91.2121 174.407 91.0156 175.505L90.7242 177.135C90.6575 177.508 90.3859 177.811 90.0227 177.918L89.2518 178.146C88.2956 178.428 88.2956 179.782 89.2518 180.064L90.0259 180.292Z' fill='%23F26E6E'/%3E%3Cpath d='M149.795 131.037C150.157 131.143 150.428 131.444 150.496 131.815L151.016 134.649C151.217 135.741 152.783 135.741 152.984 134.649L153.504 131.815C153.572 131.444 153.843 131.143 154.205 131.037L155.748 130.581C156.704 130.299 156.704 128.945 155.748 128.663L154.208 128.209C153.845 128.102 153.573 127.799 153.507 127.426L152.984 124.505C152.788 123.407 151.212 123.407 151.016 124.505L150.493 127.426C150.427 127.799 150.155 128.102 149.792 128.209L148.252 128.663C147.296 128.945 147.296 130.299 148.252 130.581L149.795 131.037Z' fill='%23F26E6E'/%3E%3Cpath d='M119.338 16.1018C119.697 16.2117 119.964 16.5136 120.03 16.8835L121.015 22.444C121.21 23.5447 122.79 23.5447 122.985 22.444L123.97 16.8835C124.036 16.5136 124.303 16.2117 124.662 16.1018L127.874 15.1194C128.817 14.8308 128.817 13.4954 127.874 13.2069L124.665 12.2254C124.304 12.1151 124.036 11.811 123.972 11.4391L122.985 5.71533C122.795 4.60855 121.205 4.60855 121.015 5.71533L120.028 11.4391C119.964 11.811 119.696 12.1151 119.335 12.2254L116.126 13.2069C115.183 13.4954 115.183 14.8308 116.126 15.1194L119.338 16.1018Z' fill='%23F26E6E'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_113_3061' x='1' y='39' width='186' height='138' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_113_3061'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_113_3061' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_113_3061' x='85.2322' y='67.6785' width='22.6958' height='25.7243' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='1.08333'/%3E%3CfeGaussianBlur stdDeviation='1.625'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_113_3061'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_113_3061' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_113_3061'%3E%3Crect x='14' y='40' width='160' height='108' rx='1.44444' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A\");\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 188px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 188px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(188px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 188px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 188px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(188px - var(--fgp-gap_container_row, 0%)) !important}.figma-light .svg2 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-light .svg2 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-light .svg2{\n\tmargin-right:-100px !important;\n\twidth:315px;\n\theight:202px;\n\tbackground-size:contain;\n\tbackground-image:url(\"data:image/svg+xml,%3Csvg width='313' height='202' viewBox='0 0 313 202' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_108_4278)'%3E%3Cg clip-path='url(%23clip0_108_4278)'%3E%3Crect x='97' y='31' width='200' height='135' rx='2' fill='white'/%3E%3Crect width='100' height='45' transform='translate(97 31)' fill='white' fill-opacity='0.01'/%3E%3Crect x='97' y='31' width='100' height='45' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='100' height='45' transform='translate(197 31)' fill='white' fill-opacity='0.01'/%3E%3Crect x='197' y='31' width='100' height='45' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='100' height='45' transform='translate(97 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='97' y='76' width='100' height='45' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='100' height='45' transform='translate(197 76)' fill='white' fill-opacity='0.01'/%3E%3Crect x='197' y='76' width='100' height='45' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='100' height='45' transform='translate(97 121)' fill='white' fill-opacity='0.01'/%3E%3Crect x='97' y='121' width='100' height='45' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='100' height='45' transform='translate(197 121)' fill='white' fill-opacity='0.01'/%3E%3Crect x='197' y='121' width='100' height='45' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='97' y='31' width='200' height='135' rx='2' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='87' y='21' width='220' height='155' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='304' y='18' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='304' y='173' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='84' y='173' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='84' y='18' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M89 0L86.375 2.625L89 5.25L91.625 2.625L89 0ZM89 6.75L86.375 9.375L89 12L91.625 9.375L89 6.75ZM83 6L85.625 3.375L88.25 6L85.625 8.625L83 6ZM92.375 3.375L89.75 6L92.375 8.625L95 6L92.375 3.375Z' fill='%23A54EEA'/%3E%3Cpath d='M98.4773 2.59801V1.27273H105.44V2.59801H102.743V10H101.175V2.59801H98.4773ZM107.767 10.1321C107.353 10.1321 106.979 10.0582 106.647 9.91051C106.317 9.75994 106.056 9.53835 105.863 9.24574C105.672 8.95312 105.577 8.59233 105.577 8.16335C105.577 7.79403 105.645 7.48864 105.782 7.24716C105.918 7.00568 106.104 6.8125 106.34 6.66761C106.576 6.52273 106.841 6.41335 107.137 6.33949C107.435 6.26278 107.743 6.20739 108.061 6.1733C108.445 6.13352 108.756 6.09801 108.995 6.06676C109.233 6.03267 109.407 5.98153 109.515 5.91335C109.625 5.84233 109.681 5.73295 109.681 5.58523V5.55966C109.681 5.23864 109.586 4.99006 109.395 4.81392C109.205 4.63778 108.931 4.54972 108.573 4.54972C108.195 4.54972 107.895 4.6321 107.674 4.79688C107.455 4.96165 107.307 5.15625 107.23 5.38068L105.79 5.17614C105.904 4.77841 106.091 4.44602 106.353 4.17898C106.614 3.90909 106.934 3.70739 107.311 3.57386C107.689 3.4375 108.107 3.36932 108.564 3.36932C108.88 3.36932 109.194 3.40625 109.506 3.48011C109.819 3.55398 110.104 3.67614 110.363 3.84659C110.621 4.0142 110.828 4.2429 110.985 4.53267C111.144 4.82244 111.223 5.18466 111.223 5.61932V10H109.74V9.10085H109.689C109.596 9.28267 109.463 9.45312 109.293 9.61222C109.125 9.76847 108.914 9.89489 108.658 9.99148C108.405 10.0852 108.108 10.1321 107.767 10.1321ZM108.168 8.99858C108.478 8.99858 108.746 8.9375 108.973 8.81534C109.201 8.69034 109.375 8.52557 109.497 8.32102C109.622 8.11648 109.685 7.89347 109.685 7.65199V6.88068C109.637 6.92045 109.554 6.95739 109.438 6.99148C109.324 7.02557 109.196 7.0554 109.054 7.08097C108.912 7.10653 108.772 7.12926 108.632 7.14915C108.493 7.16903 108.373 7.18608 108.27 7.20028C108.04 7.23153 107.834 7.28267 107.652 7.35369C107.471 7.42472 107.327 7.52415 107.222 7.65199C107.117 7.77699 107.064 7.93892 107.064 8.13778C107.064 8.42188 107.168 8.63636 107.375 8.78125C107.583 8.92614 107.847 8.99858 108.168 8.99858ZM112.903 10V1.27273H114.445V4.53693H114.509C114.589 4.37784 114.701 4.20881 114.846 4.02983C114.991 3.84801 115.187 3.69318 115.434 3.56534C115.681 3.43466 115.996 3.36932 116.38 3.36932C116.886 3.36932 117.342 3.49858 117.748 3.7571C118.157 4.01278 118.481 4.39205 118.719 4.89489C118.961 5.39489 119.082 6.00852 119.082 6.7358C119.082 7.45455 118.964 8.06534 118.728 8.56818C118.492 9.07102 118.171 9.45455 117.765 9.71875C117.359 9.98295 116.898 10.1151 116.384 10.1151C116.009 10.1151 115.698 10.0526 115.451 9.92756C115.204 9.80256 115.005 9.65199 114.854 9.47585C114.707 9.29687 114.592 9.12784 114.509 8.96875H114.42V10H112.903ZM114.415 6.72727C114.415 7.15057 114.475 7.52131 114.594 7.83949C114.717 8.15767 114.891 8.40625 115.119 8.58523C115.349 8.76136 115.627 8.84943 115.954 8.84943C116.295 8.84943 116.58 8.75852 116.81 8.5767C117.04 8.39205 117.214 8.14062 117.33 7.82244C117.45 7.50142 117.509 7.13636 117.509 6.72727C117.509 6.32102 117.451 5.96023 117.334 5.64489C117.218 5.32955 117.045 5.08239 116.815 4.90341C116.584 4.72443 116.298 4.63494 115.954 4.63494C115.624 4.63494 115.344 4.72159 115.114 4.89489C114.884 5.06818 114.709 5.31108 114.59 5.62358C114.474 5.93608 114.415 6.30398 114.415 6.72727ZM121.996 1.27273V10H120.453V1.27273H121.996ZM126.54 10.1278C125.883 10.1278 125.317 9.99148 124.839 9.71875C124.365 9.44318 124 9.05398 123.744 8.55114C123.489 8.04545 123.361 7.45028 123.361 6.76562C123.361 6.09233 123.489 5.50142 123.744 4.9929C124.003 4.48153 124.364 4.08381 124.827 3.79972C125.29 3.51278 125.834 3.36932 126.459 3.36932C126.862 3.36932 127.243 3.43466 127.601 3.56534C127.962 3.69318 128.28 3.89205 128.555 4.16193C128.834 4.43182 129.053 4.77557 129.212 5.19318C129.371 5.60795 129.45 6.10227 129.45 6.67614V7.14915H124.085V6.10938H127.972C127.969 5.81392 127.905 5.55114 127.78 5.32102C127.655 5.08807 127.48 4.90483 127.256 4.77131C127.034 4.63778 126.776 4.57102 126.48 4.57102C126.165 4.57102 125.888 4.64773 125.649 4.80114C125.41 4.9517 125.224 5.15057 125.091 5.39773C124.96 5.64205 124.893 5.91051 124.891 6.20312V7.1108C124.891 7.49148 124.96 7.81818 125.099 8.09091C125.239 8.3608 125.433 8.56818 125.683 8.71307C125.933 8.85511 126.226 8.92614 126.561 8.92614C126.785 8.92614 126.989 8.89489 127.17 8.83239C127.352 8.76705 127.51 8.67188 127.643 8.54688C127.777 8.42188 127.878 8.26705 127.946 8.08239L129.386 8.24432C129.295 8.625 129.122 8.95739 128.866 9.24148C128.614 9.52273 128.29 9.74148 127.895 9.89773C127.5 10.0511 127.048 10.1278 126.54 10.1278ZM137.385 1.27273V10H135.804V2.81108H135.752L133.711 4.11506V2.66619L135.88 1.27273H137.385Z' fill='%23A54EEA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M18.4123 79.8982C21.9985 78.6198 25.9007 78.5278 29.5432 79.6359C33.1857 80.7439 36.3756 82.9934 38.6424 86.0523C40.3868 88.4063 41.5135 91.1439 41.9401 94.0157L46.4462 88.3831L48.0079 89.6325L41.9142 97.2497L41.3415 97.9656L40.5786 97.4571L31.438 91.3633L32.5474 89.6992L40.0118 94.6755C39.6775 91.994 38.6574 89.4317 37.0355 87.2431C35.024 84.5286 32.1934 82.5326 28.9611 81.5493C25.7289 80.566 22.2662 80.6477 19.0839 81.7821C15.9015 82.9165 13.168 85.0437 11.2866 87.8499L9.62545 86.7361C11.7456 83.5738 14.8261 81.1766 18.4123 79.8982ZM6.83609 96.0003L0.74234 103.617L2.30408 104.867L6.80997 99.2345C7.23661 102.106 8.36326 104.844 10.1077 107.198C12.3745 110.257 15.5644 112.506 19.2069 113.614C22.8493 114.722 26.7515 114.63 30.3377 113.352C33.924 112.073 37.0044 109.676 39.1246 106.514L37.4634 105.4C35.582 108.206 32.8485 110.333 29.6662 111.468C26.4838 112.602 23.0212 112.684 19.7889 111.701C16.5567 110.717 13.726 108.721 11.7145 106.007C10.0926 103.818 9.07252 101.256 8.73823 98.5744L16.2029 103.551L17.3123 101.887L8.17166 95.7929L7.40882 95.2844L6.83609 96.0003Z' fill='%23CFCFCF'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_108_4278' x='81' y='30' width='232' height='172' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='20'/%3E%3CfeGaussianBlur stdDeviation='7.5'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_108_4278'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_108_4278' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_108_4278'%3E%3Crect x='97' y='31' width='200' height='135' rx='2' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A\");\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 315px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 315px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(315px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 202px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 202px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(202px - var(--fgp-gap_container_row, 0%)) !important}.figma-dark .svg2 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-dark .svg2 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-dark .svg2{\n\tmargin-right:-130px !important;\n\twidth:320px;\n\theight:211px;\n\tbackground-size:contain;\n\tbackground-image:url(\"data:image/svg+xml,%3Csvg width='320' height='210' viewBox='0 0 320 210' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_108_4327)'%3E%3Cg clip-path='url(%23clip0_108_4327)'%3E%3Crect x='102' y='39' width='200' height='135' rx='2' fill='%232D2D2C'/%3E%3Crect width='100' height='45' transform='translate(102 39)' fill='white' fill-opacity='0.01'/%3E%3Crect x='102' y='39' width='100' height='45' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='100' height='45' transform='translate(202 39)' fill='white' fill-opacity='0.01'/%3E%3Crect x='202' y='39' width='100' height='45' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='100' height='45' transform='translate(102 84)' fill='white' fill-opacity='0.01'/%3E%3Crect x='102' y='84' width='100' height='45' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='100' height='45' transform='translate(202 84)' fill='white' fill-opacity='0.01'/%3E%3Crect x='202' y='84' width='100' height='45' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='100' height='45' transform='translate(102 129)' fill='white' fill-opacity='0.01'/%3E%3Crect x='102' y='129' width='100' height='45' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='100' height='45' transform='translate(202 129)' fill='white' fill-opacity='0.01'/%3E%3Crect x='202' y='129' width='100' height='45' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='102' y='39' width='200' height='135' rx='2' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='92' y='29' width='220' height='155' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='309' y='26' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='309' y='181' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='89' y='181' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='89' y='26' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M94 8L91.375 10.625L94 13.25L96.625 10.625L94 8ZM94 14.75L91.375 17.375L94 20L96.625 17.375L94 14.75ZM88 14L90.625 11.375L93.25 14L90.625 16.625L88 14ZM97.375 11.375L94.75 14L97.375 16.625L100 14L97.375 11.375Z' fill='%23A54EEA'/%3E%3Cpath d='M103.477 10.598V9.27273H110.44V10.598H107.743V18H106.175V10.598H103.477ZM112.767 18.1321C112.353 18.1321 111.979 18.0582 111.647 17.9105C111.317 17.7599 111.056 17.5384 110.863 17.2457C110.672 16.9531 110.577 16.5923 110.577 16.1634C110.577 15.794 110.645 15.4886 110.782 15.2472C110.918 15.0057 111.104 14.8125 111.34 14.6676C111.576 14.5227 111.841 14.4134 112.137 14.3395C112.435 14.2628 112.743 14.2074 113.061 14.1733C113.445 14.1335 113.756 14.098 113.995 14.0668C114.233 14.0327 114.407 13.9815 114.515 13.9134C114.625 13.8423 114.681 13.733 114.681 13.5852V13.5597C114.681 13.2386 114.586 12.9901 114.395 12.8139C114.205 12.6378 113.931 12.5497 113.573 12.5497C113.195 12.5497 112.895 12.6321 112.674 12.7969C112.455 12.9616 112.307 13.1562 112.23 13.3807L110.79 13.1761C110.904 12.7784 111.091 12.446 111.353 12.179C111.614 11.9091 111.934 11.7074 112.311 11.5739C112.689 11.4375 113.107 11.3693 113.564 11.3693C113.88 11.3693 114.194 11.4062 114.506 11.4801C114.819 11.554 115.104 11.6761 115.363 11.8466C115.621 12.0142 115.828 12.2429 115.985 12.5327C116.144 12.8224 116.223 13.1847 116.223 13.6193V18H114.74V17.1009H114.689C114.596 17.2827 114.463 17.4531 114.293 17.6122C114.125 17.7685 113.914 17.8949 113.658 17.9915C113.405 18.0852 113.108 18.1321 112.767 18.1321ZM113.168 16.9986C113.478 16.9986 113.746 16.9375 113.973 16.8153C114.201 16.6903 114.375 16.5256 114.497 16.321C114.622 16.1165 114.685 15.8935 114.685 15.652V14.8807C114.637 14.9205 114.554 14.9574 114.438 14.9915C114.324 15.0256 114.196 15.0554 114.054 15.081C113.912 15.1065 113.772 15.1293 113.632 15.1491C113.493 15.169 113.373 15.1861 113.27 15.2003C113.04 15.2315 112.834 15.2827 112.652 15.3537C112.471 15.4247 112.327 15.5241 112.222 15.652C112.117 15.777 112.064 15.9389 112.064 16.1378C112.064 16.4219 112.168 16.6364 112.375 16.7812C112.583 16.9261 112.847 16.9986 113.168 16.9986ZM117.903 18V9.27273H119.445V12.5369H119.509C119.589 12.3778 119.701 12.2088 119.846 12.0298C119.991 11.848 120.187 11.6932 120.434 11.5653C120.681 11.4347 120.996 11.3693 121.38 11.3693C121.886 11.3693 122.342 11.4986 122.748 11.7571C123.157 12.0128 123.481 12.392 123.719 12.8949C123.961 13.3949 124.082 14.0085 124.082 14.7358C124.082 15.4545 123.964 16.0653 123.728 16.5682C123.492 17.071 123.171 17.4545 122.765 17.7188C122.359 17.983 121.898 18.1151 121.384 18.1151C121.009 18.1151 120.698 18.0526 120.451 17.9276C120.204 17.8026 120.005 17.652 119.854 17.4759C119.707 17.2969 119.592 17.1278 119.509 16.9688H119.42V18H117.903ZM119.415 14.7273C119.415 15.1506 119.475 15.5213 119.594 15.8395C119.717 16.1577 119.891 16.4062 120.119 16.5852C120.349 16.7614 120.627 16.8494 120.954 16.8494C121.295 16.8494 121.58 16.7585 121.81 16.5767C122.04 16.392 122.214 16.1406 122.33 15.8224C122.45 15.5014 122.509 15.1364 122.509 14.7273C122.509 14.321 122.451 13.9602 122.334 13.6449C122.218 13.3295 122.045 13.0824 121.815 12.9034C121.584 12.7244 121.298 12.6349 120.954 12.6349C120.624 12.6349 120.344 12.7216 120.114 12.8949C119.884 13.0682 119.709 13.3111 119.59 13.6236C119.474 13.9361 119.415 14.304 119.415 14.7273ZM126.996 9.27273V18H125.453V9.27273H126.996ZM131.54 18.1278C130.883 18.1278 130.317 17.9915 129.839 17.7188C129.365 17.4432 129 17.054 128.744 16.5511C128.489 16.0455 128.361 15.4503 128.361 14.7656C128.361 14.0923 128.489 13.5014 128.744 12.9929C129.003 12.4815 129.364 12.0838 129.827 11.7997C130.29 11.5128 130.834 11.3693 131.459 11.3693C131.862 11.3693 132.243 11.4347 132.601 11.5653C132.962 11.6932 133.28 11.892 133.555 12.1619C133.834 12.4318 134.053 12.7756 134.212 13.1932C134.371 13.608 134.45 14.1023 134.45 14.6761V15.1491H129.085V14.1094H132.972C132.969 13.8139 132.905 13.5511 132.78 13.321C132.655 13.0881 132.48 12.9048 132.256 12.7713C132.034 12.6378 131.776 12.571 131.48 12.571C131.165 12.571 130.888 12.6477 130.649 12.8011C130.41 12.9517 130.224 13.1506 130.091 13.3977C129.96 13.642 129.893 13.9105 129.891 14.2031V15.1108C129.891 15.4915 129.96 15.8182 130.099 16.0909C130.239 16.3608 130.433 16.5682 130.683 16.7131C130.933 16.8551 131.226 16.9261 131.561 16.9261C131.785 16.9261 131.989 16.8949 132.17 16.8324C132.352 16.767 132.51 16.6719 132.643 16.5469C132.777 16.4219 132.878 16.267 132.946 16.0824L134.386 16.2443C134.295 16.625 134.122 16.9574 133.866 17.2415C133.614 17.5227 133.29 17.7415 132.895 17.8977C132.5 18.0511 132.048 18.1278 131.54 18.1278ZM142.385 9.27273V18H140.804V10.8111H140.752L138.711 12.1151V10.6662L140.88 9.27273H142.385Z' fill='%23A54EEA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M18.4123 87.8982C21.9985 86.6198 25.9007 86.5278 29.5432 87.6359C33.1857 88.7439 36.3756 90.9934 38.6424 94.0523C40.3868 96.4063 41.5135 99.1439 41.9401 102.016L46.4462 96.3831L48.0079 97.6325L41.9142 105.25L41.3415 105.966L40.5786 105.457L31.438 99.3633L32.5474 97.6992L40.0118 102.675C39.6775 99.994 38.6574 97.4317 37.0355 95.2431C35.024 92.5286 32.1934 90.5326 28.9611 89.5493C25.7289 88.566 22.2662 88.6477 19.0839 89.7821C15.9015 90.9165 13.168 93.0437 11.2866 95.8499L9.62545 94.7361C11.7456 91.5738 14.8261 89.1766 18.4123 87.8982ZM6.83609 104L0.74234 111.617L2.30408 112.867L6.80997 107.235C7.23661 110.106 8.36326 112.844 10.1077 115.198C12.3745 118.257 15.5644 120.506 19.2069 121.614C22.8493 122.722 26.7515 122.63 30.3377 121.352C33.924 120.073 37.0044 117.676 39.1246 114.514L37.4634 113.4C35.582 116.206 32.8485 118.333 29.6662 119.468C26.4838 120.602 23.0212 120.684 19.7889 119.701C16.5567 118.717 13.726 116.721 11.7145 114.007C10.0926 111.818 9.07252 109.256 8.73823 106.574L16.2029 111.551L17.3123 109.887L8.17166 103.793L7.40882 103.284L6.83609 104Z' fill='%235C5C5C'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_108_4327' x='86' y='38' width='232' height='172' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='20'/%3E%3CfeGaussianBlur stdDeviation='7.5'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_108_4327'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_108_4327' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_108_4327'%3E%3Crect x='102' y='39' width='200' height='135' rx='2' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A\");\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 320px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 320px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(320px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 211px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 211px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(211px - var(--fgp-gap_container_row, 0%)) !important}.figma-light .svg3 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-light .svg3 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-light .svg3{\n\tmargin-left:-96px !important;\n\twidth:441px;\n\theight:223px;\n\tbackground-image:url(\"data:image/svg+xml,%3Csvg width='441' height='223' viewBox='0 0 441 223' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='4' y='21' width='180' height='129' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 0L3.375 2.625L6 5.25L8.625 2.625L6 0ZM6 6.75L3.375 9.375L6 12L8.625 9.375L6 6.75ZM0 6L2.625 3.375L5.25 6L2.625 8.625L0 6ZM9.375 3.375L6.75 6L9.375 8.625L12 6L9.375 3.375Z' fill='%23A54EEA'/%3E%3Cpath d='M15.4773 2.59801V1.27273H22.4403V2.59801H19.7429V10H18.1747V2.59801H15.4773ZM24.7674 10.1321C24.3526 10.1321 23.979 10.0582 23.6466 9.91051C23.3171 9.75994 23.0557 9.53835 22.8626 9.24574C22.6722 8.95312 22.577 8.59233 22.577 8.16335C22.577 7.79403 22.6452 7.48864 22.7816 7.24716C22.918 7.00568 23.104 6.8125 23.3398 6.66761C23.5756 6.52273 23.8413 6.41335 24.1367 6.33949C24.435 6.26278 24.7432 6.20739 25.0614 6.1733C25.4449 6.13352 25.756 6.09801 25.9947 6.06676C26.2333 6.03267 26.4066 5.98153 26.5145 5.91335C26.6253 5.84233 26.6807 5.73295 26.6807 5.58523V5.55966C26.6807 5.23864 26.5856 4.99006 26.3952 4.81392C26.2049 4.63778 25.9307 4.54972 25.5728 4.54972C25.1949 4.54972 24.8952 4.6321 24.6736 4.79688C24.4549 4.96165 24.3072 5.15625 24.2305 5.38068L22.7901 5.17614C22.9037 4.77841 23.0913 4.44602 23.3526 4.17898C23.614 3.90909 23.9336 3.70739 24.3114 3.57386C24.6893 3.4375 25.1069 3.36932 25.5643 3.36932C25.8796 3.36932 26.1935 3.40625 26.506 3.48011C26.8185 3.55398 27.104 3.67614 27.3626 3.84659C27.6211 4.0142 27.8285 4.2429 27.9847 4.53267C28.1438 4.82244 28.2234 5.18466 28.2234 5.61932V10H26.7404V9.10085H26.6893C26.5955 9.28267 26.4634 9.45312 26.293 9.61222C26.1253 9.76847 25.9137 9.89489 25.658 9.99148C25.4052 10.0852 25.1083 10.1321 24.7674 10.1321ZM25.168 8.99858C25.4776 8.99858 25.7461 8.9375 25.9734 8.81534C26.2006 8.69034 26.3753 8.52557 26.4975 8.32102C26.6225 8.11648 26.685 7.89347 26.685 7.65199V6.88068C26.6367 6.92045 26.5543 6.95739 26.4378 6.99148C26.3242 7.02557 26.1964 7.0554 26.0543 7.08097C25.9123 7.10653 25.7716 7.12926 25.6324 7.14915C25.4932 7.16903 25.3725 7.18608 25.2702 7.20028C25.0401 7.23153 24.8341 7.28267 24.6523 7.35369C24.4705 7.42472 24.327 7.52415 24.2219 7.65199C24.1168 7.77699 24.0643 7.93892 24.0643 8.13778C24.0643 8.42188 24.168 8.63636 24.3753 8.78125C24.5827 8.92614 24.8469 8.99858 25.168 8.99858ZM29.9027 10V1.27273H31.4453V4.53693H31.5092C31.5887 4.37784 31.701 4.20881 31.8459 4.02983C31.9907 3.84801 32.1868 3.69318 32.4339 3.56534C32.6811 3.43466 32.9964 3.36932 33.3799 3.36932C33.8856 3.36932 34.3416 3.49858 34.7478 3.7571C35.1569 4.01278 35.4808 4.39205 35.7194 4.89489C35.9609 5.39489 36.0816 6.00852 36.0816 6.7358C36.0816 7.45455 35.9638 8.06534 35.728 8.56818C35.4922 9.07102 35.1711 9.45455 34.7649 9.71875C34.3586 9.98295 33.8984 10.1151 33.3842 10.1151C33.0092 10.1151 32.6981 10.0526 32.451 9.92756C32.2038 9.80256 32.0049 9.65199 31.8544 9.47585C31.7066 9.29687 31.5916 9.12784 31.5092 8.96875H31.4197V10H29.9027ZM31.4155 6.72727C31.4155 7.15057 31.4751 7.52131 31.5944 7.83949C31.7166 8.15767 31.8913 8.40625 32.1186 8.58523C32.3487 8.76136 32.6271 8.84943 32.9538 8.84943C33.2947 8.84943 33.5802 8.75852 33.8103 8.5767C34.0405 8.39205 34.2138 8.14062 34.3302 7.82244C34.4495 7.50142 34.5092 7.13636 34.5092 6.72727C34.5092 6.32102 34.451 5.96023 34.3345 5.64489C34.218 5.32955 34.0447 5.08239 33.8146 4.90341C33.5845 4.72443 33.2976 4.63494 32.9538 4.63494C32.6243 4.63494 32.3444 4.72159 32.1143 4.89489C31.8842 5.06818 31.7095 5.31108 31.5902 5.62358C31.4737 5.93608 31.4155 6.30398 31.4155 6.72727ZM38.9957 1.27273V10H37.4531V1.27273H38.9957ZM43.5397 10.1278C42.8835 10.1278 42.3167 9.99148 41.8394 9.71875C41.365 9.44318 40.9999 9.05398 40.7443 8.55114C40.4886 8.04545 40.3607 7.45028 40.3607 6.76562C40.3607 6.09233 40.4886 5.50142 40.7443 4.9929C41.0028 4.48153 41.3636 4.08381 41.8266 3.79972C42.2897 3.51278 42.8337 3.36932 43.4587 3.36932C43.8622 3.36932 44.2428 3.43466 44.6008 3.56534C44.9616 3.69318 45.2798 3.89205 45.5553 4.16193C45.8338 4.43182 46.0525 4.77557 46.2116 5.19318C46.3707 5.60795 46.4502 6.10227 46.4502 6.67614V7.14915H41.0852V6.10938H44.9715C44.9687 5.81392 44.9048 5.55114 44.7798 5.32102C44.6548 5.08807 44.4801 4.90483 44.2556 4.77131C44.034 4.63778 43.7755 4.57102 43.4801 4.57102C43.1647 4.57102 42.8877 4.64773 42.6491 4.80114C42.4105 4.9517 42.2244 5.15057 42.0909 5.39773C41.9602 5.64205 41.8934 5.91051 41.8906 6.20312V7.1108C41.8906 7.49148 41.9602 7.81818 42.0994 8.09091C42.2386 8.3608 42.4332 8.56818 42.6832 8.71307C42.9332 8.85511 43.2258 8.92614 43.561 8.92614C43.7855 8.92614 43.9886 8.89489 44.1704 8.83239C44.3522 8.76705 44.5099 8.67188 44.6434 8.54688C44.7769 8.42188 44.8778 8.26705 44.946 8.08239L46.3863 8.24432C46.2954 8.625 46.1221 8.95739 45.8664 9.24148C45.6136 9.52273 45.2897 9.74148 44.8948 9.89773C44.4999 10.0511 44.0482 10.1278 43.5397 10.1278ZM54.3845 1.27273V10H52.8035V2.81108H52.7524L50.7112 4.11506V2.66619L52.8802 1.27273H54.3845Z' fill='%23A54EEA'/%3E%3Cg filter='url(%23filter0_d_30_315)'%3E%3Cg clip-path='url(%23clip0_30_315)'%3E%3Crect x='14' y='31.1667' width='160' height='109' rx='2' fill='white'/%3E%3Crect width='80' height='36.3333' transform='translate(14 31.1667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='31.1667' width='80' height='36.3333' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 31.1667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='31.1667' width='80' height='36.3333' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 67.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='67.5' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 67.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='67.5' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 103.833)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='103.833' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 103.833)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='103.833' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='31.1667' width='160' height='109' rx='2' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Cg filter='url(%23filter1_d_30_315)'%3E%3Cg clip-path='url(%23clip1_30_315)'%3E%3Crect x='267' y='85' width='160' height='109' rx='8' fill='%23FFF4F4'/%3E%3Crect width='80' height='36.3333' transform='translate(267 85)' fill='white' fill-opacity='0.01'/%3E%3Crect x='267' y='85' width='80' height='36.3333' fill='%23FFDDDD' stroke='%23F26E6E' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(347 85)' fill='white' fill-opacity='0.01'/%3E%3Crect x='347' y='85' width='80' height='36.3333' fill='%23FFDDDD' stroke='%23F26E6E' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(267 121.333)' fill='white' fill-opacity='0.01'/%3E%3Crect x='267' y='121.333' width='80' height='36.3333' stroke='%23F26E6E' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(347 121.333)' fill='white' fill-opacity='0.01'/%3E%3Crect x='347' y='121.333' width='80' height='36.3333' stroke='%23F26E6E' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(267 157.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='267' y='157.667' width='80' height='36.3333' stroke='%23F26E6E' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(347 157.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='347' y='157.667' width='80' height='36.3333' stroke='%23F26E6E' stroke-width='2'/%3E%3C/g%3E%3Crect x='267' y='85' width='160' height='109' rx='8' stroke='%23F26E6E' stroke-width='2'/%3E%3C/g%3E%3Crect x='257' y='75' width='180' height='129' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M259 54L256.375 56.625L259 59.25L261.625 56.625L259 54ZM259 60.75L256.375 63.375L259 66L261.625 63.375L259 60.75ZM253 60L255.625 57.375L258.25 60L255.625 62.625L253 60ZM262.375 57.375L259.75 60L262.375 62.625L265 60L262.375 57.375Z' fill='%23A54EEA'/%3E%3Cpath d='M268.477 56.598V55.2727H275.44V56.598H272.743V64H271.175V56.598H268.477ZM277.767 64.1321C277.353 64.1321 276.979 64.0582 276.647 63.9105C276.317 63.7599 276.056 63.5384 275.863 63.2457C275.672 62.9531 275.577 62.5923 275.577 62.1634C275.577 61.794 275.645 61.4886 275.782 61.2472C275.918 61.0057 276.104 60.8125 276.34 60.6676C276.576 60.5227 276.841 60.4134 277.137 60.3395C277.435 60.2628 277.743 60.2074 278.061 60.1733C278.445 60.1335 278.756 60.098 278.995 60.0668C279.233 60.0327 279.407 59.9815 279.515 59.9134C279.625 59.8423 279.681 59.733 279.681 59.5852V59.5597C279.681 59.2386 279.586 58.9901 279.395 58.8139C279.205 58.6378 278.931 58.5497 278.573 58.5497C278.195 58.5497 277.895 58.6321 277.674 58.7969C277.455 58.9616 277.307 59.1562 277.23 59.3807L275.79 59.1761C275.904 58.7784 276.091 58.446 276.353 58.179C276.614 57.9091 276.934 57.7074 277.311 57.5739C277.689 57.4375 278.107 57.3693 278.564 57.3693C278.88 57.3693 279.194 57.4062 279.506 57.4801C279.819 57.554 280.104 57.6761 280.363 57.8466C280.621 58.0142 280.828 58.2429 280.985 58.5327C281.144 58.8224 281.223 59.1847 281.223 59.6193V64H279.74V63.1009H279.689C279.596 63.2827 279.463 63.4531 279.293 63.6122C279.125 63.7685 278.914 63.8949 278.658 63.9915C278.405 64.0852 278.108 64.1321 277.767 64.1321ZM278.168 62.9986C278.478 62.9986 278.746 62.9375 278.973 62.8153C279.201 62.6903 279.375 62.5256 279.497 62.321C279.622 62.1165 279.685 61.8935 279.685 61.652V60.8807C279.637 60.9205 279.554 60.9574 279.438 60.9915C279.324 61.0256 279.196 61.0554 279.054 61.081C278.912 61.1065 278.772 61.1293 278.632 61.1491C278.493 61.169 278.373 61.1861 278.27 61.2003C278.04 61.2315 277.834 61.2827 277.652 61.3537C277.471 61.4247 277.327 61.5241 277.222 61.652C277.117 61.777 277.064 61.9389 277.064 62.1378C277.064 62.4219 277.168 62.6364 277.375 62.7812C277.583 62.9261 277.847 62.9986 278.168 62.9986ZM282.903 64V55.2727H284.445V58.5369H284.509C284.589 58.3778 284.701 58.2088 284.846 58.0298C284.991 57.848 285.187 57.6932 285.434 57.5653C285.681 57.4347 285.996 57.3693 286.38 57.3693C286.886 57.3693 287.342 57.4986 287.748 57.7571C288.157 58.0128 288.481 58.392 288.719 58.8949C288.961 59.3949 289.082 60.0085 289.082 60.7358C289.082 61.4545 288.964 62.0653 288.728 62.5682C288.492 63.071 288.171 63.4545 287.765 63.7188C287.359 63.983 286.898 64.1151 286.384 64.1151C286.009 64.1151 285.698 64.0526 285.451 63.9276C285.204 63.8026 285.005 63.652 284.854 63.4759C284.707 63.2969 284.592 63.1278 284.509 62.9688H284.42V64H282.903ZM284.415 60.7273C284.415 61.1506 284.475 61.5213 284.594 61.8395C284.717 62.1577 284.891 62.4062 285.119 62.5852C285.349 62.7614 285.627 62.8494 285.954 62.8494C286.295 62.8494 286.58 62.7585 286.81 62.5767C287.04 62.392 287.214 62.1406 287.33 61.8224C287.45 61.5014 287.509 61.1364 287.509 60.7273C287.509 60.321 287.451 59.9602 287.334 59.6449C287.218 59.3295 287.045 59.0824 286.815 58.9034C286.584 58.7244 286.298 58.6349 285.954 58.6349C285.624 58.6349 285.344 58.7216 285.114 58.8949C284.884 59.0682 284.709 59.3111 284.59 59.6236C284.474 59.9361 284.415 60.304 284.415 60.7273ZM291.996 55.2727V64H290.453V55.2727H291.996ZM296.54 64.1278C295.883 64.1278 295.317 63.9915 294.839 63.7188C294.365 63.4432 294 63.054 293.744 62.5511C293.489 62.0455 293.361 61.4503 293.361 60.7656C293.361 60.0923 293.489 59.5014 293.744 58.9929C294.003 58.4815 294.364 58.0838 294.827 57.7997C295.29 57.5128 295.834 57.3693 296.459 57.3693C296.862 57.3693 297.243 57.4347 297.601 57.5653C297.962 57.6932 298.28 57.892 298.555 58.1619C298.834 58.4318 299.053 58.7756 299.212 59.1932C299.371 59.608 299.45 60.1023 299.45 60.6761V61.1491H294.085V60.1094H297.972C297.969 59.8139 297.905 59.5511 297.78 59.321C297.655 59.0881 297.48 58.9048 297.256 58.7713C297.034 58.6378 296.776 58.571 296.48 58.571C296.165 58.571 295.888 58.6477 295.649 58.8011C295.41 58.9517 295.224 59.1506 295.091 59.3977C294.96 59.642 294.893 59.9105 294.891 60.2031V61.1108C294.891 61.4915 294.96 61.8182 295.099 62.0909C295.239 62.3608 295.433 62.5682 295.683 62.7131C295.933 62.8551 296.226 62.9261 296.561 62.9261C296.785 62.9261 296.989 62.8949 297.17 62.8324C297.352 62.767 297.51 62.6719 297.643 62.5469C297.777 62.4219 297.878 62.267 297.946 62.0824L299.386 62.2443C299.295 62.625 299.122 62.9574 298.866 63.2415C298.614 63.5227 298.29 63.7415 297.895 63.8977C297.5 64.0511 297.048 64.1278 296.54 64.1278ZM303.835 64V62.858L306.865 59.8878C307.154 59.5952 307.396 59.3352 307.589 59.108C307.782 58.8807 307.927 58.6605 308.024 58.4474C308.12 58.2344 308.169 58.0071 308.169 57.7656C308.169 57.4901 308.106 57.2543 307.981 57.0582C307.856 56.8594 307.684 56.706 307.465 56.598C307.247 56.4901 306.998 56.4361 306.72 56.4361C306.433 56.4361 306.181 56.4957 305.965 56.6151C305.75 56.7315 305.582 56.8977 305.463 57.1136C305.346 57.3295 305.288 57.5866 305.288 57.8849H303.784C303.784 57.331 303.91 56.8494 304.163 56.4403C304.416 56.0312 304.764 55.7145 305.207 55.4901C305.653 55.2656 306.164 55.1534 306.741 55.1534C307.326 55.1534 307.84 55.2628 308.284 55.4815C308.727 55.7003 309.071 56 309.315 56.3807C309.562 56.7614 309.686 57.196 309.686 57.6847C309.686 58.0114 309.623 58.3324 309.498 58.6477C309.373 58.9631 309.153 59.3125 308.838 59.696C308.525 60.0795 308.086 60.544 307.521 61.0895L306.017 62.6193V62.679H309.818V64H303.835Z' fill='%23A54EEA'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_30_315' x='1' y='30.1667' width='186' height='139' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_30_315'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_30_315' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_30_315' x='254' y='84' width='186' height='139' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_30_315'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_30_315' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_30_315'%3E%3Crect x='14' y='31.1667' width='160' height='109' rx='2' fill='white'/%3E%3C/clipPath%3E%3CclipPath id='clip1_30_315'%3E%3Crect x='267' y='85' width='160' height='109' rx='8' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A\");\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 441px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 441px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(441px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 223px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 223px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(223px - var(--fgp-gap_container_row, 0%)) !important}.figma-dark .svg3 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-dark .svg3 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-dark .svg3{\n\twidth:441px;\n\theight:223px;\n\tmargin-left:-96px !important;\n\tbackground-image:url(\"data:image/svg+xml,%3Csvg width='441' height='223' viewBox='0 0 441 223' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='4' y='21' width='180' height='129' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 0L3.375 2.625L6 5.25L8.625 2.625L6 0ZM6 6.75L3.375 9.375L6 12L8.625 9.375L6 6.75ZM0 6L2.625 3.375L5.25 6L2.625 8.625L0 6ZM9.375 3.375L6.75 6L9.375 8.625L12 6L9.375 3.375Z' fill='%23A54EEA'/%3E%3Cpath d='M15.4773 2.59801V1.27273H22.4403V2.59801H19.7429V10H18.1747V2.59801H15.4773ZM24.7674 10.1321C24.3526 10.1321 23.979 10.0582 23.6466 9.91051C23.3171 9.75994 23.0557 9.53835 22.8626 9.24574C22.6722 8.95312 22.577 8.59233 22.577 8.16335C22.577 7.79403 22.6452 7.48864 22.7816 7.24716C22.918 7.00568 23.104 6.8125 23.3398 6.66761C23.5756 6.52273 23.8413 6.41335 24.1367 6.33949C24.435 6.26278 24.7432 6.20739 25.0614 6.1733C25.4449 6.13352 25.756 6.09801 25.9947 6.06676C26.2333 6.03267 26.4066 5.98153 26.5145 5.91335C26.6253 5.84233 26.6807 5.73295 26.6807 5.58523V5.55966C26.6807 5.23864 26.5856 4.99006 26.3952 4.81392C26.2049 4.63778 25.9307 4.54972 25.5728 4.54972C25.1949 4.54972 24.8952 4.6321 24.6736 4.79688C24.4549 4.96165 24.3072 5.15625 24.2305 5.38068L22.7901 5.17614C22.9037 4.77841 23.0913 4.44602 23.3526 4.17898C23.614 3.90909 23.9336 3.70739 24.3114 3.57386C24.6893 3.4375 25.1069 3.36932 25.5643 3.36932C25.8796 3.36932 26.1935 3.40625 26.506 3.48011C26.8185 3.55398 27.104 3.67614 27.3626 3.84659C27.6211 4.0142 27.8285 4.2429 27.9847 4.53267C28.1438 4.82244 28.2234 5.18466 28.2234 5.61932V10H26.7404V9.10085H26.6893C26.5955 9.28267 26.4634 9.45312 26.293 9.61222C26.1253 9.76847 25.9137 9.89489 25.658 9.99148C25.4052 10.0852 25.1083 10.1321 24.7674 10.1321ZM25.168 8.99858C25.4776 8.99858 25.7461 8.9375 25.9734 8.81534C26.2006 8.69034 26.3753 8.52557 26.4975 8.32102C26.6225 8.11648 26.685 7.89347 26.685 7.65199V6.88068C26.6367 6.92045 26.5543 6.95739 26.4378 6.99148C26.3242 7.02557 26.1964 7.0554 26.0543 7.08097C25.9123 7.10653 25.7716 7.12926 25.6324 7.14915C25.4932 7.16903 25.3725 7.18608 25.2702 7.20028C25.0401 7.23153 24.8341 7.28267 24.6523 7.35369C24.4705 7.42472 24.327 7.52415 24.2219 7.65199C24.1168 7.77699 24.0643 7.93892 24.0643 8.13778C24.0643 8.42188 24.168 8.63636 24.3753 8.78125C24.5827 8.92614 24.8469 8.99858 25.168 8.99858ZM29.9027 10V1.27273H31.4453V4.53693H31.5092C31.5887 4.37784 31.701 4.20881 31.8459 4.02983C31.9907 3.84801 32.1868 3.69318 32.4339 3.56534C32.6811 3.43466 32.9964 3.36932 33.3799 3.36932C33.8856 3.36932 34.3416 3.49858 34.7478 3.7571C35.1569 4.01278 35.4808 4.39205 35.7194 4.89489C35.9609 5.39489 36.0816 6.00852 36.0816 6.7358C36.0816 7.45455 35.9638 8.06534 35.728 8.56818C35.4922 9.07102 35.1711 9.45455 34.7649 9.71875C34.3586 9.98295 33.8984 10.1151 33.3842 10.1151C33.0092 10.1151 32.6981 10.0526 32.451 9.92756C32.2038 9.80256 32.0049 9.65199 31.8544 9.47585C31.7066 9.29687 31.5916 9.12784 31.5092 8.96875H31.4197V10H29.9027ZM31.4155 6.72727C31.4155 7.15057 31.4751 7.52131 31.5944 7.83949C31.7166 8.15767 31.8913 8.40625 32.1186 8.58523C32.3487 8.76136 32.6271 8.84943 32.9538 8.84943C33.2947 8.84943 33.5802 8.75852 33.8103 8.5767C34.0405 8.39205 34.2138 8.14062 34.3302 7.82244C34.4495 7.50142 34.5092 7.13636 34.5092 6.72727C34.5092 6.32102 34.451 5.96023 34.3345 5.64489C34.218 5.32955 34.0447 5.08239 33.8146 4.90341C33.5845 4.72443 33.2976 4.63494 32.9538 4.63494C32.6243 4.63494 32.3444 4.72159 32.1143 4.89489C31.8842 5.06818 31.7095 5.31108 31.5902 5.62358C31.4737 5.93608 31.4155 6.30398 31.4155 6.72727ZM38.9957 1.27273V10H37.4531V1.27273H38.9957ZM43.5397 10.1278C42.8835 10.1278 42.3167 9.99148 41.8394 9.71875C41.365 9.44318 40.9999 9.05398 40.7443 8.55114C40.4886 8.04545 40.3607 7.45028 40.3607 6.76562C40.3607 6.09233 40.4886 5.50142 40.7443 4.9929C41.0028 4.48153 41.3636 4.08381 41.8266 3.79972C42.2897 3.51278 42.8337 3.36932 43.4587 3.36932C43.8622 3.36932 44.2428 3.43466 44.6008 3.56534C44.9616 3.69318 45.2798 3.89205 45.5553 4.16193C45.8338 4.43182 46.0525 4.77557 46.2116 5.19318C46.3707 5.60795 46.4502 6.10227 46.4502 6.67614V7.14915H41.0852V6.10938H44.9715C44.9687 5.81392 44.9048 5.55114 44.7798 5.32102C44.6548 5.08807 44.4801 4.90483 44.2556 4.77131C44.034 4.63778 43.7755 4.57102 43.4801 4.57102C43.1647 4.57102 42.8877 4.64773 42.6491 4.80114C42.4105 4.9517 42.2244 5.15057 42.0909 5.39773C41.9602 5.64205 41.8934 5.91051 41.8906 6.20312V7.1108C41.8906 7.49148 41.9602 7.81818 42.0994 8.09091C42.2386 8.3608 42.4332 8.56818 42.6832 8.71307C42.9332 8.85511 43.2258 8.92614 43.561 8.92614C43.7855 8.92614 43.9886 8.89489 44.1704 8.83239C44.3522 8.76705 44.5099 8.67188 44.6434 8.54688C44.7769 8.42188 44.8778 8.26705 44.946 8.08239L46.3863 8.24432C46.2954 8.625 46.1221 8.95739 45.8664 9.24148C45.6136 9.52273 45.2897 9.74148 44.8948 9.89773C44.4999 10.0511 44.0482 10.1278 43.5397 10.1278ZM54.3845 1.27273V10H52.8035V2.81108H52.7524L50.7112 4.11506V2.66619L52.8802 1.27273H54.3845Z' fill='%23A54EEA'/%3E%3Cg filter='url(%23filter0_d_30_313)'%3E%3Cg clip-path='url(%23clip0_30_313)'%3E%3Crect x='14' y='31.1667' width='160' height='109' rx='2' fill='%232D2D2C'/%3E%3Crect width='80' height='36.3333' transform='translate(14 31.1667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='31.1667' width='80' height='36.3333' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 31.1667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='31.1667' width='80' height='36.3333' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 67.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='67.5' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 67.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='67.5' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 103.833)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='103.833' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 103.833)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='103.833' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='31.1667' width='160' height='109' rx='2' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Cg filter='url(%23filter1_d_30_313)'%3E%3Cg clip-path='url(%23clip1_30_313)'%3E%3Crect x='267' y='85' width='160' height='109' rx='8' fill='%23322222'/%3E%3Crect width='80' height='36.3333' transform='translate(267 85)' fill='white' fill-opacity='0.01'/%3E%3Crect x='267' y='85' width='80' height='36.3333' fill='%236F3737' stroke='%23F26E6E' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(347 85)' fill='white' fill-opacity='0.01'/%3E%3Crect x='347' y='85' width='80' height='36.3333' fill='%236F3737' stroke='%23F26E6E' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(267 121.333)' fill='white' fill-opacity='0.01'/%3E%3Crect x='267' y='121.333' width='80' height='36.3333' stroke='%23F26E6E' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(347 121.333)' fill='white' fill-opacity='0.01'/%3E%3Crect x='347' y='121.333' width='80' height='36.3333' stroke='%23F26E6E' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(267 157.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='267' y='157.667' width='80' height='36.3333' stroke='%23F26E6E' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(347 157.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='347' y='157.667' width='80' height='36.3333' stroke='%23F26E6E' stroke-width='2'/%3E%3C/g%3E%3Crect x='267' y='85' width='160' height='109' rx='8' stroke='%23F26E6E' stroke-width='2'/%3E%3C/g%3E%3Crect x='257' y='75' width='180' height='129' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M259 54L256.375 56.625L259 59.25L261.625 56.625L259 54ZM259 60.75L256.375 63.375L259 66L261.625 63.375L259 60.75ZM253 60L255.625 57.375L258.25 60L255.625 62.625L253 60ZM262.375 57.375L259.75 60L262.375 62.625L265 60L262.375 57.375Z' fill='%23A54EEA'/%3E%3Cpath d='M268.477 56.598V55.2727H275.44V56.598H272.743V64H271.175V56.598H268.477ZM277.767 64.1321C277.353 64.1321 276.979 64.0582 276.647 63.9105C276.317 63.7599 276.056 63.5384 275.863 63.2457C275.672 62.9531 275.577 62.5923 275.577 62.1634C275.577 61.794 275.645 61.4886 275.782 61.2472C275.918 61.0057 276.104 60.8125 276.34 60.6676C276.576 60.5227 276.841 60.4134 277.137 60.3395C277.435 60.2628 277.743 60.2074 278.061 60.1733C278.445 60.1335 278.756 60.098 278.995 60.0668C279.233 60.0327 279.407 59.9815 279.515 59.9134C279.625 59.8423 279.681 59.733 279.681 59.5852V59.5597C279.681 59.2386 279.586 58.9901 279.395 58.8139C279.205 58.6378 278.931 58.5497 278.573 58.5497C278.195 58.5497 277.895 58.6321 277.674 58.7969C277.455 58.9616 277.307 59.1562 277.23 59.3807L275.79 59.1761C275.904 58.7784 276.091 58.446 276.353 58.179C276.614 57.9091 276.934 57.7074 277.311 57.5739C277.689 57.4375 278.107 57.3693 278.564 57.3693C278.88 57.3693 279.194 57.4062 279.506 57.4801C279.819 57.554 280.104 57.6761 280.363 57.8466C280.621 58.0142 280.828 58.2429 280.985 58.5327C281.144 58.8224 281.223 59.1847 281.223 59.6193V64H279.74V63.1009H279.689C279.596 63.2827 279.463 63.4531 279.293 63.6122C279.125 63.7685 278.914 63.8949 278.658 63.9915C278.405 64.0852 278.108 64.1321 277.767 64.1321ZM278.168 62.9986C278.478 62.9986 278.746 62.9375 278.973 62.8153C279.201 62.6903 279.375 62.5256 279.497 62.321C279.622 62.1165 279.685 61.8935 279.685 61.652V60.8807C279.637 60.9205 279.554 60.9574 279.438 60.9915C279.324 61.0256 279.196 61.0554 279.054 61.081C278.912 61.1065 278.772 61.1293 278.632 61.1491C278.493 61.169 278.373 61.1861 278.27 61.2003C278.04 61.2315 277.834 61.2827 277.652 61.3537C277.471 61.4247 277.327 61.5241 277.222 61.652C277.117 61.777 277.064 61.9389 277.064 62.1378C277.064 62.4219 277.168 62.6364 277.375 62.7812C277.583 62.9261 277.847 62.9986 278.168 62.9986ZM282.903 64V55.2727H284.445V58.5369H284.509C284.589 58.3778 284.701 58.2088 284.846 58.0298C284.991 57.848 285.187 57.6932 285.434 57.5653C285.681 57.4347 285.996 57.3693 286.38 57.3693C286.886 57.3693 287.342 57.4986 287.748 57.7571C288.157 58.0128 288.481 58.392 288.719 58.8949C288.961 59.3949 289.082 60.0085 289.082 60.7358C289.082 61.4545 288.964 62.0653 288.728 62.5682C288.492 63.071 288.171 63.4545 287.765 63.7188C287.359 63.983 286.898 64.1151 286.384 64.1151C286.009 64.1151 285.698 64.0526 285.451 63.9276C285.204 63.8026 285.005 63.652 284.854 63.4759C284.707 63.2969 284.592 63.1278 284.509 62.9688H284.42V64H282.903ZM284.415 60.7273C284.415 61.1506 284.475 61.5213 284.594 61.8395C284.717 62.1577 284.891 62.4062 285.119 62.5852C285.349 62.7614 285.627 62.8494 285.954 62.8494C286.295 62.8494 286.58 62.7585 286.81 62.5767C287.04 62.392 287.214 62.1406 287.33 61.8224C287.45 61.5014 287.509 61.1364 287.509 60.7273C287.509 60.321 287.451 59.9602 287.334 59.6449C287.218 59.3295 287.045 59.0824 286.815 58.9034C286.584 58.7244 286.298 58.6349 285.954 58.6349C285.624 58.6349 285.344 58.7216 285.114 58.8949C284.884 59.0682 284.709 59.3111 284.59 59.6236C284.474 59.9361 284.415 60.304 284.415 60.7273ZM291.996 55.2727V64H290.453V55.2727H291.996ZM296.54 64.1278C295.883 64.1278 295.317 63.9915 294.839 63.7188C294.365 63.4432 294 63.054 293.744 62.5511C293.489 62.0455 293.361 61.4503 293.361 60.7656C293.361 60.0923 293.489 59.5014 293.744 58.9929C294.003 58.4815 294.364 58.0838 294.827 57.7997C295.29 57.5128 295.834 57.3693 296.459 57.3693C296.862 57.3693 297.243 57.4347 297.601 57.5653C297.962 57.6932 298.28 57.892 298.555 58.1619C298.834 58.4318 299.053 58.7756 299.212 59.1932C299.371 59.608 299.45 60.1023 299.45 60.6761V61.1491H294.085V60.1094H297.972C297.969 59.8139 297.905 59.5511 297.78 59.321C297.655 59.0881 297.48 58.9048 297.256 58.7713C297.034 58.6378 296.776 58.571 296.48 58.571C296.165 58.571 295.888 58.6477 295.649 58.8011C295.41 58.9517 295.224 59.1506 295.091 59.3977C294.96 59.642 294.893 59.9105 294.891 60.2031V61.1108C294.891 61.4915 294.96 61.8182 295.099 62.0909C295.239 62.3608 295.433 62.5682 295.683 62.7131C295.933 62.8551 296.226 62.9261 296.561 62.9261C296.785 62.9261 296.989 62.8949 297.17 62.8324C297.352 62.767 297.51 62.6719 297.643 62.5469C297.777 62.4219 297.878 62.267 297.946 62.0824L299.386 62.2443C299.295 62.625 299.122 62.9574 298.866 63.2415C298.614 63.5227 298.29 63.7415 297.895 63.8977C297.5 64.0511 297.048 64.1278 296.54 64.1278ZM303.835 64V62.858L306.865 59.8878C307.154 59.5952 307.396 59.3352 307.589 59.108C307.782 58.8807 307.927 58.6605 308.024 58.4474C308.12 58.2344 308.169 58.0071 308.169 57.7656C308.169 57.4901 308.106 57.2543 307.981 57.0582C307.856 56.8594 307.684 56.706 307.465 56.598C307.247 56.4901 306.998 56.4361 306.72 56.4361C306.433 56.4361 306.181 56.4957 305.965 56.6151C305.75 56.7315 305.582 56.8977 305.463 57.1136C305.346 57.3295 305.288 57.5866 305.288 57.8849H303.784C303.784 57.331 303.91 56.8494 304.163 56.4403C304.416 56.0312 304.764 55.7145 305.207 55.4901C305.653 55.2656 306.164 55.1534 306.741 55.1534C307.326 55.1534 307.84 55.2628 308.284 55.4815C308.727 55.7003 309.071 56 309.315 56.3807C309.562 56.7614 309.686 57.196 309.686 57.6847C309.686 58.0114 309.623 58.3324 309.498 58.6477C309.373 58.9631 309.153 59.3125 308.838 59.696C308.525 60.0795 308.086 60.544 307.521 61.0895L306.017 62.6193V62.679H309.818V64H303.835Z' fill='%23A54EEA'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_30_313' x='1' y='30.1667' width='186' height='139' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_30_313'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_30_313' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_30_313' x='254' y='84' width='186' height='139' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_30_313'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_30_313' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_30_313'%3E%3Crect x='14' y='31.1667' width='160' height='109' rx='2' fill='white'/%3E%3C/clipPath%3E%3CclipPath id='clip1_30_313'%3E%3Crect x='267' y='85' width='160' height='109' rx='8' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A\");\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 441px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 441px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(441px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 223px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 223px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(223px - var(--fgp-gap_container_row, 0%)) !important}.figma-light .svg4 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-light .svg4 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-light .svg4{\n\twidth:220px;\n\theight:110px;\n\tbackground-size:contain;\n\tbackground-image:url(\"data:image/svg+xml,%3Csvg width='220' height='110' viewBox='0 0 220 110' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_2_3141)'%3E%3Crect x='138' width='74' height='94' rx='5' fill='white'/%3E%3Crect x='139' y='1' width='72' height='92' rx='4' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='162' y='38' width='26' height='20' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='166' y='42' width='18' height='12' rx='1' fill='white' stroke='%23CFCFCF' stroke-width='2'/%3E%3Cline x1='175' y1='43' x2='175' y2='53' stroke='%23CFCFCF'/%3E%3Cline x1='183' y1='46.25' x2='167' y2='46.25' stroke='%23CFCFCF'/%3E%3Cline x1='183' y1='49.75' x2='167' y2='49.75' stroke='%23CFCFCF'/%3E%3Cpath d='M161.242 32.1925L161.247 29.963L159.017 29.9676L159.013 32.1972L161.242 32.1925Z' fill='%232F80ED'/%3E%3Crect x='163.556' y='30' width='8' height='2' fill='%232F80ED'/%3E%3Crect x='160' y='36' width='4' height='4' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='186' y='36' width='4' height='4' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='186' y='56' width='4' height='4' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='160' y='56' width='4' height='4' fill='white' stroke='%232F80ED' stroke-width='2'/%3E%3Cg filter='url(%23filter1_d_2_3141)'%3E%3Crect x='8' width='74' height='94' rx='5' fill='white'/%3E%3Crect x='9' y='1' width='72' height='92' rx='4' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='32' y='38' width='26' height='20' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath d='M34 33L32 31L30 33L32 35L34 33Z' fill='%23A54EEA'/%3E%3Crect x='36' y='32' width='8' height='2' fill='%23A54EEA'/%3E%3Crect x='36' y='42' width='18' height='12' rx='1' fill='white' stroke='%23CFCFCF' stroke-width='2'/%3E%3Cline x1='45' y1='43' x2='45' y2='53' stroke='%23CFCFCF'/%3E%3Cline x1='53' y1='46.25' x2='37' y2='46.25' stroke='%23CFCFCF'/%3E%3Cline x1='53' y1='49.75' x2='37' y2='49.75' stroke='%23CFCFCF'/%3E%3Cg filter='url(%23filter2_d_2_3141)'%3E%3Cpath d='M179.751 71.5L176 52L192.505 61.75L184.252 64L179.751 71.5Z' fill='%23010101'/%3E%3Cpath d='M179.015 71.6417L179.385 73.5674L180.394 71.886L184.74 64.6443L192.702 62.4736L194.414 62.0068L192.886 61.1043L176.381 51.3543L174.949 50.5082L175.264 52.1417L179.015 71.6417Z' stroke='white' stroke-width='1.5' stroke-linecap='square'/%3E%3C/g%3E%3Cg opacity='0.6'%3E%3Cpath d='M121.4 49.3181C114.546 42.4639 103.433 42.4639 96.5787 49.3181' stroke='%23CFCFCF' stroke-width='3'/%3E%3Cpath d='M118.748 40.0571L121.4 49.3181L112.139 51.9698' stroke='%23CFCFCF' stroke-width='3'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_2_3141' x='130' y='0' width='90' height='110' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='8'/%3E%3CfeGaussianBlur stdDeviation='4'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_3141'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_3141' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_2_3141' x='0' y='0' width='90' height='110' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='8'/%3E%3CfeGaussianBlur stdDeviation='4'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_3141'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_3141' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter2_d_2_3141' x='170.899' y='47.0164' width='28.4249' height='32.6183' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='1'/%3E%3CfeGaussianBlur stdDeviation='1.5'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_3141'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_3141' result='shape'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E%0A\");\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 220px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 220px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(220px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 110px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 110px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(110px - var(--fgp-gap_container_row, 0%)) !important}.figma-dark .svg4 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-dark .svg4 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-dark .svg4{\n\twidth:220px;\n\theight:110px;\n\tbackground-size:contain;\n\tbackground-image:url(\"data:image/svg+xml,%3Csvg width='220' height='110' viewBox='0 0 220 110' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_2_3033)'%3E%3Crect x='138' width='74' height='94' rx='5' fill='%232D2D2C'/%3E%3Crect x='139' y='1' width='72' height='92' rx='4' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='162' y='38' width='26' height='20' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='166' y='42' width='18' height='12' rx='1' fill='%232E2E2D' stroke='%23696969' stroke-width='2'/%3E%3Cline x1='175' y1='43' x2='175' y2='53' stroke='%23696969'/%3E%3Cline x1='183' y1='46.25' x2='167' y2='46.25' stroke='%23696969'/%3E%3Cline x1='183' y1='49.75' x2='167' y2='49.75' stroke='%23696969'/%3E%3Cpath d='M161.242 32.1925L161.247 29.963L159.017 29.9676L159.013 32.1972L161.242 32.1925Z' fill='%232F80ED'/%3E%3Crect x='163.556' y='30' width='8' height='2' fill='%232F80ED'/%3E%3Crect x='160' y='36' width='4' height='4' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='186' y='36' width='4' height='4' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='186' y='56' width='4' height='4' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Crect x='160' y='56' width='4' height='4' fill='%232D2D2C' stroke='%232F80ED' stroke-width='2'/%3E%3Cg filter='url(%23filter1_d_2_3033)'%3E%3Crect x='8' width='74' height='94' rx='5' fill='%232D2D2C'/%3E%3Crect x='9' y='1' width='72' height='92' rx='4' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='32' y='38' width='26' height='20' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath d='M34 33L32 31L30 33L32 35L34 33Z' fill='%23A54EEA'/%3E%3Crect x='36' y='32' width='8' height='2' fill='%23A54EEA'/%3E%3Crect x='36' y='42' width='18' height='12' rx='1' fill='%232D2D2C' stroke='%23696969' stroke-width='2'/%3E%3Cline x1='45' y1='43' x2='45' y2='53' stroke='%23696969'/%3E%3Cline x1='53' y1='46.25' x2='37' y2='46.25' stroke='%23696969'/%3E%3Cline x1='53' y1='49.75' x2='37' y2='49.75' stroke='%23696969'/%3E%3Cg filter='url(%23filter2_d_2_3033)'%3E%3Cpath d='M179.751 71.5L176 52L192.505 61.75L184.252 64L179.751 71.5Z' fill='%23010101'/%3E%3Cpath d='M179.015 71.6417L179.385 73.5674L180.394 71.886L184.74 64.6443L192.702 62.4736L194.414 62.0068L192.886 61.1043L176.381 51.3543L174.949 50.5082L175.264 52.1417L179.015 71.6417Z' stroke='white' stroke-width='1.5' stroke-linecap='square'/%3E%3C/g%3E%3Cg opacity='0.6'%3E%3Cpath d='M121.4 49.3181C114.546 42.4639 103.433 42.4639 96.5787 49.3181' stroke='%235C5C5C' stroke-width='3'/%3E%3Cpath d='M118.748 40.0571L121.4 49.3181L112.139 51.9698' stroke='%235C5C5C' stroke-width='3'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_2_3033' x='130' y='0' width='90' height='110' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='8'/%3E%3CfeGaussianBlur stdDeviation='4'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_3033'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_3033' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_2_3033' x='0' y='0' width='90' height='110' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='8'/%3E%3CfeGaussianBlur stdDeviation='4'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_3033'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_3033' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter2_d_2_3033' x='170.899' y='47.0164' width='28.4249' height='32.6183' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='1'/%3E%3CfeGaussianBlur stdDeviation='1.5'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_3033'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_3033' result='shape'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E%0A\");\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 220px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 220px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(220px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 110px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 110px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(110px - var(--fgp-gap_container_row, 0%)) !important}.figma-light .svg6 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-light .svg6 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-light .svg6{\n\twidth:188px;\n\theight:168px;\n\tbackground-size:contain;\n\tbackground-image:url(\"data:image/svg+xml,%3Csvg width='188' height='168' viewBox='0 0 188 168' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_2_3088)'%3E%3Cg clip-path='url(%23clip0_2_3088)'%3E%3Crect x='14' y='31' width='160' height='108' rx='2' fill='white'/%3E%3Crect width='80' height='36' transform='translate(14 31)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='31' width='80' height='36' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(94 31)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='31' width='80' height='36' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(14 67)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='67' width='80' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(94 67)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='67' width='80' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(14 103)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='103' width='80' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(94 103)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='103' width='80' height='36' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='31' width='160' height='108' rx='2' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='4' y='21' width='180' height='127' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='18' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='145' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='145' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='18' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 0L3.375 2.625L6 5.25L8.625 2.625L6 0ZM6 6.75L3.375 9.375L6 12L8.625 9.375L6 6.75ZM0 6L2.625 3.375L5.25 6L2.625 8.625L0 6ZM9.375 3.375L6.75 6L9.375 8.625L12 6L9.375 3.375Z' fill='%23A54EEA'/%3E%3Cpath d='M15.4773 2.59801V1.27273H22.4403V2.59801H19.7429V10H18.1747V2.59801H15.4773ZM24.7674 10.1321C24.3526 10.1321 23.979 10.0582 23.6466 9.91051C23.3171 9.75994 23.0557 9.53835 22.8626 9.24574C22.6722 8.95312 22.577 8.59233 22.577 8.16335C22.577 7.79403 22.6452 7.48864 22.7816 7.24716C22.918 7.00568 23.104 6.8125 23.3398 6.66761C23.5756 6.52273 23.8413 6.41335 24.1367 6.33949C24.435 6.26278 24.7432 6.20739 25.0614 6.1733C25.4449 6.13352 25.756 6.09801 25.9947 6.06676C26.2333 6.03267 26.4066 5.98153 26.5145 5.91335C26.6253 5.84233 26.6807 5.73295 26.6807 5.58523V5.55966C26.6807 5.23864 26.5856 4.99006 26.3952 4.81392C26.2049 4.63778 25.9307 4.54972 25.5728 4.54972C25.1949 4.54972 24.8952 4.6321 24.6736 4.79688C24.4549 4.96165 24.3072 5.15625 24.2305 5.38068L22.7901 5.17614C22.9037 4.77841 23.0913 4.44602 23.3526 4.17898C23.614 3.90909 23.9336 3.70739 24.3114 3.57386C24.6893 3.4375 25.1069 3.36932 25.5643 3.36932C25.8796 3.36932 26.1935 3.40625 26.506 3.48011C26.8185 3.55398 27.104 3.67614 27.3626 3.84659C27.6211 4.0142 27.8285 4.2429 27.9847 4.53267C28.1438 4.82244 28.2234 5.18466 28.2234 5.61932V10H26.7404V9.10085H26.6893C26.5955 9.28267 26.4634 9.45312 26.293 9.61222C26.1253 9.76847 25.9137 9.89489 25.658 9.99148C25.4052 10.0852 25.1083 10.1321 24.7674 10.1321ZM25.168 8.99858C25.4776 8.99858 25.7461 8.9375 25.9734 8.81534C26.2006 8.69034 26.3753 8.52557 26.4975 8.32102C26.6225 8.11648 26.685 7.89347 26.685 7.65199V6.88068C26.6367 6.92045 26.5543 6.95739 26.4378 6.99148C26.3242 7.02557 26.1964 7.0554 26.0543 7.08097C25.9123 7.10653 25.7716 7.12926 25.6324 7.14915C25.4932 7.16903 25.3725 7.18608 25.2702 7.20028C25.0401 7.23153 24.8341 7.28267 24.6523 7.35369C24.4705 7.42472 24.327 7.52415 24.2219 7.65199C24.1168 7.77699 24.0643 7.93892 24.0643 8.13778C24.0643 8.42188 24.168 8.63636 24.3753 8.78125C24.5827 8.92614 24.8469 8.99858 25.168 8.99858ZM29.9027 10V1.27273H31.4453V4.53693H31.5092C31.5887 4.37784 31.701 4.20881 31.8459 4.02983C31.9907 3.84801 32.1868 3.69318 32.4339 3.56534C32.6811 3.43466 32.9964 3.36932 33.3799 3.36932C33.8856 3.36932 34.3416 3.49858 34.7478 3.7571C35.1569 4.01278 35.4808 4.39205 35.7194 4.89489C35.9609 5.39489 36.0816 6.00852 36.0816 6.7358C36.0816 7.45455 35.9638 8.06534 35.728 8.56818C35.4922 9.07102 35.1711 9.45455 34.7649 9.71875C34.3586 9.98295 33.8984 10.1151 33.3842 10.1151C33.0092 10.1151 32.6981 10.0526 32.451 9.92756C32.2038 9.80256 32.0049 9.65199 31.8544 9.47585C31.7066 9.29687 31.5916 9.12784 31.5092 8.96875H31.4197V10H29.9027ZM31.4155 6.72727C31.4155 7.15057 31.4751 7.52131 31.5944 7.83949C31.7166 8.15767 31.8913 8.40625 32.1186 8.58523C32.3487 8.76136 32.6271 8.84943 32.9538 8.84943C33.2947 8.84943 33.5802 8.75852 33.8103 8.5767C34.0405 8.39205 34.2138 8.14062 34.3302 7.82244C34.4495 7.50142 34.5092 7.13636 34.5092 6.72727C34.5092 6.32102 34.451 5.96023 34.3345 5.64489C34.218 5.32955 34.0447 5.08239 33.8146 4.90341C33.5845 4.72443 33.2976 4.63494 32.9538 4.63494C32.6243 4.63494 32.3444 4.72159 32.1143 4.89489C31.8842 5.06818 31.7095 5.31108 31.5902 5.62358C31.4737 5.93608 31.4155 6.30398 31.4155 6.72727ZM38.9957 1.27273V10H37.4531V1.27273H38.9957ZM43.5397 10.1278C42.8835 10.1278 42.3167 9.99148 41.8394 9.71875C41.365 9.44318 40.9999 9.05398 40.7443 8.55114C40.4886 8.04545 40.3607 7.45028 40.3607 6.76562C40.3607 6.09233 40.4886 5.50142 40.7443 4.9929C41.0028 4.48153 41.3636 4.08381 41.8266 3.79972C42.2897 3.51278 42.8337 3.36932 43.4587 3.36932C43.8622 3.36932 44.2428 3.43466 44.6008 3.56534C44.9616 3.69318 45.2798 3.89205 45.5553 4.16193C45.8338 4.43182 46.0525 4.77557 46.2116 5.19318C46.3707 5.60795 46.4502 6.10227 46.4502 6.67614V7.14915H41.0852V6.10938H44.9715C44.9687 5.81392 44.9048 5.55114 44.7798 5.32102C44.6548 5.08807 44.4801 4.90483 44.2556 4.77131C44.034 4.63778 43.7755 4.57102 43.4801 4.57102C43.1647 4.57102 42.8877 4.64773 42.6491 4.80114C42.4105 4.9517 42.2244 5.15057 42.0909 5.39773C41.9602 5.64205 41.8934 5.91051 41.8906 6.20312V7.1108C41.8906 7.49148 41.9602 7.81818 42.0994 8.09091C42.2386 8.3608 42.4332 8.56818 42.6832 8.71307C42.9332 8.85511 43.2258 8.92614 43.561 8.92614C43.7855 8.92614 43.9886 8.89489 44.1704 8.83239C44.3522 8.76705 44.5099 8.67188 44.6434 8.54688C44.7769 8.42188 44.8778 8.26705 44.946 8.08239L46.3863 8.24432C46.2954 8.625 46.1221 8.95739 45.8664 9.24148C45.6136 9.52273 45.2897 9.74148 44.8948 9.89773C44.4999 10.0511 44.0482 10.1278 43.5397 10.1278ZM54.3845 1.27273V10H52.8035V2.81108H52.7524L50.7112 4.11506V2.66619L52.8802 1.27273H54.3845Z' fill='%23A54EEA'/%3E%3Cg filter='url(%23filter1_d_2_3088)'%3E%3Cpath d='M129.246 117.5L125.495 98L142 107.75L133.748 110L129.246 117.5Z' fill='%23010101'/%3E%3Cpath d='M125.877 97.3543L124.444 96.5082L124.759 98.1417L128.51 117.642L128.88 119.567L129.889 117.886L134.236 110.644L142.197 108.474L143.909 108.007L142.381 107.104L125.877 97.3543Z' stroke='white' stroke-width='1.5' stroke-linecap='square'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_2_3088' x='1' y='30' width='186' height='138' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_3088'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_3088' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_2_3088' x='120.394' y='93.0164' width='28.4249' height='32.6183' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='1'/%3E%3CfeGaussianBlur stdDeviation='1.5'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_3088'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_3088' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_2_3088'%3E%3Crect x='14' y='31' width='160' height='108' rx='2' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A\");\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 188px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 188px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(188px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 168px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 168px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(168px - var(--fgp-gap_container_row, 0%)) !important}.figma-dark .svg6 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-dark .svg6 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-dark .svg6{\n\twidth:188px;\n\theight:169px;\n\tbackground-size:contain;\n\tbackground-image:url(\"data:image/svg+xml,%3Csvg width='188' height='169' viewBox='0 0 188 169' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_2_2575)'%3E%3Cg clip-path='url(%23clip0_2_2575)'%3E%3Crect x='14' y='31.5' width='160' height='108' rx='2' fill='%232D2D2C'/%3E%3Crect width='80' height='36' transform='translate(14 31.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='31.5' width='80' height='36' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(94 31.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='31.5' width='80' height='36' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(14 67.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='67.5' width='80' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(94 67.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='67.5' width='80' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(14 103.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='103.5' width='80' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36' transform='translate(94 103.5)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='103.5' width='80' height='36' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='31.5' width='160' height='108' rx='2' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='4' y='21.5' width='180' height='127' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='18.5' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='145.5' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='145.5' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='18.5' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 0.5L3.375 3.125L6 5.75L8.625 3.125L6 0.5ZM6 7.25L3.375 9.875L6 12.5L8.625 9.875L6 7.25ZM0 6.5L2.625 3.875L5.25 6.5L2.625 9.125L0 6.5ZM9.375 3.875L6.75 6.5L9.375 9.125L12 6.5L9.375 3.875Z' fill='%23A54EEA'/%3E%3Cpath d='M15.4773 3.09801V1.77273H22.4403V3.09801H19.7429V10.5H18.1747V3.09801H15.4773ZM24.7674 10.6321C24.3526 10.6321 23.979 10.5582 23.6466 10.4105C23.3171 10.2599 23.0557 10.0384 22.8626 9.74574C22.6722 9.45312 22.577 9.09233 22.577 8.66335C22.577 8.29403 22.6452 7.98864 22.7816 7.74716C22.918 7.50568 23.104 7.3125 23.3398 7.16761C23.5756 7.02273 23.8413 6.91335 24.1367 6.83949C24.435 6.76278 24.7432 6.70739 25.0614 6.6733C25.4449 6.63352 25.756 6.59801 25.9947 6.56676C26.2333 6.53267 26.4066 6.48153 26.5145 6.41335C26.6253 6.34233 26.6807 6.23295 26.6807 6.08523V6.05966C26.6807 5.73864 26.5856 5.49006 26.3952 5.31392C26.2049 5.13778 25.9307 5.04972 25.5728 5.04972C25.1949 5.04972 24.8952 5.1321 24.6736 5.29688C24.4549 5.46165 24.3072 5.65625 24.2305 5.88068L22.7901 5.67614C22.9037 5.27841 23.0913 4.94602 23.3526 4.67898C23.614 4.40909 23.9336 4.20739 24.3114 4.07386C24.6893 3.9375 25.1069 3.86932 25.5643 3.86932C25.8796 3.86932 26.1935 3.90625 26.506 3.98011C26.8185 4.05398 27.104 4.17614 27.3626 4.34659C27.6211 4.5142 27.8285 4.7429 27.9847 5.03267C28.1438 5.32244 28.2234 5.68466 28.2234 6.11932V10.5H26.7404V9.60085H26.6893C26.5955 9.78267 26.4634 9.95312 26.293 10.1122C26.1253 10.2685 25.9137 10.3949 25.658 10.4915C25.4052 10.5852 25.1083 10.6321 24.7674 10.6321ZM25.168 9.49858C25.4776 9.49858 25.7461 9.4375 25.9734 9.31534C26.2006 9.19034 26.3753 9.02557 26.4975 8.82102C26.6225 8.61648 26.685 8.39347 26.685 8.15199V7.38068C26.6367 7.42045 26.5543 7.45739 26.4378 7.49148C26.3242 7.52557 26.1964 7.5554 26.0543 7.58097C25.9123 7.60653 25.7716 7.62926 25.6324 7.64915C25.4932 7.66903 25.3725 7.68608 25.2702 7.70028C25.0401 7.73153 24.8341 7.78267 24.6523 7.85369C24.4705 7.92472 24.327 8.02415 24.2219 8.15199C24.1168 8.27699 24.0643 8.43892 24.0643 8.63778C24.0643 8.92188 24.168 9.13636 24.3753 9.28125C24.5827 9.42614 24.8469 9.49858 25.168 9.49858ZM29.9027 10.5V1.77273H31.4453V5.03693H31.5092C31.5887 4.87784 31.701 4.70881 31.8459 4.52983C31.9907 4.34801 32.1868 4.19318 32.4339 4.06534C32.6811 3.93466 32.9964 3.86932 33.3799 3.86932C33.8856 3.86932 34.3416 3.99858 34.7478 4.2571C35.1569 4.51278 35.4808 4.89205 35.7194 5.39489C35.9609 5.89489 36.0816 6.50852 36.0816 7.2358C36.0816 7.95455 35.9638 8.56534 35.728 9.06818C35.4922 9.57102 35.1711 9.95455 34.7649 10.2188C34.3586 10.483 33.8984 10.6151 33.3842 10.6151C33.0092 10.6151 32.6981 10.5526 32.451 10.4276C32.2038 10.3026 32.0049 10.152 31.8544 9.97585C31.7066 9.79687 31.5916 9.62784 31.5092 9.46875H31.4197V10.5H29.9027ZM31.4155 7.22727C31.4155 7.65057 31.4751 8.02131 31.5944 8.33949C31.7166 8.65767 31.8913 8.90625 32.1186 9.08523C32.3487 9.26136 32.6271 9.34943 32.9538 9.34943C33.2947 9.34943 33.5802 9.25852 33.8103 9.0767C34.0405 8.89205 34.2138 8.64062 34.3302 8.32244C34.4495 8.00142 34.5092 7.63636 34.5092 7.22727C34.5092 6.82102 34.451 6.46023 34.3345 6.14489C34.218 5.82955 34.0447 5.58239 33.8146 5.40341C33.5845 5.22443 33.2976 5.13494 32.9538 5.13494C32.6243 5.13494 32.3444 5.22159 32.1143 5.39489C31.8842 5.56818 31.7095 5.81108 31.5902 6.12358C31.4737 6.43608 31.4155 6.80398 31.4155 7.22727ZM38.9957 1.77273V10.5H37.4531V1.77273H38.9957ZM43.5397 10.6278C42.8835 10.6278 42.3167 10.4915 41.8394 10.2188C41.365 9.94318 40.9999 9.55398 40.7443 9.05114C40.4886 8.54545 40.3607 7.95028 40.3607 7.26562C40.3607 6.59233 40.4886 6.00142 40.7443 5.4929C41.0028 4.98153 41.3636 4.58381 41.8266 4.29972C42.2897 4.01278 42.8337 3.86932 43.4587 3.86932C43.8622 3.86932 44.2428 3.93466 44.6008 4.06534C44.9616 4.19318 45.2798 4.39205 45.5553 4.66193C45.8338 4.93182 46.0525 5.27557 46.2116 5.69318C46.3707 6.10795 46.4502 6.60227 46.4502 7.17614V7.64915H41.0852V6.60938H44.9715C44.9687 6.31392 44.9048 6.05114 44.7798 5.82102C44.6548 5.58807 44.4801 5.40483 44.2556 5.27131C44.034 5.13778 43.7755 5.07102 43.4801 5.07102C43.1647 5.07102 42.8877 5.14773 42.6491 5.30114C42.4105 5.4517 42.2244 5.65057 42.0909 5.89773C41.9602 6.14205 41.8934 6.41051 41.8906 6.70312V7.6108C41.8906 7.99148 41.9602 8.31818 42.0994 8.59091C42.2386 8.8608 42.4332 9.06818 42.6832 9.21307C42.9332 9.35511 43.2258 9.42614 43.561 9.42614C43.7855 9.42614 43.9886 9.39489 44.1704 9.33239C44.3522 9.26705 44.5099 9.17188 44.6434 9.04688C44.7769 8.92188 44.8778 8.76705 44.946 8.58239L46.3863 8.74432C46.2954 9.125 46.1221 9.45739 45.8664 9.74148C45.6136 10.0227 45.2897 10.2415 44.8948 10.3977C44.4999 10.5511 44.0482 10.6278 43.5397 10.6278ZM54.3845 1.77273V10.5H52.8035V3.31108H52.7524L50.7112 4.61506V3.16619L52.8802 1.77273H54.3845Z' fill='%23A54EEA'/%3E%3Cg filter='url(%23filter1_d_2_2575)'%3E%3Cpath d='M129.246 118L125.495 98.5L142 108.25L133.748 110.5L129.246 118Z' fill='%23010101'/%3E%3Cpath d='M125.877 97.8543L124.444 97.0082L124.759 98.6417L128.51 118.142L128.88 120.067L129.889 118.386L134.236 111.144L142.197 108.974L143.909 108.507L142.381 107.604L125.877 97.8543Z' stroke='white' stroke-width='1.5' stroke-linecap='square'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_2_2575' x='1' y='30.5' width='186' height='138' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_2575'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_2575' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_2_2575' x='120.394' y='93.5164' width='28.4249' height='32.6183' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='1'/%3E%3CfeGaussianBlur stdDeviation='1.5'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2_2575'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_2_2575' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_2_2575'%3E%3Crect x='14' y='31.5' width='160' height='108' rx='2' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A\");\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 188px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 188px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(188px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 169px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 169px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(169px - var(--fgp-gap_container_row, 0%)) !important}.figma-light .svg7 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-light .svg7 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-light .svg7{\n\tmargin:-4px 0 -32px 0;\n\twidth:188px;\n\theight:190px;\n\tbackground-size:contain;\n\tbackground-image:url(\"data:image/svg+xml,%3Csvg width='188' height='190' viewBox='0 0 188 190' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='4' y='24.8333' width='180' height='129' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='21.8333' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='150.833' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='150.833' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='21.8333' width='6' height='6' fill='white' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 3.83325L3.375 6.45825L6 9.08325L8.625 6.45825L6 3.83325ZM6 10.5833L3.375 13.2083L6 15.8333L8.625 13.2083L6 10.5833ZM0 9.83325L2.625 7.20825L5.25 9.83325L2.625 12.4583L0 9.83325ZM9.375 7.20825L6.75 9.83325L9.375 12.4583L12 9.83325L9.375 7.20825Z' fill='%23A54EEA'/%3E%3Cpath d='M15.4773 6.43126V5.10598H22.4403V6.43126H19.7429V13.8333H18.1747V6.43126H15.4773ZM24.7674 13.9654C24.3526 13.9654 23.979 13.8915 23.6466 13.7438C23.3171 13.5932 23.0557 13.3716 22.8626 13.079C22.6722 12.7864 22.577 12.4256 22.577 11.9966C22.577 11.6273 22.6452 11.3219 22.7816 11.0804C22.918 10.8389 23.104 10.6458 23.3398 10.5009C23.5756 10.356 23.8413 10.2466 24.1367 10.1727C24.435 10.096 24.7432 10.0406 25.0614 10.0065C25.4449 9.96677 25.756 9.93126 25.9947 9.90001C26.2333 9.86592 26.4066 9.81479 26.5145 9.7466C26.6253 9.67558 26.6807 9.56621 26.6807 9.41848V9.39291C26.6807 9.07189 26.5856 8.82331 26.3952 8.64717C26.2049 8.47104 25.9307 8.38297 25.5728 8.38297C25.1949 8.38297 24.8952 8.46535 24.6736 8.63013C24.4549 8.7949 24.3072 8.9895 24.2305 9.21393L22.7901 9.00939C22.9037 8.61166 23.0913 8.27927 23.3526 8.01223C23.614 7.74234 23.9336 7.54064 24.3114 7.40712C24.6893 7.27075 25.1069 7.20257 25.5643 7.20257C25.8796 7.20257 26.1935 7.2395 26.506 7.31337C26.8185 7.38723 27.104 7.50939 27.3626 7.67984C27.6211 7.84746 27.8285 8.07615 27.9847 8.36592C28.1438 8.65569 28.2234 9.01791 28.2234 9.45257V13.8333H26.7404V12.9341H26.6893C26.5955 13.1159 26.4634 13.2864 26.293 13.4455C26.1253 13.6017 25.9137 13.7281 25.658 13.8247C25.4052 13.9185 25.1083 13.9654 24.7674 13.9654ZM25.168 12.8318C25.4776 12.8318 25.7461 12.7708 25.9734 12.6486C26.2006 12.5236 26.3753 12.3588 26.4975 12.1543C26.6225 11.9497 26.685 11.7267 26.685 11.4852V10.7139C26.6367 10.7537 26.5543 10.7906 26.4378 10.8247C26.3242 10.8588 26.1964 10.8886 26.0543 10.9142C25.9123 10.9398 25.7716 10.9625 25.6324 10.9824C25.4932 11.0023 25.3725 11.0193 25.2702 11.0335C25.0401 11.0648 24.8341 11.1159 24.6523 11.1869C24.4705 11.258 24.327 11.3574 24.2219 11.4852C24.1168 11.6102 24.0643 11.7722 24.0643 11.971C24.0643 12.2551 24.168 12.4696 24.3753 12.6145C24.5827 12.7594 24.8469 12.8318 25.168 12.8318ZM29.9027 13.8333V5.10598H31.4453V8.37018H31.5092C31.5887 8.21109 31.701 8.04206 31.8459 7.86308C31.9907 7.68126 32.1868 7.52643 32.4339 7.39859C32.6811 7.26791 32.9964 7.20257 33.3799 7.20257C33.8856 7.20257 34.3416 7.33183 34.7478 7.59035C35.1569 7.84604 35.4808 8.2253 35.7194 8.72814C35.9609 9.22814 36.0816 9.84177 36.0816 10.569C36.0816 11.2878 35.9638 11.8986 35.728 12.4014C35.4922 12.9043 35.1711 13.2878 34.7649 13.552C34.3586 13.8162 33.8984 13.9483 33.3842 13.9483C33.0092 13.9483 32.6981 13.8858 32.451 13.7608C32.2038 13.6358 32.0049 13.4852 31.8544 13.3091C31.7066 13.1301 31.5916 12.9611 31.5092 12.802H31.4197V13.8333H29.9027ZM31.4155 10.5605C31.4155 10.9838 31.4751 11.3546 31.5944 11.6727C31.7166 11.9909 31.8913 12.2395 32.1186 12.4185C32.3487 12.5946 32.6271 12.6827 32.9538 12.6827C33.2947 12.6827 33.5802 12.5918 33.8103 12.41C34.0405 12.2253 34.2138 11.9739 34.3302 11.6557C34.4495 11.3347 34.5092 10.9696 34.5092 10.5605C34.5092 10.1543 34.451 9.79348 34.3345 9.47814C34.218 9.1628 34.0447 8.91564 33.8146 8.73666C33.5845 8.55768 33.2976 8.46819 32.9538 8.46819C32.6243 8.46819 32.3444 8.55484 32.1143 8.72814C31.8842 8.90143 31.7095 9.14433 31.5902 9.45683C31.4737 9.76933 31.4155 10.1372 31.4155 10.5605ZM38.9957 5.10598V13.8333H37.4531V5.10598H38.9957ZM43.5397 13.9611C42.8835 13.9611 42.3167 13.8247 41.8394 13.552C41.365 13.2764 40.9999 12.8872 40.7443 12.3844C40.4886 11.8787 40.3607 11.2835 40.3607 10.5989C40.3607 9.92558 40.4886 9.33467 40.7443 8.82615C41.0028 8.31479 41.3636 7.91706 41.8266 7.63297C42.2897 7.34604 42.8337 7.20257 43.4587 7.20257C43.8622 7.20257 44.2428 7.26791 44.6008 7.39859C44.9616 7.52643 45.2798 7.7253 45.5553 7.99518C45.8338 8.26507 46.0525 8.60882 46.2116 9.02643C46.3707 9.44121 46.4502 9.93552 46.4502 10.5094V10.9824H41.0852V9.94263H44.9715C44.9687 9.64717 44.9048 9.38439 44.7798 9.15427C44.6548 8.92132 44.4801 8.73808 44.2556 8.60456C44.034 8.47104 43.7755 8.40427 43.4801 8.40427C43.1647 8.40427 42.8877 8.48098 42.6491 8.63439C42.4105 8.78496 42.2244 8.98382 42.0909 9.23098C41.9602 9.4753 41.8934 9.74376 41.8906 10.0364V10.944C41.8906 11.3247 41.9602 11.6514 42.0994 11.9242C42.2386 12.194 42.4332 12.4014 42.6832 12.5463C42.9332 12.6884 43.2258 12.7594 43.561 12.7594C43.7855 12.7594 43.9886 12.7281 44.1704 12.6656C44.3522 12.6003 44.5099 12.5051 44.6434 12.3801C44.7769 12.2551 44.8778 12.1003 44.946 11.9156L46.3863 12.0776C46.2954 12.4583 46.1221 12.7906 45.8664 13.0747C45.6136 13.356 45.2897 13.5747 44.8948 13.731C44.4999 13.8844 44.0482 13.9611 43.5397 13.9611ZM54.3845 5.10598V13.8333H52.8035V6.64433H52.7524L50.7112 7.94831V6.49945L52.8802 5.10598H54.3845Z' fill='%23A54EEA'/%3E%3Cg filter='url(%23filter0_d_113_3127)'%3E%3Cg clip-path='url(%23clip0_113_3127)'%3E%3Crect x='14' y='35' width='160' height='109' rx='2' fill='white'/%3E%3Crect width='80' height='36.3333' transform='translate(14 35)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='35' width='80' height='36.3333' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 35)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='35' width='80' height='36.3333' fill='%23F2F2F2' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 71.3334)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='71.3334' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 71.3334)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='71.3334' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 107.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='107.667' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 107.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='107.667' width='80' height='36.3333' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='35' width='160' height='109' rx='2' stroke='%23CFCFCF' stroke-width='2'/%3E%3C/g%3E%3Cpath d='M119.268 0.920393C118.868 0.44121 118.132 0.44121 117.732 0.920393L111.814 8.01455C111.048 8.93175 112.245 10.1762 113.191 9.4476L115.289 7.83321C115.917 7.34942 116.832 7.75489 116.896 8.5455L117.503 16.1038C117.602 17.3302 119.398 17.3302 119.497 16.1038L120.105 8.54569C120.168 7.75508 121.083 7.34961 121.711 7.8334L123.809 9.44769C124.755 10.1763 125.952 8.93184 125.186 8.01464L119.268 0.920393Z' fill='%23F26E6E'/%3E%3Cpath d='M154.269 118.924C153.869 118.443 153.131 118.443 152.731 118.924L148.804 123.642C148.04 124.56 149.238 125.803 150.184 125.074L150.568 124.777C151.197 124.292 152.112 124.698 152.176 125.489L152.503 129.572C152.602 130.799 154.398 130.799 154.497 129.572L154.824 125.489C154.888 124.698 155.804 124.293 156.432 124.778L156.816 125.074C157.762 125.803 158.96 124.561 158.196 123.642L154.269 118.924Z' fill='%23F26E6E'/%3E%3Cpath d='M81.7751 169.951C81.3749 169.46 80.6251 169.46 80.2249 169.951L77.1603 173.71C76.4807 174.544 77.5706 175.652 78.4155 174.986V174.986C78.9807 174.541 79.8141 174.906 79.8705 175.623L80.0031 177.312C80.0997 178.541 81.9004 178.541 81.997 177.312L82.1297 175.623C82.186 174.906 83.0194 174.541 83.5846 174.987V174.987C84.4295 175.652 85.5194 174.544 84.8398 173.71L81.7751 169.951Z' fill='%23F26E6E'/%3E%3Cpath d='M44.2763 66.9562C43.8761 66.4633 43.1239 66.4633 42.7237 66.9562L31.7161 80.5141C30.9632 81.4413 32.176 82.6697 33.1128 81.9287L39.5762 76.8165C40.2037 76.3202 41.1311 76.7252 41.1935 77.5229L42.5032 94.2598C42.5994 95.4892 44.4009 95.4892 44.4971 94.2598L45.8068 77.5231C45.8692 76.7255 46.7966 76.3205 47.4241 76.8168L53.8873 81.9288C54.8241 82.6697 56.0368 81.4414 55.284 80.5142L44.2763 66.9562Z' fill='%23F26E6E'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_113_3127' x='1' y='34' width='186' height='139' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_113_3127'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_113_3127' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_113_3127'%3E%3Crect x='14' y='35' width='160' height='109' rx='2' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A\");\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 188px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 188px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(188px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 190px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 190px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(190px - var(--fgp-gap_container_row, 0%)) !important}.figma-dark .svg7 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-dark .svg7 > *{\n\t--fgp-gap_percentage-to-pixels_column: initial;\n\t--fgp-gap_percentage-to-pixels_row: initial}.figma-dark .svg7{\n\tmargin:-4px 0 -32px 0;\n\twidth:188px;\n\theight:190px;\n\tbackground-size:contain;\n\tbackground-image:url(\"data:image/svg+xml,%3Csvg width='188' height='190' viewBox='0 0 188 190' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='4' y='24.8333' width='180' height='129' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='21.8333' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='181' y='150.833' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='150.833' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Crect x='1' y='21.8333' width='6' height='6' fill='%232D2D2C' stroke='%23A54EEA' stroke-width='2'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 3.83325L3.375 6.45825L6 9.08325L8.625 6.45825L6 3.83325ZM6 10.5833L3.375 13.2083L6 15.8333L8.625 13.2083L6 10.5833ZM0 9.83325L2.625 7.20825L5.25 9.83325L2.625 12.4583L0 9.83325ZM9.375 7.20825L6.75 9.83325L9.375 12.4583L12 9.83325L9.375 7.20825Z' fill='%23A54EEA'/%3E%3Cpath d='M15.4773 6.43126V5.10598H22.4403V6.43126H19.7429V13.8333H18.1747V6.43126H15.4773ZM24.7674 13.9654C24.3526 13.9654 23.979 13.8915 23.6466 13.7438C23.3171 13.5932 23.0557 13.3716 22.8626 13.079C22.6722 12.7864 22.577 12.4256 22.577 11.9966C22.577 11.6273 22.6452 11.3219 22.7816 11.0804C22.918 10.8389 23.104 10.6458 23.3398 10.5009C23.5756 10.356 23.8413 10.2466 24.1367 10.1727C24.435 10.096 24.7432 10.0406 25.0614 10.0065C25.4449 9.96677 25.756 9.93126 25.9947 9.90001C26.2333 9.86592 26.4066 9.81479 26.5145 9.7466C26.6253 9.67558 26.6807 9.56621 26.6807 9.41848V9.39291C26.6807 9.07189 26.5856 8.82331 26.3952 8.64717C26.2049 8.47104 25.9307 8.38297 25.5728 8.38297C25.1949 8.38297 24.8952 8.46535 24.6736 8.63013C24.4549 8.7949 24.3072 8.9895 24.2305 9.21393L22.7901 9.00939C22.9037 8.61166 23.0913 8.27927 23.3526 8.01223C23.614 7.74234 23.9336 7.54064 24.3114 7.40712C24.6893 7.27075 25.1069 7.20257 25.5643 7.20257C25.8796 7.20257 26.1935 7.2395 26.506 7.31337C26.8185 7.38723 27.104 7.50939 27.3626 7.67984C27.6211 7.84746 27.8285 8.07615 27.9847 8.36592C28.1438 8.65569 28.2234 9.01791 28.2234 9.45257V13.8333H26.7404V12.9341H26.6893C26.5955 13.1159 26.4634 13.2864 26.293 13.4455C26.1253 13.6017 25.9137 13.7281 25.658 13.8247C25.4052 13.9185 25.1083 13.9654 24.7674 13.9654ZM25.168 12.8318C25.4776 12.8318 25.7461 12.7708 25.9734 12.6486C26.2006 12.5236 26.3753 12.3588 26.4975 12.1543C26.6225 11.9497 26.685 11.7267 26.685 11.4852V10.7139C26.6367 10.7537 26.5543 10.7906 26.4378 10.8247C26.3242 10.8588 26.1964 10.8886 26.0543 10.9142C25.9123 10.9398 25.7716 10.9625 25.6324 10.9824C25.4932 11.0023 25.3725 11.0193 25.2702 11.0335C25.0401 11.0648 24.8341 11.1159 24.6523 11.1869C24.4705 11.258 24.327 11.3574 24.2219 11.4852C24.1168 11.6102 24.0643 11.7722 24.0643 11.971C24.0643 12.2551 24.168 12.4696 24.3753 12.6145C24.5827 12.7594 24.8469 12.8318 25.168 12.8318ZM29.9027 13.8333V5.10598H31.4453V8.37018H31.5092C31.5887 8.21109 31.701 8.04206 31.8459 7.86308C31.9907 7.68126 32.1868 7.52643 32.4339 7.39859C32.6811 7.26791 32.9964 7.20257 33.3799 7.20257C33.8856 7.20257 34.3416 7.33183 34.7478 7.59035C35.1569 7.84604 35.4808 8.2253 35.7194 8.72814C35.9609 9.22814 36.0816 9.84177 36.0816 10.569C36.0816 11.2878 35.9638 11.8986 35.728 12.4014C35.4922 12.9043 35.1711 13.2878 34.7649 13.552C34.3586 13.8162 33.8984 13.9483 33.3842 13.9483C33.0092 13.9483 32.6981 13.8858 32.451 13.7608C32.2038 13.6358 32.0049 13.4852 31.8544 13.3091C31.7066 13.1301 31.5916 12.9611 31.5092 12.802H31.4197V13.8333H29.9027ZM31.4155 10.5605C31.4155 10.9838 31.4751 11.3546 31.5944 11.6727C31.7166 11.9909 31.8913 12.2395 32.1186 12.4185C32.3487 12.5946 32.6271 12.6827 32.9538 12.6827C33.2947 12.6827 33.5802 12.5918 33.8103 12.41C34.0405 12.2253 34.2138 11.9739 34.3302 11.6557C34.4495 11.3347 34.5092 10.9696 34.5092 10.5605C34.5092 10.1543 34.451 9.79348 34.3345 9.47814C34.218 9.1628 34.0447 8.91564 33.8146 8.73666C33.5845 8.55768 33.2976 8.46819 32.9538 8.46819C32.6243 8.46819 32.3444 8.55484 32.1143 8.72814C31.8842 8.90143 31.7095 9.14433 31.5902 9.45683C31.4737 9.76933 31.4155 10.1372 31.4155 10.5605ZM38.9957 5.10598V13.8333H37.4531V5.10598H38.9957ZM43.5397 13.9611C42.8835 13.9611 42.3167 13.8247 41.8394 13.552C41.365 13.2764 40.9999 12.8872 40.7443 12.3844C40.4886 11.8787 40.3607 11.2835 40.3607 10.5989C40.3607 9.92558 40.4886 9.33467 40.7443 8.82615C41.0028 8.31479 41.3636 7.91706 41.8266 7.63297C42.2897 7.34604 42.8337 7.20257 43.4587 7.20257C43.8622 7.20257 44.2428 7.26791 44.6008 7.39859C44.9616 7.52643 45.2798 7.7253 45.5553 7.99518C45.8338 8.26507 46.0525 8.60882 46.2116 9.02643C46.3707 9.44121 46.4502 9.93552 46.4502 10.5094V10.9824H41.0852V9.94263H44.9715C44.9687 9.64717 44.9048 9.38439 44.7798 9.15427C44.6548 8.92132 44.4801 8.73808 44.2556 8.60456C44.034 8.47104 43.7755 8.40427 43.4801 8.40427C43.1647 8.40427 42.8877 8.48098 42.6491 8.63439C42.4105 8.78496 42.2244 8.98382 42.0909 9.23098C41.9602 9.4753 41.8934 9.74376 41.8906 10.0364V10.944C41.8906 11.3247 41.9602 11.6514 42.0994 11.9242C42.2386 12.194 42.4332 12.4014 42.6832 12.5463C42.9332 12.6884 43.2258 12.7594 43.561 12.7594C43.7855 12.7594 43.9886 12.7281 44.1704 12.6656C44.3522 12.6003 44.5099 12.5051 44.6434 12.3801C44.7769 12.2551 44.8778 12.1003 44.946 11.9156L46.3863 12.0776C46.2954 12.4583 46.1221 12.7906 45.8664 13.0747C45.6136 13.356 45.2897 13.5747 44.8948 13.731C44.4999 13.8844 44.0482 13.9611 43.5397 13.9611ZM54.3845 5.10598V13.8333H52.8035V6.64433H52.7524L50.7112 7.94831V6.49945L52.8802 5.10598H54.3845Z' fill='%23A54EEA'/%3E%3Cg filter='url(%23filter0_d_113_3542)'%3E%3Cg clip-path='url(%23clip0_113_3542)'%3E%3Crect x='14' y='35' width='160' height='109' rx='2' fill='%232D2D2C'/%3E%3Crect width='80' height='36.3333' transform='translate(14 35)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='35' width='80' height='36.3333' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 35)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='35' width='80' height='36.3333' fill='%233A3A3A' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 71.3334)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='71.3334' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 71.3334)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='71.3334' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(14 107.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='14' y='107.667' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3Crect width='80' height='36.3333' transform='translate(94 107.667)' fill='white' fill-opacity='0.01'/%3E%3Crect x='94' y='107.667' width='80' height='36.3333' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Crect x='14' y='35' width='160' height='109' rx='2' stroke='%235C5C5C' stroke-width='2'/%3E%3C/g%3E%3Cpath d='M119.268 0.920393C118.868 0.44121 118.132 0.44121 117.732 0.920393L111.814 8.01455C111.048 8.93175 112.245 10.1762 113.191 9.4476L115.289 7.83321C115.917 7.34942 116.832 7.75489 116.896 8.5455L117.503 16.1038C117.602 17.3302 119.398 17.3302 119.497 16.1038L120.105 8.54569C120.168 7.75508 121.083 7.34961 121.711 7.8334L123.809 9.44769C124.755 10.1763 125.952 8.93184 125.186 8.01464L119.268 0.920393Z' fill='%23F26E6E'/%3E%3Cpath d='M154.269 118.924C153.869 118.443 153.131 118.443 152.731 118.924L148.804 123.642C148.04 124.56 149.238 125.803 150.184 125.074L150.568 124.777C151.197 124.292 152.112 124.698 152.176 125.489L152.503 129.572C152.602 130.799 154.398 130.799 154.497 129.572L154.824 125.489C154.888 124.698 155.804 124.293 156.432 124.778L156.816 125.074C157.762 125.803 158.96 124.561 158.196 123.642L154.269 118.924Z' fill='%23F26E6E'/%3E%3Cpath d='M81.7751 169.951C81.3749 169.46 80.6251 169.46 80.2249 169.951L77.1603 173.71C76.4807 174.544 77.5706 175.652 78.4155 174.986V174.986C78.9807 174.541 79.8141 174.906 79.8705 175.623L80.0031 177.312C80.0997 178.541 81.9004 178.541 81.997 177.312L82.1297 175.623C82.186 174.906 83.0194 174.541 83.5846 174.987V174.987C84.4295 175.652 85.5194 174.544 84.8398 173.71L81.7751 169.951Z' fill='%23F26E6E'/%3E%3Cpath d='M44.2763 66.9562C43.8761 66.4633 43.1239 66.4633 42.7237 66.9562L31.7161 80.5141C30.9632 81.4413 32.176 82.6697 33.1128 81.9287L39.5762 76.8165C40.2037 76.3202 41.1311 76.7252 41.1935 77.5229L42.5032 94.2598C42.5994 95.4892 44.4009 95.4892 44.4971 94.2598L45.8068 77.5231C45.8692 76.7255 46.7966 76.3205 47.4241 76.8168L53.8873 81.9288C54.8241 82.6697 56.0368 81.4414 55.284 80.5142L44.2763 66.9562Z' fill='%23F26E6E'/%3E%3Cdefs%3E%3Cfilter id='filter0_d_113_3542' x='1' y='34' width='186' height='139' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='16'/%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_113_3542'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_113_3542' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_113_3542'%3E%3Crect x='14' y='35' width='160' height='109' rx='2' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A\");\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 188px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 188px * var(--fgp-gap_percentage-decimal_column)) !important;\n\t--fgp-width: calc(188px - var(--fgp-gap_container_column, 0%)) !important;\n\t--fgp-gap_percentage-to-pixels_column: calc(-1 * 190px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-gap_percentage-to-pixels_row: calc(-1 * 190px * var(--fgp-gap_percentage-decimal_row)) !important;\n\t--fgp-height: calc(190px - var(--fgp-gap_container_row, 0%)) !important}";
    styleInject(css_248z);

    /* src/ui/PluginUI.svelte generated by Svelte v3.31.2 */
    const get_default_slot_changes_5 = dirty => ({});
    const get_default_slot_context_5 = ctx => ({ slot: "content" });
    const get_default_slot_changes_4 = dirty => ({});
    const get_default_slot_context_4 = ctx => ({ slot: "hitThing" });

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[47] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[44] = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[44] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[47] = list[i];
    	return child_ctx;
    }

    const get_default_slot_changes_3 = dirty => ({});
    const get_default_slot_context_3 = ctx => ({ slot: "content" });
    const get_default_slot_changes_2 = dirty => ({});
    const get_default_slot_context_2 = ctx => ({ slot: "label" });
    const get_default_slot_changes_1 = dirty => ({});
    const get_default_slot_context_1 = ctx => ({ slot: "content" });
    const get_default_slot_changes = dirty => ({});
    const get_default_slot_context = ctx => ({ slot: "label" });

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[47] = list[i];
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[44] = list[i];
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[47] = list[i];
    	return child_ctx;
    }

    // (366:0) {#if pageState.chooseRemoteTemplate}
    function create_if_block_21(ctx) {
    	let div;
    	let if_block = /*data*/ ctx[0].remoteFiles.length > 0 && create_if_block_22(ctx);

    	return {
    		c() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr(div, "class", "container");
    			set_style(div, "padding", "var(--size-100) var(--size-200)");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p(ctx, dirty) {
    			if (/*data*/ ctx[0].remoteFiles.length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_22(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block) if_block.d();
    		}
    	};
    }

    // (369:2) {#if data.remoteFiles.length > 0}
    function create_if_block_22(ctx) {
    	let p;
    	let t1;
    	let div;
    	let each_value_6 = /*data*/ ctx[0].remoteFiles;
    	let each_blocks = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	return {
    		c() {
    			p = element("p");
    			p.textContent = "Choose a file";
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div, "class", "List");
    		},
    		m(target, anchor) {
    			insert(target, p, anchor);
    			insert(target, t1, anchor);
    			insert(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*updateSelectedFile, data, setActivePage*/ 69633) {
    				each_value_6 = /*data*/ ctx[0].remoteFiles;
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6(ctx, each_value_6, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_6.length;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(p);
    			if (detaching) detach(t1);
    			if (detaching) detach(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (372:3) {#each data.remoteFiles as file}
    function create_each_block_6(ctx) {
    	let div;
    	let span;
    	let t_value = /*file*/ ctx[47].name + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[20](/*file*/ ctx[47], ...args);
    	}

    	return {
    		c() {
    			div = element("div");
    			span = element("span");
    			t = text(t_value);
    			attr(div, "class", "ListItem");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, span);
    			append(span, t);

    			if (!mounted) {
    				dispose = listen(div, "click", click_handler);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*data*/ 1 && t_value !== (t_value = /*file*/ ctx[47].name + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (383:0) {#if pageState.chooseTemplate}
    function create_if_block_18(ctx) {
    	let div;
    	let p;
    	let t1;
    	let if_block = /*data*/ ctx[0].remoteFiles.length > 0 && create_if_block_19(ctx);

    	return {
    		c() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Choose a template";
    			t1 = space();
    			if (if_block) if_block.c();
    			attr(div, "class", "container");
    			set_style(div, "padding", "var(--size-100) var(--size-200)");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, p);
    			append(div, t1);
    			if (if_block) if_block.m(div, null);
    		},
    		p(ctx, dirty) {
    			if (/*data*/ ctx[0].remoteFiles.length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_19(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block) if_block.d();
    		}
    	};
    }

    // (387:2) {#if data.remoteFiles.length > 0}
    function create_if_block_19(ctx) {
    	let each_1_anchor;
    	let each_value_4 = /*data*/ ctx[0].remoteFiles;
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*data, setActivePage, selectedFile*/ 4225) {
    				each_value_4 = /*data*/ ctx[0].remoteFiles;
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (391:4) {#if selectedFile?.id === file.id}
    function create_if_block_20(ctx) {
    	let div;
    	let t;
    	let each_value_5 = /*file*/ ctx[47].data;
    	let each_blocks = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	return {
    		c() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr(div, "class", "List");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append(div, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*data, setActivePage*/ 4097) {
    				each_value_5 = /*file*/ ctx[47].data;
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_5.length;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (393:6) {#each file.data as template}
    function create_each_block_5(ctx) {
    	let div;
    	let t_value = /*template*/ ctx[44].name + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[21](/*template*/ ctx[44], ...args);
    	}

    	return {
    		c() {
    			div = element("div");
    			t = text(t_value);
    			attr(div, "class", "ListItem");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);

    			if (!mounted) {
    				dispose = listen(div, "click", click_handler_1);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*data*/ 1 && t_value !== (t_value = /*template*/ ctx[44].name + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (389:3) {#each data.remoteFiles as file}
    function create_each_block_4(ctx) {
    	let if_block_anchor;
    	let if_block = /*selectedFile*/ ctx[7]?.id === /*file*/ ctx[47].id && create_if_block_20(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (/*selectedFile*/ ctx[7]?.id === /*file*/ ctx[47].id) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_20(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (409:0) {#if pageState.welcomePageActive}
    function create_if_block_9(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let if_block4_anchor;
    	let current;
    	let if_block0 = /*welcomeSlides*/ ctx[9][0] && create_if_block_17(ctx);
    	let if_block1 = /*welcomeSlides*/ ctx[9][1] && create_if_block_16(ctx);
    	let if_block2 = /*welcomeSlides*/ ctx[9][2] && create_if_block_15(ctx);
    	let if_block3 = /*welcomeSlides*/ ctx[9][3] && create_if_block_14(ctx);
    	let if_block4 = /*welcomeSlides*/ ctx[9][4] && create_if_block_10(ctx);

    	return {
    		c() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			if_block4_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert(target, t2, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert(target, t3, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert(target, if_block4_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*welcomeSlides*/ ctx[9][0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*welcomeSlides*/ 512) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_17(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*welcomeSlides*/ ctx[9][1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*welcomeSlides*/ 512) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_16(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*welcomeSlides*/ ctx[9][2]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*welcomeSlides*/ 512) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_15(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*welcomeSlides*/ ctx[9][3]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*welcomeSlides*/ 512) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_14(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(t3.parentNode, t3);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*welcomeSlides*/ ctx[9][4]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*welcomeSlides*/ 512) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_10(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(if_block4_anchor.parentNode, if_block4_anchor);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach(t2);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach(t3);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach(if_block4_anchor);
    		}
    	};
    }

    // (410:1) {#if welcomeSlides[0]}
    function create_if_block_17(ctx) {
    	let div4;
    	let div1;
    	let t0;
    	let div3;
    	let h6;
    	let t2;
    	let p;
    	let t4;
    	let div2;
    	let span;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				classes: "secondary",
    				iconRight: "arrow-right",
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			div4 = element("div");
    			div1 = element("div");
    			div1.innerHTML = `<div class="svg1"></div>`;
    			t0 = space();
    			div3 = element("div");
    			h6 = element("h6");
    			h6.textContent = "What's new";
    			t2 = space();
    			p = element("p");
    			p.textContent = "Table Creator has been rebuilt from the ground up with some new features.";
    			t4 = space();
    			div2 = element("div");
    			span = element("span");
    			create_component(button.$$.fragment);
    			attr(div1, "class", "artwork");
    			attr(div2, "class", "buttons");
    			attr(div3, "class", "content");
    			attr(div4, "class", "container welcomePage");
    			set_style(div4, "padding", "var(--size-200)");
    		},
    		m(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div1);
    			append(div4, t0);
    			append(div4, div3);
    			append(div3, h6);
    			append(div3, t2);
    			append(div3, p);
    			append(div3, t4);
    			append(div3, div2);
    			append(div2, span);
    			mount_component(button, span, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(span, "click", /*click_handler_2*/ ctx[22]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 128) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div4);
    			destroy_component(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (433:44) <Button classes="secondary" iconRight="arrow-right">
    function create_default_slot_10(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("Next");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (440:1) {#if welcomeSlides[1]}
    function create_if_block_16(ctx) {
    	let div4;
    	let div1;
    	let t0;
    	let div3;
    	let h6;
    	let t2;
    	let p;
    	let t4;
    	let div2;
    	let span;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				classes: "secondary",
    				iconRight: "arrow-right",
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			div4 = element("div");
    			div1 = element("div");
    			div1.innerHTML = `<div class="svg2"></div>`;
    			t0 = space();
    			div3 = element("div");
    			h6 = element("h6");
    			h6.textContent = "Templates";
    			t2 = space();
    			p = element("p");
    			p.textContent = "Tables are now created from a single component called a template. Templates offer a lot more flexibility and control. Once a table is created, it's appearance can be updated from the plugin.";
    			t4 = space();
    			div2 = element("div");
    			span = element("span");
    			create_component(button.$$.fragment);
    			attr(div1, "class", "artwork");
    			attr(div2, "class", "buttons");
    			attr(div3, "class", "content");
    			attr(div4, "class", "container welcomePage");
    			set_style(div4, "padding", "var(--size-200)");
    		},
    		m(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div1);
    			append(div4, t0);
    			append(div4, div3);
    			append(div3, h6);
    			append(div3, t2);
    			append(div3, p);
    			append(div3, t4);
    			append(div3, div2);
    			append(div2, span);
    			mount_component(button, span, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(span, "click", /*click_handler_3*/ ctx[23]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 128) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div4);
    			destroy_component(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (451:43) <Button classes="secondary" iconRight="arrow-right">
    function create_default_slot_9(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("Next");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (456:1) {#if welcomeSlides[2]}
    function create_if_block_15(ctx) {
    	let div4;
    	let div1;
    	let t0;
    	let div3;
    	let h6;
    	let t2;
    	let p;
    	let t4;
    	let div2;
    	let span;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				classes: "secondary",
    				iconRight: "arrow-right",
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			div4 = element("div");
    			div1 = element("div");
    			div1.innerHTML = `<div class="svg3"></div>`;
    			t0 = space();
    			div3 = element("div");
    			h6 = element("h6");
    			h6.textContent = "Multiple templates";
    			t2 = space();
    			p = element("p");
    			p.innerHTML = `Manage more than one table design by creating multiple templates. Choose the template you want by selecting it from the dropdown when creating a table.<br/>`;
    			t4 = space();
    			div2 = element("div");
    			span = element("span");
    			create_component(button.$$.fragment);
    			attr(div1, "class", "artwork");
    			attr(div2, "class", "buttons");
    			attr(div3, "class", "content");
    			attr(div4, "class", "container welcomePage");
    			set_style(div4, "padding", "var(--size-200)");
    		},
    		m(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div1);
    			append(div4, t0);
    			append(div4, div3);
    			append(div3, h6);
    			append(div3, t2);
    			append(div3, p);
    			append(div3, t4);
    			append(div3, div2);
    			append(div2, span);
    			mount_component(button, span, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(span, "click", /*click_handler_4*/ ctx[24]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 128) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div4);
    			destroy_component(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (467:44) <Button classes="secondary" iconRight="arrow-right">
    function create_default_slot_8(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("Next");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (472:1) {#if welcomeSlides[3]}
    function create_if_block_14(ctx) {
    	let div4;
    	let div1;
    	let t0;
    	let div3;
    	let h6;
    	let t2;
    	let p;
    	let t4;
    	let div2;
    	let span;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				classes: "secondary",
    				iconRight: "arrow-right",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			div4 = element("div");
    			div1 = element("div");
    			div1.innerHTML = `<div class="svg4"></div>`;
    			t0 = space();
    			div3 = element("div");
    			h6 = element("h6");
    			h6.textContent = "Libraries";
    			t2 = space();
    			p = element("p");
    			p.textContent = "Create tables based on templates from libraries. First published the template, then in the other file run the plugin and choose \"Existing Template\".";
    			t4 = space();
    			div2 = element("div");
    			span = element("span");
    			create_component(button.$$.fragment);
    			attr(div1, "class", "artwork");
    			attr(div2, "class", "buttons");
    			attr(div3, "class", "content");
    			attr(div4, "class", "container welcomePage");
    			set_style(div4, "padding", "var(--size-200)");
    		},
    		m(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div1);
    			append(div4, t0);
    			append(div4, div3);
    			append(div3, h6);
    			append(div3, t2);
    			append(div3, p);
    			append(div3, t4);
    			append(div3, div2);
    			append(div2, span);
    			mount_component(button, span, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(span, "click", /*click_handler_5*/ ctx[25]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 128) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div4);
    			destroy_component(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (483:44) <Button classes="secondary" iconRight="arrow-right">
    function create_default_slot_7(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("Next");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (488:1) {#if welcomeSlides[4]}
    function create_if_block_10(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_11, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*data*/ ctx[0].pluginUsingOldComponents) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			div = element("div");
    			if_block.c();
    			attr(div, "class", "container welcomePage");
    			set_style(div, "padding", "var(--size-200)");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};
    }

    // (501:2) {:else}
    function create_else_block(ctx) {
    	let div1;
    	let t0;
    	let div3;
    	let h6;
    	let t2;
    	let t3;
    	let div2;
    	let span;
    	let button;
    	let t4;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*data*/ ctx[0].remoteFiles.length > 0) return create_if_block_13;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block0 = current_block_type(ctx);

    	button = new Button({
    			props: {
    				classes: "secondary",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			}
    		});

    	let if_block1 = /*data*/ ctx[0].remoteFiles.length > 0 && create_if_block_12(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			div1.innerHTML = `<div class="svg6"></div>`;
    			t0 = space();
    			div3 = element("div");
    			h6 = element("h6");
    			h6.textContent = "Get started";
    			t2 = space();
    			if_block0.c();
    			t3 = space();
    			div2 = element("div");
    			span = element("span");
    			create_component(button.$$.fragment);
    			t4 = space();
    			if (if_block1) if_block1.c();
    			attr(div1, "class", "artwork");
    			attr(div2, "class", "buttons");
    			attr(div3, "class", "content");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			insert(target, t0, anchor);
    			insert(target, div3, anchor);
    			append(div3, h6);
    			append(div3, t2);
    			if_block0.m(div3, null);
    			append(div3, t3);
    			append(div3, div2);
    			append(div2, span);
    			mount_component(button, span, null);
    			append(div2, t4);
    			if (if_block1) if_block1.m(div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(span, "click", /*click_handler_7*/ ctx[27]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div3, t3);
    				}
    			}

    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 128) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (/*data*/ ctx[0].remoteFiles.length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*data*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_12(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div2, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (detaching) detach(t0);
    			if (detaching) detach(div3);
    			if_block0.d();
    			destroy_component(button);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (490:2) {#if data.pluginUsingOldComponents}
    function create_if_block_11(ctx) {
    	let div1;
    	let t0;
    	let div3;
    	let h6;
    	let t2;
    	let p;
    	let t4;
    	let div2;
    	let span;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				classes: "secondary",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			div1 = element("div");
    			div1.innerHTML = `<div class="svg7"></div>`;
    			t0 = space();
    			div3 = element("div");
    			h6 = element("h6");
    			h6.textContent = "Update to template";
    			t2 = space();
    			p = element("p");
    			p.textContent = "The table components in this file need updating. This will convert your existing table component into a template or create one if one doesn't exist.";
    			t4 = space();
    			div2 = element("div");
    			span = element("span");
    			create_component(button.$$.fragment);
    			attr(div1, "class", "artwork");
    			attr(div2, "class", "buttons");
    			attr(div3, "class", "content");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			insert(target, t0, anchor);
    			insert(target, div3, anchor);
    			append(div3, h6);
    			append(div3, t2);
    			append(div3, p);
    			append(div3, t4);
    			append(div3, div2);
    			append(div2, span);
    			mount_component(button, span, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(span, "click", /*click_handler_6*/ ctx[26]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 128) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (detaching) detach(t0);
    			if (detaching) detach(div3);
    			destroy_component(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (510:3) {:else}
    function create_else_block_1(ctx) {
    	let p;

    	return {
    		c() {
    			p = element("p");
    			p.textContent = "Begin by creating a new template to create tables from.";
    		},
    		m(target, anchor) {
    			insert(target, p, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(p);
    		}
    	};
    }

    // (508:3) {#if data.remoteFiles.length > 0}
    function create_if_block_13(ctx) {
    	let p;

    	return {
    		c() {
    			p = element("p");
    			p.textContent = "Create a new template or choose an existing template from a remote file.";
    		},
    		m(target, anchor) {
    			insert(target, p, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(p);
    		}
    	};
    }

    // (516:41) <Button classes="secondary">
    function create_default_slot_6(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("New Template");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (517:4) {#if data.remoteFiles.length > 0}
    function create_if_block_12(ctx) {
    	let span;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				classes: "secondary",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			span = element("span");
    			create_component(button.$$.fragment);
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			mount_component(button, span, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(span, "click", /*click_handler_8*/ ctx[28]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 128) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    			destroy_component(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (520:9) <Button classes="secondary">
    function create_default_slot_5(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("Existing Template");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (498:47) <Button classes="secondary">
    function create_default_slot_4(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("Create Template");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (530:0) {#if pageState.createTablePageActive}
    function create_if_block_1(ctx) {
    	let div7;
    	let div1;
    	let div0;
    	let dropdown0;
    	let t0;
    	let dropdown1;
    	let t1;
    	let div2;
    	let field0;
    	let t2;
    	let field1;
    	let t3;
    	let checkbox;
    	let t4;
    	let matrix;
    	let t5;
    	let div3;
    	let t7;
    	let div5;
    	let field2;
    	let t8;
    	let div4;
    	let radiobutton0;
    	let t9;
    	let radiobutton1;
    	let t10;
    	let radiobutton2;
    	let t11;
    	let div6;
    	let span;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	dropdown0 = new Dropdown({
    			props: {
    				fill: true,
    				icon: "component",
    				id: "menu",
    				$$slots: {
    					default: [create_default_slot_2],
    					content: [create_content_slot_1],
    					label: [create_label_slot_1]
    				},
    				$$scope: { ctx }
    			}
    		});

    	dropdown1 = new Dropdown({
    			props: {
    				$$slots: {
    					default: [create_default_slot_1],
    					content: [create_content_slot],
    					hitThing: [create_hitThing_slot]
    				},
    				$$scope: { ctx }
    			}
    		});

    	field0 = new Field({
    			props: {
    				id: "columnCount",
    				label: "C",
    				type: "number",
    				step: "1",
    				min: "1",
    				max: "50",
    				value: /*columnCount*/ ctx[2]
    			}
    		});

    	field1 = new Field({
    			props: {
    				id: "rowCount",
    				label: "R",
    				type: "number",
    				step: "1",
    				min: "1",
    				max: "50",
    				value: /*rowCount*/ ctx[3]
    			}
    		});

    	checkbox = new Checkbox({
    			props: {
    				id: "includeHeader",
    				label: "Include table header",
    				checked: /*includeHeader*/ ctx[4]
    			}
    		});

    	matrix = new Matrix({
    			props: {
    				columnCount: /*columnCount*/ ctx[2],
    				rowCount: /*rowCount*/ ctx[3],
    				grid: [8, 8]
    			}
    		});

    	field2 = new Field({
    			props: {
    				style: "width: 106px",
    				id: "cellWidth",
    				label: "W",
    				type: "number",
    				step: "1",
    				min: "1",
    				max: "1000",
    				value: /*cellWidth*/ ctx[5]
    			}
    		});

    	radiobutton0 = new RadioButton({
    			props: {
    				id: "min",
    				icon: "text-align-top",
    				value: "MIN",
    				name: "cellAlignment",
    				group: /*cellAlignment*/ ctx[6]
    			}
    		});

    	radiobutton1 = new RadioButton({
    			props: {
    				id: "center",
    				icon: "text-align-middle",
    				value: "CENTER",
    				name: "cellAlignment",
    				group: /*cellAlignment*/ ctx[6]
    			}
    		});

    	radiobutton2 = new RadioButton({
    			props: {
    				id: "max",
    				icon: "text-align-bottom",
    				value: "MAX",
    				name: "cellAlignment",
    				group: /*cellAlignment*/ ctx[6]
    			}
    		});

    	button = new Button({
    			props: {
    				id: "create-table",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			div7 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(dropdown0.$$.fragment);
    			t0 = space();
    			create_component(dropdown1.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			create_component(field0.$$.fragment);
    			t2 = space();
    			create_component(field1.$$.fragment);
    			t3 = space();
    			create_component(checkbox.$$.fragment);
    			t4 = space();
    			create_component(matrix.$$.fragment);
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "Cell";
    			t7 = space();
    			div5 = element("div");
    			create_component(field2.$$.fragment);
    			t8 = space();
    			div4 = element("div");
    			create_component(radiobutton0.$$.fragment);
    			t9 = space();
    			create_component(radiobutton1.$$.fragment);
    			t10 = space();
    			create_component(radiobutton2.$$.fragment);
    			t11 = space();
    			div6 = element("div");
    			span = element("span");
    			create_component(button.$$.fragment);
    			attr(div0, "class", "SelectWrapper");
    			attr(div1, "class", "section-title");
    			attr(div2, "class", "field-group");
    			attr(div3, "class", "text-bold SectionTitle");
    			attr(div4, "class", "RadioButtons");
    			set_style(div5, "display", "flex");
    			set_style(div5, "gap", "var(--size-200)");
    			attr(div6, "class", "BottomBar");
    			attr(div7, "class", "container");
    			set_style(div7, "padding", "var(--size-100) var(--size-200)");
    		},
    		m(target, anchor) {
    			insert(target, div7, anchor);
    			append(div7, div1);
    			append(div1, div0);
    			mount_component(dropdown0, div0, null);
    			append(div0, t0);
    			mount_component(dropdown1, div0, null);
    			append(div7, t1);
    			append(div7, div2);
    			mount_component(field0, div2, null);
    			append(div2, t2);
    			mount_component(field1, div2, null);
    			append(div7, t3);
    			mount_component(checkbox, div7, null);
    			append(div7, t4);
    			mount_component(matrix, div7, null);
    			append(div7, t5);
    			append(div7, div3);
    			append(div7, t7);
    			append(div7, div5);
    			mount_component(field2, div5, null);
    			append(div5, t8);
    			append(div5, div4);
    			mount_component(radiobutton0, div4, null);
    			append(div4, t9);
    			mount_component(radiobutton1, div4, null);
    			append(div4, t10);
    			mount_component(radiobutton2, div4, null);
    			append(div7, t11);
    			append(div7, div6);
    			append(div6, span);
    			mount_component(button, span, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(span, "click", /*createTable*/ ctx[13]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			const dropdown0_changes = {};

    			if (dirty[0] & /*data, selectedFile*/ 129 | dirty[1] & /*$$scope*/ 128) {
    				dropdown0_changes.$$scope = { dirty, ctx };
    			}

    			dropdown0.$set(dropdown0_changes);
    			const dropdown1_changes = {};

    			if (dirty[0] & /*columnResizing*/ 2 | dirty[1] & /*$$scope*/ 128) {
    				dropdown1_changes.$$scope = { dirty, ctx };
    			}

    			dropdown1.$set(dropdown1_changes);
    			const field0_changes = {};
    			if (dirty[0] & /*columnCount*/ 4) field0_changes.value = /*columnCount*/ ctx[2];
    			field0.$set(field0_changes);
    			const field1_changes = {};
    			if (dirty[0] & /*rowCount*/ 8) field1_changes.value = /*rowCount*/ ctx[3];
    			field1.$set(field1_changes);
    			const checkbox_changes = {};
    			if (dirty[0] & /*includeHeader*/ 16) checkbox_changes.checked = /*includeHeader*/ ctx[4];
    			checkbox.$set(checkbox_changes);
    			const matrix_changes = {};
    			if (dirty[0] & /*columnCount*/ 4) matrix_changes.columnCount = /*columnCount*/ ctx[2];
    			if (dirty[0] & /*rowCount*/ 8) matrix_changes.rowCount = /*rowCount*/ ctx[3];
    			matrix.$set(matrix_changes);
    			const field2_changes = {};
    			if (dirty[0] & /*cellWidth*/ 32) field2_changes.value = /*cellWidth*/ ctx[5];
    			field2.$set(field2_changes);
    			const radiobutton0_changes = {};
    			if (dirty[0] & /*cellAlignment*/ 64) radiobutton0_changes.group = /*cellAlignment*/ ctx[6];
    			radiobutton0.$set(radiobutton0_changes);
    			const radiobutton1_changes = {};
    			if (dirty[0] & /*cellAlignment*/ 64) radiobutton1_changes.group = /*cellAlignment*/ ctx[6];
    			radiobutton1.$set(radiobutton1_changes);
    			const radiobutton2_changes = {};
    			if (dirty[0] & /*cellAlignment*/ 64) radiobutton2_changes.group = /*cellAlignment*/ ctx[6];
    			radiobutton2.$set(radiobutton2_changes);
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 128) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(dropdown0.$$.fragment, local);
    			transition_in(dropdown1.$$.fragment, local);
    			transition_in(field0.$$.fragment, local);
    			transition_in(field1.$$.fragment, local);
    			transition_in(checkbox.$$.fragment, local);
    			transition_in(matrix.$$.fragment, local);
    			transition_in(field2.$$.fragment, local);
    			transition_in(radiobutton0.$$.fragment, local);
    			transition_in(radiobutton1.$$.fragment, local);
    			transition_in(radiobutton2.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(dropdown0.$$.fragment, local);
    			transition_out(dropdown1.$$.fragment, local);
    			transition_out(field0.$$.fragment, local);
    			transition_out(field1.$$.fragment, local);
    			transition_out(checkbox.$$.fragment, local);
    			transition_out(matrix.$$.fragment, local);
    			transition_out(field2.$$.fragment, local);
    			transition_out(radiobutton0.$$.fragment, local);
    			transition_out(radiobutton1.$$.fragment, local);
    			transition_out(radiobutton2.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div7);
    			destroy_component(dropdown0);
    			destroy_component(dropdown1);
    			destroy_component(field0);
    			destroy_component(field1);
    			destroy_component(checkbox);
    			destroy_component(matrix);
    			destroy_component(field2);
    			destroy_component(radiobutton0);
    			destroy_component(radiobutton1);
    			destroy_component(radiobutton2);
    			destroy_component(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (535:5) <slot slot="label">{data.defaultTemplate?.name}
    function create_label_slot_1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[38], get_default_slot_context);
    	const default_slot_or_fallback = default_slot || fallback_block_5(ctx);

    	return {
    		c() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[1] & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[38], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty[0] & /*data*/ 1) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};
    }

    // (535:24) {data.defaultTemplate?.name}
    function fallback_block_5(ctx) {
    	let t_value = /*data*/ ctx[0].defaultTemplate?.name + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*data*/ 1 && t_value !== (t_value = /*data*/ ctx[0].defaultTemplate?.name + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (544:9) <slot slot="label">           {selectedFile?.name}
    function create_label_slot(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[38], get_default_slot_context_2);
    	const default_slot_or_fallback = default_slot || fallback_block_4(ctx);

    	return {
    		c() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[1] & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[38], dirty, get_default_slot_changes_2, get_default_slot_context_2);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty[0] & /*selectedFile*/ 128) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};
    }

    // (544:28)            
    function fallback_block_4(ctx) {
    	let t_value = /*selectedFile*/ ctx[7]?.name + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*selectedFile*/ 128 && t_value !== (t_value = /*selectedFile*/ ctx[7]?.name + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (554:12) {#if data.localTemplates.length > 0}
    function create_if_block_8(ctx) {
    	let div;
    	let input;
    	let input_checked_value;
    	let t0;
    	let label;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			label.textContent = "Local templates";

    			input.checked = input_checked_value = /*selectedFile*/ ctx[7]?.id === /*data*/ ctx[0].fileId
    			? true
    			: false;

    			attr(input, "type", "radio");
    			attr(input, "id", "localTemplates");
    			attr(input, "name", "files");
    			attr(label, "for", "localTemplates");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, input);
    			append(div, t0);
    			append(div, label);

    			if (!mounted) {
    				dispose = listen(label, "click", /*click_handler_9*/ ctx[29]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*selectedFile, data*/ 129 && input_checked_value !== (input_checked_value = /*selectedFile*/ ctx[7]?.id === /*data*/ ctx[0].fileId
    			? true
    			: false)) {
    				input.checked = input_checked_value;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (564:12) {#if data.localTemplates.length > 0 && data.remoteFiles.length > 0}
    function create_if_block_7(ctx) {
    	let span;

    	return {
    		c() {
    			span = element("span");
    			attr(span, "class", "tooltip-divider");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (567:12) {#if data.remoteFiles.length > 0}
    function create_if_block_6(ctx) {
    	let each_1_anchor;
    	let each_value_3 = /*data*/ ctx[0].remoteFiles;
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*data, updateSelectedFile, selectedFile*/ 65665) {
    				each_value_3 = /*data*/ ctx[0].remoteFiles;
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (568:13) {#each data.remoteFiles as file}
    function create_each_block_3(ctx) {
    	let div;
    	let input;
    	let input_checked_value;
    	let input_id_value;
    	let t0;
    	let label;
    	let t1_value = /*file*/ ctx[47].name + "";
    	let t1;
    	let label_for_value;
    	let t2;
    	let mounted;
    	let dispose;

    	function click_handler_10(...args) {
    		return /*click_handler_10*/ ctx[30](/*file*/ ctx[47], ...args);
    	}

    	return {
    		c() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			t1 = text(t1_value);
    			t2 = space();

    			input.checked = input_checked_value = /*selectedFile*/ ctx[7]?.id === /*file*/ ctx[47].id
    			? true
    			: false;

    			attr(input, "type", "radio");
    			attr(input, "id", input_id_value = /*file*/ ctx[47].id);
    			attr(input, "name", "files");
    			attr(label, "for", label_for_value = /*file*/ ctx[47].id);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, input);
    			append(div, t0);
    			append(div, label);
    			append(label, t1);
    			append(div, t2);

    			if (!mounted) {
    				dispose = listen(label, "click", click_handler_10);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*selectedFile, data*/ 129 && input_checked_value !== (input_checked_value = /*selectedFile*/ ctx[7]?.id === /*file*/ ctx[47].id
    			? true
    			: false)) {
    				input.checked = input_checked_value;
    			}

    			if (dirty[0] & /*data*/ 1 && input_id_value !== (input_id_value = /*file*/ ctx[47].id)) {
    				attr(input, "id", input_id_value);
    			}

    			if (dirty[0] & /*data*/ 1 && t1_value !== (t1_value = /*file*/ ctx[47].name + "")) set_data(t1, t1_value);

    			if (dirty[0] & /*data*/ 1 && label_for_value !== (label_for_value = /*file*/ ctx[47].id)) {
    				attr(label, "for", label_for_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (552:9) <slot slot="content">           <div class="tooltip">             {#if data.localTemplates.length > 0}
    function create_content_slot_2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[38], get_default_slot_context_3);
    	const default_slot_or_fallback = default_slot || fallback_block_3(ctx);

    	return {
    		c() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[1] & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[38], dirty, get_default_slot_changes_3, get_default_slot_context_3);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty[0] & /*data, selectedFile*/ 129) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};
    }

    // (552:30)            
    function fallback_block_3(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let if_block0 = /*data*/ ctx[0].localTemplates.length > 0 && create_if_block_8(ctx);
    	let if_block1 = /*data*/ ctx[0].localTemplates.length > 0 && /*data*/ ctx[0].remoteFiles.length > 0 && create_if_block_7();
    	let if_block2 = /*data*/ ctx[0].remoteFiles.length > 0 && create_if_block_6(ctx);

    	return {
    		c() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			attr(div, "class", "tooltip");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append(div, t1);
    			if (if_block2) if_block2.m(div, null);
    		},
    		p(ctx, dirty) {
    			if (/*data*/ ctx[0].localTemplates.length > 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_8(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*data*/ ctx[0].localTemplates.length > 0 && /*data*/ ctx[0].remoteFiles.length > 0) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_7();
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*data*/ ctx[0].remoteFiles.length > 0) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_6(ctx);
    					if_block2.c();
    					if_block2.m(div, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};
    }

    // (543:8) <Dropdown id="tooltip">
    function create_default_slot_3(ctx) {
    	let t;

    	return {
    		c() {
    			t = space();
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (611:9) {#if data.remoteFiles.length > 0}
    function create_if_block_4(ctx) {
    	let div;
    	let each_value_1 = /*data*/ ctx[0].remoteFiles;
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	return {
    		c() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*data, selectedFile*/ 129) {
    				each_value_1 = /*data*/ ctx[0].remoteFiles;
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (587:8) {#if selectedFile?.id === data.fileId}
    function create_if_block_2(ctx) {
    	let if_block_anchor;
    	let if_block = /*data*/ ctx[0].localTemplates.length > 0 && create_if_block_3(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (/*data*/ ctx[0].localTemplates.length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (614:12) {#if selectedFile?.id === file.id}
    function create_if_block_5(ctx) {
    	let ul;
    	let t;
    	let each_value_2 = /*file*/ ctx[47].data;
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	return {
    		c() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr(ul, "class", "remote-file");
    		},
    		m(target, anchor) {
    			insert(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append(ul, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*data*/ 1) {
    				each_value_2 = /*file*/ ctx[47].data;
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (616:15) {#each file.data as template}
    function create_each_block_2(ctx) {
    	let li;
    	let t0_value = /*template*/ ctx[44].name + "";
    	let t0;
    	let t1;
    	let span;
    	let li_class_value;
    	let mounted;
    	let dispose;

    	function click_handler_14() {
    		return /*click_handler_14*/ ctx[34](/*template*/ ctx[44]);
    	}

    	function click_handler_15(...args) {
    		return /*click_handler_15*/ ctx[35](/*template*/ ctx[44], ...args);
    	}

    	return {
    		c() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");
    			set_style(span, "margin-left", "auto");
    			set_style(span, "margin-right", "calc(-1 * var(--size-100))");
    			attr(span, "class", "refresh icon");
    			attr(span, "icon", "swap");
    			attr(li, "class", li_class_value = "item " + (/*template*/ ctx[44].selected ? "selected" : ""));
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, t0);
    			append(li, t1);
    			append(li, span);

    			if (!mounted) {
    				dispose = [
    					listen(span, "click", click_handler_14),
    					listen(li, "click", click_handler_15)
    				];

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*data*/ 1 && t0_value !== (t0_value = /*template*/ ctx[44].name + "")) set_data(t0, t0_value);

    			if (dirty[0] & /*data*/ 1 && li_class_value !== (li_class_value = "item " + (/*template*/ ctx[44].selected ? "selected" : ""))) {
    				attr(li, "class", li_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (613:11) {#each data.remoteFiles as file}
    function create_each_block_1(ctx) {
    	let if_block_anchor;
    	let if_block = /*selectedFile*/ ctx[7]?.id === /*file*/ ctx[47].id && create_if_block_5(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (/*selectedFile*/ ctx[7]?.id === /*file*/ ctx[47].id) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_5(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (588:9) {#if data.localTemplates.length > 0}
    function create_if_block_3(ctx) {
    	let ul;
    	let each_value = /*data*/ ctx[0].localTemplates;
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(ul, "class", "local-templates");
    		},
    		m(target, anchor) {
    			insert(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*data, editTemplate*/ 131073) {
    				each_value = /*data*/ ctx[0].localTemplates;
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (590:10) {#each data.localTemplates as template}
    function create_each_block(ctx) {
    	let li;
    	let t0_value = /*template*/ ctx[44].name + "";
    	let t0;
    	let t1;
    	let div;
    	let span0;
    	let t2;
    	let span1;
    	let li_class_value;
    	let mounted;
    	let dispose;

    	function click_handler_11() {
    		return /*click_handler_11*/ ctx[31](/*template*/ ctx[44]);
    	}

    	function click_handler_12() {
    		return /*click_handler_12*/ ctx[32](/*template*/ ctx[44]);
    	}

    	function click_handler_13(...args) {
    		return /*click_handler_13*/ ctx[33](/*template*/ ctx[44], ...args);
    	}

    	return {
    		c() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			div = element("div");
    			span0 = element("span");
    			t2 = space();
    			span1 = element("span");
    			attr(span0, "class", "refresh icon");
    			attr(span0, "icon", "pencil");
    			attr(span1, "class", "refresh icon");
    			attr(span1, "icon", "swap");
    			set_style(div, "margin-left", "auto");
    			set_style(div, "margin-right", "calc(-1 * var(--size-100))");
    			attr(li, "class", li_class_value = "item " + (/*template*/ ctx[44].selected ? "selected" : ""));
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, t0);
    			append(li, t1);
    			append(li, div);
    			append(div, span0);
    			append(div, t2);
    			append(div, span1);

    			if (!mounted) {
    				dispose = [
    					listen(span0, "click", click_handler_11),
    					listen(span1, "click", click_handler_12),
    					listen(li, "click", click_handler_13)
    				];

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*data*/ 1 && t0_value !== (t0_value = /*template*/ ctx[44].name + "")) set_data(t0, t0_value);

    			if (dirty[0] & /*data*/ 1 && li_class_value !== (li_class_value = "item " + (/*template*/ ctx[44].selected ? "selected" : ""))) {
    				attr(li, "class", li_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (537:5) <slot slot="content">       <div class="menu">        <div class="Title">          <p style="font-weight: 600">Choose template</p>          <Dropdown id="tooltip">          <slot slot="label">           {selectedFile?.name}
    function create_content_slot_1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[38], get_default_slot_context_1);
    	const default_slot_or_fallback = default_slot || fallback_block_2(ctx);

    	return {
    		c() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[1] & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[38], dirty, get_default_slot_changes_1, get_default_slot_context_1);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty[0] & /*data, selectedFile*/ 129 | dirty[1] & /*$$scope*/ 128) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};
    }

    // (537:26)        
    function fallback_block_2(ctx) {
    	let div2;
    	let div0;
    	let p;
    	let t1;
    	let dropdown;
    	let t2;
    	let div1;
    	let current;

    	dropdown = new Dropdown({
    			props: {
    				id: "tooltip",
    				$$slots: {
    					default: [create_default_slot_3],
    					content: [create_content_slot_2],
    					label: [create_label_slot]
    				},
    				$$scope: { ctx }
    			}
    		});

    	function select_block_type_2(ctx, dirty) {
    		if (/*selectedFile*/ ctx[7]?.id === /*data*/ ctx[0].fileId) return create_if_block_2;
    		if (/*data*/ ctx[0].remoteFiles.length > 0) return create_if_block_4;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	return {
    		c() {
    			div2 = element("div");
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Choose template";
    			t1 = space();
    			create_component(dropdown.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			if (if_block) if_block.c();
    			set_style(p, "font-weight", "600");
    			attr(div0, "class", "Title");
    			attr(div1, "class", "menu__content");
    			attr(div2, "class", "menu");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div0, p);
    			append(div0, t1);
    			mount_component(dropdown, div0, null);
    			append(div2, t2);
    			append(div2, div1);
    			if (if_block) if_block.m(div1, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const dropdown_changes = {};

    			if (dirty[0] & /*data, selectedFile*/ 129 | dirty[1] & /*$$scope*/ 128) {
    				dropdown_changes.$$scope = { dirty, ctx };
    			}

    			dropdown.$set(dropdown_changes);

    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(dropdown.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(dropdown.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			destroy_component(dropdown);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};
    }

    // (534:4) <Dropdown fill icon="component" id="menu">
    function create_default_slot_2(ctx) {
    	let t;

    	return {
    		c() {
    			t = space();
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (640:5) <slot slot="hitThing"><span style="margin-left: auto;" class="ButtonIcon icon" icon="ellipses"></span></slot>      <slot slot="content">       <div class="tooltip wTriangle">        <!-- <Checkbox id="columnResizing" label="Column Resizing" checked={columnResizing}
    function create_hitThing_slot(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[38], get_default_slot_context_4);
    	const default_slot_or_fallback = default_slot || fallback_block_1();

    	return {
    		c() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[1] & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[38], dirty, get_default_slot_changes_4, get_default_slot_context_4);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};
    }

    // (640:27) <span style="margin-left: auto;" class="ButtonIcon icon" icon="ellipses">
    function fallback_block_1(ctx) {
    	let span;

    	return {
    		c() {
    			span = element("span");
    			set_style(span, "margin-left", "auto");
    			attr(span, "class", "ButtonIcon icon");
    			attr(span, "icon", "ellipses");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (641:5) <slot slot="content">       <div class="tooltip wTriangle">        <!-- <Checkbox id="columnResizing" label="Column Resizing" checked={columnResizing}
    function create_content_slot(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[38], get_default_slot_context_5);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	return {
    		c() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[1] & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[38], dirty, get_default_slot_changes_5, get_default_slot_context_5);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty[0] & /*columnResizing*/ 2) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};
    }

    // (641:26)        
    function fallback_block(ctx) {
    	let div1;
    	let div0;
    	let input;
    	let t0;
    	let label;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			label.textContent = "Column Resizing";
    			attr(input, "type", "checkbox");
    			attr(input, "id", "columnResizing");
    			attr(input, "name", "columnResizing");
    			attr(label, "for", "columnResizing");
    			attr(div1, "class", "tooltip wTriangle");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, input);
    			input.checked = /*columnResizing*/ ctx[1];
    			append(div0, t0);
    			append(div0, label);

    			if (!mounted) {
    				dispose = [
    					listen(input, "change", /*input_change_handler*/ ctx[36]),
    					listen(label, "click", /*click_handler_16*/ ctx[37])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*columnResizing*/ 2) {
    				input.checked = /*columnResizing*/ ctx[1];
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (639:4) <Dropdown>
    function create_default_slot_1(ctx) {
    	let t;

    	return {
    		c() {
    			t = space();
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (679:32) <Button id="create-table">
    function create_default_slot(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("Create table");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (684:0) {#if pageState.templateSettingsPageActive}
    function create_if_block(ctx) {
    	let div;
    	let templatesettings;
    	let current;

    	templatesettings = new TemplateSettings({
    			props: {
    				template: /*editingTemplate*/ ctx[8],
    				pageState: true
    			}
    		});

    	return {
    		c() {
    			div = element("div");
    			create_component(templatesettings.$$.fragment);
    			attr(div, "class", "container");
    			set_style(div, "padding", "var(--size-200)");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(templatesettings, div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const templatesettings_changes = {};
    			if (dirty[0] & /*editingTemplate*/ 256) templatesettings_changes.template = /*editingTemplate*/ ctx[8];
    			templatesettings.$set(templatesettings_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(templatesettings.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(templatesettings.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(templatesettings);
    		}
    	};
    }

    function create_fragment(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let if_block4_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*pageState*/ ctx[10].chooseRemoteTemplate && create_if_block_21(ctx);
    	let if_block1 = /*pageState*/ ctx[10].chooseTemplate && create_if_block_18(ctx);
    	let if_block2 = /*pageState*/ ctx[10].welcomePageActive && create_if_block_9(ctx);
    	let if_block3 = /*pageState*/ ctx[10].createTablePageActive && create_if_block_1(ctx);
    	let if_block4 = /*pageState*/ ctx[10].templateSettingsPageActive && create_if_block(ctx);

    	return {
    		c() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			if_block4_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert(target, t2, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert(target, t3, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert(target, if_block4_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen(window, "message", /*onLoad*/ ctx[18]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (/*pageState*/ ctx[10].chooseRemoteTemplate) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_21(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*pageState*/ ctx[10].chooseTemplate) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_18(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*pageState*/ ctx[10].welcomePageActive) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*pageState*/ 1024) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_9(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*pageState*/ ctx[10].createTablePageActive) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*pageState*/ 1024) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_1(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(t3.parentNode, t3);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*pageState*/ ctx[10].templateSettingsPageActive) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*pageState*/ 1024) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(if_block4_anchor.parentNode, if_block4_anchor);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach(t2);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach(t3);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach(if_block4_anchor);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    let rememberSettings = true;

    function updateSelectedTemplate(data, template) {
    	// Look for selected table in local templates
    	// If template not provided use defaultTemplate
    	template = template || data.defaultTemplate;

    	for (var i in data.localTemplates) {
    		if (template.component.key === data.localTemplates[i].component.key) {
    			data.localTemplates[i].selected = true;
    		}
    	}

    	// for (let i = 0; i < data.remoteFiles.length; i++) {
    	// }
    	for (let i in data.remoteFiles) {
    		let file = data.remoteFiles[i];

    		for (let b in data.remoteFiles[i].data) {
    			if (template.component.key === file.data[b].component.key) {
    				file.data[b].selected = true;
    			}
    		}
    	}

    	// TODO: Look for selected table in remote files
    	return data;
    }

    function saveUserPreferences(preferences) {
    	parent.postMessage(
    		{
    			pluginMessage: {
    				type: "save-user-preferences",
    				...preferences
    			}
    		},
    		"*"
    	);
    }

    function upgradeToTemplate() {
    	parent.postMessage(
    		{
    			pluginMessage: { type: "upgrade-to-template" }
    		},
    		"*"
    	);
    }

    function usingRemoteTemplate(boolean) {
    	parent.postMessage(
    		{
    			pluginMessage: {
    				type: "using-remote-template",
    				usingRemoteTemplate: boolean
    			}
    		},
    		"*"
    	);
    }

    function setDefaultTemplate(template, data) {
    	if (data) {
    		// Not sure how to get it to update UI
    		data = updateSelectedTemplate(data, template);
    	}

    	parent.postMessage(
    		{
    			pluginMessage: { type: "set-default-template", template }
    		},
    		"*"
    	);
    }

    function updateTables(template) {
    	parent.postMessage(
    		{
    			pluginMessage: { type: "update-tables", template }
    		},
    		"*"
    	);
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let data;
    	let columnResizing = true;
    	let columnCount;
    	let rowCount;
    	let includeHeader;
    	let cellWidth = 100;
    	let cellAlignment;
    	let selectedFile;
    	let editingTemplate;
    	let welcomeSlides = [true, false, false, false, false];

    	let pageState = {
    		welcomePageActive: false,
    		createTablePageActive: false,
    		templateSettingsPageActive: false,
    		chooseRemoteTemplate: false,
    		chooseTemplate: false
    	};

    	function setActiveSlide(number) {
    		// Reset slides
    		$$invalidate(9, welcomeSlides = welcomeSlides.map(x => false));

    		if (number => 0) {
    			$$invalidate(9, welcomeSlides[number] = true, welcomeSlides);
    		}
    	}

    	function setActivePage(name, number) {
    		// Reset page state
    		Object.keys(pageState).map(function (key, index) {
    			$$invalidate(10, pageState[key] = false, pageState);
    		});

    		$$invalidate(10, pageState[name] = true, pageState);

    		if (name === "welcomePageActive") {
    			if (number) {
    				setActiveSlide(number);
    			} else {
    				setActiveSlide(0);
    			}
    		}

    		return pageState;
    	}

    	// function isSelected(data, template) {
    	// 	for (var i in data.localTemplates) {
    	// 		if (data.defaultTemplate.component.key === template.component.key) {
    	// 			return true
    	// 		}
    	// 	}
    	// }
    	function createTable() {
    		parent.postMessage(
    			{
    				pluginMessage: {
    					type: "create-table-instance",
    					data: {
    						remember: rememberSettings,
    						columnResizing,
    						columnCount,
    						rowCount,
    						includeHeader,
    						cellWidth,
    						cellAlignment
    					}
    				}
    			},
    			"*"
    		);
    	}

    	function newTemplate() {
    		setActivePage("createTablePageActive");
    		parent.postMessage({ pluginMessage: { type: "new-template" } }, "*");
    	}

    	function chooseRemoteTemplate() {
    		setActivePage("chooseRemoteTemplate");
    	}

    	function updateSelectedFile(data, file) {
    		console.log("updating selected file in UI");

    		// file = file || data.defaultTemplate.file
    		if (file) {
    			$$invalidate(7, selectedFile = file);
    		} else {
    			if (data.defaultTemplate?.file.id === data.fileId) {
    				$$invalidate(7, selectedFile = data.defaultTemplate.file);
    				$$invalidate(7, selectedFile.name = "Local templates", selectedFile);

    				valueStore.update(data => {
    					data.selectedFile = selectedFile;
    					return data;
    				});
    			} else {
    				for (var i in data.remoteFiles) {
    					if (data.remoteFiles[i].id === data.defaultTemplate.file.id) {
    						// data.remoteFiles[i].selected = true
    						$$invalidate(7, selectedFile = data.remoteFiles[i]);

    						valueStore.update(data => {
    							data.selectedFile = selectedFile;
    							return data;
    						});
    					}
    				}
    			}
    		}

    		return data;
    	}

    	function editTemplate(template) {
    		$$invalidate(8, editingTemplate = template);
    		setActivePage("templateSettingsPageActive");
    	}

    	async function onLoad(event) {
    		var message = await event.data.pluginMessage;

    		if (message.type === "show-create-table-ui") {
    			$$invalidate(0, data = message);
    			let store = { pageState, selectedFile, data, ...data };
    			valueStore.set(store);

    			valueStore.subscribe(value => {
    				$$invalidate(7, selectedFile = value.selectedFile);
    				$$invalidate(10, pageState = value.pageState);
    				$$invalidate(2, columnCount = value.columnCount);
    				$$invalidate(3, rowCount = value.rowCount);
    				$$invalidate(5, cellWidth = value.cellWidth);
    				$$invalidate(4, includeHeader = value.includeHeader);
    				$$invalidate(6, cellAlignment = value.cellAlignment);
    				$$invalidate(1, columnResizing = value.columnResizing);
    				$$invalidate(0, data = value.data);
    			});

    			if (data.pluginVersion === "7.0.0") {
    				// If defaultTemplate exists then show create table UI
    				console.log("defaultTemplate", data.defaultTemplate);

    				if (data.defaultTemplate) {
    					setActivePage("createTablePageActive");
    					updateSelectedTemplate(data);
    					updateSelectedFile(data);
    				} else {
    					// Shows page to either convert old components to template, or create new template
    					setActivePage("welcomePageActive", 4);
    				}
    			} else {
    				setActivePage("welcomePageActive", 0);
    			}
    		}

    		if (message.type === "post-default-template") {
    			$$invalidate(0, data = Object.assign(data, message));

    			if (data.defaultTemplate) {
    				updateSelectedTemplate(data);
    				updateSelectedFile(data);
    			}
    		}

    		if (message.type === "show-create-table-page") {
    			setActivePage("createTablePageActive");
    		}
    	}

    	const click_handler = (file, event) => {
    		updateSelectedFile(data, file);
    		setActivePage("chooseTemplate");
    	};

    	const click_handler_1 = (template, event) => {
    		// Only trigger if clicking on the element itself
    		if (event.target !== event.currentTarget) return;

    		usingRemoteTemplate(true);
    		setDefaultTemplate(template, data);
    		setActivePage("createTablePageActive");
    	};

    	const click_handler_2 = () => setActiveSlide(1);
    	const click_handler_3 = () => setActiveSlide(2);
    	const click_handler_4 = () => setActiveSlide(3);
    	const click_handler_5 = () => setActiveSlide(4);
    	const click_handler_6 = () => upgradeToTemplate();
    	const click_handler_7 = () => newTemplate();

    	const click_handler_8 = () => {
    		chooseRemoteTemplate();
    	};

    	const click_handler_9 = event => {
    		updateSelectedFile(data, { name: "Local templates", id: data.fileId });

    		// event.currentTarget.parentElement.closest(".Select").classList.remove("show")
    		getDropdown("tooltip").close();
    	};

    	const click_handler_10 = (file, event) => {
    		updateSelectedFile(data, file);
    		getDropdown("tooltip").close();
    	}; // event.currentTarget.parentElement.closest(".Select").classList.remove("show")

    	const click_handler_11 = template => {
    		editTemplate(template);
    	};

    	const click_handler_12 = template => updateTables(template);

    	const click_handler_13 = (template, event) => {
    		// Only trigger if clicking on the element itself
    		if (event.target !== event.currentTarget) return;

    		usingRemoteTemplate(false);
    		setDefaultTemplate(template, data);

    		// Hide menu when template set
    		// event.currentTarget.parentElement.closest(".Select").classList.remove("show")
    		getDropdown("menu").close();
    	};

    	const click_handler_14 = template => updateTables(template);

    	const click_handler_15 = (template, event) => {
    		// Only trigger if clicking on the element itself
    		if (event.target !== event.currentTarget) return;

    		usingRemoteTemplate(true);
    		setDefaultTemplate(template, data);

    		// Hide menu when template set
    		// event.currentTarget.parentElement.closest(".Select").classList.remove("show")
    		getDropdown("menu").close();
    	};

    	function input_change_handler() {
    		columnResizing = this.checked;
    		$$invalidate(1, columnResizing);
    	}

    	const click_handler_16 = event => {
    		saveUserPreferences({ columnResizing: !columnResizing });
    	};

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(38, $$scope = $$props.$$scope);
    	};

    	return [
    		data,
    		columnResizing,
    		columnCount,
    		rowCount,
    		includeHeader,
    		cellWidth,
    		cellAlignment,
    		selectedFile,
    		editingTemplate,
    		welcomeSlides,
    		pageState,
    		setActiveSlide,
    		setActivePage,
    		createTable,
    		newTemplate,
    		chooseRemoteTemplate,
    		updateSelectedFile,
    		editTemplate,
    		onLoad,
    		slots,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		click_handler_9,
    		click_handler_10,
    		click_handler_11,
    		click_handler_12,
    		click_handler_13,
    		click_handler_14,
    		click_handler_15,
    		input_change_handler,
    		click_handler_16,
    		$$scope
    	];
    }

    class PluginUI extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, {}, [-1, -1]);
    	}
    }

    const app = new PluginUI({
    	target: document.body,
    });

    return app;

})();
