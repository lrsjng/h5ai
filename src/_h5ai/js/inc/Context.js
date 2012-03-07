
(function ($, H5AI) {

	var $context,
		qrCodesSize,
		showQrCode = function ($a) {

			var absHref = $a.attr('href'),
				url = 'http://' + document.domain + absHref;

			$context.find('.qrcode').empty().qrcode({
				render: Modernizr.canvas ? 'canvas' : 'div',
				width: qrCodesSize,
				height: qrCodesSize,
				color: '#333',
				text: url
			});
		},
		init = function () {

			qrCodesSize = H5AI.core.settings.qrCodesSize;
			if (!qrCodesSize) {
				return;
			}

			var hideTimeoutId = null;

			$context = $('<div id="context"><div class="qrcode"/></div>');
			$context.appendTo('body');

			$('#extended')
				.on('mouseenter', '.entry.file a', function () {

					showQrCode($(this));
					clearTimeout(hideTimeoutId);
					$context.stop(true, true).fadeIn(400);
				})
				.on('mouseleave', '.entry.file a', function () {

					hideTimeoutId = setTimeout(function () {

						$context.stop(true, true).fadeOut(400);
					}, 200);
				});
		};

	H5AI.context = {
		init: init
	};

}(jQuery, H5AI));