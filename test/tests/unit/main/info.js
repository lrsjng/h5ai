(function () {
    var ID = 'main/info';
    var DEPS = ['$', 'config', 'core/resource', 'core/server'];

    describe('module \'' + ID + '\'', function () {
        before(function () {
            this.definition = modulejs._private.definitions[ID];

            this.xConfig = {
                setup: {
                    VERSION: uniq.id()
                },
                options: {}
            };
            this.xResource = {
                image: sinon.stub()
            };
            this.xServer = {
                request: sinon.stub()
            };

            this.applyFn = function () {
                this.xServer.request.reset();

                return this.definition.fn($, this.xConfig, this.xResource, this.xServer);
            };
        });

        after(function () {
            util.restoreHtml();
        });

        beforeEach(function () {
            util.restoreHtml();
            $('<div id="content"/>').appendTo('body');
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

            it('adds HTML #support to #content', function () {
                this.applyFn();
                assert.lengthOf($('#content > #support'), 1);
                assert.lengthOf($('#support > .paypal'), 1);
                assert.lengthOf($('.paypal > form'), 1);
            });

            it('adds HTML #login-wrapper to #content', function () {
                this.applyFn();
                assert.lengthOf($('#content > #login-wrapper'), 1);
            });

            describe('no admin', function () {
                it('adds HTML #pass to #login-wrapper', function () {
                    this.xConfig.setup.AS_ADMIN = false;
                    this.applyFn();
                    assert.lengthOf($('#login-wrapper > #pass'), 1);
                });

                it('sets #pass val to empty string', function () {
                    this.xConfig.setup.AS_ADMIN = false;
                    this.applyFn();
                    assert.strictEqual($('#login-wrapper > #pass').val(), '');
                });

                it('adds HTML #login to #login-wrapper', function () {
                    this.xConfig.setup.AS_ADMIN = false;
                    this.applyFn();
                    assert.lengthOf($('#login-wrapper > #login'), 1);
                });

                it('does not add HTML #logout to #login-wrapper', function () {
                    this.xConfig.setup.AS_ADMIN = false;
                    this.applyFn();
                    assert.lengthOf($('#login-wrapper > #logout'), 0);
                });

                it('does not add HTML #tests to #content', function () {
                    this.xConfig.setup.AS_ADMIN = false;
                    this.applyFn();
                    assert.lengthOf($('#content > #tests'), 0);
                });

                it('login works', function () {
                    var pass = uniq.id();
                    var expectedData = {
                        action: 'login',
                        pass: pass
                    };

                    this.xConfig.setup.AS_ADMIN = false;
                    this.applyFn();
                    $('#pass').val(pass);
                    $('#login').trigger('click');

                    assert.isTrue(this.xServer.request.calledOnce);
                    assert.isPlainObject(this.xServer.request.lastCall.args[0]);
                    assert.deepEqual(this.xServer.request.lastCall.args[0], expectedData);
                    assert.isFunction(this.xServer.request.lastCall.args[1]);
                });
            });

            describe('as admin', function () {
                it('does not add HTML #pass to #login-wrapper', function () {
                    this.xConfig.setup.AS_ADMIN = true;
                    this.applyFn();
                    assert.lengthOf($('#login-wrapper > #pass'), 0);
                });

                it('does not add #login to #login-wrapper', function () {
                    this.xConfig.setup.AS_ADMIN = true;
                    this.applyFn();
                    assert.lengthOf($('#login-wrapper > #login'), 0);
                });

                it('adds HTML #logout to #login-wrapper', function () {
                    this.xConfig.setup.AS_ADMIN = true;
                    this.applyFn();
                    assert.lengthOf($('#login-wrapper > #logout'), 1);
                });

                it('adds HTML #tests to #content', function () {
                    this.xConfig.setup.AS_ADMIN = true;
                    this.applyFn();
                    assert.lengthOf($('#content > #tests'), 1);
                });

                it('adds HTML #test 15x to #tests', function () {
                    this.xConfig.setup.AS_ADMIN = true;
                    this.applyFn();
                    assert.strictEqual($('#tests > .test').length, 15);
                });

                it('logout works', function () {
                    var expectedData = {
                        action: 'logout'
                    };

                    this.xConfig.setup.AS_ADMIN = true;
                    this.applyFn();
                    $('#logout').trigger('click');

                    assert.isTrue(this.xServer.request.calledOnce);
                    assert.isPlainObject(this.xServer.request.lastCall.args[0]);
                    assert.deepEqual(this.xServer.request.lastCall.args[0], expectedData);
                    assert.isFunction(this.xServer.request.lastCall.args[1]);
                });
            });
        });
    });
}());
