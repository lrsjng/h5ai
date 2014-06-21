
modulejs.define('core/location', ['_', 'modernizr', 'core/settings', 'core/event', 'core/notify'], function (_, modernizr, allsettings, event, notify) {

	var settings = _.extend({
			smartBrowsing: true,
			unmanagedInNewWindow: true
		}, allsettings.view),

		doc = document,

		history = settings.smartBrowsing && modernizr.history ? window.history : null,

		forceEncoding = function (href) {

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
		},

		reUriToPathname = /^.*:\/\/[^\/]*|[^\/]*$/g,
		uriToPathname = function (uri) {

			return uri.replace(reUriToPathname, '');
		},

		hrefsAreDecoded = (function () {

			var testpathname = '/a b',
				a = doc.createElement('a');

			a.href = testpathname;
			return uriToPathname(a.href) === testpathname;
		}()),

		encodedHref = function (href) {

			var a = doc.createElement('a'),
				location;

			a.href = href;
			location = uriToPathname(a.href);

			if (hrefsAreDecoded) {
				location = encodeURIComponent(location).replace(/%2F/ig, '/');
			}

			return forceEncoding(location);
		};


	var absHref = null,

		getDomain = function () {

			return doc.domain;
		},

		getAbsHref = function () {

			return absHref;
		},

		getItem = function () {

			return modulejs.require('model/item').get(absHref);
		},

		load = function (callback) {

			modulejs.require('core/server').request({action: 'get', items: true, itemsHref: absHref, itemsWhat: 1}, function (json) {

				var Item = modulejs.require('model/item'),
					item = Item.get(absHref);

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
		},

		setLocation = function (newAbsHref, keepBrowserUrl) {

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
		},

		refresh = function () {

			var item = getItem(),
				oldItems = _.values(item.content);

			event.pub('location.beforeRefresh');

			load(function () {

				var newItems = _.values(item.content),
					added = _.difference(newItems, oldItems),
					removed = _.difference(oldItems, newItems);

				event.pub('location.refreshed', item, added, removed);
			});
		},

		setLink = function ($el, item) {

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
		};


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
