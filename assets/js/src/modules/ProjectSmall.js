const CFG = require('./Config.js' );
const F = require( './Functions.js' );

const DC_INFO_CLASS = 'dc-info';
const ORIENTATIONS = ['portrait','landscape'];

const ProjectSmall = function( _includesCV ){
  this.includesCV = _includesCV || false;
  this.$wrapper = document.querySelector( '.dc-item' );  
  this.items = this.getSlideLists();  
  this.slideIndex = 0;
  
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
    if( this.includesCV ){
      const $dcInfo = document.querySelector( `.${DC_INFO_CLASS}` );
      result = result.concat( [$dcInfo] )
    }    
    return result;
  },
  setNextProjectTitle: function( title ){
    for( let orientation of ORIENTATIONS ){
      const lastSlideIndex = ( this.includesCV ) ? this.items[ orientation ].length - 2 : this.items[ orientation ].length - 1;
      if( lastSlideIndex < 1 ){ return; }
      
      const $nextLabel = this.items[ orientation ][ lastSlideIndex ].querySelector('.dc-smallnav--next');
      if( $nextLabel ){
        $nextLabel.innerHTML = title;
      }      
    }
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
        this.deactivateSlide( item );
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
    if( this.includesCV && this.isCurrentlyOnCV( orientation ) ){
      document.body.parentElement.setAttribute('data-dc-pagetype', 'home');
    }
    // we've gone past the last slide for this part
    if( this.slideIndex >= this.items[ orientation ].length ){
      this._onEnd();
      return;
    }    
    this.update( orientation );
    this._onChange();
  },
  prev: function( orientation ){
    if( this.includesCV && this.isCurrentlyOnCV( orientation ) ){
      this._onCantGoBack();
      return;
    }
    this.slideIndex--;
    if( this.slideIndex < 0 ){
      this._onCantGoBack();
      this.slideIndex = 0;
    }
    this.update( orientation );
    this._onChange();
  },
  update: function( orientation ){
    this.deactivateAll();
    
    if( this.items.portrait[ this.slideIndex ] ){
      this.items.portrait[ this.slideIndex ].classList.add( 'active' );
      if( orientation === 'portrait' ){
        this.activateSlide( this.items.portrait[ this.slideIndex ] );
      }
    }
    if( this.items.landscape[ this.slideIndex ] ){
      this.items.landscape[ this.slideIndex ].classList.add( 'active' );
      if( orientation === 'landscape' ){
        this.activateSlide(  this.items.landscape[ this.slideIndex ] );
      }
    }
    this.preloadImages( 2 );
  },
  deactivateSlide: function( $slide ){
    if( $slide.classList.contains('dc-media__video') ){
      const $video = $slide.querySelector('video');
      $video.pause();
      $video.currentTime = 0;
    }
  },
  activateSlide: function( $slide ){
    if( $slide.classList.contains('dc-media__video') ){
      window.DC_GFX.preventAppearance();
      $slide.querySelector('video').play();
    } else {
      window.DC_GFX.enableAppearance();
    }
  },
  changeOrientation: function( orientation ){
    this.update( orientation );
  }
};

module.exports = ProjectSmall;