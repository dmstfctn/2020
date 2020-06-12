const path = require('path');
const fs = require('fs-extra');
const Browserify = require('browserify');

const NodeSass = require('node-sass');

const HandlebarsWithHelpers = require('./HandlebarsWithHelpers.js');
const Handlebars = HandlebarsWithHelpers.Handlebars;

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

const handlebars = ( templates, partials, output ) => {
  let result  = `const Handlebars = require('./modules/HandlebarsWithHelpers.js').Handlebars;`;
      result += `const Templates = {};`;

  const precompile = function( f ){
    let name = path.basename( f, '.handlebars' );
    let temp = fs.readFileSync( f ).toString();
    let precomp = Handlebars.precompile( temp, {
     knownHelpers: Object.keys( HandlebarsWithHelpers.Helpers )
    });
    return {
      name: name,
      string: JSON.stringify( precomp ),
      precompiled: precomp
    };
  };
  partials.forEach( ( f ) => {
    let p = precompile( f );
    result += `Handlebars.partials['${ p.name }'] = Handlebars.template(` 
    result += p.precompiled;
    result += ');\n';
  });
  templates.forEach( ( f ) => {
    let p = precompile( f );
    result += `Templates['${ p.name }'] = Handlebars.template(` 
    result += p.precompiled;
    result += ');\n';
  });

  result += `module.exports = {
    Handlebars,
    Templates
  }`;
  
  fs.writeFileSync( output, result);
};

const AssetProcessor = {
  js,
  sass,
  handlebars
}

module.exports = AssetProcessor;