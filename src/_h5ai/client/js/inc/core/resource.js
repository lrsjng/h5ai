
modulejs.define('core/resource', ['core/settings'], function (settings) {

	var api = function () {

			return settings.h5aiAbsHref + 'server/php/api.php';
		},
		image = function (id, noPngExt) {

			return settings.h5aiAbsHref + 'client/images/' + id + (noPngExt ? '' : '.png');
		},
		icon = function (id, big) {

			return settings.h5aiAbsHref + 'client/icons/' + (big ? '48x48' : '16x16') + '/' + id + '.png';
		};

	return {
		api: api,
		image: image,
		icon: icon
	};
});
