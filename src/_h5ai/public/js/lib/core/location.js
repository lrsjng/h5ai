const {win} = require('../globals');
const {request} = require('../server');
const allsettings = require('./settings');
const event = require('./event');
const notification = require('../view/notification');

const each = (obj, fn) => Object.keys(obj).forEach(key => fn(obj[key], key));
const values = obj => Object.keys(obj).map(key => obj[key]);
const isFn = x => typeof x === 'function';
const difference = (arr1, arr2) => arr1.filter(x => arr2.indexOf(x) < 0);

const doc = win.document;
const settings = Object.assign({
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


const forceEncoding = href => {
    return reForceEncoding.reduce((nuHref, data) => {
        return nuHref.replace(data[0], data[1]);
    }, href);
};

const uriToPathname = uri => {
    return uri.replace(reUriToPathname, '');
};

const hrefsAreDecoded = (() => {
    const testpathname = '/a b';
    const a = doc.createElement('a');

    a.href = testpathname;
    return uriToPathname(a.href) === testpathname;
})();

const encodedHref = href => {
    const a = doc.createElement('a');
    let location;

    a.href = href;
    location = uriToPathname(a.href);

    if (hrefsAreDecoded) {
        location = encodeURIComponent(location).replace(/%2F/ig, '/');
    }

    return forceEncoding(location);
};

const getDomain = () => {
    return doc.domain;
};

const getAbsHref = () => {
    return absHref;
};

const getItem = () => {
    const Item = require('../model/item');
    return Item.get(absHref);
};

const load = callback => {
    request({action: 'get', items: {href: absHref, what: 1}}).then(json => {
        const Item = require('../model/item');
        const item = Item.get(absHref);

        if (json) {
            const found = {};

            each(json.items, jsonItem => {
                const e = Item.get(jsonItem);
                found[e.absHref] = true;
            });

            each(item.content, e => {
                if (!found[e.absHref]) {
                    Item.remove(e.absHref);
                }
            });
        }
        if (isFn(callback)) {
            callback(item);
        }
    });
};

const refresh = () => {
    const item = getItem();
    const oldItems = values(item.content);

    event.pub('location.beforeRefresh');

    load(() => {
        const newItems = values(item.content);
        const added = difference(newItems, oldItems);
        const removed = difference(oldItems, newItems);

        event.pub('location.refreshed', item, added, removed);
    });
};

const setLocation = (newAbsHref, keepBrowserUrl) => {
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
};

const setLink = ($el, item) => {
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
};

const onPopState = ev => {
    if (ev.state && ev.state.absHref) {
        setLocation(ev.state.absHref, true);
    }
};


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
