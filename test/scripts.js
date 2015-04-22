// @include "lib/*.js"
// @include "util/*.js"

(function () {
'use strict';

modulejs.define('config', util.uniqObj());
modulejs._private.instances = {};

$(function () {

    $('html').removeClass();
    util.pinHtml();
    util.runMocha();
});

util.setupMocha();

describe('unit tests', function () {

    // @include "tests/unit/premisses.js"
    // @include "tests/unit/modulejs.js"
    // @include "tests/unit/libs.js"
    // @include "tests/unit/config.js"
    // @include "tests/unit/boot.js"
    // @include "tests/unit/*/*.js"
});

describe('integration tests', function () {

    // @include "tests/integration/**/*.js"
});

}());
