const fs = require('fs-extra');
const path = require('path');
const HandlebarsWithHelpers = require('./HandlebarsWithHelpers.js');
const Handlebars = HandlebarsWithHelpers.Handlebars;

const Config = require('../Config.js');

let Templating = () => {
  Templating.registerPartials();  
  return Templating.getTemplates();
}

Templating.registerPartials = () => {
  fs.readdirSync( path.join( 'templates', 'partials' ) )
    .forEach( ( f ) => {
      let p = path.join( 'templates', 'partials', f );
      let contents = fs.readFileSync( p ).toString();
      let name = f.replace( '.handlebars','' );
      Handlebars.registerPartial( name, contents );
    });
};

Templating.getTemplates = () => {
  const Templates = {};
  fs.readdirSync( 'templates' )
    .forEach( (f) => {
      if( f !== 'partials' ){
        let p = path.join( 'templates', f );
        let name = f.replace( '.handlebars', '' );
        Templates[name] = Handlebars.compile( fs.readFileSync( p ).toString() );
      }
    });
  return Templates;
};

module.exports = Templating;