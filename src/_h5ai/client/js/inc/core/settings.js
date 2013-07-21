
modulejs.define('core/settings', ['config', '_', '$'], function (config, _, $) {

	var filename = 'client/js/scripts.js',
		src = $('script[src$="' + filename + '"]').attr('src'),
		appHref = src.substr(0, src.length - filename.length),

		h5aiAbsHref = src.substr(0, src.length - filename.length).replace(/\/*$/, '/'),
		rootAbsHref = /^(.*\/)[^\/]+\/?$/.exec(h5aiAbsHref)[1],

		settings = _.extend({}, config.options, {
			h5aiAbsHref: h5aiAbsHref,
			rootAbsHref: rootAbsHref
		});

	return settings;
});
