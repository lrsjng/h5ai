(function () {
'use strict';

var ID = 'view/topbar';
var DEPS = ['$', 'config', 'view/root'];

describe('module \'' + ID + '\'', function () {

    before(function () {

        this.definition = modulejs._private.definitions[ID];

        this.xConfig = {setup: {VERSION: util.uniqId()}};
        this.xRoot = {$el: null};
        this.applyFn = function () {

            return this.definition.fn($, this.xConfig, this.xRoot);
        };
    });

    after(function () {

        util.restoreHtml();
    });

    beforeEach(function () {

        util.restoreHtml();
        this.xRoot.$el = $('<div id="root"/>').appendTo('body');
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

        it('returns object with 3 properties', function () {

            var instance = this.applyFn();
            assert.isPlainObject(instance);
            assert.lengthOfKeys(instance, 3);
        });

        it('adds HTML #topbar to #root', function () {

            this.applyFn();
            assert.lengthOf($('#root > #topbar'), 1);
        });

        it('adds HTML #toolbar to #topbar', function () {

            this.applyFn();
            assert.lengthOf($('#topbar > #toolbar'), 1);
        });

        it('adds HTML #crumbbar to #topbar', function () {

            this.applyFn();
            assert.lengthOf($('#topbar > #crumbbar'), 1);
        });

        it('adds HTML #backlink to #topbar', function () {

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

    describe('.$el', function () {

        it('is $(\'#topbar\')', function () {

            var instance = this.applyFn();
            assert.isObject(instance.$el);
            assert.lengthOf(instance.$el, 1);
            assert.isString(instance.$el.jquery);
            assert.strictEqual(instance.$el.attr('id'), 'topbar');
        });
    });

    describe('.$toolbar', function () {

        it('is $(\'#toolbar\')', function () {

            var instance = this.applyFn();
            assert.isObject(instance.$toolbar);
            assert.lengthOf(instance.$toolbar, 1);
            assert.isString(instance.$toolbar.jquery);
            assert.strictEqual(instance.$toolbar.attr('id'), 'toolbar');
        });
    });

    describe('.$crumbbar', function () {

        it('is $(\'#crumbbar\')', function () {

            var instance = this.applyFn();
            assert.isObject(instance.$crumbbar);
            assert.lengthOf(instance.$crumbbar, 1);
            assert.isString(instance.$crumbbar.jquery);
            assert.strictEqual(instance.$crumbbar.attr('id'), 'crumbbar');
        });
    });
});

}());
