const F = require('./Functions.js');

const GFX = function(){
  this.$nav_logo = document.querySelector('[data-dc-localtarget="#related-matters"] svg' );
  this.$gfx = document.querySelector('.dc-gfx');
  this.timeout = null;
  this.showDelay = 10000;
  this.initialHide = 5000;
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
  hide: function( immediate ){
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
    }, this.showDelay );
    if( immediate ){
      this.enableAnimation();
    }
  },
  show: function( immediate ){
    if( immediate ){
      this.disableAnimation();
    }
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
    this.hide();
  },
  activate: function(){
    let visibilityAPI = F.visibilityChangeCompat();
    this.timeout = setTimeout( () => {
      this.hide();
    }, this.initialHide )
    window.addEventListener('pointermove', () => {
      console.log('pointermove');
      this._onMove();
    });
    window.addEventListener('pointerdown', () => {
      console.log('pointerdown');
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
        } else { /*is visible*/ }
      })
    }
  },
  deactivate: function(){
    window.removeEventListener('mousemove', () => {
      this._onMove();
     });
  }
}

module.exports = GFX;