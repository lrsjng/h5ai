(function () {

if (function () {
    var el = document.createElement('i');
    el.innerHTML = '<!--[if lt IE 10]><br><![endif]-->';
    return el.getElementsByTagName('br').length;
}()) {
    document.documentElement.className = 'js no-browser';
    return;
}

// @include "lib/modernizr-*.js"
// @include "lib/jquery-*.js"
// @include "lib/jquery.*.js"
// @include "lib/lodash-*.js"
// @include "lib/marked-*.js"
// @include "lib/modulejs-*.js"
// @include "lib/prism-*.js"

(function () {
    'use strict';

    var win = window;
    modulejs.define('_', function () { return win._; });
    modulejs.define('$', function () { return win.jQuery; });
    modulejs.define('marked', function () { return win.marked; });
    modulejs.define('modernizr', function () { return win.Modernizr; });
    modulejs.define('prism', function () { return win.Prism; });

    // @include "inc/**/*.js"

    modulejs.require('boot');
}());

}());
