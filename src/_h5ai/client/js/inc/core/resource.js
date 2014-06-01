
modulejs.define('core/resource', ['config', 'core/settings'], function (config, settings) {

	var image = function (id) {

			return settings.appHref + 'client/images/' + id + '.svg';
		},

		icon = function (id) {

			return settings.appHref + 'client/themes/' + config.theme[id];
		};

	return {
		image: image,
		icon: icon
	};
});
