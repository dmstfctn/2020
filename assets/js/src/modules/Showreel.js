const CFG = require('./Config.js' );
const F = require( './Functions.js' );

const Showreel = function(){
  this.$wrapper = document.querySelector('.dc-showreels');
  this.hasRun = false;
}

Showreel.prototype.getSlides = function( orientation ){
  const images = [...this.$wrapper.querySelectorAll(`.dc-showreel__${orientation} li`)];
  const info = [...document.querySelectorAll('.dc-info')];
  //console.log('showreel slides: ', info.concat( images ) );
  return info.concat( images );
}

Showreel.prototype.show = function(){
  this.$wrapper.classList.remove('hide');
}

Showreel.prototype.hide = function(){
  this.$wrapper.classList.add('hide');
}

module.exports = Showreel;