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

Small.prototype.loadImages = function(){
  F.loadSlideImages( this.items.landscape );
  F.loadSlideImages( this.items.portrait );
};

Small.prototype.setupInteraction = function(){
  this.$interactionEle.addEventListener( 'click', ( e ) => {
    if( e.pageX >= window.innerWidth / 2 ){
      this.slideIndex++;
    } else {
      this.slideIndex--;
    }
    if( this.slideIndex < 0 ){
      this.slideIndex = 0;
    }
    if( this.slideIndex >= this.items[ this.orientation ].length - 1 ){
      let nextPageIndex = this.pageIndex + 1;
      if( this.data.pages[ nextPageIndex ] ){
        F.loadPage( this.data.pages[ nextPageIndex ].url );
      }
    }

    this.items.portrait
      .concat( this.items.landscape )
      .forEach( ( item ) => {
        item.classList.remove('active');
      });
    
    this.items.portrait[ this.slideIndex ].classList.add('active');
    this.items.landscape[ this.slideIndex ].classList.add('active');
    F.loadSlideImage( this.items.portrait[ this.slideIndex ] );
    F.loadSlideImage( this.items.landscape[ this.slideIndex ] );
  });
};

Small.prototype.activate = function(){
  console.log( 'activate small() ' );
  this.setupInteraction();
  this.loadImages();
}

Small.prototype.deactivate = function(){

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
}
mqLandscape.addListener( mqHandler );
mqPortrait.addListener( mqHandler );
mqHandler( mqLandscape );
mqHandler( mqPortrait );

module.exports = new Small();