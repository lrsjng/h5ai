
modulejs.define('core/resource', ['core/settings'], function (settings) {

	var image = function (id) {

			return settings.h5aiAbsHref + 'client/images/' + id + '.svg';
		},

		icon = function (id) {

			return settings.h5aiAbsHref + 'client/icons/96/' + id + '.png';
		};

	return {
		image: image,
		icon: icon
	};
});
