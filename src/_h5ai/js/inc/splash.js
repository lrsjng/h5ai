
(function ($, h5ai) {

	var setCheckResult = function (id, result) {

			var $ele = $(id).find('.test-result');

			if (result) {
				$ele.addClass('test-passed').text('yes');
			} else {
				$ele.addClass('test-failed').text('no');
			}
		},
		handleChecksResponse = function (response) {

			setCheckResult('#test-php', response && response.php);
			setCheckResult('#test-zips', response && response.zips);
			setCheckResult('#test-thumbs', response && response.thumbs);
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