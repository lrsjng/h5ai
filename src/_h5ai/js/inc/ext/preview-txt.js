
modulejs.define('ext/preview-txt', ['_', '$', 'sh', 'core/settings', 'core/resource', 'core/store', 'core/entry'], function (_, $, SH, allsettings, resource, store, entry) {

	var defaults = {
			enabled: false,
			types: {
				text: 'plain',
				js: 'js'
			}
		},

		settings = _.extend({}, defaults, allsettings['preview-txt']),

		template = '<div id="pv-txt-overlay" class="noSelection">' +
						'<div id="pv-txt-close" />' +
						'<div id="pv-txt-content">' +
							'<pre id="pv-txt-text" class="brush: js" />' +
						'</div>' +
						'<div id="pv-txt-bottombar" class="clearfix">' +
							'<ul id="pv-txt-buttons">' +
								'<li id="pv-txt-bar-size" class="bar-left bar-label"></li>' +
								'<li id="pv-txt-bar-label" class="bar-left bar-label"></li>' +
								'<li id="pv-txt-bar-close" class="bar-right bar-button"><img src="' + resource.image('preview/close') + '" /></li>' +
								'<li id="pv-txt-bar-original" class="bar-right"><a class="bar-button" target="_blank"><img src="' + resource.image('preview/raw') + '" /></a></li>' +
								'<li id="pv-txt-bar-next" class="bar-right bar-button"><img src="' + resource.image('preview/next') + '" /></li>' +
								'<li id="pv-txt-bar-idx" class="bar-right bar-label"></li>' +
								'<li id="pv-txt-bar-prev" class="bar-right bar-button"><img src="' + resource.image('preview/prev') + '" /></li>' +
							'</ul>' +
						'</div>' +
					'</div>',

		templateText = '<pre id="pv-txt-text" />',

		currentEntries = [],
		currentIdx = 0,

		adjustSize = function () {

			var rect = $(window).fracs('viewport'),
				$container = $('#pv-txt-content'),
				margin = 20,
				barheight = 31;

			$container.css({
				width: rect.width - 2 * margin,
				height: rect.height - 2 * margin - barheight - 32,
				left: margin,
				top: margin
			});
		},

		preloadText = function (absHref, callback) {

			$.ajax({
				url: absHref,
				dataType: 'text',
				success: function (content) {

					callback(content);
					// setTimeout(function () { callback(content); }, 1000); // for testing
				},
				error: function (jqXHR, textStatus, errorThrown) {

					callback('[ajax error] ' + textStatus);
				}
			});
		},

		onIndexChange = function (idx) {

			currentIdx = (idx + currentEntries.length) % currentEntries.length;

			var $container = $('#pv-txt-content'),
				$text = $('#pv-txt-text'),
				current = currentEntries[currentIdx],
				spinnerTimeout = setTimeout(function () {

					$container.spin({
						length: 12,
						width: 4,
						radius: 24,
						color: '#ccc',
						shadow: true
					});
				}, 200);

			preloadText(current.absHref, function (content) {

				clearTimeout(spinnerTimeout);
				$container.spin(false);

				$text.fadeOut(100, function () {

					var $nText = $(templateText).hide().addClass('toolbar: false; brush:').addClass(settings.types[current.type] || 'plain').text(content);

					$text.replaceWith($nText);
					SH.highlight({}, $nText[0]);
					$nText.fadeIn(200);

					adjustSize();
					$('#pv-txt-bar-label').text(current.label);
					$('#pv-txt-bar-size').text('' + current.size + ' bytes');
					$('#pv-txt-bar-idx').text('' + (currentIdx + 1) + ' / ' + currentEntries.length);
					$('#pv-txt-bar-original').find('a').attr('href', current.absHref);
				});
			});
		},

		onEnter = function (entries, idx) {

			$(window).on('keydown', onKeydown);
			$('#pv-txt-overlay').stop(true, true).fadeIn(200);

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
			$('#pv-txt-overlay').stop(true, true).fadeOut(200);
		},

		onKeydown = function (event) {

			var key = event.which;

			if (key === 27) { // esc
				onExit();
			} else if (key === 37) { // left
				onPrevious();
			} else if (key === 39) { // right
				onNext();
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

				return _.indexOf(_.keys(settings.types), entry.type) >= 0;
			});
			_.each(imageEntries, function (e, idx) {

				initEntry(imageEntries, e, idx);
			});

			$(template).appendTo('body');
			$('#pv-txt-bar-prev').on('click', onPrevious);
			$('#pv-txt-bar-next').on('click', onNext);
			$('#pv-txt-bar-close, #pv-txt-close').on('click', onExit);
			$('#pv-txt-overlay').on('keydown', onKeydown);

			$('#pv-txt-close')
				.on('mouseenter', function () {
					$('#pv-txt-bar-close').addClass('hover');
				})
				.on('mouseleave', function () {
					$('#pv-txt-bar-close').removeClass('hover');
				});


			$('#pv-txt-overlay')
				.on('click mousedown mousemove keydown keypress', function (event) {

					event.stopPropagation();
				});

			$(window).on('resize load', adjustSize);
		};

	init(entry);
});
