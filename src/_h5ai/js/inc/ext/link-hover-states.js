
modulejs.define('ext/link-hover-states', ['_', '$', 'core/settings'], function (_, $, allsettings) {

	var defaults = {
			enabled: false
		},

		settings = _.extend({}, defaults, allsettings['link-hover-states']),

		selector = "a[href^='/']",

		selectLinks = function (href) {

			return $(_.filter($(selector), function (el) {

				return $(el).attr('href') === href;
			}));
		},

		onMouseEnter = function () {

			var href = $(this).attr('href');

			selectLinks(href).addClass('hover');
		},

		onMouseLeave = function () {

			var href = $(this).attr('href');

			selectLinks(href).removeClass('hover');
		},

		init = function () {

			if (settings.enabled) {
				$('body')
					.on('mouseenter', selector, onMouseEnter)
					.on('mouseleave', selector, onMouseLeave);
			}
		};

	init();
});
