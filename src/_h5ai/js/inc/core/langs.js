
modulejs.define('core/langs', ['config', '_'], function (config, _) {

	var langs = {};

	_.each(_.extend({}, config.langs), function (trans, lang) {

		langs[lang] = trans;
	});

	return langs;
});
