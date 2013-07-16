
modulejs.define('ext/download', ['_', '$', 'core/settings', 'core/resource', 'core/event', 'core/server', 'core/location'], function (_, $, allsettings, resource, event, server, location) {

	var settings = _.extend({
			enabled: false,
			execution: 'php',
			format: 'zip',
			packageName: 'package'
		}, allsettings.download),

		// formats = ['tar', 'zip'],

		downloadBtnTemplate = '<li id="download">' +
									'<a href="#">' +
										'<img src="' + resource.image('download') + '" alt="download"/>' +
										'<span class="l10n-download"/>' +
									'</a>' +
								'</li>',

		selectedHrefsStr = '',
		$download, $img,

		failed = function () {

			$download.addClass('failed');
			setTimeout(function () {
				$download.removeClass('failed');
			}, 1000);
		},

		handleResponse = function (json) {

			$download.removeClass('current');
			$img.attr('src', resource.image('download'));

			if (json && json.code === 0) {
				setTimeout(function () { // wait here so the img above can be updated in time

					window.location = '?action=getArchive&id=' + json.id + '&as=' + (settings.packageName || location.getItem().label) + '.' + settings.format;
				}, 200);
			} else {
				failed();
			}
		},

		requestArchive = function (hrefsStr) {

			$download.addClass('current');
			$img.attr('src', resource.image('loading.gif', true));

			server.request({
				action: 'createArchive',
				execution: settings.execution,
				format: settings.format,
				hrefs: hrefsStr
			}, handleResponse);
		},

		onSelection = function (items) {

			selectedHrefsStr = '';
			if (items.length) {
				selectedHrefsStr = _.map(items, function (item) {

					return item.absHref;
				}).join('|:|');
				$download.appendTo('#navbar').show();
			} else {
				$download.hide();
			}
		},

		onClick = function (event) {

			var exe = settings.execution.toUpperCase();

			if (exe === 'PHP') {

				event.preventDefault();
				requestArchive(selectedHrefsStr);

			} else if (exe === 'SHELL') {

				var query = '?action=passArchive';
				query += '&as=' + encodeURIComponent((settings.packageName || location.getItem().label) + '.' + settings.format);
				query += '&format=' + settings.format;
				query += '&hrefs=' + encodeURIComponent(selectedHrefsStr);
				window.location = query;
			}
		},

		init = function () {

			if (!settings.enabled || !server.api) {
				return;
			}

			$download = $(downloadBtnTemplate)
				.find('a').on('click', onClick).end()
				.appendTo('#navbar');
			$img = $download.find('img');

			event.sub('selection', onSelection);
		};

	init();
});
