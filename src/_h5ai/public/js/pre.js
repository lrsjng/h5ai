/* eslint-disable func-names,no-var */
(function (win) {
    if (!win || win.window !== win || !win.document) {
        throw new Error('no-window');
    }

    var no_browser = 'no-browser';
    var doc_el = win.document.documentElement;
    doc_el.className = '';

    function assert(msg, expr) {
        if (!expr) {
            doc_el.className = no_browser;
            throw new Error(no_browser + ': ' + msg);
        }
    }

    function is_fn(x) {
        return typeof x === 'function';
    }

    assert('console', win.console && is_fn(win.console.log));
    assert('assign', win.Object && is_fn(win.Object.assign));
    assert('promise', is_fn(win.Promise));
    // assert('xhr', is_fn(win.XMLHttpRequest)); // is object in safari
    assert('xhr', win.XMLHttpRequest);
}(this));
/* eslint-enable */
