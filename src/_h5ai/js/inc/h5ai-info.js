
modulejs.define('h5ai-info', ['$', 'core/ajax'], function ($, ajax) {

	var setCheckResult = function (id, result) {

			var $ele = $(id).find('.test-result');

			if (result) {
				$ele.addClass('test-passed').text('yes');
			} else {
				$ele.addClass('test-failed').text('no');
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
