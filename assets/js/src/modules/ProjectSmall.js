const CFG = require('./Config.js' );
const F = require( './Functions.js' );

const DC_INFO_CLASS = 'dc-info';

const ProjectSmall = function( _includesCV, backwards, isFirstOneAgain ){
  console.log( 'NEW ProjectSmall: _includesCV (shouldShowreel?):', _includesCV );
  this.includesCV = _includesCV || false;
  this.$wrapper = document.querySelector( '.dc-item' );  
  this.items = this.getItems();
  console.log( 'NEW ProjectSmall: items:', this.items );
  this.minIndex = 0;
  if( !this.includesCV && !backwards && !isFirstOneAgain ){
    this.minIndex = 1;
  } 
  console.log('new ProjectSmall() includesCV: ', this.includesCV, ' backwards:', backwards, 'minINdex:', this.minIndex );
  if( !isFirstOneAgain ){
    this.slideIndex = (backwards) ? this.items.length - 1 : this.minIndex;
  } else {
    this.slideIndex = (backwards) ? this.items.length - 1 : this.minIndex + 1;
  }
  
  console.log( 'new ProjectSmall() starting index: ', this.slideIndex );

  this.loadPlaceholderImages();
  this.update();  
  if( backwards ){
    F.loadSlideImage( this.items[ this.slideIndex ] )
  }
};

ProjectSmall.prototype = {
  _onCantGoBack: function(){
    this.isCurrentlyOnGfxPlaceholder();
    this.onCantGoBack();
  },
  onCantGoBack: function(){ /* ... override ... */ },
  _onEnd: function(){
    this.onEnd();
  },
  onEnd: function(){ /* ... override ... */ },
  _onChange: function(){
    this.isCurrentlyOnGfxPlaceholder();
    this.onChange();
  },
  onChange: function(){ /* ... override ... */ },
  activate: function(){
    this.preloadImages( 2 );
  },
  _onNext: function(){
    this.onNext();
  },
  onNext: function(){ /* ... override ... */ },
  _onPrev: function(){
    this.onPrev();
  },
  onPrev: function(){ /* ... override ... */ },
  deactivate: function(){
    /*noop*/
  },
  isCurrentlyOnGfxPlaceholder: function(){
    if( this.slideIndex <= 0 ){
      this.isOnGfxPlaceholder = true;
    } else {
      this.isOnGfxPlaceholder = false;
    }
    return this.isOnGfxPlaceholder;
  },
  isCurrentlyOnCV: function( orientation ){
    if( !this.items[ this.slideIndex ] ){
      return false;
    }
    const current = this.items[ this.slideIndex ];
    const parent = current.parentElement;
    let parentIsInfo = (parent) ? parent.classList.contains( DC_INFO_CLASS ) : false;
    let isInfo = current.classList.contains( DC_INFO_CLASS );      
    return parentIsInfo || isInfo;
  },
  getItems: function(){
    let result = [document.createElement('div')]; //fake first one for gfx
    const name = 'small';
    const slidesQuery = `.dc-item--info, .dc-item--info .dc-small-chunk, .dc-media__${name} .dc-media--list li`;
    
    if( this.$wrapper ){  
      const slides = [... this.$wrapper.querySelectorAll( slidesQuery )];    
      if( slides.length > 0 ){
        result = result.concat( slides );
      } 
    }
    if( this.includesCV ){
      const $dcInfo = document.querySelector( `.${DC_INFO_CLASS}`);
      const $dcInfoSections = document.querySelectorAll( `.${DC_INFO_CLASS} .dc-small-chunk` );
      result = result.concat( [$dcInfo].concat([... $dcInfoSections]) );
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
    for( let i = -preloadCount; i < 1 + preloadCount; i++ ){
      let index = this.slideIndex + i;
      if( index === this.slideIndex ){ continue; }
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
    this._onNext();
    this._onChange();    
  },
  prev: function( orientation ){
    this.slideIndex--;
    if( this.slideIndex < this.minIndex ){      
      this._onCantGoBack();
      this.slideIndex = 0;
      return;
    }
    if( this.slideIndex === 0 ){
      //gfx placeholder slide
      this._onChange();
      return;        
    }
    this.update( orientation );
    this._onPrev();
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