
modulejs.define('ext/download', ['_', '$', 'core/settings', 'core/resource', 'core/event', 'core/location', 'core/server'], function (_, $, allsettings, resource, event, location, server) {

	var settings = _.extend({
			enabled: false,
			type: 'php-tar',
			packageName: 'package'
		}, allsettings.download),

		downloadBtnTemplate = '<li id="download">' +
									'<a href="#">' +
										'<img src="' + resource.image('download') + '" alt="download"/>' +
										'<span class="l10n-download"/>' +
									'</a>' +
								'</li>',

		selectedItems = [],

		onSelection = function (items) {

			var $download = $('#download');

			selectedItems = items.slice(0);
			if (selectedItems.length) {
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
					hrefs: _.pluck(selectedItems, 'absHref').join('|:|')
				};

			server.formRequest(query);
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			$(downloadBtnTemplate)
				.find('a').on('click', onClick).end()
				.appendTo('#navbar');

			event.sub('selection', onSelection);
		};

	init();
});
