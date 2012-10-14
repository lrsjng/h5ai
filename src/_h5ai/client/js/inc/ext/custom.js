
modulejs.define('ext/custom', ['_', '$', 'core/settings', 'core/server'], function (_, $, allsettings, server) {

	var settings = _.extend({
			enabled: false,
			header: '_h5ai.header.html',
			footer: '_h5ai.footer.html'
		}, allsettings.custom),

		init = function () {

			if (!settings.enabled) {
				return;
			}

			server.request({action: 'get', custom: true}, function (response) {

				if (response) {
					if (response.custom.header) {
						$('<div id="content-header">' + response.custom.header + '</div>').prependTo('#content');
					}
					if (response.custom.footer) {
						$('<div id="content-footer">' + response.custom.footer + '</div>').appendTo('#content');
					}
				}
			});
		};

	init();
});
