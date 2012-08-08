
modulejs.define('ext/autoupdate', ['_', '$', 'core/settings', 'core/event', 'core/resource', 'model/entry'], function (_, $, allsettings, event, resource, Entry) {

	var defaults = {
			enabled: false,
			interval: 5000
		},

		settings = _.extend({}, defaults, allsettings.autoupdate),

		parseJson = function (entry, json) {

			var found = {};

			_.each(json.entries, function (jsonEntry) {

				found[jsonEntry.absHref] = true;
				Entry.get(jsonEntry.absHref, jsonEntry.time, jsonEntry.size, jsonEntry.status, jsonEntry.content);
			});

			_.each(entry.content, function (e) {
				if (!found[e.absHref]) {
					Entry.remove(e.absHref);
				}
			});
		},

		heartbeat = function () {

			var entry = Entry.get();

			$.ajax({
				url: resource.api(),
				data: {
					action: 'getentries',
					href: entry.absHref,
					content: 1
				},
				dataType: 'json',
				success: function (json) {

					parseJson(entry, json);
				}
			});

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
