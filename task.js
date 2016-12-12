'use strict';

var spawn = require('cross-spawn'),
    fs = require('fs-extra'),
    path = require('path'),
    glob = require('glob'),
    config = require('./config'),
    utils = require('./utils'),
    logger = require('./logger'),
    deps = require('./deps'),
    archiver = require('archiver'),
    moment = require('moment');

var webpack = require('webpack');

class Task {

    /**
     * init config
     * @method before
     * @param  {Object} args [description]
     * @return {[type]}      [description]
     */
    before(args) {
        var conf = config.init(args);
        return this.checkArgs(args).then(() => {
            if (conf.vue) {
                return this.checkDeps('vue');
            }
        }).then(() => {
            if (conf.es7) {
                return this.checkDeps('es7');
            }
        }).then(() => {
            if (conf.react) {
                return this.checkDeps('react');
            }
        });
    }

    /**
     * check args and install missing modules or dependencies
     * @method checkArgs
     * @param  {Object} args : process arguments
     * @return {Promise}
     */
    checkArgs(args) {
        if (args.mock) {
            return new Promise((resolve, reject) => {
                var mockPath = path.join(process.cwd(), 'mock', 'mock.js');
                fs.stat(mockPath, (err) => {
                    if (err) {
                        logger.error(`can't find ${mockPath}, have you ever ` + 'init mock module'.to
                            .bold.red.color + ' ? ');
                        logger.error('try to use ' + 'kil init -m'.to.bold.red.color +
                            ' to fix this issue. ');
                        reject(err);
                    }
                    resolve();
                });
            });
        }

        return Promise.resolve();
    }

    /**
     * init folders
     * @method initFolder
     * @param  {List}    folders
     * @return {[type]}                  [description]
     */
    initFolder(folders) {
        var list = [];
        folders.forEach((folder) => {
            list.push(new Promise((resolve, reject) => {
                fs.stat(folder, (err, status) => {
                    if (err) {
                        logger.info(` create folder ${folder} `);
                        fs.mkdirs(folder, () => {
                            resolve();
                        });
                    } else {
                        logger.info(` folder ${folder} already exists! `);
                        resolve();
                    }
                });
            }));
        });

        return Promise.all(list);
    }

    /**
     * init files
     * @method initFile
     * @param  {List}  files         [description]
     * @return {Promise}                [description]
     */
    initFile(files) {
        var list = [];
        files.forEach((file) => {
            list.push(new Promise((resolve, reject) => {
                fs.stat(file, (err, stats) => {
                    if (err) {
                        var origin = path.join(__dirname, 'default', file);
                        var dest = path.join(process.cwd(), file);
                        fs.copy(origin, dest, () => {
                            logger.info(` create file ${dest} `);
                            resolve();
                        });
                    } else {
                        logger.info(` file ${file} already exists! `);
                        resolve();
                    }
                });
            }));
        });

        return Promise.all(list);
    }

    initMock() {
        logger.info(' start init mock module ');
        var folders = ['mock'];
        var files = ['mock/mock.js'];

        return this.initModule(folders, files).then(() => {
            return this.checkDeps('mock');
        }).then(() => {
            logger.info(' init mock module successfully! ');
        });
    }

    initTest() {
        logger.info(' start init test module ');
        var folders = ['test/mocha', 'test/phantom'];
        var files = ['test/karma.conf.js', 'test/mocha/index.test.js', 'test/phantom/index.test.js'];

        return this.initModule(folders, files).then(() => {
            return this.checkDeps('test');
        }).then(() => {
            logger.info(' init test module successfully! ');
        });
    }

    initProj() {
        logger.info(' start init project ');
        var folders = ['js'];
        var files = ['pack.default.js', 'index.html', 'index.js', 'js/main.js'];

        return this.initModule(folders, files).then(() => {
            logger.info(' init project successfully. ');
        });
    }

    /**
     * init module: create folders and files
     * @method initModule
     * @param  {List}   folders [description]
     * @param  {List}   files   [description]
     * @return {[type]}           [description]
     */
    initModule(folders, files) {
        return this.initFolder(folders).then(() => {
            return this.initFile(files);
        });
    }

    /**
     * check modules and install missing dependencies
     * @method checkDeps
     * @param  {String}  conf : keys in deps
     * @return {[type]}         [description]
     */
    checkDeps(conf) {
        var projectJson = path.join(process.cwd(), 'package.json');
        return new Promise((resolve, reject) => {
            fs.readJson(projectJson, (err, pack) => {
                if (err) {
                    logger.error(`can't read project json file ${projectJson}`);
                    reject(err);
                }
                resolve(pack);
            });
        }).then((pack) => {
            var checklist = [];
            switch (conf) {
                case 'mock':
                case 'test':
                case 'vue':
                case 'es7':
                case 'react':
                    pack.dependencies = pack.dependencies || {};
                    for (let key in deps[conf]) {
                        pack.dependencies[key] = deps[conf][key];
                        checklist.push(new Promise((res, reject) => {
                            try {
                                require(path.join(process.cwd(), 'node_modules',
                                    key));
                                res();
                            } catch (err) {
                                logger.info(` module ${key} not found! `);
                                reject();
                            }
                        }));
                    }
                    break;
                default:
                    break;
            }

            return Promise.all(checklist).then(null, () => {
                return this.installDependencies(pack);
            });
        });
    }

    /**
     * install dependencies accoring to package.json
     * @method installDependencies
     * @param  {JSON}            pack :
     * @return {Promise}                 [description]
     */
    installDependencies(pack) {
        return new Promise((resolve, reject) => {
            fs.writeJson(path.join(process.cwd(), 'package.json'), pack, (err) => {
                if (err) {
                    logger.error(err);
                    reject(err);
                } else {
                    logger.info(' check and install module dependencies. ');
                    spawn('npm', ['install'], {
                        stdio: 'inherit'
                    }).on('close', (code) => {
                        resolve();
                    });
                }
            });
        });
    }

    /**
     * init config, check dependencies and exec task
     * @method {EXEC} exec
     * @param  {Object} args :
     * @param  {String} task : task name
     */
    exec(args, task) {
        let promise = this.before(args);
        promise.then(() => {
            logger.debug(`exec task ${task} with args:`);
            logger.debug(args);
            this[task](args);
        }, () => {
            logger.error(`exec task ${task} failed`);
        });
    }

    /**
     * init a new project with mock and test module (default is not initilized)
     * @method {TASK} init
     * @param  {Object} args {test: false, mock: false}
     * @return {[type]}      [description]
     */
    init(args) {
        var mock = !!args.mock;
        var test = !!args.test;

        new Promise((resolve, reject) => {
            var packageJson = path.join(process.cwd(), 'package.json');
            fs.stat(packageJson, (err) => {
                if (err) {
                    logger.info(' package.json is not found, npm init');
                    spawn('npm', ['init'], {
                        stdio: 'inherit'
                    }).on('close', (code) => {
                        logger.info(
                            ' add key kil in package.json for system configuration. ');
                        var pack = require(packageJson);
                        pack.kil = require('./default/package.default.js');
                        fs.writeJson('package.json', pack, (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    });
                } else {
                    resolve();
                }
            });
        }).then(() => {
            return this.initProj();
        }).then(() => {
            if (mock) {
                return this.initMock();
            }
        }).then(() => {
            if (test) {
                return this.initTest();
            }
        }).catch((err) => {
            if (err) {
                console.log(err);
            }
        });
    }

    /**
     * load webpack config and start webpack dev server
     * @method dev
     * @param  {Object} args : {mock: true, port: 9000}
     */
    dev(args) {
        var pack_config = utils.loadWebpackCfg('dev', args);
        var compiler = webpack(pack_config);
        var WebpackDevServer = require('webpack-dev-server');
        var serverCfg = {
            hot: true,
            watchOptions: {
                poll: 1000
            },
            stats: {
                colors: true
            }
        };

        if (pack_config.devServer && pack_config.devServer.proxy) {
            serverCfg.proxy = pack_config.devServer.proxy;
        }
        if (config.getHtml5Mode()) {
            serverCfg.historyApiFallback = true;
        }

        logger.debug('webpack dev server start with config: ');
        logger.debug(serverCfg);

        new WebpackDevServer(compiler, serverCfg).listen(config.getPort(), '127.0.0.1', (err) => {
            if (err) {
                logger.error(err);
                process.exit(1);
            }

            logger.info('----------------------------------');
            logger.info(`Server listening at localhost:${config.getPort()}`);
            logger.info('----------------------------------');
        });
    }

    /**
     * do unit tests with mocha and endless tests with phantom
     * @method test
     * @param  {Object} args: {phantom: false, mocha: false}
     */
    test(args) {
        var mocha = !!args.mocha;
        var phantom = !!args.phantom;
        var server = !!args.server;

        var testPath = path.join(process.cwd(), 'test');
        fs.stat(testPath, (err) => {
            if (err) {
                logger.error(`can't find ${testPath}, have you ever ` + 'init test module'.to.bold.red.color +
                    ' ? ');
                logger.error('try to use ' + 'kil init -t'.to.bold.red.color + ' to fix this issue. ');

                process.exit(1);
            }

            if (mocha) {
                var karmaBin = path.join(__dirname, 'node_modules/karma/bin/karma');
                var karmaConfPath = path.join(process.cwd(), 'test/karma.conf.js');

                var bins;
                if (server) {
                    bins = ['start', karmaConfPath, '--detached'];
                } else {
                    bins = ['start', karmaConfPath, '--detached', '--single-run'];
                }

                spawn(karmaBin, bins, {
                    stdio: 'inherit'
                }).on('close', (code) => {
                    logger.info(`mocha test finished with code : ${code}`);
                });
            }

            if (phantom) {
                var phantomBin = path.join(__dirname, 'node_modules/phantomjs/bin/phantomjs');
                var phantomEntry = path.join(process.cwd(), 'test/phantom/index.test.js');
                spawn(phantomBin, [phantomEntry], {
                    stdio: 'inherit',
                    cwd: __dirname
                }).on('close', (code) => {
                    logger.info(`phontom test finished with code : ${code}`);
                });
            }
        });
    }

    /**
     * use webpack and build bundle
     * @method build
     * @param  {Object} args  [description]
     * @param  {Function} after : callback after build
     */
    build(args, after) {
        var pack_config = utils.loadWebpackCfg('release', args);

        logger.info('start build project... ');

        var compiler = webpack(pack_config);
        compiler.run((err, stats) => {
            if (err) {
                logger.error(err);

                process.exit(1);
            }

            var jsonStats = stats.toJson();
            if (jsonStats.errors.length > 0) {
                logger.error(jsonStats.errors);
            }
            if (jsonStats.warnings.length > 0) {
                logger.warn(jsonStats.warnings);
            }

            var conf = config.getConfig();
            if (conf.copy && conf.copy.length > 0) {
                conf.copy.forEach((key) => {
                    let files = glob.sync(key);
                    files.forEach((file) => {
                        fs.copySync(file, `dist/${file}`);
                    });
                });
            }

            logger.info('build successfully. ');

            if (after && typeof after === "function") {
                after(pack_config);
            }
        });
    }

    /**
     * use webpack and build bundle
     * @return {[type]} [description]
     */
    release(args) {
        this.build(args, (config) => {
            var releaseFile = './' + moment().format('YYYYMMDD-HHmmss') + '-release.zip';
            var output = fs.createWriteStream(releaseFile);
            output.on('close', function() {
                logger.info(`kil release successfully! see ${releaseFile}`);
            });

            var zipArchive = archiver('zip');
            zipArchive.pipe(output);
            zipArchive.bulk([{
                src: [path.relative(config.output.path, process.cwd()) + '/*'],
                cwd: process.cwd(),
                expand: true
            }]);
            zipArchive.finalize((err, bytes) => {
                if (err) {
                    throw err;
                }
            });
        });
    }
}

module.exports = new Task();
