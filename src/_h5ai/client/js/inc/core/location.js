
modulejs.define('core/location', ['_', 'modernizr', 'core/settings', 'core/event', 'core/notify'], function (_, modernizr, allsettings, event, notify) {

	var settings = _.extend({
			smartBrowsing: false
		}, allsettings.view),

		doc = document,

		history = settings.smartBrowsing && modernizr.history ? window.history : null,

		forceEncoding = function (href) {

			return href
					.replace(/\/+/g, '/')
					.replace(/ /g, '%20')
					.replace(/'/g, '%27')
					.replace(/\[/g, '%5B')
					.replace(/\]/g, '%5D')
					.replace(/\(/g, '%28')
					.replace(/\)/g, '%29')
					.replace(/\+/g, '%2B')
					.replace(/\=/g, '%3D');
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

			return modulejs.require('model/entry').get(absHref);
		},

		setLocation = function (newAbsHref, keepBrowserUrl) {

			newAbsHref = encodedHref(newAbsHref);
			if (absHref !== newAbsHref) {
				absHref = newAbsHref;

				notify.set('loading...');
				modulejs.require('core/refresh')(function () {
					notify.set();
					event.pub('location.changed', getItem());
				});

				if (history) {
					if (keepBrowserUrl) {
						history.replaceState({absHref: absHref}, '', absHref);
					} else {
						history.pushState({absHref: absHref}, '', absHref);
					}
				}
			}
		},

		setLink = function ($el, item) {

			$el.attr('href', item.absHref);

			if (history && item.isFolder() && item.status === '=h5ai=') {
				$el.on('click', function () {

					setLocation(item.absHref);
					return false;
				});
			}

			if (item.status !== '=h5ai=') {
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


	return {
		forceEncoding: forceEncoding,
		encodedHref: encodedHref,
		getDomain: getDomain,
		getAbsHref: getAbsHref,
		getItem: getItem,
		setLocation: setLocation,
		setLink: setLink
	};
});
