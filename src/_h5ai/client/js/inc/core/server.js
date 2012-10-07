
modulejs.define('core/server', ['$', '_', 'config', 'base64'], function ($, _, config, base64) {

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

		requestArchive: function (data, callback) {

			if (!server.apiHref) {
				callback();
				return;
			}

			$.ajax({
				url: server.apiHref,
				data: {
					action: 'archive',
					execution: data.execution,
					format: data.format,
					hrefs: data.hrefs
				},
				type: 'POST',
				dataType: 'json',
				beforeSend: function (xhr) {

					if (data.user) {
						xhr.setRequestHeader('Authorization', 'Basic ' + base64.encode(data.user + ':' + data.password));
					}
				},
				success: function (json) {

					callback(json);
				},
				error: function () {

					callback();
				}
			});
		},

		requestThumb: function (data, callback) {

			server.request({
				action: 'getthumbsrc',
				type: data.type,
				href: data.href,
				mode: data.mode,
				width: data.width,
				height: data.height
			}, function (json) {

				callback(json && json.code === 0 ? json.absHref : null);
			});
		},

		requestThumbSmall: function (type, href, callback) {

			server.requestThumb(
				{
					type: type,
					href: href,
					mode: 'square',
					width: 16,
					height: 16
				},
				callback
			);
		},

		requestThumbBig: function (type, href, callback) {

			server.requestThumb(
				{
					type: type,
					href: href,
					mode: 'rational',
					width: 100,
					height: 48
				},
				callback
			);
		}
	});

	return server;
});
