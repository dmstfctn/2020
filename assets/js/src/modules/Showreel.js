const CFG = require('./Config.js' );
const F = require( './Functions.js' );

const Showreel = function(){
  this.$wrapper = document.querySelector('.dc-showreels');
}

Showreel.prototype.getSlides = function( orientation ){
  return [...this.$wrapper.querySelectorAll(`.dc-showreel__${orientation} li`)];
}

module.exports = Showreel;