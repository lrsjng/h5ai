
modulejs.define('info', ['$', 'config'], function ($, config) {

	var template = '<li class="test">' +
				'<span class="label"></span>' +
				'<span class="result"></span>' +
				'<div class="info"></div>' +
			'</li>',

		$tests = $('#tests'),

		addTestResult = function (label, info, passed, result) {

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

		init = function () {

			var setup = config.setup;

			$('.idx-file .value').text(setup.INDEX_HREF);

			addTestResult(
				'PHP version',
				'PHP version &gt;= 5.3.0',
				setup.HAS_PHP_VERSION,
				setup.PHP_VERSION
			);

			addTestResult(
				'Cache directory',
				'Web server has write access',
				setup.HAS_WRITABLE_CACHE
			);

			addTestResult(
				'Image thumbs',
				'PHP GD extension with JPEG support available',
				setup.HAS_PHP_JPG
			);

			addTestResult(
				'Use EXIF thumbs',
				'PHP EXIF extension available',
				setup.HAS_PHP_EXIF
			);

			addTestResult(
				'Movie thumbs',
				'Command line program <code>ffmpeg</code> or <code>avconv</code> available',
				setup.HAS_CMD_FFMPEG || setup.HAS_CMD_AVCONV
			);

			addTestResult(
				'PDF thumbs',
				'Command line program <code>convert</code> available',
				setup.HAS_CMD_CONVERT
			);

			addTestResult(
				'Shell tar',
				'Command line program <code>tar</code> available',
				setup.HAS_CMD_TAR
			);

			addTestResult(
				'Shell zip',
				'Command line program <code>zip</code> available',
				setup.HAS_CMD_ZIP
			);

			addTestResult(
				'Folder sizes',
				'Command line program <code>du</code> available',
				setup.HAS_CMD_DU
			);
		};

	init();
});
