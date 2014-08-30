modulejs.define('ext/crumb', ['_', '$', 'core/settings', 'core/resource', 'core/event', 'core/location'], function (_, $, allsettings, resource, event, location) {

    var settings = _.extend({
            enabled: false
        }, allsettings.crumb);
    var template =
            '<li class="crumb">' +
                '<a>' +
                    '<img src="' + resource.image('crumb') + '" alt=">"/>' +
                    '<span/>' +
                '</a>' +
            '</li>';
    var pageHintTemplate = '<img class="hint" src="' + resource.image('page') + '" alt="has index page"/>';
    var statusHintTemplate = '<span class="hint"/>';


    function update(item, force) {

        if (!force && item.$crumb) {
            return item.$crumb;
        }

        var $html = $(template);
        var $a = $html.find('a');

        $html
            .addClass(item.isFolder() ? 'folder' : 'file')
            .data('item', item);

        location.setLink($a, item);
        $a.find('span').text(item.label).end();

        if (item.isDomain()) {
            $html.addClass('domain');
            $a.find('img').attr('src', resource.image('home'));
        }

        if (item.isRoot()) {
            $html.addClass('root');
            $a.find('img').attr('src', resource.image('home'));
        }

        if (item.isCurrentFolder()) {
            $html.addClass('current');
        }

        if (!item.isManaged) {
            $a.append($(pageHintTemplate));
        }

        if (item.$crumb) {
            item.$crumb.replaceWith($html);
        }
        item.$crumb = $html;

        return $html;
    }

    function onLocationChanged(item) {

        var crumb = item.getCrumb();
        var $ul = $('#navbar');
        var found = false;

        $ul.find('.crumb').each(function () {

            var $html = $(this);
            if ($html.data('item') === item) {
                found = true;
                $html.addClass('current');
            } else {
                $html.removeClass('current');
            }
        });

        if (!found) {
            $ul.find('.crumb').remove();
            _.each(crumb, function (e) {

                $ul.append(update(e, true));
            });
        }
    }

    function init() {

        if (!settings.enabled) {
            return;
        }

        event.sub('location.changed', onLocationChanged);
    }


    init();
});
