
modulejs.define('ext/mode', ['_', '$', 'core/settings', 'core/parser'], function (_, $, allsettings, parser) {

	var defaults = {
			enabled: false,
			display: 0
		},

		settings = _.extend({}, defaults, allsettings.mode),

		init = function () {

			if (!settings.enabled) {
				return;
			}

			var info = '';

			if (parser.mode) {
				info += parser.mode;
			}
			if (settings.display > 0 && parser.server.name) {
				info += (info ? ' on ' : '') + parser.server.name;
			}
			if (settings.display > 1 && parser.server.version) {
				info += (info ? '-' : '') + parser.server.version;
			}

			if (info) {
				$('#h5ai-reference').append(' (' + info + ')');
			}
		};

	init();
});
