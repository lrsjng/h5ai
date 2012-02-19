/*jslint browser: true, confusion: true, regexp: true, white: true */
/*jshint browser: true, confusion: true, regexp: false, white: false */
/*global jQuery, amplify, H5AI_CONFIG */

(function ($) {
	"use strict";

	var H5AI = {};

	// @include "inc/Util.js"
	// @include "inc/Core.js"
	// @include "inc/Sort.js"
	// @include "inc/ZippedDownload.js"
	// @include "inc/Finder.js"
	// @include "inc/Context.js"

	// @include "inc/Path.js"
	// @include "inc/Connector.js"
	// @include "inc/Html.js"
	// @include "inc/Extended.js"

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
			$("#tree").scrollpanel();
			H5AI.core.shiftTree(false, true);
		}

	});

}(jQuery));
