
modulejs.define('core/resource', ['_', '$', 'config', 'core/settings'], function (_, $, config, settings) {

	var win = window,
		appHref = settings.appHref,
		imagesHref = appHref + 'client/images/',
		fallbackHref = appHref + 'client/images/fallback/',
		themesHref = appHref + 'client/themes/',
		scriptsHref = appHref + 'client/js/',
		fallbacks = ['file', 'folder', 'folder-page', 'folder-parent', 'ar', 'aud', 'bin', 'img', 'txt', 'vid'],

		image = function (id) {

			return imagesHref + id + '.svg';
		},

		icon = function (id) {

			var baseId = id.split('-')[0],
				href = config.theme[id] || config.theme[baseId];

			if (href) {
				return themesHref + href;
			}

			if (_.indexOf(fallbacks, id) >= 0) {
				return fallbackHref + id + '.svg';
			}

			if (_.indexOf(fallbacks, baseId) >= 0) {
				return fallbackHref + baseId + '.svg';
			}

			return fallbackHref + 'file.svg';
		},

		loadScript = function (filename, callback) {

			$.ajax({
					url: scriptsHref + filename,
					dataType: 'script'
				}).done(function () {

					callback();
				});
		},

		loadScriptGlob = function (filename, globalId, callback) {

			if (win[globalId]) {
				callback(win[globalId]);
			} else {
				loadScript(filename, function () { callback(win[globalId]); });
			}
		},

		ensureSH = function (callback) {

			loadScriptGlob('syntaxhighlighter.js', 'SyntaxHighlighter', callback);
		};


	return {
		image: image,
		icon: icon,
		ensureSH: ensureSH
	};
});
