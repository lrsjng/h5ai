
module.define('parser/generic-json', [jQuery, 'core/settings', 'model/entry'], function ($, settings, Entry) {

	// expectes an hash of the form
	// {
	//   entries: [
	//     {absHref: String, time: Number, size: Number, status: Number or "h5ai"}
	//   ]
	// }

	var parseJson = function (absHref, json) {

			if (json.hasOwnProperty('customHeader')) {
				settings.custom.header = json.customHeader;
			}
			if (json.hasOwnProperty('customFooter')) {
				settings.custom.footer = json.customFooter;
			}

			return _.map(json.entries, function (jsonEntry) {

				return Entry.get(jsonEntry.absHref, jsonEntry.time, jsonEntry.size, jsonEntry.status);
			});
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
