const {keys, each, filter, sortBy, isStr, isNum} = require('../util');
const server = require('../server');
const location = require('../core/location');
const settings = require('../core/settings');
const types = require('../core/types');

const reEndsWithSlash = /\/$/;
const reSplitPath = /^(.*\/)([^\/]+\/?)$/;
const cache = {};


const startsWith = (sequence, part) => isStr(sequence) && sequence.startsWith(part);

const createLabel = sequence => {
    sequence = sequence.replace(reEndsWithSlash, '');
    try {
        sequence = decodeURIComponent(sequence);
    } catch (e) {/* skip */}
    return sequence;
};

const splitPath = sequence => {
    if (sequence === '/') {
        return {
            parent: null,
            name: '/'
        };
    }

    const match = reSplitPath.exec(sequence);
    if (!match) {
        return null;
    }

    const split = {
        parent: match[1],
        name: match[2]
    };

    if (split.parent && !startsWith(split.parent, settings.rootHref)) {
        split.parent = null;
    }
    return split;
};

const getItem = options => {
    if (isStr(options)) {
        options = {href: options};
    } else if (!options || !isStr(options.href)) {
        return null;
    }

    const href = location.forceEncoding(options.href);

    if (!startsWith(href, settings.rootHref)) {
        return null;
    }

    const item = cache[href] || Item(href); // eslint-disable-line no-use-before-define

    if (isNum(options.time)) {
        item.time = options.time;
    }
    if (isNum(options.size)) {
        item.size = options.size;
    }
    if (options.managed) {
        item.isManaged = true;
    }
    if (options.fetched) {
        item.isContentFetched = true;
    }

    return item;
};

const removeItem = absHref => {
    absHref = location.forceEncoding(absHref);

    const item = cache[absHref];

    if (item) {
        delete cache[absHref];
        if (item.parent) {
            delete item.parent.content[item.absHref];
        }
        each(item.content, child => {
            removeItem(child.absHref);
        });
    }
};

const fetchContent = absHref => {
    return new Promise(resolve => {
        const item = getItem(absHref);

        if (item.isContentFetched) {
            resolve(item);
        } else {
            server.request({action: 'get', items: {href: item.absHref, what: 1}}).then(response => {
                if (response.items) {
                    each(response.items, jsonItem => {
                        getItem(jsonItem);
                    });
                }

                resolve(item);
            });
        }
    });
};


const Item = absHref => {
    const split = splitPath(absHref);

    const inst = Object.assign(Object.create(Item.prototype), {
        absHref,
        type: types.getType(absHref),
        label: createLabel(absHref === '/' ? location.getDomain() : split.name),
        time: null,
        size: null,
        parent: null,
        isManaged: null,
        content: {}
    });

    cache[absHref] = inst;

    if (split.parent) {
        inst.parent = getItem(split.parent);
        inst.parent.content[inst.absHref] = inst;
        if (keys(inst.parent.content).length > 1) {
            inst.parent.isContentFetched = true;
        }
    }

    return inst;
};

Item.prototype = {
    constructor: Item,

    isFolder() {
        return reEndsWithSlash.test(this.absHref);
    },

    isCurrentFolder() {
        return this.absHref === location.getAbsHref();
    },

    isInCurrentFolder() {
        return !!this.parent && this.parent.isCurrentFolder();
    },

    isCurrentParentFolder() {
        const item = getItem(location.getAbsHref());
        return !!item && this === item.parent;
    },

    isDomain() {
        return this.absHref === '/';
    },

    isRoot() {
        return this.absHref === settings.rootHref;
    },

    isEmpty() {
        return keys(this.content).length === 0;
    },

    fetchContent() {
        return fetchContent(this.absHref);
    },

    getCrumb() {
        let item = this; // eslint-disable-line consistent-this
        const crumb = [item];

        while (item.parent) {
            item = item.parent;
            crumb.unshift(item);
        }

        return crumb;
    },

    getSubfolders() {
        return sortBy(filter(this.content, item => {
            return item.isFolder();
        }), item => {
            return item.label.toLowerCase();
        });
    },

    getStats() {
        let folders = 0;
        let files = 0;

        each(this.content, item => {
            if (item.isFolder()) {
                folders += 1;
            } else {
                files += 1;
            }
        });

        let depth = 0;
        let item = this; // eslint-disable-line consistent-this

        while (item.parent) {
            depth += 1;
            item = item.parent;
        }

        return {
            folders,
            files,
            depth
        };
    }
};


module.exports = {
    get: getItem,
    remove: removeItem
};
