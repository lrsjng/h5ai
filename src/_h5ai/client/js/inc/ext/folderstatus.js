
modulejs.define('ext/folderstatus', ['_', 'core/settings'], function (_, allsettings) {

	var settings = _.extend({
			enabled: false,
			folders: {}
		}, allsettings.folderstatus);

	return settings.enabled ? settings.folders : {};
});
