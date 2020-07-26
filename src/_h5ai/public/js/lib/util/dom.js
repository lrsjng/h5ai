const {each, filter, hasLength, is, isStr, map, isInstanceOf, toArray} = require('./lo');

const win = global.window;
const doc = win.document;

const parse_html = (() => {
    const create = name => doc.createElement(name);
    const rules = [
        [/^<t(head|body|foot)|^<c(ap|olg)/i, create('table')],
        [/^<col/i, create('colgroup')],
        [/^<tr/i, create('tbody')],
        [/^<t[dh]/i, create('tr')]
    ];
    const div = create('div');

    const findContainer = str => {
        for (const [re, el] of rules) {
            if (re.test(str)) {
                return el;
            }
        }
        return div;
    };

    return str => {
        const container = findContainer(str);
        container.innerHTML = str;
        const res = toArray(container.childNodes);
        each(res, el => container.removeChild(el));
        container.innerHTML = '';
        return res;
    };
})();

const query_all = (selector, context = doc) => {
    try {
        return toArray(context.querySelectorAll(selector));
    } catch (err) {
        return [];
    }
};

const is_el = x => isInstanceOf(x, win.Element);
const is_doc = x => isInstanceOf(x, win.Document);
const is_win = x => is(x) && x.window === x && is_doc(x.document);
const is_el_doc_win = x => is_el(x) || is_doc(x) || is_win(x);

const add_listener = (el, type, fn) => el.addEventListener(type, fn);
const remove_listener = (el, type, fn) => el.removeEventListener(type, fn);

const ready_promise = new Promise(resolve => {
    if ((/^(i|c|loade)/).test(doc.readyState)) {
        resolve();
    } else {
        add_listener(doc, 'DOMContentLoaded', () => resolve());
    }
});
const await_ready = () => ready_promise;

const load_promise = new Promise(resolve => {
    add_listener(win, 'load', () => resolve());
});
const await_load = () => load_promise;

const dom = arg => {
    if (isInstanceOf(arg, dom)) {
        return arg;
    }

    let els;
    if (isStr(arg)) {
        arg = arg.trim();
        els = arg[0] === '<' ? parse_html(arg) : query_all(arg);
    } else if (is_el_doc_win(arg)) {
        els = [arg];
    } else {
        els = hasLength(arg) ? arg : [arg];
    }
    els = filter(els, is_el_doc_win);

    return Object.assign(Object.create(dom.prototype), els, {length: els.length});
};

dom.prototype = {
    constructor: dom,

    each(fn) {
        each(this, fn);
        return this;
    },

    map(fn) {
        return map(this, fn);
    },

    find(selector) {
        return dom([].concat(...this.map(el => query_all(selector, el))));
    },

    on(type, fn) {
        return this.each(el => add_listener(el, type, fn));
    },

    off(type, fn) {
        return this.each(el => remove_listener(el, type, fn));
    },

    attr(key, value) {
        if (value === undefined) {
            return this.length ? this[0].getAttribute(key) : undefined;
        }
        return this.each(el => el.setAttribute(key, value));
    },

    rmAttr(key) {
        return this.each(el => el.removeAttribute(key));
    },

    prop(key, value) {
        if (value === undefined) {
            return this.length ? this[0][key] : undefined;
        }
        return this.each(el => {el[key] = value;});
    },

    rmProp(key) {
        return this.each(el => delete el[key]);
    },

    val(value) {
        if (value === undefined) {
            return this.length ? this[0].value : undefined;
        }
        return this.each(el => {
            el.value = value;
        });
    },

    html(str) {
        if (str === undefined) {
            return this.map(el => el.innerHTML).join('');
        }
        return this.each(el => {
            el.innerHTML = str;
        });
    },

    text(str) {
        if (str === undefined) {
            return this.map(el => el.textContent).join('');
        }
        return this.each(el => {
            el.textContent = str;
        });
    },

    clr() {
        return this.html('');
    },

    rm() {
        return this.each(el => {
            const parent = el.parentNode;
            if (parent) {
                parent.removeChild(el);
            }
        });
    },

    rpl(arg) {
        return this.each(el => {
            const parent = el.parentNode;
            if (parent) {
                parent.replaceChild(dom(arg)[0], el);
            }
        });
    },

    app(arg) {
        return this.each(el => {
            dom(arg).each(child => el.appendChild(child));
        });
    },

    appTo(arg) {
        dom(arg).app(this);
        return this;
    },

    pre(arg) {
        return this.each(el => {
            dom(arg).each(child => {
                const firstChild = el.firstChild;
                if (!firstChild) {
                    el.appendChild(child);
                } else {
                    el.insertBefore(child, firstChild);
                }
            });
        });
    },

    preTo(arg) {
        dom(arg).pre(this);
        return this;
    },

    cls(...names) {
        if (!names.length) {
            return this.length ? toArray(this[0].classList) : [];
        }
        this.each(el => {el.className = '';});
        return this.addCls(...names);
    },

    hasCls(name) {
        return toArray(this).every(el => el.classList.contains(name));
    },

    addCls(...names) {
        return this.each(el => {
            for (const name of names) {
                el.classList.add(name);
            }
        });
    },

    rmCls(...names) {
        return this.each(el => {
            for (const name of names) {
                el.classList.remove(name);
            }
        });
    },

    tglCls(...names) {
        return this.each(el => {
            for (const name of names) {
                if (el.classList.contains(name)) {
                    el.classList.remove(name);
                } else {
                    el.classList.add(name);
                }
            }
        });
    },

    parent() {
        return dom(this.map(el => el.parentNode));
    },

    children() {
        return dom([].concat(...this.map(el => toArray(el.children))));
    },

    hide() {
        return this.addCls('hidden');
    },

    show() {
        return this.rmCls('hidden');
    },

    isHidden() {
        return this.hasCls('hidden');
    },

    css(styles) {
        return this.each(el => Object.assign(el.style, styles));
    }
};

module.exports = {
    awaitReady: await_ready,
    awaitLoad: await_load,
    dom
};
