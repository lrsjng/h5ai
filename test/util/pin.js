const win = global.window;
const doc = win.document;

const pinned = {};

const attr = (el, name, value) => {
    if (typeof el === 'string') {
        el = doc.querySelector(el);
    }
    if (value === undefined) {
        return el.getAttribute(name);
    }
    if (value === null) {
        return el.removeAttribute(name);
    }
    return el.setAttribute(name, value);
};

const root_children = () => {
    return [
        ...doc.querySelector('head').childNodes,
        ...doc.querySelector('body').childNodes
    ];
};

const pin_html = () => {
    pinned.title = doc.title;
    pinned.htmlId = attr('html', 'id');
    pinned.htmlClasses = attr('html', 'class');
    pinned.bodyId = attr('body', 'id');
    pinned.bodyClasses = attr('body', 'class');
    pinned.els = root_children();
    // console.log('pinned', pinned);
};

const restore_html = () => {
    doc.title = pinned.title;
    attr('html', 'id', pinned.htmlId);
    attr('html', 'class', pinned.htmlClasses);
    attr('body', 'id', pinned.bodyId);
    attr('body', 'class', pinned.bodyClasses);
    root_children().forEach(el => {
        if (pinned.els.indexOf(el) < 0) {
            el.remove();
        }
    });
    // win.localStorage.clear();
};

module.exports = {
    pin_html,
    restore_html
};
