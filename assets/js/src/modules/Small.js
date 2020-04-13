const CFG = require('./Config.js' );
const F = require( './Functions.js' );

const Small = {
  orientation: 'portrait',
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
  mqHandler: () => {
    if( mqLandscape.matches ){
      Small.orientation = 'landscape';
    }
    if( mqPortrait.matches ){
      Small.orientation = 'portrait';
    }
  },
  loadImages: () => {
    F.loadSlideImages( Small.media.landscape );
    F.loadSlideImages( Small.media.portrait );
  },
  activate: () => {
    Small.loadImages();
  },
  data: window.DCSMALL,
  showreelActive: ( F.trailingSlash( document.referrer ) !== F.trailingSlash( window.location.origin )),
};

const mqPortrait = window.matchMedia( '(orientation: portrait)' );
const mqLandscape = window.matchMedia( '(orientation: landscape)' );
mqLandscape.addListener( Small.mqHandler );
mqPortrait.addListener( Small.mqHandler );

Small.$ele.addEventListener( 'click', ( e ) => {
  if( e.pageX >= window.innerWidth / 2 ){
    Small.slideIndex++;
  } else {
    Small.slideIndex--;
  }
  if( Small.slideIndex < 0 ){
    Small.slideIndex = 0;
  }
  if( Small.slideIndex >= Small.items[ Small.orientation ].length - 1 ){
    let nextPageIndex = Small.pageIndex + 1;
    if( Small.data.pages[ nextPageIndex ] ){
      F.loadPage( Small.data.pages[ nextPageIndex ].url );
    }
  }

  Small.items.portrait
    .concat( Small.items.landscape )
    .forEach( ( item ) => {
      item.classList.remove('active');
    });
  
  Small.items.portrait[ Small.slideIndex ].classList.add('active');
  Small.items.landscape[ Small.slideIndex ].classList.add('active');
  F.loadSlideImage( Small.items.portrait[ Small.slideIndex ] );
  F.loadSlideImage( Small.items.landscape[ Small.slideIndex ] );
});

module.exports = Small;