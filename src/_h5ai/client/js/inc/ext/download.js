
modulejs.define('ext/download', ['_', '$', 'core/settings', 'core/resource', 'core/event', 'core/server'], function (_, $, allsettings, resource, event, server) {

	var settings = _.extend({
			enabled: false,
			execution: 'php',
			format: 'zip'
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

					window.location = '?action=getArchive&id=' + json.id + '&as=package.' + settings.format;
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

		onSelection = function (entries) {

			selectedHrefsStr = '';
			if (entries.length) {
				selectedHrefsStr = _.map(entries, function (entry) {

					return entry.absHref;
				}).join(':');
				$download.appendTo('#navbar').show();
			} else {
				$download.hide();
			}
		},

		init = function () {

			if (!settings.enabled || !server.api) {
				return;
			}

			$download = $(downloadBtnTemplate)
				.find('a').on('click', function (event) {

					event.preventDefault();
					requestArchive(selectedHrefsStr);
				}).end()
				.appendTo('#navbar');
			$img = $download.find('img');

			event.sub('selection', onSelection);
		};

	init();
});
