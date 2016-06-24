const {map, debounce} = require('../lo');
const {jq} = require('../globals');
const server = require('../server');
const event = require('../core/event');
const location = require('../core/location');
const resource = require('../core/resource');
const allsettings = require('../core/settings');
const util = require('../core/util');
const Item = require('../model/item');
const view = require('../view/view');


const settings = Object.assign({
    enabled: false,
    advanced: false,
    debounceTime: 300,
    ignorecase: true
}, allsettings.search);
const template =
        `<div id="search" class="tool">
            <img src="${resource.image('search')}" alt="search"/>
            <input class="l10n_ph-search" type="text" value=""/>
        </div>`;
let inputIsVisible = false;
let prevPattern = '';
let $search;
let $input;


function search(pattern) {
    pattern = pattern || '';
    if (pattern === prevPattern) {
        return;
    }
    prevPattern = pattern;

    if (!pattern) {
        view.setLocation();
        return;
    }

    $search.addClass('pending');

    server.request({
        action: 'get',
        search: {
            href: location.getAbsHref(),
            pattern,
            ignorecase: settings.ignorecase
        }
    }).then(response => {
        $search.removeClass('pending');
        view.setHint('noMatch');
        view.setItems(map(response.search, item => Item.get(item)));
    });
}

function update() {
    if (inputIsVisible) {
        $search.addClass('active');
        $input.focus();
        search(util.parsePattern($input.val(), settings.advanced));
    } else {
        search();
        $search.removeClass('active');
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

    $search = jq(template).appendTo('#toolbar');
    $input = $search.find('input');

    $search.on('click', 'img', toggle);
    $input.on('keyup', debounce(update, settings.debounceTime, {trailing: true}));
    event.sub('location.changed', reset);
}


init();
