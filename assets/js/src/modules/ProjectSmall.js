const CFG = require('./Config.js' );
const F = require( './Functions.js' );

const DC_INFO_CLASS = 'dc-info';

const ProjectSmall = function( _includesCV ){
  this.includesCV = _includesCV || false;
  this.$wrapper = document.querySelector( '.dc-item' );  
  this.items = this.getSlideListByName( 'small' );
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
    if( !this.items[ this.slideIndex ] ){
      return false;
    }
    return this.items[ this.slideIndex ].classList.contains( DC_INFO_CLASS );
  },
  getSlideListByName: function( name ){
    let result = [];
    const slidesQuery = `.dc-item--info, .dc-media__${name} .dc-media--list li`;

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
    const lastSlideIndex = ( this.includesCV ) ? this.items.length - 2 : this.items.length - 1;
    if( lastSlideIndex < 1 ){ return; }
    
    const $nextLabel = this.items[ lastSlideIndex ].querySelector('.dc-smallnav--next');
    if( $nextLabel ){
      $nextLabel.innerHTML = title;
    }
  },
  loadPlaceholderImages: function(){
    for( let index = 0; index <  this.items.length; index++ ){
      F.loadSlidePlaceholder( this.items[ index ] )
    }
  },
  deactivateAll: function(){
    this.items
      .forEach( ( item ) => {
        item.classList.remove( 'active' );
        this.deactivateSlide( item );
      });
  },
  preloadImages: function( _preloadCount ){
    let preloadCount = _preloadCount | 2;  
    for( let i = 1; i < 1 + preloadCount; i++ ){
      let index = this.slideIndex + i;
      if( this.items[ index ] ){
        F.loadSlideImage( this.items[ index ] )
      }
    } 
  },
  next: function( orientation ){
    this.slideIndex++;
    if( this.includesCV && this.isCurrentlyOnCV( orientation ) ){
      document.body.parentElement.setAttribute('data-dc-pagetype', 'home');
    }
    // we've gone past the last slide for this part
    if( this.slideIndex >= this.items.length ){
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
    
    if( this.items[ this.slideIndex ] ){
      this.items[ this.slideIndex ].classList.add( 'active' );     
      this.activateSlide( this.items[ this.slideIndex ] );
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
      if( window.DC_GFX ) window.DC_GFX.preventAppearance();
      let videoPlay = $slide.querySelector('video').play();
      if( videoPlay ){
        videoPlay.catch( ( e ) => {
          console.log('VIDEO CANT PLAY, go to next' );
          console.log( e );
          this.next();
        });
      }
    } else {
      if( window.DC_GFX ) window.DC_GFX.enableAppearance();
    }
  },
};

module.exports = ProjectSmall;