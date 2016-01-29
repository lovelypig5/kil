'use strict';

var path = require('path');

class Utils {

    /**
     * load webpack:
     *     @task dev: add dev-server and enable HMR
     *     @task release: add uglifyjs
     * @return config
     */
    loadWebpack(target) {
        var webpack = require(`webpack`);
        var conf = this.loadConfig();

        var pack_def = require('./pack');
        var pack = {};
        switch (target) {
            case 'dev':
                try {
                    pack = require(`${process.cwd()}/pack`);
                } catch (e) {
                    console.info('Error: %s', e.message);
                    console.info('Info: use default pack.js provided by kil.');
                }

                var pack_config = this.mergeConfig(pack_def, pack, true);
                pack_config.devtool = 'eval';

                if (conf.mock === true) {
                    var babelqrstr = '';
                    if (conf.react === true) {
                        babelqrstr = `presets[]=${require.resolve('babel-preset-react')}&`;
                    }
                    babelqrstr = `${babelqrstr}presets[]=${require.resolve('babel-preset-es2015')}&plugins[]=${require.resolve('babel-plugin-transform-runtime')}&cacheDirectory=true`;

                    //load mock.js before all
                    pack_config.module.loaders.push({
                        test: path.resolve(process.cwd(), './index.js'),
                        exclude: /(node_modules|bower_components)/,
                        loaders: ['imports?Mock=./mock/mock.js', `babel?${babelqrstr}`]
                    });
                }

                // add plugin
                pack_config.plugins.push(new webpack.HotModuleReplacementPlugin());

                return pack_config;
            case 'release':
                try {
                    pack = require(`${process.cwd()}/pack`);
                } catch (e) {
                    console.info('Error: %s', e.message);
                    console.info('Info: use default pack.js provided by kil.');
                }

                var ExtractTextPlugin = require(`extract-text-webpack-plugin`);
                var pack_config = this.mergeConfig(pack_def, pack);
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
    parseEntry(entry, dev) {
        var conf = this.loadConfig();
        if (entry) {
            var type = Object.prototype.toString.call(entry);
            if (type === '[object String]') {
                entry = [entry];
                if (dev) {
                    entry.unshift(`webpack-dev-server/client?http://localhost:${conf.port}`, 'webpack/hot/dev-server');
                }
            } else if (type === '[object Array]') {
                entry.forEach((entryNext, index) => {
                    // handle as ['./main.js']
                    if (Object.prototype.toString.call(entryNext) === '[object String]') {
                        entry = this.parseEntry(entryNext, dev);
                    }
                    // handle as [object1, object2]
                    else {
                        entryNext = this.parseEntry(entryNext, dev);
                    }
                });
            } else {
                //TODO only first of each object will be parsed as entry
                for (var key in entry) {
                    entry[key] = this.parseEntry(entry[key], dev);
                    break;
                }
            }

            return entry;
        } else {
            //TODO are you kiding me? no entry
        }
    }

    /**
     * merge webpack config
     * @param  {[type]}  pack_def : default webpack config
     * @param  {[type]}  pack     : user's webpack config
     * @param  {Boolean} isDebug  : is debug mode, add dev-sever or not
     * @return {[type]}
     */
    mergeConfig(pack_def, pack, isDebug) {
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
            }
            pack_config.module.loaders = pack_def.module.loaders;

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
     * load config for kil
     */
    loadConfig() {
        if (this.conf) {
            return this.conf;
        }

        this.conf = require(`${process.cwd()}/kil.config`);
        this.conf.port = this.conf.port || 9000;
        this.conf.mock = !!this.conf.mock;
        this.conf.react = !!this.conf.react;

        return this.conf;
    }
}

module.exports = new Utils();