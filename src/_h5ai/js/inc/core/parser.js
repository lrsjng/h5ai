
modulejs.define('core/parser', ['$'], function ($) {

	if ($('#data-apache-autoindex').length) {
		return modulejs.require('parser/apache-autoindex');
	}
	if ($('#data-generic-json').length) {
		return modulejs.require('parser/generic-json');
	}

	return {
		id: 'none',
		mode: null,
		server: {
			name: null,
			version: null
		},
		parse: function () {
			return [];
		}
	};
});
