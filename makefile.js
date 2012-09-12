/*jshint node: true */
'use strict';


var path = require('path');


var version = '0.22-dev',

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

		return blob.source.replace(src, build).replace(/\.less$/, '.css').replace(/\.jade$/, '');
	},

	mapperRoot = function (blob) {

		return blob.source.replace(root, build + '/_h5ai');
	};


module.exports = function (make) {

	var Event = make.Event,
		$ = make.fQuery,
		moment = make.moment,
		stamp, replacements;


	make.defaults('build');


	make.before(function () {

		stamp = moment();

		replacements = {
			version: version,
			stamp: stamp.format('YYYY-MM-DD HH:mm:ss')
		};

		Event.info({
			method: 'before',
			message: version + ' ' + replacements.stamp
		});
	});


	make.target('check-version', [], 'add git hash tag for dev builds')
		.async(function (done, fail) {

			if (!/-dev$/.test(version)) {
				done();
				return;
			}

			$.githash(root, function (err, hash) {

				version += '-' + hash;
				replacements.version = version;
				Event.info({
					method: 'check-version',
					message: 'version set to ' + version
				});
				done();
			});
		});


	make.target('clean', [], 'delete build folder')
		.sync(function () {

			$.rmfr($.I_AM_SURE, build);
		});


	make.target('lint', [], 'lint all JavaScript files with JSHint')
		.sync(function () {

			$(src + '/_h5ai/js: **/*.js, ! lib/**')
				.jshint(jshint);
		});


	make.target('build', ['check-version'], 'build all updated files')
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

			$(src + ': **/*.jade')
				.modified(mapper)
				.handlebars(replacements)
				.jade()
				.write($.OVERWRITE, mapper);

			$(src + ': **, ! _h5ai/js/**, ! _h5ai/css/**, ! **/*.jade')
				.modified(mapper)
				.handlebars(replacements)
				.write($.OVERWRITE, mapper);

			$(root + ': README*, LICENSE*')
				.modified(mapperRoot)
				.write($.OVERWRITE, mapperRoot);
		});


	make.target('build-uncompressed', ['check-version'], 'build all updated files without compression')
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

			$(src + ': **/*.jade')
				.modified(mapper)
				.handlebars(replacements)
				.jade()
				.write($.OVERWRITE, mapper);

			$(src + ': **, ! _h5ai/js/**, ! _h5ai/css/**, ! **/*.jade')
				.modified(mapper)
				.handlebars(replacements)
				.write($.OVERWRITE, mapper);

			$(root + ': README*, LICENSE*')
				.modified(mapperRoot)
				.write($.OVERWRITE, mapperRoot);
		});


	make.target('release', ['clean', 'build'], 'create a zipball')
		.async(function (done, fail) {

			$(build + ': _h5ai/**').shzip({
				target: path.join(build, 'h5ai-' + version + '.zip'),
				dir: build,
				callback: done
			});
		});
};
