
modulejs.define('parser/generic-json', ['_', '$', 'model/entry'], function (_, $, Entry) {

	var parse = function (absHref, html) {

			var id = '#data-generic-json',
				$html = $(html),
				$id = $html.filter(id);

			if (!$id.length) {
				$id = $html.find(id);
			}

			var json = JSON.parse($.trim($id.text()) || '{}');
			return _.map(json.entries, function (jsonEntry) {

				return Entry.get(jsonEntry.absHref, jsonEntry.time, jsonEntry.size, jsonEntry.status, jsonEntry.content);
			});
		};

	return {
		dataType: 'generic-json',
		parse: parse
	};
});
