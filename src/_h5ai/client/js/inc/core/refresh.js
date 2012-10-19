
modulejs.define('core/refresh', ['_', 'core/server', 'model/entry', 'core/location'], function (_, server, Entry, location) {

	var parseJson = function (entry, json) {

			var found = {};

			_.each(json.entries, function (jsonEntry) {

				var e = Entry.get(jsonEntry.absHref, jsonEntry.time, jsonEntry.size, jsonEntry.status, jsonEntry.content);
				found[e.absHref] = true;
			});

			_.each(entry.content, function (e) {
				if (!found[e.absHref]) {
					Entry.remove(e.absHref);
				}
			});
		},

		refresh = function (callback) {

			var entry = Entry.get(location.getAbsHref());

			server.request({action: 'get', entries: true, entriesHref: entry.absHref, entriesWhat: 1}, function (json) {

				if (json) {
					parseJson(entry, json);
				}
				if (_.isFunction(callback)) {
					callback(entry);
				}
			});
		};

	return refresh;
});
