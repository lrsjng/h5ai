
modulejs.define('info', ['$'], function ($) {

	var setCheckResult = function (el, result) {

			var $result = $(el).find('.result');

			if (result) {
				$result.addClass('passed').text('yes');
			} else {
				$result.addClass('failed').text('no');
			}
		},

		init = function () {

			$.getJSON('server/php/index.php', {action: 'get', checks: true}, function (json) {

				if (json) {
					$('.idx-file .value').text(json.checks['idx']);
					$('.test').each(function () {

						setCheckResult(this, json.checks[$(this).data('id')]);
					});
					$('.test.php .result').text(json.checks['phpversion']);
				}
			});
		};

	init();
});
