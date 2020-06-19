import 'whatwg-fetch';

const Loader = function( triggers ){
  this.loaded = {};
  this.triggers = triggers;
};

Loader.prototype = {
  initEvents: function( _context ){
    const context = _context || document;
    //console.log('LOADER INIT EVENTS -> CONTEXT = ', context );
    this.triggers.forEach( (trigger) => {
      context.querySelectorAll( trigger ).forEach( ( $a ) => {
        $a.addEventListener( 'click', ( e ) => {
          e.preventDefault();
          this.load( $a.getAttribute( 'href' ) ); 
        });
      });
    });
  },
  load: function( url, disableHistory ){
    if( this.loaded[ url ] ){
      //console.log('already loaded');
      this._onLoad( this.loaded[ url ], url, disableHistory );
      return;
    }
    //console.log('loading fresh' );
    const fragmentURL = url + '/fragment/index.json';
    console.log('loading fragmnt at: ', fragmentURL );
    fetch( fragmentURL )
      .then(function( response ){
        //console.log( 'response ok' );
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
      .then( ( data ) => {
        this.loaded[url] = data;
        this._onLoad( data, url, disableHistory );               
      });
  },
  _onLoad: function( data, url, disableHistory ){
    this.onLoad( data, url, disableHistory );
  },
  onLoad: function( data, url, disableHistory ){ /* ... override .. */ }
};

module.exports = Loader;