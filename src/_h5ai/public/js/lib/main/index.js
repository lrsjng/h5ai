modulejs.define('main/index', ['_', 'core/location'], function (_, location) {
    modulejs.require('view/viewmode');

    _.each(modulejs.state(), function (state, id) {
        if (id.indexOf('ext/') === 0) {
            modulejs.require(id);
        }
    });

    location.setLocation(document.location.href, true);
});
