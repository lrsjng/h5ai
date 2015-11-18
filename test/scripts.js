// @include "vendor/*.js"

(function () {
    'use strict'; // eslint-disable-line strict
    // @include "util/*.js"
}());

jQuery(function () {
    'use strict'; // eslint-disable-line strict

    util.mockConfigModule();
    util.clearModulejs();
    util.setupMocha();

    describe('all tests', function () {
        // @include "tests/premisses.js"

        describe('unit tests', function () {
            // @include "tests/unit/modulejs.js"
            // @include "tests/unit/libs.js"
            // @include "tests/unit/boot.js"
            // @include "tests/unit/config.js"

            // @include "tests/unit/*/*.js"
        });

        describe('integration tests', function () {
            // @include "tests/integration/*.js"
            // @-include "tests/integration/*/*.js"
        });
    });

    util.pinHtml();
    util.runMocha();
});
