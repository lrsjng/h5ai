
modulejs.define('ext/context-menu', ['_', '$', 'core/settings', 'core/entry', 'core/event', 'core/resource'], function (_, $, allsettings, entry, event, resource) {

	var defaults = {
			enabled: false,
			deleteBtn: false
		},

		settings = _.extend({}, defaults, allsettings['context-menu']),

		template = '<div class="context-menu">' +
						'<ul></ul>' +
					'</div>',

		// deleteTmp = '<li class="delete">delete</li>',
		deleteTmp = '<li class="delete"><img src="' + resource.image('delete') + '" /> <span>delete</span></li>',
		// deleteTmp = '<li class="delete"><img src="' + resource.image('delete') + '" /></li>',


		createDeleteBtn = function (entry, $ul) {

			var $del = $(deleteTmp).appendTo($ul);

			$del.on('click', function (event) {

				console.log('delete', entry.label);
				$.ajax({
					url: resource.api(),
					data: {
						action: 'delete',
						href: entry.absHref
					},
					dataType: 'json',
					success: function (json) {

					}
				});
			});
		},

		createMenu = function (entry) {

			var $html = $(template),
				$ul = $html.find('ul');

			$html.on('click', function (event) {

				event.stopPropagation();
				event.preventDefault();
			});

			createDeleteBtn(entry, $ul);

			entry.$extended.find('a').append($html);
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			event.sub('entry.mouseenter', function (entry) {

				if (!entry.isFolder()) {
					var ctx = entry.$extended.find('.context-menu');
					if (ctx.length) {
						ctx.show();
					} else {
						createMenu(entry);
					}
				}
			});

			event.sub('entry.mouseleave', function (entry) {

				// entry.$extended.find('.context-menu').remove();
				entry.$extended.find('.context-menu').hide();
			});

		};

	init();
});
