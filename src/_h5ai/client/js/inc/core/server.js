
modulejs.define('core/server', ['$', '_', 'config'], function ($, _, config) {

	var server = _.extend({}, config.server, {

		request: function (data, callback) {

			data.api = true;

			if (server.apiHref) {
				$.ajax({
					url: '.',
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
			} else {
				callback();
			}
		}
	});

	return server;
});
