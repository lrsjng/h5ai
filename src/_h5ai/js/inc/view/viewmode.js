
module.define('view/viewmode', [jQuery, 'core/settings', 'core/resource', 'core/store'], function ($, allsettings, resource, store) {

	var defaults = {
			modes: ['details', 'icons'],
			setParentFolderLabels: false
		},

		settings = _.extend({}, defaults, allsettings.view),

		storekey = 'h5ai.viewmode',

		templates = {
			details: '<li id="viewdetails" class="view">' +
							'<a href="#">' +
								'<img src="' + resource.image('view-details') + '" alt="view-details" />' +
								'<span class="l10n-details">details</span>' +
							'</a>' +
						'</li>',
			icons: '<li id="viewicons" class="view">' +
							'<a href="#">' +
								'<img src="' + resource.image('view-icons') + '" alt="view-icons" />' +
								'<span class="l10n-icons">icons</span>' +
							'</a>' +
						'</li>'
		},

		update = function (viewmode) {

			var $viewDetails = $('#viewdetails'),
				$viewIcons = $('#viewicons'),
				$extended = $('#extended');

			if (viewmode) {
				store.put(storekey, viewmode);
			} else {
				viewmode = store.get(storekey);
			}
			viewmode = $.inArray(viewmode, settings.modes) >= 0 ? viewmode : settings.modes[0];

			$viewDetails.add($viewIcons).removeClass('current');
			if (viewmode === 'details') {
				$viewDetails.addClass('current');
				$extended.addClass('details-view').removeClass('icons-view').show();
			} else if (viewmode === 'icons') {
				$viewIcons.addClass('current');
				$extended.removeClass('details-view').addClass('icons-view').show();
			} else {
				$extended.hide();
			}
		},

		init = function () {

			var $navbar = $('#navbar'),
				$extended = $('#extended');

			settings.modes = _.intersection(settings.modes, defaults.modes);

			if (settings.modes.length > 1) {
				_.each(['icons', 'details'], function (view) {
					if ($.inArray(view, settings.modes) >= 0) {
						$(templates[view])
							.appendTo($navbar)
							.on('click', 'a', function (event) {
								update(view);
								event.preventDefault();
							});
					}
				});
			}

			update();
		};

	init();
});
