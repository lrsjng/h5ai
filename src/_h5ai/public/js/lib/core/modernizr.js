modulejs.define('core/modernizr', function () {
    var hasCanvas = (function () {
        var elem = document.createElement('canvas');
        return Boolean(elem.getContext && elem.getContext('2d'));
    }());

    var hasHistory = Boolean(window.history && history.pushState);

    var hasLocalStorage = (function () {
        var key = '#test#';
        try {
            localStorage.setItem(key, key);
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    }());

    return {
        canvas: hasCanvas,
        history: hasHistory,
        localstorage: hasLocalStorage
    };
});
