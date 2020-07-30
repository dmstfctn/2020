const Orientation = function(){
  this.orientation = 'portrait';
  this.o = 'portrait'
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
    console.log('handleMq');
    console.log( this.mqLandscape );
    console.log(this.mqPortrait);
    if( this.mqLandscape.matches ){
      this.o = 'landscape';
      this.orientation = 'landscape';    
    }
    if( this.mqPortrait.matches ){
      this.o = 'portrait';
      this.orientation = 'portrait';
    }
    console.log('mqresult: ', this.orientation, this.o );
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
    this.sizeRootTimeout = setTimeout( () => {
      document.querySelectorAll('html, body, .dc-mobile-nav').forEach( ( $e ) => {
        $e.style.height = window.innerHeight + 'px';   
        $e.style.minHeight = window.innerHeight + 'px';   
      });
      document.querySelectorAll('.dc-gfx').forEach( ( $e ) => {
        console.log(this);
        console.log('SIZE gFX. ORIENTATION: ', this.orientation, ' <--- !!!!! -->>', this.o )
        if( this.orientation === 'portrait' ){
          console.log('PORTRAIT: H: ', window.innerHeight + 'px', 'W:', window.innerWidth + 'px' );
          $e.style.width = window.innerHeight + 'px';   
          $e.style.height = window.innerWidth + 'px';   
        } else {
          console.log('LANDSCAPE: W: ', window.innerWidth + 'px', 'H:', window.innerHeight + 'px' );
          $e.style.width = window.innerWidth + 'px';   
          $e.style.height = window.innerHeight + 'px'; 
        }
      });
    }, 300 );
  }
};

module.exports = Orientation;