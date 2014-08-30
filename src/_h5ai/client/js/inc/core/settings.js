modulejs.define('core/settings', ['config', '_'], function (config, _) {

    return _.extend({}, config.options, {
        appHref: config.setup.APP_HREF,
        rootHref: config.setup.ROOT_HREF,
        currentHref: config.setup.CURRENT_HREF
    });
});
