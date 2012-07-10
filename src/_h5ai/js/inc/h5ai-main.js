
modulejs.define('h5ai-main', ['jQuery', 'core/event', 'core/settings'], function ($, event, settings) {

	event.pub('beforeView');

	modulejs.require('view/extended');
	modulejs.require('view/viewmode');
	modulejs.require('view/spacing');

	event.pub('beforeExt');

	_.each(modulejs.state(), function (state, id) {

		if (/^ext\/.+/.test(id)) {
			modulejs.require(id);
		}
	});

	event.pub('ready');
});
