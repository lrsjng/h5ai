
modulejs.define('core/settings', ['config', '_', '$'], function (config, _, $) {

	var settings = _.extend({
			h5aiAbsHref: '/_h5ai/'
		}, config.options),

		filename = 'client/js/scripts.js',
		src = $('script[src$="' + filename + '"]').attr('src'),
		appHref = src.substr(0, src.length - filename.length);

	settings.h5aiAbsHref = src.substr(0, src.length - filename.length).replace(/\/*$/, '/');
	settings.rootAbsHref = /^(.*\/)[^\/]+\/?$/.exec(settings.h5aiAbsHref)[1];

	return settings;
});
