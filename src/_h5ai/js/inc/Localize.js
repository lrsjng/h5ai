
(function ($, h5ai) {

	var settings = h5ai.settings,
		currentDateFormat = settings.dateFormat,
		formatDates = function (dateFormat) {

			if (dateFormat) {
				currentDateFormat = dateFormat;
			}

			$('#extended .entry .date').each(function () {

				var $this = $(this),
					time = $this.data('time'),
					formattedDate = time ? new Date(time).toString(currentDateFormat) : '';

				$this.text(formattedDate);
			});
		},
		localize = function (langs, lang, useBrowserLang) {

			var storedLang = amplify.store(settings.store.lang),
				browserLang, selected, key;

			if (langs[storedLang]) {
				lang = storedLang;
			} else if (useBrowserLang) {
				browserLang = navigator.language || navigator.browserLanguage;
				if (browserLang) {
					if (langs[browserLang]) {
						lang = browserLang;
					} else if (browserLang.length > 2 && langs[browserLang.substr(0, 2)]) {
						lang = browserLang.substr(0, 2);
					}
				}
			}

			if (!langs[lang]) {
				lang = 'en';
			}

			selected = langs[lang];
			if (selected) {
				$.each(selected, function (key, value) {
					$('.l10n-' + key).text(value);
				});
				$('.lang').text(lang);
				$('.langOption').removeClass('current');
				$('.langOption.' + lang).addClass('current');
				h5ai.core.hash({lang: lang});
			}

			formatDates(selected.dateFormat || settings.dateFormat);
		},
		initLangSelector = function (langs) {

			var $langOptions = $('#langSelector .langOptions'),
				sortedLangsKeys = [],
				$ul;

			$.each(langs, function (lang) {
				sortedLangsKeys.push(lang);
			});
			sortedLangsKeys.sort();

			$ul = $('<ul />');
			$.each(sortedLangsKeys, function (idx, lang) {
				$('<li class="langOption" />')
					.addClass(lang)
					.text(lang + ' - ' + langs[lang].lang)
					.appendTo($ul)
					.click(function () {
						amplify.store(settings.store.lang, lang);
						localize(langs, lang, false);
					});
			});
			$langOptions
				.append($ul)
				.scrollpanel();

			$('#langSelector').hover(
				function () {
					$langOptions
						.css('top', '-' + $langOptions.outerHeight() + 'px')
						.stop(true, true)
						.fadeIn();
					$langOptions.get(0).updateScrollbar();
				},
				function () {
					$langOptions
						.stop(true, true)
						.fadeOut();
				}
			);
		},
		init = function () {

			initLangSelector(h5ai.config.langs);
			localize(h5ai.config.langs, settings.lang, settings.useBrowserLang);
		};

	h5ai.localize = {
		init: init
	};

}(jQuery, h5ai));
