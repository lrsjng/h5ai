(function () {
    'use strict';

    document.documentElement.className = '';
    var el = document.createElement('i');
    el.innerHTML = '<!--[if lt IE 10]><br><![endif]-->';
    var browser = el.getElementsByTagName('br').length === 0;

    if (!browser) {
        document.documentElement.className = 'no-browser';
        throw 'no-browser';
    }
}());

// @include 'lib/jquery-*.js'
// @include 'lib/jquery.*.js'
// @include 'lib/lodash-*.js'
// @include 'lib/marked-*.js'
// @include 'lib/modulejs-*.js'
// @include 'lib/prism-*.js'

(function () {
    'use strict';

    var win = window;
    modulejs.define('_', function () { return win._; });
    modulejs.define('$', function () { return win.jQuery; });
    modulejs.define('marked', function () { return win.marked; });
    modulejs.define('prism', function () { return win.Prism; });

    // @include 'inc/**/*.js'

    modulejs.require('boot');
}());
