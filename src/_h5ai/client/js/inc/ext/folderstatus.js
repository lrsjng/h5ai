
modulejs.define('ext/folderstatus', ['_', '$', 'core/settings', 'core/event', 'core/entry'], function (_, $, allsettings, event, entry) {

	var settings = _.extend({
			enabled: false,
			maxChecks: 16,
			delay: 2000
		}, allsettings.folderstatus),

		init = function () {

			if (!settings.enabled) {
				return;
			}

			event.sub('ready', function () {

				var count = 0;
				_.each(entry.content, function (e) {

					if (e.isFolder() && e.status === null && count <= settings.maxChecks) {
						count += 1;
						setTimeout(function () { e.fetchStatus(); }, settings.delay);
					}
				});
			});
		};

	init();
});
