
modulejs.define('ext/preview-vid', ['_', '$', 'core/settings', 'core/event', 'ext/preview'], function (_, $, allsettings, event, preview) {

	var settings = _.extend({
			enabled: false,
			types: []
		}, allsettings['preview-vid']),

		preloadVid = function (src, callback) {

			var $video = $('<video/>')
				.one('loadedmetadata', function () {

					callback($video);
					// setTimeout(function () { callback($img); }, 1000); // for testing
				})
				.attr('preload', 'auto')
				.attr('src', src);
		},

		onEnter = function (items, idx) {

			var currentItems = items,
				currentIdx = idx,
				currentItem = items[idx],

				onAdjustSize = function () {

					var $content = $('#pv-content'),
						$vid = $('#pv-vid-video');

					if ($vid.length) {

						$vid.css({
							'left': '' + (($content.width()-$vid.width())*0.5) + 'px',
							'top': '' + (($content.height()-$vid.height())*0.5) + 'px'
						});

						preview.setLabels([
							currentItem.label,
							'' + $vid[0].videoWidth + 'x' + $vid[0].videoHeight,
							'' + (100 * $vid.width() / $vid[0].videoWidth).toFixed(0) + '%'
						]);
					}
				},

				onIdxChange = function (rel) {

					currentIdx = (currentIdx + rel + currentItems.length) % currentItems.length;
					currentItem = currentItems[currentIdx];

					var spinnerTimeout = setTimeout(function () { preview.showSpinner(true); }, 200);

					preloadVid(currentItem.absHref, function ($preloaded_vid) {

						clearTimeout(spinnerTimeout);
						preview.showSpinner(false);

						$('#pv-content').fadeOut(100, function () {
							$preloaded_vid.attr('controls', true);
							
							$('#pv-content').empty().append($preloaded_vid.attr('id', 'pv-vid-video')).fadeIn(200);
							
							// small timeout, so $preloaded_vid is visible and therefore $preloaded_vid.width is available
							setTimeout(function () {
								onAdjustSize();

								preview.setIndex(currentIdx + 1, currentItems.length);
								preview.setRawLink(currentItem.absHref);
							}, 10);
						});
					});
				};

			onIdxChange(0);
			preview.setOnIndexChange(onIdxChange);
			preview.setOnAdjustSize(onAdjustSize);
			preview.enter();
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

			event.sub('location.changed', onLocationChanged);
			event.sub('location.refreshed', onLocationRefreshed);
		};

	init();
});
