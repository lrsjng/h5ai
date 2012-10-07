
modulejs.define('ext/custom', ['_', '$', 'core/settings'], function (_, $, allsettings) {

	var settings = _.extend({
			enabled: false,
			header: '_h5ai.header.html',
			footer: '_h5ai.footer.html'
		}, allsettings.custom),

		getHtml = function (url, callback) {

			$.ajax({
				url: url,
				type: 'POST',
				dataType: 'html',
				success: function (html) {

					callback(html);
				},
				error: function () {

					callback();
				}
			});
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			if (_.isString(settings.header)) {
				getHtml(settings.header, function (html) {

					if (html) {
						$('<div id="content-header">' + html + '</div>').prependTo('#content');
					}
				});
			}

			if (_.isString(settings.footer)) {
				getHtml(settings.footer, function (html) {

					if (html) {
						$('<div id="content-footer">' + html + '</div>').appendTo('#content');
					}
				});
			}
		};

	init();
});
