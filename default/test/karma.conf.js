var path = require('path');
var webpackPath = 'webpack';
var plugins = ['karma-webpack', 'karma-chrome-launcher', 'karma-phantomjs-launcher', 'karma-mocha', 'karma-mocha-reporter', 'karma-coverage'];
if (process.env.KIL_HOME) {
    webpackPath = path.resolve(process.env.KIL_HOME, 'node_modules', webpackPath);
    plugins = plugins.map(function(plugin) {
        return require(path.resolve(process.env.KIL_HOME, 'node_modules', plugin));
    })
} else {
    plugins = plugins.map(function(plugin) {
        return require(plugin);
    });
}

var webpack = require(webpackPath);
var pack_config = require('../pack');
delete pack_config.entry;
delete pack_config.output;
// quick source map, dev tool for rebuild performance
pack_config.devtool = 'eval';
// add plugin
pack_config.plugins = [new webpack.HotModuleReplacementPlugin()];

module.exports = function(config) {
    config.set({
        frameworks: ['mocha'],
        browsers: ['PhantomJS'],
        reporters: [
            'coverage', 'mocha'
        ],
        coverageReporter: {
            type: 'cobertura',
            dir: '../reports/coverage/'
        },
        files: [
            './mocha/index.test.js'
        ],
        preprocessors: {
            './mocha/index.test.js': ['webpack'],
        },
        webpack: pack_config,
        webpackMiddleware: {
            noInfo: true
        },
        plugins: plugins
    });
};
