/* eslint-disable func-names,no-var */
(function (win) {
    if (!win || win.window !== win || !win.document) {
        throw new Error('no-window');
    }

    var noBrowser = 'no-browser';
    var docEl = win.document.documentElement;
    docEl.className = '';

    function assert(msg, expr) {
        if (!expr) {
            docEl.className = noBrowser;
            throw new Error(noBrowser + ': ' + msg);
        }
    }

    function isFn(x) {
        return typeof x === 'function';
    }

    assert('console', win.console && isFn(win.console.log));
    assert('assign', win.Object && isFn(win.Object.assign));
    assert('promise', isFn(win.Promise));
    assert('xhr', isFn(win.XMLHttpRequest));
}(this));
/* eslint-enable */


// @include "vendor/*.js"
