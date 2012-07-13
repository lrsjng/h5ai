
modulejs.define('ext/select', ['jQuery', 'core/settings', 'core/event'], function ($, allsettings, event) {

	var defaults = {
			enabled: false
		},

		settings = _.extend({}, defaults, allsettings.select),

		x = 0, y = 0,
		l = 0, t = 0, w = 0, h = 0,
		shrink = 1/3,
		$document = $(document),
		$selectionRect = $('<div id="selection-rect"></div>'),

		publish = function () {

			var entries = _.map($('#extended .entry.selected'), function (entryElement) {

				return $(entryElement).data('entry');
			});

			event.pub('selection', entries);
		},

		selectionUpdate = function (event) {

			l = Math.min(x, event.pageX);
			t = Math.min(y, event.pageY);
			w = Math.abs(x - event.pageX);
			h = Math.abs(y - event.pageY);

			event.preventDefault();
			$selectionRect
				.stop(true, true)
				.css({left: l, top: t, width: w, height: h});

			var selRect = $selectionRect.fracs('rect');
			$('#extended .entry').removeClass('selecting').each(function () {

				var $entry = $(this),
					rect = $entry.find('a').fracs('rect'),
					inter = selRect.intersection(rect);
				if (inter && !$entry.hasClass('folder-parent')) {
					$entry.addClass('selecting');
				}
			});
		},

		selectionEnd = function (event) {

			event.preventDefault();
			$document.off('mousemove', selectionUpdate);
			$('#extended .entry.selecting.selected').removeClass('selecting').removeClass('selected');
			$('#extended .entry.selecting').removeClass('selecting').addClass('selected');
			publish();

			$selectionRect
				.stop(true, true)
				.animate(
					{
						left: l + w * 0.5 * shrink,
						top: t + h  * 0.5 * shrink,
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

			var view = $(document).fracs('viewport');

			x = event.pageX;
			y = event.pageY;
			l = x;
			t = y;
			w = 0;
			h = 0;

			// only on left button and don't block the scrollbars
			if (event.button !== 0 || l >= view.right || t >= view.bottom) {
				return;
			}

			event.preventDefault();
			$(':focus').blur();
			if (!event.ctrlKey && !event.metaKey) {
				$('#extended .entry').removeClass('selected');
				publish();
			}
			$selectionRect
				.stop(true, true)
				.css({left: l, top: t, width: w, height: h, opacity: 1})
				.show();

			$document
				.on('mousemove', selectionUpdate)
				.one('mouseup', selectionEnd);
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

		init = function () {

			if (!settings.enabled) {
				return;
			}

			$selectionRect.hide().appendTo('body');

			$document
				.on('mousedown', '.noSelection', noSelection)
				.on('mousedown', '.noSelectionUnlessCtrl,input,a', noSelectionUnlessCtrl)
				.on('mousedown', selectionStart);
		};

	init();
});
