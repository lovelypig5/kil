#!/usr/bin/env node

"use strict";

var rimraf = require('rimraf');
var logger = require('../logger');

rimraf('dist', () => {
    logger.info('build cleaned, remove dist folder. ');
});
