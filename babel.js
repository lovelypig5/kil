/**
 * load babel loader query string, presets and plugins
 * @type {[type]}
 */
const logger = require('./logger');

module.exports = (isDebug) => {
    var config = require('./config'),
        conf = config.getConfig();

    var babelQueryStr = {};
    babelQueryStr.presets = [require.resolve('babel-preset-env')];
    babelQueryStr.plugins = [
        require.resolve('babel-plugin-transform-runtime')
    ];
    if (conf.es7 === true) {
        babelQueryStr.plugins.push([require.resolve('babel-plugin-transform-async-to-generator')]);
        babelQueryStr.plugins.push([require.resolve('babel-plugin-transform-flow-strip-types')]);
        babelQueryStr.plugins.push([require.resolve('babel-plugin-transform-object-rest-spread')]);
    }

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

    logger.debug('babel query string:');
    logger.debug(babelQueryStr);

    return JSON.stringify(babelQueryStr);
};
