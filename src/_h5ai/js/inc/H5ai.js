
(function ($, config) {
'use strict';
/*jslint browser: true, confusion: true, regexp: true, vars: true, white: true */
/*global Modernizr, jQuery, amplify, Base64, H5AI_CONFIG */

	var defaults = {
			store: {
				viewmode: 'h5ai.pref.viewmode',
				lang: 'h5ai.pref.lang'
			},
			callbacks: {
				pathClick: []
			},

			rootAbsHref: '/',
			h5aiAbsHref: '/_h5ai/',
			customHeader: null,
			customFooter: null,
			viewmodes: ['details', 'icons'],
			sortorder: 'na',
			showTree: true,
			slideTree: true,
			folderStatus: {},
			lang: 'en',
			useBrowserLang: true,
			setParentFolderLabels: true,
			linkHoverStates: true,
			dateFormat: 'yyyy-MM-dd HH:mm',
			showThumbs: false,
			thumbTypes: ['bmp', 'gif', 'ico', 'image', 'jpg', 'png', 'tiff'],
			zippedDownload: false,
			qrCodesSize: null,
			showFilter: false
		},
		h5ai = function () {

		};

	h5ai.config = config;
	h5ai.settings = $.extend({}, defaults, config.options);

	h5ai.init = function () {

		var $html = $('html');

		h5ai.isJs = $html.hasClass('h5ai-js');
		h5ai.isPhp = $html.hasClass('h5ai-php');

		if (h5ai.isJs) {
			h5ai.extended.init();
		}

		h5ai.core.init();
		h5ai.localize.init();
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
	// @include "Localize.js"
	// @include "Sort.js"
	// @include "ZippedDownload.js"
	// @include "Finder.js"
	// @include "Context.js"

	// @include "Path.js"
	// @include "Connector.js"
	// @include "Html.js"
	// @include "Extended.js"

	$(h5ai.init);

}(jQuery, H5AI_CONFIG));
