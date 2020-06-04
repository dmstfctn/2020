const F = require('./Functions.js');

const GFX = function(){
  this.$nav_logo = document.querySelector('[data-dc-localtarget="#related-matters"] svg' );
  this.$gfx = document.querySelector('.dc-gfx');
  this.timeout = null;
}

GFX.prototype = {
  hide: function(){
    this.$gfx.classList.add('hidden');
    this.$gfx.classList.remove('visible');
    this.$nav_logo.classList.remove('hidden');
    this.$nav_logo.classList.add('visible');
    clearTimeout( this.timeout );
    this.timeout = setTimeout( () => {
      this.show();
    }, 4000 );
  },
  show: function(){
    this.$gfx.classList.remove('hidden');
    this.$gfx.classList.add('visible');
    this.$nav_logo.classList.add('hidden');
    this.$nav_logo.classList.remove('visible');
  },
  _onMove: function(){
    this.hide();
  },
  activate: function(){
    let visibilityAPI = F.visibilityChangeCompat();
    this.timeout = setTimeout( () => {
      this.hide();
    }, 2500 )
    window.addEventListener('mousemove', () => {
     this._onMove();
    });
    if( visibilityAPI.property ){
      document.addEventListener( visibilityAPI.eventName, () => {
        if( document[ visibilityAPI.property ] ){ //is hidden
          clearTimeout( this.timeout );
          this.show()
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