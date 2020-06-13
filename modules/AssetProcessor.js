const path = require('path');
const fs = require('fs-extra');
const Browserify = require('browserify');

const NodeSass = require('node-sass');

const SvgOptimise = require('./SvgOptimise.js');

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
    .on('error', function(err){
      console.log(err.message);
      this.emit('end');
    })
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

const svgToTemplate = ( src, dist ) => {
  // ensure dist exists
  fs.mkdirSync( path.dirname(dist), {recursive: true} );
  const svgs = fs.readdirSync( src ).filter( ( f ) => { return path.extname(f) === '.svg' });
  for( let i = 0; i < svgs.length; i++ ){
    const filename = path.basename( svgs[i], '.svg' );
    const templatename = 'svg_' + filename + '.handlebars';
    const pIn = path.join( src, svgs[i] ); 
    const pOut = path.join( dist, templatename );
    const optim = SvgOptimise.sync( pIn );    
    fs.writeFileSync( pOut, optim );
  }
  
  
}

const AssetProcessor = {
  js,
  sass,
  svgToTemplate
}

module.exports = AssetProcessor;