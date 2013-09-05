
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
		},

		formRequest: function (data) {

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
	});

	return server;
});
