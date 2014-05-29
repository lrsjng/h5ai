
modulejs.define('core/settings', ['config', '_'], function (config, _) {

	return _.extend({}, config.options, {
		appUrl: config.setup.APP_URL,
		rootUrl: config.setup.ROOT_URL
	});
});
