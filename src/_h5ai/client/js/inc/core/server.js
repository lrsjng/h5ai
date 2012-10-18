
modulejs.define('core/server', ['$', '_', 'config', 'core/location'], function ($, _, config, location) {

	var server = _.extend({}, config.server, {

		request: function (data, callback) {

			if (server.api) {
				$.ajax({
					url: location.getAbsHref(),
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
