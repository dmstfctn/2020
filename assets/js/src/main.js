const CFG = require('./modules/Config.js' );
const F = require( './modules/Functions.js' );
const Large = require( './modules/Large.js' );

const mqSmall = window.matchMedia( `(max-width: ${CFG.BREAKPOINT}px)` );

let DC = {
  env: {
    size: 'large',
    orientation: 'landscape'
  },
  large: new Large(),
  small: require( './modules/Small.js' )
};

/* image loading */
const mqSmallHandler = function( mq ){
  DC.env.size = (mqSmall.matches) ? 'small' : 'large';
  if( mq.media === `(max-width: ${CFG.BREAKPOINT}px)` ){
    if( mq.matches ){
      DC.small.activate();
    } else {
      DC.large.activate();
    }
  }
};

mqSmall.addListener( mqSmallHandler );
mqSmallHandler( mqSmall );