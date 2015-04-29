(function () {
'use strict';

var ID = 'view/viewmode';
var DEPS = ['_', '$', 'core/resource', 'core/settings', 'core/store', 'view/content', 'view/sidebar'];

describe('module \'' + ID + '\'', function () {

    before(function () {

        this.definition = modulejs._private.definitions[ID];

        this.xSettings = {
            view: {}
        };
        this.xResource = {
            image: sinon.stub().returns(util.uniqPath('-image.png'))
        };
        this.xStore = {
            get: sinon.stub(),
            put: sinon.stub()
        };
        this.xContent = {$view: null};
        this.xSidebar = {$el: null};

        this.applyFn = function () {

            this.xResource.image.reset();
            this.xStore.get.reset();
            this.xStore.put.reset();

            return this.definition.fn(_, $, this.xResource, this.xSettings, this.xStore, this.xContent, this.xSidebar);
        };
    });

    after(function () {

        util.restoreHtml();
    });

    beforeEach(function () {

        util.restoreHtml();
        this.xContent.$view = $('<div id="view"/>').appendTo('body');
        this.xSidebar.$el = $('<div id="sidebar"/>').appendTo('body');
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

        it('adds HTML .block to #sidebar', function () {

            this.applyFn();
            assert.lengthOf($('#sidebar > .block > .l10n-view'), 1);
        });

        it('adds HTML #view-details to .block', function () {

            this.applyFn();
            assert.lengthOf($('#sidebar > .block > #view-details'), 1);
        });

        it('adds HTML #view-grid to .block', function () {

            this.applyFn();
            assert.lengthOf($('#sidebar > .block > #view-grid'), 1);
        });

        it('adds HTML #view-icons to .block', function () {

            this.applyFn();
            assert.lengthOf($('#sidebar > .block > #view-icons'), 1);
        });

        it('adds HTML #view-size to .block', function () {

            this.applyFn();
            assert.lengthOf($('#sidebar > .block > #view-size'), 1);
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
    });
});

}());
