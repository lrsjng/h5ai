
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

		checkItem = function (item) {

			var type = null;

			if (_.indexOf(settings.img, item.type) >= 0) {
				type = 'img';
			} else if (_.indexOf(settings.mov, item.type) >= 0) {
				type = 'mov';
			} else if (_.indexOf(settings.doc, item.type) >= 0) {
				type = 'doc';
			}

			if (type) {
				if (item.thumbSmall) {
					item.$view.find('.icon.small img').addClass('thumb').attr('src', item.thumbSmall);
				} else {
					requestThumbSmall(type, item.absHref, function (src) {

						if (src && item.$view) {
							item.thumbSmall = src;
							item.$view.find('.icon.small img').addClass('thumb').attr('src', src);
						}
					});
				}
				if (item.thumbBig) {
					item.$view.find('.icon.big img').addClass('thumb').attr('src', item.thumbBig);
				} else {
					requestThumbBig(type, item.absHref, function (src) {

						if (src && item.$view) {
							item.thumbBig = src;
							item.$view.find('.icon.big img').addClass('thumb').attr('src', src);
						}
					});
				}
			}
		},

		onLocationChanged = function (item) {

			setTimeout(function () {

				_.each(item.content, checkItem);
			}, settings.delay);
		},

		onLocationRefreshed = function (item, added, removed) {

			_.each(added, checkItem);
		},

		init = function () {

			if (!settings.enabled || !server.api) {
				return;
			}

			event.sub('location.changed', onLocationChanged);
			event.sub('location.refreshed', onLocationRefreshed);
		};

	init();
});
