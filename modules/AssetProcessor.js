const path = require('path');
const fs = require('fs-extra');
const Browserify = require('browserify');

const Config = require( '../Config.js' );

const js = ( src, dist ) => {  
  // ensure dist exists
  fs.mkdirSync( path.dirname(dist), {recursive: true} );
  const out = fs.createWriteStream( dist );

  // run browserify and optionally uglify(ify)
  const b = Browserify( src );
  if( Config.minify ){ b.transform('uglifyify', { global: true  }) }
  b.bundle()
    .pipe( out );
};

const AssetProcessor = {
  js
}

module.exports = AssetProcessor;