const {test, assert} = require('scar');
const sinon = require('sinon');

const ID = 'boot';
const DEPS = ['$', 'core/server'];

const getDef = () => window.modulejs._private.definitions[ID];
const createInst = () => getDef().fn.call(null, window.jQuery, {});

test(`module '${ID}' is defined`, () => {
    assert.ok(getDef());
});

test(`module '${ID}' has correct id`, () => {
    assert.equal(getDef().id, ID);
});

test(`module '${ID}' has correct deps`, () => {
    assert.deepEqual(getDef().deps, DEPS);
});

test(`module '${ID}' has args for each dependency`, () => {
    const def = getDef();
    assert.deepEqual(def.deps.length, def.fn.length);
});

test(`module '${ID}' inits without errors`, () => {
    createInst();
});

test(`module '${ID}' instance is undefined`, () => {
    assert.equal(createInst(), undefined);
});
