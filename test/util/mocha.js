(function () {
'use strict';

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

function onEnd() {

    $('#report').addClass($('.test.fail').length ? 'fail' : 'pass');

    $('#mocha-overlay code').each(function () {

        var $code = $(this);
        $code.text($code.text().trim().replace(/;\n\s*/g, ';\n'));
    });

    update();
}

var count = 0;
function onTestEnd() {

    if (count % 25 === 0) {
        update();
    }
    count += 1;
}

function setupMocha() {

    window.assert = chai.assert;
    mocha.setup('bdd');
    mocha.checkLeaks();
}

function runMocha() {

    mocha.run()
        .on('test end', onTestEnd)
        .on('end', onEnd);
}


window.util = window.util || {};
window.util.setupMocha = setupMocha;
window.util.runMocha = runMocha;

}());
