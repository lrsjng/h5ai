
modulejs.define('ext/tree', ['_', '$', 'core/settings', 'core/resource', 'core/event', 'core/entry'], function (_, $, allsettings, resource, event, entry) {

	var settings = _.extend({
			enabled: false,
			slide: true,
			maxSubfolders: 50
		}, allsettings.tree),

		template = '<div class="entry">' +
						'<span class="indicator none">' +
							'<img src="' + resource.image('tree') + '"/>' +
						'</span>' +
						'<a>' +
							'<span class="icon"><img/></span>' +
							'<span class="label"/>' +
						'</a>' +
					'</span>',
		statusHintTemplate = '<span class="hint"/>',

		magicSequence = '=h5ai=',

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
				if (!entry.status || (entry.status === magicSequence && !entry.isContentFetched) || subfolders.length) {

					$indicator.removeClass('none');

					if (!entry.status || (entry.status === magicSequence && !entry.isContentFetched)) {
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

				// is it the root?
				if (entry.isRoot()) {
					$html.addClass('root');
					$img.attr('src', resource.icon('folder-home'));
				}

				// is it the current folder?
				if (entry.isCurrentFolder()) {
					$html.addClass('current');
					$img.attr('src', resource.icon('folder-open'));
				}

				// does it have subfolders?
				if (subfolders.length) {
					var $ul = $('<ul class="content"/>').appendTo($html),
						counter = 0;
					_.each(subfolders, function (e) {
						counter += 1;
						if (counter <= settings.maxSubfolders) {
							$('<li/>').append(update(e)).appendTo($ul);
						}
					});
					if (subfolders.length > settings.maxSubfolders) {
						$('<li class="summary">… ' + (subfolders.length - settings.maxSubfolders) + ' more subfolders</li>').appendTo($ul);
					}
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

		createOnIndicatorClick = function () {

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

					entry.fetchContent(function (entry) {

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

		fetchTree = function (entry, callback) {

			entry.isContentVisible = true;
			entry.fetchContent(function (entry) {

				if (entry.parent) {
					fetchTree(entry.parent, callback);
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

		onContentChanged = function (entry) {

			while (entry.parent) {
				entry = entry.parent;
			}

			update(entry);
		},

		// creates the complete tree from entry down to the root
		init = function (entry) {

			if (!settings.enabled) {
				return;
			}

			var $tree = $('<div id="tree"/>')
				.appendTo('body')
				.scrollpanel()
				.on('click', '.indicator', createOnIndicatorClick())
				.on('mouseenter', function () {

					shiftTree(true);
				})
				.on('mouseleave', function () {

					shiftTree();
				});

			fetchTree(entry, function (root) {

				$tree
					.find('.sp-container').append(update(root)).end()
					.show();

				adjustSpacing();
				shiftTree(false, true);
			});

			event.sub('ready', adjustSpacing);

			// strong negative performance impact in aai mode
			// event.sub('entry.changed', onContentChanged);
			// event.sub('entry.created', onContentChanged);
			// event.sub('entry.removed', onContentChanged);

			$(window).on('resize', function () {

				adjustSpacing();
				shiftTree();
			});
		};

	init(entry);
});
