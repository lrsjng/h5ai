
modulejs.define('ext/preview', ['_', '$', 'core/settings', 'core/resource', 'core/store', 'core/event', 'core/location'], function (_, $, allsettings, resource, store, event, location) {

	var settings = _.extend({
			enabled: true
		}, allsettings['preview']),

		template = '<div id="pv-overlay" class="noSelection">' +
						'<div id="pv-content">' +
							'<img id="pv-image"/>' +
						'</div>' +
						'<div id="pv-spinner">' +
							'<img src="' + resource.image('spinner') + '"/>' +
						'</div>' +
						'<div id="pv-close"/>' +
						'<div id="pv-prev"/>' +
						'<div id="pv-next"/>' +
						'<div id="pv-bottombar" class="clearfix">' +
							'<ul id="pv-buttons">' +
								'<li id="pv-bar-close" class="bar-right bar-button"><img src="' + resource.image('preview/close') + '"/></li>' +
								'<li id="pv-bar-original" class="bar-right"><a class="bar-button" target="_blank"><img src="' + resource.image('preview/raw') + '"/></a></li>' +
								'<li id="pv-bar-fullscreen" class="bar-right bar-button"><img src="' + resource.image('preview/fullscreen') + '"/></li>' +
								'<li id="pv-bar-next" class="bar-right bar-button"><img src="' + resource.image('preview/next') + '"/></li>' +
								'<li id="pv-bar-idx" class="bar-right bar-label"/>' +
								'<li id="pv-bar-prev" class="bar-right bar-button"><img src="' + resource.image('preview/prev') + '"/></li>' +
							'</ul>' +
						'</div>' +
					'</div>',

		storekey = 'preview.isFullscreen',

		currentEntries = [],
		currentIdx = 0,
		isFullscreen = store.get(storekey) || false,

		adjustSize = function () {

			var rect = $(window).fracs('viewport'),
				$container = $('#pv-content'),
				$spinner = $('#pv-spinner'),
				$spinnerimg = $spinner.find('img').width(100).height(100),
				$img = $('#pv-image'),
				margin = isFullscreen ? 0 : 20,
				barheight = isFullscreen ? 0 : 31;

			$container.add($spinner).css({
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
			$spinnerimg.css({
				margin: '' + (($spinner.height() - $spinnerimg.height()) / 2) + 'px ' + (($spinner.width() - $spinnerimg.height()) / 2) + 'px'
			});

			rect = $img.fracs('rect');
			if (!rect) {
				return;
			}
			rect = rect.relativeTo($('#pv-overlay').fracs('rect'));

			$('#pv-prev').css({
				left: rect.left,
				top: rect.top,
				width: rect.width / 2,
				height: rect.height
			});
			$('#pv-next').css({
				left: rect.left + rect.width / 2,
				top: rect.top,
				width: rect.width / 2,
				height: rect.height
			});

			$('#pv-bar-percent').text('' + (100 * $img.width() / $img[0].naturalWidth).toFixed(0) + '%');
			if (isFullscreen) {
				$('#pv-overlay').addClass('fullscreen');
				$('#pv-bar-fullscreen').find('img').attr('src', resource.image('preview/no-fullscreen'));
				$('#pv-bottombar').fadeOut(400);
			} else {
				$('#pv-overlay').removeClass('fullscreen');
				$('#pv-bar-fullscreen').find('img').attr('src', resource.image('preview/fullscreen'));
				$('#pv-bottombar').fadeIn(200);
			}
		},

		onEnter = function (items, idx) {

			$(window).on('keydown', onKeydown);
			$('#pv-image').hide();
			$('#pv-overlay').stop(true, true).fadeIn(200);

			currentEntries = items;
			adjustSize();
		},

		onNext = function () {

			if (_.isFunction(onIndexChange)) {
				onIndexChange(1);
			}
		},

		onPrevious = function () {

			if (_.isFunction(onIndexChange)) {
				onIndexChange(-1);
			}
		},

		onExit = function () {

			$(window).off('keydown', onKeydown);
			$('#pv-overlay').stop(true, true).fadeOut(200);
		},

		onFullscreen = function () {

			isFullscreen = !isFullscreen;
			store.put(storekey, isFullscreen);

			adjustSize();
		},

		onKeydown = function (event) {

			var key = event.which;

			if (key === 27) { // esc
				event.preventDefault();
				event.stopImmediatePropagation();
				onExit();
			} else if (key === 8 || key === 37 || key === 40) { // backspace, left, down
				event.preventDefault();
				event.stopImmediatePropagation();
				onPrevious();
			} else if (key === 13 || key === 32 || key === 38 || key === 39) { // enter, space, up, right
				event.preventDefault();
				event.stopImmediatePropagation();
				onNext();
			} else if (key === 70) { // f
				event.preventDefault();
				event.stopImmediatePropagation();
				onFullscreen();
			}
		},

		setIndex = function (idx, total) {

			if (_.isNumber(idx)) {
				$('#pv-bar-idx').show().text('' + idx + (_.isNumber(total) ? '/' + total : ''));
			} else {
				$('#pv-bar-idx').hide();
			}
		},

		setLabels = function (labels) {

			$('#pv-buttons .bar-left').remove();
			_.each(labels, function (label) {

				$('<li />')
					.addClass('bar-left bar-label')
					.text(label)
					.appendTo('#pv-buttons');
			});
		},

		onIndexChange = null,
		setOnIndexChange = function (fn) {

			onIndexChange = fn;
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			$(template).appendTo('body');
			$('#pv-bar-prev, #pv-prev').on('click', onPrevious);
			$('#pv-bar-next, #pv-next').on('click', onNext);
			$('#pv-bar-close, #pv-close').on('click', onExit);
			$('#pv-bar-fullscreen').on('click', onFullscreen);

			$('#pv-prev')
				.on('mouseenter', function () {
					$('#pv-bar-prev').addClass('hover');
				})
				.on('mouseleave', function () {
					$('#pv-bar-prev').removeClass('hover');
				});

			$('#pv-next')
				.on('mouseenter', function () {
					$('#pv-bar-next').addClass('hover');
				})
				.on('mouseleave', function () {
					$('#pv-bar-next').removeClass('hover');
				});

			$('#pv-close')
				.on('mouseenter', function () {
					$('#pv-bar-close').addClass('hover');
				})
				.on('mouseleave', function () {
					$('#pv-bar-close').removeClass('hover');
				});

			$('#pv-overlay')
				.on('keydown', onKeydown)
				.on('mousemove', function (event) {

					if (isFullscreen) {
						var rect = $('#pv-overlay').fracs('rect');

						if (rect.bottom - event.pageY < 64) {
							$('#pv-bottombar').fadeIn(200);
						} else {
							$('#pv-bottombar').fadeOut(400);
						}
					}
				})
				.on('click mousedown mousemove keydown keypress', function (event) {

					event.stopImmediatePropagation();
				});

			$(window).on('resize load', adjustSize);
		};

	init();

	return {
		setIndex: setIndex,
		setLabels: setLabels,
		setOnIndexChange: setOnIndexChange
	};
});
