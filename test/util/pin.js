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

const rootChildren = () => {
    return [
        ...doc.querySelector('head').childNodes,
        ...doc.querySelector('body').childNodes
    ];
};

const pinHtml = () => {
    pinned.title = doc.title;
    pinned.htmlId = attr('html', 'id');
    pinned.htmlClasses = attr('html', 'class');
    pinned.bodyId = attr('body', 'id');
    pinned.bodyClasses = attr('body', 'class');
    pinned.els = rootChildren();
    // console.log('pinned', pinned);
};

const restoreHtml = () => {
    doc.title = pinned.title;
    attr('html', 'id', pinned.htmlId);
    attr('html', 'class', pinned.htmlClasses);
    attr('body', 'id', pinned.bodyId);
    attr('body', 'class', pinned.bodyClasses);
    rootChildren().forEach(el => {
        if (pinned.els.indexOf(el) < 0) {
            el.remove();
        }
    });
    // win.localStorage.clear();
};

module.exports = {
    pinHtml,
    restoreHtml
};
