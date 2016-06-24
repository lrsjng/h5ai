const {keys, each, filter, sortBy, isFn, isStr, isNum} = require('../lo');
const server = require('../server');
const location = require('../core/location');
const settings = require('../core/settings');
const types = require('../core/types');


const reEndsWithSlash = /\/$/;
const reSplitPath = /^(.*\/)([^\/]+\/?)$/;
const cache = {};


function startsWith(sequence, part) {
    if (!sequence || !sequence.indexOf) {
        return false;
    }

    return sequence.indexOf(part) === 0;
}

function createLabel(sequence) {
    sequence = sequence.replace(reEndsWithSlash, '');
    try {
        sequence = decodeURIComponent(sequence);
    } catch (e) {/* skip */}
    return sequence;
}

function splitPath(sequence) { // eslint-disable-line consistent-return
    if (sequence === '/') {
        return {
            parent: null,
            name: '/'
        };
    }

    const match = reSplitPath.exec(sequence);
    if (match) {
        const split = {
            parent: match[1],
            name: match[2]
        };

        if (split.parent && !startsWith(split.parent, settings.rootHref)) {
            split.parent = null;
        }
        return split;
    }
}

function getItem(options) {
    if (isStr(options)) {
        options = {href: options};
    } else if (!options || !isStr(options.href)) {
        return null;
    }

    const href = location.forceEncoding(options.href);

    if (!startsWith(href, settings.rootHref)) {
        return null;
    }

    const item = cache[href] || new Item(href); // eslint-disable-line no-use-before-define

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
}

function removeItem(absHref) {
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
}

function fetchContent(absHref, callback) {
    const item = getItem(absHref);

    if (!isFn(callback)) {
        callback = () => undefined;
    }

    if (item.isContentFetched) {
        callback(item);
    } else {
        server.request({action: 'get', items: {href: item.absHref, what: 1}}).then(response => {
            if (response.items) {
                each(response.items, jsonItem => {
                    getItem(jsonItem);
                });
            }

            callback(item);
        });
    }
}


function Item(absHref) {
    const split = splitPath(absHref);

    cache[absHref] = this;

    this.absHref = absHref;
    this.type = types.getType(absHref);
    this.label = createLabel(absHref === '/' ? location.getDomain() : split.name);
    this.time = null;
    this.size = null;
    this.parent = null;
    this.isManaged = null;
    this.content = {};

    if (split.parent) {
        this.parent = getItem(split.parent);
        this.parent.content[this.absHref] = this;
        if (keys(this.parent.content).length > 1) {
            this.parent.isContentFetched = true;
        }
    }
}

Object.assign(Item.prototype, {
    isFolder() {
        return reEndsWithSlash.test(this.absHref);
    },

    isCurrentFolder() {
        return this.absHref === location.getAbsHref();
    },

    isInCurrentFolder() {
        return Boolean(this.parent) && this.parent.isCurrentFolder();
    },

    isCurrentParentFolder() {
        const item = getItem(location.getAbsHref());
        return Boolean(item) && this === item.parent;
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

    fetchContent(callback) {
        return fetchContent(this.absHref, callback);
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
});


module.exports = {
    get: getItem,
    remove: removeItem
};
