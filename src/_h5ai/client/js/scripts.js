
// jQuery libs
// -----------
// @include "lib/jquery-*.js"
// @include "lib/jquery.*.js"

// other libs
// ----------
// @include "lib/modernizr-*.js"
// @include "lib/underscore-*.js"
// @include "lib/amplify-*.js"
// @include "lib/modulejs-*.js"
// @include "lib/moment-*.js"
// @include "lib/json2-*.js"
// @include "lib/base64.js"
// @include "lib/spin-*.js"

// h5ai
// ----
(function ($) {
	'use strict';

	// @include "inc/**/*.js"

	var	$scriptTag = $('script[src$="scripts.js"]'),
		globalConfigHref = $scriptTag.attr('src').replace(/scripts.js$/, '../../conf/config.json'),
		localConfigHref = $scriptTag.data('config') || './_h5ai.config.json',

		parse = function (response) {

			return response.replace ? JSON.parse(response.replace(/\/\*[\s\S]*?\*\/|\/\/.*?(\n|$)/g, '')) : {};
		},

		extendLevel1 = function (a, b) {

			$.each(b, function (key) {

				$.extend(a[key], b[key]);
			});
		},

		loadConfig = function (callback) {

			var ajaxOpts = {
					dataType: 'text'
				},
				config = {
					options: {},
					types: {},
					langs: {}
				};

			$.ajax(globalConfigHref, ajaxOpts).always(function (g) {

				extendLevel1(config, parse(g));
				if (localConfigHref === 'ignore') {
					callback(config);
					return;
				}

				$.ajax(localConfigHref, ajaxOpts).always(function (l) {

					extendLevel1(config, parse(l));
					callback(config);
				});
			});
		},

		run = function (config) {
			/*global amplify, Base64, jQuery, Modernizr, moment, _ */

			// `jQuery`, `moment` and `underscore` are itself functions,
			// so they have to be wrapped to not be handled as constructors.
			modulejs.define('config', config);
			modulejs.define('amplify', amplify);
			modulejs.define('base64', Base64);
			modulejs.define('$', function () { return jQuery; });
			modulejs.define('modernizr', Modernizr);
			modulejs.define('moment', function () { return moment; });
			modulejs.define('_', function () { return _; });

			$(function () {

				modulejs.require($('body').attr('id'));
			});
		};

	loadConfig(run);

}(jQuery));
