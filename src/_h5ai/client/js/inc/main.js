modulejs.define('main', ['_', 'core/event'], function (_, event) {

    modulejs.require('view/ensure');
    modulejs.require('view/items');
    modulejs.require('view/sidebar');
    modulejs.require('view/spacing');
    modulejs.require('view/viewmode');

    _.each(modulejs.state(), function (state, id) {

        if (id.indexOf('ext/') === 0) {
            modulejs.require(id);
        }
    });

    event.pub('ready');
});
