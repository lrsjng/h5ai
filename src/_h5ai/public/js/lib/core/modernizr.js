const win = require('../win');

const hasCanvas = (() => {
    const elem = win.document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
})();

const hasHistory = !!(win.history && win.history.pushState);

const hasLocalStorage = (() => {
    const key = '#test#';
    try {
        win.localStorage.setItem(key, key);
        win.localStorage.removeItem(key);
        return true;
    } catch (e) {
        return false;
    }
})();

module.exports = {
    canvas: hasCanvas,
    history: hasHistory,
    localstorage: hasLocalStorage
};
