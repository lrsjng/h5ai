modulejs.define('ext/sort', ['_', '$', 'core/settings', 'core/resource', 'core/event', 'core/store', 'core/util'], function (_, $, allsettings, resource, event, store, util) {

    var settings = _.extend({
            enabled: false,
            column: 0,
            reverse: false,
            ignorecase: true,
            natural: false,
            folders: 0
        }, allsettings.sort);
    var storekey = 'ext/sort';
    var template = '<img src="' + resource.image('sort') + '" class="sort" alt="sort order" />';


    function getType(item) {

        var $item = $(item);

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

        return $(item).find('.label').text();
    }

    function getTime(item) {

        return $(item).find('.date').data('time');
    }

    function getSize(item) {

        return $(item).find('.size').data('bytes');
    }


    var columnGetters = {
            0: getName,
            1: getTime,
            2: getSize
        };
    var columnClasses = {
            0: 'label',
            1: 'date',
            2: 'size'
        };


    function cmpFn(getValue, reverse, ignorecase, natural) {

        return function (item1, item2) {

            var res;
            var val1;
            var val2;

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

        var $headers = $('#items li.header a');
        var $header = $('#items li.header a.' + columnClasses[column]);
        var fn = cmpFn(columnGetters[column], reverse, settings.ignorecase, column === 0 && settings.natural);
        var $current = $('#items .item');
        var $sorted = $('#items .item').sort(fn);

        store.put(storekey, {column: column, reverse: reverse});

        $headers.removeClass('ascending descending');
        $header.addClass(reverse ? 'descending' : 'ascending');

        for (var i = 0, l = $current.length; i < l; i += 1) {
            if ($current[i] !== $sorted[i]) {
                $sorted.detach().sort(fn).appendTo('#items');
                break;
            }
        }
    }

    function onContentChanged() {

        var order = store.get(storekey);
        var column = order && order.column || settings.column;
        var reverse = order && order.reverse || settings.reverse;

        sortItems(column, reverse);
    }

    function init() {

        if (!settings.enabled) {
            return;
        }

        $('#items li.header')

            .find('a.label')
                .append(template)
                .click(function (ev) {
                    sortItems(0, $(this).hasClass('ascending'));
                    ev.preventDefault();
                })
            .end()

            .find('a.date')
                .prepend(template)
                .click(function (ev) {
                    sortItems(1, $(this).hasClass('ascending'));
                    ev.preventDefault();
                })
            .end()

            .find('a.size')
                .prepend(template)
                .click(function (ev) {
                    sortItems(2, $(this).hasClass('ascending'));
                    ev.preventDefault();
                })
            .end();

        event.sub('location.changed', onContentChanged);
        event.sub('location.refreshed', onContentChanged);
    }


    init();
});
