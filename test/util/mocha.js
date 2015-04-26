(function () {
'use strict';

function onEnd() {

    var runner = this;
    var failed = runner.stats.failures > 0;
    var stats = (runner.stats.duration / 1000.0).toFixed(2) + 's';

    if (failed) {
        var onlyFailures = false;
        $('#report .stats').on('click', function (ev) {

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

    $('#report').addClass(failed ? 'fail' : 'pass');
    $('#report .progress').hide();
    $('#report .stats').text(stats);

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
}

function onTest() {

    var runner = this;
    var complete = runner.stats.tests;
    var total = runner.total;
    var percent = 100.0 - 100.0 * complete / total;

    if (runner.stats.failures) {
        $('#report').addClass('fail');
    }
    $('#report .progress').css('width', percent + '%');
}

function setupMocha() {

    window.assert = chai.assert;
    mocha.setup('bdd');
}

function runMocha() {

    mocha.run().on('test', onTest).on('end', onEnd);
}

window.util = window.util || {};
window.util.setupMocha = setupMocha;
window.util.runMocha = runMocha;

}());
