import fq from 'fquery';
import dateformat from 'dateformat';
import {join, resolve} from 'path';
import webpack from 'webpack';
import {spawnSync} from 'child_process';

const loadPlugins = () => {
    const pkg = require('./package.json');
    const deps = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})];
    const plugs = deps.filter(name => name.startsWith('fquery-'));
    plugs.forEach(plug => fq.plugin(plug));
};
loadPlugins();

const root = resolve(__dirname);
const src = join(root, 'src');
const build = join(root, 'build');

function once(fn) {
    let getter = () => {
        const value = fn();
        getter = () => value;
        return value;
    };
    return () => getter();
}

function run(cmd, {info = true, stdout = true, stderr = true, liberal = false, local = true} = {}) {
    const stdio = ['ignore', stdout ? 1 : 'pipe', stderr ? 2 : 'pipe'];
    if (info) {
        fq.report({type: 'info', method: 'run', message: cmd});
    }
    const precmd = local ? 'PATH=./node_modules/.bin:$PATH;' : '';
    const res = spawnSync('sh', ['-c', precmd + cmd], {
        cwd: root,
        stdio,
        encoding: 'utf-8'
    });
    if (res.status !== 0 && !liberal) {
        fq.report({type: 'err', method: 'run', message: `${cmd} [${res.status}] ${String(res.error)}`});
    }
    return res;
}

const getStamp = once(() => {
    const stamp = new Date();
    stamp.human = dateformat(stamp, 'yyyy-mm-dd HH:MM:ss');
    stamp.id = stamp.human.replace(/\D/g, '-');
    stamp.sha1 = fq.getHash(stamp.id);
    return stamp;
});

const getPackage = once(() => {
    const pkg = require('./package.json');
    const res = run(`git rev-list v${pkg.version}..HEAD`, {info: false, stdout: false, stderr: false, liberal: true});
    if (res.status === 0) {
        const hashes = fq._.compact(res.stdout.split(/\r?\n/));
        if (hashes.length) {
            pkg.version += `+${hashes.length}~${hashes[0].substr(0, 7)}`;
        }
    }
    return pkg;
});

const getComment = once(() => {
    const pkg = getPackage();
    return `${pkg.name} v${pkg.version} - ${getStamp().human}`;
});

const getHeader = once(() => `/* ${getComment()} */\n`);

function formatWebpackStats(stats, len) {
    const json = stats.toJson();
    const align = (s, i) => `          ${s}`.substr(-i);
    const cmp = (a, b) => a < b ? -1 : a > b ? 1 : 0;
    const sortBy = (arr, selector = x => x) => Array.from(arr).sort((a, b) => cmp(selector(a), selector(b)));
    let res = sortBy(json.modules, x => x.size);
    if (len) {
        res = 'stats\n' + res.slice(-len).map(r => {
            return `${align(`[${r.id}]`, 7)}${align(r.size, 10)}   ${r.name}`;
        }).join('\n');
        res += `\n\n${align(json.modules.length, 7)}${align(json.assets[0].size, 10)}   ${json.assets[0].name}`;
    } else {
        res = `modules: ${json.modules.length}, bytes: ${json.assets[0].size}, bundle: ${json.assets[0].name}`;
    }
    return res;
}

module.exports = suite => {
    suite.defaults('release');

    suite.target('clean', [], 'delete build folder').task(() => {
        fq(build, {dirs: true}).delete();
    });

    suite.target('lint', [], 'lint all JavaScript files with eslint').task(() => {
        run(`eslint ${src}/_h5ai/public/js`);
    });

    suite.target('build:scripts').task(done => {
        const mapSrc = fq.map.p(src, build);
        const scriptsChanged = fq(`${src}: _h5ai/public/js/scripts.js`)
            .newerThan(mapSrc, fq(`${src}: _h5ai/public/js/**`)).length > 0;

        if (!scriptsChanged) {
            done();
            return;
        }

        const webpackConfig = {
            context: src,
            entry: './_h5ai/public/js/scripts.js',
            output: {
                path: build,
                filename: '_h5ai/public/js/scripts.js'
            },
            module: {
                loaders: [
                    {
                        include: [src],
                        loader: 'babel',
                        query: {
                            cacheDirectory: true
                        }
                    }
                ]
            }
        };

        if (!suite.args.production) {
            webpackConfig.output.pathinfo = true;
            webpackConfig.devtool = '#inline-source-map';
        }

        webpack(webpackConfig, (err, stats) => {
            if (err) {
                fq.report({type: 'err', method: 'scripts', message: err});
            }
            // console.log(stats.toString({colors: true}));
            fq.report({type: 'info', method: 'webpack', message: formatWebpackStats(stats, 10)});

            fq(`${build}: _h5ai/public/js/scripts.js`)
                .if(suite.args.production, function applyuglifyjs() {
                    this.uglifyjs(); // eslint-disable-line no-invalid-this
                })
                .wrap(getHeader())
                .write(mapSrc, true);
            done();
        });
    });

    suite.target('build', [], 'build all updated files, optionally use :uncompressed (e.g. mkr -b build :uncompressed)').task(() => {
        const env = {pkg: getPackage()};
        const mapSrc = fq.map.p(src, build).s('.less', '.css').s('.jade', '');
        const mapRoot = fq.map.p(root, join(build, '_h5ai'));

        fq(`${src}: _h5ai/public/js/*.js`)
            .newerThan(mapSrc, fq(`${src}: _h5ai/public/js/**`))
            .includeit()
            .if(!suite.args.uncompressed, function applyuglifyjs() {
                this.uglifyjs(); // eslint-disable-line no-invalid-this
            })
            .wrap(getHeader())
            .write(mapSrc, true);

        fq(`${src}: _h5ai/public/css/*.less`)
            .newerThan(mapSrc, fq(`${src}: _h5ai/public/css/**`))
            .includeit()
            .less()
            .autoprefixer()
            .if(!suite.args.uncompressed, function applycssmin() {
                this.cssmin(); // eslint-disable-line no-invalid-this
            })
            .wrap(getHeader())
            .write(mapSrc, true);

        fq(`${src}: **/*.jade, ! **/*.tpl.jade`)
            .newerThan(mapSrc)
            .jade(env)
            .write(mapSrc, true);

        fq(`${src}: **, ! _h5ai/public/js/**, ! _h5ai/public/css/**, ! **/*.jade`)
            .newerThan(mapSrc)
            .handlebars(env)
            .write(mapSrc, true);

        fq(`${root}: *.md`)
            .newerThan(mapRoot)
            .write(mapRoot, true);

        fq.report({type: 'info', message: getComment()});
    });

    suite.target('deploy', ['build'], 'deploy to a specified path (e.g. mkr -b deploy :dest=/some/path)').task(() => {
        if (!fq._.isString(suite.args.dest)) {
            fq.report({type: 'err', message: 'no destination path (e.g. mkr -b deploy :dest=/some/path)'});
        }

        const mapper = fq.map.p(build, resolve(suite.args.dest));

        fq(`${build}: _h5ai/**`)
            .newerThan(mapper)
            .write(mapper, true);
    });

    // suite.target('release', ['clean', 'lint', 'build'], 'create a zipball').task(() => {
    suite.target('release', ['clean', 'build'], 'create a zipball').task(() => {
        const pkg = getPackage();
        const target = join(build, `${pkg.name}-${pkg.version}.zip`);

        fq(`${build}: **`)
            .jszip({dir: build, level: 9})
            .write(target, true);
    });

    suite.target('build-test', [], 'build a test suite').task(() => {
        fq(`${src}/_h5ai/public/css/styles.less`)
            .includeit()
            .less()
            .autoprefixer()
            .write(`${build}/test/h5ai-styles.css`, true);

        fq(`${src}/_h5ai/public/js/scripts.js`)
            .includeit()
            .write(`${build}/test/h5ai-scripts.js`, true);

        fq(`${root}/test/styles.less`)
            .includeit()
            .less()
            .autoprefixer()
            .write(`${build}/test/styles.css`, true);

        fq(`${root}/test/scripts.js`)
            .includeit()
            .write(`${build}/test/scripts.js`, true);

        fq(`${root}/test/index.html.jade`)
            .jade({pkg: getPackage()})
            .write(`${build}/test/index.html`, true);

        fq.report({type: 'info', message: `browse to file://${build}/test/index.html`});
    });
};
