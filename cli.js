#!/usr/bin/env node

require('colorful').colorful();
var program = require('commander');
var task = require('./task');

program
    .version(require('./package').version, '-v, --version')
    .usage('<command> [options]')
    .option('-p, --port <port>', 'port')
    .on('--help', task.help)
    .on('--h', task.help)
    .parse(process.argv);

var subcmd = program.args[0];
var args = {
    port: program.port
};

const cmds = ['init', 'dev', 'release', 'test', 'help', 'clean'];
const aliases = {
    "b": "release",
    "build": "release",
    "d": "dev"
}

if (aliases[subcmd]) {
    subcmd = aliases[subcmd];
}

if (!subcmd || subcmd === 'help') {
    task.help();
} else {
    if (cmds.indexOf(subcmd) != -1) {
        task[subcmd](args);
    } else {
        task.help();
    }
}
