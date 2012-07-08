
modulejs.define('h5ai-main', ['jQuery', 'core/event', 'core/settings'], function ($, event, settings) {

	event.pub('beforeView');

	modulejs.require('view/extended');
	modulejs.require('view/viewmode');
	modulejs.require('view/spacing');

	event.pub('beforeExt');

	// _.each(modulejs.getIds(/^ext\/.+/), function (id) {

	// 	modulejs.require(id);
	// });
	modulejs.require(/^ext\/.+/);

	event.pub('ready');
});
