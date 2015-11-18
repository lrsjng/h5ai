(function () {
    var ID = 'view/sidebar';
    var DEPS = ['$', 'core/resource', 'core/store', 'view/mainrow', 'view/topbar'];

    describe('module \'' + ID + '\'', function () {
        before(function () {
            this.definition = modulejs._private.definitions[ID];

            this.xResource = {
                image: sinon.stub().throws('invalid image request')
            };
            this.xResource.image.withArgs('back').returns(uniq.path('-back.png'));
            this.xResource.image.withArgs('sidebar').returns(uniq.path('-sidebar.png'));
            this.xStore = {
                get: sinon.stub().returns(false),
                put: sinon.stub()
            };
            this.xStore.get.returns(false);
            this.xMainrow = {$el: null};
            this.xTopbar = {$toolbar: null};
            this.applyFn = function () {
                this.xResource.image.reset();
                this.xStore.get.reset();
                this.xStore.put.reset();

                return this.definition.fn($, this.xResource, this.xStore, this.xMainrow, this.xTopbar);
            };
        });

        after(function () {
            util.restoreHtml();
        });

        beforeEach(function () {
            util.restoreHtml();
            this.xMainrow.$el = $('<div id="mainrow"/>').appendTo('body');
            this.xTopbar.$toolbar = $('<div id="toolbar"/>').appendTo('body');
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
                this.instance = this.applyFn();
            });
        });

        describe('application', function () {
            it('returns object with 1 property', function () {
                var instance = this.applyFn();
                assert.isPlainObject(instance);
                assert.lengthOfKeys(instance, 1);
            });

            it('adds HTML #sidebar-toggle to #toolbar', function () {
                this.applyFn();
                assert.lengthOf($('#toolbar > #sidebar-toggle'), 1);
            });

            it('toggle works', function () {
                this.applyFn();
                assert.lengthOf($('#sidebar:visible'), 0);

                this.xStore.get.returns(false).reset();
                this.xStore.put.reset();

                $('#sidebar-toggle').trigger('click');

                assert.isTrue(this.xStore.get.calledOnce);
                assert.strictEqual(this.xStore.get.lastCall.args[0], 'sidebarIsVisible');
                assert.isTrue(this.xStore.put.calledOnce);
                assert.strictEqual(this.xStore.put.lastCall.args[0], 'sidebarIsVisible');
                assert.isTrue(this.xStore.put.lastCall.args[1]);

                assert.lengthOf($('#sidebar:visible'), 1);

                this.xStore.get.returns(true).reset();
                this.xStore.put.reset();

                $('#sidebar-toggle').trigger('click');

                assert.isTrue(this.xStore.get.calledOnce);
                assert.strictEqual(this.xStore.get.lastCall.args[0], 'sidebarIsVisible');
                assert.isTrue(this.xStore.put.calledOnce);
                assert.strictEqual(this.xStore.put.lastCall.args[0], 'sidebarIsVisible');
                assert.isFalse(this.xStore.put.lastCall.args[1]);

                assert.lengthOf($('#sidebar:visible'), 0);
            });
        });

        describe('.$el', function () {
            it('is $(\'#sidebar\')', function () {
                var instance = this.applyFn();
                assert.isObject(instance.$el);
                assert.lengthOf(instance.$el, 1);
                assert.isString(instance.$el.jquery);
                assert.strictEqual(instance.$el.attr('id'), 'sidebar');
            });
        });
    });
}());
