
(function (window, $) {
'use strict';
/*jslint browser: true, confusion: true, white: true */
/*global jQuery */

	var deobfuscate = function () {

			$('.obfusma').each(function () {

				var $this = $(this),
					add = $this.text().replace(/\s*/g, '').replace(/\[at\]/gi, '@').replace(/\[dot\]/gi, '.'),
					$a = $('<a/>').attr('href', 'mailto:' + add).text(add).addClass('deobfusma');

				$this.replaceWith($a);
			});
		},
		configFile = function () {

			$('#config-file').text(JSON.stringify(H5AI_CONFIG.options));
		},
		init = function () {

			deobfuscate();
			configFile();
		};

	$(init);

}(window, jQuery));