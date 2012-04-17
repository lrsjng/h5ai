
module.define('ext/select', [jQuery, 'core/settings', 'core/event'], function ($, allsettings, event) {

	var defaults = {
			enabled: false
		},

		settings = _.extend({}, defaults, allsettings.select),

		x = 0,
		y = 0,
		$document = $(document),
		$selectionRect = $('<div id="selection-rect"></div>'),

		publish = function () {

			var entries = _.map($('#extended .entry.selected'), function (entryElement) {

				return $(entryElement).data('entry');
			});

			event.pub('selection', entries);
		},

		selectionUpdate = function (event) {

			var l = Math.min(x, event.pageX),
				t = Math.min(y, event.pageY),
				w = Math.abs(x - event.pageX),
				h = Math.abs(y - event.pageY),
				selRect;

			event.preventDefault();
			$selectionRect.css({left: l, top: t, width: w, height: h});

			selRect = $selectionRect.fracs('rect');
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
			$selectionRect.fadeOut(300);
			$('#extended .entry.selecting.selected').removeClass('selecting').removeClass('selected');
			$('#extended .entry.selecting').removeClass('selecting').addClass('selected');
			publish();
		},

		selectionStart = function (event) {

			var view = $(document).fracs('viewport');

			x = event.pageX;
			y = event.pageY;
			// only on left button and don't block the scrollbars
			if (event.button !== 0 || x >= view.right || y >= view.bottom) {
				return;
			}

			event.preventDefault();
			$(':focus').blur();
			if (!event.ctrlKey) {
				$('#extended .entry').removeClass('selected');
				publish();
			}
			$selectionRect.show().css({left: x, top: y, width: 0, height: 0});

			$document
				.on('mousemove', selectionUpdate)
				.one('mouseup', selectionEnd);
		},

		noSelection = function (event) {

			event.stopImmediatePropagation();
			return false;
		},

		noSelectionUnlessCtrl = function (event) {

			if (!event.ctrlKey) {
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
