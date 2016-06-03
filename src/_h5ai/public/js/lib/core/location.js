const {window: win, document: doc, _: lo} = require('../win');
const {request} = require('./server');
const allsettings = require('./settings');
const event = require('./event');

const notification = require('../view/notification');


const settings = lo.extend({
    fastBrowsing: true,
    unmanagedInNewWindow: true
}, allsettings.view);
const history = settings.fastBrowsing ? win.history : null;
const reUriToPathname = /^.*:\/\/[^\/]*|[^\/]*$/g;
const reForceEncoding = [
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


let absHref = null;


function forceEncoding(href) {
    return reForceEncoding.reduce((nuHref, data) => {
        return nuHref.replace(data[0], data[1]);
    }, href);
}

function uriToPathname(uri) {
    return uri.replace(reUriToPathname, '');
}

const hrefsAreDecoded = (() => {
    const testpathname = '/a b';
    const a = doc.createElement('a');

    a.href = testpathname;
    return uriToPathname(a.href) === testpathname;
})();

function encodedHref(href) {
    const a = doc.createElement('a');
    let location;

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
    const Item = require('../model/item');
    return Item.get(absHref);
}

function load(callback) {
    request({action: 'get', items: {href: absHref, what: 1}}).then(json => {
        const Item = require('../model/item');
        const item = Item.get(absHref);

        if (json) {
            const found = {};

            lo.each(json.items, jsonItem => {
                const e = Item.get(jsonItem);
                found[e.absHref] = true;
            });

            lo.each(item.content, e => {
                if (!found[e.absHref]) {
                    Item.remove(e.absHref);
                }
            });
        }
        if (lo.isFunction(callback)) {
            callback(item);
        }
    });
}

function refresh() {
    const item = getItem();
    const oldItems = lo.values(item.content);

    event.pub('location.beforeRefresh');

    load(() => {
        const newItems = lo.values(item.content);
        const added = lo.difference(newItems, oldItems);
        const removed = lo.difference(oldItems, newItems);

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
                history.replaceState({absHref}, '', absHref);
            } else {
                history.pushState({absHref}, '', absHref);
            }
        }
    }

    const item = getItem();
    if (item.isLoaded) {
        event.pub('location.changed', item);
        refresh();
    } else {
        notification.set('loading...');
        load(() => {
            item.isLoaded = true;
            notification.set();
            event.pub('location.changed', item);
        });
    }
}

function setLink($el, item) {
    $el.attr('href', item.absHref);

    if (history && item.isFolder() && item.isManaged) {
        $el.on('click', () => {
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


win.onpopstate = history ? onPopState : null;


module.exports = {
    forceEncoding,
    getDomain,
    getAbsHref,
    getItem,
    setLocation,
    refresh,
    setLink
};
