modulejs.define('ext/info', ['_', '$', 'modernizr', 'core/settings', 'core/resource', 'core/store', 'core/event', 'core/format'], function (_, $, modernizr, allsettings, resource, store, event, format) {

    var settings = _.extend({
            enabled: false,
            qrcode: true,
            qrColor: "#999"
        }, allsettings.info);
    var template =
            '<div id="info">' +
                '<div class="icon"><img/></div>' +
                '<div class="block">' +
                    '<div class="label"/>' +
                    '<div class="time"/>' +
                    '<div class="size"/>' +
                '</div>' +
                '<div class="qrcode"/>' +
            '</div>';
    var settingsTemplate =
            '<div class="block">' +
                '<h1 class="l10n-info">Info</h1>' +
                '<div id="view-info" class="button view">' +
                    '<img src="' + resource.image('info-toggle') + '" alt="view-info"/>' +
                '</div>' +
            '</div>';
    var sepTemplate = '<span class="sep"/>';
    var storekey = 'ext/info';
    var $img, $label, $time, $size, $qrcode;
    var currentFolder;

    // <span class="l10n-folders"/>
    // <span class="l10n-files"/>

    function updateSettings() {

        if (store.get(storekey)) {
            $('#view-info').addClass('active');
            $('#info').show();
        } else {
            $('#view-info').removeClass('active');
            $('#info').hide();
        }
    }

    function update(item) {

        var src = resource.icon('folder');
        if (!item.isCurrentFolder() && item.$view) {
            src = item.$view.find('.icon.landscape img').attr('src');
        }

        $img.attr('src', src);
        $label.text(item.label);
        if (_.isNumber(item.time)) {
            $time.text(format.formatDate(item.time));
        } else {
            $time.text('.');
        }
        if (_.isNumber(item.size)) {
            $size.text(format.formatSize(item.size) + ' (' + item.size + ' B)');
        } else {
            $size.text('.');
        }

        if (item.isFolder()) {
            var stats = item.getStats();
            $size.append(' - ' + stats.folders + ' - ' + stats.files);
        }

        if (settings.qrcode) {
            $qrcode.empty().qrcode({
                render: modernizr.canvas ? 'canvas' : 'div',
                size: 200,
                fill: settings.qrColor,
                background: null,
                text: window.location.protocol + '//' + window.location.host + item.absHref
            });
        }
    }

    function onMouseenter(item) {

        update(item);
    }

    function onMouseleave(item) {

        update(currentFolder);
    }

    function onLocationChanged(item) {

        currentFolder = item;
        update(currentFolder);
    }

    function init() {

        if (!settings.enabled) {
            return;
        }

        var $info = $(template).appendTo('#main-row');
        $img = $info.find('.icon img');
        $label = $info.find('.label');
        $time = $info.find('.time');
        $size = $info.find('.size');
        $qrcode = $info.find('.qrcode');

        if (!settings.qrcode) {
            $qrcode.remove();
        }

        $(settingsTemplate)
            .appendTo('#settings')
            .find('#view-info')
            .on('click', function (ev) {

                store.put(storekey, !store.get(storekey));
                updateSettings();
                ev.preventDefault();
            });

        // ensure stored value is boolean, default to true
        store.put(storekey, store.get(storekey) !== false);
        updateSettings();

        event.sub('location.changed', onLocationChanged);
        event.sub('item.mouseenter', onMouseenter);
        event.sub('item.mouseleave', onMouseleave);
    }


    init();
});
