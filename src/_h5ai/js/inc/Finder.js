
(function ($, H5AI) {

	H5AI.finder = (function () {

		var filter = function (re) {

				var match = [],
					noMatch = [];

				if (re) {
					$('#extended .entry').each(function () {

						var label = $(this).find('.label').text();

						if (label.match(re)) {
							match.push(this);
						} else {
							noMatch.push(this);
						}
					});
				} else {
					match = $('#extended .entry');
				}

				$(match).fadeIn(200);
				$(noMatch).fadeOut(200);
			},
			checkState = function (focus) {

				var $filter = $('#filter'),
					$input = $filter.find('input'),
					val = $input.val();

				console.log('checkState', val, focus);

				if (val || focus) {
					$filter.addClass('current');
				} else {
					$filter.removeClass('current');
				}
			},
			init = function () {

				if (H5AI.core.settings.showFilter) {
					$("<li id='filter'><span class='element'><img alt='filter' /><input type='text' value='' placeholder='Filter' /></span></li>")
						.on('click', function () {

							var $input = $(this).find('input');
							$input.focus();
						})
						.find("img").attr("src", H5AI.core.image("filter")).end()
						.find("input")
							.on('focus', function () {

								checkState(true);
							})
							.on('blur', function () {

								checkState(false);
							})
							.on('keyup', function () {

								var $input = $(this),
									val = $input.val();

								if (val) {
									filter(new RegExp(val));
								} else {
									filter();
								}
								checkState($input.is(':focus'));
							})
						.end()
						.appendTo($("#navbar"));
				}

			};


		return {
			init: init,
			filter: filter
		}
	}())

}(jQuery, H5AI));