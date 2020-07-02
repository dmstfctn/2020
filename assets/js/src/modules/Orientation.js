const Orientation = function(){
  this.orientation = 'portrait';
  this.mqPortrait = window.matchMedia( '(orientation: portrait)' );
  this.mqLandscape = window.matchMedia( '(orientation: landscape)' );
}

Orientation.prototype = {
  activate: function(){
    this.setupMq();
    this.setupResize();
  },
  deactivate: function(){
    this.clearMq();
    this.clearResize();
    this.clearRootSize();
  },
  handleMq: function(){
    if( this.mqLandscape.matches ){
      this.orientation = 'landscape';    
    }
    if( this.mqPortrait.matches ){
      this.orientation = 'portrait';
    }
    this.sizeRoot();
  },
  setupResize: function(){
    window.addEventListener( 'resize', () => {
      this.sizeRoot();
    } );
  },
  clearResize: function(){
    window.removeEventListener( 'resize', () => {
      this.sizeRoot();
    } );
  },
  setupMq: function(){
    this.mqLandscape.addListener( () => { this.handleMq() } );
    this.mqPortrait.addListener( () => { this.handleMq() } );
    
    this.handleMq();
    this.sizeRoot();
  },
  clearMq: function(){
    this.mqLandscape.removeListener( () => { this.handleMq() } );
    this.mqPortrait.removeListener( () => { this.handleMq() } );
    this.clearRootSize();
  },
  clearRootSize: function(){
    clearTimeout(this.sizeRootTimeout);
    this.sizeRootTimeout = setTimeout(function(){
      document.querySelectorAll('html, body, .dc-mobile-nav').forEach( ( $e ) => {
        $e.style.height = '';
      });
    }, 300 );
  },
  sizeRoot: function(){
    //fuck safari (ios)
    clearTimeout(this.sizeRootTimeout);
    this.sizeRootTimeout = setTimeout(function(){
      document.querySelectorAll('html, body, .dc-mobile-nav').forEach( ( $e ) => {
        $e.style.height = window.innerHeight + 'px';   
      });
      document.querySelectorAll('.dc-gfx').forEach( ( $e ) => {
        $e.style.width = window.innerHeight + 'px';   
      });
    }, 300 );
  }
};

module.exports = Orientation;