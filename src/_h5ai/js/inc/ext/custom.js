
module.define('ext/custom', [jQuery, 'core/settings'], function ($, allsettings) {

	var defaults = {
			enabled: false,
			header: '_h5ai.header.html',
			footer: '_h5ai.footer.html'
		},

		settings = _.extend({}, defaults, allsettings.custom),

		init = function () {

			if (!settings.enabled) {
				return;
			}

			if (_.isString(settings.header)) {
				$.ajax({
					url: settings.header,
					dataType: 'html',
					success: function (data) {

						$('<div id="content-header">' + data + '</div>').prependTo('#content');
					}
				});
			}

			if (_.isString(settings.footer)) {
				$.ajax({
					url: settings.footer,
					dataType: 'html',
					success: function (data) {

						$('<div id="content-footer">' + data + '</div>').appendTo('#content');
					}
				});
			}
		};

	init();
});
