
modulejs.define('core/langs', ['config', '_'], function (config, _) {

	var defaults = {
			lang: 'unknown',
			details: 'details',
			icons: 'icons',
			name: 'Name',
			lastModified: 'Last modified',
			size: 'Size',
			parentDirectory: 'Parent Directory',
			empty: 'empty',
			folders: 'folders',
			files: 'files',
			download: 'download',
			noMatch: 'no match',
			dateFormat: 'YYYY-MM-DD HH:mm'
		},

		translations = {},

		parse = function (langs) {

			_.each(langs, function (trans, lang) {

				translations[lang] = _.extend({}, defaults, trans);
			});
		};

	parse(_.extend({}, config.langs));

	return translations;
});
