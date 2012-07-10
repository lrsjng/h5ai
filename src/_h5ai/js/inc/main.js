
(function ($) {
	'use strict';


	// @include "core/entry.js"
	// @include "core/event.js"
	// @include "core/format.js"
	// @include "core/parser.js"
	// @include "core/resource.js"
	// @include "core/settings.js"
	// @include "core/store.js"

	// @include "model/entry.js"

	// @include "parser/apache-autoindex.js"
	// @include "parser/generic-json.js"

	// @include "view/extended.js"
	// @include "view/spacing.js"
	// @include "view/viewmode.js"

	// @include "ext/crumb.js"
	// @include "ext/custom.js"
	// @include "ext/download.js"
	// @include "ext/filter.js"
	// @include "ext/folderstatus.js"
	// @include "ext/l10n.js"
	// @include "ext/link-hover-states.js"
	// @include "ext/mode.js"
	// @include "ext/preview-img.js"
	// @include "ext/qrcode.js"
	// @include "ext/select.js"
	// @include "ext/sort.js"
	// @include "ext/statusbar.js"
	// @include "ext/thumbnails.js"
	// @include "ext/title.js"
	// @include "ext/tree.js"

	// @include "h5ai-info.js"
	// @include "h5ai-main.js"


	$(function () {

		// define it on doc ready, so the script order in the doc doesn't matter
		modulejs.define('H5AI_CONFIG', H5AI_CONFIG);
		modulejs.define('amplify', amplify);

		// `jQuery` and `moment` are itself functions, so they have to be wrapped
		// to not be taken as a constructor
		modulejs.define('jQuery', function () {

			return jQuery;
		});
		modulejs.define('moment', function () {

			return moment;
		});

		modulejs.require($('body').attr('id'));
	});

}(jQuery));
