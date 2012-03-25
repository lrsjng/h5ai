
(function ($, h5ai) {
'use strict';

	var deobfuscate = function () {

			$('.obfusma').each(function () {

				var $this = $(this),
					add = $this.text().replace(/\s*/g, '').replace(/\[at\]/gi, '@').replace(/\[dot\]/gi, '.'),
					$a = $('<a/>').attr('href', 'mailto:' + add).text(add).addClass('deobfusma');

				$this.replaceWith($a);
			});
		},
		handleChecksResponse = function (response) {

			if (response) {
				$('#test-php .test-result').addClass('test-passed').text('passed');
				if (response.zips === 0) {
					$('#test-zips .test-result').addClass('test-passed').text('passed');
				} else {
					$('#test-zips .test-result').addClass('test-failed').text('failed (' + response.zips + ')');
				}
				if (response.thumbs === 0) {
					$('#test-thumbs .test-result').addClass('test-passed').text('passed');
				} else {
					$('#test-thumbs .test-result').addClass('test-failed').text('failed (' + response.thumbs + ')');
				}
			} else {
				$('#test-php .test-result').addClass('test-failed').text('failed');
				$('#test-zips .test-result').addClass('test-failed').text('failed');
				$('#test-thumbs .test-result').addClass('test-failed').text('failed');
			}
		},
		checks = function () {

			$.ajax({
				url: h5ai.core.api(),
				data: {
					action: 'checks'
				},
				type: 'POST',
				dataType: 'json',
				success: function (response) {

					handleChecksResponse(response);
				},
				error: function () {

					handleChecksResponse();
				}
			});
		},
		init = function () {

			h5ai.isSplash = $('html').hasClass('h5ai-splash');

			if (h5ai.isSplash) {
				deobfuscate();
				checks();
			}
		};

	$(init);

}(jQuery, h5ai));