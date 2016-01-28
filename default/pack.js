(() => {
    var path = require('path');
    var webpack = require(path.resolve(process.env.KIL_HOME, 'node_modules', 'webpack'));

    module.exports = {
        // if single entry is used, bundle name will be named as main.js
        entry: "./index",
        // plugins example, default no more
        plugins: [
            // new webpack.ProvidePlugin({
            //     $: "jquery",
            //     jQuery: "jquery"
            // })
        ],
        module: {
            loaders: []
        },
        externals: []
    }

}())
