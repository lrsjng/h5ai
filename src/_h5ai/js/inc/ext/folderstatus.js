
module.define('ext/folderstatus', [jQuery, 'core/settings'], function ($, allsettings) {

	var defaults = {
			enabled: true,
			folders: {}
		},

		settings = _.extend({}, defaults, allsettings.folderstatus),

		folders = settings.enabled ? settings.folders : defaults.folders;

	return folders;
});
