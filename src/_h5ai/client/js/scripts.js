
// other libs
// ----------
// @include "lib/modernizr-*.js"
// @include "lib/underscore-*.js"
// @include "lib/marked-*.js"
// @include "lib/modulejs-*.js"
// @include "lib/moment-*.js"

// jQuery libs
// -----------
// @include "lib/jquery-*.js"
// @include "lib/jquery.*.js"

// app
// ---
(function () {
	'use strict';

	/*global jQuery, markdown, Modernizr, moment, _ */
	modulejs.define('$', function () { return jQuery; });
	modulejs.define('marked', function () { return marked; });
	modulejs.define('modernizr', function () { return Modernizr; });
	modulejs.define('moment', function () { return moment; });
	modulejs.define('_', function () { return _; });

	// @include "inc/**/*.js"

	var	$ = jQuery,
		module = $('script[data-module]').data('module'),
		url;

	if ($('html').hasClass('no-browser')) {
		return;
	}

	if (module === 'main') {
		url = '.';
	} else if (module === 'info') {
		url = 'server/php/index.php';
	} else {
		return;
	}

	$.ajax({
		url: url,
		data: {action: 'get', setup: true, options: true, types: true, theme: true, langs: true},
		type: 'POST',
		dataType: 'json'
	}).done(function (config) {

		modulejs.define('config', config);
		$(function () { modulejs.require(module); });
	});

}());
