
modulejs.define('ext/mode', ['_', '$', 'core/settings', 'core/server'], function (_, $, allsettings, server) {

	var settings = _.extend({
			enabled: false,
			display: 0
		}, allsettings.mode),

		init = function () {

			if (!settings.enabled) {
				return;
			}

			var info = '';

			if (server.backend) {
				info += server.backend;
			}
			if (settings.display > 0 && server.name) {
				info += (info ? ' on ' : '') + server.name;
			}
			if (settings.display > 1 && server.version) {
				info += (info ? '-' : '') + server.version;
			}

			if (info) {
				$('#bottombar .left').append('<span id="server-mode"> (' + info + ') </span>');
			}
		};

	init();
});
