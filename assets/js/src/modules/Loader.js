import 'whatwg-fetch';

const Handlebars = require( '../templates.precompiled.js' ).Handlebars;
const Templates = require( '../templates.precompiled.js' ).Templates;

console.log( "HANDLEBARS: ", Handlebars );
console.log( "TEMPLATES: ", Templates );

const Loader = function(){
 
};

Loader.prototype = {
  load: function( url ){
    const jsonURL = url + '/index.json';
    fetch( jsonURL )
      .then(function( response ){
        console.log( 'response ok' );
        if (response.ok) {
          return response;
        } else {
          var error = new Error(response.statusText)
          error.response = response
          throw error;
        }
      })
      .then( (response) => {        
        return response.json();
      })
      .then( ( json ) => {
        console.log( json );
        console.log( Templates.page( json ) );
        //console.log( this.parser.parseFromString( html, 'text/html')
      })
  }
}

module.exports = Loader;