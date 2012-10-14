
modulejs.define('core/entry', ['_', '$', 'core/format', 'model/entry'], function (_, $, format, Entry) {

	var parseGenericJson = function (absHref, $container) {

			return JSON.parse($.trim($container.text()) || '{}').entries;
		},

		parseApacheTable = function (absHref, $table) {

			return _.compact(_.map($table.find('td').closest('tr'), function (tr) {

				var $tds = $(tr).find('td'),
					$a = $tds.eq(1).find('a');

				return $a.text() === 'Parent Directory' ? null : {
					absHref: absHref + $a.attr('href'),
					time: format.parseDate($tds.eq(2).text(), ['YYYY-MM-DD HH:mm', 'DD-MMM-YYYY HH:mm']),
					size: format.parseSize($tds.eq(3).text())
				};
			}));
		},

		parse = function (absHref, $html) {

			var $generic = $html.find('#data-generic-json'),
				$apache = $html.find('#data-apache-autoindex table'),
				json = [];

			if ($generic.length) {
				json = parseGenericJson(absHref, $generic);
			} else if ($apache.length) {
				json = parseApacheTable(absHref, $apache);
			}

			return _.map(json, function (entry) {

				return Entry.get(entry.absHref, entry.time, entry.size, entry.status, entry.content);
			});
		},

		entry = Entry.get();

	parse(entry.absHref, $('body'));
	entry.status = '=h5ai=';

	return entry;
});
