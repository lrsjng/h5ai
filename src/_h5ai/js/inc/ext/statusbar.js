
modulejs.define('ext/statusbar', ['_', '$', 'core/settings', 'core/format', 'core/event', 'core/entry'], function (_, $, allsettings, format, event, entry) {

	var defaults = {
			enabled: false
		},

		settings = _.extend({}, defaults, allsettings.statusbar),

		template = '<span class="statusbar">' +
						'<span class="status default">' +
							'<span class="folderTotal"></span> <span class="l10n-folders">folders</span>' +
							'<span class="sep">·</span>' +
							'<span class="fileTotal"></span> <span class="l10n-files">files</span>' +
						'</span>' +
						'<span class="status dynamic"></span>' +
					'</span>',
		sepTemplate = '<span class="sep">·</span>',

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



			event.sub('entry.mouseenter', function (entry) {

				if (entry.isParentFolder) {
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
