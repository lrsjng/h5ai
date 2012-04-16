
module.define('ext/zipped-download', [jQuery, 'core/settings', 'core/resource', 'core/event'], function ($, allsettings, resource, event) {

	var defaults = {
			enabled: false
		},

		settings = _.extend({}, defaults, allsettings['zipped-download']),

		downloadBtnTemplate = '<li id="download">' +
									'<a href="#">' +
										'<img src="' + resource.image('download') + '" alt="download" />' +
										'<span class="l10n-download">download</span>' +
									'</a>' +
								'</li>',
		authTemplate = '<div id="download-auth">' +
							'<input id="download-auth-user" type="text" value="" placeholder="user" />' +
							'<input id="download-auth-password" type="text" value="" placeholder="password" />' +
						'</div>',

		selectedHrefsStr = '',
		$download, $img, $downloadAuth, $downloadUser, $downloadPassword,

		failed = function () {

			$download.addClass('failed');
			setTimeout(function () {
				$download.removeClass('failed');
			}, 1000);
		},

		handleResponse = function (response) {

			$download.removeClass('current');
			$img.attr('src', resource.image('download'));

			if (response) {
				if (response.status === 'ok') {
					setTimeout(function () { // wait here so the img above can be updated in time

						window.location = resource.api() + '?action=getzip&id=' + response.id;
					}, 200);
				} else {
					if (response.code === 401) {
						$downloadAuth
							.css({
								left: $download.offset().left,
								top: $download.offset().top + $download.outerHeight()
							})
							.show();
						$downloadUser.focus();
					}
					failed();
				}
			} else {
				failed();
			}
		},

		requestZipping = function (hrefsStr) {

			$download.addClass('current');
			$img.attr('src', resource.image('loading.gif', true));
			$.ajax({
				url: resource.api(),
				data: {
					action: 'zip',
					hrefs: hrefsStr
				},
				type: 'POST',
				dataType: 'json',
				beforeSend: function (xhr) {

					var user = $downloadUser.val(),
						password = $downloadPassword.val();

					if (user) {
						xhr.setRequestHeader('Authorization', 'Basic ' + Base64.encode(user + ':' + password));
					}
				},
				success: function (response) {

					handleResponse(response);
				},
				error: function () {

					handleResponse();
				}
			});
		},

		onSelection = function (entries) {

			var $downloadBtn = $('#download');

			selectedHrefsStr = '';
			if (entries.length) {
				selectedHrefsStr = _.map(entries, function (entry) {

					return entry.absHref;
				}).join(':');
				$downloadBtn.show();
			} else {
				$downloadBtn.hide();
				$downloadAuth.hide();
			}
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			$download = $(downloadBtnTemplate)
				.appendTo($('#navbar'))
				.find('a').on('click', function (event) {

					event.preventDefault();
					$downloadAuth.hide();
					requestZipping(selectedHrefsStr);
				});
			$img = $download.find('img');

			$downloadAuth = $(authTemplate).appendTo($('body'));
			$downloadUser = $downloadAuth.find('#download-auth-user');
			$downloadPassword = $downloadAuth.find('#download-auth-password');

			event.sub('selection', onSelection);
		};

	init();
});
