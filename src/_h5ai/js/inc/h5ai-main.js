
module.define('h5ai-main', [jQuery, 'core/event', 'core/settings'], function ($, event, settings) {

	event.pub('beforeView');

	module.require('view/extended');
	module.require('view/viewmode');
	module.require('view/spacing');

	event.pub('beforeExt');

	_.each(module.getIds(/^ext\/.+/), function (id) {

		module.require(id);
	});

	event.pub('ready');
});
