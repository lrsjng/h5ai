
module.define('ext/qrcode', [jQuery, 'core/settings', 'core/event'], function ($, allsettings, event) {

	var defaults = {
			enabled: false,
			size: 150
		},

		settings = _.extend({}, defaults, allsettings.qrcode),

		template = '<div id="context"><div class="qrcode" /></div>',

		$context, hideTimeoutId,

		update = function (entry) {

			$context.find('.qrcode').empty().qrcode({
				render: Modernizr.canvas ? 'canvas' : 'div',
				width: settings.size,
				height: settings.size,
				color: '#333',
				text: 'http://' + document.domain + entry.absHref
			});
		},

		onMouseenter = function (entry) {

			if (!entry.isFolder()) {
				update(entry);
				clearTimeout(hideTimeoutId);
				$context.stop(true, true).fadeIn(400);
			}
		},

		onMouseleave = function (entry) {

			hideTimeoutId = setTimeout(function () {

				$context.stop(true, true).fadeOut(400);
			}, 200);
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			$context = $(template).appendTo('body');

			event.sub('entry.mouseenter', onMouseenter);
			event.sub('entry.mouseleave', onMouseleave);
		};

	init();
});
