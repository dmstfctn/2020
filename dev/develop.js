const chokidar = require('chokidar');
const fs = require('fs');
const express = require('express');
const path = require('path');
const cp = require('child_process');

const buildScript = path.join( __dirname, '..', 'build.js' );
const publicDir = path.join( __dirname, '..', 'public' );
console.log( ' ---------------- SETUP ---------------- ')
console.log( '1 - run build script at:', buildScript );
console.log( '2 - run static server from', publicDir );

const app = express();
app.use(express.static('public'));
app.listen( 8000, () => console.log('Dev Server on localhost:8000') );

console.log( ' ---------------- SETUP ---------------- ')



let buildWait; 
const runBuild = () => {
  clearTimeout( buildWait );
  buildWait = setTimeout( ()=>{
    console.log( " ---------- BUILD BUILD BUILD ---------- ")
    cp.exec('node build.js', {}, ( err, stdout )=>{
      if( err ) throw new Error( err );
      console.log( stdout );
      console.log( " -------------- COMPLETE --------------- ")
    });    
  }, 100 );
}

chokidar.watch( 
  [
    './content',
    './assets',
    './templates',
    './modules',
    './build.js',
    './package.json'
  ], 
  {},
).on( 'change', ( filename ) => {
  //console.log('chokidar watch sez: changed ', filename );
  runBuild();
}).on( 'add', ( filename ) => {
  //console.log('chokidar watch sez: add', filename );
  runBuild();
}).on( 'addDir', ( filename ) => {
  //console.log('chokidar watch sez: addDir', filename );
  runBuild();
}).on( 'unlink', ( filename ) => {
  //console.log('chokidar watch sez: unlink', filename );
  runBuild();
}).on( 'unlinkDir', ( filename ) => {
  //console.log('chokidar watch sez: unlinkDir', filename );
  runBuild();
});

console.log();
console.log();
console.log( ' --------- WATCHING FOR CHANGES --------' );
console.log();
console.log();
