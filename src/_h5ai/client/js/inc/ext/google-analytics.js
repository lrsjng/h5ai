
modulejs.define('ext/google-analytics-ga', ['_', 'core/settings'], function (_, allsettings) {

	var settings = _.extend({
			enabled: false,
			gaq: []
		}, allsettings['google-analytics-ga']),

		init = function () {

			if (!settings.enabled) {
				return;
			}

			window._gaq = settings.gaq;

			var scriptLiteral = 'script',
				doc = document,
				newScriptTag = doc.createElement(scriptLiteral),
				firstScriptTag = doc.getElementsByTagName(scriptLiteral)[0];

			newScriptTag.async = true;
			newScriptTag.src = ('https:' === location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
			firstScriptTag.parentNode.insertBefore(newScriptTag, firstScriptTag);
		};

	init();
});


modulejs.define('ext/google-analytics-ua', ['_', 'core/settings'], function (_, allsettings) {

	var settings = _.extend({
			enabled: false,
			calls: []
		}, allsettings['google-analytics-ua']),

		init = function () {

			if (!settings.enabled) {
				return;
			}

			var win = window,
				doc = document,
				scriptLiteral = 'script',
				id = 'ga',
				el, firstScriptElement;

			win.GoogleAnalyticsObject = id;
			win[id] = win[id] || function () {
				(win[id].q = win[id].q || []).push(arguments);
			};
			win[id].l = 1 * new Date();

			el = doc.createElement(scriptLiteral);
			el.async = true;
			el.src = '//www.google-analytics.com/analytics.js';

			firstScriptElement = doc.getElementsByTagName(scriptLiteral)[0];
			firstScriptElement.parentNode.insertBefore(el, firstScriptElement);

			_.each(settings.calls, function (call) {
				win[id].apply(win, call);
			});
		};

	init();
});
