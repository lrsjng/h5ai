modulejs.define('ext/thumbnails', ['_', 'core/settings', 'core/event', 'core/server', 'core/resource'], function (_, allsettings, event, server, resource) {

    var settings = _.extend({
            enabled: false,
            img: ['img-bmp', 'img-gif', 'img-ico', 'img-jpg', 'img-png'],
            mov: ['vid-avi', 'vid-flv', 'vid-mkv', 'vid-mov', 'vid-mp4', 'vid-mpg', 'vid-webm'],
            doc: ['x-pdf', 'x-ps'],
            delay: 1,
            size: 100,
            exif: true
        }, allsettings.thumbnails);


    function requestThumb(type, href, ratio, callback) {

        server.request({
            action: 'getThumbHref',
            type: type,
            href: href,
            width: Math.round(settings.size * ratio),
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
                requestThumb(type, item.absHref, 1, function (src) {

                    if (src && item.$view) {
                        item.thumbSquare = src;
                        item.$view.find('.icon.square img').addClass('thumb').attr('src', src);
                    }
                });
            }
            if (item.thumbRational) {
                item.$view.find('.icon.landscape img').addClass('thumb').attr('src', item.thumbRational);
            } else {
                requestThumb(type, item.absHref, 4/3, function (src) {

                    if (src && item.$view) {
                        item.thumbRational = src;
                        item.$view.find('.icon.landscape img').addClass('thumb').attr('src', src);
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
