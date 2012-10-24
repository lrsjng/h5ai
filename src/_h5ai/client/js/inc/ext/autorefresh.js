
modulejs.define('ext/autorefresh', ['_', '$', 'core/settings', 'core/event', 'core/location'], function (_, $, allsettings, event, location) {

	var settings = _.extend({
			enabled: false,
			interval: 5000
		}, allsettings.autorefresh),

		heartbeat = function () {

			location.refresh();
			setTimeout(heartbeat, settings.interval);
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			settings.interval = Math.max(1000, settings.interval);

			event.sub('ready', function () {

				setTimeout(heartbeat, settings.interval);
			});
		};

	init();
});
