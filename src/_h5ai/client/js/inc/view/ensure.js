
modulejs.define('view/ensure', ['$', 'core/event'], function ($, event) {

	var selb = '#bottombar',
		selr = selb + ' .right',
		sela = selr + ' a',
		sequence = 'powered by h5ai',
		url = 'http://larsjung.de/h5ai/',
		isVisible = ':visible',
		styleKey = 'style',
		styleVal = 'display: inline !important',

		ensure = function () {

			if (
				$(selr).filter(isVisible).length !== 1 ||
				$(sela).filter(isVisible).length !== 1 ||
				$(selr).text() !== sequence
			) {
				$(selr).remove();
				$('<span><a/></span>')
					.addClass('right')
					.attr(styleKey, styleVal)
					.find('a')
						.attr('href', url)
						.attr('title', sequence)
						.text(sequence)
						.attr(styleKey, styleVal)
					.end()
					.prependTo(selb);
			}
		},

		init = function () {

			event.sub('ready', function () {

				ensure();
				setInterval(ensure, 60000);
			});
		};

	init();
});
