'use strict';

var spawn = require('cross-spawn'),
    fs = require('fs-extra'),
    path = require('path'),
    glob = require('glob'),
    config = require('./config'),
    utils = require('./utils'),
    logger = require('./logger'),
    deps = require('./deps');

var webpack = require('webpack');

class Task {

    /**
     * init config
     * @method before
     * @param  {Object} args [description]
     * @return {[type]}      [description]
     */
    before(args) {
        return new Promise((resolve, reject) => {
            config.init(args);
            resolve();
        }).then(() => {
            return this.check(args);
        });
    }

    /**
     * check module and try install missing modules or dependencies
     * @method check
     * @param  {Object} args : process arguments
     * @return {Promise}
     */
    check(args) {
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
     * @return {[type]}                [description]
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

        return this.initModule(folders, files);
    }

    initTest() {
        logger.info(' start init test module ');
        var folders = ['test/mocha', 'test/phantom'];
        var files = ['test/karma.conf.js', 'test/mocha/index.test.js', 'test/phantom/index.test.js'];

        return this.initModule(folders, files);
    }

    initProj() {
        logger.info(' start init project ');
        var folders = ['js'];
        var files = ['pack.default.js', 'index.html', 'index.js', 'js/main.js'];

        return this.initModule(folders, files);
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

    installDependencies(pack) {
        return new Promise((resolve, reject) => {
            fs.writeJson(path.resolve(__dirname, './package.json'), pack, (err) => {
                if (err) {
                    reject(err);
                } else {
                    logger.info(' check and install module dependencies. ');
                    spawn('npm', ['install'], {
                        stdio: 'inherit',
                        cwd: __dirname
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
            this[task](args);
        }).catch((err) => {
            if (err) {
                logger.error(' init module failed! ');
            }
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
            return this.initProj().then(() => {
                logger.info(' init project successfully. ');
            });
        }).then(() => {
            if (mock) {
                return this.initMock().then(() => {
                    logger.info(' init mock module successfully! ');
                });
            }
        }).then(() => {
            if (test) {
                return this.initTest().then(() => {
                    logger.info(' init test module successfully! ');
                });
            }
        }).then(() => {
            if (mock || test) {
                var pack = require('./package.json');
                if (mock) {
                    for (let key in deps.mock) {
                        pack.dependencies[key] = deps.mock[key];
                    }
                }
                if (test) {
                    for (let key in deps.test) {
                        pack.dependencies[key] = deps.test[key];
                    }
                }

                return this.installDependencies(pack).then(() => {
                    logger.info(' install dependencies successfully! ');
                });
            }
        }).catch((err) => {
            if (err) {
                console.log(err);
            }
        });
    }

    /**
     * private method: load webpack config and start webpack dev server
     * @method dev
     * @param  {Object} args : {mock: true, port: 9000}
     * @return {[type]}      [description]
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
     * @return {[type]}      [description]
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
                after();
            }
        });
    }

    /**
     * use webpack and build bundle
     * @return {[type]} [description]
     */
    release(args) {
        var after = () => {
            logger.info('TODO package files.');
            // spawn('rm', ['dist/*.map'], {
            //     stdio: 'inherit'
            // }).on('close', (code) => {
            //     logger.info('finish package files');
            // });
        };
        this.build(args, after);
    }
}

module.exports = new Task();
