/**
 * load babel loader query string, presets and plugins
 * @type {[type]}
 */

module.exports = (isDebug) => {
    var config = require('./config'),
        conf = config.getConfig();

    var babelQueryStr = {};
    babelQueryStr.presets = [require.resolve('babel-preset-es2015')];
    babelQueryStr.plugins = [
        [require.resolve('babel-plugin-transform-runtime')]
    ];
    if (conf.react === true) {
        babelQueryStr.presets.push(require.resolve('babel-preset-react'));
        if (isDebug) {
            babelQueryStr.plugins.push([require.resolve('babel-plugin-react-transform'), {
                transforms: [{
                    transform: 'react-transform-hmr',
                    imports: ['react'],
                    locals: ['module']
                }]
            }]);
        }
    }
    babelQueryStr.cacheDirectory = true;

    return JSON.stringify(babelQueryStr);
};
