const {filter, debounce, parsePattern, dom} = require('../util');
const event = require('../core/event');
const location = require('../core/location');
const resource = require('../core/resource');
const allsettings = require('../core/settings');
const view = require('../view/view');


const settings = Object.assign({
    enabled: false,
    advanced: false,
    debounceTime: 100,
    ignorecase: true
}, allsettings.filter);
const tpl =
        `<div id="filter" class="tool">
            <img src="${resource.image('filter')}" alt="filter"/>
            <input class="l10n_ph-filter" type="text" value=""/>
        </div>`;
let inputIsVisible = false;
let prevPattern = '';
let $filter;
let $input;


const filterItems = (pattern = '') => {
    if (pattern === prevPattern) {
        return;
    }
    prevPattern = pattern;

    if (!pattern) {
        view.setLocation();
        return;
    }

    $filter.addCls('pending');

    const re = new RegExp(pattern, settings.ignorecase ? 'i' : '');
    const items = filter(location.getItem().content, item => re.test(item.label));

    $filter.rmCls('pending');
    view.setHint('noMatch');
    view.setItems(items);
};

const update = () => {
    if (inputIsVisible) {
        $filter.addCls('active');
        $input[0].focus();
        filterItems(parsePattern($input.val(), settings.advanced));
    } else {
        filterItems();
        $filter.rmCls('active');
    }
};

const toggle = () => {
    inputIsVisible = !inputIsVisible;
    update();
};

const reset = () => {
    inputIsVisible = false;
    $input.val('');
    update();
};

const init = () => {
    if (!settings.enabled) {
        return;
    }

    $filter = dom(tpl).appTo('#toolbar');
    $input = $filter.find('input');

    $filter.find('img').on('click', toggle);
    $input.on('keyup', debounce(update, settings.debounceTime));
    event.sub('location.changed', reset);
};


init();
