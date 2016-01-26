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
        devServer: {
            proxy: {
                '/*': {
                    target: 'activity.gongzuojihui.com',
                    secure: false,
                    bypass: function(req, res, proxyOptions) {
                        if (req.headers.accept.indexOf('html') !== -1) {
                            console.log('Skipping proxy for browser request.');
                            return '/index.html';
                        }
                    },
                },
            },
        },
        module: {
            loaders: []
        },
        externals: []
    }

}())