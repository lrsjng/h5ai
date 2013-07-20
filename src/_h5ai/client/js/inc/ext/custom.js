
modulejs.define('ext/custom', ['_', '$', 'core/settings', 'core/server', 'core/event'], function (_, $, allsettings, server, event) {

	var settings = _.extend({
			enabled: false
		}, allsettings.custom),

		onLocationChanged = function () {

			server.request({action: 'get', custom: true}, function (response) {

				var h, f;
				if (response) {
					if (response.custom.header) {
						$('#content-header').html(response.custom.header).stop().slideDown(200);
						h = true;
					}
					if (response.custom.footer) {
						$('#content-footer').html(response.custom.footer).stop().slideDown(200);
						f = true;
					}
				}
				if (!h) {
					$('#content-header').stop().slideUp(200);
				}
				if (!f) {
					$('#content-footer').stop().slideUp(200);
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
		};

	init();
});
