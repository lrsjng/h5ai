
modulejs.define('ext/thumbnails', ['jQuery', 'core/settings', 'core/resource', 'core/entry'], function ($, allsettings, resource, entry) {

	var defaults = {
			enabled: false,
			img: ['bmp', 'gif', 'ico', 'image', 'jpg', 'png', 'tiff'],
			mov: ['video'],
			doc: ['pdf', 'ps'],
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

			if (entry.$extended) {

				var type = null;

				if ($.inArray(entry.type, settings.img) >= 0) {
					type = 'img';
				} else if ($.inArray(entry.type, settings.mov) >= 0) {
					type = 'mov';
				} else if ($.inArray(entry.type, settings.doc) >= 0) {
					type = 'doc';
				}

				if (type) {
					requestThumb(entry.$extended.find('.icon.small img'), {
						action: 'getthumbsrc',
						type: type,
						href: entry.absHref,
						mode: 'square',
						width: 16,
						height: 16
					});
					requestThumb(entry.$extended.find('.icon.big img'), {
						action: 'getthumbsrc',
						type: type,
						href: entry.absHref,
						mode: 'rational',
						width: 100,
						height: 48
					});
				}
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
