'use strict';

var path = require( 'path' ),
    fs = require( 'fs' ),
    logger = require( './logger' ),
    webpack = require( 'webpack' ),
    ExtractTextPlugin = require( 'extract-text-webpack-plugin' ),
    config = require( './config' ),
    babel = require( './babel' );

class Utils {

    /**
     * load webpack:
     *     @task dev: add dev-server and enable HMR, according to mock config, enable mock
     *     @task release: add uglifyjs
     * @return config
     */
    loadWebpackCfg( target, args ) {
        var pack_config,
            babelQueryStr,
            entryPath,
            isDebug,
            node_env = '"development"';

        switch ( target ) {
            case 'dev':
                isDebug = true;
                pack_config = this.mergeConfig( args, isDebug );
                pack_config.devtool = '#eval';

                // config css and less loader
                pack_config.module.rules.push( {
                    test: /\.css$/,
                    use: [ {
                        loader: "style-loader"
                    }, {
                        loader: "css-loader",
                        options: {
                            sourceMap: true
                        }
                    } ]
                } );
                pack_config.module.rules.push( {
                    test: /\.less$/,
                    exclude: /(node_modules|bower_components)/,
                    loaders: [ {
                        loader: "style-loader"
                    }, {
                        loader: "css-loader",
                        options: {
                            sourceMap: true
                        }
                    }, {
                        loader: "less-loader",
                        options: {
                            sourceMap: true
                        }
                    } ]
                } );

                // add hot module replace plugin
                pack_config.plugins.push( new webpack.HotModuleReplacementPlugin() );
                pack_config.output.publicPath = `http://localhost:${config.getPort()}/`;

                break;
            case 'release':
                isDebug = false;
                node_env = '"production"';
                if ( args.mock ) {
                    args.sourcemap = "";
                }
                pack_config = this.mergeConfig( args );

                var sourcemap = !!args.sourcemap ? "?source-map" : "";
                if ( sourcemap ) {
                    pack_config.devtool = '#source-map';
                } else {
                    pack_config.devtool = '#eval';
                }

                // hash control, add hash when release
                let hash = '';
                if ( !isDebug && args.hash ) {
                    hash = '.[chunkhash]';
                }

                pack_config.module.rules.push( {
                    test: /\.css$/,
                    use: ExtractTextPlugin.extract( {
                        fallback: "style-loader",
                        use: [ {
                            loader: "css-loader",
                            options: {
                                sourcemap: sourcemap
                            }
                        }, {
                            loader: "postcss-loader",
                            options: {
                                plugins: function() {
                                    return [
                                        require( 'autoprefixer' )
                                    ];
                                }
                            }
                        } ]
                    } )
                } );
                pack_config.module.rules.push( {
                    test: /\.less$/,
                    exclude: /(node_modules|bower_components)/,
                    use: ExtractTextPlugin.extract( {
                        fallback: "style-loader",
                        use: [ {
                            loader: "css-loader",
                            options: {
                                sourcemap: sourcemap
                            }
                        }, {
                            loader: "postcss-loader",
                            options: {
                                plugins: function() {
                                    return [
                                        require( 'autoprefixer' )
                                    ];
                                }
                            }
                        }, {
                            loader: "less-loader",
                            options: {
                                sourcemap: sourcemap
                            }
                        } ]
                    } )
                } );

                pack_config.plugins.push( new ExtractTextPlugin( {
                    filename: `[name]${hash}.css`
                } ) );
                if ( args.uglify ) {
                    pack_config.plugins.push( new webpack.optimize.UglifyJsPlugin( {
                        compress: {
                            warnings: false
                        },
                        sourceMap: !!args.sourcemap
                    } ) );
                }

                break;
            default:
                break;
        }

        if ( args.mock === true ) {
            babelQueryStr = babel( isDebug );
            entryPath = [];
            for ( let key in pack_config.entry ) {
                let entry = pack_config.entry[ key ];
                let type = Object.prototype.toString.call( entry );
                if ( type === '[object String]' ) {
                    entryPath.push( path.resolve( process.cwd(), entry + '.js' ) );
                } else if ( type === '[object Array]' ) {
                    entryPath.push( path.resolve( process.cwd(), entry[ entry.length - 1 ] + '.js' ) );
                }
            }

            let mockPath = path.resolve( process.cwd(), 'mock/mock.js' );
            //load mock.js before all
            pack_config.module.rules.push( {
                test: entryPath,
                exclude: /(node_modules|bower_components)/,
                loaders: [ `imports-loader?Mock=${mockPath}`, `babel-loader?${babelQueryStr}` ]
            } );
        }

        // add variables define
        pack_config.plugins.push( new webpack.DefinePlugin( {
            WEBPACK_DEBUG: isDebug,
            'process.env': {
                NODE_ENV: node_env
            }
        } ) );

        logger.debug( `kil ${target} with webpack config: ` );
        logger.debug( pack_config );

        return pack_config;
    }

    /**
     * parse entry
     * @param  {[string]} dev:
     *     dev: add dev server and HMR entries
     *     release: do nothing with enties expcet convert string to array
     * @return {[type]}
     */
    parseEntry( entry, dev, depth ) {
        if ( entry ) {
            var type = Object.prototype.toString.call( entry );
            if ( type === '[object String]' ) {
                entry = [ entry ];
                if ( dev ) {
                    entry.unshift( `webpack-dev-server/client?http://localhost:${config.getPort()}`,
                        'webpack/hot/dev-server' );
                }
            } else if ( type === '[object Array]' ) {
                if ( dev ) {
                    entry.unshift( `webpack-dev-server/client?http://localhost:${config.getPort()}`,
                        'webpack/hot/dev-server' );
                }
            } else {
                for ( var key in entry ) {
                    entry[ key ] = this.parseEntry( entry[ key ], dev );
                }
            }

            return entry;
        } else {
            logger.error( 'No entry is found!' );
        }
    }

    /**
     * merge webpack default config, user's config, and config from package.json
     * @param {Boolean} isDebug : is debug mode, add dev-sever entry or not
     * @param {Object} args
     * @return
     */
    mergeConfig( args, isDebug ) {
        var pack_def = require( './pack' );
        var packPath = path.join( process.cwd(), 'webpack.config.js' );
        var sysCfg = config.init( args );
        var pack;

        try {
            pack = fs.statSync( packPath );
            pack = require( packPath );
            try {
                pack = pack( path.resolve( __dirname, 'node_modules' ) );
            } catch ( e ) {
                logger.error( ' Error happens in webpack.config.js ' );
                logger.error( e );

                process.exit( 1 );
            }
        } catch ( e ) {
            try {
                packPath = path.join( process.cwd(), 'pack.js' );
                pack = fs.statSync( packPath );
                pack = require( packPath );
                logger.warn( "find pack.js, please change pack.js to webpack.config.js" );

                try {
                    pack = pack( path.resolve( __dirname, 'node_modules' ) );
                } catch ( e ) {
                    logger.error( ' Error happens in pack.js ' );
                    logger.error( e );

                    process.exit( 1 );
                }
            } catch ( err ) {
                logger.info( "can't find webpack.config.js, use webpack config from package.json or default." );
            }
        }

        if ( !pack ) {
            var conf = sysCfg.webpack;
            pack = {
                entry: conf.entry || 'main',
                plugins: conf.plugins,
                devServer: conf.devServer,
                resolve: conf.resolve,
                output: {
                    publicPath: conf.publicPath
                }
            };
        }

        if ( !pack ) {
            return pack_def;
        } else {
            var pack_config = pack;
            if ( !pack.entry ) {
                pack_config.entry = pack_def.entry;
            }
            pack_config.entry = this.parseEntry( pack_config.entry, isDebug );
            // use kil default webpack config, for build use
            var publicPath = pack_config.output && pack_config.output.publicPath;
            pack_config.output = pack_def.output;
            if ( publicPath ) {
                pack_config.output.publicPath = publicPath;
            }

            // hash control, add hash when release
            let hash = '';
            if ( !isDebug && args.hash ) {
                hash = '.[chunkhash]';
            }
            pack_config.output.filename = `[name]${hash}.js`;
            pack_config.output.chunkFilename = `[id]${hash}.js`;

            if ( pack_config.module && pack_config.module.rules ) {
                Array.prototype.push.apply( pack_def.module.rules, pack_config.module.rules );
            } else {
                pack_config.module = {};
            }
            pack_config.module.rules = pack_def.module.rules;
            pack_config.module.rules.push( {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: `babel-loader?${babel(isDebug)}`
            } );

            if ( pack_config.resolve ) {
                pack_config.resolve.modules = pack_def.resolve.modules;
            } else {
                pack_config.resolve = pack_def.resolve;
            }
            pack_config.resolveLoader = pack.resolveLoader || pack_def.resolveLoader;

            if ( pack_config.plugins ) {
                Array.prototype.push.apply( pack_def.plugins, pack_config.plugins );
            }
            pack_config.plugins = pack_def.plugins;
            let loaderOptions = {
                debug: false,
                options: {
                    context: __dirname
                },
                minimize: true
            };
            if ( sysCfg.vue ) {
                // config loader for vue
                pack_config.module.rules.push( {
                    test: /\.vue$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: 'vue-loader',
                    options: {
                        loaders: {
                            js: `babel-loader?${babel(isDebug)}`
                        }
                    }
                } );
            }

            if ( sysCfg.jshint ) {
                pack_config.module.rules.push( {
                    test: /\.jsx?$/,
                    enforce: "pre",
                    exclude: /(node_modules|bower_components)/,
                    loader: "jshint-loader"
                } );
            }

            pack_config.plugins.push( new webpack.LoaderOptionsPlugin( loaderOptions ) );

            if ( pack_config.externals ) {
                Array.prototype.push.apply( pack_def.externals, pack_config.externals );
            }

            pack_config.externals = pack_def.externals;
            if ( pack.devServer ) {
                pack_config.devServer = pack.devServer;
            }

            return pack_config;
        }
    }

}

module.exports = new Utils();
