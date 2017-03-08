var path = require('path'),
    spawn = require('cross-spawn');

var npmRoot = spawn.sync('npm', ['root', '-g']);
var paths = npmRoot.stdout.toString().split(path.sep);
paths.length -= 1;

/**
 * only given props will be used
 *     entry
 *     output
 *     module: loaders: will be merged with project plugins
 *     resolve
 *     resolveLoader
 *     plugins: will be merged with project plugins
 *     externals
 */
module.exports = {
    entry: ['./index'],
    output: {
        path: path.resolve(process.cwd(), 'dist'),
        publicPath: '/dist/'
    },
    module: {
        rules: [{
            test: /\.(eot|svg|ttf|woff|woff2)/i,
            use: [{
                loader: "url-loader",
                options: {
                    limit: 2048,
                    name: "[path][name].[ext]"
                }
            }]
        }, {
            test: /\.(png|jpe?g|gif)$/i,
            use: [{
                loader: "url-loader",
                options: {
                    limit: 8192,
                    name: "[path][name].[ext]"
                }
            }, {
                loader: "img-loader",
                options: {
                    minimize: true,
                    progressive: true
                }
            }]
        }, {
            test: /\.html?$/,
            use: ['html-loader']
        }, {
            test: /\.tpl?$/,
            use: ['ejs-loader']
        }]
    },
    resolve: {
        modules: [
            // project node modules
            path.resolve(process.cwd(), 'node_modules'),
            // kil node modules
            path.resolve(__dirname, 'node_modules'),
            // all global node modules
            path.resolve(paths.join(path.sep), 'node_modules')
        ]
    },
    resolveLoader: {
        modules: [
            path.resolve(process.cwd(), 'node_modules'),
            path.resolve(__dirname, 'node_modules'),
            path.resolve(paths.join(path.sep), 'node_modules')
        ]
    },
    /**
     * plugins to hot reload source file
     * @type {Array}
     */
    plugins: [],
    externals: []
};
