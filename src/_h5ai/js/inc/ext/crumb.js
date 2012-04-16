
module.define('ext/crumb', [jQuery, 'core/settings', 'core/resource', 'core/entry'], function ($, allsettings, resource, entry) {

	var defaults = {
			enabled: true
		},

		settings = _.extend({}, defaults, allsettings.crumb),

		template = '<li class="crumb">' +
						'<a>' +
							'<img src="' + resource.image('crumb') + '" alt=">" />' +
							'<span />' +
						'</a>' +
					'</li>',
		pageHintTemplate = '<img class="hint" src="' + resource.image('page') + '" alt="has index page" />',
		statusHintTemplate = '<span class="hint"></span>',

		// updates the crumb for this single entry
		update = function (entry) {

			if (entry.$crumb && entry.$crumb.data('status') === entry.status) {
				return entry.$crumb;
			}

			var $html = $(template),
				$a = $html.find('a');

			$html
				.addClass(entry.isFolder() ? 'folder' : 'file')
				.data('status', entry.status);

			$a
				.attr('href', entry.absHref)
				.find('span').text(entry.label).end();

			if (entry.isDomain()) {
				$html.addClass('domain');
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

		// creates the complete crumb from entry down to the root
		init = function (entry) {

			if (!settings.enabled) {
				return;
			}

			var crumb = entry.getCrumb(),
				$ul = $('#navbar');

			_.each(crumb, function (e) {

				$ul.append(update(e));

				e.fetchStatus(function (e) {

					update(e);
				});
			});
		};

	init(entry);
});
