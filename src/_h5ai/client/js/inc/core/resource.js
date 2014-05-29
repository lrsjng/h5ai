
modulejs.define('core/resource', ['core/settings'], function (settings) {

	var image = function (id) {

			return settings.appUrl + 'client/images/' + id + '.svg';
		},

		icon = function (id) {

			// return settings.appUrl + 'client/themes/faenza/icons/' + id + '.png';
			return settings.appUrl + 'client/themes/evolvere/icons/' + id + '.svg';
		};

	return {
		image: image,
		icon: icon
	};
});
