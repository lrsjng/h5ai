const {dom, awaitReady} = require('./util');
const config = require('./config');

const name = dom('script[data-module]').attr('data-module');
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

config._update(query)
    .then(() => awaitReady())
    .then(() => require(`./main/${name}`));
