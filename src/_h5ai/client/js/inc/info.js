
modulejs.define('info', ['$', 'config'], function ($, config) {

	var template = '<li class="test">' +
						'<span class="label"></span>' +
						'<span class="result"></span>' +
						'<div class="info"></div>' +
					'</li>',

		setup = config.setup,
		$tests = $("#tests"),

		addTest = function (label, info, passed, result) {

			$(template)
				.find('.label')
					.text(label)
				.end()
				.find('.result')
					.addClass(passed ? 'passed' : 'failed')
					.text(result ? result : (passed ? 'yes' : 'no'))
				.end()
				.find('.info')
					.html(info)
				.end()
				.appendTo($tests);
		},

		addTests = function () {

			addTest(
				'PHP version', 'PHP version &gt;= 5.3.0',
				setup.HAS_PHP_VERSION, setup.PHP_VERSION
			);

			addTest(
				'Cache directory', 'Web server has write access',
				setup.HAS_WRITABLE_CACHE
			);

			addTest(
				'Image thumbs', 'PHP GD extension with JPEG support available',
				setup.HAS_PHP_JPG
			);

			addTest(
				'Use EXIF thumbs', 'PHP EXIF extension available',
				setup.HAS_PHP_EXIF
			);

			addTest(
				'Movie thumbs', 'Command line program <code>ffmpeg</code> or <code>avconv</code> available',
				setup.HAS_CMD_FFMPEG || setup.HAS_CMD_AVCONV
			);

			addTest(
				'PDF thumbs', 'Command line program <code>convert</code> available',
				setup.HAS_CMD_CONVERT
			);

			addTest(
				'Shell tar', 'Command line program <code>tar</code> available',
				setup.HAS_CMD_TAR
			);

			addTest(
				'Shell zip', 'Command line program <code>zip</code> available',
				setup.HAS_CMD_ZIP
			);

			addTest(
				'Folder sizes', 'Command line program <code>du</code> available',
				setup.HAS_CMD_DU
			);
		},

		init = function () {

			$('.idx-file .value').text(setup.INDEX_HREF);
			addTests();
		};

	init();
});
