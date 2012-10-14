
modulejs.define('ext/statusbar', ['_', '$', 'core/settings', 'core/format', 'core/event', 'core/entry'], function (_, $, allsettings, format, event, entry) {

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

		init = function (entry) {

			if (!settings.enabled) {
				return;
			}

			var $statusbar = $(template),
				$folderTotal = $statusbar.find('.folderTotal'),
				$fileTotal = $statusbar.find('.fileTotal');

			$statusDefault = $statusbar.find('.status.default');
			$statusDynamic = $statusbar.find('.status.dynamic');

			var stats = entry.getStats();
			$folderTotal.text(stats.folders);
			$fileTotal.text(stats.files);

			update();

			event.sub('statusbar', update);
			$('#bottombar > .center').append($statusbar);

			event.sub('entry.created', function () {

				var stats = entry.getStats();
				$folderTotal.text(stats.folders);
				$fileTotal.text(stats.files);
			});

			event.sub('entry.removed', function () {

				var stats = entry.getStats();
				$folderTotal.text(stats.folders);
				$fileTotal.text(stats.files);
			});

			event.sub('entry.mouseenter', function (entry) {

				if (entry.isCurrentParentFolder()) {
					return;
				}

				var $span = $('<span/>').append(entry.label);

				if (_.isNumber(entry.time)) {
					$span.append(sepTemplate).append(format.formatDate(entry.time));
				}
				if (_.isNumber(entry.size)) {
					$span.append(sepTemplate).append(format.formatSize(entry.size));
				}

				update($span);
			});

			event.sub('entry.mouseleave', function (entry) {

				update();
			});
		};

	init(entry);
});
