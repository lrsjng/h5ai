
modulejs.define('core/parser', ['$'], function ($) {

	if ($('#data-apache-autoindex').length) {
		return modulejs.require('parser/apache-autoindex');
	}
	if ($('#data-generic-json').length) {
		return modulejs.require('parser/generic-json');
	}

	return {
		dataType: 'N/A',
		parse: function () { return []; }
	};
});
