
modulejs.define('core/types', ['config', '_'], function (config, _) {

	var reEndsWithSlash = /\/$/,
		regexps = {},

		escapeRegExp = function (sequence) {

			return sequence.replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$]/g, "\\$&");
			// return sequence.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
		},

		parse = function (types) {

			_.each(types, function (patterns, type) {

				var pattern = '^(' + _.map(patterns, function (p) { return '(' + escapeRegExp(p).replace(/\*/g, '.*') + ')'; }).join('|') + ')$';
				regexps[type] = new RegExp(pattern, 'i');
			});
		},

		getType = function (sequence) {

			if (reEndsWithSlash.test(sequence)) {
				return 'folder';
			}

			var slashidx = sequence.lastIndexOf('/'),
				name = slashidx >= 0 ? sequence.substr(slashidx + 1) : sequence;

			for (var type in regexps) {
				if (regexps.hasOwnProperty(type)) {
					if (regexps[type].test(name)) {
						return type;
					}
				}
			}

			return 'file';
		};

	parse(_.extend({}, config.types));

	return {
		getType: getType
	};
});
