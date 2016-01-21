var webpack = require(`webpack`);
var pack_config = require('./kil.pack.js');
delete pack_config.entry;
delete pack_config.output;
// quick source map, dev tool for rebuild performance
pack_config.devtool = 'eval';
// add plugin
pack_config.plugins.push(new webpack.HotModuleReplacementPlugin());

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
        plugins: [
            'karma-webpack',
            'karma-chrome-launcher',
            'karma-phantomjs-launcher',
            'karma-mocha',
            'karma-mocha-reporter',
            'karma-coverage',
        ]

    });
};