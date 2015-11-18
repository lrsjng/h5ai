(function () {
    var ID = 'core/event';
    var DEPS = ['_'];

    describe('module \'' + ID + '\'', function () {
        before(function () {
            this.definition = modulejs._private.definitions[ID];

            this.applyFn = function () {
                return this.definition.fn(_);
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
            it('returns plain object with 3 properties', function () {
                var instance = this.applyFn();
                assert.isPlainObject(instance);
                assert.lengthOfKeys(instance, 3);
            });
        });

        describe('.sub()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isFunction(instance.sub);
            });
        });

        describe('.unsub()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isFunction(instance.unsub);
            });
        });

        describe('.pub()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isFunction(instance.pub);
            });
        });

        describe('works', function () {
            it('works', function () {
                var topic = 'topic';
                var arg1 = 'arg1';
                var arg2 = 'arg2';
                var arg3 = 'arg3';
                var subSpy = sinon.spy();

                var instance = this.applyFn();
                instance.sub(topic, subSpy);
                instance.pub(topic, arg1, arg2, arg3);

                assert.isTrue(subSpy.calledOnce);
                assert.deepEqual(subSpy.firstCall.args, [arg1, arg2, arg3]);

                instance.pub(topic, arg1, arg2);

                assert.isTrue(subSpy.calledTwice);
                assert.deepEqual(subSpy.firstCall.args, [arg1, arg2, arg3]);
                assert.deepEqual(subSpy.secondCall.args, [arg1, arg2]);

                instance.unsub(topic, subSpy);

                assert.isTrue(subSpy.calledTwice);
                assert.deepEqual(subSpy.firstCall.args, [arg1, arg2, arg3]);
                assert.deepEqual(subSpy.secondCall.args, [arg1, arg2]);

                instance.pub(topic, arg1);

                assert.isTrue(subSpy.calledTwice);
                assert.deepEqual(subSpy.firstCall.args, [arg1, arg2, arg3]);
                assert.deepEqual(subSpy.secondCall.args, [arg1, arg2]);
            });
        });
    });
}());
