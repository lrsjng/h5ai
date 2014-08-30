modulejs.define('ext/thumbnails', ['_', 'core/settings', 'core/event', 'core/server'], function (_, allsettings, event, server) {

    var settings = _.extend({
            enabled: false,
            img: ['bmp', 'gif', 'ico', 'image', 'jpg', 'png'],
            mov: ['video'],
            doc: ['pdf', 'ps'],
            delay: 1000,
            size: 96
        }, allsettings.thumbnails);


    function requestThumb(type, href, mode, ratio, callback) {

        server.request({
            action: 'getThumbHref',
            type: type,
            href: href,
            mode: mode,
            width: settings.size * ratio,
            height: settings.size
        }, function (json) {

            callback(json && json.code === 0 ? json.absHref : null);
        });
    }

    function checkItem(item) {

        var type = null;

        if (_.contains(settings.img, item.type)) {
            type = 'img';
        } else if (_.contains(settings.mov, item.type)) {
            type = 'mov';
        } else if (_.contains(settings.doc, item.type)) {
            type = 'doc';
        }

        if (type) {
            if (item.thumbSquare) {
                item.$view.find('.icon.square img').addClass('thumb').attr('src', item.thumbSquare);
            } else {
                requestThumb(type, item.absHref, 'square', 1, function (src) {

                    if (src && item.$view) {
                        item.thumbSquare = src;
                        item.$view.find('.icon.square img').addClass('thumb').attr('src', src);
                    }
                });
            }
            if (item.thumbRational) {
                item.$view.find('.icon.rational img').addClass('thumb').attr('src', item.thumbRational);
            } else {
                requestThumb(type, item.absHref, 'rational', 2, function (src) {

                    if (src && item.$view) {
                        item.thumbRational = src;
                        item.$view.find('.icon.rational img').addClass('thumb').attr('src', src);
                    }
                });
            }
        }
    }

    function onLocationChanged(item) {

        setTimeout(function () {

            _.each(item.content, checkItem);
        }, settings.delay);
    }

    function onLocationRefreshed(item, added, removed) {

        _.each(added, checkItem);
    }

    function init() {

        if (!settings.enabled || !server.api) {
            return;
        }

        event.sub('location.changed', onLocationChanged);
        event.sub('location.refreshed', onLocationRefreshed);
    }


    init();
});
