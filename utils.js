'use strict';

var path = require('path');
var config = require('./config');
var babel = require('./babel');
var logger = require('./logger');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

class Utils {

    /**
     * load webpack:
     *     @task dev: add dev-server and enable HMR, according to mock config, enable mock
     *     @task release: add uglifyjs
     * @return config
     */
    loadWebpack(target) {
        var webpack = require('webpack');
        var conf = config.getConfig();

        switch (target) {
            case 'dev':
                var pack_config = this.mergeConfig(true);
                pack_config.devtool = 'eval';

                if (conf.mock === true) {
                    var babelQueryStr = babel(true);
                    var entryPath = [];
                    if (conf.webpack && conf.webpack.entry) {
                        for (var entry in conf.webpack.entry) {
                            entryPath.push(path.resolve(process.cwd(), entry + '.js'));
                        }
                    }

                    //load mock.js before all
                    pack_config.module.loaders.push({
                        test: new RegExp(entryPath.join('|')),
                        exclude: /(node_modules|bower_components)/,
                        loaders: [`imports?Mock=${process.cwd()}/mock/mock.js`, `babel?${babelQueryStr}`]
                    });
                }

                // add plugin
                pack_config.plugins.push(new webpack.HotModuleReplacementPlugin());

                logger.debug('dev server start with webpack config: ');
                logger.debug(pack_config);

                return pack_config;
            case 'release':
                var pack_config = this.mergeConfig();
                // source map for production
                pack_config.devtool = '#eval';

                pack_config.plugins.push(new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: false
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
     * @param  {Boolean} isDebug : is debug mode, add dev-sever or not
     * @return {[Object]}
     */
    mergeConfig(isDebug) {
        var pack_def = require('./pack');
        var pack = this.mergePackageJson();

        if (!pack) {
            return pack_def;
        } else {
            var pack_config = pack;
            if (!pack.entry) {
                pack_config.entry = pack_def.entry;
            }
            pack_config.entry = this.parseEntry(pack_config.entry, isDebug);
            // use kil default webpack config, for build use
            pack_config.output = pack_def.output;
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
                loaders: [`babel?${babel(isDebug)}`]
            });

            // config loader for vue
            pack_config.module.loaders.push({
                test: /\.vue$/,
                exclude: /(node_modules|bower_components)/,
                loaders: ['vue']
            });
            pack_config.vue = {
                loaders: {
                    js: `babel?${babel(isDebug)}`,
                }
            };

            if (isDebug) {
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
            } else {
                pack_config.module.loaders.push({
                    test: /\.css$/,
                    loader: ExtractTextPlugin.extract('style', 'css!postcss')
                });
                pack_config.module.loaders.push({
                    test: /\.less$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: ExtractTextPlugin.extract('style', 'css!postcss!less')
                });

                pack_config.plugins.push(new ExtractTextPlugin(`[name].[hash].css`));
            }

            pack_config.resolve = pack.resolve || pack_def.resolve;
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

            return pack_config;
        }
    }

    /**
     * if pack.js not exist, read config from package.json
     * @return {[Object]}  : config json
     */
    mergePackageJson() {
        var pack;
        try {
            pack = require(`${process.cwd()}/pack`);
        } catch (e) {
            logger.warn('error happen in pack.js, %s', e.message);
            logger.warn("can't find pack.js, use webpack config from package.json or default.");
        }

        if (!pack) {
            var conf = config.getConfig().webpack;
            pack = {
                entry: conf.entry || 'main',
                plugins: conf.plugins
            }
        }

        return pack;
    }

}

module.exports = new Utils();
