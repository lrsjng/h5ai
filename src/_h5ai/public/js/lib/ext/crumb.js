modulejs.define('ext/crumb', ['_', '$', 'core/event', 'core/location', 'core/resource', 'core/settings', 'view/topbar'], function (_, $, event, location, resource, allsettings, topbar) {
    var settings = _.extend({
        enabled: false
    }, allsettings.crumb);
    var crumbTemplate =
            '<a class="crumb">' +
                '<img class="sep" src="' + resource.image('crumb') + '" alt=">"/>' +
                '<span class="label"/>' +
            '</a>';
    var pageHintTemplate = '<img class="hint" src="' + resource.icon('folder-page') + '" alt="has index page"/>';
    var $crumbbar;


    function createHtml(item) {
        var $html = $(crumbTemplate).data('item', item);
        item.$crumb = $html;
        location.setLink($html, item);

        $html.find('.label').text(item.label);

        if (item.isCurrentFolder()) {
            $html.addClass('active');
        }

        if (!item.isManaged) {
            $html.append($(pageHintTemplate));
        }

        return $html;
    }

    function onLocationChanged(item) {
        var $crumb = item.$crumb;

        if ($crumb && $crumb.parent()[0] === $crumbbar[0]) {
            $crumbbar.children().removeClass('active');
            $crumb.addClass('active');
        } else {
            $crumbbar.empty();
            _.each(item.getCrumb(), function (crumbItem) {
                $crumbbar.append(createHtml(crumbItem));
            });
        }
    }

    function init() {
        if (!settings.enabled) {
            return;
        }

        $crumbbar = $('<div id="crumbbar"/>').appendTo(topbar.$flowbar);

        event.sub('location.changed', onLocationChanged);
    }


    init();
});
