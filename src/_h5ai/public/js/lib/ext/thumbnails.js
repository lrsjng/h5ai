modulejs.define('ext/thumbnails', ['_', 'core/event', 'core/server', 'core/settings'], function (_, event, server, allsettings) {
    var settings = _.extend({
        enabled: false,
        img: ['img-bmp', 'img-gif', 'img-ico', 'img-jpg', 'img-png'],
        mov: ['vid-avi', 'vid-flv', 'vid-mkv', 'vid-mov', 'vid-mp4', 'vid-mpg', 'vid-webm'],
        doc: ['x-pdf', 'x-ps'],
        delay: 1,
        size: 100,
        exif: false
    }, allsettings.thumbnails);
    var landscapeRatio = 4 / 3;


    function queueItem(queue, item) {
        var type = null;

        if (_.contains(settings.img, item.type)) {
            type = 'img';
        } else if (_.contains(settings.mov, item.type)) {
            type = 'mov';
        } else if (_.contains(settings.doc, item.type)) {
            type = 'doc';
        } else {
            return;
        }

        if (item.thumbSquare) {
            item.$view.find('.icon.square img').addClass('thumb').attr('src', item.thumbSquare);
        } else {
            queue.push({
                type: type,
                href: item.absHref,
                ratio: 1,
                callback: function (src) {
                    if (src && item.$view) {
                        item.thumbSquare = src;
                        item.$view.find('.icon.square img').addClass('thumb').attr('src', src);
                    }
                }
            });
        }

        if (item.thumbRational) {
            item.$view.find('.icon.landscape img').addClass('thumb').attr('src', item.thumbRational);
        } else {
            queue.push({
                type: type,
                href: item.absHref,
                ratio: landscapeRatio,
                callback: function (src) {
                    if (src && item.$view) {
                        item.thumbRational = src;
                        item.$view.find('.icon.landscape img').addClass('thumb').attr('src', src);
                    }
                }
            });
        }
    }

    function requestQueue(queue) {
        var thumbs = _.map(queue, function (req) {
            return {
                type: req.type,
                href: req.href,
                width: Math.round(settings.size * req.ratio),
                height: settings.size
            };
        });

        server.request({
            action: 'get',
            thumbs: thumbs
        }, function (json) {
            _.each(queue, function (req, idx) {
                req.callback(json && json.thumbs ? json.thumbs[idx] : null);
            });
        });
    }

    function handleItems(items) {
        var queue = [];

        _.each(items, function (item) {
            queueItem(queue, item);
        });

        if (queue.length) {
            requestQueue(queue);
        }
    }

    function onViewChanged(added) {
        setTimeout(function () {
            handleItems(added);
        }, settings.delay);
    }

    function init() {
        if (!settings.enabled) {
            return;
        }

        event.sub('view.changed', onViewChanged);
    }


    init();
});
