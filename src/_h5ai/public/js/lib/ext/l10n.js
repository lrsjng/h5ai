const {each, isStr, dom} = require('../util');
const server = require('../server');
const event = require('../core/event');
const format = require('../core/format');
const langs = require('../core/langs');
const allsettings = require('../core/settings');
const store = require('../core/store');

const win = global.window;
const settings = Object.assign({
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
const blockTpl =
        `<div class="block">
            <h1 class="l10n-language">Language</h1>
            <div class="select">
                <select id="langs"/>
            </div>
        </div>`;
const optionTpl = '<option/>';
const storekey = 'ext/l10n';
const loaded = {
    en: Object.assign({}, defaultTranslations)
};
let currentLang = loaded.en;


const update = lang => {
    if (lang) {
        currentLang = lang;
    }

    const sel = 'selected';
    dom('#langs option').rmAttr(sel).rmProp(sel);
    dom('#langs .' + currentLang.isoCode).attr(sel, '').prop(sel, true);

    each(currentLang, (value, key) => {
        dom('.l10n-' + key).text(value);
        dom('.l10n_ph-' + key).attr('placeholder', value);
    });
    format.setDefaultDateFormat(currentLang.dateFormat);

    dom('#items .item').each(el => {
        dom(el).find('.date').text(format.formatDate(el._item.time));
    });
};

const loadLanguage = isoCode => {
    if (loaded[isoCode]) {
        return Promise.resolve(loaded[isoCode]);
    }

    return server.request({action: 'get', l10n: [isoCode]}).then(response => {
        loaded[isoCode] = Object.assign({},
            defaultTranslations,
            response.l10n && response.l10n[isoCode],
            {isoCode}
        );
        return loaded[isoCode];
    });
};

const localize = (languages, isoCode, useBrowserLang) => {
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

    loadLanguage(isoCode).then(update);
};

const initLangSelector = languages => {
    const $block = dom(blockTpl);
    const $select = $block.find('select')
        .on('change', ev => {
            const isoCode = ev.target.value;
            store.put(storekey, isoCode);
            localize(languages, isoCode, false);
        });

    each(languages, (language, isoCode) => {
        dom(optionTpl)
            .attr('value', isoCode)
            .addCls(isoCode)
            .text(isoCode + ' - ' + (isStr(language) ? language : language.lang))
            .appTo($select);
    });

    $block.appTo('#sidebar');
};

const init = () => {
    if (settings.enabled) {
        initLangSelector(langs);
    }

    event.sub('view.changed', () => {
        localize(langs, settings.lang, settings.useBrowserLang);
    });
};


init();
