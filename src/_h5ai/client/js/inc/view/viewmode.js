
modulejs.define('view/viewmode', ['_', '$', 'core/settings', 'core/resource', 'core/store', 'core/event'], function (_, $, allsettings, resource, store, event) {

	var modes = ['details', 'grid', 'icons'],
		sizes = [16, 24, 32, 48, 64, 96],

		settings = _.extend({}, {
			modes: modes,
			sizes: sizes
		}, allsettings.view),

		storekey = 'viewmode',

		template = '<li id="view-[MODE]" class="view">' +
						'<a href="#">' +
							'<img src="' + resource.image('view-[MODE]') + '" alt="view-[MODE]"/>' +
							'<span class="l10n-[MODE]"/>' +
						'</a>' +
					'</li>',

		sizeTemplate = '<li id="view-[SIZE]" class="view">' +
							'<a href="#">' +
								'<img src="' + resource.image('size') + '" alt="size"/>' +
								'<span>[SIZE]</span>' +
							'</a>' +
						'</li>',

		adjustSpacing = function () {

			var contentWidth = $('#content').width(),
				$view = $('#view'),
				itemWidth = ($view.hasClass('view-icons') || $view.hasClass('view-grid')) ? ($view.find('.item').eq(0).outerWidth(true) || 1) : 1;

			$view.width(Math.floor(contentWidth / itemWidth) * itemWidth);
		},

		update = function (mode, size) {

			var $view = $('#view'),
				stored = store.get(storekey);

			mode = mode || stored && stored.mode;
			size = size || stored && stored.size;
			mode = _.contains(settings.modes, mode) ? mode : settings.modes[0];
			size = _.contains(settings.sizes, size) ? size : settings.sizes[0];
			store.put(storekey, {mode: mode, size: size});

			_.each(modes, function (m) {
				if (m === mode) {
					$('#view-' + m).addClass('current');
					$view.addClass('view-' + m).show();
				} else {
					$('#view-' + m).removeClass('current');
					$view.removeClass('view-' + m);
				}
			});

			_.each(sizes, function (s) {
				if (s === size) {
					$('#view-' + s).addClass('current');
					$view.addClass('size-' + s).show();
				} else {
					$('#view-' + s).removeClass('current');
					$view.removeClass('size-' + s);
				}
			});

			adjustSpacing();
		},

		init = function () {

			var $navbar = $('#navbar');

			settings.modes = _.intersection(settings.modes, modes);

			if (settings.modes.length > 1) {
				_.each(modes.slice(0).reverse(), function (mode) {
					if (_.contains(settings.modes, mode)) {
						$(template.replace(/\[MODE\]/g, mode))
							.appendTo($navbar)
							.on('click', 'a', function (event) {
								update(mode);
								event.preventDefault();
							});
					}
				});
			}

			if (settings.sizes.length > 1) {
				_.each(sizes.slice(0).reverse(), function (size) {
					if (_.contains(settings.sizes, size)) {
						$(sizeTemplate.replace(/\[SIZE\]/g, size))
							.appendTo($navbar)
							.on('click', 'a', function (event) {
								update(null, size);
								event.preventDefault();
							});
					}
				});
			}

			update();

			event.sub('location.changed', adjustSpacing);
			$(window).on('resize', adjustSpacing);
		};

	init();
});
