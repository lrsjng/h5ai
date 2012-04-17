
module.define('h5ai-info', [jQuery, 'core/resource'], function ($, resource) {

	var setCheckResult = function (id, result) {

			var $ele = $(id).find('.test-result');

			if (result) {
				$ele.addClass('test-passed').text('yes');
			} else {
				$ele.addClass('test-failed').text('no');
			}
		},

		handleChecksResponse = function (response) {

			_.each(['php', 'cache', 'thumbs', 'temp', 'download'], function (test) {

				setCheckResult('#test-' + test, response && response[test]);
			})
		},

		checks = function () {

			$.ajax({
				url: resource.api(),
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

			checks();
		};

	init();
});
