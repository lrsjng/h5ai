const config = require('../config');

module.exports = Object.assign({}, config.options, {
    publicHref: config.setup.PUBLIC_HREF,
    rootHref: config.setup.ROOT_HREF
});
