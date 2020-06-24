const F = require('./Functions.js');

const GFX = function(){
  this.$nav_logo = document.querySelector('[data-dc-localtarget="#related-matters"] svg' );
  this.$gfx = document.querySelector('.dc-gfx');
  this.timeout = null;
  this.showDelay = 15000;  
  this.firstUserHide = true;
  this.firstUserHideDelay = 700;
  this.ignoreFirstPointerMove = true;
  this.loadedAt = (new Date()).getTime();
  this.increaseDelay( false );
  this.unhidable = false;
}

GFX.prototype = {
  disableAnimation: function(){
    this.$gfx.style.animationDuration = '0s';
    this.$nav_logo.style.animationDuration = '0s';
  },
  enableAnimation: function(){
    this.$gfx.style.animationDuration = '';
    this.$nav_logo.style.animationDuration = '';
  },
  increaseDelay: function( shouldIncrease ){
    if( shouldIncrease ){
      this.useShowDelay = this.showDelay * 2;
    } else{
      this.useShowDelay = this.showDelay;
    }
  },
  hide: function( immediate ){
    if( this.unhidable ){
      return;
    }
    if( immediate ){
      this.disableAnimation();
    }
    this.$gfx.classList.add('hidden');
    this.$gfx.classList.remove('visible');
    this.$nav_logo.classList.remove('hidden');
    this.$nav_logo.classList.add('visible');
    clearTimeout( this.timeout );
    this.timeout = setTimeout( () => {
      this.show( true );
    }, this.useShowDelay );

    this.firstUserHide = false;
    if( immediate ){
      this.enableAnimation();
    }
  },
  show: function( immediate ){
    if( immediate ){
      this.disableAnimation();
    }    
    clearTimeout( this.timeout );
    this.$gfx.classList.remove('hidden');
    this.$gfx.classList.add('visible');
    this.$nav_logo.classList.add('hidden');
    this.$nav_logo.classList.remove('visible');
    if( immediate ){
      setTimeout(() => {
        this.enableAnimation();
      }, 10 );      
    }
  },
  _onMove: function(){
    if( this.firstUserHide ){
      const timeSinceLoad = (new Date()).getTime() - this.loadedAt;
      if( timeSinceLoad > this.firstUserHideDelay ){
        this.hide();
      } else {
        this.timeout = setTimeout( () => {
          this.hide();
        }, this.firstUserHideDelay );
      }
    } else {
      this.hide();
    }    
  },
  activate: function(){
    let visibilityAPI = F.visibilityChangeCompat();

    window.addEventListener('wheel', () => {
      this._onMove();
    }, {passive: true} );
    window.addEventListener('keydown', ( e ) => {
      if( 
        e.key === 'ArrowDown' || e.key === 'ArrowUp' 
        || e.key === 'ArrowLeft' || e.key === 'ArrowRight' 
      ){
        this._onMove();
      }      
    });
    window.addEventListener('pointermove', () => {
      if( this.ignoreFirstPointerMove ){
        this.ignoreFirstPointerMove = false;
        return;
      }
      
      this._onMove();
    });
    window.addEventListener('pointerdown', () => {
      this._onMove();
    });
    // window.addEventListener('click', () => {
    //   this._onMove();
    // });
    if( visibilityAPI.property ){
      document.addEventListener( visibilityAPI.eventName, () => {              
        if( document[ visibilityAPI.property ] ){ //is hidden    
          clearTimeout( this.timeout );
          this.show( true ) //show, immediately
        } else { 
          /*is visible*/ 
          this.ignoreFirstPointerMove = true;
        }
      }, false );
    }
  },
  deactivate: function(){
    window.removeEventListener('mousemove', () => {
      this._onMove();
     });
  },
  startLoadingSequence: function(){
    this.show();
    this.unhidable = true;
  },
  endLoadingSequence: function(){
    this.unhidable = false;
    this.hide();
  }
};

module.exports = GFX;