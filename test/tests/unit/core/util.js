(function () {
    var ID = 'core/util';
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

        describe('.regularCmpFn()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isFunction(instance.regularCmpFn);
            });

            _.each([
                [0, 0, 0],
                [1, 0, 1],
                [1, 2, -1],
                ['a', 'a', 0],
                ['b', 'a', 1],
                ['a', 'b', -1],
                ['a 2', 'a 10', 1]
            ], function (data) {
                var arg1 = data[0];
                var arg2 = data[1];
                var exp = data[2];

                it(arg1 + ', ' + arg2 + ' => ' + exp, function () {
                    var instance = this.applyFn();
                    assert.strictEqual(instance.regularCmpFn(arg1, arg2), exp);
                });
            });
        });

        describe('.naturalCmpFn()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isFunction(instance.naturalCmpFn);
            });

            _.each([
                [0, 0, 0],
                [1, 0, 1],
                [1, 2, -1],
                ['a', 'a', 0],
                ['b', 'a', 1],
                ['a', 'b', -1],
                ['a 2', 'a 10', -1]
            ], function (data) {
                var arg1 = data[0];
                var arg2 = data[1];
                var exp = data[2];

                it(arg1 + ', ' + arg2 + ' => ' + exp, function () {
                    var instance = this.applyFn();
                    assert.strictEqual(instance.naturalCmpFn(arg1, arg2), exp);
                });
            });
        });

        describe('.escapePattern()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isFunction(instance.escapePattern);
            });

            _.each([
                ['a', 'a'],
                ['1', '1'],
                ['ä', 'ä'],
                ['~', '~'],
                [':', ':'],
                ['_', '_'],
                ['<', '<'],
                ['-', '\\-'],
                ['[', '\\['],
                [']', '\\]'],
                ['{', '\\{'],
                ['}', '\\}'],
                ['(', '\\('],
                [')', '\\)'],
                ['*', '\\*'],
                ['+', '\\+'],
                ['?', '\\?'],
                ['.', '\\.'],
                [',', '\\,'],
                ['\\', '\\\\'],
                ['$', '\\$'],
                ['^', '\\^'],
                ['|', '\\|'],
                ['#', '\\#'],
                [' ', '\\ '],
                ['-[]{}()*+?.,\\$^|# ', '\\-\\[\\]\\{\\}\\(\\)\\*\\+\\?\\.\\,\\\\\\$\\^\\|\\#\\ '],
                ['abc123', 'abc123'],
                ['a.b+c*1', 'a\\.b\\+c\\*1']
            ], function (data) {
                var arg = data[0];
                var exp = data[1];

                it(arg + ' => ' + exp, function () {
                    var instance = this.applyFn();
                    assert.strictEqual(instance.escapePattern(arg), exp);
                });
            });
        });

        describe('.parsePattern()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isFunction(instance.parsePattern);
            });

            _.each([
                ['a', false, 'a'],
                ['1', false, '1'],
                ['ä', false, 'ä'],
                ['~', false, '~'],
                [':', false, ':'],
                ['_', false, '_'],
                ['<', false, '<'],
                ['-', false, '\\-'],
                ['[', false, '\\['],
                [']', false, '\\]'],
                ['{', false, '\\{'],
                ['}', false, '\\}'],
                ['(', false, '\\('],
                [')', false, '\\)'],
                ['*', false, '\\*'],
                ['+', false, '\\+'],
                ['?', false, '\\?'],
                ['.', false, '\\.'],
                [',', false, '\\,'],
                ['\\', false, '\\\\'],
                ['$', false, '\\$'],
                ['^', false, '\\^'],
                ['|', false, '\\|'],
                ['#', false, '\\#'],
                [' ', false, '\\ '],
                ['-[]{}()*+?.,\\$^|# ', false, '\\-\\[\\]\\{\\}\\(\\)\\*\\+\\?\\.\\,\\\\\\$\\^\\|\\#\\ '],
                ['abc123', false, 'abc123'],
                ['a.b+c*1', false, 'a\\.b\\+c\\*1'],

                ['abc', true, 'a.*?b.*?c'],
                ['abc def', true, 'a.*?b.*?c|d.*?e.*?f'],
                ['*#a b.=', true, '\\*.*?\\#.*?a|b.*?\\..*?='],
                ['re:.', true, '.'],
                [' .', true, '\\.'],
                ['re: .', true, ' .']

            ], function (data) {
                var arg1 = data[0];
                var arg2 = data[1];
                var exp = data[2];

                it(arg1 + ', ' + arg2 + ' => ' + exp, function () {
                    var instance = this.applyFn();
                    assert.strictEqual(instance.parsePattern(arg1, arg2), exp);
                });
            });
        });
    });
}());
