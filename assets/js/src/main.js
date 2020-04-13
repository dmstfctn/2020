const CFG = require('./modules/Config.js' );
const F = require( './modules/Functions.js' );

let DC = {
  env: {
    size: 'large',
    orientation: 'landscape'
  },
  large: require( './modules/Large.js' ),
  small: require( './modules/Small.js' )
};

window.DC = DC;

/* site setup */
console.log('CREATE MQ: ', `(max-width: ${CFG.BREAKPOINT}px)` );
const mqSmall = window.matchMedia( `(max-width: ${CFG.BREAKPOINT}px)` );


const mqSmallHandler = function( mq ){
  DC.env.size = (mqSmall.matches) ? 'small' : 'large';
  if( mqSmall.matches ){
    console.log( 'small site' );
    DC.small.activate();
  } else {
    console.log( 'large site' );
    DC.large.activate();
  }
};

mqSmall.addListener( mqSmallHandler );
mqSmallHandler( mqSmall );