#!/usr/bin/env node

require('colorful').colorful();

var program = require('commander');
var task = require('../task');
var logger = require('../logger');
var path = require('path');
var spawn = require('child_process').spawn;

program
    .usage('[options]')
    .option('-m, --no-mocha', 'do unit tests with mocha')
    .option('-p, --phantom', 'do endless tests with phantomjs')
    .on('-h', printHelp)
    .on('--help', printHelp)
    .parse(process.argv);

function printHelp() {
    console.log('  Examples:'.to.bold.blue.color);
    console.log();
    console.log('    kil test -m    ');
    console.log('    kil test -p    ');
    console.log();
}

var args = {
    mocha: program.mocha,
    phantom: program.phantom
}
task.test(args);
