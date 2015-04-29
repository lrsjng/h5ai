modulejs.define('view/view', ['_', '$', 'core/event', 'core/format', 'core/settings', 'view/content', 'view/item'], function (_, $, event, format, allsettings, content, viewitem) {

    var settings = _.extend({
            binaryPrefix: false,
            hideFolders: false,
            hideParentFolder: false
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
    var $view = $(template);
    var $items = $view.find('#items');
    var $empty = $view.find('.empty');


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
            $items.append(viewitem.render(item.parent));
        }

        _.each(item.content, function (e) {

            if (!(e.isFolder() && settings.hideFolders)) {
                $items.append(viewitem.render(e));
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
                viewitem.render(item).hide().appendTo($items).fadeIn(400);
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
