
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var ui = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
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
            if (typeof $$scope.dirty === 'object') {
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
    function null_to_empty(value) {
        return value == null ? '' : value;
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
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
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
    class HtmlTag {
        constructor(html, anchor = null) {
            this.e = element('div');
            this.a = anchor;
            this.u(html);
        }
        m(target, anchor = null) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(target, this.n[i], anchor);
            }
            this.t = target;
        }
        u(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        p(html) {
            this.d();
            this.u(html);
            this.m(this.t, this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
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
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
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
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
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
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

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

    var css = ":root{--blue:#18a0fb;--purple:#7b61ff;--hot-pink:#f0f;--green:#1bc47d;--red:#f24822;--yellow:#ffeb00;--black:#000;--black8:rgba(0,0,0,0.8);--black8-opaque:#333;--black3:rgba(0,0,0,0.3);--black3-opaque:#b3b3b3;--white:#fff;--white8:hsla(0,0%,100%,0.8);--white4:hsla(0,0%,100%,0.4);--grey:#f0f0f0;--silver:#e5e5e5;--hud:#222;--toolbar:#2c2c2c;--black1:rgba(0,0,0,0.1);--blue3:rgba(24,145,251,0.3);--purple4:rgba(123,97,255,0.4);--hover-fill:rgba(0,0,0,0.06);--selection-a:#daebf7;--selection-b:#edf5fa;--white2:hsla(0,0%,100%,0.2);--mp-y:#ffc700;--mp-g:#1bc47d;--mp-r:#ef5533;--mp-b:#18a0fb;--mp-p:#907cff;--mp-t:#00b5ce;--mp-s:#ee46d3;--font-stack:\"Inter\",sans-serif;--font-size-xsmall:11px;--font-size-small:12px;--font-size-large:13px;--font-size-xlarge:14px;--font-weight-normal:400;--font-weight-medium:500;--font-weight-bold:600;--font-line-height:16px;--font-line-height-large:24px;--font-letter-spacing-pos-small:.005em;--font-letter-spacing-neg-small:.01em;--font-letter-spacing-pos-medium:0;--font-letter-spacing-neg-medium:.005em;--font-letter-spacing-pos-large:-.0025em;--font-letter-spacing-neg-large:.0025em;--font-letter-spacing-pos-xlarge:-.001em;--font-letter-spacing-neg-xlarge:-.001em;--border-radius-small:2px;--border-radius-med:5px;--border-radius-large:6px;--shadow-hud:0 5px 17px rgba(0,0,0,0.2),0 2px 7px rgba(0,0,0,0.15);--shadow-floating-window:0 2px 14px rgba(0,0,0,0.15);--size-xxsmall:8px;--size-xsmall:16px;--size-small:24px;--size-medium:32px;--size-large:40px;--size-xlarge:48px;--size-xxlarge:64px;--size-huge:80px}*,body{box-sizing:border-box}body{position:relative;font-family:Inter,sans-serif;margin:0;padding:0}@font-face{font-family:Inter;font-weight:400;font-style:normal;src:url(https://rsms.me/inter/font-files/Inter-Regular.woff2?v=3.7) format(\"woff2\"),url(https://rsms.me/inter/font-files/Inter-Regular.woff?v=3.7) format(\"woff\")}@font-face{font-family:Inter;font-weight:500;font-style:normal;src:url(https://rsms.me/inter/font-files/Inter-Medium.woff2?v=3.7) format(\"woff2\"),url(https://rsms.me/inter/font-files/Inter-Medium.woff2?v=3.7) format(\"woff\")}@font-face{font-family:Inter;font-weight:600;font-style:normal;src:url(https://rsms.me/inter/font-files/Inter-SemiBold.woff2?v=3.7) format(\"woff2\"),url(https://rsms.me/inter/font-files/Inter-SemiBold.woff2?v=3.7) format(\"woff\")}.p-xxsmall{padding:var(--size-xxsmall)}.p-xsmall{padding:var(--size-xsmall)}.p-small{padding:var(--size-small)}.p-medium{padding:var(--size-medium)}.p-large{padding:var(--size-large)}.p-xlarge{padding:var(--size-xlarge)}.p-xxlarge{padding:var(--size-xxlarge)}.p-huge{padding:var(--size-huge)}.pt-xxsmall{padding-top:var(--size-xxsmall)}.pt-xsmall{padding-top:var(--size-xsmall)}.pt-small{padding-top:var(--size-small)}.pt-medium{padding-top:var(--size-medium)}.pt-large{padding-top:var(--size-large)}.pt-xlarge{padding-top:var(--size-xlarge)}.pt-xxlarge{padding-top:var(--size-xxlarge)}.pt-huge{padding-top:var(--size-huge)}.pr-xxsmall{padding-right:var(--size-xxsmall)}.pr-xsmall{padding-right:var(--size-xsmall)}.pr-small{padding-right:var(--size-small)}.pr-medium{padding-right:var(--size-medium)}.pr-large{padding-right:var(--size-large)}.pr-xlarge{padding-right:var(--size-xlarge)}.pr-xxlarge{padding-right:var(--size-xxlarge)}.pr-huge{padding-right:var(--size-huge)}.pb-xxsmall{padding-bottom:var(--size-xxsmall)}.pb-xsmall{padding-bottom:var(--size-xsmall)}.pb-small{padding-bottom:var(--size-small)}.pb-medium{padding-bottom:var(--size-medium)}.pb-large{padding-bottom:var(--size-large)}.pb-xlarge{padding-bottom:var(--size-xlarge)}.pb-xxlarge{padding-bottom:var(--size-xxlarge)}.pb-huge{padding-bottom:var(--size-huge)}.pl-xxsmall{padding-left:var(--size-xxsmall)}.pl-xsmall{padding-left:var(--size-xsmall)}.pl-small{padding-left:var(--size-small)}.pl-medium{padding-left:var(--size-medium)}.pl-large{padding-left:var(--size-large)}.pl-xlarge{padding-left:var(--size-xlarge)}.pl-xxlarge{padding-left:var(--size-xxlarge)}.pl-huge{padding-left:var(--size-huge)}.m-xxsmall{margin:var(--size-xxsmall)}.m-xsmall{margin:var(--size-xsmall)}.m-small{margin:var(--size-small)}.m-medium{margin:var(--size-medium)}.m-large{margin:var(--size-large)}.m-xlarge{margin:var(--size-xlarge)}.m-xxlarge{margin:var(--size-xxlarge)}.m-huge{margin:var(--size-huge)}.mt-xxsmall{margin-top:var(--size-xxsmall)}.mt-xsmall{margin-top:var(--size-xsmall)}.mt-small{margin-top:var(--size-small)}.mt-medium{margin-top:var(--size-medium)}.mt-large{margin-top:var(--size-large)}.mt-xlarge{margin-top:var(--size-xlarge)}.mt-xxlarge{margin-top:var(--size-xxlarge)}.mt-huge{margin-top:var(--size-huge)}.mr-xxsmall{margin-right:var(--size-xxsmall)}.mr-xsmall{margin-right:var(--size-xsmall)}.mr-small{margin-right:var(--size-small)}.mr-medium{margin-right:var(--size-medium)}.mr-large{margin-right:var(--size-large)}.mr-xlarge{margin-right:var(--size-xlarge)}.mr-xxlarge{margin-right:var(--size-xxlarge)}.mr-huge{margin-right:var(--size-huge)}.mb-xxsmall{margin-bottom:var(--size-xxsmall)}.mb-xsmall{margin-bottom:var(--size-xsmall)}.mb-small{margin-bottom:var(--size-small)}.mb-medium{margin-bottom:var(--size-medium)}.mb-large{margin-bottom:var(--size-large)}.mb-xlarge{margin-bottom:var(--size-xlarge)}.mb-xxlarge{margin-bottom:var(--size-xxlarge)}.mb-huge{margin-bottom:var(--size-huge)}.ml-xxsmall{margin-left:var(--size-xxsmall)}.ml-xsmall{margin-left:var(--size-xsmall)}.ml-small{margin-left:var(--size-small)}.ml-medium{margin-left:var(--size-medium)}.ml-large{margin-left:var(--size-large)}.ml-xlarge{margin-left:var(--size-xlarge)}.ml-xxlarge{margin-left:var(--size-xxlarge)}.ml-huge{margin-left:var(--size-huge)}.hidden{display:none}.flex{display:flex}.flexwrap{flex-wrap:wrap}.column{flex-direction:column}.row{flex-direction:row}";
    styleInject(css);

    /* node_modules/figma-plugin-ds-svelte/src/components/Button/index.svelte generated by Svelte v3.16.7 */

    const file = "node_modules/figma-plugin-ds-svelte/src/components/Button/index.svelte";

    function add_css() {
    	var style = element("style");
    	style.id = "svelte-rs1lk9-style";
    	style.textContent = "button.svelte-rs1lk9{background-color:var(--blue);border-radius:var(--border-radius-large);color:var(--white);display:inline-block;flex-shrink:0;font-family:var(--font-stack);font-size:var(--font-size-xsmall);font-weight:var(--font-weight-medium);letter-spacing:var(--font-letter-spacing-neg-medium);line-height:var(--font-line-height);height:var(--size-medium);padding:0 var(--size-xsmall) 0 var(--size-xsmall);text-decoration:none;outline:none;border:2px solid transparent;user-select:none}.primary.svelte-rs1lk9{background-color:var(--blue);color:var(--white)}.primary.svelte-rs1lk9:enabled:active,.primary.svelte-rs1lk9:enabled:focus{border:2px solid var(--black3)}.primary.svelte-rs1lk9:disabled{background-color:var(--black3)}.primary.destructive.svelte-rs1lk9{background-color:var(--red)}.primary.destructive.svelte-rs1lk9:disabled{opacity:0.4}.secondary.svelte-rs1lk9{background-color:var(--white);border:1px solid var(--black8);color:var(--black8);padding:0 calc(var(--size-xsmall) + 1px) 0 calc(var(--size-xsmall) + 1px);letter-spacing:var(--font-letter-spacing-pos-medium)}.secondary.svelte-rs1lk9:enabled:active,.secondary.svelte-rs1lk9:enabled:focus{border:2px solid var(--blue);padding:0 var(--size-xsmall) 0 var(--size-xsmall)}.secondary.svelte-rs1lk9:disabled{border:1px solid var(--black3);color:var(--black3)}.secondary.destructive.svelte-rs1lk9{border-color:var(--red);color:var(--red)}.secondary.destructive.svelte-rs1lk9:enabled:active,.secondary.destructive.svelte-rs1lk9:enabled:focus{border:2px solid var(--red);padding:0 var(--size-xsmall) 0 var(--size-xsmall)}.secondary.destructive.svelte-rs1lk9:disabled{opacity:0.4}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguc3ZlbHRlIiwic291cmNlcyI6WyJpbmRleC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgICBsZXQgY2xhc3NOYW1lID0gJyc7XG5cbiAgICBleHBvcnQgbGV0IHByaW1hcnkgPSBmYWxzZTtcbiAgICBleHBvcnQgbGV0IHNlY29uZGFyeSA9IGZhbHNlO1xuICAgIGV4cG9ydCBsZXQgZGlzYWJsZWQgPSBmYWxzZTtcbiAgICBleHBvcnQgbGV0IGRlc3RydWN0aXZlID0gZmFsc2U7XG4gICAgZXhwb3J0IHsgY2xhc3NOYW1lIGFzIGNsYXNzIH07XG48L3NjcmlwdD5cblxuPGJ1dHRvblxuICAgIG9uOmNsaWNrXG4gICAgb246c3VibWl0XG4gICAgb25jbGljaz1cInRoaXMuYmx1cigpO1wiXG4gICAgY2xhc3M6cHJpbWFyeT17cHJpbWFyeX1cbiAgICBjbGFzczpzZWNvbmRhcnk9e3NlY29uZGFyeX1cbiAgICBjbGFzczpkZXN0cnVjdGl2ZT17ZGVzdHJ1Y3RpdmV9XG4gICAge2Rpc2FibGVkfVxuICAgIGNsYXNzPXtjbGFzc05hbWV9PlxuICAgIDxzbG90IC8+XG48L2J1dHRvbj5cblxuPHN0eWxlPlxuXG4gICAgYnV0dG9uIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmx1ZSk7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMtbGFyZ2UpO1xuICAgICAgICBjb2xvcjogdmFyKC0td2hpdGUpO1xuICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgICAgIGZsZXgtc2hyaW5rOiAwO1xuICAgICAgICBmb250LWZhbWlseTogdmFyKC0tZm9udC1zdGFjayk7XG4gICAgICAgIGZvbnQtc2l6ZTogdmFyKC0tZm9udC1zaXplLXhzbWFsbCk7XG4gICAgICAgIGZvbnQtd2VpZ2h0OiB2YXIoLS1mb250LXdlaWdodC1tZWRpdW0pO1xuICAgICAgICBsZXR0ZXItc3BhY2luZzogdmFyKC0tZm9udC1sZXR0ZXItc3BhY2luZy1uZWctbWVkaXVtKTtcbiAgICAgICAgbGluZS1oZWlnaHQ6IHZhcigtLWZvbnQtbGluZS1oZWlnaHQpO1xuICAgICAgICBoZWlnaHQ6IHZhcigtLXNpemUtbWVkaXVtKTtcbiAgICAgICAgcGFkZGluZzogMCB2YXIoLS1zaXplLXhzbWFsbCkgMCB2YXIoLS1zaXplLXhzbWFsbCk7XG4gICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgICAgICAgb3V0bGluZTogbm9uZTtcbiAgICAgICAgYm9yZGVyOiAycHggc29saWQgdHJhbnNwYXJlbnQ7XG4gICAgICAgIHVzZXItc2VsZWN0OiBub25lO1xuICAgIH1cblxuICAgIC8qIFByaW1hcnkgc3R5bGVzICovXG4gICAgLnByaW1hcnkge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ibHVlKTtcbiAgICAgICAgY29sb3I6IHZhcigtLXdoaXRlKTtcbiAgICB9XG4gICAgLnByaW1hcnk6ZW5hYmxlZDphY3RpdmUsIC5wcmltYXJ5OmVuYWJsZWQ6Zm9jdXMge1xuICAgICAgICBib3JkZXI6IDJweCBzb2xpZCB2YXIoLS1ibGFjazMpO1xuICAgIH1cbiAgICAucHJpbWFyeTpkaXNhYmxlZCB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJsYWNrMyk7XG4gICAgfVxuICAgIC5wcmltYXJ5LmRlc3RydWN0aXZlIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tcmVkKTtcbiAgICB9XG4gICAgLnByaW1hcnkuZGVzdHJ1Y3RpdmU6ZGlzYWJsZWQge1xuICAgICAgICBvcGFjaXR5OiAwLjQ7XG4gICAgfVxuXG4gICAgLyogU2Vjb25kYXJ5IHN0eWxlcyAqL1xuICAgIC5zZWNvbmRhcnkge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS13aGl0ZSk7XG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJsYWNrOCk7XG4gICAgICAgIGNvbG9yOiB2YXIoLS1ibGFjazgpO1xuICAgICAgICBwYWRkaW5nOiAwIGNhbGModmFyKC0tc2l6ZS14c21hbGwpICsgMXB4KSAwIGNhbGModmFyKC0tc2l6ZS14c21hbGwpICsgMXB4KTtcbiAgICAgICAgbGV0dGVyLXNwYWNpbmc6IHZhcigtLWZvbnQtbGV0dGVyLXNwYWNpbmctcG9zLW1lZGl1bSk7XG4gICAgfVxuICAgIC5zZWNvbmRhcnk6ZW5hYmxlZDphY3RpdmUsIC5zZWNvbmRhcnk6ZW5hYmxlZDpmb2N1cyB7XG4gICAgICAgIGJvcmRlcjogMnB4IHNvbGlkIHZhcigtLWJsdWUpO1xuICAgICAgICBwYWRkaW5nOiAwIHZhcigtLXNpemUteHNtYWxsKSAwIHZhcigtLXNpemUteHNtYWxsKTtcbiAgICB9XG4gICAgLnNlY29uZGFyeTpkaXNhYmxlZCB7XG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJsYWNrMyk7XG4gICAgICAgIGNvbG9yOiB2YXIoLS1ibGFjazMpO1xuICAgIH1cbiAgICAuc2Vjb25kYXJ5LmRlc3RydWN0aXZlIHtcbiAgICAgICBib3JkZXItY29sb3I6IHZhcigtLXJlZCk7XG4gICAgICAgY29sb3I6IHZhcigtLXJlZCk7XG4gICAgfVxuICAgIC5zZWNvbmRhcnkuZGVzdHJ1Y3RpdmU6ZW5hYmxlZDphY3RpdmUsIC5zZWNvbmRhcnkuZGVzdHJ1Y3RpdmU6ZW5hYmxlZDpmb2N1cyB7XG4gICAgICAgYm9yZGVyOiAycHggc29saWQgdmFyKC0tcmVkKTtcbiAgICAgICAgcGFkZGluZzogMCB2YXIoLS1zaXplLXhzbWFsbCkgMCB2YXIoLS1zaXplLXhzbWFsbCk7XG4gICAgfVxuICAgIC5zZWNvbmRhcnkuZGVzdHJ1Y3RpdmU6ZGlzYWJsZWQge1xuICAgICAgICBvcGFjaXR5OiAwLjQ7XG4gICAgfVxuXG48L3N0eWxlPiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUF3QkksTUFBTSxjQUFDLENBQUMsQUFDSixnQkFBZ0IsQ0FBRSxJQUFJLE1BQU0sQ0FBQyxDQUM3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 */";
    	append_dev(document.head, style);
    }

    function create_fragment(ctx) {
    	let button;
    	let button_class_value;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "onclick", "this.blur();");
    			button.disabled = /*disabled*/ ctx[3];
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*className*/ ctx[0]) + " svelte-rs1lk9"));
    			toggle_class(button, "primary", /*primary*/ ctx[1]);
    			toggle_class(button, "secondary", /*secondary*/ ctx[2]);
    			toggle_class(button, "destructive", /*destructive*/ ctx[4]);
    			add_location(button, file, 10, 0, 215);

    			dispose = [
    				listen_dev(button, "click", /*click_handler*/ ctx[7], false, false, false),
    				listen_dev(button, "submit", /*submit_handler*/ ctx[8], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 32) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[5], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null));
    			}

    			if (!current || dirty & /*disabled*/ 8) {
    				prop_dev(button, "disabled", /*disabled*/ ctx[3]);
    			}

    			if (!current || dirty & /*className*/ 1 && button_class_value !== (button_class_value = "" + (null_to_empty(/*className*/ ctx[0]) + " svelte-rs1lk9"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*className, primary*/ 3) {
    				toggle_class(button, "primary", /*primary*/ ctx[1]);
    			}

    			if (dirty & /*className, secondary*/ 5) {
    				toggle_class(button, "secondary", /*secondary*/ ctx[2]);
    			}

    			if (dirty & /*className, destructive*/ 17) {
    				toggle_class(button, "destructive", /*destructive*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	let { primary = false } = $$props;
    	let { secondary = false } = $$props;
    	let { disabled = false } = $$props;
    	let { destructive = false } = $$props;
    	const writable_props = ["class", "primary", "secondary", "disabled", "destructive"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function submit_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, className = $$props.class);
    		if ("primary" in $$props) $$invalidate(1, primary = $$props.primary);
    		if ("secondary" in $$props) $$invalidate(2, secondary = $$props.secondary);
    		if ("disabled" in $$props) $$invalidate(3, disabled = $$props.disabled);
    		if ("destructive" in $$props) $$invalidate(4, destructive = $$props.destructive);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
    			className,
    			primary,
    			secondary,
    			disabled,
    			destructive
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("className" in $$props) $$invalidate(0, className = $$props.className);
    		if ("primary" in $$props) $$invalidate(1, primary = $$props.primary);
    		if ("secondary" in $$props) $$invalidate(2, secondary = $$props.secondary);
    		if ("disabled" in $$props) $$invalidate(3, disabled = $$props.disabled);
    		if ("destructive" in $$props) $$invalidate(4, destructive = $$props.destructive);
    	};

    	return [
    		className,
    		primary,
    		secondary,
    		disabled,
    		destructive,
    		$$scope,
    		$$slots,
    		click_handler,
    		submit_handler
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-rs1lk9-style")) add_css();

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			class: 0,
    			primary: 1,
    			secondary: 2,
    			disabled: 3,
    			destructive: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primary() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primary(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondary() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondary(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get destructive() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set destructive(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/figma-plugin-ds-svelte/src/components/Icon/index.svelte generated by Svelte v3.16.7 */

    const file$1 = "node_modules/figma-plugin-ds-svelte/src/components/Icon/index.svelte";

    function add_css$1() {
    	var style = element("style");
    	style.id = "svelte-1fwferi-style";
    	style.textContent = ".icon-component.svelte-1fwferi{display:flex;align-items:center;justify-content:center;cursor:default;width:var(--size-medium);height:var(--size-medium);font-family:var(--font-stack);font-size:var(--font-size-xsmall);user-select:none}.spin.svelte-1fwferi{animation:svelte-1fwferi-rotating 1.0s linear infinite}@keyframes svelte-1fwferi-rotating{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.icon-component *{fill:inherit;color:inherit}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguc3ZlbHRlIiwic291cmNlcyI6WyJpbmRleC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgICBsZXQgY2xhc3NOYW1lID0gJyc7XG4gICAgXG4gICAgZXhwb3J0IGxldCBpY29uTmFtZSA9IG51bGw7IC8vcGFzcyBzdmcgZGF0YSBpbnRvIHRoaXMgdmFyIGJ5IGltcG9ydGluZyBhbiBzdmcgaW4gcGFyZW50XG4gICAgZXhwb3J0IGxldCBzcGluID0gZmFsc2U7XG4gICAgZXhwb3J0IGxldCBpY29uVGV4dCA9IG51bGw7XG4gICAgZXhwb3J0IGxldCBjb2xvciA9IFwiYmxhY2s4XCI7XG4gICAgZXhwb3J0IHsgY2xhc3NOYW1lIGFzIGNsYXNzIH07XG5cbjwvc2NyaXB0PlxuXG48ZGl2IFxuICAgIGNsYXNzOnNwaW49e3NwaW59XG4gICAge2ljb25UZXh0fVxuICAgIHtpY29uTmFtZX0gXG4gICAgY2xhc3M9XCJpY29uLWNvbXBvbmVudCB7Y2xhc3NOYW1lfVwiXG4gICAgc3R5bGU9XCJjb2xvcjogdmFyKC0te2NvbG9yfSk7IGZpbGw6IHZhcigtLXtjb2xvcn0pXCI+XG4gICAgeyNpZiBpY29uVGV4dH1cbiAgICAgICAge2ljb25UZXh0fVxuICAgIHs6ZWxzZX1cbiAgICAgICAge0BodG1sIGljb25OYW1lfVxuICAgIHsvaWZ9XG48L2Rpdj5cblxuPHN0eWxlPlxuXG4gICAgLmljb24tY29tcG9uZW50IHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgIGN1cnNvcjogZGVmYXVsdDtcbiAgICAgICAgd2lkdGg6IHZhcigtLXNpemUtbWVkaXVtKTtcbiAgICAgICAgaGVpZ2h0OiB2YXIoLS1zaXplLW1lZGl1bSk7XG4gICAgICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1mb250LXN0YWNrKTtcbiAgICAgICAgZm9udC1zaXplOiB2YXIoLS1mb250LXNpemUteHNtYWxsKTtcbiAgICAgICAgdXNlci1zZWxlY3Q6IG5vbmU7XG4gICAgfVxuXG4gICAgLnNwaW4ge1xuICAgICAgICBhbmltYXRpb246IHJvdGF0aW5nIDEuMHMgbGluZWFyIGluZmluaXRlO1xuICAgIH1cblxuICAgIEBrZXlmcmFtZXMgcm90YXRpbmcge1xuICAgICAgICBmcm9tIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xuICAgICAgICB9XG4gICAgICAgIHRvIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICA6Z2xvYmFsKC5pY29uLWNvbXBvbmVudCAqKSB7XG4gICAgICAgIGZpbGw6IGluaGVyaXQ7XG4gICAgICAgIGNvbG9yOiBpbmhlcml0O1xuICAgIH1cblxuPC9zdHlsZT4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBMEJJLGVBQWUsZUFBQyxDQUFDLEFBQ2IsT0FBTyxDQUFFLElBQUksQ0FDYixXQUFXLENBQUUsTUFBTSxDQUNuQixlQUFlLENBQUUsTUFBTSxDQUN2QixNQUFNLENBQUUsT0FBTyxDQUNmLEtBQUssQ0FBRSxJQUFJLGFBQWEsQ0FBQyxDQUN6QixNQUFNLENBQUUsSUFBSSxhQUFhLENBQUMsQ0FDMUIsV0FBVyxDQUFFLElBQUksWUFBWSxDQUFDLENBQzlCLFNBQVMsQ0FBRSxJQUFJLGtCQUFrQixDQUFDLENBQ2xDLFdBQVcsQ0FBRSxJQUFJLEFBQ3JCLENBQUMsQUFFRCxLQUFLLGVBQUMsQ0FBQyxBQUNILFNBQVMsQ0FBRSx1QkFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxBQUM1QyxDQUFDLEFBRUQsV0FBVyx1QkFBUyxDQUFDLEFBQ2pCLElBQUksQUFBQyxDQUFDLEFBQ0YsU0FBUyxDQUFFLE9BQU8sSUFBSSxDQUFDLEFBQzNCLENBQUMsQUFDRCxFQUFFLEFBQUMsQ0FBQyxBQUNBLFNBQVMsQ0FBRSxPQUFPLE1BQU0sQ0FBQyxBQUM3QixDQUFDLEFBQ0wsQ0FBQyxBQUVPLGlCQUFpQixBQUFFLENBQUMsQUFDeEIsSUFBSSxDQUFFLE9BQU8sQ0FDYixLQUFLLENBQUUsT0FBTyxBQUNsQixDQUFDIn0= */";
    	append_dev(document.head, style);
    }

    // (20:4) {:else}
    function create_else_block(ctx) {
    	let html_tag;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag(/*iconName*/ ctx[1], null);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(target, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*iconName*/ 2) html_tag.p(/*iconName*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(20:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (18:4) {#if iconText}
    function create_if_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*iconText*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*iconText*/ 8) set_data_dev(t, /*iconText*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(18:4) {#if iconText}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let div_class_value;

    	function select_block_type(ctx, dirty) {
    		if (/*iconText*/ ctx[3]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "icontext", /*iconText*/ ctx[3]);
    			attr_dev(div, "iconname", /*iconName*/ ctx[1]);
    			attr_dev(div, "class", div_class_value = "icon-component " + /*className*/ ctx[0] + " svelte-1fwferi");
    			set_style(div, "color", "var(--" + /*color*/ ctx[4] + ")");
    			set_style(div, "fill", "var(--" + /*color*/ ctx[4] + ")");
    			toggle_class(div, "spin", /*spin*/ ctx[2]);
    			add_location(div, file$1, 11, 0, 271);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}

    			if (dirty & /*iconText*/ 8) {
    				attr_dev(div, "icontext", /*iconText*/ ctx[3]);
    			}

    			if (dirty & /*iconName*/ 2) {
    				attr_dev(div, "iconname", /*iconName*/ ctx[1]);
    			}

    			if (dirty & /*className*/ 1 && div_class_value !== (div_class_value = "icon-component " + /*className*/ ctx[0] + " svelte-1fwferi")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*color*/ 16) {
    				set_style(div, "color", "var(--" + /*color*/ ctx[4] + ")");
    			}

    			if (dirty & /*color*/ 16) {
    				set_style(div, "fill", "var(--" + /*color*/ ctx[4] + ")");
    			}

    			if (dirty & /*className, spin*/ 5) {
    				toggle_class(div, "spin", /*spin*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	let { iconName = null } = $$props;
    	let { spin = false } = $$props;
    	let { iconText = null } = $$props;
    	let { color = "black8" } = $$props;
    	const writable_props = ["class", "iconName", "spin", "iconText", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, className = $$props.class);
    		if ("iconName" in $$props) $$invalidate(1, iconName = $$props.iconName);
    		if ("spin" in $$props) $$invalidate(2, spin = $$props.spin);
    		if ("iconText" in $$props) $$invalidate(3, iconText = $$props.iconText);
    		if ("color" in $$props) $$invalidate(4, color = $$props.color);
    	};

    	$$self.$capture_state = () => {
    		return {
    			className,
    			iconName,
    			spin,
    			iconText,
    			color
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("className" in $$props) $$invalidate(0, className = $$props.className);
    		if ("iconName" in $$props) $$invalidate(1, iconName = $$props.iconName);
    		if ("spin" in $$props) $$invalidate(2, spin = $$props.spin);
    		if ("iconText" in $$props) $$invalidate(3, iconText = $$props.iconText);
    		if ("color" in $$props) $$invalidate(4, color = $$props.color);
    	};

    	return [className, iconName, spin, iconText, color];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1fwferi-style")) add_css$1();

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			class: 0,
    			iconName: 1,
    			spin: 2,
    			iconText: 3,
    			color: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get class() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconName() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconName(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spin() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spin(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconText() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconText(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/figma-plugin-ds-svelte/src/components/Input/index.svelte generated by Svelte v3.16.7 */
    const file$2 = "node_modules/figma-plugin-ds-svelte/src/components/Input/index.svelte";

    function add_css$2() {
    	var style = element("style");
    	style.id = "svelte-1o4owgs-style";
    	style.textContent = ".input.svelte-1o4owgs{position:relative}input.svelte-1o4owgs{font-size:var(--font-size-xsmall);font-weight:var(--font-weight-normal);letter-spacing:var( --font-letter-spacing-neg-small);line-height:var(--line-height);position:relative;display:flex;overflow:visible;align-items:center;width:100%;height:30px;margin:1px 0 1px 0;padding:7px 4px 9px 7px;color:var(--black8);border:1px solid transparent;border-radius:var(--border-radius-small);outline:none;background-color:var(--white)}input.svelte-1o4owgs:hover,input.svelte-1o4owgs:placeholder-shown:hover{color:var(--black8);border:1px solid var(--black1);background-image:none}input.svelte-1o4owgs::selection{color:var(--black);background-color:var(--blue3)}input.svelte-1o4owgs::placeholder{color:var(--black3);border:1px solid transparent}input.svelte-1o4owgs:placeholder-shown{border:1px solid transparent;background-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAcAAAAABCAYAAABJ5n7WAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgSURBVHgB7cMBCQAACMTAiR3sX1TQHr+DK2B+I0lSjj29qAEYlIbeBgAAAABJRU5ErkJggg==');background-repeat:no-repeat;background-position:center bottom -0.99px;background-size:calc(100% - 10px) 1px}input.svelte-1o4owgs:focus:placeholder-shown{border:1px solid var(--blue);outline:1px solid var(--blue);outline-offset:-2px}input.svelte-1o4owgs:disabled:hover{border:1px solid transparent}input.svelte-1o4owgs:active,input.svelte-1o4owgs:focus{padding:7px 4px 9px 7px;color:var(--black);border:1px solid var(--blue);outline:1px solid var(--blue);outline-offset:-2px}input.svelte-1o4owgs:disabled{position:relative;color:var(--black3);background-image:none}input.svelte-1o4owgs:disabled:active{padding:7px 4px 9px 7px;outline:none}.borders.svelte-1o4owgs{border:1px solid var(--black1);background-image:none}.borders.svelte-1o4owgs:disabled{border:1px solid transparent;background-image:none}.borders.svelte-1o4owgs:disabled:placeholder-shown{border:1px solid transparent;background-image:none}.borders.svelte-1o4owgs:disabled:placeholder-shown:active{border:1px solid transparent;outline:none}.borders.svelte-1o4owgs:placeholder-shown{border:1px solid var(--black1);background-image:none}.indent.svelte-1o4owgs{text-indent:24px}.icon.svelte-1o4owgs{position:absolute;top:-1px;left:0;width:var(--size-medium);height:var(--size-medium);z-index:1}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguc3ZlbHRlIiwic291cmNlcyI6WyJpbmRleC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgICBpbXBvcnQgSWNvbiBmcm9tICcuLy4uL0ljb24vaW5kZXguc3ZlbHRlJztcblxuICAgIGV4cG9ydCBsZXQgaWQgPSBudWxsO1xuICAgIGV4cG9ydCBsZXQgdmFsdWUgPSAnJztcbiAgICBleHBvcnQgbGV0IG5hbWUgPSBudWxsO1xuICAgIGV4cG9ydCBsZXQgaWNvblRleHQgPSBudWxsO1xuICAgIGV4cG9ydCBsZXQgYm9yZGVycyA9IGZhbHNlO1xuICAgIGV4cG9ydCBsZXQgZGlzYWJsZWQgPSBmYWxzZTtcbiAgICBleHBvcnQgbGV0IGljb25OYW1lID0gbnVsbDtcbiAgICBleHBvcnQgbGV0IHNwaW4gPSBmYWxzZTtcbiAgICBleHBvcnQgbGV0IHBsYWNlaG9sZGVyID0gJ0lucHV0IHNvbWV0aGluZyBoZXJlLi4uJztcbiAgICBleHBvcnQgeyBjbGFzc05hbWUgYXMgY2xhc3MgfTtcblxuICAgIGxldCBjbGFzc05hbWUgPSAnJztcblxuPC9zY3JpcHQ+XG5cbnsjaWYgaWNvbk5hbWUgfHwgaWNvblRleHR9XG4gICAgPGRpdiBjbGFzcz1cImlucHV0IHtjbGFzc05hbWV9XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJpY29uXCI+XG4gICAgICAgICAgICA8SWNvbiB7aWNvbk5hbWV9IHtpY29uVGV4dH0ge3NwaW59IGNvbG9yPVwiYmxhY2szXCIvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGlucHV0IFxuICAgICAgICAgICAgdHlwZT1cImlucHV0XCJcbiAgICAgICAgICAgIGJpbmQ6dmFsdWU9e3ZhbHVlfVxuICAgICAgICAgICAge2lkfVxuICAgICAgICAgICAge25hbWV9XG4gICAgICAgICAgICB7ZGlzYWJsZWR9XG4gICAgICAgICAgICB7cGxhY2Vob2xkZXJ9XG4gICAgICAgICAgICBjbGFzcz1cImluZGVudFwiXG4gICAgICAgICAgICBjbGFzczpib3JkZXJzPXtib3JkZXJzfVxuICAgICAgICA+XG4gICAgPC9kaXY+XG57OmVsc2V9XG4gICAgPGRpdiBjbGFzcz1cImlucHV0IHtjbGFzc05hbWV9XCI+XG4gICAgICAgIDxpbnB1dCBcbiAgICAgICAgICAgIHR5cGU9XCJpbnB1dFwiXG4gICAgICAgICAgICBiaW5kOnZhbHVlPXt2YWx1ZX1cbiAgICAgICAgICAgIHtpZH1cbiAgICAgICAgICAgIHtuYW1lfVxuICAgICAgICAgICAge2Rpc2FibGVkfVxuICAgICAgICAgICAge3BsYWNlaG9sZGVyfVxuICAgICAgICAgICAgY2xhc3M6Ym9yZGVycz17Ym9yZGVyc31cbiAgICAgICAgPlxuICAgIDwvZGl2Plxuey9pZn1cblxuPHN0eWxlPlxuXG4gICAgLmlucHV0IHtcbiAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIH1cblxuICAgIGlucHV0IHtcbiAgICAgICAgZm9udC1zaXplOiB2YXIoLS1mb250LXNpemUteHNtYWxsKTtcbiAgICAgICAgZm9udC13ZWlnaHQ6IHZhcigtLWZvbnQtd2VpZ2h0LW5vcm1hbCk7XG4gICAgICAgIGxldHRlci1zcGFjaW5nOiB2YXIoIC0tZm9udC1sZXR0ZXItc3BhY2luZy1uZWctc21hbGwpO1xuICAgICAgICBsaW5lLWhlaWdodDogdmFyKC0tbGluZS1oZWlnaHQpO1xuICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIG92ZXJmbG93OiB2aXNpYmxlO1xuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgaGVpZ2h0OiAzMHB4O1xuICAgICAgICBtYXJnaW46IDFweCAwIDFweCAwO1xuICAgICAgICBwYWRkaW5nOiA3cHggNHB4IDlweCA3cHg7XG4gICAgICAgIGNvbG9yOiB2YXIoLS1ibGFjazgpO1xuICAgICAgICBib3JkZXI6IDFweCBzb2xpZCB0cmFuc3BhcmVudDtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cy1zbWFsbCk7XG4gICAgICAgIG91dGxpbmU6IG5vbmU7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXdoaXRlKTtcbiAgICB9XG4gICAgaW5wdXQ6aG92ZXIsIGlucHV0OnBsYWNlaG9sZGVyLXNob3duOmhvdmVyIHtcblx0XHRjb2xvcjogdmFyKC0tYmxhY2s4KTtcblx0XHRib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ibGFjazEpO1xuICAgICAgICBiYWNrZ3JvdW5kLWltYWdlOiBub25lO1xuXHR9XG5cdGlucHV0OjpzZWxlY3Rpb24ge1xuXHRcdGNvbG9yOiB2YXIoLS1ibGFjayk7XG5cdFx0YmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmx1ZTMpO1xuXHR9XG5cdGlucHV0OjpwbGFjZWhvbGRlciB7XG5cdFx0Y29sb3I6IHZhcigtLWJsYWNrMyk7XG5cdFx0Ym9yZGVyOiAxcHggc29saWQgdHJhbnNwYXJlbnQ7XG5cdH1cblx0aW5wdXQ6cGxhY2Vob2xkZXItc2hvd24ge1xuXHRcdGJvcmRlcjogMXB4IHNvbGlkIHRyYW5zcGFyZW50O1xuXHRcdGJhY2tncm91bmQtaW1hZ2U6IHVybCgnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFjQUFBQUFCQ0FZQUFBQko1bjdXQUFBQUNYQklXWE1BQUFzVEFBQUxFd0VBbXB3WUFBQUFBWE5TUjBJQXJzNGM2UUFBQUFSblFVMUJBQUN4and2OFlRVUFBQUFnU1VSQlZIZ0I3Y01CQ1FBQUNNVEFpUjNzWDFUUUhyK0RLMkIrSTBsU2pqMjlxQUVZbEliZUJnQUFBQUJKUlU1RXJrSmdnZz09Jyk7XG5cdFx0YmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcblx0XHRiYWNrZ3JvdW5kLXBvc2l0aW9uOiBjZW50ZXIgYm90dG9tIC0wLjk5cHg7XG5cdFx0YmFja2dyb3VuZC1zaXplOiBjYWxjKDEwMCUgLSAxMHB4KSAxcHg7XG5cdH1cbiAgICBpbnB1dDpmb2N1czpwbGFjZWhvbGRlci1zaG93biB7XG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJsdWUpO1xuICAgICAgICBvdXRsaW5lOiAxcHggc29saWQgdmFyKC0tYmx1ZSk7XG4gICAgICAgIG91dGxpbmUtb2Zmc2V0OiAtMnB4O1xuICAgIH1cblx0aW5wdXQ6ZGlzYWJsZWQ6aG92ZXIge1xuXHRcdGJvcmRlcjogMXB4IHNvbGlkIHRyYW5zcGFyZW50O1xuXHR9XG5cdGlucHV0OmFjdGl2ZSwgaW5wdXQ6Zm9jdXMge1xuXHRcdHBhZGRpbmc6IDdweCA0cHggOXB4IDdweDtcblxuXHRcdGNvbG9yOiB2YXIoLS1ibGFjayk7XG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJsdWUpO1xuICAgICAgICBvdXRsaW5lOiAxcHggc29saWQgdmFyKC0tYmx1ZSk7XG4gICAgICAgIG91dGxpbmUtb2Zmc2V0OiAtMnB4O1xuXHR9XG5cdGlucHV0OmRpc2FibGVkIHtcblx0XHRwb3NpdGlvbjogcmVsYXRpdmU7XG5cdFx0Y29sb3I6IHZhcigtLWJsYWNrMyk7XG4gICAgICAgIGJhY2tncm91bmQtaW1hZ2U6IG5vbmU7XG5cdH1cblx0aW5wdXQ6ZGlzYWJsZWQ6YWN0aXZlIHtcblx0XHRwYWRkaW5nOiA3cHggNHB4IDlweCA3cHg7XG4gICAgICAgIG91dGxpbmU6IG5vbmU7XG4gICAgfVxuXG4gICAgLmJvcmRlcnMge1xuICAgICAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ibGFjazEpO1xuICAgICAgICBiYWNrZ3JvdW5kLWltYWdlOiBub25lO1xuICAgIH1cbiAgICAuYm9yZGVyczpkaXNhYmxlZCB7XG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHRyYW5zcGFyZW50O1xuICAgICAgICBiYWNrZ3JvdW5kLWltYWdlOiBub25lO1xuICAgIH1cbiAgICAuYm9yZGVyczpkaXNhYmxlZDpwbGFjZWhvbGRlci1zaG93biB7XG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHRyYW5zcGFyZW50O1xuICAgICAgICBiYWNrZ3JvdW5kLWltYWdlOiBub25lO1xuICAgIH1cbiAgICAuYm9yZGVyczpkaXNhYmxlZDpwbGFjZWhvbGRlci1zaG93bjphY3RpdmUge1xuICAgICAgICBib3JkZXI6IDFweCBzb2xpZCB0cmFuc3BhcmVudDtcbiAgICAgICAgb3V0bGluZTogbm9uZTtcbiAgICB9XG4gICAgLmJvcmRlcnM6cGxhY2Vob2xkZXItc2hvd24ge1xuICAgICAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ibGFjazEpO1xuICAgICAgICBiYWNrZ3JvdW5kLWltYWdlOiBub25lO1xuICAgIH1cbiAgICBcbiAgICAuaW5kZW50IHtcbiAgICAgICAgdGV4dC1pbmRlbnQ6IDI0cHg7XG4gICAgfVxuXG4gICAgLmljb24ge1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG5cdFx0dG9wOiAtMXB4O1xuXHRcdGxlZnQ6IDA7XG4gICAgICAgIHdpZHRoOiB2YXIoLS1zaXplLW1lZGl1bSk7XG4gICAgICAgIGhlaWdodDogdmFyKC0tc2l6ZS1tZWRpdW0pO1xuICAgICAgICB6LWluZGV4OiAxO1xuICAgIH1cblxuPC9zdHlsZT4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBa0RJLE1BQU0sZUFBQyxDQUFDLEFBQ0osUUFBUSxDQUFFLFFBQVEsQUFDdEIsQ0FBQyxBQUVELEtBQUssZUFBQyxDQUFDLEFBQ0gsU0FBUyxDQUFFLElBQUksa0JBQWtCLENBQUMsQ0FDbEMsV0FBVyxDQUFFLElBQUksb0JBQW9CLENBQUMsQ0FDdEMsY0FBYyxDQUFFLEtBQUssK0JBQStCLENBQUMsQ0FDckQsV0FBVyxDQUFFLElBQUksYUFBYSxDQUFDLENBQy9CLFFBQVEsQ0FBRSxRQUFRLENBQ2xCLE9BQU8sQ0FBRSxJQUFJLENBQ2IsUUFBUSxDQUFFLE9BQU8sQ0FDakIsV0FBVyxDQUFFLE1BQU0sQ0FDbkIsS0FBSyxDQUFFLElBQUksQ0FDWCxNQUFNLENBQUUsSUFBSSxDQUNa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 */";
    	append_dev(document.head, style);
    }

    // (35:0) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let input;
    	let div_class_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			attr_dev(input, "type", "input");
    			attr_dev(input, "id", /*id*/ ctx[1]);
    			attr_dev(input, "name", /*name*/ ctx[2]);
    			input.disabled = /*disabled*/ ctx[5];
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[8]);
    			attr_dev(input, "class", "svelte-1o4owgs");
    			toggle_class(input, "borders", /*borders*/ ctx[4]);
    			add_location(input, file$2, 36, 8, 886);
    			attr_dev(div, "class", div_class_value = "input " + /*className*/ ctx[9] + " svelte-1o4owgs");
    			add_location(div, file$2, 35, 4, 846);
    			dispose = listen_dev(input, "input", /*input_input_handler_1*/ ctx[11]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*value*/ ctx[0]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*id*/ 2) {
    				attr_dev(input, "id", /*id*/ ctx[1]);
    			}

    			if (dirty & /*name*/ 4) {
    				attr_dev(input, "name", /*name*/ ctx[2]);
    			}

    			if (dirty & /*disabled*/ 32) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[5]);
    			}

    			if (dirty & /*placeholder*/ 256) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[8]);
    			}

    			if (dirty & /*value*/ 1) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (dirty & /*borders*/ 16) {
    				toggle_class(input, "borders", /*borders*/ ctx[4]);
    			}

    			if (dirty & /*className*/ 512 && div_class_value !== (div_class_value = "input " + /*className*/ ctx[9] + " svelte-1o4owgs")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(35:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (19:0) {#if iconName || iconText}
    function create_if_block$1(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let input;
    	let div1_class_value;
    	let current;
    	let dispose;

    	const icon = new Icon({
    			props: {
    				iconName: /*iconName*/ ctx[6],
    				iconText: /*iconText*/ ctx[3],
    				spin: /*spin*/ ctx[7],
    				color: "black3"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(icon.$$.fragment);
    			t = space();
    			input = element("input");
    			attr_dev(div0, "class", "icon svelte-1o4owgs");
    			add_location(div0, file$2, 20, 8, 495);
    			attr_dev(input, "type", "input");
    			attr_dev(input, "id", /*id*/ ctx[1]);
    			attr_dev(input, "name", /*name*/ ctx[2]);
    			input.disabled = /*disabled*/ ctx[5];
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[8]);
    			attr_dev(input, "class", "indent svelte-1o4owgs");
    			toggle_class(input, "borders", /*borders*/ ctx[4]);
    			add_location(input, file$2, 23, 8, 601);
    			attr_dev(div1, "class", div1_class_value = "input " + /*className*/ ctx[9] + " svelte-1o4owgs");
    			add_location(div1, file$2, 19, 4, 455);
    			dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[10]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(icon, div0, null);
    			append_dev(div1, t);
    			append_dev(div1, input);
    			set_input_value(input, /*value*/ ctx[0]);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*iconName*/ 64) icon_changes.iconName = /*iconName*/ ctx[6];
    			if (dirty & /*iconText*/ 8) icon_changes.iconText = /*iconText*/ ctx[3];
    			if (dirty & /*spin*/ 128) icon_changes.spin = /*spin*/ ctx[7];
    			icon.$set(icon_changes);

    			if (!current || dirty & /*id*/ 2) {
    				attr_dev(input, "id", /*id*/ ctx[1]);
    			}

    			if (!current || dirty & /*name*/ 4) {
    				attr_dev(input, "name", /*name*/ ctx[2]);
    			}

    			if (!current || dirty & /*disabled*/ 32) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[5]);
    			}

    			if (!current || dirty & /*placeholder*/ 256) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[8]);
    			}

    			if (dirty & /*value*/ 1) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (dirty & /*borders*/ 16) {
    				toggle_class(input, "borders", /*borders*/ ctx[4]);
    			}

    			if (!current || dirty & /*className*/ 512 && div1_class_value !== (div1_class_value = "input " + /*className*/ ctx[9] + " svelte-1o4owgs")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(icon);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(19:0) {#if iconName || iconText}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*iconName*/ ctx[6] || /*iconText*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
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
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { id = null } = $$props;
    	let { value = "" } = $$props;
    	let { name = null } = $$props;
    	let { iconText = null } = $$props;
    	let { borders = false } = $$props;
    	let { disabled = false } = $$props;
    	let { iconName = null } = $$props;
    	let { spin = false } = $$props;
    	let { placeholder = "Input something here..." } = $$props;
    	let { class: className = "" } = $$props;

    	const writable_props = [
    		"id",
    		"value",
    		"name",
    		"iconText",
    		"borders",
    		"disabled",
    		"iconName",
    		"spin",
    		"placeholder",
    		"class"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function input_input_handler_1() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("iconText" in $$props) $$invalidate(3, iconText = $$props.iconText);
    		if ("borders" in $$props) $$invalidate(4, borders = $$props.borders);
    		if ("disabled" in $$props) $$invalidate(5, disabled = $$props.disabled);
    		if ("iconName" in $$props) $$invalidate(6, iconName = $$props.iconName);
    		if ("spin" in $$props) $$invalidate(7, spin = $$props.spin);
    		if ("placeholder" in $$props) $$invalidate(8, placeholder = $$props.placeholder);
    		if ("class" in $$props) $$invalidate(9, className = $$props.class);
    	};

    	$$self.$capture_state = () => {
    		return {
    			id,
    			value,
    			name,
    			iconText,
    			borders,
    			disabled,
    			iconName,
    			spin,
    			placeholder,
    			className
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("iconText" in $$props) $$invalidate(3, iconText = $$props.iconText);
    		if ("borders" in $$props) $$invalidate(4, borders = $$props.borders);
    		if ("disabled" in $$props) $$invalidate(5, disabled = $$props.disabled);
    		if ("iconName" in $$props) $$invalidate(6, iconName = $$props.iconName);
    		if ("spin" in $$props) $$invalidate(7, spin = $$props.spin);
    		if ("placeholder" in $$props) $$invalidate(8, placeholder = $$props.placeholder);
    		if ("className" in $$props) $$invalidate(9, className = $$props.className);
    	};

    	return [
    		value,
    		id,
    		name,
    		iconText,
    		borders,
    		disabled,
    		iconName,
    		spin,
    		placeholder,
    		className,
    		input_input_handler,
    		input_input_handler_1
    	];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1o4owgs-style")) add_css$2();

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			id: 1,
    			value: 0,
    			name: 2,
    			iconText: 3,
    			borders: 4,
    			disabled: 5,
    			iconName: 6,
    			spin: 7,
    			placeholder: 8,
    			class: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get id() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconText() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconText(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get borders() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borders(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconName() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconName(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spin() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spin(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var IconVisible = "<svg fill=\"none\" height=\"32\" viewBox=\"0 0 32 32\" width=\"32\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"#000\"><path d=\"m16.0004 18c1.1045 0 2-.8954 2-2s-.8955-2-2-2c-1.1046 0-2 .8954-2 2s.8954 2 2 2z\"/><path clip-rule=\"evenodd\" d=\"m16.0001 12c2.878 0 5.3774 1.6211 6.6349 4-1.2575 2.3789-3.7569 4-6.6349 4-2.8781 0-5.3775-1.6211-6.63499-4 1.25749-2.3789 3.75689-4 6.63499-4zm0 7c-2.2999 0-4.3222-1.1942-5.4784-3 1.1562-1.8058 3.1785-3 5.4784-3 2.2998 0 4.3221 1.1942 5.4783 3-1.1562 1.8058-3.1785 3-5.4783 3z\" fill-rule=\"evenodd\"/></g></svg>";

    var IconWarning = "<svg fill=\"none\" height=\"32\" viewBox=\"0 0 32 32\" width=\"32\" xmlns=\"http://www.w3.org/2000/svg\"><path clip-rule=\"evenodd\" d=\"m16 9 8 14h-16zm-1 8.5v-3.5h2v3.5zm0 1.5v2h2v-2z\" fill=\"#000\" fill-rule=\"evenodd\"/></svg>";

    /* src/Ui.svelte generated by Svelte v3.16.7 */

    // (21:0) <Button primary>
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Click me");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(21:0) <Button primary>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const button = new Button({
    			props: {
    				primary: true,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const input = new Input({
    			props: { iconName: IconVisible },
    			$$inline: true
    		});

    	const icon0 = new Icon({
    			props: { iconName: IconVisible },
    			$$inline: true
    		});

    	const icon1 = new Icon({
    			props: { iconName: IconWarning },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    			t0 = space();
    			create_component(input.$$.fragment);
    			t1 = space();
    			create_component(icon0.$$.fragment);
    			t2 = space();
    			create_component(icon1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(input, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(icon0, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(icon1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			transition_in(input.$$.fragment, local);
    			transition_in(icon0.$$.fragment, local);
    			transition_in(icon1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(input.$$.fragment, local);
    			transition_out(icon0.$$.fragment, local);
    			transition_out(icon1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(input, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(icon0, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(icon1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Ui extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ui",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const app = new Ui({
    	target: document.body,
    });

    return app;

}());
