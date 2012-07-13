
modulejs.define('ext/preview-img', ['_', '$', 'core/settings', 'core/resource', 'core/store', 'core/entry'], function (_, $, allsettings, resource, store, entry) {

	var defaults = {
			enabled: false,
			types: ['bmp', 'gif', 'ico', 'image', 'jpg', 'png', 'tiff']
		},

		settings = _.extend({}, defaults, allsettings['preview-img']),

		template = '<div id="preview-overlay" class="noSelection">' +
						'<div id="preview-content">' +
							'<img id="preview-img" />' +
						'</div>' +
						'<div id="preview-close" />' +
						'<div id="preview-prev" />' +
						'<div id="preview-next" />' +
						'<div id="preview-bottombar" class="clearfix">' +
							'<ul id="preview-buttons">' +
								'<li id="preview-bar-size" class="bar-left bar-label"></li>' +
								'<li id="preview-bar-percent" class="bar-left bar-label"></li>' +
								'<li id="preview-bar-label" class="bar-left bar-label"></li>' +
								'<li id="preview-bar-close" class="bar-right bar-button"><img src="' + resource.image('preview/close') + '" /></li>' +
								'<li id="preview-bar-original" class="bar-right"><a class="bar-button" target="_blank"><img src="' + resource.image('preview/image') + '" /></a></li>' +
								'<li id="preview-bar-fullscreen" class="bar-right bar-button"><img src="' + resource.image('preview/fullscreen') + '" /></li>' +
								'<li id="preview-bar-next" class="bar-right bar-button"><img src="' + resource.image('preview/next') + '" /></li>' +
								'<li id="preview-bar-idx" class="bar-right bar-label"></li>' +
								'<li id="preview-bar-prev" class="bar-right bar-button"><img src="' + resource.image('preview/prev') + '" /></li>' +
							'</ul>' +
						'</div>' +
					'</div>',

		storekey = 'h5ai.preview-img.isFullscreen',

		currentEntries = [],
		currentIdx = 0,
		isFullscreen = store.get(storekey) || false,

		adjustSize = function () {

			var rect = $(window).fracs('viewport'),
				$container = $('#preview-content'),
				$img = $('#preview-img'),
				margin = isFullscreen ? 0 : 20,
				barheight = isFullscreen ? 0 : 31;

			$container.css({
				width: rect.width - 2 * margin,
				height: rect.height - 2 * margin - barheight,
				left: margin,
				top: margin
			});

			var lr = ($container.width() - $img.width()) / 2,
				tb = ($container.height() - $img.height()) / 2;

			$img.css({
				margin: '' + tb + 'px ' + lr + 'px'
			});

			rect = $img.fracs('rect');
			if (!rect) {
				// console.log('RECT FAILED!');
				return;
			}
			rect = rect.relativeTo($('#preview-overlay').fracs('rect'));

			$('#preview-prev').css({
				'left': rect.left,
				'top': rect.top,
				'width': rect.width / 2,
				'height': rect.height
			});
			$('#preview-next').css({
				'left': rect.left + rect.width / 2,
				'top': rect.top,
				'width': rect.width / 2,
				'height': rect.height
			});
		},

		preload = function (src, callback) {

			var $hidden = $('<div><img/></div>')
							.css({
								position: 'absolute',
								overflow: 'hidden',
								width: 0,
								height: 0
							})
							.appendTo('body'),
				$img = $hidden.find('img')
							.one('load', function () {

								var width = $img.width(),
									height = $img.height();

								$hidden.remove();

								callback(width, height);
							})
							.attr('src', src);
		},

		showImg = function (entries, idx) {

			currentEntries = entries;
			currentIdx = (idx + currentEntries.length) % currentEntries.length;

			var $container = $('#preview-content'),
				$img = $('#preview-img'),
				src = currentEntries[currentIdx].absHref,
				spinnerTimeout = setTimeout(function () {

					$container.spin({
						length: 12,
						width: 4,
						radius: 24,
						color: '#ccc',
						shadow: true
					});
				}, 200);

			$('#preview-overlay').stop(true, true).fadeIn(200);
			$('#preview-bar-idx').text('' + (currentIdx + 1) + ' / ' + currentEntries.length);

			preload(src, function (width, height) {

				clearTimeout(spinnerTimeout);
				$container.spin(false);

				$img.attr('src', src).show();

				adjustSize();

				$('#preview-bar-label').text(currentEntries[currentIdx].label);
				$('#preview-bar-percent').text('' + (100 * $img.width() / width).toFixed(0) + '%');
				$('#preview-bar-size').text('' + width + 'x' + height);
				$('#preview-bar-idx').text('' + (currentIdx + 1) + ' / ' + currentEntries.length);
				$('#preview-bar-original').find('a').attr('href', currentEntries[currentIdx].absHref);
			});
		},

		checkEntry = function (entry) {

			if (entry.$extended && $.inArray(entry.type, settings.types) >= 0) {

				var $a = entry.$extended.find('a');
				$a.on('click', function (event) {

					event.preventDefault();

					var entries = _.filter(_.map($('#extended .entry'), function (entry) {

							return $(entry).data('entry');
						}), function (entry) {

							return _.indexOf(settings.types, entry.type) >= 0;
						});

					showImg(entries, _.indexOf(entries, entry));
				});
			}
		},

		init = function (entry) {

			if (!settings.enabled) {
				return;
			}

			$(template).appendTo('body');

			_.each(entry.content, checkEntry);

			$('#preview-bar-prev, #preview-prev').on('click', function (event) {
				// event.stopPropagation();
				showImg(currentEntries, currentIdx - 1);
			});
			$('#preview-prev')
				.on('mouseenter', function (event) {
					// event.stopPropagation();
					$('#preview-bar-prev').addClass('hover');
				})
				.on('mouseleave', function (event) {
					// event.stopPropagation();
					$('#preview-bar-prev').removeClass('hover');
				});

			$('#preview-bar-next, #preview-next').on('click', function (event) {
				// event.stopPropagation();
				showImg(currentEntries, currentIdx + 1);
			});
			$('#preview-next')
				.on('mouseenter', function (event) {
					// event.stopPropagation();
					$('#preview-bar-next').addClass('hover');
				})
				.on('mouseleave', function (event) {
					// event.stopPropagation();
					$('#preview-bar-next').removeClass('hover');
				});

			$('#preview-bar-close, #preview-close').on('click', function () {
				// event.stopPropagation();
				$('#preview-overlay').stop(true, true).fadeOut(200);
			});
			$('#preview-close')
				.on('mouseenter', function (event) {
					// event.stopPropagation();
					$('#preview-bar-close').addClass('hover');
				})
				.on('mouseleave', function (event) {
					// event.stopPropagation();
					$('#preview-bar-close').removeClass('hover');
				});

			$('#preview-bar-fullscreen').on('click', function (event) {
				// event.stopPropagation();
				isFullscreen = !isFullscreen;
				store.put(storekey, isFullscreen);
				$('#preview-bar-fullscreen').find('img').attr('src', isFullscreen ? resource.image('preview/no-fullscreen') : resource.image('preview/fullscreen'));
				adjustSize();
			});

			$('#preview-overlay')
				.on('mousedown', function (event) {

					event.stopPropagation();
				})
				.on('mousemove', function (event) {

					if (isFullscreen) {
						var rect = $('#preview-overlay').fracs('rect');

						if (rect.bottom - event.pageY < 64) {
							$('#preview-bottombar').fadeIn(200);
						} else {
							$('#preview-bottombar').fadeOut(400);
						}
					}
				});

			$(window).on('resize load', adjustSize);
		};

	init(entry);
});
