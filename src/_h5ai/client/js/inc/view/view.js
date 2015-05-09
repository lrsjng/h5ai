modulejs.define('view/view', ['_', '$', 'core/event', 'core/format', 'core/location', 'core/resource', 'core/settings', 'view/content'], function (_, $, event, format, location, resource, allsettings, content) {

    var settings = _.extend({
            binaryPrefix: false,
            hideFolders: false,
            hideParentFolder: false,
            setParentFolderLabels: false
        }, allsettings.view);
    var template =
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
    var itemTemplate =
            '<li class="item">' +
                '<a>' +
                    '<span class="icon square"><img/></span>' +
                    '<span class="icon landscape"><img/></span>' +
                    '<span class="label"/>' +
                    '<span class="date"/>' +
                    '<span class="size"/>' +
                '</a>' +
            '</li>';
    var $view = $(template);
    var $items = $view.find('#items');
    var $hint = $view.find('#view-hint');


    function createHtml(item) {

        var $html = $(itemTemplate);
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

    function checkHint() {

        var hasNoItems = $items.find('.item').not('.folder-parent').length === 0;

        if (hasNoItems) {
            $hint.show();
        } else {
            $hint.hide();
        }
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

        _.each(item.content, function (item) {

            if (!(item.isFolder() && settings.hideFolders)) {
                items.push(item);
            }
        });

        setHint('empty');
        setItems(items);
    }

    function onLocationRefreshed(item, added, removed) {

        var add = [];

        _.each(added, function (item) {

            if (!(item.isFolder() && settings.hideFolders)) {
                add.push(item);
            }
        });

        setHint('empty');
        changeItems(add, removed);
    }

    function init() {

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
        setHint: setHint
    };
});
