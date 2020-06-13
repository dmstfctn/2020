const fs = require('fs-extra');
const path = require('path');

const Handlebars = require('Handlebars');

const Config = require('../Config.js');

let Templating = () => {
  Templating.registerPartials();
  Templating.registerHelpers();
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

Templating.registerHelpers = () => {
  Handlebars.registerHelper('dc_slidetype', (type, slide, options) => {
    if( type === slide.type ){
      return options.fn(slide);
    }
  });
  Handlebars.registerHelper('dc_urlpath', (url_path, options) => {
      return '/' + path.join( Config.url_root, url_path );
  }); 
  Handlebars.registerHelper('dc_ismenu', (name, menu, options) => {
    if( name === menu.name ){
      return options.fn(menu);
    }
    return options.inverse(menu);
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