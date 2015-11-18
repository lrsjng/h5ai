modulejs.define('model/item', ['_', 'core/event', 'core/location', 'core/server', 'core/settings', 'core/types'], function (_, event, location, server, settings, types) {
    var reEndsWithSlash = /\/$/;
    var reSplitPath = /^(.*\/)([^\/]+\/?)$/;
    var cache = {};


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

    function splitPath(sequence) {
        if (sequence === '/') {
            return {
                parent: null,
                name: '/'
            };
        }

        var match = reSplitPath.exec(sequence);
        if (match) {
            var split = {
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
        if (_.isString(options)) {
            options = {href: options};
        } else if (!options || !_.isString(options.href)) {
            return null;
        }

        var href = location.forceEncoding(options.href);

        if (!startsWith(href, settings.rootHref)) {
            return null;
        }

        var item = cache[href] || new Item(href);

        if (_.isNumber(options.time)) {
            item.time = options.time;
        }
        if (_.isNumber(options.size)) {
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

        var item = cache[absHref];

        if (item) {
            delete cache[absHref];
            if (item.parent) {
                delete item.parent.content[item.absHref];
            }
            _.each(item.content, function (child) {
                removeItem(child.absHref);
            });
        }
    }

    function fetchContent(absHref, callback) {
        var item = getItem(absHref);

        if (!_.isFunction(callback)) {
            callback = function () {};
        }

        if (item.isContentFetched) {
            callback(item);
        } else {
            server.request({action: 'get', items: {href: item.absHref, what: 1}}, function (response) {
                if (response.items) {
                    _.each(response.items, function (jsonItem) {
                        getItem(jsonItem);
                    });
                }

                callback(item);
            });
        }
    }


    function Item(absHref) {
        var split = splitPath(absHref);

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
            if (_.keys(this.parent.content).length > 1) {
                this.parent.isContentFetched = true;
            }
        }
    }

    _.extend(Item.prototype, {

        isFolder: function () {
            return reEndsWithSlash.test(this.absHref);
        },

        isCurrentFolder: function () {
            return this.absHref === location.getAbsHref();
        },

        isInCurrentFolder: function () {
            return Boolean(this.parent) && this.parent.isCurrentFolder();
        },

        isCurrentParentFolder: function () {
            var item = getItem(location.getAbsHref());
            return Boolean(item) && this === item.parent;
        },

        isDomain: function () {
            return this.absHref === '/';
        },

        isRoot: function () {
            return this.absHref === settings.rootHref;
        },

        isEmpty: function () {
            return _.keys(this.content).length === 0;
        },

        fetchContent: function (callback) {
            return fetchContent(this.absHref, callback);
        },

        getCrumb: function () {
            var item = this; // eslint-disable-line consistent-this
            var crumb = [item];

            while (item.parent) {
                item = item.parent;
                crumb.unshift(item);
            }

            return crumb;
        },

        getSubfolders: function () {
            return _.sortBy(_.filter(this.content, function (item) {
                return item.isFolder();
            }), function (item) {
                return item.label.toLowerCase();
            });
        },

        getStats: function () {
            var folders = 0;
            var files = 0;

            _.each(this.content, function (item) {
                if (item.isFolder()) {
                    folders += 1;
                } else {
                    files += 1;
                }
            });

            var depth = 0;
            var item = this; // eslint-disable-line consistent-this

            while (item.parent) {
                depth += 1;
                item = item.parent;
            }

            return {
                folders: folders,
                files: files,
                depth: depth
            };
        }
    });


    return {
        get: getItem,
        remove: removeItem
    };
});
