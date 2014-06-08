
modulejs.define('ext/custom', ['_', '$', 'core/settings', 'core/server', 'core/event', 'core/resource'], function (_, $, allsettings, server, event, resource) {

	var settings = _.extend({
			enabled: false
		}, allsettings.custom),

		onLocationChanged = function (item) {

			server.request({action: 'get', custom: true, customHref: item.absHref}, function (response) {

				var h, f;

				if (response) {

					if (response.custom.header) {
						if (response.custom.header_type === 'md') {
							resource.loadMarkdown(function (md) {

								if (md) {
									$('#content-header').html(md.toHTML(response.custom.header)).stop().slideDown(200);
								}
							});
						} else {
							$('#content-header').html(response.custom.header).stop().slideDown(200);
						}
						h = true;
					}

					if (response.custom.footer) {
						if (response.custom.footer_type === 'md') {
							resource.loadMarkdown(function (md) {

								if (md) {
									$('#content-footer').html(md.toHTML(response.custom.footer)).stop().slideDown(200);
								}
							});
						} else {
							$('#content-footer').html(response.custom.footer).stop().slideDown(200);
						}
						f = true;
					}
				}

				if (!h) {
					$('#content-header').stop().slideUp(200);
				}
				if (!f) {
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
