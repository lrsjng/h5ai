
module.define('parser/generic-json', [jQuery, 'core/settings', 'model/entry'], function ($, settings, Entry) {

	// expectes an hash of the form
	// {
	//   entries: [
	//     {absHref: String, time: Number, size: Number, status: Number or "h5ai"}
	//   ]
	// }

	var parseJson = function (absHref, json) {

			_.each(json.entries, function (jsonEntry) {

				Entry.get(jsonEntry.absHref, jsonEntry.time, jsonEntry.size, jsonEntry.status);
			});

			if (json.hasOwnProperty('customHeader')) {
				settings.custom.header = json.customHeader;
			}
			if (json.hasOwnProperty('customFooter')) {
				settings.custom.footer = json.customFooter;
			}
		},

		parseJsonStr = function (absHref, jsonStr) {

			return parseJson(absHref, JSON.parse($.trim(jsonStr) || '{}'));
		},

		parse = function (absHref, html) {

			var id = '#data-generic-json',
				$html = $(html),
				$id = $html.filter(id);

			if (!$id.length) {
				$id = $html.find(id);
			}

			return parseJsonStr(absHref, $id.text());
		};

	return {
		id: 'generic-json',
		parse: parse
	};
});
