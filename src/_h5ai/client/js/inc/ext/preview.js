
modulejs.define('ext/preview', ['_', '$', 'core/settings', 'core/resource', 'core/store'], function (_, $, allsettings, resource, store) {

	var settings = _.extend({
			enabled: true
		}, allsettings['preview']),

		template = '<div id="pv-overlay" class="noSelection">' +
						'<div id="pv-content"/>' +
						'<div id="pv-spinner"><img src="' + resource.image('spinner') + '"/></div>' +
						'<div id="pv-prev-area" class="hof"><img src="' + resource.image('preview/prev') + '"/></div>' +
						'<div id="pv-next-area" class="hof"><img src="' + resource.image('preview/next') + '"/></div>' +
						'<div id="pv-close-area" class="hof"><img src="' + resource.image('preview/close') + '"/></div>' +
						'<div id="pv-bottombar" class="clearfix hof">' +
							'<ul id="pv-buttons">' +
								'<li id="pv-bar-close" class="bar-right bar-button"><img src="' + resource.image('preview/close') + '"/></li>' +
								'<li id="pv-bar-raw" class="bar-right"><a class="bar-button" target="_blank"><img src="' + resource.image('preview/raw') + '"/></a></li>' +
								'<li id="pv-bar-fullscreen" class="bar-right bar-button"><img src="' + resource.image('preview/fullscreen') + '"/></li>' +
								'<li id="pv-bar-next" class="bar-right bar-button"><img src="' + resource.image('preview/next') + '"/></li>' +
								'<li id="pv-bar-idx" class="bar-right bar-label"/>' +
								'<li id="pv-bar-prev" class="bar-right bar-button"><img src="' + resource.image('preview/prev') + '"/></li>' +
							'</ul>' +
						'</div>' +
					'</div>',

		storekey = 'ext/preview',

		currentEntries = [],
		currentIdx = 0,
		isFullscreen = store.get(storekey) || false,

		adjustSize = function () {

			var rect = $(window).fracs('viewport'),
				$container = $('#pv-content'),
				$spinner = $('#pv-spinner'),
				margin = isFullscreen ? 0 : 20,
				barheight = isFullscreen ? 0 : 31;

			$container.css({
				width: rect.width - 2 * margin,
				height: rect.height - 2 * margin - barheight,
				left: margin,
				top: margin
			});

			$spinner.css({
				left: rect.width * 0.5,
				top: rect.height * 0.5
			});

			if (isFullscreen) {
				$('#pv-overlay').addClass('fullscreen');
				$('#pv-bar-fullscreen').find('img').attr('src', resource.image('preview/no-fullscreen'));
			} else {
				$('#pv-overlay').removeClass('fullscreen');
				$('#pv-bar-fullscreen').find('img').attr('src', resource.image('preview/fullscreen'));
			}

			if (_.isFunction(onAdjustSize)) {
				onAdjustSize(1);
			}
		},

		onEnter = function () {

			$(window).on('keydown', onKeydown);
			$('#pv-content').empty();
			$('#pv-overlay').stop(true, true).fadeIn(200);

			adjustSize();
		},

		onExit = function () {

			$(window).off('keydown', onKeydown);
			$('#pv-overlay').stop(true, true).fadeOut(200);
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

		userAliveTimeoutId = null,
		userAlive = function () {

			clearTimeout(userAliveTimeoutId);
			$('#pv-overlay .hof').stop(true, true).fadeIn(200);

			if (isFullscreen) {

				userAliveTimeoutId = setTimeout(function () {

					$('#pv-overlay .hof').stop(true, true).fadeOut(2000);
				}, 2000);
			}
		},

		onFullscreen = function () {

			isFullscreen = !isFullscreen;
			store.put(storekey, isFullscreen);

			userAlive();
			adjustSize();
		},

		onKeydown = function (event) {

			var key = event.which,
				delay = 300;

			if (key === 27) { // esc
				event.preventDefault();
				event.stopImmediatePropagation();
				$('#pv-bar-close, #pv-close-area').addClass('hover');
				setTimeout(function () { $('#pv-bar-close, #pv-close-area').removeClass('hover'); }, delay);
				onExit();
			} else if (key === 8 || key === 37) { // backspace, left
				event.preventDefault();
				event.stopImmediatePropagation();
				$('#pv-bar-prev, #pv-prev-area').addClass('hover');
				setTimeout(function () { $('#pv-bar-prev, #pv-prev-area').removeClass('hover'); }, delay);
				onPrevious();
			} else if (key === 13 || key === 32 || key === 39) { // enter, space, right
				event.preventDefault();
				event.stopImmediatePropagation();
				$('#pv-bar-next, #pv-next-area').addClass('hover');
				setTimeout(function () { $('#pv-bar-next, #pv-next-area').removeClass('hover'); }, delay);
				onNext();
			} else if (key === 70) { // f
				event.preventDefault();
				event.stopImmediatePropagation();
				$('#pv-bar-fullscreen').addClass('hover');
				setTimeout(function () { $('#pv-bar-fullscreen').removeClass('hover'); }, delay);
				onFullscreen();
			}
		},

		enter = function () {

			onEnter();
		},

		exit = function () {

			onExit();
		},

		setIndex = function (idx, total) {

			if (_.isNumber(idx)) {
				$('#pv-bar-idx').text('' + idx + (_.isNumber(total) ? '/' + total : '')).show();
			} else {
				$('#pv-bar-idx').text('').hide();
			}
		},

		setRawLink = function (href) {

			if (href) {
				$('#pv-bar-raw').find('a').attr('href', href).end().show();
			} else {
				$('#pv-bar-raw').find('a').attr('href', '#').end().hide();
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

		onAdjustSize = null,
		setOnAdjustSize = function (fn) {

			onAdjustSize = fn;
		},

		showSpinner = function (show, millis) {

			if (!_.isNumber(millis)) {
				millis = 400;
			}

			if (show) {
				$('#pv-spinner').stop(true, true).fadeIn(millis);
			} else {
				$('#pv-spinner').stop(true, true).fadeOut(millis);
			}
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			$(template).appendTo('body');

			$('#pv-spinner').hide();
			$('#pv-bar-prev, #pv-prev-area').on('click', onPrevious);
			$('#pv-bar-next, #pv-next-area').on('click', onNext);
			$('#pv-bar-close, #pv-close-area').on('click', onExit);
			$('#pv-bar-fullscreen').on('click', onFullscreen);

			$('#pv-overlay')
				.on('keydown', onKeydown)
				.on('mousemove mousedown', userAlive)
				.on('click mousedown mousemove keydown keypress', function (event) {

					event.stopImmediatePropagation();
				});

			$(window).on('resize load', adjustSize);
		};

	init();

	return {
		enter: enter,
		exit: exit,
		setIndex: setIndex,
		setRawLink: setRawLink,
		setLabels: setLabels,
		setOnIndexChange: setOnIndexChange,
		setOnAdjustSize: setOnAdjustSize,
		showSpinner: showSpinner
	};
});
