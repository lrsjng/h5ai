
modulejs.define('view/viewmode', ['_', '$', 'core/settings', 'core/resource', 'core/store', 'core/event'], function (_, $, allsettings, resource, store, event) {

	var modes = ['details', 'grid', 'icons'],
		sizes = [16, 24, 32, 48, 64, 96, 128, 192, 256, 384],

		settings = _.extend({}, {
			modes: modes,
			sizes: sizes
		}, allsettings.view),

		storekey = 'viewmode',
		menuIsVisible = false,

		sidebarToggleTemplate =
			'<li id="menu-toggle" class="view">' +
				'<a href="#">' +
					'<img src="' + resource.image('settings') + '" alt="settings"/>' +
				'</a>' +
			'</li>',

		modeTemplate =
			'<div id="view-[MODE]" class="view">' +
				'<a href="#">' +
					'<img src="' + resource.image('view-[MODE]') + '" alt="view-[MODE]"/>' +
				'</a>' +
			'</div>',

		sizeTemplate =
			'<input id="view-size" type="range" min="0" max="0" value="0">',

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
					$view.addClass('size-' + s).show();
				} else {
					$view.removeClass('size-' + s);
				}
			});

			$('#view-size').val(_.indexOf(_.intersection(sizes, settings.sizes), size));

			adjustSpacing();
		},

		init = function () {

			var $sidebar = $('#sidebar'),
				$settings = $('#settings'),
				$viewBlock = $('<div class="block"/>'),
				max;

			$(sidebarToggleTemplate)
				.on('click', 'a', function (event) {

					menuIsVisible = !menuIsVisible;
					$sidebar.stop().animate({
						right: menuIsVisible ? 0 : -$sidebar.outerWidth()-1
					});
					event.preventDefault();
				})
				.appendTo('#navbar');

			settings.modes = _.intersection(settings.modes, modes);

			if (settings.modes.length > 1) {
				_.each(modes, function (mode) {
					if (_.contains(settings.modes, mode)) {
						$(modeTemplate.replace(/\[MODE\]/g, mode))
							.appendTo($viewBlock)
							.on('click', 'a', function (event) {

								update(mode);
								event.preventDefault();
							});
					}
				});
			}

			if (settings.sizes.length > 1) {
				max = settings.sizes.length-1;
				$(sizeTemplate)
					.prop('max', max).attr('max', max)
					.on('input change', function (event) {

						update(null, settings.sizes[parseInt(event.target.value, 10)]);
					})
					.appendTo($viewBlock);
			}

			$viewBlock.appendTo($settings);

			update();

			event.sub('location.changed', adjustSpacing);
			$(window).on('resize', adjustSpacing);
		};

	init();
});
