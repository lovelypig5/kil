module.exports = ( modulePath ) => {

    var path = require( 'path' );
    // const webpack = require(`${modulePath}/webpack`);
    // const HtmlWebpackPlugin = require(`${modulePath}/html-webpack-plugin`);

    return {
        // if single entry is used, bundle name will be named as main.js
        entry: {
            main: "./index",
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
            //     chunks: ['runtime', 'main', 'common']
            // }),
            // new webpack.optimize.CommonsChunkPlugin({
            //     name: ["common", "runtime"]
            // }),
            // new webpack.HashedModuleIdsPlugin()
        ],
        module: {
            rules: []
        },
        externals: [],
        devServer: {
            // proxy: {
            //     '*': 'http://localhost:3000'
            // }
        }
    };
};
