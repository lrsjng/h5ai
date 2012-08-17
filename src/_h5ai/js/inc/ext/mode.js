
modulejs.define('ext/mode', ['_', '$', 'core/mode', 'core/settings'], function (_, $, mode, allsettings) {

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

			if (mode.id) {
				info += mode.id;
			}
			if (settings.display > 0 && mode.serverName) {
				info += (info ? ' on ' : '') + mode.serverName;
			}
			if (settings.display > 1 && mode.serverVersion) {
				info += (info ? '-' : '') + mode.serverVersion;
			}

			if (info) {
				$('#h5ai-reference').append(' (' + info + ')');
			}
		};

	init();
});
