#!/usr/bin/env node

require('colorful').colorful();

var program = require('commander');
var task = require('../task');
var logger = require('../logger');

program
    .usage('[options]')
    .option('-p, --port', 'specify the port when dev server run')
    .on('-h', printHelp)
    .on('--help', printHelp)
    .parse(process.argv);

function printHelp() {
    console.log('  Examples:'.to.bold.blue.color);
    console.log();
    console.log('    kil dev -p 9001    ');
    console.log();
}

var args = {
    port: program.args[0]
}

logger.debug("kil dev with options: ");
logger.debug(args);

task.dev(args);
