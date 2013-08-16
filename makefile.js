/*jshint node: true */
'use strict';


module.exports = function (make) {

	var path = require('path'),

		pkg = require('./package.json'),

		root = path.resolve(__dirname),
		src = path.join(root, 'src'),
		build = path.join(root, 'build'),

		$ = make.fQuery,
		mapSrc = $.map.p(src, build).s('.less', '.css').s('.jade', ''),
		mapRoot = $.map.p(root, build);


	make.version('>=0.10.0');
	make.defaults('build');


	make.before(function () {

		var moment = make.moment();

		make.env = {
			pkg: pkg,
			stamp: moment.format('YYYY-MM-DD HH:mm:ss')
		};

		$.info({ method: 'before', message: pkg.version + ' ' + make.env.stamp });
	});


	make.target('check-version', [], 'add git info to dev builds').async(function (done, fail) {

		if (!/\+$/.test(pkg.version)) {
			done();
			return;
		}

		$.git(root, function (err, result) {

			pkg.version += result.buildSuffix;
			$.info({ method: 'check-version', message: 'version set to ' + pkg.version });
			done();
		});
	});


	make.target('clean', [], 'delete build folder').sync(function () {

		$.DELETE(build);
	});


	make.target('lint', [], 'lint all JavaScript files with JSHint').sync(function () {

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
			},
			globals = {
				'modulejs': true
			};

		$(src + '/_h5ai/client/js: **/*.js, ! lib/**')
			.jshint(jshint, globals);
	});


	make.target('build', ['check-version'], 'build all updated files').sync(function () {

		var header = '/* ' + pkg.name + ' ' + pkg.version + ' - ' + pkg.url + ' */'

		$(src + ': _h5ai/client/js/*.js')
			.modified(mapSrc, $(src + ': _h5ai/client/js/**'))
			.includify()
			.uglifyjs({header: header})
			.WRITE(mapSrc);

		$(src + ': _h5ai/client/css/*.less')
			.modified(mapSrc, $(src + ': _h5ai/client/css/**'))
			.less()
			.cssmin({header: header})
			.WRITE(mapSrc);

		$(src + ': **/*.jade')
			.modified(mapSrc)
			.handlebars(make.env)
			.jade()
			.WRITE(mapSrc);

		$(src + ': **, ! _h5ai/client/js/**, ! _h5ai/client/css/**, ! **/*.jade')
			.modified(mapSrc)
			.handlebars(make.env)
			.WRITE(mapSrc);

		$(root + ': README*, LICENSE*')
			.modified(mapRoot)
			.WRITE(mapRoot);
	});


	make.target('build-uncompressed', ['check-version'], 'build all updated files without compression').sync(function () {

		$(src + ': _h5ai/client/js/*.js')
			.modified(mapSrc, $(src + ': _h5ai/client/js/**'))
			.includify()
			// .uglifyjs()
			.WRITE(mapSrc);

		$(src + ': _h5ai/client/css/*.less')
			.modified(mapSrc, $(src + ': _h5ai/client/css/**'))
			.less()
			// .cssmin()
			.WRITE(mapSrc);

		$(src + ': **/*.jade')
			.modified(mapSrc)
			.handlebars(make.env)
			.jade()
			.WRITE(mapSrc);

		$(src + ': **, ! _h5ai/client/js/**, ! _h5ai/client/css/**, ! **/*.jade')
			.modified(mapSrc)
			.handlebars(make.env)
			.WRITE(mapSrc);

		$(root + ': README*, LICENSE*')
			.modified(mapRoot)
			.WRITE(mapRoot);
	});


	make.target('release', ['clean', 'build'], 'create a zipball').async(function (done, fail) {

		$(build + ': **').shzip({
			target: path.join(build, pkg.name + '-' + pkg.version + '.zip'),
			dir: build,
			callback: done
		});
	});
};
