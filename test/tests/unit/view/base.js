(function () {
'use strict';

var ID = 'view/base';
var DEPS = ['$', 'config'];

describe('module \'' + ID + '\'', function () {

    before(function () {

        this.definition = modulejs._private.definitions[ID];

        this.xConfig = {setup: {VERSION: util.uniqId()}};
        this.applyFn = function () {

            return this.definition.fn($, this.xConfig);
        };
    });

    after(function () {

        util.restoreHtml();
    });

    beforeEach(function () {

        util.restoreHtml();
        $('<div ID="fallback"/>').appendTo('body');
        $('<div id="fallback-hints"/>').appendTo('body');
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

        it('removes HTML #fallback', function () {

            this.applyFn();
            assert.lengthOf($('#fallback'), 0);
        });

        it('removes HTML #fallback-hints', function () {

            this.applyFn();
            assert.lengthOf($('#fallback-hints'), 0);
        });

        it('adds HTML #topbar', function () {

            this.applyFn();
            assert.lengthOf($('body > #topbar'), 1);
        });

        it('adds HTML #toolbar', function () {

            this.applyFn();
            assert.lengthOf($('#topbar > #toolbar'), 1);
        });

        it('adds HTML #crumbbar', function () {

            this.applyFn();
            assert.lengthOf($('#topbar > #crumbbar'), 1);
        });

        it('adds HTML #main-row', function () {

            this.applyFn();
            assert.lengthOf($('body > #main-row'), 1);
        });

        it('adds HTML #sidebar', function () {

            this.applyFn();
            assert.lengthOf($('#main-row > #sidebar'), 1);
        });

        it('adds HTML #backlink', function () {

            this.applyFn();
            assert.lengthOf($('#topbar > #backlink'), 1);
        });

        it('#backlink has correct href', function () {

            this.applyFn();
            assert.strictEqual($('#backlink').attr('href'), 'http://larsjung.de/h5ai/');
        });

        it('#backlink has correct title', function () {

            this.applyFn();
            assert.strictEqual($('#backlink').attr('title'), 'powered by h5ai ' + this.xConfig.setup.VERSION);
        });

        it('#backlink has correct text', function () {

            this.applyFn();
            assert.strictEqual($('#backlink > div').eq(0).text(), 'powered');
            assert.strictEqual($('#backlink > div').eq(1).text(), 'by h5ai');
        });
    });
});

}());
