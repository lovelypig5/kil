(() => {
    var path = require('path');
    // var webpack = require(path.resolve(process.env.KIL_HOME, 'node_modules', 'webpack'));
    // var HtmlWebpackPlugin = require(path.resolve(process.env.KIL_HOME, 'node_modules', 'html-webpack-plugin'));

    module.exports = {
        // if single entry is used, bundle name will be named as main.js
        entry: {
            main: "./index"
                // common: ['jquery']
        },
        // plugins example, default no more
        plugins: [
            // new webpack.ProvidePlugin({
            //     $: "jquery",
            //     jQuery: "jquery"
            // }),
            // new HtmlWebpackPlugin({
            //     template: './index.html',
            //     filename: './index.html',
            //     chunks: ['main', 'common']
            // }),
            // new webpack.optimize.CommonsChunkPlugin({
            //     name: "common"
            // })
        ],
        module: {
            loaders: []
        },
        externals: []
    }

}())
