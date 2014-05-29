
modulejs.define('core/resource', ['core/settings'], function (settings) {

	var image = function (id) {

			return settings.appHref + 'client/images/' + id + '.svg';
		},

		icon = function (id) {

			return settings.appHref + 'client/themes/faenza/icons/' + id + '.png';
			// return settings.appHref + 'client/themes/evolvere/icons/' + id + '.svg';
		};

	return {
		image: image,
		icon: icon
	};
});
