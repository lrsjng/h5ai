const {test, assert} = require('scar');
const event = require('../../../../src/_h5ai/public/js/lib/core/event');

test('core.event', () => {
    assert.equal(typeof event, 'object', 'is object');
    assert.deepEqual(Object.keys(event).sort(), ['sub', 'pub'].sort());
    assert.equal(typeof event.sub, 'function');
    assert.equal(typeof event.pub, 'function');
});
