import 'whatwg-fetch';

const Loader = function(){
  this.parser = new DOMParser();
};

Loader.prototype = {
  load: function( url ){
    fetch( url )
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
        console.log('FETCH RESPONSE')
        console.log(response);
        console.log( );
        console.log( );
        return response.text();
      })
      .then( ( html ) => {
        console.log( html );
        //console.log( this.parser.parseFromString( html, 'text/html')
      })
  }
}

module.exports = Loader;