
modulejs.define('core/resource', ['core/settings'], function (settings) {

	var image = function (id, noPngExt) {

			return settings.h5aiAbsHref + 'client/images/' + id + (noPngExt ? '' : '.png');
		},
		icon = function (id, big) {

			return settings.h5aiAbsHref + 'client/icons/' + (big ? '48x48' : '16x16') + '/' + id + '.png';
		};

	return {
		image: image,
		icon: icon
	};
});
