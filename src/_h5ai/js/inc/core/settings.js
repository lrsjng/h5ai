
modulejs.define('core/settings', ['config', '_'], function (config, _) {

	var defaults = {
			rootAbsHref: '/',
			h5aiAbsHref: '/_h5ai/',
			server: 'unknown',
			mode: 'unknown'
		};

	return _.extend({}, defaults, config.options);
});
