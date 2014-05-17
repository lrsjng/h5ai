
// other libs
// ----------
// @include "lib/modernizr-*.js"
// @include "lib/underscore-*.js"
// @include "lib/modulejs-*.js"
// @include "lib/moment-*.js"
// @include "lib/json2-*.js"
// @include "lib/spin-*.js"

// jQuery libs
// -----------
// @include "lib/jquery-*.js"
// @include "lib/jquery.filedrop-*.js"
// @include "lib/jquery.fracs-*.js"
// @include "lib/jquery.mousewheel-*.js"
// @include "lib/jquery.scrollpanel-*.js"
// @include "lib/jquery.spin-*.js"

// app
// ---
(function () {
	'use strict';

	/*global jQuery, Modernizr, moment, _ */
	modulejs.define('$', function () { return jQuery; });
	modulejs.define('modernizr', function () { return Modernizr; });
	modulejs.define('moment', function () { return moment; });
	modulejs.define('_', function () { return _; });

	// @include "inc/**/*.js"

	var	$ = jQuery,
		mode = $('script[src$="scripts.js"]').data('mode'),
		url = '.',
		module = 'main';

	if ($('html').hasClass('no-browser')) {
		return;
	}

	if (mode === 'info') {
		url = 'server/php/index.php';
		module = 'info';
	}

	$.ajax({
		url: url,
		data: {action: 'get', setup: true, options: true, types: true, langs: true},
		type: 'POST',
		dataType: 'json',
		success: function (config) {

			modulejs.define('config', config);
			$(function () { modulejs.require(module); });
		}
	});

}());
