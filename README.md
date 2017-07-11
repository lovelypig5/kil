[![Build Status](https://travis-ci.org/lovelypig5/kil.svg?branch=master)](https://travis-ci.org/lovelypig5/kil)
# kil
kil is a tool based on nodejs and webpack, it helps improve the develop, test and release on web apps.

# 2.0.2
Add typescript support

# 2.0
kil 2.0 is now ready for webpack 2.x. for old versions, please see [branch 1.x](https://github.com/lovelypig5/kil/tree/1.x).
support long-term caching see [Caching](https://webpack.js.org/guides/caching/)

# Install
*  install nodejs. see more [nodejs](https://nodejs.org)
*  ~~git clone [kil](https://github.com/lovelypig5/kil.git) to your local workspace~~

```node
npm install -g kil (默认有国外代理情况下)
npm install -g kil  --phantomjs_cdnurl=http://cnpmjs.org/downloads --registry=https://registry.npm.taobao.org (推荐从淘宝源安装)
```

# Usage
  support init, develop, test, mock data and release cmds

### init
```javascript
    kil init          // init a project with default
    kil init -h       // get init help
    kil init -m       // init mock module, this module will only work on development
    kil init -t       // init test module, this module won't be built into bundle on release
```
init the project with kil:
kil will init package.json. install npm dependencies and create js, css, img, less, test folders with default index.js and index.html asynchronized

### dev
```javascript
    kil dev
    kil dev -p 9001    // specify the port of dev server
    kil dev -m         // dev with mock module
```
after project init, kil dev helps open the [webpack-dev-server](https://webpack.github.io/docs/webpack-dev-server.html).
support livereload, less compile, [data mock](https://github.com/nuysoft/Mock), [hot-module-replace](https://webpack.github.io/docs/hot-module-replacement.html), es6 is default support by [babel](https://babeljs.io/).

### test
```javascript
    kil test                   // default run karma once and test with mocha framework
    kil test -M | --no-mocha   // disable mocha
    kil test -p                // enable phantomjs
    kil test -s                // run karma as a server, CI unit tests
```
test is default support by phantomjs and mocha, [mocha](https://mochajs.org/) for unit tests and [phantomjs](http://phantomjs.org/) for page automation tests.
reports will be export at reports folder at your workspace

### build
```javascript
    kil build
    kil build -s      // generate source map
    kil build -C      // build without clean
    kil build -m      // build with mock data, this option will disable sourcemap
    kil build -J      // build without jshint
```
<h4>now build will execute jshint by default.</h4>
minify your js, less to target js and css to dist folder.

### release
```javascript
    kil release
    kil release -s      // generate source map
    kil release -C      // release without clean
```
minify your js, less to target js and css. package to a zip file for production.

### help
show usage and help information

#Configuration
kil accept two kinds of configuration, a key kil in package.json or a separate pack.js. pack.js is prior to package.json
<h4><font color="red" size="">important:</font> if you want enable react, mock or copy files, package.json should be configured.</h4>

#Global Value
when server start with kil dev
```javascript
    var WEBPACK_DEBUG = true;
    var process.env = 'development';
```
otherwise
```javascript
    var WEBPACK_DEBUG = false;
    var process.env = 'production';
```

* package.json
* <font color="red" size="">deprecated:</font> ~~"mock": true,~~ is removed from package.jsom after version 1.0.5, please use ``` kil dev -m``` instead
* add ``` vue: false ``` for default
```javascript
    {
        "kil": {
            "port": 9000,          // port of dev server
            "react": true,         // enable react support
            "vue": false,
            "html5Mode": false,    // enable html5 history api of dev server
            "es7": false,          // support es7 async, object-rest-spread, flow-strip-types
            "copy": ["img/*"],
            "webpack": {
                "publicPath": "/", // location of files serve at your server: localhost:8080/
                "output": {
                    "page/*.html": {
                        "jsname": "page/index2",
                        "commons": ["common"]
                    },
                    "*.html": {
                        "commons": ["common"]
                    }
                },
                "commonTrunk": {
                    "common": ["jquery", "react", "react-dom"]
                },
                "global": {
                    "React": "react",
                    "ReactDOM": "react-dom",
                    "$": "jquery"
                },
                "resolve": {
                    "alias": {
                        "spm-hammer": "hammerjs"
                    }
                },
                "devServer": {
                    "proxy": {
                        "*": "http://localhost:3001"
                    }
                }
            }
        }
    }
```

* pack.js

```javascript
    /**
     * modulePath is the location of kil node_modules
     */
    module.exports = (modulePath) => {

        var path = require('path');
        // var webpack = require(`${modulePath}/webpack`);
        // var HtmlWebpackPlugin = require(`${modulePath}/html-webpack-plugin`);
        // var WebpackChunkHash = require(`${modulePath}/webpack-chunk-hash`);
        /* extract the manifest to a separate JSON file */
        // var ChunkManifestPlugin = require(`${modulePath}/chunk-manifest-webpack-plugin`);
        /* inject manifest.json to index.html */
        // var InlineChunkManifestHtmlWebpackPlugin = require(`${modulePath}/inline-chunk-manifest-html-webpack-plugin`);

        return {
            // if single entry is used, bundle name will be named as main.js
            entry: {
                main: "./index",
                // common: ['jquery']
            },
            // plugins example, default no more
            plugins: [
                // new webpack.ProvidePlugin({
                //     $: "jquery",
                //     jQuery: "jquery"
                // }),
                // new HtmlWebpackPlugin({
                //     template: './index.html',
                //     filename: './index.html',
                //     chunks: ['main', 'common']
                // }),
                // new webpack.optimize.CommonsChunkPlugin({
                //     name: "common"
                // })
                /*** THIS IS SECTION FOR LONG-TERM CACHING ***/
                //new HtmlWebpackPlugin({
                //     template: './index.html',
                //     filename: './index.html',
                //     chunks: ['manifest', 'main', 'common']
                // }),
                // new webpack.optimize.CommonsChunkPlugin({
                //     name: ["common", "manifest"]
                // }),
                // new webpack.HashedModuleIdsPlugin(),
                // new WebpackChunkHash(),
                // new ChunkManifestPlugin(),
                // new InlineChunkManifestHtmlWebpackPlugin()
                /*** THIS IS SECTION FOR LONG-TERM CACHING ***/
            ],
            module: {
                rules: []
            },
            externals: [],
            devServer: {
                // proxy: {
                //     '*': 'http://localhost:3000'
                // }
            }
        }
    }
```

* index.ejs
```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="description" content="warehouse management, taobao">
    <meta name="author" content="out2man">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>EXAMPLE</title>
    <%=htmlWebpackPlugin.files.webpackManifest%>
</head>

<body>
    <app></app>
</body>
</html>
```

* proxy

  see [node-proxy](https://github.com/nodejitsu/node-http-proxy#options) for more options

```javascript
  devServer: {
     proxy: {
         '*': {
            "target":"http://localhost:3000",
            "toProxy":true,
            // more see option
        }
     }
  }
```

# TODO
* test case

# Author
* [out2man](http:/www.out2man.com)

# Dependencies
* [webpack](https://webpack.js.org/)
* [webpack-dev-server](https://webpack.js.org/configuration/dev-server/)
* [babel](https://babeljs.io/)
* [less](http://lesscss.org/)
* [mustache](https://mustache.github.io/)
* [autoprefixer](https://github.com/postcss/autoprefixer)
* [postcss-loader](https://github.com/postcss/postcss-loader)
* [url-loader](https://webpack.js.org/loaders/url-loader/)
* [less-loader](https://webpack.js.org/loaders/less-loader/)
* [css-loader](https://webpack.js.org/loaders/css-loader/)
* [style-loader](https://webpack.js.org/loaders/style-loader/)
* [exports-loader](https://webpack.js.org/loaders/exports-loader/)
* [ejs-loader](https://github.com/okonet/ejs-loader)
* [expose-loader](https://webpack.js.org/loaders/expose-loader/)
* [file-loader](https://webpack.js.org/loaders/file-loader/)
* [html-loader](https://webpack.js.org/loaders/html-loader/)
* [img-loader](https://github.com/thetalecrafter/img-loader)
* [imports-loader](https://webpack.js.org/loaders/imports-loader/)
* [mustache-loader](https://github.com/deepsweet/mustache-loader)
* [template-html-loader](https://github.com/jtangelder/template-html-loader)
* [extract-text-webpack-plugin](https://webpack.js.org/plugins/extract-text-webpack-plugin/)
* [html-webpack-plugin](https://webpack.js.org/plugins/html-webpack-plugin/)
* [chunk-manifest-webpack-plugin](https://github.com/soundcloud/chunk-manifest-webpack-plugin)
* [inline-chunk-manifest-html-webpack-plugin](https://github.com/jouni-kantola/inline-chunk-manifest-html-webpack-plugin)

# See also
* [webpack](https://webpack.github.io/)
* [mocha](https://mochajs.org/)
* [phantomjs](http://phantomjs.org/)
* [nodejs](https://nodejs.org)
