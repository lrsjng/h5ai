modulejs.define('ext/crumb', ['_', '$', 'core/settings', 'core/resource', 'core/event', 'core/location'], function (_, $, allsettings, resource, event, location) {

    var settings = _.extend({
            enabled: false
        }, allsettings.crumb);
    var template =
            '<a class="crumb">' +
                '<img class="sep" src="' + resource.image('crumb') + '" alt=">"/>' +
                '<span class="label"/>' +
            '</a>';
    var pageHintTemplate = '<img class="hint" src="' + resource.icon('folder-page') + '" alt="has index page"/>';


    function update(item, force) {

        if (!force && item.$crumb) {
            return item.$crumb;
        }

        var $html = $(template);

        $html
            .addClass(item.isFolder() ? 'folder' : 'file')
            .data('item', item);

        location.setLink($html, item);
        $html.find('.label').text(item.label).end();

        if (item.isDomain() || item.isRoot()) {
            $html.find('.sep').remove();
        }

        if (item.isCurrentFolder()) {
            $html.addClass('active');
        }

        if (!item.isManaged) {
            $html.append($(pageHintTemplate));
        }

        if (item.$crumb) {
            item.$crumb.replaceWith($html);
        }
        item.$crumb = $html;

        return $html;
    }

    function onLocationChanged(item) {

        var crumb = item.getCrumb();
        var $crumbbar = $('#crumbbar');
        var found = false;

        $crumbbar.find('.crumb').each(function () {

            var $html = $(this);
            if ($html.data('item') === item) {
                found = true;
                $html.addClass('active');
            } else {
                $html.removeClass('active');
            }
        });

        if (!found) {
            $crumbbar.find('.crumb').remove();
            _.each(crumb, function (e) {

                $crumbbar.append(update(e, true));
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
