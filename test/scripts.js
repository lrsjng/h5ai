// @include "lib/*.js"
// @include "util/*.js"

(function () {
    'use strict';

    modulejs.define('config', util.uniqObj());
    modulejs._private.instances = {};

    window.assert = chai.assert;

    mocha.setup('bdd');
    mocha.checkLeaks();

    function update() {

        $('#mocha-overlay .suite').each(function () {

            var $suite = $(this);

            var tests = $suite.find('.test').length;
            var passed = $suite.find('.test.pass').length;
            var failed = tests - passed;

            var $header = $suite.find('> h1 a');
            var $count = $('<span class="count"><span class="passed">' + passed + '</span><span class="failed">' + failed + '</span></span>');

            if (!failed) {
                $count.find('.failed').remove();
            }

            $suite.addClass(tests === passed ? 'pass' : 'fail');
            $header.find('.count').remove();
            $header.append($count);
        });
    }

    var count = 0;
    function onTest() {

        if (count % 25 === 0) {
            update();
        }
        count += 1;
    }

    function onEnd() {

        $('#mocha-overlay').addClass($('.test.fail').length ? 'fail' : 'pass');

        $('#mocha-overlay code').each(function () {

            var $code = $(this);
            $code.text($code.text().trim().replace(/;\n\s*/g, ';\n'));
        });

        update();
    }

    function init() {

        $('html').removeClass();
        util.pinHtml();
        mocha
            .run()
            .on('test', onTest)
            .on('end', onEnd);
    }

    $(init);
}());

(function () {
    'use strict';

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
