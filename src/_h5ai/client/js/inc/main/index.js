modulejs.define('main/index', ['_', 'core/event'], function (_, event) {

    modulejs.require('view/base');
    modulejs.require('view/content');
    modulejs.require('view/sidebar');
    modulejs.require('view/viewmode');

    _.each(modulejs.state(), function (state, id) {

        if (id.indexOf('ext/') === 0) {
            modulejs.require(id);
        }
    });

    event.pub('ready');
});
