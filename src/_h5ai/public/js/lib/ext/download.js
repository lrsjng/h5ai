modulejs.define('ext/download', ['_', '$', 'core/event', 'core/location', 'core/resource', 'core/server', 'core/settings'], function (_, $, event, location, resource, server, allsettings) {
    var settings = _.extend({
        enabled: false,
        type: 'php-tar',
        packageName: 'package',
        alwaysVisible: false
    }, allsettings.download);
    var template =
            '<div id="download" class="tool">' +
                '<img src="' + resource.image('download') + '" alt="download"/>' +
            '</div>';
    var selectedItems = [];
    var $download;


    function onSelection(items) {
        selectedItems = items.slice(0);
        if (selectedItems.length) {
            $download.show();
        } else if (!settings.alwaysVisible) {
            $download.hide();
        }
    }

    function onClick() {
        var type = settings.type;
        var name = settings.packageName;
        var extension = type === 'shell-zip' ? 'zip' : 'tar';

        if (!name) {
            if (selectedItems.length === 1) {
                name = selectedItems[0].label;
            } else {
                name = location.getItem().label;
            }
        }

        var query = {
            action: 'download',
            as: name + '.' + extension,
            type: type,
            baseHref: location.getAbsHref()
        };

        _.each(selectedItems, function (item, idx) {
            query['hrefs[' + idx + ']'] = item.absHref;
        });

        server.formRequest(query);
    }

    function init() {
        if (!settings.enabled) {
            return;
        }

        $download = $(template)
            .hide()
            .appendTo('#toolbar')
            .on('click', onClick);

        if (settings.alwaysVisible) {
            $download.show();
        }

        event.sub('selection', onSelection);
    }


    init();
});
