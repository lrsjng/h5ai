(function () {
    var ID = 'view/notification';
    var DEPS = ['$', 'view/root'];

    describe('module \'' + ID + '\'', function () {
        before(function () {
            this.definition = modulejs._private.definitions[ID];

            this.xRoot = {$el: null};
            this.applyFn = function () {
                return this.definition.fn($, this.xRoot);
            };
        });

        after(function () {
            util.restoreHtml();
        });

        beforeEach(function () {
            util.restoreHtml();
            this.xRoot.$el = $('<div id="root"/>').appendTo('body');
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

            it('adds HTML #notification to #root (hidden)', function () {
                this.applyFn();
                assert.lengthOf($('#root > #notification'), 1);
                assert.lengthOf($('#notification:visible'), 0);
                assert.strictEqual($('#notification').text(), '');
            });
        });

        describe('.$el', function () {
            it('is $(\'#notification\')', function () {
                var instance = this.applyFn();
                assert.isObject(instance.$el);
                assert.lengthOf(instance.$el, 1);
                assert.isString(instance.$el.jquery);
                assert.strictEqual(instance.$el.attr('id'), 'notification');
            });
        });

        describe('.set()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isTrue(_.isFunction(instance.set));
            });

            it('works', function () {
                var instance = this.applyFn();

                instance.set();
                assert.lengthOf($('#notification:visible'), 0);
                assert.strictEqual($('#notification').text(), '');

                instance.set('hello');
                assert.lengthOf($('#notification:visible'), 1);
                assert.strictEqual($('#notification').text(), 'hello');

                instance.set('world');
                assert.lengthOf($('#notification:visible'), 1);
                assert.strictEqual($('#notification').text(), 'world');

                instance.set();
                // assert.lengthOf($('#notification:visible'), 0);
                assert.strictEqual($('#notification').text(), 'world');
            });
        });
    });
}());
