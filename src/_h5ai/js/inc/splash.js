
(function ($, h5ai) {
'use strict';

	var handleChecksResponse = function (response) {

			if (response) {
				$('#test-php .test-result').addClass('test-passed').text('yes');
				if (response.zips === 0) {
					$('#test-zips .test-result').addClass('test-passed').text('yes');
				} else {
					$('#test-zips .test-result').addClass('test-failed').text('no').attr('title', 'error-code: ' + response.zips);
				}
				if (response.thumbs === 0) {
					$('#test-thumbs .test-result').addClass('test-passed').text('yes');
				} else {
					$('#test-thumbs .test-result').addClass('test-failed').text('no').attr('title', 'error-code: ' + response.thumbs);
				}
			} else {
				$('#test-php .test-result').addClass('test-failed').text('no');
				$('#test-zips .test-result').addClass('test-failed').text('no');
				$('#test-thumbs .test-result').addClass('test-failed').text('no');
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
				checks();
			}
		};

	$(init);

}(jQuery, h5ai));