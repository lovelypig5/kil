(() => {

    var webpack = require('webpack');

    module.exports = {
        // if single entry is used, bundle name will be named as main.js
        entry: "./index",
        // plugins example, default no more
        plugins: [
            // new webpack.ProvidePlugin({
            //     $: "jquery",
            //     jQuery: "jquery"
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