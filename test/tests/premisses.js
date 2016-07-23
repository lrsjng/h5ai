const {test, assert} = require('scar');

test('window is global object', () => {
    assert.ok(global.window);
    assert.equal(global.window, global.window.window);
    assert.ok(global.window.document);
});
