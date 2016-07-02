const win = global.window;
const doc = win.document;

let title;
let htmlId;
let htmlClasses;
let bodyId;
let bodyClasses;
let $pinnedElements;

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
    title = doc.title;
    htmlId = attr('html', 'id');
    htmlClasses = attr('html', 'class');
    bodyId = attr('body', 'id');
    bodyClasses = attr('body', 'class');
    $pinnedElements = rootChildren();
};

const restoreHtml = () => {
    doc.title = title;
    attr('html', 'id', htmlId);
    attr('html', 'class', htmlClasses);
    attr('body', 'id', bodyId);
    attr('body', 'class', bodyClasses);
    rootChildren().forEach(el => {
        if ($pinnedElements.indexOf(el) <= 0) {
            el.remove();
        }
    });
    win.localStorage.clear();
};

module.exports = {
    pinHtml,
    restoreHtml
};
