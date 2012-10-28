
modulejs.define('view/items', ['_', '$', 'core/settings', 'core/resource', 'core/format', 'core/event', 'core/location'], function (_, $, allsettings, resource, format, event, location) {

	var settings = _.extend({
			setParentFolderLabels: false,
			binaryPrefix: false
		}, allsettings.view),

		itemTemplate = '<li class="item">' +
						'<a>' +
							'<span class="icon small"><img/></span>' +
							'<span class="icon big"><img/></span>' +
							'<span class="label"/>' +
							'<span class="date"/>' +
							'<span class="size"/>' +
						'</a>' +
					'</li>',
		hintTemplate = '<span class="hint"/>',
		itemsTemplate = '<ul id="items" class="clearfix">' +
							'<li class="header">' +
								'<a class="icon"/>' +
								'<a class="label" href="#"><span class="l10n-name"/></a>' +
								'<a class="date" href="#"><span class="l10n-lastModified"/></a>' +
								'<a class="size" href="#"><span class="l10n-size"/></a>' +
							'</li>' +
						'</ul>',
		emptyTemplate = '<div class="empty l10n-empty"/>',
		contentTemplate = '<div id="content"><div id="extended"/></div>',

		// updates this single item
		update = function (item, force) {

			if (!force && item.$extended) {
				return item.$extended;
			}

			var $html = $(itemTemplate),
				$a = $html.find('a'),
				$imgSmall = $html.find('.icon.small img'),
				$imgBig = $html.find('.icon.big img'),
				$label = $html.find('.label'),
				$date = $html.find('.date'),
				$size = $html.find('.size');

			$html
				.addClass(item.isFolder() ? 'folder' : 'file')
				.data('item', item);

			location.setLink($a, item);

			$imgSmall.attr('src', resource.icon(item.type)).attr('alt', item.type);
			$imgBig.attr('src', resource.icon(item.type, true)).attr('alt', item.type);
			$label.text(item.label);
			$date.data('time', item.time).text(format.formatDate(item.time));
			$size.data('bytes', item.size).text(format.formatSize(item.size));

			if (item.isFolder() && _.isNumber(item.status)) {
				if (item.status === 200) {
					$html.addClass('page');
					$imgSmall.attr('src', resource.icon('folder-page'));
					$imgBig.attr('src', resource.icon('folder-page', true));
				} else {
					$html.addClass('error');
					$label.append($(hintTemplate).text(' ' + item.status + ' '));
				}
			}

			if (item.isCurrentParentFolder()) {
				$imgSmall.attr('src', resource.icon('folder-parent'));
				$imgBig.attr('src', resource.icon('folder-parent', true));
				if (!settings.setParentFolderLabels) {
					$label.addClass('l10n-parentDirectory');
				}
				$html.addClass('folder-parent');
			}

			if (item.$extended) {
				item.$extended.replaceWith($html);
			}
			item.$extended = $html;

			return $html;
		},

		onMouseenter = function () {

			var item = $(this).closest('.item').data('item');
			event.pub('item.mouseenter', item);
		},

		onMouseleave = function () {

			var item = $(this).closest('.item').data('item');
			event.pub('item.mouseleave', item);
		},

		onLocationChanged = function (item) {

			var $extended = $('#extended'),
				$items = $('#items'),
				$empty = $extended.find('.empty');

			$items.find('.item').remove();

			if (item.parent) {
				$items.append(update(item.parent, true));
			}

			_.each(item.content, function (e) {

				$items.append(update(e, true));
			});

			if (item.isEmpty()) {
				$empty.show();
			} else {
				$empty.hide();
			}
		},

		onLocationRefreshed = function (item, added, removed) {

			var $extended = $('#extended'),
				$items = $('#items'),
				$empty = $extended.find('.empty');

			_.each(added, function (item) {

				update(item, true).hide().appendTo($items).fadeIn(400);
			});

			_.each(removed, function (item) {

				item.$extended.fadeOut(400, function () {
					item.$extended.remove();
				});
			});

			if (item.isEmpty()) {
				setTimeout(function () { $empty.show(); }, 400);
			} else {
				$empty.hide();
			}
		},

		init = function () {

			var $content = $(contentTemplate),
				$extended = $content.find('#extended'),
				$items = $(itemsTemplate),
				$emtpy = $(emptyTemplate).hide();

			format.setDefaultMetric(settings.binaryPrefix);

			$extended
				.append($items)
				.append($emtpy);

			$items
				.on('mouseenter', '.item a', onMouseenter)
				.on('mouseleave', '.item a', onMouseleave);

			event.sub('location.changed', onLocationChanged);
			event.sub('location.refreshed', onLocationRefreshed);

			$content.appendTo('body');
		};

	init();
});
