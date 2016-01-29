(() => {
    var path = require('path');
    var webpack = require(path.resolve(process.env.KIL_HOME, 'node_modules', 'webpack'));

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
