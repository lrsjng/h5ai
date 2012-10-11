
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
// @include "lib/spin-*.js"

// app
// ---
(function ($) {
	'use strict';

	// @include "inc/**/*.js"

	var	filename = 'client/js/scripts.js',
		$scriptTag = $('script[src$="' + filename + '"]'),
		src = $scriptTag.attr('src'),
		mode = $scriptTag.data('mode'),

		appHref = src.substr(0, src.length - filename.length),

		run = function (config) {
			/*global amplify, Base64, jQuery, Modernizr, moment, _ */

			// `jQuery`, `moment` and `underscore` are itself functions,
			// so they have to be wrapped to not be handled as constructors.
			modulejs.define('config', config);
			modulejs.define('amplify', amplify);
			modulejs.define('$', function () { return jQuery; });
			modulejs.define('modernizr', Modernizr);
			modulejs.define('moment', function () { return moment; });
			modulejs.define('_', function () { return _; });

			$(function () { modulejs.require('main'); });
		};


	if (mode === 'info') {

		modulejs.define('$', function () { return jQuery; });
		$(function () { modulejs.require('info'); });

	} else if (mode === 'php') {

		$.getJSON('.', {
			action: 'get',
			options: true,
			types: true,
			langs: true,
			server: true
		}, run);

	} else if (mode === 'aai') {

		var loadJson = function (href) {

				var deferred = $.Deferred();

				$.ajax(href, {dataType: 'text'}).always(function (content) {

					var json = content.replace ? JSON.parse(content.replace(/\/\*[\s\S]*?\*\/|\/\/.*?(\n|$)/g, '')) : {};
					deferred.resolve(json);
				});

				return deferred;
			};

		$.when(
			loadJson(appHref + 'conf/options.json'),
			loadJson(appHref + 'conf/types.json'),
			loadJson(appHref + 'conf/langs.json')
		).done(function (options, types, langs) {

			run({
				options: options,
				types: types,
				langs: langs,
				server: {
					backend: mode,
					api: false,
					name: 'apache',
					version: null
				}
			});
		});
	}

}(jQuery));
