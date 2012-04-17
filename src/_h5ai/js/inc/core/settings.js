
module.define('core/settings', [H5AI_CONFIG], function (config) {

	var defaults = {
			rootAbsHref: '/',
			h5aiAbsHref: '/_h5ai/',
		};

	return _.extend({}, defaults, config.options);
});


module.define('core/types', [H5AI_CONFIG], function (config) {

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
				})
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


module.define('core/langs', [H5AI_CONFIG], function (config) {

	return _.extend({}, config.langs);
});
