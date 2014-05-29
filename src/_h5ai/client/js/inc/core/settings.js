
modulejs.define('core/settings', ['config', '_'], function (config, _) {

	return _.extend({}, config.options, {
		appHref: config.setup.APP_URL,
		rootHref: config.setup.ROOT_URL
	});
});
