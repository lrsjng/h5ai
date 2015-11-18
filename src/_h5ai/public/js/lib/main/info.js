modulejs.define('main/info', ['$', 'config', 'core/resource', 'core/server'], function ($, config, resource, server) {
    var tplTests =
            '<ul id="tests">';
    var tplTest =
            '<li class="test">' +
                '<span class="label"></span>' +
                '<span class="result"></span>' +
                '<div class="info"></div>' +
            '</li>';
    var tplLogin =
            '<div id="login-wrapper">' +
                '<input id="pass" type="password" placeholder="password"/>' +
                '<span id="login">login</span>' +
                '<span id="logout">logout</span>' +
                '<div id="hint">' +
                    'The preset password is the empty string, just click login. ' +
                    'Change it in \'_h5ai/private/conf/options.json\'.' +
                '</div>' +
            '</div>';
    var tplSupport =
            '<div id="support">' +
                'Show your support with a donation!' +
                '<div class="paypal">' +
                    '<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">' +
                        '<input type="hidden" name="cmd" value="_s-xclick" />' +
                        '<input type="hidden" name="hosted_button_id" value="8WSPKWT7YBTSQ" />' +
                        '<input type="image" src="' + resource.image('paypal') + '" name="submit" alt="PayPal" />' +
                    '</form>' +
                '</div>' +
            '</div>';
    var setup = config.setup;


    function addTest(label, info, passed, result) {
        var $test = $(tplTest).appendTo('#tests');
        $test.find('.label').text(label);
        $test.find('.result')
                .addClass(passed ? 'passed' : 'failed')
                .text(result ? result : passed ? 'yes' : 'no');
        $test.find('.info').html(info);
    }

    function addTests() {
        if (!setup.AS_ADMIN) {
            return;
        }

        $(tplTests).appendTo('#content');

        addTest(
            'h5ai version', 'Only green if this is an official h5ai release',
            (/^\d+\.\d+\.\d+$/).test(setup.VERSION), setup.VERSION
        );

        addTest(
            'Index file found', 'Add <code>' + setup.INDEX_HREF + '</code> to your index file list',
            setup.INDEX_HREF
        );

        addTest(
            'Options parsable', 'File <code>options.json</code> is readable and syntax is correct',
            config.options !== null
        );

        addTest(
            'Types parsable', 'File <code>types.json</code> is readable and syntax is correct',
            config.types !== null
        );

        addTest(
            'Server software', 'Server is one of apache, lighttpd, nginx or cherokee',
            setup.HAS_SERVER, setup.SERVER_NAME + ' ' + setup.SERVER_VERSION
        );

        addTest(
            'PHP version', 'PHP version &gt;= ' + setup.MIN_PHP_VERSION,
            true, setup.PHP_VERSION
        );

        addTest(
            'Public Cache directory', 'Web server has write access',
            setup.HAS_WRITABLE_CACHE_PUB
        );

        addTest(
            'Private Cache directory', 'Web server has write access',
            setup.HAS_WRITABLE_CACHE_PRV
        );

        addTest(
            'Image thumbs', 'PHP GD extension with JPEG support available',
            setup.HAS_PHP_JPEG
        );

        addTest(
            'Use EXIF thumbs', 'PHP EXIF extension available',
            setup.HAS_PHP_EXIF
        );

        addTest(
            'Movie thumbs', 'Command line program <code>avconv</code> or <code>ffmpeg</code> available',
            setup.HAS_CMD_AVCONV || setup.HAS_CMD_FFMPEG
        );

        addTest(
            'PDF thumbs', 'Command line program <code>convert</code> or <code>gm</code> available',
            setup.HAS_CMD_CONVERT || setup.HAS_CMD_GM
        );

        addTest(
            'Shell tar', 'Command line program <code>tar</code> available',
            setup.HAS_CMD_TAR
        );

        addTest(
            'Shell zip', 'Command line program <code>zip</code> available',
            setup.HAS_CMD_ZIP
        );

        addTest(
            'Shell du', 'Command line program <code>du</code> available',
            setup.HAS_CMD_DU
        );
    }

    function reload() {
        window.location.reload();
    }

    function onLogin() {
        server.request({
            action: 'login',
            pass: $('#pass').val()
        }, reload);
    }

    function onLogout() {
        server.request({
            action: 'logout'
        }, reload);
    }

    function onKeydown(event) {
        if (event.which === 13) {
            onLogin();
        }
    }

    function addSupport() {
        $(tplSupport).appendTo('#content');
    }

    function addLogin() {
        $(tplLogin).appendTo('#content');

        if (setup.AS_ADMIN) {
            $('#pass').remove();
            $('#login').remove();
            $('#logout').on('click', onLogout);
        } else {
            $('#pass').on('keydown', onKeydown).focus();
            $('#login').on('click', onLogin);
            $('#logout').remove();
        }
        if (config.options.hasCustomPasshash) {
            $('#hint').remove();
        }
    }

    function init() {
        addSupport();
        addLogin();
        addTests();
    }


    init();
});
