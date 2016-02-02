/**
 * load babel loader query string, presets and plugins
 * @type {[type]}
 */
var utils = require('./utils'),
    config = require('./config'),
    conf = config.loadConfig();

var babelQueryStr = {};
babelQueryStr.presets = [require.resolve('babel-preset-es2015')];
babelQueryStr.plugins = [
    [require.resolve('babel-plugin-transform-runtime')]
];
if (conf.react === true) {
    babelQueryStr.presets.push(require.resolve('babel-preset-react'));
    babelQueryStr.plugins.push([require.resolve('babel-plugin-react-transform'), {
        transforms: [{
            transform: 'react-transform-hmr',
            imports: ['react'],
            locals: ['module']
        }],
    }]);
}
babelQueryStr.cacheDirectory = true;

module.exports = JSON.stringify(babelQueryStr);
