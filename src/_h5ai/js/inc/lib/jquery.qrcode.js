/*!
 * jQuery.qrcode
 * author: Lars Jung
 * license: MIT
 *
 * kudos to http://github.com/jeromeetienne/jquery-qrcode
 */
(function ($) {

	// @include "qrcode.js"

	var createQr = function (typeNumber, correctLevel, text) {

			var qr = new qrcode(typeNumber, correctLevel);
			qr.addData(text);
			qr.make();

			return qr;
		},
		createBestQr = function (text) {

			for (var type = 2; type <= 10; type += 1) {
				try {
					return createQr(type, 'L', text);
				} catch (err) {}
			}

			return null;
		},
		createCanvas = function (settings) {

			var qr = createBestQr(settings.text),
				$canvas = $('<canvas/>').attr('width', settings.width).attr('height', settings.height),
				ctx = $canvas[0].getContext('2d');

			if (settings.bgColor) {
				ctx.fillStyle = settings.bgColor;
				ctx.fillRect(0, 0, settings.width, settings.height);
			}

			if (qr) {
				var moduleCount = qr.getModuleCount(),
					moduleWidth = settings.width / moduleCount,
					moduleHeight = settings.height / moduleCount,
					row, col;

				ctx.beginPath();
				for (row = 0; row < moduleCount; row += 1) {
					for (col = 0; col < moduleCount; col += 1) {
						if (qr.isDark(row, col)) {
							ctx.rect(col * moduleWidth, row * moduleHeight, moduleWidth, moduleHeight);
						}
					}
				}
				ctx.fillStyle = settings.color;
				ctx.fill();
			}

			return $canvas;
		},
		createDiv = function (settings) {

			var qr = createBestQr(settings.text),
				$div = $('<div/>').css({
										position: 'relative',
										left: 0,
										top: 0,
										padding: 0,
										margin: 0,
										width: settings.width,
										height: settings.height
									});

			if (settings.bgColor) {
				$div.css('background-color', settings.bgColor);
			}

			if (qr) {
				var moduleCount = qr.getModuleCount(),
					moduleWidth = Math.floor(settings.width / moduleCount),
					moduleHeight = Math.floor(settings.height / moduleCount),
					offsetLeft = Math.floor(0.5 * (settings.width - moduleWidth * moduleCount)),
					offsetTop = Math.floor(0.5 * (settings.height - moduleHeight * moduleCount)),
					row, col;

				for (row = 0; row < moduleCount; row++) {
					for (col = 0; col < moduleCount; col++) {
						if (qr.isDark(row, col)) {
							$('<div/>')
								.css({
									left: offsetLeft + col * moduleWidth,
									top: offsetTop + row * moduleHeight
								})
								.appendTo($div);
						}
					}
				}

				$div.children()
							.css({
								position: 'absolute',
								padding: 0,
								margin: 0,
								width: moduleWidth,
								height: moduleHeight,
								'background-color': settings.color
							});
			}

			return $div;
		},

		defaults = {
			render: 'canvas',
			width: 256,
			height: 256,
			color: '#000',
			bgColor: null,
			text: 'no text'
		};

	$.fn.qrcode = function(options) {

		var settings = $.extend({}, defaults, options);

		$(this).append(settings.render === 'canvas' ? createCanvas(settings) : createDiv(settings));
	};

}(jQuery));
