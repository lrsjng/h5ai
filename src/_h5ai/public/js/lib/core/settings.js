modulejs.define('core/settings', ['_', 'config'], function (_, config) {
    return _.extend({}, config.options, {
        publicHref: config.setup.PUBLIC_HREF,
        rootHref: config.setup.ROOT_HREF
    });
});
