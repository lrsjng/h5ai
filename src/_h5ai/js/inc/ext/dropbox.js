
modulejs.define('ext/dropbox', ['_', '$', 'core/settings', 'core/entry'], function (_, $, allsettings, entry) {

	var defaults = {
			enabled: true
		},

		settings = _.extend({}, defaults, allsettings.dropbox),

		template = '<div id="dropbox"><div class="label">dropbox</div><ul id="uploads" /></div>',

		uploadTemplate = '<li class="upload clearfix">' +
							'<span class="name"></span>' +
							'<div class="progress"><div class="bar"></div></div>' +
							'<span class="size"></span>' +
						'</li>',

		init = function () {

			if (!settings.enabled) {
				return;
			}

			var $dropbox = $(template).appendTo('#content');

			var uploads = {};

			$dropbox.filedrop({

				// The name of the $_FILES entry:
				paramname: 'userfile',

				maxfiles: 24,
				maxfilesize: 1024,
				url: allsettings.h5aiAbsHref + 'php/api.php',
				data: {
					action: 'upload',
					href: entry.absHref
				},

				dragOver: function () {

					$dropbox.addClass('match');
				},

				dragLeave: function () {

					$dropbox.removeClass('match');
				},

				docOver: function () {

					$dropbox.addClass('hint');
				},

				docLeave: function () {

					$dropbox.removeClass('hint');
				},

				drop: function () {

					$dropbox.removeClass('match hint');
				},


				beforeEach: function (file) {

					uploads[file.name] = $(uploadTemplate).appendTo('#uploads')
						.find('.name').text(file.name).end()
						.find('.size').text(file.size).end()
						.find('.progress .bar').css('width', 0).end();

					console.log('beforeEach', file);
				},

				uploadStarted: function (i, file, len) {

					console.log('uploadStarted', i, file, len);
				},

				progressUpdated: function (i, file, progress) {

					uploads[file.name]
						.find('.progress .bar').css('width', '' + progress + '%');
					console.log('progressUpdated', i, file, progress);
				},

				uploadFinished: function (i, file, response) {

					uploads[file.name].addClass(response.code ? 'error' : 'finished');
					setTimeout(function () {
						uploads[file.name].slideUp(400, function () {

							uploads[file.name].remove();
						});
					}, 5000);
					console.log('uploadFinished', i, file, response);
				},

				afterAll: function () {

					// $('#uploads .upload').remove();
				},


				error: function (err, file) {

					uploads[file.name].addClass('error');
					setTimeout(function () {
						uploads[file.name].slideUp(400, function () {

							uploads[file.name].remove();
						});
					}, 5000);
					switch (err) {
						case 'BrowserNotSupported':
							console.log('ERROR', 'Your browser does not support HTML5 file uploads!');
							break;
						case 'TooManyFiles':
							console.log('ERROR', 'Too many files! Please select 5 at most! (configurable)');
							break;
						case 'FileTooLarge':
							console.log('ERROR', file.name + ' is too large! Please upload files up to 2mb (configurable).');
							break;
						default:
							break;
					}
					console.log('error', err, file);
				}
			});




		};

	init();
});
