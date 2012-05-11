
module.define('view/viewmode', [jQuery, 'core/settings', 'core/resource', 'core/store'], function ($, allsettings, resource, store) {

	var defaults = {
			modes: ['details', 'list', 'icons'],
			setParentFolderLabels: false
		},

		settings = _.extend({}, defaults, allsettings.view),

		storekey = 'h5ai.viewmode',

		template = '<li id="view-[MODE]" class="view">' +
						'<a href="#">' +
							'<img src="' + resource.image('view-[MODE]') + '" alt="view-[MODE]" />' +
							'<span class="l10n-[MODE]">[MODE]</span>' +
						'</a>' +
					'</li>',

		update = function (viewmode) {

			var $extended = $('#extended');

			viewmode = _.indexOf(settings.modes, viewmode) >= 0 ? viewmode : settings.modes[0];
			store.put(storekey, viewmode);

			_.each(defaults.modes, function (mode) {
				if (mode === viewmode) {
					$('#view-' + mode).addClass('current');
					$extended.addClass('view-' + mode).show();
				} else {
					$('#view-' + mode).removeClass('current');
					$extended.removeClass('view-' + mode);
				}
			});
		},

		init = function () {

			var $navbar = $('#navbar');

			settings.modes = _.intersection(settings.modes, defaults.modes);

			if (settings.modes.length > 1) {
				_.each(defaults.modes.reverse(), function (mode) {
					if (_.indexOf(settings.modes, mode) >= 0) {
						$(template.replace(/\[MODE\]/g, mode))
							.appendTo($navbar)
							.on('click', 'a', function (event) {
								update(mode);
								event.preventDefault();
							});
					}
				});
			}

			update(store.get(storekey));
		};

	init();
});
