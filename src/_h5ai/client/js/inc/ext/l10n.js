
modulejs.define('ext/l10n', ['_', '$', 'core/settings', 'core/langs', 'core/format', 'core/store', 'core/event', 'core/server'], function (_, $, allsettings, langs, format, store, event, server) {

	var settings = _.extend({
			enabled: false,
			lang: 'en',
			useBrowserLang: true
		}, allsettings.l10n),

		defaultTranslations = {
			isoCode: 'en',
			lang: 'english',
			details: 'details',
			list: "list",
			grid: "grid",
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
			dateFormat: 'YYYY-MM-DD HH:mm',
			filter: 'filter',
			'delete': 'delete'
		},

		template = '<span id="langSelector">' +
						'<span class="l10n-isoCode"/> - <span class="l10n-lang"/>' +
						'<span class="langOptions"><ul/></span>' +
					'</span>',
		langOptionTemplate = '<li class="langOption"/>',

		storekey = 'ext/l10n',

		loaded = {
			en: _.extend({}, defaultTranslations)
		},
		currentLang = loaded.en,

		update = function (lang) {

			if (lang) {
				currentLang = lang;
			}

			$.each(currentLang, function (key, value) {
				$('.l10n-' + key).text(value);
			});
			$('.langOption').removeClass('current');
			$('.langOption.' + currentLang.isoCode).addClass('current');

			format.setDefaultDateFormat(currentLang.dateFormat);

			$('#items .item .date').each(function () {

				var $this = $(this);

				$this.text(format.formatDate($this.data('time')));
			});

			$('#filter input').attr('placeholder', currentLang.filter);
		},

		loadLanguage = function (isoCode, callback) {

			if (loaded[isoCode]) {

				callback(loaded[isoCode]);
			} else {

				server.request({action: 'get', l10n: true, l10nCodes: isoCode}, function (response) {

					var json = response.l10n && response.l10n[isoCode] ? response.l10n[isoCode] : {};
					loaded[isoCode] = _.extend({}, defaultTranslations, json, {isoCode: isoCode});
					callback(loaded[isoCode]);
				});
			}
		},

		localize = function (langs, isoCode, useBrowserLang) {

			var storedIsoCode = store.get(storekey);

			if (langs[storedIsoCode]) {
				isoCode = storedIsoCode;
			} else if (useBrowserLang) {
				var browserLang = navigator.language || navigator.browserLanguage;
				if (browserLang) {
					if (langs[browserLang]) {
						isoCode = browserLang;
					} else if (browserLang.length > 2 && langs[browserLang.substr(0, 2)]) {
						isoCode = browserLang.substr(0, 2);
					}
				}
			}

			if (!langs[isoCode]) {
				isoCode = 'en';
			}

			loadLanguage(isoCode, update);
		},

		initLangSelector = function (langs) {

			var $langSelector = $(template).appendTo('#bottombar .right'),
				$langOptions = $langSelector.find('.langOptions'),
				$ul = $langOptions.find('ul'),
				isoCodes = [];

			$.each(langs, function (isoCode) {
				isoCodes.push(isoCode);
			});
			isoCodes.sort();

			$.each(isoCodes, function (idx, isoCode) {
				$(langOptionTemplate)
					.addClass(isoCode)
					.text(isoCode + ' - ' + (_.isString(langs[isoCode]) ? langs[isoCode] : langs[isoCode].lang))
					.appendTo($ul)
					.click(function () {
						store.put(storekey, isoCode);
						localize(langs, isoCode, false);
					});
			});
			$langOptions
				.append($ul)
				.scrollpanel();

			$langSelector.hover(
				function () {
					$langOptions
						.css('top', '-' + $langOptions.outerHeight() + 'px')
						.stop(true, true)
						.fadeIn();

					// needs to be updated twice for initial fade in rendering :/
					$langOptions.scrollpanel('update').scrollpanel('update');
				},
				function () {
					$langOptions
						.stop(true, true)
						.fadeOut();
				}
			);
		},

		init = function () {

			if (settings.enabled) {
				initLangSelector(langs);
			}

			event.sub('location.changed', function () {

				localize(langs, settings.lang, settings.useBrowserLang);
			});
		};

	init();
});
