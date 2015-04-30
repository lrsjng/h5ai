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
                '<div class="empty l10n-empty"/>' +
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
    var $empty = $view.find('.empty');


    function itemToHtml(item) {

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

    function onLocationChanged(item) {

        $items.find('.item').remove();

        if (item.parent && !settings.hideParentFolder) {
            $items.append(itemToHtml(item.parent));
        }

        _.each(item.content, function (e) {

            if (!(e.isFolder() && settings.hideFolders)) {
                $items.append(itemToHtml(e));
            }
        });

        if (item.isEmpty()) {
            $empty.show();
        } else {
            $empty.hide();
        }

        content.$el.scrollLeft(0).scrollTop(0);
    }

    function onLocationRefreshed(item, added, removed) {

        _.each(added, function (item) {

            if (!(item.isFolder() && settings.hideFolders)) {
                itemToHtml(item).hide().appendTo($items).fadeIn(400);
            }
        });

        _.each(removed, function (item) {

            item.$view.fadeOut(400, function () {
                item.$view.remove();
            });
        });

        if (item.isEmpty()) {
            setTimeout(function () { $empty.show(); }, 400);
        } else {
            $empty.hide();
        }
    }

    function init() {

        $view.appendTo(content.$el);
        $empty.hide();

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
        $items: $items
    };
});
