
modulejs.define('core/location', ['$', 'core/event'], function ($, event) {

	var doc = document,

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

		absHref = (function () {

			var rePrePathname = /.*:\/\/[^\/]*/,
				rePostPathname = /[^\/]*$/,

				uriToPathname = function (uri) {

					return uri.replace(rePrePathname, '').replace(rePostPathname, '');
				},

				testpathname = '/a b',
				a = doc.createElement('a'),
				isDecoded, location;

			a.href = testpathname;
			isDecoded = uriToPathname(a.href) === testpathname;

			a.href = doc.location.href;
			location = uriToPathname(a.href);

			if (isDecoded) {
				location = encodeURIComponent(location).replace(/%2F/ig, '/');
			}

			return forceEncoding(location);
		}());

	return {
		domain: doc.domain,
		absHref: absHref,
		forceEncoding: forceEncoding
	};
});
