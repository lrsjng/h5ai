const {each, map, includes, difference} = require('../util');
const server = require('../server');
const event = require('../core/event');
const allsettings = require('../core/settings');

const defaults = {
    enabled: false,
    img: ['img-bmp', 'img-gif', 'img-ico', 'img-jpg', 'img-png', 'img-svg', 'img-tiff'],
    mov: ['vid-avi', 'vid-mkv', 'vid-flv', 'vid-swf', 'vid-mov', 'vid-mp4', 'vid-mpg', 'vid-webm', 'vid-wmv', 'vid-ts'],
    doc: ['x-pdf', 'x-ps'],
    ar: ['ar-zip', 'ar-rar'],
    delay: 1,
    exif: false,
    chunksize: 20,
    blocklist: [],
};
const default_types = defaults.img.concat(defaults.mov, defaults.doc, defaults.ar);
const settings = Object.assign(defaults, allsettings.thumbnails);
const current_settings = settings.img.concat(settings.mov, settings.doc, settings.ar);
settings.blocklist = settings.blocklist.concat(
    difference(default_types, current_settings));

const queueItem = (queue, item) => {
    let type = null;

    if (includes(settings.blocklist, item.type)) {
        type = 'blocked';
    } else if (includes(current_settings, item.type)) {
        type = item.type;
    } else if (item.type === 'folder') {
        return;
    } else {
        type = 'file'
    }

    if (item.thumbRational) {
        item.$view.find('.icon img').addCls('thumb').attr('src', item.thumbRational);
    } else {
        queue.push({
            type,
            href: item.absHref,
            callback: src => {
                if (src && item.$view) {
                    item.thumbRational = src;
                    item.$view.find('.icon img').addCls('thumb').attr('src', src);
                }
            },
            callback_type: filetype => {
                if (filetype && item.$view) {
                    console.log(`Updated type for ${item.label}: ${item.type}->${filetype}`);
                    item.type = filetype;
                    event.pub('item.changed', item);
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
        };
    });

    return server.request({
        action: 'get',
        thumbs
    }).then(json => {
        each(queue, (req, idx) => {
            if (json) {
                if (json.thumbs) {
                    req.callback(json.thumbs[idx]);
                }
                if (json.filetypes) {
                    req.callback_type(json.filetypes[idx]);
                }
            }
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
