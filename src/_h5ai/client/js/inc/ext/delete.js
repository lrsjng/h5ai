
modulejs.define('ext/delete', ['_', '$', 'core/settings', 'core/event', 'core/resource', 'core/location', 'core/server'], function (_, $, allsettings, event, resource, location, server) {

	var settings = _.extend({
			enabled: false
		}, allsettings['delete']),

		deleteBtnTemplate = '<li id="delete">' +
									'<a href="#">' +
										'<img src="' + resource.image('delete') + '" alt="delete"/>' +
										'<span class="l10n-delete"/>' +
									'</a>' +
								'</li>',

		selectedHrefsStr = '',
		$delete, $img,

		failed = function () {

			$delete.addClass('failed');
			setTimeout(function () {
				$delete.removeClass('failed');
			}, 1000);
		},

		handleResponse = function (json) {

			$delete.removeClass('current');
			$img.attr('src', resource.image('delete'));

			if (!json || json.code) {
				failed();
			}
			location.refresh();
		},

		requestDeletion = function (hrefsStr) {

			$delete.addClass('current');
			$img.attr('src', resource.image('loading'));
			server.request({action: 'delete', hrefs: hrefsStr}, handleResponse);
		},

		onSelection = function (items) {

			selectedHrefsStr = '';
			if (items.length) {
				selectedHrefsStr = _.map(items, function (item) {

					return item.absHref;
				}).join('|:|');
				$delete.appendTo('#navbar').show();
			} else {
				$delete.hide();
			}
		},

		init = function () {

			if (!settings.enabled || !server.api) {
				return;
			}

			$delete = $(deleteBtnTemplate)
				.find('a').on('click', function (event) {

					event.preventDefault();
					requestDeletion(selectedHrefsStr);
				}).end()
				.appendTo('#navbar');
			$img = $delete.find('img');

			event.sub('selection', onSelection);
		};

	init();
});
