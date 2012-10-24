
modulejs.define('main', ['_', 'core/event'], function (_, event) {

	modulejs.require('view/items');
	modulejs.require('view/spacing');
	modulejs.require('view/viewmode');

	_.each(modulejs.state(), function (state, id) {

		if (/^ext\/.+/.test(id)) {
			modulejs.require(id);
		}
	});

	event.pub('ready');
});
