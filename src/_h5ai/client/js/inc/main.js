
modulejs.define('main', ['_', 'core/event'], function (_, event) {

	event.pub('beforeView');

	modulejs.require('view/extended');
	modulejs.require('view/spacing');
	modulejs.require('view/viewmode');

	event.pub('beforeExt');

	_.each(modulejs.state(), function (state, id) {

		if (/^ext\/.+/.test(id)) {
			modulejs.require(id);
		}
	});

	event.pub('ready');
});
