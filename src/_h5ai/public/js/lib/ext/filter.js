const {jq, lo} = require('../globals');
const event = require('../core/event');
const location = require('../core/location');
const resource = require('../core/resource');
const allsettings = require('../core/settings');
const util = require('../core/util');
const view = require('../view/view');


const settings = lo.extend({
    enabled: false,
    advanced: false,
    debounceTime: 100,
    ignorecase: true
}, allsettings.filter);
const template =
        `<div id="filter" class="tool">
            <img src="${resource.image('filter')}" alt="filter"/>
            <input class="l10n_ph-filter" type="text" value=""/>
        </div>`;
let inputIsVisible = false;
let prevPattern = '';
let $filter;
let $input;


function filter(pattern) {
    pattern = pattern || '';
    if (pattern === prevPattern) {
        return;
    }
    prevPattern = pattern;

    if (!pattern) {
        view.setLocation();
        return;
    }

    $filter.addClass('pending');

    const re = new RegExp(pattern, settings.ignorecase ? 'i' : '');
    const matchedItems = [];

    lo.each(location.getItem().content, item => {
        if (re.test(item.label)) {
            matchedItems.push(item);
        }
    });

    $filter.removeClass('pending');
    view.setHint('noMatch');
    view.setItems(matchedItems);
}

function update() {
    if (inputIsVisible) {
        $filter.addClass('active');
        $input.focus();
        filter(util.parsePattern($input.val(), settings.advanced));
    } else {
        filter();
        $filter.removeClass('active');
    }
}

function toggle() {
    inputIsVisible = !inputIsVisible;
    update();
}

function reset() {
    inputIsVisible = false;
    $input.val('');
    update();
}

function init() {
    if (!settings.enabled) {
        return;
    }

    $filter = jq(template).appendTo('#toolbar');
    $input = $filter.find('input');

    $filter.on('click', 'img', toggle);
    $input.on('keyup', lo.debounce(update, settings.debounceTime, {trailing: true}));
    event.sub('location.changed', reset);
}


init();
