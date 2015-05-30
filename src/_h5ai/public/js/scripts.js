(function () {
    var doc = document;
    var el = doc.documentElement;
    var id = 'no-browser';
    el.className = '';
    if (doc.getElementById(id)) {
        el.className = id;
        throw id;
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
