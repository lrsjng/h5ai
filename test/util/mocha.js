(function () {
'use strict';

function onEnd() {

    $('#report').addClass($('.test.fail').length ? 'fail' : 'pass');

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
        $header.append($count);
    });

    $('#mocha-overlay code').each(function () {

        var $code = $(this);
        $code.text($code.text().trim().replace(/;\n\s*/g, ';\n'));
    });

    $('#mocha-stats .passes a').replaceWith('<span>passes:</span>');
    $('#mocha-stats .failures a').replaceWith('<span>failures:</span>');

    var onlyFailures = false;
    $('#mocha-stats .failures').on('click', function (ev) {

        onlyFailures = !onlyFailures;
        if (onlyFailures) {
            $('.suite, .test').hide();
            $('.suite.fail, .test.fail').show();
        } else {
            $('.suite, .test').show();
        }
        ev.stopImmediatePropagation();
    });
}

function setupMocha() {

    window.assert = chai.assert;
    mocha.setup('bdd');
}

function runMocha() {

    mocha.run().on('end', onEnd);
}

window.util = window.util || {};
window.util.setupMocha = setupMocha;
window.util.runMocha = runMocha;

}());
