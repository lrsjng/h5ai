
modulejs.define('ext/title', ['_', 'core/settings', 'core/entry'], function (_, allsettings, entry) {

	var defaults = {
			enabled: false
		},

		settings = _.extend({}, defaults, allsettings.title),

		init = function (entry) {

			if (!settings.enabled) {
				return;
			}

			var labels = _.pluck(entry.getCrumb(), 'label'),
				title = labels.join(' > ');

			if (labels.length > 1) {
				title = labels[labels.length - 1] + ' - ' + title;
			}

			document.title = title;
		};

	init(entry);
});
