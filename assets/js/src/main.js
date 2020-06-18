const CFG = require('./modules/Config.js' );
const F = require( './modules/Functions.js' );

const GFX = require( './modules/GFX.js' );

const Dots = require('./modules/Dots.js')

const gfx = new GFX();
gfx.activate();

const $allDots = document.querySelectorAll('.dots');
let dots = [];
$allDots.forEach(function( $dots ){
  const d = new Dots( $dots );
  d.calculate();
  dots.push( d );
});

window.runTypeDependentLayout = function(){
  console.log('TYPE DEPENDENT LAYOUT');
  dots.forEach( function( d ){
    d.calculate();
  });
};

window.addEventListener('resize', function(){
  runTypeDependentLayout();
});

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
//console.log('CREATE MQ: ', `(max-width: ${CFG.BREAKPOINT}px)` );
const mqSmall = window.matchMedia( `(max-width: ${CFG.BREAKPOINT}px)` );


const mqSmallHandler = function( mq ){
  DC.env.size = (mqSmall.matches) ? 'small' : 'large';
  if( mqSmall.matches ){
    //console.log( 'small site' );
    DC.large.deactivate();
    DC.small.activate();
  } else {
    //console.log( 'large site' );
    DC.small.deactivate();
    DC.large.activate();
  }
};

mqSmall.addListener( mqSmallHandler );
mqSmallHandler( mqSmall );