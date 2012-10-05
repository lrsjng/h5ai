
modulejs.define('h5ai-info', ['$', 'core/ajax'], function ($, ajax) {

	var setCheckResult = function (id, result) {

			var $result = $(id).find('.test-result');

			if (result) {
				$result.addClass('test-passed').text('yes');
			} else {
				$result.addClass('test-failed').text('no');
			}
		},

		init = function () {

			ajax.getChecks(function (json) {

				if (json) {
					$('.test').each(function () {

						setCheckResult(this, json[$(this).data('id')]);
					});
				}
			});
		};

	init();
});
