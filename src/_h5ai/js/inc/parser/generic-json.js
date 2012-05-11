
module.define('parser/generic-json', [jQuery, 'core/settings', 'model/entry'], function ($, settings, Entry) {

	var parser = {
			id: 'generic-json',
			mode: null,
			server: {
				name: null,
				version: null
			}
		},

		parseJson = function (absHref, json) {

			if (json.hasOwnProperty('customHeader')) {
				settings.custom.header = json.customHeader;
			}
			if (json.hasOwnProperty('customFooter')) {
				settings.custom.footer = json.customFooter;
			}
			if (json.hasOwnProperty('mode')) {
				parser.mode = json.mode;
			}
			if (json.hasOwnProperty('server')) {
				parser.server = json.server;
			}

			return _.map(json.entries, function (jsonEntry) {

				return Entry.get(jsonEntry.absHref, jsonEntry.time, jsonEntry.size, jsonEntry.status, jsonEntry.content);
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

	parser.parse = parse;

	return parser;
});
