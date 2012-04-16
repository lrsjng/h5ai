
module.define('core/parser', [jQuery], function ($) {

	if ($('#data-generic-json').length) {
		return module.require('parser/generic-json');
	}

	return module.require('parser/apache-autoindex');
});
