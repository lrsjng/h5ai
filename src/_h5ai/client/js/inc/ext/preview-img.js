
modulejs.define('ext/preview-img', ['_', '$', 'core/settings', 'core/resource', 'core/store', 'core/event', 'core/location'], function (_, $, allsettings, resource, store, event, location) {

	var settings = _.extend({
			enabled: false,
			types: ['bmp', 'gif', 'ico', 'image', 'jpg', 'png', 'tiff']
		}, allsettings['preview-img']),

		template = '<div id="pv-img-overlay" class="noSelection">' +
						'<div id="pv-img-content">' +
							'<img id="pv-img-image"/>' +
						'</div>' +
						'<div id="pv-img-close"/>' +
						'<div id="pv-img-prev"/>' +
						'<div id="pv-img-next"/>' +
						'<div id="pv-img-bottombar" class="clearfix">' +
							'<ul id="pv-img-buttons">' +
								'<li id="pv-img-bar-size" class="bar-left bar-label"/>' +
								'<li id="pv-img-bar-percent" class="bar-left bar-label"/>' +
								'<li id="pv-img-bar-label" class="bar-left bar-label"/>' +
								'<li id="pv-img-bar-close" class="bar-right bar-button"><img src="' + resource.image('preview/close') + '"/></li>' +
								'<li id="pv-img-bar-original" class="bar-right"><a class="bar-button" target="_blank"><img src="' + resource.image('preview/raw') + '"/></a></li>' +
								'<li id="pv-img-bar-fullscreen" class="bar-right bar-button"><img src="' + resource.image('preview/fullscreen') + '"/></li>' +
								'<li id="pv-img-bar-next" class="bar-right bar-button"><img src="' + resource.image('preview/next') + '"/></li>' +
								'<li id="pv-img-bar-idx" class="bar-right bar-label"/>' +
								'<li id="pv-img-bar-prev" class="bar-right bar-button"><img src="' + resource.image('preview/prev') + '"/></li>' +
							'</ul>' +
						'</div>' +
					'</div>',

		storekey = 'preview-img.isFullscreen',

		currentEntries = [],
		currentIdx = 0,
		isFullscreen = store.get(storekey) || false,

		adjustSize = function () {

			var rect = $(window).fracs('viewport'),
				$container = $('#pv-img-content'),
				$img = $('#pv-img-image'),
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
			rect = rect.relativeTo($('#pv-img-overlay').fracs('rect'));

			$('#pv-img-prev').css({
				left: rect.left,
				top: rect.top,
				width: rect.width / 2,
				height: rect.height
			});
			$('#pv-img-next').css({
				left: rect.left + rect.width / 2,
				top: rect.top,
				width: rect.width / 2,
				height: rect.height
			});

			if (isFullscreen) {
				$('#pv-img-overlay').addClass('fullscreen');
				$('#pv-img-bar-fullscreen').find('img').attr('src', resource.image('preview/no-fullscreen'));
				$('#pv-img-bottombar').fadeOut(400);
			} else {
				$('#pv-img-overlay').removeClass('fullscreen');
				$('#pv-img-bar-fullscreen').find('img').attr('src', resource.image('preview/fullscreen'));
				$('#pv-img-bottombar').fadeIn(200);
			}
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

								$hidden.remove();
								callback($img);
								// setTimeout(function () { callback($img); }, 1000); // for testing
							})
							.attr('src', src);
		},

		onIndexChange = function (idx) {

			currentIdx = (idx + currentEntries.length) % currentEntries.length;

			var $container = $('#pv-img-content'),
				$img = $('#pv-img-image'),
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

			preloadImg(src, function ($preloaded_img) {

				clearTimeout(spinnerTimeout);
				$container.spin(false);

				$('#pv-img-image').fadeOut(100, function () {

					var width = $preloaded_img.width(),
						height = $preloaded_img.height();

					$('#pv-img-image').replaceWith($preloaded_img.hide());
					$preloaded_img.attr('id', 'pv-img-image').fadeIn(200);

					// small timeout, so $preloaded_img is visible and therefore $preloaded_img.width is available
					setTimeout(function () {
						adjustSize();
						$('#pv-img-bar-percent').text('' + (100 * $preloaded_img.width() / width).toFixed(0) + '%');
						$('#pv-img-bar-label').text(currentEntries[currentIdx].label);
						$('#pv-img-bar-size').text('' + width + 'x' + height);
						$('#pv-img-bar-idx').text('' + (currentIdx + 1) + ' / ' + currentEntries.length);
						$('#pv-img-bar-original').find('a').attr('href', currentEntries[currentIdx].absHref);
					}, 10);
				});
			});
		},

		onEnter = function (items, idx) {

			$(window).on('keydown', onKeydown);
			$('#pv-img-overlay').stop(true, true).fadeIn(200);

			currentEntries = items;
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
			$('#pv-img-overlay').stop(true, true).fadeOut(200);
		},

		onFullscreen = function () {

			isFullscreen = !isFullscreen;
			store.put(storekey, isFullscreen);

			adjustSize();
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

			event.preventDefault();
			event.stopImmediatePropagation();
		},

		initItem = function (item) {

			if (item.$view && _.indexOf(settings.types, item.type) >= 0) {
				item.$view.find('a').on('click', function (event) {

					event.preventDefault();

					var matchedEntries = _.compact(_.map($('#items .item'), function (item) {

						item = $(item).data('item');
						return _.indexOf(settings.types, item.type) >= 0 ? item : null;
					}));

					onEnter(matchedEntries, _.indexOf(matchedEntries, item));
				});
			}
		},

		onLocationChanged = function (item) {

			_.each(item.content, initItem);
		},

		onLocationRefreshed = function (item, added, removed) {

			_.each(added, initItem);
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			$(template).appendTo('body');
			$('#pv-img-bar-prev, #pv-img-prev').on('click', onPrevious);
			$('#pv-img-bar-next, #pv-img-next').on('click', onNext);
			$('#pv-img-bar-close, #pv-img-close').on('click', onExit);
			$('#pv-img-bar-fullscreen').on('click', onFullscreen);

			$('#pv-img-prev')
				.on('mouseenter', function () {
					$('#pv-img-bar-prev').addClass('hover');
				})
				.on('mouseleave', function () {
					$('#pv-img-bar-prev').removeClass('hover');
				});

			$('#pv-img-next')
				.on('mouseenter', function () {
					$('#pv-img-bar-next').addClass('hover');
				})
				.on('mouseleave', function () {
					$('#pv-img-bar-next').removeClass('hover');
				});

			$('#pv-img-close')
				.on('mouseenter', function () {
					$('#pv-img-bar-close').addClass('hover');
				})
				.on('mouseleave', function () {
					$('#pv-img-bar-close').removeClass('hover');
				});

			$('#pv-img-overlay')
				.on('keydown', onKeydown)
				.on('mousemove', function (event) {

					if (isFullscreen) {
						var rect = $('#pv-img-overlay').fracs('rect');

						if (rect.bottom - event.pageY < 64) {
							$('#pv-img-bottombar').fadeIn(200);
						} else {
							$('#pv-img-bottombar').fadeOut(400);
						}
					}
				})
				.on('click mousedown mousemove keydown keypress', function (event) {

					event.stopImmediatePropagation();
				});

			event.sub('location.changed', onLocationChanged);
			event.sub('location.refreshed', onLocationRefreshed);

			$(window).on('resize load', adjustSize);
		};

	init();
});
