
modulejs.define('parser/generic-json', ['_', '$', 'core/mode', 'core/settings', 'model/entry'], function (_, $, mode, settings, Entry) {

	var parseJson = function (absHref, json) {

			mode.id = json.id;
			mode.serverName = json.serverName;
			mode.serverVersion = json.serverVersion;

			if (_.has(json, 'customHeader')) {
				settings.custom.header = json.customHeader;
			}
			if (_.has(json, 'customFooter')) {
				settings.custom.footer = json.customFooter;
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

	mode.dataType = 'generic-json';

	return {
		dataType: 'generic-json',
		parse: parse
	};
});
