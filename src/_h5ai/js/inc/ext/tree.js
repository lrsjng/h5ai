
module.define('ext/tree', [jQuery, 'core/settings', 'core/resource', 'core/event', 'core/entry', 'core/parser'], function ($, allsettings, resource, event, entry, parser) {

	var defaults = {
			enabled: false,
			slide: true
		},

		settings = _.extend({}, defaults, allsettings.tree),

		template = '<div class="entry">' +
						'<span class="indicator none">' +
							'<img src="' + resource.image('tree') + '" />' +
						'</span>' +
						'<a>' +
							'<span class="icon"><img /></span>' +
							'<span class="label"></span>' +
						'</a>' +
					'</span>',
		statusHintTemplate = '<span class="hint"></span>',

		// updates the tree for this single entry
		update = function (entry) {

			var $html = $(template),
				$indicator = $html.find('.indicator'),
				$a = $html.find('a'),
				$img = $html.find('.icon img'),
				$label = $html.find('.label');

			$html
				.addClass(entry.isFolder() ? 'folder' : 'file')
				.data('entry', entry)
				.data('status', entry.status);

			$a.attr('href', entry.absHref);
			$img.attr('src', resource.icon(entry.type));
			$label.text(entry.label);

			if (entry.isFolder()) {

				var subfolders = entry.getSubfolders();

				// indicator
				if (!entry.status || (entry.status === 'h5ai' && !entry.isContentFetched) || subfolders.length) {

					$indicator.removeClass('none');

					if (!entry.status || (entry.status === 'h5ai' && !entry.isContentFetched)) {
						$indicator.addClass('unknown');
					} else if (entry.isContentVisible) {
						$indicator.addClass('open');
					} else {
						$indicator.addClass('close');
					}
				}

				// is it the domain?
				if (entry.isDomain()) {
					$html.addClass('domain');
					$img.attr('src', resource.icon('folder-home'));
				}

				// is it the current folder?
				if (entry.isCurrentFolder()) {
					$html.addClass('current');
					$img.attr('src', resource.icon('folder-open'));
				}

				// does it have subfolders?
				if (subfolders.length) {
					var $ul = $('<ul class="content" />').appendTo($html);
					_.each(subfolders, function (e) {
						$('<li />').append(update(e)).appendTo($ul);
					});
					if (!entry.isContentVisible) {
						$ul.hide();
					}
				}

				// reflect folder status
				if (_.isNumber(entry.status)) {
					if (entry.status === 200) {
						$img.attr('src', resource.icon('folder-page'));
					} else {
						$html.addClass('error');
						$a.append($(statusHintTemplate).text(entry.status));
					}
				}
			}


			if (entry.$tree) {
				entry.$tree.replaceWith($html);
			}
			entry.$tree = $html;

			return $html;
		},

		createOnIndicatorClick = function (parser) {

			var $tree = $('#tree'),
				slide = function (entry, $indicator, $content, down) {

					entry.isContentVisible = down;
					$indicator.removeClass('open close').addClass(down ? 'open' : 'close');
					$tree.scrollpanel('update', true);
					$content[down ? 'slideDown' : 'slideUp'](function () {

						$tree.scrollpanel('update');
					});
				};

			return function () {

				var $indicator = $(this),
					$entry = $indicator.closest('.entry'),
					entry = $entry.data('entry'),
					$content = $entry.find('> ul.content');

				if ($indicator.hasClass('unknown')) {

					entry.fetchContent(parser, function (entry) {

						entry.isContentVisible = false;

						var $entry = update(entry),
							$indicator = $entry.find('> .indicator'),
							$content = $entry.find('> ul.content');

						if (!$indicator.hasClass('none')) {
							slide(entry, $indicator, $content, true);
						}
					});

				} else if ($indicator.hasClass('open')) {

					slide(entry, $indicator, $content, false);

				} else if ($indicator.hasClass('close'))  {

					slide(entry, $indicator, $content, true);
				}
			};
		},

		shiftTree = function (forceVisible, dontAnimate) {

			var $tree = $("#tree"),
				$extended = $("#extended"),
				left = ((settings.slide && $tree.outerWidth() < $extended.offset().left) || forceVisible || !$extended.is(':visible')) ? 0 : 18 - $tree.outerWidth();

			if (dontAnimate) {
				$tree.stop().css({ left: left });
			} else {
				$tree.stop().animate({ left: left });
			}
		},

		fetchTree = function (entry, parser, callback) {

			entry.isContentVisible = true;
			entry.fetchContent(parser, function (entry) {

				if (entry.parent) {
					fetchTree(entry.parent, parser, callback);
				} else {
					callback(entry);
				}
			});
		},

		adjustSpacing = function () {

			var $tree = $('#tree'),
				winHeight = $(window).height(),
				navHeight = $('#topbar').outerHeight(),
				footerHeight = $('#bottombar').outerHeight();

			$tree.css({
				top: navHeight,
				height: winHeight - navHeight - footerHeight - 16
			});

			$tree.scrollpanel('update');
		},

		// creates the complete tree from entry down to the root
		init = function (entry, parser) {

			if (!settings.enabled) {
				return;
			}

			var $tree = $('<div id="tree" />').appendTo('body');

			fetchTree(entry, parser, function (root) {

				$tree
					.append(update(root))
					.scrollpanel()
					.show();

				adjustSpacing();
				shiftTree(false, true);
				$tree.scrollpanel('update');
			});

			$tree
				.on('click', '.indicator', createOnIndicatorClick(parser))
				.on('mouseenter', function () { shiftTree(true); })
				.on('mouseleave', function () { shiftTree(); });

			event.sub('ready', adjustSpacing);
			$(window).on('resize', function () {
				adjustSpacing();
				shiftTree();
			});
		};

	init(entry, parser);
});
