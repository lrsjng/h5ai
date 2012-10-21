
modulejs.define('ext/preview-txt', ['_', '$', 'core/settings', 'core/resource', 'core/store', 'core/event', 'core/location'], function (_, $, allsettings, resource, store, event, location) {

	var settings = _.extend({
			enabled: false,
			types: {
				authors: 'plain',
				copying: 'plain',
				c: 'c',
				cpp: 'cpp',
				css: 'css',
				h: 'c',
				hpp: 'cpp',
				install: 'plain',
				log: 'plain',
				java: 'java',
				makefile: 'xml',
				markdown: 'plain',
				// php: 'php',
				python: 'python',
				readme: 'plain',
				rb: 'ruby',
				rtf: 'plain',
				script: 'shell',
				text: 'plain',
				js: 'js',
				xml: 'xml'
			}
		}, allsettings['preview-txt']),

		template = '<div id="pv-txt-overlay" class="noSelection">' +
						'<div id="pv-txt-close"/>' +
						'<div id="pv-txt-content">' +
							'<div id="pv-txt-text"/>' +
						'</div>' +
						'<div id="pv-txt-bottombar" class="clearfix">' +
							'<ul id="pv-txt-buttons">' +
								'<li id="pv-txt-bar-size" class="bar-left bar-label"/>' +
								'<li id="pv-txt-bar-label" class="bar-left bar-label"/>' +
								'<li id="pv-txt-bar-close" class="bar-right bar-button"><img src="' + resource.image('preview/close') + '"/></li>' +
								'<li id="pv-txt-bar-original" class="bar-right"><a class="bar-button" target="_blank"><img src="' + resource.image('preview/raw') + '"/></a></li>' +
								'<li id="pv-txt-bar-next" class="bar-right bar-button"><img src="' + resource.image('preview/next') + '"/></li>' +
								'<li id="pv-txt-bar-idx" class="bar-right bar-label"/>' +
								'<li id="pv-txt-bar-prev" class="bar-right bar-button"><img src="' + resource.image('preview/prev') + '"/></li>' +
							'</ul>' +
						'</div>' +
					'</div>',

		templateText = '<pre id="pv-txt-text"/>',
		templateMarkdown = '<div id="pv-txt-text" class="markdown"/>',

		currentEntries = [],
		currentIdx = 0,

		loadScript = function (url, globalId, callback) {

			if (window[globalId]) {
				callback(window[globalId]);
			} else {
				$.ajax({
					url: url,
					dataType: 'script',
					complete: function () {

						callback(window[globalId]);
					}
				});
			}
		},
		loadSyntaxhighlighter = function (callback) {

			loadScript(allsettings.h5aiAbsHref + 'client/js/syntaxhighlighter.js', 'SyntaxHighlighter', callback);
		},
		loadMarkdown = function (callback) {

			loadScript(allsettings.h5aiAbsHref + 'client/js/markdown.js', 'markdown', callback);
		},

		adjustSize = function () {

			var $window = $(window),
				$container = $('#pv-txt-content'),
				margin = 20,
				barheight = 31;

			$container.css({
				height: $window.height() - 2 * margin - barheight - 32,
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

					var $nText;

					if (current.type === 'markdown') {
						$nText = $(templateMarkdown).hide();
						$text.replaceWith($nText);

						loadMarkdown(function (md) {

							if (md) {
								$nText.html(md.toHTML(content));
							}
						});
					} else {
						$nText = $(templateText).hide().addClass('toolbar: false; brush:').addClass(settings.types[current.type] || 'plain').text(content);
						$text.replaceWith($nText);

						loadSyntaxhighlighter(function (sh) {

							if (sh) {
								sh.highlight({}, $nText[0]);

								var $text = $('#pv-txt-text'),
									$lineNos = $text.find('td.gutter .line').addClass('cntlinenr'),
									$codeLines = $text.find('td.code .line').addClass('cntline'),
									$table = $('<table/>'),
									i, $tr;

								for (i = 0; i < $lineNos.length; i += 1) {
									$tr = $('<tr/>');
									$('<td/>').addClass('nr').append($lineNos.eq(i)).appendTo($tr);
									$('<td/>').addClass('line').append($codeLines.eq(i)).appendTo($tr);
									$table.append($tr);
								}

								$text.find('table').replaceWith($table);
							}
						});
					}
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
			} else if (key === 8 || key === 37 || key === 40) { // backspace, left, down
				onPrevious();
			} else if (key === 13 || key === 32 || key === 38 || key === 39) { // enter, space, up, right
				onNext();
			}

			event.preventDefault();
			event.stopImmediatePropagation();
		},

		initEntry = function (entry) {

			if (entry.$extended && _.indexOf(_.keys(settings.types), entry.type) >= 0) {
				entry.$extended.find('a').on('click', function (event) {

					event.preventDefault();

					var matchedEntries = _.compact(_.map($('#extended .entry'), function (entry) {

						entry = $(entry).data('entry');
						return _.indexOf(_.keys(settings.types), entry.type) >= 0 ? entry : null;
					}));

					onEnter(matchedEntries, _.indexOf(matchedEntries, entry));
				});
			}
		},

		onLocationChanged = function (item) {

			_.each(item.content, initEntry);
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			$(template).appendTo('body');
			$('#pv-txt-bar-prev').on('click', onPrevious);
			$('#pv-txt-bar-next').on('click', onNext);
			$('#pv-txt-bar-close, #pv-txt-close').on('click', onExit);

			$('#pv-txt-close')
				.on('mouseenter', function () {
					$('#pv-txt-bar-close').addClass('hover');
				})
				.on('mouseleave', function () {
					$('#pv-txt-bar-close').removeClass('hover');
				});


			$('#pv-txt-overlay')
				.on('keydown', onKeydown)
				.on('click mousedown mousemove keydown keypress', function (event) {

					event.stopImmediatePropagation();
				});

			event.sub('location.changed', onLocationChanged);
			event.sub('entry.created', initEntry);

			$(window).on('resize load', adjustSize);
		};

	init();
});
