
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
(function () {
	'use strict';

	/*global amplify, jQuery, Modernizr, moment, _ */
	// `jQuery`, `moment` and `underscore` are itself functions,
	// so they have to be wrapped to not be handled as constructors.
	modulejs.define('amplify', amplify);
	modulejs.define('$', function () { return jQuery; });
	modulejs.define('modernizr', Modernizr);
	modulejs.define('moment', function () { return moment; });
	modulejs.define('_', function () { return _; });

	// @include "inc/**/*.js"

	var	$ = jQuery,
		filename = 'client/js/scripts.js',
		$script = $('script[src$="' + filename + '"]'),
		mode = $script.data('mode');

	if (mode === 'info') {

		$(function () { modulejs.require('info'); });

	} else if (mode === 'php') {

		$.getJSON('.', {action: 'get', options: true, types: true, langs: true, server: true}, function (config) {

			modulejs.define('config', config);
			$(function () { modulejs.require('main'); });
		});

	} else if (mode === 'aai') {

		var src = $script.attr('src'),
			appHref = src.substr(0, src.length - filename.length),
			loadJson = function (href) {

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

			var config = {
					options: options,
					types: types,
					langs: langs,
					server: {
						backend: mode,
						api: false,
						name: 'apache',
						version: null
					}
				};

			modulejs.define('config', config);
			$(function () { modulejs.require('main'); });
		});
	}

}());
