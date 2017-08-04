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
    .option( '-S, --no-sourcemap', 'disable source map' )
    .option( '-U, --no-uglify', 'disable uglifyjs.' )
    .option( '-C, --no-clean', 'disable clean before a new build' )
    .option( '-j, --jshint', 'en jshint before a new build' )
    .option( '-m, --mock', 'enable mock' )
    .on( '-h', printHelp )
    .on( '--help', printHelp )
    .parse( process.argv );

function printHelp() {
    console.log( '  Examples:'.to.bold.green.color );
    console.log();
    console.log( '    kil build -S     disable source ' );
    console.log();
}

var args = {
    sourcemap: program.sourcemap,
    clean: program.clean,
    uglify: program.uglify,
    mock: program.mock,
    jshint: program.jshint
};

if ( program.clean ) {
    var cleanScript = path.join( __dirname, '/kil-clean.js' );
    spawn( cleanScript, {
        stdio: 'inherit'
    } ).on( 'close', ( code ) => {
        task.exec( args, 'build' );
    } );
} else {
    task.exec( args, 'build' );
}
