(function () {
    var ID = 'ext/title';
    var DEPS = ['_', 'core/event', 'core/settings'];

    describe('module \'' + ID + '\'', function () {
        before(function () {
            this.definition = modulejs._private.definitions[ID];

            this.xEvent = {
                sub: sinon.stub()
            };
            this.xSettings = {title: {
                enabled: true
            }};

            this.applyFn = function () {
                this.xEvent.sub.reset();

                return this.definition.fn(_, this.xEvent, this.xSettings);
            };
        });

        after(function () {
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

            it('subscribes to location.changed', function () {
                this.xSettings.title.enabled = true;

                this.applyFn();
                assert.isTrue(this.xEvent.sub.calledOnce);
                assert.strictEqual(this.xEvent.sub.lastCall.args[0], 'location.changed');
            });

            it('does not subscribe to events if disabled', function () {
                this.xSettings.title.enabled = false;

                this.applyFn();
                assert.isFalse(this.xEvent.sub.called);
            });
        });

        describe('sets title on location.changed', function () {
            _.each([
                [''],
                ['a', 'a'],
                ['a', 'b', 'b - a > b'],
                ['a', 'b', 'c', 'c - a > b > c']
            ], function (data) {
                var labels = data.slice(0, -1);
                var exp = data.slice(-1)[0];

                it(labels + ' => ' + exp, function () {
                    this.xSettings.title.enabled = true;

                    this.applyFn();

                    var fn = this.xEvent.sub.lastCall.args[1];
                    var crumb = _.map(labels, function (x) { return {label: x}; });
                    var item = {
                        getCrumb: sinon.stub().returns(crumb)
                    };

                    fn(item);

                    assert.isTrue(item.getCrumb.calledOnce);
                    assert.strictEqual(document.title, exp);
                });
            });
        });
    });
}());
