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

	// @include "inc/Path.js"
	// @include "inc/Connector.js"
	// @include "inc/Html.js"
	// @include "inc/Extended.js"

	$(function () {

		H5AI.extended.init();

		H5AI.core.init();
		H5AI.sort.init();
		H5AI.zippedDownload.init();
	});

}(jQuery));
