(() => {
    'use strict';

    var path = require('path');
    var HtmlWebpackPlugin = require('html-webpack-plugin');

    /**
     * only given props will be used
     *     entry
     *     output
     *     module: loaders: will be merged with project plugins
     *     resolve
     *     resolveLoader
     *     plugins: will be merged with project plugins
     *     externals
     *     postcss
     */
    module.exports = {
        entry: ['./index'],
        output: {
            path: `${process.cwd()}/dist`
        },
        module: {
            loaders: [
                /**
                 * load js use babel loader
                 * @link:https://github.com/babel/babel-loader
                 * @type {Array}
                 */
                {
                    test: /\.(png|jpe?g|gif|eot|svg|ttf|woff|woff2)$/i,
                    loader: "url?limit=102400&name=[path][name].[ext]"
                }, {
                    test: /\.json$/,
                    loaders: ['json']
                }
            ]
        },
        resolve: {
            root: [
                path.join(__dirname, 'node_modules'),
                path.join(process.cwd(), 'node_modules')
            ]
        },
        resolveLoader: {
            root: [
                path.join(__dirname, 'node_modules'),
                path.join(process.cwd(), 'node_modules')
            ]
        },
        /**
         * plugins to hot reload source file
         * @type {Array}
         */
        plugins: [],
        externals: [],
        postcss: function() {
            return [require('autoprefixer')];
        }
    }

}())
