# kil
kil is a tool based on nodejs, it helps improve the develop, test and release on web apps.

# Install
*  install nodejs. see more [nodejs](https://nodejs.org)
*  git clone [kil](https://github.com/lovelypig5/kil.git) to your local workspace
*  run install.sh kil use "source / ." , otherwise you need source file manually
```bash
source ${workspace}/kil/install.sh
```

Then kil is installed in your pc succeccfully.

# Usage
  support init, develop, test, mock data and release cmds

###init
```javascript
    kil init
```
init the project with kil:
kil will init package.json. install npm dependencies and create js, css, img, less, test folders with default index.js and index.html asynchronized

###dev
```javascript
    kil dev
```
after project init, kil dev helps open the [webpack-dev-server](https://webpack.github.io/docs/webpack-dev-server.html).
support livereload, less compile, [data mock](https://github.com/nuysoft/Mock), [hot-module-replace](https://webpack.github.io/docs/hot-module-replacement.html), es6 is default support by [babel](https://babeljs.io/).

###test
```javascript
    kil test
```
test is default support by phantomjs and mocha, [mocha](https://mochajs.org/) for unit tests and [phantomjs](http://phantomjs.org/) for page automation tests.
reports will be export at reports folder at your workspace

###release
```javascript
    kil release
```
minify your js, less to target js and css. package to a zip file for production.

###help
show usage and help information

#Configuration
kil accept two kinds of configuration, a key kil in package.json or a separate pack.js. pack.js is prior to package.json

* package.json

```json
    {
        "kil": {
            "port": 9000,
            "mock": true,
            "react": true,
            "webpack": {
                "output": {
                    "page/*.html": [
                        "[name]", "common"
                    ],
                    "*.html": [
                        "[name]", "common"
                    ]
                },
                "commonTrunk": {
                    "common": ["jquery", "react", "react-dom"]
                },
                "global": {
                    "React": "react",
                    "ReactDOM": "react-dom",
                    "$": "jquery"
                }
            }
        }
    }
```

* pack.js

```javascript

    var path = require('path');
    // var webpack = require(path.resolve(process.env.KIL_HOME, 'node_modules', 'webpack'));
    // var HtmlWebpackPlugin = require(path.resolve(process.env.KIL_HOME, 'node_modules', 'html-webpack-plugin'));

    module.exports = {
        // if single entry is used, bundle name will be named as main.js
        entry: {
            index: "./index",
            index2: "./page/index2",
            common: ['jquery', 'react', 'react-dom']
        },
        // plugins example, default no more
        plugins: [
            new HtmlWebpackPlugin({
                template: './index.html',
                filename: 'index.html',
                chunks: ['index', 'common']
            }),
            new webpack.ProvidePlugin({
                React: 'react',
                ReactDOM: 'react-dom',
                $: 'jquery'
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: "common"
            })
        ],
        module: {
            loaders: []
        },
        externals: []
    }

```

# Author
[out2man](http:/www.out2man.com)

# See also
* [webpack](https://webpack.github.io/)
* [mocha](https://mochajs.org/)
* [phantomjs](http://phantomjs.org/)
* [nodejs](https://nodejs.org)