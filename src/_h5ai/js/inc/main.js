
(function ($) {
'use strict';
/*jslint browser: true, confusion: true, regexp: true, vars: true, white: true */
/*global Modernizr, jQuery, amplify, H5AI_CONFIG */

	var H5AI = {};

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

	$(function () {

		var isPhp = $('html.h5ai-php').length > 0;

		if (!isPhp) {
			H5AI.extended.init();
		}

		H5AI.core.init();
		H5AI.sort.init();
		H5AI.finder.init();
		H5AI.zippedDownload.init();
		H5AI.context.init();

		if (isPhp) {
			$('#tree').scrollpanel();
			H5AI.core.shiftTree(false, true);
		}

	});

}(jQuery));
