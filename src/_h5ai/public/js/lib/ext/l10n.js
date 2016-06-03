const {win, jq, lo} = require('../globals');
const event = require('../core/event');
const format = require('../core/format');
const langs = require('../core/langs');
const server = require('../core/server');
const allsettings = require('../core/settings');
const store = require('../core/store');

const settings = lo.extend({
    enabled: false,
    lang: 'en',
    useBrowserLang: true
}, allsettings.l10n);
const defaultTranslations = {
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
const blockTemplate =
        `<div class="block">
            <h1 class="l10n-language">Language</h1>
            <div class="select">
                <select id="langs"/>
            </div>
        </div>`;
const optionTemplate = '<option/>';
const storekey = 'ext/l10n';
const loaded = {
    en: lo.extend({}, defaultTranslations)
};
let currentLang = loaded.en;


function update(lang) {
    if (lang) {
        currentLang = lang;
    }

    jq('#langs option')
        .removeAttr('selected').removeProp('selected')
        .filter('.' + currentLang.isoCode)
        .attr('selected', 'selected').prop('selected', 'selected');

    jq.each(currentLang, (key, value) => {
        jq('.l10n-' + key).text(value);
        jq('.l10n_ph-' + key).attr('placeholder', value);
    });
    format.setDefaultDateFormat(currentLang.dateFormat);

    jq('#items .item .date').each((idx, el) => {
        const $el = jq(el);
        $el.text(format.formatDate($el.data('time')));
    });
}

function loadLanguage(isoCode, callback) {
    if (loaded[isoCode]) {
        callback(loaded[isoCode]);
    } else {
        server.request({action: 'get', l10n: [isoCode]}).then(response => {
            const json = response.l10n && response.l10n[isoCode] ? response.l10n[isoCode] : {};
            loaded[isoCode] = lo.extend({}, defaultTranslations, json, {isoCode});
            callback(loaded[isoCode]);
        });
    }
}

function localize(languages, isoCode, useBrowserLang) {
    const storedIsoCode = store.get(storekey);

    if (languages[storedIsoCode]) {
        isoCode = storedIsoCode;
    } else if (useBrowserLang) {
        const browserLang = win.navigator.language || win.navigator.browserLanguage;
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
    const isoCodes = lo.keys(languages).sort();
    const $block = jq(blockTemplate);
    const $select = $block.find('select')
        .on('change', ev => {
            const isoCode = ev.target.value;
            store.put(storekey, isoCode);
            localize(languages, isoCode, false);
        });

    jq.each(isoCodes, (idx, isoCode) => {
        jq(optionTemplate)
            .attr('value', isoCode)
            .addClass(isoCode)
            .text(isoCode + ' - ' + (lo.isString(languages[isoCode]) ? languages[isoCode] : languages[isoCode].lang))
            .appendTo($select);
    });

    $block.appendTo('#sidebar');
}

function init() {
    if (settings.enabled) {
        initLangSelector(langs);
    }

    event.sub('view.changed', () => {
        localize(langs, settings.lang, settings.useBrowserLang);
    });
}


init();
