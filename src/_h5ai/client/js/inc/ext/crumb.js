
modulejs.define('ext/crumb', ['_', '$', 'core/settings', 'core/resource', 'core/event', 'core/location'], function (_, $, allsettings, resource, event, location) {

	var settings = _.extend({
			enabled: false
		}, allsettings.crumb),

		template = '<li class="crumb">' +
						'<a>' +
							'<img src="' + resource.image('crumb') + '" alt=">"/>' +
							'<span/>' +
						'</a>' +
					'</li>',
		pageHintTemplate = '<img class="hint" src="' + resource.image('page') + '" alt="has index page"/>',
		statusHintTemplate = '<span class="hint"/>',

		// updates the crumb for this single entry
		update = function (entry, force) {

			if (!force && entry.$crumb && entry.$crumb.data('status') === entry.status) {
				return entry.$crumb;
			}

			var $html = $(template),
				$a = $html.find('a');

			$html
				.addClass(entry.isFolder() ? 'folder' : 'file')
				.data('item', entry)
				.data('status', entry.status);

			location.setLink($a, entry);
			$a.find('span').text(entry.label).end();

			if (entry.isDomain()) {
				$html.addClass('domain');
				$a.find('img').attr('src', resource.image('home'));
			}

			if (entry.isRoot()) {
				$html.addClass('root');
				$a.find('img').attr('src', resource.image('home'));
			}

			if (entry.isCurrentFolder()) {
				$html.addClass('current');
			}

			if (_.isNumber(entry.status)) {
				if (entry.status === 200) {
					$a.append($(pageHintTemplate));
				} else {
					$a.append($(statusHintTemplate).text('(' + entry.status + ')'));
				}
			}

			if (entry.$crumb) {
				entry.$crumb.replaceWith($html);
			}
			entry.$crumb = $html;

			return $html;
		},

		onContentChanged = function (entry) {

			if (entry.$crumb) {
				update(entry, true);
			}
		},

		onLocationChanged = function (item) {

			var crumb = item.getCrumb(),
				$ul = $('#navbar'),
				found = false;

			$ul.find('.crumb').each(function () {

				var $html = $(this);
				if ($html.data('item') === item) {
					found = true;
					$html.addClass('current');
				} else {
					$html.removeClass('current');
				}
			});

			if (!found) {
				$ul.find('.crumb').remove();
				_.each(crumb, function (e) {

					$ul.append(update(e));
				});
			}
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			// event.sub('entry.created', onContentChanged);
			// event.sub('entry.removed', onContentChanged);
			event.sub('entry.changed', onContentChanged);

			event.sub('location.changed', onLocationChanged);
		};

	init();
});
