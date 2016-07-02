const {test, assert} = require('scar');
const event = require('../../../../src/_h5ai/public/js/lib/core/event');

test('event is object', () => {
    assert.equal(typeof event, 'object');
});

test('event has the right props', () => {
    assert.deepEqual(Object.keys(event), ['sub', 'pub']);
});

test('event.sub is function', () => {
    assert.equal(typeof event.sub, 'function');
});

test('event.pub is function', () => {
    assert.equal(typeof event.pub, 'function');
});
