
modulejs.define('ext/statusbar', ['_', '$', 'core/settings', 'core/format', 'core/event'], function (_, $, allsettings, format, event) {

	var settings = _.extend({
			enabled: false
		}, allsettings.statusbar),

		template = '<span class="statusbar">' +
						'<span class="status default">' +
							'<span class="folderTotal"/> <span class="l10n-folders"/>' +
							'<span class="sep"/>' +
							'<span class="fileTotal"/> <span class="l10n-files"/>' +
						'</span>' +
						'<span class="status dynamic"/>' +
					'</span>',
		sepTemplate = '<span class="sep"/>',

		$statusDynamic,
		$statusDefault,

		update = function (html) {

			if (html) {
				$statusDefault.hide();
				$statusDynamic.empty().append(html).show();
			} else {
				$statusDynamic.empty().hide();
				$statusDefault.show();
			}
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			var $statusbar = $(template),
				$folderTotal = $statusbar.find('.folderTotal'),
				$fileTotal = $statusbar.find('.fileTotal'),
				onLocationChanged = function (item) {

					var stats = item.getStats();
					$folderTotal.text(stats.folders);
					$fileTotal.text(stats.files);
				};

			$statusDefault = $statusbar.find('.status.default');
			$statusDynamic = $statusbar.find('.status.dynamic');

			$('#bottombar > .center').append($statusbar);

			event.sub('statusbar', update);
			event.sub('location.changed', onLocationChanged);
			event.sub('location.refreshed', onLocationChanged);

			event.sub('item.mouseenter', function (item) {

				if (item.isCurrentParentFolder()) {
					return;
				}

				var $span = $('<span/>').append(item.label);

				if (_.isNumber(item.time)) {
					$span.append(sepTemplate).append(format.formatDate(item.time));
				}
				if (_.isNumber(item.size)) {
					$span.append(sepTemplate).append(format.formatSize(item.size));
				}

				update($span);
			});

			event.sub('item.mouseleave', function (item) {

				update();
			});
		};

	init();
});
