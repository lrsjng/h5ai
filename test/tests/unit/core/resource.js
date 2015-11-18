(function () {
    var ID = 'core/resource';
    var DEPS = ['_', 'config', 'core/settings'];

    describe('module \'' + ID + '\'', function () {
        before(function () {
            this.definition = modulejs._private.definitions[ID];

            this.xConfig = {
                theme: {
                    a: 'myTheme/a.svg',
                    b: 'myTheme/b.jpg'
                }
            };
            this.xSettings = {publicHref: uniq.path('/publicHref/')};
            this.applyFn = function () {
                return this.definition.fn(_, this.xConfig, this.xSettings);
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
            it('returns plain object with 2 properties', function () {
                var instance = this.applyFn();
                assert.isPlainObject(instance);
                assert.lengthOfKeys(instance, 2);
            });
        });

        describe('.image()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isFunction(instance.image);
            });

            it('works', function () {
                var instance = this.applyFn();
                var ui = this.xSettings.publicHref + 'images/ui/';

                assert.strictEqual(instance.image(), ui + 'undefined.svg');
                assert.strictEqual(instance.image(1), ui + '1.svg');
                assert.strictEqual(instance.image(''), ui + '.svg');
                assert.strictEqual(instance.image('a'), ui + 'a.svg');
            });
        });

        describe('.icon()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isFunction(instance.icon);
            });

            it('works', function () {
                var instance = this.applyFn();
                var themes = this.xSettings.publicHref + 'images/themes/';

                assert.strictEqual(instance.icon(''), themes + 'default/file.svg');
                assert.strictEqual(instance.icon('a'), themes + 'myTheme/a.svg');
                assert.strictEqual(instance.icon('a-sub'), themes + 'myTheme/a.svg');
                assert.strictEqual(instance.icon('b'), themes + 'myTheme/b.jpg');
                assert.strictEqual(instance.icon('x'), themes + 'default/x.svg');
                assert.strictEqual(instance.icon('y'), themes + 'default/file.svg');
                assert.strictEqual(instance.icon('y-sub'), themes + 'default/file.svg');
            });
        });
    });
}());
