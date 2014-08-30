modulejs.define('core/location', ['_', 'modernizr', 'core/settings', 'core/event', 'core/notify'], function (_, modernizr, allsettings, event, notify) {

    var settings = _.extend({
            smartBrowsing: true,
            unmanagedInNewWindow: true
        }, allsettings.view);
    var doc = document;
    var history = settings.smartBrowsing && modernizr.history ? window.history : null;
    var reUriToPathname = /^.*:\/\/[^\/]*|[^\/]*$/g;
    var absHref = null;


    function forceEncoding(href) {

        return href
                .replace(/\/+/g, '/')

                .replace(/ /g, '%20')
                .replace(/!/g, '%21')
                .replace(/#/g, '%23')
                .replace(/\$/g, '%24')
                .replace(/&/g, '%26')
                .replace(/'/g, '%27')
                .replace(/\(/g, '%28')
                .replace(/\)/g, '%29')
                .replace(/\*/g, '%2A')
                .replace(/\+/g, '%2B')
                .replace(/\,/g, '%2C')
                // .replace(/\//g, '%2F')
                .replace(/:/g, '%3A')
                .replace(/;/g, '%3B')
                .replace(/=/g, '%3D')
                .replace(/\?/g, '%3F')
                .replace(/@/g, '%40')
                .replace(/\[/g, '%5B')
                .replace(/\]/g, '%5D');
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

        modulejs.require('core/server').request({action: 'get', items: true, itemsHref: absHref, itemsWhat: 1}, function (json) {

            var Item = modulejs.require('model/item');
            var item = Item.get(absHref);

            if (json) {

                var found = {};

                _.each(json.items, function (jsonItem) {

                    var e = Item.get(jsonItem.absHref, jsonItem.time, jsonItem.size, jsonItem.is_managed, jsonItem.content, jsonItem.md5, jsonItem.sha1);
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
            notify.set('loading...');
            load(function () {
                item.isLoaded = true;
                notify.set();
                event.pub('location.changed', item);
            });
        }
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


    if (history) {
        window.onpopstate = function (e) {

            if (e.state && e.state.absHref) {
                setLocation(e.state.absHref, true);
            }
        };
    }

    event.sub('ready', function () {

        setLocation(document.location.href, true);
    });


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
