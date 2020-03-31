const fs = require('fs-extra');
const path = require('path');
const Handlebars = require('handlebars');

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
  Handlebars.registerHelper('dc_isslideimage', (slide, options) => {
    if( slide.type === 'image' ){
      return options.fn(slide);
    }
  });
  Handlebars.registerHelper('dc_isslideembed', (slide, options) => {
    if( slide.type === 'embed' ){
      return options.fn(slide);
    }
  });
  Handlebars.registerHelper('dc_isslidetext', (slide, options) => {
    if( slide.type === 'text' ){
      return options.fn(slide);
    }
  });
  Handlebars.registerHelper('dc_isslideaudio', (slide, options) => {
    if( slide.type === 'audio' ){
      return options.fn(slide);
    }
  });
  Handlebars.registerHelper('dc_isslidevideo', (slide, options) => {
    if( slide.type === 'video' ){
      return options.fn(slide);
    }
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