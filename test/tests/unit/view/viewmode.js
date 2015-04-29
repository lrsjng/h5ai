(function () {
'use strict';

var ID = 'view/viewmode';
var DEPS = ['_', '$', 'core/resource', 'core/settings', 'core/store', 'view/sidebar', 'view/view'];

describe('module \'' + ID + '\'', function () {

    before(function () {

        this.definition = modulejs._private.definitions[ID];

        this.xResource = {
            image: sinon.stub().returns(util.uniqPath('-image.png'))
        };
        this.xSettings = {view: {
            modes: ['details', 'grid', 'icons'],
            sizes: [20, 40, 60, 80, 100]
        }};
        this.xStore = {
            get: sinon.stub(),
            put: sinon.stub()
        };
        this.xSidebar = {$el: null};
        this.xView = {$el: null};

        this.applyFn = function () {

            this.xResource.image.reset();
            this.xStore.get.reset();
            this.xStore.put.reset();

            return this.definition.fn(_, $, this.xResource, this.xSettings, this.xStore, this.xSidebar, this.xView);
        };
    });

    after(function () {

        util.restoreHtml();
    });

    beforeEach(function () {

        util.restoreHtml();
        this.xSidebar.$el = $('<div id="sidebar"/>').appendTo('body');
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

        it('adds HTML #settings-viewmode to #sidebar', function () {

            this.applyFn();
            assert.lengthOf($('#sidebar > #settings-viewmode'), 1);
        });

        it('adds HTML #view-details to #settings-viewmode', function () {

            this.applyFn();
            assert.lengthOf($('#settings-viewmode > #view-details'), 1);
        });

        it('adds HTML #view-grid to #settings-viewmode', function () {

            this.applyFn();
            assert.lengthOf($('#settings-viewmode > #view-grid'), 1);
        });

        it('adds HTML #view-icons to #settings-viewmode', function () {

            this.applyFn();
            assert.lengthOf($('#settings-viewmode > #view-icons'), 1);
        });

        it('adds HTML #view-size to #settings-viewmode', function () {

            this.applyFn();
            assert.lengthOf($('#settings-viewmode > #view-size'), 1);
        });

        it('adds style to head', function () {

            var styleTagCount = $('head > style').length;
            this.applyFn();
            assert.lengthOf($('head > style'), styleTagCount + 1);
        });

        it('style contains possibly correct text', function () {

            this.applyFn();
            var text = $('head > style').eq(0).text();
            assert.isTrue(text.indexOf('#view.view-details.view-size-') >= 0);
            assert.isTrue(text.indexOf('#view.view-grid.view-size-') >= 0);
            assert.isTrue(text.indexOf('#view.view-icons.view-size-') >= 0);
        });
    });

    describe('works', function () {

        it('clicking #view-details changes #view class to .view-details', function () {

            this.applyFn();
            $('#view-details').trigger('click');
            assert.isTrue($('#view').hasClass('view-details'));
            assert.isFalse($('#view').hasClass('view-grid'));
            assert.isFalse($('#view').hasClass('view-icons'));
        });

        it('clicking #view-grid changes #view class to .view-grid', function () {

            this.applyFn();
            $('#view-grid').trigger('click');
            assert.isFalse($('#view').hasClass('view-details'));
            assert.isTrue($('#view').hasClass('view-grid'));
            assert.isFalse($('#view').hasClass('view-icons'));
        });

        it('clicking #view-icons changes #view class to .view-icons', function () {

            this.applyFn();
            $('#view-icons').trigger('click');
            assert.isFalse($('#view').hasClass('view-details'));
            assert.isFalse($('#view').hasClass('view-grid'));
            assert.isTrue($('#view').hasClass('view-icons'));
        });

        it('changing #view-size changes #view class to .view-size-*', function () {

            var sizes = [20, 40, 60];
            this.xSettings.view.sizes = sizes;
            this.applyFn();

            $('#view-size').val(0).trigger('change');
            assert.isTrue($('#view').hasClass('view-size-20'), 20);
            $('#view-size').val(1).trigger('change');
            assert.isTrue($('#view').hasClass('view-size-40'), 40);
            $('#view-size').val(2).trigger('change');
            assert.isTrue($('#view').hasClass('view-size-60'), 60);
        });

        it('inputing #view-size changes #view class to .view-size-*', function () {

            this.xSettings.view.sizes = [20, 40, 60];
            this.applyFn();

            $('#view-size').val(0).trigger('input');
            assert.isTrue($('#view').hasClass('view-size-20'), 20);
            $('#view-size').val(1).trigger('input');
            assert.isTrue($('#view').hasClass('view-size-40'), 40);
            $('#view-size').val(2).trigger('input');
            assert.isTrue($('#view').hasClass('view-size-60'), 60);
        });

        it('#view-size uses sorted sizes', function () {

            this.xSettings.view.sizes = [60, 40, 20];
            this.applyFn();

            $('#view-size').val(0).trigger('change');
            assert.isTrue($('#view').hasClass('view-size-20'));
            $('#view-size').val(1).trigger('change');
            assert.isTrue($('#view').hasClass('view-size-40'));
            $('#view-size').val(2).trigger('change');
            assert.isTrue($('#view').hasClass('view-size-60'));
        });
    });
});

}());
