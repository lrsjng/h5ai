
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

		// sizeSelectorTemplate = '<li id="sizeSelector" class="view">' +
		// 							'<span class="element">' +
		// 								'<img src="' + resource.image('size') + '" alt="size"/>' +
		// 								'<span class="size-current">small</span>' +
		// 							'</span>' +
		// 							'<span class="sizeOptions hidden"><ul/></span>' +
		// 						'</li>',
		// sizeOptionTemplate = '<li class="sizeOption"/>',

		// viewSelectorTemplate = '<li id="viewSelector" class="view">' +
		// 							'<span class="element">' +
		// 								'<img src="' + resource.image('view-details') + '" alt="view-details"/>' +
		// 								'<span class="view-current">details</span>' +
		// 							'</span>' +
		// 							'<span class="viewOptions hidden"><ul/></span>' +
		// 						'</li>',
		// viewOptionTemplate = '<li class="viewOption"/>',


		adjustSpacing = function () {

			var contentWidth = $('#content').width(),
				$view = $('#view'),
				itemWidth = ($view.hasClass('view-icons') || $view.hasClass('view-grid')) ? ($view.find('.item').eq(0).width() || 1) : 1;

			$view.width(Math.floor(contentWidth / itemWidth) * itemWidth);
		},

		updateMode = function (mode) {

			var $view = $('#view');

			mode = _.contains(settings.modes, mode) ? mode : settings.modes[0];
			store.put(storekey, mode);

			_.each(modes, function (m) {
				if (m === mode) {
					$('#view-' + m).addClass('current');
					$view.addClass('view-' + m).show();
				} else {
					$('#view-' + m).removeClass('current');
					$view.removeClass('view-' + m);
				}
			});

			adjustSpacing();
		},

		updateSize = function (size) {

			var $view = $('#view');

			size = _.contains(settings.sizes, size) ? size : settings.sizes[0];
			// store.put(storekey, viewmode);

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

			if (settings.modes.length) {
				_.each(modes.slice(0).reverse(), function (mode) {
					if (_.contains(settings.modes, mode)) {
						$(template.replace(/\[MODE\]/g, mode))
							.appendTo($navbar)
							.on('click', 'a', function (event) {
								updateMode(mode);
								event.preventDefault();
							});
					}
				});
			}


			if (settings.sizes.length) {
				_.each(sizes.slice(0).reverse(), function (size) {
					if (_.contains(settings.sizes, size)) {
						$(sizeTemplate.replace(/\[SIZE\]/g, size))
							.appendTo($navbar)
							.on('click', 'a', function (event) {
								updateSize(size);
								event.preventDefault();
							});
					}
				});
			}

			// $(sizeSelectorTemplate)
			// 	.appendTo($navbar);

			// $(viewSelectorTemplate)
			// 	.appendTo($navbar);

			updateMode(store.get(storekey));
			updateSize(sizes[0]);

			event.sub('location.changed', adjustSpacing);
			$(window).on('resize', adjustSpacing);
		};

	init();
});
