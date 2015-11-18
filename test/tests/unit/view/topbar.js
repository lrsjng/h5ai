(function () {
    var ID = 'view/topbar';
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
            it('returns object with 3 properties', function () {
                var instance = this.applyFn();
                assert.isPlainObject(instance);
                assert.lengthOfKeys(instance, 3);
            });

            it('adds HTML #topbar to #root', function () {
                this.applyFn();
                assert.lengthOf($('#root > #topbar'), 1);
            });

            it('adds HTML #toolbar to #topbar', function () {
                this.applyFn();
                assert.lengthOf($('#topbar > #toolbar'), 1);
            });

            it('adds HTML #flowbar to #topbar', function () {
                this.applyFn();
                assert.lengthOf($('#topbar > #flowbar'), 1);
            });

            it('adds HTML #backlink to #topbar', function () {
                this.applyFn();
                assert.lengthOf($('#topbar > #backlink'), 1);
            });

            it('#backlink has correct href', function () {
                this.applyFn();
                assert.strictEqual($('#backlink').attr('href'), 'https://larsjung.de/h5ai/');
            });

            it('#backlink has correct title', function () {
                this.applyFn();
                assert.strictEqual($('#backlink').attr('title'), 'powered by h5ai - https://larsjung.de/h5ai/');
            });

            it('#backlink has correct text', function () {
                this.applyFn();
                assert.strictEqual($('#backlink > div').eq(0).text(), 'powered');
                assert.strictEqual($('#backlink > div').eq(1).text(), 'by h5ai');
            });
        });

        describe('.$el', function () {
            it('is $(\'#topbar\')', function () {
                var instance = this.applyFn();
                assert.isObject(instance.$el);
                assert.lengthOf(instance.$el, 1);
                assert.isString(instance.$el.jquery);
                assert.strictEqual(instance.$el.attr('id'), 'topbar');
            });
        });

        describe('.$toolbar', function () {
            it('is $(\'#toolbar\')', function () {
                var instance = this.applyFn();
                assert.isObject(instance.$toolbar);
                assert.lengthOf(instance.$toolbar, 1);
                assert.isString(instance.$toolbar.jquery);
                assert.strictEqual(instance.$toolbar.attr('id'), 'toolbar');
            });
        });

        describe('.$flowbar', function () {
            it('is $(\'#flowbar\')', function () {
                var instance = this.applyFn();
                assert.isObject(instance.$flowbar);
                assert.lengthOf(instance.$flowbar, 1);
                assert.isString(instance.$flowbar.jquery);
                assert.strictEqual(instance.$flowbar.attr('id'), 'flowbar');
            });
        });
    });
}());
