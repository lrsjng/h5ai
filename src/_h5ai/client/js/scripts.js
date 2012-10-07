
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
		main = $scriptTag.data('main'),
		backend = $scriptTag.data('backend'),

		appHref = src.substr(0, src.length - filename.length),

		loadCommentedJson = function (href, callback) {

			$.ajax(href, {dataType: 'text'}).always(function (response) {

				var json = response.replace ? JSON.parse(response.replace(/\/\*[\s\S]*?\*\/|\/\/.*?(\n|$)/g, '')) : {};
				callback(json);
			});
		},

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

			$(function () { modulejs.require(main); });
		};


	if (backend === 'php') {

		$.getJSON(appHref + 'server/php/api.php', {
			action: 'get',
			options: true,
			types: true,
			langs: true,
			server: true
		}, run);

	} else if (backend === 'aai') {

		loadCommentedJson(appHref + 'conf/options.json', function (options) {
			loadCommentedJson(appHref + 'conf/types.json', function (types) {
				loadCommentedJson(appHref + 'conf/langs.json', function (langs) {

					run({
						options: options,
						types: types,
						langs: langs,
						server: {
							backend: backend,
							apiHref: null,
							name: 'apache',
							version: null
						}
					});
				});
			});
		});
	}

}(jQuery));
