(function () {
    var ID = 'main/index';
    var DEPS = ['_', 'core/location'];

    describe('module \'' + ID + '\'', function () {
        before(function () {
            this.definition = modulejs._private.definitions[ID];

            this.xLocation = {setLocation: sinon.stub()};
            this.xRequire = sinon.stub(modulejs, 'require');

            this.applyFn = function () {
                this.xLocation.setLocation.reset();
                this.xRequire.reset();
                return this.definition.fn(_, this.xLocation);
            };
        });

        after(function () {
            this.xRequire.restore();
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

            it('requires view/viewmode', function () {
                this.applyFn();
                assert.isTrue(this.xRequire.calledWithExactly('view/viewmode'));
            });

            it('requires all extensions', function () {
                this.applyFn();
                var re = /^ext\//;
                var self = this;

                _.each(modulejs.state(), function (state, id) {
                    if (re.test(id)) {
                        assert.isTrue(self.xRequire.calledWithExactly(id));
                    }
                });
            });

            it('requires only views and extensions', function () {
                this.applyFn();
                assert.isTrue(this.xRequire.alwaysCalledWithMatch(/^(view|ext)\//));
            });

            it('requires views before extensions', function () {
                this.applyFn();
                var foundExtension = false;
                var reView = /^view\//;
                var reExt = /^ext\//;

                _.each(this.xRequire.args, function (args) {
                    if (foundExtension) {
                        assert.match(args[0], reExt);
                    } else if (reExt.test(args[0])) {
                        foundExtension = true;
                    } else {
                        assert.match(args[0], reView);
                    }
                });
            });

            it('calls setLocation with current href, keeping browser url', function () {
                this.applyFn();
                assert.isTrue(this.xLocation.setLocation.calledOnce);
                assert.deepEqual(this.xLocation.setLocation.firstCall.args, [document.location.href, true]);
                assert.isTrue(this.xLocation.setLocation.calledAfter(this.xRequire));
            });
        });
    });
}());
