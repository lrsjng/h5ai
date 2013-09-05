
modulejs.define('ext/download', ['_', '$', 'core/settings', 'core/resource', 'core/event', 'core/server', 'core/location'], function (_, $, allsettings, resource, event, server, location) {

	var settings = _.extend({
			enabled: false,
			type: 'php-tar',
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

			var type = settings.type,
				extension = (type === 'shell-zip') ? 'zip' : 'tar',
				query = {
					action: 'download',
					as: (settings.packageName || location.getItem().label) + '.' + extension,
					type: type,
					hrefs: selectedHrefsStr
				},
				$form = $('<form action="#" method="post" style="display:none;"/>');

			_.each(query, function (val, key) {

				$('<input type="hidden"/>')
					.attr('name', key)
					.attr('value', val)
					.appendTo($form);
			});

			$form.appendTo('body').submit().remove();
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
