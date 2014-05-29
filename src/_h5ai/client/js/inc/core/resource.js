
modulejs.define('core/resource', ['core/settings'], function (settings) {

	var image = function (id) {

			return settings.h5aiAbsHref + 'client/images/' + id + '.svg';
		},

		icon = function (id) {

			// return settings.h5aiAbsHref + 'client/themes/faenza/icons/' + id + '.png';
			return settings.h5aiAbsHref + 'client/themes/evolvere/icons/' + id + '.svg';
		};

	return {
		image: image,
		icon: icon
	};
});
