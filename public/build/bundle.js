
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

    const file$c = "node_modules\\svelte-navigator\\src\\Router.svelte";

    // (204:0) {#if isTopLevelRouter && manageFocus && a11yConfig.announcements}
    function create_if_block$7(ctx) {
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
    			add_location(div, file$c, 204, 1, 6149);
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
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(204:0) {#if isTopLevelRouter && manageFocus && a11yConfig.announcements}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
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
    	let if_block = /*isTopLevelRouter*/ ctx[2] && /*manageFocus*/ ctx[4] && /*a11yConfig*/ ctx[1].announcements && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = space();
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			set_attributes(div, div_data);
    			add_location(div, file$c, 196, 0, 5982);
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const createId$1 = createCounter();
    const defaultBasepath = "/";

    function instance$c($$self, $$props, $$invalidate) {
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
    			instance$c,
    			create_fragment$c,
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
    			id: create_fragment$c.name
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
    const file$b = "node_modules\\svelte-navigator\\src\\Route.svelte";

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
    function create_if_block$6(ctx) {
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
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(98:0) {#if isActive}",
    		ctx
    	});

    	return block;
    }

    // (114:2) {:else}
    function create_else_block(ctx) {
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
    		id: create_else_block.name,
    		type: "else",
    		source: "(114:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (106:2) {#if component !== null}
    function create_if_block_1$6(ctx) {
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
    		id: create_if_block_1$6.name,
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
    	const if_block_creators = [create_if_block_1$6, create_else_block];
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

    function create_fragment$b(ctx) {
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

    	let if_block = /*isActive*/ ctx[2] && create_if_block$6(ctx);

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
    			add_location(div0, file$b, 96, 0, 2664);
    			set_attributes(div1, div1_data);
    			add_location(div1, file$b, 122, 0, 3340);
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
    					if_block = create_if_block$6(ctx);
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const createId = createCounter();

    function instance$b($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			path: 13,
    			component: 0,
    			meta: 14,
    			primary: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$b.name
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
    const file$a = "node_modules\\svelte-navigator\\src\\Link.svelte";

    function create_fragment$a(ctx) {
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
    			add_location(a, file$a, 65, 0, 1861);
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { to: 5, replace: 6, state: 7, getProps: 8 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$a.name
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

    // o estado do jogo guarda a informa????o sobre a tela questamos no momento
    let estado = writable('menu');

    function trocarEstadoDoJogo(novoEstado) {
    	estado.set(novoEstado);
    }

    /* src\VoltarMenu.svelte generated by Svelte v3.53.1 */
    const file$9 = "src\\VoltarMenu.svelte";

    function create_fragment$9(ctx) {
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
    			add_location(link, file$9, 5, 1, 83);
    			add_location(head, file$9, 4, 0, 74);
    			attr_dev(p, "class", "pmenu");
    			add_location(p, file$9, 8, 88, 228);
    			attr_dev(button, "class", "buttonapp");
    			add_location(button, file$9, 8, 18, 158);
    			attr_dev(ul, "class", "ulapp");
    			add_location(ul, file$9, 8, 0, 140);
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VoltarMenu",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\ajuda.svelte generated by Svelte v3.53.1 */
    const file$8 = "src\\ajuda.svelte";

    function create_fragment$8(ctx) {
    	let head;
    	let link;
    	let t0;
    	let voltarmenu;
    	let t1;
    	let h1;
    	let t3;
    	let h2;
    	let t5;
    	let ul0;
    	let li0;
    	let t7;
    	let li1;
    	let t9;
    	let li2;
    	let t11;
    	let li3;
    	let t13;
    	let ul1;
    	let button0;
    	let t15;
    	let ul2;
    	let button1;
    	let t17;
    	let button2;
    	let t19;
    	let ul3;
    	let button3;
    	let t21;
    	let h3;
    	let t23;
    	let p0;
    	let t25;
    	let p1;
    	let t27;
    	let p2;
    	let t29;
    	let p3;
    	let t31;
    	let p4;
    	let t33;
    	let p5;
    	let t35;
    	let p6;
    	let t37;
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
    			h1 = element("h1");
    			h1.textContent = "AJUDA";
    			t3 = space();
    			h2 = element("h2");
    			h2.textContent = "Como jogar?";
    			t5 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			li0.textContent = "Ir para frente";
    			t7 = space();
    			li1 = element("li");
    			li1.textContent = "Ir para tr??s";
    			t9 = space();
    			li2 = element("li");
    			li2.textContent = "Ir para a direita";
    			t11 = space();
    			li3 = element("li");
    			li3.textContent = "Ir para a esquerda";
    			t13 = space();
    			ul1 = element("ul");
    			button0 = element("button");
    			button0.textContent = "???";
    			t15 = space();
    			ul2 = element("ul");
    			button1 = element("button");
    			button1.textContent = "???";
    			t17 = space();
    			button2 = element("button");
    			button2.textContent = "???";
    			t19 = space();
    			ul3 = element("ul");
    			button3 = element("button");
    			button3.textContent = "???";
    			t21 = space();
    			h3 = element("h3");
    			h3.textContent = "Ol??, querido humano.";
    			t23 = space();
    			p0 = element("p");
    			p0.textContent = "Se voc?? chegou aqui, temo que j?? esteja em um territ??rio perigoso.";
    			t25 = space();
    			p1 = element("p");
    			p1.textContent = "Humanos n??o deveriam arriscar tanto suas vidas, ser?? que sua curiosidade vale tanto assim?";
    			t27 = space();
    			p2 = element("p");
    			p2.textContent = "Deseja um conselho?";
    			t29 = space();
    			p3 = element("p");
    			p3.textContent = "N??o seja guiado por suas emo????es,";
    			t31 = space();
    			p4 = element("p");
    			p4.textContent = "o tempo n??o ?? seu amigo.";
    			t33 = space();
    			p5 = element("p");
    			p5.textContent = "N??o olhe para tr??s ou tente voltar.";
    			t35 = space();
    			p6 = element("p");
    			p6.textContent = "Fique atento e ou??a bem o que lhe rodeia.";
    			t37 = space();
    			h4 = element("h4");
    			h4.textContent = "Sua curiosidade pode ser sua maior perdi????o, \r\n    preste aten????o nas entrelinhas e proteja sua retaguarda.";
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/css/ajuda.css");
    			add_location(link, file$8, 5, 4, 85);
    			add_location(head, file$8, 4, 0, 73);
    			attr_dev(h1, "class", "h1ajuda");
    			add_location(h1, file$8, 8, 0, 156);
    			add_location(h2, file$8, 10, 0, 190);
    			add_location(li0, file$8, 12, 4, 222);
    			add_location(li1, file$8, 13, 4, 251);
    			add_location(li2, file$8, 14, 4, 278);
    			add_location(li3, file$8, 15, 4, 310);
    			add_location(ul0, file$8, 11, 0, 212);
    			attr_dev(button0, "id", "button");
    			attr_dev(button0, "class", "botao");
    			add_location(button0, file$8, 19, 21, 371);
    			attr_dev(ul1, "class", "ulbutton");
    			add_location(ul1, file$8, 19, 0, 350);
    			attr_dev(button1, "class", "botao");
    			add_location(button1, file$8, 20, 4, 426);
    			attr_dev(button2, "class", "botao");
    			add_location(button2, file$8, 20, 37, 459);
    			add_location(ul2, file$8, 20, 0, 422);
    			attr_dev(button3, "id", "button");
    			attr_dev(button3, "class", "botao");
    			add_location(button3, file$8, 21, 4, 502);
    			add_location(ul3, file$8, 21, 0, 498);
    			attr_dev(h3, "class", "h3ajuda");
    			add_location(h3, file$8, 23, 0, 555);
    			add_location(p0, file$8, 24, 0, 602);
    			add_location(p1, file$8, 25, 0, 677);
    			add_location(p2, file$8, 26, 0, 776);
    			add_location(p3, file$8, 27, 0, 804);
    			add_location(p4, file$8, 28, 0, 846);
    			add_location(p5, file$8, 29, 0, 879);
    			add_location(p6, file$8, 30, 0, 923);
    			add_location(h4, file$8, 32, 0, 975);
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
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, ul0, anchor);
    			append_dev(ul0, li0);
    			append_dev(ul0, t7);
    			append_dev(ul0, li1);
    			append_dev(ul0, t9);
    			append_dev(ul0, li2);
    			append_dev(ul0, t11);
    			append_dev(ul0, li3);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, ul1, anchor);
    			append_dev(ul1, button0);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, ul2, anchor);
    			append_dev(ul2, button1);
    			append_dev(ul2, t17);
    			append_dev(ul2, button2);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, ul3, anchor);
    			append_dev(ul3, button3);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t31, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t33, anchor);
    			insert_dev(target, p5, anchor);
    			insert_dev(target, t35, anchor);
    			insert_dev(target, p6, anchor);
    			insert_dev(target, t37, anchor);
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
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(ul0);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(ul1);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(ul2);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(ul3);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t31);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t33);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t35);
    			if (detaching) detach_dev(p6);
    			if (detaching) detach_dev(t37);
    			if (detaching) detach_dev(h4);
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
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ajuda",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    var contador = 0;
        function proximafase(teste){
            if (teste == "V") {
                contador = 4;
            }else if (teste == "X") {
                contador = 1;
            }else if (teste == "Y") {
                contador = 2;
            }else if (teste == "Z") {
                contador = 3;
            }return contador;
        }
        function resertar(){
            contador = 0;
        }

    /* src\menu.svelte generated by Svelte v3.53.1 */
    const file$7 = "src\\menu.svelte";

    // (22:29) 
    function create_if_block_1$5(ctx) {
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
    			p1.textContent = "Jogar";
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
    			add_location(p0, file$7, 23, 94, 932);
    			attr_dev(button0, "class", "buttonapp");
    			add_location(button0, file$7, 23, 22, 860);
    			attr_dev(ul0, "class", "ulapp");
    			add_location(ul0, file$7, 23, 4, 842);
    			attr_dev(p1, "class", "pmenu");
    			add_location(p1, file$7, 24, 107, 1085);
    			attr_dev(button1, "class", "buttonapp");
    			add_location(button1, file$7, 24, 22, 1000);
    			attr_dev(ul1, "class", "ulapp");
    			add_location(ul1, file$7, 24, 4, 982);
    			attr_dev(p2, "class", "pmenu");
    			add_location(p2, file$7, 25, 94, 1221);
    			attr_dev(button2, "class", "buttonapp");
    			add_location(button2, file$7, 25, 22, 1149);
    			attr_dev(ul2, "class", "ulapp");
    			add_location(ul2, file$7, 25, 4, 1131);
    			attr_dev(p3, "class", "pmenu");
    			add_location(p3, file$7, 26, 94, 1357);
    			attr_dev(button3, "class", "buttonapp");
    			add_location(button3, file$7, 26, 22, 1285);
    			attr_dev(ul3, "class", "ulapp");
    			add_location(ul3, file$7, 26, 4, 1267);
    			attr_dev(div, "class", "divapp");
    			add_location(div, file$7, 22, 0, 816);
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
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(22:29) ",
    		ctx
    	});

    	return block;
    }

    // (14:0) {#if (estadoAtual == 0)}
    function create_if_block$5(ctx) {
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
    			p0.textContent = "Jogar";
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
    			add_location(p0, file$7, 16, 112, 461);
    			attr_dev(button0, "class", "buttonapp");
    			add_location(button0, file$7, 16, 22, 371);
    			attr_dev(ul0, "class", "ulapp");
    			add_location(ul0, file$7, 16, 4, 353);
    			attr_dev(p1, "class", "pmenu");
    			add_location(p1, file$7, 17, 94, 597);
    			attr_dev(button1, "class", "buttonapp");
    			add_location(button1, file$7, 17, 22, 525);
    			attr_dev(ul1, "class", "ulapp");
    			add_location(ul1, file$7, 17, 4, 507);
    			attr_dev(p2, "class", "pmenu");
    			add_location(p2, file$7, 18, 94, 733);
    			attr_dev(button2, "class", "buttonapp");
    			add_location(button2, file$7, 18, 22, 661);
    			attr_dev(ul2, "class", "ulapp");
    			add_location(ul2, file$7, 18, 4, 643);
    			attr_dev(div, "class", "divapp");
    			add_location(div, file$7, 15, 0, 327);
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
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(14:0) {#if (estadoAtual == 0)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let head;
    	let link;
    	let t0;
    	let h1;
    	let t2;
    	let p;
    	let t4;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*estadoAtual*/ ctx[0] == 0) return create_if_block$5;
    		if (/*estadoAtual*/ ctx[0] == 1) return create_if_block_1$5;
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
    			add_location(link, file$7, 7, 4, 174);
    			add_location(head, file$7, 6, 0, 162);
    			attr_dev(h1, "class", "h1menu");
    			add_location(h1, file$7, 10, 0, 231);
    			attr_dev(p, "class", "pmenu");
    			add_location(p, file$7, 11, 0, 262);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, []);
    	let estadoAtual = 0;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(0, estadoAtual = 1);
    		trocarEstadoDoJogo('jogar');
    	};

    	const click_handler_1 = () => trocarEstadoDoJogo('sobre');
    	const click_handler_2 = () => trocarEstadoDoJogo('ajuda');
    	const click_handler_3 = () => trocarEstadoDoJogo('jogar');

    	const click_handler_4 = () => {
    		resertar();
    		trocarEstadoDoJogo('jogar');
    	};

    	const click_handler_5 = () => trocarEstadoDoJogo('sobre');
    	const click_handler_6 = () => trocarEstadoDoJogo('ajuda');

    	$$self.$capture_state = () => ({
    		trocarEstadoDoJogo,
    		contador,
    		resertar,
    		estadoAtual
    	});

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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\sobre.svelte generated by Svelte v3.53.1 */
    const file$6 = "src\\sobre.svelte";

    function create_fragment$6(ctx) {
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
    			p0.textContent = "A hist??ria do MINOS LABYRINTH se d?? ??nicio quando Dante, nosso protagonista e aspirante a historiador, se v?? de frente a grande oportunidade de sua vida\r\n que ?? poder provar tanto a si mesmo quanto para as pessoas ao seu redor que criaturas mit??logicas existem; Durante uma de suas viagens em busca\r\n de mais informa????es Dante se depara com um velho maltrapilho que aos gritos dizia que os monstros existentes dentro de um labirinto fugiriam e destruiriam\r\n toda aquela cidade. Como se era espertado ningu??m deu ouvidos aos avisos daquele senhor lun??tico, apenas continuavam seguindo suas vidas e o ignorando, \r\n algo dizia a Dante que aquela cena j?? havia se repetido in??meras vezes. J?? decidido a tamb??m ignorar aquele senhor o rapaz encontra ca??do no ch??o o que parecia\r\n ser um di??rio, o pequeno caderno estava sujo e mal conservado, mesmo com curiosidade o garoto decidiu devolver o objeto a aquele homem - \"Pode ficar com essa\r\n porcaria, jogue fora! Fa??a o que quiser!\" - foi o que Dante ouviu antes de ainda aos gritos o velho louco ir embora.\r\n Minos Labyrinth foi o nome que mais se repetiu a medida que o garoto ia lendo, descobrindo que o di??rio estava repleto de relatos de outros que tamb??m haviam se aventurado\r\n a entrar no labirinto, ficando surpreso ao perceber que o velho provavelmente fora o ??nico que voltou com vida.\r\n Tomado pelo desejo de ver as criaturas com seus pr??prios olhos Dante decidiu que entraria naquele labirinto, seria a maior aventura de sua vida e o jovem n??o via a\r\nhora de finalmente desvender o mist??rio que o \"Minos Labyrinth\" tinha a lhe ofercer.";
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
    			t11 = text(" 1?? per??odo de IPI ");
    			br1 = element("br");
    			t12 = text(" asms1@discente.ifpe.edu.br");
    			t13 = space();
    			h21 = element("h2");
    			h21.textContent = "Allan Lima";
    			t15 = space();
    			p2 = element("p");
    			t16 = text("Professor Respons??vel ");
    			br2 = element("br");
    			t17 = text(" allan.lima@igarassu.ifpe.edu.br");
    			t18 = space();
    			h22 = element("h2");
    			h22.textContent = "Ass??ria Renara";
    			t20 = space();
    			p3 = element("p");
    			t21 = text("22 anos ");
    			br3 = element("br");
    			t22 = text(" 1?? per??odo de IPI ");
    			br4 = element("br");
    			t23 = text(" aross@discente.ifpe.edu.br");
    			t24 = space();
    			h23 = element("h2");
    			h23.textContent = "Claudiane Rodrigues";
    			t26 = space();
    			p4 = element("p");
    			t27 = text("21 anos ");
    			br5 = element("br");
    			t28 = text(" 1?? per??odo de IPI ");
    			br6 = element("br");
    			t29 = text(" cra@discente.ifpe.edu.br");
    			t30 = space();
    			h24 = element("h2");
    			h24.textContent = "Emmily Kathylen";
    			t32 = space();
    			p5 = element("p");
    			t33 = text("20 anos ");
    			br7 = element("br");
    			t34 = text(" 1?? per??odo de IPI ");
    			br8 = element("br");
    			t35 = text(" eksb1@discente.ifpe.edu.br");
    			t36 = space();
    			h25 = element("h2");
    			h25.textContent = "Guilherme Valen??a";
    			t38 = space();
    			p6 = element("p");
    			t39 = text("21 anos ");
    			br9 = element("br");
    			t40 = text(" 1?? per??odo de IPI ");
    			br10 = element("br");
    			t41 = text(" gvrp@discente.ifpe.edu.br");
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/css/sobre.css");
    			add_location(link, file$6, 5, 4, 97);
    			add_location(head, file$6, 4, 0, 85);
    			attr_dev(h10, "class", "sobreh1");
    			add_location(h10, file$6, 7, 0, 153);
    			add_location(p0, file$6, 9, 0, 196);
    			attr_dev(h11, "class", "sobreh1");
    			add_location(h11, file$6, 24, 0, 1805);
    			add_location(h20, file$6, 26, 0, 1843);
    			add_location(br0, file$6, 27, 16, 1885);
    			add_location(br1, file$6, 27, 39, 1908);
    			add_location(p1, file$6, 27, 4, 1873);
    			add_location(h21, file$6, 29, 1, 1949);
    			add_location(br2, file$6, 30, 29, 1999);
    			add_location(p2, file$6, 30, 4, 1974);
    			add_location(h22, file$6, 32, 1, 2045);
    			add_location(br3, file$6, 33, 15, 2085);
    			add_location(br4, file$6, 33, 38, 2108);
    			add_location(p3, file$6, 33, 4, 2074);
    			add_location(h23, file$6, 35, 1, 2153);
    			add_location(br5, file$6, 36, 16, 2199);
    			add_location(br6, file$6, 36, 39, 2222);
    			add_location(p4, file$6, 36, 4, 2187);
    			add_location(h24, file$6, 38, 1, 2261);
    			add_location(br7, file$6, 39, 15, 2302);
    			add_location(br8, file$6, 39, 38, 2325);
    			add_location(p5, file$6, 39, 4, 2291);
    			add_location(h25, file$6, 41, 1, 2366);
    			add_location(br9, file$6, 42, 15, 2409);
    			add_location(br10, file$6, 42, 38, 2432);
    			add_location(p6, file$6, 42, 4, 2398);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sobre",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\fases-do-jogo\nivel1.svelte generated by Svelte v3.53.1 */

    const file$5 = "src\\fases-do-jogo\\nivel1.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	child_ctx[19] = i;
    	return child_ctx;
    }

    // (94:0) {#if (key)}
    function create_if_block_4$2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*code*/ ctx[1] == "ArrowUp") return create_if_block_5$2;
    		if (/*code*/ ctx[1] == "ArrowDown") return create_if_block_6$2;
    		if (/*code*/ ctx[1] == "ArrowLeft") return create_if_block_7$2;
    		if (/*code*/ ctx[1] == "ArrowRight") return create_if_block_8$2;
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
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(94:0) {#if (key)}",
    		ctx
    	});

    	return block;
    }

    // (101:45) 
    function create_if_block_8$2(ctx) {
    	let t_value = /*incremetarX*/ ctx[6]() + "";
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
    		id: create_if_block_8$2.name,
    		type: "if",
    		source: "(101:45) ",
    		ctx
    	});

    	return block;
    }

    // (99:44) 
    function create_if_block_7$2(ctx) {
    	let t_value = /*decrementarX*/ ctx[8]() + "";
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
    		id: create_if_block_7$2.name,
    		type: "if",
    		source: "(99:44) ",
    		ctx
    	});

    	return block;
    }

    // (97:44) 
    function create_if_block_6$2(ctx) {
    	let t_value = /*incremetarY*/ ctx[7]() + "";
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
    		id: create_if_block_6$2.name,
    		type: "if",
    		source: "(97:44) ",
    		ctx
    	});

    	return block;
    }

    // (95:12) {#if (code == "ArrowUp")}
    function create_if_block_5$2(ctx) {
    	let t_value = /*decrementarY*/ ctx[9]() + "";
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
    		id: create_if_block_5$2.name,
    		type: "if",
    		source: "(95:12) {#if (code == \\\"ArrowUp\\\")}",
    		ctx
    	});

    	return block;
    }

    // (116:41) 
    function create_if_block_3$4(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "tabela");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredeamalera1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			add_location(img, file$5, 116, 32, 4178);
    			attr_dev(th, "id", "parede");
    			add_location(th, file$5, 116, 16, 4162);
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
    		id: create_if_block_3$4.name,
    		type: "if",
    		source: "(116:41) ",
    		ctx
    	});

    	return block;
    }

    // (114:41) 
    function create_if_block_2$4(ctx) {
    	let th;

    	const block = {
    		c: function create() {
    			th = element("th");
    			attr_dev(th, "id", "vazio");
    			attr_dev(th, "alt", "vazio");
    			add_location(th, file$5, 114, 16, 4069);
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
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(114:41) ",
    		ctx
    	});

    	return block;
    }

    // (112:41) 
    function create_if_block_1$4(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "tabela");
    			if (!src_url_equal(img.src, img_src_value = IMGmovimentacao$3(/*i*/ ctx[16], /*j*/ ctx[19], /*eixoX*/ ctx[2], /*eixoY*/ ctx[3]))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "estrada");
    			add_location(img, file$5, 112, 33, 3928);
    			attr_dev(th, "id", "estrada");
    			add_location(th, file$5, 112, 16, 3911);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*eixoX, eixoY*/ 12 && !src_url_equal(img.src, img_src_value = IMGmovimentacao$3(/*i*/ ctx[16], /*j*/ ctx[19], /*eixoX*/ ctx[2], /*eixoY*/ ctx[3]))) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(112:41) ",
    		ctx
    	});

    	return block;
    }

    // (110:16) {#if (mapa[eixoY][eixoX] != 0)}
    function create_if_block$4(ctx) {
    	let t_value = /*ResertarPosicao*/ ctx[10]() + "";
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
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(110:16) {#if (mapa[eixoY][eixoX] != 0)}",
    		ctx
    	});

    	return block;
    }

    // (109:12) {#each regiao as estrada,j}
    function create_each_block_1$3(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*mapa*/ ctx[5][/*eixoY*/ ctx[3]][/*eixoX*/ ctx[2]] != 0) return create_if_block$4;
    		if (/*estrada*/ ctx[17] == 0) return create_if_block_1$4;
    		if (/*estrada*/ ctx[17] == 2) return create_if_block_2$4;
    		if (/*estrada*/ ctx[17] == 1) return create_if_block_3$4;
    	}

    	let current_block_type = select_block_type_1(ctx);
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
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
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
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(109:12) {#each regiao as estrada,j}",
    		ctx
    	});

    	return block;
    }

    // (107:4) {#each mapa as regiao,i}
    function create_each_block$3(ctx) {
    	let tr;
    	let t;
    	let each_value_1 = /*regiao*/ ctx[14];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(tr, "class", "linhasdatabela");
    			add_location(tr, file$5, 107, 8, 3696);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ResertarPosicao, mapa, eixoY, eixoX, IMGmovimentacao*/ 1068) {
    				each_value_1 = /*regiao*/ ctx[14];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$3(child_ctx);
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
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(107:4) {#each mapa as regiao,i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let t;
    	let table;
    	let mounted;
    	let dispose;
    	let if_block = /*key*/ ctx[0] && create_if_block_4$2(ctx);
    	let each_value = /*mapa*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(table, "class", "mapa");
    			add_location(table, file$5, 105, 0, 3636);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*handleKeydown*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*key*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_4$2(ctx);
    					if_block.c();
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*mapa, ResertarPosicao, eixoY, eixoX, IMGmovimentacao*/ 1068) {
    				each_value = /*mapa*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
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
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
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

    function IMGmovimentacao$3(i, j, x, y) {
    	if (y == i && x == j) {
    		return '/css/imagens/Dante.png';
    	} else {
    		return "/css/imagens/chao1.png";
    	}
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Nivel1', slots, []);
    	let key;
    	let code;

    	function handleKeydown(event) {
    		$$invalidate(0, key = event.key);
    		$$invalidate(1, code = event.code);
    	}

    	let mapa = [
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
    			1
    		],
    		[
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
    			1
    		],
    		[
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
    			1,
    			1,
    			1,
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
    			1,
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
    			1
    		],
    		[
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
    			1
    		],
    		[
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
    			1,
    			1,
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
    			0,
    			1,
    			1,
    			1,
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
    			1
    		],
    		[
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
    			1,
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
    			1
    		],
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
    			1
    		],
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
    			1
    		],
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
    			0,
    			1,
    			1,
    			1,
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
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
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
    			1
    		],
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
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
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
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
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
    			1
    		],
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
    			1
    		],
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
    			1
    		],
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
    			1
    		],
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
    			1
    		],
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
    			1
    		],
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
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
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
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			"V",
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
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
    	let x = eixoX;
    	let y = eixoY;

    	function incremetarX() {
    		x = eixoX;
    		y = eixoY;
    		$$invalidate(2, eixoX++, eixoX);
    		$$invalidate(1, code = "d");
    	}

    	function incremetarY() {
    		x = eixoX;
    		y = eixoY;
    		$$invalidate(3, eixoY++, eixoY);
    		$$invalidate(1, code = "w");
    	}

    	function decrementarX() {
    		x = eixoX;
    		y = eixoY;
    		$$invalidate(2, eixoX--, eixoX);
    		$$invalidate(1, code = "a");
    	}

    	function decrementarY() {
    		x = eixoX;
    		y = eixoY;
    		$$invalidate(3, eixoY--, eixoY);
    		$$invalidate(1, code = "s");
    	}

    	function ResertarPosicao() {
    		$$invalidate(2, eixoX = x);
    		$$invalidate(3, eixoY = y);
    	}

    	function posicaoinicial() {
    		for (let i in mapa[1]) {
    			if (mapa[1][i] == 0) {
    				//posi????o inicial do jogador
    				$$invalidate(2, eixoX = i);

    				$$invalidate(3, eixoY = 1);
    				return;
    			}
    		}
    	}

    	posicaoinicial();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nivel1> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		key,
    		code,
    		handleKeydown,
    		mapa,
    		eixoX,
    		eixoY,
    		x,
    		y,
    		incremetarX,
    		incremetarY,
    		decrementarX,
    		decrementarY,
    		ResertarPosicao,
    		IMGmovimentacao: IMGmovimentacao$3,
    		posicaoinicial
    	});

    	$$self.$inject_state = $$props => {
    		if ('key' in $$props) $$invalidate(0, key = $$props.key);
    		if ('code' in $$props) $$invalidate(1, code = $$props.code);
    		if ('mapa' in $$props) $$invalidate(5, mapa = $$props.mapa);
    		if ('eixoX' in $$props) $$invalidate(2, eixoX = $$props.eixoX);
    		if ('eixoY' in $$props) $$invalidate(3, eixoY = $$props.eixoY);
    		if ('x' in $$props) x = $$props.x;
    		if ('y' in $$props) y = $$props.y;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		key,
    		code,
    		eixoX,
    		eixoY,
    		handleKeydown,
    		mapa,
    		incremetarX,
    		incremetarY,
    		decrementarX,
    		decrementarY,
    		ResertarPosicao
    	];
    }

    class Nivel1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nivel1",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\fases-do-jogo\nivel2.svelte generated by Svelte v3.53.1 */

    const file$4 = "src\\fases-do-jogo\\nivel2.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	child_ctx[19] = i;
    	return child_ctx;
    }

    // (95:4) {#if (key)}
    function create_if_block_4$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*code*/ ctx[1] == "ArrowUp") return create_if_block_5$1;
    		if (/*code*/ ctx[1] == "ArrowDown") return create_if_block_6$1;
    		if (/*code*/ ctx[1] == "ArrowLeft") return create_if_block_7$1;
    		if (/*code*/ ctx[1] == "ArrowRight") return create_if_block_8$1;
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
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(95:4) {#if (key)}",
    		ctx
    	});

    	return block;
    }

    // (102:37) 
    function create_if_block_8$1(ctx) {
    	let t_value = /*incremetarX*/ ctx[5]() + "";
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
    		id: create_if_block_8$1.name,
    		type: "if",
    		source: "(102:37) ",
    		ctx
    	});

    	return block;
    }

    // (100:36) 
    function create_if_block_7$1(ctx) {
    	let t_value = /*decrementarX*/ ctx[7]() + "";
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
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(100:36) ",
    		ctx
    	});

    	return block;
    }

    // (98:36) 
    function create_if_block_6$1(ctx) {
    	let t_value = /*incremetarY*/ ctx[6]() + "";
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
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(98:36) ",
    		ctx
    	});

    	return block;
    }

    // (96:4) {#if (code == "ArrowUp")}
    function create_if_block_5$1(ctx) {
    	let t_value = /*decrementarY*/ ctx[8]() + "";
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
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(96:4) {#if (code == \\\"ArrowUp\\\")}",
    		ctx
    	});

    	return block;
    }

    // (117:45) 
    function create_if_block_3$3(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "tabela");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/parede.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			add_location(img, file$4, 117, 36, 4342);
    			attr_dev(th, "id", "parede");
    			add_location(th, file$4, 117, 20, 4326);
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
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(117:45) ",
    		ctx
    	});

    	return block;
    }

    // (115:45) 
    function create_if_block_2$3(ctx) {
    	let th;

    	const block = {
    		c: function create() {
    			th = element("th");
    			attr_dev(th, "id", "vazio");
    			attr_dev(th, "alt", "vazio");
    			add_location(th, file$4, 115, 20, 4225);
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
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(115:45) ",
    		ctx
    	});

    	return block;
    }

    // (113:45) 
    function create_if_block_1$3(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "tabela");
    			if (!src_url_equal(img.src, img_src_value = IMGmovimentacao$2(/*i*/ ctx[16], /*j*/ ctx[19], /*eixoX*/ ctx[2], /*eixoY*/ ctx[3]))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "estrada");
    			add_location(img, file$4, 113, 37, 4076);
    			attr_dev(th, "id", "estrada");
    			add_location(th, file$4, 113, 20, 4059);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*eixoX, eixoY*/ 12 && !src_url_equal(img.src, img_src_value = IMGmovimentacao$2(/*i*/ ctx[16], /*j*/ ctx[19], /*eixoX*/ ctx[2], /*eixoY*/ ctx[3]))) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(113:45) ",
    		ctx
    	});

    	return block;
    }

    // (111:20) {#if (mapa[eixoY][eixoX] != 0)}
    function create_if_block$3(ctx) {
    	let t_value = /*ResertarPosicao*/ ctx[9]() + "";
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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(111:20) {#if (mapa[eixoY][eixoX] != 0)}",
    		ctx
    	});

    	return block;
    }

    // (110:16) {#each regiao as estrada,j}
    function create_each_block_1$2(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*mapa*/ ctx[10][/*eixoY*/ ctx[3]][/*eixoX*/ ctx[2]] != 0) return create_if_block$3;
    		if (/*estrada*/ ctx[17] == 0) return create_if_block_1$3;
    		if (/*estrada*/ ctx[17] == 2) return create_if_block_2$3;
    		if (/*estrada*/ ctx[17] == 1) return create_if_block_3$3;
    	}

    	let current_block_type = select_block_type_1(ctx);
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
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
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
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(110:16) {#each regiao as estrada,j}",
    		ctx
    	});

    	return block;
    }

    // (108:8) {#each mapa as regiao,i}
    function create_each_block$2(ctx) {
    	let tr;
    	let t;
    	let each_value_1 = /*regiao*/ ctx[14];
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
    			add_location(tr, file$4, 108, 12, 3824);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ResertarPosicao, mapa, eixoY, eixoX, IMGmovimentacao*/ 1548) {
    				each_value_1 = /*regiao*/ ctx[14];
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
    		source: "(108:8) {#each mapa as regiao,i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let t;
    	let table;
    	let mounted;
    	let dispose;
    	let if_block = /*key*/ ctx[0] && create_if_block_4$1(ctx);
    	let each_value = /*mapa*/ ctx[10];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(table, "class", "mapa");
    			add_location(table, file$4, 106, 4, 3756);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*handleKeydown*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*key*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_4$1(ctx);
    					if_block.c();
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*mapa, ResertarPosicao, eixoY, eixoX, IMGmovimentacao*/ 1548) {
    				each_value = /*mapa*/ ctx[10];
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
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
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

    function IMGmovimentacao$2(i, j, x, y) {
    	if (y == i && x == j) {
    		return '/css/imagens/Dante.png';
    	} else {
    		return "/css/imagens/estrada-jogo.jpg";
    	}
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Nivel2', slots, []);
    	let key;
    	let code;

    	function handleKeydown(event) {
    		$$invalidate(0, key = event.key);
    		$$invalidate(1, code = event.code);
    	}

    	let eixoX = 0;
    	let eixoY = 0;
    	let x = eixoX;
    	let y = eixoY;

    	function incremetarX() {
    		x = eixoX;
    		y = eixoY;
    		$$invalidate(2, eixoX++, eixoX);
    		$$invalidate(1, code = "d");
    	}

    	function incremetarY() {
    		x = eixoX;
    		y = eixoY;
    		$$invalidate(3, eixoY++, eixoY);
    		$$invalidate(1, code = "w");
    	}

    	function decrementarX() {
    		x = eixoX;
    		y = eixoY;
    		$$invalidate(2, eixoX--, eixoX);
    		$$invalidate(1, code = "a");
    	}

    	function decrementarY() {
    		x = eixoX;
    		y = eixoY;
    		$$invalidate(3, eixoY--, eixoY);
    		$$invalidate(1, code = "s");
    	}

    	//caso o jogador acerte uma parede podera voltar para sua posi????o anterior
    	function ResertarPosicao() {
    		$$invalidate(2, eixoX = x);
    		$$invalidate(3, eixoY = y);
    	}

    	//gerando posi????o inicial do jogador
    	function posicaoinicial() {
    		for (let i in mapa[1]) {
    			if (mapa[1][i] == 0) {
    				//posi????o inicial do jogador
    				$$invalidate(2, eixoX = i);

    				$$invalidate(3, eixoY = 1);
    				return;
    			}
    		}
    	}

    	let mapa = [
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
    			1
    		],
    		[
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
    			1
    		],
    		[
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
    			1
    		],
    		[
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
    			1
    		],
    		[
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
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			2,
    			2,
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
    			2,
    			2,
    			2,
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
    			1
    		],
    		[
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
    			2,
    			2,
    			2,
    			2,
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
    			1
    		],
    		[
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
    			0,
    			0,
    			0,
    			1,
    			2,
    			2,
    			2,
    			2,
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
    			1
    		],
    		[
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
    			1,
    			1,
    			0,
    			1,
    			2,
    			2,
    			2,
    			2,
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
    			1
    		],
    		[
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
    			1,
    			2,
    			2,
    			2,
    			2,
    			2,
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
    			1
    		],
    		[
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
    			1,
    			1
    		],
    		[
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
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
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
    			1
    		],
    		[
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
    			1,
    			1,
    			1,
    			1,
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
    			1
    		],
    		[
    			1,
    			1,
    			1,
    			2,
    			2,
    			2,
    			2,
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
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			1,
    			1,
    			0,
    			1,
    			1
    		],
    		[
    			1,
    			1,
    			1,
    			2,
    			2,
    			2,
    			2,
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
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			1,
    			1,
    			0,
    			1,
    			1
    		],
    		[
    			1,
    			1,
    			1,
    			2,
    			2,
    			2,
    			2,
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
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			1,
    			1,
    			0,
    			1,
    			1
    		],
    		[
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
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			1,
    			1,
    			0,
    			1,
    			1
    		],
    		[
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
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			2,
    			1,
    			1,
    			0,
    			1,
    			1
    		],
    		[
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
    			1,
    			1
    		],
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
    			0,
    			0,
    			1,
    			1
    		],
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
    			2,
    			2,
    			2,
    			2,
    			2,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1
    		],
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
    			0,
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
    			2,
    			2,
    			2,
    			2,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1
    		],
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
    			0,
    			1,
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
    			2,
    			2,
    			2,
    			2,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1
    		]
    	];

    	posicaoinicial();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nivel2> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		key,
    		code,
    		handleKeydown,
    		eixoX,
    		eixoY,
    		x,
    		y,
    		incremetarX,
    		incremetarY,
    		decrementarX,
    		decrementarY,
    		ResertarPosicao,
    		IMGmovimentacao: IMGmovimentacao$2,
    		posicaoinicial,
    		mapa
    	});

    	$$self.$inject_state = $$props => {
    		if ('key' in $$props) $$invalidate(0, key = $$props.key);
    		if ('code' in $$props) $$invalidate(1, code = $$props.code);
    		if ('eixoX' in $$props) $$invalidate(2, eixoX = $$props.eixoX);
    		if ('eixoY' in $$props) $$invalidate(3, eixoY = $$props.eixoY);
    		if ('x' in $$props) x = $$props.x;
    		if ('y' in $$props) y = $$props.y;
    		if ('mapa' in $$props) $$invalidate(10, mapa = $$props.mapa);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		key,
    		code,
    		eixoX,
    		eixoY,
    		handleKeydown,
    		incremetarX,
    		incremetarY,
    		decrementarX,
    		decrementarY,
    		ResertarPosicao,
    		mapa
    	];
    }

    class Nivel2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nivel2",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\fases-do-jogo\nivel3.svelte generated by Svelte v3.53.1 */

    const file$3 = "src\\fases-do-jogo\\nivel3.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (49:45) 
    function create_if_block_3$2(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "tabela");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/parede.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			add_location(img, file$3, 49, 36, 2651);
    			attr_dev(th, "id", "parede");
    			add_location(th, file$3, 49, 20, 2635);
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
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(49:45) ",
    		ctx
    	});

    	return block;
    }

    // (47:45) 
    function create_if_block_2$2(ctx) {
    	let th;

    	const block = {
    		c: function create() {
    			th = element("th");
    			attr_dev(th, "id", "vazio");
    			attr_dev(th, "alt", "vazio");
    			add_location(th, file$3, 47, 20, 2534);
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
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(47:45) ",
    		ctx
    	});

    	return block;
    }

    // (45:45) 
    function create_if_block_1$2(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "tabela");
    			if (!src_url_equal(img.src, img_src_value = IMGmovimentacao(/*i*/ ctx[6], /*j*/ ctx[9], eixoX, eixoY))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "estrada");
    			add_location(img, file$3, 45, 37, 2385);
    			attr_dev(th, "id", "estrada");
    			add_location(th, file$3, 45, 20, 2368);
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
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(45:45) ",
    		ctx
    	});

    	return block;
    }

    // (43:20) {#if (mapa[eixoY][eixoX] != 0)}
    function create_if_block$2(ctx) {
    	let t_value = ResertarPosicao() + "";
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(43:20) {#if (mapa[eixoY][eixoX] != 0)}",
    		ctx
    	});

    	return block;
    }

    // (42:16) {#each regiao as estrada,j}
    function create_each_block_1$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*mapa*/ ctx[0][eixoY][eixoX] != 0) return create_if_block$2;
    		if (/*estrada*/ ctx[7] == 0) return create_if_block_1$2;
    		if (/*estrada*/ ctx[7] == 2) return create_if_block_2$2;
    		if (/*estrada*/ ctx[7] == 1) return create_if_block_3$2;
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
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(42:16) {#each regiao as estrada,j}",
    		ctx
    	});

    	return block;
    }

    // (40:8) {#each mapa as regiao,i}
    function create_each_block$1(ctx) {
    	let tr;
    	let t;
    	let each_value_1 = /*regiao*/ ctx[4];
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
    			attr_dev(tr, "class", "linhasdatabela");
    			add_location(tr, file$3, 40, 12, 2133);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ResertarPosicao, mapa, eixoY, eixoX, IMGmovimentacao*/ 1) {
    				each_value_1 = /*regiao*/ ctx[4];
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(40:8) {#each mapa as regiao,i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let table;
    	let each_value = /*mapa*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(table, "class", "mapa");
    			add_location(table, file$3, 38, 4, 2065);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*mapa, ResertarPosicao, eixoY, eixoX, IMGmovimentacao*/ 1) {
    				each_value = /*mapa*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
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

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Nivel3', slots, []);
    	let key;
    	let code;

    	function handleKeydown(event) {
    		key = event.key;
    		code = event.code;
    	}

    	let mapa = [
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
    			1
    		],
    		[
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
    			1
    		],
    		[
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
    			0,
    			0,
    			1
    		],
    		[
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
    			0,
    			1
    		],
    		[
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
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			2,
    			2,
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
    			0,
    			1
    		],
    		[
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
    			0,
    			1,
    			2,
    			2,
    			2,
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
    			1
    		],
    		[
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
    			2,
    			2,
    			2,
    			2,
    			2,
    			0,
    			2,
    			2,
    			2,
    			2,
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
    			1
    		],
    		[
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
    			2,
    			2,
    			2,
    			2,
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
    			1
    		],
    		[
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
    			0,
    			0,
    			0,
    			0,
    			0,
    			2,
    			2,
    			2,
    			2,
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
    			1
    		],
    		[
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
    			1,
    			1,
    			0,
    			1,
    			2,
    			2,
    			2,
    			2,
    			2,
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
    			1
    		],
    		[
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
    			1,
    			2,
    			2,
    			2,
    			2,
    			2,
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
    			1
    		],
    		[
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
    			1,
    			1
    		],
    		[
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
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
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
    			1
    		],
    		[
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
    			1
    		],
    		[
    			1,
    			1,
    			1,
    			2,
    			2,
    			2,
    			2,
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
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1
    		],
    		[
    			1,
    			1,
    			1,
    			2,
    			2,
    			2,
    			2,
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
    			1
    		],
    		[
    			1,
    			1,
    			1,
    			2,
    			2,
    			2,
    			2,
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
    			1
    		],
    		[
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
    			1
    		],
    		[
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
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			1
    		],
    		[
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
    			1,
    			1
    		],
    		[
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
    			0,
    			0,
    			1,
    			1
    		],
    		[
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
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			0,
    			0,
    			2,
    			2,
    			2,
    			2,
    			2,
    			1,
    			0,
    			0,
    			1,
    			1,
    			1
    		],
    		[
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
    			0,
    			0,
    			2,
    			2,
    			2,
    			2,
    			0,
    			0,
    			1,
    			1,
    			1,
    			1
    		],
    		[
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
    			1,
    			1,
    			0,
    			2,
    			2,
    			2,
    			2,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1
    		]
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nivel3> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ key, code, handleKeydown, mapa });

    	$$self.$inject_state = $$props => {
    		if ('key' in $$props) key = $$props.key;
    		if ('code' in $$props) code = $$props.code;
    		if ('mapa' in $$props) $$invalidate(0, mapa = $$props.mapa);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [mapa];
    }

    class Nivel3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nivel3",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\Vitoria.svelte generated by Svelte v3.53.1 */
    const file$2 = "src\\Vitoria.svelte";

    function create_fragment$2(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Parabens, vc venceu!!!";
    			attr_dev(h1, "class", "svelte-hs3cu0");
    			add_location(h1, file$2, 11, 0, 203);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Vitoria",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\jogo.svelte generated by Svelte v3.53.1 */
    const file$1 = "src\\jogo.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[17] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[20] = i;
    	return child_ctx;
    }

    // (135:0) {#if (key)}
    function create_if_block_11(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*code*/ ctx[1] == "ArrowUp") return create_if_block_12;
    		if (/*code*/ ctx[1] == "ArrowDown") return create_if_block_13;
    		if (/*code*/ ctx[1] == "ArrowLeft") return create_if_block_14;
    		if (/*code*/ ctx[1] == "ArrowRight") return create_if_block_15;
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
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(135:0) {#if (key)}",
    		ctx
    	});

    	return block;
    }

    // (142:45) 
    function create_if_block_15(ctx) {
    	let t_value = /*incremetarX*/ ctx[6]() + "";
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
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(142:45) ",
    		ctx
    	});

    	return block;
    }

    // (140:44) 
    function create_if_block_14(ctx) {
    	let t_value = /*decrementarX*/ ctx[8]() + "";
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
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(140:44) ",
    		ctx
    	});

    	return block;
    }

    // (138:44) 
    function create_if_block_13(ctx) {
    	let t_value = /*incremetarY*/ ctx[7]() + "";
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
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(138:44) ",
    		ctx
    	});

    	return block;
    }

    // (136:12) {#if (code == "ArrowUp")}
    function create_if_block_12(ctx) {
    	let t_value = /*decrementarY*/ ctx[9]() + "";
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
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(136:12) {#if (code == \\\"ArrowUp\\\")}",
    		ctx
    	});

    	return block;
    }

    // (178:26) 
    function create_if_block_10(ctx) {
    	let vitoria;
    	let current;
    	vitoria = new Vitoria({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(vitoria.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(vitoria, target, anchor);
    			current = true;
    		},
    		p: noop,
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
    			destroy_component(vitoria, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(178:26) ",
    		ctx
    	});

    	return block;
    }

    // (176:26) 
    function create_if_block_9(ctx) {
    	let fase3;
    	let current;
    	fase3 = new Nivel3({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(fase3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(fase3, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fase3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fase3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(fase3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(176:26) ",
    		ctx
    	});

    	return block;
    }

    // (174:26) 
    function create_if_block_8(ctx) {
    	let fase2;
    	let current;
    	fase2 = new Nivel2({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(fase2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(fase2, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fase2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fase2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(fase2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(174:26) ",
    		ctx
    	});

    	return block;
    }

    // (172:26) 
    function create_if_block_7(ctx) {
    	let fase1;
    	let current;
    	fase1 = new Nivel1({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(fase1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(fase1, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fase1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fase1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(fase1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(172:26) ",
    		ctx
    	});

    	return block;
    }

    // (148:0) {#if (contador == 0)}
    function create_if_block$1(ctx) {
    	let table;
    	let each_value = /*mapa*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(table, "class", "mapa");
    			add_location(table, file$1, 150, 0, 5162);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*mapa, proximafase, eixoY, eixoX, ResertarPosicao, IMGmovimentacao*/ 1068) {
    				each_value = /*mapa*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(148:0) {#if (contador == 0)}",
    		ctx
    	});

    	return block;
    }

    // (165:33) 
    function create_if_block_6(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "tabela");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paradeamalera1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			add_location(img, file$1, 165, 24, 5852);
    			attr_dev(th, "id", "parede");
    			add_location(th, file$1, 165, 8, 5836);
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
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(165:33) ",
    		ctx
    	});

    	return block;
    }

    // (163:33) 
    function create_if_block_5(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "tabela");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredeamalera1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			add_location(img, file$1, 163, 24, 5715);
    			attr_dev(th, "id", "parede");
    			add_location(th, file$1, 163, 8, 5699);
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
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(163:33) ",
    		ctx
    	});

    	return block;
    }

    // (161:33) 
    function create_if_block_4(ctx) {
    	let th;

    	const block = {
    		c: function create() {
    			th = element("th");
    			attr_dev(th, "id", "vazio");
    			attr_dev(th, "alt", "vazio");
    			add_location(th, file$1, 161, 8, 5622);
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
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(161:33) ",
    		ctx
    	});

    	return block;
    }

    // (159:33) 
    function create_if_block_3$1(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "tabela");
    			if (!src_url_equal(img.src, img_src_value = IMGmovimentacao$1(/*i*/ ctx[17], /*j*/ ctx[20], /*eixoX*/ ctx[2], /*eixoY*/ ctx[3]))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "estrada");
    			add_location(img, file$1, 159, 25, 5497);
    			attr_dev(th, "id", "estrada");
    			add_location(th, file$1, 159, 8, 5480);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*eixoX, eixoY*/ 12 && !src_url_equal(img.src, img_src_value = IMGmovimentacao$1(/*i*/ ctx[17], /*j*/ ctx[20], /*eixoX*/ ctx[2], /*eixoY*/ ctx[3]))) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(159:33) ",
    		ctx
    	});

    	return block;
    }

    // (157:44) 
    function create_if_block_2$1(ctx) {
    	let t_value = /*ResertarPosicao*/ ctx[10]() + "";
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
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(157:44) ",
    		ctx
    	});

    	return block;
    }

    // (155:8) {#if (mapa[eixoY][eixoX] == "V")}
    function create_if_block_1$1(ctx) {
    	let t_value = proximafase(/*mapa*/ ctx[5][/*eixoY*/ ctx[3]][/*eixoX*/ ctx[2]]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*eixoY, eixoX*/ 12 && t_value !== (t_value = proximafase(/*mapa*/ ctx[5][/*eixoY*/ ctx[3]][/*eixoX*/ ctx[2]]) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(155:8) {#if (mapa[eixoY][eixoX] == \\\"V\\\")}",
    		ctx
    	});

    	return block;
    }

    // (154:4) {#each regiao as estrada,j}
    function create_each_block_1(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*mapa*/ ctx[5][/*eixoY*/ ctx[3]][/*eixoX*/ ctx[2]] == "V") return create_if_block_1$1;
    		if (/*mapa*/ ctx[5][/*eixoY*/ ctx[3]][/*eixoX*/ ctx[2]] != 0) return create_if_block_2$1;
    		if (/*estrada*/ ctx[18] == 0) return create_if_block_3$1;
    		if (/*estrada*/ ctx[18] == 2) return create_if_block_4;
    		if (/*estrada*/ ctx[18] == 1) return create_if_block_5;
    		if (/*estrada*/ ctx[18] == 3) return create_if_block_6;
    	}

    	let current_block_type = select_block_type_2(ctx);
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
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
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
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(154:4) {#each regiao as estrada,j}",
    		ctx
    	});

    	return block;
    }

    // (152:4) {#each mapa as regiao,i}
    function create_each_block(ctx) {
    	let tr;
    	let t;
    	let each_value_1 = /*regiao*/ ctx[15];
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
    			attr_dev(tr, "class", "linhasdatabela");
    			add_location(tr, file$1, 152, 0, 5214);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*proximafase, mapa, eixoY, eixoX, ResertarPosicao, IMGmovimentacao*/ 1068) {
    				each_value_1 = /*regiao*/ ctx[15];
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(152:4) {#each mapa as regiao,i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
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
    	let if_block0 = /*key*/ ctx[0] && create_if_block_11(ctx);

    	const if_block_creators = [
    		create_if_block$1,
    		create_if_block_7,
    		create_if_block_8,
    		create_if_block_9,
    		create_if_block_10
    	];

    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (contador == 0) return 0;
    		if (contador == 1) return 1;
    		if (contador == 2) return 2;
    		if (contador == 3) return 3;
    		if (contador == 4) return 4;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1())) {
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
    			add_location(link, file$1, 128, 4, 4594);
    			add_location(head, file$1, 127, 0, 4582);
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
    				dispose = listen_dev(window, "keydown", /*handleKeydown*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*key*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_11(ctx);
    					if_block0.c();
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (if_block1) if_block1.p(ctx, dirty);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function IMGmovimentacao$1(i, j, x, y) {
    	if (y == i && x == j) {
    		return '/css/imagens/Dante.png';
    	} else {
    		return "/css/imagens/chaum.png";
    	}
    }

    function instance$1($$self, $$props, $$invalidate) {
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

    	//mapa:
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
    			"V"
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
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
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

    	//variaveis de movimenta????o:
    	let eixoX = 0;

    	let eixoY = 0;
    	let x = eixoX;
    	let y = eixoY;

    	//incrementa????o e decrementa????o
    	function incremetarX() {
    		x = eixoX;
    		y = eixoY;
    		$$invalidate(2, eixoX++, eixoX);
    		$$invalidate(1, code = "d");
    	}

    	function incremetarY() {
    		x = eixoX;
    		y = eixoY;
    		$$invalidate(3, eixoY++, eixoY);
    		$$invalidate(1, code = "w");
    	}

    	function decrementarX() {
    		x = eixoX;
    		y = eixoY;
    		$$invalidate(2, eixoX--, eixoX);
    		$$invalidate(1, code = "a");
    	}

    	function decrementarY() {
    		x = eixoX;
    		y = eixoY;
    		$$invalidate(3, eixoY--, eixoY);
    		$$invalidate(1, code = "s");
    	}

    	//caso o jogador acerte uma parede podera voltar para sua posi????o anterior
    	function ResertarPosicao() {
    		$$invalidate(2, eixoX = x);
    		$$invalidate(3, eixoY = y);
    	}

    	//gerando posi????o inicial do jogador
    	function posicaoinicial() {
    		for (let i in mapa[1]) {
    			if (mapa[1][i] == 0) {
    				//posi????o inicial do jogador
    				$$invalidate(2, eixoX = i);

    				$$invalidate(3, eixoY = 1);
    				return;
    			}
    		}
    	}

    	//registro ainda sem utiliza????o
    	class personagem {
    		constructor(body, moves) {
    			this.body = body;
    			this.moves = moves;
    		}
    	}

    	posicaoinicial();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Jogo> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Fase1: Nivel1,
    		Fase2: Nivel2,
    		Fase3: Nivel3,
    		Vitoria,
    		estado,
    		trocarEstadoDoJogo,
    		VoltarMenu,
    		contador,
    		proximafase,
    		key,
    		code,
    		handleKeydown,
    		mapa,
    		eixoX,
    		eixoY,
    		x,
    		y,
    		incremetarX,
    		incremetarY,
    		decrementarX,
    		decrementarY,
    		ResertarPosicao,
    		IMGmovimentacao: IMGmovimentacao$1,
    		posicaoinicial,
    		personagem
    	});

    	$$self.$inject_state = $$props => {
    		if ('key' in $$props) $$invalidate(0, key = $$props.key);
    		if ('code' in $$props) $$invalidate(1, code = $$props.code);
    		if ('mapa' in $$props) $$invalidate(5, mapa = $$props.mapa);
    		if ('eixoX' in $$props) $$invalidate(2, eixoX = $$props.eixoX);
    		if ('eixoY' in $$props) $$invalidate(3, eixoY = $$props.eixoY);
    		if ('x' in $$props) x = $$props.x;
    		if ('y' in $$props) y = $$props.y;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		key,
    		code,
    		eixoX,
    		eixoY,
    		handleKeydown,
    		mapa,
    		incremetarX,
    		incremetarY,
    		decrementarX,
    		decrementarY,
    		ResertarPosicao
    	];
    }

    class Jogo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Jogo",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.53.1 */
    const file = "src\\App.svelte";

    // (20:29) 
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
    		source: "(20:29) ",
    		ctx
    	});

    	return block;
    }

    // (18:30) 
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
    		source: "(18:30) ",
    		ctx
    	});

    	return block;
    }

    // (16:30) 
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
    		source: "(16:30) ",
    		ctx
    	});

    	return block;
    }

    // (14:0) {#if $estado === 'menu'}
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
    		source: "(14:0) {#if $estado === 'menu'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let head;
    	let link;
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
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
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/css/appsvelte.css");
    			add_location(link, file, 10, 1, 269);
    			add_location(head, file, 9, 0, 260);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, head, anchor);
    			append_dev(head, link);
    			insert_dev(target, t, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
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
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if (detaching) detach_dev(t);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
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
