// const {jQuery: jq} = require('./win');
// const config = require('./config');
//
// const name = jq('script[data-module]').data('module');
// const request = {
//     action: 'get',
//     setup: true,
//     options: true,
//     types: true
// };
//
// if (name === 'index') {
//     request.theme = true;
//     request.langs = true;
// } else if (name === 'info') {
//     request.refresh = true;
// } else {
//     throw new Error(`no-main-module: '${name}'`);
// }
//
// config._update(request).then(() => {
//     jq(() => require(`./main/${name}`));
// });

module.exports = (deps = {}) => {
    const {
        jq = require('./win').jQuery,
        config = require('./config')
    } = deps;

    const name = jq('script[data-module]').data('module');
    const request = {
        action: 'get',
        setup: true,
        options: true,
        types: true
    };

    if (name === 'index') {
        request.theme = true;
        request.langs = true;
    } else if (name === 'info') {
        request.refresh = true;
    } else {
        throw new Error(`no-main-module: '${name}'`);
    }

    config._update(request).then(() => {
        jq(() => require(`./main/${name}`));
    });
};
