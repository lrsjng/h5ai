
modulejs.define('ext/preview-audio', ['_', '$', 'moment', 'core/settings', 'core/event', 'ext/preview'], function (_, $, moment, allsettings, event, preview) {

	var settings = _.extend({
			enabled: false,
			types: []
		}, allsettings['preview-aud']),

		preloadAudio = function (src, callback) {

			var $audio = $('<audio/>')
				.one('loadedmetadata', function () {

					callback($audio);
					// setTimeout(function () { callback($img); }, 1000); // for testing
				})
				.attr('autoplay', 'autoplay')
				.attr('controls', 'controls')
				.attr('src', src);
		},

		onEnter = function (items, idx) {

			var currentItems = items,
				currentIdx = idx,
				currentItem = items[idx],

				onAdjustSize = function () {

					var $content = $('#pv-content'),
						$audio = $('#pv-aud-audio');

					if ($audio.length) {

						$audio.css({
							'left': '' + (($content.width()-$audio.width())*0.5) + 'px',
							'top': '' + (($content.height()-$audio.height())*0.5) + 'px'
						});

						preview.setLabels([
							currentItem.label,
							moment(0).add('seconds', $audio[0].duration).format('m:ss')
						]);
					}
				},

				onIdxChange = function (rel) {

					currentIdx = (currentIdx + rel + currentItems.length) % currentItems.length;
					currentItem = currentItems[currentIdx];

					var spinnerTimeout = setTimeout(function () { preview.showSpinner(true); }, 200);

					if ($('#pv-aud-audio').length) {
						$('#pv-aud-audio')[0].pause();
					}
					preloadAudio(currentItem.absHref, function ($preloaded_audio) {

						clearTimeout(spinnerTimeout);
						preview.showSpinner(false);

						$('#pv-content').fadeOut(100, function () {

							$('#pv-content').empty().append($preloaded_audio.attr('id', 'pv-aud-audio')).fadeIn(200);

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
