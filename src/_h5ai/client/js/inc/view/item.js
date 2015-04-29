modulejs.define('view/item', ['_', '$', 'core/format', 'core/location', 'core/resource', 'core/settings'], function (_, $, format, location, resource, allsettings) {

    var settings = _.extend({
            setParentFolderLabels: false
        }, allsettings.view);
    var template =
            '<li class="item">' +
                '<a>' +
                    '<span class="icon square"><img/></span>' +
                    '<span class="icon landscape"><img/></span>' +
                    '<span class="label"/>' +
                    '<span class="date"/>' +
                    '<span class="size"/>' +
                '</a>' +
            '</li>';


    function renderItem(item) {

        var $html = $(template);
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

    return {
        render: renderItem
    };
});
