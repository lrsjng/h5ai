(function () {
    var ID = 'core/modernizr';
    var DEPS = [];

    describe('module \'' + ID + '\'', function () {
        before(function () {
            this.definition = modulejs._private.definitions[ID];

            this.applyFn = function () {
                return this.definition.fn();
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
            it('returns plain object with 3 properties', function () {
                var instance = this.applyFn();
                assert.isPlainObject(instance);
                assert.lengthOf(_.keys(instance), 3);
            });
        });

        describe('.canvas', function () {
            it('is boolean', function () {
                var instance = this.applyFn();
                assert.isBoolean(instance.canvas);
            });
        });

        describe('.history', function () {
            it('is boolean', function () {
                var instance = this.applyFn();
                assert.isBoolean(instance.history);
            });
        });

        describe('.localstorage', function () {
            it('is boolean', function () {
                var instance = this.applyFn();
                assert.isBoolean(instance.localstorage);
            });
        });
    });
}());
