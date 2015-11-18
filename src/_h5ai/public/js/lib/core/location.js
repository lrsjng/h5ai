modulejs.define('core/location', ['_', 'core/event', 'core/modernizr', 'core/settings', 'view/notification'], function (_, event, modernizr, allsettings, notification) {
    var settings = _.extend({
        fastBrowsing: true,
        unmanagedInNewWindow: true
    }, allsettings.view);
    var doc = document;
    var history = settings.fastBrowsing && modernizr.history ? window.history : null;
    var reUriToPathname = /^.*:\/\/[^\/]*|[^\/]*$/g;
    var absHref = null;
    var reForceEncoding = [
        [/\/+/g, '/'],
        [/ /g, '%20'],
        [/!/g, '%21'],
        [/#/g, '%23'],
        [/\$/g, '%24'],
        [/&/g, '%26'],
        [/'/g, '%27'],
        [/\(/g, '%28'],
        [/\)/g, '%29'],
        [/\*/g, '%2A'],
        [/\+/g, '%2B'],
        [/\,/g, '%2C'],
        [/:/g, '%3A'],
        [/;/g, '%3B'],
        [/\=/g, '%3D'],
        [/\?/g, '%3F'],
        [/@/g, '%40'],
        [/\[/g, '%5B'],
        [/\]/g, '%5D']
    ];

    function forceEncoding(href) {
        return reForceEncoding.reduce(function (nuHref, data) {
            return nuHref.replace(data[0], data[1]);
        }, href);
    }

    function uriToPathname(uri) {
        return uri.replace(reUriToPathname, '');
    }

    var hrefsAreDecoded = (function () {
        var testpathname = '/a b';
        var a = doc.createElement('a');

        a.href = testpathname;
        return uriToPathname(a.href) === testpathname;
    }());

    function encodedHref(href) {
        var a = doc.createElement('a');
        var location;

        a.href = href;
        location = uriToPathname(a.href);

        if (hrefsAreDecoded) {
            location = encodeURIComponent(location).replace(/%2F/ig, '/');
        }

        return forceEncoding(location);
    }

    function getDomain() {
        return doc.domain;
    }

    function getAbsHref() {
        return absHref;
    }

    function getItem() {
        return modulejs.require('model/item').get(absHref);
    }

    function load(callback) {
        modulejs.require('core/server').request({action: 'get', items: {href: absHref, what: 1}}, function (json) {
            var Item = modulejs.require('model/item');
            var item = Item.get(absHref);

            if (json) {
                var found = {};

                _.each(json.items, function (jsonItem) {
                    var e = Item.get(jsonItem);
                    found[e.absHref] = true;
                });

                _.each(item.content, function (e) {
                    if (!found[e.absHref]) {
                        Item.remove(e.absHref);
                    }
                });
            }
            if (_.isFunction(callback)) {
                callback(item);
            }
        });
    }

    function refresh() {
        var item = getItem();
        var oldItems = _.values(item.content);

        event.pub('location.beforeRefresh');

        load(function () {
            var newItems = _.values(item.content);
            var added = _.difference(newItems, oldItems);
            var removed = _.difference(oldItems, newItems);

            event.pub('location.refreshed', item, added, removed);
        });
    }

    function setLocation(newAbsHref, keepBrowserUrl) {
        event.pub('location.beforeChange');

        newAbsHref = encodedHref(newAbsHref);

        if (absHref !== newAbsHref) {
            absHref = newAbsHref;

            if (history) {
                if (keepBrowserUrl) {
                    history.replaceState({absHref: absHref}, '', absHref);
                } else {
                    history.pushState({absHref: absHref}, '', absHref);
                }
            }
        }

        var item = getItem();
        if (item.isLoaded) {
            event.pub('location.changed', item);
            refresh();
        } else {
            notification.set('loading...');
            load(function () {
                item.isLoaded = true;
                notification.set();
                event.pub('location.changed', item);
            });
        }
    }

    function setLink($el, item) {
        $el.attr('href', item.absHref);

        if (history && item.isFolder() && item.isManaged) {
            $el.on('click', function () {
                setLocation(item.absHref);
                return false;
            });
        }

        if (settings.unmanagedInNewWindow && !item.isManaged) {
            $el.attr('target', '_blank');
        }
    }

    function onPopState(ev) {
        if (ev.state && ev.state.absHref) {
            setLocation(ev.state.absHref, true);
        }
    }


    window.onpopstate = history ? onPopState : null;


    return {
        forceEncoding: forceEncoding,
        getDomain: getDomain,
        getAbsHref: getAbsHref,
        getItem: getItem,
        setLocation: setLocation,
        refresh: refresh,
        setLink: setLink
    };
});
