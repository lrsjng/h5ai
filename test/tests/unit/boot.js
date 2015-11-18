(function () {
    var ID = 'boot';
    var DEPS = ['$', 'core/server'];

    describe('module \'' + ID + '\'', function () {
        before(function () {
            this.definition = modulejs._private.definitions[ID];

            this.xConfig = uniq.obj();
            this.xDefine = sinon.stub(modulejs, 'define');
            this.xRequire = sinon.stub(modulejs, 'require');
            this.xServer = {
                request: sinon.stub().callsArgWith(1, this.xConfig)
            };

            this.applyFn = function () {
                this.xDefine.reset();
                this.xRequire.reset();
                this.xServer.request.reset();

                return this.definition.fn($, this.xServer);
            };
        });

        after(function () {
            this.xDefine.restore();
            this.xRequire.restore();
            util.restoreHtml();
        });

        beforeEach(function () {
            util.restoreHtml();
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

            it('no data-module', function () {
                this.applyFn();
                assert.isFalse(this.xServer.request.called);
                assert.isFalse(this.xDefine.called);
                assert.isFalse(this.xRequire.called);
            });

            it('data-module=\'test\'', function () {
                $('<script/>').attr('data-module', 'test').appendTo('head');
                this.applyFn();
                assert.isFalse(this.xServer.request.called);
                assert.isFalse(this.xDefine.called);
                assert.isFalse(this.xRequire.called);
            });

            it('data-module=\'info\'', function () {
                var expectedData = {
                    action: 'get',
                    setup: true,
                    options: true,
                    types: true,
                    refresh: true
                };

                $('<script/>').attr('data-module', 'info').appendTo('head');

                this.applyFn();

                assert.isTrue(this.xServer.request.calledOnce);
                assert.isPlainObject(this.xServer.request.lastCall.args[0]);
                assert.deepEqual(this.xServer.request.lastCall.args[0], expectedData);
                assert.isFunction(this.xServer.request.lastCall.args[1]);

                assert.isTrue(this.xDefine.calledOnce);
                assert.deepEqual(this.xDefine.lastCall.args, ['config', this.xConfig]);

                assert.isTrue(this.xRequire.calledOnce);
                assert.deepEqual(this.xRequire.lastCall.args, ['main/info']);
            });

            it('data-module=\'index\'', function () {
                var expectedData = {
                    action: 'get',
                    setup: true,
                    options: true,
                    types: true,
                    theme: true,
                    langs: true
                };

                $('<script/>').attr('data-module', 'index').appendTo('head');

                this.applyFn();

                assert.isTrue(this.xServer.request.calledOnce);
                assert.isPlainObject(this.xServer.request.lastCall.args[0]);
                assert.deepEqual(this.xServer.request.lastCall.args[0], expectedData);
                assert.isFunction(this.xServer.request.lastCall.args[1]);

                assert.isTrue(this.xDefine.calledOnce);
                assert.deepEqual(this.xDefine.lastCall.args, ['config', this.xConfig]);

                assert.isTrue(this.xRequire.calledOnce);
                assert.deepEqual(this.xRequire.lastCall.args, ['main/index']);
            });
        });
    });
}());
