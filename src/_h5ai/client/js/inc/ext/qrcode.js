modulejs.define('ext/qrcode', ['_', '$', 'modernizr', 'core/settings', 'core/event'], function (_, $, modernizr, allsettings, event) {

    var settings = _.extend({
            enabled: false,
            size: 150
        }, allsettings.qrcode);
    var template = '<div id="qrcode"/>';
    var $qrcode, hideTimeoutId;


    function update(item) {

        $qrcode.empty().qrcode({
            render: modernizr.canvas ? 'canvas' : 'div',
            width: settings.size,
            height: settings.size,
            color: '#333',
            bgColor: '#fff',
            radius: 0.5,
            text: window.location.protocol + '//' + window.location.host + item.absHref
        });
    }

    function onMouseenter(item) {

        if (!item.isFolder()) {
            update(item);
            clearTimeout(hideTimeoutId);
            $qrcode.stop(true, true).fadeIn(400);
        }
    }

    function onMouseleave(item) {

        hideTimeoutId = setTimeout(function () {

            $qrcode.stop(true, true).fadeOut(400);
        }, 200);
    }

    function init() {

        if (!settings.enabled) {
            return;
        }

        $qrcode = $(template).appendTo('body');

        event.sub('item.mouseenter', onMouseenter);
        event.sub('item.mouseleave', onMouseleave);
    }

    init();
});
