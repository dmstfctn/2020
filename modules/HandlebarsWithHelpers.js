const path = require('path')
const Handlebars = require('handlebars');
const Config = require('../Config.js');

const Helpers = {
  'dc_slidetype': (type, slide, options) => {
    if( type === slide.type ){
      return options.fn(slide);
    }
  },
  'dc_urlpath': (url_path, options) => {
    return '/' + path.join( Config.url_root, url_path );
  },
  'dc_ismenu': (name, menu, options) => {
    if( name === menu.name ){
      return options.fn(menu);
    }
    return options.inverse(menu);
  }
};

for( let helper in Helpers ){
  Handlebars.registerHelper( helper, Helpers[helper] );
}

module.exports = { 
  Handlebars,
  Helpers
};