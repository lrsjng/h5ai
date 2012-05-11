
module.define('core/parser', [jQuery], function ($) {

	if ($('#data-apache-autoindex').length) {
		return module.require('parser/apache-autoindex');
	}
	if ($('#data-generic-json').length) {
		return module.require('parser/generic-json');
	}

	return {
		id: 'none',
		parse: function () {
			return [];
		}
	};
});
