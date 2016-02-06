#!/usr/bin/env node

require('colorful').colorful();

var program = require('commander');
var task = require('../task');
var logger = require('../logger');
var path = require('path');
var spawn = require('cross-spawn');

program
    .usage('[options]')
    .option('-M, --no-mocha', 'do unit tests using mocha on karma.')
    .option('-p, --phantom', 'do endless tests with phantomjs.')
    .option('-s, --server', 'run karma as a server.')
    .on('-h', printHelp)
    .on('--help', printHelp)
    .parse(process.argv);

function printHelp() {
    console.log('  Examples:'.to.bold.blue.color);
    console.log();
    console.log('    kil test -M     disable mocha ');
    console.log('    kil test -p     enable phantomjs ');
    console.log();
}

var args = {
    mocha: program.mocha,
    phantom: program.phantom,
    server: program.server
}
task.test(args);
