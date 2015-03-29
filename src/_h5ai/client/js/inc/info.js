modulejs.define('info', ['$', 'config'], function ($, config) {

    var testsTemp =
            '<ul id="tests">';
    var testTemp =
            '<li class="test">' +
                '<span class="label"></span>' +
                '<span class="result"></span>' +
                '<div class="info"></div>' +
            '</li>';
    var loginTemp =
            '<div id="login-wrapper">' +
                '<input id="pass" type="password" placeholder="password"/>' +
                '<span id="login">login</span>' +
                '<span id="logout">logout</span>' +
                '<div id="hint">' +
                    'The preset password is the empty string, so just hit login. ' +
                    'You might change it in the index file to keep this information private.' +
                '</div>' +
            '</div>';
    var setup = config.setup;


    function addTest(label, info, passed, result) {

        $(testTemp)
            .find('.label')
                .text(label)
            .end()
            .find('.result')
                .addClass(passed ? 'passed' : 'failed')
                .text(result ? result : (passed ? 'yes' : 'no'))
            .end()
            .find('.info')
                .html(info)
            .end()
            .appendTo('#tests');
    }

    function addTests() {

        $(testsTemp).appendTo('#content');

        addTest(
            'h5ai version', 'Only green if this is an official h5ai release',
            setup.VERSION.indexOf('+') < 0, setup.VERSION
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
            setup.HAS_PHP_VERSION, setup.PHP_VERSION
        );

        addTest(
            'Cache directory', 'Web server has write access',
            setup.HAS_WRITABLE_CACHE
        );

        addTest(
            'Image thumbs', 'PHP GD extension with JPEG support available',
            setup.HAS_PHP_JPG
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
            'PDF thumbs', 'Command line program <code>convert</code> available',
            setup.HAS_CMD_CONVERT
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

    function request(data) {

        $.ajax({
                url: 'server/php/index.php',
                type: 'POST',
                dataType: 'JSON',
                data: data
            })
            .always(function () {

                window.location.reload();
            });
    }

    function onLogin() {

        request({
            'action': 'login',
            'pass': $('#pass').val()
        });
    }

    function onLogout() {

        request({
            'action': 'logout'
        });
    }

    function onKeydown(event) {

        if (event.which === 13) {
            onLogin();
        }
    }

    function addLogin() {

        $(loginTemp).appendTo('#content');

        if (setup.AS_ADMIN) {
            $('#pass').remove();
            $('#login').remove();
            $('#logout').on('click', onLogout);
        } else {
            $('#pass').on('keydown', onKeydown).focus();
            $('#login').on('click', onLogin);
            $('#logout').remove();
        }
        if (setup.HAS_CUSTOM_PASSHASH) {
            $('#hint').remove();
        }
    }

    function init() {

        addLogin();
        if (setup.AS_ADMIN) {
            addTests();
        }
    }


    init();
});
