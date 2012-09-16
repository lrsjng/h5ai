
modulejs.define('ext/thumbnails', ['_', 'core/settings', 'core/entry', 'core/event', 'core/ajax'], function (_, allsettings, entry, event, ajax) {

	var settings = _.extend({
			enabled: false,
			img: ['bmp', 'gif', 'ico', 'image', 'jpg', 'png', 'tiff'],
			mov: ['video'],
			doc: ['pdf', 'ps'],
			delay: 1000
		}, allsettings.thumbnails),

		checkEntry = function (entry) {

			if (entry.$extended) {

				var type = null;

				if (_.indexOf(settings.img, entry.type) >= 0) {
					type = 'img';
				} else if (_.indexOf(settings.mov, entry.type) >= 0) {
					type = 'mov';
				} else if (_.indexOf(settings.doc, entry.type) >= 0) {
					type = 'doc';
				}

				if (type) {
					ajax.getThumbSrcSmall(type, entry.absHref, function (src) {

						if (src) {
							entry.$extended.find('.icon.small img').addClass('thumb').attr('src', src);
						}
					});
					ajax.getThumbSrcBig(type, entry.absHref, function (src) {

						if (src) {
							entry.$extended.find('.icon.big img').addClass('thumb').attr('src', src);
						}
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

			event.sub('entry.created', function (entry) {

				checkEntry(entry);
			});
		};

	init(entry);
});
