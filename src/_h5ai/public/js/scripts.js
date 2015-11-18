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

// @include 'vendor/jquery-*.js'
// @include 'vendor/jquery.*.js'
// @include 'vendor/lodash-*.js'
// @include 'vendor/marked-*.js'
// @include 'vendor/modulejs-*.js'
// @include 'vendor/prism-*.js'

(function () {
    'use strict'; // eslint-disable-line strict

    var win = window;
    modulejs.define('_', function () { return win._; });
    modulejs.define('$', function () { return win.jQuery; });
    modulejs.define('marked', function () { return win.marked; });
    modulejs.define('prism', function () { return win.Prism; });

    // @include 'lib/**/*.js'

    modulejs.require('boot');
}());
