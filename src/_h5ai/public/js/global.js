(function check(win) {
    /* eslint-disable func-names,no-console,no-var */

    if (typeof win !== 'object' || win.window !== win || !win.document) {
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
        win.console.log('checked: ' + msg);
    }

    assert('console', win.console && typeof win.console.log === 'function');
    assert('assign', win.Object && typeof win.Object.assign === 'function');
    assert('promise', win.Promise && typeof win.Promise === 'function');
    assert('history', win.history && typeof win.history.pushState === 'function');

    assert('canvas', (function () {
        var elem = win.document.createElement('canvas');
        return elem.getContext && elem.getContext('2d');
    }()));

    assert('storage', (function () {
        var key = '#test#';
        try {
            win.localStorage.setItem(key, key);
            win.localStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    }()));

    /* eslint-enable no-var */
}(this));


// @include "vendor/*.js"
