
modulejs.define('ext/google-analytics', ['_', 'core/settings'], function (_, allsettings) {

	var defaults = {
			enabled: false,
			gaq: []
		},

		settings = _.extend({}, defaults, allsettings['google-analytics']),

		init = function () {

			if (!settings.enabled) {
				return;
			}

			window._gaq = settings.gaq;

			var strScript = 'script',
				doc = document,
				newScriptTag = doc.createElement(strScript),
				firstScriptTag = doc.getElementsByTagName(strScript)[0];

			newScriptTag.async = true;
			newScriptTag.src = ('https:' === location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
			firstScriptTag.parentNode.insertBefore(newScriptTag, firstScriptTag);
		};

	init();
});
