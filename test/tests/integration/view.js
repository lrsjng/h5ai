(function () {
    describe('view', function () {
        before(function () {
            this.configBackup = modulejs._private.definitions.config;
            this.storeKey = '_h5ai';
            this.xConfig = {
                setup: {
                    PUBLIC_HREF: uniq.path('-PUBLIC/'),
                    ROOT_HREF: uniq.path('-ROOT/')
                }
            };
        });

        after(function () {
            modulejs._private.definitions.config = this.configBackup;
            util.clearModulejs();
            util.restoreHtml();
        });

        beforeEach(function () {
            delete modulejs._private.definitions.config;
            modulejs.define('config', this.xConfig);
            util.clearModulejs();
            util.restoreHtml();
            $('<div id="fallback"/>').appendTo('body');
            $('<div id="fallback-hints"/>').appendTo('body');
        });

        describe('requiring \'view/viewmode\' sets up basic HTML', function () {
            it('runs without errors', function () {
                modulejs.require('view/viewmode');
            });

            it('adds id root to body', function () {
                modulejs.require('view/viewmode');
                assert.strictEqual($('body').attr('id'), 'root');
            });

            it('removes HTML #fallback', function () {
                modulejs.require('view/viewmode');
                assert.lengthOf($('#fallback'), 0);
            });

            it('removes HTML #fallback-hints', function () {
                modulejs.require('view/viewmode');
                assert.lengthOf($('#fallback-hints'), 0);
            });

            it('adds HTML #mainrow to #root', function () {
                modulejs.require('view/viewmode');
                assert.lengthOf($('#root > #mainrow'), 1);
            });

            it('adds HTML #content to #mainrow', function () {
                modulejs.require('view/viewmode');
                assert.lengthOf($('#mainrow > #content'), 1);
            });

            it('adds HTML #view to #content', function () {
                modulejs.require('view/viewmode');
                assert.lengthOf($('#content > #view'), 1);
            });

            it('adds HTML #items to #view', function () {
                modulejs.require('view/viewmode');
                assert.lengthOf($('#view > #items'), 1);
            });

            it('adds HTML #topbar to #root', function () {
                modulejs.require('view/viewmode');
                assert.lengthOf($('#root > #topbar'), 1);
            });

            it('adds HTML #toolbar to #topbar', function () {
                modulejs.require('view/viewmode');
                assert.lengthOf($('#topbar > #toolbar'), 1);
            });

            it('adds HTML #flowbar to #topbar', function () {
                modulejs.require('view/viewmode');
                assert.lengthOf($('#topbar > #flowbar'), 1);
            });

            it('adds HTML #backlink to #topbar', function () {
                modulejs.require('view/viewmode');
                assert.lengthOf($('#topbar > #backlink'), 1);
            });

            it('adds HTML #sidebar-toggle to #toolbar', function () {
                modulejs.require('view/viewmode');
                assert.lengthOf($('#toolbar > #sidebar-toggle'), 1);
            });

            it('adds HTML #viewmode-settings to #sidebar', function () {
                modulejs.require('view/viewmode');
                assert.lengthOf($('#sidebar > #viewmode-settings'), 1);
            });

            it('adds style to head', function () {
                var styleTagCount = $('head > style').length;
                modulejs.require('view/viewmode');
                assert.lengthOf($('head > style'), styleTagCount + 1);
            });
        });
    });
}());
