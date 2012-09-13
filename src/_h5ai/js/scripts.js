
// jQuery libs
// -----------
// @include "lib/jquery-*.js"
// @include "lib/jquery.*.js"

// other libs
// ----------
// @include "lib/underscore-*.js"
// @include "lib/amplify-*.min.js"
// @include "lib/modulejs-*.js"
// @include "lib/moment-*.js"
// @include "lib/json2-*.js"
// @include "lib/base64.js"
// @include "lib/spin-*.min.js"

// h5ai
// ----
(function ($) {
	'use strict';

	// @include "inc/**/*.js"

	$(function () {
		/*global H5AI_CONFIG, amplify, Base64, jQuery, Modernizr, moment, _ */

		// `jQuery`, `moment` and `underscore` are itself functions,
		// so they have to be wrapped to not be handled as constructors.
		modulejs.define('config', H5AI_CONFIG);
		modulejs.define('amplify', amplify);
		modulejs.define('base64', Base64);
		modulejs.define('$', function () { return jQuery; });
		modulejs.define('modernizr', Modernizr);
		modulejs.define('moment', function () { return moment; });
		modulejs.define('_', function () { return _; });

		modulejs.require($('body').attr('id'));
	});

}(jQuery));
