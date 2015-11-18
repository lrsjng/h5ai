(function () {
    var ID = 'view/root';
    var DEPS = ['$'];

    describe('module \'' + ID + '\'', function () {
        before(function () {
            this.definition = modulejs._private.definitions[ID];

            this.applyFn = function () {
                return this.definition.fn($);
            };
        });

        after(function () {
            util.restoreHtml();
        });

        beforeEach(function () {
            util.restoreHtml();
            $('<div id="fallback"/>').appendTo('body');
            $('<div id="fallback-hints"/>').appendTo('body');
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
            it('returns object with 1 property', function () {
                var instance = this.applyFn();
                assert.isPlainObject(instance);
                assert.lengthOfKeys(instance, 1);
            });

            it('adds id root to body', function () {
                this.applyFn();
                assert.strictEqual($('body').attr('id'), 'root');
            });

            it('removes HTML #fallback', function () {
                this.applyFn();
                assert.lengthOf($('#fallback'), 0);
            });

            it('removes HTML #fallback-hints', function () {
                this.applyFn();
                assert.lengthOf($('#fallback-hints'), 0);
            });
        });

        describe('.$el', function () {
            it('is $(\'#root\')', function () {
                var instance = this.applyFn();
                assert.isObject(instance.$el);
                assert.lengthOf(instance.$el, 1);
                assert.isString(instance.$el.jquery);
                assert.strictEqual(instance.$el.attr('id'), 'root');
            });
        });
    });
}());
