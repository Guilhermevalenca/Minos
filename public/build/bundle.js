
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
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

    const subscriber_queue = [];
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

    // o estado do jogo guarda a informação sobre a tela questamos no momento
    let estado = writable('menu');

    function trocarEstadoDoJogo(novoEstado) {
    	estado.set(novoEstado);
    }

    /* src/VoltarMenu.svelte generated by Svelte v3.53.1 */
    const file$7 = "src/VoltarMenu.svelte";

    function create_fragment$7(ctx) {
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
    			add_location(link, file$7, 5, 1, 78);
    			add_location(head, file$7, 4, 0, 70);
    			attr_dev(p, "class", "pmenu");
    			add_location(p, file$7, 8, 88, 220);
    			attr_dev(button, "class", "buttonapp");
    			add_location(button, file$7, 8, 18, 150);
    			attr_dev(ul, "class", "ulapp");
    			add_location(ul, file$7, 8, 0, 132);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VoltarMenu",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/ajuda.svelte generated by Svelte v3.53.1 */
    const file$6 = "src/ajuda.svelte";

    function create_fragment$6(ctx) {
    	let head;
    	let link;
    	let t0;
    	let voltarmenu;
    	let t1;
    	let div0;
    	let ul0;
    	let h2;
    	let t3;
    	let ul1;
    	let t5;
    	let ul2;
    	let t7;
    	let ul3;
    	let t9;
    	let ul4;
    	let t11;
    	let div1;
    	let ul5;
    	let button0;
    	let t13;
    	let ul6;
    	let button1;
    	let t15;
    	let button2;
    	let t17;
    	let ul7;
    	let button3;
    	let t19;
    	let div2;
    	let ul8;
    	let button4;
    	let t21;
    	let ul9;
    	let button5;
    	let button6;
    	let t24;
    	let ul10;
    	let button7;
    	let t26;
    	let h3;
    	let t28;
    	let p0;
    	let t30;
    	let p1;
    	let t32;
    	let p2;
    	let t34;
    	let p3;
    	let t36;
    	let p4;
    	let t38;
    	let p5;
    	let t40;
    	let p6;
    	let t42;
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
    			div0 = element("div");
    			ul0 = element("ul");
    			h2 = element("h2");
    			h2.textContent = "Como jogar?";
    			t3 = space();
    			ul1 = element("ul");
    			ul1.textContent = "↟ ou W para Cima";
    			t5 = space();
    			ul2 = element("ul");
    			ul2.textContent = "↡ ou S para Baixo";
    			t7 = space();
    			ul3 = element("ul");
    			ul3.textContent = "↠ ou D para a Direita";
    			t9 = space();
    			ul4 = element("ul");
    			ul4.textContent = "↞ ou A para a Esquerda";
    			t11 = space();
    			div1 = element("div");
    			ul5 = element("ul");
    			button0 = element("button");
    			button0.textContent = "↟";
    			t13 = space();
    			ul6 = element("ul");
    			button1 = element("button");
    			button1.textContent = "↞";
    			t15 = space();
    			button2 = element("button");
    			button2.textContent = "↠";
    			t17 = space();
    			ul7 = element("ul");
    			button3 = element("button");
    			button3.textContent = "↡";
    			t19 = space();
    			div2 = element("div");
    			ul8 = element("ul");
    			button4 = element("button");
    			button4.textContent = "W";
    			t21 = space();
    			ul9 = element("ul");
    			button5 = element("button");
    			button5.textContent = "A";
    			button6 = element("button");
    			button6.textContent = "D";
    			t24 = space();
    			ul10 = element("ul");
    			button7 = element("button");
    			button7.textContent = "S";
    			t26 = space();
    			h3 = element("h3");
    			h3.textContent = "Olá, querido humano.";
    			t28 = space();
    			p0 = element("p");
    			p0.textContent = "Se você chegou aqui, temo que já esteja em um território perigoso.";
    			t30 = space();
    			p1 = element("p");
    			p1.textContent = "Humanos não deveriam arriscar tanto suas vidas, será que sua curiosidade vale tanto assim?";
    			t32 = space();
    			p2 = element("p");
    			p2.textContent = "Deseja um conselho?";
    			t34 = space();
    			p3 = element("p");
    			p3.textContent = "Não seja guiado por suas emoções,";
    			t36 = space();
    			p4 = element("p");
    			p4.textContent = "o tempo não é seu amigo.";
    			t38 = space();
    			p5 = element("p");
    			p5.textContent = "Não olhe para trás ou tente voltar.";
    			t40 = space();
    			p6 = element("p");
    			p6.textContent = "Fique atento e ouça bem o que lhe rodeia.";
    			t42 = space();
    			h4 = element("h4");
    			h4.textContent = "Sua curiosidade pode ser sua maior perdição, \r\n    preste atenção nas entrelinhas e proteja sua retaguarda.";
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/css/ajuda.css");
    			add_location(link, file$6, 5, 4, 86);
    			add_location(head, file$6, 4, 0, 74);
    			attr_dev(h2, "class", "h2");
    			add_location(h2, file$6, 11, 8, 218);
    			add_location(ul0, file$6, 11, 4, 214);
    			attr_dev(ul1, "class", "info");
    			add_location(ul1, file$6, 12, 4, 260);
    			attr_dev(ul2, "class", "info");
    			add_location(ul2, file$6, 13, 4, 304);
    			attr_dev(ul3, "class", "info");
    			add_location(ul3, file$6, 14, 4, 349);
    			attr_dev(ul4, "class", "info");
    			add_location(ul4, file$6, 15, 4, 398);
    			attr_dev(div0, "class", "aimds");
    			add_location(div0, file$6, 10, 0, 189);
    			attr_dev(button0, "id", "button");
    			attr_dev(button0, "class", "botaum");
    			add_location(button0, file$6, 19, 8, 488);
    			add_location(ul5, file$6, 19, 4, 484);
    			attr_dev(button1, "class", "botao2");
    			add_location(button1, file$6, 20, 8, 548);
    			attr_dev(button2, "class", "botao3");
    			add_location(button2, file$6, 20, 42, 582);
    			add_location(ul6, file$6, 20, 4, 544);
    			attr_dev(button3, "id", "button");
    			attr_dev(button3, "class", "buteum");
    			add_location(button3, file$6, 21, 8, 630);
    			add_location(ul7, file$6, 21, 4, 626);
    			attr_dev(div1, "class", "divbutton1");
    			add_location(div1, file$6, 18, 0, 454);
    			attr_dev(button4, "id", "button");
    			attr_dev(button4, "class", "botaum");
    			add_location(button4, file$6, 24, 8, 724);
    			add_location(ul8, file$6, 24, 4, 720);
    			attr_dev(button5, "class", "botao2");
    			add_location(button5, file$6, 25, 8, 784);
    			attr_dev(button6, "class", "botao3");
    			add_location(button6, file$6, 25, 41, 817);
    			add_location(ul9, file$6, 25, 4, 780);
    			attr_dev(button7, "id", "button");
    			attr_dev(button7, "class", "buteum");
    			add_location(button7, file$6, 26, 8, 865);
    			add_location(ul10, file$6, 26, 4, 861);
    			attr_dev(div2, "class", "divbutton2");
    			add_location(div2, file$6, 23, 0, 690);
    			attr_dev(h3, "class", "h3ajuda");
    			add_location(h3, file$6, 29, 0, 927);
    			add_location(p0, file$6, 30, 0, 974);
    			add_location(p1, file$6, 31, 0, 1049);
    			add_location(p2, file$6, 32, 0, 1148);
    			add_location(p3, file$6, 33, 0, 1176);
    			add_location(p4, file$6, 34, 0, 1218);
    			add_location(p5, file$6, 35, 0, 1251);
    			add_location(p6, file$6, 36, 0, 1295);
    			add_location(h4, file$6, 38, 0, 1347);
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
    			insert_dev(target, div0, anchor);
    			append_dev(div0, ul0);
    			append_dev(ul0, h2);
    			append_dev(div0, t3);
    			append_dev(div0, ul1);
    			append_dev(div0, t5);
    			append_dev(div0, ul2);
    			append_dev(div0, t7);
    			append_dev(div0, ul3);
    			append_dev(div0, t9);
    			append_dev(div0, ul4);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, ul5);
    			append_dev(ul5, button0);
    			append_dev(div1, t13);
    			append_dev(div1, ul6);
    			append_dev(ul6, button1);
    			append_dev(ul6, t15);
    			append_dev(ul6, button2);
    			append_dev(div1, t17);
    			append_dev(div1, ul7);
    			append_dev(ul7, button3);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, ul8);
    			append_dev(ul8, button4);
    			append_dev(div2, t21);
    			append_dev(div2, ul9);
    			append_dev(ul9, button5);
    			append_dev(ul9, button6);
    			append_dev(div2, t24);
    			append_dev(div2, ul10);
    			append_dev(ul10, button7);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t28, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t30, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t32, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t34, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t36, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t38, anchor);
    			insert_dev(target, p5, anchor);
    			insert_dev(target, t40, anchor);
    			insert_dev(target, p6, anchor);
    			insert_dev(target, t42, anchor);
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
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t28);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t30);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t32);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t34);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t36);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t38);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t40);
    			if (detaching) detach_dev(p6);
    			if (detaching) detach_dev(t42);
    			if (detaching) detach_dev(h4);
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ajuda",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/menu.svelte generated by Svelte v3.53.1 */
    const file$5 = "src/menu.svelte";

    function create_fragment$5(ctx) {
    	let head;
    	let link;
    	let t0;
    	let h1;
    	let t2;
    	let p0;
    	let t4;
    	let div;
    	let ul0;
    	let button0;
    	let p1;
    	let t6;
    	let ul1;
    	let button1;
    	let p2;
    	let t8;
    	let ul2;
    	let button2;
    	let p3;
    	let t10;
    	let ul3;
    	let button3;
    	let p4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			head = element("head");
    			link = element("link");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Minos";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "Labyrinth";
    			t4 = space();
    			div = element("div");
    			ul0 = element("ul");
    			button0 = element("button");
    			p1 = element("p");
    			p1.textContent = "Jogar";
    			t6 = space();
    			ul1 = element("ul");
    			button1 = element("button");
    			p2 = element("p");
    			p2.textContent = "Como jogar";
    			t8 = space();
    			ul2 = element("ul");
    			button2 = element("button");
    			p3 = element("p");
    			p3.textContent = "Sobre";
    			t10 = space();
    			ul3 = element("ul");
    			button3 = element("button");
    			p4 = element("p");
    			p4.textContent = "Créditos";
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/css/menu.css");
    			add_location(link, file$5, 4, 4, 82);
    			add_location(head, file$5, 3, 0, 70);
    			attr_dev(h1, "class", "h1menu");
    			add_location(h1, file$5, 7, 0, 136);
    			attr_dev(p0, "class", "pmenu");
    			add_location(p0, file$5, 8, 0, 166);
    			attr_dev(p1, "class", "pmenu");
    			add_location(p1, file$5, 12, 94, 317);
    			attr_dev(button0, "class", "buttonapp");
    			add_location(button0, file$5, 12, 22, 245);
    			attr_dev(ul0, "class", "ulapp");
    			add_location(ul0, file$5, 12, 4, 227);
    			attr_dev(p2, "class", "pmenu");
    			add_location(p2, file$5, 13, 94, 452);
    			attr_dev(button1, "class", "buttonapp");
    			add_location(button1, file$5, 13, 22, 380);
    			attr_dev(ul1, "class", "ulapp");
    			add_location(ul1, file$5, 13, 4, 362);
    			attr_dev(p3, "class", "pmenu");
    			add_location(p3, file$5, 14, 94, 592);
    			attr_dev(button2, "class", "buttonapp");
    			add_location(button2, file$5, 14, 22, 520);
    			attr_dev(ul2, "class", "ulapp");
    			add_location(ul2, file$5, 14, 4, 502);
    			attr_dev(p4, "class", "pmenu");
    			add_location(p4, file$5, 15, 96, 729);
    			attr_dev(button3, "class", "buttonapp");
    			add_location(button3, file$5, 15, 22, 655);
    			attr_dev(ul3, "class", "ulapp");
    			add_location(ul3, file$5, 15, 4, 637);
    			attr_dev(div, "class", "divapp");
    			add_location(div, file$5, 11, 0, 202);
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
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, ul0);
    			append_dev(ul0, button0);
    			append_dev(button0, p1);
    			append_dev(div, t6);
    			append_dev(div, ul1);
    			append_dev(ul1, button1);
    			append_dev(button1, p2);
    			append_dev(div, t8);
    			append_dev(div, ul2);
    			append_dev(ul2, button2);
    			append_dev(button2, p3);
    			append_dev(div, t10);
    			append_dev(div, ul3);
    			append_dev(ul3, button3);
    			append_dev(button3, p4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[0], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[1], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[2], false, false, false),
    					listen_dev(button3, "click", /*click_handler_3*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(head);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots('Menu', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => trocarEstadoDoJogo('jogar');
    	const click_handler_1 = () => trocarEstadoDoJogo('ajuda');
    	const click_handler_2 = () => trocarEstadoDoJogo('sobre');
    	const click_handler_3 = () => trocarEstadoDoJogo('creditos');
    	$$self.$capture_state = () => ({ trocarEstadoDoJogo });
    	return [click_handler, click_handler_1, click_handler_2, click_handler_3];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/sobre.svelte generated by Svelte v3.53.1 */
    const file$4 = "src/sobre.svelte";

    function create_fragment$4(ctx) {
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
    	let p1;
    	let t9;
    	let h12;
    	let t11;
    	let h20;
    	let t13;
    	let p2;
    	let h21;
    	let t16;
    	let p3;
    	let t18;
    	let h22;
    	let t20;
    	let p4;
    	let t22;
    	let h23;
    	let t24;
    	let p5;
    	let t26;
    	let h24;
    	let t28;
    	let p6;
    	let t30;
    	let h13;
    	let t32;
    	let h25;
    	let t34;
    	let p7;
    	let t35;
    	let br;
    	let t36;
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
    			h11.textContent = "Experiência do Grupo";
    			t7 = space();
    			p1 = element("p");
    			p1.textContent = "Pela convivência do semestre letivo tinhamos um bom entrosamento que contribuiu para um bom desempenho em equipe,\r\n    sempre tentando ouvir uns aos outros e ajudar nas dificuldades individuais de cada um. \r\n    Apesar de diversas complicações durante o processo de criação, conseguimos lidar com os problemas e entregar nosso projeto do jeito que desejávamos.";
    			t9 = space();
    			h12 = element("h1");
    			h12.textContent = "Os Deuses:";
    			t11 = space();
    			h20 = element("h2");
    			h20.textContent = "Alice Manguinho";
    			t13 = space();
    			p2 = element("p");
    			p2.textContent = "Foi muito interessante participar da criação do minos. Por nunca ter tido contato com programação, tive dificuldades com CSS e com a lógica da página do jogo, mas com o apoio e auxílio da equipe conseguimos finalizar o projeto do jeito que tanto idealizamos durante os meses. A persistêcia nos levou a realizaçâo de nossos objetivos.\r\n\r\n ";
    			h21 = element("h2");
    			h21.textContent = "Assíria Renara";
    			t16 = space();
    			p3 = element("p");
    			p3.textContent = "Foi muito divertido o processo de criação dos personagens, frases, história e tudo mais; porém a programação foi o que mais me deu dor de cabeça por ter sido o meu primeiro contato com essa área. Ainda assim, gostei. A experiência se tornou melhor porque tive a ajuda do meu grupo, creio eu que o resultado ficou ótimo e conseguimos fazer um excelente jogo.";
    			t18 = space();
    			h22 = element("h2");
    			h22.textContent = "Claudiane Rodrigues";
    			t20 = space();
    			p4 = element("p");
    			p4.textContent = "Adorei a experiência de estar programando um jogo (apesar de todo o estresse com coisas dando errado e de trabalhar com front) e sinceramente nunca imaginei que gostaria disso...eu diria que eu descobri uma parte de mim que eu não conhecia ainda, aprendi coisas que não sabia, coloquei em prática coisas que sabia mas ainda não havia colocado em prática,testei minhas habilidades. Enfim... Espero que gostem do nosso jogo :)";
    			t22 = space();
    			h23 = element("h2");
    			h23.textContent = "Emmily Kathylen";
    			t24 = space();
    			p5 = element("p");
    			p5.textContent = "Participar desse projeto foi de longe a melhor experiência que já tive, apesar de ser nova no ramo da programação gostei muito de aprender o funcionamento por trás do jogo. Tive dificuldades no inicio porém com a ajuda e apoio da equipe conseguimos aprender muita coisa e praticar. Por fim, gostei muito de ter participado e colocado em pratica o que aprendi espero que vocês gostem do nosso jogo e se divirtam assim como nos divertimos.";
    			t26 = space();
    			h24 = element("h2");
    			h24.textContent = "Guilherme Valença";
    			t28 = space();
    			p6 = element("p");
    			p6.textContent = "Gostei bastante da experiência de ter participado da criação desse jogo. Tive diversos aprendizados, vi alguns dos meus pontos fortes e fracos, houveram grandes complicações no caminho,mas também houveram grandes descobertas. Ver o jogo ainda sem forma ganhando vida ao longo dos dias foi simplesmente sensacional, e mesmo com tantas dores de cabeça, foi uma ótima experiência para minha pessoa na área da programação mesmo com todos os altos e baixos. Espero que possam se divertir com nosso tão sonhado Minos, pode não estar perfeito, mas com certeza foi uma das coisas mais desafiadoras que já tive que fazer.  Agradeço a todo meu grupo por estarem empenhados a fazer acontecer e espero que gostem, e aproveitem ao máximo todas as mecânicas e desafios que nosso jogo tem a oferecer.";
    			t30 = space();
    			h13 = element("h1");
    			h13.textContent = "Mestre:";
    			t32 = space();
    			h25 = element("h2");
    			h25.textContent = "Allan Lima";
    			t34 = space();
    			p7 = element("p");
    			t35 = text("Professor Responsável ");
    			br = element("br");
    			t36 = text(" allan.lima@igarassu.ifpe.edu.br");
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/css/sobre.css");
    			add_location(link, file$4, 5, 4, 98);
    			add_location(head, file$4, 4, 0, 86);
    			attr_dev(h10, "class", "sobreh1");
    			add_location(h10, file$4, 7, 0, 154);
    			attr_dev(p0, "class", "fic");
    			add_location(p0, file$4, 9, 0, 197);
    			attr_dev(h11, "class", "sobreh1");
    			add_location(h11, file$4, 24, 0, 1810);
    			add_location(p1, file$4, 26, 0, 1861);
    			attr_dev(h12, "class", "sobreh1");
    			add_location(h12, file$4, 32, 0, 2238);
    			add_location(h20, file$4, 34, 0, 2277);
    			add_location(p2, file$4, 36, 0, 2305);
    			add_location(h21, file$4, 38, 1, 2646);
    			add_location(p3, file$4, 40, 1, 2674);
    			add_location(h22, file$4, 42, 1, 3049);
    			add_location(p4, file$4, 43, 1, 3080);
    			add_location(h23, file$4, 45, 1, 3517);
    			add_location(p5, file$4, 46, 0, 3543);
    			add_location(h24, file$4, 48, 1, 3992);
    			add_location(p6, file$4, 49, 0, 4020);
    			attr_dev(h13, "class", "sobreh1");
    			add_location(h13, file$4, 51, 1, 4817);
    			add_location(h25, file$4, 53, 3, 4856);
    			add_location(br, file$4, 54, 29, 4906);
    			add_location(p7, file$4, 54, 4, 4881);
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
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, h12, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, h20, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, h21, anchor);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, h22, anchor);
    			insert_dev(target, t20, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, h23, anchor);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, p5, anchor);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, h24, anchor);
    			insert_dev(target, t28, anchor);
    			insert_dev(target, p6, anchor);
    			insert_dev(target, t30, anchor);
    			insert_dev(target, h13, anchor);
    			insert_dev(target, t32, anchor);
    			insert_dev(target, h25, anchor);
    			insert_dev(target, t34, anchor);
    			insert_dev(target, p7, anchor);
    			append_dev(p7, t35);
    			append_dev(p7, br);
    			append_dev(p7, t36);
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
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(h12);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(h20);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(h21);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(h22);
    			if (detaching) detach_dev(t20);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(h23);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(h24);
    			if (detaching) detach_dev(t28);
    			if (detaching) detach_dev(p6);
    			if (detaching) detach_dev(t30);
    			if (detaching) detach_dev(h13);
    			if (detaching) detach_dev(t32);
    			if (detaching) detach_dev(h25);
    			if (detaching) detach_dev(t34);
    			if (detaching) detach_dev(p7);
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sobre",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Vitoria.svelte generated by Svelte v3.53.1 */

    const file$3 = "src/Vitoria.svelte";

    function create_fragment$3(ctx) {
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
    			add_location(h1, file$3, 23, 0, 640);
    			attr_dev(h30, "class", "svelte-q0fwci");
    			add_location(h30, file$3, 25, 0, 668);
    			attr_dev(h31, "class", "svelte-q0fwci");
    			add_location(h31, file$3, 26, 0, 710);
    			attr_dev(h32, "class", "svelte-q0fwci");
    			add_location(h32, file$3, 27, 0, 834);
    			attr_dev(h33, "class", "svelte-q0fwci");
    			add_location(h33, file$3, 28, 0, 926);
    			attr_dev(h34, "class", "svelte-q0fwci");
    			add_location(h34, file$3, 29, 0, 1035);
    			attr_dev(h35, "class", "svelte-q0fwci");
    			add_location(h35, file$3, 30, 0, 1136);
    			attr_dev(h36, "class", "svelte-q0fwci");
    			add_location(h36, file$3, 31, 0, 1194);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Vitoria', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Vitoria> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Vitoria extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Vitoria",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/creditos.svelte generated by Svelte v3.53.1 */
    const file$2 = "src/creditos.svelte";

    function create_fragment$2(ctx) {
    	let head;
    	let link0;
    	let t0;
    	let link1;
    	let t1;
    	let h40;
    	let t3;
    	let p0;
    	let t5;
    	let p1;
    	let t7;
    	let p2;
    	let t9;
    	let p3;
    	let t11;
    	let p4;
    	let t13;
    	let h41;
    	let t15;
    	let p5;
    	let t17;
    	let p6;
    	let t19;
    	let p7;
    	let t21;
    	let p8;
    	let t23;
    	let p9;
    	let t25;
    	let h42;
    	let t27;
    	let p10;
    	let t29;
    	let p11;
    	let t31;
    	let h43;
    	let t33;
    	let p12;
    	let t35;
    	let p13;
    	let t37;
    	let h1;
    	let t39;
    	let h44;
    	let t41;
    	let p14;
    	let t42;
    	let br0;
    	let t43;
    	let br1;
    	let t44;
    	let br2;
    	let a0;
    	let t46;
    	let h45;
    	let t48;
    	let p15;
    	let t49;
    	let br3;
    	let t50;
    	let br4;
    	let t51;
    	let br5;
    	let a1;
    	let t53;
    	let h46;
    	let t55;
    	let p16;
    	let t56;
    	let br6;
    	let t57;
    	let br7;
    	let t58;
    	let br8;
    	let t59;
    	let a2;
    	let t61;
    	let h47;
    	let t63;
    	let p17;
    	let t64;
    	let br9;
    	let t65;
    	let br10;
    	let t66;
    	let br11;
    	let a3;
    	let t68;
    	let h48;
    	let t70;
    	let p18;
    	let t71;
    	let br12;
    	let t72;
    	let br13;
    	let t73;
    	let br14;
    	let a4;
    	let t75;
    	let p19;
    	let t77;
    	let p20;
    	let voltarmenu;
    	let current;
    	voltarmenu = new VoltarMenu({ $$inline: true });

    	const block = {
    		c: function create() {
    			head = element("head");
    			link0 = element("link");
    			t0 = space();
    			link1 = element("link");
    			t1 = space();
    			h40 = element("h4");
    			h40.textContent = "Design";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "Alice Manguinho";
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "Assíria Renara";
    			t7 = space();
    			p2 = element("p");
    			p2.textContent = "Claudiane Rodrigues";
    			t9 = space();
    			p3 = element("p");
    			p3.textContent = "Emmily Kathylen";
    			t11 = space();
    			p4 = element("p");
    			p4.textContent = "Guilherme Valença";
    			t13 = space();
    			h41 = element("h4");
    			h41.textContent = "Lógica";
    			t15 = space();
    			p5 = element("p");
    			p5.textContent = "Alice Manguinho";
    			t17 = space();
    			p6 = element("p");
    			p6.textContent = "Assíria Renara";
    			t19 = space();
    			p7 = element("p");
    			p7.textContent = "Claudiane Rodrigues";
    			t21 = space();
    			p8 = element("p");
    			p8.textContent = "Emmily Kathylen";
    			t23 = space();
    			p9 = element("p");
    			p9.textContent = "Guilherme Valença";
    			t25 = space();
    			h42 = element("h4");
    			h42.textContent = "História";
    			t27 = space();
    			p10 = element("p");
    			p10.textContent = "Alice Manguinho";
    			t29 = space();
    			p11 = element("p");
    			p11.textContent = "Assíria Renara";
    			t31 = space();
    			h43 = element("h4");
    			h43.textContent = "Áudio";
    			t33 = space();
    			p12 = element("p");
    			p12.textContent = "Mauro Sergio";
    			t35 = space();
    			p13 = element("p");
    			p13.textContent = "@mevyness";
    			t37 = space();
    			h1 = element("h1");
    			h1.textContent = "Criadores";
    			t39 = space();
    			h44 = element("h4");
    			h44.textContent = "Alice Manguinho";
    			t41 = space();
    			p14 = element("p");
    			t42 = text("17 anos ");
    			br0 = element("br");
    			t43 = text(" 1° período de IPI ");
    			br1 = element("br");
    			t44 = text(" asms1@discente.ifpe.edu.br ");
    			br2 = element("br");
    			a0 = element("a");
    			a0.textContent = "github";
    			t46 = space();
    			h45 = element("h4");
    			h45.textContent = "Assíria Renara";
    			t48 = space();
    			p15 = element("p");
    			t49 = text("22 anos ");
    			br3 = element("br");
    			t50 = text(" 1° período de IPI ");
    			br4 = element("br");
    			t51 = text(" aross@discente.ifpe.edu.br ");
    			br5 = element("br");
    			a1 = element("a");
    			a1.textContent = "github";
    			t53 = space();
    			h46 = element("h4");
    			h46.textContent = "Claudiane Rodrigues";
    			t55 = space();
    			p16 = element("p");
    			t56 = text("21 anos ");
    			br6 = element("br");
    			t57 = text(" 1° período de IPI ");
    			br7 = element("br");
    			t58 = text(" cra@discente.ifpe.edu.br ");
    			br8 = element("br");
    			t59 = space();
    			a2 = element("a");
    			a2.textContent = "github";
    			t61 = space();
    			h47 = element("h4");
    			h47.textContent = "Emmily Kathylen";
    			t63 = space();
    			p17 = element("p");
    			t64 = text("20 anos ");
    			br9 = element("br");
    			t65 = text(" 1° período de IPI ");
    			br10 = element("br");
    			t66 = text(" emmilysouzakathylen@gmail.com ");
    			br11 = element("br");
    			a3 = element("a");
    			a3.textContent = "github";
    			t68 = space();
    			h48 = element("h4");
    			h48.textContent = "Guilherme Valença";
    			t70 = space();
    			p18 = element("p");
    			t71 = text("21 anos ");
    			br12 = element("br");
    			t72 = text(" 1° período de IPI ");
    			br13 = element("br");
    			t73 = text(" gvrp@discente.ifpe.edu.br ");
    			br14 = element("br");
    			a4 = element("a");
    			a4.textContent = "github";
    			t75 = space();
    			p19 = element("p");
    			p19.textContent = "Obrigado por Jogar!";
    			t77 = space();
    			p20 = element("p");
    			create_component(voltarmenu.$$.fragment);
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "href", "/css/creditos.css");
    			add_location(link0, file$2, 4, 4, 80);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "/css/menu.css");
    			add_location(link1, file$2, 5, 4, 133);
    			add_location(head, file$2, 3, 0, 69);
    			attr_dev(h40, "class", "geral");
    			add_location(h40, file$2, 8, 0, 187);
    			attr_dev(p0, "class", "geral");
    			add_location(p0, file$2, 10, 0, 220);
    			attr_dev(p1, "class", "geral");
    			add_location(p1, file$2, 11, 0, 259);
    			attr_dev(p2, "class", "geral");
    			add_location(p2, file$2, 12, 0, 297);
    			attr_dev(p3, "class", "geral");
    			add_location(p3, file$2, 13, 0, 340);
    			attr_dev(p4, "class", "geral");
    			add_location(p4, file$2, 14, 0, 379);
    			attr_dev(h41, "class", "geral");
    			add_location(h41, file$2, 16, 0, 421);
    			attr_dev(p5, "class", "geral");
    			add_location(p5, file$2, 18, 0, 454);
    			attr_dev(p6, "class", "geral");
    			add_location(p6, file$2, 19, 0, 493);
    			attr_dev(p7, "class", "geral");
    			add_location(p7, file$2, 20, 0, 531);
    			attr_dev(p8, "class", "geral");
    			add_location(p8, file$2, 21, 0, 574);
    			attr_dev(p9, "class", "geral");
    			add_location(p9, file$2, 22, 0, 613);
    			attr_dev(h42, "class", "geral");
    			add_location(h42, file$2, 24, 0, 655);
    			attr_dev(p10, "class", "geral");
    			add_location(p10, file$2, 26, 0, 690);
    			attr_dev(p11, "class", "geral");
    			add_location(p11, file$2, 27, 0, 729);
    			attr_dev(h43, "class", "geral");
    			add_location(h43, file$2, 29, 0, 769);
    			attr_dev(p12, "class", "geral");
    			add_location(p12, file$2, 31, 0, 801);
    			attr_dev(p13, "class", "geral");
    			add_location(p13, file$2, 32, 0, 837);
    			attr_dev(h1, "class", "geral");
    			add_location(h1, file$2, 35, 0, 870);
    			attr_dev(h44, "class", "geral");
    			add_location(h44, file$2, 37, 0, 906);
    			add_location(br0, file$2, 39, 26, 974);
    			add_location(br1, file$2, 39, 49, 997);
    			add_location(br2, file$2, 39, 81, 1029);
    			attr_dev(a0, "href", "https://github.com/AliceManguinho");
    			add_location(a0, file$2, 39, 85, 1033);
    			attr_dev(p14, "class", "geral");
    			add_location(p14, file$2, 39, 0, 948);
    			attr_dev(h45, "class", "geral");
    			add_location(h45, file$2, 41, 0, 1093);
    			add_location(br3, file$2, 43, 26, 1160);
    			add_location(br4, file$2, 43, 49, 1183);
    			add_location(br5, file$2, 43, 81, 1215);
    			attr_dev(a1, "href", "https://github.com/assiriaS2");
    			add_location(a1, file$2, 43, 85, 1219);
    			attr_dev(p15, "class", "geral");
    			add_location(p15, file$2, 43, 0, 1134);
    			attr_dev(h46, "class", "geral");
    			add_location(h46, file$2, 45, 0, 1277);
    			add_location(br6, file$2, 47, 26, 1349);
    			add_location(br7, file$2, 47, 49, 1372);
    			add_location(br8, file$2, 47, 79, 1402);
    			attr_dev(a2, "href", "https://github.com/Cl4udiAnn3");
    			add_location(a2, file$2, 47, 84, 1407);
    			attr_dev(p16, "class", "geral");
    			add_location(p16, file$2, 47, 0, 1323);
    			attr_dev(h47, "class", "geral");
    			add_location(h47, file$2, 49, 0, 1465);
    			add_location(br9, file$2, 51, 26, 1533);
    			add_location(br10, file$2, 51, 49, 1556);
    			add_location(br11, file$2, 51, 84, 1591);
    			attr_dev(a3, "href", "https://github.com/EmmilyKathylen");
    			add_location(a3, file$2, 51, 88, 1595);
    			attr_dev(p17, "class", "geral");
    			add_location(p17, file$2, 51, 0, 1507);
    			attr_dev(h48, "class", "geral");
    			add_location(h48, file$2, 53, 0, 1658);
    			add_location(br12, file$2, 55, 26, 1728);
    			add_location(br13, file$2, 55, 49, 1751);
    			add_location(br14, file$2, 55, 80, 1782);
    			attr_dev(a4, "href", "https://github.com/Guilhermevalenca");
    			add_location(a4, file$2, 55, 84, 1786);
    			attr_dev(p18, "class", "geral");
    			add_location(p18, file$2, 55, 0, 1702);
    			attr_dev(p19, "class", "agradeca");
    			add_location(p19, file$2, 57, 0, 1850);
    			attr_dev(p20, "class", "geral");
    			attr_dev(p20, "id", "voltar");
    			add_location(p20, file$2, 59, 0, 1896);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, head, anchor);
    			append_dev(head, link0);
    			append_dev(head, t0);
    			append_dev(head, link1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h40, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, h41, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, p5, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, p6, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, p7, anchor);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, p8, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, p9, anchor);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, h42, anchor);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, p10, anchor);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, p11, anchor);
    			insert_dev(target, t31, anchor);
    			insert_dev(target, h43, anchor);
    			insert_dev(target, t33, anchor);
    			insert_dev(target, p12, anchor);
    			insert_dev(target, t35, anchor);
    			insert_dev(target, p13, anchor);
    			insert_dev(target, t37, anchor);
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t39, anchor);
    			insert_dev(target, h44, anchor);
    			insert_dev(target, t41, anchor);
    			insert_dev(target, p14, anchor);
    			append_dev(p14, t42);
    			append_dev(p14, br0);
    			append_dev(p14, t43);
    			append_dev(p14, br1);
    			append_dev(p14, t44);
    			append_dev(p14, br2);
    			append_dev(p14, a0);
    			insert_dev(target, t46, anchor);
    			insert_dev(target, h45, anchor);
    			insert_dev(target, t48, anchor);
    			insert_dev(target, p15, anchor);
    			append_dev(p15, t49);
    			append_dev(p15, br3);
    			append_dev(p15, t50);
    			append_dev(p15, br4);
    			append_dev(p15, t51);
    			append_dev(p15, br5);
    			append_dev(p15, a1);
    			insert_dev(target, t53, anchor);
    			insert_dev(target, h46, anchor);
    			insert_dev(target, t55, anchor);
    			insert_dev(target, p16, anchor);
    			append_dev(p16, t56);
    			append_dev(p16, br6);
    			append_dev(p16, t57);
    			append_dev(p16, br7);
    			append_dev(p16, t58);
    			append_dev(p16, br8);
    			append_dev(p16, t59);
    			append_dev(p16, a2);
    			insert_dev(target, t61, anchor);
    			insert_dev(target, h47, anchor);
    			insert_dev(target, t63, anchor);
    			insert_dev(target, p17, anchor);
    			append_dev(p17, t64);
    			append_dev(p17, br9);
    			append_dev(p17, t65);
    			append_dev(p17, br10);
    			append_dev(p17, t66);
    			append_dev(p17, br11);
    			append_dev(p17, a3);
    			insert_dev(target, t68, anchor);
    			insert_dev(target, h48, anchor);
    			insert_dev(target, t70, anchor);
    			insert_dev(target, p18, anchor);
    			append_dev(p18, t71);
    			append_dev(p18, br12);
    			append_dev(p18, t72);
    			append_dev(p18, br13);
    			append_dev(p18, t73);
    			append_dev(p18, br14);
    			append_dev(p18, a4);
    			insert_dev(target, t75, anchor);
    			insert_dev(target, p19, anchor);
    			insert_dev(target, t77, anchor);
    			insert_dev(target, p20, anchor);
    			mount_component(voltarmenu, p20, null);
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
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h40);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(h41);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(p6);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(p7);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(p8);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(p9);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(h42);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(p10);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(p11);
    			if (detaching) detach_dev(t31);
    			if (detaching) detach_dev(h43);
    			if (detaching) detach_dev(t33);
    			if (detaching) detach_dev(p12);
    			if (detaching) detach_dev(t35);
    			if (detaching) detach_dev(p13);
    			if (detaching) detach_dev(t37);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t39);
    			if (detaching) detach_dev(h44);
    			if (detaching) detach_dev(t41);
    			if (detaching) detach_dev(p14);
    			if (detaching) detach_dev(t46);
    			if (detaching) detach_dev(h45);
    			if (detaching) detach_dev(t48);
    			if (detaching) detach_dev(p15);
    			if (detaching) detach_dev(t53);
    			if (detaching) detach_dev(h46);
    			if (detaching) detach_dev(t55);
    			if (detaching) detach_dev(p16);
    			if (detaching) detach_dev(t61);
    			if (detaching) detach_dev(h47);
    			if (detaching) detach_dev(t63);
    			if (detaching) detach_dev(p17);
    			if (detaching) detach_dev(t68);
    			if (detaching) detach_dev(h48);
    			if (detaching) detach_dev(t70);
    			if (detaching) detach_dev(p18);
    			if (detaching) detach_dev(t75);
    			if (detaching) detach_dev(p19);
    			if (detaching) detach_dev(t77);
    			if (detaching) detach_dev(p20);
    			destroy_component(voltarmenu);
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
    	validate_slots('Creditos', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Creditos> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ VoltarMenu });
    	return [];
    }

    class Creditos extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Creditos",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /*
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     */

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

    const substr = (str, start, end) => str.substr(start, end);

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

    // eslint-disable-next-line no-console
    const warn = createMessageHandler(console.warn);

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
    const { navigate } = globalHistory;

    /*
     * Adapted from https://github.com/EmilTholin/svelte-routing
     *
     * https://github.com/EmilTholin/svelte-routing/blob/master/LICENSE
     */

    const createAction =
    	getAnchor =>
    	(node, navigate$1 = navigate) => {
    		const handleClick = event => {
    			const anchor = getAnchor(event);
    			if (anchor && anchor.target === "" && shouldNavigate(event)) {
    				event.preventDefault();
    				const to = anchor.pathname + anchor.search + anchor.hash;
    				navigate$1(to, { replace: anchor.hasAttribute("replace") });
    			}
    		};
    		const unlisten = addListener(node, "click", handleClick);
    		return { destroy: unlisten };
    	};

    // prettier-ignore
    /**
     * A link action that can be added to <a href=""> tags rather
     * than using the <Link> component.
     *
     * Example:
     * ```html
     * <a href="/post/{postId}" use:link>{post.title}</a>
     * ```
     */
    const link = /*#__PURE__*/createAction(event => event.currentTarget); // eslint-disable-line spaced-comment, max-len

    /* src/newjogo.svelte generated by Svelte v3.53.1 */
    const file$1 = "src/newjogo.svelte";

    function get_each_context_16(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[59] = list[i];
    	return child_ctx;
    }

    function get_each_context_17(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[62] = list[i];
    	return child_ctx;
    }

    function get_each_context_14(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[59] = list[i];
    	return child_ctx;
    }

    function get_each_context_15(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[62] = list[i];
    	return child_ctx;
    }

    function get_each_context_12(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[59] = list[i];
    	child_ctx[61] = i;
    	return child_ctx;
    }

    function get_each_context_13(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[62] = list[i];
    	child_ctx[64] = i;
    	return child_ctx;
    }

    function get_each_context_10(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[59] = list[i];
    	return child_ctx;
    }

    function get_each_context_11(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[62] = list[i];
    	return child_ctx;
    }

    function get_each_context_8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[59] = list[i];
    	child_ctx[61] = i;
    	return child_ctx;
    }

    function get_each_context_9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[62] = list[i];
    	child_ctx[64] = i;
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[59] = list[i];
    	return child_ctx;
    }

    function get_each_context_7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[62] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[59] = list[i];
    	child_ctx[61] = i;
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[62] = list[i];
    	child_ctx[64] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[59] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[62] = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[59] = list[i];
    	child_ctx[61] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[62] = list[i];
    	child_ctx[64] = i;
    	return child_ctx;
    }

    // (674:0) {#if (key)}
    function create_if_block_83(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*code*/ ctx[1] == "ArrowUp" || /*code*/ ctx[1] == "KeyW") return create_if_block_84;
    		if (/*code*/ ctx[1] == "ArrowDown" || /*code*/ ctx[1] == "KeyS") return create_if_block_85;
    		if (/*code*/ ctx[1] == "ArrowLeft" || /*code*/ ctx[1] == "KeyA") return create_if_block_86;
    		if (/*code*/ ctx[1] == "ArrowRight" || /*code*/ ctx[1] == "KeyD") return create_if_block_87;
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
    		id: create_if_block_83.name,
    		type: "if",
    		source: "(674:0) {#if (key)}",
    		ctx
    	});

    	return block;
    }

    // (687:61) 
    function create_if_block_87(ctx) {
    	let t_value = /*MovimentaçãoPeloMapa*/ ctx[23]("DIREITA") + "";
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
    		id: create_if_block_87.name,
    		type: "if",
    		source: "(687:61) ",
    		ctx
    	});

    	return block;
    }

    // (683:60) 
    function create_if_block_86(ctx) {
    	let t_value = /*MovimentaçãoPeloMapa*/ ctx[23]("ESQUERDA") + "";
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
    		id: create_if_block_86.name,
    		type: "if",
    		source: "(683:60) ",
    		ctx
    	});

    	return block;
    }

    // (679:60) 
    function create_if_block_85(ctx) {
    	let t_value = /*MovimentaçãoPeloMapa*/ ctx[23]("BAIXO") + "";
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
    		id: create_if_block_85.name,
    		type: "if",
    		source: "(679:60) ",
    		ctx
    	});

    	return block;
    }

    // (675:8) {#if (code == "ArrowUp") || (code == "KeyW")}
    function create_if_block_84(ctx) {
    	let t_value = /*MovimentaçãoPeloMapa*/ ctx[23]("CIMA") + "";
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
    		id: create_if_block_84.name,
    		type: "if",
    		source: "(675:8) {#if (code == \\\"ArrowUp\\\") || (code == \\\"KeyW\\\")}",
    		ctx
    	});

    	return block;
    }

    // (694:0) {#if MudandoDeFase !== "vitoria"}
    function create_if_block_82(ctx) {
    	let button;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			p = element("p");
    			p.textContent = "Voltar";
    			attr_dev(p, "class", "Voltar");
    			add_location(p, file$1, 695, 73, 43597);
    			attr_dev(button, "class", "ButtonVoltar");
    			add_location(button, file$1, 695, 0, 43524);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, p);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[33], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_82.name,
    		type: "if",
    		source: "(694:0) {#if MudandoDeFase !== \\\"vitoria\\\"}",
    		ctx
    	});

    	return block;
    }

    // (1036:41) 
    function create_if_block_76(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_77, create_else_block_4];
    	const if_blocks = [];

    	function select_block_type_17(ctx, dirty) {
    		if (!/*enigma*/ ctx[10]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_17(ctx);
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
    			current_block_type_index = select_block_type_17(ctx);

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
    		id: create_if_block_76.name,
    		type: "if",
    		source: "(1036:41) ",
    		ctx
    	});

    	return block;
    }

    // (948:40) 
    function create_if_block_54(ctx) {
    	let p;
    	let t1;
    	let if_block_anchor;

    	function select_block_type_13(ctx, dirty) {
    		if (!/*enigma*/ ctx[10]) return create_if_block_55;
    		return create_else_block_3;
    	}

    	let current_block_type = select_block_type_13(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Nivel 3";
    			t1 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(p, "class", "FasesDoJogo");
    			add_location(p, file$1, 949, 4, 55329);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_13(ctx)) && if_block) {
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
    		id: create_if_block_54.name,
    		type: "if",
    		source: "(948:40) ",
    		ctx
    	});

    	return block;
    }

    // (858:40) 
    function create_if_block_32(ctx) {
    	let p;
    	let t1;
    	let if_block_anchor;

    	function select_block_type_9(ctx, dirty) {
    		if (!/*enigma*/ ctx[10]) return create_if_block_33;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type_9(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Nivel 2";
    			t1 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(p, "class", "FasesDoJogo");
    			add_location(p, file$1, 859, 4, 51014);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_9(ctx)) && if_block) {
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
    		id: create_if_block_32.name,
    		type: "if",
    		source: "(858:40) ",
    		ctx
    	});

    	return block;
    }

    // (771:40) 
    function create_if_block_12(ctx) {
    	let p;
    	let t1;
    	let if_block_anchor;

    	function select_block_type_5(ctx, dirty) {
    		if (!/*enigma*/ ctx[10]) return create_if_block_13;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_5(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Nivel 1";
    			t1 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(p, "class", "FasesDoJogo");
    			add_location(p, file$1, 772, 4, 46998);
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
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(771:40) ",
    		ctx
    	});

    	return block;
    }

    // (707:0) {#if MudandoDeFase == "tutorial"}
    function create_if_block$1(ctx) {
    	let p0;
    	let t1;
    	let p1;
    	let t3;
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (!/*enigma*/ ctx[10]) return create_if_block_1$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			p0.textContent = "Tutorial";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "Para uma melhor experiência recomendamos utilizar fones de ouvidos";
    			t3 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(p0, "class", "FasesDoJogo");
    			add_location(p0, file$1, 708, 4, 43868);
    			attr_dev(p1, "class", "Enigma");
    			add_location(p1, file$1, 709, 4, 43908);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t3, anchor);
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
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t3);
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(707:0) {#if MudandoDeFase == \\\"tutorial\\\"}",
    		ctx
    	});

    	return block;
    }

    // (1065:4) {:else}
    function create_else_block_4(ctx) {
    	let head;
    	let link_1;
    	let t;
    	let creditos;
    	let current;
    	creditos = new Creditos({ $$inline: true });

    	const block = {
    		c: function create() {
    			head = element("head");
    			link_1 = element("link");
    			t = space();
    			create_component(creditos.$$.fragment);
    			attr_dev(link_1, "rel", "stylesheet");
    			attr_dev(link_1, "href", "/css/AnimaçãoCreditos.css");
    			add_location(link_1, file$1, 1066, 8, 60195);
    			add_location(head, file$1, 1065, 4, 60180);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, head, anchor);
    			append_dev(head, link_1);
    			insert_dev(target, t, anchor);
    			mount_component(creditos, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(creditos.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(creditos.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(head);
    			if (detaching) detach_dev(t);
    			destroy_component(creditos, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_4.name,
    		type: "else",
    		source: "(1065:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1038:4) {#if !enigma}
    function create_if_block_77(ctx) {
    	let vitoria;
    	let t0;
    	let p;
    	let t1_value = clearInterval(/*Tempo*/ ctx[12]) + "";
    	let t1;
    	let t2;
    	let t3_value = /*RenderizandoMapa*/ ctx[21]() + "";
    	let t3;
    	let t4;
    	let t5_value = /*DeterminandoEixos*/ ctx[22](/*MudandoDeFase*/ ctx[9]) + "";
    	let t5;
    	let t6;
    	let table;
    	let current;
    	vitoria = new Vitoria({ $$inline: true });
    	let each_value_16 = /*mapa4*/ ctx[6];
    	validate_each_argument(each_value_16);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_16.length; i += 1) {
    		each_blocks[i] = create_each_block_16(get_each_context_16(ctx, each_value_16, i));
    	}

    	const block = {
    		c: function create() {
    			create_component(vitoria.$$.fragment);
    			t0 = space();
    			p = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = space();
    			t5 = text(t5_value);
    			t6 = space();
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p, "class", "textofutil");
    			add_location(p, file$1, 1041, 4, 59317);
    			attr_dev(table, "id", "mapanivel4");
    			add_location(table, file$1, 1047, 0, 59445);
    		},
    		m: function mount(target, anchor) {
    			mount_component(vitoria, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*Tempo*/ 4096) && t1_value !== (t1_value = clearInterval(/*Tempo*/ ctx[12]) + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty[0] & /*MudandoDeFase*/ 512) && t5_value !== (t5_value = /*DeterminandoEixos*/ ctx[22](/*MudandoDeFase*/ ctx[9]) + "")) set_data_dev(t5, t5_value);

    			if (dirty[0] & /*mapa4*/ 64) {
    				each_value_16 = /*mapa4*/ ctx[6];
    				validate_each_argument(each_value_16);
    				let i;

    				for (i = 0; i < each_value_16.length; i += 1) {
    					const child_ctx = get_each_context_16(ctx, each_value_16, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_16(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_16.length;
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
    			destroy_component(vitoria, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_77.name,
    		type: "if",
    		source: "(1038:4) {#if !enigma}",
    		ctx
    	});

    	return block;
    }

    // (1058:39) 
    function create_if_block_81(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "AjusteUnico");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/saida.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "saida");
    			add_location(img, file$1, 1058, 20, 60023);
    			add_location(th, file$1, 1058, 16, 60019);
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
    		id: create_if_block_81.name,
    		type: "if",
    		source: "(1058:39) ",
    		ctx
    	});

    	return block;
    }

    // (1056:43) 
    function create_if_block_80(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "AjusteUnico");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/Dante.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "personagem");
    			add_location(img, file$1, 1056, 35, 59886);
    			attr_dev(th, "class", "Dante4");
    			add_location(th, file$1, 1056, 16, 59867);
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
    		id: create_if_block_80.name,
    		type: "if",
    		source: "(1056:43) ",
    		ctx
    	});

    	return block;
    }

    // (1054:37) 
    function create_if_block_79(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "AjusteUnico");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredetunel.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			add_location(img, file$1, 1054, 20, 59728);
    			add_location(th, file$1, 1054, 16, 59724);
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
    		id: create_if_block_79.name,
    		type: "if",
    		source: "(1054:37) ",
    		ctx
    	});

    	return block;
    }

    // (1052:12) {#if elementos == 0}
    function create_if_block_78(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "AjusteUnico");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/chaotunel.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "chao");
    			add_location(img, file$1, 1052, 20, 59595);
    			add_location(th, file$1, 1052, 16, 59591);
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
    		id: create_if_block_78.name,
    		type: "if",
    		source: "(1052:12) {#if elementos == 0}",
    		ctx
    	});

    	return block;
    }

    // (1051:8) {#each linhas as elementos}
    function create_each_block_17(ctx) {
    	let if_block_anchor;

    	function select_block_type_18(ctx, dirty) {
    		if (/*elementos*/ ctx[62] == 0) return create_if_block_78;
    		if (/*elementos*/ ctx[62] == 1) return create_if_block_79;
    		if (/*elementos*/ ctx[62] == "DANTE") return create_if_block_80;
    		if (/*elementos*/ ctx[62] == "C") return create_if_block_81;
    	}

    	let current_block_type = select_block_type_18(ctx);
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
    			if (current_block_type !== (current_block_type = select_block_type_18(ctx))) {
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
    		id: create_each_block_17.name,
    		type: "each",
    		source: "(1051:8) {#each linhas as elementos}",
    		ctx
    	});

    	return block;
    }

    // (1049:4) {#each mapa4 as linhas}
    function create_each_block_16(ctx) {
    	let tr;
    	let t;
    	let each_value_17 = /*linhas*/ ctx[59];
    	validate_each_argument(each_value_17);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_17.length; i += 1) {
    		each_blocks[i] = create_each_block_17(get_each_context_17(ctx, each_value_17, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			add_location(tr, file$1, 1049, 4, 59501);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*mapa4*/ 64) {
    				each_value_17 = /*linhas*/ ctx[59];
    				validate_each_argument(each_value_17);
    				let i;

    				for (i = 0; i < each_value_17.length; i += 1) {
    					const child_ctx = get_each_context_17(ctx, each_value_17, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_17(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_17.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_16.name,
    		type: "each",
    		source: "(1049:4) {#each mapa4 as linhas}",
    		ctx
    	});

    	return block;
    }

    // (1004:8) {:else}
    function create_else_block_3(ctx) {
    	let p0;
    	let t5;
    	let p1;
    	let t7;
    	let p2;
    	let t9;
    	let p3;
    	let t10_value = /*Perguntas*/ ctx[30][/*NumeroEscolhido*/ ctx[18]] + "";
    	let t10;
    	let t11;
    	let p4;
    	let t12;
    	let t13;
    	let t14;
    	let input;
    	let t15;
    	let each_1_anchor;
    	let mounted;
    	let dispose;
    	let each_value_14 = /*mapa3*/ ctx[5];
    	validate_each_argument(each_value_14);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_14.length; i += 1) {
    		each_blocks[i] = create_each_block_14(get_each_context_14(ctx, each_value_14, i));
    	}

    	const block = {
    		c: function create() {
    			p0 = element("p");

    			p0.textContent = `${/*TempoEnigma*/ ctx[25]()} 
            ${/*ResertarContador*/ ctx[26]()} 
            ${/*ProximoEnigma*/ ctx[32]()}`;

    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "Se saiu bem, Dante. Conseguiu sobreviver até aqui, mas será que realmente acabou?";
    			t7 = space();
    			p2 = element("p");
    			p2.textContent = "Seja rápido se deseja sobreviver.";
    			t9 = space();
    			p3 = element("p");
    			t10 = text(t10_value);
    			t11 = space();
    			p4 = element("p");
    			t12 = text(/*contador*/ ctx[13]);
    			t13 = text("s");
    			t14 = space();
    			input = element("input");
    			t15 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(p0, "class", "textofutil");
    			add_location(p0, file$1, 1004, 8, 57690);
    			attr_dev(p1, "class", "Enigma");
    			add_location(p1, file$1, 1010, 8, 57826);
    			attr_dev(p2, "class", "Enigma");
    			add_location(p2, file$1, 1011, 8, 57938);
    			attr_dev(p3, "class", "EnigmaPergunta");
    			add_location(p3, file$1, 1012, 8, 58002);
    			attr_dev(p4, "class", "Contador");
    			add_location(p4, file$1, 1013, 8, 58070);
    			attr_dev(input, "placeholder", "APENAS LETRAS MAIUSCULAS");
    			attr_dev(input, "class", "RespostaEnigma");
    			add_location(input, file$1, 1014, 8, 58114);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p3, anchor);
    			append_dev(p3, t10);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, p4, anchor);
    			append_dev(p4, t12);
    			append_dev(p4, t13);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*PalavraChave*/ ctx[11]);
    			insert_dev(target, t15, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler_3*/ ctx[37]),
    					listen_dev(
    						input,
    						"keydown",
    						function () {
    							if (is_function(/*Alterando*/ ctx[24](/*PalavraChave*/ ctx[11] == /*respostas*/ ctx[31][/*NumeroEscolhido*/ ctx[18]], /*MudandoDeFase*/ ctx[9]))) /*Alterando*/ ctx[24](/*PalavraChave*/ ctx[11] == /*respostas*/ ctx[31][/*NumeroEscolhido*/ ctx[18]], /*MudandoDeFase*/ ctx[9]).apply(this, arguments);
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
    			if (dirty[0] & /*NumeroEscolhido*/ 262144 && t10_value !== (t10_value = /*Perguntas*/ ctx[30][/*NumeroEscolhido*/ ctx[18]] + "")) set_data_dev(t10, t10_value);
    			if (dirty[0] & /*contador*/ 8192) set_data_dev(t12, /*contador*/ ctx[13]);

    			if (dirty[0] & /*PalavraChave*/ 2048 && input.value !== /*PalavraChave*/ ctx[11]) {
    				set_input_value(input, /*PalavraChave*/ ctx[11]);
    			}

    			if (dirty[0] & /*mapa3*/ 32) {
    				each_value_14 = /*mapa3*/ ctx[5];
    				validate_each_argument(each_value_14);
    				let i;

    				for (i = 0; i < each_value_14.length; i += 1) {
    					const child_ctx = get_each_context_14(ctx, each_value_14, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_14(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_14.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t15);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(1004:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (952:4) {#if !enigma}
    function create_if_block_55(ctx) {
    	let p;
    	let t0_value = /*IniciarACaçada*/ ctx[28]() + "";
    	let t0;
    	let t1;
    	let t2_value = /*Cronometrar*/ ctx[27]() + "";
    	let t2;
    	let t3;
    	let t4_value = /*acelerar*/ ctx[29](/*Indice*/ ctx[15] == /*SaveIndice*/ ctx[16]) + "";
    	let t4;
    	let t5;
    	let t6_value = clearInterval(/*Tempo*/ ctx[12]) + "";
    	let t6;
    	let t7;
    	let t8_value = /*RenderizandoMapa*/ ctx[21]() + "";
    	let t8;
    	let t9;
    	let t10_value = /*DeterminandoEixos*/ ctx[22](/*MudandoDeFase*/ ctx[9]) + "";
    	let t10;
    	let t11;
    	let t12;
    	let table;
    	let t13;
    	let div;
    	let ul;

    	function select_block_type_14(ctx, dirty) {
    		if (/*HoraDaCaçada*/ ctx[17] > 0) return create_if_block_65;
    		if (/*Ritmo*/ ctx[14] == 3000) return create_if_block_66;
    		if (/*Ritmo*/ ctx[14] == 2000) return create_if_block_67;
    		if (/*Ritmo*/ ctx[14] == 1000) return create_if_block_68;
    		if (/*Ritmo*/ ctx[14] < 1000) return create_if_block_69;
    	}

    	let current_block_type = select_block_type_14(ctx);
    	let if_block = current_block_type && current_block_type(ctx);
    	let each_value_12 = /*mapa3*/ ctx[5];
    	validate_each_argument(each_value_12);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_12.length; i += 1) {
    		each_blocks[i] = create_each_block_12(get_each_context_12(ctx, each_value_12, i));
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			t4 = text(t4_value);
    			t5 = space();
    			t6 = text(t6_value);
    			t7 = space();
    			t8 = text(t8_value);
    			t9 = space();
    			t10 = text(t10_value);
    			t11 = space();
    			if (if_block) if_block.c();
    			t12 = space();
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t13 = space();
    			div = element("div");
    			ul = element("ul");
    			ul.textContent = "Cuidado, os passos estão mais próximos a cada segundo. Consegue ouvir seu coração? Corra se quiser viver.";
    			attr_dev(p, "class", "textofutil");
    			add_location(p, file$1, 953, 4, 55393);
    			attr_dev(table, "class", "mapa");
    			attr_dev(table, "align", "center");
    			attr_dev(table, "id", "mapanivel3");
    			add_location(table, file$1, 972, 4, 56088);
    			attr_dev(ul, "class", "info");
    			add_location(ul, file$1, 1001, 8, 57527);
    			attr_dev(div, "id", "ContoDoMinotauro");
    			attr_dev(div, "class", "aimds");
    			add_location(div, file$1, 1000, 4, 57477);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(p, t6);
    			append_dev(p, t7);
    			append_dev(p, t8);
    			append_dev(p, t9);
    			append_dev(p, t10);
    			insert_dev(target, t11, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			insert_dev(target, t13, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*Indice, SaveIndice*/ 98304 && t4_value !== (t4_value = /*acelerar*/ ctx[29](/*Indice*/ ctx[15] == /*SaveIndice*/ ctx[16]) + "")) set_data_dev(t4, t4_value);
    			if (dirty[0] & /*Tempo*/ 4096 && t6_value !== (t6_value = clearInterval(/*Tempo*/ ctx[12]) + "")) set_data_dev(t6, t6_value);
    			if (dirty[0] & /*MudandoDeFase*/ 512 && t10_value !== (t10_value = /*DeterminandoEixos*/ ctx[22](/*MudandoDeFase*/ ctx[9]) + "")) set_data_dev(t10, t10_value);

    			if (current_block_type === (current_block_type = select_block_type_14(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(t12.parentNode, t12);
    				}
    			}

    			if (dirty[0] & /*mapa3, LimiteX, Dimensionamento, LimiteY*/ 1048992) {
    				each_value_12 = /*mapa3*/ ctx[5];
    				validate_each_argument(each_value_12);
    				let i;

    				for (i = 0; i < each_value_12.length; i += 1) {
    					const child_ctx = get_each_context_12(ctx, each_value_12, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_12(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_12.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t11);

    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_55.name,
    		type: "if",
    		source: "(952:4) {#if !enigma}",
    		ctx
    	});

    	return block;
    }

    // (1029:33) 
    function create_if_block_75(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "imgmini");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredefalsanivel3.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "paredefalsa");
    			add_location(img, file$1, 1029, 16, 59077);
    			add_location(th, file$1, 1029, 12, 59073);
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
    		id: create_if_block_75.name,
    		type: "if",
    		source: "(1029:33) ",
    		ctx
    	});

    	return block;
    }

    // (1027:33) 
    function create_if_block_74(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "imgmini");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/saida.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "8");
    			add_location(img, file$1, 1027, 16, 58965);
    			add_location(th, file$1, 1027, 12, 58961);
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
    		id: create_if_block_74.name,
    		type: "if",
    		source: "(1027:33) ",
    		ctx
    	});

    	return block;
    }

    // (1025:39) 
    function create_if_block_73(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "imgmini");
    			attr_dev(img, "id", "chao1");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/chaonivel3.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "personagem");
    			add_location(img, file$1, 1025, 16, 58826);
    			add_location(th, file$1, 1025, 12, 58822);
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
    		id: create_if_block_73.name,
    		type: "if",
    		source: "(1025:39) ",
    		ctx
    	});

    	return block;
    }

    // (1023:35) 
    function create_if_block_72(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "imgmini");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/saidanivel3.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "saida");
    			add_location(img, file$1, 1023, 16, 58696);
    			add_location(th, file$1, 1023, 12, 58692);
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
    		id: create_if_block_72.name,
    		type: "if",
    		source: "(1023:35) ",
    		ctx
    	});

    	return block;
    }

    // (1021:33) 
    function create_if_block_71(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "imgmini");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredenivel3.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			add_location(img, file$1, 1021, 16, 58568);
    			add_location(th, file$1, 1021, 12, 58564);
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
    		id: create_if_block_71.name,
    		type: "if",
    		source: "(1021:33) ",
    		ctx
    	});

    	return block;
    }

    // (1019:8) {#if elementos == 0}
    function create_if_block_70(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "imgmini");
    			attr_dev(img, "id", "chao1");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/chaonivel3.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "chao");
    			add_location(img, file$1, 1019, 16, 58435);
    			add_location(th, file$1, 1019, 12, 58431);
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
    		id: create_if_block_70.name,
    		type: "if",
    		source: "(1019:8) {#if elementos == 0}",
    		ctx
    	});

    	return block;
    }

    // (1018:8) {#each linhas as elementos}
    function create_each_block_15(ctx) {
    	let if_block_anchor;

    	function select_block_type_16(ctx, dirty) {
    		if (/*elementos*/ ctx[62] == 0) return create_if_block_70;
    		if (/*elementos*/ ctx[62] == 1) return create_if_block_71;
    		if (/*elementos*/ ctx[62] == "V") return create_if_block_72;
    		if (/*elementos*/ ctx[62] == "DANTE") return create_if_block_73;
    		if (/*elementos*/ ctx[62] == 8) return create_if_block_74;
    		if (/*elementos*/ ctx[62] == 7) return create_if_block_75;
    	}

    	let current_block_type = select_block_type_16(ctx);
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
    			if (current_block_type !== (current_block_type = select_block_type_16(ctx))) {
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
    		id: create_each_block_15.name,
    		type: "each",
    		source: "(1018:8) {#each linhas as elementos}",
    		ctx
    	});

    	return block;
    }

    // (1016:8) {#each mapa3 as linhas}
    function create_each_block_14(ctx) {
    	let tr;
    	let t;
    	let each_value_15 = /*linhas*/ ctx[59];
    	validate_each_argument(each_value_15);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_15.length; i += 1) {
    		each_blocks[i] = create_each_block_15(get_each_context_15(ctx, each_value_15, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(tr, "class", "minimapa");
    			add_location(tr, file$1, 1016, 8, 58332);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*mapa3*/ 32) {
    				each_value_15 = /*linhas*/ ctx[59];
    				validate_each_argument(each_value_15);
    				let i;

    				for (i = 0; i < each_value_15.length; i += 1) {
    					const child_ctx = get_each_context_15(ctx, each_value_15, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_15(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_15.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_14.name,
    		type: "each",
    		source: "(1016:8) {#each mapa3 as linhas}",
    		ctx
    	});

    	return block;
    }

    // (970:27) 
    function create_if_block_69(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "O Minotauro está enfurecido";
    			attr_dev(p, "class", "Enigma");
    			add_location(p, file$1, 970, 8, 56024);
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
    		id: create_if_block_69.name,
    		type: "if",
    		source: "(970:27) ",
    		ctx
    	});

    	return block;
    }

    // (968:28) 
    function create_if_block_68(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "O Minotauro começou a correr";
    			attr_dev(p, "class", "Enigma");
    			add_location(p, file$1, 968, 8, 55937);
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
    		id: create_if_block_68.name,
    		type: "if",
    		source: "(968:28) ",
    		ctx
    	});

    	return block;
    }

    // (966:28) 
    function create_if_block_67(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "O Minotauro acelerou o passo";
    			attr_dev(p, "class", "Enigma");
    			add_location(p, file$1, 966, 8, 55849);
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
    		id: create_if_block_67.name,
    		type: "if",
    		source: "(966:28) ",
    		ctx
    	});

    	return block;
    }

    // (964:28) 
    function create_if_block_66(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "O Minotauro começou a perseguição";
    			attr_dev(p, "class", "Enigma");
    			add_location(p, file$1, 964, 8, 55756);
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
    		id: create_if_block_66.name,
    		type: "if",
    		source: "(964:28) ",
    		ctx
    	});

    	return block;
    }

    // (962:4) {#if HoraDaCaçada > 0}
    function create_if_block_65(ctx) {
    	let p;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("O Minotauro ira surgir em: ");
    			t1 = text(/*HoraDaCaçada*/ ctx[17]);
    			attr_dev(p, "class", "Enigma");
    			add_location(p, file$1, 962, 8, 55655);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*HoraDaCaçada*/ 131072) set_data_dev(t1, /*HoraDaCaçada*/ ctx[17]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_65.name,
    		type: "if",
    		source: "(962:4) {#if HoraDaCaçada > 0}",
    		ctx
    	});

    	return block;
    }

    // (975:8) {#if LimiteY <= i && LimiteY + (Dimensionamento * 2) >= i}
    function create_if_block_56(ctx) {
    	let tr;
    	let t;
    	let each_value_13 = /*linhas*/ ctx[59];
    	validate_each_argument(each_value_13);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_13.length; i += 1) {
    		each_blocks[i] = create_each_block_13(get_each_context_13(ctx, each_value_13, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			add_location(tr, file$1, 975, 12, 56253);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*mapa3, LimiteX, Dimensionamento*/ 1048736) {
    				each_value_13 = /*linhas*/ ctx[59];
    				validate_each_argument(each_value_13);
    				let i;

    				for (i = 0; i < each_value_13.length; i += 1) {
    					const child_ctx = get_each_context_13(ctx, each_value_13, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_13(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_13.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_56.name,
    		type: "if",
    		source: "(975:8) {#if LimiteY <= i && LimiteY + (Dimensionamento * 2) >= i}",
    		ctx
    	});

    	return block;
    }

    // (978:16) {#if LimiteX <= j && LimiteX + (Dimensionamento * 2) >= j}
    function create_if_block_57(ctx) {
    	let if_block_anchor;

    	function select_block_type_15(ctx, dirty) {
    		if (/*elementos*/ ctx[62] == 0) return create_if_block_58;
    		if (/*elementos*/ ctx[62] == 1) return create_if_block_59;
    		if (/*elementos*/ ctx[62] == "V") return create_if_block_60;
    		if (/*elementos*/ ctx[62] == "DANTE") return create_if_block_61;
    		if (/*elementos*/ ctx[62] == 8) return create_if_block_62;
    		if (/*elementos*/ ctx[62] == 7) return create_if_block_63;
    		if (/*elementos*/ ctx[62] == "MINOS") return create_if_block_64;
    	}

    	let current_block_type = select_block_type_15(ctx);
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
    			if (current_block_type !== (current_block_type = select_block_type_15(ctx))) {
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
    		id: create_if_block_57.name,
    		type: "if",
    		source: "(978:16) {#if LimiteX <= j && LimiteX + (Dimensionamento * 2) >= j}",
    		ctx
    	});

    	return block;
    }

    // (991:51) 
    function create_if_block_64(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/minotauro.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "monstro");
    			add_location(img, file$1, 991, 28, 57269);
    			add_location(th, file$1, 991, 24, 57265);
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
    		id: create_if_block_64.name,
    		type: "if",
    		source: "(991:51) ",
    		ctx
    	});

    	return block;
    }

    // (989:45) 
    function create_if_block_63(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredefalsanivel2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "paredefalsa");
    			add_location(img, file$1, 989, 28, 57119);
    			add_location(th, file$1, 989, 24, 57115);
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
    		id: create_if_block_63.name,
    		type: "if",
    		source: "(989:45) ",
    		ctx
    	});

    	return block;
    }

    // (987:45) 
    function create_if_block_62(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/saida.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "8");
    			add_location(img, file$1, 987, 28, 56999);
    			add_location(th, file$1, 987, 24, 56995);
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
    		id: create_if_block_62.name,
    		type: "if",
    		source: "(987:45) ",
    		ctx
    	});

    	return block;
    }

    // (985:51) 
    function create_if_block_61(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/Dante.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "personagem");
    			add_location(img, file$1, 985, 43, 56868);
    			attr_dev(th, "class", "Dante3");
    			add_location(th, file$1, 985, 24, 56849);
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
    		id: create_if_block_61.name,
    		type: "if",
    		source: "(985:51) ",
    		ctx
    	});

    	return block;
    }

    // (983:47) 
    function create_if_block_60(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/saidanivel3.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "saida");
    			add_location(img, file$1, 983, 28, 56715);
    			add_location(th, file$1, 983, 24, 56711);
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
    		id: create_if_block_60.name,
    		type: "if",
    		source: "(983:47) ",
    		ctx
    	});

    	return block;
    }

    // (981:45) 
    function create_if_block_59(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredenivel3.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			add_location(img, file$1, 981, 28, 56579);
    			add_location(th, file$1, 981, 24, 56575);
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
    		id: create_if_block_59.name,
    		type: "if",
    		source: "(981:45) ",
    		ctx
    	});

    	return block;
    }

    // (979:20) {#if elementos == 0}
    function create_if_block_58(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/chaonivel3.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "chao");
    			add_location(img, file$1, 979, 29, 56449);
    			add_location(th, file$1, 979, 24, 56444);
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
    		id: create_if_block_58.name,
    		type: "if",
    		source: "(979:20) {#if elementos == 0}",
    		ctx
    	});

    	return block;
    }

    // (977:16) {#each linhas as elementos,j}
    function create_each_block_13(ctx) {
    	let if_block_anchor;
    	let if_block = /*LimiteX*/ ctx[7] <= /*j*/ ctx[64] && /*LimiteX*/ ctx[7] + /*Dimensionamento*/ ctx[20] * 2 >= /*j*/ ctx[64] && create_if_block_57(ctx);

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
    			if (/*LimiteX*/ ctx[7] <= /*j*/ ctx[64] && /*LimiteX*/ ctx[7] + /*Dimensionamento*/ ctx[20] * 2 >= /*j*/ ctx[64]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_57(ctx);
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
    		id: create_each_block_13.name,
    		type: "each",
    		source: "(977:16) {#each linhas as elementos,j}",
    		ctx
    	});

    	return block;
    }

    // (974:8) {#each mapa3 as linhas,i}
    function create_each_block_12(ctx) {
    	let if_block_anchor;
    	let if_block = /*LimiteY*/ ctx[8] <= /*i*/ ctx[61] && /*LimiteY*/ ctx[8] + /*Dimensionamento*/ ctx[20] * 2 >= /*i*/ ctx[61] && create_if_block_56(ctx);

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
    			if (/*LimiteY*/ ctx[8] <= /*i*/ ctx[61] && /*LimiteY*/ ctx[8] + /*Dimensionamento*/ ctx[20] * 2 >= /*i*/ ctx[61]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_56(ctx);
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
    		id: create_each_block_12.name,
    		type: "each",
    		source: "(974:8) {#each mapa3 as linhas,i}",
    		ctx
    	});

    	return block;
    }

    // (913:8) {:else}
    function create_else_block_2(ctx) {
    	let p0;
    	let t5;
    	let p1;
    	let t7;
    	let p2;
    	let t9;
    	let p3;
    	let t11;
    	let p4;
    	let t13;
    	let p5;
    	let t14_value = /*Perguntas*/ ctx[30][/*NumeroEscolhido*/ ctx[18]] + "";
    	let t14;
    	let t15;
    	let p6;
    	let t16;
    	let t17;
    	let input;
    	let t18;
    	let each_1_anchor;
    	let mounted;
    	let dispose;
    	let each_value_10 = /*mapa2*/ ctx[4];
    	validate_each_argument(each_value_10);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_10.length; i += 1) {
    		each_blocks[i] = create_each_block_10(get_each_context_10(ctx, each_value_10, i));
    	}

    	const block = {
    		c: function create() {
    			p0 = element("p");

    			p0.textContent = `${/*TempoEnigma*/ ctx[25]()} 
            ${/*ResertarContador*/ ctx[26]()} 
            ${/*ProximoEnigma*/ ctx[32]()}`;

    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "Gostei de você, jovem.";
    			t7 = space();
    			p2 = element("p");
    			p2.textContent = "Como pôde perceber, nem tudo é o que parece.";
    			t9 = space();
    			p3 = element("p");
    			p3.textContent = "Espero não acostuma-lo mal, mas por enquanto vou aconselha-lo a não confiar tanto no que seus olhos vêem.";
    			t11 = space();
    			p4 = element("p");
    			p4.textContent = "Paredes falsas podem parecer algo impensável para humanos, mas não me compare com seres como vocês.";
    			t13 = space();
    			p5 = element("p");
    			t14 = text(t14_value);
    			t15 = space();
    			p6 = element("p");
    			t16 = text(/*contador*/ ctx[13]);
    			t17 = space();
    			input = element("input");
    			t18 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(p0, "class", "textofutil");
    			add_location(p0, file$1, 913, 8, 53532);
    			attr_dev(p1, "class", "Enigma");
    			add_location(p1, file$1, 919, 8, 53668);
    			attr_dev(p2, "class", "Enigma");
    			add_location(p2, file$1, 920, 8, 53721);
    			attr_dev(p3, "class", "Enigma");
    			add_location(p3, file$1, 921, 8, 53796);
    			attr_dev(p4, "class", "Enigma");
    			add_location(p4, file$1, 922, 8, 53932);
    			attr_dev(p5, "class", "EnigmaPergunta");
    			add_location(p5, file$1, 923, 8, 54062);
    			attr_dev(p6, "class", "Contador");
    			add_location(p6, file$1, 924, 8, 54130);
    			attr_dev(input, "placeholder", "APENAS LETRAS MAIUSCULAS");
    			attr_dev(input, "class", "RespostaEnigma");
    			add_location(input, file$1, 925, 8, 54173);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, p5, anchor);
    			append_dev(p5, t14);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, p6, anchor);
    			append_dev(p6, t16);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*PalavraChave*/ ctx[11]);
    			insert_dev(target, t18, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler_2*/ ctx[36]),
    					listen_dev(
    						input,
    						"keydown",
    						function () {
    							if (is_function(/*Alterando*/ ctx[24](/*PalavraChave*/ ctx[11] == /*respostas*/ ctx[31][/*NumeroEscolhido*/ ctx[18]], /*MudandoDeFase*/ ctx[9]))) /*Alterando*/ ctx[24](/*PalavraChave*/ ctx[11] == /*respostas*/ ctx[31][/*NumeroEscolhido*/ ctx[18]], /*MudandoDeFase*/ ctx[9]).apply(this, arguments);
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
    			if (dirty[0] & /*NumeroEscolhido*/ 262144 && t14_value !== (t14_value = /*Perguntas*/ ctx[30][/*NumeroEscolhido*/ ctx[18]] + "")) set_data_dev(t14, t14_value);
    			if (dirty[0] & /*contador*/ 8192) set_data_dev(t16, /*contador*/ ctx[13]);

    			if (dirty[0] & /*PalavraChave*/ 2048 && input.value !== /*PalavraChave*/ ctx[11]) {
    				set_input_value(input, /*PalavraChave*/ ctx[11]);
    			}

    			if (dirty[0] & /*mapa2*/ 16) {
    				each_value_10 = /*mapa2*/ ctx[4];
    				validate_each_argument(each_value_10);
    				let i;

    				for (i = 0; i < each_value_10.length; i += 1) {
    					const child_ctx = get_each_context_10(ctx, each_value_10, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_10(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_10.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(p6);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t18);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(913:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (862:4) {#if !enigma}
    function create_if_block_33(ctx) {
    	let p;
    	let t0_value = /*IniciarACaçada*/ ctx[28]() + "";
    	let t0;
    	let t1;
    	let t2_value = /*Cronometrar*/ ctx[27]() + "";
    	let t2;
    	let t3;
    	let t4_value = /*acelerar*/ ctx[29](/*Indice*/ ctx[15] == /*SaveIndice*/ ctx[16]) + "";
    	let t4;
    	let t5;
    	let t6_value = clearInterval(/*Tempo*/ ctx[12]) + "";
    	let t6;
    	let t7;
    	let t8_value = /*RenderizandoMapa*/ ctx[21]() + "";
    	let t8;
    	let t9;
    	let t10_value = /*DeterminandoEixos*/ ctx[22](/*MudandoDeFase*/ ctx[9]) + "";
    	let t10;
    	let t11;
    	let t12;
    	let table;
    	let t13;
    	let div;
    	let ul;

    	function select_block_type_10(ctx, dirty) {
    		if (/*HoraDaCaçada*/ ctx[17] > 0) return create_if_block_43;
    		if (/*Ritmo*/ ctx[14] == 3000) return create_if_block_44;
    		if (/*Ritmo*/ ctx[14] == 2000) return create_if_block_45;
    		if (/*Ritmo*/ ctx[14] == 1000) return create_if_block_46;
    		if (/*Ritmo*/ ctx[14] < 1000) return create_if_block_47;
    	}

    	let current_block_type = select_block_type_10(ctx);
    	let if_block = current_block_type && current_block_type(ctx);
    	let each_value_8 = /*mapa2*/ ctx[4];
    	validate_each_argument(each_value_8);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_8.length; i += 1) {
    		each_blocks[i] = create_each_block_8(get_each_context_8(ctx, each_value_8, i));
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			t4 = text(t4_value);
    			t5 = space();
    			t6 = text(t6_value);
    			t7 = space();
    			t8 = text(t8_value);
    			t9 = space();
    			t10 = text(t10_value);
    			t11 = space();
    			if (if_block) if_block.c();
    			t12 = space();
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t13 = space();
    			div = element("div");
    			ul = element("ul");
    			ul.textContent = "Os deuses acataram a ira e súplicas do rei, mas não iriam contra Poseidon por um mero mortal. Então, com uma idéia de Atena, decidiram aprisionar o monstro em um labirinto. Desde então Minotauro vive de suas caçadas, e posso afirmar que ele sabe bem como tratar seus visitantes.";
    			attr_dev(p, "class", "textofutil");
    			add_location(p, file$1, 863, 4, 51078);
    			attr_dev(table, "class", "mapa");
    			attr_dev(table, "align", "center");
    			attr_dev(table, "id", "mapanivel2");
    			add_location(table, file$1, 882, 4, 51773);
    			attr_dev(ul, "class", "info");
    			add_location(ul, file$1, 910, 8, 53196);
    			attr_dev(div, "id", "ContoDoMinotauro");
    			attr_dev(div, "class", "aimds");
    			add_location(div, file$1, 909, 4, 53146);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(p, t6);
    			append_dev(p, t7);
    			append_dev(p, t8);
    			append_dev(p, t9);
    			append_dev(p, t10);
    			insert_dev(target, t11, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			insert_dev(target, t13, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*Indice, SaveIndice*/ 98304 && t4_value !== (t4_value = /*acelerar*/ ctx[29](/*Indice*/ ctx[15] == /*SaveIndice*/ ctx[16]) + "")) set_data_dev(t4, t4_value);
    			if (dirty[0] & /*Tempo*/ 4096 && t6_value !== (t6_value = clearInterval(/*Tempo*/ ctx[12]) + "")) set_data_dev(t6, t6_value);
    			if (dirty[0] & /*MudandoDeFase*/ 512 && t10_value !== (t10_value = /*DeterminandoEixos*/ ctx[22](/*MudandoDeFase*/ ctx[9]) + "")) set_data_dev(t10, t10_value);

    			if (current_block_type === (current_block_type = select_block_type_10(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(t12.parentNode, t12);
    				}
    			}

    			if (dirty[0] & /*mapa2, LimiteX, Dimensionamento, LimiteY*/ 1048976) {
    				each_value_8 = /*mapa2*/ ctx[4];
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
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t11);

    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_33.name,
    		type: "if",
    		source: "(862:4) {#if !enigma}",
    		ctx
    	});

    	return block;
    }

    // (940:33) 
    function create_if_block_53(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "imgmini");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredefalsanivel2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "paredefalsa");
    			add_location(img, file$1, 940, 16, 55130);
    			add_location(th, file$1, 940, 12, 55126);
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
    		id: create_if_block_53.name,
    		type: "if",
    		source: "(940:33) ",
    		ctx
    	});

    	return block;
    }

    // (938:33) 
    function create_if_block_52(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "imgmini");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/saida.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "8");
    			add_location(img, file$1, 938, 16, 55018);
    			add_location(th, file$1, 938, 12, 55014);
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
    		id: create_if_block_52.name,
    		type: "if",
    		source: "(938:33) ",
    		ctx
    	});

    	return block;
    }

    // (936:39) 
    function create_if_block_51(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "imgmini");
    			attr_dev(img, "id", "chao1");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/chaonivel2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "personagem");
    			add_location(img, file$1, 936, 16, 54879);
    			add_location(th, file$1, 936, 12, 54875);
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
    		id: create_if_block_51.name,
    		type: "if",
    		source: "(936:39) ",
    		ctx
    	});

    	return block;
    }

    // (934:35) 
    function create_if_block_50(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "imgmini");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/saida.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "saida");
    			add_location(img, file$1, 934, 16, 54755);
    			add_location(th, file$1, 934, 12, 54751);
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
    		id: create_if_block_50.name,
    		type: "if",
    		source: "(934:35) ",
    		ctx
    	});

    	return block;
    }

    // (932:33) 
    function create_if_block_49(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "imgmini");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredenivel2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			add_location(img, file$1, 932, 16, 54627);
    			add_location(th, file$1, 932, 12, 54623);
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
    		id: create_if_block_49.name,
    		type: "if",
    		source: "(932:33) ",
    		ctx
    	});

    	return block;
    }

    // (930:8) {#if elementos == 0}
    function create_if_block_48(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "imgmini");
    			attr_dev(img, "id", "chao1");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/chaonivel2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "chao");
    			add_location(img, file$1, 930, 16, 54494);
    			add_location(th, file$1, 930, 12, 54490);
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
    		id: create_if_block_48.name,
    		type: "if",
    		source: "(930:8) {#if elementos == 0}",
    		ctx
    	});

    	return block;
    }

    // (929:8) {#each linhas as elementos}
    function create_each_block_11(ctx) {
    	let if_block_anchor;

    	function select_block_type_12(ctx, dirty) {
    		if (/*elementos*/ ctx[62] == 0) return create_if_block_48;
    		if (/*elementos*/ ctx[62] == 1) return create_if_block_49;
    		if (/*elementos*/ ctx[62] == "Z") return create_if_block_50;
    		if (/*elementos*/ ctx[62] == "DANTE") return create_if_block_51;
    		if (/*elementos*/ ctx[62] == 8) return create_if_block_52;
    		if (/*elementos*/ ctx[62] == 7) return create_if_block_53;
    	}

    	let current_block_type = select_block_type_12(ctx);
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
    			if (current_block_type !== (current_block_type = select_block_type_12(ctx))) {
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
    		id: create_each_block_11.name,
    		type: "each",
    		source: "(929:8) {#each linhas as elementos}",
    		ctx
    	});

    	return block;
    }

    // (927:8) {#each mapa2 as linhas}
    function create_each_block_10(ctx) {
    	let tr;
    	let t;
    	let each_value_11 = /*linhas*/ ctx[59];
    	validate_each_argument(each_value_11);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_11.length; i += 1) {
    		each_blocks[i] = create_each_block_11(get_each_context_11(ctx, each_value_11, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(tr, "class", "minimapa");
    			add_location(tr, file$1, 927, 8, 54391);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*mapa2*/ 16) {
    				each_value_11 = /*linhas*/ ctx[59];
    				validate_each_argument(each_value_11);
    				let i;

    				for (i = 0; i < each_value_11.length; i += 1) {
    					const child_ctx = get_each_context_11(ctx, each_value_11, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_11(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_11.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_10.name,
    		type: "each",
    		source: "(927:8) {#each mapa2 as linhas}",
    		ctx
    	});

    	return block;
    }

    // (880:27) 
    function create_if_block_47(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "O Minotauro está enfurecido";
    			attr_dev(p, "class", "Enigma");
    			add_location(p, file$1, 880, 8, 51709);
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
    		id: create_if_block_47.name,
    		type: "if",
    		source: "(880:27) ",
    		ctx
    	});

    	return block;
    }

    // (878:28) 
    function create_if_block_46(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "O Minotauro começou a correr";
    			attr_dev(p, "class", "Enigma");
    			add_location(p, file$1, 878, 8, 51622);
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
    		id: create_if_block_46.name,
    		type: "if",
    		source: "(878:28) ",
    		ctx
    	});

    	return block;
    }

    // (876:28) 
    function create_if_block_45(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "O Minotauro acelerou o passo";
    			attr_dev(p, "class", "Enigma");
    			add_location(p, file$1, 876, 8, 51534);
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
    		id: create_if_block_45.name,
    		type: "if",
    		source: "(876:28) ",
    		ctx
    	});

    	return block;
    }

    // (874:28) 
    function create_if_block_44(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "O Minotauro começou a perseguição";
    			attr_dev(p, "class", "Enigma");
    			add_location(p, file$1, 874, 8, 51441);
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
    		id: create_if_block_44.name,
    		type: "if",
    		source: "(874:28) ",
    		ctx
    	});

    	return block;
    }

    // (872:4) {#if HoraDaCaçada > 0}
    function create_if_block_43(ctx) {
    	let p;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("O Minotauro ira surgir em: ");
    			t1 = text(/*HoraDaCaçada*/ ctx[17]);
    			attr_dev(p, "class", "Enigma");
    			add_location(p, file$1, 872, 8, 51340);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*HoraDaCaçada*/ 131072) set_data_dev(t1, /*HoraDaCaçada*/ ctx[17]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_43.name,
    		type: "if",
    		source: "(872:4) {#if HoraDaCaçada > 0}",
    		ctx
    	});

    	return block;
    }

    // (885:8) {#if LimiteY <= i && LimiteY + (Dimensionamento * 2) >= i}
    function create_if_block_34(ctx) {
    	let tr;
    	let t;
    	let each_value_9 = /*linhas*/ ctx[59];
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
    			add_location(tr, file$1, 885, 12, 51938);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*mapa2, LimiteX, Dimensionamento*/ 1048720) {
    				each_value_9 = /*linhas*/ ctx[59];
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
    		id: create_if_block_34.name,
    		type: "if",
    		source: "(885:8) {#if LimiteY <= i && LimiteY + (Dimensionamento * 2) >= i}",
    		ctx
    	});

    	return block;
    }

    // (888:16) {#if LimiteX <= j && LimiteX + (Dimensionamento * 2) >= j}
    function create_if_block_35(ctx) {
    	let if_block_anchor;

    	function select_block_type_11(ctx, dirty) {
    		if (/*elementos*/ ctx[62] == 0) return create_if_block_36;
    		if (/*elementos*/ ctx[62] == 1) return create_if_block_37;
    		if (/*elementos*/ ctx[62] == "Z") return create_if_block_38;
    		if (/*elementos*/ ctx[62] == "DANTE") return create_if_block_39;
    		if (/*elementos*/ ctx[62] == 8) return create_if_block_40;
    		if (/*elementos*/ ctx[62] == 7) return create_if_block_41;
    		if (/*elementos*/ ctx[62] == "MINOS") return create_if_block_42;
    	}

    	let current_block_type = select_block_type_11(ctx);
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
    			if (current_block_type !== (current_block_type = select_block_type_11(ctx))) {
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
    		id: create_if_block_35.name,
    		type: "if",
    		source: "(888:16) {#if LimiteX <= j && LimiteX + (Dimensionamento * 2) >= j}",
    		ctx
    	});

    	return block;
    }

    // (901:51) 
    function create_if_block_42(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/minotauro.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "monstro");
    			add_location(img, file$1, 901, 28, 52947);
    			add_location(th, file$1, 901, 24, 52943);
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
    		id: create_if_block_42.name,
    		type: "if",
    		source: "(901:51) ",
    		ctx
    	});

    	return block;
    }

    // (899:45) 
    function create_if_block_41(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredefalsanivel2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "paredefalsa");
    			add_location(img, file$1, 899, 28, 52797);
    			add_location(th, file$1, 899, 24, 52793);
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
    		id: create_if_block_41.name,
    		type: "if",
    		source: "(899:45) ",
    		ctx
    	});

    	return block;
    }

    // (897:45) 
    function create_if_block_40(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/saida.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "8");
    			add_location(img, file$1, 897, 28, 52677);
    			add_location(th, file$1, 897, 24, 52673);
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
    		id: create_if_block_40.name,
    		type: "if",
    		source: "(897:45) ",
    		ctx
    	});

    	return block;
    }

    // (895:51) 
    function create_if_block_39(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/Dante.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "personagem");
    			add_location(img, file$1, 895, 43, 52546);
    			attr_dev(th, "class", "Dante2");
    			add_location(th, file$1, 895, 24, 52527);
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
    		id: create_if_block_39.name,
    		type: "if",
    		source: "(895:51) ",
    		ctx
    	});

    	return block;
    }

    // (893:47) 
    function create_if_block_38(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/saida.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "saida");
    			add_location(img, file$1, 893, 28, 52399);
    			add_location(th, file$1, 893, 24, 52395);
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
    		id: create_if_block_38.name,
    		type: "if",
    		source: "(893:47) ",
    		ctx
    	});

    	return block;
    }

    // (891:45) 
    function create_if_block_37(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredenivel2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			add_location(img, file$1, 891, 28, 52263);
    			add_location(th, file$1, 891, 24, 52259);
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
    		id: create_if_block_37.name,
    		type: "if",
    		source: "(891:45) ",
    		ctx
    	});

    	return block;
    }

    // (889:20) {#if elementos == 0}
    function create_if_block_36(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/chaonivel2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "chao");
    			add_location(img, file$1, 889, 28, 52133);
    			add_location(th, file$1, 889, 24, 52129);
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
    		id: create_if_block_36.name,
    		type: "if",
    		source: "(889:20) {#if elementos == 0}",
    		ctx
    	});

    	return block;
    }

    // (887:16) {#each linhas as elementos,j}
    function create_each_block_9(ctx) {
    	let if_block_anchor;
    	let if_block = /*LimiteX*/ ctx[7] <= /*j*/ ctx[64] && /*LimiteX*/ ctx[7] + /*Dimensionamento*/ ctx[20] * 2 >= /*j*/ ctx[64] && create_if_block_35(ctx);

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
    			if (/*LimiteX*/ ctx[7] <= /*j*/ ctx[64] && /*LimiteX*/ ctx[7] + /*Dimensionamento*/ ctx[20] * 2 >= /*j*/ ctx[64]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_35(ctx);
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
    		id: create_each_block_9.name,
    		type: "each",
    		source: "(887:16) {#each linhas as elementos,j}",
    		ctx
    	});

    	return block;
    }

    // (884:8) {#each mapa2 as linhas,i}
    function create_each_block_8(ctx) {
    	let if_block_anchor;
    	let if_block = /*LimiteY*/ ctx[8] <= /*i*/ ctx[61] && /*LimiteY*/ ctx[8] + /*Dimensionamento*/ ctx[20] * 2 >= /*i*/ ctx[61] && create_if_block_34(ctx);

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
    			if (/*LimiteY*/ ctx[8] <= /*i*/ ctx[61] && /*LimiteY*/ ctx[8] + /*Dimensionamento*/ ctx[20] * 2 >= /*i*/ ctx[61]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_34(ctx);
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
    		id: create_each_block_8.name,
    		type: "each",
    		source: "(884:8) {#each mapa2 as linhas,i}",
    		ctx
    	});

    	return block;
    }

    // (827:8) {:else}
    function create_else_block_1(ctx) {
    	let p0;
    	let t5;
    	let p1;
    	let t7;
    	let p2;
    	let t9;
    	let p3;
    	let t11;
    	let p4;
    	let t12_value = /*Perguntas*/ ctx[30][/*NumeroEscolhido*/ ctx[18]] + "";
    	let t12;
    	let t13;
    	let p5;
    	let t14;
    	let t15;
    	let t16;
    	let input;
    	let t17;
    	let each_1_anchor;
    	let mounted;
    	let dispose;
    	let each_value_6 = /*mapa1*/ ctx[3];
    	validate_each_argument(each_value_6);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	const block = {
    		c: function create() {
    			p0 = element("p");

    			p0.textContent = `${/*TempoEnigma*/ ctx[25]()} 
            ${/*ResertarContador*/ ctx[26]()} 
            ${/*ProximoEnigma*/ ctx[32]()}`;

    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "O que achou das provações resultantes de sua ações precipitadas?";
    			t7 = space();
    			p2 = element("p");
    			p2.textContent = "Deveria tomar cuidado, este não é um labirinto comum e os guardiões deste lugar não gostam de visitantes inesperados.";
    			t9 = space();
    			p3 = element("p");
    			p3.textContent = "Responda-me cautelosamente, deuses não costumam ser piedosos como tanto propagam.";
    			t11 = space();
    			p4 = element("p");
    			t12 = text(t12_value);
    			t13 = space();
    			p5 = element("p");
    			t14 = text(/*contador*/ ctx[13]);
    			t15 = text("s");
    			t16 = space();
    			input = element("input");
    			t17 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(p0, "class", "textofutil");
    			add_location(p0, file$1, 827, 8, 49405);
    			attr_dev(p1, "class", "Enigma");
    			add_location(p1, file$1, 832, 8, 49540);
    			attr_dev(p2, "class", "Enigma");
    			add_location(p2, file$1, 833, 8, 49635);
    			attr_dev(p3, "class", "Enigma");
    			add_location(p3, file$1, 834, 8, 49783);
    			attr_dev(p4, "class", "EnigmaPergunta");
    			add_location(p4, file$1, 835, 8, 49895);
    			attr_dev(p5, "class", "Contador");
    			add_location(p5, file$1, 836, 8, 49963);
    			attr_dev(input, "placeholder", "APENAS LETRAS MAIUSCULAS");
    			attr_dev(input, "class", "RespostaEnigma");
    			add_location(input, file$1, 837, 4, 50003);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, p4, anchor);
    			append_dev(p4, t12);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, p5, anchor);
    			append_dev(p5, t14);
    			append_dev(p5, t15);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*PalavraChave*/ ctx[11]);
    			insert_dev(target, t17, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler_1*/ ctx[35]),
    					listen_dev(
    						input,
    						"keydown",
    						function () {
    							if (is_function(/*Alterando*/ ctx[24](/*PalavraChave*/ ctx[11] == /*respostas*/ ctx[31][/*NumeroEscolhido*/ ctx[18]], /*MudandoDeFase*/ ctx[9]))) /*Alterando*/ ctx[24](/*PalavraChave*/ ctx[11] == /*respostas*/ ctx[31][/*NumeroEscolhido*/ ctx[18]], /*MudandoDeFase*/ ctx[9]).apply(this, arguments);
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
    			if (dirty[0] & /*NumeroEscolhido*/ 262144 && t12_value !== (t12_value = /*Perguntas*/ ctx[30][/*NumeroEscolhido*/ ctx[18]] + "")) set_data_dev(t12, t12_value);
    			if (dirty[0] & /*contador*/ 8192) set_data_dev(t14, /*contador*/ ctx[13]);

    			if (dirty[0] & /*PalavraChave*/ 2048 && input.value !== /*PalavraChave*/ ctx[11]) {
    				set_input_value(input, /*PalavraChave*/ ctx[11]);
    			}

    			if (dirty[0] & /*mapa1*/ 8) {
    				each_value_6 = /*mapa1*/ ctx[3];
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
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t17);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(827:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (775:4) {#if !enigma}
    function create_if_block_13(ctx) {
    	let p;
    	let t0_value = /*IniciarACaçada*/ ctx[28]() + "";
    	let t0;
    	let t1;
    	let t2_value = /*Cronometrar*/ ctx[27]() + "";
    	let t2;
    	let t3;
    	let t4_value = /*acelerar*/ ctx[29](/*Indice*/ ctx[15] == /*SaveIndice*/ ctx[16]) + "";
    	let t4;
    	let t5;
    	let t6_value = clearInterval(/*Tempo*/ ctx[12]) + "";
    	let t6;
    	let t7;
    	let t8_value = /*RenderizandoMapa*/ ctx[21]() + "";
    	let t8;
    	let t9;
    	let t10_value = /*DeterminandoEixos*/ ctx[22](/*MudandoDeFase*/ ctx[9]) + "";
    	let t10;
    	let t11;
    	let t12;
    	let table;
    	let t13;
    	let div;
    	let ul;

    	function select_block_type_6(ctx, dirty) {
    		if (/*HoraDaCaçada*/ ctx[17] > 0) return create_if_block_22;
    		if (/*Ritmo*/ ctx[14] == 3000) return create_if_block_23;
    		if (/*Ritmo*/ ctx[14] == 2000) return create_if_block_24;
    		if (/*Ritmo*/ ctx[14] == 1000) return create_if_block_25;
    		if (/*Ritmo*/ ctx[14] < 1000) return create_if_block_26;
    	}

    	let current_block_type = select_block_type_6(ctx);
    	let if_block = current_block_type && current_block_type(ctx);
    	let each_value_4 = /*mapa1*/ ctx[3];
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			t4 = text(t4_value);
    			t5 = space();
    			t6 = text(t6_value);
    			t7 = space();
    			t8 = text(t8_value);
    			t9 = space();
    			t10 = text(t10_value);
    			t11 = space();
    			if (if_block) if_block.c();
    			t12 = space();
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t13 = space();
    			div = element("div");
    			ul = element("ul");
    			ul.textContent = "Há muito tempo atrás, mais tempo do que todas as suas gerações podem ter passado na terra,\n        Minotauro nasceu da relação da rainha de Creta com um touro dado por Poseidon.\n        O rei tomado pela raiva tentou matar o animal,\n        mas Poseidon interviu todas as vezes pela vida de sua criação.";
    			attr_dev(p, "class", "textofutil");
    			add_location(p, file$1, 776, 4, 47065);
    			attr_dev(table, "class", "mapa");
    			attr_dev(table, "align", "center");
    			attr_dev(table, "id", "mapanivel1");
    			add_location(table, file$1, 795, 4, 47760);
    			attr_dev(ul, "class", "info");
    			add_location(ul, file$1, 821, 8, 49044);
    			attr_dev(div, "id", "ContoDoMinotauro");
    			attr_dev(div, "class", "aimds");
    			add_location(div, file$1, 820, 4, 48994);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(p, t6);
    			append_dev(p, t7);
    			append_dev(p, t8);
    			append_dev(p, t9);
    			append_dev(p, t10);
    			insert_dev(target, t11, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			insert_dev(target, t13, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*Indice, SaveIndice*/ 98304 && t4_value !== (t4_value = /*acelerar*/ ctx[29](/*Indice*/ ctx[15] == /*SaveIndice*/ ctx[16]) + "")) set_data_dev(t4, t4_value);
    			if (dirty[0] & /*Tempo*/ 4096 && t6_value !== (t6_value = clearInterval(/*Tempo*/ ctx[12]) + "")) set_data_dev(t6, t6_value);
    			if (dirty[0] & /*MudandoDeFase*/ 512 && t10_value !== (t10_value = /*DeterminandoEixos*/ ctx[22](/*MudandoDeFase*/ ctx[9]) + "")) set_data_dev(t10, t10_value);

    			if (current_block_type === (current_block_type = select_block_type_6(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(t12.parentNode, t12);
    				}
    			}

    			if (dirty[0] & /*mapa1, LimiteX, Dimensionamento, LimiteY*/ 1048968) {
    				each_value_4 = /*mapa1*/ ctx[3];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
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
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t11);

    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(775:4) {#if !enigma}",
    		ctx
    	});

    	return block;
    }

    // (850:33) 
    function create_if_block_31(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "imgmini");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/saida.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "8");
    			add_location(img, file$1, 850, 16, 50839);
    			add_location(th, file$1, 850, 12, 50835);
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
    		id: create_if_block_31.name,
    		type: "if",
    		source: "(850:33) ",
    		ctx
    	});

    	return block;
    }

    // (848:39) 
    function create_if_block_30(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "imgmini");
    			attr_dev(img, "id", "chao1");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/chaonivel1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "personagem");
    			add_location(img, file$1, 848, 16, 50701);
    			add_location(th, file$1, 848, 12, 50697);
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
    		id: create_if_block_30.name,
    		type: "if",
    		source: "(848:39) ",
    		ctx
    	});

    	return block;
    }

    // (846:35) 
    function create_if_block_29(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "imgmini");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/saida.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "saida");
    			add_location(img, file$1, 846, 16, 50577);
    			add_location(th, file$1, 846, 12, 50573);
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
    		id: create_if_block_29.name,
    		type: "if",
    		source: "(846:35) ",
    		ctx
    	});

    	return block;
    }

    // (844:33) 
    function create_if_block_28(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "imgmini");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredenivel1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			add_location(img, file$1, 844, 16, 50449);
    			add_location(th, file$1, 844, 12, 50445);
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
    		source: "(844:33) ",
    		ctx
    	});

    	return block;
    }

    // (842:8) {#if elementos == 0}
    function create_if_block_27(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "imgmini");
    			attr_dev(img, "id", "chao1");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/chaonivel1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "chao");
    			add_location(img, file$1, 842, 16, 50316);
    			add_location(th, file$1, 842, 12, 50312);
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
    		source: "(842:8) {#if elementos == 0}",
    		ctx
    	});

    	return block;
    }

    // (841:8) {#each linhas as elementos}
    function create_each_block_7(ctx) {
    	let if_block_anchor;

    	function select_block_type_8(ctx, dirty) {
    		if (/*elementos*/ ctx[62] == 0) return create_if_block_27;
    		if (/*elementos*/ ctx[62] == 1) return create_if_block_28;
    		if (/*elementos*/ ctx[62] == "Y") return create_if_block_29;
    		if (/*elementos*/ ctx[62] == "DANTE") return create_if_block_30;
    		if (/*elementos*/ ctx[62] == 8) return create_if_block_31;
    	}

    	let current_block_type = select_block_type_8(ctx);
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
    			if (current_block_type !== (current_block_type = select_block_type_8(ctx))) {
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
    		id: create_each_block_7.name,
    		type: "each",
    		source: "(841:8) {#each linhas as elementos}",
    		ctx
    	});

    	return block;
    }

    // (839:4) {#each mapa1 as linhas}
    function create_each_block_6(ctx) {
    	let tr;
    	let t;
    	let each_value_7 = /*linhas*/ ctx[59];
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
    			attr_dev(tr, "class", "minimapa");
    			add_location(tr, file$1, 839, 4, 50213);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*mapa1*/ 8) {
    				each_value_7 = /*linhas*/ ctx[59];
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
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(839:4) {#each mapa1 as linhas}",
    		ctx
    	});

    	return block;
    }

    // (793:27) 
    function create_if_block_26(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "O Minotauro está enfurecido";
    			attr_dev(p, "class", "Enigma");
    			add_location(p, file$1, 793, 8, 47696);
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
    		id: create_if_block_26.name,
    		type: "if",
    		source: "(793:27) ",
    		ctx
    	});

    	return block;
    }

    // (791:28) 
    function create_if_block_25(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "O Minotauro começou a correr";
    			attr_dev(p, "class", "Enigma");
    			add_location(p, file$1, 791, 8, 47609);
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
    		id: create_if_block_25.name,
    		type: "if",
    		source: "(791:28) ",
    		ctx
    	});

    	return block;
    }

    // (789:28) 
    function create_if_block_24(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "O Minotauro acelerou o passo";
    			attr_dev(p, "class", "Enigma");
    			add_location(p, file$1, 789, 8, 47521);
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
    		id: create_if_block_24.name,
    		type: "if",
    		source: "(789:28) ",
    		ctx
    	});

    	return block;
    }

    // (787:28) 
    function create_if_block_23(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "O Minotauro começou a perseguição";
    			attr_dev(p, "class", "Enigma");
    			add_location(p, file$1, 787, 8, 47428);
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
    		id: create_if_block_23.name,
    		type: "if",
    		source: "(787:28) ",
    		ctx
    	});

    	return block;
    }

    // (785:4) {#if HoraDaCaçada > 0}
    function create_if_block_22(ctx) {
    	let p;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("O Minotauro ira surgir em: ");
    			t1 = text(/*HoraDaCaçada*/ ctx[17]);
    			attr_dev(p, "class", "Enigma");
    			add_location(p, file$1, 785, 8, 47327);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*HoraDaCaçada*/ 131072) set_data_dev(t1, /*HoraDaCaçada*/ ctx[17]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_22.name,
    		type: "if",
    		source: "(785:4) {#if HoraDaCaçada > 0}",
    		ctx
    	});

    	return block;
    }

    // (798:8) {#if LimiteY <= i && LimiteY + (Dimensionamento * 2) >= i}
    function create_if_block_14(ctx) {
    	let tr;
    	let t;
    	let each_value_5 = /*linhas*/ ctx[59];
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
    			add_location(tr, file$1, 798, 12, 47925);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*mapa1, LimiteX, Dimensionamento*/ 1048712) {
    				each_value_5 = /*linhas*/ ctx[59];
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
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(798:8) {#if LimiteY <= i && LimiteY + (Dimensionamento * 2) >= i}",
    		ctx
    	});

    	return block;
    }

    // (801:16) {#if LimiteX <= j && LimiteX + (Dimensionamento * 2) >= j}
    function create_if_block_15(ctx) {
    	let if_block_anchor;

    	function select_block_type_7(ctx, dirty) {
    		if (/*elementos*/ ctx[62] == 0) return create_if_block_16;
    		if (/*elementos*/ ctx[62] == 1) return create_if_block_17;
    		if (/*elementos*/ ctx[62] == "Y") return create_if_block_18;
    		if (/*elementos*/ ctx[62] == "DANTE") return create_if_block_19;
    		if (/*elementos*/ ctx[62] == 8) return create_if_block_20;
    		if (/*elementos*/ ctx[62] == "MINOS") return create_if_block_21;
    	}

    	let current_block_type = select_block_type_7(ctx);
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
    			if (current_block_type !== (current_block_type = select_block_type_7(ctx))) {
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
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(801:16) {#if LimiteX <= j && LimiteX + (Dimensionamento * 2) >= j}",
    		ctx
    	});

    	return block;
    }

    // (812:51) 
    function create_if_block_21(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/minotauro.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "monstro");
    			add_location(img, file$1, 812, 28, 48791);
    			add_location(th, file$1, 812, 24, 48787);
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
    		source: "(812:51) ",
    		ctx
    	});

    	return block;
    }

    // (810:45) 
    function create_if_block_20(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/saida.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "8");
    			add_location(img, file$1, 810, 28, 48665);
    			add_location(th, file$1, 810, 24, 48661);
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
    		source: "(810:45) ",
    		ctx
    	});

    	return block;
    }

    // (808:51) 
    function create_if_block_19(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/Dante.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "personagem");
    			add_location(img, file$1, 808, 43, 48534);
    			attr_dev(th, "class", "Dante1");
    			add_location(th, file$1, 808, 24, 48515);
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
    		source: "(808:51) ",
    		ctx
    	});

    	return block;
    }

    // (806:47) 
    function create_if_block_18(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/saida.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "saida");
    			add_location(img, file$1, 806, 28, 48387);
    			add_location(th, file$1, 806, 24, 48383);
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
    		source: "(806:47) ",
    		ctx
    	});

    	return block;
    }

    // (804:45) 
    function create_if_block_17(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredenivel1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			add_location(img, file$1, 804, 28, 48251);
    			add_location(th, file$1, 804, 24, 48247);
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
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(804:45) ",
    		ctx
    	});

    	return block;
    }

    // (802:20) {#if elementos == 0}
    function create_if_block_16(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/chaonivel1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "chao");
    			add_location(img, file$1, 802, 29, 48121);
    			add_location(th, file$1, 802, 24, 48116);
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
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(802:20) {#if elementos == 0}",
    		ctx
    	});

    	return block;
    }

    // (800:16) {#each linhas as elementos,j}
    function create_each_block_5(ctx) {
    	let if_block_anchor;
    	let if_block = /*LimiteX*/ ctx[7] <= /*j*/ ctx[64] && /*LimiteX*/ ctx[7] + /*Dimensionamento*/ ctx[20] * 2 >= /*j*/ ctx[64] && create_if_block_15(ctx);

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
    			if (/*LimiteX*/ ctx[7] <= /*j*/ ctx[64] && /*LimiteX*/ ctx[7] + /*Dimensionamento*/ ctx[20] * 2 >= /*j*/ ctx[64]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_15(ctx);
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
    		source: "(800:16) {#each linhas as elementos,j}",
    		ctx
    	});

    	return block;
    }

    // (797:8) {#each mapa1 as linhas,i}
    function create_each_block_4(ctx) {
    	let if_block_anchor;
    	let if_block = /*LimiteY*/ ctx[8] <= /*i*/ ctx[61] && /*LimiteY*/ ctx[8] + /*Dimensionamento*/ ctx[20] * 2 >= /*i*/ ctx[61] && create_if_block_14(ctx);

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
    			if (/*LimiteY*/ ctx[8] <= /*i*/ ctx[61] && /*LimiteY*/ ctx[8] + /*Dimensionamento*/ ctx[20] * 2 >= /*i*/ ctx[61]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_14(ctx);
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
    		source: "(797:8) {#each mapa1 as linhas,i}",
    		ctx
    	});

    	return block;
    }

    // (745:8) {:else}
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
    	let t12;
    	let each_1_anchor;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*mapa0*/ ctx[2];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			p0.textContent = "Sempre que passar de fase, haverá um enigma a ser solucionado.";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "Lembre-se: Existe um limite de tempo para resolver os enigmas.";
    			t3 = space();
    			p2 = element("p");
    			p2.textContent = "Ao atingir o limite de tempo para resolver o enigma em qualquer nível você voltará para o primeiro.";
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
    			t12 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(p0, "class", "Enigma");
    			add_location(p0, file$1, 746, 8, 45445);
    			attr_dev(p1, "class", "Enigma");
    			add_location(p1, file$1, 747, 8, 45539);
    			attr_dev(p2, "class", "Enigma");
    			add_location(p2, file$1, 748, 8, 45633);
    			attr_dev(p3, "class", "Enigma");
    			add_location(p3, file$1, 749, 8, 45763);
    			attr_dev(p4, "class", "Enigma");
    			add_location(p4, file$1, 750, 8, 45868);
    			attr_dev(p5, "class", "Enigma");
    			add_location(p5, file$1, 751, 8, 45949);
    			attr_dev(input, "placeholder", "APENAS LETRAS MAIUSCULAS");
    			attr_dev(input, "class", "RespostaEnigma");
    			add_location(input, file$1, 752, 8, 46087);
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
    			set_input_value(input, /*PalavraChave*/ ctx[11]);
    			insert_dev(target, t12, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[34]),
    					listen_dev(
    						input,
    						"keydown",
    						function () {
    							if (is_function(/*Alterando*/ ctx[24](/*PalavraChave*/ ctx[11] == "OK", /*MudandoDeFase*/ ctx[9]))) /*Alterando*/ ctx[24](/*PalavraChave*/ ctx[11] == "OK", /*MudandoDeFase*/ ctx[9]).apply(this, arguments);
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

    			if (dirty[0] & /*PalavraChave*/ 2048 && input.value !== /*PalavraChave*/ ctx[11]) {
    				set_input_value(input, /*PalavraChave*/ ctx[11]);
    			}

    			if (dirty[0] & /*mapa0*/ 4) {
    				each_value_2 = /*mapa0*/ ctx[2];
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
    			if (detaching) detach_dev(t12);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(745:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (711:4) {#if !enigma}
    function create_if_block_1$1(ctx) {
    	let p;
    	let t0_value = /*RenderizandoMapa*/ ctx[21]() + "";
    	let t0;
    	let t1;
    	let t2_value = /*DeterminandoEixos*/ ctx[22](/*MudandoDeFase*/ ctx[9]) + "";
    	let t2;
    	let t3;
    	let div;
    	let ul0;
    	let h2;
    	let t5;
    	let ul1;
    	let t7;
    	let ul2;
    	let t9;
    	let ul3;
    	let t11;
    	let ul4;
    	let t13;
    	let table;
    	let each_value = /*mapa0*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			div = element("div");
    			ul0 = element("ul");
    			h2 = element("h2");
    			h2.textContent = "Como jogar?";
    			t5 = space();
    			ul1 = element("ul");
    			ul1.textContent = "↟ ou W para Cima";
    			t7 = space();
    			ul2 = element("ul");
    			ul2.textContent = "↡ ou S para Baixo";
    			t9 = space();
    			ul3 = element("ul");
    			ul3.textContent = "↠ ou D para a Direita";
    			t11 = space();
    			ul4 = element("ul");
    			ul4.textContent = "↞ ou A para a Esquerda";
    			t13 = space();
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p, "class", "textofutil");
    			add_location(p, file$1, 712, 4, 44028);
    			attr_dev(h2, "class", "h2");
    			add_location(h2, file$1, 717, 12, 44178);
    			add_location(ul0, file$1, 717, 8, 44174);
    			attr_dev(ul1, "class", "info");
    			add_location(ul1, file$1, 718, 8, 44223);
    			attr_dev(ul2, "class", "info");
    			add_location(ul2, file$1, 719, 8, 44270);
    			attr_dev(ul3, "class", "info");
    			add_location(ul3, file$1, 720, 8, 44318);
    			attr_dev(ul4, "class", "info");
    			add_location(ul4, file$1, 721, 8, 44370);
    			attr_dev(div, "id", "DicaTutorial");
    			attr_dev(div, "class", "aimds");
    			add_location(div, file$1, 716, 4, 44128);
    			attr_dev(table, "class", "mapa");
    			attr_dev(table, "align", "center");
    			attr_dev(table, "id", "mapatutorial");
    			add_location(table, file$1, 723, 4, 44430);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, ul0);
    			append_dev(ul0, h2);
    			append_dev(div, t5);
    			append_dev(div, ul1);
    			append_dev(div, t7);
    			append_dev(div, ul2);
    			append_dev(div, t9);
    			append_dev(div, ul3);
    			append_dev(div, t11);
    			append_dev(div, ul4);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*MudandoDeFase*/ 512 && t2_value !== (t2_value = /*DeterminandoEixos*/ ctx[22](/*MudandoDeFase*/ ctx[9]) + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*mapa0, LimiteX, Dimensionamento, LimiteY*/ 1048964) {
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
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(711:4) {#if !enigma}",
    		ctx
    	});

    	return block;
    }

    // (763:39) 
    function create_if_block_11(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "imgmini");
    			attr_dev(img, "id", "chao0");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/chaotutorial.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "personagem");
    			add_location(img, file$1, 763, 16, 46786);
    			add_location(th, file$1, 763, 12, 46782);
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
    		source: "(763:39) ",
    		ctx
    	});

    	return block;
    }

    // (761:35) 
    function create_if_block_10(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "imgmini");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/saida.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "saida");
    			add_location(img, file$1, 761, 16, 46662);
    			add_location(th, file$1, 761, 12, 46658);
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
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(761:35) ",
    		ctx
    	});

    	return block;
    }

    // (759:33) 
    function create_if_block_9(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "imgmini");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/paredetutorial.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parede");
    			add_location(img, file$1, 759, 16, 46532);
    			add_location(th, file$1, 759, 12, 46528);
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
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(759:33) ",
    		ctx
    	});

    	return block;
    }

    // (757:12) {#if elementos == 0}
    function create_if_block_8(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			attr_dev(img, "class", "imgmini");
    			attr_dev(img, "id", "chao0");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/chaotutorial.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "chao");
    			add_location(img, file$1, 757, 16, 46397);
    			add_location(th, file$1, 757, 12, 46393);
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
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(757:12) {#if elementos == 0}",
    		ctx
    	});

    	return block;
    }

    // (756:12) {#each linhas as elementos}
    function create_each_block_3(ctx) {
    	let if_block_anchor;

    	function select_block_type_4(ctx, dirty) {
    		if (/*elementos*/ ctx[62] == 0) return create_if_block_8;
    		if (/*elementos*/ ctx[62] == 1) return create_if_block_9;
    		if (/*elementos*/ ctx[62] == "X") return create_if_block_10;
    		if (/*elementos*/ ctx[62] == "DANTE") return create_if_block_11;
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
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(756:12) {#each linhas as elementos}",
    		ctx
    	});

    	return block;
    }

    // (754:8) {#each mapa0 as linhas}
    function create_each_block_2(ctx) {
    	let tr;
    	let t;
    	let each_value_3 = /*linhas*/ ctx[59];
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
    			attr_dev(tr, "class", "minimapa");
    			add_location(tr, file$1, 754, 12, 46286);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*mapa0*/ 4) {
    				each_value_3 = /*linhas*/ ctx[59];
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
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(754:8) {#each mapa0 as linhas}",
    		ctx
    	});

    	return block;
    }

    // (726:8) {#if LimiteY <= i && LimiteY + (Dimensionamento * 2) >= i}
    function create_if_block_2$1(ctx) {
    	let tr;
    	let t;
    	let each_value_1 = /*linhas*/ ctx[59];
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
    			add_location(tr, file$1, 726, 12, 44597);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*mapa0, LimiteX, Dimensionamento*/ 1048708) {
    				each_value_1 = /*linhas*/ ctx[59];
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
    		source: "(726:8) {#if LimiteY <= i && LimiteY + (Dimensionamento * 2) >= i}",
    		ctx
    	});

    	return block;
    }

    // (729:16) {#if LimiteX <= j && LimiteX + (Dimensionamento * 2) >= j}
    function create_if_block_3$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_3(ctx, dirty) {
    		if (/*elementos*/ ctx[62] == 0) return create_if_block_4$1;
    		if (/*elementos*/ ctx[62] == 1) return create_if_block_5;
    		if (/*elementos*/ ctx[62] == "X") return create_if_block_6;
    		if (/*elementos*/ ctx[62] == "DANTE") return create_if_block_7;
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
    		source: "(729:16) {#if LimiteX <= j && LimiteX + (Dimensionamento * 2) >= j}",
    		ctx
    	});

    	return block;
    }

    // (736:51) 
    function create_if_block_7(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/Dante.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "personagem");
    			add_location(img, file$1, 736, 43, 45230);
    			attr_dev(th, "class", "Dante0");
    			add_location(th, file$1, 736, 24, 45211);
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
    		source: "(736:51) ",
    		ctx
    	});

    	return block;
    }

    // (734:47) 
    function create_if_block_6(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/saida.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "saida");
    			add_location(img, file$1, 734, 28, 45083);
    			add_location(th, file$1, 734, 24, 45079);
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
    		source: "(734:47) ",
    		ctx
    	});

    	return block;
    }

    // (732:45) 
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
    			add_location(img, file$1, 732, 28, 44945);
    			add_location(th, file$1, 732, 24, 44941);
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
    		source: "(732:45) ",
    		ctx
    	});

    	return block;
    }

    // (730:20) {#if elementos == 0}
    function create_if_block_4$1(ctx) {
    	let th;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			th = element("th");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/imagens/chaotutorial.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "chao");
    			add_location(img, file$1, 730, 49, 44813);
    			attr_dev(th, "class", "chaoturorial");
    			add_location(th, file$1, 730, 24, 44788);
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
    		source: "(730:20) {#if elementos == 0}",
    		ctx
    	});

    	return block;
    }

    // (728:16) {#each linhas as elementos,j}
    function create_each_block_1(ctx) {
    	let if_block_anchor;
    	let if_block = /*LimiteX*/ ctx[7] <= /*j*/ ctx[64] && /*LimiteX*/ ctx[7] + /*Dimensionamento*/ ctx[20] * 2 >= /*j*/ ctx[64] && create_if_block_3$1(ctx);

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
    			if (/*LimiteX*/ ctx[7] <= /*j*/ ctx[64] && /*LimiteX*/ ctx[7] + /*Dimensionamento*/ ctx[20] * 2 >= /*j*/ ctx[64]) {
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
    		source: "(728:16) {#each linhas as elementos,j}",
    		ctx
    	});

    	return block;
    }

    // (725:8) {#each mapa0 as linhas,i}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let if_block = /*LimiteY*/ ctx[8] <= /*i*/ ctx[61] && /*LimiteY*/ ctx[8] + /*Dimensionamento*/ ctx[20] * 2 >= /*i*/ ctx[61] && create_if_block_2$1(ctx);

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
    			if (/*LimiteY*/ ctx[8] <= /*i*/ ctx[61] && /*LimiteY*/ ctx[8] + /*Dimensionamento*/ ctx[20] * 2 >= /*i*/ ctx[61]) {
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
    		source: "(725:8) {#each mapa0 as linhas,i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let head;
    	let link0;
    	let t0;
    	let link1;
    	let t1;
    	let link2;
    	let t2;
    	let t3;
    	let t4;
    	let div;
    	let audio;
    	let source0;
    	let source0_src_value;
    	let source1;
    	let source1_src_value;
    	let t5;
    	let current_block_type_index;
    	let if_block2;
    	let if_block2_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*key*/ ctx[0] && create_if_block_83(ctx);
    	let if_block1 = /*MudandoDeFase*/ ctx[9] !== "vitoria" && create_if_block_82(ctx);

    	const if_block_creators = [
    		create_if_block$1,
    		create_if_block_12,
    		create_if_block_32,
    		create_if_block_54,
    		create_if_block_76
    	];

    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*MudandoDeFase*/ ctx[9] == "tutorial") return 0;
    		if (/*MudandoDeFase*/ ctx[9] == "nivel1") return 1;
    		if (/*MudandoDeFase*/ ctx[9] == "nivel2") return 2;
    		if (/*MudandoDeFase*/ ctx[9] == "nivel3") return 3;
    		if (/*MudandoDeFase*/ ctx[9] == "vitoria") return 4;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			head = element("head");
    			link0 = element("link");
    			t0 = space();
    			link1 = element("link");
    			t1 = space();
    			link2 = element("link");
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			div = element("div");
    			audio = element("audio");
    			source0 = element("source");
    			source1 = element("source");
    			t5 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "href", "/css/jogo.css");
    			add_location(link0, file$1, 666, 4, 42745);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "/css/newjogo.css");
    			add_location(link1, file$1, 667, 4, 42794);
    			attr_dev(link2, "rel", "stylesheet");
    			attr_dev(link2, "href", "/css/ajuda.css");
    			add_location(link2, file$1, 668, 4, 42846);
    			add_location(head, file$1, 665, 0, 42734);
    			if (!src_url_equal(source0.src, source0_src_value = "/css/sons/PlayMusicGame.wav")) attr_dev(source0, "src", source0_src_value);
    			attr_dev(source0, "type", "audio/wav");
    			add_location(source0, file$1, 701, 2, 43685);
    			if (!src_url_equal(source1.src, source1_src_value = "/css/sons/PlayMusicGame.ogg")) attr_dev(source1, "src", source1_src_value);
    			attr_dev(source1, "type", "audio/ogg");
    			add_location(source1, file$1, 702, 2, 43747);
    			attr_dev(audio, "id", "audio");
    			audio.autoplay = true;
    			audio.loop = true;
    			add_location(audio, file$1, 700, 1, 43650);
    			add_location(div, file$1, 699, 0, 43643);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, head, anchor);
    			append_dev(head, link0);
    			append_dev(head, t0);
    			append_dev(head, link1);
    			append_dev(head, t1);
    			append_dev(head, link2);
    			insert_dev(target, t2, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, audio);
    			append_dev(audio, source0);
    			append_dev(audio, source1);
    			insert_dev(target, t5, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*handleKeydown*/ ctx[19], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*key*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_83(ctx);
    					if_block0.c();
    					if_block0.m(t3.parentNode, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*MudandoDeFase*/ ctx[9] !== "vitoria") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_82(ctx);
    					if_block1.c();
    					if_block1.m(t4.parentNode, t4);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block2) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block2 = if_blocks[current_block_type_index];

    					if (!if_block2) {
    						if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block2.c();
    					} else {
    						if_block2.p(ctx, dirty);
    					}

    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				} else {
    					if_block2 = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(head);
    			if (detaching) detach_dev(t2);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t5);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block2_anchor);
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

    function PrimeiroNumero(minimo, maximo) {
    	minimo = Math.ceil(minimo);
    	maximo = Math.floor(maximo);
    	return Math.floor(Math.random() * (maximo - minimo) + minimo);
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
    			1,
    			2
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
    			1,
    			2
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
    			1,
    			2
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
    			1,
    			2
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
    			1,
    			2
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
    			1,
    			2
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
    			1,
    			2
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
    			1,
    			2
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
    			"DANTE",
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
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
    			1,
    			2
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
    			1,
    			2
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
    			1,
    			2
    		],
    		[
    			2,
    			8,
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
    			1,
    			2
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
    			1,
    			2
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
    			1,
    			2
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
    			1,
    			2
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
    			8,
    			2
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
    			1,
    			2
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
    			1,
    			2
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
    			1,
    			2
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
    			1,
    			2
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
    			1,
    			2
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
    			1,
    			2
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
    			1,
    			2
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
    			1,
    			2
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
    			8,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			2
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
    			1,
    			2
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
    			1,
    			2
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
    			7,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
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
    			1,
    			2
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
    			1,
    			2
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
    			7,
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
    			1,
    			2
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
    			7,
    			0,
    			1,
    			0,
    			1,
    			2
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
    			2
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
    			7,
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
    			1,
    			2
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
    			1,
    			2
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
    			7,
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
    			1,
    			2
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
    			7,
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
    			1,
    			2
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
    			1,
    			2
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
    			7,
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
    			1,
    			2
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
    			1,
    			2
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
    			7,
    			7,
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
    			1,
    			2
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
    			1,
    			2
    		],
    		[
    			2,
    			8,
    			0,
    			0,
    			0,
    			0,
    			0,
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
    			1,
    			2
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
    			1,
    			2
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
    			7,
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
    			2
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
    			0,
    			0,
    			1,
    			0,
    			0,
    			0,
    			0,
    			1,
    			1,
    			7,
    			7,
    			1,
    			1,
    			1,
    			7,
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
    			2
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
    			2
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
    			0,
    			0,
    			0,
    			0,
    			0,
    			1,
    			0,
    			1,
    			2
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
    			0,
    			0,
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
    			0,
    			1,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			2
    		],
    		[
    			2,
    			1,
    			7,
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
    			2
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
    			2
    		],
    		[
    			2,
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
    			2
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
    			2
    		],
    		[
    			2,
    			1,
    			0,
    			1,
    			0,
    			1,
    			0,
    			0,
    			0,
    			7,
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
    			1,
    			0,
    			1,
    			1,
    			1,
    			0,
    			1,
    			0,
    			1,
    			2
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
    			2
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
    			2
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
    			1,
    			1,
    			0,
    			0,
    			0,
    			8,
    			2
    		],
    		[
    			2,
    			1,
    			"DANTE",
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
    			2
    		],
    		[
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
    			0,
    			0,
    			7,
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
    			1,
    			2
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
    			1,
    			0,
    			1,
    			1,
    			0,
    			1,
    			1,
    			1,
    			1,
    			2
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
    			0,
    			1,
    			1,
    			0,
    			0,
    			0,
    			0,
    			8,
    			2
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
    			0,
    			0,
    			0,
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
    			0,
    			0,
    			0,
    			0,
    			0,
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
    			2
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
    			0,
    			8,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			8,
    			7,
    			8,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			"Z",
    			1,
    			1,
    			8,
    			1,
    			1,
    			1,
    			1,
    			1,
    			8,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			2
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
    			8,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
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
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
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
    			7,
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
    			7,
    			0,
    			7,
    			0,
    			7,
    			0,
    			7,
    			0,
    			7,
    			0,
    			7,
    			0,
    			7,
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
    			8,
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
    			7,
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
    			7,
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
    			7,
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
    			7,
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
    			7,
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
    			7,
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
    			7,
    			7,
    			0,
    			0,
    			7,
    			7,
    			0,
    			0,
    			7,
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
    			7,
    			7,
    			7,
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
    			7,
    			7,
    			0,
    			0,
    			7,
    			7,
    			0,
    			0,
    			7,
    			7,
    			0,
    			0,
    			7,
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
    			8
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
    			8,
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
    			7,
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
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
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
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
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
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			0,
    			8
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
    			7,
    			1,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
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
    			7,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			7,
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
    			7,
    			1,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
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
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
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
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			1,
    			7,
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
    			7,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			7,
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
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			1,
    			7,
    			1,
    			7,
    			7,
    			7,
    			1,
    			7,
    			1,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			1,
    			7,
    			1,
    			7,
    			7,
    			7,
    			1,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			1,
    			7,
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
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			7,
    			1,
    			7,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
    			1,
    			7,
    			1,
    			7,
    			1,
    			7,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			7,
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
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			1,
    			7,
    			7,
    			7,
    			1,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			1,
    			7,
    			7,
    			7,
    			1,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
    			7,
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
    			3,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			8,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			8,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
    			1,
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
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			"C"
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
    			1
    		]
    	];

    	let Mapa1Save = [];
    	let Mapa2Save = [];
    	let Mapa3Save = [];

    	//limite de renderização:
    	let Dimensionamento = 3;

    	let LimiteX = 0;
    	let LimiteY = 0;

    	function RenderizandoMapa() {
    		if (MudandoDeFase == "tutorial") {
    			for (let i in mapa0) {
    				for (let j in mapa0[i]) {
    					if (mapa0[i][j] == "DANTE") {
    						$$invalidate(7, LimiteX = j - Dimensionamento);
    						$$invalidate(8, LimiteY = i - Dimensionamento);
    						return;
    					}
    				}
    			}
    		} else if (MudandoDeFase == "nivel1") {
    			for (let i in mapa1) {
    				for (let j in mapa1[i]) {
    					if (mapa1[i][j] == "DANTE") {
    						$$invalidate(7, LimiteX = j - Dimensionamento);
    						$$invalidate(8, LimiteY = i - Dimensionamento);
    						return;
    					}
    				}
    			}
    		} else if (MudandoDeFase == "nivel2") {
    			for (let i in mapa2) {
    				for (let j in mapa2[i]) {
    					if (mapa2[i][j] == "DANTE") {
    						$$invalidate(7, LimiteX = j - Dimensionamento);
    						$$invalidate(8, LimiteY = i - Dimensionamento);
    						return;
    					}
    				}
    			}
    		} else if (MudandoDeFase == "nivel3") {
    			for (let i in mapa3) {
    				for (let j in mapa3[i]) {
    					if (mapa3[i][j] == "DANTE") {
    						$$invalidate(7, LimiteX = j - Dimensionamento);
    						$$invalidate(8, LimiteY = i - Dimensionamento);
    						return;
    					}
    				}
    			}
    		} else if (MudandoDeFase == "vitoria") {
    			for (let i in mapa4) {
    				for (let j in mapa4[i]) {
    					if (mapa4[i][j] == "DANTE") {
    						$$invalidate(7, LimiteX = j - Dimensionamento);
    						$$invalidate(8, LimiteY = i - Dimensionamento);
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
    	let PontoDeSave1 = [0, 0];
    	let PontoDeSave2 = [0, 0];
    	let PontoDeSave3 = [0, 0];

    	function DeterminandoEixos(fase) {
    		//Ponto zero onde o jogador começa a jogar
    		if (fase == "tutorial") {
    			for (let i in mapa0) {
    				for (let j in mapa0[i]) {
    					if (mapa0[i][j] == "DANTE") {
    						EixoX = j;
    						EixoY = i;
    						return;
    					}
    				}
    			}
    		} else if (fase == "nivel1") {
    			for (let i in mapa1) {
    				for (let j in mapa1[i]) {
    					if (mapa1[i][j] == "DANTE") {
    						EixoX = j;
    						EixoY = i;
    						PontoDeSave1[0] = EixoX;
    						PontoDeSave1[1] = EixoY;
    						return;
    					}
    				}
    			}
    		} else if (fase == "nivel2") {
    			for (let i in mapa2) {
    				for (let j in mapa2[i]) {
    					if (mapa2[i][j] == "DANTE") {
    						EixoX = j;
    						EixoY = i;
    						PontoDeSave2[0] = EixoX;
    						PontoDeSave2[1] = EixoY;
    						return;
    					}
    				}
    			}
    		} else if (fase == "nivel3") {
    			for (let i in mapa3) {
    				for (let j in mapa3[i]) {
    					if (mapa3[i][j] == "DANTE") {
    						EixoX = j;
    						EixoY = i;
    						PontoDeSave3[0] = EixoX;
    						PontoDeSave3[1] = EixoY;
    						return;
    					}
    				}
    			}
    		} else if (fase == "vitoria") {
    			for (let i in mapa4) {
    				for (let j in mapa4[i]) {
    					if (mapa4[i][j] == "DANTE") {
    						EixoX = j;
    						EixoY = i;
    						return;
    					}
    				}
    			}
    		}
    	}

    	function RetornaAoSave() {
    		//Voltar para o nivel 1, para onde deveria voltar
    		$$invalidate(3, mapa1[EixoY][EixoX] = 0, mapa1);

    		EixoX = PontoDeSave1[0];
    		EixoY = PontoDeSave1[1];
    		$$invalidate(3, mapa1[EixoY][EixoX] = "DANTE", mapa1);
    		Tudodnv();
    		return;
    	}

    	function ResertarPosicao() {
    		//Caso tente passar por onde não deveria.
    		EixoX = SaveX;

    		EixoY = SaveY;
    		RenderizandoMapa();
    	}

    	//Toda movimentação segue a mesma lógica, mudando apenas qual Eixo vai ser alterado de valor.
    	function MovimentaçãoPeloMapa(move) {
    		SaveX = EixoX;
    		SaveY = EixoY;

    		if (move == "DIREITA") {
    			EixoX++;
    			$$invalidate(1, code = "d");
    		} else if (move == "ESQUERDA") {
    			EixoX--;
    			$$invalidate(1, code = "a");
    		} else if (move == "CIMA") {
    			EixoY--;
    			$$invalidate(1, code = "w");
    		} else if (move == "BAIXO") {
    			EixoY++;
    			$$invalidate(1, code = "s");
    		}

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
    			Mapa1Save.push([SaveX, SaveY]);

    			if (mapa1[EixoY][EixoX] != 0) {
    				if (mapa1[EixoY][EixoX] == "MINOS") {
    					alert('O monstro o alcançou');
    					RetornaAoSave();
    					$$invalidate(9, MudandoDeFase = "tutorial");
    				} else if (mapa1[EixoY][EixoX] == 8) {
    					//para Saidas falsas
    					alert('Não foi dessa vez!');
    				}

    				ResertarPosicao();
    				return;
    			}

    			$$invalidate(3, mapa1[EixoY][EixoX] = "DANTE", mapa1);
    			$$invalidate(3, mapa1[SaveY][SaveX] = 0, mapa1);
    		} else if (MudandoDeFase == "nivel2") {
    			MudarDeFase(mapa2[EixoY][EixoX]);
    			Mapa2Save.push([SaveX, SaveY]);

    			if (mapa2[EixoY][EixoX] == 7) {
    				//paredes falsas
    				if (mapa2[SaveY][SaveX] == 7) {
    					//não transforma paredes falsas em estrada
    					return;
    				}

    				$$invalidate(4, mapa2[SaveY][SaveX] = 0, mapa2);
    				return;
    			} else if (mapa2[EixoY][EixoX] != 0) {
    				if (mapa2[EixoY][EixoX] == "MINOS") {
    					alert('O monstro o alcançou');
    					RetornaAoSave();
    					$$invalidate(9, MudandoDeFase = "nivel1");
    				} else if (mapa2[EixoY][EixoX] == 8) {
    					//saida falsa
    					alert('Nem tudo é o que parece jovem Dante!');
    				}

    				ResertarPosicao();
    				return;
    			}

    			$$invalidate(4, mapa2[EixoY][EixoX] = "DANTE", mapa2);

    			if (mapa2[SaveY][SaveX] != 7) {
    				$$invalidate(4, mapa2[SaveY][SaveX] = 0, mapa2);
    			}
    		} else if (MudandoDeFase == "nivel3") {
    			MudarDeFase(mapa3[EixoY][EixoX]);
    			Mapa3Save.push([SaveX, SaveY]);

    			if (mapa3[EixoY][EixoX] == 7) {
    				if (mapa3[SaveY][SaveX] == 7) {
    					return;
    				}

    				$$invalidate(5, mapa3[SaveY][SaveX] = 0, mapa3);
    				return;
    			} else if (mapa3[EixoY][EixoX] != 0) {
    				if (mapa3[EixoY][EixoX] == "MINOS") {
    					alert('O monstro o alcançou');
    					RetornaAoSave();
    					$$invalidate(9, MudandoDeFase = "nivel1");
    				} else if (mapa3[EixoY][EixoX] == 8) {
    					alert('Não consegue, não é?');
    				}

    				ResertarPosicao();
    				return;
    			}

    			$$invalidate(5, mapa3[EixoY][EixoX] = "DANTE", mapa3);

    			if (mapa3[SaveY][SaveX] != 7) {
    				$$invalidate(5, mapa3[SaveY][SaveX] = 0, mapa3);
    			}
    		} else if (MudandoDeFase == "vitoria") {
    			MudarDeFase(mapa4[EixoY][EixoX]);

    			if (mapa4[EixoY][EixoX] != 0) {
    				ResertarPosicao();
    				return;
    			}

    			$$invalidate(6, mapa4[EixoY][EixoX] = "DANTE", mapa4);
    			$$invalidate(6, mapa4[SaveY][SaveX] = 0, mapa4);
    		}

    		RenderizandoMapa();
    	}

    	//Referente a mudança de fases:
    	let MudandoDeFase = "tutorial"; // fase inicial do jogo

    	function MudarDeFase(FaseAtual) {
    		if (FaseAtual == "X") {
    			$$invalidate(10, enigma = true);
    			Tudodnv();
    		} else if (FaseAtual == "Y") {
    			$$invalidate(10, enigma = true);
    			Tudodnv();
    		} else if (FaseAtual == "Z") {
    			$$invalidate(10, enigma = true);
    			Tudodnv();
    		} else if (FaseAtual == "V") {
    			$$invalidate(10, enigma = true);
    			Tudodnv();
    		} else if (FaseAtual == "C") {
    			$$invalidate(10, enigma = true);
    			Tudodnv();
    		}
    	}

    	//Referente aos enigmas:
    	let enigma = false;

    	let PalavraChave = '';

    	function Alterando(teste, fase) {
    		// mudança de fase ao acertar o enigma.
    		if (teste) {
    			$$invalidate(10, enigma = teste);
    			$$invalidate(11, PalavraChave = '');

    			if (fase == "tutorial") {
    				$$invalidate(9, MudandoDeFase = "nivel1");
    			} else if (fase == "nivel1") {
    				$$invalidate(9, MudandoDeFase = "nivel2");
    			} else if (fase == "nivel2") {
    				$$invalidate(9, MudandoDeFase = "nivel3");
    			} else if (fase == "nivel3") {
    				$$invalidate(9, MudandoDeFase = "vitoria");
    			}

    			$$invalidate(10, enigma = false);
    		}
    	}

    	let Tempo;
    	let temporizador = 300;
    	let contador = temporizador; // Contador geral para resolver todos os enigmas 

    	function TempoEnigma() {
    		$$invalidate(12, Tempo = setInterval(
    			() => {
    				$$invalidate(13, contador--, contador);

    				if (contador == 0) {
    					alert('Tempo Esgotado');
    					$$invalidate(9, MudandoDeFase = "nivel1");
    					$$invalidate(10, enigma = false);
    					RetornaAoSave();
    					return;
    				}
    			},
    			1000
    		));
    	}

    	function ResertarContador() {
    		$$invalidate(13, contador = temporizador);
    	}

    	let Movimentar;
    	let Ritmo = 4000;
    	let Indice = 0;
    	let PosicaoMonstroX = 0;
    	let PosicaoMonstroY = 0;
    	let SaveIndice = 60;

    	function Perseguição() {
    		clearInterval(Caçar);

    		Movimentar = setInterval(
    			() => {
    				if (MudandoDeFase == "nivel1") {
    					PosicaoMonstroX = Mapa1Save[Indice][0];
    					PosicaoMonstroY = Mapa1Save[Indice][1];

    					if (mapa1[PosicaoMonstroY][PosicaoMonstroX] != "DANTE") {
    						$$invalidate(3, mapa1[PosicaoMonstroY][PosicaoMonstroX] = "MINOS", mapa1);
    					} else {
    						alert('O monstro o alcançou');
    						RetornaAoSave();
    						$$invalidate(9, MudandoDeFase = "tutorial");
    						return;
    					}

    					if (Indice > 0) {
    						$$invalidate(3, mapa1[Mapa1Save[Indice - 1][1]][Mapa1Save[Indice - 1][0]] = 0, mapa1);
    					}
    				} else if (MudandoDeFase == "nivel2") {
    					PosicaoMonstroX = Mapa2Save[Indice][0];
    					PosicaoMonstroY = Mapa2Save[Indice][1];

    					if (mapa2[PosicaoMonstroY][PosicaoMonstroX] != "DANTE") {
    						$$invalidate(4, mapa2[PosicaoMonstroY][PosicaoMonstroX] = "MINOS", mapa2);
    					} else {
    						alert('O monstro o alcançou');
    						RetornaAoSave();
    						$$invalidate(9, MudandoDeFase = "nivel1");
    						return;
    					}

    					if (Indice > 0) {
    						$$invalidate(4, mapa2[Mapa2Save[Indice - 1][1]][Mapa2Save[Indice - 1][0]] = 0, mapa2);
    					}
    				} else if (MudandoDeFase == "nivel3") {
    					PosicaoMonstroX = Mapa3Save[Indice][0];
    					PosicaoMonstroY = Mapa3Save[Indice][1];

    					if (mapa3[PosicaoMonstroY][PosicaoMonstroX] != "DANTE") {
    						$$invalidate(5, mapa3[PosicaoMonstroY][PosicaoMonstroX] = "MINOS", mapa3);
    					} else {
    						alert('O monstro o alcançou');
    						RetornaAoSave();
    						$$invalidate(9, MudandoDeFase = "nivel1");
    						return;
    					}

    					if (Indice > 0) {
    						$$invalidate(5, mapa3[Mapa3Save[Indice - 1][1]][Mapa3Save[Indice - 1][0]] = 0, mapa3);
    					}
    				}

    				$$invalidate(15, Indice++, Indice);
    			},
    			Ritmo
    		);
    	}

    	let Caçar;
    	let Cronometro;
    	let HoraDaCaçada = 60;

    	function Cronometrar() {
    		Cronometro = setInterval(
    			() => {
    				$$invalidate(17, HoraDaCaçada--, HoraDaCaçada);
    			},
    			1000
    		);
    	}

    	function IniciarACaçada() {
    		Caçar = setInterval(
    			() => {
    				$$invalidate(14, Ritmo = 3000);
    				Perseguição();
    			},
    			60000
    		);
    	}

    	function acelerar(teste) {
    		if (teste) {
    			clearInterval(Movimentar);

    			if (Ritmo >= 1000) {
    				$$invalidate(14, Ritmo -= 1000);
    			} else if (Ritmo < 1000) {
    				$$invalidate(14, Ritmo -= 100);

    				if (Ritmo < 100) {
    					$$invalidate(14, Ritmo = 90);
    				}
    			}

    			$$invalidate(16, SaveIndice += 60);
    			Perseguição();
    		}
    	}

    	function Tudodnv() {
    		clearInterval(Cronometro);
    		clearInterval(Caçar);
    		clearInterval(Movimentar);
    		clearInterval(Tempo);
    		$$invalidate(17, HoraDaCaçada = 60);
    		$$invalidate(14, Ritmo = 3000);

    		if (MudandoDeFase == "nivel1") {
    			for (let i in mapa1) {
    				for (let j in mapa1[i]) {
    					if (mapa1[i][j] == "MINOS" || mapa1[i][j] == "DANTE") {
    						$$invalidate(3, mapa1[i][j] = 0, mapa1);
    					}
    				}
    			}

    			EixoX = PontoDeSave1[0];
    			EixoY = PontoDeSave1[1];
    			$$invalidate(3, mapa1[EixoY][EixoX] = "DANTE", mapa1);
    		} else if (MudandoDeFase == "nivel2") {
    			for (let i in mapa2) {
    				for (let j in mapa2[i]) {
    					if (mapa2[i][j] == "MINOS" || mapa2[i][j] == "DANTE") {
    						$$invalidate(4, mapa2[i][j] = 0, mapa2);
    					}
    				}
    			}

    			EixoX = PontoDeSave2[0];
    			EixoY = PontoDeSave2[1];
    			$$invalidate(4, mapa2[EixoY][EixoX] = "DANTE", mapa2);
    		} else if (MudandoDeFase == "nivel3") {
    			for (let i in mapa3) {
    				for (let j in mapa3[i]) {
    					if (mapa3[i][j] == "MINOS" || mapa3[i][j] == "DANTE") {
    						$$invalidate(5, mapa3[i][j] = 0, mapa3);
    					}
    				}
    			}

    			EixoX = PontoDeSave3[0];
    			EixoY = PontoDeSave3[1];
    			$$invalidate(5, mapa3[EixoY][EixoX] = "DANTE", mapa3);
    		}

    		$$invalidate(15, Indice = 0);
    		$$invalidate(16, SaveIndice = 60);
    		Mapa1Save = [];
    		Mapa2Save = [];
    		Mapa3Save = [];
    		return;
    	}

    	let NumeroEscolhido = 0;

    	let Perguntas = [
    		"Eis o Enigma: Fui levado para um quarto escuro e incendiado. Eu chorei e então minha cabeça foi cortada. Quem sou?",
    		"Eis o Enigma: Poder suficiente para esmagar navios e quebrar telhados mas mesmo assim tenho medo do sol. O que eu sou?",
    		"Eis o Enigma: Se você me tem, quer me compartilhar; se você não me compartilha, você me manteve. O que sou?",
    		"Eis o Enigma: Imagine que você está em uma sala escura ao lado de Sherlock. Nela há um fósforo, uma lampada de querosene, uma vela e uma lareira. O que você acenderia primeiro?",
    		"Eis o Enigma: Eu tenho uma coroa, mas não a uso na cabeça. Eu tenho cara, mas não tenho um corpo. Ter muitos de mim é sempre um bom negócio. o que eu sou?",
    		"Eis o Enigma: Eu vivo no céu, mas não tenho asas. Posso chorar, mas não tenho olhos. Onde quer que eu vá, a escuridão me segue. o que eu sou?",
    		"Eis o Enigma: Eu posso ser um deus, um planeta, e medir o calor. O que eu sou?"
    	];

    	let respostas = ["VELA", "GELO", "SEGREDO", "FOSFORO", "MOEDA", "NUVEM", "MERCURIO"];
    	NumeroEscolhido = PrimeiroNumero(0, Perguntas.length);

    	function ProximoEnigma() {
    		$$invalidate(18, NumeroEscolhido++, NumeroEscolhido);

    		if (NumeroEscolhido == Perguntas.length) {
    			$$invalidate(18, NumeroEscolhido = 0);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Newjogo> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => trocarEstadoDoJogo('menu');

    	function input_input_handler() {
    		PalavraChave = this.value;
    		$$invalidate(11, PalavraChave);
    	}

    	function input_input_handler_1() {
    		PalavraChave = this.value;
    		$$invalidate(11, PalavraChave);
    	}

    	function input_input_handler_2() {
    		PalavraChave = this.value;
    		$$invalidate(11, PalavraChave);
    	}

    	function input_input_handler_3() {
    		PalavraChave = this.value;
    		$$invalidate(11, PalavraChave);
    	}

    	$$self.$capture_state = () => ({
    		Vitoria,
    		VoltarMenu,
    		Creditos,
    		trocarEstadoDoJogo,
    		link,
    		key,
    		code,
    		handleKeydown,
    		mapa0,
    		mapa1,
    		mapa2,
    		mapa3,
    		mapa4,
    		Mapa1Save,
    		Mapa2Save,
    		Mapa3Save,
    		Dimensionamento,
    		LimiteX,
    		LimiteY,
    		RenderizandoMapa,
    		EixoX,
    		EixoY,
    		SaveX,
    		SaveY,
    		PontoDeSave1,
    		PontoDeSave2,
    		PontoDeSave3,
    		DeterminandoEixos,
    		RetornaAoSave,
    		ResertarPosicao,
    		MovimentaçãoPeloMapa,
    		MudandoDeFase,
    		MudarDeFase,
    		enigma,
    		PalavraChave,
    		Alterando,
    		Tempo,
    		temporizador,
    		contador,
    		TempoEnigma,
    		ResertarContador,
    		Movimentar,
    		Ritmo,
    		Indice,
    		PosicaoMonstroX,
    		PosicaoMonstroY,
    		SaveIndice,
    		Perseguição,
    		Caçar,
    		Cronometro,
    		HoraDaCaçada,
    		Cronometrar,
    		IniciarACaçada,
    		acelerar,
    		Tudodnv,
    		NumeroEscolhido,
    		Perguntas,
    		respostas,
    		PrimeiroNumero,
    		ProximoEnigma
    	});

    	$$self.$inject_state = $$props => {
    		if ('key' in $$props) $$invalidate(0, key = $$props.key);
    		if ('code' in $$props) $$invalidate(1, code = $$props.code);
    		if ('mapa0' in $$props) $$invalidate(2, mapa0 = $$props.mapa0);
    		if ('mapa1' in $$props) $$invalidate(3, mapa1 = $$props.mapa1);
    		if ('mapa2' in $$props) $$invalidate(4, mapa2 = $$props.mapa2);
    		if ('mapa3' in $$props) $$invalidate(5, mapa3 = $$props.mapa3);
    		if ('mapa4' in $$props) $$invalidate(6, mapa4 = $$props.mapa4);
    		if ('Mapa1Save' in $$props) Mapa1Save = $$props.Mapa1Save;
    		if ('Mapa2Save' in $$props) Mapa2Save = $$props.Mapa2Save;
    		if ('Mapa3Save' in $$props) Mapa3Save = $$props.Mapa3Save;
    		if ('Dimensionamento' in $$props) $$invalidate(20, Dimensionamento = $$props.Dimensionamento);
    		if ('LimiteX' in $$props) $$invalidate(7, LimiteX = $$props.LimiteX);
    		if ('LimiteY' in $$props) $$invalidate(8, LimiteY = $$props.LimiteY);
    		if ('EixoX' in $$props) EixoX = $$props.EixoX;
    		if ('EixoY' in $$props) EixoY = $$props.EixoY;
    		if ('SaveX' in $$props) SaveX = $$props.SaveX;
    		if ('SaveY' in $$props) SaveY = $$props.SaveY;
    		if ('PontoDeSave1' in $$props) PontoDeSave1 = $$props.PontoDeSave1;
    		if ('PontoDeSave2' in $$props) PontoDeSave2 = $$props.PontoDeSave2;
    		if ('PontoDeSave3' in $$props) PontoDeSave3 = $$props.PontoDeSave3;
    		if ('MudandoDeFase' in $$props) $$invalidate(9, MudandoDeFase = $$props.MudandoDeFase);
    		if ('enigma' in $$props) $$invalidate(10, enigma = $$props.enigma);
    		if ('PalavraChave' in $$props) $$invalidate(11, PalavraChave = $$props.PalavraChave);
    		if ('Tempo' in $$props) $$invalidate(12, Tempo = $$props.Tempo);
    		if ('temporizador' in $$props) temporizador = $$props.temporizador;
    		if ('contador' in $$props) $$invalidate(13, contador = $$props.contador);
    		if ('Movimentar' in $$props) Movimentar = $$props.Movimentar;
    		if ('Ritmo' in $$props) $$invalidate(14, Ritmo = $$props.Ritmo);
    		if ('Indice' in $$props) $$invalidate(15, Indice = $$props.Indice);
    		if ('PosicaoMonstroX' in $$props) PosicaoMonstroX = $$props.PosicaoMonstroX;
    		if ('PosicaoMonstroY' in $$props) PosicaoMonstroY = $$props.PosicaoMonstroY;
    		if ('SaveIndice' in $$props) $$invalidate(16, SaveIndice = $$props.SaveIndice);
    		if ('Caçar' in $$props) Caçar = $$props.Caçar;
    		if ('Cronometro' in $$props) Cronometro = $$props.Cronometro;
    		if ('HoraDaCaçada' in $$props) $$invalidate(17, HoraDaCaçada = $$props.HoraDaCaçada);
    		if ('NumeroEscolhido' in $$props) $$invalidate(18, NumeroEscolhido = $$props.NumeroEscolhido);
    		if ('Perguntas' in $$props) $$invalidate(30, Perguntas = $$props.Perguntas);
    		if ('respostas' in $$props) $$invalidate(31, respostas = $$props.respostas);
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
    		mapa4,
    		LimiteX,
    		LimiteY,
    		MudandoDeFase,
    		enigma,
    		PalavraChave,
    		Tempo,
    		contador,
    		Ritmo,
    		Indice,
    		SaveIndice,
    		HoraDaCaçada,
    		NumeroEscolhido,
    		handleKeydown,
    		Dimensionamento,
    		RenderizandoMapa,
    		DeterminandoEixos,
    		MovimentaçãoPeloMapa,
    		Alterando,
    		TempoEnigma,
    		ResertarContador,
    		Cronometrar,
    		IniciarACaçada,
    		acelerar,
    		Perguntas,
    		respostas,
    		ProximoEnigma,
    		click_handler,
    		input_input_handler,
    		input_input_handler_1,
    		input_input_handler_2,
    		input_input_handler_3
    	];
    }

    class Newjogo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {}, null, [-1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Newjogo",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.53.1 */
    const file = "src/App.svelte";

    // (24:33) 
    function create_if_block_4(ctx) {
    	let creditos;
    	let current;
    	creditos = new Creditos({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(creditos.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(creditos, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(creditos.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(creditos.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(creditos, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(24:33) ",
    		ctx
    	});

    	return block;
    }

    // (22:29) 
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
    		source: "(22:29) ",
    		ctx
    	});

    	return block;
    }

    // (20:30) 
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
    		source: "(20:30) ",
    		ctx
    	});

    	return block;
    }

    // (18:30) 
    function create_if_block_1(ctx) {
    	let newjogo;
    	let current;
    	newjogo = new Newjogo({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(newjogo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(newjogo, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(newjogo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(newjogo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(newjogo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(18:30) ",
    		ctx
    	});

    	return block;
    }

    // (16:0) {#if $estado === 'menu'}
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
    		source: "(16:0) {#if $estado === 'menu'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let head;
    	let link0;
    	let t0;
    	let link1;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	const if_block_creators = [
    		create_if_block,
    		create_if_block_1,
    		create_if_block_2,
    		create_if_block_3,
    		create_if_block_4
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$estado*/ ctx[0] === 'menu') return 0;
    		if (/*$estado*/ ctx[0] === 'jogar') return 1;
    		if (/*$estado*/ ctx[0] === 'sobre') return 2;
    		if (/*$estado*/ ctx[0] === 'ajuda') return 3;
    		if (/*$estado*/ ctx[0] === 'creditos') return 4;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			head = element("head");
    			link0 = element("link");
    			t0 = space();
    			link1 = element("link");
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "href", "/css/appsvelte.css");
    			add_location(link0, file, 11, 1, 263);
    			attr_dev(link1, "rel", "icon");
    			attr_dev(link1, "href", "/css/imagens/icone.png");
    			add_location(link1, file, 12, 1, 314);
    			add_location(head, file, 10, 0, 255);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, head, anchor);
    			append_dev(head, link0);
    			append_dev(head, t0);
    			append_dev(head, link1);
    			insert_dev(target, t1, anchor);

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
    			if (detaching) detach_dev(t1);

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
    		Ajuda,
    		Menu,
    		Sobre,
    		estado,
    		NewJogo: Newjogo,
    		Creditos,
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
