
modulejs.define('ext/custom', ['_', '$', 'core/settings', 'core/ajax'], function (_, $, allsettings, ajax) {

	var settings = _.extend({
			enabled: false,
			header: '_h5ai.header.html',
			footer: '_h5ai.footer.html'
		}, allsettings.custom),

		init = function () {

			if (!settings.enabled) {
				return;
			}

			if (_.isString(settings.header)) {
				ajax.getHtml(settings.header, function (html) {

					if (html) {
						$('<div id="content-header">' + html + '</div>').prependTo('#content');
					}
				});
			}

			if (_.isString(settings.footer)) {
				ajax.getHtml(settings.footer, function (html) {

					if (html) {
						$('<div id="content-footer">' + html + '</div>').appendTo('#content');
					}
				});
			}
		};

	init();
});
