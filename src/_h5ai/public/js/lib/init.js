// const {jq} = require('./globals');
// const config = require('./config');
//
// const name = jq('script[data-module]').data('module');
// const query = {
//     action: 'get',
//     setup: true,
//     options: true,
//     types: true
// };
//
// if (name === 'index') {
//     query.theme = true;
//     query.langs = true;
// } else if (name === 'info') {
//     query.refresh = true;
// } else {
//     throw new Error(`no-main-module: '${name}'`);
// }
//
// config._update(query).then(() => {
//     jq(() => require(`./main/${name}`));
// });

module.exports = (deps = {}) => {
    const {
        jq = require('./globals').jq,
        config = require('./config')
    } = deps;

    const name = jq('script[data-module]').data('module');
    const query = {
        action: 'get',
        setup: true,
        options: true,
        types: true
    };

    if (name === 'index') {
        query.theme = true;
        query.langs = true;
    } else if (name === 'info') {
        query.refresh = true;
    } else {
        throw new Error(`no-main-module: '${name}'`);
    }

    config._update(query).then(() => {
        jq(() => require(`./main/${name}`));
    });
};
