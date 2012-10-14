
(function ($) {

	$.fn.spin = function (options) {

		return this.each(function () {

			var $this = $(this),
				data = $this.data();

			if (data.spinner) {
				data.spinner.stop();
				delete data.spinner;
			}

			if (options !== false) {
				data.spinner = new Spinner($.extend({color: $this.css('color')}, options)).spin(this);
			}
		});
	};
}(jQuery));
