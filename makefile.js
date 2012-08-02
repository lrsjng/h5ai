/*jshint node: true */
'use strict';


var path = require('path'),
	child_process = require('child_process'),
	moment = require('moment');


var version = '0.21-dev-31',

	root = path.resolve(__dirname),
	src = path.join(root, 'src'),
	build = path.join(root, 'build'),

	jshint = {
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
		browser: true,

		// Globals
		predef: [
			'modulejs'
		]
	},

	mapper = function (blob) {

		return blob.source.replace(src, build).replace(/\.less$/, '.css');
	},

	mapperRoot = function (blob) {

		return blob.source.replace(root, build + '/_h5ai');
	};


module.exports = function (make, $) {

	var stamp, replacements;


	make.defaults('build');


	make.before = function () {

		stamp = moment();

		replacements = {
			version: version,
			stamp: stamp.format('YYYY-MM-DD HH:mm:ss')
		};

		$.info({ method: 'before', message: version + ' ' + replacements.stamp });
	};


	make.target('inc', [], 'increase build number, if any')
		.sync(function () {

			var re = /-(\d+)$/;
			var match = version.match(re);

			if (match) {
				var number = parseInt(match[1], 10) + 1;
				var newVersion = version.replace(re, '-' + number);

				$('makefile.js').replace([[version, newVersion]]).write($.OVERWRITE, 'makefile.js');

				version = newVersion;
				replacements.version = version;
				$.ok({ method: 'inc', message: 'version is now ' + version });
			}
		});


	make.target('clean', [], 'delete build folder')
		.sync(function () {

			$.rmfr($.I_AM_SURE, build);
		});


	make.target('lint', [], 'lint all JavaScript files with JSHint')
		.sync(function () {

			$(src + '/_h5ai/js: **/*.js, ! *.min.js, ! inc/lib/**')
				.jshint(jshint);
		});


	make.target('build', [], 'build all updated files')
		.sync(function () {

			$(src + ': _h5ai/js/*.js')
				.modified(mapper, $(src + ': _h5ai/js/**'))
				.includify()
				.uglifyjs()
				.write($.OVERWRITE, mapper);

			$(src + ': _h5ai/css/*.less')
				.modified(mapper, $(src + ': _h5ai/css/**'))
				.less()
				.cssmin()
				.write($.OVERWRITE, mapper);

			$(src + ': **, **/*/.*, ! _h5ai/js/**, ! _h5ai/css/**')
				.modified(mapper)
				.mustache(replacements)
				.write($.OVERWRITE, mapper);

			$(root + ': README*, LICENSE*')
				.modified(mapperRoot)
				.write($.OVERWRITE, mapperRoot);
		});


	make.target('build-uncompressed', [], 'build all updated files without compression')
		.sync(function () {

			$(src + ': _h5ai/js/*.js')
				.modified(mapper, $(src + ': _h5ai/js/**'))
				.includify()
				// .uglifyjs()
				.write($.OVERWRITE, mapper);

			$(src + ': _h5ai/css/*.less')
				.modified(mapper, $(src + ': _h5ai/css/**'))
				.less()
				// .cssmin()
				.write($.OVERWRITE, mapper);

			$(src + ': **, **/*/.*, ! _h5ai/js/**, ! _h5ai/css/**')
				.modified(mapper)
				.mustache(replacements)
				.write($.OVERWRITE, mapper);

			$(root + ': README*, LICENSE*')
				.modified(mapperRoot)
				.write($.OVERWRITE, mapperRoot);
		});


	make.target('release', ['inc', 'clean', 'build'], 'create a zipball')
		.async(function (done, fail) {

			var target = path.join(build, 'h5ai-' + version + '.zip'),
				command = 'zip -ro ' + target + ' _h5ai',
				options = { cwd: build };

			child_process.exec(command, options, function (error, stdout, stderr) {

				if (error === null) {
					$.ok({ method: 'zip', message: target });
					done();
				} else {
					$.error({ method: 'zip', message: stderr });
					fail();
				}
			});
		});
};