(function () {
    var ID = 'view/mainrow';
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
            it('returns object with 1 property', function () {
                var instance = this.applyFn();
                assert.isPlainObject(instance);
                assert.lengthOfKeys(instance, 1);
            });

            it('adds HTML #mainrow to #root', function () {
                this.applyFn();
                assert.lengthOf($('#root > #mainrow'), 1);
            });
        });

        describe('.$el', function () {
            it('is $(\'#mainrow\')', function () {
                var instance = this.applyFn();
                assert.isObject(instance.$el);
                assert.lengthOf(instance.$el, 1);
                assert.isString(instance.$el.jquery);
                assert.strictEqual(instance.$el.attr('id'), 'mainrow');
            });
        });
    });
}());
