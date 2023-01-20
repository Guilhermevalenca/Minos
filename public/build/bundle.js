
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
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
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
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
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    /**
     * Associates an arbitrary `context` object with the current component and the specified `key`
     * and returns that object. The context is then available to children of the component
     * (including slotted content) with `getContext`.
     *
     * Like lifecycle functions, this must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-setcontext
     */
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    /**
     * Retrieves the context that belongs to the closest parent component with the specified `key`.
     * Must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-getcontext
     */
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
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
        else if (callback) {
            callback();
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function each(items, fn) {
        let str = '';
        for (let i = 0; i < items.length; i += 1) {
            str += fn(items[i], i);
        }
        return str;
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor, options.customElement);
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
            if (!is_function(callback)) {
                return noop;
            }
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

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.53.1' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /*
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const isUndefined = value => typeof value === "undefined";

    const isFunction = value => typeof value === "function";

    const isNumber = value => typeof value === "number";

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
    	return (
    		!event.defaultPrevented &&
    		event.button === 0 &&
    		!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
    	);
    }

    function createCounter() {
    	let i = 0;
    	/**
    	 * Returns an id and increments the internal state
    	 * @returns {number}
    	 */
    	return () => i++;
    }

    /**
     * Create a globally unique id
     *
     * @returns {string} An id
     */
    function createGlobalId() {
    	return Math.random().toString(36).substring(2);
    }

    const isSSR = typeof window === "undefined";

    function addListener(target, type, handler) {
    	target.addEventListener(type, handler);
    	return () => target.removeEventListener(type, handler);
    }

    const createInlineStyle = (disableInlineStyles, style) =>
    	disableInlineStyles ? {} : { style };
    const createMarkerProps = disableInlineStyles => ({
    	"aria-hidden": "true",
    	...createInlineStyle(disableInlineStyles, "display:none;"),
    });

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
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
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /*
     * Adapted from https://github.com/EmilTholin/svelte-routing
     *
     * https://github.com/EmilTholin/svelte-routing/blob/master/LICENSE
     */

    const createKey = ctxName => `@@svnav-ctx__${ctxName}`;

    // Use strings instead of objects, so different versions of
    // svelte-navigator can potentially still work together
    const LOCATION = createKey("LOCATION");
    const ROUTER = createKey("ROUTER");
    const ROUTE = createKey("ROUTE");
    const ROUTE_PARAMS = createKey("ROUTE_PARAMS");
    const FOCUS_ELEM = createKey("FOCUS_ELEM");

    const paramRegex = /^:(.+)/;

    const substr = (str, start, end) => str.substr(start, end);

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    const startsWith = (string, search) =>
    	substr(string, 0, search.length) === search;

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    const isRootSegment = segment => segment === "";

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    const isDynamic = segment => paramRegex.test(segment);

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    const isSplat = segment => segment[0] === "*";

    /**
     * Strip potention splat and splatname of the end of a path
     * @param {string} str
     * @return {string}
     */
    const stripSplat = str => str.replace(/\*.*$/, "");

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    const stripSlashes = str => str.replace(/(^\/+|\/+$)/g, "");

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri, filterFalsy = false) {
    	const segments = stripSlashes(uri).split("/");
    	return filterFalsy ? segments.filter(Boolean) : segments;
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    const addQuery = (pathname, query) =>
    	pathname + (query ? `?${query}` : "");

    /**
     * Normalizes a basepath
     *
     * @param {string} path
     * @returns {string}
     *
     * @example
     * normalizePath("base/path/") // -> "/base/path"
     */
    const normalizePath = path => `/${stripSlashes(path)}`;

    /**
     * Joins and normalizes multiple path fragments
     *
     * @param {...string} pathFragments
     * @returns {string}
     */
    function join(...pathFragments) {
    	const joinFragment = fragment => segmentize(fragment, true).join("/");
    	const joinedSegments = pathFragments.map(joinFragment).join("/");
    	return normalizePath(joinedSegments);
    }

    // We start from 1 here, so we can check if an origin id has been passed
    // by using `originId || <fallback>`
    const LINK_ID = 1;
    const ROUTE_ID = 2;
    const ROUTER_ID = 3;
    const USE_FOCUS_ID = 4;
    const USE_LOCATION_ID = 5;
    const USE_MATCH_ID = 6;
    const USE_NAVIGATE_ID = 7;
    const USE_PARAMS_ID = 8;
    const USE_RESOLVABLE_ID = 9;
    const USE_RESOLVE_ID = 10;
    const NAVIGATE_ID = 11;

    const labels = {
    	[LINK_ID]: "Link",
    	[ROUTE_ID]: "Route",
    	[ROUTER_ID]: "Router",
    	[USE_FOCUS_ID]: "useFocus",
    	[USE_LOCATION_ID]: "useLocation",
    	[USE_MATCH_ID]: "useMatch",
    	[USE_NAVIGATE_ID]: "useNavigate",
    	[USE_PARAMS_ID]: "useParams",
    	[USE_RESOLVABLE_ID]: "useResolvable",
    	[USE_RESOLVE_ID]: "useResolve",
    	[NAVIGATE_ID]: "navigate",
    };

    const createLabel = labelId => labels[labelId];

    function createIdentifier(labelId, props) {
    	let attr;
    	if (labelId === ROUTE_ID) {
    		attr = props.path ? `path="${props.path}"` : "default";
    	} else if (labelId === LINK_ID) {
    		attr = `to="${props.to}"`;
    	} else if (labelId === ROUTER_ID) {
    		attr = `basepath="${props.basepath || ""}"`;
    	}
    	return `<${createLabel(labelId)} ${attr || ""} />`;
    }

    function createMessage(labelId, message, props, originId) {
    	const origin = props && createIdentifier(originId || labelId, props);
    	const originMsg = origin ? `\n\nOccurred in: ${origin}` : "";
    	const label = createLabel(labelId);
    	const msg = isFunction(message) ? message(label) : message;
    	return `<${label}> ${msg}${originMsg}`;
    }

    const createMessageHandler =
    	handler =>
    	(...args) =>
    		handler(createMessage(...args));

    const fail = createMessageHandler(message => {
    	throw new Error(message);
    });

    // eslint-disable-next-line no-console
    const warn = createMessageHandler(console.warn);

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
    	const score = route.default
    		? 0
    		: segmentize(route.fullPath).reduce((acc, segment) => {
    				let nextScore = acc;
    				nextScore += SEGMENT_POINTS;

    				if (isRootSegment(segment)) {
    					nextScore += ROOT_POINTS;
    				} else if (isDynamic(segment)) {
    					nextScore += DYNAMIC_POINTS;
    				} else if (isSplat(segment)) {
    					nextScore -= SEGMENT_POINTS + SPLAT_PENALTY;
    				} else {
    					nextScore += STATIC_POINTS;
    				}

    				return nextScore;
    		  }, 0);

    	return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
    	return (
    		routes
    			.map(rankRoute)
    			// If two routes have the exact same score, we go by index instead
    			.sort((a, b) => {
    				if (a.score < b.score) {
    					return 1;
    				}
    				if (a.score > b.score) {
    					return -1;
    				}
    				return a.index - b.index;
    			})
    	);
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { fullPath, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
    	let bestMatch;
    	let defaultMatch;

    	const [uriPathname] = uri.split("?");
    	const uriSegments = segmentize(uriPathname);
    	const isRootUri = uriSegments[0] === "";
    	const ranked = rankRoutes(routes);

    	for (let i = 0, l = ranked.length; i < l; i++) {
    		const { route } = ranked[i];
    		let missed = false;
    		const params = {};

    		// eslint-disable-next-line no-shadow
    		const createMatch = uri => ({ ...route, params, uri });

    		if (route.default) {
    			defaultMatch = createMatch(uri);
    			continue;
    		}

    		const routeSegments = segmentize(route.fullPath);
    		const max = Math.max(uriSegments.length, routeSegments.length);
    		let index = 0;

    		for (; index < max; index++) {
    			const routeSegment = routeSegments[index];
    			const uriSegment = uriSegments[index];

    			if (!isUndefined(routeSegment) && isSplat(routeSegment)) {
    				// Hit a splat, just grab the rest, and return a match
    				// uri:   /files/documents/work
    				// route: /files/* or /files/*splatname
    				const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

    				params[splatName] = uriSegments
    					.slice(index)
    					.map(decodeURIComponent)
    					.join("/");
    				break;
    			}

    			if (isUndefined(uriSegment)) {
    				// URI is shorter than the route, no match
    				// uri:   /users
    				// route: /users/:userId
    				missed = true;
    				break;
    			}

    			const dynamicMatch = paramRegex.exec(routeSegment);

    			if (dynamicMatch && !isRootUri) {
    				const value = decodeURIComponent(uriSegment);
    				params[dynamicMatch[1]] = value;
    			} else if (routeSegment !== uriSegment) {
    				// Current segments don't match, not dynamic, not splat, so no match
    				// uri:   /users/123/settings
    				// route: /users/:id/profile
    				missed = true;
    				break;
    			}
    		}

    		if (!missed) {
    			bestMatch = createMatch(join(...uriSegments.slice(0, index)));
    			break;
    		}
    	}

    	return bestMatch || defaultMatch || null;
    }

    /**
     * Check if the `route.fullPath` matches the `uri`.
     * @param {Object} route
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
    	return pick([route], uri);
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
    	// /foo/bar, /baz/qux => /foo/bar
    	if (startsWith(to, "/")) {
    		return to;
    	}

    	const [toPathname, toQuery] = to.split("?");
    	const [basePathname] = base.split("?");
    	const toSegments = segmentize(toPathname);
    	const baseSegments = segmentize(basePathname);

    	// ?a=b, /users?b=c => /users?a=b
    	if (toSegments[0] === "") {
    		return addQuery(basePathname, toQuery);
    	}

    	// profile, /users/789 => /users/789/profile
    	if (!startsWith(toSegments[0], ".")) {
    		const pathname = baseSegments.concat(toSegments).join("/");
    		return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
    	}

    	// ./       , /users/123 => /users/123
    	// ../      , /users/123 => /users
    	// ../..    , /users/123 => /
    	// ../../one, /a/b/c/d   => /a/b/one
    	// .././one , /a/b/c/d   => /a/b/c/one
    	const allSegments = baseSegments.concat(toSegments);
    	const segments = [];

    	allSegments.forEach(segment => {
    		if (segment === "..") {
    			segments.pop();
    		} else if (segment !== ".") {
    			segments.push(segment);
    		}
    	});

    	return addQuery(`/${segments.join("/")}`, toQuery);
    }

    /**
     * Normalizes a location for consumption by `Route` children and the `Router`.
     * It removes the apps basepath from the pathname
     * and sets default values for `search` and `hash` properties.
     *
     * @param {Object} location The current global location supplied by the history component
     * @param {string} basepath The applications basepath (i.e. when serving from a subdirectory)
     *
     * @returns The normalized location
     */
    function normalizeLocation(location, basepath) {
    	const { pathname, hash = "", search = "", state } = location;
    	const baseSegments = segmentize(basepath, true);
    	const pathSegments = segmentize(pathname, true);
    	while (baseSegments.length) {
    		if (baseSegments[0] !== pathSegments[0]) {
    			fail(
    				ROUTER_ID,
    				`Invalid state: All locations must begin with the basepath "${basepath}", found "${pathname}"`,
    			);
    		}
    		baseSegments.shift();
    		pathSegments.shift();
    	}
    	return {
    		pathname: join(...pathSegments),
    		hash,
    		search,
    		state,
    	};
    }

    const normalizeUrlFragment = frag => (frag.length === 1 ? "" : frag);

    /**
     * Creates a location object from an url.
     * It is used to create a location from the url prop used in SSR
     *
     * @param {string} url The url string (e.g. "/path/to/somewhere")
     * @returns {{ pathname: string; search: string; hash: string }} The location
     *
     * @example
     * ```js
     * const path = "/search?q=falafel#result-3";
     * const location = parsePath(path);
     * // -> {
     * //   pathname: "/search",
     * //   search: "?q=falafel",
     * //   hash: "#result-3",
     * // };
     * ```
     */
    const parsePath = path => {
    	const searchIndex = path.indexOf("?");
    	const hashIndex = path.indexOf("#");
    	const hasSearchIndex = searchIndex !== -1;
    	const hasHashIndex = hashIndex !== -1;
    	const hash = hasHashIndex
    		? normalizeUrlFragment(substr(path, hashIndex))
    		: "";
    	const pathnameAndSearch = hasHashIndex ? substr(path, 0, hashIndex) : path;
    	const search = hasSearchIndex
    		? normalizeUrlFragment(substr(pathnameAndSearch, searchIndex))
    		: "";
    	const pathname =
    		(hasSearchIndex
    			? substr(pathnameAndSearch, 0, searchIndex)
    			: pathnameAndSearch) || "/";
    	return { pathname, search, hash };
    };

    /**
     * Joins a location object to one path string.
     *
     * @param {{ pathname: string; search: string; hash: string }} location The location object
     * @returns {string} A path, created from the location
     *
     * @example
     * ```js
     * const location = {
     *   pathname: "/search",
     *   search: "?q=falafel",
     *   hash: "#result-3",
     * };
     * const path = stringifyPath(location);
     * // -> "/search?q=falafel#result-3"
     * ```
     */
    const stringifyPath = location => {
    	const { pathname, search, hash } = location;
    	return pathname + search + hash;
    };

    /**
     * Resolves a link relative to the parent Route and the Routers basepath.
     *
     * @param {string} path The given path, that will be resolved
     * @param {string} routeBase The current Routes base path
     * @param {string} appBase The basepath of the app. Used, when serving from a subdirectory
     * @returns {string} The resolved path
     *
     * @example
     * resolveLink("relative", "/routeBase", "/") // -> "/routeBase/relative"
     * resolveLink("/absolute", "/routeBase", "/") // -> "/absolute"
     * resolveLink("relative", "/routeBase", "/base") // -> "/base/routeBase/relative"
     * resolveLink("/absolute", "/routeBase", "/base") // -> "/base/absolute"
     */
    function resolveLink(path, routeBase, appBase) {
    	return join(appBase, resolve(path, routeBase));
    }

    /**
     * Get the uri for a Route, by matching it against the current location.
     *
     * @param {string} routePath The Routes resolved path
     * @param {string} pathname The current locations pathname
     */
    function extractBaseUri(routePath, pathname) {
    	const fullPath = normalizePath(stripSplat(routePath));
    	const baseSegments = segmentize(fullPath, true);
    	const pathSegments = segmentize(pathname, true).slice(0, baseSegments.length);
    	const routeMatch = match({ fullPath }, join(...pathSegments));
    	return routeMatch && routeMatch.uri;
    }

    /*
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const POP = "POP";
    const PUSH = "PUSH";
    const REPLACE = "REPLACE";

    function getLocation(source) {
    	return {
    		...source.location,
    		pathname: encodeURI(decodeURI(source.location.pathname)),
    		state: source.history.state,
    		_key: (source.history.state && source.history.state._key) || "initial",
    	};
    }

    function createHistory(source) {
    	let listeners = [];
    	let location = getLocation(source);
    	let action = POP;

    	const notifyListeners = (listenerFns = listeners) =>
    		listenerFns.forEach(listener => listener({ location, action }));

    	return {
    		get location() {
    			return location;
    		},
    		listen(listener) {
    			listeners.push(listener);

    			const popstateListener = () => {
    				location = getLocation(source);
    				action = POP;
    				notifyListeners([listener]);
    			};

    			// Call listener when it is registered
    			notifyListeners([listener]);

    			const unlisten = addListener(source, "popstate", popstateListener);
    			return () => {
    				unlisten();
    				listeners = listeners.filter(fn => fn !== listener);
    			};
    		},
    		/**
    		 * Navigate to a new absolute route.
    		 *
    		 * @param {string|number} to The path to navigate to.
    		 *
    		 * If `to` is a number we will navigate to the stack entry index + `to`
    		 * (-> `navigate(-1)`, is equivalent to hitting the back button of the browser)
    		 * @param {Object} options
    		 * @param {*} [options.state] The state will be accessible through `location.state`
    		 * @param {boolean} [options.replace=false] Replace the current entry in the history
    		 * stack, instead of pushing on a new one
    		 */
    		navigate(to, options) {
    			const { state = {}, replace = false } = options || {};
    			action = replace ? REPLACE : PUSH;
    			if (isNumber(to)) {
    				if (options) {
    					warn(
    						NAVIGATE_ID,
    						"Navigation options (state or replace) are not supported, " +
    							"when passing a number as the first argument to navigate. " +
    							"They are ignored.",
    					);
    				}
    				action = POP;
    				source.history.go(to);
    			} else {
    				const keyedState = { ...state, _key: createGlobalId() };
    				// try...catch iOS Safari limits to 100 pushState calls
    				try {
    					source.history[replace ? "replaceState" : "pushState"](
    						keyedState,
    						"",
    						to,
    					);
    				} catch (e) {
    					source.location[replace ? "replace" : "assign"](to);
    				}
    			}

    			location = getLocation(source);
    			notifyListeners();
    		},
    	};
    }

    function createStackFrame(state, uri) {
    	return { ...parsePath(uri), state };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
    	let index = 0;
    	let stack = [createStackFrame(null, initialPathname)];

    	return {
    		// This is just for testing...
    		get entries() {
    			return stack;
    		},
    		get location() {
    			return stack[index];
    		},
    		addEventListener() {},
    		removeEventListener() {},
    		history: {
    			get state() {
    				return stack[index].state;
    			},
    			pushState(state, title, uri) {
    				index++;
    				// Throw away anything in the stack with an index greater than the current index.
    				// This happens, when we go back using `go(-n)`. The index is now less than `stack.length`.
    				// If we call `go(+n)` the stack entries with an index greater than the current index can
    				// be reused.
    				// However, if we navigate to a path, instead of a number, we want to create a new branch
    				// of navigation.
    				stack = stack.slice(0, index);
    				stack.push(createStackFrame(state, uri));
    			},
    			replaceState(state, title, uri) {
    				stack[index] = createStackFrame(state, uri);
    			},
    			go(to) {
    				const newIndex = index + to;
    				if (newIndex < 0 || newIndex > stack.length - 1) {
    					return;
    				}
    				index = newIndex;
    			},
    		},
    	};
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = !!(
    	!isSSR &&
    	window.document &&
    	window.document.createElement
    );
    // Use memory history in iframes (for example in Svelte REPL)
    const isEmbeddedPage = !isSSR && window.location.origin === "null";
    const globalHistory = createHistory(
    	canUseDOM && !isEmbeddedPage ? window : createMemorySource(),
    );

    // We need to keep the focus candidate in a separate file, so svelte does
    // not update, when we mutate it.
    // Also, we need a single global reference, because taking focus needs to
    // work globally, even if we have multiple top level routers
    // eslint-disable-next-line import/no-mutable-exports
    let focusCandidate = null;

    // eslint-disable-next-line import/no-mutable-exports
    let initialNavigation = true;

    /**
     * Check if RouterA is above RouterB in the document
     * @param {number} routerIdA The first Routers id
     * @param {number} routerIdB The second Routers id
     */
    function isAbove(routerIdA, routerIdB) {
    	const routerMarkers = document.querySelectorAll("[data-svnav-router]");
    	for (let i = 0; i < routerMarkers.length; i++) {
    		const node = routerMarkers[i];
    		const currentId = Number(node.dataset.svnavRouter);
    		if (currentId === routerIdA) return true;
    		if (currentId === routerIdB) return false;
    	}
    	return false;
    }

    /**
     * Check if a Route candidate is the best choice to move focus to,
     * and store the best match.
     * @param {{
         level: number;
         routerId: number;
         route: {
           id: number;
           focusElement: import("svelte/store").Readable<Promise<Element>|null>;
         }
       }} item A Route candidate, that updated and is visible after a navigation
     */
    function pushFocusCandidate(item) {
    	if (
    		// Best candidate if it's the only candidate...
    		!focusCandidate ||
    		// Route is nested deeper, than previous candidate
    		// -> Route change was triggered in the deepest affected
    		// Route, so that's were focus should move to
    		item.level > focusCandidate.level ||
    		// If the level is identical, we want to focus the first Route in the document,
    		// so we pick the first Router lookin from page top to page bottom.
    		(item.level === focusCandidate.level &&
    			isAbove(item.routerId, focusCandidate.routerId))
    	) {
    		focusCandidate = item;
    	}
    }

    /**
     * Reset the focus candidate.
     */
    function clearFocusCandidate() {
    	focusCandidate = null;
    }

    function initialNavigationOccurred() {
    	initialNavigation = false;
    }

    /*
     * `focus` Adapted from https://github.com/oaf-project/oaf-side-effects/blob/master/src/index.ts
     *
     * https://github.com/oaf-project/oaf-side-effects/blob/master/LICENSE
     */
    function focus(elem) {
    	if (!elem) return false;
    	const TABINDEX = "tabindex";
    	try {
    		if (!elem.hasAttribute(TABINDEX)) {
    			elem.setAttribute(TABINDEX, "-1");
    			let unlisten;
    			// We remove tabindex after blur to avoid weird browser behavior
    			// where a mouse click can activate elements with tabindex="-1".
    			const blurListener = () => {
    				elem.removeAttribute(TABINDEX);
    				unlisten();
    			};
    			unlisten = addListener(elem, "blur", blurListener);
    		}
    		elem.focus();
    		return document.activeElement === elem;
    	} catch (e) {
    		// Apparently trying to focus a disabled element in IE can throw.
    		// See https://stackoverflow.com/a/1600194/2476884
    		return false;
    	}
    }

    function isEndMarker(elem, id) {
    	return Number(elem.dataset.svnavRouteEnd) === id;
    }

    function isHeading(elem) {
    	return /^H[1-6]$/i.test(elem.tagName);
    }

    function query(selector, parent = document) {
    	return parent.querySelector(selector);
    }

    function queryHeading(id) {
    	const marker = query(`[data-svnav-route-start="${id}"]`);
    	let current = marker.nextElementSibling;
    	while (!isEndMarker(current, id)) {
    		if (isHeading(current)) {
    			return current;
    		}
    		const heading = query("h1,h2,h3,h4,h5,h6", current);
    		if (heading) {
    			return heading;
    		}
    		current = current.nextElementSibling;
    	}
    	return null;
    }

    function handleFocus(route) {
    	Promise.resolve(get_store_value(route.focusElement)).then(elem => {
    		const focusElement = elem || queryHeading(route.id);
    		if (!focusElement) {
    			warn(
    				ROUTER_ID,
    				"Could not find an element to focus. " +
    					"You should always render a header for accessibility reasons, " +
    					'or set a custom focus element via the "useFocus" hook. ' +
    					"If you don't want this Route or Router to manage focus, " +
    					'pass "primary={false}" to it.',
    				route,
    				ROUTE_ID,
    			);
    		}
    		const headingFocused = focus(focusElement);
    		if (headingFocused) return;
    		focus(document.documentElement);
    	});
    }

    const createTriggerFocus =
    	(a11yConfig, announcementText, location) =>
    	(manageFocus, announceNavigation) =>
    		// Wait until the dom is updated, so we can look for headings
    		tick().then(() => {
    			if (!focusCandidate || initialNavigation) {
    				initialNavigationOccurred();
    				return;
    			}
    			if (manageFocus) {
    				handleFocus(focusCandidate.route);
    			}
    			if (a11yConfig.announcements && announceNavigation) {
    				const { path, fullPath, meta, params, uri } = focusCandidate.route;
    				const announcementMessage = a11yConfig.createAnnouncement(
    					{ path, fullPath, meta, params, uri },
    					get_store_value(location),
    				);
    				Promise.resolve(announcementMessage).then(message => {
    					announcementText.set(message);
    				});
    			}
    			clearFocusCandidate();
    		});

    const visuallyHiddenStyle =
    	"position:fixed;" +
    	"top:-1px;" +
    	"left:0;" +
    	"width:1px;" +
    	"height:1px;" +
    	"padding:0;" +
    	"overflow:hidden;" +
    	"clip:rect(0,0,0,0);" +
    	"white-space:nowrap;" +
    	"border:0;";

    /* node_modules\svelte-navigator\src\Router.svelte generated by Svelte v3.53.1 */

    const file$b = "node_modules\\svelte-navigator\\src\\Router.svelte";

    // (204:0) {#if isTopLevelRouter && manageFocus && a11yConfig.announcements}
    function create_if_block$6(ctx) {
    	let div;
    	let t;

    	let div_levels = [
    		{ role: "status" },
    		{ "aria-atomic": "true" },
    		{ "aria-live": "polite" },
    		{ "data-svnav-announcer": "" },
    		createInlineStyle(/*shouldDisableInlineStyles*/ ctx[6], visuallyHiddenStyle)
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*$announcementText*/ ctx[0]);
    			set_attributes(div, div_data);
    			add_location(div, file$b, 204, 1, 6149);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$announcementText*/ 1) set_data_dev(t, /*$announcementText*/ ctx[0]);

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				{ role: "status" },
    				{ "aria-atomic": "true" },
    				{ "aria-live": "polite" },
    				{ "data-svnav-announcer": "" },
    				createInlineStyle(/*shouldDisableInlineStyles*/ ctx[6], visuallyHiddenStyle)
    			]));
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(204:0) {#if isTopLevelRouter && manageFocus && a11yConfig.announcements}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let if_block_anchor;
    	let current;

    	let div_levels = [
    		createMarkerProps(/*shouldDisableInlineStyles*/ ctx[6]),
    		{ "data-svnav-router": /*routerId*/ ctx[3] }
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const default_slot_template = /*#slots*/ ctx[22].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[21], null);
    	let if_block = /*isTopLevelRouter*/ ctx[2] && /*manageFocus*/ ctx[4] && /*a11yConfig*/ ctx[1].announcements && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = space();
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			set_attributes(div, div_data);
    			add_location(div, file$b, 196, 0, 5982);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t0, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				createMarkerProps(/*shouldDisableInlineStyles*/ ctx[6]),
    				{ "data-svnav-router": /*routerId*/ ctx[3] }
    			]));

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 2097152)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[21],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[21])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[21], dirty, null),
    						null
    					);
    				}
    			}

    			if (/*isTopLevelRouter*/ ctx[2] && /*manageFocus*/ ctx[4] && /*a11yConfig*/ ctx[1].announcements) if_block.p(ctx, dirty);
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
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t0);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const createId$1 = createCounter();
    const defaultBasepath = "/";

    function instance$b($$self, $$props, $$invalidate) {
    	let $location;
    	let $activeRoute;
    	let $prevLocation;
    	let $routes;
    	let $announcementText;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, ['default']);
    	let { basepath = defaultBasepath } = $$props;
    	let { url = null } = $$props;
    	let { history = globalHistory } = $$props;
    	let { primary = true } = $$props;
    	let { a11y = {} } = $$props;
    	let { disableInlineStyles = false } = $$props;

    	const a11yConfig = {
    		createAnnouncement: route => `Navigated to ${route.uri}`,
    		announcements: true,
    		...a11y
    	};

    	// Remember the initial `basepath`, so we can fire a warning
    	// when the user changes it later
    	const initialBasepath = basepath;

    	const normalizedBasepath = normalizePath(basepath);
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const isTopLevelRouter = !locationContext;
    	const routerId = createId$1();
    	const manageFocus = primary && !(routerContext && !routerContext.manageFocus);
    	const announcementText = writable("");
    	validate_store(announcementText, 'announcementText');
    	component_subscribe($$self, announcementText, value => $$invalidate(0, $announcementText = value));

    	const shouldDisableInlineStyles = routerContext
    	? routerContext.disableInlineStyles
    	: disableInlineStyles;

    	const routes = writable([]);
    	validate_store(routes, 'routes');
    	component_subscribe($$self, routes, value => $$invalidate(20, $routes = value));
    	const activeRoute = writable(null);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(18, $activeRoute = value));

    	// Used in SSR to synchronously set that a Route is active.
    	let hasActiveRoute = false;

    	// Nesting level of router.
    	// We will need this to identify sibling routers, when moving
    	// focus on navigation, so we can focus the first possible router
    	const level = isTopLevelRouter ? 0 : routerContext.level + 1;

    	// If we're running an SSR we force the location to the `url` prop
    	const getInitialLocation = () => normalizeLocation(isSSR ? parsePath(url) : history.location, normalizedBasepath);

    	const location = isTopLevelRouter
    	? writable(getInitialLocation())
    	: locationContext;

    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(17, $location = value));
    	const prevLocation = writable($location);
    	validate_store(prevLocation, 'prevLocation');
    	component_subscribe($$self, prevLocation, value => $$invalidate(19, $prevLocation = value));
    	const triggerFocus = createTriggerFocus(a11yConfig, announcementText, location);
    	const createRouteFilter = routeId => routeList => routeList.filter(routeItem => routeItem.id !== routeId);

    	function registerRoute(route) {
    		if (isSSR) {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				hasActiveRoute = true;

    				// Return the match in SSR mode, so the matched Route can use it immediatly.
    				// Waiting for activeRoute to update does not work, because it updates
    				// after the Route is initialized
    				return matchingRoute; // eslint-disable-line consistent-return
    			}
    		} else {
    			routes.update(prevRoutes => {
    				// Remove an old version of the updated route,
    				// before pushing the new version
    				const nextRoutes = createRouteFilter(route.id)(prevRoutes);

    				nextRoutes.push(route);
    				return nextRoutes;
    			});
    		}
    	}

    	function unregisterRoute(routeId) {
    		routes.update(createRouteFilter(routeId));
    	}

    	if (!isTopLevelRouter && basepath !== defaultBasepath) {
    		warn(ROUTER_ID, 'Only top-level Routers can have a "basepath" prop. It is ignored.', { basepath });
    	}

    	if (isTopLevelRouter) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = history.listen(changedHistory => {
    				const normalizedLocation = normalizeLocation(changedHistory.location, normalizedBasepath);
    				prevLocation.set($location);
    				location.set(normalizedLocation);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		registerRoute,
    		unregisterRoute,
    		manageFocus,
    		level,
    		id: routerId,
    		history: isTopLevelRouter ? history : routerContext.history,
    		basepath: isTopLevelRouter
    		? normalizedBasepath
    		: routerContext.basepath,
    		disableInlineStyles: shouldDisableInlineStyles
    	});

    	const writable_props = ['basepath', 'url', 'history', 'primary', 'a11y', 'disableInlineStyles'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('basepath' in $$props) $$invalidate(11, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(12, url = $$props.url);
    		if ('history' in $$props) $$invalidate(13, history = $$props.history);
    		if ('primary' in $$props) $$invalidate(14, primary = $$props.primary);
    		if ('a11y' in $$props) $$invalidate(15, a11y = $$props.a11y);
    		if ('disableInlineStyles' in $$props) $$invalidate(16, disableInlineStyles = $$props.disableInlineStyles);
    		if ('$$scope' in $$props) $$invalidate(21, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createCounter,
    		createInlineStyle,
    		createMarkerProps,
    		createId: createId$1,
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		normalizePath,
    		pick,
    		match,
    		normalizeLocation,
    		parsePath,
    		isSSR,
    		warn,
    		ROUTER_ID,
    		pushFocusCandidate,
    		visuallyHiddenStyle,
    		createTriggerFocus,
    		defaultBasepath,
    		basepath,
    		url,
    		history,
    		primary,
    		a11y,
    		disableInlineStyles,
    		a11yConfig,
    		initialBasepath,
    		normalizedBasepath,
    		locationContext,
    		routerContext,
    		isTopLevelRouter,
    		routerId,
    		manageFocus,
    		announcementText,
    		shouldDisableInlineStyles,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		level,
    		getInitialLocation,
    		location,
    		prevLocation,
    		triggerFocus,
    		createRouteFilter,
    		registerRoute,
    		unregisterRoute,
    		$location,
    		$activeRoute,
    		$prevLocation,
    		$routes,
    		$announcementText
    	});

    	$$self.$inject_state = $$props => {
    		if ('basepath' in $$props) $$invalidate(11, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(12, url = $$props.url);
    		if ('history' in $$props) $$invalidate(13, history = $$props.history);
    		if ('primary' in $$props) $$invalidate(14, primary = $$props.primary);
    		if ('a11y' in $$props) $$invalidate(15, a11y = $$props.a11y);
    		if ('disableInlineStyles' in $$props) $$invalidate(16, disableInlineStyles = $$props.disableInlineStyles);
    		if ('hasActiveRoute' in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*basepath*/ 2048) {
    			if (basepath !== initialBasepath) {
    				warn(ROUTER_ID, 'You cannot change the "basepath" prop. It is ignored.');
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$routes, $location*/ 1179648) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$location, $prevLocation*/ 655360) {
    			// Manage focus and announce navigation to screen reader users
    			{
    				if (isTopLevelRouter) {
    					const hasHash = !!$location.hash;

    					// When a hash is present in the url, we skip focus management, because
    					// focusing a different element will prevent in-page jumps (See #3)
    					const shouldManageFocus = !hasHash && manageFocus;

    					// We don't want to make an announcement, when the hash changes,
    					// but the active route stays the same
    					const announceNavigation = !hasHash || $location.pathname !== $prevLocation.pathname;

    					triggerFocus(shouldManageFocus, announceNavigation);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$activeRoute*/ 262144) {
    			// Queue matched Route, so top level Router can decide which Route to focus.
    			// Non primary Routers should just be ignored
    			if (manageFocus && $activeRoute && $activeRoute.primary) {
    				pushFocusCandidate({ level, routerId, route: $activeRoute });
    			}
    		}
    	};

    	return [
    		$announcementText,
    		a11yConfig,
    		isTopLevelRouter,
    		routerId,
    		manageFocus,
    		announcementText,
    		shouldDisableInlineStyles,
    		routes,
    		activeRoute,
    		location,
    		prevLocation,
    		basepath,
    		url,
    		history,
    		primary,
    		a11y,
    		disableInlineStyles,
    		$location,
    		$activeRoute,
    		$prevLocation,
    		$routes,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$b,
    			create_fragment$b,
    			safe_not_equal,
    			{
    				basepath: 11,
    				url: 12,
    				history: 13,
    				primary: 14,
    				a11y: 15,
    				disableInlineStyles: 16
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get history() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set history(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primary() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primary(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get a11y() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set a11y(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disableInlineStyles() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disableInlineStyles(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Router$1 = Router;

    /**
     * Check if a component or hook have been created outside of a
     * context providing component
     * @param {number} componentId
     * @param {*} props
     * @param {string?} ctxKey
     * @param {number?} ctxProviderId
     */
    function usePreflightCheck(
    	componentId,
    	props,
    	ctxKey = ROUTER,
    	ctxProviderId = ROUTER_ID,
    ) {
    	const ctx = getContext(ctxKey);
    	if (!ctx) {
    		fail(
    			componentId,
    			label =>
    				`You cannot use ${label} outside of a ${createLabel(ctxProviderId)}.`,
    			props,
    		);
    	}
    }

    const toReadonly = ctx => {
    	const { subscribe } = getContext(ctx);
    	return { subscribe };
    };

    /**
     * Access the current location via a readable store.
     * @returns {import("svelte/store").Readable<{
        pathname: string;
        search: string;
        hash: string;
        state: {};
      }>}
     *
     * @example
      ```html
      <script>
        import { useLocation } from "svelte-navigator";

        const location = useLocation();

        $: console.log($location);
        // {
        //   pathname: "/blog",
        //   search: "?id=123",
        //   hash: "#comments",
        //   state: {}
        // }
      </script>
      ```
     */
    function useLocation() {
    	usePreflightCheck(USE_LOCATION_ID);
    	return toReadonly(LOCATION);
    }

    /**
     * @typedef {{
        path: string;
        fullPath: string;
        uri: string;
        params: {};
      }} RouteMatch
     */

    /**
     * @typedef {import("svelte/store").Readable<RouteMatch|null>} RouteMatchStore
     */

    /**
     * Access the history of top level Router.
     */
    function useHistory() {
    	const { history } = getContext(ROUTER);
    	return history;
    }

    /**
     * Access the base of the parent Route.
     */
    function useRouteBase() {
    	const route = getContext(ROUTE);
    	return route ? derived(route, _route => _route.base) : writable("/");
    }

    /**
     * Resolve a given link relative to the current `Route` and the `Router`s `basepath`.
     * It is used under the hood in `Link` and `useNavigate`.
     * You can use it to manually resolve links, when using the `link` or `links` actions.
     *
     * @returns {(path: string) => string}
     *
     * @example
      ```html
      <script>
        import { link, useResolve } from "svelte-navigator";

        const resolve = useResolve();
        // `resolvedLink` will be resolved relative to its parent Route
        // and the Routers `basepath`
        const resolvedLink = resolve("relativePath");
      </script>

      <a href={resolvedLink} use:link>Relative link</a>
      ```
     */
    function useResolve() {
    	usePreflightCheck(USE_RESOLVE_ID);
    	const routeBase = useRouteBase();
    	const { basepath: appBase } = getContext(ROUTER);
    	/**
    	 * Resolves the path relative to the current route and basepath.
    	 *
    	 * @param {string} path The path to resolve
    	 * @returns {string} The resolved path
    	 */
    	const resolve = path => resolveLink(path, get_store_value(routeBase), appBase);
    	return resolve;
    }

    /**
     * A hook, that returns a context-aware version of `navigate`.
     * It will automatically resolve the given link relative to the current Route.
     * It will also resolve a link against the `basepath` of the Router.
     *
     * @example
      ```html
      <!-- App.svelte -->
      <script>
        import { link, Route } from "svelte-navigator";
        import RouteComponent from "./RouteComponent.svelte";
      </script>

      <Router>
        <Route path="route1">
          <RouteComponent />
        </Route>
        <!-- ... -->
      </Router>

      <!-- RouteComponent.svelte -->
      <script>
        import { useNavigate } from "svelte-navigator";

        const navigate = useNavigate();
      </script>

      <button on:click="{() => navigate('relativePath')}">
        go to /route1/relativePath
      </button>
      <button on:click="{() => navigate('/absolutePath')}">
        go to /absolutePath
      </button>
      ```
      *
      * @example
      ```html
      <!-- App.svelte -->
      <script>
        import { link, Route } from "svelte-navigator";
        import RouteComponent from "./RouteComponent.svelte";
      </script>

      <Router basepath="/base">
        <Route path="route1">
          <RouteComponent />
        </Route>
        <!-- ... -->
      </Router>

      <!-- RouteComponent.svelte -->
      <script>
        import { useNavigate } from "svelte-navigator";

        const navigate = useNavigate();
      </script>

      <button on:click="{() => navigate('relativePath')}">
        go to /base/route1/relativePath
      </button>
      <button on:click="{() => navigate('/absolutePath')}">
        go to /base/absolutePath
      </button>
      ```
     */
    function useNavigate() {
    	usePreflightCheck(USE_NAVIGATE_ID);
    	const resolve = useResolve();
    	const { navigate } = useHistory();
    	/**
    	 * Navigate to a new route.
    	 * Resolves the link relative to the current route and basepath.
    	 *
    	 * @param {string|number} to The path to navigate to.
    	 *
    	 * If `to` is a number we will navigate to the stack entry index + `to`
    	 * (-> `navigate(-1)`, is equivalent to hitting the back button of the browser)
    	 * @param {Object} options
    	 * @param {*} [options.state]
    	 * @param {boolean} [options.replace=false]
    	 */
    	const navigateRelative = (to, options) => {
    		// If to is a number, we navigate to the target stack entry via `history.go`.
    		// Otherwise resolve the link
    		const target = isNumber(to) ? to : resolve(to);
    		return navigate(target, options);
    	};
    	return navigateRelative;
    }

    /* node_modules\svelte-navigator\src\Route.svelte generated by Svelte v3.53.1 */
    const file$a = "node_modules\\svelte-navigator\\src\\Route.svelte";

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*$params*/ 16,
    	location: dirty & /*$location*/ 8
    });

    const get_default_slot_context = ctx => ({
    	params: isSSR ? get_store_value(/*params*/ ctx[10]) : /*$params*/ ctx[4],
    	location: /*$location*/ ctx[3],
    	navigate: /*navigate*/ ctx[11]
    });

    // (98:0) {#if isActive}
    function create_if_block$5(ctx) {
    	let router;
    	let current;

    	router = new Router$1({
    			props: {
    				primary: /*primary*/ ctx[1],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const router_changes = {};
    			if (dirty & /*primary*/ 2) router_changes.primary = /*primary*/ ctx[1];

    			if (dirty & /*$$scope, component, $location, $params, $$restProps*/ 528409) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(98:0) {#if isActive}",
    		ctx
    	});

    	return block;
    }

    // (114:2) {:else}
    function create_else_block$3(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, $params, $location*/ 524312)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[19], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
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
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(114:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (106:2) {#if component !== null}
    function create_if_block_1$5(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[3] },
    		{ navigate: /*navigate*/ ctx[11] },
    		isSSR ? get_store_value(/*params*/ ctx[10]) : /*$params*/ ctx[4],
    		/*$$restProps*/ ctx[12]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, navigate, isSSR, get, params, $params, $$restProps*/ 7192)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 8 && { location: /*$location*/ ctx[3] },
    					dirty & /*navigate*/ 2048 && { navigate: /*navigate*/ ctx[11] },
    					dirty & /*isSSR, get, params, $params*/ 1040 && get_spread_object(isSSR ? get_store_value(/*params*/ ctx[10]) : /*$params*/ ctx[4]),
    					dirty & /*$$restProps*/ 4096 && get_spread_object(/*$$restProps*/ ctx[12])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(106:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    // (99:1) <Router {primary}>
    function create_default_slot(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$5, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
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
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(99:1) <Router {primary}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let current;

    	let div0_levels = [
    		createMarkerProps(/*disableInlineStyles*/ ctx[7]),
    		{ "data-svnav-route-start": /*id*/ ctx[5] }
    	];

    	let div0_data = {};

    	for (let i = 0; i < div0_levels.length; i += 1) {
    		div0_data = assign(div0_data, div0_levels[i]);
    	}

    	let if_block = /*isActive*/ ctx[2] && create_if_block$5(ctx);

    	let div1_levels = [
    		createMarkerProps(/*disableInlineStyles*/ ctx[7]),
    		{ "data-svnav-route-end": /*id*/ ctx[5] }
    	];

    	let div1_data = {};

    	for (let i = 0; i < div1_levels.length; i += 1) {
    		div1_data = assign(div1_data, div1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			div1 = element("div");
    			set_attributes(div0, div0_data);
    			add_location(div0, file$a, 96, 0, 2664);
    			set_attributes(div1, div1_data);
    			add_location(div1, file$a, 122, 0, 3340);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			set_attributes(div0, div0_data = get_spread_update(div0_levels, [
    				createMarkerProps(/*disableInlineStyles*/ ctx[7]),
    				{ "data-svnav-route-start": /*id*/ ctx[5] }
    			]));

    			if (/*isActive*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isActive*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t1.parentNode, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			set_attributes(div1, div1_data = get_spread_update(div1_levels, [
    				createMarkerProps(/*disableInlineStyles*/ ctx[7]),
    				{ "data-svnav-route-end": /*id*/ ctx[5] }
    			]));
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
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const createId = createCounter();

    function instance$a($$self, $$props, $$invalidate) {
    	let isActive;
    	const omit_props_names = ["path","component","meta","primary"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $activeRoute;
    	let $location;
    	let $parentBase;
    	let $params;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Route', slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	let { meta = {} } = $$props;
    	let { primary = true } = $$props;
    	usePreflightCheck(ROUTE_ID, $$props);
    	const id = createId();
    	const { registerRoute, unregisterRoute, activeRoute, disableInlineStyles } = getContext(ROUTER);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(16, $activeRoute = value));
    	const parentBase = useRouteBase();
    	validate_store(parentBase, 'parentBase');
    	component_subscribe($$self, parentBase, value => $$invalidate(17, $parentBase = value));
    	const location = useLocation();
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(3, $location = value));
    	const focusElement = writable(null);

    	// In SSR we cannot wait for $activeRoute to update,
    	// so we use the match returned from `registerRoute` instead
    	let ssrMatch;

    	const route = writable();
    	const params = writable({});
    	validate_store(params, 'params');
    	component_subscribe($$self, params, value => $$invalidate(4, $params = value));
    	setContext(ROUTE, route);
    	setContext(ROUTE_PARAMS, params);
    	setContext(FOCUS_ELEM, focusElement);

    	// We need to call useNavigate after the route is set,
    	// so we can use the routes path for link resolution
    	const navigate = useNavigate();

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway
    	if (!isSSR) {
    		onDestroy(() => unregisterRoute(id));
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(24, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(12, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('path' in $$new_props) $$invalidate(13, path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ('meta' in $$new_props) $$invalidate(14, meta = $$new_props.meta);
    		if ('primary' in $$new_props) $$invalidate(1, primary = $$new_props.primary);
    		if ('$$scope' in $$new_props) $$invalidate(19, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createCounter,
    		createMarkerProps,
    		createId,
    		getContext,
    		onDestroy,
    		setContext,
    		writable,
    		get: get_store_value,
    		Router: Router$1,
    		ROUTER,
    		ROUTE,
    		ROUTE_PARAMS,
    		FOCUS_ELEM,
    		useLocation,
    		useNavigate,
    		useRouteBase,
    		usePreflightCheck,
    		isSSR,
    		extractBaseUri,
    		join,
    		ROUTE_ID,
    		path,
    		component,
    		meta,
    		primary,
    		id,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		disableInlineStyles,
    		parentBase,
    		location,
    		focusElement,
    		ssrMatch,
    		route,
    		params,
    		navigate,
    		isActive,
    		$activeRoute,
    		$location,
    		$parentBase,
    		$params
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(24, $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$props) $$invalidate(13, path = $$new_props.path);
    		if ('component' in $$props) $$invalidate(0, component = $$new_props.component);
    		if ('meta' in $$props) $$invalidate(14, meta = $$new_props.meta);
    		if ('primary' in $$props) $$invalidate(1, primary = $$new_props.primary);
    		if ('ssrMatch' in $$props) $$invalidate(15, ssrMatch = $$new_props.ssrMatch);
    		if ('isActive' in $$props) $$invalidate(2, isActive = $$new_props.isActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*path, $parentBase, meta, $location, primary*/ 155658) {
    			{
    				// The route store will be re-computed whenever props, location or parentBase change
    				const isDefault = path === "";

    				const rawBase = join($parentBase, path);

    				const updatedRoute = {
    					id,
    					path,
    					meta,
    					// If no path prop is given, this Route will act as the default Route
    					// that is rendered if no other Route in the Router is a match
    					default: isDefault,
    					fullPath: isDefault ? "" : rawBase,
    					base: isDefault
    					? $parentBase
    					: extractBaseUri(rawBase, $location.pathname),
    					primary,
    					focusElement
    				};

    				route.set(updatedRoute);

    				// If we're in SSR mode and the Route matches,
    				// `registerRoute` will return the match
    				$$invalidate(15, ssrMatch = registerRoute(updatedRoute));
    			}
    		}

    		if ($$self.$$.dirty & /*ssrMatch, $activeRoute*/ 98304) {
    			$$invalidate(2, isActive = !!(ssrMatch || $activeRoute && $activeRoute.id === id));
    		}

    		if ($$self.$$.dirty & /*isActive, ssrMatch, $activeRoute*/ 98308) {
    			if (isActive) {
    				const { params: activeParams } = ssrMatch || $activeRoute;
    				params.set(activeParams);
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		primary,
    		isActive,
    		$location,
    		$params,
    		id,
    		activeRoute,
    		disableInlineStyles,
    		parentBase,
    		location,
    		params,
    		navigate,
    		$$restProps,
    		path,
    		meta,
    		ssrMatch,
    		$activeRoute,
    		$parentBase,
    		slots,
    		$$scope
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			path: 13,
    			component: 0,
    			meta: 14,
    			primary: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get meta() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set meta(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primary() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primary(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Route$1 = Route;

    /* node_modules\svelte-navigator\src\Link.svelte generated by Svelte v3.53.1 */
    const file$9 = "node_modules\\svelte-navigator\\src\\Link.svelte";

    function create_fragment$9(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);
    	let a_levels = [{ href: /*href*/ ctx[0] }, /*ariaCurrent*/ ctx[2], /*props*/ ctx[1]];
    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file$9, 65, 0, 1861);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4096)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[12],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[12])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				dirty & /*ariaCurrent*/ 4 && /*ariaCurrent*/ ctx[2],
    				dirty & /*props*/ 2 && /*props*/ ctx[1]
    			]));
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
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let href;
    	let isPartiallyCurrent;
    	let isCurrent;
    	let isExactCurrent;
    	let ariaCurrent;
    	let props;
    	const omit_props_names = ["to","replace","state","getProps"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Link', slots, ['default']);
    	let { to } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = null } = $$props;
    	usePreflightCheck(LINK_ID, $$props);
    	const location = useLocation();
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(11, $location = value));
    	const dispatch = createEventDispatcher();
    	const resolve = useResolve();
    	const { navigate } = useHistory();

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = isExactCurrent || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	$$self.$$.on_mount.push(function () {
    		if (to === undefined && !('to' in $$props || $$self.$$.bound[$$self.$$.props['to']])) {
    			console.warn("<Link> was created without expected prop 'to'");
    		}
    	});

    	$$self.$$set = $$new_props => {
    		$$invalidate(19, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(18, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('to' in $$new_props) $$invalidate(5, to = $$new_props.to);
    		if ('replace' in $$new_props) $$invalidate(6, replace = $$new_props.replace);
    		if ('state' in $$new_props) $$invalidate(7, state = $$new_props.state);
    		if ('getProps' in $$new_props) $$invalidate(8, getProps = $$new_props.getProps);
    		if ('$$scope' in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		useLocation,
    		useResolve,
    		useHistory,
    		usePreflightCheck,
    		shouldNavigate,
    		isFunction,
    		startsWith,
    		LINK_ID,
    		parsePath,
    		stringifyPath,
    		to,
    		replace,
    		state,
    		getProps,
    		location,
    		dispatch,
    		resolve,
    		navigate,
    		onClick,
    		href,
    		isExactCurrent,
    		isCurrent,
    		isPartiallyCurrent,
    		props,
    		ariaCurrent,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(19, $$props = assign(assign({}, $$props), $$new_props));
    		if ('to' in $$props) $$invalidate(5, to = $$new_props.to);
    		if ('replace' in $$props) $$invalidate(6, replace = $$new_props.replace);
    		if ('state' in $$props) $$invalidate(7, state = $$new_props.state);
    		if ('getProps' in $$props) $$invalidate(8, getProps = $$new_props.getProps);
    		if ('href' in $$props) $$invalidate(0, href = $$new_props.href);
    		if ('isExactCurrent' in $$props) isExactCurrent = $$new_props.isExactCurrent;
    		if ('isCurrent' in $$props) $$invalidate(9, isCurrent = $$new_props.isCurrent);
    		if ('isPartiallyCurrent' in $$props) $$invalidate(10, isPartiallyCurrent = $$new_props.isPartiallyCurrent);
    		if ('props' in $$props) $$invalidate(1, props = $$new_props.props);
    		if ('ariaCurrent' in $$props) $$invalidate(2, ariaCurrent = $$new_props.ariaCurrent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $location*/ 2080) {
    			// We need to pass location here to force re-resolution of the link,
    			// when the pathname changes. Otherwise we could end up with stale path params,
    			// when for example an :id changes in the parent Routes path
    			$$invalidate(0, href = resolve(to, $location));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 2049) {
    			$$invalidate(10, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 2049) {
    			$$invalidate(9, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 2049) {
    			isExactCurrent = parsePath(href) === stringifyPath($location);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 512) {
    			$$invalidate(2, ariaCurrent = isCurrent ? { "aria-current": "page" } : {});
    		}

    		$$invalidate(1, props = (() => {
    			if (isFunction(getProps)) {
    				const dynamicProps = getProps({
    					location: $location,
    					href,
    					isPartiallyCurrent,
    					isCurrent
    				});

    				return { ...$$restProps, ...dynamicProps };
    			}

    			return $$restProps;
    		})());
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		href,
    		props,
    		ariaCurrent,
    		location,
    		onClick,
    		to,
    		replace,
    		state,
    		getProps,
    		isCurrent,
    		isPartiallyCurrent,
    		$location,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { to: 5, replace: 6, state: 7, getProps: 8 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Link$1 = Link;

    // o estado do jogo guarda a informação sobre a tela questamos no momento
    let estado = writable('menu');

    function trocarEstadoDoJogo(novoEstado) {
    	estado.set(novoEstado);
    }

    /* src\VoltarMenu.svelte generated by Svelte v3.53.1 */
    const file$8 = "src\\VoltarMenu.svelte";

    function create_fragment$8(ctx) {
    	let head;
    	let link;
    	let t0;
    	let ul;
    	let button;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			head = element("head");
    			link = element("link");
    			t0 = space();
    			ul = element("ul");
    			button = element("button");
    			p = element("p");
    			p.textContent = "Voltar";
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/css/menu.css");
    			add_location(link, file$8, 5, 1, 83);
    			add_location(head, file$8, 4, 0, 74);
    			attr_dev(p, "class", "pmenu");
    			add_location(p, file$8, 8, 88, 228);
    			attr_dev(button, "class", "buttonapp");
    			add_location(button, file$8, 8, 18, 158);
    			attr_dev(ul, "class", "ulapp");
    			add_location(ul, file$8, 8, 0, 140);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, head, anchor);
    			append_dev(head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, ul, anchor);
    			append_dev(ul, button);
    			append_dev(button, p);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(head);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(ul);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('VoltarMenu', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<VoltarMenu> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => trocarEstadoDoJogo('menu');
    	$$self.$capture_state = () => ({ trocarEstadoDoJogo });
    	return [click_handler];
    }

    class VoltarMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VoltarMenu",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\ajuda.svelte generated by Svelte v3.53.1 */
    const file$7 = "src\\ajuda.svelte";

    function create_fragment$7(ctx) {
    	let head;
    	let link;
    	let t0;
    	let voltarmenu;
    	let t1;
    	let h2;
    	let t3;
    	let ul0;
    	let li0;
    	let t5;
    	let li1;
    	let t7;
    	let li2;
    	let t9;
    	let li3;
    	let t11;
    	let ul1;
    	let button0;
    	let t13;
    	let ul2;
    	let button1;
    	let t15;
    	let button2;
    	let t17;
    	let ul3;
    	let button3;
    	let t19;
    	let h3;
    	let t21;
    	let p0;
    	let t23;
    	let p1;
    	let t25;
    	let p2;
    	let t27;
    	let p3;
    	let t29;
    	let p4;
    	let t31;
    	let p5;
    	let t33;
    	let p6;
    	let t35;
    	let h4;
    	let current;
    	voltarmenu = new VoltarMenu({ $$inline: true });

    	const block = {
    		c: function create() {
    			head = element("head");
    			link = element("link");
    			t0 = space();
    			create_component(voltarmenu.$$.fragment);
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = "Como jogar?";
    			t3 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			li0.textContent = "Ir para frente";
    			t5 = space();
    			li1 = element("li");
    			li1.textContent = "Ir para trás";
    			t7 = space();
    			li2 = element("li");
    			li2.textContent = "Ir para a direita";
    			t9 = space();
    			li3 = element("li");
    			li3.textContent = "Ir para a esquerda";
    			t11 = space();
    			ul1 = element("ul");
    			button0 = element("button");
    			button0.textContent = "↟";
    			t13 = space();
    			ul2 = element("ul");
    			button1 = element("button");
    			button1.textContent = "↞";
    			t15 = space();
    			button2 = element("button");
    			button2.textContent = "↠";
    			t17 = space();
    			ul3 = element("ul");
    			button3 = element("button");
    			button3.textContent = "↡";
    			t19 = space();
    			h3 = element("h3");
    			h3.textContent = "Olá, querido humano.";
    			t21 = space();
    			p0 = element("p");
    			p0.textContent = "Se você chegou aqui, temo que já esteja em um território perigoso.";
    			t23 = space();
    			p1 = element("p");
    			p1.textContent = "Humanos não deveriam arriscar tanto suas vidas, será que sua curiosidade vale tanto assim?";
    			t25 = space();
    			p2 = element("p");
    			p2.textContent = "Deseja um conselho?";
    			t27 = space();
    			p3 = element("p");
    			p3.textContent = "Não seja guiado por suas emoções,";
    			t29 = space();
    			p4 = element("p");
    			p4.textContent = "o tempo não é seu amigo.";
    			t31 = space();
    			p5 = element("p");
    			p5.textContent = "Não olhe para trás ou tente voltar.";
    			t33 = space();
    			p6 = element("p");
    			p6.textContent = "Fique atento e ouça bem o que lhe rodeia.";
    			t35 = space();
    			h4 = element("h4");
    			h4.textContent = "Sua curiosidade pode ser sua maior perdição, \r\n    preste atenção nas entrelinhas e proteja sua retaguarda.";
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/css/ajuda.css");
    			add_location(link, file$7, 5, 4, 86);
    			add_location(head, file$7, 4, 0, 74);
    			add_location(h2, file$7, 9, 0, 159);
    			add_location(li0, file$7, 11, 4, 205);
    			add_location(li1, file$7, 12, 4, 234);
    			add_location(li2, file$7, 13, 4, 261);
    			add_location(li3, file$7, 14, 4, 293);
    			attr_dev(ul0, "class", "aimds");
    			add_location(ul0, file$7, 10, 0, 181);
    			attr_dev(button0, "id", "button");
    			attr_dev(button0, "class", "botaum");
    			add_location(button0, file$7, 18, 4, 337);
    			add_location(ul1, file$7, 18, 0, 333);
    			attr_dev(button1, "class", "botao2");
    			add_location(button1, file$7, 19, 4, 393);
    			attr_dev(button2, "class", "botao3");
    			add_location(button2, file$7, 19, 38, 427);
    			add_location(ul2, file$7, 19, 0, 389);
    			attr_dev(button3, "id", "button");
    			attr_dev(button3, "class", "buteum");
    			add_location(button3, file$7, 20, 4, 471);
    			add_location(ul3, file$7, 20, 0, 467);
    			attr_dev(h3, "class", "h3ajuda");
    			add_location(h3, file$7, 22, 0, 525);
    			add_location(p0, file$7, 23, 0, 572);
    			add_location(p1, file$7, 24, 0, 647);
    			add_location(p2, file$7, 25, 0, 746);
    			add_location(p3, file$7, 26, 0, 774);
    			add_location(p4, file$7, 27, 0, 816);
    			add_location(p5, file$7, 28, 0, 849);
    			add_location(p6, file$7, 29, 0, 893);
    			add_location(h4, file$7, 31, 0, 945);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, head, anchor);
    			append_dev(head, link);
    			insert_dev(target, t0, anchor);
    			mount_component(voltarmenu, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, ul0, anchor);
    			append_dev(ul0, li0);
    			append_dev(ul0, t5);
    			append_dev(ul0, li1);
    			append_dev(ul0, t7);
    			append_dev(ul0, li2);
    			append_dev(ul0, t9);
    			append_dev(ul0, li3);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, ul1, anchor);
    			append_dev(ul1, button0);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, ul2, anchor);
    			append_dev(ul2, button1);
    			append_dev(ul2, t15);
    			append_dev(ul2, button2);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, ul3, anchor);
    			append_dev(ul3, button3);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t31, anchor);
    			insert_dev(target, p5, anchor);
    			insert_dev(target, t33, anchor);
    			insert_dev(target, p6, anchor);
    			insert_dev(target, t35, anchor);
    			insert_dev(target, h4, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(voltarmenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(voltarmenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(head);
    			if (detaching) detach_dev(t0);
    			destroy_component(voltarmenu, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(ul0);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(ul1);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(ul2);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(ul3);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t31);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t33);
    			if (detaching) detach_dev(p6);
    			if (detaching) detach_dev(t35);
    			if (detaching) detach_dev(h4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Ajuda', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Ajuda> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ VoltarMenu });
    	return [];
    }

    class Ajuda extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ajuda",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\menu.svelte generated by Svelte v3.53.1 */
    const file$6 = "src\\menu.svelte";

    // (20:29) 
    function create_if_block_1$4(ctx) {
    	let div;
    	let ul0;
    	let button0;
    	let p0;
    	let t1;
    	let ul1;
    	let button1;
    	let p1;
    	let t3;
    	let ul2;
    	let button2;
    	let p2;
    	let t5;
    	let ul3;
    	let button3;
    	let p3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul0 = element("ul");
    			button0 = element("button");
    			p0 = element("p");
    			p0.textContent = "Continuar";
    			t1 = space();
    			ul1 = element("ul");
    			button1 = element("button");
    			p1 = element("p");
    			p1.textContent = "Novo jogo";
    			t3 = space();
    			ul2 = element("ul");
    			button2 = element("button");
    			p2 = element("p");
    			p2.textContent = "Sobre";
    			t5 = space();
    			ul3 = element("ul");
    			button3 = element("button");
    			p3 = element("p");
    			p3.textContent = "Ajuda";
    			attr_dev(p0, "class", "pmenu");
    			add_location(p0, file$6, 21, 94, 858);
    			attr_dev(button0, "class", "buttonapp");
    			add_location(button0, file$6, 21, 22, 786);
    			attr_dev(ul0, "class", "ulapp");
    			add_location(ul0, file$6, 21, 4, 768);
    			attr_dev(p1, "class", "pmenu");
    			add_location(p1, file$6, 22, 96, 1000);
    			attr_dev(button1, "class", "buttonapp");
    			add_location(button1, file$6, 22, 22, 926);
    			attr_dev(ul1, "class", "ulapp");
    			add_location(ul1, file$6, 22, 4, 908);
    			attr_dev(p2, "class", "pmenu");
    			add_location(p2, file$6, 23, 94, 1140);
    			attr_dev(button2, "class", "buttonapp");
    			add_location(button2, file$6, 23, 22, 1068);
    			attr_dev(ul2, "class", "ulapp");
    			add_location(ul2, file$6, 23, 4, 1050);
    			attr_dev(p3, "class", "pmenu");
    			add_location(p3, file$6, 24, 94, 1276);
    			attr_dev(button3, "class", "buttonapp");
    			add_location(button3, file$6, 24, 22, 1204);
    			attr_dev(ul3, "class", "ulapp");
    			add_location(ul3, file$6, 24, 4, 1186);
    			attr_dev(div, "class", "divapp");
    			add_location(div, file$6, 20, 0, 742);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul0);
    			append_dev(ul0, button0);
    			append_dev(button0, p0);
    			append_dev(div, t1);
    			append_dev(div, ul1);
    			append_dev(ul1, button1);
    			append_dev(button1, p1);
    			append_dev(div, t3);
    			append_dev(div, ul2);
    			append_dev(ul2, button2);
    			append_dev(button2, p2);
    			append_dev(div, t5);
    			append_dev(div, ul3);
    			append_dev(ul3, button3);
    			append_dev(button3, p3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler_3*/ ctx[4], false, false, false),
    					listen_dev(button1, "click", /*click_handler_4*/ ctx[5], false, false, false),
    					listen_dev(button2, "click", /*click_handler_5*/ ctx[6], false, false, false),
    					listen_dev(button3, "click", /*click_handler_6*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(20:29) ",
    		ctx
    	});

    	return block;
    }

    // (12:0) {#if (estadoAtual == 0)}
    function create_if_block$4(ctx) {
    	let div;
    	let ul0;
    	let button0;
    	let p0;
    	let t1;
    	let ul1;
    	let button1;
    	let p1;
    	let t3;
    	let ul2;
    	let button2;
    	let p2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul0 = element("ul");
    			button0 = element("button");
    			p0 = element("p");
    			p0.textContent = "Novo jogo";
    			t1 = space();
    			ul1 = element("ul");
    			button1 = element("button");
    			p1 = element("p");
    			p1.textContent = "Sobre";
    			t3 = space();
    			ul2 = element("ul");
    			button2 = element("button");
    			p2 = element("p");
    			p2.textContent = "Ajuda";
    			attr_dev(p0, "class", "pmenu");
    			add_location(p0, file$6, 14, 96, 383);
    			attr_dev(button0, "class", "buttonapp");
    			add_location(button0, file$6, 14, 22, 309);
    			attr_dev(ul0, "class", "ulapp");
    			add_location(ul0, file$6, 14, 4, 291);
    			attr_dev(p1, "class", "pmenu");
    			add_location(p1, file$6, 15, 94, 523);
    			attr_dev(button1, "class", "buttonapp");
    			add_location(button1, file$6, 15, 22, 451);
    			attr_dev(ul1, "class", "ulapp");
    			add_location(ul1, file$6, 15, 4, 433);
    			attr_dev(p2, "class", "pmenu");
    			add_location(p2, file$6, 16, 94, 659);
    			attr_dev(button2, "class", "buttonapp");
    			add_location(button2, file$6, 16, 22, 587);
    			attr_dev(ul2, "class", "ulapp");
    			add_location(ul2, file$6, 16, 4, 569);
    			attr_dev(div, "class", "divapp");
    			add_location(div, file$6, 13, 0, 265);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul0);
    			append_dev(ul0, button0);
    			append_dev(button0, p0);
    			append_dev(div, t1);
    			append_dev(div, ul1);
    			append_dev(ul1, button1);
    			append_dev(button1, p1);
    			append_dev(div, t3);
    			append_dev(div, ul2);
    			append_dev(ul2, button2);
    			append_dev(button2, p2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[2], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(12:0) {#if (estadoAtual == 0)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let head;
    	let link;
    	let t0;
    	let h1;
    	let t2;
    	let p;
    	let t4;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*estadoAtual*/ ctx[0] == 0) return create_if_block$4;
    		if (/*estadoAtual*/ ctx[0] == 1) return create_if_block_1$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			head = element("head");
    			link = element("link");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Minos";
    			t2 = space();
    			p = element("p");
    			p.textContent = "Labyrinth";
    			t4 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/css/menu.css");
    			add_location(link, file$6, 5, 4, 112);
    			add_location(head, file$6, 4, 0, 99);
    			attr_dev(h1, "class", "h1menu");
    			add_location(h1, file$6, 8, 0, 169);
    			attr_dev(p, "class", "pmenu");
    			add_location(p, file$6, 9, 0, 200);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, head, anchor);
    			append_dev(head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (if_block) if_block.p(ctx, dirty);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(head);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t4);

    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, []);
    	let estadoAtual = 0;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		trocarEstadoDoJogo('jogar');
    	};

    	const click_handler_1 = () => trocarEstadoDoJogo('sobre');
    	const click_handler_2 = () => trocarEstadoDoJogo('ajuda');
    	const click_handler_3 = () => trocarEstadoDoJogo('jogar');

    	const click_handler_4 = () => {
    		trocarEstadoDoJogo('jogar');
    	};

    	const click_handler_5 = () => trocarEstadoDoJogo('sobre');
    	const click_handler_6 = () => trocarEstadoDoJogo('ajuda');
    	$$self.$capture_state = () => ({ trocarEstadoDoJogo, estadoAtual });

    	$$self.$inject_state = $$props => {
    		if ('estadoAtual' in $$props) $$invalidate(0, estadoAtual = $$props.estadoAtual);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		estadoAtual,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6
    	];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\sobre.svelte generated by Svelte v3.53.1 */
    const file$5 = "src\\sobre.svelte";

    function create_fragment$5(ctx) {
    	let voltarmenu;
    	let t0;
    	let head;
    	let link;
    	let t1;
    	let h10;
    	let t3;
    	let p0;
    	let t5;
    	let h11;
    	let t7;
    	let h20;
    	let t9;
    	let p1;
    	let t10;
    	let br0;
    	let t11;
    	let br1;
    	let t12;
    	let t13;
    	let h21;
    	let t15;
    	let p2;
    	let t16;
    	let br2;
    	let t17;
    	let t18;
    	let h22;
    	let t20;
    	let p3;
    	let t21;
    	let br3;
    	let t22;
    	let br4;
    	let t23;
    	let t24;
    	let h23;
    	let t26;
    	let p4;
    	let t27;
    	let br5;
    	let t28;
    	let br6;
    	let t29;
    	let t30;
    	let h24;
    	let t32;
    	let p5;
    	let t33;
    	let br7;
    	let t34;
    	let br8;
    	let t35;
    	let t36;
    	let h25;
    	let t38;
    	let p6;
    	let t39;
    	let br9;
    	let t40;
    	let br10;
    	let t41;
    	let current;
    	voltarmenu = new VoltarMenu({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(voltarmenu.$$.fragment);
    			t0 = space();
    			head = element("head");
    			link = element("link");
    			t1 = space();
    			h10 = element("h1");
    			h10.textContent = "Sobre o MINOS:";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "A história do MINOS LABYRINTH se dá ínicio quando Dante, nosso protagonista e aspirante a historiador, se vê de frente a grande oportunidade de sua vida\r\n que é poder provar tanto a si mesmo quanto para as pessoas ao seu redor que criaturas mitólogicas existem; Durante uma de suas viagens em busca\r\n de mais informações Dante se depara com um velho maltrapilho que aos gritos dizia que os monstros existentes dentro de um labirinto fugiriam e destruiriam\r\n toda aquela cidade. Como se era esperado, ninguém deu ouvidos aos avisos daquele senhor lunático, apenas continuavam seguindo suas vidas e o ignorando, \r\n algo dizia a Dante que aquela cena já havia se repetido inúmeras vezes. Já decidido a também ignorar aquele senhor o rapaz encontra caído no chão o que parecia\r\n ser um diário, o pequeno caderno estava sujo e mal conservado, mesmo com curiosidade o garoto decidiu devolver o objeto a aquele homem - \"Pode ficar com essa\r\n porcaria, jogue fora! Faça o que quiser!\" - foi o que Dante ouviu antes de ainda aos gritos o velho louco ir embora.\r\n Minos Labyrinth foi o nome que mais se repetiu a medida que ele o lia, descobrindo que o diário estava repleto de relatos de outros que também haviam se aventurado\r\n a entrar no labirinto, ficando surpreso ao perceber que o velho provavelmente fora o único que voltou com vida.\r\n Tomado pelo desejo de ver as criaturas com seus próprios olhos Dante decidiu que entraria naquele labirinto, seria a maior aventura de sua vida e o jovem não via a\r\nhora de finalmente desvender o mistério que o \"Minos Labyrinth\" tinha a lhe ofercer.";
    			t5 = space();
    			h11 = element("h1");
    			h11.textContent = "Os Deuses";
    			t7 = space();
    			h20 = element("h2");
    			h20.textContent = "Alice Manguinho";
    			t9 = space();
    			p1 = element("p");
    			t10 = text("17 anos ");
    			br0 = element("br");
    			t11 = text(" 1° período de IPI ");
    			br1 = element("br");
    			t12 = text(" asms1@discente.ifpe.edu.br");
    			t13 = space();
    			h21 = element("h2");
    			h21.textContent = "Allan Lima";
    			t15 = space();
    			p2 = element("p");
    			t16 = text("Professor Responsável ");
    			br2 = element("br");
    			t17 = text(" allan.lima@igarassu.ifpe.edu.br");
    			t18 = space();
    			h22 = element("h2");
    			h22.textContent = "Assíria Renara";
    			t20 = space();
    			p3 = element("p");
    			t21 = text("22 anos ");
    			br3 = element("br");
    			t22 = text(" 1° período de IPI ");
    			br4 = element("br");
    			t23 = text(" aross@discente.ifpe.edu.br");
    			t24 = space();
    			h23 = element("h2");
    			h23.textContent = "Claudiane Rodrigues";
    			t26 = space();
    			p4 = element("p");
    			t27 = text("21 anos ");
    			br5 = element("br");
    			t28 = text(" 1° período de IPI ");
    			br6 = element("br");
    			t29 = text(" cra@discente.ifpe.edu.br");
    			t30 = space();
    			h24 = element("h2");
    			h24.textContent = "Emmily Kathylen";
    			t32 = space();
    			p5 = element("p");
    			t33 = text("20 anos ");
    			br7 = element("br");
    			t34 = text(" 1° período de IPI ");
    			br8 = element("br");
    			t35 = text(" emmilysouzakathylen@gmail.com");
    			t36 = space();
    			h25 = element("h2");
    			h25.textContent = "Guilherme Valença";
    			t38 = space();
    			p6 = element("p");
    			t39 = text("21 anos ");
    			br9 = element("br");
    			t40 = text(" 1° período de IPI ");
    			br10 = element("br");
    			t41 = text(" gvrp@discente.ifpe.edu.br");
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/css/sobre.css");
    			add_location(link, file$5, 5, 4, 98);
    			add_location(head, file$5, 4, 0, 86);
    			attr_dev(h10, "class", "sobreh1");
    			add_location(h10, file$5, 7, 0, 154);
    			attr_dev(p0, "class", "fic");
    			add_location(p0, file$5, 9, 0, 197);
    			attr_dev(h11, "class", "sobreh1");
    			add_location(h11, file$5, 24, 0, 1810);
    			add_location(h20, file$5, 26, 0, 1848);
    			add_location(br0, file$5, 27, 16, 1890);
    			add_location(br1, file$5, 27, 39, 1913);
    			add_location(p1, file$5, 27, 4, 1878);
    			add_location(h21, file$5, 29, 1, 1954);
    			add_location(br2, file$5, 30, 29, 2004);
    			add_location(p2, file$5, 30, 4, 1979);
    			add_location(h22, file$5, 32, 1, 2050);
    			add_location(br3, file$5, 33, 15, 2090);
    			add_location(br4, file$5, 33, 38, 2113);
    			add_location(p3, file$5, 33, 4, 2079);
    			add_location(h23, file$5, 35, 1, 2158);
    			add_location(br5, file$5, 36, 16, 2204);
    			add_location(br6, file$5, 36, 39, 2227);
    			add_location(p4, file$5, 36, 4, 2192);
    			add_location(h24, file$5, 38, 1, 2266);
    			add_location(br7, file$5, 39, 15, 2307);
    			add_location(br8, file$5, 39, 38, 2330);
    			add_location(p5, file$5, 39, 4, 2296);
    			add_location(h25, file$5, 41, 1, 2374);
    			add_location(br9, file$5, 42, 15, 2417);
    			add_location(br10, file$5, 42, 38, 2440);
    			add_location(p6, file$5, 42, 4, 2406);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(voltarmenu, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, head, anchor);
    			append_dev(head, link);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h10, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, h11, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, h20, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t10);
    			append_dev(p1, br0);
    			append_dev(p1, t11);
    			append_dev(p1, br1);
    			append_dev(p1, t12);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, h21, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, t16);
    			append_dev(p2, br2);
    			append_dev(p2, t17);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, h22, anchor);
    			insert_dev(target, t20, anchor);
    			insert_dev(target, p3, anchor);
    			append_dev(p3, t21);
    			append_dev(p3, br3);
    			append_dev(p3, t22);
    			append_dev(p3, br4);
    			append_dev(p3, t23);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, h23, anchor);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, p4, anchor);
    			append_dev(p4, t27);
    			append_dev(p4, br5);
    			append_dev(p4, t28);
    			append_dev(p4, br6);
    			append_dev(p4, t29);
    			insert_dev(target, t30, anchor);
    			insert_dev(target, h24, anchor);
    			insert_dev(target, t32, anchor);
    			insert_dev(target, p5, anchor);
    			append_dev(p5, t33);
    			append_dev(p5, br7);
    			append_dev(p5, t34);
    			append_dev(p5, br8);
    			append_dev(p5, t35);
    			insert_dev(target, t36, anchor);
    			insert_dev(target, h25, anchor);
    			insert_dev(target, t38, anchor);
    			insert_dev(target, p6, anchor);
    			append_dev(p6, t39);
    			append_dev(p6, br9);
    			append_dev(p6, t40);
    			append_dev(p6, br10);
    			append_dev(p6, t41);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(voltarmenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(voltarmenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(voltarmenu, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(head);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h10);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(h11);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(h20);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(h21);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(h22);
    			if (detaching) detach_dev(t20);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(h23);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t30);
    			if (detaching) detach_dev(h24);
    			if (detaching) detach_dev(t32);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t36);
    			if (detaching) detach_dev(h25);
    			if (detaching) detach_dev(t38);
    			if (detaching) detach_dev(p6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sobre', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Sobre> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ VoltarMenu });
    	return [];
    }

    class Sobre extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sobre",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\Vitoria.svelte generated by Svelte v3.53.1 */
    const file$4 = "src\\Vitoria.svelte";

    function create_fragment$4(ctx) {
    	let h1;
    	let t1;
    	let h30;
    	let t3;
    	let h31;
    	let t5;
    	let h32;
    	let t7;
    	let h33;
    	let t9;
    	let h34;
    	let t11;
    	let h35;
    	let t13;
    	let h36;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Olá, caro humano.";
    			t1 = space();
    			h30 = element("h3");
    			h30.textContent = "Então nos encontramos novamente,";
    			t3 = space();
    			h31 = element("h3");
    			h31.textContent = "Parece que realmente conseguiu se livrar de seus instintos e enfrentar os mistérios que rodeiam o Minos Labyrinth.";
    			t5 = space();
    			h32 = element("h3");
    			h32.textContent = "Devo parabenizá-lo por ainda estar com vida, mas me questiono se por muito tempo.";
    			t7 = space();
    			h33 = element("h3");
    			h33.textContent = "Humanos sempre cedendo a seus desejos e vontades sem se importar com as consequências de seus atos,";
    			t9 = space();
    			h34 = element("h3");
    			h34.textContent = "acha mesmo que ficará impune por invadir o lar dos seres que encontrou ao longo do caminho?";
    			t11 = space();
    			h35 = element("h3");
    			h35.textContent = "Talvez tenha dado muita sorte hoje, jovem Dante.";
    			t13 = space();
    			h36 = element("h3");
    			h36.textContent = "Seria realmente cômico se acreditasse que ela vai durar para sempre.";
    			attr_dev(h1, "class", "svelte-q0fwci");
    			add_location(h1, file$4, 27, 0, 778);
    			attr_dev(h30, "class", "svelte-q0fwci");
    			add_location(h30, file$4, 29, 0, 808);
    			attr_dev(h31, "class", "svelte-q0fwci");
    			add_location(h31, file$4, 30, 0, 851);
    			attr_dev(h32, "class", "svelte-q0fwci");
    			add_location(h32, file$4, 31, 0, 976);
    			attr_dev(h33, "class", "svelte-q0fwci");
    			add_location(h33, file$4, 32, 0, 1069);
    			attr_dev(h34, "class", "svelte-q0fwci");
    			add_location(h34, file$4, 33, 0, 1179);
    			attr_dev(h35, "class", "svelte-q0fwci");
    			add_location(h35, file$4, 34, 0, 1281);
    			attr_dev(h36, "class", "svelte-q0fwci");
    			add_location(h36, file$4, 35, 0, 1340);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h30, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h31, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, h32, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, h33, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, h34, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, h35, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, h36, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h30);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h31);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(h32);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(h33);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(h34);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(h35);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(h36);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Vitoria', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Vitoria> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ estado, trocarEstadoDoJogo });
    	return [];
    }

    class Vitoria extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Vitoria",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\jogo.svelte generated by Svelte v3.53.1 */
    const file$3 = "src\\jogo.svelte";

    function get_each_context_8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[50] = list[i];
    	child_ctx[40] = i;
    	return child_ctx;
    }

    function get_each_context_9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	child_ctx[43] = i;
    	return child_ctx;
    }

    function get_each_context_6$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[38] = list[i];
    	child_ctx[40] = i;
    	return child_ctx;
    }

    function get_each_context_7$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	child_ctx[43] = i;
    	return child_ctx;
    }

    function get_each_context_4$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[38] = list[i];
    	child_ctx[40] = i;
    	return child_ctx;
    }

    function get_each_context_5$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	child_ctx[43] = i;
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[38] = list[i];
    	child_ctx[40] = i;
    	return child_ctx;
    }

    function get_each_context_3$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	child_ctx[43] = i;
    	return child_ctx;
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[38] = list[i];
    	child_ctx[40] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	child_ctx[43] = i;
    	return child_ctx;
    }

    // (381:0) {#if (key)}
    function create_if_block_31$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*code*/ ctx[1] == "ArrowUp") return create_if_block_32$1;
    		if (/*code*/ ctx[1] == "ArrowDown") return create_if_block_33$1;
    		if (/*code*/ ctx[1] == "ArrowLeft") return create_if_block_34$1;
    		if (/*code*/ ctx[1] == "ArrowRight") return create_if_block_35;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_31$1.name,
    		type: "if",
    		source: "(381:0) {#if (key)}",
    		ctx
    	});

    	return block;
    }

    // (388:45) 
    function create_if_block_35(ctx) {
    	let t_value = /*incremetarX*/ ctx[18]() + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_35.name,
    		type: "if",
    		source: "(388:45) ",
    		ctx
    	});

    	return block;
    }

    // (386:44) 
    function create_if_block_34$1(ctx) {
    	let t_value = /*decrementarX*/ ctx[20]() + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_34$1.name,
    		type: "if",
    		source: "(386:44) ",
    		ctx
    	});

    	return block;
    }

    // (384:44) 
    function create_if_block_33$1(ctx) {
    	let t_value = /*incremetarY*/ ctx[19]() + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_33$1.name,
    		type: "if",
    		source: "(384:44) ",
    		ctx
    	});

    	return block;
    }

    // (382:12) {#if (code == "ArrowUp")}
    function create_if_block_32$1(ctx) {
    	let t_value = /*decrementarY*/ ctx[21]() + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_32$1.name,
    		type: "if",
    		source: "(382:12) {#if (code == \\\"ArrowUp\\\")}",
    		ctx
    	});

    	return block;
    }

    // (551:31) 
    function create_if_block_27$1(ctx) {
    	let p;
    	let t1;
    	let t2_value = clearInterval(/*NewTempo*/ ctx[2]) + "";
    	let t2;
    	let t3;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_28$1, create_else_block_7];
    	const if_blocks = [];

    	function select_block_type_9(ctx, dirty) {
    		if (!/*enigma*/ ctx[6]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_9(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Nivel 3";
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(p, "class", "FasesDoJogo");
    			add_location(p, file$3, 552, 0, 38194);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*NewTempo*/ 4) && t2_value !== (t2_value = clearInterval(/*NewTempo*/ ctx[2]) + "")) set_data_dev(t2, t2_value);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_9(ctx);

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
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_27$1.name,
    		type: "if",
    		source: "(551:31) ",
    		ctx
    	});

    	return block;
    }

    // (507:31) 
    function create_if_block_20$1(ctx) {
    	let t0_value = clearInterval(/*NewTempo*/ ctx[2]) + "";
    	let t0;
    	let t1;
    	let p;
    	let t3;
    	let if_block_anchor;

    	function select_block_type_7(ctx, dirty) {
    		if (!/*enigma*/ ctx[6]) return create_if_block_21$1;
    		return create_else_block_5;
    	}

    	let current_block_type = select_block_type_7(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			p.textContent = "Nivel 3";
    			t3 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(p, "class", "FasesDoJogo");
    			add_location(p, file$3, 511, 0, 36719);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			insert_dev(target, t3, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*NewTempo*/ 4 && t0_value !== (t0_value = clearInterval(/*NewTempo*/ ctx[2]) + "")) set_data_dev(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type_7(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t3);
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_20$1.name,
    		type: "if",
    		source: "(507:31) ",
    		ctx
    	});

    	return block;
    }

    // (469:31) 
    function create_if_block_13$1(ctx) {
    	let p;
    	let t1;
    	let if_block_anchor;

    	function select_block_type_5(ctx, dirty) {
    		if (!/*enigma*/ ctx[6]) return create_if_block_14$1;
    		return create_else_block_3;
    	}

    	let current_block_type = select_block_type_5(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Nivel 2";
    			t1 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(p, "class", "FasesDoJogo");
    			add_location(p, file$3, 470, 0, 35321);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_5(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13$1.name,
    		type: "if",
    		source: "(469:31) ",
    		ctx
    	});

    	return block;
    }

    // (422:31) 
    function create_if_block_6$2(ctx) {
    	let t0_value = clearInterval(/*NewTempo*/ ctx[2]) + "";
    	let t0;
    	let t1;
    	let p;
    	let t3;
    	let if_block_anchor;

    	function select_block_type_3(ctx, dirty) {
    		if (!/*enigma*/ ctx[6]) return create_if_block_7$2;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			p.textContent = "Nivel 1";
    			t3 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(p, "class", "FasesDoJogo");
    			add_location(p, file$3, 426, 0, 33543);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			insert_dev(target, t3, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*NewTempo*/ 4 && t0_value !== (t0_value = clearInterval(/*NewTempo*/ ctx[2]) + "")) set_data_dev(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t3);
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$2.name,
    		type: "if",
    		source: "(422:31) ",
    		ctx
    	});

    	return block;
    }

    // (394:0) {#if (MudançaDeFase == 9)}
    function create_if_block$3(ctx) {
    	let p;
    	let t1;
    	let t2_value = /*posicaoinicial*/ ctx[23](/*mapa*/ ctx[13]) + "";
    	let t2;
    	let t3;
    	let table;
    	let each_value = /*mapa*/ ctx[13];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Tutorial";
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p, "class", "FasesDoJogo");
    			add_location(p, file$3, 396, 4, 32540);
    			attr_dev(table, "class", "mapa");
    			add_location(table, file$3, 400, 0, 32605);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*mapa, proximafase, eixoY, eixoX, ResertarPosicao, MudançaDeFase*/ 4206648) {
    				each_value = /*mapa*/ ctx[13];
    				validate_each_argument(each_value);
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
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(394:0) {#if (MudançaDeFase == 9)}",
    		ctx
    	});

    	return block;
    }

    // (561:0) {:else}
    function create_else_block_7(ctx) {
    	let t0_value = clearInterval(/*NewTempo*/ ctx[2]) + "";
    	let t0;
    	let t1;
    	let vitoria;
    	let t2;
    	let table;
    	let current;
    	vitoria = new Vitoria({ $$inline: true });
    	let each_value_8 = /*mapa4*/ ctx[17];
    	validate_each_argument(each_value_8);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_8.length; i += 1) {
    		each_blocks[i] = create_each_block_8(get_each_context_8(ctx, each_value_8, i));
    	}

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    			create_component(vitoria.$$.fragment);
    			t2 = space();
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(table, "class", "mapa");
    			add_location(table, file$3, 563, 0, 38628);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(vitoria, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*NewTempo*/ 4) && t0_value !== (t0_value = clearInterval(/*NewTempo*/ ctx[2]) + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*mapa4, eixoX, eixoY, MudançaDeFase*/ 131128) {
    				each_value_8 = /*mapa4*/ ctx[17];
    				validate_each_argument(each_value_8);
    				let i;

    				for (i = 0; i < each_value_8.length; i += 1) {
    					const child_ctx = get_each_context_8(ctx, each_value_8, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_8(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_8.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(vitoria.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(vitoria.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			destroy_component(vitoria, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_7.name,
    		type: "else",
    		source: "(561:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (556:0) {#if !enigma}
    function create_if_block_28$1(ctx) {
    	let t0_value = /*EnigmaTime*/ ctx[11](/*MudançaDeFase*/ ctx[3]) + "";
    	let t0;
    	let t1;
    	let p;
    	let t3;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			p.textContent = "Se você me tem, quer me compartilhar; se você não me compartilha, você me manteve. O que eu sou?";
    			t3 = space();
    			input = element("input");
    			attr_dev(p, "class", "Enigma");
    			add_location(p, file$3, 557, 4, 38311);
    			attr_dev(input, "placeholder", "APENAS LETRAS MAIUSCULAS");
    			attr_dev(input, "class", "RespostaEnigma");
    			add_location(input, file$3, 558, 0, 38431);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*PalavraChave*/ ctx[7]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler_3*/ ctx[30]),
    					listen_dev(
    						input,
    						"keydown",
    						function () {
    							if (is_function(/*Alterando*/ ctx[24](/*PalavraChave*/ ctx[7] == "SEGREDO"))) /*Alterando*/ ctx[24](/*PalavraChave*/ ctx[7] == "SEGREDO").apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*MudançaDeFase*/ 8 && t0_value !== (t0_value = /*EnigmaTime*/ ctx[11](/*MudançaDeFase*/ ctx[3]) + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*PalavraChave*/ 128 && input.value !== /*PalavraChave*/ ctx[7]) {
    				set_input_value(input, /*PalavraChave*/ ctx[7]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_28$1.name,
    		type: "if",
    		source: "(556:0) {#if !enigma}",
    		ctx
    	});

    	return block;
    }

    // (571:37) 
    function create_if_block_30$1(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "parede");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredetutorial1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			add_location(img, file$3, 571, 31, 39049);
    			attr_dev(th, "id", "MapaGeral");
    			add_location(th, file$3, 571, 12, 39030);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_30$1.name,
    		type: "if",
    		source: "(571:37) ",
    		ctx
    	});

    	return block;
    }

    // (569:8) {#if estrada == 0}
    function create_if_block_29$1(ctx) {
    	let th;
    	let img;
    	let img_class_value;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "id", "ChaoNoGeral");
    			attr_dev(img, "class", img_class_value = ClassDante(/*i*/ ctx[40], /*j*/ ctx[43], /*eixoX*/ ctx[4], /*eixoY*/ ctx[5], /*MudançaDeFase*/ ctx[3]));
    			if (!src_url_equal(img.src, img_src_value = IMGmovimentacao(/*i*/ ctx[40], /*j*/ ctx[43], /*eixoX*/ ctx[4], /*eixoY*/ ctx[5], /*MudançaDeFase*/ ctx[3]))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "estrada");
    			add_location(img, file$3, 569, 31, 38829);
    			attr_dev(th, "id", "MapaGeral");
    			add_location(th, file$3, 569, 12, 38810);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*eixoX, eixoY, MudançaDeFase*/ 56 && img_class_value !== (img_class_value = ClassDante(/*i*/ ctx[40], /*j*/ ctx[43], /*eixoX*/ ctx[4], /*eixoY*/ ctx[5], /*MudançaDeFase*/ ctx[3]))) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (dirty[0] & /*eixoX, eixoY, MudançaDeFase*/ 56 && !src_url_equal(img.src, img_src_value = IMGmovimentacao(/*i*/ ctx[40], /*j*/ ctx[43], /*eixoX*/ ctx[4], /*eixoY*/ ctx[5], /*MudançaDeFase*/ ctx[3]))) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_29$1.name,
    		type: "if",
    		source: "(569:8) {#if estrada == 0}",
    		ctx
    	});

    	return block;
    }

    // (567:8) {#each elementos as estrada,j}
    function create_each_block_9(ctx) {
    	let if_block_anchor;

    	function select_block_type_10(ctx, dirty) {
    		if (/*estrada*/ ctx[41] == 0) return create_if_block_29$1;
    		if (/*estrada*/ ctx[41] == "C") return create_if_block_30$1;
    	}

    	let current_block_type = select_block_type_10(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (if_block) if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_9.name,
    		type: "each",
    		source: "(567:8) {#each elementos as estrada,j}",
    		ctx
    	});

    	return block;
    }

    // (565:4) {#each mapa4 as elementos,i}
    function create_each_block_8(ctx) {
    	let tr;
    	let t;
    	let each_value_9 = /*elementos*/ ctx[50];
    	validate_each_argument(each_value_9);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_9.length; i += 1) {
    		each_blocks[i] = create_each_block_9(get_each_context_9(ctx, each_value_9, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(tr, "class", "linhas da tabela");
    			add_location(tr, file$3, 565, 4, 38688);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*eixoX, eixoY, MudançaDeFase, mapa4*/ 131128) {
    				each_value_9 = /*elementos*/ ctx[50];
    				validate_each_argument(each_value_9);
    				let i;

    				for (i = 0; i < each_value_9.length; i += 1) {
    					const child_ctx = get_each_context_9(ctx, each_value_9, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_9(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_9.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_8.name,
    		type: "each",
    		source: "(565:4) {#each mapa4 as elementos,i}",
    		ctx
    	});

    	return block;
    }

    // (519:0) {:else}
    function create_else_block_5(ctx) {
    	let t0_value = /*ResertarContadores*/ ctx[26]() + "";
    	let t0;
    	let t1;
    	let t2_value = /*contar*/ ctx[25](/*ContadorDoLabirinto*/ ctx[8]) + "";
    	let t2;
    	let t3;
    	let div;
    	let t4;
    	let t5;
    	let t6;
    	let t7_value = clearInterval(/*NewTempo*/ ctx[2]) + "";
    	let t7;
    	let t8;
    	let t9_value = /*time*/ ctx[10](/*MudançaDeFase*/ ctx[3]) + "";
    	let t9;
    	let t10;
    	let t11_value = /*posicaoinicial*/ ctx[23](/*mapa3*/ ctx[16]) + "";
    	let t11;
    	let t12;
    	let table;
    	let each_value_6 = /*mapa3*/ ctx[16];
    	validate_each_argument(each_value_6);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks[i] = create_each_block_6$1(get_each_context_6$1(ctx, each_value_6, i));
    	}

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			div = element("div");
    			t4 = text(/*ContadorDoLabirinto*/ ctx[8]);
    			t5 = text("s");
    			t6 = space();
    			t7 = text(t7_value);
    			t8 = space();
    			t9 = text(t9_value);
    			t10 = space();
    			t11 = text(t11_value);
    			t12 = space();
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "Contador");
    			add_location(div, file$3, 521, 0, 37146);
    			attr_dev(table, "class", "mapa");
    			add_location(table, file$3, 527, 0, 37277);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, t4);
    			append_dev(div, t5);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*ContadorDoLabirinto*/ 256 && t2_value !== (t2_value = /*contar*/ ctx[25](/*ContadorDoLabirinto*/ ctx[8]) + "")) set_data_dev(t2, t2_value);
    			if (dirty[0] & /*ContadorDoLabirinto*/ 256) set_data_dev(t4, /*ContadorDoLabirinto*/ ctx[8]);
    			if (dirty[0] & /*NewTempo*/ 4 && t7_value !== (t7_value = clearInterval(/*NewTempo*/ ctx[2]) + "")) set_data_dev(t7, t7_value);
    			if (dirty[0] & /*MudançaDeFase*/ 8 && t9_value !== (t9_value = /*time*/ ctx[10](/*MudançaDeFase*/ ctx[3]) + "")) set_data_dev(t9, t9_value);

    			if (dirty[0] & /*mapa3, proximafase, eixoY, eixoX, ResertarPosicao, MudançaDeFase*/ 4263992) {
    				each_value_6 = /*mapa3*/ ctx[16];
    				validate_each_argument(each_value_6);
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6$1(ctx, each_value_6, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_6$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_6.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_5.name,
    		type: "else",
    		source: "(519:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (514:0) {#if !enigma}
    function create_if_block_21$1(ctx) {
    	let t0_value = /*EnigmaTime*/ ctx[11](/*MudançaDeFase*/ ctx[3]) + "";
    	let t0;
    	let t1;
    	let p;
    	let t3;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			p.textContent = "Poder suficiente para esmagar navios e quebrar telhados mas mesmo assim tenho medo do sol, quem eu sou?";
    			t3 = space();
    			input = element("input");
    			attr_dev(p, "class", "Enigma");
    			add_location(p, file$3, 515, 4, 36809);
    			attr_dev(input, "placeholder", "APENAS LETRAS MAIUSCULAS");
    			attr_dev(input, "class", "RespostaEnigma");
    			add_location(input, file$3, 516, 0, 36936);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*PalavraChave*/ ctx[7]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler_2*/ ctx[29]),
    					listen_dev(
    						input,
    						"keydown",
    						function () {
    							if (is_function(/*Alterando*/ ctx[24](/*PalavraChave*/ ctx[7] == "GELO"))) /*Alterando*/ ctx[24](/*PalavraChave*/ ctx[7] == "GELO").apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*MudançaDeFase*/ 8 && t0_value !== (t0_value = /*EnigmaTime*/ ctx[11](/*MudançaDeFase*/ ctx[3]) + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*PalavraChave*/ 128 && input.value !== /*PalavraChave*/ ctx[7]) {
    				set_input_value(input, /*PalavraChave*/ ctx[7]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_21$1.name,
    		type: "if",
    		source: "(514:0) {#if !enigma}",
    		ctx
    	});

    	return block;
    }

    // (542:8) {:else}
    function create_else_block_6(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "saida");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/saidanivel3.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			add_location(img, file$3, 542, 27, 38022);
    			attr_dev(th, "id", "MapaGeral");
    			add_location(th, file$3, 542, 8, 38003);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_6.name,
    		type: "else",
    		source: "(542:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (540:33) 
    function create_if_block_26$1(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "parede");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredenivel3.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			add_location(img, file$3, 540, 27, 37902);
    			attr_dev(th, "id", "MapaGeral");
    			add_location(th, file$3, 540, 8, 37883);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_26$1.name,
    		type: "if",
    		source: "(540:33) ",
    		ctx
    	});

    	return block;
    }

    // (538:33) 
    function create_if_block_25$1(ctx) {
    	let th;

    	const block = {
    		c: function create() {
    			th = element("th");
    			attr_dev(th, "class", "MapaGeral");
    			add_location(th, file$3, 538, 8, 37811);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_25$1.name,
    		type: "if",
    		source: "(538:33) ",
    		ctx
    	});

    	return block;
    }

    // (536:33) 
    function create_if_block_24$1(ctx) {
    	let th;
    	let img;
    	let img_class_value;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "id", "ChaoNoGeral");
    			attr_dev(img, "class", img_class_value = ClassDante(/*i*/ ctx[40], /*j*/ ctx[43], /*eixoX*/ ctx[4], /*eixoY*/ ctx[5], /*MudançaDeFase*/ ctx[3]));
    			if (!src_url_equal(img.src, img_src_value = IMGmovimentacao(/*i*/ ctx[40], /*j*/ ctx[43], /*eixoX*/ ctx[4], /*eixoY*/ ctx[5], /*MudançaDeFase*/ ctx[3]))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "estrada");
    			add_location(img, file$3, 536, 27, 37618);
    			attr_dev(th, "id", "MapaGeral");
    			add_location(th, file$3, 536, 8, 37599);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*eixoX, eixoY, MudançaDeFase*/ 56 && img_class_value !== (img_class_value = ClassDante(/*i*/ ctx[40], /*j*/ ctx[43], /*eixoX*/ ctx[4], /*eixoY*/ ctx[5], /*MudançaDeFase*/ ctx[3]))) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (dirty[0] & /*eixoX, eixoY, MudançaDeFase*/ 56 && !src_url_equal(img.src, img_src_value = IMGmovimentacao(/*i*/ ctx[40], /*j*/ ctx[43], /*eixoX*/ ctx[4], /*eixoY*/ ctx[5], /*MudançaDeFase*/ ctx[3]))) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_24$1.name,
    		type: "if",
    		source: "(536:33) ",
    		ctx
    	});

    	return block;
    }

    // (534:45) 
    function create_if_block_23$1(ctx) {
    	let t_value = /*ResertarPosicao*/ ctx[22]() + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_23$1.name,
    		type: "if",
    		source: "(534:45) ",
    		ctx
    	});

    	return block;
    }

    // (532:8) {#if (mapa3[eixoY][eixoX] == "V")}
    function create_if_block_22$1(ctx) {
    	let t_value = /*proximafase*/ ctx[12](/*mapa3*/ ctx[16][/*eixoY*/ ctx[5]][/*eixoX*/ ctx[4]]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*eixoY, eixoX*/ 48 && t_value !== (t_value = /*proximafase*/ ctx[12](/*mapa3*/ ctx[16][/*eixoY*/ ctx[5]][/*eixoX*/ ctx[4]]) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_22$1.name,
    		type: "if",
    		source: "(532:8) {#if (mapa3[eixoY][eixoX] == \\\"V\\\")}",
    		ctx
    	});

    	return block;
    }

    // (531:4) {#each regiao as estrada,j}
    function create_each_block_7$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_8(ctx, dirty) {
    		if (/*mapa3*/ ctx[16][/*eixoY*/ ctx[5]][/*eixoX*/ ctx[4]] == "V") return create_if_block_22$1;
    		if (/*mapa3*/ ctx[16][/*eixoY*/ ctx[5]][/*eixoX*/ ctx[4]] != 0) return create_if_block_23$1;
    		if (/*estrada*/ ctx[41] == 0) return create_if_block_24$1;
    		if (/*estrada*/ ctx[41] == 2) return create_if_block_25$1;
    		if (/*estrada*/ ctx[41] == 1) return create_if_block_26$1;
    		return create_else_block_6;
    	}

    	let current_block_type = select_block_type_8(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_8(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_7$1.name,
    		type: "each",
    		source: "(531:4) {#each regiao as estrada,j}",
    		ctx
    	});

    	return block;
    }

    // (529:4) {#each mapa3 as regiao,i}
    function create_each_block_6$1(ctx) {
    	let tr;
    	let t;
    	let each_value_7 = /*regiao*/ ctx[38];
    	validate_each_argument(each_value_7);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_7.length; i += 1) {
    		each_blocks[i] = create_each_block_7$1(get_each_context_7$1(ctx, each_value_7, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(tr, "class", "linhasdatabela");
    			add_location(tr, file$3, 529, 0, 37330);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*proximafase, mapa3, eixoY, eixoX, ResertarPosicao, MudançaDeFase*/ 4263992) {
    				each_value_7 = /*regiao*/ ctx[38];
    				validate_each_argument(each_value_7);
    				let i;

    				for (i = 0; i < each_value_7.length; i += 1) {
    					const child_ctx = get_each_context_7$1(ctx, each_value_7, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_7$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_7.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6$1.name,
    		type: "each",
    		source: "(529:4) {#each mapa3 as regiao,i}",
    		ctx
    	});

    	return block;
    }

    // (480:0) {:else}
    function create_else_block_3(ctx) {
    	let t0_value = clearInterval(/*NewTempo*/ ctx[2]) + "";
    	let t0;
    	let t1;
    	let t2_value = /*time*/ ctx[10](/*MudançaDeFase*/ ctx[3]) + "";
    	let t2;
    	let t3;
    	let t4_value = /*posicaoinicial*/ ctx[23](/*mapa2*/ ctx[15]) + "";
    	let t4;
    	let t5;
    	let table;
    	let each_value_4 = /*mapa2*/ ctx[15];
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4$1(get_each_context_4$1(ctx, each_value_4, i));
    	}

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			t4 = text(t4_value);
    			t5 = space();
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(table, "class", "mapa");
    			add_location(table, file$3, 484, 0, 35774);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*NewTempo*/ 4 && t0_value !== (t0_value = clearInterval(/*NewTempo*/ ctx[2]) + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*MudançaDeFase*/ 8 && t2_value !== (t2_value = /*time*/ ctx[10](/*MudançaDeFase*/ ctx[3]) + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*mapa2, proximafase, eixoY, eixoX, ResertarPosicao, MudançaDeFase*/ 4231224) {
    				each_value_4 = /*mapa2*/ ctx[15];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4$1(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(480:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (475:0) {#if !enigma}
    function create_if_block_14$1(ctx) {
    	let t0_value = /*EnigmaTime*/ ctx[11](/*MudançaDeFase*/ ctx[3]) + "";
    	let t0;
    	let t1;
    	let p;
    	let t3;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			p.textContent = "Fui levado para um quarto escuro e incendiado. Eu chorei e então minha cabeça foi cortada. Quem sou eu?";
    			t3 = space();
    			input = element("input");
    			attr_dev(p, "class", "Enigma");
    			add_location(p, file$3, 476, 4, 35415);
    			attr_dev(input, "placeholder", "APENAS LETRAS MAIUSCULAS");
    			attr_dev(input, "class", "RespostaEnigma");
    			add_location(input, file$3, 477, 0, 35542);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*PalavraChave*/ ctx[7]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler_1*/ ctx[28]),
    					listen_dev(
    						input,
    						"keydown",
    						function () {
    							if (is_function(/*Alterando*/ ctx[24](/*PalavraChave*/ ctx[7] == "VELA"))) /*Alterando*/ ctx[24](/*PalavraChave*/ ctx[7] == "VELA").apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*MudançaDeFase*/ 8 && t0_value !== (t0_value = /*EnigmaTime*/ ctx[11](/*MudançaDeFase*/ ctx[3]) + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*PalavraChave*/ 128 && input.value !== /*PalavraChave*/ ctx[7]) {
    				set_input_value(input, /*PalavraChave*/ ctx[7]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14$1.name,
    		type: "if",
    		source: "(475:0) {#if !enigma}",
    		ctx
    	});

    	return block;
    }

    // (499:8) {:else}
    function create_else_block_4(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "saida");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/chaonivel2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			add_location(img, file$3, 499, 27, 36519);
    			attr_dev(th, "id", "MapaGeral");
    			add_location(th, file$3, 499, 8, 36500);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_4.name,
    		type: "else",
    		source: "(499:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (497:33) 
    function create_if_block_19$1(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "parede");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredenivel2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			add_location(img, file$3, 497, 27, 36399);
    			attr_dev(th, "id", "MapaGeral");
    			add_location(th, file$3, 497, 8, 36380);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19$1.name,
    		type: "if",
    		source: "(497:33) ",
    		ctx
    	});

    	return block;
    }

    // (495:33) 
    function create_if_block_18$1(ctx) {
    	let th;

    	const block = {
    		c: function create() {
    			th = element("th");
    			attr_dev(th, "class", "MapaGeral");
    			add_location(th, file$3, 495, 8, 36308);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18$1.name,
    		type: "if",
    		source: "(495:33) ",
    		ctx
    	});

    	return block;
    }

    // (493:33) 
    function create_if_block_17$1(ctx) {
    	let th;
    	let img;
    	let img_class_value;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "id", "ChaoNoGeral");
    			attr_dev(img, "class", img_class_value = ClassDante(/*i*/ ctx[40], /*j*/ ctx[43], /*eixoX*/ ctx[4], /*eixoY*/ ctx[5], /*MudançaDeFase*/ ctx[3]));
    			if (!src_url_equal(img.src, img_src_value = IMGmovimentacao(/*i*/ ctx[40], /*j*/ ctx[43], /*eixoX*/ ctx[4], /*eixoY*/ ctx[5], /*MudançaDeFase*/ ctx[3]))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "estrada");
    			add_location(img, file$3, 493, 27, 36115);
    			attr_dev(th, "id", "MapaGeral");
    			add_location(th, file$3, 493, 8, 36096);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*eixoX, eixoY, MudançaDeFase*/ 56 && img_class_value !== (img_class_value = ClassDante(/*i*/ ctx[40], /*j*/ ctx[43], /*eixoX*/ ctx[4], /*eixoY*/ ctx[5], /*MudançaDeFase*/ ctx[3]))) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (dirty[0] & /*eixoX, eixoY, MudançaDeFase*/ 56 && !src_url_equal(img.src, img_src_value = IMGmovimentacao(/*i*/ ctx[40], /*j*/ ctx[43], /*eixoX*/ ctx[4], /*eixoY*/ ctx[5], /*MudançaDeFase*/ ctx[3]))) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17$1.name,
    		type: "if",
    		source: "(493:33) ",
    		ctx
    	});

    	return block;
    }

    // (491:45) 
    function create_if_block_16$1(ctx) {
    	let t_value = /*ResertarPosicao*/ ctx[22]() + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16$1.name,
    		type: "if",
    		source: "(491:45) ",
    		ctx
    	});

    	return block;
    }

    // (489:8) {#if (mapa2[eixoY][eixoX] == "Z")}
    function create_if_block_15$1(ctx) {
    	let t_value = /*proximafase*/ ctx[12](/*mapa2*/ ctx[15][/*eixoY*/ ctx[5]][/*eixoX*/ ctx[4]]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*eixoY, eixoX*/ 48 && t_value !== (t_value = /*proximafase*/ ctx[12](/*mapa2*/ ctx[15][/*eixoY*/ ctx[5]][/*eixoX*/ ctx[4]]) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15$1.name,
    		type: "if",
    		source: "(489:8) {#if (mapa2[eixoY][eixoX] == \\\"Z\\\")}",
    		ctx
    	});

    	return block;
    }

    // (488:4) {#each regiao as estrada,j}
    function create_each_block_5$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_6(ctx, dirty) {
    		if (/*mapa2*/ ctx[15][/*eixoY*/ ctx[5]][/*eixoX*/ ctx[4]] == "Z") return create_if_block_15$1;
    		if (/*mapa2*/ ctx[15][/*eixoY*/ ctx[5]][/*eixoX*/ ctx[4]] != 0) return create_if_block_16$1;
    		if (/*estrada*/ ctx[41] == 0) return create_if_block_17$1;
    		if (/*estrada*/ ctx[41] == 2) return create_if_block_18$1;
    		if (/*estrada*/ ctx[41] == 1) return create_if_block_19$1;
    		return create_else_block_4;
    	}

    	let current_block_type = select_block_type_6(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_6(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5$1.name,
    		type: "each",
    		source: "(488:4) {#each regiao as estrada,j}",
    		ctx
    	});

    	return block;
    }

    // (486:4) {#each mapa2 as regiao,i}
    function create_each_block_4$1(ctx) {
    	let tr;
    	let t;
    	let each_value_5 = /*regiao*/ ctx[38];
    	validate_each_argument(each_value_5);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5$1(get_each_context_5$1(ctx, each_value_5, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(tr, "class", "linhasdatabela");
    			add_location(tr, file$3, 486, 0, 35827);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*proximafase, mapa2, eixoY, eixoX, ResertarPosicao, MudançaDeFase*/ 4231224) {
    				each_value_5 = /*regiao*/ ctx[38];
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5$1(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_5$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_5.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4$1.name,
    		type: "each",
    		source: "(486:4) {#each mapa2 as regiao,i}",
    		ctx
    	});

    	return block;
    }

    // (441:0) {:else}
    function create_else_block_1$1(ctx) {
    	let t0_value = /*time*/ ctx[10](/*MudançaDeFase*/ ctx[3]) + "";
    	let t0;
    	let t1;
    	let t2_value = /*posicaoinicial*/ ctx[23](/*mapa1*/ ctx[14]) + "";
    	let t2;
    	let t3;
    	let table;
    	let each_value_2 = /*mapa1*/ ctx[14];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(table, "class", "mapa");
    			add_location(table, file$3, 445, 0, 34405);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*MudançaDeFase*/ 8 && t0_value !== (t0_value = /*time*/ ctx[10](/*MudançaDeFase*/ ctx[3]) + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*mapa1, proximafase, eixoY, eixoX, ResertarPosicao, MudançaDeFase*/ 4214840) {
    				each_value_2 = /*mapa1*/ ctx[14];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(441:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (429:0) {#if !enigma}
    function create_if_block_7$2(ctx) {
    	let p0;
    	let t1;
    	let p1;
    	let t3;
    	let p2;
    	let t5;
    	let p3;
    	let t7;
    	let p4;
    	let t9;
    	let p5;
    	let t11;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			p0.textContent = "Sempre que passar de fase, haverá um enigma a ser solucionado.";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "Lembre-se: Existe um limite de tempo tanto para resolver os enigmas, como para sair de cada labirinto.";
    			t3 = space();
    			p2 = element("p");
    			p2.textContent = "Ao perder em qualquer nível, voltará para o primeiro.";
    			t5 = space();
    			p3 = element("p");
    			p3.textContent = "OBS: Só serão aceitas letras maiúsculas nas respostas de todos os enigmas.";
    			t7 = space();
    			p4 = element("p");
    			p4.textContent = "Nenhuma das palavras-chave contém qualquer acento.";
    			t9 = space();
    			p5 = element("p");
    			p5.textContent = "Após compreender o funcionamento do Minos Labyrinth, digite: \"OK\" e poderá prosseguir para a primeira fase.";
    			t11 = space();
    			input = element("input");
    			attr_dev(p0, "class", "Enigma");
    			add_location(p0, file$3, 431, 0, 33600);
    			attr_dev(p1, "class", "Enigma");
    			add_location(p1, file$3, 432, 0, 33687);
    			attr_dev(p2, "class", "Enigma");
    			add_location(p2, file$3, 433, 0, 33814);
    			attr_dev(p3, "class", "Enigma");
    			add_location(p3, file$3, 434, 0, 33891);
    			attr_dev(p4, "class", "Enigma");
    			add_location(p4, file$3, 435, 0, 33989);
    			attr_dev(p5, "class", "Enigma");
    			add_location(p5, file$3, 436, 0, 34063);
    			attr_dev(input, "placeholder", "APENAS LETRAS MAIUSCULAS");
    			attr_dev(input, "class", "RespostaEnigma");
    			add_location(input, file$3, 437, 0, 34194);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p5, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*PalavraChave*/ ctx[7]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[27]),
    					listen_dev(
    						input,
    						"keydown",
    						function () {
    							if (is_function(/*Alterando*/ ctx[24](/*PalavraChave*/ ctx[7] == "OK"))) /*Alterando*/ ctx[24](/*PalavraChave*/ ctx[7] == "OK").apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*PalavraChave*/ 128 && input.value !== /*PalavraChave*/ ctx[7]) {
    				set_input_value(input, /*PalavraChave*/ ctx[7]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$2.name,
    		type: "if",
    		source: "(429:0) {#if !enigma}",
    		ctx
    	});

    	return block;
    }

    // (460:8) {:else}
    function create_else_block_2(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "saida");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/chaonivel1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			add_location(img, file$3, 460, 27, 35150);
    			attr_dev(th, "id", "MapaGeral");
    			add_location(th, file$3, 460, 8, 35131);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(460:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (458:33) 
    function create_if_block_12$1(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "parede");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredenivel1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			add_location(img, file$3, 458, 27, 35030);
    			attr_dev(th, "id", "MapaGeral");
    			add_location(th, file$3, 458, 8, 35011);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12$1.name,
    		type: "if",
    		source: "(458:33) ",
    		ctx
    	});

    	return block;
    }

    // (456:33) 
    function create_if_block_11$2(ctx) {
    	let th;

    	const block = {
    		c: function create() {
    			th = element("th");
    			attr_dev(th, "class", "MapaGeral");
    			add_location(th, file$3, 456, 8, 34939);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11$2.name,
    		type: "if",
    		source: "(456:33) ",
    		ctx
    	});

    	return block;
    }

    // (454:33) 
    function create_if_block_10$2(ctx) {
    	let th;
    	let img;
    	let img_class_value;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "id", "ChaoNoGeral");
    			attr_dev(img, "class", img_class_value = ClassDante(/*i*/ ctx[40], /*j*/ ctx[43], /*eixoX*/ ctx[4], /*eixoY*/ ctx[5], /*MudançaDeFase*/ ctx[3]));
    			if (!src_url_equal(img.src, img_src_value = IMGmovimentacao(/*i*/ ctx[40], /*j*/ ctx[43], /*eixoX*/ ctx[4], /*eixoY*/ ctx[5], /*MudançaDeFase*/ ctx[3]))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "estrada");
    			add_location(img, file$3, 454, 27, 34746);
    			attr_dev(th, "id", "MapaGeral");
    			add_location(th, file$3, 454, 8, 34727);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*eixoX, eixoY, MudançaDeFase*/ 56 && img_class_value !== (img_class_value = ClassDante(/*i*/ ctx[40], /*j*/ ctx[43], /*eixoX*/ ctx[4], /*eixoY*/ ctx[5], /*MudançaDeFase*/ ctx[3]))) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (dirty[0] & /*eixoX, eixoY, MudançaDeFase*/ 56 && !src_url_equal(img.src, img_src_value = IMGmovimentacao(/*i*/ ctx[40], /*j*/ ctx[43], /*eixoX*/ ctx[4], /*eixoY*/ ctx[5], /*MudançaDeFase*/ ctx[3]))) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10$2.name,
    		type: "if",
    		source: "(454:33) ",
    		ctx
    	});

    	return block;
    }

    // (452:45) 
    function create_if_block_9$2(ctx) {
    	let t_value = /*ResertarPosicao*/ ctx[22]() + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$2.name,
    		type: "if",
    		source: "(452:45) ",
    		ctx
    	});

    	return block;
    }

    // (450:8) {#if (mapa1[eixoY][eixoX] == "Y")}
    function create_if_block_8$2(ctx) {
    	let t_value = /*proximafase*/ ctx[12](/*mapa1*/ ctx[14][/*eixoY*/ ctx[5]][/*eixoX*/ ctx[4]]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*eixoY, eixoX*/ 48 && t_value !== (t_value = /*proximafase*/ ctx[12](/*mapa1*/ ctx[14][/*eixoY*/ ctx[5]][/*eixoX*/ ctx[4]]) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$2.name,
    		type: "if",
    		source: "(450:8) {#if (mapa1[eixoY][eixoX] == \\\"Y\\\")}",
    		ctx
    	});

    	return block;
    }

    // (449:4) {#each regiao as estrada,j}
    function create_each_block_3$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_4(ctx, dirty) {
    		if (/*mapa1*/ ctx[14][/*eixoY*/ ctx[5]][/*eixoX*/ ctx[4]] == "Y") return create_if_block_8$2;
    		if (/*mapa1*/ ctx[14][/*eixoY*/ ctx[5]][/*eixoX*/ ctx[4]] != 0) return create_if_block_9$2;
    		if (/*estrada*/ ctx[41] == 0) return create_if_block_10$2;
    		if (/*estrada*/ ctx[41] == 2) return create_if_block_11$2;
    		if (/*estrada*/ ctx[41] == 1) return create_if_block_12$1;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type_4(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_4(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3$1.name,
    		type: "each",
    		source: "(449:4) {#each regiao as estrada,j}",
    		ctx
    	});

    	return block;
    }

    // (447:4) {#each mapa1 as regiao,i}
    function create_each_block_2$1(ctx) {
    	let tr;
    	let t;
    	let each_value_3 = /*regiao*/ ctx[38];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3$1(get_each_context_3$1(ctx, each_value_3, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(tr, "class", "linhasdatabela");
    			add_location(tr, file$3, 447, 0, 34458);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*proximafase, mapa1, eixoY, eixoX, ResertarPosicao, MudançaDeFase*/ 4214840) {
    				each_value_3 = /*regiao*/ ctx[38];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3$1(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(447:4) {#each mapa1 as regiao,i}",
    		ctx
    	});

    	return block;
    }

    // (415:8) {:else}
    function create_else_block$2(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "saida");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/chaotutorial.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			add_location(img, file$3, 415, 27, 33348);
    			attr_dev(th, "id", "MapaGeral");
    			add_location(th, file$3, 415, 8, 33329);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(415:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (413:33) 
    function create_if_block_5$2(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "parede");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredetutorial.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			add_location(img, file$3, 413, 27, 33226);
    			attr_dev(th, "id", "MapaGeral");
    			add_location(th, file$3, 413, 8, 33207);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$2.name,
    		type: "if",
    		source: "(413:33) ",
    		ctx
    	});

    	return block;
    }

    // (411:33) 
    function create_if_block_4$2(ctx) {
    	let th;

    	const block = {
    		c: function create() {
    			th = element("th");
    			attr_dev(th, "class", "MapaGeral");
    			add_location(th, file$3, 411, 8, 33135);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(411:33) ",
    		ctx
    	});

    	return block;
    }

    // (409:33) 
    function create_if_block_3$3(ctx) {
    	let th;
    	let img;
    	let img_class_value;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "id", "ChaoNoGeral");
    			attr_dev(img, "class", img_class_value = ClassDante(/*i*/ ctx[40], /*j*/ ctx[43], /*eixoX*/ ctx[4], /*eixoY*/ ctx[5], /*MudançaDeFase*/ ctx[3]));
    			if (!src_url_equal(img.src, img_src_value = IMGmovimentacao(/*i*/ ctx[40], /*j*/ ctx[43], /*eixoX*/ ctx[4], /*eixoY*/ ctx[5], /*MudançaDeFase*/ ctx[3]))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "estrada");
    			add_location(img, file$3, 409, 27, 32942);
    			attr_dev(th, "id", "MapaGeral");
    			add_location(th, file$3, 409, 8, 32923);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*eixoX, eixoY, MudançaDeFase*/ 56 && img_class_value !== (img_class_value = ClassDante(/*i*/ ctx[40], /*j*/ ctx[43], /*eixoX*/ ctx[4], /*eixoY*/ ctx[5], /*MudançaDeFase*/ ctx[3]))) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (dirty[0] & /*eixoX, eixoY, MudançaDeFase*/ 56 && !src_url_equal(img.src, img_src_value = IMGmovimentacao(/*i*/ ctx[40], /*j*/ ctx[43], /*eixoX*/ ctx[4], /*eixoY*/ ctx[5], /*MudançaDeFase*/ ctx[3]))) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(409:33) ",
    		ctx
    	});

    	return block;
    }

    // (407:44) 
    function create_if_block_2$3(ctx) {
    	let t_value = /*ResertarPosicao*/ ctx[22]() + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(407:44) ",
    		ctx
    	});

    	return block;
    }

    // (405:8) {#if (mapa[eixoY][eixoX] == "X")}
    function create_if_block_1$3(ctx) {
    	let t_value = /*proximafase*/ ctx[12](/*mapa*/ ctx[13][/*eixoY*/ ctx[5]][/*eixoX*/ ctx[4]]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*eixoY, eixoX*/ 48 && t_value !== (t_value = /*proximafase*/ ctx[12](/*mapa*/ ctx[13][/*eixoY*/ ctx[5]][/*eixoX*/ ctx[4]]) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(405:8) {#if (mapa[eixoY][eixoX] == \\\"X\\\")}",
    		ctx
    	});

    	return block;
    }

    // (404:4) {#each regiao as estrada,j}
    function create_each_block_1$2(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*mapa*/ ctx[13][/*eixoY*/ ctx[5]][/*eixoX*/ ctx[4]] == "X") return create_if_block_1$3;
    		if (/*mapa*/ ctx[13][/*eixoY*/ ctx[5]][/*eixoX*/ ctx[4]] != 0) return create_if_block_2$3;
    		if (/*estrada*/ ctx[41] == 0) return create_if_block_3$3;
    		if (/*estrada*/ ctx[41] == 2) return create_if_block_4$2;
    		if (/*estrada*/ ctx[41] == 1) return create_if_block_5$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(404:4) {#each regiao as estrada,j}",
    		ctx
    	});

    	return block;
    }

    // (402:4) {#each mapa as regiao,i}
    function create_each_block$2(ctx) {
    	let tr;
    	let t;
    	let each_value_1 = /*regiao*/ ctx[38];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(tr, "class", "linhasdatabela");
    			add_location(tr, file$3, 402, 0, 32657);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*proximafase, mapa, eixoY, eixoX, ResertarPosicao, MudançaDeFase*/ 4206648) {
    				each_value_1 = /*regiao*/ ctx[38];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
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
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(402:4) {#each mapa as regiao,i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let head;
    	let link;
    	let t0;
    	let voltarmenu;
    	let t1;
    	let t2;
    	let current_block_type_index;
    	let if_block1;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	voltarmenu = new VoltarMenu({ $$inline: true });
    	let if_block0 = /*key*/ ctx[0] && create_if_block_31$1(ctx);

    	const if_block_creators = [
    		create_if_block$3,
    		create_if_block_6$2,
    		create_if_block_13$1,
    		create_if_block_20$1,
    		create_if_block_27$1
    	];

    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*MudançaDeFase*/ ctx[3] == 9) return 0;
    		if (/*MudançaDeFase*/ ctx[3] == 1) return 1;
    		if (/*MudançaDeFase*/ ctx[3] == 2) return 2;
    		if (/*MudançaDeFase*/ ctx[3] == 0) return 3;
    		if (/*MudançaDeFase*/ ctx[3] == 4) return 4;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			head = element("head");
    			link = element("link");
    			t0 = space();
    			create_component(voltarmenu.$$.fragment);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/css/jogo.css");
    			add_location(link, file$3, 374, 4, 31967);
    			add_location(head, file$3, 373, 0, 31955);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, head, anchor);
    			append_dev(head, link);
    			insert_dev(target, t0, anchor);
    			mount_component(voltarmenu, target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*handleKeydown*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*key*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_31$1(ctx);
    					if_block0.c();
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block1) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block1 = if_blocks[current_block_type_index];

    					if (!if_block1) {
    						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block1.c();
    					} else {
    						if_block1.p(ctx, dirty);
    					}

    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				} else {
    					if_block1 = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(voltarmenu.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(voltarmenu.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(head);
    			if (detaching) detach_dev(t0);
    			destroy_component(voltarmenu, detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t2);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			dispose();
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

    function IMGmovimentacao(i, j, x, y, mapa) {
    	if (y == i && x == j) {
    		return '/css/imagens/Dante.png';
    	}

    	//Chao do mapa:
    	if (mapa == 0) {
    		return '/css/imagens/chaotutorial.png';
    	} else if (mapa == 1) {
    		return '/css/imagens/chaonivel1.png';
    	} else if (mapa == 2) {
    		return '/css/imagens/chaonivel2.png';
    	} else if (mapa == 3) {
    		return '/css/imagens/chaonivel3.png';
    	} else {
    		return '/csss/imagens/chaonivel3.png';
    	}
    }

    function ClassDante(i, j, x, y, mapa) {
    	if (x == j && y == i) {
    		if (mapa == 0) {
    			return 'Dante0';
    		} else if (mapa == 1) {
    			return 'Dante1';
    		} else if (mapa == 2) {
    			return 'Dante2';
    		} else if (mapa == 3) {
    			return 'Dante3';
    		} else {
    			return 'Dante3';
    		}
    	} else {
    		if (mapa == 0) {
    			return 'passagem0';
    		} else if (mapa == 1) {
    			return 'passagem1';
    		} else if (mapa == 2) {
    			return 'passagem2';
    		} else if (mapa == 3) {
    			return 'passagem3';
    		} else {
    			return 'passagem3';
    		}
    	}
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Jogo', slots, []);
    	let key;
    	let code;

    	function handleKeydown(event) {
    		$$invalidate(0, key = event.key);
    		$$invalidate(1, code = event.code);
    	} /*
        function movimentacao(){
            if(key){
                switch (code){
                    case "ArrowUp":
                        eixoY--
                        break
                    case "ArrowDown":
                        eixoY++
                        break
                    case "ArrowLeft":
                        eixoX--
                        break
                    case "ArrowRight":
                        break
                }
            }
        }*/

    	var temporizador;

    	function time(nivel) {
    		temporizador = setInterval(
    			() => {
    				alert('Seu tempo acabou');

    				if (nivel == 1) {
    					$$invalidate(3, MudançaDeFase = 0);
    				} else {
    					$$invalidate(3, MudançaDeFase = 1);
    				}
    			},
    			99999999999999
    		);
    	}

    	var NewTempo;

    	function EnigmaTime(nivel) {
    		$$invalidate(2, NewTempo = setInterval(
    			() => {
    				alert('seu tempo acabou');

    				if (nivel == 2) {
    					$$invalidate(3, MudançaDeFase = 1);
    				} else if (nivel == 3) {
    					$$invalidate(3, MudançaDeFase = 2);
    				} else if (nivel == 4) {
    					$$invalidate(3, MudançaDeFase = 3);
    				}
    			},
    			9999999999999
    		));
    	}

    	let MudançaDeFase = 0;

    	function proximafase(teste) {
    		clearInterval(temporizador);
    		$$invalidate(6, enigma = false);

    		if (teste == "V") {
    			$$invalidate(3, MudançaDeFase = 4);
    		} else if (teste == "X") {
    			$$invalidate(3, MudançaDeFase = 1);
    		} else if (teste == "Y") {
    			$$invalidate(3, MudançaDeFase = 2);
    		} else if (teste == "Z") {
    			$$invalidate(3, MudançaDeFase = 3);
    		} else if (teste == "C") {
    			$$invalidate(3, MudançaDeFase = 5);
    		}
    	}

    	function resertar() {
    		$$invalidate(3, MudançaDeFase = 0);
    	}

    	//mapa:
    	let mapa = [
    		[
    			2,
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			2,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			"X"
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		]
    	];

    	let mapa1 = [
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			"Y",
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2
    		]
    	];

    	let mapa2 = [
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			"Z",
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2
    		]
    	];

    	let mapa3 = [
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			"V",
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		]
    	];

    	let mapa4 = [
    		[
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		][("C")],
    		[
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		]
    	];

    	//variaveis de movimentação:
    	let eixoX = 0;

    	let eixoY = 0;
    	let x = eixoX;
    	let y = eixoY;

    	//incrementação e decrementação
    	function incremetarX() {
    		x = eixoX;
    		y = eixoY;
    		$$invalidate(4, eixoX++, eixoX);
    		$$invalidate(1, code = "d");
    	}

    	function incremetarY() {
    		x = eixoX;
    		y = eixoY;
    		$$invalidate(5, eixoY++, eixoY);
    		$$invalidate(1, code = "w");
    	}

    	function decrementarX() {
    		x = eixoX;
    		y = eixoY;
    		$$invalidate(4, eixoX--, eixoX);
    		$$invalidate(1, code = "a");
    	}

    	function decrementarY() {
    		x = eixoX;
    		y = eixoY;
    		$$invalidate(5, eixoY--, eixoY);
    		$$invalidate(1, code = "s");
    	}

    	//caso o jogador acerte uma parede podera voltar para sua posição anterior
    	function ResertarPosicao() {
    		$$invalidate(4, eixoX = x);
    		$$invalidate(5, eixoY = y);
    	}

    	//gerando posição inicial do jogador
    	function posicaoinicial(mapa) {
    		for (let i in mapa) {
    			for (let j in mapa[i]) {
    				if (mapa[i][j] == 0) {
    					$$invalidate(4, eixoX = j);
    					$$invalidate(5, eixoY = i);
    					return;
    				}
    			}
    		}
    	}

    	//registro ainda sem utilização
    	class personagem {
    		constructor(body, moves) {
    			this.body = body;
    			this.moves = moves;
    		}
    	}

    	let enigma = false;
    	let PalavraChave = '';

    	function Alterando(teste) {
    		if (teste) {
    			$$invalidate(6, enigma = teste);
    			$$invalidate(7, PalavraChave = '');
    		} else {
    			$$invalidate(6, enigma = teste);
    		}

    		return enigma;
    	}

    	let ContadorDoLabirinto = 90;
    	let ContadorDoEnigma = 60;
    	let contador;

    	function contar(tempo) {
    		if (tempo == 90) {
    			contador = setInterval(
    				() => {
    					return $$invalidate(8, ContadorDoLabirinto -= 1);
    				},
    				1000
    			);
    		} else {
    			contador = setInterval(
    				() => {
    					return ContadorDoEnigma -= 1;
    				},
    				1000
    			);
    		}
    	}

    	function ResertarContadores() {
    		clearInterval(contador);
    		ContadorDoEnigma = 60;
    		$$invalidate(8, ContadorDoLabirinto = 90);
    		return;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Jogo> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		PalavraChave = this.value;
    		$$invalidate(7, PalavraChave);
    	}

    	function input_input_handler_1() {
    		PalavraChave = this.value;
    		$$invalidate(7, PalavraChave);
    	}

    	function input_input_handler_2() {
    		PalavraChave = this.value;
    		$$invalidate(7, PalavraChave);
    	}

    	function input_input_handler_3() {
    		PalavraChave = this.value;
    		$$invalidate(7, PalavraChave);
    	}

    	$$self.$capture_state = () => ({
    		Vitoria,
    		estado,
    		trocarEstadoDoJogo,
    		VoltarMenu,
    		each,
    		element,
    		key,
    		code,
    		handleKeydown,
    		temporizador,
    		time,
    		NewTempo,
    		EnigmaTime,
    		MudançaDeFase,
    		proximafase,
    		resertar,
    		mapa,
    		mapa1,
    		mapa2,
    		mapa3,
    		mapa4,
    		eixoX,
    		eixoY,
    		x,
    		y,
    		incremetarX,
    		incremetarY,
    		decrementarX,
    		decrementarY,
    		ResertarPosicao,
    		IMGmovimentacao,
    		ClassDante,
    		posicaoinicial,
    		personagem,
    		enigma,
    		PalavraChave,
    		Alterando,
    		ContadorDoLabirinto,
    		ContadorDoEnigma,
    		contador,
    		contar,
    		ResertarContadores
    	});

    	$$self.$inject_state = $$props => {
    		if ('key' in $$props) $$invalidate(0, key = $$props.key);
    		if ('code' in $$props) $$invalidate(1, code = $$props.code);
    		if ('temporizador' in $$props) temporizador = $$props.temporizador;
    		if ('NewTempo' in $$props) $$invalidate(2, NewTempo = $$props.NewTempo);
    		if ('MudançaDeFase' in $$props) $$invalidate(3, MudançaDeFase = $$props.MudançaDeFase);
    		if ('mapa' in $$props) $$invalidate(13, mapa = $$props.mapa);
    		if ('mapa1' in $$props) $$invalidate(14, mapa1 = $$props.mapa1);
    		if ('mapa2' in $$props) $$invalidate(15, mapa2 = $$props.mapa2);
    		if ('mapa3' in $$props) $$invalidate(16, mapa3 = $$props.mapa3);
    		if ('mapa4' in $$props) $$invalidate(17, mapa4 = $$props.mapa4);
    		if ('eixoX' in $$props) $$invalidate(4, eixoX = $$props.eixoX);
    		if ('eixoY' in $$props) $$invalidate(5, eixoY = $$props.eixoY);
    		if ('x' in $$props) x = $$props.x;
    		if ('y' in $$props) y = $$props.y;
    		if ('enigma' in $$props) $$invalidate(6, enigma = $$props.enigma);
    		if ('PalavraChave' in $$props) $$invalidate(7, PalavraChave = $$props.PalavraChave);
    		if ('ContadorDoLabirinto' in $$props) $$invalidate(8, ContadorDoLabirinto = $$props.ContadorDoLabirinto);
    		if ('ContadorDoEnigma' in $$props) ContadorDoEnigma = $$props.ContadorDoEnigma;
    		if ('contador' in $$props) contador = $$props.contador;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		key,
    		code,
    		NewTempo,
    		MudançaDeFase,
    		eixoX,
    		eixoY,
    		enigma,
    		PalavraChave,
    		ContadorDoLabirinto,
    		handleKeydown,
    		time,
    		EnigmaTime,
    		proximafase,
    		mapa,
    		mapa1,
    		mapa2,
    		mapa3,
    		mapa4,
    		incremetarX,
    		incremetarY,
    		decrementarX,
    		decrementarY,
    		ResertarPosicao,
    		posicaoinicial,
    		Alterando,
    		contar,
    		ResertarContadores,
    		input_input_handler,
    		input_input_handler_1,
    		input_input_handler_2,
    		input_input_handler_3
    	];
    }

    class Jogo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Jogo",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\teste.svelte generated by Svelte v3.53.1 */
    const file$2 = "src\\teste.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[20] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    // (172:0) {#if (key)}
    function create_if_block_7$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*code*/ ctx[1] == "ArrowUp") return create_if_block_8$1;
    		if (/*code*/ ctx[1] == "ArrowDown") return create_if_block_9$1;
    		if (/*code*/ ctx[1] == "ArrowLeft") return create_if_block_10$1;
    		if (/*code*/ ctx[1] == "ArrowRight") return create_if_block_11$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(172:0) {#if (key)}",
    		ctx
    	});

    	return block;
    }

    // (179:45) 
    function create_if_block_11$1(ctx) {
    	let t0_value = /*incremetarX*/ ctx[10]() + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" para direita");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11$1.name,
    		type: "if",
    		source: "(179:45) ",
    		ctx
    	});

    	return block;
    }

    // (177:44) 
    function create_if_block_10$1(ctx) {
    	let t0_value = /*decrementarX*/ ctx[12]() + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text("    para esquerda");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10$1.name,
    		type: "if",
    		source: "(177:44) ",
    		ctx
    	});

    	return block;
    }

    // (175:44) 
    function create_if_block_9$1(ctx) {
    	let t0_value = /*incremetarY*/ ctx[11]() + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" para baixo");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$1.name,
    		type: "if",
    		source: "(175:44) ",
    		ctx
    	});

    	return block;
    }

    // (173:12) {#if (code == "ArrowUp")}
    function create_if_block_8$1(ctx) {
    	let t0_value = /*decrementarY*/ ctx[13]() + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" para cima");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$1.name,
    		type: "if",
    		source: "(173:12) {#if (code == \\\"ArrowUp\\\")}",
    		ctx
    	});

    	return block;
    }

    // (192:1) {:else}
    function create_else_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Focus this window and press any key";
    			add_location(p, file$2, 192, 2, 18082);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(192:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (185:1) {#if key}
    function create_if_block_5$1(ctx) {
    	let kbd;
    	let t0_value = (/*key*/ ctx[0] === ' ' ? 'Space' : /*key*/ ctx[0]) + "";
    	let t0;
    	let t1;
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*code*/ ctx[1] == "ArrowUp") return create_if_block_6$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			kbd = element("kbd");
    			t0 = text(t0_value);
    			t1 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			add_location(kbd, file$2, 185, 2, 17915);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, kbd, anchor);
    			append_dev(kbd, t0);
    			insert_dev(target, t1, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*key*/ 1 && t0_value !== (t0_value = (/*key*/ ctx[0] === ' ' ? 'Space' : /*key*/ ctx[0]) + "")) set_data_dev(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(kbd);
    			if (detaching) detach_dev(t1);
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(185:1) {#if key}",
    		ctx
    	});

    	return block;
    }

    // (189:8) {:else}
    function create_else_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "nao funciono";
    			add_location(p, file$2, 189, 8, 18034);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(189:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (187:8) {#if (code == "ArrowUp")}
    function create_if_block_6$1(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*code*/ ctx[1]);
    			add_location(p, file$2, 187, 2, 17994);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*code*/ 2) set_data_dev(t, /*code*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(187:8) {#if (code == \\\"ArrowUp\\\")}",
    		ctx
    	});

    	return block;
    }

    // (200:1) {#if (LimiteY <= i && LimiteY + (Dimensionamento * 2) >= i)}
    function create_if_block$2(ctx) {
    	let tr;
    	let t;
    	let each_value_1 = /*linhas*/ ctx[18];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			add_location(tr, file$2, 200, 3, 18281);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*mapa, LimiteX, Dimensionamento*/ 324) {
    				each_value_1 = /*linhas*/ ctx[18];
    				validate_each_argument(each_value_1);
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
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(200:1) {#if (LimiteY <= i && LimiteY + (Dimensionamento * 2) >= i)}",
    		ctx
    	});

    	return block;
    }

    // (203:5) {#if (LimiteX <= j && LimiteX + (Dimensionamento * 2) >= j)}
    function create_if_block_1$2(ctx) {
    	let if_block_anchor;

    	function select_block_type_3(ctx, dirty) {
    		if (/*elementos*/ ctx[21] == 0) return create_if_block_2$2;
    		if (/*elementos*/ ctx[21] == 1) return create_if_block_3$2;
    		if (/*elementos*/ ctx[21] == "P") return create_if_block_4$1;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_3(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(203:5) {#if (LimiteX <= j && LimiteX + (Dimensionamento * 2) >= j)}",
    		ctx
    	});

    	return block;
    }

    // (208:35) 
    function create_if_block_4$1(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/soacabecinha.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "jow");
    			attr_dev(img, "class", "svelte-kf5ld7");
    			add_location(img, file$2, 208, 12, 18640);
    			add_location(th, file$2, 208, 8, 18636);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(208:35) ",
    		ctx
    	});

    	return block;
    }

    // (206:33) 
    function create_if_block_3$2(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredenivel3.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "ola");
    			attr_dev(img, "class", "svelte-kf5ld7");
    			add_location(img, file$2, 206, 12, 18533);
    			add_location(th, file$2, 206, 8, 18529);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(206:33) ",
    		ctx
    	});

    	return block;
    }

    // (204:7) {#if elementos == 0}
    function create_if_block_2$2(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/chaonivel3.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "opa");
    			attr_dev(img, "class", "svelte-kf5ld7");
    			add_location(img, file$2, 204, 12, 18430);
    			add_location(th, file$2, 204, 8, 18426);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(204:7) {#if elementos == 0}",
    		ctx
    	});

    	return block;
    }

    // (202:4) {#each linhas as elementos,j}
    function create_each_block_1$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*LimiteX*/ ctx[6] <= /*j*/ ctx[23] && /*LimiteX*/ ctx[6] + /*Dimensionamento*/ ctx[8] * 2 >= /*j*/ ctx[23] && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*LimiteX*/ ctx[6] <= /*j*/ ctx[23] && /*LimiteX*/ ctx[6] + /*Dimensionamento*/ ctx[8] * 2 >= /*j*/ ctx[23]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(202:4) {#each linhas as elementos,j}",
    		ctx
    	});

    	return block;
    }

    // (199:0) {#each mapa as linhas,i}
    function create_each_block$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*LimiteY*/ ctx[5] <= /*i*/ ctx[20] && /*LimiteY*/ ctx[5] + /*Dimensionamento*/ ctx[8] * 2 >= /*i*/ ctx[20] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*LimiteY*/ ctx[5] <= /*i*/ ctx[20] && /*LimiteY*/ ctx[5] + /*Dimensionamento*/ ctx[8] * 2 >= /*i*/ ctx[20]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(199:0) {#each mapa as linhas,i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t0;
    	let div;
    	let t1;
    	let t2_value = /*posicaoinicial*/ ctx[9]() + "";
    	let t2;
    	let t3;
    	let p;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let each_1_anchor;
    	let mounted;
    	let dispose;
    	let if_block0 = /*key*/ ctx[0] && create_if_block_7$1(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*key*/ ctx[0]) return create_if_block_5$1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block1 = current_block_type(ctx);
    	let each_value = /*mapa*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div = element("div");
    			if_block1.c();
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			p = element("p");
    			t4 = text(/*eixoX*/ ctx[3]);
    			t5 = text(", ");
    			t6 = text(/*eixoY*/ ctx[4]);
    			t7 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			set_style(div, "text-align", "center");
    			add_location(div, file$2, 183, 0, 17867);
    			add_location(p, file$2, 197, 0, 18164);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			if_block1.m(div, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(p, t6);
    			insert_dev(target, t7, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*handleKeydown*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*key*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_7$1(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			}

    			if (dirty & /*eixoX*/ 8) set_data_dev(t4, /*eixoX*/ ctx[3]);
    			if (dirty & /*eixoY*/ 16) set_data_dev(t6, /*eixoY*/ ctx[4]);

    			if (dirty & /*mapa, LimiteX, Dimensionamento, LimiteY*/ 356) {
    				each_value = /*mapa*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
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
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			if_block1.d();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t7);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Teste', slots, []);
    	let key;
    	let code;

    	function handleKeydown(event) {
    		$$invalidate(0, key = event.key);
    		$$invalidate(1, code = event.code);
    	}

    	let mapa = [
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		]
    	];

    	let eixoX = 0;
    	let eixoY = 0;
    	let y = 0;
    	let x = 0;
    	let LimiteY = 0;
    	let LimiteX = 0;
    	let Dimensionamento = 8;

    	function RenderizaçãoDoMapa() {
    		for (let i in mapa) {
    			for (let j in mapa[i]) {
    				if (mapa[i][j] == "P") {
    					$$invalidate(5, LimiteY = i - Dimensionamento);
    					$$invalidate(6, LimiteX = j - Dimensionamento);
    					return;
    				}
    			}
    		}
    	}

    	RenderizaçãoDoMapa();

    	function posicaoinicial() {
    		for (let i in mapa) {
    			for (let j in mapa[i]) {
    				if (mapa[i][j] == 0) {
    					$$invalidate(4, eixoY = i);
    					$$invalidate(3, eixoX = j);
    					$$invalidate(2, mapa[i][j] = "P", mapa);
    					return;
    				}
    			}
    		}
    	}

    	function incremetarX() {
    		x = eixoX;
    		y = eixoY;
    		$$invalidate(3, eixoX++, eixoX);

    		if (mapa[eixoY][eixoX] == 1) {
    			ResertarPosicao();
    			return;
    		}

    		$$invalidate(2, mapa[eixoY][eixoX] = "P", mapa);
    		$$invalidate(2, mapa[y][x] = 0, mapa);
    		RenderizaçãoDoMapa();
    		$$invalidate(1, code = "d");
    	}

    	function incremetarY() {
    		x = eixoX;
    		y = eixoY;
    		$$invalidate(4, eixoY++, eixoY);

    		if (mapa[eixoY][eixoX] == 1) {
    			ResertarPosicao();
    			return;
    		}

    		$$invalidate(2, mapa[eixoY][eixoX] = "P", mapa);
    		$$invalidate(2, mapa[y][x] = 0, mapa);
    		RenderizaçãoDoMapa();
    		$$invalidate(1, code = "w");
    	}

    	function decrementarX() {
    		x = eixoX;
    		y = eixoY;
    		$$invalidate(3, eixoX--, eixoX);

    		if (mapa[eixoY][eixoX] == 1) {
    			ResertarPosicao();
    			return;
    		}

    		$$invalidate(2, mapa[eixoY][eixoX] = "P", mapa);
    		$$invalidate(2, mapa[y][x] = 0, mapa);
    		RenderizaçãoDoMapa();
    		$$invalidate(1, code = "a");
    	}

    	function decrementarY() {
    		x = eixoX;
    		y = eixoY;
    		$$invalidate(4, eixoY--, eixoY);

    		if (mapa[eixoY][eixoX] == 1) {
    			ResertarPosicao();
    			return;
    		}

    		$$invalidate(2, mapa[eixoY][eixoX] = "P", mapa);
    		$$invalidate(2, mapa[y][x] = 0, mapa);
    		RenderizaçãoDoMapa();
    		$$invalidate(1, code = "s");
    	}

    	function ResertarPosicao() {
    		$$invalidate(3, eixoX = x);
    		$$invalidate(4, eixoY = y);
    		$$invalidate(2, mapa[eixoY][eixoX] = "P", mapa);
    		RenderizaçãoDoMapa();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Teste> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		each,
    		key,
    		code,
    		handleKeydown,
    		mapa,
    		eixoX,
    		eixoY,
    		y,
    		x,
    		LimiteY,
    		LimiteX,
    		Dimensionamento,
    		RenderizaçãoDoMapa,
    		posicaoinicial,
    		incremetarX,
    		incremetarY,
    		decrementarX,
    		decrementarY,
    		ResertarPosicao
    	});

    	$$self.$inject_state = $$props => {
    		if ('key' in $$props) $$invalidate(0, key = $$props.key);
    		if ('code' in $$props) $$invalidate(1, code = $$props.code);
    		if ('mapa' in $$props) $$invalidate(2, mapa = $$props.mapa);
    		if ('eixoX' in $$props) $$invalidate(3, eixoX = $$props.eixoX);
    		if ('eixoY' in $$props) $$invalidate(4, eixoY = $$props.eixoY);
    		if ('y' in $$props) y = $$props.y;
    		if ('x' in $$props) x = $$props.x;
    		if ('LimiteY' in $$props) $$invalidate(5, LimiteY = $$props.LimiteY);
    		if ('LimiteX' in $$props) $$invalidate(6, LimiteX = $$props.LimiteX);
    		if ('Dimensionamento' in $$props) $$invalidate(8, Dimensionamento = $$props.Dimensionamento);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		key,
    		code,
    		mapa,
    		eixoX,
    		eixoY,
    		LimiteY,
    		LimiteX,
    		handleKeydown,
    		Dimensionamento,
    		posicaoinicial,
    		incremetarX,
    		incremetarY,
    		decrementarX,
    		decrementarY
    	];
    }

    class Teste extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Teste",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\newjogo.svelte generated by Svelte v3.53.1 */

    const file$1 = "src\\newjogo.svelte";

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	child_ctx[30] = i;
    	return child_ctx;
    }

    function get_each_context_7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	child_ctx[33] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	child_ctx[30] = i;
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	child_ctx[33] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	child_ctx[30] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	child_ctx[33] = i;
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	child_ctx[30] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	child_ctx[33] = i;
    	return child_ctx;
    }

    // (470:0) {#if (key)}
    function create_if_block_30(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*code*/ ctx[1] == "ArrowUp") return create_if_block_31;
    		if (/*code*/ ctx[1] == "ArrowDown") return create_if_block_32;
    		if (/*code*/ ctx[1] == "ArrowLeft") return create_if_block_33;
    		if (/*code*/ ctx[1] == "ArrowRight") return create_if_block_34;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_30.name,
    		type: "if",
    		source: "(470:0) {#if (key)}",
    		ctx
    	});

    	return block;
    }

    // (477:41) 
    function create_if_block_34(ctx) {
    	let t_value = /*IncremetarX*/ ctx[17]() + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_34.name,
    		type: "if",
    		source: "(477:41) ",
    		ctx
    	});

    	return block;
    }

    // (475:40) 
    function create_if_block_33(ctx) {
    	let t_value = /*DecrementarX*/ ctx[18]() + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_33.name,
    		type: "if",
    		source: "(475:40) ",
    		ctx
    	});

    	return block;
    }

    // (473:40) 
    function create_if_block_32(ctx) {
    	let t_value = /*IncremetarY*/ ctx[19]() + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_32.name,
    		type: "if",
    		source: "(473:40) ",
    		ctx
    	});

    	return block;
    }

    // (471:8) {#if (code == "ArrowUp")}
    function create_if_block_31(ctx) {
    	let t_value = /*DecrementarY*/ ctx[20]() + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_31.name,
    		type: "if",
    		source: "(471:8) {#if (code == \\\"ArrowUp\\\")}",
    		ctx
    	});

    	return block;
    }

    // (585:41) 
    function create_if_block_29(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "vc venceu";
    			add_location(h1, file$1, 585, 4, 41372);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_29.name,
    		type: "if",
    		source: "(585:41) ",
    		ctx
    	});

    	return block;
    }

    // (562:40) 
    function create_if_block_22(ctx) {
    	let t0_value = /*RenderizandoMapa*/ ctx[15]() + "";
    	let t0;
    	let t1;
    	let t2_value = /*DeterminandoEixos*/ ctx[16](/*MudandoDeFase*/ ctx[10]) + "";
    	let t2;
    	let t3;
    	let p;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let each_1_anchor;
    	let each_value_6 = /*mapa3*/ ctx[5];
    	validate_each_argument(each_value_6);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			p = element("p");
    			t4 = text(/*EixoX*/ ctx[8]);
    			t5 = text(",");
    			t6 = text(/*EixoY*/ ctx[9]);
    			t7 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			add_location(p, file$1, 564, 4, 40378);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(p, t6);
    			insert_dev(target, t7, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*MudandoDeFase*/ 1024 && t2_value !== (t2_value = /*DeterminandoEixos*/ ctx[16](/*MudandoDeFase*/ ctx[10]) + "")) set_data_dev(t2, t2_value);
    			if (dirty[0] & /*EixoX*/ 256) set_data_dev(t4, /*EixoX*/ ctx[8]);
    			if (dirty[0] & /*EixoY*/ 512) set_data_dev(t6, /*EixoY*/ ctx[9]);

    			if (dirty[0] & /*mapa3, LimiteX, Dimensionamento, LimiteY*/ 16608) {
    				each_value_6 = /*mapa3*/ ctx[5];
    				validate_each_argument(each_value_6);
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6(ctx, each_value_6, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_6.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t7);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_22.name,
    		type: "if",
    		source: "(562:40) ",
    		ctx
    	});

    	return block;
    }

    // (540:40) 
    function create_if_block_15(ctx) {
    	let t0_value = /*RenderizandoMapa*/ ctx[15]() + "";
    	let t0;
    	let t1;
    	let t2_value = /*DeterminandoEixos*/ ctx[16](/*MudandoDeFase*/ ctx[10]) + "";
    	let t2;
    	let t3;
    	let each_1_anchor;
    	let each_value_4 = /*mapa2*/ ctx[4];
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*MudandoDeFase*/ 1024 && t2_value !== (t2_value = /*DeterminandoEixos*/ ctx[16](/*MudandoDeFase*/ ctx[10]) + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*mapa2, LimiteX, Dimensionamento, LimiteY*/ 16592) {
    				each_value_4 = /*mapa2*/ ctx[4];
    				validate_each_argument(each_value_4);
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
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(540:40) ",
    		ctx
    	});

    	return block;
    }

    // (518:40) 
    function create_if_block_8(ctx) {
    	let t0_value = /*RenderizandoMapa*/ ctx[15]() + "";
    	let t0;
    	let t1;
    	let t2_value = /*DeterminandoEixos*/ ctx[16](/*MudandoDeFase*/ ctx[10]) + "";
    	let t2;
    	let t3;
    	let each_1_anchor;
    	let each_value_2 = /*mapa1*/ ctx[3];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*MudandoDeFase*/ 1024 && t2_value !== (t2_value = /*DeterminandoEixos*/ ctx[16](/*MudandoDeFase*/ ctx[10]) + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*mapa1, LimiteX, Dimensionamento, LimiteY*/ 16584) {
    				each_value_2 = /*mapa1*/ ctx[3];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(518:40) ",
    		ctx
    	});

    	return block;
    }

    // (481:0) {#if MudandoDeFase == "tutorial"}
    function create_if_block$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (!/*enigma*/ ctx[11]) return create_if_block_1$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(481:0) {#if MudandoDeFase == \\\"tutorial\\\"}",
    		ctx
    	});

    	return block;
    }

    // (567:8) {#if LimiteY <= i && LimiteY + (Dimensionamento * 2) >= i}
    function create_if_block_23(ctx) {
    	let tr;
    	let t;
    	let each_value_7 = /*linhas*/ ctx[28];
    	validate_each_argument(each_value_7);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_7.length; i += 1) {
    		each_blocks[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			add_location(tr, file$1, 567, 12, 40517);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*mapa3, LimiteX, Dimensionamento*/ 16480) {
    				each_value_7 = /*linhas*/ ctx[28];
    				validate_each_argument(each_value_7);
    				let i;

    				for (i = 0; i < each_value_7.length; i += 1) {
    					const child_ctx = get_each_context_7(ctx, each_value_7, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_7.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_23.name,
    		type: "if",
    		source: "(567:8) {#if LimiteY <= i && LimiteY + (Dimensionamento * 2) >= i}",
    		ctx
    	});

    	return block;
    }

    // (570:16) {#if LimiteX <= j && LimiteX + (Dimensionamento * 2) >= j}
    function create_if_block_24(ctx) {
    	let if_block_anchor;

    	function select_block_type_6(ctx, dirty) {
    		if (/*elementos*/ ctx[31] == 0) return create_if_block_25;
    		if (/*elementos*/ ctx[31] == 1) return create_if_block_26;
    		if (/*elementos*/ ctx[31] == "V") return create_if_block_27;
    		if (/*elementos*/ ctx[31] == "DANTE") return create_if_block_28;
    	}

    	let current_block_type = select_block_type_6(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_6(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_24.name,
    		type: "if",
    		source: "(570:16) {#if LimiteX <= j && LimiteX + (Dimensionamento * 2) >= j}",
    		ctx
    	});

    	return block;
    }

    // (577:51) 
    function create_if_block_28(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/soacabecinha.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "personagem");
    			attr_dev(img, "class", "svelte-133fi3v");
    			add_location(img, file$1, 577, 28, 41126);
    			add_location(th, file$1, 577, 24, 41122);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_28.name,
    		type: "if",
    		source: "(577:51) ",
    		ctx
    	});

    	return block;
    }

    // (575:47) 
    function create_if_block_27(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/saidanivel3.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "saida");
    			attr_dev(img, "class", "svelte-133fi3v");
    			add_location(img, file$1, 575, 28, 40986);
    			add_location(th, file$1, 575, 24, 40982);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_27.name,
    		type: "if",
    		source: "(575:47) ",
    		ctx
    	});

    	return block;
    }

    // (573:45) 
    function create_if_block_26(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredenivel3.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			attr_dev(img, "class", "svelte-133fi3v");
    			add_location(img, file$1, 573, 28, 40848);
    			add_location(th, file$1, 573, 24, 40844);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_26.name,
    		type: "if",
    		source: "(573:45) ",
    		ctx
    	});

    	return block;
    }

    // (571:20) {#if elementos == 0}
    function create_if_block_25(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/chaonivel3.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "chao");
    			attr_dev(img, "class", "svelte-133fi3v");
    			add_location(img, file$1, 571, 28, 40716);
    			add_location(th, file$1, 571, 24, 40712);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_25.name,
    		type: "if",
    		source: "(571:20) {#if elementos == 0}",
    		ctx
    	});

    	return block;
    }

    // (569:16) {#each linhas as elementos,j}
    function create_each_block_7(ctx) {
    	let if_block_anchor;
    	let if_block = /*LimiteX*/ ctx[6] <= /*j*/ ctx[33] && /*LimiteX*/ ctx[6] + /*Dimensionamento*/ ctx[14] * 2 >= /*j*/ ctx[33] && create_if_block_24(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*LimiteX*/ ctx[6] <= /*j*/ ctx[33] && /*LimiteX*/ ctx[6] + /*Dimensionamento*/ ctx[14] * 2 >= /*j*/ ctx[33]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_24(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_7.name,
    		type: "each",
    		source: "(569:16) {#each linhas as elementos,j}",
    		ctx
    	});

    	return block;
    }

    // (566:8) {#each mapa3 as linhas,i}
    function create_each_block_6(ctx) {
    	let if_block_anchor;
    	let if_block = /*LimiteY*/ ctx[7] <= /*i*/ ctx[30] && /*LimiteY*/ ctx[7] + /*Dimensionamento*/ ctx[14] * 2 >= /*i*/ ctx[30] && create_if_block_23(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*LimiteY*/ ctx[7] <= /*i*/ ctx[30] && /*LimiteY*/ ctx[7] + /*Dimensionamento*/ ctx[14] * 2 >= /*i*/ ctx[30]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_23(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(566:8) {#each mapa3 as linhas,i}",
    		ctx
    	});

    	return block;
    }

    // (544:8) {#if LimiteY <= i && LimiteY + (Dimensionamento * 2) >= i}
    function create_if_block_16(ctx) {
    	let tr;
    	let t;
    	let each_value_5 = /*linhas*/ ctx[28];
    	validate_each_argument(each_value_5);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			add_location(tr, file$1, 544, 12, 39462);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*mapa2, LimiteX, Dimensionamento*/ 16464) {
    				each_value_5 = /*linhas*/ ctx[28];
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_5.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(544:8) {#if LimiteY <= i && LimiteY + (Dimensionamento * 2) >= i}",
    		ctx
    	});

    	return block;
    }

    // (547:16) {#if LimiteX <= j && LimiteX + (Dimensionamento * 2) >= j}
    function create_if_block_17(ctx) {
    	let if_block_anchor;

    	function select_block_type_5(ctx, dirty) {
    		if (/*elementos*/ ctx[31] == 0) return create_if_block_18;
    		if (/*elementos*/ ctx[31] == 1) return create_if_block_19;
    		if (/*elementos*/ ctx[31] == "Z") return create_if_block_20;
    		if (/*elementos*/ ctx[31] == "DANTE") return create_if_block_21;
    	}

    	let current_block_type = select_block_type_5(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_5(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(547:16) {#if LimiteX <= j && LimiteX + (Dimensionamento * 2) >= j}",
    		ctx
    	});

    	return block;
    }

    // (554:51) 
    function create_if_block_21(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/soacabecinha.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "personagem");
    			attr_dev(img, "class", "svelte-133fi3v");
    			add_location(img, file$1, 554, 28, 40071);
    			add_location(th, file$1, 554, 24, 40067);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_21.name,
    		type: "if",
    		source: "(554:51) ",
    		ctx
    	});

    	return block;
    }

    // (552:47) 
    function create_if_block_20(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/saidanivel3.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "saida");
    			attr_dev(img, "class", "svelte-133fi3v");
    			add_location(img, file$1, 552, 28, 39931);
    			add_location(th, file$1, 552, 24, 39927);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_20.name,
    		type: "if",
    		source: "(552:47) ",
    		ctx
    	});

    	return block;
    }

    // (550:45) 
    function create_if_block_19(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredenivel2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			attr_dev(img, "class", "svelte-133fi3v");
    			add_location(img, file$1, 550, 28, 39793);
    			add_location(th, file$1, 550, 24, 39789);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19.name,
    		type: "if",
    		source: "(550:45) ",
    		ctx
    	});

    	return block;
    }

    // (548:20) {#if elementos == 0}
    function create_if_block_18(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/chaonivel2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "chao");
    			attr_dev(img, "class", "svelte-133fi3v");
    			add_location(img, file$1, 548, 28, 39661);
    			add_location(th, file$1, 548, 24, 39657);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(548:20) {#if elementos == 0}",
    		ctx
    	});

    	return block;
    }

    // (546:16) {#each linhas as elementos,j}
    function create_each_block_5(ctx) {
    	let if_block_anchor;
    	let if_block = /*LimiteX*/ ctx[6] <= /*j*/ ctx[33] && /*LimiteX*/ ctx[6] + /*Dimensionamento*/ ctx[14] * 2 >= /*j*/ ctx[33] && create_if_block_17(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*LimiteX*/ ctx[6] <= /*j*/ ctx[33] && /*LimiteX*/ ctx[6] + /*Dimensionamento*/ ctx[14] * 2 >= /*j*/ ctx[33]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_17(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(546:16) {#each linhas as elementos,j}",
    		ctx
    	});

    	return block;
    }

    // (543:8) {#each mapa2 as linhas,i}
    function create_each_block_4(ctx) {
    	let if_block_anchor;
    	let if_block = /*LimiteY*/ ctx[7] <= /*i*/ ctx[30] && /*LimiteY*/ ctx[7] + /*Dimensionamento*/ ctx[14] * 2 >= /*i*/ ctx[30] && create_if_block_16(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*LimiteY*/ ctx[7] <= /*i*/ ctx[30] && /*LimiteY*/ ctx[7] + /*Dimensionamento*/ ctx[14] * 2 >= /*i*/ ctx[30]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_16(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(543:8) {#each mapa2 as linhas,i}",
    		ctx
    	});

    	return block;
    }

    // (522:8) {#if LimiteY <= i && LimiteY + (Dimensionamento * 2) >= i}
    function create_if_block_9(ctx) {
    	let tr;
    	let t;
    	let each_value_3 = /*linhas*/ ctx[28];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			add_location(tr, file$1, 522, 12, 38431);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*mapa1, LimiteX, Dimensionamento*/ 16456) {
    				each_value_3 = /*linhas*/ ctx[28];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(522:8) {#if LimiteY <= i && LimiteY + (Dimensionamento * 2) >= i}",
    		ctx
    	});

    	return block;
    }

    // (525:16) {#if LimiteX <= j && LimiteX + (Dimensionamento * 2) >= j}
    function create_if_block_10(ctx) {
    	let if_block_anchor;

    	function select_block_type_4(ctx, dirty) {
    		if (/*elementos*/ ctx[31] == 0) return create_if_block_11;
    		if (/*elementos*/ ctx[31] == 1) return create_if_block_12;
    		if (/*elementos*/ ctx[31] == "Y") return create_if_block_13;
    		if (/*elementos*/ ctx[31] == "DANTE") return create_if_block_14;
    	}

    	let current_block_type = select_block_type_4(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_4(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(525:16) {#if LimiteX <= j && LimiteX + (Dimensionamento * 2) >= j}",
    		ctx
    	});

    	return block;
    }

    // (532:51) 
    function create_if_block_14(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/soacabecinha.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "personagem");
    			attr_dev(img, "class", "svelte-133fi3v");
    			add_location(img, file$1, 532, 28, 39040);
    			add_location(th, file$1, 532, 24, 39036);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(532:51) ",
    		ctx
    	});

    	return block;
    }

    // (530:47) 
    function create_if_block_13(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/saidanivel3.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "saida");
    			attr_dev(img, "class", "svelte-133fi3v");
    			add_location(img, file$1, 530, 28, 38900);
    			add_location(th, file$1, 530, 24, 38896);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(530:47) ",
    		ctx
    	});

    	return block;
    }

    // (528:45) 
    function create_if_block_12(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredenivel1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			attr_dev(img, "class", "svelte-133fi3v");
    			add_location(img, file$1, 528, 28, 38762);
    			add_location(th, file$1, 528, 24, 38758);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(528:45) ",
    		ctx
    	});

    	return block;
    }

    // (526:20) {#if elementos == 0}
    function create_if_block_11(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/chaonivel1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "chao");
    			attr_dev(img, "class", "svelte-133fi3v");
    			add_location(img, file$1, 526, 28, 38630);
    			add_location(th, file$1, 526, 24, 38626);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(526:20) {#if elementos == 0}",
    		ctx
    	});

    	return block;
    }

    // (524:16) {#each linhas as elementos,j}
    function create_each_block_3(ctx) {
    	let if_block_anchor;
    	let if_block = /*LimiteX*/ ctx[6] <= /*j*/ ctx[33] && /*LimiteX*/ ctx[6] + /*Dimensionamento*/ ctx[14] * 2 >= /*j*/ ctx[33] && create_if_block_10(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*LimiteX*/ ctx[6] <= /*j*/ ctx[33] && /*LimiteX*/ ctx[6] + /*Dimensionamento*/ ctx[14] * 2 >= /*j*/ ctx[33]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_10(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(524:16) {#each linhas as elementos,j}",
    		ctx
    	});

    	return block;
    }

    // (521:8) {#each mapa1 as linhas,i}
    function create_each_block_2(ctx) {
    	let if_block_anchor;
    	let if_block = /*LimiteY*/ ctx[7] <= /*i*/ ctx[30] && /*LimiteY*/ ctx[7] + /*Dimensionamento*/ ctx[14] * 2 >= /*i*/ ctx[30] && create_if_block_9(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*LimiteY*/ ctx[7] <= /*i*/ ctx[30] && /*LimiteY*/ ctx[7] + /*Dimensionamento*/ ctx[14] * 2 >= /*i*/ ctx[30]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_9(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(521:8) {#each mapa1 as linhas,i}",
    		ctx
    	});

    	return block;
    }

    // (506:8) {:else}
    function create_else_block(ctx) {
    	let p0;
    	let t1;
    	let p1;
    	let t3;
    	let p2;
    	let t5;
    	let p3;
    	let t7;
    	let p4;
    	let t9;
    	let p5;
    	let t11;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			p0.textContent = "Sempre que passar de fase, haverá um enigma a ser solucionado.";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "Lembre-se: Existe um limite de tempo tanto para resolver os enigmas, como para sair de cada labirinto.";
    			t3 = space();
    			p2 = element("p");
    			p2.textContent = "Ao perder em qualquer nível, voltará para o primeiro.";
    			t5 = space();
    			p3 = element("p");
    			p3.textContent = "OBS: Só serão aceitas letras maiúsculas nas respostas de todos os enigmas.";
    			t7 = space();
    			p4 = element("p");
    			p4.textContent = "Nenhuma das palavras-chave contém qualquer acento.";
    			t9 = space();
    			p5 = element("p");
    			p5.textContent = "Após compreender o funcionamento do Minos Labyrinth, digite: \"OK\" e poderá prosseguir para a primeira fase.";
    			t11 = space();
    			input = element("input");
    			attr_dev(p0, "class", "Enigma");
    			add_location(p0, file$1, 507, 8, 37401);
    			attr_dev(p1, "class", "Enigma");
    			add_location(p1, file$1, 508, 8, 37496);
    			attr_dev(p2, "class", "Enigma");
    			add_location(p2, file$1, 509, 8, 37631);
    			attr_dev(p3, "class", "Enigma");
    			add_location(p3, file$1, 510, 8, 37716);
    			attr_dev(p4, "class", "Enigma");
    			add_location(p4, file$1, 511, 8, 37822);
    			attr_dev(p5, "class", "Enigma");
    			add_location(p5, file$1, 512, 8, 37904);
    			attr_dev(input, "placeholder", "APENAS LETRAS MAIUSCULAS");
    			attr_dev(input, "class", "RespostaEnigma");
    			add_location(input, file$1, 513, 8, 38043);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p5, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*PalavraChave*/ ctx[12]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[22]),
    					listen_dev(
    						input,
    						"keydown",
    						function () {
    							if (is_function(/*Alterando*/ ctx[21](/*PalavraChave*/ ctx[12] == "OK"))) /*Alterando*/ ctx[21](/*PalavraChave*/ ctx[12] == "OK").apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*PalavraChave*/ 4096 && input.value !== /*PalavraChave*/ ctx[12]) {
    				set_input_value(input, /*PalavraChave*/ ctx[12]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(506:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (482:4) {#if !enigma}
    function create_if_block_1$1(ctx) {
    	let t0_value = /*RenderizandoMapa*/ ctx[15]() + "";
    	let t0;
    	let t1;
    	let t2_value = /*DeterminandoEixos*/ ctx[16](/*MudandoDeFase*/ ctx[10]) + "";
    	let t2;
    	let t3;
    	let each_1_anchor;
    	let each_value = /*mapa0*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*MudandoDeFase*/ 1024 && t2_value !== (t2_value = /*DeterminandoEixos*/ ctx[16](/*MudandoDeFase*/ ctx[10]) + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*mapa0, LimiteX, Dimensionamento, LimiteY*/ 16580) {
    				each_value = /*mapa0*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(482:4) {#if !enigma}",
    		ctx
    	});

    	return block;
    }

    // (488:8) {#if LimiteY <= i && LimiteY + (Dimensionamento * 2) >= i}
    function create_if_block_2$1(ctx) {
    	let tr;
    	let t;
    	let each_value_1 = /*linhas*/ ctx[28];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			add_location(tr, file$1, 488, 12, 36556);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*mapa0, LimiteX, Dimensionamento*/ 16452) {
    				each_value_1 = /*linhas*/ ctx[28];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
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
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(488:8) {#if LimiteY <= i && LimiteY + (Dimensionamento * 2) >= i}",
    		ctx
    	});

    	return block;
    }

    // (491:16) {#if LimiteX <= j && LimiteX + (Dimensionamento * 2) >= j}
    function create_if_block_3$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_3(ctx, dirty) {
    		if (/*elementos*/ ctx[31] == 0) return create_if_block_4;
    		if (/*elementos*/ ctx[31] == 1) return create_if_block_5;
    		if (/*elementos*/ ctx[31] == "X") return create_if_block_6;
    		if (/*elementos*/ ctx[31] == "DANTE") return create_if_block_7;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_3(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(491:16) {#if LimiteX <= j && LimiteX + (Dimensionamento * 2) >= j}",
    		ctx
    	});

    	return block;
    }

    // (498:51) 
    function create_if_block_7(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "dante svelte-133fi3v");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/soacabecinha.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "personagem");
    			add_location(img, file$1, 498, 28, 37169);
    			add_location(th, file$1, 498, 24, 37165);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(498:51) ",
    		ctx
    	});

    	return block;
    }

    // (496:47) 
    function create_if_block_6(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/saidanivel3.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "saida");
    			attr_dev(img, "class", "svelte-133fi3v");
    			add_location(img, file$1, 496, 28, 37029);
    			add_location(th, file$1, 496, 24, 37025);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(496:47) ",
    		ctx
    	});

    	return block;
    }

    // (494:45) 
    function create_if_block_5(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredetutorial.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			attr_dev(img, "class", "svelte-133fi3v");
    			add_location(img, file$1, 494, 28, 36889);
    			add_location(th, file$1, 494, 24, 36885);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(494:45) ",
    		ctx
    	});

    	return block;
    }

    // (492:20) {#if elementos == 0}
    function create_if_block_4(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/chaotutorial.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "chao");
    			attr_dev(img, "class", "svelte-133fi3v");
    			add_location(img, file$1, 492, 28, 36755);
    			add_location(th, file$1, 492, 24, 36751);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(492:20) {#if elementos == 0}",
    		ctx
    	});

    	return block;
    }

    // (490:16) {#each linhas as elementos,j}
    function create_each_block_1(ctx) {
    	let if_block_anchor;
    	let if_block = /*LimiteX*/ ctx[6] <= /*j*/ ctx[33] && /*LimiteX*/ ctx[6] + /*Dimensionamento*/ ctx[14] * 2 >= /*j*/ ctx[33] && create_if_block_3$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*LimiteX*/ ctx[6] <= /*j*/ ctx[33] && /*LimiteX*/ ctx[6] + /*Dimensionamento*/ ctx[14] * 2 >= /*j*/ ctx[33]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(490:16) {#each linhas as elementos,j}",
    		ctx
    	});

    	return block;
    }

    // (487:8) {#each mapa0 as linhas,i}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let if_block = /*LimiteY*/ ctx[7] <= /*i*/ ctx[30] && /*LimiteY*/ ctx[7] + /*Dimensionamento*/ ctx[14] * 2 >= /*i*/ ctx[30] && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*LimiteY*/ ctx[7] <= /*i*/ ctx[30] && /*LimiteY*/ ctx[7] + /*Dimensionamento*/ ctx[14] * 2 >= /*i*/ ctx[30]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(487:8) {#each mapa0 as linhas,i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t;
    	let if_block1_anchor;
    	let mounted;
    	let dispose;
    	let if_block0 = /*key*/ ctx[0] && create_if_block_30(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*MudandoDeFase*/ ctx[10] == "tutorial") return create_if_block$1;
    		if (/*MudandoDeFase*/ ctx[10] == "nivel1") return create_if_block_8;
    		if (/*MudandoDeFase*/ ctx[10] == "nivel2") return create_if_block_15;
    		if (/*MudandoDeFase*/ ctx[10] == "nivel3") return create_if_block_22;
    		if (/*MudandoDeFase*/ ctx[10] == "vitoria") return create_if_block_29;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block1 = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*handleKeydown*/ ctx[13], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*key*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_30(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if (if_block1) if_block1.d(1);
    				if_block1 = current_block_type && current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);

    			if (if_block1) {
    				if_block1.d(detaching);
    			}

    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Newjogo', slots, []);
    	let key;
    	let code;

    	function handleKeydown(event) {
    		$$invalidate(0, key = event.key);
    		$$invalidate(1, code = event.code);
    	}

    	//Mapas do jogo:
    	let mapa0 = [
    		[
    			2,
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			2,
    			"DANTE",
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			"X"
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		]
    	];

    	let mapa1 = [
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			"DANTE",
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			"Y",
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2
    		]
    	];

    	let mapa2 = [
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			"DANTE",
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			"Z",
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		]
    	];

    	let mapa3 = [
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		],
    		[
    			2,
    			"DANTE",
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			"V",
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1
    		],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		]
    	];

    	let mapa4 = [
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		][("C")],
    		[
    			2,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1
    		]
    	];

    	//limite de renderização:
    	let Dimensionamento = 7;

    	let LimiteX = 0;
    	let LimiteY = 0;

    	function RenderizandoMapa() {
    		if (MudandoDeFase == "tutorial") {
    			for (let i in mapa0) {
    				for (let j in mapa0[i]) {
    					if (mapa0[i][j] == "DANTE") {
    						$$invalidate(6, LimiteX = j - Dimensionamento);
    						$$invalidate(7, LimiteY = i - Dimensionamento);
    						return;
    					}
    				}
    			}
    		} else if (MudandoDeFase == "nivel1") {
    			for (let i in mapa1) {
    				for (let j in mapa1[i]) {
    					if (mapa1[i][j] == "DANTE") {
    						$$invalidate(6, LimiteX = j - Dimensionamento);
    						$$invalidate(7, LimiteY = i - Dimensionamento);
    						return;
    					}
    				}
    			}
    		} else if (MudandoDeFase == "nivel2") {
    			for (let i in mapa2) {
    				for (let j in mapa2[i]) {
    					if (mapa2[i][j] == "DANTE") {
    						$$invalidate(6, LimiteX = j - Dimensionamento);
    						$$invalidate(7, LimiteY = i - Dimensionamento);
    						return;
    					}
    				}
    			}
    		} else if (MudandoDeFase == "nivel3") {
    			for (let i in mapa3) {
    				for (let j in mapa3[i]) {
    					if (mapa3[i][j] == "DANTE") {
    						$$invalidate(6, LimiteX = j - Dimensionamento);
    						$$invalidate(7, LimiteY = i - Dimensionamento);
    						return;
    					}
    				}
    			}
    		}
    	}

    	//Logica de movimentação do jogo:
    	let EixoX = 0;

    	let EixoY = 0;
    	let SaveX = 0;
    	let SaveY = 0;

    	function DeterminandoEixos(fase) {
    		if (fase == "tutorial") {
    			for (let i in mapa0) {
    				for (let j in mapa0[i]) {
    					if (mapa0[i][j] == "DANTE") {
    						$$invalidate(8, EixoX = j);
    						$$invalidate(9, EixoY = i);
    						return;
    					}
    				}
    			}
    		} else if (fase == "nivel1") {
    			for (let i in mapa1) {
    				for (let j in mapa1[i]) {
    					if (mapa1[i][j] == "DANTE") {
    						$$invalidate(8, EixoX = j);
    						$$invalidate(9, EixoY = i);
    						return;
    					}
    				}
    			}
    		} else if (fase == "nivel2") {
    			for (let i in mapa2) {
    				for (let j in mapa2[i]) {
    					if (mapa2[i][j] == "DANTE") {
    						$$invalidate(8, EixoX = j);
    						$$invalidate(9, EixoY = i);
    						return;
    					}
    				}
    			}
    		} else if (fase == "nivel3") {
    			for (let i in mapa3) {
    				for (let j in mapa3[i]) {
    					if (mapa3[i][j] == "DANTE") {
    						$$invalidate(8, EixoX = j);
    						$$invalidate(9, EixoY = i);
    						return;
    					}
    				}
    			}
    		}
    	}

    	function ResertarPosicao() {
    		$$invalidate(8, EixoX = SaveX);
    		$$invalidate(9, EixoY = SaveY);
    		RenderizandoMapa();
    	}

    	function IncremetarX() {
    		SaveX = EixoX;
    		SaveY = EixoY;
    		$$invalidate(8, EixoX++, EixoX);

    		if (MudandoDeFase == "tutorial") {
    			MudarDeFase(mapa0[EixoY][EixoX]);

    			if (mapa0[EixoY][EixoX] != 0) {
    				ResertarPosicao();
    				return;
    			}

    			$$invalidate(2, mapa0[SaveY][SaveX] = 0, mapa0);
    			$$invalidate(2, mapa0[EixoY][EixoX] = "DANTE", mapa0);
    		} else if (MudandoDeFase == "nivel1") {
    			MudarDeFase(mapa1[EixoY][EixoX]);

    			if (mapa1[EixoY][EixoX] != 0) {
    				ResertarPosicao();
    				return;
    			}

    			$$invalidate(3, mapa1[EixoY][EixoX] = "DANTE", mapa1);
    			$$invalidate(3, mapa1[SaveY][SaveX] = 0, mapa1);
    		} else if (MudandoDeFase == "nivel2") {
    			MudarDeFase(mapa2[EixoY][EixoX]);

    			if (mapa2[EixoY][EixoX] != 0) {
    				ResertarPosicao();
    				return;
    			}

    			$$invalidate(4, mapa2[EixoY][EixoX] = "DANTE", mapa2);
    			$$invalidate(4, mapa2[SaveY][SaveX] = 0, mapa2);
    		} else if (MudandoDeFase == "nivel3") {
    			MudarDeFase(mapa3[EixoY][EixoX]);

    			if (mapa3[EixoY][EixoX] != 0) {
    				ResertarPosicao();
    				return;
    			}

    			$$invalidate(5, mapa3[EixoY][EixoX] = "DANTE", mapa3);
    			$$invalidate(5, mapa3[SaveY][SaveX] = 0, mapa3);
    		}

    		RenderizandoMapa();
    		$$invalidate(1, code = 'd');
    	}

    	function DecrementarX() {
    		SaveX = EixoX;
    		SaveY = EixoY;
    		$$invalidate(8, EixoX--, EixoX);

    		if (MudandoDeFase == "tutorial") {
    			MudarDeFase(mapa0[EixoY][EixoX]);

    			if (mapa0[EixoY][EixoX] != 0) {
    				ResertarPosicao();
    				return;
    			}

    			$$invalidate(2, mapa0[SaveY][SaveX] = 0, mapa0);
    			$$invalidate(2, mapa0[EixoY][EixoX] = "DANTE", mapa0);
    		} else if (MudandoDeFase == "nivel1") {
    			MudarDeFase(mapa1[EixoY][EixoX]);

    			if (mapa1[EixoY][EixoX] != 0) {
    				ResertarPosicao();
    				return;
    			}

    			$$invalidate(3, mapa1[EixoY][EixoX] = "DANTE", mapa1);
    			$$invalidate(3, mapa1[SaveY][SaveX] = 0, mapa1);
    		} else if (MudandoDeFase == "nivel2") {
    			MudarDeFase(mapa2[EixoY][EixoX]);

    			if (mapa2[EixoY][EixoX] != 0) {
    				ResertarPosicao();
    				return;
    			}

    			$$invalidate(4, mapa2[EixoY][EixoX] = "DANTE", mapa2);
    			$$invalidate(4, mapa2[SaveY][SaveX] = 0, mapa2);
    		} else if (MudandoDeFase == "nivel3") {
    			MudarDeFase(mapa3[EixoY][EixoX]);

    			if (mapa3[EixoY][EixoX] != 0) {
    				ResertarPosicao();
    				return;
    			}

    			$$invalidate(5, mapa3[EixoY][EixoX] = "DANTE", mapa3);
    			$$invalidate(5, mapa3[SaveY][SaveX] = 0, mapa3);
    		}

    		RenderizandoMapa();
    		$$invalidate(1, code = 'a');
    	}

    	function IncremetarY() {
    		SaveX = EixoX;
    		SaveY = EixoY;
    		$$invalidate(9, EixoY++, EixoY);

    		if (MudandoDeFase == "tutorial") {
    			MudarDeFase(mapa0[EixoY][EixoX]);

    			if (mapa0[EixoY][EixoX] != 0) {
    				ResertarPosicao();
    				return;
    			}

    			$$invalidate(2, mapa0[SaveY][SaveX] = 0, mapa0);
    			$$invalidate(2, mapa0[EixoY][EixoX] = "DANTE", mapa0);
    		} else if (MudandoDeFase == "nivel1") {
    			MudarDeFase(mapa1[EixoY][EixoX]);

    			if (mapa1[EixoY][EixoX] != 0) {
    				ResertarPosicao();
    				return;
    			}

    			$$invalidate(3, mapa1[EixoY][EixoX] = "DANTE", mapa1);
    			$$invalidate(3, mapa1[SaveY][SaveX] = 0, mapa1);
    		} else if (MudandoDeFase == "nivel2") {
    			MudarDeFase(mapa2[EixoY][EixoX]);

    			if (mapa2[EixoY][EixoX] != 0) {
    				ResertarPosicao();
    				return;
    			}

    			$$invalidate(4, mapa2[EixoY][EixoX] = "DANTE", mapa2);
    			$$invalidate(4, mapa2[SaveY][SaveX] = 0, mapa2);
    		} else if (MudandoDeFase == "nivel3") {
    			MudarDeFase(mapa3[EixoY][EixoX]);

    			if (mapa3[EixoY][EixoX] != 0) {
    				ResertarPosicao();
    				return;
    			}

    			$$invalidate(5, mapa3[EixoY][EixoX] = "DANTE", mapa3);
    			$$invalidate(5, mapa3[SaveY][SaveX] = 0, mapa3);
    		}

    		RenderizandoMapa();
    		$$invalidate(1, code = 'w');
    	}

    	function DecrementarY() {
    		SaveX = EixoX;
    		SaveY = EixoY;
    		$$invalidate(9, EixoY--, EixoY);

    		if (MudandoDeFase == "tutorial") {
    			MudarDeFase(mapa0[EixoY][EixoX]);

    			if (mapa0[EixoY][EixoX] != 0) {
    				ResertarPosicao();
    				return;
    			}

    			$$invalidate(2, mapa0[SaveY][SaveX] = 0, mapa0);
    			$$invalidate(2, mapa0[EixoY][EixoX] = "DANTE", mapa0);
    		} else if (MudandoDeFase == "nivel1") {
    			MudarDeFase(mapa1[EixoY][EixoX]);

    			if (mapa1[EixoY][EixoX] != 0) {
    				ResertarPosicao();
    				return;
    			}

    			$$invalidate(3, mapa1[EixoY][EixoX] = "DANTE", mapa1);
    			$$invalidate(3, mapa1[SaveY][SaveX] = 0, mapa1);
    		} else if (MudandoDeFase == "nivel2") {
    			MudarDeFase(mapa2[EixoY][EixoX]);

    			if (mapa2[EixoY][EixoX] != 0) {
    				ResertarPosicao();
    				return;
    			}

    			$$invalidate(4, mapa2[EixoY][EixoX] = "DANTE", mapa2);
    			$$invalidate(4, mapa2[SaveY][SaveX] = 0, mapa2);
    		} else if (MudandoDeFase == "nivel3") {
    			MudarDeFase(mapa3[EixoY][EixoX]);

    			if (mapa3[EixoY][EixoX] != 0) {
    				ResertarPosicao();
    				return;
    			}

    			$$invalidate(5, mapa3[EixoY][EixoX] = "DANTE", mapa3);
    			$$invalidate(5, mapa3[SaveY][SaveX] = 0, mapa3);
    		}

    		RenderizandoMapa();
    		$$invalidate(1, code = 's');
    	}

    	//Referente a mudança de fases:
    	let MudandoDeFase = "tutorial";

    	function MudarDeFase(FaseAtual) {
    		if (FaseAtual == "X") {
    			$$invalidate(10, MudandoDeFase = "nivel1");
    		} else if (FaseAtual == "Y") {
    			$$invalidate(10, MudandoDeFase = "nivel2");
    		} else if (FaseAtual == "Z") {
    			$$invalidate(10, MudandoDeFase = "nivel3");
    		} else if (FaseAtual == "V") {
    			$$invalidate(10, MudandoDeFase = "Vitoria");
    		}
    	}

    	//Referente aos enigmas:
    	let enigma = false;

    	let PalavraChave = '';

    	function Alterando(teste) {
    		if (teste) {
    			$$invalidate(11, enigma = teste);
    			$$invalidate(12, PalavraChave = '');
    		} else {
    			$$invalidate(11, enigma = teste);
    			$$invalidate(12, PalavraChave = '');
    		}

    		return enigma;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Newjogo> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		PalavraChave = this.value;
    		$$invalidate(12, PalavraChave);
    	}

    	$$self.$capture_state = () => ({
    		key,
    		code,
    		handleKeydown,
    		mapa0,
    		mapa1,
    		mapa2,
    		mapa3,
    		mapa4,
    		Dimensionamento,
    		LimiteX,
    		LimiteY,
    		RenderizandoMapa,
    		EixoX,
    		EixoY,
    		SaveX,
    		SaveY,
    		DeterminandoEixos,
    		ResertarPosicao,
    		IncremetarX,
    		DecrementarX,
    		IncremetarY,
    		DecrementarY,
    		MudandoDeFase,
    		MudarDeFase,
    		enigma,
    		PalavraChave,
    		Alterando
    	});

    	$$self.$inject_state = $$props => {
    		if ('key' in $$props) $$invalidate(0, key = $$props.key);
    		if ('code' in $$props) $$invalidate(1, code = $$props.code);
    		if ('mapa0' in $$props) $$invalidate(2, mapa0 = $$props.mapa0);
    		if ('mapa1' in $$props) $$invalidate(3, mapa1 = $$props.mapa1);
    		if ('mapa2' in $$props) $$invalidate(4, mapa2 = $$props.mapa2);
    		if ('mapa3' in $$props) $$invalidate(5, mapa3 = $$props.mapa3);
    		if ('mapa4' in $$props) mapa4 = $$props.mapa4;
    		if ('Dimensionamento' in $$props) $$invalidate(14, Dimensionamento = $$props.Dimensionamento);
    		if ('LimiteX' in $$props) $$invalidate(6, LimiteX = $$props.LimiteX);
    		if ('LimiteY' in $$props) $$invalidate(7, LimiteY = $$props.LimiteY);
    		if ('EixoX' in $$props) $$invalidate(8, EixoX = $$props.EixoX);
    		if ('EixoY' in $$props) $$invalidate(9, EixoY = $$props.EixoY);
    		if ('SaveX' in $$props) SaveX = $$props.SaveX;
    		if ('SaveY' in $$props) SaveY = $$props.SaveY;
    		if ('MudandoDeFase' in $$props) $$invalidate(10, MudandoDeFase = $$props.MudandoDeFase);
    		if ('enigma' in $$props) $$invalidate(11, enigma = $$props.enigma);
    		if ('PalavraChave' in $$props) $$invalidate(12, PalavraChave = $$props.PalavraChave);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		key,
    		code,
    		mapa0,
    		mapa1,
    		mapa2,
    		mapa3,
    		LimiteX,
    		LimiteY,
    		EixoX,
    		EixoY,
    		MudandoDeFase,
    		enigma,
    		PalavraChave,
    		handleKeydown,
    		Dimensionamento,
    		RenderizandoMapa,
    		DeterminandoEixos,
    		IncremetarX,
    		DecrementarX,
    		IncremetarY,
    		DecrementarY,
    		Alterando,
    		input_input_handler
    	];
    }

    class Newjogo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Newjogo",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.53.1 */
    const file = "src\\App.svelte";

    // (23:29) 
    function create_if_block_3(ctx) {
    	let ajuda;
    	let current;
    	ajuda = new Ajuda({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(ajuda.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ajuda, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ajuda.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ajuda.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ajuda, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(23:29) ",
    		ctx
    	});

    	return block;
    }

    // (21:30) 
    function create_if_block_2(ctx) {
    	let sobre;
    	let current;
    	sobre = new Sobre({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(sobre.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(sobre, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sobre.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sobre.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sobre, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(21:30) ",
    		ctx
    	});

    	return block;
    }

    // (19:30) 
    function create_if_block_1(ctx) {
    	let jogar;
    	let current;
    	jogar = new Jogo({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(jogar.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(jogar, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(jogar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(jogar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(jogar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(19:30) ",
    		ctx
    	});

    	return block;
    }

    // (17:0) {#if $estado === 'menu'}
    function create_if_block(ctx) {
    	let menu;
    	let current;
    	menu = new Menu({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(menu.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(menu, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(menu, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(17:0) {#if $estado === 'menu'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let head;
    	let link;
    	let t0;
    	let current_block_type_index;
    	let if_block;
    	let t1;
    	let audio0;
    	let audio0_src_value;
    	let t2;
    	let div;
    	let audio1;
    	let source0;
    	let source0_src_value;
    	let source1;
    	let source1_src_value;
    	let current;
    	const if_block_creators = [create_if_block, create_if_block_1, create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$estado*/ ctx[0] === 'menu') return 0;
    		if (/*$estado*/ ctx[0] === 'jogar') return 1;
    		if (/*$estado*/ ctx[0] === 'sobre') return 2;
    		if (/*$estado*/ ctx[0] === 'ajuda') return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			head = element("head");
    			link = element("link");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			audio0 = element("audio");
    			t2 = space();
    			div = element("div");
    			audio1 = element("audio");
    			source0 = element("source");
    			source1 = element("source");
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/css/appsvelte.css");
    			add_location(link, file, 13, 1, 353);
    			add_location(head, file, 12, 0, 344);
    			if (!src_url_equal(audio0.src, audio0_src_value = "/css/audio.mp3")) attr_dev(audio0, "src", audio0_src_value);
    			audio0.autoplay = true;
    			attr_dev(audio0, "preload", "auto");
    			add_location(audio0, file, 27, 0, 591);
    			if (!src_url_equal(source0.src, source0_src_value = "/css/audio3.wav")) attr_dev(source0, "src", source0_src_value);
    			attr_dev(source0, "type", "audio/wav");
    			add_location(source0, file, 31, 2, 699);
    			if (!src_url_equal(source1.src, source1_src_value = "/css/audio2.ogg")) attr_dev(source1, "src", source1_src_value);
    			attr_dev(source1, "type", "audio/ogg");
    			add_location(source1, file, 32, 2, 750);
    			attr_dev(audio1, "id", "audio");
    			audio1.autoplay = true;
    			audio1.loop = true;
    			add_location(audio1, file, 30, 1, 663);
    			add_location(div, file, 29, 0, 655);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, head, anchor);
    			append_dev(head, link);
    			insert_dev(target, t0, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, audio0, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, audio1);
    			append_dev(audio1, source0);
    			append_dev(audio1, source1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(t1.parentNode, t1);
    				} else {
    					if_block = null;
    				}
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
    			if (detaching) detach_dev(head);
    			if (detaching) detach_dev(t0);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(audio0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div);
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
    	let $estado;
    	validate_store(estado, 'estado');
    	component_subscribe($$self, estado, $$value => $$invalidate(0, $estado = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router: Router$1,
    		Route: Route$1,
    		Link: Link$1,
    		Ajuda,
    		Menu,
    		Sobre,
    		Jogar: Jogo,
    		estado,
    		Teste,
    		Newjogo,
    		$estado
    	});

    	return [$estado];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
