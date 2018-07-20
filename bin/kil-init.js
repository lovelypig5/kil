#!/usr/bin/env node

"use strict";

require( 'colorful' ).colorful();

var program = require( 'commander' );
var task = require( '../task' );
var logger = require( '../logger' );
var path = require( 'path' );
var spawn = require( 'cross-spawn' );

program
    .version( require( '../package' ).version, '-v, --version' )
    .usage( '[options]' )
    .option( '-m, --mock', 'enable locale data mock' )
    .option( '-t, --test', 'init test module' )
    .on( '-h', printHelp )
    .on( '--help', printHelp )
    .parse( process.argv );

function printHelp() {
    console.log( '  Examples:'.to.bold.green.color );
    console.log();
    console.log( '    kil init -m    ' );
    console.log( '    kil init -t    ' );
    console.log();
}

var args = {
    mock: program.mock,
    test: program.test
};
task.init( args );
