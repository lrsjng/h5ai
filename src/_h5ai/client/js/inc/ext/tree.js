
modulejs.define('ext/tree', ['_', '$', 'core/settings', 'core/resource', 'core/event', 'core/location'], function (_, $, allsettings, resource, event, location) {

	var settings = _.extend({
			enabled: false,
			slide: true,
			maxSubfolders: 50
		}, allsettings.tree),

		template = '<div class="item">' +
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

		update = function (item) {

			var $html = $(template),
				$indicator = $html.find('.indicator'),
				$a = $html.find('a'),
				$img = $html.find('.icon img'),
				$label = $html.find('.label');

			$html
				.addClass(item.isFolder() ? 'folder' : 'file')
				.data('item', item)
				.data('status', item.status);

			location.setLink($a, item);
			$img.attr('src', resource.image('folder'));
			$label.text(item.label);

			if (item.isFolder()) {

				var subfolders = item.getSubfolders();

				// indicator
				if (!item.status || (item.status === magicSequence && !item.isContentFetched) || subfolders.length) {

					$indicator.removeClass('none');

					if (!item.status || (item.status === magicSequence && !item.isContentFetched)) {
						$indicator.addClass('unknown');
					} else if (item.isContentVisible) {
						$indicator.addClass('open');
					} else {
						$indicator.addClass('close');
					}
				}

				// is it the domain?
				if (item.isDomain()) {
					$html.addClass('domain');
					$img.attr('src', resource.image('home'));
				}

				// is it the root?
				if (item.isRoot()) {
					$html.addClass('root');
					$img.attr('src', resource.image('home'));
				}

				// is it the current folder?
				if (item.isCurrentFolder()) {
					$html.addClass('current');
					// $img.attr('src', resource.image('folder-open'));
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
					if (!item.isContentVisible) {
						$ul.hide();
					}
				}

				// reflect folder status
				if (_.isNumber(item.status)) {
					if (item.status === 200) {
						$img.attr('src', resource.image('folder-page'));
					} else {
						$html.addClass('error');
						$a.append($(statusHintTemplate).text(item.status));
					}
				}
			}


			if (item.$tree) {
				item.$tree.replaceWith($html);
			}
			item.$tree = $html;

			return $html;
		},

		createOnIndicatorClick = function () {

			var $tree = $('#tree'),
				slide = function (item, $indicator, $content, down) {

					item.isContentVisible = down;
					$indicator.removeClass('open close').addClass(down ? 'open' : 'close');
					$tree.scrollpanel('update', true);
					$content[down ? 'slideDown' : 'slideUp'](function () {

						$tree.scrollpanel('update');
					});
				};

			return function () {

				var $indicator = $(this),
					$item = $indicator.closest('.item'),
					item = $item.data('item'),
					$content = $item.find('> ul.content');

				if ($indicator.hasClass('unknown')) {

					item.fetchContent(function (item) {

						item.isContentVisible = false;

						var $item = update(item),
							$indicator = $item.find('> .indicator'),
							$content = $item.find('> ul.content');

						if (!$indicator.hasClass('none')) {
							slide(item, $indicator, $content, true);
						}
					});

				} else if ($indicator.hasClass('open')) {

					slide(item, $indicator, $content, false);

				} else if ($indicator.hasClass('close'))  {

					slide(item, $indicator, $content, true);
				}
			};
		},

		shiftTree = function (forceVisible, dontAnimate) {

			var $tree = $("#tree"),
				$view = $("#view"),
				left = ((settings.slide && $tree.outerWidth() < $view.offset().left) || forceVisible || !$view.is(':visible')) ? 0 : 18 - $tree.outerWidth();

			if (dontAnimate) {
				$tree.stop().css({ left: left });
			} else {
				$tree.stop().animate({ left: left });
			}
		},

		fetchTree = function (item, callback) {

			item.isContentVisible = true;
			item.fetchContent(function (item) {

				if (item.parent) {
					fetchTree(item.parent, callback);
				} else {
					callback(item);
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

		onLocationChanged = function (item) {

			fetchTree(item, function (root) {

				$('#tree')
					.find('.sp-container').append(update(root)).end()
					.show();
				adjustSpacing();
				shiftTree(false, true);
			});
		},

		init = function () {

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

			event.sub('ready', adjustSpacing);
			event.sub('location.changed', onLocationChanged);

			$(window).on('resize', function () {

				adjustSpacing();
				shiftTree();
			});
		};

	init();
});
