
modulejs.define('ext/preview-audio', ['_', '$', 'core/settings', 'core/event', 'ext/preview'], function (_, $, allsettings, event, preview) {

	var settings = _.extend({
			enabled: false,
			types: []
		}, allsettings['preview-audio']),
		
		//Credits go to Thorben (http://stackoverflow.com/a/5539081)
		formatSecondsToHMS = function (d) {
			d = Number(d);
			
			var h = Math.floor(d / 3600);
			var m = Math.floor(d % 3600 / 60);
			var s = Math.floor(d % 3600 % 60);
			return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
		},
		
		preloadAudio = function (src, callback) {

			var $audio = $('<audio/>')
				.one('loadedmetadata', function () {

					callback($audio);
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
						$audio = $('#pv-audio-audio');

					if ($audio.length) {

						$audio.css({
							'left': '' + (($content.width()-$audio.width())*0.5) + 'px',
							'top': '' + (($content.height()-$audio.height())*0.5) + 'px'
						});

						preview.setLabels([
							currentItem.label,
							formatSecondsToHMS($audio[0].duration)
						]);
					}
				},

				onIdxChange = function (rel) {

					currentIdx = (currentIdx + rel + currentItems.length) % currentItems.length;
					currentItem = currentItems[currentIdx];

					var spinnerTimeout = setTimeout(function () { preview.showSpinner(true); }, 200);

					preloadAudio(currentItem.absHref, function ($preloaded_audio) {

						clearTimeout(spinnerTimeout);
						preview.showSpinner(false);

						$('#pv-content').fadeOut(100, function () {
							$preloaded_audio.attr('controls', true);
							
							$('#pv-content').empty().append($preloaded_audio.attr('id', 'pv-audio-audio')).fadeIn(200);
							
							// small timeout, so $preloaded_audio is visible and therefore $preloaded_audio.width is available
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
