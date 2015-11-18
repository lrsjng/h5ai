(function () {
    var showOnlyFailures = false;
    var template =
            '<div id="mocha-bar">' +
                '<a class="title" href="?">' + document.title + '</a>' +
                '<div class="stats"/>' +
                '<div class="progress"/>' +
            '</div>';
    var $mochaBar = $(template);
    var $mochaStats = $mochaBar.find('.stats');
    var $mochaProgress = $mochaBar.find('.progress');

    function toggleFailureFilter(ev) {
        ev.stopImmediatePropagation();

        showOnlyFailures = !showOnlyFailures;
        if (showOnlyFailures) {
            $('.suite, .test').hide();
            $('.suite.fail, .test.fail').show();
        } else {
            $('.suite, .test').show();
        }
    }

    function addSuiteStats() {
        var $suite = $(this);

        var tests = $suite.find('.test').length;
        var passed = $suite.find('.test.pass').length;
        var failed = tests - passed;

        var $header = $suite.find('> h1 a');
        var $list = $suite.find('> ul');
        var $count = $('<span class="count"><span class="passed">' + passed + '</span><span class="failed">' + failed + '</span></span>');
        var $toggle = $('<span class="toggle">-</span>');
        var visible = true;

        $toggle.on('click', function (ev) {
            ev.stopImmediatePropagation();

            visible = !visible;
            if (visible) {
                $toggle.text('-');
                $list.show();
            } else {
                $toggle.text('+');
                $list.hide();
            }
        });

        if (!failed) {
            $count.find('.failed').remove();
        }

        $suite.addClass(tests === passed ? 'pass' : 'fail');
        // $suite.append($toggle);
        $header.append($count);
    }

    function fixCodeFormatting() {
        var $code = $(this);
        $code.text($code.text().trim().replace(/;\n\s*/g, ';\n'));
    }


    function onEnd() {
        var runner = this;
        var failed = runner.stats.failures > 0;
        var stats = (runner.stats.duration / 1000.0).toFixed(3) + 's';

        if (failed) {
            $mochaStats.on('click', toggleFailureFilter);
        }

        $mochaBar.addClass(failed ? 'fail' : 'pass');
        $mochaProgress.hide();
        $mochaStats.text(stats);
        $('#mocha-report .suite').each(addSuiteStats);
        $('#mocha-report code').each(fixCodeFormatting);
    }

    function onTest() {
        var runner = this;
        var percent = 100.0 * runner.stats.tests / runner.total;
        var stats = ((new Date().getTime() - runner.stats.start) / 1000.0).toFixed(3) + 's';

        if (runner.stats.failures) {
            $mochaBar.addClass('fail');
        }
        $mochaProgress.css('width', 100 - percent + '%');
        $mochaStats.text(stats);
    }

    function setupMocha() {
        window.assert = window.chai.assert;
        mocha.setup('bdd');
        $(function () { $mochaBar.appendTo('#mocha'); });
    }

    function runMocha() {
        mocha.run().on('test', onTest).on('end', onEnd);
    }

    window.util = window.util || {};
    window.util.setupMocha = setupMocha;
    window.util.runMocha = runMocha;
}());
