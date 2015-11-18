(function () {
    var ID = 'core/types';
    var DEPS = ['_', 'config'];

    describe('module \'' + ID + '\'', function () {
        before(function () {
            this.definition = modulejs._private.definitions[ID];

            this.xConfig = {types: {
                a: ['*.a', '*.aa'],
                b: ['*.b'],
                c: ['*.c']
            }};
            this.applyFn = function () {
                return this.definition.fn(_, this.xConfig);
            };
        });

        describe('definition', function () {
            it('is defined', function () {
                assert.isPlainObject(this.definition);
            });

            it('has correct id', function () {
                assert.strictEqual(this.definition.id, ID);
            });

            it('requires correct', function () {
                assert.deepEqual(this.definition.deps, DEPS);
            });

            it('args for each request', function () {
                assert.strictEqual(this.definition.deps.length, this.definition.fn.length);
            });

            it('has no instance', function () {
                assert.notProperty(modulejs._private.instances, ID);
            });

            it('inits without errors', function () {
                this.applyFn();
            });
        });

        describe('application', function () {
            it('returns plain object with 1 property', function () {
                var instance = this.applyFn();
                assert.isPlainObject(instance);
                assert.lengthOfKeys(instance, 1);
            });
        });

        describe('.getType()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isFunction(instance.getType);
            });

            _.each([
                ['file.a', 'a'],
                ['file.aa', 'a'],
                ['foo.b', 'b'],
                ['some/path/file.c', 'c'],
                ['/some/abs/path/file.c', 'c'],
                ['file.x', 'file'],
                ['foo', 'file'],
                ['some/path/foo', 'file'],
                ['/some/path/foo', 'file'],
                ['foo/', 'folder'],
                ['/', 'folder'],
                ['some/path/foo/', 'folder'],
                ['/some/path/foo/', 'folder']
            ], function (data) {
                var arg = data[0];
                var exp = data[1];

                it(arg + ' => ' + exp, function () {
                    var instance = this.applyFn();
                    assert.strictEqual(instance.getType(arg), exp);
                });
            });
        });
    });
}());
