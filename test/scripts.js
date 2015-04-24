// @include "lib/*.js"
// @include "util/*.js"

(function () {
'use strict';

$(function () {

    modulejs.define('config', util.uniqObj());
    var insts = modulejs._private.instances;
    for (var member in insts) {
        if (insts.hasOwnProperty(member)) {
            delete insts[member];
        }
    }

    $('html').removeClass();
    util.pinHtml();
    util.runMocha();
});

util.setupMocha();

describe('unit tests', function () {

    // @include "tests/unit/premisses.js"
    // @include "tests/unit/modulejs.js"
    // @include "tests/unit/libs.js"
    // @include "tests/unit/boot.js"
    // @include "tests/unit/config.js"
    // @include "tests/unit/*/*.js"
});

describe('integration tests', function () {

    // @include "tests/integration/**/*.js"
});

}());
