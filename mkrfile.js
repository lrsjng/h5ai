/*jshint node: true */
'use strict';


var path = require('path');
var $ = require('fquery');

var pkg = require('./package.json');

var root = path.resolve(__dirname);
var src = path.join(root, 'src');
var build = path.join(root, 'build');


function getBuildSuffixSync() {

    try {
        var out = require('child_process').execSync('git rev-list v' + pkg.version + '..HEAD', {cwd: root, encoding: 'utf8'});
        var lines = out.trim().split(/\r?\n/);
        return '+' + ('000' + lines.length).substr(-3) + '~' + lines[0].substring(0, 7);
    } catch (e) {}
    return '+X';
}


$.plugin('fquery-autoprefixer');
$.plugin('fquery-cssmin');
$.plugin('fquery-handlebars');
$.plugin('fquery-includeit');
$.plugin('fquery-jade');
$.plugin('fquery-jshint');
$.plugin('fquery-jszip');
$.plugin('fquery-less');
$.plugin('fquery-uglifyjs');


module.exports = function (suite) {


    suite.defaults('release');


    suite.target('check-version', [], 'add git info to dev builds').task(function () {

        if (pkg.develop) {
            pkg.version += getBuildSuffixSync();
            $.report({type: 'info', method: 'check-version', message: 'version set to ' + pkg.version});
        }
    });


    suite.target('clean', [], 'delete build folder').task(function () {

        $(build, {dirs: true}).delete();
    });


    suite.target('lint', [], 'lint all JavaScript files with JSHint').task(function () {

        var fs = require('fs');
        var jshint = JSON.parse(fs.readFileSync('.jshintrc', 'utf8'));

        $(src + '/_h5ai/client/js: **/*.js, ! lib/**')
            .jshint(jshint, jshint.globals);
    });


    suite.target('build', ['check-version', 'lint'], 'build all updated files, optionally use :uncompressed (e.g. mkr build :uncompressed)').task(function () {

        var header = '/* ' + pkg.name + ' ' + pkg.version + ' - ' + pkg.homepage + ' */\n';
        var env = {pkg: pkg};
        var mapSrc = $.map.p(src, build).s('.less', '.css').s('.jade', '');
        var mapRoot = $.map.p(root, path.join(build, '_h5ai'));

        $(src + ': _h5ai/client/js/*.js')
            .newerThan(mapSrc, $(src + ': _h5ai/client/js/**'))
            .includeit()
            .if(!suite.args.uncompressed, function () { this.uglifyjs(); })
            .wrap(header)
            .write(mapSrc, true);

        $(src + ': _h5ai/client/css/*.less')
            .newerThan(mapSrc, $(src + ': _h5ai/client/css/**'))
            .less()
            .autoprefixer()
            .if(!suite.args.uncompressed, function () { this.cssmin(); })
            .wrap(header)
            .write(mapSrc, true);

        $(src + ': **/*.jade')
            .newerThan(mapSrc)
            .jade(env)
            .write(mapSrc, true);

        $(src + ': **, ! _h5ai/client/js/**, ! _h5ai/client/css/**, ! **/*.jade')
            .newerThan(mapSrc)
            .handlebars(env)
            .write(mapSrc, true);

        $(root + ': *.md')
            .newerThan(mapRoot)
            .write(mapRoot, true);
    });


    suite.target('deploy', ['build'], 'deploy to a specified path (e.g. mkr deploy :dest=/some/path)').task(function () {

        if (!$._.isString(suite.args.dest)) {
            $.report({
                type: 'err',
                message: 'no destination path (e.g. mkr deploy :dest=/some/path)'
            });
        }

        var mapper = $.map.p(build, path.resolve(suite.args.dest));

        $(build + ': _h5ai/**')
            .newerThan(mapper)
            .write(mapper, true);
    });


    suite.target('release', ['clean', 'build'], 'create a zipball').task(function () {

        var target = path.join(build, pkg.name + '-' + pkg.version + '.zip');

        $(build + ': **')
            .jszip({dir: build, level: 9})
            .write(target, true);
    });


    suite.target('build-test', [], 'build a test suite').task(function () {

        $(src + '/_h5ai/client/css/styles.less')
            .less()
            .autoprefixer()
            .write(build + '/test/h5ai-styles.css', true);

        $(src + '/_h5ai/client/js/scripts.js')
            .includeit()
            .write(build + '/test/h5ai-scripts.js', true);

        $(root + '/test/styles.less')
            .less()
            .autoprefixer()
            .write(build + '/test/styles.css', true);

        $(root + '/test/scripts.js')
            .includeit()
            .write(build + '/test/scripts.js', true);

        $(root + '/test/tests.js')
            .includeit()
            .write(build + '/test/tests.js', true);

        $(root + '/test/index.html.jade')
            .jade()
            .write(build + '/test/index.html', true);

        $.report({
            type: 'info',
            message: 'browse to file://' + build + '/test/index.html'
        });
    });
};
