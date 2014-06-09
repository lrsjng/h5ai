
modulejs.define('info', ['$', 'config'], function ($, config) {

	var map = function (setup) {

			return {
				'php_version': setup.HAS_PHP_VERSION,
				'cache_dir': setup.HAS_WRITABLE_CACHE,
				'image_thumbs': setup.HAS_PHP_JPG,
				'exif_thumbs': setup.HAS_PHP_EXIF,
				'movie_thumbs': setup.HAS_CMD_FFMPEG || setup.HAS_CMD_AVCONV,
				'pdf_thumbs': setup.HAS_CMD_CONVERT,
				'shell_tar': setup.HAS_CMD_TAR,
				'shell_zip': setup.HAS_CMD_ZIP,
				'folder_sizes': setup.HAS_CMD_DU
			};
		},

		setValue = function (el, result) {

			var $result = $(el).find('.result');

			if (result) {
				$result.addClass('passed').text('yes');
			} else {
				$result.addClass('failed').text('no');
			}
		},

		init = function () {

			var setup = config.setup,
				values = map(setup);

			$('.test').each(function () {

				setValue(this, values[$(this).data('id')]);
			});

			$('.idx-file .value').text(setup.INDEX_HREF);
			$('.test.php .result').text(setup.PHP_VERSION);
		};

	init();
});
