'use strict';

var path = require('path');
var glob = require('glob');
var logger = require('./logger');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var conf;

const DEFAULT = require('./default/package.default.js');

class Config {

    getPort() {
        if (!conf) {
            throw new Error('configuration is not initialized!');
        }
        return conf.port;
    }

    getConfig() {
        if (!conf) {
            throw new Error('configuration is not initialized!');
        }
        return conf;
    }

    /**
     * load config from package.json if exists, otherwise use default config
     * @param  {[Object]} args : runtime arguments
     * @return {[Object]}
     *         System Config
     */
    loadPackageConfig(args) {
        if (conf) {
            return conf;
        }

        var json = {};
        var source = true;
        try {
            json = require(`${process.cwd()}/package.json`);
        } catch (ex) {
            logger.warn("can't find package.json, init system config with default.");

            source = false;
        }

        if (json.kil) {
            conf = json.kil;
        } else {
            logger.warn("can't find a key named kil in package.json, init system config with default.");
            conf = DEFAULT;
        }
        conf.port = conf.port || DEFAULT.port;
        if (args && args.port) {
            try {
                conf.port = parseInt(args.port);
            } catch (err) {
                logger.warn('ignore passed error port!');
            }
        }
        conf.mock = !!conf.mock;
        conf.react = !!conf.react;

        var pack = conf.webpack;
        pack.entry = {};
        pack.plugins = [];
        // add output
        if (pack.output) {
            for (let key in pack.output) {
                let files = glob.sync(key);
                let resObj = pack.output[key];
                files.forEach((file) => {
                    let entry = file.replace('.html', '');
                    if (resObj && resObj.jsname) {
                        entry = resObj.jsname;
                    }
                    pack.entry[entry] = './' + entry;

                    let name = './' + file;
                    let depends = [];
                    if (resObj && resObj.commons) {
                        Array.prototype.push.apply(depends, resObj.commons);
                    } else {
                        if (pack.commonTrunk) {
                            for (let key in pack.commonTrunk) {
                                depends.push(key);
                            }
                        }
                    }
                    depends.push(file.replace('.html', ''));
                    var plugin_obj = {
                        template: name,
                        filename: file,
                        chunks: depends
                    };

                    pack.plugins.push(new HtmlWebpackPlugin(plugin_obj));
                })
            }
        }

        // add common trunk
        if (pack.commonTrunk) {
            for (let key in pack.commonTrunk) {
                pack.entry[key] = pack.commonTrunk[key];
                pack.plugins.push(new webpack.optimize.CommonsChunkPlugin({
                    name: key
                }))
            }
        }

        if (pack.global) {
            pack.plugins.push(new webpack.ProvidePlugin(pack.global))
        }
        conf.webpack = pack;

        logger.info("try to find pack.js for detail webpack config");

        return conf;
    }

}

module.exports = new Config();
