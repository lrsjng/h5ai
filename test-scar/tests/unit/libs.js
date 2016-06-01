const {test, assert} = require('scar');

const libs = {
    _: window._,
    $: window.jQuery,
    marked: window.marked,
    prism: window.Prism
};

Object.keys(libs).forEach(id => {
    test(`module '${id}' is defined`, () => {
        assert.ok(window.modulejs._private.definitions[id]);
    });

    test(`module '${id}' has no instance`, () => {
        assert.equal(window.modulejs._private.instances[id], undefined);
    });

    test(`module '${id}' returns global lib`, () => {
        const definition = window.modulejs._private.definitions[id];
        const instance = definition.fn();
        assert.ok(instance);
        assert.equal(instance, libs[id]);
    });
});
