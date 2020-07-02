const SmallAnimations = function( $ele ){
  this.$ele = $ele;
  this.triggerNoFurtherTimeout = null;
  this.forwardHintTimeout = null;
}

SmallAnimations.prototype = {
  clearNoFurtherTimeout: function(){
    clearTimeout( this.triggerNoFurtherTimeout );
  },
  clearForwardHintTimeout: function(){
    clearTimeout( this.forwardHintTimeout );
  },
  triggerNoFurther: function(){
    this.clearNoFurtherTimeout();
    this.$ele.classList.add('no-further');
    this.triggerNoFurtherAnimationTimeout =  setTimeout( () => {
      this.$ele.classList.remove('no-further');
    }, 10 );
  },
  readyForwardHint: function(){
    this.clearForwardHintTimeout();
    this.forwardHintTimeout = setTimeout(() => {
      this.$ele.classList.add('go-further');
    }, 10000 );
  },
  cancelForwardHint: function(){
    this.clearForwardHintTimeout();
    document.querySelector('html').classList.add('dc-has-gone-further');
  }
};

module.exports = SmallAnimations;