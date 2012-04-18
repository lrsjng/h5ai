
module.define('h5ai-main', [jQuery, 'core/event'], function ($, event) {


	event.pub('beforeView');

	module.require('view/extended');
	module.require('view/viewmode');
	module.require('view/spacing');

	$('#h5ai-reference').append(module.require('core/parser').id === 'apache-autoindex' ? ' (js)' : ' (php)');

	event.pub('beforeExt');

	_.each(module.getIds(/^ext\/.+/), function (id) {

		module.require(id);
	});

	event.pub('ready');
});
