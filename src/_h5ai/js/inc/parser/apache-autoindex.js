
modulejs.define('parser/apache-autoindex', ['_', '$', 'core/settings', 'core/format', 'model/entry'], function (_, $, settings, format, Entry) {

	var parseTableRow = function (absHref, tr) {

			var $tds = $(tr).find('td'),
				$a = $tds.eq(1).find('a'),
				label = $a.text(),
				time = format.parseDate($tds.eq(2).text(), 'DD-MMM-YYYY HH:mm'),
				size = format.parseSize($tds.eq(3).text());

			absHref = absHref + $a.attr('href');

			return label === 'Parent Directory' ? null : Entry.get(absHref, time, size);
		},

		parseTable = function (absHref, table) {

			return _.compact(_.map($(table).find('td').closest('tr'), function (tr) {

				return parseTableRow(absHref, tr);
			}));
		},

		parse = function (absHref, html) {

			var id = '#data-apache-autoindex',
				$html = $(html),
				$id = $html.filter(id);

			if (!$id.length) {
				$id = $html.find(id);
			}

			return parseTable(absHref, $id.find('table'));
		};

	return {
		id: 'apache-autoindex',
		mode: 'aai',
		server: {
			name: 'apache',
			version: null
		},
		parse: parse
	};
});
