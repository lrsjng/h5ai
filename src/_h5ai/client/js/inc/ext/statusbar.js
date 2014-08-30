modulejs.define('ext/statusbar', ['_', '$', 'core/settings', 'core/format', 'core/event'], function (_, $, allsettings, format, event) {

    var settings = _.extend({
            enabled: false
        }, allsettings.statusbar);
    var template =
            '<span class="statusbar">' +
                '<span class="status default">' +
                    '<span class="folderTotal"/> <span class="l10n-folders"/>' +
                    '<span class="sep"/>' +
                    '<span class="fileTotal"/> <span class="l10n-files"/>' +
                '</span>' +
                '<span class="status dynamic"/>' +
            '</span>';
    var sepTemplate = '<span class="sep"/>';
    var $statusDynamic;
    var $statusDefault;


    function update(html) {

        if (html) {
            $statusDefault.hide();
            $statusDynamic.empty().append(html).show();
        } else {
            $statusDynamic.empty().hide();
            $statusDefault.show();
        }
    }

    function init() {

        if (!settings.enabled) {
            return;
        }

        var $statusbar = $(template);
        var $folderTotal = $statusbar.find('.folderTotal');
        var $fileTotal = $statusbar.find('.fileTotal');
        var onLocationChanged = function (item) {

                var stats = item.getStats();
                $folderTotal.text(stats.folders);
                $fileTotal.text(stats.files);
            };

        $statusDefault = $statusbar.find('.status.default');
        $statusDynamic = $statusbar.find('.status.dynamic');

        $('#bottombar > .center').append($statusbar);

        event.sub('statusbar', update);
        event.sub('location.changed', onLocationChanged);
        event.sub('location.refreshed', onLocationChanged);

        event.sub('item.mouseenter', function (item) {

            if (item.isCurrentParentFolder()) {
                return;
            }

            var $span = $('<span/>').append(item.label);

            if (_.isNumber(item.time)) {
                $span.append(sepTemplate).append(format.formatDate(item.time));
            }
            if (_.isNumber(item.size)) {
                $span.append(sepTemplate).append(format.formatSize(item.size));
            }

            update($span);
        });

        event.sub('item.mouseleave', function (item) {

            update();
        });
    }


    init();
});
