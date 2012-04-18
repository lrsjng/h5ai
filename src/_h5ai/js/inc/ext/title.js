
module.define('ext/title', [jQuery, 'core/settings', 'core/entry'], function ($, allsettings, entry) {

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
