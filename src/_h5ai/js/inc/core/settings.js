
module.define('core/config', [H5AI_CONFIG], function (config) {

	var defaults = {
			rootAbsHref: '/',
			h5aiAbsHref: '/_h5ai/',
		};

	return {
		settings: _.extend({}, defaults, config.options),
		types: _.extend({}, config.types),
		langs: _.extend({}, config.langs)
	};
});


module.define('core/settings', ['core/config'], function (config) {

	return config.settings;
});


module.define('core/types', ['core/config'], function (config) {

	return config.types;
});


module.define('core/langs', ['core/config'], function (config) {

	return config.langs;
});
