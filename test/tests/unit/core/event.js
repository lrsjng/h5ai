const {test, assert} = require('scar');
const reqlib = require('../../../util/reqlib');
const event = reqlib('core/event');

test('core.event', () => {
    assert.equal(typeof event, 'object', 'is object');
    assert.deepEqual(Object.keys(event).sort(), ['sub', 'pub'].sort());
    assert.equal(typeof event.sub, 'function');
    assert.equal(typeof event.pub, 'function');
});
