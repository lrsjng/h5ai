
modulejs.define('core/server', ['$', '_', 'config', 'core/location'], function ($, _, config, location) {

	var server = {

			backend: config.setup.BACKEND,
			api: config.setup.API === true,
			name: config.setup.SERVER_NAME,
			version: config.setup.SERVER_VERSION,

			request: function (data, callback) {

				if (server.api) {
					$.ajax({
							url: location.getAbsHref(),
							data: data,
							type: 'POST',
							dataType: 'json'
						})
						.done(function (json) {

							callback(json);
						})
						.fail(function () {

							callback();
						});
				} else {
					callback();
				}
			},

			formRequest: function (data) {

				if (server.api) {
					var $form = $('<form method="post" style="display:none;"/>')
									.attr('action', location.getAbsHref());

					_.each(data, function (val, key) {

						$('<input type="hidden"/>')
							.attr('name', key)
							.attr('value', val)
							.appendTo($form);
					});

					$form.appendTo('body').submit().remove();
				}
			}
		};

	return server;
});
