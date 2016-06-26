const {each, toArray, dom, regularCmp, naturalCmp} = require('../util');
const event = require('../core/event');
const resource = require('../core/resource');
const allsettings = require('../core/settings');
const store = require('../core/store');

const settings = Object.assign({
    enabled: false,
    column: 0,
    reverse: false,
    ignorecase: true,
    natural: false,
    folders: 0
}, allsettings.sort);
const storekey = 'ext/sort';
const template = '<img src="' + resource.image('sort') + '" class="sort" alt="sort order"/>';


const getType = item => {
    const $item = dom(item);

    if ($item.hasCls('folder-parent')) {
        return 0;
    }
    if ($item.hasCls('folder')) {
        if (settings.folders === 1) {
            return 2;
        } else if (settings.folders === 2) {
            return 3;
        }
        return 1;
    }
    return 2;
};

const columnGetters = {
    0: el => el._item.label,
    1: el => el._item.time,
    2: el => el._item.size
};
const columnClasses = {
    0: 'label',
    1: 'date',
    2: 'size'
};


const cmpFn = (getValue, reverse, ignorecase, natural) => {
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

        res = natural ? naturalCmp(val1, val2) : regularCmp(val1, val2);
        return reverse ? -res : res;
    };
};

const sortItems = (column, reverse) => {
    const $headers = dom('#items li.header a');
    const $header = dom('#items li.header a.' + columnClasses[column]);
    const fn = cmpFn(columnGetters[column], reverse, settings.ignorecase, column === 0 && settings.natural);

    store.put(storekey, {column, reverse});

    $headers.rmCls('ascending').rmCls('descending');
    $header.addCls(reverse ? 'descending' : 'ascending');

    dom(toArray(dom('#items .item')).sort(fn)).appTo('#items');
};

const onContentChanged = () => {
    const order = store.get(storekey);
    const column = order && order.column || settings.column;
    const reverse = order && order.reverse || settings.reverse;

    sortItems(column, reverse);
};

const addToggles = () => {
    const $header = dom('#items li.header');

    each(columnClasses, (cls, idx) => {
        const pos = idx === '0' ? 'app' : 'pre';
        $header
        .find('a.' + cls)[pos](template)
        .on('click', ev => {
            sortItems(idx, dom(ev.currentTarget).hasCls('ascending'));
            ev.preventDefault();
        });
    });
};

const init = () => {
    if (!settings.enabled) {
        return;
    }

    addToggles();
    event.sub('view.changed', onContentChanged);
};


init();
