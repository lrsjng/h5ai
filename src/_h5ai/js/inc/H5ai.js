
(function ($) {
'use strict';
/*jslint browser: true, confusion: true, regexp: true, vars: true, white: true */
/*global Modernizr, jQuery, amplify, Base64, H5AI_CONFIG */

	var h5ai = function () {

		},
		init = function () {

			var $html = $('html');

			h5ai.isJs = $html.hasClass('h5ai-js');
			h5ai.isPhp = $html.hasClass('h5ai-php');

			if (h5ai.isJs) {
				h5ai.extended.init();
			}

			h5ai.core.init();
			h5ai.sort.init();
			h5ai.finder.init();
			h5ai.zippedDownload.init();
			h5ai.context.init();

			if (h5ai.isPhp) {
				$('#tree').scrollpanel();
				h5ai.core.shiftTree(false, true);
			}

			// publish for testing
			window.h5ai = h5ai;
		};

	// @include "Util.js"
	// @include "Core.js"
	// @include "Sort.js"
	// @include "ZippedDownload.js"
	// @include "Finder.js"
	// @include "Context.js"

	// @include "Path.js"
	// @include "Connector.js"
	// @include "Html.js"
	// @include "Extended.js"

	$(init);

}(jQuery));
