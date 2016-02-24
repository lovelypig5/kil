#!/usr/bin/env node

require('colorful').colorful();

var program = require('commander');
var task = require('../task');
var logger = require('../logger');
var path = require('path');
var spawn = require('cross-spawn');

program
    .usage('[options]')
    .option('-S, --no-sourcemap', 'disable source map')
    .option('-U, --no-uglify', 'disable uglifyjs.')
    .option('-C, --no-clean', 'disable clean before a new build')
    .on('-h', printHelp)
    .on('--help', printHelp)
    .parse(process.argv);

function printHelp() {
    console.log('  Examples:'.to.bold.green.color);
    console.log();
    console.log('    kil release -S     disable source ');
    console.log();
}

var args = {
    sourcemap: program.sourcemap,
    clean: program.clean,
    uglify: program.uglify
}

logger.debug("kil release with options: ");
logger.debug(args);

if (program.clean) {
    var cleanScript = path.join(__dirname, '/kil-clean.js');
    spawn(cleanScript, {
        stdio: 'inherit'
    }).on('close', (code) => {
        task.release(args);
    });
} else {
    task.release(args);
}
