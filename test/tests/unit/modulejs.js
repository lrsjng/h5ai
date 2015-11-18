(function () {
    describe('modulejs', function () {
        it('is global object', function () {
            assert.isPlainObject(modulejs);
            assert.strictEqual(modulejs, window.modulejs);
        });

        it('.define() is function', function () {
            assert.isFunction(modulejs.define);
        });

        it('.require() is function', function () {
            assert.isFunction(modulejs.require);
        });

        it('.state() is function', function () {
            assert.isFunction(modulejs.state);
        });

        it('.log() is function', function () {
            assert.isFunction(modulejs.log);
        });

        it('._private is object', function () {
            assert.isObject(modulejs._private);
        });

        it('has definitions', function () {
            assert.isAbove(_.keys(modulejs._private.definitions).length, 0);
        });

        it('has no instances', function () {
            assert.lengthOfKeys(modulejs._private.instances, 0);
        });
    });
}());
