
modulejs.define('ext/download', ['_', '$', 'core/settings', 'core/resource', 'core/event', 'core/ajax'], function (_, $, allsettings, resource, event, ajax) {

	var settings = _.extend({
			enabled: false,
			execution: 'php',
			format: 'zip'
		}, allsettings.download),

		// formats = ['tar', 'zip'],

		downloadBtnTemplate = '<li id="download">' +
									'<a href="#">' +
										'<img src="' + resource.image('download') + '" alt="download"/>' +
										'<span class="l10n-download">download</span>' +
									'</a>' +
								'</li>',
		authTemplate = '<div id="download-auth">' +
							'<input id="download-auth-user" type="text" value="" placeholder="user"/>' +
							'<input id="download-auth-password" type="text" value="" placeholder="password"/>' +
						'</div>',

		selectedHrefsStr = '',
		$download, $img, $downloadAuth, $downloadUser, $downloadPassword,

		failed = function () {

			$download.addClass('failed');
			setTimeout(function () {
				$download.removeClass('failed');
			}, 1000);
		},

		handleResponse = function (json) {

			$download.removeClass('current');
			$img.attr('src', resource.image('download'));

			if (json) {
				if (json.code === 0) {
					setTimeout(function () { // wait here so the img above can be updated in time

						window.location = resource.api() + '?action=getarchive&id=' + json.id + '&as=h5ai-selection.' + settings.format;
					}, 200);
				} else {
					if (json.code === 401) {
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

		requestArchive = function (hrefsStr) {

			$download.addClass('current');
			$img.attr('src', resource.image('loading.gif', true));
			ajax.getArchive({
				execution: settings.execution,
				format: settings.format,
				hrefs: hrefsStr,
				user: $downloadUser.val(),
				password: $downloadPassword.val()
			}, handleResponse);
		},

		onSelection = function (entries) {

			selectedHrefsStr = '';
			if (entries.length) {
				selectedHrefsStr = _.map(entries, function (entry) {

					return entry.absHref;
				}).join(':');
				$download.appendTo('#navbar').show();
			} else {
				$download.hide();
				$downloadAuth.hide();
			}
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			$download = $(downloadBtnTemplate)
				.find('a').on('click', function (event) {

					event.preventDefault();
					$downloadAuth.hide();
					requestArchive(selectedHrefsStr);
				}).end()
				.appendTo('#navbar');
			$img = $download.find('img');

			$downloadAuth = $(authTemplate).appendTo('body');
			$downloadUser = $downloadAuth.find('#download-auth-user');
			$downloadPassword = $downloadAuth.find('#download-auth-password');

			event.sub('selection', onSelection);
		};

	init();
});
