
module.define('ext/thumbnails', [jQuery, 'core/settings', 'core/resource', 'core/entry'], function ($, allsettings, resource, entry) {

	var defaults = {
			enabled: false,
			types: ["bmp", "gif", "ico", "image", "jpg", "png", "tiff"],
			delay: 1000
		},

		settings = _.extend({}, defaults, allsettings.thumbnails),

		requestThumb = function ($img, data) {

			$.getJSON(resource.api(), data, function (json) {

				if (json.code === 0) {
					$img.addClass('thumb').attr('src', json.absHref);
				}
			});
		},

		checkEntry = function (entry) {

			if (entry.$extended && $.inArray(entry.type, settings.types) >= 0) {

				var $imgSmall = entry.$extended.find('.icon.small img');
				var $imgBig = entry.$extended.find('.icon.big img');

				requestThumb($imgSmall, {
					action: 'getthumbsrc',
					href: entry.absHref,
					width: 16,
					height: 16,
					mode: 'square'
				});
				requestThumb($imgBig, {
					action: 'getthumbsrc',
					href: entry.absHref,
					width: 100,
					height: 48,
					mode: 'rational'
				});
			}
		},

		init = function (entry) {

			if (!settings.enabled) {
				return;
			}

			setTimeout(function () {

				_.each(entry.content, checkEntry);
			}, settings.delay);
		};

	init(entry);
});
