modulejs.define('ext/download', ['_', '$', 'core/settings', 'core/resource', 'core/event', 'core/location', 'core/server'], function (_, $, allsettings, resource, event, location, server) {

    var settings = _.extend({
            enabled: false,
            type: 'php-tar',
            packageName: 'package',
            alwaysVisible: false
        }, allsettings.download);
    var downloadBtnTemplate =
            '<div id="download" class="tool">' +
                '<img src="' + resource.image('download') + '" alt="download"/>' +
            '</div>';
    var selectedItems = [];


    function onSelection(items) {

        var $download = $('#download');

        selectedItems = items.slice(0);
        if (selectedItems.length) {
            $download.show();
        } else if (!settings.alwaysVisible) {
            $download.hide();
        }
    }

    function onClick(event) {

        var type = settings.type;
        var name = settings.packageName;
        var extension = (type === 'shell-zip') ? 'zip' : 'tar';

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
                hrefs: _.pluck(selectedItems, 'absHref').join('|:|')
            };

        server.formRequest(query);
    }

    function init() {

        if (!settings.enabled) {
            return;
        }

        $(downloadBtnTemplate)
            .on('click', onClick)
            .appendTo('#toolbar');

        if (settings.alwaysVisible) {
            $('#download').show();
        }

        event.sub('selection', onSelection);
    }


    init();
});
