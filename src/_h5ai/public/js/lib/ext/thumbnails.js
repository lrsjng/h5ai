const {each, map, includes} = require('../util');
const server = require('../server');
const event = require('../core/event');
const allsettings = require('../core/settings');

const settings = Object.assign({
    enabled: false,
    img: ['img-bmp', 'img-gif', 'img-ico', 'img-jpg', 'img-png'],
    mov: ['vid-avi', 'vid-flv', 'vid-mkv', 'vid-mov', 'vid-mp4', 'vid-mpg', 'vid-webm'],
    doc: ['x-pdf', 'x-ps'],
    delay: 1,
    size: 100,
    exif: false,
    chunksize: 20
}, allsettings.thumbnails);
const landscapeRatio = 4 / 3;


const queueItem = (queue, item) => {
    let type = null;

    if (includes(settings.img, item.type)) {
        type = 'img';
    } else if (includes(settings.mov, item.type)) {
        type = 'mov';
    } else if (includes(settings.doc, item.type)) {
        type = 'doc';
    } else {
        return;
    }

    if (item.thumbSquare) {
        item.$view.find('.icon.square img').addCls('thumb').attr('src', item.thumbSquare);
    } else {
        queue.push({
            type,
            href: item.absHref,
            ratio: 1,
            callback: src => {
                if (src && item.$view) {
                    item.thumbSquare = src;
                    item.$view.find('.icon.square img').addCls('thumb').attr('src', src);
                }
            }
        });
    }

    if (item.thumbRational) {
        item.$view.find('.icon.landscape img').addCls('thumb').attr('src', item.thumbRational);
    } else {
        queue.push({
            type,
            href: item.absHref,
            ratio: landscapeRatio,
            callback: src => {
                if (src && item.$view) {
                    item.thumbRational = src;
                    item.$view.find('.icon.landscape img').addCls('thumb').attr('src', src);
                }
            }
        });
    }
};

const requestQueue = queue => {
    const thumbs = map(queue, req => {
        return {
            type: req.type,
            href: req.href,
            width: Math.round(settings.size * req.ratio),
            height: settings.size
        };
    });

    return server.request({
        action: 'get',
        thumbs
    }).then(json => {
        each(queue, (req, idx) => {
            req.callback(json && json.thumbs ? json.thumbs[idx] : null);
        });
    });
};

const breakAndRequestQueue = queue => {
    const len = queue.length;
    const chunksize = settings.chunksize;
    let p = Promise.resolve();
    for (let i = 0; i < len; i += chunksize) {
        p = p.then(() => requestQueue(queue.slice(i, i + chunksize)));
    }
};

const handleItems = items => {
    const queue = [];
    each(items, item => queueItem(queue, item));
    breakAndRequestQueue(queue);
};

const onViewChanged = added => {
    setTimeout(() => handleItems(added), settings.delay);
};

const init = () => {
    if (!settings.enabled) {
        return;
    }

    event.sub('view.changed', onViewChanged);
};


init();
