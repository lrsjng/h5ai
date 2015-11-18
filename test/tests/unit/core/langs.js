(function () {
    var ID = 'core/langs';
    var DEPS = ['_', 'config'];

    describe('module \'' + ID + '\'', function () {
        before(function () {
            this.definition = modulejs._private.definitions[ID];

            this.xConfig = {langs: uniq.obj()};
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
            it('returns plain object with right content', function () {
                var instance = this.applyFn();
                assert.isPlainObject(instance);
                assert.deepEqual(instance, this.xConfig.langs);
            });
        });
    });
}());
