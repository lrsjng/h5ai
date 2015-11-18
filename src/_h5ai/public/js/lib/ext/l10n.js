modulejs.define('ext/l10n', ['_', '$', 'core/event', 'core/format', 'core/langs', 'core/server', 'core/settings', 'core/store'],
function (_, $, event, format, langs, server, allsettings, store) {
    var settings = _.extend({
        enabled: false,
        lang: 'en',
        useBrowserLang: true
    }, allsettings.l10n);
    var defaultTranslations = {
        isoCode: 'en',
        lang: 'english',

        dateFormat: 'YYYY-MM-DD HH:mm',
        details: 'details',
        download: 'download',
        empty: 'empty',
        files: 'files',
        filter: 'filter',
        folders: 'folders',
        grid: 'grid',
        icons: 'icons',
        language: 'Language',
        lastModified: 'Last modified',
        name: 'Name',
        noMatch: 'no match',
        parentDirectory: 'Parent Directory',
        search: 'search',
        size: 'Size',
        tree: 'Tree',
        view: 'View'
    };
    var blockTemplate = '<div class="block"><h1 class="l10n-language">Language</h1><div class="select"><select id="langs"/></div></div>';
    var optionTemplate = '<option/>';
    var storekey = 'ext/l10n';
    var loaded = {
        en: _.extend({}, defaultTranslations)
    };
    var currentLang = loaded.en;


    function update(lang) {
        if (lang) {
            currentLang = lang;
        }

        $('#langs option')
            .removeAttr('selected').removeProp('selected')
            .filter('.' + currentLang.isoCode)
            .attr('selected', 'selected').prop('selected', 'selected');

        $.each(currentLang, function (key, value) {
            $('.l10n-' + key).text(value);
            $('.l10n_ph-' + key).attr('placeholder', value);
        });
        format.setDefaultDateFormat(currentLang.dateFormat);

        $('#items .item .date').each(function () {
            var $this = $(this);

            $this.text(format.formatDate($this.data('time')));
        });
    }

    function loadLanguage(isoCode, callback) {
        if (loaded[isoCode]) {
            callback(loaded[isoCode]);
        } else {
            server.request({action: 'get', l10n: [isoCode]}, function (response) {
                var json = response.l10n && response.l10n[isoCode] ? response.l10n[isoCode] : {};
                loaded[isoCode] = _.extend({}, defaultTranslations, json, {isoCode: isoCode});
                callback(loaded[isoCode]);
            });
        }
    }

    function localize(languages, isoCode, useBrowserLang) {
        var storedIsoCode = store.get(storekey);

        if (languages[storedIsoCode]) {
            isoCode = storedIsoCode;
        } else if (useBrowserLang) {
            var browserLang = navigator.language || navigator.browserLanguage;
            if (browserLang) {
                if (languages[browserLang]) {
                    isoCode = browserLang;
                } else if (browserLang.length > 2 && languages[browserLang.substr(0, 2)]) {
                    isoCode = browserLang.substr(0, 2);
                }
            }
        }

        if (!languages[isoCode]) {
            isoCode = 'en';
        }

        loadLanguage(isoCode, update);
    }

    function initLangSelector(languages) {
        var isoCodes = _.keys(languages).sort();
        var $block = $(blockTemplate);
        var $select = $block.find('select')
            .on('change', function (ev) {
                var isoCode = ev.target.value;
                store.put(storekey, isoCode);
                localize(languages, isoCode, false);
            });

        $.each(isoCodes, function (idx, isoCode) {
            $(optionTemplate)
                .attr('value', isoCode)
                .addClass(isoCode)
                .text(isoCode + ' - ' + (_.isString(languages[isoCode]) ? languages[isoCode] : languages[isoCode].lang))
                .appendTo($select);
        });

        $block.appendTo('#sidebar');
    }

    function init() {
        if (settings.enabled) {
            initLangSelector(langs);
        }

        event.sub('view.changed', function () {
            localize(langs, settings.lang, settings.useBrowserLang);
        });
    }


    init();
});
