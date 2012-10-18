
modulejs.define('ext/custom', ['_', '$', 'core/settings', 'core/server', 'core/event'], function (_, $, allsettings, server, event) {

	var settings = _.extend({
			enabled: false,
			header: '_h5ai.header.html',
			footer: '_h5ai.footer.html'
		}, allsettings.custom),

		onLocationChanged = function () {

			$('#content-header, #content-footer').stop(true, true).slideUp(200);

			server.request({action: 'get', custom: true}, function (response) {

				if (response) {
					if (response.custom.header) {
						$('#content-header').html(response.custom.header).stop(true, true).slideDown(400);
					}
					if (response.custom.footer) {
						$('#content-footer').html(response.custom.footer).stop(true, true).slideDown(400);
					}
				}
			});
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			$('<div id="content-header"/>').hide().prependTo('#content');
			$('<div id="content-footer"/>').hide().appendTo('#content');

			event.sub('location.changed', onLocationChanged);

			onLocationChanged();
		};

	init();
});
