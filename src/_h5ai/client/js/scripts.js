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
    modulejs.define('$', function () { return win.jQuery; });
    modulejs.define('_', function () { return win._; });
    modulejs.define('marked', function () { return win.marked; });
    modulejs.define('modernizr', function () { return win.Modernizr; });
    modulejs.define('prism', function () { return win.Prism; });

    // @include "inc/**/*.js"

    modulejs.require('boot');
}());
