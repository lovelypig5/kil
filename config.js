'use strict';
var glob = require('glob');
var path = require('path');
var conf;

class Config {

    loadConfig(args) {
        if (conf) {
            return conf;
        }

        var webpack = require('webpack');
        var HtmlWebpackPlugin = require('html-webpack-plugin');
        conf = require(`${process.cwd()}/package.json`).kil;
        conf.port = conf.port || 9000;
        if (args && args.port) {
            try {
                conf.port = parseInt(args.port);
            } catch (err) {
                console.error('[kil]: error port!');
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
                files.forEach((file) => {
                    let name = './' + file;
                    let entry = path.basename(file, '.html');
                    pack.entry[entry] = './' + file.replace('.html', '');

                    let depends = pack.output[key].map(function(depend) {
                        return depend.replace('[name]', entry);
                    });
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

        console.info('[kil]: config initialized.');

        return conf;
    }

}

module.exports = new Config();
