// @include "lib/*.js"
// @include "util/*.js"

(function () {
'use strict';

$(function () {

    modulejs.define('config', util.uniqObj());
    _.each(modulejs._private.instances, function (val, key) {
        delete modulejs._private.instances[key];
    });

    util.pinHtml();
    util.runMocha();
});

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

}());
