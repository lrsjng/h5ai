
modulejs.define('ext/delete', ['_', '$', 'core/settings', 'core/entry', 'core/event', 'core/resource', 'core/refresh'], function (_, $, allsettings, entry, event, resource, refresh) {

	var defaults = {
			enabled: false
		},

		settings = _.extend({}, defaults, allsettings['delete']),

		deleteBtnTemplate = '<li id="delete">' +
									'<a href="#">' +
										'<img src="' + resource.image('delete') + '" alt="delete"/>' +
										'<span class="l10n-delete">delete</span>' +
									'</a>' +
								'</li>',
		authTemplate = '<div id="delete-auth">' +
							'<input id="delete-auth-user" type="text" value="" placeholder="user"/>' +
							'<input id="delete-auth-password" type="text" value="" placeholder="password"/>' +
						'</div>',

		selectedHrefsStr = '',
		$delete, $img, $deleteAuth, $deleteUser, $deletePassword,

		failed = function () {

			$delete.addClass('failed');
			setTimeout(function () {
				$delete.removeClass('failed');
			}, 1000);
		},

		handleResponse = function (json) {

			$delete.removeClass('current');
			$img.attr('src', resource.image('delete'));

			if (!json || json.code) {
				if (json && json.code === 401) {
					$deleteAuth
						.css({
							left: $delete.offset().left,
							top: $delete.offset().top + $delete.outerHeight()
						})
						.show();
					$deleteUser.focus();
				}
				failed();
			}
			refresh();
		},

		requestDeletion = function (hrefsStr) {

			$delete.addClass('current');
			$img.attr('src', resource.image('loading.gif', true));
			$.ajax({
				url: resource.api(),
				data: {
					action: 'delete',
					hrefs: hrefsStr,
					user: $deleteUser.val(),
					password: $deletePassword.val()
				},
				dataType: 'json',
				success: handleResponse
			});
		},

		onSelection = function (entries) {

			selectedHrefsStr = '';
			if (entries.length) {
				selectedHrefsStr = _.map(entries, function (entry) {

					return entry.absHref;
				}).join(':');
				$delete.appendTo('#navbar').show();
			} else {
				$delete.hide();
				$deleteAuth.hide();
			}
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			$delete = $(deleteBtnTemplate)
				.find('a').on('click', function (event) {

					event.preventDefault();
					$deleteAuth.hide();
					requestDeletion(selectedHrefsStr);
				}).end()
				.appendTo('#navbar');
			$img = $delete.find('img');

			$deleteAuth = $(authTemplate).appendTo('body');
			$deleteUser = $deleteAuth.find('#delete-auth-user');
			$deletePassword = $deleteAuth.find('#delete-auth-password');

			event.sub('selection', onSelection);
		};

	init();
});
