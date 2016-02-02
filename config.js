'use strict';
var glob = require("glob");

class Config {

    loadConfig(args) {
        if (this.conf) {
            return this.conf;
        }

        if (args) {
            console.log('[kil]: init with args');
            console.log(args);
        }

        var webpack = require('webpack');
        var HtmlWebpackPlugin = require('html-webpack-plugin');
        this.conf = require(`${process.cwd()}/package.json`).kil;
        this.conf.port = this.conf.port || 9000;
        if (args && args.port) {
            try {
                this.conf.port = parseInt(args.port);
            } catch (err) {
                console.error('[kil]: error port!');
            }
        }
        this.conf.mock = !!this.conf.mock;
        this.conf.react = !!this.conf.react;
        this.conf.files = [];
        this.conf.entry = {};
        this.conf.plugins = [];

        // add output
        if (this.conf.output) {
            for (let key in this.conf.output) {
                let files = glob.sync(key);
                files.forEach((file) => {
                    let name = './' + file;
                    let entry = file.replace('.html', '');
                    this.conf.files.push('./' + file);
                    this.conf.entry[entry] = './' + entry;

                    let depends = this.conf.output[key].map(function(depend) {
                        return depend.replace('[name]', entry);
                    });
                    this.conf.plugins.push(new HtmlWebpackPlugin({
                        template: name,
                        filename: name,
                        chunks: depends
                    }))
                })
            }
        }

        // add common trunk
        if (this.conf.commonTrunk) {
            for (let key in this.conf.commonTrunk) {
                this.conf.entry[key] = this.conf.commonTrunk[key];
                this.conf.plugins.push(new webpack.optimize.CommonsChunkPlugin({
                    name: key
                }))
            }
        }

        if (this.conf.global) {
            this.conf.plugins.push(new webpack.ProvidePlugin(this.conf.global))
        }

        return this.conf;
    }

}

module.exports = new Config();
