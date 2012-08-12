
modulejs.define('core/refresh', ['_', 'core/ajax', 'model/entry'], function (_, ajax, Entry) {

	var parseJson = function (entry, json) {

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

		refresh = function () {

			var entry = Entry.get();
			ajax.getEntries(entry.absHref, 1, function (json) {

					parseJson(entry, json);
			});
		};

	return refresh;
});
