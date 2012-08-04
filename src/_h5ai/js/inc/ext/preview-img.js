
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
				return;
			}
			rect = rect.relativeTo($('#preview-overlay').fracs('rect'));

			$('#preview-prev').css({
				left: rect.left,
				top: rect.top,
				width: rect.width / 2,
				height: rect.height
			});
			$('#preview-next').css({
				left: rect.left + rect.width / 2,
				top: rect.top,
				width: rect.width / 2,
				height: rect.height
			});
		},

		preloadImg = function (src, callback) {

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
								// setTimeout(function () { callback(width, height); }, 1000); // for testing
							})
							.attr('src', src);
		},

		onIndexChange = function (idx) {

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

			preloadImg(src, function (width, height) {

				clearTimeout(spinnerTimeout);
				$container.spin(false);

				$img.fadeOut(100, function () {

					$img.attr('src', src).fadeIn(200);

					// small timeout, so $img is visible
					setTimeout(function () {
						adjustSize();
						$('#preview-bar-percent').text('' + (100 * $img.width() / width).toFixed(0) + '%');
						$('#preview-bar-label').text(currentEntries[currentIdx].label);
						$('#preview-bar-size').text('' + width + 'x' + height);
						$('#preview-bar-idx').text('' + (currentIdx + 1) + ' / ' + currentEntries.length);
						$('#preview-bar-original').find('a').attr('href', currentEntries[currentIdx].absHref);
					}, 1);
				});

			});
		},

		onEnter = function (entries, idx) {

			$(window).on('keydown', onKeydown);
			$('#preview-overlay').stop(true, true).fadeIn(200);

			currentEntries = entries;
			onIndexChange(idx);
		},

		onNext = function () {

			onIndexChange(currentIdx + 1);
		},

		onPrevious = function () {

			onIndexChange(currentIdx - 1);
		},

		onExit = function () {

			$(window).off('keydown', onKeydown);
			$('#preview-overlay').stop(true, true).fadeOut(200);
		},

		onFullscreen = function () {

			isFullscreen = !isFullscreen;
			store.put(storekey, isFullscreen);

			adjustSize();

			if (isFullscreen) {
				$('#preview-bar-fullscreen').find('img').attr('src', resource.image('preview/no-fullscreen'));
				$('#preview-bottombar').fadeOut(400);
			} else {
				$('#preview-bar-fullscreen').find('img').attr('src', resource.image('preview/fullscreen'));
				$('#preview-bottombar').fadeIn(200);
			}
		},

		onKeydown = function (event) {

			var key = event.which;

			if (key === 27) { // esc
				onExit();
			} else if (key === 8 || key === 37 || key === 40) { // backspace, left, down
				onPrevious();
			} else if (key === 13 || key === 32 || key === 38 || key === 39) { // enter, space, up, right
				onNext();
			} else if (key === 70) { // f
				onFullscreen();
			}
		},

		initEntry = function (entries, entry, idx) {

			if (entry.$extended) {
				entry.$extended.find('a').on('click', function (event) {

					event.preventDefault();
					onEnter(entries, idx);
				});
			}
		},

		init = function (entry) {

			if (!settings.enabled) {
				return;
			}

			var imageEntries = _.filter(entry.content, function (entry) {

				return _.indexOf(settings.types, entry.type) >= 0;
			});
			_.each(imageEntries, function (e, idx) {

				initEntry(imageEntries, e, idx);
			});

			$(template).appendTo('body');
			$('#preview-bar-prev, #preview-prev').on('click', onPrevious);
			$('#preview-bar-next, #preview-next').on('click', onNext);
			$('#preview-bar-close, #preview-close').on('click', onExit);
			$('#preview-bar-fullscreen').on('click', onFullscreen);
			$('#preview-overlay').on('keydown', onKeydown);

			$('#preview-prev')
				.on('mouseenter', function () {
					$('#preview-bar-prev').addClass('hover');
				})
				.on('mouseleave', function () {
					$('#preview-bar-prev').removeClass('hover');
				});

			$('#preview-next')
				.on('mouseenter', function () {
					$('#preview-bar-next').addClass('hover');
				})
				.on('mouseleave', function () {
					$('#preview-bar-next').removeClass('hover');
				});

			$('#preview-close')
				.on('mouseenter', function () {
					$('#preview-bar-close').addClass('hover');
				})
				.on('mouseleave', function () {
					$('#preview-bar-close').removeClass('hover');
				});


			$('#preview-overlay')
				.on('click mousedown mousemove keydown keypress', function (event) {

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
