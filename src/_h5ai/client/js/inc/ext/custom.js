
modulejs.define('ext/custom', ['_', '$', 'core/settings', 'core/server', 'core/event', 'core/resource'], function (_, $, allsettings, server, event, resource) {

	var settings = _.extend({
			enabled: false
		}, allsettings.custom),

		onLocationChanged = function (item) {

			server.request({action: 'get', custom: true, customHref: item.absHref}, function (response) {

				var has_header, has_footer, data, content;

				if (response) {
					resource.ensureMarkdown(function (md) {

						data = response.custom;

						if (data.header) {
							content = data.header;
							if (md && data.header_type === 'md') {
								content  = md.toHTML(content);
							}
							$('#content-header').html(content).stop().slideDown(200);
							has_header = true;
						}

						if (data.footer) {
							content = data.footer;
							if (md && data.footer_type === 'md') {
								content  = md.toHTML(content);
							}
							$('#content-footer').html(content).stop().slideDown(200);
							has_footer = true;
						}
					});
				}

				if (!has_header) {
					$('#content-header').stop().slideUp(200);
				}
				if (!has_footer) {
					$('#content-footer').stop().slideUp(200);
				}
			});
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			$('<div id="content-header"/>').hide().prependTo('#content');
			$('<div id="content-footer"/>').hide().appendTo('#content');

			event.sub('location.changed', onLocationChanged);
		};

	init();
});
