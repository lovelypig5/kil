#!/usr/bin/env node

var spawn = require('child_process').spawn;
var logger = require('../logger');

spawn('rm', ['-rf', 'dist'], {
    stdio: 'inherit'
}).on('close', function(code) {
    logger.info('build cleaned, remove dist folder. ');
    process.exit();
})
