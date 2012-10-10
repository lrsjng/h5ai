
modulejs.define('core/server', ['$', '_', 'config'], function ($, _, config) {

	var server = _.extend({}, config.server, {

		request: function (data, callback) {

			if (server.api) {
				$.ajax({
					url: '.',
					data: data,
					type: 'POST',
					dataType: 'json',
					success: function (json) {

						callback(json);
					},
					error: function () {

						callback();
					}
				});
			} else if (server.backend === 'aai') {
				return modulejs.require('core/server-request-mock-aai')(data, callback);
			} else {
				callback();
			}
		}
	});

	return server;
});



modulejs.define('core/server-request-mock-aai', ['$', '_', 'core/settings', 'core/format'], function ($, _, allsettings, format) {

	var loadText = function (href) {

			var deferred = $.Deferred();

			$.ajax(href, {dataType: 'text'}).always(function (content) {

				content = content.replace ? content : null;
				deferred.resolve(content);
			});

			return deferred;
		},

		loadJson = function (href) {

			var deferred = $.Deferred();

			loadText(href).always(function (content) {

				var json = content.replace ? JSON.parse(content.replace(/\/\*[\s\S]*?\*\/|\/\/.*?(\n|$)/g, '')) : {};
				deferred.resolve(json);
			});

			return deferred;
		},

		parse = function (absHref, html) {

			var id = '#data-apache-autoindex',
				$html = $(html),
				$id = $html.filter(id);

			if (!$id.length) {
				$id = $html.find(id);
			}

			return _.compact(_.map($id.find('table').find('td').closest('tr'), function (tr) {

				var $tds = $(tr).find('td'),
					$a = $tds.eq(1).find('a');

				return $a.text() === 'Parent Directory' ? null : {
					absHref: absHref + $a.attr('href'),
					time: format.parseDate($tds.eq(2).text(), ['YYYY-MM-DD HH:mm', 'DD-MMM-YYYY HH:mm']),
					size: format.parseSize($tds.eq(3).text())
				};
			}));
		};

	return function (data, callback) {

		if (data.action === 'get' && data.l10n === true) {

			var isoCodes = data.l10nCodes.split(':');
			var isoCode = data.l10nCodes.split(':')[0];
			loadJson(allsettings.h5aiAbsHref + 'conf/l10n/' + isoCode + '.json').done(function (json) {

				var result = {code: 0, l10n: {}};

				if (json) {
					result.l10n[isoCode] = json;
				}
				callback(result);
			});

		} else if (data.action === 'get' && data.custom === true) {

			$.when(
				loadText('_h5ai.header.html'),
				loadText('_h5ai.footer.html')
			).done(function (header, footer) {

				callback({
					code: 0,
					custom: {
						header: header,
						footer: footer
					}
				});
			});

		} else if (data.action === 'get' && data.entries === true) {

			var absHref = data.entriesHref,
				what = data.entriesWhat,
				magicSequence = '=h5ai=',
				reContentType = /^text\/html;h5ai=/;

			$.ajax({
				url: absHref,
				type: what === 0 ? 'HEAD' : 'GET',
				complete: function (xhr) {

					var entries = [],
						status = xhr.status;

					if (status === 200 && reContentType.test(xhr.getResponseHeader('Content-Type'))) {
						status = magicSequence;
					}

					if (status === magicSequence && what > 0) {
						entries = parse(absHref, xhr.responseText);
					}
					entries.push({absHref: absHref, status: status, content: what > 0});

					callback({
						code: 0,
						entries: entries
					});
				}
			});

		} else {

			callback();
		}
	};
});
