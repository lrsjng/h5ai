const {resolve, join} = require('path');
const {
    ghu, autoprefixer, cssmin, each, ife, includeit, jszip, less, mapfn,
    newerThan, pug, read, remove, run, uglify, watch, webpack, wrap, write
} = require('ghu');

const ROOT = resolve(__dirname);
const SRC = join(ROOT, 'src');
const TEST = join(ROOT, 'test');
const BUILD = join(ROOT, 'build');

const mapper = mapfn.p(SRC, BUILD).s('.less', '.css').s('.pug', '');
const webpackCfg = include => ({
    module: {
        loaders: [
            {
                include,
                loader: 'babel-loader',
                query: {
                    cacheDirectory: true,
                    presets: ['babel-preset-env']
                }
            },
            {
                test: /jsdom/,
                loader: 'null-loader'
            }
        ]
    }
});

ghu.defaults('release');

ghu.before(runtime => {
    runtime.pkg = Object.assign({}, require('./package.json'));

    const res = run.sync(`git rev-list v${runtime.pkg.version}..HEAD`, {silent: true});
    if (res.code === 0) {
        const hashes = res.stdout.split(/\r?\n/).filter(x => x);
        if (hashes.length) {
            const counter = ('000' + hashes.length).substr(-3);
            const hash = hashes[0].substr(0, 7);
            runtime.pkg.version += `+${counter}~${hash}`;
        }
    }

    runtime.comment = `${runtime.pkg.name} v${runtime.pkg.version} - ${runtime.pkg.homepage}`;
    runtime.commentJs = `/* ${runtime.comment} */\n`;
    runtime.commentHtml = `<!-- ${runtime.comment} -->`;

    console.log(runtime.comment);
});

ghu.task('force-production', 'ensure :production flag is set', runtime => {
    if (!runtime.args.production) {
        runtime.args.production = true;
        console.log('forcing production mode');
    }
});

ghu.task('clean', 'delete build folder', () => {
    return remove(BUILD);
});

ghu.task('lint', 'lint all JavaScript files with eslint', () => {
    return run('eslint .', {stdio: 'inherit'});
});

ghu.task('build:scripts', runtime => {
    return read(`${SRC}/_h5ai/public/js/scripts.js`)
        .then(newerThan(mapper, `${SRC}/_h5ai/public/js/**`))
        .then(webpack(webpackCfg([SRC]), {showStats: false}))
        .then(wrap('\n\n// @include "pre.js"\n\n'))
        .then(includeit())
        .then(ife(() => runtime.args.production, uglify({compressor: {warnings: false}})))
        .then(wrap(runtime.commentJs))
        .then(write(mapper, {overwrite: true}));
});

ghu.task('build:styles', runtime => {
    return read(`${SRC}/_h5ai/public/css/*.less`)
        .then(newerThan(mapper, `${SRC}/_h5ai/public/css/**`))
        .then(includeit())
        .then(less())
        .then(autoprefixer())
        .then(ife(() => runtime.args.production, cssmin()))
        .then(wrap(runtime.commentJs))
        .then(write(mapper, {overwrite: true}));
});

ghu.task('build:pages', runtime => {
    return read(`${SRC}: **/*.pug, ! **/*.tpl.pug`)
        .then(newerThan(mapper, `${SRC}/**/*.tpl.pug`))
        .then(pug({pkg: runtime.pkg}))
        .then(wrap('', runtime.commentHtml))
        .then(write(mapper, {overwrite: true}));
});

ghu.task('build:copy', runtime => {
    const mapperRoot = mapfn.p(ROOT, join(BUILD, '_h5ai'));

    return Promise.all([
        read(`${SRC}/**/conf/*.json`)
            .then(newerThan(mapper))
            .then(wrap(runtime.commentJs))
            .then(write(mapper, {overwrite: true, cluster: true})),

        read(`${SRC}: **, ! **/*.js, ! **/*.less, ! **/*.pug, ! **/conf/*.json`)
            .then(newerThan(mapper))
            .then(each(obj => {
                if ((/index\.php$/).test(obj.source)) {
                    obj.content = obj.content.replace('{{VERSION}}', runtime.pkg.version);
                }
            }))
            .then(write(mapper, {overwrite: true, cluster: true})),

        read(`${ROOT}/*.md`)
            .then(newerThan(mapperRoot))
            .then(write(mapperRoot, {overwrite: true, cluster: true}))
    ]);
});

ghu.task('build:tests', ['build:styles'], 'build the test suite', () => {
    return Promise.all([
        read(`${BUILD}/_h5ai/public/css/styles.css`)
            .then(newerThan(`${BUILD}/test/h5ai-styles.css`))
            .then(write(`${BUILD}/test/h5ai-styles.css`, {overwrite: true})),

        read(`${TEST}/index.html`)
            .then(newerThan(`${BUILD}/test/index.html`))
            .then(write(`${BUILD}/test/index.html`, {overwrite: true})),

        read(`${TEST}: index.js`)
            .then(webpack(webpackCfg([SRC, TEST]), {showStats: false}))
            .then(wrap(`\n\n// @include "${SRC}/**/js/pre.js"\n\n`))
            .then(includeit())
            .then(write(mapfn.p(TEST, `${BUILD}/test`), {overwrite: true}))
    ]).then(() => {
        console.log(`browse to file://${BUILD}/test/index.html to run the test suite`);
    });
});

ghu.task('build', ['build:scripts', 'build:styles', 'build:pages', 'build:copy', 'build:tests'],
    'build all updated files, optionally use :production');

ghu.task('deploy', ['build'], 'deploy to a specified path with :dest=/some/path', runtime => {
    if (typeof runtime.args.dest !== 'string') {
        throw new Error('no destination path (e.g. :dest=/some/path)');
    }
    console.log(`deploy to ${runtime.args.dest}`);

    const mapperDeploy = mapfn.p(BUILD, resolve(runtime.args.dest));

    return read(`${BUILD}/_h5ai/**`)
        .then(newerThan(mapperDeploy))
        .then(write(mapperDeploy, {overwrite: true, cluster: true}));
});

ghu.task('watch', runtime => {
    return watch([SRC, TEST], () => ghu.run(runtime.sequence.filter(x => x !== 'watch'), runtime.args, true));
});

ghu.task('release', ['force-production', 'clean', 'build'], 'create a zipball', runtime => {
    const target = join(BUILD, `${runtime.pkg.name}-${runtime.pkg.version}.zip`);

    return read(`${BUILD}/_h5ai/**`)
        .then(jszip({dir: BUILD, level: 9}))
        .then(write(target, {overwrite: true}));
});
