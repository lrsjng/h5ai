modulejs.define('view/view', ['_', '$', 'core/event', 'core/format', 'core/location', 'core/resource', 'core/settings', 'core/store', 'view/content'], function (_, $, event, format, location, resource, allsettings, store, content) {
    var modes = ['details', 'grid', 'icons'];
    var sizes = [20, 40, 60, 80, 100, 150, 200, 250, 300, 350, 400];
    var settings = _.extend({
        binaryPrefix: false,
        hideFolders: false,
        hideParentFolder: false,
        modes: modes,
        setParentFolderLabels: false,
        sizes: sizes
    }, allsettings.view);
    var sortedSizes = settings.sizes.sort(function (a, b) { return a - b; });
    var checkedModes = _.intersection(settings.modes, modes);
    var storekey = 'view';
    var tplView =
            '<div id="view">' +
                '<ul id="items" class="clearfix">' +
                    '<li class="header">' +
                        '<a class="icon"/>' +
                        '<a class="label" href="#"><span class="l10n-name"/></a>' +
                        '<a class="date" href="#"><span class="l10n-lastModified"/></a>' +
                        '<a class="size" href="#"><span class="l10n-size"/></a>' +
                    '</li>' +
                '</ul>' +
                '<div id="view-hint"/>' +
            '</div>';
    var tplItem =
            '<li class="item">' +
                '<a>' +
                    '<span class="icon square"><img/></span>' +
                    '<span class="icon landscape"><img/></span>' +
                    '<span class="label"/>' +
                    '<span class="date"/>' +
                    '<span class="size"/>' +
                '</a>' +
            '</li>';
    var $view = $(tplView);
    var $items = $view.find('#items');
    var $hint = $view.find('#view-hint');


    function cropSize(size, min, max) {
        return Math.min(max, Math.max(min, size));
    }

    function createStyles(size) {
        var dsize = cropSize(size, 20, 80);
        var gsize = cropSize(size, 40, 160);
        var isize = cropSize(size, 80, 1000);
        var ilsize = Math.round(isize * 4 / 3);
        var rules = [
            '#view.view-details.view-size-' + size + ' .item .label { line-height: ' + (dsize + 14) + 'px !important; }',
            '#view.view-details.view-size-' + size + ' .item .date { line-height: ' + (dsize + 14) + 'px !important; }',
            '#view.view-details.view-size-' + size + ' .item .size { line-height: ' + (dsize + 14) + 'px !important; }',
            '#view.view-details.view-size-' + size + ' .square { width: ' + dsize + 'px !important; height: ' + dsize + 'px !important; }',
            '#view.view-details.view-size-' + size + ' .square img { width: ' + dsize + 'px !important; height: ' + dsize + 'px !important; }',
            '#view.view-details.view-size-' + size + ' .label { margin: 0 246px 0 ' + (dsize + 32) + 'px !important; }',

            '#view.view-grid.view-size-' + size + ' .item .label { line-height: ' + gsize + 'px !important; }',
            '#view.view-grid.view-size-' + size + ' .square { width: ' + gsize + 'px !important; height: ' + gsize + 'px !important; }',
            '#view.view-grid.view-size-' + size + ' .square img { width: ' + gsize + 'px !important; height: ' + gsize + 'px !important; }',

            '#view.view-icons.view-size-' + size + ' .item { width: ' + ilsize + 'px !important; }',
            '#view.view-icons.view-size-' + size + ' .landscape { width: ' + ilsize + 'px !important; height: ' + isize + 'px !important; }',
            '#view.view-icons.view-size-' + size + ' .landscape img { width: ' + isize + 'px !important; height: ' + isize + 'px !important; }',
            '#view.view-icons.view-size-' + size + ' .landscape .thumb { width: ' + ilsize + 'px !important; }'
        ];

        return rules.join('\n');
    }

    function addCssStyles() {
        var styles = _.map(sortedSizes, function (size) { return createStyles(size); });
        styles.push('#view .icon img { max-width: ' + settings.maxIconSize + 'px; max-height: ' + settings.maxIconSize + 'px; }');
        $('<style/>').text(styles.join('\n')).appendTo('head');
    }

    function set(mode, size) {
        var stored = store.get(storekey);

        mode = mode || stored && stored.mode;
        size = size || stored && stored.size;
        mode = _.contains(settings.modes, mode) ? mode : settings.modes[0];
        size = _.contains(settings.sizes, size) ? size : settings.sizes[0];
        store.put(storekey, {mode: mode, size: size});

        _.each(checkedModes, function (m) {
            if (m === mode) {
                $view.addClass('view-' + m);
            } else {
                $view.removeClass('view-' + m);
            }
        });

        _.each(sortedSizes, function (s) {
            if (s === size) {
                $view.addClass('view-size-' + s);
            } else {
                $view.removeClass('view-size-' + s);
            }
        });

        event.pub('view.mode.changed', mode, size);
    }

    function getModes() {
        return checkedModes;
    }

    function getSizes() {
        return sortedSizes;
    }

    function getMode() {
        return store.get(storekey).mode;
    }

    function setMode(mode) {
        set(mode, null);
    }

    function getSize() {
        return store.get(storekey).size;
    }

    function setSize(size) {
        set(null, size);
    }

    function createHtml(item) {
        var $html = $(tplItem);
        var $a = $html.find('a');
        var $iconImg = $html.find('.icon img');
        var $label = $html.find('.label');
        var $date = $html.find('.date');
        var $size = $html.find('.size');

        $html
            .addClass(item.isFolder() ? 'folder' : 'file')
            .data('item', item);

        location.setLink($a, item);

        $label.text(item.label).attr('title', item.label);
        $date.data('time', item.time).text(format.formatDate(item.time));
        $size.data('bytes', item.size).text(format.formatSize(item.size));
        item.icon = resource.icon(item.type);

        if (item.isFolder() && !item.isManaged) {
            $html.addClass('page');
            item.icon = resource.icon('folder-page');
        }

        if (item.isCurrentParentFolder()) {
            item.icon = resource.icon('folder-parent');
            if (!settings.setParentFolderLabels) {
                $label.addClass('l10n-parentDirectory');
            }
            $html.addClass('folder-parent');
        }
        $iconImg.attr('src', item.icon).attr('alt', item.type);

        item.$view = $html;

        return $html;
    }

    function onMouseenter() {
        var item = $(this).closest('.item').data('item');
        event.pub('item.mouseenter', item);
    }

    function onMouseleave() {
        var item = $(this).closest('.item').data('item');
        event.pub('item.mouseleave', item);
    }

    function checkHint() {
        var hasNoItems = $items.find('.item').not('.folder-parent').length === 0;

        if (hasNoItems) {
            $hint.show();
        } else {
            $hint.hide();
        }
    }

    function setItems(items) {
        var removed = _.map($items.find('.item'), function (item) {
            return $(item).data('item');
        });

        $items.find('.item').remove();

        _.each(items, function (e) {
            $items.append(createHtml(e));
        });

        content.$el.scrollLeft(0).scrollTop(0);
        checkHint();
        event.pub('view.changed', items, removed);
    }

    function changeItems(add, remove) {
        _.each(add, function (item) {
            createHtml(item).hide().appendTo($items).fadeIn(400);
        });

        _.each(remove, function (item) {
            item.$view.fadeOut(400, function () {
                item.$view.remove();
            });
        });

        checkHint();
        event.pub('view.changed', add, remove);
    }

    function setHint(l10nKey) {
        $hint.removeClass().addClass('l10n-' + l10nKey);
        checkHint();
    }

    function onLocationChanged(item) {
        if (!item) {
            item = location.getItem();
        }

        var items = [];

        if (item.parent && !settings.hideParentFolder) {
            items.push(item.parent);
        }

        _.each(item.content, function (child) {
            if (!(child.isFolder() && settings.hideFolders)) {
                items.push(child);
            }
        });

        setHint('empty');
        setItems(items);
    }

    function onLocationRefreshed(item, added, removed) {
        var add = [];

        _.each(added, function (child) {
            if (!(child.isFolder() && settings.hideFolders)) {
                add.push(child);
            }
        });

        setHint('empty');
        changeItems(add, removed);
    }

    function init() {
        addCssStyles();
        set();

        $view.appendTo(content.$el);
        $hint.hide();

        format.setDefaultMetric(settings.binaryPrefix);

        $items
            .on('mouseenter', '.item a', onMouseenter)
            .on('mouseleave', '.item a', onMouseleave);

        event.sub('location.changed', onLocationChanged);
        event.sub('location.refreshed', onLocationRefreshed);
    }


    init();

    return {
        $el: $view,
        $items: $items,
        setItems: setItems,
        changeItems: changeItems,
        setLocation: onLocationChanged,
        setHint: setHint,
        getModes: getModes,
        getMode: getMode,
        setMode: setMode,
        getSizes: getSizes,
        getSize: getSize,
        setSize: setSize
    };
});
