import 'pepjs'

const CFG = require('./Config.js' );
const F = require( './Functions.js' );

const Loader = require('./Loader.js');

const Showreel = require( './Showreel.js' )

const Small = function(){
  this.loader = new Loader([]);
  this.orientation = 'portrait';
  this.data = window.DCSMALL;  
  this.$interactionEle = document.querySelector('.dc-mobile-nav');  
 
  this.forwardInteractionHintTimeout = null;
  
  this.setupLoader();
  this.setupPage();

  this.startPageIndex = this.pageIndex;

  this.mqPortrait = window.matchMedia( '(orientation: portrait)' );
  this.mqLandscape = window.matchMedia( '(orientation: landscape)' );
};

/* Utilities / Data */
Small.prototype.getPageIndexFor = function( _path ){
  const path = F.slashBoth( _path );  
  
  const index = window.DCSMALL.pages
    .findIndex( (item) => { 
      let url = F.slashBoth( item.url );        
      return url === path;  
    });

  return index;
}

Small.prototype.shouldShowreel = function(){
  if( this.showreel && this.showreel.hasRun ){
    return false;
  }
  if( !document.referrer ){
    return true;
  }
  const there = F.slashEnd( new URL( document.referrer ).origin );
  const here = F.slashEnd( window.location.origin );
  return there !== here;
}

Small.prototype.isCurrentlyOnCV = function(){
  return this.items[ this.orientation ][ this.slideIndex ].classList.contains('dc-info');
}

Small.prototype.getSlideList = function( orientation ){
  let query = `.dc-item--info, .dc-media__${orientation} .dc-media--list li`;
  let slides = [...document.querySelectorAll( query )];
  //console.log( 'slide list for: ', orientation );
  if( this.showreel ){
    //console.log( ' --> including showreel ', this.showreel.getSlides( orientation ) );
    slides = slides.concat( this.showreel.getSlides( orientation ) );
  }
  return slides;
}

Small.prototype.preloadImages = function( _preloadCount ){
  let preloadCount = _preloadCount | 2;  
  for( let i = 1; i < 1 + preloadCount; i++ ){
    let index = this.slideIndex + i;
    for( let orientation of ['portrait', 'landscape'] ){
      if( this.items[ orientation ][ index ] ){
        F.loadSlideImage( this.items[ orientation ][ index ] )
      }
    }
  } 
};

/* Activate / Deactivate */
Small.prototype.activate = function(){
  //console.log( 'activate small() ' );
  this.setupMq();
  this.setupInteraction();
  this.readyForwardHint();  
  this.preloadImages( 2 );
}

Small.prototype.deactivate = function(){
  this.clearMq();
  clearTimeout( this.forwardInteractionHintTimeout );
}

/* sizing */
Small.prototype.clearRootSize = function(){
  clearTimeout(this.sizeRootTimeout);
  this.sizeRootTimeout = setTimeout(function(){
    document.querySelectorAll('html, body, .dc-mobile-nav').forEach( ( $e ) => {
      $e.style.height = '';
    });
  }, 300 );
}
Small.prototype.sizeRoot = function(){
  //fuck safari (ios)
  clearTimeout(this.sizeRootTimeout);
  this.sizeRootTimeout = setTimeout(function(){
    document.querySelectorAll('html, body, .dc-mobile-nav').forEach( ( $e ) => {
      $e.style.height = window.innerHeight + 'px';   
    });
  }, 300 );
}

Small.prototype.handleMq = function(){
  //console.log( 'handle mq' );
  if( this.mqLandscape.matches ){
    this.orientation = 'landscape';    
  }
  if( this.mqPortrait.matches ){
    this.orientation = 'portrait';
  }
  this.sizeRoot();
};

Small.prototype.setupMq = function(){
  this.mqLandscape.addListener( () => { this.handleMq() } );
  this.mqPortrait.addListener( () => { this.handleMq() } );
  
  this.handleMq();
  this.sizeRoot();
};

Small.prototype.clearMq = function(){
  this.mqLandscape.removeListener( () => { this.handleMq() } );
  this.mqPortrait.removeListener( () => { this.handleMq() } );
  this.clearRootSize();
}

/* loader */
Small.prototype.setupPage = function(){
  this.slideIndex = 0;
  this.pageIndex = this.getPageIndexFor( window.location.pathname );
  if( this.shouldShowreel() ){
    this.showreel = new Showreel();
    this.showreel.show();
  } else {
    if( this.showreel ){
      this.showreel.hide();      
    }
  }  

  this.items = {
    portrait: this.getSlideList('portrait'),
    landscape: this.getSlideList('landscape'),
  };
}

Small.prototype.setupLoader = function(){
  this.historyActive = true;
  this.$mainContent = document.querySelector( '.dc-main-content' );  

  this.loader.onLoad = ( data, url, disableHistory  ) => {
    console.log('SMALL: loader.onLoad() ');
    if( !disableHistory && this.historyActive ){     
      history.pushState(
        {
          type: 'page', 
          url: F.slashEnd( url ) 
        }, 
        null, 
        F.slashEnd( url ) 
      );
    }
    this.renderPage( data );
  };
}

Small.prototype.loadNextPage = function(){
  let nextPageIndex = (this.pageIndex + 1 > this.data.pages.length) ? 0 : this.pageIndex + 1;
  if( this.data.pages[ nextPageIndex ] ){
    if( this.data.pages[ nextPageIndex ].shown ){
      return false;
    }
    console.log('load next page: ', this.data.pages[ nextPageIndex ] );
    this.showreel.hasRun = true;
    this.data.pages[ nextPageIndex ].shown = true;
    this.loader.load( F.slashStart( this.data.pages[ nextPageIndex ].url ) );
    return true;    
  }
  return false;
}

/* interaction */
Small.prototype.setupInteraction = function(){
  this.$interactionEle.addEventListener( 'pointerdown', ( e ) => {
    const direction = (e.pageX >= window.innerWidth / 2) ? 1 : -1;
    this.interaction( direction );
  });
};

Small.prototype.interaction = function( direction ){
  if( direction >= 0 ){
    this.slideIndex++;    
    this.cancelForwardHint();
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
    return;
  }
  // we've gone past the last slide for this part
  if( this.slideIndex >= this.items[ this.orientation ].length ){
    if( !this.loadNextPage() ){
      this.endState();
    }
    return;
  }

  this.updateView();
}

/* rendering / visuals */
Small.prototype.updateView = function(){
  this.items.portrait
    .concat( this.items.landscape )
    .forEach( ( item ) => {
      item.classList.remove('active');
    });
  
  if( this.items.portrait[ this.slideIndex ] ){
    this.items.portrait[ this.slideIndex ].classList.add('active');
  }
  if( this.items.landscape[ this.slideIndex ]){
    this.items.landscape[ this.slideIndex ].classList.add('active');
  }

  this.preloadImages( 2 );
  this.sizeRoot();
}

Small.prototype.endState = function(){
  this.$mainContent.innerHTML = '<h1>END</h1>';
};

Small.prototype.renderPage = function( data ){
  document.title = data.title;
  document.documentElement.setAttribute('data-dc-pagetype', data.pagetype );
  this.$mainContent.innerHTML = data.html;
  this.setupPage();
};

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
  }, 14000 );
}

Small.prototype.cancelForwardHint = function(){
  clearTimeout( this.forwardInteractionHintTimeout );
  document.querySelector('html').classList.add('dc-has-gone-further');
}

module.exports = new Small();