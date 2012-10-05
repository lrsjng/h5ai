
modulejs.define('core/settings', ['config', '_'], function (config, _) {

	var settings = _.extend({
			h5aiAbsHref: '/_h5ai/'
		}, config.options);

	settings.h5aiAbsHref = settings.h5aiAbsHref.replace(/\/*$/, '/');
	settings.rootAbsHref = /^(.*\/)[^\/]+\/?$/.exec(settings.h5aiAbsHref)[1];

	return settings;
});
