modulejs.define('view/content', ['_', '$', 'core/settings', 'core/resource', 'core/format', 'core/event', 'core/location'], function (_, $, allsettings, resource, format, event, location) {

    var settings = _.extend({
            binaryPrefix: false,
            hideFolders: false,
            hideParentFolder: false,
            setParentFolderLabels: false
        }, allsettings.view);
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
    var contentTemplate =
            '<div id="content">' +
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
                '</div>' +
            '</div>';


    function update(item, force) {

        if (!force && item.$view) {
            return item.$view;
        }

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

        if (item.$view) {
            item.$view.replaceWith($html);
        }
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

        var $items = $('#items');
        var $empty = $('#view').find('.empty');

        $items.find('.item').remove();

        if (item.parent && !settings.hideParentFolder) {
            $items.append(update(item.parent, true));
        }

        _.each(item.content, function (e) {

            if (!(e.isFolder() && settings.hideFolders)) {
                $items.append(update(e, true));
            }
        });

        if (item.isEmpty()) {
            $empty.show();
        } else {
            $empty.hide();
        }

        $('html,body').scrollLeft(0).scrollTop(0);
    }

    function onLocationRefreshed(item, added, removed) {

        var $items = $('#items');
        var $empty = $('#view').find('.empty');

        _.each(added, function (item) {

            if (!(item.isFolder() && settings.hideFolders)) {
                update(item, true).hide().appendTo($items).fadeIn(400);
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

        var $content = $(contentTemplate);
        var $view = $content.find('#view');
        var $items = $view.find('#items');
        $view.find('.empty').hide();

        format.setDefaultMetric(settings.binaryPrefix);

        $items
            .on('mouseenter', '.item a', onMouseenter)
            .on('mouseleave', '.item a', onMouseleave);

        event.sub('location.changed', onLocationChanged);
        event.sub('location.refreshed', onLocationRefreshed);

        $content.appendTo('#main-row');
    }


    init();
});
