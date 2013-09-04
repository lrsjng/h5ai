
modulejs.define('ext/preview-img', ['_', '$', 'core/settings', 'core/event', 'ext/preview'], function (_, $, allsettings, event, preview) {

	var settings = _.extend({
			enabled: false,
			types: []
		}, allsettings['preview-img']),

		preloadImg = function (src, callback) {

			var $img = $('<img/>')
				.one('load', function () {

					callback($img);
					// setTimeout(function () { callback($img); }, 1000); // for testing
				})
				.attr('src', src);
		},

		onEnter = function (items, idx) {

			var currentItems = items,
				currentIdx = idx,
				currentItem = items[idx],

				onAdjustSize = function () {

					var $content = $('#pv-content'),
						$img = $('#pv-img-image');

					if ($img.length) {

						$img.css({
							'left': '' + (($content.width()-$img.width())*0.5) + 'px',
							'top': '' + (($content.height()-$img.height())*0.5) + 'px'
						});

						preview.setLabels([
							currentItem.label,
							'' + $img[0].naturalWidth + 'x' + $img[0].naturalHeight,
							'' + (100 * $img.width() / $img[0].naturalWidth).toFixed(0) + '%'
						]);
					}
				},

				onIdxChange = function (rel) {

					currentIdx = (currentIdx + rel + currentItems.length) % currentItems.length;
					currentItem = currentItems[currentIdx];

					var spinnerTimeout = setTimeout(function () { preview.showSpinner(true); }, 200);

					preloadImg(currentItem.absHref, function ($preloaded_img) {

						clearTimeout(spinnerTimeout);
						preview.showSpinner(false);

						$('#pv-content').fadeOut(100, function () {

							$('#pv-content').empty().append($preloaded_img.attr('id', 'pv-img-image')).fadeIn(200);

							// small timeout, so $preloaded_img is visible and therefore $preloaded_img.width is available
							setTimeout(function () {

								onAdjustSize();

								preview.setIndex(currentIdx + 1, currentItems.length);
								preview.setLabels([
									currentItem.label,
									'' + $preloaded_img[0].naturalWidth + 'x' + $preloaded_img[0].naturalHeight,
									'' + (100 * $preloaded_img.width() / $preloaded_img[0].naturalWidth).toFixed(0) + '%'
								]);
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
