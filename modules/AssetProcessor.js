const path = require('path');
const fs = require('fs-extra');
const Browserify = require('browserify');

const NodeSass = require('node-sass');

const Config = require( '../Config.js' );

const js = ( src, dist ) => {  
  // ensure dist exists
  fs.mkdirSync( path.dirname(dist), { recursive: true } );
  const out = fs.createWriteStream( dist );

  // run browserify, babelify, and optionally uglify(ify)
  const b = Browserify( src );
  b.transform( "babelify", {presets: ["@babel/preset-env"], global: true } );  
  if( Config.minify ){ b.transform('uglifyify', { global: true  }) }
  b.bundle()
    .pipe( out );
};

const sass = ( src, dist ) => {
  // ensure dist exists
  fs.mkdirSync( path.dirname(dist), {recursive: true} );
  NodeSass.render({
    file: src,
    outputStyle: ( Config.minify ) ? 'compressed' : 'nested',
    sourceComments: ( Config.minify ) ? false : true
  }, ( err, result ) => {
    if( err ){
      throw new Error(err);
    }
    fs.writeFile( dist, result.css );
  });
}

const AssetProcessor = {
  js,
  sass
}

module.exports = AssetProcessor;