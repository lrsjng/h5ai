const lodash = window._;
const modjs = window.modulejs;

function clearModulejs() {
    lodash.each(modjs._private.instances, (val, key) => {
        delete modjs._private.instances[key]; // eslint-disable-line prefer-reflect
    });
}

function mockConfigModule() {
    modjs.define('config', {_dummyConfig: true});
}

module.exports = {
    clearModulejs,
    mockConfigModule
};
