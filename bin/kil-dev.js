#!/usr/bin/env node

"use strict";

require( 'colorful' ).colorful();

var program = require( 'commander' );
var task = require( '../task' );
var logger = require( '../logger' );

program
    .usage( '[options]' )
    .option( '-p, --port [number]', 'specify the port when dev server run' )
    .option( '-m, --mock', 'enable mock' )
    .on( '-h', printHelp )
    .on( '--help', printHelp )
    .parse( process.argv );

function printHelp() {
    console.log( '  Examples:'.to.bold.green.color );
    console.log();
    console.log( '    kil dev -p 9001    ' );
    console.log();
}

var args = {
    port: program.port,
    mock: program.mock
};

task.exec( args, 'dev' );
