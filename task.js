'use strict';

var spawn = require('cross-spawn'),
    fs = require('fs-extra'),
    path = require('path'),
    glob = require('glob'),
    Promise = require('promise'),
    config = require('./config'),
    utils = require('./utils'),
    logger = require('./logger'),
    deps = require('./deps');

var webpack = require('webpack');

class Task {

    /**
     * check module and try install missing modules or dependencies
     * @method _check
     * @param  {Object} args : process arguments
     * @return {Promise}
     */
    _check(args) {
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
     * @method _initFolder
     * @param  {Function}    resolve_outer
     * @param  {Function}    reject_outer
     * @param  {List}    folders
     * @param  {List}    files         [description]
     * @param  {Function}  callback      [description]
     * @return {[type]}                  [description]
     */
    _initFolder(resolve_outer, reject_outer, folders, files, callback) {
        var folder_counter = 0;
        folders.forEach((folder) => {
            new Promise((resolve, reject) => {
                try {
                    fs.statSync(folder);
                    logger.info(` folder ${folder} already exists! `);
                    resolve();
                } catch (err) {
                    if (err) {
                        try {
                            logger.info(` create folder ${folder} `);
                            fs.mkdirSync(folder);
                            resolve();
                        } catch (err) {
                            logger.error(` create folder ${folder} failed! `);
                            reject(err);
                        }
                    }
                }
            }).done(() => {
                folder_counter++;
                if (folder_counter == folders.length) {
                    callback(resolve_outer, reject_outer, files);
                }
            }, (err) => {
                logger.error(err);
                logger.error(' init folders failed! ');
                process.exit(1);
            });
        });
    }

    /**
     * init files
     * @method _initFile
     * @param  {Function}  resolve_outer [description]
     * @param  {Function}  reject_outer  [description]
     * @param  {List}  files         [description]
     * @return {[type]}                [description]
     */
    _initFile(resolve_outer, reject_outer, files) {
        var flie_counter = 0;
        var file_size = 1;

        files.forEach((file) => {
            new Promise((resolve, reject) => {
                fs.stat(file, (err, stats) => {
                    if (err) {
                        var origin = path.join(__dirname, 'default', file);
                        var dest = path.join(process.cwd(), file);
                        try {
                            fs.createReadStream(origin).pipe(fs.createWriteStream(dest));
                            logger.info(` create file ${dest} `);
                            resolve();
                        } catch (err) {
                            logger.info(` create file ${dest} failed! `);
                            reject();
                        }
                    } else {
                        logger.info(` file ${file} already exists! `);
                        resolve();
                    }
                });
            }).done(() => {
                flie_counter++;
                if (flie_counter == file_size) {
                    resolve_outer();
                }
            });
        });
    }

    initMock() {
        var folders = ['mock'];
        var files = ['mock/mock.js'];

        return this._initModule(folders, files);
    }

    initTest() {
        var folders = ['test', 'test/mocha', 'test/phantom'];
        var files = ['test/karma.conf.js', 'test/mocha/index.test.js', 'test/phantom/index.test.js'];

        return this._initModule(folders, files);
    }

    initProj() {
        var folders = ['js'];
        var files = ['pack.default.js', 'index.html', 'index.js', 'js/main.js'];

        return this._initModule(folders, files);
    }

    _initModule(folders, files) {
        return new Promise((resolve, reject) => {
            this._initFolder(resolve, reject, folders, files, this._initFile);
        });
    }

    installDependencies(pack) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path.resolve(__dirname, './package.json'), JSON.stringify(pack), (err) => {
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
     * init a new project with mock and test module (default is not initilized)
     * @method init
     * @param  {[type]} args {test: false, mock: false}
     * @return {[type]}      [description]
     */
    init(args) {
        var mock = !!args.mock;
        var test = !!args.test;
        var self = this;

        var init = () => {
            let promise = this.initProj();
            promise.done(() => {
                logger.info(' init project successfully. ');
                if (mock) {
                    let promise = this.initMock();
                    promise.done(() => {
                        logger.info(' init mock module successfully! ');
                    });
                }
                if (test) {
                    let promise = this.initTest();
                    promise.done(() => {
                        logger.info(' init test module successfully! ');
                    });
                }

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

                    let promise = this.installDependencies(pack);
                    promise.done(() => {
                        logger.info(' install dependencies successfully! ');
                    });
                }
            });
        };

        var packageJson = path.join(process.cwd(), 'package.json');
        new Promise((resolve, reject) => {
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
                        fs.writeFile('package.json', JSON.stringify(pack), (err) => {
                            if (err) {
                                reject(err);
                            }
                        });

                        resolve();
                    });
                } else {

                    resolve();
                }
            });
        }).done(init, (err) => {
            logger.error(err);
            process.exit(1);
        });
    }

    dev(args) {
        var promise = this._check(args);
        promise.done(this._dev.bind(args, this), () => {
            process.exit(1);
        });
    }

    /**
     * private method: load webpack config and start webpack dev server
     * @method _dev
     * @param  {Object} args [description]
     * @return {[type]}      [description]
     */
    _dev(args) {
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

    build(args, after) {
        var promise = this._check(args);
        promise.done(this._build.bind(args, this), () => {
            process.exit(1);
        });
    }

    /**
     * use webpack and build bundle
     * @method build
     * @param  {Object} args  [description]
     * @param  {Function} after : callback after build
     */
    _build(args, after) {
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
