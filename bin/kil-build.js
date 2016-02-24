#!/usr/bin/env node

require('colorful').colorful();

var program = require('commander');
var task = require('../task');
var logger = require('../logger');
var path = require('path');
var spawn = require('cross-spawn');

program
    .usage('[options]')
    .option('-S, --no-sourcemap', 'generate source map')
    .option('-U, --no-uglify', 'generate source map')
    .option('-C, --no-clean', 'disable clean before a new build')
    .on('-h', printHelp)
    .on('--help', printHelp)
    .parse(process.argv);

function printHelp() {
    console.log('  Examples:'.to.bold.green.color);
    console.log();
    console.log('    kil build -s     enable source ');
    console.log();
}

var args = {
    sourcemap: program.sourcemap,
    clean: program.clean,
    uglify: program.uglify
}

logger.debug("kil build with options: ");
logger.debug(args);

if (program.clean) {
    var cleanScript = path.join(__dirname, '/kil-clean.js');
    spawn(cleanScript, {
        stdio: 'inherit'
    }).on('close', (code) => {
        task.build(args);
    });
} else {
    task.build(args);
}
