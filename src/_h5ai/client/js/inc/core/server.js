
modulejs.define('core/server', ['$', '_', 'config'], function ($, _, config) {

	var server = _.extend({}, config.server, {

		request: function (data, callback) {

			if (!server.apiHref) {
				callback();
				return;
			}

			$.ajax({
				url: server.apiHref,
				data: data,
				type: 'POST',
				dataType: 'json',
				success: function (json) {

					callback(json);
				},
				error: function () {

					callback();
				}
			});
		},

		requestThumbSmall: function (type, href, callback) {

			server.request({action: 'getthumbsrc', type: type, href: href, mode: 'square', width: 16, height: 16}, function (json) {

				callback(json && json.code === 0 ? json.absHref : null);
			});
		},

		requestThumbBig: function (type, href, callback) {

			server.request({action: 'getthumbsrc', type: type, href: href, mode: 'rational', width: 100, height: 48}, function (json) {

				callback(json && json.code === 0 ? json.absHref : null);
			});
		}
	});

	return server;
});
