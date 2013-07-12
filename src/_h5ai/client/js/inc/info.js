
modulejs.define('info', ['$'], function ($) {

	var setCheckResult = function (id, result) {

			var $result = $(id).find('.test-result');

			if (result) {
				$result.addClass('test-passed').text('yes');
			} else {
				$result.addClass('test-failed').text('no');
			}
		},

		init = function () {

			$.getJSON('server/php/index.php', {action: 'get', checks: true}, function (json) {

				if (json) {
					$('.idx-file .value').text(json.checks['idx']);
					$('.test').each(function () {

						setCheckResult(this, json.checks[$(this).data('id')]);
					});
				}
			});
		};

	init();
});
