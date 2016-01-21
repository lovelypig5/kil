(() => {
    'use strict';

    module.exports = {
        entry: ['./main'],
        output: {
            path: `${process.cwd()}/dist`,
            filename: '[name].js',
            chunkFilename: '[id].js'
        },
        module: {
            /**
             * load js use babel loader
             * @link:https://github.com/babel/babel-loader
             * @type {Array}
             */
            loaders: [{
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loaders: ['babel?presets[]=es2015&plugins[]=transform-runtime']
            }, {
                test: /\.css$/,
                exclude: /(node_modules|bower_components)/,
                loaders: ['style', 'css?sourceMap']
            }, {
                test: /\.less$/,
                loaders: ['style', 'css?sourceMap', 'less?sourceMap']
            }, {
                test: /\.json$/,
                loaders: ['json']
            }]
        },
        /**
         * plugins to hot reload source file
         * @type {Array}
         */
        plugins: [],
        externals: [
            'style', 'css', 'less', 'imports', 'exports', 'json', 'babel'
        ]
    }

}())