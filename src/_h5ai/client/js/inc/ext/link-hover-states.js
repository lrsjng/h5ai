
modulejs.define('ext/link-hover-states', ['_', '$', 'core/settings', 'core/event'], function (_, $, allsettings, event) {

	var settings = _.extend({
			enabled: false
		}, allsettings['link-hover-states']),

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

		onLocationChanged = function () {

			$('.hover').removeClass('hover');
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			$('body')
				.on('mouseenter', selector, onMouseEnter)
				.on('mouseleave', selector, onMouseLeave);

			event.sub('location.changed', onLocationChanged);
		};

	init();
});
