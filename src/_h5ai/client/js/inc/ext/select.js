
modulejs.define('ext/select', ['_', '$', 'core/settings', 'core/resource', 'core/event'], function (_, $, allsettings, resource, event) {

	var settings = _.extend({
			enabled: false,
			checkboxes: false
		}, allsettings.select),

		template = '<span class="selector"><img src="' + resource.image('selected') + '" alt="selected"/></span>',

		x = 0, y = 0,
		l = 0, t = 0, w = 0, h = 0,
		shrink = 1/3,
		$document = $(document),
		$selectionRect = $('<div id="selection-rect"/>'),

		publish = function () {

			var items = _.map($('#items .item.selected'), function (itemElement) {

				return $(itemElement).data('item');
			});

			event.pub('selection', items);
		},

		selectionUpdate = function (event) {

			l = Math.min(x, event.pageX);
			t = Math.min(y, event.pageY);
			w = Math.abs(x - event.pageX);
			h = Math.abs(y - event.pageY);

			event.preventDefault();
			$selectionRect
				.stop(true, true)
				.css({left: l, top: t, width: w, height: h, opacity: 1})
				.show();

			var selRect = $selectionRect.fracs('rect');
			$('#items .item').removeClass('selecting').each(function () {

				var $item = $(this),
					rect = $item.find('a').fracs('rect'),
					inter = selRect.intersection(rect);
				if (inter && !$item.hasClass('folder-parent')) {
					$item.addClass('selecting');
				}
			});
		},

		selectionEnd = function (event) {

			event.preventDefault();
			$document.off('mousemove', selectionUpdate);
			$('#items .item.selecting.selected').removeClass('selecting').removeClass('selected');
			$('#items .item.selecting').removeClass('selecting').addClass('selected');
			publish();

			$selectionRect
				.stop(true, true)
				.animate(
					{
						left: l + w * 0.5 * shrink,
						top: t + h * 0.5 * shrink,
						width: w * (1 - shrink),
						height: h * (1 - shrink),
						opacity: 0
					},
					300,
					function () {
						$selectionRect.hide();
					}
				);
		},

		selectionStart = function (event) {

			var $window = $(window),
				viewRight = $window.scrollLeft() + $window.width(),
				viewBottom = $window.scrollTop() + $window.height();

			x = event.pageX;
			y = event.pageY;

			// only on left button and don't block the scrollbars
			if (event.button !== 0 || x >= viewRight || y >= viewBottom) {
				return;
			}

			$(':focus').blur();
			if (!event.ctrlKey && !event.metaKey) {
				$('#items .item').removeClass('selected');
				publish();
			}

			$document
				.on('mousemove', selectionUpdate)
				.one('mouseup', selectionEnd);

			selectionUpdate(event);
		},

		noSelection = function (event) {

			event.stopImmediatePropagation();
			return false;
		},

		noSelectionUnlessCtrl = function (event) {

			if (!event.ctrlKey && !event.metaKey) {
				noSelection(event);
			}
		},

		initItem = function (item) {

			if (item.$view) {

				$(template)
					.appendTo(item.$view.find('a'))
					.on('click', function (event) {

						event.stopImmediatePropagation();
						event.preventDefault();

						item.$view.toggleClass('selected');
						publish();
					});
			}
		},

		onLocationChanged = function (item) {

			if (settings.checkboxes) {
				_.each(item.content, initItem);
			}
			publish();
		},

		onLocationRefreshed = function (item, added, removed) {

			var selectionChanged = false;

			if (settings.checkboxes) {
				_.each(added, initItem);
			}
			_.each(removed, function (item) {

				if (item.$view && item.$view.hasClass('selected')) {
					item.$view.removeClass('selected');
					selectionChanged = true;
				}
			});

			if (selectionChanged) {
				publish();
			}
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			$selectionRect.hide().appendTo('body');

			event.sub('location.changed', onLocationChanged);
			event.sub('location.refreshed', onLocationRefreshed);

			$document
				.on('mousedown', '.noSelection', noSelection)
				.on('mousedown', '.noSelectionUnlessCtrl,input,a', noSelectionUnlessCtrl)
				.on('mousedown', selectionStart);
		};

	init();
});
