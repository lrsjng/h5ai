
modulejs.define('core/resource', ['core/settings'], function (settings) {

	var image = function (id, customExt) {

			return settings.h5aiAbsHref + 'client/images/' + id + (customExt ? '' : '.svg');
		},

		icon = function (id, big) {

			return settings.h5aiAbsHref + 'client/icons/96/' + id + '.png';
		};

	return {
		image: image,
		icon: icon
	};
});
