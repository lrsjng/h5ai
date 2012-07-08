
modulejs.define('core/resource', ['core/settings'], function (settings) {

	var api = function () {

			return settings.h5aiAbsHref + 'php/api.php';
		},
		image = function (id, noPngExt) {

			return settings.h5aiAbsHref + 'images/' + id + (noPngExt ? '' : '.png');
		},
		icon = function (id, big) {

			return settings.h5aiAbsHref + 'icons/' + (big ? '48x48' : '16x16') + '/' + id + '.png';
		};

	return {
		api: api,
		image: image,
		icon: icon
	};
});
