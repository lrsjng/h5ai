(function () {
    var ID = 'view/viewmode';
    var DEPS = ['_', '$', 'core/event', 'core/resource', 'core/settings', 'view/sidebar', 'view/topbar', 'view/view'];

    describe('module \'' + ID + '\'', function () {
        before(function () {
            this.definition = modulejs._private.definitions[ID];

            this.xEvent = {
                sub: sinon.stub(),
                pub: sinon.stub()
            };
            this.xResource = {
                image: sinon.stub().returns(uniq.path('-image.png'))
            };
            this.xSettings = {view: {
                modeToggle: false
            }};
            this.xSidebar = {$el: null};
            this.xTopbar = {$el: null};
            this.xView = {
                $el: null,
                getModes: sinon.stub().returns(['details', 'grid', 'icons']),
                getMode: sinon.stub(),
                setMode: sinon.stub(),
                getSizes: sinon.stub().returns([20, 30, 40]),
                getSize: sinon.stub(),
                setSize: sinon.stub()
            };

            this.applyFn = function () {
                this.xEvent.sub.reset();
                this.xEvent.pub.reset();
                this.xResource.image.reset();
                this.xView.getModes.reset();
                this.xView.getMode.reset();
                this.xView.setMode.reset();
                this.xView.getSizes.reset();
                this.xView.getSize.reset();
                this.xView.setSize.reset();

                return this.definition.fn(_, $, this.xEvent, this.xResource, this.xSettings, this.xSidebar, this.xTopbar, this.xView);
            };
        });

        after(function () {
            util.restoreHtml();
        });

        beforeEach(function () {
            util.restoreHtml();
            this.xSidebar.$el = $('<div id="sidebar"/>').appendTo('body');
            this.xTopbar.$el = $('<div id="topbar"/>').appendTo('body');
            this.xView.$el = $('<div id="view"/>').appendTo('body');
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
            it('returns undefined', function () {
                var instance = this.applyFn();
                assert.isUndefined(instance);
            });

            it('adds HTML #viewmode-settings to #sidebar', function () {
                this.applyFn();
                assert.lengthOf($('#sidebar > #viewmode-settings'), 1);
            });

            it('adds HTML #viewmode-details to #viewmode-settings', function () {
                this.applyFn();
                assert.lengthOf($('#viewmode-settings > #viewmode-details'), 1);
            });

            it('adds HTML #viewmode-grid to #viewmode-settings', function () {
                this.applyFn();
                assert.lengthOf($('#viewmode-settings > #viewmode-grid'), 1);
            });

            it('adds HTML #viewmode-icons to #viewmode-settings', function () {
                this.applyFn();
                assert.lengthOf($('#viewmode-settings > #viewmode-icons'), 1);
            });

            it('adds HTML #viewmode-size to #viewmode-settings', function () {
                this.applyFn();
                assert.lengthOf($('#viewmode-settings > #viewmode-size'), 1);
            });

            it('does not add HTML #viewmode-details, #viewmode-grid, #viewmode-icons when only one mode', function () {
                this.xView.getModes.returns(['details']);
                this.applyFn();
                assert.lengthOf($('#viewmode-details'), 0);
                assert.lengthOf($('#viewmode-grid'), 0);
                assert.lengthOf($('#viewmode-icons'), 0);
            });

            it('does not add HTML #viewmode-size when only one size', function () {
                this.xView.getSizes.returns([20]);
                this.applyFn();
                assert.lengthOf($('#viewmode-size'), 0);
            });
        });

        describe('works', function () {
            it('clicking #viewmode-details triggers view.setMode(\'details\')', function () {
                this.xView.getModes.returns(['details', 'grid', 'icons']);
                this.applyFn();
                $('#viewmode-details').trigger('click');
                assert.isTrue(this.xView.setMode.calledOnce);
                assert.deepEqual(this.xView.setMode.lastCall.args, ['details']);
            });

            it('clicking #viewmode-grid triggers view.setMode(\'grid\')', function () {
                this.xView.getModes.returns(['details', 'grid', 'icons']);
                this.applyFn();
                $('#viewmode-grid').trigger('click');
                assert.isTrue(this.xView.setMode.calledOnce);
                assert.deepEqual(this.xView.setMode.lastCall.args, ['grid']);
            });

            it('clicking #viewmode-icons triggers view.setMode(\'icons\')', function () {
                this.xView.getModes.returns(['details', 'grid', 'icons']);
                this.applyFn();
                $('#viewmode-icons').trigger('click');
                assert.isTrue(this.xView.setMode.calledOnce);
                assert.deepEqual(this.xView.setMode.lastCall.args, ['icons']);
            });

            it('changing #viewmode-size triggers view.setSize(*)', function () {
                this.xView.getSizes.returns([20, 40, 60]);
                this.applyFn();

                $('#viewmode-size').val(0).trigger('change');
                assert.isTrue(this.xView.setSize.calledOnce);
                assert.deepEqual(this.xView.setSize.lastCall.args, [20]);

                $('#viewmode-size').val(1).trigger('change');
                assert.isTrue(this.xView.setSize.calledTwice);
                assert.deepEqual(this.xView.setSize.lastCall.args, [40]);

                $('#viewmode-size').val(2).trigger('change');
                assert.isTrue(this.xView.setSize.calledThrice);
                assert.deepEqual(this.xView.setSize.lastCall.args, [60]);
            });

            it('inputing #viewmode-size triggers view.setSize(*)', function () {
                this.xView.getSizes.returns([20, 40, 60]);
                this.applyFn();

                $('#viewmode-size').val(0).trigger('input');
                assert.isTrue(this.xView.setSize.calledOnce);
                assert.deepEqual(this.xView.setSize.lastCall.args, [20]);

                $('#viewmode-size').val(1).trigger('input');
                assert.isTrue(this.xView.setSize.calledTwice);
                assert.deepEqual(this.xView.setSize.lastCall.args, [40]);

                $('#viewmode-size').val(2).trigger('input');
                assert.isTrue(this.xView.setSize.calledThrice);
                assert.deepEqual(this.xView.setSize.lastCall.args, [60]);
            });
        });
    });
}());
