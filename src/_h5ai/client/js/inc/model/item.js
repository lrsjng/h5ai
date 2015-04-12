modulejs.define('model/item', ['_', 'core/types', 'core/event', 'core/settings', 'core/server', 'core/location'], function (_, types, event, settings, server, location) {

    var reEndsWithSlash = /\/$/;
    var reSplitPath = /^(.*\/)([^\/]+\/?)$/;
    var cache = {};


    function startsWith(sequence, part) {

        return sequence.slice && part.length && sequence.slice(0, part.length) === part;
    }

    function createLabel(sequence) {

        sequence = sequence.replace(reEndsWithSlash, '');
        try {
            sequence = decodeURIComponent(sequence);
        } catch (e) {}
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

    function getItem(absHref, time, size, isManaged, isContentFetched, md5, sha1) {

        absHref = location.forceEncoding(absHref);

        if (!startsWith(absHref, settings.rootHref)) {
            return null;
        }

        var self = cache[absHref] || new Item(absHref);

        if (_.isNumber(time)) {
            self.time = time;
        }
        if (_.isNumber(size)) {
            self.size = size;
        }
        if (isManaged) {
            self.isManaged = true;
        }
        if (isContentFetched) {
            self.isContentFetched = true;
        }
        if (md5) {
            self.md5 = md5;
        }
        if (sha1) {
            self.sha1 = sha1;
        }

        return self;
    }

    function removeItem(absHref) {

        absHref = location.forceEncoding(absHref);

        var self = cache[absHref];

        if (self) {
            delete cache[absHref];
            if (self.parent) {
                delete self.parent.content[self.absHref];
            }
            _.each(self.content, function (item) {

                removeItem(item.absHref);
            });
        }
    }

    function fetchContent(absHref, callback) {

        var self = getItem(absHref);

        if (!_.isFunction(callback)) {
            callback = function () {};
        }

        if (self.isContentFetched) {
            callback(self);
        } else {
            server.request({action: 'get', items: true, itemsHref: self.absHref, itemsWhat: 1}, function (response) {

                if (response.items) {
                    _.each(response.items, function (item) {
                        getItem(item.absHref, item.time, item.size, item.is_managed, item.content, item.md5, item.sha1);
                    });
                }

                callback(self);
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

            return this === getItem(location.getAbsHref()).parent;
        },

        isDomain: function () {

            return this.absHref === '/';
        },

        isRoot: function () {

            return this.absHref === settings.rootHref;
        },

        isH5ai: function () {

            return this.absHref === settings.appHref;
        },

        isEmpty: function () {

            return _.keys(this.content).length === 0;
        },

        fetchContent: function (callback) {

            return fetchContent(this.absHref, callback);
        },

        getCrumb: function () {

            var item = this;
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
            var item = this;

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
