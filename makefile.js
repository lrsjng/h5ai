/*jshint node: true */
'use strict';


var path = require('path'),
	child_process = require('child_process');


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

		Event.info({ method: 'before', message: version + ' ' + replacements.stamp });
	});


	make.target('git-hash', [], 'get git hash tag')
		.async(function (done, fail) {

			if (!/-dev$/.test(version)) {
				done();
				return;
			}

			var hash = '',
				cmd = 'git',
				args = ['rev-parse', '--short', 'HEAD'],
				options = {},
				proc = child_process.spawn(cmd, args, options);

			proc.stdout.on('data', function (data) {
				hash += ('' + data).replace(/\s*/g, '');
			});
			proc.on('exit', function (code) {
				if (code) {
					Event.error({ method: 'git-hash', message: cmd + ' exit code ' + code });
					fail();
				} else {
					version += '-' + hash;
					replacements.version = version;
					Event.ok({ method: 'git-hash', message: 'version is now ' + version });
					done();
				}
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


	make.target('build', ['git-hash'], 'build all updated files')
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


	make.target('build-uncompressed', ['git-hash'], 'build all updated files without compression')
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

			var target = path.join(build, 'h5ai-' + version + '.zip'),
				cmd = 'zip',
				args = ['-ro', target, '_h5ai'],
				options = { cwd: build },
				proc = child_process.spawn(cmd, args, options);

			Event.info({ method: 'exec', message: cmd + ' ' + args.join(' ') });

			proc.stderr.on('data', function (data) {
				process.stderr.write(data);
			});
			proc.on('exit', function (code) {
				if (code) {
					Event.error({ method: 'exec', message: cmd + ' exit code ' + code });
					fail();
				} else {
					Event.ok({ method: 'exec', message: 'created zipball ' + target });
					done();
				}
			});
		});
};
