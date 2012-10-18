
modulejs.define('ext/thumbnails', ['_', 'core/settings', 'core/event', 'core/server'], function (_, allsettings, event, server) {

	var settings = _.extend({
			enabled: false,
			img: ['bmp', 'gif', 'ico', 'image', 'jpg', 'png', 'tiff'],
			mov: ['video'],
			doc: ['pdf', 'ps'],
			delay: 1000
		}, allsettings.thumbnails),

		requestThumbSmall = function (type, href, callback) {

			server.request({action: 'getThumbHref', type: type, href: href, mode: 'square', width: 16, height: 16}, function (json) {

				callback(json && json.code === 0 ? json.absHref : null);
			});
		},

		requestThumbBig = function (type, href, callback) {

			server.request({action: 'getThumbHref', type: type, href: href, mode: 'rational', width: 100, height: 48}, function (json) {

				callback(json && json.code === 0 ? json.absHref : null);
			});
		},

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
					requestThumbSmall(type, entry.absHref, function (src) {

						if (src) {
							entry.$extended.find('.icon.small img').addClass('thumb').attr('src', src);
						}
					});
					requestThumbBig(type, entry.absHref, function (src) {

						if (src) {
							entry.$extended.find('.icon.big img').addClass('thumb').attr('src', src);
						}
					});
				}
			}
		},

		onLocationChanged = function (item) {

			setTimeout(function () {

				_.each(item.content, checkEntry);
			}, settings.delay);
		},

		init = function () {

			if (!settings.enabled || !server.api) {
				return;
			}

			event.sub('location.changed', onLocationChanged);
			event.sub('entry.created', function (entry) {

				checkEntry(entry);
			});
		};

	init();
});
