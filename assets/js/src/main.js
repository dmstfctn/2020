const CFG = require('./modules/Config.js' );
const F = require( './modules/Functions.js' );
const Large = require('./modules/Large.js');
const Small = require('./modules/Small.js');

const mqPortrait = window.matchMedia( '(orientation: portrait)' );
const mqLandscape = window.matchMedia( '(orientation: landscape)' );
const mqSmall = window.matchMedia( `(max-width: ${CFG.BREAKPOINT}px)` );

let DC = {
  env: {
    size: 'large',
    orientation: 'landscape'
  },
  large: new Large()
};

let dcSmall = {
  $ele: document.querySelector('.dc-mobile-nav'),
  slideIndex: 0,
  pageIndex: F.getPageIndexFor( window.location.pathname ),
  items: {
    portrait: [...document.querySelectorAll('.dc-item--info, .dc-media__portrait .dc-media--list li')],
    landscape: [...document.querySelectorAll('.dc-item--info, .dc-media__landscape .dc-media--list li')]
  },
  media: {
    portrait: document.querySelectorAll('.dc-media__portrait .dc-media--list li'),
    landscape: document.querySelectorAll('.dc-media__landscape .dc-media--list li')
  },
  showreelActive: ( F.trailingSlash( document.referrer ) !== F.trailingSlash( window.location.origin ))
};



dcSmall.$ele.addEventListener( 'click', ( e ) => {
  let orientation = 'portrait';
  if( mqLandscape.matches ){
    orientation = 'landscape';
  }
  if( e.pageX >= window.innerWidth / 2 ){
    dcSmall.slideIndex++;
  } else {
    dcSmall.slideIndex--;
  }
  if( dcSmall.slideIndex < 0 ){
    dcSmall.slideIndex = 0;
  }
  if( dcSmall.slideIndex >= dcSmall.items[orientation].length - 1 ){
    let nextPageIndex = dcSmall.pageIndex + 1;
    if( window.DCSMALL.pages[ nextPageIndex ] ){
      F.loadPage( window.DCSMALL.pages[ nextPageIndex ].url );
    }
  }

  dcSmall.items.portrait
    .concat( dcSmall.items.landscape )
    .forEach( ( item ) => {
      item.classList.remove('active');
    });
  
  dcSmall.items.portrait[ dcSmall.slideIndex ].classList.add('active');
  dcSmall.items.landscape[ dcSmall.slideIndex ].classList.add('active');
  F.loadSlideImage( dcSmall.items.portrait[ dcSmall.slideIndex ] );
  F.loadSlideImage( dcSmall.items.landscape[ dcSmall.slideIndex ] );
});


/* image loading */
const mqHandler = function( mq ){
  if( mqLandscape.matches ){
    DC.env.orientation = 'landscape';
  }
  if( mqPortrait.matches ){
    DC.env.orientation = 'portrait';
  }
  if( mqSmall.matches ){
    DC.env.size = 'small';
  } else {
    DC.env.size = 'large';
  }
  if( mq.media === `(max-width: ${CFG.BREAKPOINT}px)` ){
    if( mq.matches ){
      // DC.small.loadImages();
      F.loadSlideImages( dcSmall.media.landscape );
      F.loadSlideImages( dcSmall.media.portrait );
    } else {
      DC.large.loadImages();
      //F.loadSlideImages( $mediaListMain );     
    }
  }
}

mqLandscape.addListener( mqHandler );
mqPortrait.addListener( mqHandler );
mqSmall.addListener( mqHandler );

mqHandler( mqSmall );

/*

load large images if large
  $mediaListMain.forEach(( $m, mediaIndex ) => {
    loadSlideImage( $m );
  });
*/