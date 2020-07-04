const CFG = require('./Config.js' );
const F = require( './Functions.js' );

const DC_INFO_CLASS = 'dc-info';
const ORIENTATIONS = ['portrait','landscape'];

const ProjectSmall = function( _includesShowreel ){
  this.includesShowreel = _includesShowreel || false;
  this.$wrapper = document.querySelector( '.dc-item' );  
  this.$showreels = document.querySelector( '.dc-showreels' );
  this.items = this.getSlideLists();  
  this.slideIndex = 0;
  if( !this.includesShowreel ){
    this.$showreels.classList.add('hide');
  } else {
    this.$showreels.classList.remove('hide');
  }
  this.loadPlaceholderImages();
  this.update();  
};

ProjectSmall.prototype = {
  _onCantGoBack: function(){
    this.onCantGoBack();
  },
  onCantGoBack: function(){ /* ... override ... */ },
  _onEnd: function(){
    this.onEnd();
  },
  onEnd: function(){ /* ... override ... */ },
  _onChange: function(){
    this.onChange();
  },
  onChange: function(){ /* ... override ... */ },
  activate: function(){
    this.preloadImages( 2 );
  },
  deactivate: function(){
    /*noop*/
  },
  isCurrentlyOnCV: function( orientation ){
    if( !this.items[ orientation ][ this.slideIndex ] ){
      return false;
    }
    return this.items[ orientation ][ this.slideIndex ].classList.contains( DC_INFO_CLASS );
  },
  getSlideLists: function(){  
    return {
      portrait: this.getSlideListByOrientation( 'portrait' ),
      landscape: this.getSlideListByOrientation( 'landscape' ),
    };  
  },
  getSlideListByOrientation: function( orientation ){
    let result = [];
    const slidesQuery = `.dc-item--info, .dc-media__${orientation} .dc-media--list li`;

    if( this.$wrapper ){  
      const slides = [... this.$wrapper.querySelectorAll( slidesQuery )];    
      if( slides.length > 0 ){
        result = result.concat( slides );
      } 
    }
    if( this.includesShowreel ){
      const $dcInfo = document.querySelector( `.${DC_INFO_CLASS}` );       
      const showreelSlides = [... this.$showreels.querySelectorAll( slidesQuery )];
      result = result.concat( [$dcInfo] ).concat( showreelSlides );
    }    
    return result;
  },
  loadPlaceholderImages: function(){
    for( let orientation of ORIENTATIONS ){
      for( let index = 0; index <  this.items[ orientation ].length; index++ ){
        F.loadSlidePlaceholder( this.items[ orientation ][ index ] )
      }
    }
  },
  deactivateAll: function(){
    this.items.portrait
      .concat( this.items.landscape )
      .forEach( ( item ) => {
        item.classList.remove( 'active' );
      });
  },
  preloadImages: function( _preloadCount ){
    let preloadCount = _preloadCount | 2;  
    for( let i = 1; i < 1 + preloadCount; i++ ){
      let index = this.slideIndex + i;
      for( let orientation of ORIENTATIONS ){
        if( this.items[ orientation ][ index ] ){
          F.loadSlideImage( this.items[ orientation ][ index ] )
        }
      }
    } 
  },
  next: function( orientation ){
    this.slideIndex++;
    if( this.includesShowreel && this.isCurrentlyOnCV( orientation ) ){
      document.body.parentElement.setAttribute('data-dc-pagetype', 'home');
    }
    // we've gone past the last slide for this part
    if( this.slideIndex >= this.items[ orientation ].length ){
      this._onEnd();
      return;
    }    
    this.update();
    this._onChange();
  },
  prev: function( orientation ){
    if( this.includesShowreel && this.isCurrentlyOnCV( orientation ) ){
      this._onCantGoBack();
      return;
    }
    this.slideIndex--;
    if( this.slideIndex < 0 ){
      this._onCantGoBack();
      this.slideIndex = 0;
    }
    this.update();
    this._onChange();
  },
  update: function(){
    this.deactivateAll();
    
    if( this.items.portrait[ this.slideIndex ] ){
      this.items.portrait[ this.slideIndex ].classList.add( 'active' );
    }
    if( this.items.landscape[ this.slideIndex ] ){
      this.items.landscape[ this.slideIndex ].classList.add( 'active' );
    }
    this.preloadImages( 2 );
  }
};

module.exports = ProjectSmall;