var utils = require('./utils');
var child_process = require('child_process'),
    exec = child_process.exec,
    spawn = child_process.spawn,
    fs = require('fs');

const PORT = 9000;
const node_m = `${process.cwd()}/node_modules`;

module.exports = {

    /**
     * init package.json and pack.js, karma.conf.js
     * @return {[type]} [description]
     */
    init: function() {
        /**
         * merge package.json and install default npm dependenies
         * @param  {[type]} code [description]
         * @return {[type]}      [description]
         */
        var initDepends = function(code) {
            var pack = utils.mergepkcfg();
            fs.writeFile('package.json', JSON.stringify(pack), function(err) {
                if (err) {
                    throw err
                }

                console.log('install denpendencies from npm repo, see https://www.npmjs.com/.');

                spawn('npm', ['i'], {
                    stdio: 'inherit'
                }).on('close', function() {
                    console.log('init project successfully.');
                });
            });

            initDefFiles();
        }

        var initDefFiles = function() {
            const folders = ['css', 'js', 'less', 'test', 'test/mocha', 'test/phantom', 'mock'];
            folders.forEach((folder) => {
                try {
                    fs.statSync(folder);
                } catch (err) {
                    if (err) {
                        fs.mkdirSync(folder);
                    }
                }
            })

            const cpfiles = ['pack.js', 'index.html', 'index.js', 'test/karma.conf.js', 'test/mocha/index.test.js', 'test/phantom/index.test.js', 'mock/mock.js'];
            cpfiles.forEach((file) => {
                fs.stat(file, (err, stats) => {
                    if (err) {
                        fs.createReadStream(`${__dirname}/default/${file}`).pipe(fs.createWriteStream(`${process.cwd()}/${file}`));
                    }
                })
            })

            fs.stat('pack.js', (err, stats) => {
                if (err) {
                    fs.createReadStream(`${__dirname}/pack.js`).pipe(fs.createWriteStream(`${process.cwd()}/test/kil.pack.js`));
                }
            })
        }

        spawn('npm', ['init'], {
            stdio: 'inherit'
        }).on('close', initDepends);
    },

    /**
     * load webpack config and start webpack dev server
     * @return {[type]} [description]
     */
    dev: function() {
        var webpack = require(`${node_m}/webpack`),
            pack_config = utils.loadWebpack('dev');
        var compiler = webpack(pack_config);
        var WebpackDevServer = require(`${node_m}/webpack-dev-server`);
        var serverCfg = {
            hot: true,
            watchOptions: {
                poll: 1000
            },
            stats: {
                colors: true
            }
        }
        if (pack_config.devServer && pack_config.devServer.proxy) {
            serverCfg.proxy = pack_config.devServer.proxy;
        }
        new WebpackDevServer(compiler, serverCfg).listen(PORT, 'localhost', (err) => {
            if (err) {
                throw err;
            }

            console.log('----------------------------------');
            console.log(`Server listening at localhost:${PORT}`);
            console.log('----------------------------------');
        });
    },

    /**
     * load webpack config and start webpack dev server for testing
     * @return {[type]} [description]
     */
    test: function() {
        spawn('./node_modules/karma/bin/karma', ['start', './test/karma.conf.js'], {
            stdio: 'inherit'
        }).on('close', (code) => {
            console.log('karma process exited with code ' + code);
        });

        spawn('./node_modules/phantomjs/bin/phantomjs', ['./test/phantom/index.test.js'], {
            stdio: 'inherit'
        }).on('close', (code) => {
            console.log('phontom process exited with code ' + code);
        });
    },

    /**
     * use webpack and build bundle
     * @return {[type]} [description]
     */
    release: function() {
        var webpack = require(`${process.cwd()}/node_modules/webpack`),
            pack_config = utils.loadWebpack('release');

        this.clean();

        console.log('building project...');

        var compiler = webpack(pack_config);
        compiler.run((err, stats) => {
            if (err) {
                console.error(err);
            }
            var jsonStats = stats.toJson();
            if (jsonStats.errors.length > 0) {
                return console.error(jsonStats.errors);
            }
            if (jsonStats.warnings.length > 0) {
                console.error(jsonStats.warnings);
            }

            console.log('bundle built, copy files to dist folder');

            //TODO lib be cdn liked
            const copyList = ['index.html', 'js', 'img', 'images', 'lib'];
            copyList.forEach((file) => {
                fs.stat(file, (err, stats) => {
                    if (!err) {
                        spawn('cp', ['-r', file, `dist/${file}`], {
                            stdio: 'inherit'
                        }).on('close', function(code) {

                        })
                    }
                })
            });

            console.log('build successfully.');

            //TODO zip
        });
    },

    clean: function() {
        spawn('rm', ['-rf', 'dist'], {
            stdio: 'inherit'
        }).on('close', function(code) {
            console.log('build cleaned, remove dist folder.')
        })
    },


    help: function() {
        console.log('----------------------------------');
        console.log(`--------TODO: Help Option---------`);
        console.log('----------------------------------');
    }

}