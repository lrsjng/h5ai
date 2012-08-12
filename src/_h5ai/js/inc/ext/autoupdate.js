
modulejs.define('ext/autoupdate', ['_', '$', 'core/settings', 'core/event', 'core/refresh'], function (_, $, allsettings, event, refresh) {

	var defaults = {
			enabled: false,
			interval: 5000
		},

		settings = _.extend({}, defaults, allsettings.autoupdate),

		heartbeat = function () {

			refresh();
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
