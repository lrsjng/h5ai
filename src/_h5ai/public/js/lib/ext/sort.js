const {jq} = require('../globals');
const event = require('../core/event');
const resource = require('../core/resource');
const allsettings = require('../core/settings');
const store = require('../core/store');
const util = require('../core/util');

const settings = Object.assign({
    enabled: false,
    column: 0,
    reverse: false,
    ignorecase: true,
    natural: false,
    folders: 0
}, allsettings.sort);
const storekey = 'ext/sort';
const template = '<img src="' + resource.image('sort') + '" class="sort" alt="sort order" />';


function getType(item) {
    const $item = jq(item);

    if ($item.hasClass('folder-parent')) {
        return 0;
    }
    if ($item.hasClass('folder')) {
        if (settings.folders === 1) {
            return 2;
        } else if (settings.folders === 2) {
            return 3;
        }
        return 1;
    }
    return 2;
}

function getName(item) {
    return jq(item).find('.label').text();
}

function getTime(item) {
    return jq(item).find('.date').data('time');
}

function getSize(item) {
    return jq(item).find('.size').data('bytes');
}


const columnGetters = {
    0: getName,
    1: getTime,
    2: getSize
};
const columnClasses = {
    0: 'label',
    1: 'date',
    2: 'size'
};


function cmpFn(getValue, reverse, ignorecase, natural) {
    return (item1, item2) => {
        let res;
        let val1;
        let val2;

        res = getType(item1) - getType(item2);
        if (res !== 0) {
            return res;
        }

        val1 = getValue(item1);
        val2 = getValue(item2);

        if (isNaN(val1) || isNaN(val2)) {
            val1 = String(val1);
            val2 = String(val2);

            if (ignorecase) {
                val1 = val1.toLowerCase();
                val2 = val2.toLowerCase();
            }
        }

        res = natural ? util.naturalCmpFn(val1, val2) : util.regularCmpFn(val1, val2);
        return reverse ? -res : res;
    };
}

function sortItems(column, reverse) {
    const $headers = jq('#items li.header a');
    const $header = jq('#items li.header a.' + columnClasses[column]);
    const fn = cmpFn(columnGetters[column], reverse, settings.ignorecase, column === 0 && settings.natural);
    const $current = jq('#items .item');
    const $sorted = jq('#items .item').sort(fn);

    store.put(storekey, {column, reverse});

    $headers.removeClass('ascending descending');
    $header.addClass(reverse ? 'descending' : 'ascending');

    for (let i = 0, l = $current.length; i < l; i += 1) {
        if ($current[i] !== $sorted[i]) {
            $sorted.detach().sort(fn).appendTo('#items');
            break;
        }
    }
}

function onContentChanged() {
    const order = store.get(storekey);
    const column = order && order.column || settings.column;
    const reverse = order && order.reverse || settings.reverse;

    sortItems(column, reverse);
}

function init() {
    if (!settings.enabled) {
        return;
    }

    const $header = jq('#items li.header');

    $header.find('a.label')
        .append(template)
        .click(ev => {
            sortItems(0, jq(ev.currentTarget).hasClass('ascending'));
            ev.preventDefault();
        });

    $header.find('a.date')
        .prepend(template)
        .click(ev => {
            sortItems(1, jq(ev.currentTarget).hasClass('ascending'));
            ev.preventDefault();
        });

    $header.find('a.size')
        .prepend(template)
        .click(ev => {
            sortItems(2, jq(ev.currentTarget).hasClass('ascending'));
            ev.preventDefault();
        });

    event.sub('view.changed', onContentChanged);
}


init();
