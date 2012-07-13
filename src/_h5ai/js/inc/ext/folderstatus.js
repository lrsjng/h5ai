
modulejs.define('ext/folderstatus', ['_', 'core/settings'], function (_, allsettings) {

	var defaults = {
			enabled: false,
			folders: {}
		},

		settings = _.extend({}, defaults, allsettings.folderstatus),

		folders = settings.enabled ? settings.folders : defaults.folders;

	return folders;
});
