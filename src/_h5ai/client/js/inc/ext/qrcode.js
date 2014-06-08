
modulejs.define('ext/qrcode', ['_', '$', 'modernizr', 'core/settings', 'core/event', 'core/resource'], function (_, $, modernizr, allsettings, event, resource) {

	var settings = _.extend({
			enabled: false,
			size: 150
		}, allsettings.qrcode),

		template = '<div id="qrcode"/>',

		$qrcode, hideTimeoutId,

		update = function (item) {

			resource.ensureQRCode(function () {
				$qrcode.empty().qrcode({
					render: modernizr.canvas ? 'canvas' : 'div',
					width: settings.size,
					height: settings.size,
					color: '#333',
					bgColor: '#fff',
					text: window.location.protocol + '//' + window.location.host + item.absHref
				});
			});
		},

		onMouseenter = function (item) {

			if (!item.isFolder()) {
				update(item);
				clearTimeout(hideTimeoutId);
				$qrcode.stop(true, true).fadeIn(400);
			}
		},

		onMouseleave = function (item) {

			hideTimeoutId = setTimeout(function () {

				$qrcode.stop(true, true).fadeOut(400);
			}, 200);
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			$qrcode = $(template).appendTo('body');

			event.sub('item.mouseenter', onMouseenter);
			event.sub('item.mouseleave', onMouseleave);
		};

	init();
});
