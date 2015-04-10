/*jshint node: true */
'use strict';


var path = require('path');
var $ = require('fquery');

var pkg = require('./package.json');

var root = path.resolve(__dirname);
var src = path.join(root, 'src');
var build = path.join(root, 'build');

var mapSrc = $.map.p(src, build).s('.less', '.css').s('.jade', '');
var mapRoot = $.map.p(root, path.join(build, '_h5ai'));


function getBuildSuffix(callback) {

    require('child_process').exec('git rev-list v' + pkg.version + '..HEAD', {cwd: root}, function (err, out) {

        try {
            var lines = out.trim().split(/\r?\n/);
            callback('+' + ('000' + lines.length).substr(-3) + '~' + lines[0].substring(0, 7));
        } catch (e) {
            callback('+X');
        }
    });
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


    suite.target('check-version', [], 'add git info to dev builds').task(function (done) {

        if (!pkg.develop) {
            done();
            return;
        }

        getBuildSuffix(function (result) {

            pkg.version += result;
            $.report({type: 'info', method: 'check-version', message: 'version set to ' + pkg.version});
            done();
        });
    });


    suite.target('clean', [], 'delete build folder').task(function () {

        $(build, {dirs: true}).delete();
    });


    suite.target('lint', [], 'lint all JavaScript files with JSHint').task(function () {

        var jshint = {
                // Enforcing Options
                bitwise: true,
                curly: true,
                eqeqeq: true,
                forin: true,
                latedef: true,
                newcap: true,
                noempty: true,
                plusplus: true,
                trailing: true,
                undef: true,

                // Environments
                browser: true
            };
        var globals = {
                modulejs: true
            };

        $(src + '/_h5ai/client/js: **/*.js, ! lib/**')
            .jshint(jshint, globals);
    });


    suite.target('build', ['check-version', 'lint'], 'build all updated files, optionally use :uncompressed (e.g. mkr build :uncompressed)').task(function () {

        var header = '/* ' + pkg.name + ' ' + pkg.version + ' - ' + pkg.homepage + ' */\n';
        var env = {pkg: pkg};

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
};
