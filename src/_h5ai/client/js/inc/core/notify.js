
modulejs.define('core/notify', ['$'], function ($) {

	var test = null,

		template = '<div id="notify"/>',

		id = 0,

		set = function (content) {

			if (content) {
				$('#notify').stop(true, true).html(content).fadeIn(400);
			} else {
				$('#notify').stop(true, true).fadeOut(400);
			}
		},

		init = function () {

			$(template).hide().appendTo('body');
		};

	init();

	return {
		set: set
	};
});
