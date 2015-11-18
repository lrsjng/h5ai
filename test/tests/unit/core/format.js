(function () {
    var ID = 'core/format';
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
            it('returns plain object with 4 properties', function () {
                var instance = this.applyFn();
                assert.isPlainObject(instance);
                assert.lengthOfKeys(instance, 4);
            });
        });

        describe('.setDefaultMetric()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isFunction(instance.setDefaultMetric);
            });
        });

        describe('.formatSize()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isFunction(instance.formatSize);
            });

            it('defaults to decimal metric', function () {
                var instance = this.applyFn();
                assert.strictEqual(instance.formatSize(1024), '1 KB');
                instance.setDefaultMetric(true);
                assert.strictEqual(instance.formatSize(1024), '1 KiB');
                instance.setDefaultMetric(false);
                assert.strictEqual(instance.formatSize(1024), '1 KB');
            });

            describe('decimal metric', function () {
                _.each([
                    [0, '0 B'],
                    [10, '10 B'],
                    [999, '999 B'],
                    [1000, '1 KB'],
                    [1001, '1 KB'],
                    [1499, '1 KB'],
                    [1500, '2 KB'],
                    [999999, '1000 KB'],
                    [1000000, '1.0 MB'],
                    [1000001, '1.0 MB'],
                    [1230000, '1.2 MB'],
                    [1250000, '1.3 MB'],
                    [999999999, '1000.0 MB'],
                    [1000000000, '1.0 GB'],
                    [1250000000, '1.3 GB'],
                    [999999999999, '1000.0 GB'],
                    [1000000000000, '1.0 TB'],
                    [1250000000000, '1.3 TB']
                ], function (data) {
                    var arg = data[0];
                    var exp = data[1];

                    it(arg + ' => ' + exp, function () {
                        var instance = this.applyFn();
                        instance.setDefaultMetric(false);
                        assert.strictEqual(instance.formatSize(arg), exp);
                    });
                });
            });

            describe('binary metric', function () {
                _.each([
                    [0, '0 B'],
                    [10, '10 B'],
                    [999, '999 B'],
                    [1000, '1000 B'],
                    [1001, '1001 B'],
                    [1024, '1 KiB'],
                    [1499, '1 KiB'],
                    [1500, '1 KiB'],
                    [999999, '977 KiB'],
                    [1000000, '977 KiB'],
                    [1000001, '977 KiB'],
                    [1230000, '1.2 MiB'],
                    [1250000, '1.2 MiB'],
                    [999999999, '953.7 MiB'],
                    [1000000000, '953.7 MiB'],
                    [1250000000, '1.2 GiB'],
                    [999999999999, '931.3 GiB'],
                    [1000000000000, '931.3 GiB'],
                    [1250000000000, '1.1 TiB']
                ], function (data) {
                    var arg = data[0];
                    var exp = data[1];

                    it(arg + ' => ' + exp, function () {
                        var instance = this.applyFn();
                        instance.setDefaultMetric(true);
                        assert.strictEqual(instance.formatSize(arg), exp);
                    });
                });
            });
        });

        describe('.setDefaultDateFormat()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isFunction(instance.setDefaultDateFormat);
            });
        });

        describe('.formatDate()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isFunction(instance.formatDate);
            });

            it('default format', function () {
                var instance = this.applyFn();
                assert.strictEqual(instance.formatDate(0), '');
                assert.strictEqual(instance.formatDate(1000), '1970-01-01 01:00');
                assert.strictEqual(instance.formatDate(-1000), '1970-01-01 00:59');
                assert.strictEqual(instance.formatDate(1400000000000), '2014-05-13 18:53');

                instance.setDefaultDateFormat('YYYY-MM-DD HH:mm:ss');
                assert.strictEqual(instance.formatDate(0), '');
                assert.strictEqual(instance.formatDate(1000), '1970-01-01 01:00:01');
                assert.strictEqual(instance.formatDate(-1000), '1970-01-01 00:59:59');
                assert.strictEqual(instance.formatDate(1400000000000), '2014-05-13 18:53:20');

                instance.setDefaultDateFormat('H YY s');
                assert.strictEqual(instance.formatDate(0), '');
                assert.strictEqual(instance.formatDate(1000), '1 70 1');
                assert.strictEqual(instance.formatDate(-1000), '0 70 59');
                assert.strictEqual(instance.formatDate(1400000000000), '18 14 20');
            });

            _.each([
                [0, 'YYYY-MM-DD HH:mm:ss', ''],
                [1000, 'YYYY-MM-DD HH:mm:ss', '1970-01-01 01:00:01'],
                [-1000, 'YYYY-MM-DD HH:mm:ss', '1970-01-01 00:59:59'],
                [1400000000000, 'YYYY-MM-DD HH:mm:ss', '2014-05-13 18:53:20'],
                [1400000000000, 'XYYYYXMMXDDXHHXmmXssX', 'X2014X05X13X18X53X20X'],
                [1400000000000, 'YYYY YY Y MM M DD D HH H mm m ss s', '2014 14 2014 05 5 13 13 18 18 53 53 20 20']
            ], function (data) {
                var arg1 = data[0];
                var arg2 = data[1];
                var exp = data[2];

                it(arg1 + ', ' + arg2 + ' => ' + exp, function () {
                    var instance = this.applyFn();
                    assert.strictEqual(instance.formatDate(arg1, arg2), exp);
                });
            });
        });
    });
}());
