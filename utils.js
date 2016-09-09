'use strict';

var path = require('path'),
    fs = require('fs'),
    logger = require('./logger'),
    webpack = require('webpack'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    config = require('./config'),
    babel = require('./babel');

class Utils {

    /**
     * load webpack:
     *     @task dev: add dev-server and enable HMR, according to mock config, enable mock
     *     @task release: add uglifyjs
     * @return config
     */
    loadWebpackCfg(target, args) {
        switch (target) {
        case 'dev':
            var isDebug = true;
            var pack_config = this.mergeConfig(args, isDebug);
            pack_config.devtool = '#eval';

            var conf = config.getConfig();
            if (conf.mock === true) {
                var babelQueryStr = babel(isDebug);
                var entryPath = [];
                for (var key in pack_config.entry) {
                    var entry = pack_config.entry[key];
                    var type = Object.prototype.toString.call(entry);
                    if (type === 'object String]') {
                        entryPath.push(path.resolve(process.cwd(), entry + '.js'));
                    } else if (type === '[object Array]') {
                        entryPath.push(path.resolve(process.cwd(), entry[entry.length - 1] + '.js'));
                    }
                }

                var mockPath = path.resolve(process.cwd(), 'mock/mock.js');

                //load mock.js before all
                pack_config.module.loaders.push({
                    test: entryPath,
                    exclude: /(node_modules|bower_components)/,
                    loaders: [`imports?Mock=${mockPath}`, `babel-loader?${babelQueryStr}`]
                });
            }

            // config css and less loader
            pack_config.module.loaders.push({
                test: /\.css$/,
                loaders: ['style', 'css?sourceMap']
            });
            pack_config.module.loaders.push({
                test: /\.less$/,
                exclude: /(node_modules|bower_components)/,
                loaders: ['style', 'css?sourceMap!less?sourceMap']
            });

            // add plugin
            pack_config.plugins.push(new webpack.HotModuleReplacementPlugin());
            pack_config.plugins.push(new webpack.DefinePlugin({
                WEBPACK_DEBUG: true,
                'process.env': {
                    NODE_ENV: '"development"'
                }
            }));

            pack_config.output.publicPath = `http://localhost:${config.getPort()}/`;

            logger.debug('dev server start with webpack config: ');
            logger.debug(pack_config);

            return pack_config;
        case 'release':
            if (args.mock) {
                args.sourcemap = "";
            }
            var sourcemap = !!args.sourcemap ? "?source-map" : "";

            var pack_config = this.mergeConfig(args);
            if (sourcemap) {
                pack_config.devtool = '#source-map';
            } else {
                pack_config.devtool = '#eval';
            }

            var conf = config.getConfig();
            if (conf.mock === true && args.mock == true) {
                var babelQueryStr = babel(false);
                var entryPath = [];
                for (var key in pack_config.entry) {
                    var entry = pack_config.entry[key];
                    var type = Object.prototype.toString.call(entry);
                    if (type === 'object String]') {
                        entryPath.push(path.resolve(process.cwd(), entry + '.js'));
                    } else if (type === '[object Array]') {
                        entryPath.push(path.resolve(process.cwd(), entry[entry.length - 1] + '.js'));
                    }
                }

                var mockPath = path.resolve(process.cwd(), 'mock/mock.js');

                //load mock.js before all
                pack_config.module.loaders.push({
                    test: entryPath,
                    exclude: /(node_modules|bower_components)/,
                    loaders: [`imports?Mock=${mockPath}`, `babel-loader?${babelQueryStr}`]
                });
            }

            pack_config.module.loaders.push({
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style', `css${sourcemap}!postcss`)
            });
            pack_config.module.loaders.push({
                test: /\.less$/,
                exclude: /(node_modules|bower_components)/,
                loader: ExtractTextPlugin.extract('style', `css${sourcemap}!postcss!less${sourcemap}`)
            });

            pack_config.plugins.push(new ExtractTextPlugin(`[name].[hash].css`));
            if (args.uglify) {
                pack_config.plugins.push(new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: false
                    },
                    sourceMap: !!args.sourcemap
                }));
            }

            pack_config.plugins.push(new webpack.DefinePlugin({
                WEBPACK_DEBUG: false,
                'process.env': {
                    NODE_ENV: '"production"'
                }
            }));

            logger.debug('kil release with webpack config: ');
            logger.debug(pack_config);

            return pack_config;
        default:
            break;
        }

        return null;
    }

    /**
     * parse entry
     * @param  {[string]} dev:
     *     dev: add dev server and HMR entries
     *     release: do nothing with enties expcet convert string to array
     * @return {[type]}
     */
    parseEntry(entry, dev, depth) {
        if (entry) {
            var type = Object.prototype.toString.call(entry);
            if (type === '[object String]') {
                entry = [entry];
                if (dev) {
                    entry.unshift(`webpack-dev-server/client?http://localhost:${config.getPort()}`, 'webpack/hot/dev-server');
                }
            } else if (type === '[object Array]') {
                if (dev) {
                    entry.unshift(`webpack-dev-server/client?http://localhost:${config.getPort()}`, 'webpack/hot/dev-server');
                }
            } else {
                for (var key in entry) {
                    entry[key] = this.parseEntry(entry[key], dev);
                }
            }

            return entry;
        } else {
            logger.error('No entry is found!');
        }
    }

    /**
     * merge webpack default config, user's config, and config from package.json
     * @param  {Boolean} isDebug : is debug mode, add dev-sever entry or not
     * @return {[Object]}
     */
    mergeConfig(args, isDebug) {
        var pack_def = require('./pack');
        var packPath = path.join(process.cwd(), 'pack.js');
        var sysCfg = config.loadPackageConfig(args);
        var pack;

        try {
            pack = fs.statSync(packPath);
            pack = require(packPath);
            try {
                pack = pack(path.resolve(__dirname, 'node_modules'));
            } catch ( e ) {
                logger.error(' Error happens in pack.js ');
                logger.error(e);

                process.exit(1);
            }
        } catch ( e ) {}

        if (!pack) {
            logger.info("can't find pack.js, use webpack config from package.json or default.");
            var conf = sysCfg.webpack;
            pack = {
                entry: conf.entry || 'main',
                plugins: conf.plugins,
                devServer: conf.devServer,
                resolve: conf.resolve,
                output: {
                    publicPath: conf.publicPath
                }
            }
        }

        if (!pack) {
            return pack_def;
        } else {
            var pack_config = pack;
            if (!pack.entry) {
                pack_config.entry = pack_def.entry;
            }
            pack_config.entry = this.parseEntry(pack_config.entry, isDebug);
            // use kil default webpack config, for build use
            var publicPath = pack_config.output && pack_config.output.publicPath;
            pack_config.output = pack_def.output;
            if (publicPath) {
                pack_config.output.publicPath = publicPath;
            }

            // hash control, add hash when release
            let hash = '';
            if (!isDebug) {
                hash = '.[hash]';
            }
            pack_config.output.filename = `[name]${hash}.js`;
            pack_config.output.chunkFilename = `[id]${hash}.js`;

            if (pack_config.module && pack_config.module.loaders) {
                Array.prototype.push.apply(pack_def.module.loaders, pack_config.module.loaders);
            } else {
                pack_config.module = {};
            }
            pack_config.module.loaders = pack_def.module.loaders;
            pack_config.module.loaders.push({
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loaders: [`babel-loader?${babel(isDebug)}`]
            });

            // config loader for vue
            pack_config.module.loaders.push({
                test: /\.vue$/,
                exclude: /(node_modules|bower_components)/,
                loaders: ['vue-loader']
            });
            pack_config.vue = {
                loaders: {
                    js: `babel-loader?${babel(isDebug)}`,
                }
            };
            if (pack_config.resolve) {
                pack_config.resolve.root = pack_def.resolve.root;
            } else {
                pack_config.resolve = pack_def.resolve;
            }
            pack_config.resolveLoader = pack.resolveLoader || pack_def.resolveLoader;

            if (pack_config.plugins) {
                Array.prototype.push.apply(pack_def.plugins, pack_config.plugins);
            }
            pack_config.plugins = pack_def.plugins;

            if (pack_config.externals) {
                Array.prototype.push.apply(pack_def.externals, pack_config.externals);
            }

            pack_config.externals = pack_def.externals;
            pack_config.postcss = pack_def.postcss;
            if (pack.devServer) {
                pack_config.devServer = pack.devServer;
            }

            return pack_config;
        }
    }

}

module.exports = new Utils();
