
modulejs.define('core/settings', ['H5AI_CONFIG'], function (config) {

	var defaults = {
			rootAbsHref: '/',
			h5aiAbsHref: '/_h5ai/',
			server: 'unknown',
			mode: 'unknown'
		};

	return _.extend({}, defaults, config.options);
});


modulejs.define('core/types', ['H5AI_CONFIG'], function (config) {

	var reEndsWithSlash = /\/$/,
		reStartsWithDot = /^\./,

		fileExts = {},
		fileNames = {},

		parse = function (types) {

			_.each(types, function (matches, type) {

				_.each(matches, function (match) {

					match = match.toLowerCase();

					if (reStartsWithDot.test(match)) {
						fileExts[match] = type;
					} else {
						fileNames[match] = type;
					}
				});
			});
		},

		getType = function (sequence) {

			if (reEndsWithSlash.test(sequence)) {
				return 'folder';
			}

			sequence = sequence.toLowerCase();

			var slashidx = sequence.lastIndexOf('/'),
				name = slashidx >= 0 ? sequence.substr(slashidx + 1) : sequence,
				dotidx = sequence.lastIndexOf('.'),
				ext = dotidx >= 0 ? sequence.substr(dotidx) : sequence;

			return fileNames[name] || fileExts[ext] || 'unknown';
		};

	parse(_.extend({}, config.types));

	return {
		getType: getType
	};
});


modulejs.define('core/langs', ['H5AI_CONFIG'], function (config) {

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
