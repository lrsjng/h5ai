
Module.define('h5ai', [jQuery, 'core', 'extended', 'localize', 'sort', 'finder', 'zip', 'context', 'splash'], function ($, core, extended, localize, sort, finder, zip, context, splash) {

	var h5ai = {};

	h5ai.init = function () {

		var $html = $('html');

		h5ai.isJs = $html.hasClass('h5ai-js');
		h5ai.isPhp = $html.hasClass('h5ai-php');
		h5ai.isSplash = $html.hasClass('h5ai-splash');

		if (h5ai.isJs || h5ai.isPhp) {
			if (h5ai.isJs) {
				extended.init();
			}

			core.init();
			localize.init();
			sort.init();
			finder.init();
			zip.init();
			context.init();

			if (h5ai.isPhp) {
				$('#tree').scrollpanel();
				core.shiftTree(false, true);
			}
		}

		if (h5ai.isSplash) {
			splash.init();
		}
	};

	return h5ai;
});
