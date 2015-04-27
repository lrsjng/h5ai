// @include "lib/*.js"
// @include "util/*.js"

$(function () {
    'use strict';

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

            // @include "tests/integration/first.js"

            // @include "tests/integration/*/*.js"
        });
    });

    util.pinHtml();
    util.runMocha();
});
