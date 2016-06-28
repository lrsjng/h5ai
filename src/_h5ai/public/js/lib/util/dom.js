const {win} = require('../globals');
const {each, filter, hasLength, is, isStr, map, isInstanceOf, toArray} = require('./lo');

const doc = win.document;

const createElement = name => doc.createElement(name);

const reReady = /^(i|c|loade)/;

const containers = [
    {re: /^<t(head|body|foot)|^<c(ap|olg)/i, el: createElement('table')},
    {re: /^<col/i, el: createElement('colgroup')},
    {re: /^<tr/i, el: createElement('tbody')},
    {re: /^<t[dh]/i, el: createElement('tr')}
];
const containerDiv = createElement('div');

const findContainer = str => {
    for (const {re, el} of containers) {
        if (re.test(str)) {
            return el;
        }
    }
    return containerDiv;
};

const parseHtml = str => {
    const container = findContainer(str);
    container.innerHTML = str;
    const res = toArray(container.childNodes);
    each(res, el => container.removeChild(el));
    container.innerHTML = '';
    return res;
};

const queryAll = (selector, context = doc) => {
    try {
        return toArray(context.querySelectorAll(selector));
    } catch (err) {/* ignore */}
    return [];
};

const isElement = x => isInstanceOf(x, win.Element);
const isDocument = x => isInstanceOf(x, win.Document);
const isWindow = x => is(x) && x.window === x && isDocument(x.document);
const isElDocWin = x => isElement(x) || isDocument(x) || isWindow(x);

const addListener = (el, type, fn) => el.addEventListener(type, fn);
const removeListener = (el, type, fn) => el.removeEventListener(type, fn);

const onReady = fn => {
    if (reReady.test(doc.readyState)) {
        fn();
    } else {
        addListener(doc, 'DOMContentLoaded', fn);
    }
};

const onLoad = fn => addListener(win, 'load', fn);

const onResize = fn => {
    addListener(win, 'resize', fn);
};

const onPrint = (before, after) => {
    win.matchMedia('print').addListener(mql => {
        if (mql.matches) {
            before();
        } else {
            after();
        }
    });
};

const dom = arg => {
    if (isInstanceOf(arg, dom)) {
        return arg;
    }

    let els;
    if (isStr(arg)) {
        arg = arg.trim();
        els = arg[0] === '<' ? parseHtml(arg) : queryAll(arg);
    } else if (isElDocWin(arg)) {
        els = [arg];
    } else {
        els = hasLength(arg) ? arg : [arg];
    }
    els = filter(els, isElDocWin);

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
        return dom([].concat(...this.map(el => queryAll(selector, el))));
    },

    on(type, fn) {
        return this.each(el => addListener(el, type, fn));
    },

    off(type, fn) {
        return this.each(el => removeListener(el, type, fn));
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
    }
};

module.exports = {
    isElement,
    isDocument,
    isWindow,
    isElDocWin,
    onReady,
    onLoad,
    onResize,
    onPrint,
    dom
};
