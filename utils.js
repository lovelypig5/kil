'use strict';

var path = require('path');
var config = require("./config");
var babel = require('./babel');

class Utils {

    /**
     * load webpack:
     *     @task dev: add dev-server and enable HMR, according to mock config, enable mock
     *     @task release: add uglifyjs
     * @return config
     */
    loadWebpack(target) {
        var webpack = require('webpack');
        var conf = config.loadConfig();

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
                        loaders: ['imports?Mock=./mock/mock.js', `babel?${babelQueryStr}`]
                    });
                }

                // add plugin
                pack_config.plugins.push(new webpack.HotModuleReplacementPlugin());

                return pack_config;
            case 'release':
                var ExtractTextPlugin = require(`extract-text-webpack-plugin`);
                var pack_config = this.mergeConfig();
                // source map for production
                pack_config.devtool = 'source-map';
                pack_config.module.loaders.forEach((loader) => {
                    if (loader.test.test('*.less')) {
                        loader.loader = ExtractTextPlugin.extract("style", "css?source-map!postcss!less");
                    }
                })
                pack_config.plugins.push(new webpack.optimize.UglifyJsPlugin());
                pack_config.plugins.push(new ExtractTextPlugin('[name].[hash].css'));

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
        var conf = config.loadConfig();
        if (entry) {
            var type = Object.prototype.toString.call(entry);
            if (type === '[object String]') {
                entry = [entry];
                if (dev) {
                    entry.unshift(`webpack-dev-server/client?http://localhost:${conf.port}`, 'webpack/hot/dev-server');
                }
            } else if (type === '[object Array]') {
                if (dev) {
                    entry.unshift(`webpack-dev-server/client?http://localhost:${conf.port}`, 'webpack/hot/dev-server');
                }
            } else {
                for (var key in entry) {
                    entry[key] = this.parseEntry(entry[key], dev);
                }
            }

            return entry;
        } else {
            console.error('[kil]: No entry is found!'.to.bold.red.color);
        }
    }

    /**
     * merge webpack default config, user's config, and config from package.json
     * @param  {Boolean} isDebug : is debug mode, add dev-sever or not
     * @return {[Object]}
     */
    mergeConfig(isDebug) {
        var pack_def = require('./pack');
        var pack = this.mergeJsonConfig();

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
    mergeJsonConfig() {
        var pack;
        try {
            pack = require(`${process.cwd()}/pack`);
        } catch (e) {
            console.info('Error: %s'.to.bold.blue.color, e.message);
            console.info('Info: use default pack.js provided by kil.'.to.bold.blue.color);
        }

        if (!pack) {
            var conf = config.loadConfig().webpack;
            pack = {
                entry: conf.entry || 'main',
                plugins: conf.plugins
            }
        }

        return pack;
    }

}

module.exports = new Utils();
