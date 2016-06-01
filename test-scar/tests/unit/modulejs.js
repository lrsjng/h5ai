const {test, assert} = require('scar');

test('modulejs is global object', () => {
    assert.equal(typeof window.modulejs, 'object');
});

test('modulejs.define() is function', () => {
    assert.equal(typeof window.modulejs.define, 'function');
});

test('modulejs.require() is function', () => {
    assert.equal(typeof window.modulejs.require, 'function');
});

test('modulejs.state() is function', () => {
    assert.equal(typeof window.modulejs.state, 'function');
});

test('modulejs.log() is function', () => {
    assert.equal(typeof window.modulejs.log, 'function');
});

test('modulejs._private is object', () => {
    assert.equal(typeof window.modulejs._private, 'object');
});

test('modulejs has definitions', () => {
    assert.ok(Object.keys(window.modulejs._private.definitions).length >= 0);
});

test('modulejs has no instances', () => {
    assert.equal(Object.keys(window.modulejs._private.instances).length, 0);
});
