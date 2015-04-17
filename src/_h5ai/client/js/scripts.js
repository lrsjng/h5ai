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

    var $ = win.jQuery;

    if ($('html').hasClass('no-browser')) {
        return;
    }

    var module = $('script[data-module]').data('module');
    var data = {action: 'get', setup: true, options: true, types: true, theme: true, langs: true};
    var url;

    if (module === 'main') {
        url = '.';
    } else if (module === 'info') {
        data.updatecmds = true;
        url = 'server/php/index.php';
    } else {
        return;
    }

    $.ajax({
        url: url,
        data: data,
        type: 'POST',
        dataType: 'json'
    }).done(function (config) {

        modulejs.define('config', config);
        $(function () { modulejs.require(module); });
    });
}());
