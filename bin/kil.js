#!/usr/bin/env node

"use strict";

require('colorful').colorful();

var program = require('commander');
var fs = require('fs');
var logger = require('../logger');
var path = require('path');
var spawn = require('cross-spawn');

program
    .version(require('../package').version, '-v, --version')
    .usage('<command> [options]')
    .on('--help', printHelp)
    .on('--h', printHelp)
    .parse(process.argv);

var subcmd = program.args[0];
var args = (process.argv).slice(3);

const aliases = {
    "b": "build",
    "d": "dev",
    "i": "init",
    "c": "clean",
    "r": "release"
};

if (aliases[subcmd]) {
    subcmd = aliases[subcmd];
}

if (!subcmd || subcmd === 'help') {
    program.help();
} else {
    execTask(subcmd);
}

function printHelp() {
    console.log('  Package Commands:'.to.bold.green.color);
    console.log();
    console.log('    init           initialize a project');
    console.log('    dev            develop with a dev server');
    console.log('    test           test a project');
    console.log('    build          build a package');
    console.log('    release        build a package');
    console.log('    doc            document manager');
    console.log();
}

function execTask(cmd) {
    var file = path.join(__dirname, `/kil-${cmd}.js`);
    fs.stat(file, (err) => {
        if (err) {
            logger.error(`kil ${cmd} is not supported!`);
            process.exit(1);
        }

        spawn(file, args, {
            stdio: 'inherit'
        }).on('close', (code) => {
            logger.debug(`kil exit with code ${code}`);
            process.exit(code);
        });
    });
}
