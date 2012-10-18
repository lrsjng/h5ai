
modulejs.define('view/items', ['_', '$', 'core/settings', 'core/resource', 'core/format', 'core/event', 'core/location'], function (_, $, allsettings, resource, format, event, location) {

	var settings = _.extend({
			setParentFolderLabels: false,
			binaryPrefix: false
		}, allsettings.view),

		template = '<li class="entry">' +
						'<a>' +
							'<span class="icon small"><img/></span>' +
							'<span class="icon big"><img/></span>' +
							'<span class="label"/>' +
							'<span class="date"/>' +
							'<span class="size"/>' +
						'</a>' +
					'</li>',
		hintTemplate = '<span class="hint"/>',
		listTemplate = '<ul>' +
							'<li class="header">' +
								'<a class="icon"/>' +
								'<a class="label" href="#"><span class="l10n-name"/></a>' +
								'<a class="date" href="#"><span class="l10n-lastModified"/></a>' +
								'<a class="size" href="#"><span class="l10n-size"/></a>' +
							'</li>' +
						'</ul>',
		emptyTemplate = '<div class="empty l10n-empty"/>',
		contentTemplate = '<div id="content"><div id="extended" class="clearfix"/></div>',

		// updates this single entry
		update = function (entry, force) {

			if (!force && entry.$extended && entry.status && entry.$extended.data('status') === entry.status) {
				return entry.$extended;
			}

			var $html = $(template),
				$a = $html.find('a'),
				$imgSmall = $html.find('.icon.small img'),
				$imgBig = $html.find('.icon.big img'),
				$label = $html.find('.label'),
				$date = $html.find('.date'),
				$size = $html.find('.size');

			$html
				.addClass(entry.isFolder() ? 'folder' : 'file')
				.data('entry', entry)
				.data('status', entry.status);

			location.setLink($a, entry);

			$imgSmall.attr('src', resource.icon(entry.type)).attr('alt', entry.type);
			$imgBig.attr('src', resource.icon(entry.type, true)).attr('alt', entry.type);
			$label.text(entry.label);
			$date.data('time', entry.time).text(format.formatDate(entry.time));
			$size.data('bytes', entry.size).text(format.formatSize(entry.size));

			if (entry.isFolder() && _.isNumber(entry.status)) {
				if (entry.status === 200) {
					$html.addClass('page');
					$imgSmall.attr('src', resource.icon('folder-page'));
					$imgBig.attr('src', resource.icon('folder-page', true));
				} else {
					$html.addClass('error');
					$label.append($(hintTemplate).text(' ' + entry.status + ' '));
				}
			}

			if (entry.isCurrentParentFolder()) {
				$imgSmall.attr('src', resource.icon('folder-parent'));
				$imgBig.attr('src', resource.icon('folder-parent', true));
				if (!settings.setParentFolderLabels) {
					$label.addClass('l10n-parentDirectory');
				}
				$html.addClass('folder-parent');
			}

			if (entry.$extended) {
				entry.$extended.replaceWith($html);
			}
			entry.$extended = $html;

			return $html;
		},

		onMouseenter = function () {

			var entry = $(this).closest('.entry').data('entry');
			event.pub('entry.mouseenter', entry);
		},

		onMouseleave = function () {

			var entry = $(this).closest('.entry').data('entry');
			event.pub('entry.mouseleave', entry);
		},

		onLocationChanged = function (item) {

			var $extended = $('#extended'),
				$ul = $extended.find('ul'),
				$empty = $extended.find('.empty');

			$ul.find('.entry').remove();

			if (item.parent) {
				$ul.append(update(item.parent));
			}

			_.each(item.content, function (e) {

				$ul.append(update(e));
			});

			if (item.isEmpty()) {
				$empty.show();
			} else {
				$empty.hide();
			}
		},

		init = function () {

			var $content = $(contentTemplate),
				$extended = $content.find('#extended'),
				$ul = $(listTemplate),
				$emtpy = $(emptyTemplate).hide();

			format.setDefaultMetric(settings.binaryPrefix);

			$extended
				.append($ul)
				.append($emtpy)
				.on('mouseenter', '.entry a', onMouseenter)
				.on('mouseleave', '.entry a', onMouseleave);

			event.sub('entry.changed', function (entry) {

				if (entry.isInCurrentFolder() && entry.$extended) {
					update(entry, true);
				}
			});

			event.sub('entry.created', function (entry) {

				if (entry.isInCurrentFolder() && !entry.$extended) {
					$emtpy.fadeOut(100, function () {
						update(entry, true).hide().appendTo($ul).fadeIn(400);
					});
				}
			});

			event.sub('entry.removed', function (entry) {

				if (entry.isInCurrentFolder() && entry.$extended) {
					entry.$extended.fadeOut(400, function () {
						entry.$extended.remove();

						if (entry.parent.isEmpty()) {
							$emtpy.fadeIn(100);
						}
					});
				}
			});

			event.sub('location.changed', onLocationChanged);

			$content.appendTo('body');
		};

	init();
});
