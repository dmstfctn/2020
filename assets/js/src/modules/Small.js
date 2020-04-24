const CFG = require('./Config.js' );
const F = require( './Functions.js' );

const Showreel = require( './Showreel.js' )

const shouldShowreel = () => {
  if( !document.referrer ){
    return true;
  }
  console.log( 'from:', document.referrer );
  const there = F.slashEnd( new URL( document.referrer ).origin );
  const here = F.slashEnd( window.location.origin );
  return there !== here;
}

const Small = function(){
  this.orientation = 'portrait';
  this.data = window.DCSMALL;
  this.slideIndex = 0;
  this.pageIndex = F.getPageIndexFor( window.location.pathname );
  this.showreel = ( shouldShowreel() ) ? new Showreel() : false;
  this.$interactionEle = document.querySelector('.dc-mobile-nav');  
 
  this.forwardInteractionHintTimeout = null;

  this.items = {
    portrait: this.getSlideList('portrait'),
    landscape: this.getSlideList('landscape'),
  };
};

Small.prototype.getSlideList = function( orientation ){
  let query = `.dc-item--info, .dc-media__${orientation} .dc-media--list li`;
  let slides = [...document.querySelectorAll( query )];
  console.log( 'slide list for: ', orientation );
  if( this.showreel ){
    console.log( ' --> including showreel ', this.showreel.getSlides( orientation ) );
    slides = slides.concat( this.showreel.getSlides( orientation ) );
  }
  console.log(' --> ');
  console.log( slides );
  return slides;
}

Small.prototype.preloadImages = function( _preloadCount ){
  
  let preloadCount = _preloadCount | 2;
  console.log('preload', preloadCount, 'images' );
  for( let i = 1; i < 1 + preloadCount; i++ ){
    let index = this.slideIndex + i;
    for( let orientation of ['portrait', 'landscape'] ){
      if( this.items[ orientation ][ index ] ){
        console.log( 'preload image: ', index, ' for ', orientation );
        F.loadSlideImage( this.items[ orientation ][ index ] )
      }
    }
  } 
};

Small.prototype.isCurrentlyOnCV = function(){
  return this.items[ this.orientation ][ this.slideIndex ].classList.contains('dc-info');
}

Small.prototype.triggerNoFurtherAnimation = function(){
  clearTimeout( this.triggerNoFurtherAnimationTimeout );
  this.$interactionEle.classList.add('no-further');
  this.triggerNoFurtherAnimationTimeout =  setTimeout( () => {
    this.$interactionEle.classList.remove('no-further');
  }, 10 );
};

Small.prototype.readyForwardHint = function(){
  clearTimeout( this.forwardInteractionHintTimeout );
  this.forwardInteractionHintTimeout = setTimeout(() => {
    this.$interactionEle.classList.add('go-further');
  }, 3000 );
}

Small.prototype.setupInteraction = function(){
  this.$interactionEle.addEventListener( 'click', ( e ) => {
    if( e.pageX >= window.innerWidth / 2 ){
      this.slideIndex++;    
      clearTimeout( this.forwardInteractionHintTimeout );
    } else {
      if( this.isCurrentlyOnCV() ){
        this.triggerNoFurtherAnimation();
        return;
      } 
      clearTimeout( this.forwardInteractionHintTimeout );
      this.slideIndex--;
    }
    if( this.slideIndex < 0 ){
      this.triggerNoFurtherAnimation();
      this.slideIndex = 0;
    }
    if( this.slideIndex >= this.items[ this.orientation ].length ){
      let nextPageIndex = this.pageIndex + 1;
      if( this.data.pages[ nextPageIndex ] ){
        console.log('load next page: ', this.data.pages[ nextPageIndex ] );
        F.loadPage( this.data.pages[ nextPageIndex ].url );
        return;
      }
    }

    this.items.portrait
      .concat( this.items.landscape )
      .forEach( ( item ) => {
        item.classList.remove('active');
      });
    
    if( this.items.portrait[ this.slideIndex ] ){
      this.items.portrait[ this.slideIndex ].classList.add('active');
    }
    if(this.items.landscape[ this.slideIndex ]){
      this.items.landscape[ this.slideIndex ].classList.add('active');
    }
    this.preloadImages( 2 );

    sizeRoot();
  });
};



Small.prototype.activate = function(){
  console.log( 'activate small() ' );
  this.setupInteraction();
  this.readyForwardHint();
  this.preloadImages( 2 );
}

Small.prototype.deactivate = function(){
  clearTimeout( this.forwardInteractionHintTimeout );
}

let sizeRootTimeout;
const sizeRoot = () => {
  //fuck safari (ios)
  clearTimeout(sizeRootTimeout);
  sizeRootTimeout = setTimeout(function(){
    document.querySelectorAll('html, body, .dc-mobile-nav').forEach( ( $e ) => {
      $e.style.height = window.innerHeight + 'px';   
    });
  }, 300 );
}

const mqPortrait = window.matchMedia( '(orientation: portrait)' );
const mqLandscape = window.matchMedia( '(orientation: landscape)' );

const mqHandler = () => {
  if( mqLandscape.matches ){
    Small.orientation = 'landscape';    
  }
  if( mqPortrait.matches ){
    Small.orientation = 'portrait';
  }
  sizeRoot();
}
mqLandscape.addListener( mqHandler );
mqPortrait.addListener( mqHandler );
mqHandler( mqLandscape );
mqHandler( mqPortrait );

sizeRoot();


module.exports = new Small();