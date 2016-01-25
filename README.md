# kil
kil is a tool based on nodejs, it helps improve the develop, test and release

# Install
*  install nodejs. see more [nodejs](https://nodejs.org)
*  git clone [kil](https://github.com/lovelypig5/kil.git) to your local workspace
*  install kil use source/. shell cmd, otherwise you need source file manually
```bash
. ${workspace}/kil/install.sh
```

Then kil is installed in your pc succeccfully.

# Usage
* init
init the project with kil:
    kil will init package.json. install npm dependencies and create js, css, img, less, test folders with default index.js and index.html asynchronized
* dev
after project init, kil dev helps open the [webpack-dev-server](https://webpack.github.io/docs/webpack-dev-server.html).
support livereload, less compile, [data mock](https://github.com/nuysoft/Mock), [hot-module-replace](https://webpack.github.io/docs/hot-module-replacement.html), es6 is default support by [babel](https://babeljs.io/).
* test
test is default support by phantomjs and [mocha](https://mochajs.org/), mocha for unit tests and [phantomjs](http://phantomjs.org/) for page automation tests.
reports will be export at reports folder at your workspace
* release
minify your js, less to target js and css. package to a zip file for production.

# Author
[out2man](http:/www.out2man.com)

# See also
* [webpack](https://webpack.github.io/)
* [mocha](https://mochajs.org/)
* [phantomjs](http://phantomjs.org/)
* [nodejs](https://nodejs.org)