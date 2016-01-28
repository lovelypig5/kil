(() => {
    'use strict';

    var path = require('path');
    var HtmlWebpackPlugin = require('html-webpack-plugin')

    module.exports = {
        entry: ['./index'],
        output: {
            path: `${process.cwd()}/dist`,
            filename: '[name].[hash].js',
            chunkFilename: '[id].[hash].js'
        },
        module: {
            loaders: [
                /**
                 * load js use babel loader
                 * @link:https://github.com/babel/babel-loader
                 * @type {Array}
                 */
                {
                    test: /\.jsx?$/,
                    exclude: /(node_modules|bower_components)/,
                    loaders: ['babel?presets[]=es2015&plugins[]=transform-runtime']
                }, {
                    test: /\.(woff|woff2)$/,
                    loader: "url-loader?limit=10000&mimetype=application/font-woff"
                }, {
                    test: /\.ttf$/,
                    loader: "file-loader"
                }, {
                    test: /\.eot$/,
                    loader: "file-loader"
                }, {
                    test: /\.svg$/,
                    loader: "file-loader"
                }, {
                    test: /\.css$/,
                    loaders: ['style', 'css?sourceMap']
                }, {
                    test: /\.less$/,
                    loaders: ['style', 'css?sourceMap', 'less?sourceMap']
                }, {
                    test: /\.json$/,
                    loaders: ['json']
                }
            ]
        },
        resolve: {
            root: [
                path.resolve(__dirname, 'node_modules'),
                path.resolve(process.cwd(), 'node_modules')
            ]
        },
        resolveLoader: {
            root: [
                path.resolve(__dirname, 'node_modules'),
                path.resolve(process.cwd(), 'node_modules')
            ]
        },
        /**
         * plugins to hot reload source file
         * @type {Array}
         */
        plugins: [
            new HtmlWebpackPlugin({
                template: './index.html'
            })
        ],
        externals: [
            'style', 'css', 'less', 'imports', 'exports', 'json', 'babel'
        ]
    }

}())
